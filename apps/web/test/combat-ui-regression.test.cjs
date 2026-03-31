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
  assert.equal(gameSceneSource.includes('data-hud="combatRecap"'), true);
  assert.equal(gameSceneSource.includes("setHudText('combatTelemetry', this.getCombatTelemetryLabel())"), true);
  assert.equal(gameSceneSource.includes("setHudText('combatRecap', this.getCombatRecapLabel())"), true);
  assert.equal(gameSceneSource.includes('private getCombatRecapLabel(): string'), true);
  assert.equal(gameSceneSource.includes('private getCombatTelemetryLabel(): string'), true);
});

test('combat HUD exposes enemy sprite visual wiring', () => {
  assert.equal(gameSceneSource.includes('data-hud="combatEnemyStrip"'), true);
  assert.equal(gameSceneSource.includes('data-hud="combatEnemySprite"'), true);
  assert.equal(gameSceneSource.includes('data-hud="combatEnemySpriteFallback"'), true);
  assert.equal(gameSceneSource.includes('private renderCombatEnemySprite(): void'), true);
  assert.equal(
    gameSceneSource.includes('private getCombatEnemyPortraitPath(enemyKey: string, animation: StripAnimationName): string | null'),
    true,
  );
  assert.equal(gameSceneSource.includes('private resolvePortraitEntryPath('), true);
  assert.equal(
    gameSceneSource.includes("private toPortraitStateKey(animation: StripAnimationName): SpriteManifestPortraitState"),
    true,
  );
  assert.equal(gameSceneSource.includes('private startEnemyHudStripPlayback('), true);
  assert.equal(gameSceneSource.includes('private getEnemyHudStripPreferredAnimation(): StripAnimationName'), true);
  assert.equal(gameSceneSource.includes("image.dataset.visualState = ''"), true);
  assert.equal(stylesSource.includes('.combat-enemy-visual'), true);
  assert.equal(stylesSource.includes('.combat-enemy-strip'), true);
  assert.equal(stylesSource.includes('.combat-enemy-visual img[data-visual-type="portrait"]'), true);
});

test('debug QA exposes local JSON trace export wiring', () => {
  assert.equal(gameSceneSource.includes('data-debug-action="export-trace"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="export-markdown"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaRecapOutcomeFilter"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaRecapEnemyFilter"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaScriptEnemyFilter"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaScriptIntentFilter"'), true);
  assert.equal(gameSceneSource.includes('async exportDebugQaTrace(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private async exportDebugQaMarkdownReport(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private buildDebugQaTracePayload(): DebugQaTracePayload'), true);
  assert.equal(gameSceneSource.includes('private buildDebugQaMarkdownReport(timestamp: string): string'), true);
  assert.equal(gameSceneSource.includes('private buildDebugQaMarkdownFilename(timestamp: string): string'), true);
  assert.equal(gameSceneSource.includes('private syncDebugQaFiltersFromInputs(): void'), true);
  assert.equal(gameSceneSource.includes('private syncDebugQaFiltersToInputs(): void'), true);
  assert.equal(
    gameSceneSource.includes('private doesCombatStateMatchRecapFilters(snapshot: CombatEncounterState | null): boolean'),
    true,
  );
  assert.equal(
    gameSceneSource.includes('private filterCombatDebugReference(reference: CombatDebugReference): CombatDebugReference'),
    true,
  );
  assert.equal(gameSceneSource.includes('private downloadJsonFile(filename: string, payload: unknown): void'), true);
  assert.equal(
    gameSceneSource.includes(
      "private downloadTextFile(filename: string, contents: string, contentType = 'text/plain;charset=utf-8'): void",
    ),
    true,
  );
});

