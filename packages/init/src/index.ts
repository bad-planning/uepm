import * as path from 'path';
import {
  findProjectFile,
  readProject,
  writeProject,
  addPluginDirectory,
  hasPluginDirectory,
  UEPMError,
} from '@uepm/core';
import * as packageJsonManager from '@uepm/core';
import { setupLocalPlugins } from './postinstall-setup';

// Export command-related classes
export { CommandRegistry, Command } from './command-registry';
export { InitCommand } from './init-command';

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
    const uprojectPath = await findProjectFile(projectDir);

    // Step 2: Read and modify the .uproject file
    const project = await readProject(uprojectPath);

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
    await writeProject(uprojectPath, modifiedProject);

    // Step 3: Create or update package.json
    const packageJsonExists = await packageJsonManager.exists(projectDir);
    const projectName = path.basename(uprojectPath, '.uproject').toLowerCase();

    if (!packageJsonExists) {
      // Create new package.json
      await packageJsonManager.create(projectDir, projectName);
    } else {
      // Update existing package.json
      let packageJson = await packageJsonManager.read(projectDir);
      
      // Add postinstall script
      packageJson = packageJsonManager.addPostinstallScript(packageJson);
      
      // Ensure @uepm/validate is in devDependencies
      packageJson = packageJsonManager.ensureValidateDependency(packageJson);
      
      await packageJsonManager.write(projectDir, packageJson);
    }

    // Step 4: Set up local plugin symlinks (for file: dependencies)
    try {
      await setupLocalPlugins(projectDir);
    } catch (error) {
      // Don't fail the entire init if setup fails, just warn
      console.warn('⚠ Warning: Failed to set up local plugin symlinks:', error instanceof Error ? error.message : String(error));
    }

    // Success!
    const actionTaken = alreadyHasNodeModules ? 'reinitialized' : 'initialized';
    return {
      success: true,
      message: `Successfully ${actionTaken} project for NPM plugin support!\n\nNext steps:\n1. Run 'npm install' to install dependencies\n2. Install Unreal Engine plugins via NPM (e.g., 'npm install @uepm/example-plugin')\n3. Open your project in Unreal Engine`,
    };
  } catch (error) {
    // Handle UEPMErrors by converting to error result
    if (error instanceof UEPMError) {
      return {
        success: false,
        message: error.message + (error.suggestion ? `\n${error.suggestion}` : ''),
      };
    }
    
    // For other errors, wrap them in a generic error response
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Unexpected error during initialization: ${message}`,
    };
  }
}
