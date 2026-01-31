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

// Platform list for help text
const PLATFORM_HELP = `
Supported Platforms:
  L2 (Skills + Hooks):
    claude-code   Claude Code / Claude Desktop
    cursor        Cursor Editor
  L1 (Skills only):
    kilocode      Kilocode
    opencode      OpenCode
    codex         Codex CLI
`;

const program = new Command();

program
  .name('discuss-for-specs')
  .description(`Cross-platform skills and hooks installer for AI assistants.
${PLATFORM_HELP}
Examples:
  $ discuss-for-specs install                  # Auto-detect platform
  $ discuss-for-specs install -p cursor        # Install for Cursor
  $ discuss-for-specs install -p kilocode      # Install for Kilocode (L1)
  $ discuss-for-specs platforms                # Show all platforms
  $ discuss-for-specs uninstall                # Remove installation`)
  .version(packageJson.version, '-v, --version', 'Show version number')
  .option('--no-color', 'Disable colored output')
  .addHelpText('after', `
More info:
  GitHub:  https://github.com/vibe-x-ai/skill-discuss-for-specs
  L2 platforms support auto-reminder via hooks
  L1 platforms provide discussion skills without auto-reminder`);

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
  .option('-p, --platform <platform>', 'Target platform (claude-code, cursor, kilocode, opencode, codex)')
  .option('-t, --target <dir>', 'Target project directory (default: global installation)')
  .option('--skip-hooks', 'Skip hooks installation (L2 platforms only)')
  .option('--skip-skills', 'Skip skills installation')
  .option('-y, --yes', 'Skip confirmation prompts')
  .addHelpText('after', `
Platform Options:
  L2 Platforms (with hooks - auto-reminder support):
    claude-code   ~/.claude/skills/
    cursor        ~/.cursor/skills/

  L1 Platforms (skills only - manual precipitation):
    kilocode      ~/.kilocode/skills/
    opencode      ~/.opencode/skill/
    codex         ~/.codex/skills/

Examples:
  $ discuss-for-specs install                    # Auto-detect platform
  $ discuss-for-specs install -p claude-code     # Install for Claude Code
  $ discuss-for-specs install -p kilocode        # Install for Kilocode
  $ discuss-for-specs install -t ./my-project    # Install to project directory`)
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
  .option('-p, --platform <platform>', 'Target platform (claude-code, cursor, kilocode, opencode, codex)')
  .option('--keep-hooks', 'Keep hooks but remove skills')
  .option('--keep-skills', 'Keep skills but remove hooks')
  .option('-y, --yes', 'Skip confirmation prompts')
  .addHelpText('after', `
Examples:
  $ discuss-for-specs uninstall                  # Auto-detect and uninstall
  $ discuss-for-specs uninstall -p cursor        # Uninstall from Cursor
  $ discuss-for-specs uninstall --keep-hooks     # Remove skills only`)
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
  .alias('list')
  .description('List all supported platforms and their detection status')
  .addHelpText('after', `
This command shows:
  - All supported platforms (L1 and L2)
  - Whether each platform is detected on your system
  - Configuration directory locations`)
  .action(() => {
    listPlatforms();
  });

// Status command (alias for platforms with more detail)
program
  .command('status')
  .description('Show installation status for all platforms')
  .action(() => {
    listPlatforms({ showStatus: true });
  });

program.parse();
