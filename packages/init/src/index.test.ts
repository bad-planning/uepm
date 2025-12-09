import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { init } from './index';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Init Command', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-init-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('successful initialization with existing package.json', () => {
    it('should add node_modules to .uproject and update package.json', async () => {
      // Create a test .uproject file
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        Category: 'Test',
        Description: 'Test project',
      };
      await fs.writeFile(uprojectPath, JSON.stringify(uprojectContent, null, 2));

      // Create an existing package.json
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          build: 'echo build',
        },
      };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

      // Run init
      const result = await init({ projectDir: tempDir });

      // Verify success
      expect(result.success).toBe(true);
      expect(result.alreadyInitialized).toBeUndefined();

      // Verify .uproject was modified
      const modifiedUproject = JSON.parse(await fs.readFile(uprojectPath, 'utf-8'));
      expect(modifiedUproject.AdditionalPluginDirectories).toContain('node_modules');
      expect(modifiedUproject.EngineAssociation).toBe('5.3');
      expect(modifiedUproject.Category).toBe('Test');

      // Verify package.json was updated
      const modifiedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      expect(modifiedPackageJson.scripts.postinstall).toContain('uepm-validate');
      expect(modifiedPackageJson.scripts.build).toBe('echo build');
      expect(modifiedPackageJson.devDependencies['@uepm/validate']).toBeDefined();
    });

    it('should append to existing postinstall script', async () => {
      // Create a test .uproject file
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
      };
      await fs.writeFile(uprojectPath, JSON.stringify(uprojectContent, null, 2));

      // Create package.json with existing postinstall
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          postinstall: 'patch-package',
        },
      };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

      // Run init
      const result = await init({ projectDir: tempDir });

      expect(result.success).toBe(true);

      // Verify postinstall was appended
      const modifiedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      expect(modifiedPackageJson.scripts.postinstall).toBe('patch-package && uepm-validate');
    });
  });

  describe('successful initialization without package.json', () => {
    it('should create package.json with correct structure', async () => {
      // Create a test .uproject file
      const uprojectPath = path.join(tempDir, 'MyGame.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
      };
      await fs.writeFile(uprojectPath, JSON.stringify(uprojectContent, null, 2));

      // Run init (no package.json exists)
      const result = await init({ projectDir: tempDir });

      expect(result.success).toBe(true);

      // Verify package.json was created
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      expect(packageJson.name).toBe('mygame');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.private).toBe(true);
      expect(packageJson.scripts.postinstall).toBe('uepm-validate');
      expect(packageJson.devDependencies['@uepm/validate']).toBe('^0.1.0');
    });
  });

  describe('error handling for missing .uproject', () => {
    it('should return error when no .uproject file exists', async () => {
      // Run init in empty directory
      const result = await init({ projectDir: tempDir });

      expect(result.success).toBe(false);
      expect(result.message).toContain('No .uproject file found');
      expect(result.message).toContain(tempDir);
    });
  });

  describe('handling of already-initialized projects', () => {
    it('should detect already initialized project and skip modification', async () => {
      // Create a test .uproject file with node_modules already added
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: ['node_modules'],
      };
      await fs.writeFile(uprojectPath, JSON.stringify(uprojectContent, null, 2));

      // Create package.json
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          postinstall: 'uepm-validate',
        },
        devDependencies: {
          '@uepm/validate': '^0.1.0',
        },
      };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

      // Run init
      const result = await init({ projectDir: tempDir });

      expect(result.success).toBe(true);
      expect(result.alreadyInitialized).toBe(true);
      expect(result.message).toContain('already initialized');
    });

    it('should reinitialize when force flag is set', async () => {
      // Create a test .uproject file with node_modules already added
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: ['node_modules'],
      };
      await fs.writeFile(uprojectPath, JSON.stringify(uprojectContent, null, 2));

      // Create package.json
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = {
        name: 'test-project',
        version: '1.0.0',
      };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

      // Run init with force flag
      const result = await init({ projectDir: tempDir, force: true });

      expect(result.success).toBe(true);
      expect(result.alreadyInitialized).toBeUndefined();
      expect(result.message).toContain('reinitialized');

      // Verify package.json was updated
      const modifiedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      expect(modifiedPackageJson.scripts.postinstall).toContain('uepm-validate');
    });

    it('should not duplicate node_modules in AdditionalPluginDirectories', async () => {
      // Create a test .uproject file with node_modules already added
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: ['node_modules', 'OtherPlugins'],
      };
      await fs.writeFile(uprojectPath, JSON.stringify(uprojectContent, null, 2));

      // Create package.json
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = {
        name: 'test-project',
        version: '1.0.0',
      };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

      // Run init with force flag
      const result = await init({ projectDir: tempDir, force: true });

      expect(result.success).toBe(true);

      // Verify node_modules appears only once
      const modifiedUproject = JSON.parse(await fs.readFile(uprojectPath, 'utf-8'));
      const nodeModulesCount = modifiedUproject.AdditionalPluginDirectories.filter(
        (dir: string) => dir === 'node_modules'
      ).length;
      expect(nodeModulesCount).toBe(1);
      expect(modifiedUproject.AdditionalPluginDirectories).toContain('OtherPlugins');
    });
  });
});
