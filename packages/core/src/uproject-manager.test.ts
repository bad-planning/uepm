import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { addPluginDirectory } from './uproject-manager';
import { uprojectArbitrary } from './test-generators';

describe('UProject Manager - Property-Based Tests', () => {
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
