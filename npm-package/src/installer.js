/**
 * Installation and uninstallation logic
 */

import { existsSync } from 'fs';
import { join } from 'path';

import {
  checkPythonEnvironment,
  copyDirectory,
  removeDirectory,
  ensureDirectory,
  getHooksDir,
  getLogsDir,
  getPackageRoot
} from './utils.js';

import {
  PLATFORMS,
  detectPlatform,
  getPlatformConfig,
  getSkillsDir,
  installHooksConfig,
  removeHooksConfig
} from './platform-config.js';

import {
  showBanner,
  createSpinner,
  success,
  error,
  info,
  warning,
  newline,
  showCompletionBox,
  showUninstallBox,
  colors
} from './ui.js';

/**
 * List supported platforms
 */
export function listPlatforms() {
  newline();
  console.log(colors.bold('Supported Platforms:'));
  newline();
  
  const detected = detectPlatform();
  
  for (const [id, config] of Object.entries(PLATFORMS)) {
    const status = detected.includes(id) 
      ? colors.success('✓ detected') 
      : colors.dim('○ not found');
    console.log(`  ${colors.bold(config.name)} ${colors.dim(`(${id})`)}`);
    console.log(`    Status: ${status}`);
    console.log(`    Config: ${colors.dim(`~/${config.configDir}/`)}`);
    newline();
  }
}

/**
 * Install skills and hooks
 * 
 * @param {Object} options - Install options
 */
export async function install(options = {}) {
  // Show banner
  showBanner();

  // 1. Check Python environment
  let spinner = createSpinner('Checking Python environment...');
  spinner.start();
  
  const pythonCheck = await checkPythonEnvironment();
  
  if (!pythonCheck.success) {
    spinner.fail('Python environment check failed');
    error(
      'Python 3 is required but was not found',
      'brew install python3  # macOS\nsudo apt install python3  # Ubuntu'
    );
    throw new Error('Python environment check failed. Please install Python 3 and PyYAML.');
  }
  spinner.succeed('Python environment OK');

  // 2. Detect or validate platform
  let targetPlatform = options.platform;
  
  if (!targetPlatform) {
    const detected = detectPlatform();
    
    if (detected.length === 0) {
      error(
        'No supported platform detected',
        'Install Claude Code or Cursor first, or use --platform flag'
      );
      throw new Error(
        'No supported platform detected. Please install Claude Code or Cursor first, ' +
        'or specify a platform with --platform.'
      );
    }
    
    if (detected.length === 1) {
      targetPlatform = detected[0];
      info(`Detected platform: ${colors.bold(PLATFORMS[targetPlatform].name)}`);
    } else {
      // Multiple platforms detected, ask user or use first
      info('Multiple platforms detected:');
      detected.forEach(p => console.log(`  ${colors.dim('•')} ${PLATFORMS[p].name}`));
      newline();
      info(`Using: ${colors.bold(PLATFORMS[detected[0]].name)}`);
      console.log(colors.dim('  (Use --platform to specify a different one)'));
      targetPlatform = detected[0];
    }
  }

  const platformConfig = getPlatformConfig(targetPlatform);
  
  // 3. Handle target directory for project-level installation
  let targetDir = null;
  if (options.target) {
    const { resolve } = await import('path');
    targetDir = resolve(options.target.replace(/^~/, process.env.HOME || ''));
    
    if (!existsSync(targetDir)) {
      error(`Target directory does not exist: ${targetDir}`);
      throw new Error(`Target directory does not exist: ${targetDir}`);
    }
    
    newline();
    info(`Installing for ${colors.bold(platformConfig.name)} (project-level)`);
    console.log(colors.dim(`  Target: ${targetDir}`));
  } else {
    newline();
    info(`Installing for ${colors.bold(platformConfig.name)} (global)`);
  }

  // 4. Get package root (where dist/ and hooks/ are)
  const packageRoot = getPackageRoot();
  
  // 5. Install Skills (unless skipped)
  if (!options.skipSkills) {
    newline();
    spinner = createSpinner('Installing Skills...');
    spinner.start();
    
    const distDir = join(packageRoot, 'dist', targetPlatform);
    const skillsDir = getSkillsDir(targetPlatform, targetDir);
    
    if (!existsSync(distDir)) {
      spinner.warn(`No pre-built skills found for ${targetPlatform}`);
    } else {
      ensureDirectory(skillsDir);
      
      // Copy each skill
      const skills = ['discuss-coordinator', 'discuss-output'];
      const installedSkills = [];
      
      for (const skill of skills) {
        const srcSkill = join(distDir, skill);
        const destSkill = join(skillsDir, skill);
        
        if (existsSync(srcSkill)) {
          copyDirectory(srcSkill, destSkill);
          installedSkills.push(skill);
        }
      }
      
      spinner.succeed('Skills installed');
      installedSkills.forEach(skill => success(skill, true));
    }
  }

  // 6. Install Hooks (unless skipped) - hooks are always global
  if (!options.skipHooks) {
    newline();
    spinner = createSpinner('Installing Hooks...');
    spinner.start();
    
    if (targetDir) {
      spinner.text = 'Installing Hooks (global)...';
    }
    
    const srcHooks = join(packageRoot, 'hooks');
    const destHooks = getHooksDir();
    
    if (!existsSync(srcHooks)) {
      spinner.fail('Hooks source not found');
      throw new Error(`Hooks source not found: ${srcHooks}`);
    }
    
    // Copy hooks to config directory
    copyDirectory(srcHooks, destHooks);
    
    // Create logs directory
    const logsDir = getLogsDir();
    ensureDirectory(logsDir);
    
    spinner.succeed('Hooks installed');
    success(`Copied to ${destHooks}`, true);
    success(`Logs directory: ${logsDir}`, true);
    
    // Configure platform hooks
    newline();
    spinner = createSpinner('Configuring platform hooks...');
    spinner.start();
    installHooksConfig(targetPlatform);
    spinner.succeed('Platform hooks configured');
  }

  // 7. Done - show completion box
  const components = [];
  if (!options.skipSkills) {
    components.push(`Skills: ${getSkillsDir(targetPlatform, targetDir)}`);
  }
  if (!options.skipHooks) {
    components.push(`Hooks: ${getHooksDir()}`);
    components.push(`Logs: ${getLogsDir()}`);
  }
  
  const nextSteps = [`Open ${platformConfig.name}`];
  if (targetDir) {
    nextSteps.push(`Open project: ${targetDir}`);
  }
  nextSteps.push('Start a discussion with your AI assistant');
  nextSteps.push('The hooks will automatically track your progress');
  
  showCompletionBox({ components, nextSteps });
}

