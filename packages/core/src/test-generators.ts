/**
 * Property-based test generators for UEPM
 * Centralized arbitraries for use across all property-based tests
 */

import * as fc from 'fast-check';
import { UProjectFile, Module, PluginReference, PackageJson, UPluginFile, UPluginModule, PluginDependency, InitContext } from './types';

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

/**
 * Generator for valid UPluginModule objects
 */
export const upluginModuleArbitrary = (): fc.Arbitrary<UPluginModule> => {
  return fc.record({
    Name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
    Type: fc.constantFrom('Runtime', 'Editor', 'Developer', 'Program', 'ClientOnly', 'ServerOnly'),
    LoadingPhase: fc.option(
      fc.constantFrom(
        'Default',
        'PreDefault',
        'PostConfigInit',
        'PostSplashScreen',
        'PreEarlyLoadingScreen',
        'PreLoadingScreen',
        'PostEngineInit'
      ),
      { nil: undefined }
    ),
    AdditionalDependencies: fc.option(
      fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
      { nil: undefined }
    ),
    WhitelistPlatforms: fc.option(
      fc.array(
        fc.constantFrom('Win64', 'Mac', 'Linux', 'Android', 'iOS', 'HoloLens'),
        { minLength: 1, maxLength: 6 }
      ),
      { nil: undefined }
    ),
    BlacklistPlatforms: fc.option(
      fc.array(
        fc.constantFrom('Win64', 'Mac', 'Linux', 'Android', 'iOS', 'HoloLens'),
        { minLength: 1, maxLength: 6 }
      ),
      { nil: undefined }
    )
  });
};

/**
 * Generator for valid PluginDependency objects
 */
export const pluginDependencyArbitrary = (): fc.Arbitrary<PluginDependency> => {
  return fc.record({
    Name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
    Enabled: fc.boolean(),
    Optional: fc.option(fc.boolean(), { nil: undefined })
  });
};

/**
 * Generator for valid UPluginFile objects
 * Generates random but valid .uplugin file structures
 */
export const upluginArbitrary = (): fc.Arbitrary<UPluginFile> => {
  return fc.record({
    FileVersion: fc.constantFrom(3, 4),
    Version: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
    VersionName: fc.option(semverArbitrary(), { nil: undefined }),
    FriendlyName: fc.option(
      fc.string({ minLength: 1, maxLength: 100 }),
      { nil: undefined }
    ),
    Description: fc.option(
      fc.string({ minLength: 1, maxLength: 500 }),
      { nil: undefined }
    ),
    Category: fc.option(
      fc.constantFrom('Animation', 'Audio', 'Blueprint', 'Content', 'Developer', 'Editor', 'Gameplay', 'Rendering', 'Scripting', 'Virtual Reality'),
      { nil: undefined }
    ),
    CreatedBy: fc.option(
      fc.string({ minLength: 1, maxLength: 100 }),
      { nil: undefined }
    ),
    CreatedByURL: fc.option(fc.webUrl(), { nil: undefined }),
    DocsURL: fc.option(fc.webUrl(), { nil: undefined }),
    MarketplaceURL: fc.option(fc.webUrl(), { nil: undefined }),
    SupportURL: fc.option(fc.webUrl(), { nil: undefined }),
    EngineVersion: fc.option(engineVersionArbitrary(), { nil: undefined }),
    CanContainContent: fc.option(fc.boolean(), { nil: undefined }),
    IsBetaVersion: fc.option(fc.boolean(), { nil: undefined }),
    IsExperimentalVersion: fc.option(fc.boolean(), { nil: undefined }),
    Installed: fc.option(fc.boolean(), { nil: undefined }),
    Modules: fc.option(
      fc.array(upluginModuleArbitrary(), { minLength: 0, maxLength: 10 }),
      { nil: undefined }
    ),
    Plugins: fc.option(
      fc.array(pluginDependencyArbitrary(), { minLength: 0, maxLength: 20 }),
      { nil: undefined }
    )
  });
};

/**
 * Generator for plugin names (derived from .uplugin filenames)
 */
export const pluginNameArbitrary = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s));
};

/**
 * Generator for InitContext objects
 */
export const initContextArbitrary = (): fc.Arbitrary<InitContext> => {
  return fc.oneof(
    // Project context
    fc.record({
      type: fc.constant('project' as const),
      primaryFile: fc.string({ minLength: 1, maxLength: 100 }).map(s => s + '.uproject'),
      directory: directoryPathArbitrary()
    }),
    // Plugin context
    fc.record({
      type: fc.constant('plugin' as const),
      primaryFile: fc.string({ minLength: 1, maxLength: 100 }).map(s => s + '.uplugin'),
      directory: directoryPathArbitrary(),
      pluginName: pluginNameArbitrary()
    })
  );
};

/**
 * Generator for directory configurations for context detection testing
 */
export const directoryConfigArbitrary = (): fc.Arbitrary<{
  uprojectFiles: string[];
  upluginFiles: string[];
  otherFiles: string[];
}> => {
  return fc.record({
    uprojectFiles: fc.array(
      fc.string({ minLength: 1, maxLength: 30 })
        .filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
        .map(s => s + '.uproject'),
      { minLength: 0, maxLength: 3 }
    ),
    upluginFiles: fc.array(
      fc.string({ minLength: 1, maxLength: 30 })
        .filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
        .map(s => s + '.uplugin'),
      { minLength: 0, maxLength: 3 }
    ),
    otherFiles: fc.array(
      fc.string({ minLength: 1, maxLength: 30 })
        .filter(s => !s.endsWith('.uproject') && !s.endsWith('.uplugin'))
        .filter(s => !/[<>:"|?*\/\\]/.test(s) && s.trim().length > 0 && s.trim() === s)
        .filter(s => s !== '.' && s !== '..' && !s.startsWith('./')), // Exclude directory references
      { minLength: 0, maxLength: 5 }
    )
  });
};