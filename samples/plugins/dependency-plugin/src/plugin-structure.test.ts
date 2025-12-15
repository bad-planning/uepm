import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PLUGIN_ROOT = join(__dirname, '..');

describe('Dependency Plugin Structure', () => {
  describe('Plugin Descriptor (.uplugin)', () => {
    it('should have a valid .uplugin file', () => {
      const upluginPath = join(PLUGIN_ROOT, 'DependencyPlugin.uplugin');
      expect(existsSync(upluginPath)).toBe(true);
    });

    it('should declare plugin dependencies', () => {
      const upluginPath = join(PLUGIN_ROOT, 'DependencyPlugin.uplugin');
      const upluginContent = readFileSync(upluginPath, 'utf-8');
      const uplugin = JSON.parse(upluginContent);
      
      // Verify .uplugin declares plugin dependencies
      expect(uplugin.Plugins).toBeDefined();
      expect(Array.isArray(uplugin.Plugins)).toBe(true);
      expect(uplugin.Plugins.length).toBeGreaterThan(0);
      
      // Verify ExamplePlugin dependency
      const examplePluginDep = uplugin.Plugins.find((plugin: any) => plugin.Name === 'ExamplePlugin');
      expect(examplePluginDep).toBeDefined();
      expect(examplePluginDep.Enabled).toBe(true);
    });

    it('should have valid plugin metadata', () => {
      const upluginPath = join(PLUGIN_ROOT, 'DependencyPlugin.uplugin');
      const upluginContent = readFileSync(upluginPath, 'utf-8');
      const uplugin = JSON.parse(upluginContent);
      
      expect(uplugin.FileVersion).toBe(3);
      expect(uplugin.FriendlyName).toBe('Dependency Plugin');
      expect(uplugin.Description).toContain('dependencies');
      expect(uplugin.Modules).toBeDefined();
      expect(Array.isArray(uplugin.Modules)).toBe(true);
      expect(uplugin.Modules.length).toBeGreaterThan(0);
      
      // Verify main module
      const mainModule = uplugin.Modules.find((module: any) => module.Name === 'DependencyPlugin');
      expect(mainModule).toBeDefined();
      expect(mainModule.Type).toBe('Runtime');
    });
  });

  describe('Package Configuration (package.json)', () => {
    it('should have a valid package.json file', () => {
      const packagePath = join(PLUGIN_ROOT, 'package.json');
      expect(existsSync(packagePath)).toBe(true);
    });

    it('should declare NPM dependencies', () => {
      const packagePath = join(PLUGIN_ROOT, 'package.json');
      const packageContent = readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      // Verify package.json declares NPM dependencies
      expect(packageJson.dependencies).toBeDefined();
      expect(typeof packageJson.dependencies).toBe('object');
      
      // Verify @uepm/example-plugin dependency
      expect(packageJson.dependencies['@uepm/example-plugin']).toBeDefined();
      expect(packageJson.dependencies['@uepm/example-plugin']).toMatch(/^\^?1\.0\.\d+$/);
    });

    it('should have correct package metadata', () => {
      const packagePath = join(PLUGIN_ROOT, 'package.json');
      const packageContent = readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      expect(packageJson.name).toBe('@uepm/dependency-plugin');
      expect(packageJson.description).toContain('dependencies');
      expect(packageJson.main).toBe('DependencyPlugin.uplugin');
      expect(packageJson.unreal).toBeDefined();
      expect(packageJson.unreal.pluginName).toBe('DependencyPlugin');
      expect(packageJson.unreal.engineVersion).toBeDefined();
    });
  });

  describe('Source Code Structure', () => {
    it('should have required source directories', () => {
      const sourcePath = join(PLUGIN_ROOT, 'Source', 'DependencyPlugin');
      const publicPath = join(sourcePath, 'Public');
      const privatePath = join(sourcePath, 'Private');
      
      expect(existsSync(sourcePath)).toBe(true);
      expect(existsSync(publicPath)).toBe(true);
      expect(existsSync(privatePath)).toBe(true);
    });

    it('should have build configuration file', () => {
      const buildPath = join(PLUGIN_ROOT, 'Source', 'DependencyPlugin', 'DependencyPlugin.Build.cs');
      expect(existsSync(buildPath)).toBe(true);
    });

    it('should reference ExamplePlugin in source code', () => {
      // Check Build.cs references ExamplePlugin module
      const buildPath = join(PLUGIN_ROOT, 'Source', 'DependencyPlugin', 'DependencyPlugin.Build.cs');
      const buildContent = readFileSync(buildPath, 'utf-8');
      expect(buildContent).toContain('ExamplePlugin');
      
      // Check header file exists
      const headerPath = join(PLUGIN_ROOT, 'Source', 'DependencyPlugin', 'Public', 'DependencyPlugin.h');
      expect(existsSync(headerPath)).toBe(true);
      
      // Check implementation file references ExamplePlugin
      const implPath = join(PLUGIN_ROOT, 'Source', 'DependencyPlugin', 'Private', 'DependencyPlugin.cpp');
      expect(existsSync(implPath)).toBe(true);
      
      const implContent = readFileSync(implPath, 'utf-8');
      expect(implContent).toContain('ExamplePlugin');
      expect(implContent).toContain('FExamplePluginUtils');
    });

    it('should have proper module implementation', () => {
      const implPath = join(PLUGIN_ROOT, 'Source', 'DependencyPlugin', 'Private', 'DependencyPlugin.cpp');
      const implContent = readFileSync(implPath, 'utf-8');
      
      // Verify module class implementation
      expect(implContent).toContain('FDependencyPluginModule');
      expect(implContent).toContain('StartupModule');
      expect(implContent).toContain('ShutdownModule');
      expect(implContent).toContain('IMPLEMENT_MODULE');
      
      // Verify dependency usage
      expect(implContent).toContain('FExamplePluginModule::IsAvailable()');
    });
  });

  describe('Documentation', () => {
    it('should have README documentation', () => {
      const readmePath = join(PLUGIN_ROOT, 'README.md');
      expect(existsSync(readmePath)).toBe(true);
      
      const readmeContent = readFileSync(readmePath, 'utf-8');
      expect(readmeContent).toContain('dependency');
      expect(readmeContent).toContain('@uepm/example-plugin');
      expect(readmeContent).toContain('Dependencies');
    });
  });
});