import { describe, it, expect } from 'vitest';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

const SAMPLE_PROJECT_DIR = join(__dirname, '../../project');

describe('Sample Project Structure', () => {
  describe('UProject File', () => {
    it('should have a valid .uproject file', async () => {
      const uprojectPath = join(SAMPLE_PROJECT_DIR, 'SampleProject.uproject');
      
      // Verify file exists
      await expect(access(uprojectPath)).resolves.not.toThrow();
      
      // Verify file is valid JSON
      const content = await readFile(uprojectPath, 'utf-8');
      const uproject = JSON.parse(content);
      
      // Verify required fields
      expect(uproject).toHaveProperty('FileVersion');
      expect(uproject).toHaveProperty('EngineAssociation');
      expect(uproject.EngineAssociation).toBe('5.7');
      
      // Verify structure
      expect(uproject.FileVersion).toBe(3);
      expect(uproject.Description).toContain('UEPM');
      expect(Array.isArray(uproject.Modules)).toBe(true);
      expect(Array.isArray(uproject.Plugins)).toBe(true);
      
      // Verify target platforms (may not be defined in fresh projects)
      if (uproject.TargetPlatforms) {
        expect(Array.isArray(uproject.TargetPlatforms)).toBe(true);
      }
      
      // Verify UEPM configuration
      expect(uproject).toHaveProperty('AdditionalPluginDirectories');
      expect(uproject.AdditionalPluginDirectories).toContain('node_modules');
    });

    it('should have a SampleProject module defined', async () => {
      const uprojectPath = join(SAMPLE_PROJECT_DIR, 'SampleProject.uproject');
      const content = await readFile(uprojectPath, 'utf-8');
      const uproject = JSON.parse(content);
      
      const sampleModule = uproject.Modules.find((module: any) => module.Name === 'SampleProject');
      expect(sampleModule).toBeDefined();
      expect(sampleModule.Type).toBe('Runtime');
      expect(sampleModule.LoadingPhase).toBe('Default');
    });
  });

  describe('Package.json File', () => {
    it('should have a valid package.json with correct dependencies', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      
      // Verify file exists
      await expect(access(packageJsonPath)).resolves.not.toThrow();
      
      // Verify file is valid JSON
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify basic structure
      expect(packageJson.name).toBe('sample-project');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.private).toBe(true);
      expect(packageJson.description).toContain('UEPM');
    });

    it('should have example plugin dependencies when installed', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify dependencies structure exists (plugins can be installed via GitHub test script)
      expect(packageJson).toHaveProperty('dependencies');
      expect(typeof packageJson.dependencies).toBe('object');
      
      // If plugins are installed, verify they have correct versions
      if (packageJson.dependencies['@uepm/example-plugin']) {
        expect(packageJson.dependencies['@uepm/example-plugin']).toBe('^1.0.0');
      }
      if (packageJson.dependencies['@uepm/dependency-plugin']) {
        expect(packageJson.dependencies['@uepm/dependency-plugin']).toBe('^1.0.0');
      }
    });

    it('should have correct dev dependencies', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify dev dependencies
      expect(packageJson.devDependencies).toHaveProperty('patch-package');
      expect(packageJson.devDependencies['patch-package']).toBe('^8.0.0');
      
      // If validate is installed, verify version
      if (packageJson.devDependencies['@uepm/validate']) {
        expect(packageJson.devDependencies['@uepm/validate']).toBe('^0.1.0');
      }
    });

    it('should have correct postinstall script', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify postinstall script
      expect(packageJson.scripts).toHaveProperty('postinstall');
      expect(packageJson.scripts.postinstall).toContain('patch-package');
      
      // If validate is installed, should include validation
      if (packageJson.devDependencies['@uepm/validate']) {
        expect(packageJson.scripts.postinstall).toContain('uepm-validate');
      }
    });

    it('should have appropriate metadata', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify metadata
      expect(Array.isArray(packageJson.keywords)).toBe(true);
      expect(packageJson.keywords).toContain('unreal');
      expect(packageJson.keywords).toContain('unreal-engine');
      expect(packageJson.keywords).toContain('uepm');
      expect(packageJson.keywords).toContain('sample');
      expect(packageJson.license).toBe('MIT');
    });
  });

  describe('Configuration Files', () => {
    it('should have DefaultEngine.ini configuration file', async () => {
      const configPath = join(SAMPLE_PROJECT_DIR, 'Config', 'DefaultEngine.ini');
      
      // Verify file exists
      await expect(access(configPath)).resolves.not.toThrow();
      
      // Verify file has content
      const content = await readFile(configPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      
      // Verify it contains expected sections
      expect(content).toContain('[/Script/EngineSettings.GameMapsSettings]');
      expect(content).toContain('[/Script/Engine.RendererSettings]');
      expect(content).toContain('[/Script/HardwareTargeting.HardwareTargetingSettings]');
    });

    it('should have proper game name redirects in DefaultEngine.ini', async () => {
      const configPath = join(SAMPLE_PROJECT_DIR, 'Config', 'DefaultEngine.ini');
      const content = await readFile(configPath, 'utf-8');
      
      // Verify game name redirects for SampleProject
      expect(content).toContain('NewGameName="/Script/SampleProject"');
      expect(content).toContain('TP_Blank'); // Should have template redirects
    });
  });

  describe('Source Code Structure', () => {
    it('should have proper Unreal Engine source structure', async () => {
      const sourceDir = join(SAMPLE_PROJECT_DIR, 'Source');
      
      // Verify Source directory exists
      await expect(access(sourceDir)).resolves.not.toThrow();
      
      // Verify target files exist
      await expect(access(join(sourceDir, 'SampleProject.Target.cs'))).resolves.not.toThrow();
      await expect(access(join(sourceDir, 'SampleProjectEditor.Target.cs'))).resolves.not.toThrow();
      
      // Verify module directory exists
      const moduleDir = join(sourceDir, 'SampleProject');
      await expect(access(moduleDir)).resolves.not.toThrow();
      
      // Verify module files exist
      await expect(access(join(moduleDir, 'SampleProject.Build.cs'))).resolves.not.toThrow();
      await expect(access(join(moduleDir, 'SampleProject.cpp'))).resolves.not.toThrow();
      await expect(access(join(moduleDir, 'SampleProject.h'))).resolves.not.toThrow();
    });

    it('should have valid build configuration', async () => {
      const buildFile = join(SAMPLE_PROJECT_DIR, 'Source', 'SampleProject', 'SampleProject.Build.cs');
      const content = await readFile(buildFile, 'utf-8');
      
      // Verify it's a proper Unreal build file
      expect(content).toContain('ModuleRules');
      expect(content).toContain('PublicDependencyModuleNames');
      expect(content).toContain('Core');
      expect(content).toContain('CoreUObject');
      expect(content).toContain('Engine');
    });

    it('should have basic module implementation', async () => {
      const moduleFile = join(SAMPLE_PROJECT_DIR, 'Source', 'SampleProject', 'SampleProject.cpp');
      const content = await readFile(moduleFile, 'utf-8');
      
      // Verify it's a basic Unreal module
      expect(content).toContain('IMPLEMENT_PRIMARY_GAME_MODULE');
      expect(content).toContain('SampleProject');
    });
  });

  describe('Documentation', () => {
    it('should have README documentation', async () => {
      const readmePath = join(SAMPLE_PROJECT_DIR, 'README.md');
      
      // Verify file exists
      await expect(access(readmePath)).resolves.not.toThrow();
      
      // Verify file has substantial content
      const content = await readFile(readmePath, 'utf-8');
      expect(content.length).toBeGreaterThan(1000); // Should be a comprehensive README
    });

    it('should document how to run init command', async () => {
      const readmePath = join(SAMPLE_PROJECT_DIR, 'README.md');
      const content = await readFile(readmePath, 'utf-8');
      
      // Verify init command documentation
      expect(content).toContain('npx @uepm/init');
      expect(content).toContain('Initialize the Project for UEPM');
    });

    it('should document how to install plugins', async () => {
      const readmePath = join(SAMPLE_PROJECT_DIR, 'README.md');
      const content = await readFile(readmePath, 'utf-8');
      
      // Verify plugin installation documentation
      expect(content).toContain('npm install');
      expect(content).toContain('Install Plugin Dependencies');
      expect(content).toContain('@uepm/example-plugin');
      expect(content).toContain('@uepm/dependency-plugin');
    });

    it('should document how to use patch-package', async () => {
      const readmePath = join(SAMPLE_PROJECT_DIR, 'README.md');
      const content = await readFile(readmePath, 'utf-8');
      
      // Verify patch-package documentation
      expect(content).toContain('patch-package');
      expect(content).toContain('npx patch-package');
      expect(content).toContain('Modifying Plugin Source Code');
      expect(content).toContain('patches/');
    });

    it('should include setup and testing instructions', async () => {
      const readmePath = join(SAMPLE_PROJECT_DIR, 'README.md');
      const content = await readFile(readmePath, 'utf-8');
      
      // Verify setup instructions
      expect(content).toContain('Quick Start');
      expect(content).toContain('Prerequisites');
      expect(content).toContain('Unreal Engine');
      expect(content).toContain('Node.js');
      
      // Verify testing instructions
      expect(content).toContain('Verify Plugin Installation');
      expect(content).toContain('Edit > Plugins');
      expect(content).toContain('Troubleshooting');
    });

    it('should document the project structure', async () => {
      const readmePath = join(SAMPLE_PROJECT_DIR, 'README.md');
      const content = await readFile(readmePath, 'utf-8');
      
      // Verify project structure documentation
      expect(content).toContain('Project Structure');
      expect(content).toContain('SampleProject.uproject');
      expect(content).toContain('package.json');
      expect(content).toContain('Config/');
      expect(content).toContain('node_modules/');
    });
  });
});