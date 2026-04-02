import type { DebugQaReplayAutoPlaySpeedKey, StripCalibrationPresetKey } from '../gameScene.stateTypes';
import {
  bindHudElements as bindHudElementsFromHud,
  clearHudElementBindings as clearHudElementBindingsFromHud,
} from './hudBindings';
import {
  bindHudEventListeners as bindHudEventListenersFromHud,
  unbindHudEventListeners as unbindHudEventListenersFromHud,
} from './hudEventLifecycle';
import { resetHudTeardownState as resetHudTeardownStateFromHud } from './hudTeardownState';
import { createHudTemplate as createHudTemplateFromHud } from './hudTemplate';

type Destroyable = {
  destroy(): void;
};

type RemovableTimer = {
  remove(dispatchCallback?: boolean): void;
};

export type HudSceneSetupOptions = {
  heroAppearanceOptions: Array<{ key: string; label: string }>;
  debugQaEnabled: boolean;
  debugQaStatePresetOptions: Array<{ key: string; label: string }>;
  debugQaQuestStatusOptions: Array<{ key: string; label: string }>;
  debugQaPresetOptions: Array<{ key: string; label: string }>;
  debugQaReplayAutoPlaySpeedOptions: Array<{ key: DebugQaReplayAutoPlaySpeedKey; label: string }>;
  debugQaRecapOutcomeFilterOptions: Array<{ key: string; label: string }>;
  stripCalibrationEnabled: boolean;
  stripCalibrationPresets: ReadonlyArray<{ key: StripCalibrationPresetKey; label: string }>;
};

export type HudSceneLifecycleLike = {
  hudRoot: HTMLElement | null;
  debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  stripCalibrationPreset: StripCalibrationPresetKey;
  debugQaReplayAutoPlaySpeedSelect: HTMLSelectElement | null;
  debugQaStripCalibrationSelect: HTMLSelectElement | null;
  debugQaRecapOutcomeFilterSelect: HTMLSelectElement | null;
  debugQaRecapEnemyFilterInput: HTMLInputElement | null;
  debugQaScriptEnemyFilterInput: HTMLInputElement | null;
  debugQaScriptIntentFilterInput: HTMLInputElement | null;
  debugQaImportFileInput: HTMLInputElement | null;
  heroProfileNameInput: HTMLInputElement | null;
  heroProfileAppearanceSelect: HTMLSelectElement | null;
  farmSeedSelect: HTMLSelectElement | null;
  onDebugQaReplayAutoPlaySpeedChange: () => void;
  onDebugQaStripCalibrationChange: () => void;
  onDebugQaFilterInputChange: () => void;
  onDebugQaImportFileChange: (event: Event) => void;
  onHeroProfileNameInput: () => void;
  onHeroProfileAppearanceChange: () => void;
  onFarmSeedSelectionChange: () => void;
  onHudClick: (event: MouseEvent) => void;
  playerStripActionTimer: RemovableTimer | null;
  playerStripAccentTimer: RemovableTimer | null;
  player: { clearTint(): void } | null;
  farmSceneBackground: Destroyable | null;
  farmSceneStaticLabels: Destroyable[];
  sceneObstacleColliders: Destroyable[];
  sceneObstacles: Destroyable[];
  readStoredDebugQaReplayAutoPlaySpeed(): DebugQaReplayAutoPlaySpeedKey;
  readStoredStripCalibrationPreset(): StripCalibrationPresetKey;
  syncDebugQaFiltersToInputs(): void;
  syncHudSceneMode(): void;
  updateHud(): void;
  stopDebugQaStepReplay(restoreBaseline: boolean): void;
  stopEnemyHudStripPlayback(): void;
  clearEnemyHudStripOverride(): void;
  resetGamepadInputState(): void;
  clearFarmSceneVisuals(): void;
  clearVillageSceneVisuals(): void;
};

function bindHudEvents(scene: HudSceneLifecycleLike): void {
  bindHudEventListenersFromHud({
    debugQaReplayAutoPlaySpeedSelect: scene.debugQaReplayAutoPlaySpeedSelect,
    debugQaStripCalibrationSelect: scene.debugQaStripCalibrationSelect,
    debugQaRecapOutcomeFilterSelect: scene.debugQaRecapOutcomeFilterSelect,
    debugQaRecapEnemyFilterInput: scene.debugQaRecapEnemyFilterInput,
    debugQaScriptEnemyFilterInput: scene.debugQaScriptEnemyFilterInput,
    debugQaScriptIntentFilterInput: scene.debugQaScriptIntentFilterInput,
    debugQaImportFileInput: scene.debugQaImportFileInput,
    heroProfileNameInput: scene.heroProfileNameInput,
    heroProfileAppearanceSelect: scene.heroProfileAppearanceSelect,
    farmSeedSelect: scene.farmSeedSelect,
    onDebugQaReplayAutoPlaySpeedChange: scene.onDebugQaReplayAutoPlaySpeedChange,
    onDebugQaStripCalibrationChange: scene.onDebugQaStripCalibrationChange,
    onDebugQaFilterInputChange: scene.onDebugQaFilterInputChange,
    onDebugQaImportFileChange: scene.onDebugQaImportFileChange,
    onHeroProfileNameInput: scene.onHeroProfileNameInput,
    onHeroProfileAppearanceChange: scene.onHeroProfileAppearanceChange,
    onFarmSeedSelectionChange: scene.onFarmSeedSelectionChange,
  });
}

