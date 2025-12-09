import * as path from 'path';
import {
  findProjectFile,
  readProject,
  writeProject,
  addPluginDirectory,
  hasPluginDirectory,
} from '@uepm/core';
import * as packageJsonManager from '@uepm/core';

export interface InitOptions {
  projectDir?: string;
  force?: boolean;
}

export interface InitResult {
  success: boolean;
  message: string;
  alreadyInitialized?: boolean;
}

/**
 * Initialize an Unreal Engine project for NPM plugin support
 * @param options - Initialization options
 * @returns Result of the initialization
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
  const projectDir = options.projectDir || process.cwd();

  try {
    // Step 1: Find the .uproject file
    let uprojectPath: string;
    try {
      uprojectPath = await findProjectFile(projectDir);
    } catch (error) {
      return {
        success: false,
        message: `Error: No .uproject file found in directory: ${projectDir}\nPlease run this command in your Unreal Engine project root directory.`,
      };
    }

    // Step 2: Read and modify the .uproject file
    let project;
    try {
      project = await readProject(uprojectPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Error reading .uproject file: ${message}`,
      };
    }

    // Check if already initialized (unless force flag is set)
    const alreadyHasNodeModules = hasPluginDirectory(project, 'node_modules');
    if (alreadyHasNodeModules && !options.force) {
      return {
        success: true,
        message: 'Project is already initialized for NPM plugin support.',
        alreadyInitialized: true,
      };
    }

    // Add node_modules to AdditionalPluginDirectories
    const modifiedProject = addPluginDirectory(project, 'node_modules');

    try {
      await writeProject(uprojectPath, modifiedProject);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Error writing .uproject file: ${message}\nPlease check file permissions.`,
      };
    }

    // Step 3: Create or update package.json
    const packageJsonExists = await packageJsonManager.exists(projectDir);
    const projectName = path.basename(uprojectPath, '.uproject').toLowerCase();

    if (!packageJsonExists) {
      // Create new package.json
      try {
        await packageJsonManager.create(projectDir, projectName);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          message: `Error creating package.json: ${message}`,
        };
      }
    } else {
      // Update existing package.json
      try {
        let packageJson = await packageJsonManager.read(projectDir);
        
        // Add postinstall script
        packageJson = packageJsonManager.addPostinstallScript(packageJson);
        
        // Ensure @uepm/validate is in devDependencies
        packageJson = packageJsonManager.ensureValidateDependency(packageJson);
        
        await packageJsonManager.write(projectDir, packageJson);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          message: `Error updating package.json: ${message}`,
        };
      }
    }

    // Success!
    const actionTaken = alreadyHasNodeModules ? 'reinitialized' : 'initialized';
    return {
      success: true,
      message: `Successfully ${actionTaken} project for NPM plugin support!\n\nNext steps:\n1. Run 'npm install' to install dependencies\n2. Install Unreal Engine plugins via NPM (e.g., 'npm install @uepm/example-plugin')\n3. Open your project in Unreal Engine`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Unexpected error during initialization: ${message}`,
    };
  }
}
