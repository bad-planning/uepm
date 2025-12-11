import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PLUGIN_ROOT = join(__dirname, '..');

describe('Example Plugin Structure', () => {
  it('should have a valid .uplugin file', () => {
    const upluginPath = join(PLUGIN_ROOT, 'ExamplePlugin.uplugin');
    
    // Verify file exists
    expect(existsSync(upluginPath)).toBe(true);
    
    // Verify it's valid JSON
    const content = readFileSync(upluginPath, 'utf-8');
    const uplugin = JSON.parse(content);
    
    // Verify required fields
    expect(uplugin.FileVersion).toBeDefined();
    expect(uplugin.Version).toBeDefined();
    expect(uplugin.VersionName).toBeDefined();
    expect(uplugin.FriendlyName).toBeDefined();
    expect(uplugin.Description).toBeDefined();
    expect(uplugin.Category).toBeDefined();
    expect(uplugin.CreatedBy).toBeDefined();
    expect(uplugin.Modules).toBeDefined();
    expect(Array.isArray(uplugin.Modules)).toBe(true);
    
    // Verify module structure
    expect(uplugin.Modules.length).toBeGreaterThan(0);
    const module = uplugin.Modules[0];
    expect(module.Name).toBe('ExamplePlugin');
    expect(module.Type).toBe('Runtime');
    expect(module.LoadingPhase).toBe('Default');
  });

  it('should have a valid package.json with required fields', () => {
    const packageJsonPath = join(PLUGIN_ROOT, 'package.json');
    
    // Verify file exists
    expect(existsSync(packageJsonPath)).toBe(true);
    
    // Verify it's valid JSON
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    
    // Verify required NPM fields
    expect(packageJson.name).toBe('@uepm/example-plugin');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.description).toBeDefined();
    expect(packageJson.main).toBe('ExamplePlugin.uplugin');
    expect(packageJson.license).toBeDefined();
    
    // Verify UEPM-specific fields
    expect(packageJson.unreal).toBeDefined();
    expect(packageJson.unreal.engineVersion).toBeDefined();
    expect(packageJson.unreal.pluginName).toBe('ExamplePlugin');
    
    // Verify files array includes required plugin files
    expect(packageJson.files).toBeDefined();
    expect(Array.isArray(packageJson.files)).toBe(true);
    expect(packageJson.files).toContain('ExamplePlugin.uplugin');
    expect(packageJson.files).toContain('Source/**/*');
    expect(packageJson.files).toContain('Resources/**/*');
    
    // Verify keywords include unreal-related terms
    expect(packageJson.keywords).toBeDefined();
    expect(Array.isArray(packageJson.keywords)).toBe(true);
    expect(packageJson.keywords).toContain('unreal');
    expect(packageJson.keywords).toContain('unreal-engine');
    expect(packageJson.keywords).toContain('plugin');
    expect(packageJson.keywords).toContain('uepm');
  });

  it('should have required source files', () => {
    // Verify build configuration exists
    const buildCsPath = join(PLUGIN_ROOT, 'Source', 'ExamplePlugin', 'ExamplePlugin.Build.cs');
    expect(existsSync(buildCsPath)).toBe(true);
    
    // Verify public header exists
    const publicHeaderPath = join(PLUGIN_ROOT, 'Source', 'ExamplePlugin', 'Public', 'ExamplePlugin.h');
    expect(existsSync(publicHeaderPath)).toBe(true);
    
    // Verify private implementation exists
    const privateImplPath = join(PLUGIN_ROOT, 'Source', 'ExamplePlugin', 'Private', 'ExamplePlugin.cpp');
    expect(existsSync(privateImplPath)).toBe(true);
    
    // Verify header contains required class declaration
    const headerContent = readFileSync(publicHeaderPath, 'utf-8');
    expect(headerContent).toContain('FExamplePluginModule');
    expect(headerContent).toContain('IModuleInterface');
    expect(headerContent).toContain('StartupModule');
    expect(headerContent).toContain('ShutdownModule');
    
    // Verify implementation contains required methods
    const implContent = readFileSync(privateImplPath, 'utf-8');
    expect(implContent).toContain('FExamplePluginModule::StartupModule');
    expect(implContent).toContain('FExamplePluginModule::ShutdownModule');
    expect(implContent).toContain('IMPLEMENT_MODULE');
    expect(implContent).toContain('UE_LOG');
  });

  it('should have README documentation', () => {
    const readmePath = join(PLUGIN_ROOT, 'README.md');
    
    // Verify file exists
    expect(existsSync(readmePath)).toBe(true);
    
    // Verify content includes required sections
    const content = readFileSync(readmePath, 'utf-8');
    expect(content).toContain('# @uepm/example-plugin');
    expect(content).toContain('## What\'s Included');
    expect(content).toContain('## Installation');
    expect(content).toContain('## Plugin Structure');
    expect(content).toContain('## Engine Compatibility');
    expect(content).toContain('## Development');
    expect(content).toContain('npx @uepm/init');
    expect(content).toContain('npm install @uepm/example-plugin');
    expect(content).toContain('## License');
  });

  it('should have Resources directory with icon', () => {
    const resourcesPath = join(PLUGIN_ROOT, 'Resources');
    expect(existsSync(resourcesPath)).toBe(true);
    
    const iconPath = join(resourcesPath, 'Icon128.png');
    expect(existsSync(iconPath)).toBe(true);
  });
});