function unbindHudEvents(scene: HudSceneLifecycleLike): void {
  unbindHudEventListenersFromHud({
    debugQaReplayAutoPlaySpeedSelect: scene.debugQaReplayAutoPlaySpeedSelect,
    debugQaStripCalibrationSelect: scene.debugQaStripCalibrationSelect,
    debugQaRecapOutcomeFilterSelect: scene.debugQaRecapOutcomeFilterSelect,
    debugQaRecapEnemyFilterInput: scene.debugQaRecapEnemyFilterInput,
    debugQaScriptEnemyFilterInput: scene.debugQaScriptEnemyFilterInput,
    debugQaScriptIntentFilterInput: scene.debugQaScriptIntentFilterInput,
    debugQaImportFileInput: scene.debugQaImportFileInput,
    heroProfileNameInput: scene.heroProfileNameInput,
    heroProfileAppearanceSelect: scene.heroProfileAppearanceSelect,
    farmSeedSelect: scene.farmSeedSelect,
    onDebugQaReplayAutoPlaySpeedChange: scene.onDebugQaReplayAutoPlaySpeedChange,
    onDebugQaStripCalibrationChange: scene.onDebugQaStripCalibrationChange,
    onDebugQaFilterInputChange: scene.onDebugQaFilterInputChange,
    onDebugQaImportFileChange: scene.onDebugQaImportFileChange,
    onHeroProfileNameInput: scene.onHeroProfileNameInput,
    onHeroProfileAppearanceChange: scene.onHeroProfileAppearanceChange,
    onFarmSeedSelectionChange: scene.onFarmSeedSelectionChange,
  });
}

export function setupHudForScene(scene: HudSceneLifecycleLike, options: HudSceneSetupOptions): void {
  scene.hudRoot = document.getElementById('hud-root');
  if (!scene.hudRoot) {
    throw new Error('HUD root not found. Expected #hud-root in index.html.');
  }

  scene.hudRoot.innerHTML = createHudTemplateFromHud({
    heroAppearanceOptions: options.heroAppearanceOptions,
    debugQaEnabled: options.debugQaEnabled,
    debugQaStatePresetOptions: options.debugQaStatePresetOptions,
    debugQaQuestStatusOptions: options.debugQaQuestStatusOptions,
    debugQaPresetOptions: options.debugQaPresetOptions,
    debugQaReplayAutoPlaySpeedOptions: options.debugQaReplayAutoPlaySpeedOptions,
    debugQaRecapOutcomeFilterOptions: options.debugQaRecapOutcomeFilterOptions,
    stripCalibrationEnabled: options.stripCalibrationEnabled,
    stripCalibrationPresets: options.stripCalibrationPresets,
  });
  bindHudElementsFromHud(scene as unknown as Record<string, unknown>, scene.hudRoot);
  scene.debugQaReplayAutoPlaySpeed = scene.readStoredDebugQaReplayAutoPlaySpeed();
  scene.stripCalibrationPreset = scene.readStoredStripCalibrationPreset();
  if (scene.debugQaReplayAutoPlaySpeedSelect) {
    scene.debugQaReplayAutoPlaySpeedSelect.value = scene.debugQaReplayAutoPlaySpeed;
  }
  if (scene.debugQaStripCalibrationSelect) {
    scene.debugQaStripCalibrationSelect.value = scene.stripCalibrationPreset;
  }
  scene.syncDebugQaFiltersToInputs();
  bindHudEvents(scene);
  scene.hudRoot.addEventListener('click', scene.onHudClick);
  scene.syncHudSceneMode();
  scene.updateHud();
}

export function teardownHudForScene(scene: HudSceneLifecycleLike): void {
  scene.stopDebugQaStepReplay(false);

  if (scene.playerStripActionTimer) {
    scene.playerStripActionTimer.remove(false);
    scene.playerStripActionTimer = null;
  }
  if (scene.playerStripAccentTimer) {
    scene.playerStripAccentTimer.remove(false);
    scene.playerStripAccentTimer = null;
  }
  if (scene.player) {
    scene.player.clearTint();
  }
  scene.stopEnemyHudStripPlayback();
  scene.clearEnemyHudStripOverride();
  scene.resetGamepadInputState();
  scene.clearFarmSceneVisuals();
  scene.clearVillageSceneVisuals();

  if (scene.farmSceneBackground) {
    scene.farmSceneBackground.destroy();
    scene.farmSceneBackground = null;
  }
  for (const label of scene.farmSceneStaticLabels) {
    label.destroy();
  }
  scene.farmSceneStaticLabels = [];

  for (const collider of scene.sceneObstacleColliders) {
    collider.destroy();
  }
  scene.sceneObstacleColliders = [];
  for (const obstacle of scene.sceneObstacles) {
    obstacle.destroy();
  }
  scene.sceneObstacles = [];

  unbindHudEvents(scene);

  if (scene.hudRoot) {
    scene.hudRoot.removeEventListener('click', scene.onHudClick);
    scene.hudRoot.innerHTML = '';
    scene.hudRoot = null;
  }

  clearHudElementBindingsFromHud(scene as unknown as Record<string, unknown>);
  resetHudTeardownStateFromHud(scene);
}