test('debug QA exposes trace import and replay wiring', () => {
  assert.equal(gameSceneSource.includes('data-debug-action="import-trace"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-start"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-next"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-autoplay"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="replay-trace-step-stop"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="load-scripted-intents"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaScriptedIntents"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaReplayAutoPlaySpeed"'), true);
  assert.equal(gameSceneSource.includes('data-hud="debugQaImportFile"'), true);
  assert.equal(gameSceneSource.includes('private triggerDebugQaTraceImport(): void'), true);
  assert.equal(gameSceneSource.includes('private replayImportedDebugQaTrace(): void'), true);
  assert.equal(gameSceneSource.includes('private startDebugQaStepReplay(): void'), true);
  assert.equal(gameSceneSource.includes('private advanceDebugQaStepReplay(): void'), true);
  assert.equal(gameSceneSource.includes('private toggleDebugQaStepReplayAutoPlay(): void'), true);
  assert.equal(gameSceneSource.includes('private stopDebugQaStepReplayAutoPlay(updateHud: boolean): void'), true);
  assert.equal(gameSceneSource.includes('private stopDebugQaStepReplay(restoreBaseline: boolean): void'), true);
  assert.equal(gameSceneSource.includes('private async loadCombatDebugScriptedIntents(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private formatCombatDebugScriptedIntentsReference(reference: CombatDebugReference): string'), true);
  assert.equal(gameSceneSource.includes('private readStoredDebugQaReplayAutoPlaySpeed(): DebugQaReplayAutoPlaySpeedKey'), true);
  assert.equal(gameSceneSource.includes('private persistDebugQaReplayAutoPlaySpeed(speed: DebugQaReplayAutoPlaySpeedKey): void'), true);
  assert.equal(gameSceneSource.includes('DEBUG_QA_REPLAY_AUTOPLAY_SPEED_STORAGE_KEY'), true);
});

test('staging strip calibration preset wiring exists', () => {
  assert.equal(gameSceneSource.includes('data-hud="debugQaStripCalibrationPreset"'), true);
  assert.equal(gameSceneSource.includes('data-debug-action="apply-strip-calibration"'), true);
  assert.equal(gameSceneSource.includes('private applyStripCalibrationPreset(): void'), true);
  assert.equal(gameSceneSource.includes('private getActiveStripCalibrationPreset(): StripCalibrationPreset | null'), true);
  assert.equal(gameSceneSource.includes('private refreshStripCalibrationRuntime(): void'), true);
  assert.equal(gameSceneSource.includes('private readStoredStripCalibrationPreset(): StripCalibrationPresetKey'), true);
  assert.equal(gameSceneSource.includes('private persistStripCalibrationPreset(preset: StripCalibrationPresetKey): void'), true);
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
  assert.equal(stylesSource.includes('.hud-debug-qa-button.export.markdown'), true);
  assert.equal(stylesSource.includes('.hud-debug-qa-reference'), true);
  assert.equal(stylesSource.includes('.hud-debug-qa-reference-filters'), true);
  assert.equal(stylesSource.includes('.hud-debug-qa-reference-output'), true);
});

test('hero profile creation panel exposes expected controls and wiring', () => {
  assert.equal(gameSceneSource.includes('data-hud="heroProfileSummary"'), true);
  assert.equal(gameSceneSource.includes('data-hud="heroProfileName"'), true);
  assert.equal(gameSceneSource.includes('data-hud="heroProfileAppearance"'), true);
  assert.equal(gameSceneSource.includes('data-profile-action="save"'), true);
  assert.equal(gameSceneSource.includes('private async refreshHeroProfileState(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private async saveHeroProfile(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private updateHeroProfileHud(): void'), true);
  assert.equal(gameSceneSource.includes('private normalizeHeroProfilePayload(payload: unknown): HeroProfileState | null'), true);
  assert.equal(stylesSource.includes('.hud-hero-profile'), true);
  assert.equal(stylesSource.includes('.hud-hero-profile-field'), true);
  assert.equal(stylesSource.includes('.hud-hero-profile-button'), true);
});

test('HUD gamepad first-pass controls keep wiring and focus styles', () => {
  assert.equal(gameSceneSource.includes('GAMEPAD_BUTTON_A = 0'), true);
  assert.equal(gameSceneSource.includes('GAMEPAD_BUTTON_DPAD_UP = 12'), true);
  assert.equal(gameSceneSource.includes('private updateGamepadInput(): void'), true);
  assert.equal(gameSceneSource.includes('private handleGamepadCombatShortcuts(justPressedButtons: Set<number>): void'), true);
  assert.equal(gameSceneSource.includes('private moveGamepadHudFocus(step: number): void'), true);
  assert.equal(gameSceneSource.includes('private activateFocusedGamepadHudElement(): boolean'), true);
  assert.equal(gameSceneSource.includes("Manette: D-pad/LB/RB navigue HUD, A valide, X Attack, Y Defend, B Fireball."), true);
  assert.equal(stylesSource.includes('.hud-panel [data-gamepad-focused="1"]'), true);
});

