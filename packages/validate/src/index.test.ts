import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getEngineVersion,
  validatePlugin,
  formatWarning,
  PluginInfo,
} from './index';
import { UProjectFile } from '@uepm/core';

// Arbitrary generators for property-based testing

/**
 * Generate valid engine version strings
 */
const engineVersionArbitrary = () =>
  fc.oneof(
    // Semantic version format
    fc
      .tuple(
        fc.integer({ min: 4, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10 })
      )
      .map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
    // Major.Minor format (common in Unreal)
    fc
      .tuple(fc.integer({ min: 4, max: 6 }), fc.integer({ min: 0, max: 5 }))
      .map(([major, minor]) => `${major}.${minor}`),
    // GUID format (launcher builds)
    fc
      .uuid()
      .map((uuid) => `{${uuid.toUpperCase()}}`)
  );

/**
 * Generate valid UProjectFile objects with random engine versions
 */
const uprojectArbitrary = () =>
  fc.record({
    EngineAssociation: engineVersionArbitrary(),
    Category: fc.option(fc.string(), { nil: undefined }),
    Description: fc.option(fc.string(), { nil: undefined }),
    AdditionalPluginDirectories: fc.option(fc.array(fc.string()), {
      nil: undefined,
    }),
  }) as fc.Arbitrary<UProjectFile>;

/**
 * Generate valid semver range expressions
 */
const semverRangeArbitrary = () =>
  fc.oneof(
    // Caret range: ^5.0.0
    fc
      .tuple(
        fc.integer({ min: 4, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10 })
      )
      .map(([major, minor, patch]) => `^${major}.${minor}.${patch}`),
    // Tilde range: ~5.3.0
    fc
      .tuple(
        fc.integer({ min: 4, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10 })
      )
      .map(([major, minor, patch]) => `~${major}.${minor}.${patch}`),
    // Greater than or equal: >=5.0.0
    fc
      .tuple(
        fc.integer({ min: 4, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10 })
      )
      .map(([major, minor, patch]) => `>=${major}.${minor}.${patch}`),
    // Range: >=5.0.0 <6.0.0
    fc
      .tuple(
        fc.integer({ min: 4, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10 })
      )
      .map(
        ([major, minor, patch]) =>
          `>=${major}.${minor}.${patch} <${major + 1}.0.0`
      )
  );

/**
 * Generate PluginInfo objects
 */
const pluginInfoArbitrary = () =>
  fc.record({
    name: fc.string({ minLength: 1 }),
    version: fc
      .tuple(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 50 })
      )
      .map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
    engineVersion: fc.option(semverRangeArbitrary(), { nil: undefined }),
    path: fc.string(),
  }) as fc.Arbitrary<PluginInfo>;

// Property-based tests

describe('Property-Based Tests', () => {
  /**
   * Feature: uepm, Property 3: Validation hook correctly parses engine versions
   * Validates: Requirements 9.3
   */
  it('Property 3: should correctly parse engine versions from any valid uproject file', () => {
    fc.assert(
      fc.property(uprojectArbitrary(), (uproject) => {
        const engineVersion = getEngineVersion(uproject);

        // The returned version should match the EngineAssociation field
        expect(engineVersion).toBe(uproject.EngineAssociation);

        // The returned version should be a non-empty string
        expect(typeof engineVersion).toBe('string');
        expect(engineVersion.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: uepm, Property 4: Semver validation correctly identifies compatibility
   * Validates: Requirements 9.4
   */
  it('Property 4: should correctly validate semver compatibility', () => {
    fc.assert(
      fc.property(
        pluginInfoArbitrary(),
        fc
          .tuple(
            fc.integer({ min: 4, max: 6 }),
            fc.integer({ min: 0, max: 5 }),
            fc.integer({ min: 0, max: 10 })
          )
          .map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
        (plugin, engineVersion) => {
          const result = validatePlugin(plugin, engineVersion);

          // Result should always have a compatible boolean
          expect(typeof result.compatible).toBe('boolean');

          // If incompatible, should have a reason
          if (!result.compatible) {
            expect(result.reason).toBeDefined();
            expect(typeof result.reason).toBe('string');
            expect(result.reason!.length).toBeGreaterThan(0);
          }

          // If plugin has no engine version, should be compatible
          if (!plugin.engineVersion) {
            expect(result.compatible).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Unit tests

describe('Unit Tests', () => {
  describe('getEngineVersion', () => {
    it('should extract engine version from uproject file', () => {
      const uproject: UProjectFile = {
        EngineAssociation: '5.3.0',
        Category: 'Test',
      };

      const version = getEngineVersion(uproject);
      expect(version).toBe('5.3.0');
    });

    it('should handle GUID format engine associations', () => {
      const uproject: UProjectFile = {
        EngineAssociation: '{B5F5C5E0-1234-5678-9ABC-DEF012345678}',
      };

      const version = getEngineVersion(uproject);
      expect(version).toBe('{B5F5C5E0-1234-5678-9ABC-DEF012345678}');
    });
  });

  describe('validatePlugin', () => {
    it('should validate compatible plugin', () => {
      const plugin: PluginInfo = {
        name: '@uepm/example-plugin',
        version: '1.0.0',
        engineVersion: '>=5.0.0 <6.0.0',
        path: '/path/to/plugin',
      };

      const result = validatePlugin(plugin, '5.3.0');
      expect(result.compatible).toBe(true);
    });

    it('should detect incompatible plugin', () => {
      const plugin: PluginInfo = {
        name: '@uepm/example-plugin',
        version: '1.0.0',
        engineVersion: '>=5.0.0 <5.2.0',
        path: '/path/to/plugin',
      };

      const result = validatePlugin(plugin, '5.3.0');
      expect(result.compatible).toBe(false);
      expect(result.reason).toContain('does not satisfy');
    });

    it('should handle plugin without engine version', () => {
      const plugin: PluginInfo = {
        name: '@uepm/example-plugin',
        version: '1.0.0',
        path: '/path/to/plugin',
      };

      const result = validatePlugin(plugin, '5.3.0');
      expect(result.compatible).toBe(true);
    });
  });

  describe('formatWarning', () => {
    it('should format warning message correctly', () => {
      const plugin: PluginInfo = {
        name: '@uepm/example-plugin',
        version: '1.0.0',
        engineVersion: '>=5.0.0 <5.2.0',
        path: '/path/to/plugin',
      };

      const result = {
        compatible: false,
        reason: 'Engine version 5.3.0 does not satisfy >=5.0.0 <5.2.0',
      };

      const warning = formatWarning(plugin, result);
      expect(warning).toContain('@uepm/example-plugin');
      expect(warning).toContain('>=5.0.0 <5.2.0');
      expect(warning).toContain('does not satisfy');
    });
  });
});
