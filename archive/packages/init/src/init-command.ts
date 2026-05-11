import { Command } from './command-registry';
import { init, InitOptions } from './index';
import { UEPMError, formatErrorMessage } from '@uepm/core';

/**
 * Init command implementation
 */
export class InitCommand implements Command {
  name = 'init';
  description = 'Initialize Unreal Engine project or plugin for NPM package management';

  async execute(_args: string[], options: Record<string, any>): Promise<number> {
    const initOptions: InitOptions = {
      projectDir: options.projectDir || process.cwd(),
      force: options.force || false,
    };

    try {
      const result = await init(initOptions);
      console.log(result.message);
      return result.success ? 0 : 1;
    } catch (error) {
      // Handle UEPMError with proper formatting and exit codes
      if (error instanceof UEPMError) {
        const formatted = formatErrorMessage(error.toErrorMessage());
        console.error(formatted);
        return error.exitCode;
      }
      
      // Handle other errors
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}`);
      return 1;
    }
  }
}
