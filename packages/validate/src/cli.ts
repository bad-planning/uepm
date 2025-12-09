#!/usr/bin/env node

import { validate } from './index';

/**
 * Main CLI entry point for validation hook
 */
async function main() {
  const projectDir = process.cwd();

  try {
    const result = await validate(projectDir);

    // Display warnings for incompatible plugins
    if (result.warnings.length > 0) {
      console.log('\n' + result.warnings.join('\n\n'));
      console.log('');
    }

    // Exit with success (warnings are non-blocking)
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Validation error: ${error.message}`);
    }
    process.exit(0); // Non-blocking, exit with success
  }
}

main();
