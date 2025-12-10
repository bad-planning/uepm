import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateUProjectSchema,
  validatePackageJsonSchema,
  isValidUProject,
  isValidPackageJson,
} from './validation';
import { UProjectFile, PackageJson } from './types';

describe('Schema Validation', () => {
  describe('validateUProjectSchema', () => {
    it('should accept valid minimal uproject', () => {
      const valid = {
        EngineAssociation: '5.3',
      };

      const result = validateUProjectSchema(valid);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject uproject without EngineAssociation', () => {
      const invalid = {
        Category: 'Test',
      };

      const result = validateUProjectSchema(invalid);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('EngineAssociation');
    });

    it('should reject non-object', () => {
      const result = validateUProjectSchema('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate optional fields', () => {
      const valid = {
        EngineAssociation: '5.3',
        Category: 'Test',
        Description: 'Test project',
        Modules: [],
        Plugins: [],
        AdditionalPluginDirectories: ['node_modules'],
        TargetPlatforms: ['Windows'],
      };

      const result = validateUProjectSchema(valid);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid AdditionalPluginDirectories', () => {
      const invalid = {
        EngineAssociation: '5.3',
        AdditionalPluginDirectories: [123, 456], // Should be strings
      };

      const result = validateUProjectSchema(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('AdditionalPluginDirectories'))).toBe(true);
    });
  });

  describe('validatePackageJsonSchema', () => {
    it('should accept valid minimal package.json', () => {
      const valid = {
        name: 'test-package',
      };

      const result = validatePackageJsonSchema(valid);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject package.json without name', () => {
      const invalid = {
        version: '1.0.0',
      };

      const result = validatePackageJsonSchema(invalid);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('name');
    });

    it('should validate optional fields', () => {
      const valid = {
        name: 'test-package',
        version: '1.0.0',
        description: 'Test',
        scripts: {},
        dependencies: {},
        devDependencies: {},
      };

      const result = validatePackageJsonSchema(valid);
      expect(result.valid).toBe(true);
    });
  });
});

/**
 * Feature: uepm, Property 6: UProject validation accepts valid schemas
 * Validates: Requirements 7.5
 */
describe('Property 6: UProject validation accepts valid schemas', () => {
  // Generator for valid UProjectFile objects
  const validUProjectArb = fc.record({
    EngineAssociation: fc.oneof(
      fc.constant('5.0'),
      fc.constant('5.1'),
      fc.constant('5.2'),
      fc.constant('5.3'),
      fc.constant('5.4'),
      fc.string().filter(s => s.length > 0)
    ),
    Category: fc.option(fc.string(), { nil: undefined }),
    Description: fc.option(fc.string(), { nil: undefined }),
    Modules: fc.option(
      fc.array(
        fc.record({
          Name: fc.string(),
          Type: fc.string(),
          LoadingPhase: fc.string(),
        })
      ),
      { nil: undefined }
    ),
    Plugins: fc.option(
      fc.array(
        fc.record({
          Name: fc.string(),
          Enabled: fc.boolean(),
        })
      ),
      { nil: undefined }
    ),
    AdditionalPluginDirectories: fc.option(
      fc.array(fc.string()),
      { nil: undefined }
    ),
    TargetPlatforms: fc.option(
      fc.array(fc.oneof(
        fc.constant('Windows'),
        fc.constant('Mac'),
        fc.constant('Linux'),
        fc.constant('Android'),
        fc.constant('iOS')
      )),
      { nil: undefined }
    ),
  });

  it('should accept all valid UProject schemas', () => {
    fc.assert(
      fc.property(validUProjectArb, (uproject) => {
        const result = validateUProjectSchema(uproject);
        
        // All valid schemas should pass validation
        expect(result.valid).toBe(true);
        expect(result.missingFields).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
        
        // isValidUProject should also return true
        expect(isValidUProject(uproject)).toBe(true);
        
        return result.valid;
      }),
      { numRuns: 100 }
    );
  });

  it('should accept UProject with only required fields', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.length > 0),
        (engineVersion) => {
          const minimalProject = {
            EngineAssociation: engineVersion,
          };

          const result = validateUProjectSchema(minimalProject);
          expect(result.valid).toBe(true);
          expect(result.missingFields).toHaveLength(0);
          
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept UProject with additional unknown fields', () => {
    fc.assert(
      fc.property(
        validUProjectArb,
        fc.string(),
        fc.anything(),
        (uproject, extraKey, extraValue) => {
          // Add an extra field that's not in the schema
          const projectWithExtra = {
            ...uproject,
            [extraKey]: extraValue,
          };

          const result = validateUProjectSchema(projectWithExtra);
          
          // Should still be valid (we allow additional fields)
          expect(result.valid).toBe(true);
          
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept UProject with empty arrays', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.length > 0),
        (engineVersion) => {
          const projectWithEmptyArrays = {
            EngineAssociation: engineVersion,
            Modules: [],
            Plugins: [],
            AdditionalPluginDirectories: [],
            TargetPlatforms: [],
          };

          const result = validateUProjectSchema(projectWithEmptyArrays);
          expect(result.valid).toBe(true);
          
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Generator for valid PackageJson objects
  const validPackageJsonArb = fc.record({
    name: fc.string().filter(s => s.length > 0),
    version: fc.option(fc.string(), { nil: undefined }),
    description: fc.option(fc.string(), { nil: undefined }),
    private: fc.option(fc.boolean(), { nil: undefined }),
    scripts: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined }),
    dependencies: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined }),
    devDependencies: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined }),
  });

  it('should accept all valid PackageJson schemas', () => {
    fc.assert(
      fc.property(validPackageJsonArb, (packageJson) => {
        const result = validatePackageJsonSchema(packageJson);
        
        // All valid schemas should pass validation
        expect(result.valid).toBe(true);
        expect(result.missingFields).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
        
        // isValidPackageJson should also return true
        expect(isValidPackageJson(packageJson)).toBe(true);
        
        return result.valid;
      }),
      { numRuns: 100 }
    );
  });
});
