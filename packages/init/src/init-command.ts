import { Command } from './command-registry';
import { init, InitOptions } from './index';

/**
 * Init command implementation
 */
export class InitCommand implements Command {
  name = 'init';
  description = 'Initialize Unreal Engine project for NPM plugin support';

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
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}`);
      return 1;
    }
  }
}
