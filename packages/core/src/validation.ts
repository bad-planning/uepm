/**
 * Schema validation utilities for UEPM
 */

import { UProjectFile, PackageJson, UPluginFile } from './types';

export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
  errors: string[];
}

/**
 * Validate that an object conforms to the UProjectFile schema
 * @param obj - Object to validate
 * @returns Validation result
 */
export function validateUProjectSchema(obj: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missingFields: [],
    errors: [],
  };

  // Check if obj is an object
  if (typeof obj !== 'object' || obj === null) {
    result.valid = false;
    result.errors.push('UProject file must be a JSON object');
    return result;
  }

  const project = obj as Record<string, unknown>;

  // Check required field: EngineAssociation
  if (!project.EngineAssociation) {
    result.valid = false;
    result.missingFields.push('EngineAssociation');
  } else if (typeof project.EngineAssociation !== 'string') {
    result.valid = false;
    result.errors.push('EngineAssociation must be a string');
  }

  // Validate optional fields if present
  if (project.Category !== undefined && typeof project.Category !== 'string') {
    result.valid = false;
    result.errors.push('Category must be a string');
  }

  if (project.Description !== undefined && typeof project.Description !== 'string') {
    result.valid = false;
    result.errors.push('Description must be a string');
  }

  if (project.Modules !== undefined && !Array.isArray(project.Modules)) {
    result.valid = false;
    result.errors.push('Modules must be an array');
  }

  if (project.Plugins !== undefined && !Array.isArray(project.Plugins)) {
    result.valid = false;
    result.errors.push('Plugins must be an array');
  }

  if (project.AdditionalPluginDirectories !== undefined) {
    if (!Array.isArray(project.AdditionalPluginDirectories)) {
      result.valid = false;
      result.errors.push('AdditionalPluginDirectories must be an array');
    } else {
      // Check that all elements are strings
      const allStrings = project.AdditionalPluginDirectories.every(
        (item) => typeof item === 'string'
      );
      if (!allStrings) {
        result.valid = false;
        result.errors.push('AdditionalPluginDirectories must contain only strings');
      }
    }
  }

  if (project.TargetPlatforms !== undefined) {
    if (!Array.isArray(project.TargetPlatforms)) {
      result.valid = false;
      result.errors.push('TargetPlatforms must be an array');
    } else {
      const allStrings = project.TargetPlatforms.every(
        (item) => typeof item === 'string'
      );
      if (!allStrings) {
        result.valid = false;
        result.errors.push('TargetPlatforms must contain only strings');
      }
    }
  }

  return result;
}

/**
 * Validate that an object conforms to the PackageJson schema
 * @param obj - Object to validate
 * @returns Validation result
 */
export function validatePackageJsonSchema(obj: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missingFields: [],
    errors: [],
  };

  // Check if obj is an object
  if (typeof obj !== 'object' || obj === null) {
    result.valid = false;
    result.errors.push('package.json must be a JSON object');
    return result;
  }

  const pkg = obj as Record<string, unknown>;

  // Check required field: name
  if (!pkg.name) {
    result.valid = false;
    result.missingFields.push('name');
  } else if (typeof pkg.name !== 'string') {
    result.valid = false;
    result.errors.push('name must be a string');
  }

  // Validate optional fields if present
  if (pkg.version !== undefined && typeof pkg.version !== 'string') {
    result.valid = false;
    result.errors.push('version must be a string');
  }

  if (pkg.description !== undefined && typeof pkg.description !== 'string') {
    result.valid = false;
    result.errors.push('description must be a string');
  }

  if (pkg.scripts !== undefined && typeof pkg.scripts !== 'object') {
    result.valid = false;
    result.errors.push('scripts must be an object');
  }

  if (pkg.dependencies !== undefined && typeof pkg.dependencies !== 'object') {
    result.valid = false;
    result.errors.push('dependencies must be an object');
  }

  if (pkg.devDependencies !== undefined && typeof pkg.devDependencies !== 'object') {
    result.valid = false;
    result.errors.push('devDependencies must be an object');
  }

  return result;
}

/**
 * Validate that an object conforms to the UPluginFile schema
 * @param obj - Object to validate
 * @returns Validation result
 */