/**
 * Uninstall skills and hooks
 * 
 * @param {Object} options - Uninstall options
 */
export async function uninstall(options = {}) {
  // Show banner
  showBanner();

  // 1. Detect or validate platform
  let targetPlatform = options.platform;
  
  if (!targetPlatform) {
    const detected = detectPlatform();
    
    if (detected.length === 0) {
      warning('No supported platform detected');
      return;
    }
    
    targetPlatform = detected[0];
    info(`Detected platform: ${colors.bold(PLATFORMS[targetPlatform].name)}`);
  }

  const platformConfig = getPlatformConfig(targetPlatform);
  newline();
  info(`Uninstalling from ${colors.bold(platformConfig.name)}...`);

  // 2. Remove Skills
  if (!options.keepSkills) {
    newline();
    let spinner = createSpinner('Removing Skills...');
    spinner.start();
    
    const skillsDir = getSkillsDir(targetPlatform);
    const skills = ['discuss-coordinator', 'discuss-output'];
    const removedSkills = [];
    
    for (const skill of skills) {
      const skillPath = join(skillsDir, skill);
      if (existsSync(skillPath)) {
        removeDirectory(skillPath);
        removedSkills.push(skill);
      }
    }
    
    if (removedSkills.length > 0) {
      spinner.succeed('Skills removed');
      removedSkills.forEach(skill => success(skill, true));
    } else {
      spinner.info('No skills to remove');
    }
  }

  // 3. Remove Hooks
  if (!options.keepHooks) {
    newline();
    let spinner = createSpinner('Removing Hooks...');
    spinner.start();
    
    const hooksDir = getHooksDir();
    if (existsSync(hooksDir)) {
      removeDirectory(hooksDir);
      spinner.succeed('Hooks removed');
      success(hooksDir, true);
    } else {
      spinner.info('No hooks to remove');
    }
    
    // Remove hooks from platform config
    newline();
    spinner = createSpinner('Removing platform hooks configuration...');
    spinner.start();
    removeHooksConfig(targetPlatform);
    spinner.succeed('Platform hooks configuration removed');
  }

  // 4. Done
  showUninstallBox(
    'Uninstallation complete!',
    'Note: Logs directory was preserved at ~/.discuss-for-specs/logs/\nDelete it manually if you want to remove all data.'
  );
}
