import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PluginInitializationStrategy, InitOptions } from './plugin-initialization-strategy';
import { InitContext, UPluginFile, PackageJson } from './types';

describe('PluginInitializationStrategy', () => {
  let tempDir: string;
  let strategy: PluginInitializationStrategy;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-plugin-init-test-'));
    strategy = new PluginInitializationStrategy();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Plugin Development Configuration Integration', () => {
    it('should create .gitignore file with appropriate patterns', async () => {
      // Create a sample .uplugin file
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.0.0',
        FriendlyName: 'Test Plugin',
        Description: 'A test plugin for UEPM',
        CreatedBy: 'Test Author'
      };

      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent, null, 2));

      // Create Source directory to simulate a plugin with source modules
      const sourceDir = path.join(tempDir, 'Source');
      await fs.mkdir(sourceDir, { recursive: true });
      await fs.writeFile(path.join(sourceDir, 'TestModule.cpp'), '// Test source file');

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'TestPlugin'
      };

      const options: InitOptions = {};

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.context).toBe('plugin');

      // Verify .gitignore was created
      const gitignorePath = path.join(tempDir, '.gitignore');
      const gitignoreExists = await fs.access(gitignorePath).then(() => true).catch(() => false);
      expect(gitignoreExists).toBe(true);

      if (gitignoreExists) {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        
        // Verify essential patterns are included
        expect(gitignoreContent).toContain('Binaries/');
        expect(gitignoreContent).toContain('Intermediate/');
        expect(gitignoreContent).toContain('node_modules/');
        expect(gitignoreContent).toContain('.DS_Store');
      }

      // Verify package.json has enhanced build scripts for source modules
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson: PackageJson = JSON.parse(packageJsonContent);

      // Should have meaningful build scripts since Source directory exists
      expect(packageJson.scripts?.build).toBeDefined();
      expect(packageJson.scripts?.clean).toBeDefined();
      expect(packageJson.scripts?.build).toContain('Building plugin with source modules');
      expect(packageJson.scripts?.clean).toContain('Cleaning plugin build artifacts');
    });

    it('should handle content-only plugins appropriately', async () => {
      // Create a sample .uplugin file for content-only plugin
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.0.0',
        FriendlyName: 'Content Plugin',
        Description: 'A content-only plugin',
        CanContainContent: true
      };

      const upluginPath = path.join(tempDir, 'ContentPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent, null, 2));

      // Create Content directory but no Source directory
      const contentDir = path.join(tempDir, 'Content');
      await fs.mkdir(contentDir, { recursive: true });
      await fs.writeFile(path.join(contentDir, 'TestAsset.uasset'), 'fake asset content');

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'ContentPlugin'
      };

      const options: InitOptions = {};

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(true);

      // Verify package.json has appropriate scripts for content-only plugin
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson: PackageJson = JSON.parse(packageJsonContent);

      // Should have content-only build scripts
      expect(packageJson.scripts?.build).toBeDefined();
      expect(packageJson.scripts?.clean).toBeDefined();
      expect(packageJson.scripts?.build).toContain('Content-only plugin');
      expect(packageJson.scripts?.clean).toContain('Cleaning temporary files');

      // Files array should include Content but not Source
      expect(packageJson.files).toContain('Content/**/*');
      expect(packageJson.files).not.toContain('Source/**/*');
    });
  });

  describe('Plugin Initialization', () => {
    it('should create package.json for new plugin', async () => {
      // Create a sample .uplugin file
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.0.0',
        FriendlyName: 'Test Plugin',
        Description: 'A test plugin for UEPM',
        CreatedBy: 'Test Author',
        DocsURL: 'https://example.com/docs',
        EngineVersion: '5.3.0'
      };

      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent, null, 2));

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'TestPlugin'
      };

      const options: InitOptions = {};

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.context).toBe('plugin');
      expect(result.filesCreated).toContain('package.json');
      expect(result.filesModified).toHaveLength(0);

      // Verify package.json was created correctly
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson: PackageJson = JSON.parse(packageJsonContent);

      expect(packageJson.name).toBe('test-plugin');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.description).toBe('A test plugin for UEPM');
      expect(packageJson.main).toBe('TestPlugin.uplugin');
      expect(packageJson.author).toBe('Test Author');
      expect(packageJson.homepage).toBe('https://example.com/docs');
      expect(packageJson.unreal?.pluginName).toBe('TestPlugin');
      expect(packageJson.unreal?.engineVersion).toBe('5.3.0');
      expect(packageJson.keywords).toContain('unreal-engine');
    });

    it('should update existing package.json while preserving configuration', async () => {
      // Create existing package.json
      const existingPackageJson: PackageJson = {
        name: 'existing-plugin',
        version: '2.0.0',
        description: 'Existing description',
        author: 'Existing Author',
        scripts: {
          'custom-script': 'echo "custom"'
        },
        dependencies: {
          'some-dependency': '^1.0.0'
        }
      };

      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(existingPackageJson, null, 2));

      // Create .uplugin file
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.5.0',
        FriendlyName: 'Updated Plugin',
        Description: 'Updated description',
        CreatedBy: 'New Author'
      };

      const upluginPath = path.join(tempDir, 'UpdatedPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent, null, 2));

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'UpdatedPlugin'
      };

      const options: InitOptions = { force: false };

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.filesCreated).toHaveLength(0);
      expect(result.filesModified).toContain('package.json');

      // Verify package.json was updated correctly
      const updatedPackageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const updatedPackageJson: PackageJson = JSON.parse(updatedPackageJsonContent);

      // Existing configuration should be preserved
      expect(updatedPackageJson.name).toBe('existing-plugin');
      expect(updatedPackageJson.version).toBe('2.0.0');
      expect(updatedPackageJson.description).toBe('Existing description');
      expect(updatedPackageJson.author).toBe('Existing Author');
      expect(updatedPackageJson.scripts?.['custom-script']).toBe('echo "custom"');
      expect(updatedPackageJson.dependencies?.['some-dependency']).toBe('^1.0.0');

      // Plugin-specific fields should be added
      expect(updatedPackageJson.main).toBe('UpdatedPlugin.uplugin');
      expect(updatedPackageJson.unreal?.pluginName).toBe('UpdatedPlugin');
      expect(updatedPackageJson.unreal?.engineVersion).toBeDefined();
      expect(updatedPackageJson.keywords).toContain('unreal-engine');
    });

    it('should overwrite plugin fields when force flag is used', async () => {
      // Create existing package.json with plugin configuration
      const existingPackageJson: PackageJson = {
        name: 'existing-plugin',
        version: '2.0.0',
        description: 'Existing description',
        main: 'OldPlugin.uplugin',
        unreal: {
          engineVersion: '4.27.0',
          pluginName: 'OldPlugin'
        }
      };

      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(existingPackageJson, null, 2));

      // Create .uplugin file without description to avoid overwriting
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        VersionName: '3.0.0',
        EngineVersion: '5.3.0'
      };

      const upluginPath = path.join(tempDir, 'NewPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent, null, 2));

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'NewPlugin'
      };

      const options: InitOptions = { force: true };

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(true);

      // Verify package.json was updated with force
      const updatedPackageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const updatedPackageJson: PackageJson = JSON.parse(updatedPackageJsonContent);

      // Non-plugin fields should be preserved
      expect(updatedPackageJson.name).toBe('existing-plugin');
      expect(updatedPackageJson.version).toBe('2.0.0');
      // Description gets overwritten when force is true, even with default description
      expect(updatedPackageJson.description).toBe('Unreal Engine plugin: NewPlugin');

      // Plugin-specific fields should be overwritten
      expect(updatedPackageJson.main).toBe('NewPlugin.uplugin');
      expect(updatedPackageJson.unreal?.pluginName).toBe('NewPlugin');
      expect(updatedPackageJson.unreal?.engineVersion).toBe('5.3.0');
    });

    it('should detect already initialized plugin', async () => {
      // Create properly initialized package.json
      const initializedPackageJson: PackageJson = {
        name: 'initialized-plugin',
        version: '1.0.0',
        description: 'Already initialized plugin',
        main: 'InitializedPlugin.uplugin',
        files: ['InitializedPlugin.uplugin', 'Source/**/*'],
        keywords: ['unreal-engine', 'plugin'],
        unreal: {
          engineVersion: '^5.0.0',
          pluginName: 'InitializedPlugin'
        }
      };

      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(initializedPackageJson, null, 2));

      // Create .uplugin file
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.0.0',
        FriendlyName: 'Initialized Plugin'
      };

      const upluginPath = path.join(tempDir, 'InitializedPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent, null, 2));

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'InitializedPlugin'
      };

      const options: InitOptions = { force: false };

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.alreadyInitialized).toBe(true);
      expect(result.filesCreated).toHaveLength(0);
      expect(result.filesModified).toHaveLength(0);
      expect(result.message).toContain('already initialized');
    });

    it('should handle invalid uplugin file', async () => {
      // Create invalid .uplugin file
      const upluginPath = path.join(tempDir, 'InvalidPlugin.uplugin');
      await fs.writeFile(upluginPath, 'invalid json content');

      const context: InitContext = {
        type: 'plugin',
        primaryFile: upluginPath,
        directory: tempDir,
        pluginName: 'InvalidPlugin'
      };

      const options: InitOptions = {};

      // Execute initialization
      const result = await strategy.initialize(context, options);

      // Verify result
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to parse JSON file');
    });

    it('should reject non-plugin context', async () => {
      const context: InitContext = {
        type: 'project',
        primaryFile: '/path/to/project.uproject',
        directory: tempDir
      };

      const options: InitOptions = {};

      // Execute initialization and expect error
      await expect(strategy.initialize(context, options)).rejects.toThrow(
        'PluginInitializationStrategy can only handle plugin contexts'
      );
    });
  });
});