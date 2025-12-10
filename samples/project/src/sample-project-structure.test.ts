import { describe, it, expect } from 'vitest';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

const SAMPLE_PROJECT_DIR = __dirname + '/..';

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
      expect(uproject.EngineAssociation).toBe('5.3');
      
      // Verify structure
      expect(uproject.FileVersion).toBe(3);
      expect(uproject.Description).toContain('UEPM');
      expect(Array.isArray(uproject.Modules)).toBe(true);
      expect(Array.isArray(uproject.Plugins)).toBe(true);
      expect(Array.isArray(uproject.TargetPlatforms)).toBe(true);
      
      // Verify target platforms include common platforms
      expect(uproject.TargetPlatforms).toContain('Win64');
      expect(uproject.TargetPlatforms).toContain('Mac');
      expect(uproject.TargetPlatforms).toContain('Linux');
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

    it('should have dependencies structure ready for example plugins', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify dependencies object exists (ready for plugin dependencies)
      expect(packageJson).toHaveProperty('dependencies');
      expect(typeof packageJson.dependencies).toBe('object');
    });

    it('should have correct dev dependencies', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify dev dependencies
      expect(packageJson.devDependencies).toHaveProperty('patch-package');
      expect(packageJson.devDependencies['patch-package']).toBe('^8.0.0');
      
      // Verify testing dependencies
      expect(packageJson.devDependencies).toHaveProperty('vitest');
      expect(packageJson.devDependencies).toHaveProperty('@types/node');
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });

    it('should have correct postinstall script', async () => {
      const packageJsonPath = join(SAMPLE_PROJECT_DIR, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // Verify postinstall script (ready for validation hook)
      expect(packageJson.scripts).toHaveProperty('postinstall');
      expect(packageJson.scripts.postinstall).toBe('patch-package');
      
      // Verify test scripts
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts.test).toBe('vitest --run');
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
      expect(content).toContain('NewClassName="SampleProjectGameModeBase"');
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
      expect(content).toContain('Unreal Engine 5.3');
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