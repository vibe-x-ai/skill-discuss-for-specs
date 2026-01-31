/**
 * Platform configuration management
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getHomeDir, getHooksDir } from './utils.js';

/**
 * Supported platforms
 */
export const PLATFORMS = {
  'claude-code': {
    name: 'Claude Code',
    configDir: '.claude',
    skillsDir: 'skills',
    settingsFile: 'settings.json',
    hooksFormat: 'claude-code',
    level: 'L2'
  },
  'cursor': {
    name: 'Cursor',
    configDir: '.cursor',
    skillsDir: 'skills',
    settingsFile: 'hooks.json',
    hooksFormat: 'cursor',
    level: 'L2'
  },
  'kilocode': {
    name: 'Kilocode',
    configDir: '.kilocode',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'opencode': {
    name: 'OpenCode',
    configDir: '.opencode',
    skillsDir: 'skill',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'codex': {
    name: 'Codex CLI',
    configDir: '.codex',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  }
};

/**
 * Detect which platform(s) are installed
 * 
 * @returns {string[]} Array of detected platform IDs
 */
export function detectPlatform() {
  const detected = [];
  const home = getHomeDir();

  for (const [id, config] of Object.entries(PLATFORMS)) {
    const configPath = join(home, config.configDir);
    if (existsSync(configPath)) {
      detected.push(id);
    }
  }

  return detected;
}

/**
 * Get platform configuration
 * 
 * @param {string} platformId - Platform ID
 * @returns {Object} Platform configuration
 */
export function getPlatformConfig(platformId) {
  const config = PLATFORMS[platformId];
  if (!config) {
    throw new Error(`Unknown platform: ${platformId}. Supported: ${Object.keys(PLATFORMS).join(', ')}`);
  }
  return config;
}

/**
 * Get the skills directory for a platform
 * 
 * @param {string} platformId - Platform ID
 * @param {string} [targetDir] - Optional target project directory for local installation
 * @returns {string} Skills directory path
 */
export function getSkillsDir(platformId, targetDir = null) {
  const config = getPlatformConfig(platformId);
  
  if (targetDir) {
    // Project-level installation: install to target/.cursor/skills or target/.claude/skills
    return join(targetDir, config.configDir, config.skillsDir);
  }
  
  // Global installation: install to ~/.cursor/skills or ~/.claude/skills
  return join(getHomeDir(), config.configDir, config.skillsDir);
}

/**
 * Get the settings file path for a platform
 * 
 * @param {string} platformId - Platform ID
 * @returns {string} Settings file path
 */
export function getSettingsPath(platformId) {
  const config = getPlatformConfig(platformId);
  return join(getHomeDir(), config.configDir, config.settingsFile);
}

/**
 * Check if platform supports stop hook (L2 capability)
 * 
 * L2 platforms (claude-code, cursor) support stop hook.
 * L1 platforms (kilocode, opencode, codex) do not have hooks.
 * 
 * @param {string} platformId - Platform ID
 * @returns {boolean} True if platform supports stop hook
 */
export function platformSupportsStopHook(platformId) {
  const config = PLATFORMS[platformId];
  return config?.level === 'L2';
}

/**
 * Generate hooks configuration for Claude Code
 */
function generateClaudeCodeHooksConfig() {
  const hooksDir = getHooksDir();
  
  return {
    Stop: [{
      matcher: "",
      hooks: [{
        type: "command",
        command: `python3 ${join(hooksDir, 'stop', 'check_precipitation.py')}`
      }]
    }]
  };
}

/**
 * Generate hooks configuration for Cursor
 */
function generateCursorHooksConfig() {
  const hooksDir = getHooksDir();
  
  return {
    version: 1,
    hooks: {
      stop: [{
        command: `python3 ${join(hooksDir, 'stop', 'check_precipitation.py')}`
      }]
    }
  };
}

/**
 * Install hooks configuration for a platform
 * 
 * @param {string} platformId - Platform ID
 * @returns {string|null} Settings path if configured, null if L1 platform (no hooks)
 */
export function installHooksConfig(platformId) {
  const config = getPlatformConfig(platformId);
  
  // L1 platforms don't have hooks support
  if (config.level === 'L1' || !config.hooksFormat) {
    return null;
  }
  
  const settingsPath = getSettingsPath(platformId);

  if (config.hooksFormat === 'claude-code') {
    // Claude Code: merge into existing settings.json
    let settings = {};
    
    if (existsSync(settingsPath)) {
      try {
        settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch (e) {
        // Silent - will create new file
      }
    }

    // Merge hooks configuration
    settings.hooks = {
      ...settings.hooks,
      ...generateClaudeCodeHooksConfig()
    };

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    // Note: caller handles the success message
    
  } else if (config.hooksFormat === 'cursor') {
    // Cursor: create/update hooks.json
    let hooksConfig = { version: 1, hooks: {} };
    
    if (existsSync(settingsPath)) {
      try {
        hooksConfig = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch (e) {
        console.warn(`Warning: Could not parse ${settingsPath}, creating new file`);
      }
    }

    const newConfig = generateCursorHooksConfig();
    hooksConfig.hooks = {
      ...hooksConfig.hooks,
      ...newConfig.hooks
    };

    writeFileSync(settingsPath, JSON.stringify(hooksConfig, null, 2), 'utf-8');
    // Note: caller handles the success message
  }
  
  return settingsPath;
}

/**
 * Remove hooks configuration for a platform
 * 
 * @param {string} platformId - Platform ID
 * @returns {string|null} Settings path if configured, null if L1 platform (no hooks)
 */
export function removeHooksConfig(platformId) {
  const config = getPlatformConfig(platformId);
  
  // L1 platforms don't have hooks support
  if (config.level === 'L1' || !config.hooksFormat) {
    return null;
  }
  
  const settingsPath = getSettingsPath(platformId);

  if (!existsSync(settingsPath)) {
    return null;
  }

  try {
    if (config.hooksFormat === 'claude-code') {
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      
      if (settings.hooks) {
        // Remove our specific hooks (those containing discuss-for-specs)
        for (const hookType of ['Stop']) {
          if (settings.hooks[hookType]) {
            settings.hooks[hookType] = settings.hooks[hookType].filter(
              h => !JSON.stringify(h).includes('discuss-for-specs')
            );
            if (settings.hooks[hookType].length === 0) {
              delete settings.hooks[hookType];
            }
          }
        }
        
        if (Object.keys(settings.hooks).length === 0) {
          delete settings.hooks;
        }
      }

      writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
      // Note: caller handles the success message
      
    } else if (config.hooksFormat === 'cursor') {
      const hooksConfig = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      
      if (hooksConfig.hooks) {
        for (const hookType of ['stop']) {
          if (hooksConfig.hooks[hookType]) {
            hooksConfig.hooks[hookType] = hooksConfig.hooks[hookType].filter(
              h => !h.command?.includes('discuss-for-specs')
            );
            if (hooksConfig.hooks[hookType].length === 0) {
              delete hooksConfig.hooks[hookType];
            }
          }
        }
      }

      writeFileSync(settingsPath, JSON.stringify(hooksConfig, null, 2), 'utf-8');
      // Note: caller handles the success message
    }
  } catch (e) {
    // Silent - caller handles errors
  }
  
  return settingsPath;
}
