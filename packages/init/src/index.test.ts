import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { init } from './index';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { uprojectArbitrary, packageJsonArbitrary } from '@uepm/core/src/test-generators';

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
      expect(modifiedUproject.AdditionalPluginDirectories).toContain('UEPMPlugins');
      expect(modifiedUproject.EngineAssociation).toBe('5.3');
      expect(modifiedUproject.Category).toBe('Test');

      // Verify package.json was updated
      const modifiedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      expect(modifiedPackageJson.scripts.postinstall).toContain('uepm-postinstall');
      expect(modifiedPackageJson.scripts.build).toBe('echo build');
      expect(modifiedPackageJson.devDependencies['@uepm/postinstall']).toBeDefined();
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
      expect(modifiedPackageJson.scripts.postinstall).toBe('patch-package && uepm-postinstall');
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
      expect(packageJson.scripts.postinstall).toBe('uepm-postinstall');
      expect(packageJson.devDependencies['@uepm/postinstall']).toBe('^0.1.0');
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
      // Create a test .uproject file with UEPMPlugins already added
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: ['UEPMPlugins'],
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
      // Create a test .uproject file with UEPMPlugins already added
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: ['UEPMPlugins'],
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
      expect(modifiedPackageJson.scripts.postinstall).toContain('uepm-postinstall');
    });

    it('should not duplicate UEPMPlugins in AdditionalPluginDirectories', async () => {
      // Create a test .uproject file with UEPMPlugins already added
      const uprojectPath = path.join(tempDir, 'TestProject.uproject');
      const uprojectContent = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: ['UEPMPlugins', 'OtherPlugins'],
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
      const uepmPluginsCount = modifiedUproject.AdditionalPluginDirectories.filter(
        (dir: string) => dir === 'UEPMPlugins'
      ).length;
      expect(uepmPluginsCount).toBe(1);
      expect(modifiedUproject.AdditionalPluginDirectories).toContain('OtherPlugins');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: uepm, Property 7: Init command installs postinstall hook
     * Validates: Requirements 9.2
     * 
     * For any project directory with a package.json, running init should
     * add or update the postinstall script to include the validation hook command.
     */
    it('Property 7: installs postinstall hook for any package.json', async () => {
      await fc.assert(
        fc.asyncProperty(
          uprojectArbitrary(),
          packageJsonArbitrary(),
          async (uprojectData, packageJsonData) => {
            // Create a unique temp directory for this iteration
            const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-prop7-test-'));
            
            try {
              // Create .uproject file
              const uprojectPath = path.join(testDir, 'TestProject.uproject');
              await fs.writeFile(uprojectPath, JSON.stringify(uprojectData, null, 2));
              
              // Create package.json file
              const packageJsonPath = path.join(testDir, 'package.json');
              await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonData, null, 2));
              
              // Deep clone original package.json to compare later
              const originalPackageJson = JSON.parse(JSON.stringify(packageJsonData));
              
              // Run init
              const result = await init({ projectDir: testDir });
              
              // Verify init succeeded
              expect(result.success).toBe(true);
              
              // Read the modified package.json
              const modifiedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
              
              // Verify postinstall hook is configured
              expect(modifiedPackageJson.scripts).toBeDefined();
              expect(modifiedPackageJson.scripts.postinstall).toBeDefined();
              expect(modifiedPackageJson.scripts.postinstall).toContain('uepm-postinstall');
              
              // Verify @uepm/postinstall is in devDependencies
              expect(modifiedPackageJson.devDependencies).toBeDefined();
              expect(modifiedPackageJson.devDependencies['@uepm/postinstall']).toBeDefined();
              
              // Verify all other fields are preserved
              expect(modifiedPackageJson.name).toEqual(originalPackageJson.name);
              expect(modifiedPackageJson.version).toEqual(originalPackageJson.version);
              expect(modifiedPackageJson.description).toEqual(originalPackageJson.description);
              expect(modifiedPackageJson.private).toEqual(originalPackageJson.private);
              
              // Verify existing dependencies are preserved
              if (originalPackageJson.dependencies) {
                for (const [key, value] of Object.entries(originalPackageJson.dependencies)) {
                  expect(modifiedPackageJson.dependencies?.[key]).toEqual(value);
                }
              }
              
              // Verify existing devDependencies are preserved (except for @uepm/postinstall which may be added)
              if (originalPackageJson.devDependencies) {
                for (const [key, value] of Object.entries(originalPackageJson.devDependencies)) {
                  if (key !== '@uepm/postinstall') {
                    expect(modifiedPackageJson.devDependencies?.[key]).toEqual(value);
                  }
                }
              }
              
              // Verify existing scripts are preserved
              if (originalPackageJson.scripts) {
                for (const [key, value] of Object.entries(originalPackageJson.scripts)) {
                  if (key === 'postinstall') {
                    // Postinstall should contain the original value
                    expect(modifiedPackageJson.scripts[key]).toContain(value as string);
                  } else {
                    expect(modifiedPackageJson.scripts[key]).toEqual(value);
                  }
                }
              }
              
              // Verify unreal field is preserved
              expect(modifiedPackageJson.unreal).toEqual(originalPackageJson.unreal);
              
            } finally {
              // Clean up this iteration's temp directory
              await fs.rm(testDir, { recursive: true, force: true });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
