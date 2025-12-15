/**
 * Property-based test generators for UEPM
 * Centralized arbitraries for use across all property-based tests
 */

import * as fc from 'fast-check';
import { UProjectFile, Module, PluginReference, PackageJson } from './types';

/**
 * Generator for valid Unreal Engine version strings
 * Supports both version strings (5.0, 5.1, etc.) and GUIDs for launcher builds
 */
export const engineVersionArbitrary = (): fc.Arbitrary<string> => {
  return fc.oneof(
    // Version strings for custom builds
    fc.constantFrom('4.27', '5.0', '5.1', '5.2', '5.3', '5.4', '5.5'),
    // GUID format for launcher builds
    fc.uuid()
  );
};

/**
 * Generator for valid semver range expressions
 * Used for plugin engine compatibility specifications
 */
export const semverRangeArbitrary = (): fc.Arbitrary<string> => {
  return fc.oneof(
    // Exact versions
    fc.constantFrom('5.0.0', '5.1.0', '5.2.0', '5.3.0', '5.4.0'),
    // Caret ranges (compatible within major version)
    fc.constantFrom('^5.0.0', '^5.1.0', '^5.2.0', '^5.3.0', '^5.4.0'),
    // Tilde ranges (compatible within minor version)
    fc.constantFrom('~5.0.0', '~5.1.0', '~5.2.0', '~5.3.0', '~5.4.0'),
    // Range expressions
    fc.constantFrom(
      '>=5.0.0 <6.0.0',
      '>=5.1.0 <5.2.0',
      '>=5.2.0 <5.4.0',
      '>=5.3.0 <6.0.0',
      '5.0.x',
      '5.1.x',
      '5.2.x',
      '5.3.x'
    ),
    // Wildcard ranges
    fc.constantFrom('5.*', '5.0.*', '5.1.*', '5.2.*', '5.3.*')
  );
};

/**
 * Generator for valid Module objects
 */
export const moduleArbitrary = (): fc.Arbitrary<Module> => {
  return fc.record({
    Name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
    Type: fc.constantFrom('Runtime', 'Editor', 'Developer', 'Program'),
    LoadingPhase: fc.constantFrom(
      'Default',
      'PreDefault',
      'PostConfigInit',
      'PostSplashScreen',
      'PreEarlyLoadingScreen',
      'PreLoadingScreen',
      'PostEngineInit'
    ),
    AdditionalDependencies: fc.option(
      fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
      { nil: undefined }
    )
  });
};

/**
 * Generator for valid PluginReference objects
 */
export const pluginReferenceArbitrary = (): fc.Arbitrary<PluginReference> => {
  return fc.record({
    Name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
    Enabled: fc.boolean(),
    MarketplaceURL: fc.option(fc.webUrl(), { nil: undefined }),
    SupportedTargetPlatforms: fc.option(
      fc.array(
        fc.constantFrom('Win64', 'Mac', 'Linux', 'Android', 'iOS', 'HoloLens'),
        { minLength: 1, maxLength: 6 }
      ),
      { nil: undefined }
    )
  });
};

/**
 * Generator for valid UProjectFile objects
 * Generates random but valid .uproject file structures
 */
export const uprojectArbitrary = (): fc.Arbitrary<UProjectFile> => {
  return fc.record({
    EngineAssociation: engineVersionArbitrary(),
    Category: fc.option(
      fc.string({ minLength: 1, maxLength: 100 }),
      { nil: undefined }
    ),
    Description: fc.option(
      fc.string({ minLength: 1, maxLength: 500 }),
      { nil: undefined }
    ),
    Modules: fc.option(
      fc.array(moduleArbitrary(), { minLength: 0, maxLength: 10 }),
      { nil: undefined }
    ),
    Plugins: fc.option(
      fc.array(pluginReferenceArbitrary(), { minLength: 0, maxLength: 20 }),
      { nil: undefined }
    ),
    AdditionalPluginDirectories: fc.option(
      fc.array(
        fc.string({ minLength: 1, maxLength: 100 }),
        { minLength: 0, maxLength: 10 }
      ),
      { nil: undefined }
    ),
    TargetPlatforms: fc.option(
      fc.array(
        fc.constantFrom('Win64', 'Mac', 'Linux', 'Android', 'iOS', 'HoloLens'),
        { minLength: 1, maxLength: 6 }
      ),
      { nil: undefined }
    )
  });
};

