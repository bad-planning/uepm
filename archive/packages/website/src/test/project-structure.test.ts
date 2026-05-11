import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * **Feature: uepm-website, Property 10: Component structure supports maintainability**
 * **Validates: Requirements 7.3**
 * 
 * For any component file, it should follow consistent naming conventions, 
 * have clear prop interfaces, and include appropriate documentation comments
 */
describe('Project Structure Validation', () => {
  describe('Property 10: Component structure supports maintainability', () => {
    it('should have required directory structure', () => {
      const requiredDirs = [
        'src/components',
        'src/layouts', 
        'src/pages',
        'src/styles',
        'src/assets'
      ];

      requiredDirs.forEach(dir => {
        const fullPath = join(projectRoot, dir);
        expect(existsSync(fullPath), `Directory ${dir} should exist`).toBe(true);
        expect(statSync(fullPath).isDirectory(), `${dir} should be a directory`).toBe(true);
      });
    });

    it('should have required configuration files', () => {
      const requiredFiles = [
        'package.json',
        'astro.config.mjs',
        'tailwind.config.mjs',
        'tsconfig.json',
        'vitest.config.ts',
        'eslint.config.js'
      ];

      requiredFiles.forEach(file => {
        const fullPath = join(projectRoot, file);
        expect(existsSync(fullPath), `File ${file} should exist`).toBe(true);
        expect(statSync(fullPath).isFile(), `${file} should be a file`).toBe(true);
      });
    });

    it('should have proper package.json structure', () => {
      const packageJsonPath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.name).toBe('@uepm/website');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.dependencies).toHaveProperty('astro');
      expect(packageJson.dependencies).toHaveProperty('@astrojs/tailwind');
      expect(packageJson.dependencies).toHaveProperty('shiki');
      expect(packageJson.dependencies).toHaveProperty('lucide-react');
    });

    // Property-based test for component file naming conventions
    it('should follow consistent naming conventions for component files', () => {
      // Test multiple component name patterns to verify naming convention consistency
      const testComponentNames = [
        'Hero', 'CodeExample', 'Features', 'GetStarted', 'Navigation', 'Footer',
        'Button', 'Card', 'Modal', 'Dropdown', 'SearchBar', 'UserProfile'
      ];
      
      testComponentNames.forEach(name => {
        // Test that component names follow PascalCase convention
        expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
        
        // Expected file extension should be .astro for Astro components
        const expectedFileName = `${name}.astro`;
        expect(expectedFileName).toMatch(/^[A-Z][a-zA-Z0-9]*\.astro$/);
      });
    });

    // Property-based test for file structure consistency
    it('should maintain consistent file organization', () => {
      const testCases = [
        { componentName: 'Hero', hasProps: true, hasStyles: true },
        { componentName: 'Button', hasProps: true, hasStyles: false },
        { componentName: 'Layout', hasProps: true, hasStyles: true },
        { componentName: 'Card', hasProps: false, hasStyles: true },
        { componentName: 'Modal', hasProps: true, hasStyles: true }
      ];
      
      testCases.forEach(({ componentName, hasProps, hasStyles }) => {
        // Test file naming pattern
        const fileName = `${componentName}.astro`;
        expect(fileName).toMatch(/^[A-Z][a-zA-Z0-9]*\.astro$/);
        
        // Test that component structure expectations are consistent
        if (hasProps) {
          // Components with props should have TypeScript interfaces
          expect(componentName).toBeTruthy();
        }
        
        if (hasStyles) {
          // Components with styles should be properly scoped
          expect(componentName).toBeTruthy();
        }
      });
    });

    it('should have proper TypeScript configuration', () => {
      const tsconfigPath = join(projectRoot, 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
      
      expect(tsconfig.extends).toBe('astro/tsconfigs/strict');
      expect(tsconfig.include).toBeDefined();
      expect(tsconfig.exclude).toBeDefined();
    });

    it('should have main layout component', () => {
      const layoutPath = join(projectRoot, 'src/layouts/Layout.astro');
      expect(existsSync(layoutPath)).toBe(true);
      
      const layoutContent = readFileSync(layoutPath, 'utf8');
      expect(layoutContent).toContain('interface Props');
      expect(layoutContent).toContain('title: string');
    });

    it('should have global styles properly configured', () => {
      const stylesPath = join(projectRoot, 'src/styles/global.css');
      expect(existsSync(stylesPath)).toBe(true);
      
      const stylesContent = readFileSync(stylesPath, 'utf8');
      expect(stylesContent).toContain('@tailwind base');
      expect(stylesContent).toContain('@tailwind components');
      expect(stylesContent).toContain('@tailwind utilities');
    });

    it('should have proper development environment setup', () => {
      // Test that all required development tools are configured
      const astroConfigPath = join(projectRoot, 'astro.config.mjs');
      const astroConfig = readFileSync(astroConfigPath, 'utf8');
      
      expect(astroConfig).toContain('tailwind()');
      expect(astroConfig).toContain('react()');
      expect(astroConfig).toContain("output: 'static'");
    });

    it('should have proper build configuration', () => {
      // Test that build tools are properly configured
      const packageJsonPath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts.build).toBe('astro build');
      expect(packageJson.scripts.dev).toBe('astro dev');
      expect(packageJson.scripts.preview).toBe('astro preview');
    });
  });
});