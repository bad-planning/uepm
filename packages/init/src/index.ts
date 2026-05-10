import * as path from 'path';
import {
  findProjectFile,
  readProject,
  writeProject,
  addPluginDirectory,
  hasPluginDirectory,
  UEPMError,
  ExitCode,
  formatErrorMessage,
  detectContext,
  PluginInitializationStrategy,
  InitOptions,
  InitResult,
  extractPluginMetadata,
} from '@uepm/core';
import { derivePluginDefaults, promptPluginOptions, PluginPromptDefaults } from './plugin-prompts';
import * as packageJsonManager from '@uepm/core';

// Export command-related classes
export { CommandRegistry, Command } from './command-registry';
export { InitCommand } from './init-command';
export type { InitOptions, InitResult } from '@uepm/core';

/**
 * Initialize an Unreal Engine project or plugin for NPM support
 * @param options - Initialization options
 * @returns Result of the initialization
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
  const projectDir = options.projectDir || process.cwd();

  try {
    // Step 1: Detect context (project vs plugin)
    const contextResult = await detectContext(projectDir);

    if (!contextResult.success) {
      return {
        success: false,
        message: contextResult.error,
        filesCreated: [],
        filesModified: [],
      };
    }

    const context = contextResult.context;

    // Step 2: Handle warnings if any
    let warningMessage = '';
    if (contextResult.warnings && contextResult.warnings.length > 0) {
      warningMessage = contextResult.warnings.join('\n') + '\n\n';
    }

    // Step 3: Choose strategy based on context
    if (context.type === 'plugin') {
      // Derive prompt defaults from .uplugin metadata
      const metadata = await extractPluginMetadata(context.primaryFile);
      const defaults = derivePluginDefaults(metadata, context.pluginName);

      let resolved: PluginPromptDefaults;
      if (options.yes) {
        resolved = defaults;
      } else if (process.stdin.isTTY) {
        console.log('\nThis utility will walk you through setting up your plugin for NPM distribution.');
        console.log('Press ^C at any time to quit.\n');
        resolved = await promptPluginOptions(defaults);
      } else {
        throw new UEPMError(
          'INTERACTIVE_REQUIRED',
          'uepm-init requires an interactive terminal for plugin initialization.',
          ExitCode.INVALID_ARGUMENTS,
          undefined,
          'Run with --yes to accept derived defaults and skip prompts.'
        );
      }

      const pluginStrategy = new PluginInitializationStrategy();
      const coreOptions: InitOptions = {
        projectDir: options.projectDir,
        force: options.force,
        pluginName: options.pluginName,
        packageName: options.packageName ?? resolved.packageName,
        version: options.version ?? resolved.version,
        description: options.description ?? resolved.description,
        author: options.author ?? resolved.author,
        license: options.license ?? resolved.license,
        engineVersion: options.engineVersion ?? resolved.engineVersion,
      };

      const result = await pluginStrategy.initialize(context, coreOptions);

      return {
        success: result.success,
        message: warningMessage + result.message,
        alreadyInitialized: result.alreadyInitialized,
        context: result.context,
        filesCreated: result.filesCreated,
        filesModified: result.filesModified,
      };
    } else {
      // Use project initialization strategy (backward compatibility)
      return await initializeProject(projectDir, options, warningMessage);
    }

  } catch (error) {
    // Handle UEPMErrors by converting to error result
    if (error instanceof UEPMError) {
      return {
        success: false,
        message: formatErrorMessage(error.toErrorMessage()),
        filesCreated: [],
        filesModified: [],
      };
    }

    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Unexpected error during initialization: ${message}`,
      filesCreated: [],
      filesModified: [],
    };
  }
}

/**
 * Project initialization strategy (maintains backward compatibility)
 * @param projectDir - Project directory
 * @param options - Initialization options
 * @param warningPrefix - Any warning messages to prepend
 * @returns Result of the initialization
 */
async function initializeProject(
  projectDir: string, 
  options: InitOptions, 
  warningPrefix: string = ''
): Promise<InitResult> {
  // Step 1: Find the .uproject file
  const uprojectPath = await findProjectFile(projectDir);

  // Step 2: Read and modify the .uproject file
  const project = await readProject(uprojectPath);

  // Check if already initialized (unless force flag is set)
  const alreadyHasUEPMPlugins = hasPluginDirectory(project, 'UEPMPlugins');
  if (alreadyHasUEPMPlugins && !options.force) {
    return {
      success: true,
      message: warningPrefix + 'Project is already initialized for NPM plugin support.',
      alreadyInitialized: true,
      context: 'project',
      filesCreated: [],
      filesModified: [],
    };
  }

  // Add UEPMPlugins to AdditionalPluginDirectories
  const modifiedProject = addPluginDirectory(project, 'UEPMPlugins');
  await writeProject(uprojectPath, modifiedProject);

  const filesCreated: string[] = [];
  const filesModified: string[] = ['*.uproject'];

  // Step 3: Create or update package.json
  const packageJsonExists = await packageJsonManager.exists(projectDir);
  const projectName = path.basename(uprojectPath, '.uproject').toLowerCase();

  if (!packageJsonExists) {
    // Create new package.json
    await packageJsonManager.create(projectDir, projectName);
    filesCreated.push('package.json');
  } else {
    // Update existing package.json
    let packageJson = await packageJsonManager.read(projectDir);
    
    // Add postinstall script
    packageJson = packageJsonManager.addPostinstallScript(packageJson);
    
    // Ensure @uepm/postinstall is in devDependencies
    packageJson = packageJsonManager.ensurePostinstallDependency(packageJson);
    
    await packageJsonManager.write(projectDir, packageJson);
    filesModified.push('package.json');
  }

  // Note: Plugin setup will be handled by the postinstall hook

  // Success!
  const actionTaken = alreadyHasUEPMPlugins ? 'reinitialized' : 'initialized';
  let message = warningPrefix + `Successfully ${actionTaken} project for NPM plugin support!\n\n`;
  
  // List files that were changed
  if (filesCreated.length > 0) {
    message += `Files created:\n${filesCreated.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (filesModified.length > 0) {
    message += `Files modified:\n${filesModified.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  message += `Next steps:\n1. Run 'npm install' to install dependencies\n2. Install Unreal Engine plugins via NPM (e.g., 'npm install @uepm/example-plugin')\n3. Open your project in Unreal Engine`;
  
  return {
    success: true,
    message,
    context: 'project',
    filesCreated,
    filesModified,
  };
}