/**
 * Generator for valid NPM package names
 */
export const packageNameArbitrary = (): fc.Arbitrary<string> => {
  return fc.oneof(
    // Simple names
    fc.string({ minLength: 1, maxLength: 50 })
      .map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
      .filter(s => s.length > 0 && !s.startsWith('-') && !s.endsWith('-')),
    // Scoped names
    fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 })
        .map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
        .filter(s => s.length > 0 && !s.startsWith('-') && !s.endsWith('-')),
      fc.string({ minLength: 1, maxLength: 30 })
        .map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
        .filter(s => s.length > 0 && !s.startsWith('-') && !s.endsWith('-'))
    ).map(([scope, name]) => `@${scope}/${name}`)
  );
};

/**
 * Generator for valid semantic version strings
 */
export const semverArbitrary = (): fc.Arbitrary<string> => {
  return fc.tuple(
    fc.integer({ min: 0, max: 10 }),
    fc.integer({ min: 0, max: 20 }),
    fc.integer({ min: 0, max: 50 })
  ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);
};

/**
 * Generator for valid script names
 */
export const scriptNameArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    'build',
    'test',
    'start',
    'dev',
    'lint',
    'format',
    'postinstall',
    'preinstall',
    'prepare',
    'clean'
  );
};

/**
 * Generator for valid PackageJson objects
 * Generates random but valid package.json structures
 */
export const packageJsonArbitrary = (): fc.Arbitrary<PackageJson> => {
  return fc.record({
    name: packageNameArbitrary(),
    version: semverArbitrary(),
    description: fc.option(
      fc.string({ minLength: 1, maxLength: 200 }),
      { nil: undefined }
    ),
    private: fc.option(fc.boolean(), { nil: undefined }),
    scripts: fc.option(
      fc.dictionary(
        scriptNameArbitrary(),
        fc.string({ minLength: 1, maxLength: 100 }),
        { minKeys: 0, maxKeys: 10 }
      ),
      { nil: undefined }
    ),
    dependencies: fc.option(
      fc.dictionary(
        packageNameArbitrary(),
        semverRangeArbitrary(),
        { minKeys: 0, maxKeys: 20 }
      ),
      { nil: undefined }
    ),
    devDependencies: fc.option(
      fc.dictionary(
        packageNameArbitrary(),
        semverRangeArbitrary(),
        { minKeys: 0, maxKeys: 15 }
      ),
      { nil: undefined }
    ),
    unreal: fc.option(
      fc.record({
        engineVersion: fc.option(semverRangeArbitrary(), { nil: undefined }),
        pluginName: fc.option(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          { nil: undefined }
        )
      }),
      { nil: undefined }
    )
  });
};

/**
 * Generator for project names (derived from .uproject filenames)
 */
export const projectNameArbitrary = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 50 })
    .map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
    .filter(s => s.length > 0 && !s.startsWith('-') && !s.endsWith('-'));
};

/**
 * Generator for directory paths (for AdditionalPluginDirectories)
 */
export const directoryPathArbitrary = (): fc.Arbitrary<string> => {
  return fc.oneof(
    // Simple directory names
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => !/[<>:"|?*]/.test(s) && s.trim().length > 0),
    // Relative paths
    fc.array(
      fc.string({ minLength: 1, maxLength: 20 })
        .filter(s => !/[<>:"|?*]/.test(s) && s.trim().length > 0),
      { minLength: 1, maxLength: 3 }
    ).map(parts => parts.join('/'))
  );
};