import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { addPluginDirectory, findProjectFile, readProject, writeProject } from './uproject-manager';
import { uprojectArbitrary } from './test-generators';
import { UEPMError } from './errors';

describe('UProject Manager', () => {
  describe('Unit Tests', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-test-'));
    });

    afterEach(async () => {
      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    // ------------------------------------------------------------------ //
    // findProjectFile
    // ------------------------------------------------------------------ //

    describe('findProjectFile', () => {
      it('returns the path when exactly one .uproject file is present', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        await fs.writeFile(filePath, '{}', 'utf-8');

        const result = await findProjectFile(tmpDir);
        expect(result).toBe(filePath);
      });

      it('throws UEPMError with code UPROJECT_NOT_FOUND when no .uproject file exists', async () => {
        await expect(findProjectFile(tmpDir)).rejects.toSatisfy(
          (e: unknown) => e instanceof UEPMError && (e as UEPMError).code === 'UPROJECT_NOT_FOUND'
        );
      });

      it('picks the first alphabetically when multiple .uproject files exist', async () => {
        const files = ['Zebra.uproject', 'Alpha.uproject', 'Middle.uproject'];
        for (const f of files) {
          await fs.writeFile(path.join(tmpDir, f), '{}', 'utf-8');
        }

        const result = await findProjectFile(tmpDir);
        expect(result).toBe(path.join(tmpDir, 'Alpha.uproject'));
      });

      it('throws UEPMError with code FILE_NOT_FOUND when the directory does not exist', async () => {
        const nonExistent = path.join(tmpDir, 'does-not-exist');
        await expect(findProjectFile(nonExistent)).rejects.toSatisfy(
          (e: unknown) => e instanceof UEPMError && (e as UEPMError).code === 'FILE_NOT_FOUND'
        );
      });
    });

    // ------------------------------------------------------------------ //
    // readProject
    // ------------------------------------------------------------------ //

    describe('readProject', () => {
      it('returns a parsed UProjectFile for valid JSON with EngineAssociation', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        const content = { EngineAssociation: '5.3', Category: 'Game' };
        await fs.writeFile(filePath, JSON.stringify(content), 'utf-8');

        const result = await readProject(filePath);
        expect(result.EngineAssociation).toBe('5.3');
        expect(result.Category).toBe('Game');
      });

      it('throws UEPMError with code SCHEMA_VALIDATION_ERROR when EngineAssociation is missing', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        await fs.writeFile(filePath, JSON.stringify({ Category: 'Game' }), 'utf-8');

        await expect(readProject(filePath)).rejects.toSatisfy(
          (e: unknown) => e instanceof UEPMError && (e as UEPMError).code === 'SCHEMA_VALIDATION_ERROR'
        );
      });

      it('throws UEPMError with code JSON_PARSE_ERROR for invalid JSON', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        await fs.writeFile(filePath, 'not valid json {{{', 'utf-8');

        await expect(readProject(filePath)).rejects.toSatisfy(
          (e: unknown) => e instanceof UEPMError && (e as UEPMError).code === 'JSON_PARSE_ERROR'
        );
      });

      it('throws UEPMError with code FILE_NOT_FOUND when the file does not exist', async () => {
        const filePath = path.join(tmpDir, 'nonexistent.uproject');

        await expect(readProject(filePath)).rejects.toSatisfy(
          (e: unknown) => e instanceof UEPMError && (e as UEPMError).code === 'FILE_NOT_FOUND'
        );
      });

      it('preserves unknown fields that are not part of the schema', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        const content = {
          EngineAssociation: '5.3',
          CustomField: 'custom-value',
          AnotherUnknown: { nested: true },
        };
        await fs.writeFile(filePath, JSON.stringify(content), 'utf-8');

        const result = await readProject(filePath);
        expect(result['CustomField']).toBe('custom-value');
        expect(result['AnotherUnknown']).toEqual({ nested: true });
      });
    });

    // ------------------------------------------------------------------ //
    // writeProject
    // ------------------------------------------------------------------ //

    describe('writeProject', () => {
      it('writes valid JSON with 2-space indentation and a trailing newline', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        const project = { EngineAssociation: '5.3', Category: 'Game' };

        await writeProject(filePath, project);

        const raw = await fs.readFile(filePath, 'utf-8');
        expect(raw).toBe(JSON.stringify(project, null, 2) + '\n');
        expect(raw.endsWith('\n')).toBe(true);
      });

      it('produces the same data after a read → write → read round-trip', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        const original = {
          EngineAssociation: '5.3',
          Category: 'Game',
          AdditionalPluginDirectories: ['node_modules'],
        };
        await fs.writeFile(filePath, JSON.stringify(original), 'utf-8');

        const firstRead = await readProject(filePath);
        await writeProject(filePath, firstRead);
        const secondRead = await readProject(filePath);

        expect(secondRead).toEqual(firstRead);
      });

      it('creates the file if it does not already exist', async () => {
        const filePath = path.join(tmpDir, 'NewGame.uproject');
        const project = { EngineAssociation: '5.4' };

        await writeProject(filePath, project);

        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      });

      it('preserves all fields including unknown fields from the original object', async () => {
        const filePath = path.join(tmpDir, 'MyGame.uproject');
        const project = {
          EngineAssociation: '5.3',
          ExtraField: 'preserved',
          DeepExtra: { a: 1, b: [2, 3] },
        };

        await writeProject(filePath, project);

        const raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        expect(raw['ExtraField']).toBe('preserved');
        expect(raw['DeepExtra']).toEqual({ a: 1, b: [2, 3] });
      });
    });
  });

  describe('Property-Based Tests', () => {
  /**
   * Feature: uepm, Property 1: Init command adds node_modules while preserving existing data
   * Validates: Requirements 1.1, 1.2
   * 
   * For any valid uproject file with arbitrary existing configuration,
   * running the init command should add "node_modules" to the
   * AdditionalPluginDirectories array while preserving all other
   * fields and their values unchanged.
   */
  it('Property 1: adds node_modules while preserving all existing data', () => {
    fc.assert(
      fc.property(uprojectArbitrary(), (originalProject) => {
        // Deep clone to compare later
        const originalCopy = JSON.parse(JSON.stringify(originalProject));
        
        // Apply the addPluginDirectory function
        const modifiedProject = addPluginDirectory(originalProject, 'node_modules');
        
        // Verify node_modules was added
        expect(modifiedProject.AdditionalPluginDirectories).toBeDefined();
        expect(modifiedProject.AdditionalPluginDirectories).toContain('node_modules');
        
        // Verify all other fields are preserved
        expect(modifiedProject.EngineAssociation).toEqual(originalCopy.EngineAssociation);
        expect(modifiedProject.Category).toEqual(originalCopy.Category);
        expect(modifiedProject.Description).toEqual(originalCopy.Description);
        expect(modifiedProject.Modules).toEqual(originalCopy.Modules);
        expect(modifiedProject.Plugins).toEqual(originalCopy.Plugins);
        expect(modifiedProject.TargetPlatforms).toEqual(originalCopy.TargetPlatforms);
        
        // Verify AdditionalPluginDirectories preserves existing entries
        if (originalCopy.AdditionalPluginDirectories) {
          for (const dir of originalCopy.AdditionalPluginDirectories) {
            expect(modifiedProject.AdditionalPluginDirectories).toContain(dir);
          }
        }
        
        // Verify the original object was not mutated
        expect(originalProject).toEqual(originalCopy);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: uepm, Property 2: Init command is idempotent
   * Validates: Requirements 1.4
   * 
   * For any uproject file, running the init command multiple times
   * should produce the same result as running it once - specifically,
   * "node_modules" should appear exactly once in AdditionalPluginDirectories.
   */
  it('Property 2: init command is idempotent', () => {
    fc.assert(
      fc.property(uprojectArbitrary(), (originalProject) => {
        // Apply addPluginDirectory once
        const modifiedOnce = addPluginDirectory(originalProject, 'node_modules');
        
        // Apply addPluginDirectory a second time
        const modifiedTwice = addPluginDirectory(modifiedOnce, 'node_modules');
        
        // Apply addPluginDirectory a third time
        const modifiedThrice = addPluginDirectory(modifiedTwice, 'node_modules');
        
        // All results should be identical
        expect(modifiedTwice).toEqual(modifiedOnce);
        expect(modifiedThrice).toEqual(modifiedOnce);
        
        // Verify node_modules appears exactly once
        const nodeModulesCount = modifiedThrice.AdditionalPluginDirectories?.filter(
          dir => dir === 'node_modules'
        ).length ?? 0;
        
        expect(nodeModulesCount).toBe(1);
      }),
      { numRuns: 100 }
    );
  });
});
});
