#!/usr/bin/env node

import { init } from './index';

async function main() {
  const args = process.argv.slice(2);
  
  // Parse simple flags
  const force = args.includes('--force') || args.includes('-f');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(`
UEPM Init - Initialize Unreal Engine projects for NPM plugin support

Usage:
  npx @uepm/init [options]

Options:
  --force, -f    Force reinitialization even if already initialized
  --help, -h     Show this help message

Description:
  This command configures your Unreal Engine project to use plugins
  distributed via NPM. It will:
  
  1. Add 'node_modules' to AdditionalPluginDirectories in your .uproject file
  2. Create or update package.json with the validation postinstall hook
  3. Add @uepm/validate as a dev dependency

Example:
  cd /path/to/your/unreal/project
  npx @uepm/init
`);
    process.exit(0);
  }
  
  const result = await init({ force });
  
  console.log(result.message);
  
  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
