#!/usr/bin/env node

// Main postinstall command that runs both setup and validation
const { runPostinstall } = require('../dist/index');

async function main() {
  const projectDir = process.cwd();
  await runPostinstall(projectDir);
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});