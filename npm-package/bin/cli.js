#!/usr/bin/env node

/**
 * discuss-skills CLI
 * 
 * Cross-platform skills and hooks installer for AI assistants.
 * 
 * Usage:
 *   npx discuss-skills install [--platform <platform>]
 *   npx discuss-skills uninstall [--platform <platform>]
 *   npx discuss-skills platforms
 *   npx discuss-skills --version
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { install, uninstall, listPlatforms } from '../src/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('discuss-skills')
  .description('Cross-platform skills and hooks installer for AI assistants')
  .version(packageJson.version)
  .option('--no-color', 'Disable colored output');

// Handle --no-color before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    // Disable chalk colors
    chalk.level = 0;
  }
});

// Install command
program
  .command('install')
  .description('Install skills and hooks to your environment')
  .option('-p, --platform <platform>', 'Target platform (claude-code, cursor)')
  .option('-t, --target <dir>', 'Target project directory (default: current directory)')
  .option('--skip-hooks', 'Skip hooks installation')
  .option('--skip-skills', 'Skip skills installation')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (options) => {
    try {
      await install(options);
    } catch (err) {
      console.error(`\n${chalk.red('✖')} ${chalk.bold('Installation failed:')} ${err.message}`);
      process.exit(1);
    }
  });

// Uninstall command
program
  .command('uninstall')
  .description('Remove skills and hooks from your environment')
  .option('-p, --platform <platform>', 'Target platform (claude-code, cursor)')
  .option('--keep-hooks', 'Keep hooks but remove skills')
  .option('--keep-skills', 'Keep skills but remove hooks')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (options) => {
    try {
      await uninstall(options);
    } catch (err) {
      console.error(`\n${chalk.red('✖')} ${chalk.bold('Uninstallation failed:')} ${err.message}`);
      process.exit(1);
    }
  });

// Platforms command
program
  .command('platforms')
  .description('List supported platforms')
  .action(() => {
    listPlatforms();
  });

program.parse();