test('intro narrative panel wiring exists for lot 85', () => {
  assert.equal(gameSceneSource.includes('data-hud="introSummary"'), true);
  assert.equal(gameSceneSource.includes('data-hud="introNarrative"'), true);
  assert.equal(gameSceneSource.includes('data-hud="introHint"'), true);
  assert.equal(gameSceneSource.includes('data-hud="introProgress"'), true);
  assert.equal(gameSceneSource.includes('data-intro-action="advance"'), true);
  assert.equal(gameSceneSource.includes('private updateIntroHud(): void'), true);
  assert.equal(gameSceneSource.includes('private async advanceIntroNarrative(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private normalizeGameplayIntroPayload(payload: unknown): IntroNarrativeState | null'), true);
  assert.equal(stylesSource.includes('.hud-intro'), true);
  assert.equal(stylesSource.includes('.hud-intro-button'), true);
});

test('village NPC state panel wiring exists for lot 86', () => {
  assert.equal(gameSceneSource.includes('data-hud="villageNpcSummary"'), true);
  assert.equal(gameSceneSource.includes('data-hud="villageNpcMayor"'), true);
  assert.equal(gameSceneSource.includes('data-hud="villageNpcBlacksmith"'), true);
  assert.equal(gameSceneSource.includes('data-hud="villageNpcMerchant"'), true);
  assert.equal(gameSceneSource.includes('private updateVillageNpcHud(): void'), true);
  assert.equal(gameSceneSource.includes('private normalizeVillageNpcEntry(payload: unknown): VillageNpcHudEntry | null'), true);
  assert.equal(stylesSource.includes('.hud-village-npcs'), true);
  assert.equal(stylesSource.includes('.hud-village-npc-line'), true);
});

test('village NPC relationship panel wiring exists for lot 94', () => {
  assert.equal(gameSceneSource.includes('data-hud="villageNpcError"'), true);
  assert.equal(gameSceneSource.includes('data-village-npc-action="talk"'), true);
  assert.equal(gameSceneSource.includes("await this.fetchJson('/gameplay/village/npc/interact'"), true);
  assert.equal(gameSceneSource.includes('private async interactVillageNpc(npcKey: VillageNpcKey): Promise<void>'), true);
  assert.equal(
    gameSceneSource.includes('private normalizeVillageNpcRelationshipEntry(payload: unknown): VillageNpcRelationshipHudEntry | null'),
    true,
  );
  assert.equal(gameSceneSource.includes('private updateVillageNpcTalkButton('), true);
  assert.equal(gameSceneSource.includes('private formatVillageRelationshipTierLabel(tier: VillageNpcRelationshipTier): string'), true);
  assert.equal(stylesSource.includes('.hud-village-npc-actions'), true);
  assert.equal(stylesSource.includes('.hud-village-npc-button'), true);
  assert.equal(stylesSource.includes('.hud-village-npc-error'), true);
});

test('village market panel wiring exists for lot 87', () => {
  assert.equal(gameSceneSource.includes('data-hud="villageMarketSummary"'), true);
  assert.equal(gameSceneSource.includes('data-hud="villageMarketError"'), true);
  assert.equal(gameSceneSource.includes('data-hud="villageMarketSeedOffers"'), true);
  assert.equal(gameSceneSource.includes('data-hud="villageMarketBuybackOffers"'), true);
  assert.equal(gameSceneSource.includes("buyButton.dataset.marketAction = 'buy-seed'"), true);
  assert.equal(gameSceneSource.includes("sellButton.dataset.marketAction = 'sell-crop'"), true);
  assert.equal(gameSceneSource.includes('private updateVillageMarketHud(): void'), true);
  assert.equal(gameSceneSource.includes('private renderVillageMarketOffers(): void'), true);
  assert.equal(gameSceneSource.includes('private getVillageMarketSummaryLabel(): string'), true);
  assert.equal(
    gameSceneSource.includes('private normalizeVillageMarketPayload(payload: unknown): {'),
    true,
  );
  assert.equal(gameSceneSource.includes('private async refreshVillageMarketState(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private async buyVillageSeedOffer(offerKey: string): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private async sellVillageCrop(itemKey: string): Promise<void>'), true);
  assert.equal(stylesSource.includes('.hud-village-market'), true);
  assert.equal(stylesSource.includes('.hud-village-market-list'), true);
  assert.equal(stylesSource.includes('.hud-village-market-subtitle'), true);
});

