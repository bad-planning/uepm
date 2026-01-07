import * as path from 'path';
import { PackageJson } from './types';
import { PluginMetadata } from './uplugin-manager';

/**
 * Plugin-specific package.json configuration
 */
export interface PluginPackageJsonOptions {
  force?: boolean;
  engineVersion?: string;
}

/**
 * Generate a plugin-specific package.json configuration
 * @param metadata - Plugin metadata extracted from .uplugin file
 * @param upluginPath - Path to the .uplugin file
 * @param options - Additional configuration options
 * @returns PackageJson object configured for plugin distribution
 */
export function generatePluginPackageJson(
  metadata: PluginMetadata,
  upluginPath: string,
  options: PluginPackageJsonOptions = {}
): PackageJson {
  const upluginFileName = path.basename(upluginPath);
  
  // Determine engine version compatibility
  const engineVersion = options.engineVersion || 
                       metadata.engineVersion || 
                       '^5.0.0'; // Default to UE5+ compatibility
  
  // Generate package name from plugin name (convert to kebab-case for NPM)
  const packageName = metadata.name
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  // Standard plugin files to include in NPM package
  const pluginFiles = [
    upluginFileName,
    'Source/**/*',
    'Content/**/*',
    'Resources/**/*',
    'Config/**/*',
    'README.md',
    'LICENSE*',
    'CHANGELOG*'
  ];
  
  // Plugin-specific keywords for NPM discovery
  const pluginKeywords = [
    'unreal-engine',
    'ue5',
    'ue4',
    'plugin',
    'gamedev',
    'game-development'
  ];
  
  // Add category-specific keywords if available
  if (metadata.description) {
    // Extract potential keywords from description
    const descriptionKeywords = metadata.description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && /^[a-z]+$/.test(word))
      .slice(0, 3); // Limit to 3 additional keywords
    
    pluginKeywords.push(...descriptionKeywords);
  }
  
  const packageJson: PackageJson = {
    name: packageName,
    version: metadata.version,
    description: metadata.description || metadata.friendlyName || `Unreal Engine plugin: ${metadata.name}`,
    main: upluginFileName,
    files: pluginFiles,
    keywords: pluginKeywords,
    scripts: {
      test: 'vitest --run',
      'test:watch': 'vitest'
    },
    unreal: {
      engineVersion: engineVersion,
      pluginName: metadata.name
    },
    engines: {
      node: '>=16.0.0'
    },
    license: 'MIT'
  };
  
  // Add optional metadata if available
  if (metadata.author) {
    packageJson.author = metadata.author;
  }
  
  if (metadata.homepage) {
    packageJson.homepage = metadata.homepage;
  }
  
  // Add development dependencies for testing
  packageJson.devDependencies = {
    'vitest': '^1.0.0',
    '@types/node': '^20.0.0'
  };
  
  // Add build scripts if plugin has source modules
  // This will be determined by checking if Source directory exists
  // For now, we'll add conditional build scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build': 'echo "Build script - implement based on your plugin structure"',
    'clean': 'echo "Clean script - implement based on your plugin structure"'
  };
  
  return packageJson;
}

/**
 * Merge plugin-specific configuration with existing package.json
 * @param existingPackageJson - Existing package.json content
 * @param pluginPackageJson - Plugin-specific package.json configuration
 * @param force - Whether to overwrite existing plugin-specific fields
 * @returns Merged PackageJson object
 */
export function mergePluginPackageJson(
  existingPackageJson: PackageJson,
  pluginPackageJson: PackageJson,
  force: boolean = false
): PackageJson {
  const merged = { ...existingPackageJson };
  
  // Always update these plugin-specific fields if force is true
  const pluginSpecificFields = ['main', 'unreal', 'files'];
  
  for (const field of pluginSpecificFields) {
    if (force || !merged[field]) {
      merged[field] = pluginPackageJson[field];
    }
  }
  
  // Merge keywords, avoiding duplicates
  if (pluginPackageJson.keywords) {
    const existingKeywords = merged.keywords || [];
    const newKeywords = pluginPackageJson.keywords.filter(
      keyword => !existingKeywords.includes(keyword)
    );
    merged.keywords = [...existingKeywords, ...newKeywords];
  }
  
  // Merge scripts, preserving existing ones unless force is true
  if (pluginPackageJson.scripts) {
    merged.scripts = merged.scripts || {};
    for (const [scriptName, scriptValue] of Object.entries(pluginPackageJson.scripts)) {
      if (force || !merged.scripts[scriptName]) {
        merged.scripts[scriptName] = scriptValue;
      }
    }
  }
  
  // Merge devDependencies, preserving existing ones
  if (pluginPackageJson.devDependencies) {
    merged.devDependencies = merged.devDependencies || {};
    for (const [depName, depVersion] of Object.entries(pluginPackageJson.devDependencies)) {
      if (!merged.devDependencies[depName]) {
        merged.devDependencies[depName] = depVersion;
      }
    }
  }
  
  // Update metadata fields if not present or if force is true
  const metadataFields = ['description', 'author', 'homepage', 'license'];
  for (const field of metadataFields) {
    if ((force || !merged[field]) && pluginPackageJson[field]) {
      merged[field] = pluginPackageJson[field];
    }
  }
  
  return merged;
}

/**
 * Validate that a package.json is properly configured for plugin distribution
 * @param packageJson - Package.json to validate
 * @param expectedPluginName - Expected plugin name from .uplugin file
 * @returns Validation result with any issues found
 */
export function validatePluginPackageJson(
  packageJson: PackageJson,
  expectedPluginName: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check main field points to .uplugin file
  if (!packageJson.main || !packageJson.main.endsWith('.uplugin')) {
    issues.push('Main field should point to the .uplugin file');
  }
  
  // Check unreal section is present and configured
  if (!packageJson.unreal) {
    issues.push('Missing unreal section in package.json');
  } else {
    if (!packageJson.unreal.pluginName) {
      issues.push('Missing pluginName in unreal section');
    } else if (packageJson.unreal.pluginName !== expectedPluginName) {
      issues.push(`Plugin name mismatch: expected ${expectedPluginName}, got ${packageJson.unreal.pluginName}`);
    }
    
    if (!packageJson.unreal.engineVersion) {
      issues.push('Missing engineVersion in unreal section');
    }
  }
  
  // Check files array includes essential plugin files
  if (!packageJson.files || !Array.isArray(packageJson.files)) {
    issues.push('Missing or invalid files array');
  } else {
    const hasUpluginFile = packageJson.files.some(file => file.endsWith('.uplugin'));
    if (!hasUpluginFile) {
      issues.push('Files array should include the .uplugin file');
    }
  }
  
  // Check for appropriate keywords
  if (!packageJson.keywords || !Array.isArray(packageJson.keywords)) {
    issues.push('Missing keywords array');
  } else {
    const hasUnrealKeywords = packageJson.keywords.some(keyword => 
      keyword.includes('unreal') || keyword.includes('ue4') || keyword.includes('ue5')
    );
    if (!hasUnrealKeywords) {
      issues.push('Should include Unreal Engine related keywords');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}