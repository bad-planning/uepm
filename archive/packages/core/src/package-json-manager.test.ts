import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  exists,
  create,
  read,
  write,
  addPostinstallScript,
  ensurePostinstallDependency
} from './package-json-manager';
import { packageJsonArbitrary, projectNameArbitrary } from './test-generators';

describe('PackageJson Manager - Property-Based Tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a unique temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  /**
   * Feature: uepm, Property 8: Init command creates package.json when missing
   * Validates: Requirements 1.5
   * 
   * For any project directory without a package.json, running init should
   * create a valid package.json with appropriate project metadata and the
   * postinstall hook configured.
   */
  it('Property 8: creates valid package.json when missing', async () => {
    await fc.assert(
      fc.asyncProperty(projectNameArbitrary(), async (projectName) => {
        // Create a unique temp directory for this iteration
        const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
        
        try {
          // Ensure no package.json exists
          const packageExists = await exists(testDir);
          expect(packageExists).toBe(false);
          
          // Create package.json
          await create(testDir, projectName);
          
          // Verify package.json now exists
          const existsAfterCreate = await exists(testDir);
          expect(existsAfterCreate).toBe(true);
          
          // Read and verify the created package.json
          const packageJson = await read(testDir);
          
          // Verify required fields
          expect(packageJson.name).toBe(projectName);
          expect(packageJson.version).toBeDefined();
          expect(packageJson.private).toBe(true);
          expect(packageJson.description).toBeDefined();
          
          // Verify postinstall hook is configured
          expect(packageJson.scripts).toBeDefined();
          expect(packageJson.scripts?.postinstall).toBeDefined();
          expect(packageJson.scripts?.postinstall).toContain('uepm-postinstall');
          
          // Verify @uepm/postinstall is in devDependencies
          expect(packageJson.devDependencies).toBeDefined();
          expect(packageJson.devDependencies?.['@uepm/postinstall']).toBeDefined();
        } finally {
          // Clean up this iteration's temp directory
          await fs.rm(testDir, { recursive: true, force: true });
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: uepm, Property 9: Init command updates existing package.json
   * Validates: Requirements 1.6
   * 
   * For any project directory with an existing package.json, running init
   * should add or update the postinstall script to include the validation
   * hook while preserving all other fields.
   */
  it('Property 9: updates existing package.json while preserving fields', async () => {
    await fc.assert(
      fc.asyncProperty(packageJsonArbitrary(), async (originalPackageJson) => {
        // Create a unique temp directory for this iteration
        const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
        
        try {
          // Write the original package.json
          await write(testDir, originalPackageJson);
          
          // Deep clone to compare later
          const originalCopy = JSON.parse(JSON.stringify(originalPackageJson));
          
          // Read the package.json
          const packageJson = await read(testDir);
          
          // Add postinstall script
          let modified = addPostinstallScript(packageJson);
          
          // Ensure postinstall dependency
          modified = ensurePostinstallDependency(modified);
          
          // Write back
          await write(testDir, modified);
          
          // Read the modified package.json
          const modifiedPackageJson = await read(testDir);
          
          // Verify postinstall hook includes uepm-validate
          expect(modifiedPackageJson.scripts?.postinstall).toBeDefined();
          expect(modifiedPackageJson.scripts?.postinstall).toContain('uepm-postinstall');
          
          // Verify @uepm/postinstall is in devDependencies
          expect(modifiedPackageJson.devDependencies?.['@uepm/postinstall']).toBeDefined();
          
          // Verify all other fields are preserved
          expect(modifiedPackageJson.name).toEqual(originalCopy.name);
          expect(modifiedPackageJson.version).toEqual(originalCopy.version);
          expect(modifiedPackageJson.description).toEqual(originalCopy.description);
          expect(modifiedPackageJson.private).toEqual(originalCopy.private);
          
          // Verify existing dependencies are preserved
          if (originalCopy.dependencies) {
            for (const [key, value] of Object.entries(originalCopy.dependencies)) {
              expect(modifiedPackageJson.dependencies?.[key]).toEqual(value);
            }
          }
          
          // Verify existing devDependencies are preserved (except for @uepm/postinstall which may be added)
          if (originalCopy.devDependencies) {
            for (const [key, value] of Object.entries(originalCopy.devDependencies)) {
              if (key !== '@uepm/postinstall') {
                expect(modifiedPackageJson.devDependencies?.[key]).toEqual(value);
              }
            }
          }
          
          // Verify existing scripts are preserved
          if (originalCopy.scripts) {
            for (const [key, value] of Object.entries(originalCopy.scripts)) {
              if (key === 'postinstall') {
                // Postinstall should contain the original value
                expect(modifiedPackageJson.scripts?.[key]).toContain(value as string);
              } else {
                expect(modifiedPackageJson.scripts?.[key]).toEqual(value);
              }
            }
          }
          
          // Verify unreal field is preserved
          expect(modifiedPackageJson.unreal).toEqual(originalCopy.unreal);
        } finally {
          // Clean up this iteration's temp directory
          await fs.rm(testDir, { recursive: true, force: true });
        }
      }),
      { numRuns: 100 }
    );
  });
});
