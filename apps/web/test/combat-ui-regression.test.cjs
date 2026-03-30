'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const gameScenePath = join(__dirname, '..', 'src', 'game', 'scenes', 'GameScene.ts');
const bootScenePath = join(__dirname, '..', 'src', 'game', 'scenes', 'BootScene.ts');
const stylesPath = join(__dirname, '..', 'src', 'styles.css');

const gameSceneSource = readFileSync(gameScenePath, 'utf8');
const bootSceneSource = readFileSync(bootScenePath, 'utf8');
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

test('combat HUD exposes enemy sprite visual wiring', () => {
  assert.equal(gameSceneSource.includes('data-hud="combatEnemyStrip"'), true);
  assert.equal(gameSceneSource.includes('data-hud="combatEnemySprite"'), true);
  assert.equal(gameSceneSource.includes('data-hud="combatEnemySpriteFallback"'), true);
  assert.equal(gameSceneSource.includes('private renderCombatEnemySprite(): void'), true);
  assert.equal(gameSceneSource.includes('private getCombatEnemyPortraitPath(enemyKey: string): string | null'), true);
  assert.equal(gameSceneSource.includes('private startEnemyHudStripPlayback('), true);
  assert.equal(gameSceneSource.includes('private getEnemyHudStripPreferredAnimation(): StripAnimationName'), true);
  assert.equal(stylesSource.includes('.combat-enemy-visual'), true);
  assert.equal(stylesSource.includes('.combat-enemy-strip'), true);
  assert.equal(stylesSource.includes('.combat-enemy-visual img[data-visual-type="portrait"]'), true);
});

test('debug QA exposes local JSON trace export wiring', () => {
  assert.equal(gameSceneSource.includes('data-debug-action="export-trace"'), true);
  assert.equal(gameSceneSource.includes('async exportDebugQaTrace(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private buildDebugQaTracePayload(): DebugQaTracePayload'), true);
  assert.equal(gameSceneSource.includes('private downloadJsonFile(filename: string, payload: unknown): void'), true);
});

test('debug QA exposes trace import and replay wiring', () => {
  assert.equal(gameSceneSource.includes('data-debug-action="import-trace"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-start"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-next"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-autoplay"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-stop"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaReplayAutoPlaySpeed"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaImportFile"'), true);
  assert.equal(gameSceneSource.includes('private triggerDebugQaTraceImport(): void'), true);
  assert.equal(gameSceneSource.includes('private replayImportedDebugQaTrace(): void'), true);
  assert.equal(gameSceneSource.includes('private startDebugQaStepReplay(): void'), true);
  assert.equal(gameSceneSource.includes('private advanceDebugQaStepReplay(): void'), true);
  assert.equal(gameSceneSource.includes('private toggleDebugQaStepReplayAutoPlay(): void'), true);
  assert.equal(gameSceneSource.includes('private stopDebugQaStepReplayAutoPlay(updateHud: boolean): void'), true);
  assert.equal(gameSceneSource.includes('private stopDebugQaStepReplay(restoreBaseline: boolean): void'), true);
});

test('staging strip calibration preset wiring exists', () => {
  assert.equal(gameSceneSource.includes('data-hud="debugQaStripCalibrationPreset"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="apply-strip-calibration"'), true);
  assert.equal(gameSceneSource.includes('private applyStripCalibrationPreset(): void'), true);
  assert.equal(gameSceneSource.includes('private getActiveStripCalibrationPreset(): StripCalibrationPreset | null'), true);
  assert.equal(gameSceneSource.includes('private refreshStripCalibrationRuntime(): void'), true);
});

test('strip runtime animation wiring exists for player and boss assets', () => {
  assert.equal(bootSceneSource.includes("this.load.spritesheet('player-hero-strip'"), true);
  assert.equal(bootSceneSource.includes("this.load.spritesheet('enemy-thorn-beast-alpha-strip'"), true);
  assert.equal(gameSceneSource.includes('private ensureStripAnimations(strip: SpriteManifestStripEntry): void'), true);
  assert.equal(gameSceneSource.includes('private playPlayerStripAnimation(animation: StripAnimationName, force = false): void'), true);
  assert.equal(gameSceneSource.includes('private playPlayerCombatActionAnimation(action: CombatActionName): void'), true);
  assert.equal(gameSceneSource.includes('private getStripPlayerTimings(strip: SpriteManifestStripEntry | null): {'), true);
  assert.equal(gameSceneSource.includes('private getStripHudTimings(strip: SpriteManifestStripEntry | null): {'), true);
  assert.equal(gameSceneSource.includes('private resolveTimingValue(value: number | undefined, fallback: number, min: number, max: number): number'), true);
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

test('debug QA export button keeps dedicated styling', () => {
  assert.equal(stylesSource.includes('.hud-debug-qa-button.export'), true);
});
