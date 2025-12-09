#!/usr/bin/env node

import { Command } from 'commander';
import { CommandRegistry } from './command-registry';
import { InitCommand } from './init-command';

/**
 * Main CLI entry point
 */
async function main() {
  const program = new Command();
  const registry = new CommandRegistry();

  // Register commands
  registry.register(new InitCommand());

  // Configure the CLI
  program
    .name('uepm-init')
    .description('UEPM - Unreal Engine Package Manager')
    .version('0.1.0')
    .configureHelp({
      sortSubcommands: true,
    });

  // Add init command
  const initCmd = registry.get('init');
  if (initCmd) {
    program
      .command('init')
      .description(initCmd.description)
      .option('-f, --force', 'Force reinitialization even if already initialized')
      .option('-d, --project-dir <path>', 'Project directory (defaults to current directory)')
      .action(async (options) => {
        const exitCode = await initCmd.execute([], options);
        process.exit(exitCode);
      });
  }

  // Add force and project-dir options to default action
  program
    .option('-f, --force', 'Force reinitialization even if already initialized')
    .option('-d, --project-dir <path>', 'Project directory (defaults to current directory)');

  // Handle invalid commands
  program.on('command:*', (operands) => {
    console.error(`Error: Unknown command '${operands[0]}'`);
    console.error('');
    const availableCommands = registry.getNames();
    if (availableCommands.length > 0) {
      console.error('Available commands:');
      availableCommands.forEach((name) => {
        const cmd = registry.get(name);
        if (cmd) {
          console.error(`  ${name} - ${cmd.description}`);
        }
      });
    }
    console.error('');
    console.error('Run with --help for more information');
    process.exit(1);
  });

  // Parse arguments
  await program.parseAsync(process.argv);

  // Default action (when no command is specified, run init)
  // This runs after parsing if no command was matched
  if (program.args.length === 0 || !registry.has(program.args[0])) {
    // Check if there are any non-option arguments
    const nonOptionArgs = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
    
    if (nonOptionArgs.length > 0 && nonOptionArgs[0] !== 'init') {
      // Unknown command was provided
      console.error(`Error: Unknown command '${nonOptionArgs[0]}'`);
      console.error('');
      const availableCommands = registry.getNames();
      if (availableCommands.length > 0) {
        console.error('Available commands:');
        availableCommands.forEach((name) => {
          const cmd = registry.get(name);
          if (cmd) {
            console.error(`  ${name} - ${cmd.description}`);
          }
        });
      }
      console.error('');
      console.error('Run with --help for more information');
      process.exit(1);
    }
    
    // No command specified, run init as default
    if (nonOptionArgs.length === 0) {
      const initCmd = registry.get('init');
      if (initCmd) {
        const options = program.opts();
        const exitCode = await initCmd.execute([], options);
        process.exit(exitCode);
      }
    }
  }
}

main().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
