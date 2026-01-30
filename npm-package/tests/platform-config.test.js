/**
 * Tests for src/platform-config.js
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir, homedir } from 'os';

import {
  PLATFORMS,
  detectPlatform,
  getPlatformConfig,
  getSkillsDir,
  getSettingsPath,
  platformSupportsStopHook,
} from '../src/platform-config.js';


describe('PLATFORMS constant', () => {
  test('contains claude-code configuration', () => {
    assert.ok(PLATFORMS['claude-code']);
    assert.strictEqual(PLATFORMS['claude-code'].name, 'Claude Code');
    assert.strictEqual(PLATFORMS['claude-code'].configDir, '.claude');
    assert.strictEqual(PLATFORMS['claude-code'].hooksFormat, 'claude-code');
  });

  test('contains cursor configuration', () => {
    assert.ok(PLATFORMS['cursor']);
    assert.strictEqual(PLATFORMS['cursor'].name, 'Cursor');
    assert.strictEqual(PLATFORMS['cursor'].configDir, '.cursor');
    assert.strictEqual(PLATFORMS['cursor'].hooksFormat, 'cursor');
  });
});


describe('getPlatformConfig', () => {
  test('returns config for valid platform', () => {
    const config = getPlatformConfig('claude-code');
    assert.strictEqual(config.name, 'Claude Code');
  });

  test('throws error for unknown platform', () => {
    assert.throws(() => {
      getPlatformConfig('unknown-platform');
    }, /Unknown platform/);
  });
});


describe('detectPlatform', () => {
  // Note: This test depends on actual home directory state
  // In a real test environment, we would mock the home directory
  
  test('returns array of detected platforms', () => {
    const detected = detectPlatform();
    assert.ok(Array.isArray(detected));
  });
});


describe('getSkillsDir', () => {
  test('returns global skills path for claude-code', () => {
    const result = getSkillsDir('claude-code');
    const home = homedir();
    assert.strictEqual(result, join(home, '.claude', 'skills'));
  });

  test('returns global skills path for cursor', () => {
    const result = getSkillsDir('cursor');
    const home = homedir();
    assert.strictEqual(result, join(home, '.cursor', 'skills'));
  });

  test('returns project-level skills path when target provided', () => {
    const targetDir = '/my/project';
    const result = getSkillsDir('claude-code', targetDir);
    assert.strictEqual(result, join(targetDir, '.claude', 'skills'));
  });
});


describe('getSettingsPath', () => {
  test('returns correct path for claude-code', () => {
    const result = getSettingsPath('claude-code');
    const home = homedir();
    assert.strictEqual(result, join(home, '.claude', 'settings.json'));
  });

  test('returns correct path for cursor', () => {
    const result = getSettingsPath('cursor');
    const home = homedir();
    assert.strictEqual(result, join(home, '.cursor', 'hooks.json'));
  });
});


describe('platformSupportsStopHook', () => {
  test('returns true for claude-code (L2 platform)', () => {
    assert.strictEqual(platformSupportsStopHook('claude-code'), true);
  });

  test('returns true for cursor (L2 platform)', () => {
    assert.strictEqual(platformSupportsStopHook('cursor'), true);
  });

  test('returns false for unknown platform (assumed L1)', () => {
    // Unknown platforms should be treated as L1 (no stop hook support)
    assert.strictEqual(platformSupportsStopHook('kilocode'), false);
    assert.strictEqual(platformSupportsStopHook('codex-cli'), false);
  });
});
