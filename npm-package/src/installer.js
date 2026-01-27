/**
 * Installation and uninstallation logic
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

/**
 * List supported platforms
 */
export function listPlatforms() {
  console.log('\nSupported Platforms:\n');
  
  const detected = detectPlatform();
  
  for (const [id, config] of Object.entries(PLATFORMS)) {
    const status = detected.includes(id) ? '✓ detected' : '○ not found';
    console.log(`  ${config.name} (${id})`);
    console.log(`    Status: ${status}`);
    console.log(`    Config: ~/${config.configDir}/`);
    console.log('');
  }
}

/**
 * Install skills and hooks
 * 
 * @param {Object} options - Install options
 */
export async function install(options = {}) {
  console.log('\n📦 discuss-skills installer\n');

  // 1. Check Python environment
  console.log('Checking Python environment...');
  const pythonCheck = await checkPythonEnvironment();
  
  if (!pythonCheck.success) {
    throw new Error('Python environment check failed. Please install Python 3 and PyYAML.');
  }
  console.log('');

  // 2. Detect or validate platform
  let targetPlatform = options.platform;
  
  if (!targetPlatform) {
    const detected = detectPlatform();
    
    if (detected.length === 0) {
      throw new Error(
        'No supported platform detected. Please install Claude Code or Cursor first, ' +
        'or specify a platform with --platform.'
      );
    }
    
    if (detected.length === 1) {
      targetPlatform = detected[0];
      console.log(`Detected platform: ${PLATFORMS[targetPlatform].name}`);
    } else {
      // Multiple platforms detected, ask user or use first
      console.log('Multiple platforms detected:');
      detected.forEach(p => console.log(`  - ${PLATFORMS[p].name}`));
      console.log(`\nUsing first detected: ${PLATFORMS[detected[0]].name}`);
      console.log('(Use --platform to specify a different one)\n');
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
      throw new Error(`Target directory does not exist: ${targetDir}`);
    }
    
    console.log(`\nInstalling for ${platformConfig.name} (project-level)...`);
    console.log(`Target: ${targetDir}\n`);
  } else {
    console.log(`\nInstalling for ${platformConfig.name} (global)...\n`);
  }

  // 4. Get package root (where dist/ and hooks/ are)
  const packageRoot = getPackageRoot();
  
  // 5. Install Skills (unless skipped)
  if (!options.skipSkills) {
    console.log('Installing Skills...');
    
    const distDir = join(packageRoot, 'dist', targetPlatform);
    const skillsDir = getSkillsDir(targetPlatform, targetDir);
    
    if (!existsSync(distDir)) {
      console.warn(`  ⚠ No pre-built skills found for ${targetPlatform}`);
    } else {
      ensureDirectory(skillsDir);
      
      // Copy each skill
      const skills = ['discuss-coordinator', 'discuss-output'];
      for (const skill of skills) {
        const srcSkill = join(distDir, skill);
        const destSkill = join(skillsDir, skill);
        
        if (existsSync(srcSkill)) {
          copyDirectory(srcSkill, destSkill);
          console.log(`  ✓ Installed ${skill}`);
        }
      }
    }
    console.log('');
  }

  // 6. Install Hooks (unless skipped) - hooks are always global
  if (!options.skipHooks) {
    console.log('Installing Hooks...');
    
    if (targetDir) {
      console.log('  (Hooks are installed globally, not in project directory)');
    }
    
    const srcHooks = join(packageRoot, 'hooks');
    const destHooks = getHooksDir();
    
    if (!existsSync(srcHooks)) {
      throw new Error(`Hooks source not found: ${srcHooks}`);
    }
    
    // Copy hooks to config directory
    copyDirectory(srcHooks, destHooks);
    console.log(`  ✓ Copied hooks to ${destHooks}`);
    
    // Create logs directory
    const logsDir = getLogsDir();
    ensureDirectory(logsDir);
    console.log(`  ✓ Created logs directory: ${logsDir}`);
    
    // Configure platform hooks
    console.log('');
    console.log('Configuring platform hooks...');
    installHooksConfig(targetPlatform);
    console.log('');
  }

  // 7. Done
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ Installation complete!');
  console.log('');
  console.log('Installed components:');
  if (!options.skipSkills) {
    console.log(`  • Skills: ${getSkillsDir(targetPlatform, targetDir)}`);
  }
  if (!options.skipHooks) {
    console.log(`  • Hooks: ${getHooksDir()}`);
    console.log(`  • Logs: ${getLogsDir()}`);
  }
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Open ${platformConfig.name}`);
  if (targetDir) {
    console.log(`  2. Open project: ${targetDir}`);
    console.log('  3. Start a discussion with your AI assistant');
    console.log('  4. The hooks will automatically track and remind you to update docs');
  } else {
    console.log('  2. Start a discussion with your AI assistant');
    console.log('  3. The hooks will automatically track and remind you to update docs');
  }
  console.log('');
}

/**
 * Uninstall skills and hooks
 * 
 * @param {Object} options - Uninstall options
 */
export async function uninstall(options = {}) {
  console.log('\n📦 discuss-skills uninstaller\n');

  // 1. Detect or validate platform
  let targetPlatform = options.platform;
  
  if (!targetPlatform) {
    const detected = detectPlatform();
    
    if (detected.length === 0) {
      console.log('No supported platform detected.');
      return;
    }
    
    targetPlatform = detected[0];
    console.log(`Detected platform: ${PLATFORMS[targetPlatform].name}`);
  }

  const platformConfig = getPlatformConfig(targetPlatform);
  console.log(`\nUninstalling from ${platformConfig.name}...\n`);

  // 2. Remove Skills
  if (!options.keepSkills) {
    console.log('Removing Skills...');
    
    const skillsDir = getSkillsDir(targetPlatform);
    const skills = ['discuss-coordinator', 'discuss-output'];
    
    for (const skill of skills) {
      const skillPath = join(skillsDir, skill);
      if (existsSync(skillPath)) {
        removeDirectory(skillPath);
        console.log(`  ✓ Removed ${skill}`);
      }
    }
    console.log('');
  }

  // 3. Remove Hooks
  if (!options.keepHooks) {
    console.log('Removing Hooks...');
    
    const hooksDir = getHooksDir();
    if (existsSync(hooksDir)) {
      removeDirectory(hooksDir);
      console.log(`  ✓ Removed ${hooksDir}`);
    }
    
    // Remove hooks from platform config
    console.log('');
    console.log('Removing platform hooks configuration...');
    removeHooksConfig(targetPlatform);
    console.log('');
  }

  // 4. Done
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ Uninstallation complete!');
  console.log('');
  console.log('Note: Logs directory was preserved: ~/.discuss-for-specs/logs/');
  console.log('      Delete it manually if you want to remove all data.');
  console.log('');
}