export function validateUPluginSchema(obj: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missingFields: [],
    errors: [],
  };

  // Check if obj is an object
  if (typeof obj !== 'object' || obj === null) {
    result.valid = false;
    result.errors.push('UPlugin file must be a JSON object');
    return result;
  }

  const plugin = obj as Record<string, unknown>;

  // Check required field: FileVersion
  if (plugin.FileVersion === undefined) {
    result.valid = false;
    result.missingFields.push('FileVersion');
  } else if (typeof plugin.FileVersion !== 'number') {
    result.valid = false;
    result.errors.push('FileVersion must be a number');
  }

  // Validate optional fields if present
  if (plugin.Version !== undefined && typeof plugin.Version !== 'number') {
    result.valid = false;
    result.errors.push('Version must be a number');
  }

  if (plugin.VersionName !== undefined && typeof plugin.VersionName !== 'string') {
    result.valid = false;
    result.errors.push('VersionName must be a string');
  }

  if (plugin.FriendlyName !== undefined && typeof plugin.FriendlyName !== 'string') {
    result.valid = false;
    result.errors.push('FriendlyName must be a string');
  }

  if (plugin.Description !== undefined && typeof plugin.Description !== 'string') {
    result.valid = false;
    result.errors.push('Description must be a string');
  }

  if (plugin.Category !== undefined && typeof plugin.Category !== 'string') {
    result.valid = false;
    result.errors.push('Category must be a string');
  }

  if (plugin.CreatedBy !== undefined && typeof plugin.CreatedBy !== 'string') {
    result.valid = false;
    result.errors.push('CreatedBy must be a string');
  }

  if (plugin.CreatedByURL !== undefined && typeof plugin.CreatedByURL !== 'string') {
    result.valid = false;
    result.errors.push('CreatedByURL must be a string');
  }

  if (plugin.DocsURL !== undefined && typeof plugin.DocsURL !== 'string') {
    result.valid = false;
    result.errors.push('DocsURL must be a string');
  }

  if (plugin.MarketplaceURL !== undefined && typeof plugin.MarketplaceURL !== 'string') {
    result.valid = false;
    result.errors.push('MarketplaceURL must be a string');
  }

  if (plugin.SupportURL !== undefined && typeof plugin.SupportURL !== 'string') {
    result.valid = false;
    result.errors.push('SupportURL must be a string');
  }

  if (plugin.EngineVersion !== undefined && typeof plugin.EngineVersion !== 'string') {
    result.valid = false;
    result.errors.push('EngineVersion must be a string');
  }

  if (plugin.CanContainContent !== undefined && typeof plugin.CanContainContent !== 'boolean') {
    result.valid = false;
    result.errors.push('CanContainContent must be a boolean');
  }

  if (plugin.IsBetaVersion !== undefined && typeof plugin.IsBetaVersion !== 'boolean') {
    result.valid = false;
    result.errors.push('IsBetaVersion must be a boolean');
  }

  if (plugin.IsExperimentalVersion !== undefined && typeof plugin.IsExperimentalVersion !== 'boolean') {
    result.valid = false;
    result.errors.push('IsExperimentalVersion must be a boolean');
  }

  if (plugin.Installed !== undefined && typeof plugin.Installed !== 'boolean') {
    result.valid = false;
    result.errors.push('Installed must be a boolean');
  }

  if (plugin.Modules !== undefined && !Array.isArray(plugin.Modules)) {
    result.valid = false;
    result.errors.push('Modules must be an array');
  }

  if (plugin.Plugins !== undefined && !Array.isArray(plugin.Plugins)) {
    result.valid = false;
    result.errors.push('Plugins must be an array');
  }

  return result;
}

/**
 * Check if a UProjectFile is valid
 * @param project - UProjectFile to validate
 * @returns True if valid
 */
export function isValidUProject(project: unknown): project is UProjectFile {
  const result = validateUProjectSchema(project);
  return result.valid;
}

/**
 * Check if a UPluginFile is valid
 * @param plugin - UPluginFile to validate
 * @returns True if valid
 */
export function isValidUPlugin(plugin: unknown): plugin is UPluginFile {
  const result = validateUPluginSchema(plugin);
  return result.valid;
}

/**
 * Check if a PackageJson is valid
 * @param pkg - PackageJson to validate
 * @returns True if valid
 */
export function isValidPackageJson(pkg: unknown): pkg is PackageJson {
  const result = validatePackageJsonSchema(pkg);
  return result.valid;
}
