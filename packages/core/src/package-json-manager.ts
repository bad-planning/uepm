import { promises as fs } from 'fs';
import * as path from 'path';
import { PackageJson } from './types';

/**
 * Check if package.json exists in the specified directory
 * @param directory - Directory to check for package.json
 * @returns True if package.json exists
 */
export async function exists(directory: string): Promise<boolean> {
  try {
    const packagePath = path.join(directory, 'package.json');
    await fs.access(packagePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a new package.json with UEPM configuration
 * @param directory - Directory where package.json should be created
 * @param projectName - Name for the package (derived from .uproject filename)
 */
export async function create(
  directory: string,
  projectName: string
): Promise<void> {
  const packageJson: PackageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    description: 'Unreal Engine project with NPM plugin support',
    scripts: {
      postinstall: 'uepm-validate'
    },
    devDependencies: {
      '@uepm/validate': '^0.1.0'
    }
  };

  await write(directory, packageJson);
}

/**
 * Read and parse an existing package.json
 * @param directory - Directory containing package.json
 * @returns Parsed PackageJson object
 * @throws Error if file cannot be read or parsed
 */
export async function read(directory: string): Promise<PackageJson> {
  try {
    const packagePath = path.join(directory, 'package.json');
    const content = await fs.readFile(packagePath, 'utf-8');
    const packageJson = JSON.parse(content) as PackageJson;
    
    // Validate that it has the required name field
    if (!packageJson.name) {
      throw new Error('Invalid package.json: missing name field');
    }
    
    return packageJson;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse package.json: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write package.json to the specified directory
 * @param directory - Directory where package.json should be written
 * @param packageJson - PackageJson object to write
 */
export async function write(
  directory: string,
  packageJson: PackageJson
): Promise<void> {
  const packagePath = path.join(directory, 'package.json');
  // Use 2-space indentation with trailing newline
  const content = JSON.stringify(packageJson, null, 2) + '\n';
  await fs.writeFile(packagePath, content, 'utf-8');
}

/**
 * Add or update the postinstall script in package.json
 * @param packageJson - PackageJson object to modify
 * @param command - Command to add to postinstall (default: 'uepm-validate')
 * @returns Modified PackageJson object
 */
export function addPostinstallScript(
  packageJson: PackageJson,
  command: string = 'uepm-validate'
): PackageJson {
  const modified = { ...packageJson };
  
  if (!modified.scripts) {
    modified.scripts = {};
  }
  
  const existingPostinstall = modified.scripts.postinstall;
  
  if (!existingPostinstall) {
    // No existing postinstall, just add the command
    modified.scripts = {
      ...modified.scripts,
      postinstall: command
    };
  } else if (!existingPostinstall.includes(command)) {
    // Existing postinstall, append the command
    modified.scripts = {
      ...modified.scripts,
      postinstall: `${existingPostinstall} && ${command}`
    };
  }
  // If command already exists, don't modify
  
  return modified;
}

/**
 * Ensure @uepm/validate is in devDependencies
 * @param packageJson - PackageJson object to modify
 * @returns Modified PackageJson object
 */
export function ensureValidateDependency(
  packageJson: PackageJson
): PackageJson {
  const modified = { ...packageJson };
  
  if (!modified.devDependencies) {
    modified.devDependencies = {};
  }
  
  if (!modified.devDependencies['@uepm/validate']) {
    modified.devDependencies = {
      ...modified.devDependencies,
      '@uepm/validate': '^0.1.0'
    };
  }
  
  return modified;
}
