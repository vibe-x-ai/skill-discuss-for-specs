/**
 * Build script for discuss-skills npm package
 * 
 * This script:
 * 1. Copies hooks from project root to npm-package/hooks/
 * 2. Builds Skills for each platform from skills/ and platforms/ directories
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const PROJECT_ROOT = join(__dirname, '..');  // npm-package directory
const REPO_ROOT = join(__dirname, '..', '..');  // Repository root
const SKILLS_SRC = join(REPO_ROOT, 'skills');
const PLATFORMS_DIR = join(REPO_ROOT, 'platforms');
const HOOKS_SRC = join(REPO_ROOT, 'hooks');
const HOOKS_DEST = join(PROJECT_ROOT, 'hooks');
const DIST_DIR = join(PROJECT_ROOT, 'dist');

// Platforms to build for
const PLATFORMS = ['claude-code', 'cursor', 'kilocode', 'opencode', 'codex'];

// L1 platforms (Skills only, need L1 guidance appended)
const L1_PLATFORMS = ['kilocode', 'opencode', 'codex'];

// Skills to build (merged into single discuss-for-specs as per D7)
const SKILLS = ['discuss-for-specs'];

/**
 * Copy hooks from repository to npm package
 */
function copyHooks() {
  console.log('📁 Copying hooks...');
  
  if (!existsSync(HOOKS_SRC)) {
    console.error(`  ❌ Hooks source not found: ${HOOKS_SRC}`);
    process.exit(1);
  }
  
  // Copy entire hooks directory
  cpSync(HOOKS_SRC, HOOKS_DEST, { recursive: true, force: true });
  
  // Remove old post-response hooks if present (we use new structure now)
  const oldHooksDir = join(HOOKS_DEST, 'post-response');
  if (existsSync(oldHooksDir)) {
    console.log('  Skipping old post-response hooks (keeping for reference)');
  }
  
  console.log(`  ✓ Copied hooks to ${HOOKS_DEST}`);
}

/**
 * Build a single skill for a platform
 * 
 * @param {string} skillName - Skill name
 * @param {string} platform - Platform name
 */
function buildSkill(skillName, platform) {
  const skillSrc = join(SKILLS_SRC, skillName);
  const headerFile = join(skillSrc, 'headers', `${platform}.yaml`);
  const skillMd = join(skillSrc, 'SKILL.md');
  const l1GuidanceFile = join(skillSrc, 'references', 'l1-guidance.md');
  
  if (!existsSync(skillMd)) {
    console.error(`  ❌ SKILL.md not found: ${skillMd}`);
    return false;
  }
  
  // Read SKILL.md content
  let skillContent = readFileSync(skillMd, 'utf-8');
  
  // Read header if exists
  let header = '';
  if (existsSync(headerFile)) {
    const headerYaml = readFileSync(headerFile, 'utf-8').trim();
    // Check if header already has frontmatter delimiters
    if (headerYaml.startsWith('---')) {
      // Header already has frontmatter, use as-is
      header = headerYaml + '\n\n';
    } else {
      // Add frontmatter delimiters
      header = `---\n${headerYaml}\n---\n\n`;
    }
  }
  
  // Combine header and content
  let finalContent = header + skillContent;
  
  // For L1 platforms, append L1 guidance (no hooks, user must self-check)
  if (L1_PLATFORMS.includes(platform) && existsSync(l1GuidanceFile)) {
    const l1Guidance = readFileSync(l1GuidanceFile, 'utf-8');
    finalContent += '\n\n---\n\n' + l1Guidance;
  }
  
  // Create output directory
  const outputDir = join(DIST_DIR, platform, skillName);
  mkdirSync(outputDir, { recursive: true });
  
  // Write final SKILL.md
  const outputFile = join(outputDir, 'SKILL.md');
  writeFileSync(outputFile, finalContent, 'utf-8');
  
  // Copy references directory if exists (exclude l1-guidance.md as it's already appended)
  const refsDir = join(skillSrc, 'references');
  if (existsSync(refsDir)) {
    const refsDestDir = join(outputDir, 'references');
    mkdirSync(refsDestDir, { recursive: true });
    
    // Copy each file except l1-guidance.md
    const refFiles = readdirSync(refsDir);
    for (const file of refFiles) {
      if (file !== 'l1-guidance.md') {
        cpSync(join(refsDir, file), join(refsDestDir, file), { recursive: true });
      }
    }
  }
  
  return true;
}

/**
 * Build all skills for all platforms
 */
function buildSkills() {
  console.log('\n📦 Building skills...');
  
  // Create dist directory
  mkdirSync(DIST_DIR, { recursive: true });
  
  // L2 platforms
  console.log('\n  ═══ L2 Platforms (Skills + Hooks) ═══');
  for (const platform of PLATFORMS.filter(p => !L1_PLATFORMS.includes(p))) {
    console.log(`\n  Building for ${platform}...`);
    
    for (const skill of SKILLS) {
      const success = buildSkill(skill, platform);
      if (success) {
        console.log(`    ✓ ${skill}`);
      } else {
        console.log(`    ✗ ${skill} (failed)`);
      }
    }
  }
  
  // L1 platforms
  console.log('\n  ═══ L1 Platforms (Skills only) ═══');
  for (const platform of L1_PLATFORMS) {
    console.log(`\n  Building for ${platform}...`);
    
    for (const skill of SKILLS) {
      const success = buildSkill(skill, platform);
      if (success) {
        console.log(`    ✓ ${skill} (with L1 guidance)`);
      } else {
        console.log(`    ✗ ${skill} (failed)`);
      }
    }
  }
}

/**
 * Copy config files
 */
function copyConfig() {
  console.log('\n📋 Copying config...');
  
  const configSrc = join(REPO_ROOT, 'config');
  const configDest = join(PROJECT_ROOT, 'config');
  
  if (existsSync(configSrc)) {
    cpSync(configSrc, configDest, { recursive: true, force: true });
    console.log(`  ✓ Copied config to ${configDest}`);
  }
}

/**
 * Main build function
 */
function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Building discuss-skills npm package');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  copyHooks();
  buildSkills();
  copyConfig();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Build complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
