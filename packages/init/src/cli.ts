#!/usr/bin/env node

import { Command } from 'commander';
import { init, InitOptions } from './index';
import { UEPMError, formatErrorMessage } from '@uepm/core';

/**
 * Main CLI entry point - simplified to just run init
 */
async function main() {
  const program = new Command();

  // Configure the CLI
  program
    .name('uepm-init')
    .description('Initialize Unreal Engine project for NPM plugin support')
    .version('0.1.0')
    .option('-f, --force', 'Force reinitialization even if already initialized')
    .option('-d, --project-dir <path>', 'Project directory (defaults to current directory)')
    .action(async (options) => {
      const initOptions: InitOptions = {
        projectDir: options.projectDir || process.cwd(),
        force: options.force || false,
      };

      try {
        const result = await init(initOptions);
        console.log(result.message);
        process.exit(result.success ? 0 : 1);
      } catch (error) {
        // Handle UEPMError with proper formatting and exit codes
        if (error instanceof UEPMError) {
          const formatted = formatErrorMessage(error.toErrorMessage());
          console.error(formatted);
          process.exit(error.exitCode);
        }
        
        // Handle other errors
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    });

  // Parse arguments
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
