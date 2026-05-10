import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { setupPlugins } from './setup';

describe('setupPlugins', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-setup-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  async function writeProjectPackageJson(deps: Record<string, string> = {}, devDeps: Record<string, string> = {}) {
    const content: Record<string, unknown> = { name: 'my-project', version: '1.0.0' };
    if (Object.keys(deps).length > 0) content.dependencies = deps;
    if (Object.keys(devDeps).length > 0) content.devDependencies = devDeps;
    await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify(content));
  }

  async function createFakePackage(
    packageName: string,
    options: {
      withUnrealField?: boolean;
      withUpluginFile?: boolean;
      upluginFileName?: string;
    } = {},
  ) {
    const pkgDir = path.join(tempDir, 'node_modules', packageName);
    await fs.mkdir(pkgDir, { recursive: true });

    const pkgJson: Record<string, unknown> = { name: packageName, version: '1.0.0' };
    if (options.withUnrealField) {
      pkgJson.unreal = { engineVersion: '5.3' };
    }
    await fs.writeFile(path.join(pkgDir, 'package.json'), JSON.stringify(pkgJson));

    if (options.withUpluginFile) {
      const upluginName = options.upluginFileName ?? 'MyPlugin.uplugin';
      await fs.writeFile(path.join(pkgDir, upluginName), JSON.stringify({ FileVersion: 3 }));
    }

    return pkgDir;
  }

  // ---------------------------------------------------------------------------
  // 1. Happy path — single plugin detected via `unreal` field
  // ---------------------------------------------------------------------------

  it('happy path: creates UEPMPlugins/ and symlinks a plugin with unreal field', async () => {
    await writeProjectPackageJson({ '@uepm/example-plugin': '1.0.0' });
    await createFakePackage('@uepm/example-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const uepmPluginsDir = path.join(tempDir, 'UEPMPlugins');
    const stat = await fs.stat(uepmPluginsDir);
    expect(stat.isDirectory()).toBe(true);

    const linkPath = path.join(uepmPluginsDir, 'example-plugin');
    const linkTarget = await fs.readlink(linkPath);
    // Must be relative
    expect(path.isAbsolute(linkTarget)).toBe(false);
    // Must resolve correctly
    const resolved = path.resolve(path.dirname(linkPath), linkTarget);
    expect(resolved).toBe(path.join(tempDir, 'node_modules', '@uepm', 'example-plugin'));
  });

  // ---------------------------------------------------------------------------
  // 2. Plugin detection via .uplugin file (no unreal field)
  // ---------------------------------------------------------------------------

  it('detects plugin via .uplugin file when no unreal field', async () => {
    await writeProjectPackageJson({ '@uepm/uplugin-only': '1.0.0' });
    await createFakePackage('@uepm/uplugin-only', { withUpluginFile: true, upluginFileName: 'UpluginOnly.uplugin' });

    await setupPlugins(tempDir);

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'uplugin-only');
    const stat = await fs.lstat(linkPath);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  it('does NOT symlink a package that has neither unreal field nor .uplugin file', async () => {
    await writeProjectPackageJson({ 'regular-package': '2.0.0' });
    await createFakePackage('regular-package');

    await setupPlugins(tempDir);

    const uepmPluginsDir = path.join(tempDir, 'UEPMPlugins');
    const entries = await fs.readdir(uepmPluginsDir);
    expect(entries).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // 3. Relative symlink verification
  // ---------------------------------------------------------------------------

  it('creates relative symlinks pointing to ../node_modules/@scope/pkg', async () => {
    await writeProjectPackageJson({ '@scope/my-plugin': '1.0.0' });
    await createFakePackage('@scope/my-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'my-plugin');
    const linkTarget = await fs.readlink(linkPath);

    expect(path.isAbsolute(linkTarget)).toBe(false);
    expect(linkTarget).toBe(path.join('..', 'node_modules', '@scope', 'my-plugin'));
  });

  // ---------------------------------------------------------------------------
  // 4. file: dependencies — symlink in node_modules AND in UEPMPlugins
  // ---------------------------------------------------------------------------

  it('handles file: dependencies: creates node_modules symlink and UEPMPlugins symlink', async () => {
    // Create the local plugin directory (outside tempDir's node_modules)
    const localPluginDir = path.join(tempDir, 'local-plugin');
    await fs.mkdir(localPluginDir, { recursive: true });
    await fs.writeFile(
      path.join(localPluginDir, 'package.json'),
      JSON.stringify({ name: 'local-plugin', version: '1.0.0', unreal: {} }),
    );

    await writeProjectPackageJson({ 'local-plugin': 'file:./local-plugin' });
    // node_modules dir needs to exist for the symlink target dirname
    await fs.mkdir(path.join(tempDir, 'node_modules'), { recursive: true });

    await setupPlugins(tempDir);

    // node_modules symlink
    const nmLink = path.join(tempDir, 'node_modules', 'local-plugin');
    const nmLinkStat = await fs.lstat(nmLink);
    expect(nmLinkStat.isSymbolicLink()).toBe(true);

    // UEPMPlugins symlink
    const uepmLink = path.join(tempDir, 'UEPMPlugins', 'local-plugin');
    const uepmLinkStat = await fs.lstat(uepmLink);
    expect(uepmLinkStat.isSymbolicLink()).toBe(true);
  });

  it('file: dependency node_modules symlink is relative', async () => {
    const localPluginDir = path.join(tempDir, 'my-local-plugin');
    await fs.mkdir(localPluginDir, { recursive: true });
    await fs.writeFile(
      path.join(localPluginDir, 'package.json'),
      JSON.stringify({ name: 'my-local-plugin', version: '1.0.0', unreal: {} }),
    );

    await writeProjectPackageJson({ 'my-local-plugin': 'file:./my-local-plugin' });
    await fs.mkdir(path.join(tempDir, 'node_modules'), { recursive: true });

    await setupPlugins(tempDir);

    const nmLink = path.join(tempDir, 'node_modules', 'my-local-plugin');
    const target = await fs.readlink(nmLink);
    expect(path.isAbsolute(target)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 5. Missing package.json — error propagates (ENOENT)
  // ---------------------------------------------------------------------------

  it('rejects when package.json does not exist', async () => {
    await expect(setupPlugins(tempDir)).rejects.toThrow();
  });

  it('rejects with ENOENT-like error when package.json is missing', async () => {
    await expect(setupPlugins(tempDir)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  // ---------------------------------------------------------------------------
  // 6. Malformed package.json — JSON.parse error propagates
  // ---------------------------------------------------------------------------

  it('rejects when package.json contains invalid JSON', async () => {
    await fs.writeFile(path.join(tempDir, 'package.json'), '{ this is not json }');
    await expect(setupPlugins(tempDir)).rejects.toThrow(SyntaxError);
  });

  // ---------------------------------------------------------------------------
  // 7. Symlink batch failure — all errors collected and thrown together
  // ---------------------------------------------------------------------------

  it('collects symlink failures and throws a batch error message', async () => {
    await writeProjectPackageJson({
      '@uepm/plugin-a': '1.0.0',
      '@uepm/plugin-b': '1.0.0',
    });

    // Create plugin-a properly
    await createFakePackage('@uepm/plugin-a', { withUnrealField: true });

    // Create plugin-b as a plugin but block UEPMPlugins/plugin-b symlink by pre-creating
    // a regular directory at that path so fs.unlink (which can't remove non-empty dirs) fails.
    await createFakePackage('@uepm/plugin-b', { withUnrealField: true });
    const uepmPluginsDir = path.join(tempDir, 'UEPMPlugins');
    await fs.mkdir(uepmPluginsDir, { recursive: true });
    // Create a directory at the would-be symlink path with a child so rmdir/unlink fails
    const blockingDir = path.join(uepmPluginsDir, 'plugin-b');
    await fs.mkdir(blockingDir, { recursive: true });
    await fs.writeFile(path.join(blockingDir, 'blocker.txt'), 'blocking');

    await expect(setupPlugins(tempDir)).rejects.toThrow(/symlink.*failed/i);
  });

  it('batch error message lists failed package names', async () => {
    await writeProjectPackageJson({ '@uepm/bad-plugin': '1.0.0' });
    await createFakePackage('@uepm/bad-plugin', { withUnrealField: true });

    const uepmPluginsDir = path.join(tempDir, 'UEPMPlugins');
    await fs.mkdir(uepmPluginsDir, { recursive: true });
    const blockingDir = path.join(uepmPluginsDir, 'bad-plugin');
    await fs.mkdir(blockingDir, { recursive: true });
    await fs.writeFile(path.join(blockingDir, 'blocker.txt'), 'blocking');

    await expect(setupPlugins(tempDir)).rejects.toThrow('@uepm/bad-plugin');
  });

  // ---------------------------------------------------------------------------
  // 8. ENOENT on unlink is silently ignored (symlink slot was empty)
  // ---------------------------------------------------------------------------

  it('succeeds when symlink slot does not exist before creation (ENOENT silently ignored)', async () => {
    await writeProjectPackageJson({ '@uepm/fresh-plugin': '1.0.0' });
    await createFakePackage('@uepm/fresh-plugin', { withUnrealField: true });

    // UEPMPlugins doesn't exist yet, slot is fresh — no prior symlink to unlink
    await expect(setupPlugins(tempDir)).resolves.toBeUndefined();

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'fresh-plugin');
    const stat = await fs.lstat(linkPath);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  it('overwrites an existing symlink without error (re-running setup is idempotent)', async () => {
    await writeProjectPackageJson({ '@uepm/idempotent-plugin': '1.0.0' });
    await createFakePackage('@uepm/idempotent-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);
    // Run a second time — existing symlink must be unlinked and recreated cleanly
    await expect(setupPlugins(tempDir)).resolves.toBeUndefined();

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'idempotent-plugin');
    const stat = await fs.lstat(linkPath);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 9. Non-plugin packages are not symlinked
  // ---------------------------------------------------------------------------

  it('skips packages without unreal field and without .uplugin file', async () => {
    await writeProjectPackageJson({
      lodash: '4.0.0',
      express: '4.18.0',
    });
    await createFakePackage('lodash');
    await createFakePackage('express');

    await setupPlugins(tempDir);

    const entries = await fs.readdir(path.join(tempDir, 'UEPMPlugins'));
    expect(entries).toHaveLength(0);
  });

  it('symlinks only Unreal plugins when mixed with non-plugins', async () => {
    await writeProjectPackageJson({
      'not-a-plugin': '1.0.0',
      '@uepm/real-plugin': '1.0.0',
    });
    await createFakePackage('not-a-plugin');
    await createFakePackage('@uepm/real-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const entries = await fs.readdir(path.join(tempDir, 'UEPMPlugins'));
    expect(entries).toEqual(['real-plugin']);
  });

  // ---------------------------------------------------------------------------
  // 10. No dependencies — succeeds and creates empty UEPMPlugins/
  // ---------------------------------------------------------------------------

  it('succeeds and creates UEPMPlugins/ when package.json has no dependencies', async () => {
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'empty-project', version: '1.0.0' }),
    );

    await expect(setupPlugins(tempDir)).resolves.toBeUndefined();

    const stat = await fs.stat(path.join(tempDir, 'UEPMPlugins'));
    expect(stat.isDirectory()).toBe(true);

    const entries = await fs.readdir(path.join(tempDir, 'UEPMPlugins'));
    expect(entries).toHaveLength(0);
  });

  it('succeeds when dependencies and devDependencies are both empty objects', async () => {
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'empty-project', version: '1.0.0', dependencies: {}, devDependencies: {} }),
    );

    await expect(setupPlugins(tempDir)).resolves.toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // 11. Plugin name derivation from scoped and unscoped package names
  // ---------------------------------------------------------------------------

  it('derives symlink name as the part after / for scoped packages', async () => {
    await writeProjectPackageJson({ '@foo/my-plugin': '1.0.0' });
    await createFakePackage('@foo/my-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'my-plugin');
    const stat = await fs.lstat(linkPath);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  it('uses full package name as symlink name for unscoped packages', async () => {
    await writeProjectPackageJson({ 'my-unscoped-plugin': '1.0.0' });
    await createFakePackage('my-unscoped-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'my-unscoped-plugin');
    const stat = await fs.lstat(linkPath);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 12. devDependencies are also considered
  // ---------------------------------------------------------------------------

  it('symlinks plugins listed in devDependencies', async () => {
    await writeProjectPackageJson({}, { '@uepm/dev-plugin': '1.0.0' });
    await createFakePackage('@uepm/dev-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const linkPath = path.join(tempDir, 'UEPMPlugins', 'dev-plugin');
    const stat = await fs.lstat(linkPath);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  it('symlinks plugins from both dependencies and devDependencies', async () => {
    await writeProjectPackageJson(
      { '@uepm/prod-plugin': '1.0.0' },
      { '@uepm/dev-plugin': '1.0.0' },
    );
    await createFakePackage('@uepm/prod-plugin', { withUnrealField: true });
    await createFakePackage('@uepm/dev-plugin', { withUnrealField: true });

    await setupPlugins(tempDir);

    const entries = await fs.readdir(path.join(tempDir, 'UEPMPlugins'));
    expect(entries.sort()).toEqual(['dev-plugin', 'prod-plugin']);
  });

  // ---------------------------------------------------------------------------
  // 13. Missing source package (access check skips plugin gracefully)
  // ---------------------------------------------------------------------------

  it('skips plugin if its source directory does not exist in node_modules', async () => {
    await writeProjectPackageJson({ '@uepm/ghost-plugin': '1.0.0' });
    // Do NOT create the fake package directory — it won't exist in node_modules

    // Should not throw; ghost plugin is simply skipped
    await expect(setupPlugins(tempDir)).resolves.toBeUndefined();

    const uepmPluginsDir = path.join(tempDir, 'UEPMPlugins');
    const entries = await fs.readdir(uepmPluginsDir);
    expect(entries).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // 14. Multiple plugins — all are symlinked
  // ---------------------------------------------------------------------------

  it('symlinks all Unreal plugins found in dependencies', async () => {
    await writeProjectPackageJson({
      '@uepm/plugin-one': '1.0.0',
      '@uepm/plugin-two': '1.0.0',
      '@uepm/plugin-three': '1.0.0',
    });
    await createFakePackage('@uepm/plugin-one', { withUnrealField: true });
    await createFakePackage('@uepm/plugin-two', { withUpluginFile: true });
    await createFakePackage('@uepm/plugin-three', { withUnrealField: true, withUpluginFile: true });

    await setupPlugins(tempDir);

    const entries = await fs.readdir(path.join(tempDir, 'UEPMPlugins'));
    expect(entries.sort()).toEqual(['plugin-one', 'plugin-three', 'plugin-two']);
  });

  // ---------------------------------------------------------------------------
  // 15. UEPMPlugins is created with recursive: true (already exists is OK)
  // ---------------------------------------------------------------------------

  it('does not fail if UEPMPlugins already exists', async () => {
    await writeProjectPackageJson({ '@uepm/existing-plugin': '1.0.0' });
    await createFakePackage('@uepm/existing-plugin', { withUnrealField: true });
    // Pre-create UEPMPlugins
    await fs.mkdir(path.join(tempDir, 'UEPMPlugins'), { recursive: true });

    await expect(setupPlugins(tempDir)).resolves.toBeUndefined();
  });
});
