import { promises as fs } from 'fs';
import * as path from 'path';
import { UProjectFile } from './types';
import {
  createNoProjectFileError,
  createFileNotFoundError,
  createPermissionDeniedError,
  createJSONParseError,
  createSchemaValidationError,
} from './errors';
import { validateUProjectSchema } from './validation';

/**
 * Find a .uproject file in the specified directory
 * @param directory - Directory to search for .uproject file
 * @returns Path to the .uproject file
 * @throws UEPMError if no .uproject file is found or directory cannot be read
 */
export async function findProjectFile(directory: string): Promise<string> {
  try {
    const files = await fs.readdir(directory);
    const uprojectFiles = files.filter(file => file.endsWith('.uproject'));

    if (uprojectFiles.length === 0) {
      throw createNoProjectFileError(directory);
    }

    if (uprojectFiles.length > 1) {
      // Use deterministic selection (alphabetical)
      uprojectFiles.sort();
      console.warn(
        `Multiple .uproject files found. Using: ${uprojectFiles[0]}`
      );
    }

    return path.join(directory, uprojectFiles[0]);
  } catch (error) {
    // If it's already a UEPMError, rethrow it
    if (error instanceof Error && error.name === 'UEPMError') {
      throw error;
    }
    
    // Handle file system errors
    if (error && typeof error === 'object' && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        throw createFileNotFoundError(directory, 'Please check that the directory exists.');
      }
      if (fsError.code === 'EACCES' || fsError.code === 'EPERM') {
        throw createPermissionDeniedError(directory, 'read');
      }
    }
    
    throw error;
  }
}

/**
 * Read and parse a .uproject file
 * @param filePath - Path to the .uproject file
 * @returns Parsed UProjectFile object
 * @throws UEPMError if file cannot be read or parsed
 */
export async function readProject(filePath: string): Promise<UProjectFile> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw createJSONParseError(filePath, parseError as Error);
    }
    
    // Validate schema
    const validation = validateUProjectSchema(parsed);
    if (!validation.valid) {
      throw createSchemaValidationError(filePath, validation.missingFields);
    }
    
    return parsed as UProjectFile;
  } catch (error) {
    // If it's already a UEPMError, rethrow it
    if (error instanceof Error && error.name === 'UEPMError') {
      throw error;
    }
    
    // Handle file system errors
    if (error && typeof error === 'object' && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        throw createFileNotFoundError(filePath);
      }
      if (fsError.code === 'EACCES' || fsError.code === 'EPERM') {
        throw createPermissionDeniedError(filePath, 'read');
      }
    }
    
    throw error;
  }
}

/**
 * Write a .uproject file, preserving formatting where possible
 * @param filePath - Path to the .uproject file
 * @param project - UProjectFile object to write
 * @throws UEPMError if file cannot be written
 */
export async function writeProject(
  filePath: string,
  project: UProjectFile
): Promise<void> {
  try {
    // Use 2-space indentation (Unreal default) with trailing newline
    const content = JSON.stringify(project, null, 2) + '\n';
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    // Handle file system errors
    if (error && typeof error === 'object' && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'EACCES' || fsError.code === 'EPERM') {
        throw createPermissionDeniedError(filePath, 'write');
      }
      if (fsError.code === 'ENOENT') {
        throw createFileNotFoundError(
          path.dirname(filePath),
          'Please check that the directory exists.'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Add a directory to AdditionalPluginDirectories if not already present
 * @param project - UProjectFile object
 * @param directory - Directory to add
 * @returns Modified UProjectFile object
 */
export function addPluginDirectory(
  project: UProjectFile,
  directory: string
): UProjectFile {
  const modified = { ...project };
  
  if (!modified.AdditionalPluginDirectories) {
    modified.AdditionalPluginDirectories = [];
  }
  
  if (!modified.AdditionalPluginDirectories.includes(directory)) {
    modified.AdditionalPluginDirectories = [
      ...modified.AdditionalPluginDirectories,
      directory
    ];
  }
  
  return modified;
}

/**
 * Check if a directory exists in AdditionalPluginDirectories
 * @param project - UProjectFile object
 * @param directory - Directory to check
 * @returns True if directory is already in AdditionalPluginDirectories
 */
export function hasPluginDirectory(
  project: UProjectFile,
  directory: string
): boolean {
  return project.AdditionalPluginDirectories?.includes(directory) ?? false;
}