test('farm panel wiring exists for lot 90', () => {
  assert.equal(gameSceneSource.includes('data-hud="farmSummary"'), true);
  assert.equal(gameSceneSource.includes('data-hud="farmSeedSelect"'), true);
  assert.equal(gameSceneSource.includes('data-hud="farmPlots"'), true);
  assert.equal(gameSceneSource.includes('data-hud="farmError"'), true);
  assert.equal(gameSceneSource.includes("plantButton.dataset.farmAction = 'plant'"), true);
  assert.equal(gameSceneSource.includes("waterButton.dataset.farmAction = 'water'"), true);
  assert.equal(gameSceneSource.includes("harvestButton.dataset.farmAction = 'harvest'"), true);
  assert.equal(gameSceneSource.includes('private updateFarmHud(): void'), true);
  assert.equal(gameSceneSource.includes('private renderFarmPanel(): void'), true);
  assert.equal(gameSceneSource.includes('private getFarmSummaryLabel(): string'), true);
  assert.equal(gameSceneSource.includes('private normalizeGameplayFarmPayload(payload: unknown): FarmState | null'), true);
  assert.equal(gameSceneSource.includes('private async plantFarmPlot(plotKey: string): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private async waterFarmPlot(plotKey: string): Promise<void>'), true);
  assert.equal(gameSceneSource.includes('private async harvestFarmPlot(plotKey: string): Promise<void>'), true);
  assert.equal(stylesSource.includes('.hud-farm'), true);
  assert.equal(stylesSource.includes('.hud-farm-plots'), true);
  assert.equal(stylesSource.includes('.farm-plot-item'), true);
  assert.equal(stylesSource.includes('.hud-farm-action'), true);
});

test('day-night cycle and sleep action wiring exists for lot 91', () => {
  assert.equal(gameSceneSource.includes('data-hud="dayPhase"'), true);
  assert.equal(gameSceneSource.includes('data-farm-action="sleep"'), true);
  assert.equal(gameSceneSource.includes('private getDayPhaseKey(): \'day\' | \'night\''), true);
  assert.equal(gameSceneSource.includes('private getDayPhaseLabel(): string'), true);
  assert.equal(gameSceneSource.includes('private updateDayPhaseVisual(): void'), true);
  assert.equal(gameSceneSource.includes('private async sleepAtFarm(): Promise<void>'), true);
  assert.equal(gameSceneSource.includes("await this.fetchJson<unknown>('/gameplay/sleep'"), true);
  assert.equal(stylesSource.includes('#game-shell[data-day-phase="night"] #game-root'), true);
  assert.equal(stylesSource.includes('.hud-farm-actions'), true);
  assert.equal(stylesSource.includes('.hud-farm-action.sleep'), true);
});

test('farm crafting panel wiring exists for lot 92', () => {
  assert.equal(gameSceneSource.includes('data-hud="farmCraftingSummary"'), true);
  assert.equal(gameSceneSource.includes('data-hud="farmCraftingRecipes"'), true);
  assert.equal(gameSceneSource.includes('data-hud="farmCraftingError"'), true);
  assert.equal(gameSceneSource.includes("craftButton.dataset.farmCraftAction = 'craft'"), true);
  assert.equal(gameSceneSource.includes('private updateFarmCraftingHud(): void'), true);
  assert.equal(gameSceneSource.includes('private renderFarmCraftingRecipes(): void'), true);
  assert.equal(gameSceneSource.includes('private getFarmCraftingSummaryLabel(): string'), true);
  assert.equal(gameSceneSource.includes('private normalizeGameplayCraftingPayload(payload: unknown): FarmCraftingState | null'), true);
  assert.equal(gameSceneSource.includes('private async craftFarmRecipe(recipeKey: string): Promise<void>'), true);
  assert.equal(gameSceneSource.includes("await this.fetchJson('/gameplay/crafting/craft'"), true);
  assert.equal(stylesSource.includes('.hud-farm-crafting'), true);
  assert.equal(stylesSource.includes('.hud-farm-crafting-list'), true);
  assert.equal(stylesSource.includes('.farm-crafting-ingredients'), true);
});
