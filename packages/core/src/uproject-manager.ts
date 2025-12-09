import { promises as fs } from 'fs';
import * as path from 'path';
import { UProjectFile } from './types';

/**
 * Find a .uproject file in the specified directory
 * @param directory - Directory to search for .uproject file
 * @returns Path to the .uproject file
 * @throws Error if no .uproject file is found or multiple are found
 */
export async function findProjectFile(directory: string): Promise<string> {
  const files = await fs.readdir(directory);
  const uprojectFiles = files.filter(file => file.endsWith('.uproject'));

  if (uprojectFiles.length === 0) {
    throw new Error(`No .uproject file found in directory: ${directory}`);
  }

  if (uprojectFiles.length > 1) {
    // Use deterministic selection (alphabetical)
    uprojectFiles.sort();
    console.warn(
      `Multiple .uproject files found. Using: ${uprojectFiles[0]}`
    );
  }

  return path.join(directory, uprojectFiles[0]);
}

/**
 * Read and parse a .uproject file
 * @param filePath - Path to the .uproject file
 * @returns Parsed UProjectFile object
 * @throws Error if file cannot be read or parsed
 */
export async function readProject(filePath: string): Promise<UProjectFile> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const project = JSON.parse(content) as UProjectFile;
    
    // Validate that it has the required EngineAssociation field
    if (!project.EngineAssociation) {
      throw new Error('Invalid .uproject file: missing EngineAssociation field');
    }
    
    return project;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse .uproject file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write a .uproject file, preserving formatting where possible
 * @param filePath - Path to the .uproject file
 * @param project - UProjectFile object to write
 */
export async function writeProject(
  filePath: string,
  project: UProjectFile
): Promise<void> {
  // Use 2-space indentation (Unreal default) with trailing newline
  const content = JSON.stringify(project, null, 2) + '\n';
  await fs.writeFile(filePath, content, 'utf-8');
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
