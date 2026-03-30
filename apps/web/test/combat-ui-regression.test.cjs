'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const gameScenePath = join(__dirname, '..', 'src', 'game', 'scenes', 'GameScene.ts');
const stylesPath = join(__dirname, '..', 'src', 'styles.css');

const gameSceneSource = readFileSync(gameScenePath, 'utf8');
const stylesSource = readFileSync(stylesPath, 'utf8');

test('combat HUD keeps all expected action buttons', () => {
  const requiredActions = ['attack', 'defend', 'fireball', 'rally', 'sunder', 'mend', 'cleanse', 'interrupt'];
  for (const action of requiredActions) {
    assert.equal(
      gameSceneSource.includes(`data-combat-action="${action}"`),
      true,
      `missing combat action button: ${action}`,
    );
  }
});

test('enemy telegraph keeps current and next intent fields', () => {
  assert.equal(gameSceneSource.includes('data-hud="combatEnemyIntent"'), true);
  assert.equal(gameSceneSource.includes('data-hud="combatEnemyIntentNext"'), true);
  assert.equal(gameSceneSource.includes('renderCombatEnemyTelegraphs()'), true);
});

test('combat HUD exposes telemetry field and renderer hook', () => {
  assert.equal(gameSceneSource.includes('data-hud="combatTelemetry"'), true);
  assert.equal(gameSceneSource.includes("setHudText('combatTelemetry', this.getCombatTelemetryLabel())"), true);
  assert.equal(gameSceneSource.includes('private getCombatTelemetryLabel(): string'), true);
});

test('combat intent mapping still covers critical scripted intents', () => {
  const requiredIntents = ['root_smash', 'cinder_burst', 'molten_shell', 'iron_recenter', 'null_sigil', 'cataclysm_ray'];
  for (const intent of requiredIntents) {
    assert.equal(gameSceneSource.includes(`case '${intent}':`), true, `missing intent mapping for: ${intent}`);
  }
});

test('combat effect chip styles keep tone variants', () => {
  const requiredToneSelectors = ['calm', 'warning', 'danger', 'utility'];
  for (const tone of requiredToneSelectors) {
    assert.equal(
      stylesSource.includes(`.combat-effect-chip[data-effect-tone="${tone}"]`),
      true,
      `missing chip tone style: ${tone}`,
    );
  }
});
