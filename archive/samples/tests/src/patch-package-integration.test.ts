import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { promises as fs, accessSync, constants as fsConstants } from 'fs';
import * as path from 'path';
import * as os from 'os';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const EXAMPLE_PLUGIN_DIR = path.join(REPO_ROOT, 'samples/plugins/example-plugin');
const POSTINSTALL_DIR = path.join(REPO_ROOT, 'packages/postinstall');

/**
 * Run a command via the system shell. All arguments in this file are
 * compile-time constants (no user input), so shell injection is not a risk.
 */
const SPAWN_OPTS = { shell: true, encoding: 'utf-8' as const, stdio: 'pipe' as const, env: process.env };

function run(cmd: string, cwd: string): void {
  const result = spawnSync(cmd, { ...SPAWN_OPTS, cwd });
  if (result.status !== 0 || result.error) {
    throw new Error(
      `Command failed: ${cmd}\nstdout: ${result.stdout}\nstderr: ${result.stderr}\nerror: ${result.error}`
    );
  }
}

function runCapture(cmd: string, cwd: string): string {
  const result = spawnSync(cmd, { ...SPAWN_OPTS, cwd });
  if (result.status !== 0 || result.error) {
    throw new Error(
      `Command failed: ${cmd}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
    );
  }
  return result.stdout.trim();
}

// Detect whether npm subprocesses actually work in this environment.
// Use npm pack --dry-run as the probe since that's exactly what the test
// needs — some sandbox environments allow `npm --version` but block pack.
let canSpawnShell = false;
try {
  const probe = spawnSync('npm pack --dry-run', { ...SPAWN_OPTS, cwd: EXAMPLE_PLUGIN_DIR });
  canSpawnShell = probe.status === 0 && !probe.error && typeof probe.stdout === 'string';
} catch {}

const describeIntegration = canSpawnShell ? describe : describe.skip;

/**
 * Integration test: patch-package + uepm-postinstall compatibility
 *
 * Verifies that:
 * 1. patch-package can create patches for UEPM-installed plugins
 * 2. Patches survive a fresh `npm install`
 * 3. Patched files are visible through UEPMPlugins/ symlinks
 *
 * Uses `npm pack` to install the example plugin as a real directory (not a
 * symlink) since patch-package cannot diff symlinked packages.
 *
 * Run explicitly with: cd samples/tests && npx vitest --run src/patch-package-integration.test.ts
 */
describeIntegration('patch-package integration', () => {
  let tempDir: string;
  let pluginTarball: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-patch-test-'));

    // Pack the example plugin to a local tarball so npm installs it as real
    // files rather than a symlink (file: refs produce symlinks in workspaces).
    const packOutput = runCapture('npm pack --pack-destination /tmp', EXAMPLE_PLUGIN_DIR);
    pluginTarball = packOutput.split('\n').pop()!.trim();
    if (!path.isAbsolute(pluginTarball)) {
      pluginTarball = path.join('/tmp', pluginTarball);
    }
  }, 30000);

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    if (pluginTarball) await fs.rm(pluginTarball, { force: true });
  });

  it(
    'patches survive a fresh npm install and are visible through UEPMPlugins/ symlinks',
    async () => {
      // ── Step 1: Set up a UEPM-initialized project ──────────────────────────

      await fs.writeFile(
        path.join(tempDir, 'TestProject.uproject'),
        JSON.stringify({
          FileVersion: 3,
          EngineAssociation: '5.7',
          AdditionalPluginDirectories: ['UEPMPlugins'],
        })
      );

      // postinstall: patch-package runs first, then uepm-postinstall wires symlinks
      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'test-project',
          version: '1.0.0',
          private: true,
          scripts: {
            postinstall: 'patch-package && uepm-postinstall',
          },
          dependencies: {
            '@uepm/example-plugin': pluginTarball,
          },
          devDependencies: {
            '@uepm/postinstall': `file:${POSTINSTALL_DIR}`,
            'patch-package': '^8.0.0',
          },
        })
      );

      // ── Step 2: Initial install ─────────────────────────────────────────────

      run('npm install', tempDir);

      // Verify plugin landed as a real directory (not a symlink)
      const pluginInNodeModules = path.join(tempDir, 'node_modules/@uepm/example-plugin');
      const pluginStat = await fs.lstat(pluginInNodeModules);
      expect(pluginStat.isDirectory()).toBe(true);
      expect(pluginStat.isSymbolicLink()).toBe(false);

      // Verify UEPMPlugins/ symlink was created by uepm-postinstall
      const uepmPluginLink = path.join(tempDir, 'UEPMPlugins/example-plugin');
      const linkStat = await fs.lstat(uepmPluginLink);
      expect(linkStat.isSymbolicLink()).toBe(true);

      // ── Step 3: Modify a file and create a patch ────────────────────────────

      const upluginPath = path.join(pluginInNodeModules, 'ExamplePlugin.uplugin');
      const original = JSON.parse(await fs.readFile(upluginPath, 'utf-8'));
      await fs.writeFile(
        upluginPath,
        JSON.stringify(
          { ...original, Description: 'PATCHED: ' + original.Description },
          null,
          2
        )
      );

      run('npx patch-package @uepm/example-plugin', tempDir);

      // Verify patch file was created
      const patchDir = path.join(tempDir, 'patches');
      const patchFiles = await fs.readdir(patchDir);
      expect(patchFiles).toHaveLength(1);
      expect(patchFiles[0]).toMatch(/uepm\+example-plugin/);

      // ── Step 4: Simulate fresh install ─────────────────────────────────────

      await fs.rm(path.join(tempDir, 'node_modules'), { recursive: true });
      await fs.rm(path.join(tempDir, 'UEPMPlugins'), { recursive: true });

      run('npm install', tempDir);

      // ── Step 5: Verify patch was applied in node_modules ───────────────────

      const patchedContent = JSON.parse(await fs.readFile(upluginPath, 'utf-8'));
      expect(patchedContent.Description).toMatch(/^PATCHED:/);

      // ── Step 6: Verify patch is visible through UEPMPlugins/ symlink ───────

      const viaSymlink = path.join(
        tempDir,
        'UEPMPlugins/example-plugin/ExamplePlugin.uplugin'
      );
      const viaSymlinkContent = JSON.parse(await fs.readFile(viaSymlink, 'utf-8'));
      expect(viaSymlinkContent.Description).toMatch(/^PATCHED:/);
    },
    120000 // two npm installs; allow up to 2 minutes
  );
});
