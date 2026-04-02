import Phaser from 'phaser';
import { API_BASE_URL } from '../../../config/env';
import {
  FARM_SCENE_PLAYER_SPAWN,
  VILLAGE_SCENE_PLAYER_SPAWN,
  VILLAGE_SCENE_ZONES,
} from './gameScene.constants';
import type {
  BlacksmithOfferState,
  FrontSceneMode,
  VillageCropBuybackOfferState,
  VillageSceneZoneConfig,
  VillageSceneZoneKey,
  VillageSceneZoneVisual,
  VillageSeedOfferState,
  VillageShopTabKey,
  VillageShopType,
} from './gameScene.types';
import {
  type FarmCraftIngredientState,
  type FarmCraftRecipeState,
  type FarmCraftingState,
  type FarmCropCatalogEntryState,
  type FarmPlotState,
  type FarmState,
  type FarmStoryEventState,
  type FarmStoryState,
  type GameplayLoopState,
  type TowerStoryEventState,
  type TowerStoryState,
} from './services/payloadNormalizers';
import {
  fetchJson as fetchJsonFromApi,
  formatRequestError as formatRequestErrorFromApi,
} from './services/apiClient';
import { createGameScenePayloadGateway } from './services/gameScenePayloadGateway';
import {
  type FarmPlotStateLike,
  formatFarmLabel as formatFarmLabelFromLogic,
  getFarmCraftingSummaryLabel as getFarmCraftingSummaryLabelFromLogic,
  getFarmFeedbackLabel as getFarmFeedbackLabelFromLogic,
  getFarmPlotByKey as getFarmPlotByKeyFromLogic,
  getFarmPlotPhase as getFarmPlotPhaseFromLogic,
  getFarmPlotPhaseLabel as getFarmPlotPhaseLabelFromLogic,
  getFarmPlotStatusLabel as getFarmPlotStatusLabelFromLogic,
  getFarmReadyPlotsLabel as getFarmReadyPlotsLabelFromLogic,
  getFarmScenePlotPalette as getFarmScenePlotPaletteFromLogic,
  getFarmScenePlotPosition as getFarmScenePlotPositionFromLogic,
  getFarmSceneSlots as getFarmSceneSlotsFromLogic,
  getFarmSlotByKey as getFarmSlotByKeyFromLogic,
  getFarmStoryNarrativeLabel as getFarmStoryNarrativeLabelFromLogic,
  getFarmStorySummaryLabel as getFarmStorySummaryLabelFromLogic,
  getFarmSummaryLabel as getFarmSummaryLabelFromLogic,
  getSelectedSeedLabel as getSelectedSeedLabelFromLogic,
  resolveSelectedFarmPlotKey as resolveSelectedFarmPlotKeyFromLogic,
} from './features/farm/farmLogic';
import { drawFarmSceneBackdrop } from './features/farm/farmSceneDecor';
import {
  createFarmActionHintLabel as createFarmActionHintLabelFromFeature,
  createFarmStaticLabels as createFarmStaticLabelsFromFeature,
} from './features/farm/farmSceneStaticDecor';
import {
  clearFarmScenePlotVisuals as clearFarmScenePlotVisualsFromFeature,
  renderFarmScenePlotVisuals as renderFarmScenePlotVisualsFromFeature,
} from './features/farm/farmSceneRenderer';
import { createFarmActionZone as createFarmActionZoneFromFeature } from './features/farm/farmSceneZones';
import { buildFarmContextViewModel as buildFarmContextViewModelFromFeature } from './features/farm/farmContextLogic';
import {
  runCraftFarmRecipeAction as runCraftFarmRecipeActionFromFeature,
  runHarvestFarmPlotAction as runHarvestFarmPlotActionFromFeature,
  runPlantFarmPlotAction as runPlantFarmPlotActionFromFeature,
  runSleepAtFarmAction as runSleepAtFarmActionFromFeature,
  runWaterFarmPlotAction as runWaterFarmPlotActionFromFeature,
} from './features/farm/farmActionHandlers';
import { resolveFarmHotkeyCommand as resolveFarmHotkeyCommandFromFeature } from './features/farm/farmHotkeyController';
import { isTypingInsideField as isTypingInsideFieldFromCommon } from './features/common/inputGuards';
import {
  activateGamepadHudElement as activateGamepadHudElementFromCommon,
  applyGamepadHudFocusState as applyGamepadHudFocusStateFromCommon,
  clearGamepadHudFocus as clearGamepadHudFocusFromCommon,
  computeGamepadNavigationStep as computeGamepadNavigationStepFromCommon,
  consumeGamepadJustPressedButtons as consumeGamepadJustPressedButtonsFromCommon,
  getGamepadHudFocusableElements as getGamepadHudFocusableElementsFromCommon,
  getPrimaryConnectedGamepad as getPrimaryConnectedGamepadFromCommon,
  getWrappedGamepadHudFocusIndex as getWrappedGamepadHudFocusIndexFromCommon,
  resolveRetainedGamepadHudFocusIndex as resolveRetainedGamepadHudFocusIndexFromCommon,
} from './features/common/gamepadHudLogic';
import { getSceneObstacleLayout as getSceneObstacleLayoutFromCommon } from './features/common/sceneObstacleLayout';
import {
  renderFarmCraftingRecipes as renderFarmCraftingRecipesFromFeature,
  renderFarmPanel as renderFarmPanelFromFeature,
} from './features/farm/farmHudRenderer';
import {
  computeCombatActionAvailability as computeCombatActionAvailabilityFromFeature,
  getPlayerCombatActionAnimation as getPlayerCombatActionAnimationFromFeature,
  validateCombatActionRequest as validateCombatActionRequestFromFeature,
} from './features/combat/combatActionLogic';
import {
  getCombatEnemyIntentUi as getCombatEnemyIntentUiFromFeature,
  getCombatIntentIconTooltip as getCombatIntentIconTooltipFromFeature,
} from './features/combat/combatIntentUiLogic';
import {
  applyEnemyHudStripFrame as applyEnemyHudStripFrameFromFeature,
  getCombatEnemyPortraitPath as getCombatEnemyPortraitPathFromFeature,
  getEnemyHudStripPreferredAnimation as getEnemyHudStripPreferredAnimationFromFeature,
  getStripFrames as getStripFramesFromFeature,
  getStripHudTimings as getStripHudTimingsFromFeature,
  getStripManifestEntry as getStripManifestEntryFromFeature,
  getStripPlayerTimings as getStripPlayerTimingsFromFeature,
  resolveTimingValue as resolveTimingValueFromFeature,
} from './features/combat/combatStripLogic';
import {
  getLoopBlockersLabel as getLoopBlockersLabelFromFeature,
  getLoopPreparationLabel as getLoopPreparationLabelFromFeature,
  getLoopSummaryLabel as getLoopSummaryLabelFromFeature,
  getLoopSuppliesLabel as getLoopSuppliesLabelFromFeature,
} from './features/combat/combatLoopHudLogic';
import { updateLoopHud as updateLoopHudFromFeature } from './features/combat/combatLoopHudRenderer';
import {
  getCombatLogsFallback as getCombatLogsFallbackFromFeature,
  renderCombatEffectChips as renderCombatEffectChipsFromFeature,
  renderCombatEnemySprite as renderCombatEnemySpriteFromFeature,
  renderCombatLogs as renderCombatLogsFromFeature,
} from './features/combat/combatHudRenderer';
import {
  getCombatBossSpecialTelemetryParts as getCombatBossSpecialTelemetryPartsFromLogic,
  getCombatEnemyEffectChips as getCombatEnemyEffectChipsFromLogic,
  getCombatEnemyValue as getCombatEnemyValueFromLogic,
  getCombatName as getCombatNameFromLogic,
  getCombatPlayerEffectChips as getCombatPlayerEffectChipsFromLogic,
  getCombatRecapLabel as getCombatRecapLabelFromLogic,
  getCombatRecapOutcomeLabel as getCombatRecapOutcomeLabelFromLogic,
  getCombatScriptFlag as getCombatScriptFlagFromLogic,
  getCombatScriptTurns as getCombatScriptTurnsFromLogic,
  getCombatStatusLabel as getCombatStatusLabelFromLogic,
  getCombatStatusTurns as getCombatStatusTurnsFromLogic,
  getCombatTelemetryLabel as getCombatTelemetryLabelFromLogic,
  getCombatTurnLabel as getCombatTurnLabelFromLogic,
  getCombatUnitValue as getCombatUnitValueFromLogic,
  hasCleanseableDebuffs as hasCleanseableDebuffsFromLogic,
  hasInterruptibleEnemyIntent as hasInterruptibleEnemyIntentFromLogic,
  isInterruptibleEnemyIntent as isInterruptibleEnemyIntentFromLogic,
  resolveCombatMessage as resolveCombatMessageFromLogic,
} from './features/combat/combatHudLogic';
import {
  getCombatEnemySpritePath as getCombatEnemySpritePathFromFeature,
  resolvePortraitEntryPath as resolvePortraitEntryPathFromFeature,
  resolveSpriteAssetPath as resolveSpriteAssetPathFromFeature,
  resolveSpriteManifest as resolveSpriteManifestFromFeature,
  toPortraitStateKey as toPortraitStateKeyFromFeature,
} from './features/combat/spriteManifestLogic';
import {
  closeVillageShopControllerPanel as closeVillageShopControllerPanelFromFeature,
  createVillageShopControllerState as createVillageShopControllerStateFromFeature,
  openVillageShopControllerPanel as openVillageShopControllerPanelFromFeature,
  resolveVillageShopController as resolveVillageShopControllerFromFeature,
  selectVillageShopControllerEntry as selectVillageShopControllerEntryFromFeature,
  setVillageShopControllerTab as setVillageShopControllerTabFromFeature,
  type VillageShopControllerResolution,
  type VillageShopControllerState,
} from './features/shops/villageShopController';
import {
  renderBlacksmithOffers as renderBlacksmithOffersFromFeature,
  renderVillageMarketOffers as renderVillageMarketOffersFromFeature,
} from './features/shops/shopHudRenderer';
import {
  getBlacksmithShopSummaryLabel as getBlacksmithShopSummaryLabelFromFeature,
  getVillageMarketSummaryLabel as getVillageMarketSummaryLabelFromFeature,
} from './features/shops/shopHudLogic';
import {
  renderVillageShopEntries as renderVillageShopEntriesFromFeature,
  renderVillageShopTabs as renderVillageShopTabsFromFeature,
  updateVillageShopDetails as updateVillageShopDetailsFromFeature,
} from './features/shops/villageShopHudRenderer';
import {
  runBuyBlacksmithOfferAction as runBuyBlacksmithOfferActionFromFeature,
  runBuyVillageSeedOfferAction as runBuyVillageSeedOfferActionFromFeature,
  runSellVillageCropAction as runSellVillageCropActionFromFeature,
} from './features/shops/shopActionHandlers';
import {
  runCaptureSaveSlotAction as runCaptureSaveSlotActionFromFeature,
  runDeleteSaveSlotAction as runDeleteSaveSlotActionFromFeature,
  runLoadSaveSlotAction as runLoadSaveSlotActionFromFeature,
  runRestoreAutoSaveToSlotAction as runRestoreAutoSaveToSlotActionFromFeature,
} from './features/saves/saveActionHandlers';
import {
  renderAutoSaveActions as renderAutoSaveActionsFromFeature,
  renderSaveSlotsList as renderSaveSlotsListFromFeature,
  updateAutoSaveHud as updateAutoSaveHudFromFeature,
  updateSaveSlotsHud as updateSaveSlotsHudFromFeature,
} from './features/saves/saveHudRenderer';
import {
  computeAutoSaveRenderSignature as computeAutoSaveRenderSignatureFromFeature,
  computeSaveSlotsRenderSignature as computeSaveSlotsRenderSignatureFromFeature,
  getAutoSaveMetaLabel as getAutoSaveMetaLabelFromFeature,
  getAutoSaveSummaryLabel as getAutoSaveSummaryLabelFromFeature,
  getSafeSlotStates as getSafeSlotStatesFromFeature,
  getSaveSlotEquipmentPreviewLabel as getSaveSlotEquipmentPreviewLabelFromFeature,
  getSaveSlotInventoryPreviewLabel as getSaveSlotInventoryPreviewLabelFromFeature,
  getSaveSlotMetaLabel as getSaveSlotMetaLabelFromFeature,
  getSaveSlotsSummaryLabel as getSaveSlotsSummaryLabelFromFeature,
  getSaveSlotStatsPreviewLabel as getSaveSlotStatsPreviewLabelFromFeature,
  hasExistingSaveSlot as hasExistingSaveSlotFromFeature,
} from './features/saves/saveHudLogic';
import {
  formatVillageNpcStateLabel as formatVillageNpcStateLabelFromLogic,
  formatVillageRelationshipTierLabel as formatVillageRelationshipTierLabelFromLogic,
  getBlacksmithContextDialogue as getBlacksmithContextDialogueFromLogic,
  getMayorContextDialogue as getMayorContextDialogueFromLogic,
  getMerchantContextDialogue as getMerchantContextDialogueFromLogic,
  getVillageInteractionFeedbackLabel as getVillageInteractionFeedbackLabelFromLogic,
  getVillageNpcCooldownDialogue as getVillageNpcCooldownDialogueFromLogic,
  getVillageNpcDialogueLabel as getVillageNpcDialogueLabelFromLogic,
  getVillageNpcDisplayName as getVillageNpcDisplayNameFromLogic,
  getVillageNpcEntryLabel as getVillageNpcEntryLabelFromLogic,
  getVillageNpcSummaryLabel as getVillageNpcSummaryLabelFromLogic,
  getVillageNpcUnavailableDialogue as getVillageNpcUnavailableDialogueFromLogic,
  getVillageObjectiveLabel as getVillageObjectiveLabelFromLogic,
  getVillageSecondaryDialogue as getVillageSecondaryDialogueFromLogic,
  getVillageZoneInteractionState as getVillageZoneInteractionStateFromLogic,
  getVillageZoneStateColor as getVillageZoneStateColorFromLogic,
  getVillageZoneStateLabel as getVillageZoneStateLabelFromLogic,
} from './features/village/villageLogic';
import { drawVillageSceneBackdrop } from './features/village/villageSceneDecor';
import {
  createVillageActionHintLabel as createVillageActionHintLabelFromFeature,
  createVillageStaticLabels as createVillageStaticLabelsFromFeature,
} from './features/village/villageSceneStaticDecor';
import {
  clearVillageSceneZoneVisuals as clearVillageSceneZoneVisualsFromFeature,
  renderVillageSceneZoneVisuals as renderVillageSceneZoneVisualsFromFeature,
} from './features/village/villageSceneRenderer';
import {
  buildVillageRenderSignature as buildVillageRenderSignatureFromFeature,
  ensureVillageSelectedZoneKey as ensureVillageSelectedZoneKeyFromFeature,
  getCycledVillageZoneKey as getCycledVillageZoneKeyFromFeature,
  getNearestVillageZoneKey as getNearestVillageZoneKeyFromFeature,
  getVillageZoneByKey as getVillageZoneByKeyFromFeature,
} from './features/village/villageSceneSelection';
import { createVillageActionZone as createVillageActionZoneFromFeature } from './features/village/villageSceneZones';
import { updateVillageContextPanel as updateVillageContextPanelFromFeature } from './features/village/villageContextHudRenderer';
import { buildVillageInteractionPlan as buildVillageInteractionPlanFromFeature } from './features/village/villageInteractionController';
import {
  getBlacksmithStatusLabel as getBlacksmithStatusLabelFromVillageHud,
  getDayPhaseKey as getDayPhaseKeyFromVillageHud,
  getDayPhaseLabel as getDayPhaseLabelFromVillageHud,
} from './features/village/villageHudParsers';
import {
  getHeroAppearanceLabel as getHeroAppearanceLabelFromIntro,
  getHeroProfileSummaryLabel as getHeroProfileSummaryLabelFromIntro,
  getIntroAdvanceButtonLabel as getIntroAdvanceButtonLabelFromIntro,
  getIntroHintLabel as getIntroHintLabelFromIntro,
  getIntroNarrativeLabel as getIntroNarrativeLabelFromIntro,
  getIntroProgressLabel as getIntroProgressLabelFromIntro,
  getIntroSummaryLabel as getIntroSummaryLabelFromIntro,
} from './features/intro/introLogic';
import {
  runAdvanceIntroNarrativeAction as runAdvanceIntroNarrativeActionFromFeature,
  runSaveHeroProfileAction as runSaveHeroProfileActionFromFeature,
} from './features/intro/introActionHandlers';
import {
  updateHeroProfileHud as updateHeroProfileHudFromFeature,
  updateIntroHud as updateIntroHudFromFeature,
} from './features/intro/introHudRenderer';
import {
  getQuestStatusLabel as getQuestStatusLabelFromFeature,
  getQuestSummaryLabel as getQuestSummaryLabelFromFeature,
} from './features/quests/questHudLogic';
import { renderQuestList as renderQuestListFromFeature } from './features/quests/questHudRenderer';
import {
  buildDebugQaMarkdownFilename as buildDebugQaMarkdownFilenameFromDebugQa,
  buildDebugQaMarkdownReport as buildDebugQaMarkdownReportFromDebugQa,
  buildDebugQaTraceFilename as buildDebugQaTraceFilenameFromDebugQa,
  doesCombatStateMatchRecapFilters as doesCombatStateMatchRecapFiltersFromDebugQa,
  downloadJsonFile as downloadJsonFileFromDebugQa,
  downloadTextFile as downloadTextFileFromDebugQa,
  filterCombatDebugReference as filterCombatDebugReferenceFromDebugQa,
  formatApplyStatePresetSuccess as formatApplyStatePresetSuccessFromDebugQa,
  formatCombatDebugScriptedIntentsReference as formatCombatDebugScriptedIntentsReferenceFromDebugQa,
  formatSetQuestStatusSuccess as formatSetQuestStatusSuccessFromDebugQa,
  formatSetWorldFlagsSuccess as formatSetWorldFlagsSuccessFromDebugQa,
  getDebugQaScriptedIntentsDisplayText as getDebugQaScriptedIntentsDisplayTextFromDebugQa,
  isQuestStatusValue as isQuestStatusValueFromDebugQa,
  parseImportedDebugQaTrace as parseImportedDebugQaTraceFromDebugQa,
  readDebugQaFlagList as readDebugQaFlagListFromDebugQa,
  readDebugQaNumber as readDebugQaNumberFromDebugQa,
} from './features/debugQa/debugQaHelpers';
import {
  buildDebugQaRequest as buildDebugQaRequestFromFeature,
  getDebugQaSuccessMessage as getDebugQaSuccessMessageFromFeature,
  runDebugQaAction as runDebugQaActionFromFeature,
} from './features/debugQa/debugQaActionHandlers';
import { updateDebugQaHud as updateDebugQaHudFromFeature } from './features/debugQa/debugQaHudRenderer';
import {
  exportDebugQaMarkdownReport as exportDebugQaMarkdownReportFromFeature,
  exportDebugQaTrace as exportDebugQaTraceFromFeature,
  loadCombatDebugScriptedIntents as loadCombatDebugScriptedIntentsFromFeature,
  triggerDebugQaTraceImport as triggerDebugQaTraceImportFromFeature,
} from './features/debugQa/debugQaTraceActionHandlers';
import {
  advanceDebugQaStepReplay as advanceDebugQaStepReplayFromFeature,
  handleDebugQaImportFileChange as handleDebugQaImportFileChangeFromFeature,
  replayImportedDebugQaTrace as replayImportedDebugQaTraceFromFeature,
  startDebugQaStepReplay as startDebugQaStepReplayFromFeature,
  stopDebugQaStepReplay as stopDebugQaStepReplayFromFeature,
} from './features/debugQa/debugQaReplayActionHandlers';
import {
  applyStripCalibrationPreset as applyStripCalibrationPresetFromFeature,
  getDebugQaReplayAutoPlayIntervalMs as getDebugQaReplayAutoPlayIntervalMsFromFeature,
  getDebugQaReplayAutoPlaySpeedLabel as getDebugQaReplayAutoPlaySpeedLabelFromFeature,
  persistDebugQaReplayAutoPlaySpeed as persistDebugQaReplayAutoPlaySpeedFromFeature,
  persistStripCalibrationPreset as persistStripCalibrationPresetFromFeature,
  readDebugQaReplayAutoPlaySpeed as readDebugQaReplayAutoPlaySpeedFromFeature,
  readStorageValue as readStorageValueFromFeature,
  readStoredDebugQaReplayAutoPlaySpeed as readStoredDebugQaReplayAutoPlaySpeedFromFeature,
  readStoredStripCalibrationPreset as readStoredStripCalibrationPresetFromFeature,
  readStripCalibrationPresetFromUi as readStripCalibrationPresetFromUiFromFeature,
  stopDebugQaStepReplayAutoPlay as stopDebugQaStepReplayAutoPlayFromFeature,
  toggleDebugQaStepReplayAutoPlay as toggleDebugQaStepReplayAutoPlayFromFeature,
  writeStorageValue as writeStorageValueFromFeature,
} from './features/debugQa/debugQaPlaybackCalibrationHandlers';
import {
  applyImportedDebugQaTrace as applyImportedDebugQaTraceFromFeature,
  buildCombatTraceSnapshot as buildCombatTraceSnapshotFromFeature,
  buildDebugQaTracePayload as buildDebugQaTracePayloadFromFeature,
  captureDebugQaReplayBaseline as captureDebugQaReplayBaselineFromFeature,
  restoreDebugQaReplayBaseline as restoreDebugQaReplayBaselineFromFeature,
} from './features/debugQa/debugQaTraceBuilders';
import {
  bindHudElements as bindHudElementsFromHud,
  clearHudElementBindings as clearHudElementBindingsFromHud,
} from './hud/hudBindings';
import {
  bindHudEventListeners as bindHudEventListenersFromHud,
  unbindHudEventListeners as unbindHudEventListenersFromHud,
} from './hud/hudEventLifecycle';
import { resetHudTeardownState as resetHudTeardownStateFromHud } from './hud/hudTeardownState';
import { createHudTemplate as createHudTemplateFromHud } from './hud/hudTemplate';
import type {
  AutoSaveState,
  CombatActionName,
  CombatDebugReference,
  CombatEffectChip,
  CombatEncounterState,
  CombatStatus,
  CombatTurn,
  CombatUiStatus,
  DebugLoadoutPresetKey,
  DebugQaActionName,
  DebugQaPresetOption,
  DebugQaRecapOutcomeFilter,
  DebugQaReplayAutoPlaySpeedKey,
  DebugQaReplayBaseline,
  DebugQaStatus,
  DebugQaStepReplayState,
  DebugQaTracePayload,
  DebugStatePresetKey,
  FarmScenePlotSlot,
  FarmScenePlotVisual,
  HeroAppearanceKey,
  HeroProfileState,
  HudState,
  HudStripPlaybackState,
  ImportedDebugQaTrace,
  IntroNarrativeState,
  IntroNarrativeStepKey,
  QuestState,
  QuestStatus,
  SaveSlotPreview,
  SaveSlotState,
  SpriteManifest,
  SpriteManifestPortraitEntry,
  SpriteManifestPortraitState,
  SpriteManifestStripEntry,
  StripAnimationName,
  StripCalibrationPreset,
  StripCalibrationPresetKey,
  VillageNpcHudEntry,
  VillageNpcHudState,
  VillageNpcKey,
  VillageNpcRelationshipHudEntry,
  VillageNpcRelationshipHudState,
  VillageNpcRelationshipTier,
} from './gameScene.stateTypes';

const DEBUG_QA_PRESET_OPTIONS: DebugQaPresetOption[] = [
  { key: 'starter', label: 'Starter' },
  { key: 'tower_mid', label: 'Tower mid' },
  { key: 'boss_trial', label: 'Boss trial' },
];

const HERO_APPEARANCE_OPTIONS: Array<{ key: HeroAppearanceKey; label: string }> = [
  { key: 'default', label: 'Fermier classique' },
  { key: 'ember', label: 'Tenue braise' },
  { key: 'forest', label: 'Tenue sylvestre' },
  { key: 'night', label: 'Tenue nocturne' },
];

const DEBUG_QA_STATE_PRESET_OPTIONS: Array<{ key: DebugStatePresetKey; label: string }> = [
  { key: 'village_open', label: 'Village open' },
  { key: 'mid_tower', label: 'Mid tower' },
  { key: 'act1_done', label: 'Act 1 done' },
];

const DEBUG_QA_QUEST_STATUS_OPTIONS: Array<{ key: QuestStatus; label: string }> = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'claimed', label: 'Claimed' },
];

const DEBUG_QA_RECAP_OUTCOME_FILTER_OPTIONS: Array<{ key: DebugQaRecapOutcomeFilter; label: string }> = [
  { key: 'all', label: 'All outcomes' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
  { key: 'fled', label: 'Fled' },
  { key: 'active', label: 'Active' },
];

const DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS: Array<{
  key: DebugQaReplayAutoPlaySpeedKey;
  label: string;
  intervalMs: number;
}> = [
  { key: 'slow', label: 'Slow (1400ms)', intervalMs: 1400 },
  { key: 'normal', label: 'Normal (900ms)', intervalMs: 900 },
  { key: 'fast', label: 'Fast (500ms)', intervalMs: 500 },
];

const STRIP_CALIBRATION_PRESETS: StripCalibrationPreset[] = [
  {
    key: 'manifest',
    label: 'Manifest default',
    playerFpsMultiplier: 1,
    playerActionDurationMultiplier: 1,
    hudIntervalMultiplier: 1,
    hudActionDurationMultiplier: 1,
  },
  {
    key: 'snappy',
    label: 'Snappy QA',
    playerFpsMultiplier: 1.25,
    playerActionDurationMultiplier: 0.84,
    hudIntervalMultiplier: 0.84,
    hudActionDurationMultiplier: 0.86,
  },
  {
    key: 'cinematic',
    label: 'Cinematic QA',
    playerFpsMultiplier: 0.82,
    playerActionDurationMultiplier: 1.2,
    hudIntervalMultiplier: 1.2,
    hudActionDurationMultiplier: 1.2,
  },
];

const DEBUG_QA_REPLAY_AUTOPLAY_SPEED_STORAGE_KEY = 'farm-rpg.debugQa.replayAutoPlaySpeed';
const DEBUG_QA_STRIP_CALIBRATION_STORAGE_KEY = 'farm-rpg.debugQa.stripCalibrationPreset';
const GAMEPAD_BUTTON_A = 0;
const GAMEPAD_BUTTON_B = 1;
const GAMEPAD_BUTTON_X = 2;
const GAMEPAD_BUTTON_Y = 3;
const GAMEPAD_BUTTON_LEFT_BUMPER = 4;
const GAMEPAD_BUTTON_RIGHT_BUMPER = 5;
const GAMEPAD_BUTTON_DPAD_UP = 12;
const GAMEPAD_BUTTON_DPAD_DOWN = 13;
const GAMEPAD_BUTTON_DPAD_LEFT = 14;
const GAMEPAD_BUTTON_DPAD_RIGHT = 15;

function isDebugQaActionName(value: string): value is DebugQaActionName {
  return (
    value === 'grant-resources' ||
    value === 'set-tower-floor' ||
    value === 'apply-state-preset' ||
    value === 'apply-loadout-preset' ||
    value === 'complete-quests' ||
    value === 'set-world-flags' ||
    value === 'set-quest-status'
  );
}

function isHeroAppearanceKey(value: string): value is HeroAppearanceKey {
  return HERO_APPEARANCE_OPTIONS.some((option) => option.key === value);
}

function isIntroNarrativeStepKey(value: string): value is IntroNarrativeStepKey {
  return value === 'arrive_village' || value === 'meet_mayor' || value === 'farm_assignment' || value === 'completed';
}

function isVillageShopTabKey(value: string): value is VillageShopTabKey {
  return (
    value === 'buy' ||
    value === 'sell' ||
    value === 'weapons' ||
    value === 'armors' ||
    value === 'accessories'
  );
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private farmHotkeys!: {
    plant: Phaser.Input.Keyboard.Key;
    water: Phaser.Input.Keyboard.Key;
    harvest: Phaser.Input.Keyboard.Key;
    sleep: Phaser.Input.Keyboard.Key;
    craft: Phaser.Input.Keyboard.Key;
  };
  private villageHotkeys!: {
    interact: Phaser.Input.Keyboard.Key;
    cycleTarget: Phaser.Input.Keyboard.Key;
  };

  private hudRoot: HTMLElement | null = null;
  private hudPanelRoot: HTMLElement | null = null;
  private loginButton: HTMLButtonElement | null = null;
  private logoutButton: HTMLButtonElement | null = null;
  private combatStartButton: HTMLButtonElement | null = null;
  private combatAttackButton: HTMLButtonElement | null = null;
  private combatDefendButton: HTMLButtonElement | null = null;
  private combatFireballButton: HTMLButtonElement | null = null;
  private combatRallyButton: HTMLButtonElement | null = null;
  private combatSunderButton: HTMLButtonElement | null = null;
  private combatMendButton: HTMLButtonElement | null = null;
  private combatCleanseButton: HTMLButtonElement | null = null;
  private combatInterruptButton: HTMLButtonElement | null = null;
  private combatForfeitButton: HTMLButtonElement | null = null;
  private combatLogsList: HTMLElement | null = null;
  private combatStatusBadge: HTMLElement | null = null;
  private combatErrorValue: HTMLElement | null = null;
  private questsSummaryValue: HTMLElement | null = null;
  private questsListRoot: HTMLElement | null = null;
  private questsErrorValue: HTMLElement | null = null;
  private blacksmithSummaryValue: HTMLElement | null = null;
  private blacksmithOffersRoot: HTMLElement | null = null;
  private blacksmithErrorValue: HTMLElement | null = null;
  private villageMarketSummaryValue: HTMLElement | null = null;
  private villageMarketSeedsRoot: HTMLElement | null = null;
  private villageMarketBuybackRoot: HTMLElement | null = null;
  private villageMarketErrorValue: HTMLElement | null = null;
  private farmSummaryValue: HTMLElement | null = null;
  private farmStorySummaryValue: HTMLElement | null = null;
  private farmStoryNarrativeValue: HTMLElement | null = null;
  private farmSeedSelect: HTMLSelectElement | null = null;
  private farmSleepButton: HTMLButtonElement | null = null;
  private farmPlotsRoot: HTMLElement | null = null;
  private farmErrorValue: HTMLElement | null = null;
  private farmContextTitleValue: HTMLElement | null = null;
  private farmContextStatusValue: HTMLElement | null = null;
  private farmContextFeedbackValue: HTMLElement | null = null;
  private farmContextSeedValue: HTMLElement | null = null;
  private farmContextReadyValue: HTMLElement | null = null;
  private farmContextPlantButton: HTMLButtonElement | null = null;
  private farmContextWaterButton: HTMLButtonElement | null = null;
  private farmContextHarvestButton: HTMLButtonElement | null = null;
  private farmCraftingToggleButton: HTMLButtonElement | null = null;
  private farmGoVillageButton: HTMLButtonElement | null = null;
  private villageObjectiveValue: HTMLElement | null = null;
  private villageContextTitleValue: HTMLElement | null = null;
  private villageContextRoleValue: HTMLElement | null = null;
  private villageContextHintValue: HTMLElement | null = null;
  private villageContextFeedbackValue: HTMLElement | null = null;
  private villageContextInteractButton: HTMLButtonElement | null = null;
  private villageContextCycleButton: HTMLButtonElement | null = null;
  private villageShopPanelRoot: HTMLElement | null = null;
  private villageShopNpcValue: HTMLElement | null = null;
  private villageShopTitleValue: HTMLElement | null = null;
  private villageShopSummaryValue: HTMLElement | null = null;
  private villageShopTabsRoot: HTMLElement | null = null;
  private villageShopEntriesRoot: HTMLElement | null = null;
  private villageShopDetailNameValue: HTMLElement | null = null;
  private villageShopDetailMetaValue: HTMLElement | null = null;
  private villageShopDetailDescriptionValue: HTMLElement | null = null;
  private villageShopDetailComparisonValue: HTMLElement | null = null;
  private villageShopTransactionValue: HTMLElement | null = null;
  private villageShopConfirmButton: HTMLButtonElement | null = null;
  private villageShopTalkButton: HTMLButtonElement | null = null;
  private villageShopErrorValue: HTMLElement | null = null;
  private farmCraftingPanel: HTMLElement | null = null;
  private farmCraftingSummaryValue: HTMLElement | null = null;
  private farmCraftingListRoot: HTMLElement | null = null;
  private farmCraftingErrorValue: HTMLElement | null = null;
  private loopSummaryValue: HTMLElement | null = null;
  private loopStageValue: HTMLElement | null = null;
  private loopSuppliesValue: HTMLElement | null = null;
  private loopPrepValue: HTMLElement | null = null;
  private loopBlockersValue: HTMLElement | null = null;
  private loopErrorValue: HTMLElement | null = null;
  private loopPrepareButton: HTMLButtonElement | null = null;
  private towerStorySummaryValue: HTMLElement | null = null;
  private towerStoryNarrativeValue: HTMLElement | null = null;
  private villageNpcSummaryValue: HTMLElement | null = null;
  private villageNpcMayorValue: HTMLElement | null = null;
  private villageNpcBlacksmithValue: HTMLElement | null = null;
  private villageNpcMerchantValue: HTMLElement | null = null;
  private villageNpcMayorDialogueValue: HTMLElement | null = null;
  private villageNpcBlacksmithDialogueValue: HTMLElement | null = null;
  private villageNpcMerchantDialogueValue: HTMLElement | null = null;
  private villageNpcErrorValue: HTMLElement | null = null;
  private villageNpcTalkMayorButton: HTMLButtonElement | null = null;
  private villageNpcTalkBlacksmithButton: HTMLButtonElement | null = null;
  private villageNpcTalkMerchantButton: HTMLButtonElement | null = null;
  private autosaveSummaryValue: HTMLElement | null = null;
  private autosaveMetaValue: HTMLElement | null = null;
  private autosaveActionsRoot: HTMLElement | null = null;
  private autosaveErrorValue: HTMLElement | null = null;
  private saveSlotsSummaryValue: HTMLElement | null = null;
  private saveSlotsListRoot: HTMLElement | null = null;
  private saveSlotsErrorValue: HTMLElement | null = null;
  private heroProfileSummaryValue: HTMLElement | null = null;
  private heroProfileNameInput: HTMLInputElement | null = null;
  private heroProfileAppearanceSelect: HTMLSelectElement | null = null;
  private heroProfileSaveButton: HTMLButtonElement | null = null;
  private heroProfileMessageValue: HTMLElement | null = null;
  private heroProfileErrorValue: HTMLElement | null = null;
  private introSummaryValue: HTMLElement | null = null;
  private introNarrativeValue: HTMLElement | null = null;
  private introHintValue: HTMLElement | null = null;
  private introProgressValue: HTMLElement | null = null;
  private introAdvanceButton: HTMLButtonElement | null = null;
  private introErrorValue: HTMLElement | null = null;

  private authStatus = 'Verification...';
  private isAuthenticated = false;
  private hudState: HudState = {
    day: 1,
    gold: 120,
    level: 1,
    xp: 0,
    xpToNext: 100,
    towerCurrentFloor: 1,
    towerHighestFloor: 1,
    towerBossFloor10Defeated: false,
    blacksmithUnlocked: false,
    blacksmithCurseLifted: false,
    hp: 32,
    maxHp: 32,
    mp: 15,
    maxMp: 15,
    stamina: 8,
    area: 'Ferme',
  };

  private combatEncounterId: string | null = null;
  private combatStatus: CombatUiStatus = 'idle';
  private combatState: CombatEncounterState | null = null;
  private combatLogs: string[] = [];
  private combatMessage = 'Aucun combat actif.';
  private combatError: string | null = null;
  private readonly payloadGateway = createGameScenePayloadGateway({
    getFallbackCombatStatus: () => this.combatState?.status ?? 'active',
    isHeroAppearanceKey,
    isIntroNarrativeStepKey,
  });
  private combatBusy = false;
  private quests: QuestState[] = [];
  private questBusy = false;
  private questError: string | null = null;
  private questsRenderSignature = '';
  private blacksmithOffers: BlacksmithOfferState[] = [];
  private blacksmithBusy = false;
  private blacksmithError: string | null = null;
  private blacksmithRenderSignature = '';
  private villageMarketUnlocked = false;
  private villageMarketSeedOffers: VillageSeedOfferState[] = [];
  private villageMarketBuybackOffers: VillageCropBuybackOfferState[] = [];
  private villageMarketBusy = false;
  private villageMarketError: string | null = null;
  private villageMarketRenderSignature = '';
  private villageShopControllerState: VillageShopControllerState = createVillageShopControllerStateFromFeature();
  private farmState: FarmState | null = null;
  private farmStoryState: FarmStoryState | null = null;
  private farmBusy = false;
  private farmError: string | null = null;
  private farmSelectedSeedItemKey = '';
  private farmSelectedPlotKey: string | null = null;
  private farmFeedbackMessage: string | null = null;
  private farmCraftingPanelOpen = false;
  private farmRenderSignature = '';
  private farmCraftingState: FarmCraftingState | null = null;
  private farmCraftingBusy = false;
  private farmCraftingError: string | null = null;
  private farmCraftingRenderSignature = '';
  private frontSceneMode: FrontSceneMode = 'farm';
  private sceneObstacles: Phaser.GameObjects.Rectangle[] = [];
  private sceneObstacleColliders: Phaser.Physics.Arcade.Collider[] = [];
  private farmSceneRenderSignature = '';
  private farmSceneBackground: Phaser.GameObjects.Graphics | null = null;
  private farmScenePlotVisuals = new Map<string, FarmScenePlotVisual>();
  private farmSceneStaticLabels: Phaser.GameObjects.GameObject[] = [];
  private farmSceneActionHintLabel: Phaser.GameObjects.Text | null = null;
  private villageSceneRenderSignature = '';
  private villageSceneZoneVisuals = new Map<VillageSceneZoneKey, VillageSceneZoneVisual>();
  private villageSceneActionHintLabel: Phaser.GameObjects.Text | null = null;
  private villageSelectedZoneKey: VillageSceneZoneKey | null = null;
  private villageFeedbackMessage: string | null = null;
  private loopState: GameplayLoopState | null = null;
  private loopBusy = false;
  private loopError: string | null = null;
  private towerStoryState: TowerStoryState | null = null;
  private villageNpcState: VillageNpcHudState = {
    mayor: { stateKey: 'offscreen', available: false },
    blacksmith: { stateKey: 'cursed', available: false },
    merchant: { stateKey: 'absent', available: false },
  };
  private villageNpcRelationships: VillageNpcRelationshipHudState = {
    mayor: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
    blacksmith: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
    merchant: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
  };
  private villageNpcBusy = false;
  private villageNpcError: string | null = null;
  private autosave: AutoSaveState | null = null;
  private autosaveBusy = false;
  private autosaveRestoreSlotBusy: number | null = null;
  private autosaveError: string | null = null;
  private autosaveRenderSignature = '';
  private saveSlots: SaveSlotState[] = [];
  private saveSlotsBusy = false;
  private saveSlotsActionBusyKey: string | null = null;
  private saveSlotsLoadConfirmSlot: number | null = null;
  private saveSlotsError: string | null = null;
  private saveSlotsRenderSignature = '';
  private heroProfile: HeroProfileState | null = null;
  private heroProfileBusy = false;
  private heroProfileError: string | null = null;
  private heroProfileMessage: string | null = null;
  private heroProfileNameDraft = '';
  private heroProfileAppearanceDraft: HeroAppearanceKey = 'default';
  private introNarrativeState: IntroNarrativeState | null = null;
  private introNarrativeBusy = false;
  private introNarrativeError: string | null = null;
  private gamepadPreviousButtonStates: boolean[] = [];
  private gamepadHudFocusableElements: HTMLElement[] = [];
  private gamepadHudFocusIndex = -1;
  private spriteManifest: SpriteManifest | null = null;
  private playerUsesStripAnimation = false;
  private playerStripActionTimer: Phaser.Time.TimerEvent | null = null;
  private playerStripAccentTimer: Phaser.Time.TimerEvent | null = null;
  private enemyHudStripPlayback: HudStripPlaybackState | null = null;
  private enemyHudStripIntervalId: number | null = null;
  private enemyHudStripOverrideAnimation: StripAnimationName | null = null;
  private enemyHudStripOverrideTimeoutId: number | null = null;

  private debugQaPanelRoot: HTMLElement | null = null;
  private debugQaStatusValue: HTMLElement | null = null;
  private debugQaMessageValue: HTMLElement | null = null;
  private debugQaGrantXpInput: HTMLInputElement | null = null;
  private debugQaGrantGoldInput: HTMLInputElement | null = null;
  private debugQaTowerFloorInput: HTMLInputElement | null = null;
  private debugQaStatePresetSelect: HTMLSelectElement | null = null;
  private debugQaQuestKeyInput: HTMLInputElement | null = null;
  private debugQaQuestStatusSelect: HTMLSelectElement | null = null;
  private debugQaLoadoutPresetSelect: HTMLSelectElement | null = null;
  private debugQaWorldFlagsInput: HTMLTextAreaElement | null = null;
  private debugQaWorldFlagsRemoveInput: HTMLTextAreaElement | null = null;
  private debugQaWorldFlagsReplaceInput: HTMLInputElement | null = null;
  private debugQaRecapOutcomeFilterSelect: HTMLSelectElement | null = null;
  private debugQaRecapEnemyFilterInput: HTMLInputElement | null = null;
  private debugQaScriptEnemyFilterInput: HTMLInputElement | null = null;
  private debugQaScriptIntentFilterInput: HTMLInputElement | null = null;
  private debugQaGrantButton: HTMLButtonElement | null = null;
  private debugQaTowerFloorButton: HTMLButtonElement | null = null;
  private debugQaStatePresetButton: HTMLButtonElement | null = null;
  private debugQaSetQuestStatusButton: HTMLButtonElement | null = null;
  private debugQaLoadoutButton: HTMLButtonElement | null = null;
  private debugQaCompleteQuestsButton: HTMLButtonElement | null = null;
  private debugQaSetWorldFlagsButton: HTMLButtonElement | null = null;
  private debugQaImportButton: HTMLButtonElement | null = null;
  private debugQaReplayButton: HTMLButtonElement | null = null;
  private debugQaReplayStepStartButton: HTMLButtonElement | null = null;
  private debugQaReplayStepNextButton: HTMLButtonElement | null = null;
  private debugQaReplayStepStopButton: HTMLButtonElement | null = null;
  private debugQaReplayAutoPlayButton: HTMLButtonElement | null = null;
  private debugQaReplayAutoPlaySpeedSelect: HTMLSelectElement | null = null;
  private debugQaStripCalibrationSelect: HTMLSelectElement | null = null;
  private debugQaStripCalibrationButton: HTMLButtonElement | null = null;
  private debugQaScriptedIntentsButton: HTMLButtonElement | null = null;
  private debugQaScriptedIntentsOutput: HTMLElement | null = null;
  private debugQaImportFileInput: HTMLInputElement | null = null;
  private debugQaExportButton: HTMLButtonElement | null = null;
  private debugQaExportMarkdownButton: HTMLButtonElement | null = null;
  private debugQaBusyAction: DebugQaActionName | null = null;
  private debugQaStatus: DebugQaStatus = 'idle';
  private debugQaMessage: string | null = null;
  private debugQaError: string | null = null;
  private debugQaImportedTrace: ImportedDebugQaTrace | null = null;
  private debugQaStepReplayState: DebugQaStepReplayState | null = null;
  private debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey = 'normal';
  private debugQaReplayAutoPlayIntervalId: number | null = null;
  private stripCalibrationPreset: StripCalibrationPresetKey = 'manifest';
  private debugQaRecapOutcomeFilter: DebugQaRecapOutcomeFilter = 'all';
  private debugQaRecapEnemyFilter = '';
  private debugQaScriptEnemyFilter = '';
  private debugQaScriptIntentFilter = '';
  private debugQaScriptedIntentsReference: CombatDebugReference | null = null;
  private debugQaScriptedIntentsText = 'Click "Load reference" to inspect the combat script QA payload.';
  private readonly debugQaEnabled = import.meta.env.DEV || import.meta.env.MODE === 'staging';
  private readonly stripCalibrationEnabled = import.meta.env.MODE === 'staging';
  private readonly onDebugQaReplayAutoPlaySpeedChange = () => {
    const nextSpeed = this.readDebugQaReplayAutoPlaySpeed();
    this.debugQaReplayAutoPlaySpeed = nextSpeed;
    this.persistDebugQaReplayAutoPlaySpeed(nextSpeed);
    this.updateHud();
  };
  private readonly onDebugQaStripCalibrationChange = () => {
    const nextPreset = this.readStripCalibrationPresetFromUi();
    this.stripCalibrationPreset = nextPreset;
    this.persistStripCalibrationPreset(nextPreset);
    this.updateHud();
  };
  private readonly onDebugQaFilterInputChange = () => {
    this.syncDebugQaFiltersFromInputs();
    this.updateHud();
  };
  private readonly onHeroProfileNameInput = () => {
    if (!this.heroProfileNameInput) {
      return;
    }

    this.heroProfileNameDraft = this.heroProfileNameInput.value;
    this.heroProfileMessage = null;
  };
  private readonly onHeroProfileAppearanceChange = () => {
    this.heroProfileAppearanceDraft = this.readHeroProfileAppearanceFromUi();
    this.heroProfileMessage = null;
  };
  private readonly onFarmSeedSelectionChange = () => {
    this.farmSelectedSeedItemKey = this.readFarmSeedSelectionFromUi();
    this.farmError = null;
    this.farmFeedbackMessage = this.farmSelectedSeedItemKey
      ? `Graine active: ${this.formatFarmLabel(this.farmSelectedSeedItemKey)}.`
      : 'Aucune graine selectionnee.';
    this.updateHud();
  };

  private readonly onDebugQaImportFileChange = (event: Event) => {
    void this.handleDebugQaImportFileChange(event);
  };

  private readonly onHudClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button || button.disabled) {
      return;
    }

    const hudAction = button.dataset.hudAction;
    const combatAction = button.dataset.combatAction;
    const questAction = button.dataset.questAction;
    const shopAction = button.dataset.shopAction;
    const marketAction = button.dataset.marketAction;
    const villageNpcAction = button.dataset.villageNpcAction;
    const loopAction = button.dataset.loopAction;
    const farmAction = button.dataset.farmAction;
    const villageAction = button.dataset.villageAction;
    const villageShopAction = button.dataset.villageShopAction;
    const farmCraftAction = button.dataset.farmCraftAction;
    const saveAction = button.dataset.saveAction;
    const profileAction = button.dataset.profileAction;
    const introAction = button.dataset.introAction;
    const debugAction = button.dataset.debugAction;

    if (hudAction === 'login') {
      window.location.href = `${API_BASE_URL}/auth/google`;
      return;
    }

    if (hudAction === 'logout') {
      void this.logout();
      return;
    }

    if (combatAction === 'start') {
      void this.startCombat();
      return;
    }

    if (
      combatAction === 'attack' ||
      combatAction === 'defend' ||
      combatAction === 'fireball' ||
      combatAction === 'cleanse' ||
      combatAction === 'interrupt' ||
      combatAction === 'rally' ||
      combatAction === 'sunder' ||
      combatAction === 'mend'
    ) {
      void this.performCombatAction(combatAction);
      return;
    }

    if (combatAction === 'forfeit') {
      void this.forfeitCombat();
      return;
    }

    if (questAction === 'claim') {
      const questKey = button.dataset.questKey;
      if (questKey) {
        void this.claimQuest(questKey);
      }
      return;
    }

    if (shopAction === 'buy') {
      const offerKey = button.dataset.offerKey;
      if (offerKey) {
        void this.buyBlacksmithOffer(offerKey);
      }
      return;
    }

    if (marketAction === 'buy-seed') {
      const offerKey = button.dataset.offerKey;
      if (offerKey) {
        void this.buyVillageSeedOffer(offerKey);
      }
      return;
    }

    if (marketAction === 'sell-crop') {
      const itemKey = button.dataset.itemKey;
      if (itemKey) {
        void this.sellVillageCrop(itemKey);
      }
      return;
    }

    if (villageNpcAction === 'talk') {
      const npcKey = button.dataset.npcKey;
      if (npcKey === 'mayor' || npcKey === 'blacksmith' || npcKey === 'merchant') {
        void this.interactVillageNpc(npcKey);
      }
      return;
    }

    if (loopAction === 'prepare') {
      void this.prepareCombatLoop();
      return;
    }

    if (farmAction === 'select') {
      const plotKey = button.dataset.plotKey;
      if (plotKey) {
        this.setSelectedFarmPlot(plotKey, true);
        this.updateHud();
      }
      return;
    }

    if (farmAction === 'toggle-craft') {
      this.toggleFarmCraftingPanel();
      return;
    }

    if (farmAction === 'go-village') {
      this.handleFarmVillageExitIntent();
      return;
    }

    if (farmAction === 'sleep') {
      void this.sleepAtFarm();
      return;
    }

    if (farmAction === 'plant' || farmAction === 'water' || farmAction === 'harvest') {
      const plotKeyFromButton = button.dataset.plotKey?.trim();
      const plotKey = plotKeyFromButton && plotKeyFromButton.length > 0
        ? plotKeyFromButton
        : (this.farmSelectedPlotKey ?? undefined);
      if (!plotKey) {
        return;
      }

      if (farmAction === 'plant') {
        void this.plantFarmPlot(plotKey);
        return;
      }
      if (farmAction === 'water') {
        void this.waterFarmPlot(plotKey);
        return;
      }
      void this.harvestFarmPlot(plotKey);
      return;
    }

    if (villageAction === 'interact') {
      const targetKey = button.dataset.targetKey;
      if (
        targetKey === 'mayor' ||
        targetKey === 'market' ||
        targetKey === 'forge' ||
        targetKey === 'calm' ||
        targetKey === 'farm_exit' ||
        targetKey === 'tower_exit'
      ) {
        void this.handleVillageInteractionIntent(targetKey);
      } else {
        void this.handleVillageInteractionIntent();
      }
      return;
    }

    if (villageAction === 'cycle') {
      this.cycleVillageTarget(1, true);
      this.updateHud();
      return;
    }

    if (villageShopAction === 'close') {
      this.closeVillageShopPanel('Retour au hub village.');
      return;
    }

    if (villageShopAction === 'tab') {
      const tabKey = button.dataset.shopTab;
      if (tabKey && isVillageShopTabKey(tabKey)) {
        this.setVillageShopTab(tabKey);
      }
      return;
    }

    if (villageShopAction === 'select') {
      const entryKey = button.dataset.shopEntryKey?.trim();
      if (entryKey) {
        this.selectVillageShopEntry(entryKey);
      }
      return;
    }

    if (villageShopAction === 'confirm') {
      void this.handleVillageShopPrimaryAction();
      return;
    }

    if (villageShopAction === 'talk') {
      void this.handleVillageShopTalkAction();
      return;
    }

    if (farmCraftAction === 'craft') {
      const recipeKey = button.dataset.recipeKey;
      if (recipeKey) {
        void this.craftFarmRecipe(recipeKey);
      }
      return;
    }

    if (saveAction) {
      const rawSlot = button.dataset.slot;
      const slot = rawSlot ? Number(rawSlot) : NaN;
      if (!Number.isInteger(slot) || slot < 1 || slot > 3) {
        return;
      }

      if (saveAction === 'restore') {
        void this.restoreAutoSaveToSlot(slot);
        return;
      }

      if (saveAction === 'capture') {
        void this.captureSaveSlot(slot);
        return;
      }

      if (saveAction === 'load') {
        this.toggleLoadSaveSlotConfirmation(slot);
        return;
      }

      if (saveAction === 'confirm-load') {
        void this.loadSaveSlot(slot);
        return;
      }

      if (saveAction === 'cancel-load') {
        this.clearLoadSaveSlotConfirmation(slot);
        return;
      }

      if (saveAction === 'delete') {
        void this.deleteSaveSlot(slot);
      }
    }

    if (profileAction === 'save') {
      void this.saveHeroProfile();
      return;
    }

    if (introAction === 'advance') {
      void this.advanceIntroNarrative();
      return;
    }

    if (debugAction === 'export-trace') {
      void this.exportDebugQaTrace();
      return;
    }

    if (debugAction === 'export-markdown') {
      void this.exportDebugQaMarkdownReport();
      return;
    }

    if (debugAction === 'import-trace') {
      this.triggerDebugQaTraceImport();
      return;
    }

    if (debugAction === 'replay-trace') {
      this.replayImportedDebugQaTrace();
      return;
    }

    if (debugAction === 'replay-trace-step-start') {
      this.startDebugQaStepReplay();
      return;
    }

    if (debugAction === 'replay-trace-step-next') {
      this.advanceDebugQaStepReplay();
      return;
    }

    if (debugAction === 'replay-trace-step-stop') {
      this.stopDebugQaStepReplay(true);
      return;
    }

    if (debugAction === 'replay-trace-step-autoplay') {
      this.toggleDebugQaStepReplayAutoPlay();
      return;
    }

    if (debugAction === 'apply-strip-calibration') {
      this.applyStripCalibrationPreset();
      return;
    }

    if (debugAction === 'load-scripted-intents') {
      void this.loadCombatDebugScriptedIntents();
      return;
    }

    if (debugAction && isDebugQaActionName(debugAction)) {
      void this.handleDebugQaAction(debugAction);
    }
  };

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.setupWorld();
    this.drawDecor();
    this.setupPlayer();
    this.setupInput();
    this.setupHud();
    void this.bootstrapSessionState();
    this.setupCamera();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.teardownHud();
    });
  }

  update(): void {
    const speed = 140;
    const body = this.player.body;

    if (!body) {
      return;
    }

    const left = this.cursors.left?.isDown || this.wasd.left.isDown;
    const right = this.cursors.right?.isDown || this.wasd.right.isDown;
    const up = this.cursors.up?.isDown || this.wasd.up.isDown;
    const down = this.cursors.down?.isDown || this.wasd.down.isDown;

    let velocityX = 0;
    let velocityY = 0;

    if (left) {
      velocityX -= speed;
    }
    if (right) {
      velocityX += speed;
    }
    if (up) {
      velocityY -= speed;
    }
    if (down) {
      velocityY += speed;
    }

    body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(speed);
    }

    if (velocityX !== 0 || velocityY !== 0) {
      this.hudState.stamina = Math.max(0, this.hudState.stamina - 0.01);
    }

    if (this.playerUsesStripAnimation && !this.playerStripActionTimer) {
      this.playPlayerStripAnimation('idle');
    }

    this.player.setTint(velocityX !== 0 || velocityY !== 0 ? 0xd8f1ff : 0xffffff);
    if (this.frontSceneMode === 'village') {
      this.updateVillageSelectionFromPlayerPosition();
    }
    this.updateGamepadInput();
    if (this.frontSceneMode === 'farm') {
      this.handleFarmHotkeys();
    } else {
      this.handleVillageHotkeys();
    }
    this.updateHud();
  }

  private setupWorld(): void {
    this.physics.world.setBounds(0, 0, 1600, 900);
    this.cameras.main.setBounds(0, 0, 1600, 900);
  }

  private setupPlayer(): void {
    const manifest = this.getSpriteManifest();
    const playerSprite = manifest.sprites['player-hero'];
    if (!playerSprite) {
      throw new Error('Player sprite manifest entry is missing');
    }

    const playerStrip = this.getStripManifestEntry('player-hero');
    const canUsePlayerStrip = Boolean(playerStrip && this.textures.exists(playerStrip.key));

    if (canUsePlayerStrip && playerStrip) {
      this.ensureStripAnimations(playerStrip);
      const idleFrames = this.getStripFrames(playerStrip, 'idle');
      const firstFrame = idleFrames[0] ?? 0;

      this.player = this.physics.add.sprite(FARM_SCENE_PLAYER_SPAWN.x, FARM_SCENE_PLAYER_SPAWN.y, playerStrip.key, firstFrame);
      this.player.setOrigin(playerStrip.origin?.x ?? playerSprite.origin.x, playerStrip.origin?.y ?? playerSprite.origin.y);
      this.player.setScale(playerStrip.scale?.x ?? playerSprite.scale.x, playerStrip.scale?.y ?? playerSprite.scale.y);
      this.player.setCollideWorldBounds(true);
      this.player.setSize(playerStrip.physics?.width ?? playerSprite.physics.width, playerStrip.physics?.height ?? playerSprite.physics.height);
      this.player.setOffset(playerStrip.physics?.offsetX ?? playerSprite.physics.offsetX, playerStrip.physics?.offsetY ?? playerSprite.physics.offsetY);
      this.player.setDepth(34);
      this.playerUsesStripAnimation = true;
      this.playPlayerStripAnimation('idle', true);
    } else {
      if (!this.textures.exists(playerSprite.key)) {
        throw new Error(`Player sprite texture not loaded: ${playerSprite.key}`);
      }

      this.player = this.physics.add.sprite(FARM_SCENE_PLAYER_SPAWN.x, FARM_SCENE_PLAYER_SPAWN.y, playerSprite.key);
      this.player.setOrigin(playerSprite.origin.x, playerSprite.origin.y);
      this.player.setScale(playerSprite.scale.x, playerSprite.scale.y);
      this.player.setCollideWorldBounds(true);
      this.player.setSize(playerSprite.physics.width, playerSprite.physics.height);
      this.player.setOffset(playerSprite.physics.offsetX, playerSprite.physics.offsetY);
      this.player.setDepth(34);
      this.playerUsesStripAnimation = false;
    }

    this.rebuildSceneObstacles();
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.farmHotkeys = {
      plant: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      water: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      harvest: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      sleep: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      craft: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C),
    };
    this.villageHotkeys = {
      interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      cycleTarget: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    };
  }

  private setupHud(): void {
    this.hudRoot = document.getElementById('hud-root');
    if (!this.hudRoot) {
      throw new Error('HUD root not found. Expected #hud-root in index.html.');
    }

    this.hudRoot.innerHTML = createHudTemplateFromHud({
      heroAppearanceOptions: HERO_APPEARANCE_OPTIONS,
      debugQaEnabled: this.debugQaEnabled,
      debugQaStatePresetOptions: DEBUG_QA_STATE_PRESET_OPTIONS,
      debugQaQuestStatusOptions: DEBUG_QA_QUEST_STATUS_OPTIONS,
      debugQaPresetOptions: DEBUG_QA_PRESET_OPTIONS,
      debugQaReplayAutoPlaySpeedOptions: DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS,
      debugQaRecapOutcomeFilterOptions: DEBUG_QA_RECAP_OUTCOME_FILTER_OPTIONS,
      stripCalibrationEnabled: this.stripCalibrationEnabled,
      stripCalibrationPresets: STRIP_CALIBRATION_PRESETS,
    });
    bindHudElementsFromHud(this as unknown as Record<string, unknown>, this.hudRoot);
    this.debugQaReplayAutoPlaySpeed = this.readStoredDebugQaReplayAutoPlaySpeed();
    this.stripCalibrationPreset = this.readStoredStripCalibrationPreset();
    if (this.debugQaReplayAutoPlaySpeedSelect) {
      this.debugQaReplayAutoPlaySpeedSelect.value = this.debugQaReplayAutoPlaySpeed;
    }
    if (this.debugQaStripCalibrationSelect) {
      this.debugQaStripCalibrationSelect.value = this.stripCalibrationPreset;
    }
    this.syncDebugQaFiltersToInputs();
    bindHudEventListenersFromHud({
      debugQaReplayAutoPlaySpeedSelect: this.debugQaReplayAutoPlaySpeedSelect,
      debugQaStripCalibrationSelect: this.debugQaStripCalibrationSelect,
      debugQaRecapOutcomeFilterSelect: this.debugQaRecapOutcomeFilterSelect,
      debugQaRecapEnemyFilterInput: this.debugQaRecapEnemyFilterInput,
      debugQaScriptEnemyFilterInput: this.debugQaScriptEnemyFilterInput,
      debugQaScriptIntentFilterInput: this.debugQaScriptIntentFilterInput,
      debugQaImportFileInput: this.debugQaImportFileInput,
      heroProfileNameInput: this.heroProfileNameInput,
      heroProfileAppearanceSelect: this.heroProfileAppearanceSelect,
      farmSeedSelect: this.farmSeedSelect,
      onDebugQaReplayAutoPlaySpeedChange: this.onDebugQaReplayAutoPlaySpeedChange,
      onDebugQaStripCalibrationChange: this.onDebugQaStripCalibrationChange,
      onDebugQaFilterInputChange: this.onDebugQaFilterInputChange,
      onDebugQaImportFileChange: this.onDebugQaImportFileChange,
      onHeroProfileNameInput: this.onHeroProfileNameInput,
      onHeroProfileAppearanceChange: this.onHeroProfileAppearanceChange,
      onFarmSeedSelectionChange: this.onFarmSeedSelectionChange,
    });
    this.hudRoot.addEventListener('click', this.onHudClick);
    this.syncHudSceneMode();
    this.updateHud();
  }

  private teardownHud(): void {
    this.stopDebugQaStepReplay(false);

    if (this.playerStripActionTimer) {
      this.playerStripActionTimer.remove(false);
      this.playerStripActionTimer = null;
    }
    if (this.playerStripAccentTimer) {
      this.playerStripAccentTimer.remove(false);
      this.playerStripAccentTimer = null;
    }
    if (this.player) {
      this.player.clearTint();
    }
    this.stopEnemyHudStripPlayback();
    this.clearEnemyHudStripOverride();
    this.resetGamepadInputState();
    this.clearFarmSceneVisuals();
    this.clearVillageSceneVisuals();

    if (this.farmSceneBackground) {
      this.farmSceneBackground.destroy();
      this.farmSceneBackground = null;
    }
    for (const label of this.farmSceneStaticLabels) {
      label.destroy();
    }
    this.farmSceneStaticLabels = [];

    for (const collider of this.sceneObstacleColliders) {
      collider.destroy();
    }
    this.sceneObstacleColliders = [];
    for (const obstacle of this.sceneObstacles) {
      obstacle.destroy();
    }
    this.sceneObstacles = [];

    unbindHudEventListenersFromHud({
      debugQaReplayAutoPlaySpeedSelect: this.debugQaReplayAutoPlaySpeedSelect,
      debugQaStripCalibrationSelect: this.debugQaStripCalibrationSelect,
      debugQaRecapOutcomeFilterSelect: this.debugQaRecapOutcomeFilterSelect,
      debugQaRecapEnemyFilterInput: this.debugQaRecapEnemyFilterInput,
      debugQaScriptEnemyFilterInput: this.debugQaScriptEnemyFilterInput,
      debugQaScriptIntentFilterInput: this.debugQaScriptIntentFilterInput,
      debugQaImportFileInput: this.debugQaImportFileInput,
      heroProfileNameInput: this.heroProfileNameInput,
      heroProfileAppearanceSelect: this.heroProfileAppearanceSelect,
      farmSeedSelect: this.farmSeedSelect,
      onDebugQaReplayAutoPlaySpeedChange: this.onDebugQaReplayAutoPlaySpeedChange,
      onDebugQaStripCalibrationChange: this.onDebugQaStripCalibrationChange,
      onDebugQaFilterInputChange: this.onDebugQaFilterInputChange,
      onDebugQaImportFileChange: this.onDebugQaImportFileChange,
      onHeroProfileNameInput: this.onHeroProfileNameInput,
      onHeroProfileAppearanceChange: this.onHeroProfileAppearanceChange,
      onFarmSeedSelectionChange: this.onFarmSeedSelectionChange,
    });

    if (this.hudRoot) {
      this.hudRoot.removeEventListener('click', this.onHudClick);
      this.hudRoot.innerHTML = '';
      this.hudRoot = null;
    }

    clearHudElementBindingsFromHud(this as unknown as Record<string, unknown>);
    resetHudTeardownStateFromHud(this);
  }
  private updateHud(): void {
    if (!this.hudRoot) {
      return;
    }

    this.syncHudSceneMode();
    const activeAreaLabel = this.getActiveAreaLabel();
    this.setHudText('day', `Jour ${this.hudState.day}`);
    this.setHudText('dayPhase', this.getDayPhaseLabel());
    this.setHudText('farmDay', `Jour ${this.hudState.day}`);
    this.setHudText('farmDayPhase', this.getDayPhaseLabel());
    this.setHudText('farmZone', activeAreaLabel);
    this.setHudText('gold', `${this.hudState.gold} po`);
    this.setHudText('level', `${this.hudState.level}`);
    this.setHudText('xp', `${this.hudState.xp} / ${this.hudState.xpToNext}`);
    this.setHudText('towerFloor', `${this.hudState.towerCurrentFloor} (best ${this.hudState.towerHighestFloor})`);
    this.setHudText('towerBoss10', this.hudState.towerBossFloor10Defeated ? 'Defeated' : 'Pending');
    this.setHudText(
      'blacksmithStatus',
      getBlacksmithStatusLabelFromVillageHud({
        blacksmithUnlocked: this.hudState.blacksmithUnlocked,
        blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      }),
    );
    this.setHudText('hp', `${this.formatValue(this.hudState.hp)} / ${this.formatValue(this.hudState.maxHp)}`);
    this.setHudText('mp', `${this.formatValue(this.hudState.mp)} / ${this.formatValue(this.hudState.maxMp)}`);
    this.setHudText('stamina', `${Math.max(0, Math.round(this.hudState.stamina))} / 8`);
    this.setHudText('area', activeAreaLabel);
    this.setHudText('authStatus', this.authStatus);
    this.updateHeroProfileHud();
    this.updateIntroHud();
    this.updateCombatHud();
    this.updateQuestHud();
    this.updateVillageNpcHud();
    this.updateBlacksmithHud();
    this.updateVillageMarketHud();
    this.updateFarmHud();
    this.updateVillageMvpHud();
    this.updateVillageShopPanel();
    this.updateFarmCraftingHud();
    this.updateLoopHud();
    this.updateTowerStoryHud();
    this.updateAutoSaveHud();
    this.updateSaveSlotsHud();
    this.updateDebugQaHud();
    this.updateDayPhaseVisual();

    if (this.loginButton) {
      this.loginButton.hidden = this.isAuthenticated;
    }

    if (this.logoutButton) {
      this.logoutButton.hidden = !this.isAuthenticated;
    }
  }

  private updateCombatHud(): void {
    this.setHudText('combatName', getCombatNameFromLogic(this.combatState, this.isAuthenticated));
    this.setHudText('combatStatus', getCombatStatusLabelFromLogic(this.combatStatus));
    this.setHudText('combatEncounterId', this.combatEncounterId ?? '-');
    this.setHudText('combatTurn', getCombatTurnLabelFromLogic(this.combatState));
    this.setHudText('combatRound', this.combatState ? `${this.combatState.round}` : '-');
    this.setHudText('combatResult', this.combatMessage);
    this.setHudText('combatRecap', getCombatRecapLabelFromLogic(this.combatState));
    this.setHudText('combatPlayerHp', getCombatUnitValueFromLogic(this.hudState.hp, this.hudState.maxHp));
    this.setHudText('combatPlayerMp', getCombatUnitValueFromLogic(this.hudState.mp, this.hudState.maxMp));
    this.renderCombatEffectChips('combatPlayerEffects', getCombatPlayerEffectChipsFromLogic(this.combatState));
    this.setHudText('combatEnemyName', this.combatState ? this.combatState.enemy.name : '-');
    this.renderCombatEnemySprite();
    this.setHudText('combatEnemyHp', getCombatEnemyValueFromLogic(this.combatState, 'hp'));
    this.setHudText('combatEnemyMp', getCombatEnemyValueFromLogic(this.combatState, 'mp'));
    this.renderCombatEffectChips('combatEnemyEffects', getCombatEnemyEffectChipsFromLogic(this.combatState));
    this.setHudText('combatTelemetry', getCombatTelemetryLabelFromLogic(this.combatState));
    this.renderCombatEnemyTelegraphs();

    if (this.combatStatusBadge) {
      this.combatStatusBadge.dataset.status = this.combatStatus;
    }

    if (this.combatErrorValue) {
      this.combatErrorValue.hidden = !this.combatError;
      this.combatErrorValue.textContent = this.combatError ?? '';
    }

    this.renderCombatLogs();
    this.updateCombatButtons();
  }

  private updateQuestHud(): void {
    if (this.questsSummaryValue) {
      this.questsSummaryValue.textContent = getQuestSummaryLabelFromFeature({
        isAuthenticated: this.isAuthenticated,
        questBusy: this.questBusy,
        quests: this.quests,
      });
    }

    if (this.questsErrorValue) {
      this.questsErrorValue.hidden = !this.questError;
      this.questsErrorValue.textContent = this.questError ?? '';
    }

    this.renderQuestList();
  }

  private updateVillageNpcHud(): void {
    if (this.villageNpcSummaryValue) {
      this.villageNpcSummaryValue.textContent = getVillageNpcSummaryLabelFromLogic({
        isAuthenticated: this.isAuthenticated,
        villageNpcState: this.villageNpcState,
        villageNpcRelationships: this.villageNpcRelationships,
      });
    }

    if (this.villageNpcMayorValue) {
      this.villageNpcMayorValue.textContent = getVillageNpcEntryLabelFromLogic({
        npcKey: 'mayor',
        villageNpcState: this.villageNpcState,
        villageNpcRelationships: this.villageNpcRelationships,
      });
    }

    if (this.villageNpcBlacksmithValue) {
      this.villageNpcBlacksmithValue.textContent = getVillageNpcEntryLabelFromLogic({
        npcKey: 'blacksmith',
        villageNpcState: this.villageNpcState,
        villageNpcRelationships: this.villageNpcRelationships,
      });
    }

    if (this.villageNpcMerchantValue) {
      this.villageNpcMerchantValue.textContent = getVillageNpcEntryLabelFromLogic({
        npcKey: 'merchant',
        villageNpcState: this.villageNpcState,
        villageNpcRelationships: this.villageNpcRelationships,
      });
    }

    if (this.villageNpcMayorDialogueValue) {
      this.villageNpcMayorDialogueValue.textContent = this.getVillageNpcDialogueLabel('mayor');
    }

    if (this.villageNpcBlacksmithDialogueValue) {
      this.villageNpcBlacksmithDialogueValue.textContent = this.getVillageNpcDialogueLabel('blacksmith');
    }

    if (this.villageNpcMerchantDialogueValue) {
      this.villageNpcMerchantDialogueValue.textContent = this.getVillageNpcDialogueLabel('merchant');
    }

    if (this.villageNpcErrorValue) {
      this.villageNpcErrorValue.hidden = !this.villageNpcError;
      this.villageNpcErrorValue.textContent = this.villageNpcError ?? '';
    }

    this.updateVillageNpcTalkButton('mayor', this.villageNpcTalkMayorButton);
    this.updateVillageNpcTalkButton('blacksmith', this.villageNpcTalkBlacksmithButton);
    this.updateVillageNpcTalkButton('merchant', this.villageNpcTalkMerchantButton);
  }

  private updateVillageNpcTalkButton(
    npcKey: VillageNpcKey,
    button: HTMLButtonElement | null,
  ): void {
    if (!button) {
      return;
    }

    const relation = this.villageNpcRelationships[npcKey];
    const npc = this.villageNpcState[npcKey];
    const canTalk = this.isAuthenticated && npc.available && relation.canTalkToday;
    button.disabled = this.villageNpcBusy || !canTalk;
    if (this.villageNpcBusy) {
      button.textContent = 'Parler...';
      return;
    }
    if (!this.isAuthenticated) {
      button.textContent = 'Login';
      return;
    }
    if (!npc.available) {
      button.textContent = 'Indispo';
      return;
    }
    button.textContent = relation.canTalkToday ? 'Parler' : 'Deja vu';
  }

  private updateBlacksmithHud(): void {
    if (this.blacksmithSummaryValue) {
      this.blacksmithSummaryValue.textContent = getBlacksmithShopSummaryLabelFromFeature({
        isAuthenticated: this.isAuthenticated,
        blacksmithUnlocked: this.hudState.blacksmithUnlocked,
        blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
        blacksmithBusy: this.blacksmithBusy,
        blacksmithOffersCount: this.blacksmithOffers.length,
        gold: this.hudState.gold,
      });
    }

    if (this.blacksmithErrorValue) {
      this.blacksmithErrorValue.hidden = !this.blacksmithError;
      this.blacksmithErrorValue.textContent = this.blacksmithError ?? '';
    }

    this.renderBlacksmithOffers();
  }

  private updateVillageMarketHud(): void {
    if (this.villageMarketSummaryValue) {
      this.villageMarketSummaryValue.textContent = this.getVillageMarketSummaryLabel();
    }

    if (this.villageMarketErrorValue) {
      this.villageMarketErrorValue.hidden = !this.villageMarketError;
      this.villageMarketErrorValue.textContent = this.villageMarketError ?? '';
    }

    this.renderVillageMarketOffers();
  }

  private updateFarmHud(): void {
    this.ensureSelectedFarmPlot();

    if (this.farmSummaryValue) {
      this.farmSummaryValue.textContent = this.getFarmSummaryLabel();
    }

    if (this.farmStorySummaryValue) {
      this.farmStorySummaryValue.textContent = this.getFarmStorySummaryLabel();
    }

    if (this.farmStoryNarrativeValue) {
      this.farmStoryNarrativeValue.textContent = this.getFarmStoryNarrativeLabel();
    }

    if (this.farmErrorValue) {
      this.farmErrorValue.hidden = !this.farmError;
      this.farmErrorValue.textContent = this.farmError ?? '';
    }

    if (this.farmSleepButton) {
      const canSleep = Boolean(this.isAuthenticated && this.farmState?.unlocked);
      this.farmSleepButton.disabled = !canSleep || this.farmBusy;
      this.farmSleepButton.textContent = this.farmBusy ? 'Dormir...' : 'Dormir (+1 jour)';
    }

    if (this.farmCraftingToggleButton) {
      this.farmCraftingToggleButton.disabled = !this.isAuthenticated || !this.farmState?.unlocked;
      this.farmCraftingToggleButton.textContent = this.farmCraftingPanelOpen ? 'Fermer craft' : 'Ouvrir craft';
    }

    if (this.farmGoVillageButton) {
      this.farmGoVillageButton.disabled = !this.isAuthenticated;
    }

    if (this.farmContextSeedValue) {
      this.farmContextSeedValue.textContent = getSelectedSeedLabelFromLogic(this.farmSelectedSeedItemKey);
    }

    if (this.farmContextReadyValue) {
      this.farmContextReadyValue.textContent = getFarmReadyPlotsLabelFromLogic(this.farmState);
    }

    this.updateFarmContextPanel();

    if (this.farmContextFeedbackValue) {
      const feedback = getFarmFeedbackLabelFromLogic({
        farmError: this.farmError,
        farmCraftingError: this.farmCraftingError,
        farmBusy: this.farmBusy,
        farmCraftingBusy: this.farmCraftingBusy,
        farmFeedbackMessage: this.farmFeedbackMessage,
        isAuthenticated: this.isAuthenticated,
        farmUnlocked: Boolean(this.farmState?.unlocked),
      });
      this.farmContextFeedbackValue.dataset.tone = this.farmError ? 'error' : 'info';
      this.farmContextFeedbackValue.textContent = feedback;
    }

    this.renderFarmPanel();
    if (this.frontSceneMode === 'farm') {
      this.renderFarmScene();
    }
  }

  private updateVillageMvpHud(): void {
    this.ensureVillageSelectedZone();

    if (this.villageObjectiveValue) {
      this.villageObjectiveValue.textContent = getVillageObjectiveLabelFromLogic({
        isAuthenticated: this.isAuthenticated,
        frontSceneMode: this.frontSceneMode,
        blacksmithUnlocked: this.hudState.blacksmithUnlocked,
        villageMarketUnlocked: this.villageMarketUnlocked,
      });
    }

    this.updateVillageContextPanel();

    if (this.villageContextFeedbackValue) {
      const hasError = Boolean(this.villageNpcError);
      this.villageContextFeedbackValue.dataset.tone = hasError ? 'error' : 'info';
      this.villageContextFeedbackValue.textContent = getVillageInteractionFeedbackLabelFromLogic({
        villageNpcError: this.villageNpcError,
        villageFeedbackMessage: this.villageFeedbackMessage,
        frontSceneMode: this.frontSceneMode,
        isAuthenticated: this.isAuthenticated,
        villageShopPanelOpen: this.villageShopControllerState.isOpen,
        villageShopType: this.villageShopControllerState.shopType,
      });
    }

    if (this.frontSceneMode === 'village') {
      this.renderVillageScene();
    }
  }

  private openVillageShopPanel(shopType: VillageShopType, feedbackMessage: string): void {
    this.villageShopControllerState = openVillageShopControllerPanelFromFeature(this.villageShopControllerState, shopType);
    this.villageFeedbackMessage = feedbackMessage;
    this.updateHud();
  }

  private closeVillageShopPanel(feedbackMessage?: string): void {
    const nextState = closeVillageShopControllerPanelFromFeature(this.villageShopControllerState);
    if (nextState === this.villageShopControllerState) {
      return;
    }

    this.villageShopControllerState = nextState;
    if (feedbackMessage) {
      this.villageFeedbackMessage = feedbackMessage;
    }
    this.updateHud();
  }

  private setVillageShopTab(tabKey: VillageShopTabKey): void {
    const nextState = setVillageShopControllerTabFromFeature(this.villageShopControllerState, tabKey);
    if (nextState === this.villageShopControllerState) {
      return;
    }

    this.villageShopControllerState = nextState;
    this.updateHud();
  }

  private selectVillageShopEntry(entryKey: string): void {
    const nextState = selectVillageShopControllerEntryFromFeature(this.villageShopControllerState, entryKey);
    if (nextState === this.villageShopControllerState) {
      return;
    }

    this.villageShopControllerState = nextState;
    this.updateHud();
  }

  private resolveVillageShopPanel(): VillageShopControllerResolution {
    const resolution = resolveVillageShopControllerFromFeature(this.villageShopControllerState, {
      frontSceneMode: this.frontSceneMode,
      isAuthenticated: this.isAuthenticated,
      hudGold: this.hudState.gold,
      villageMarketUnlocked: this.villageMarketUnlocked,
      villageMarketBusy: this.villageMarketBusy,
      villageMarketError: this.villageMarketError,
      villageMarketSeedOffers: this.villageMarketSeedOffers,
      villageMarketBuybackOffers: this.villageMarketBuybackOffers,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      blacksmithBusy: this.blacksmithBusy,
      blacksmithError: this.blacksmithError,
      blacksmithOffers: this.blacksmithOffers,
      villageNpcBusy: this.villageNpcBusy,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
      towerHighestFloor: this.hudState.towerHighestFloor,
    });
    this.villageShopControllerState = resolution.state;
    return resolution;
  }

  private updateVillageShopPanel(): void {
    if (!this.villageShopPanelRoot) {
      return;
    }

    const previousSignature = this.villageShopControllerState.renderSignature;
    const resolution = this.resolveVillageShopPanel();
    const viewModel = resolution.viewModel;
    this.villageShopPanelRoot.hidden = !viewModel.isVisible;
    if (!viewModel.isVisible || viewModel.renderSignature === previousSignature) {
      return;
    }

    if (this.villageShopNpcValue) {
      this.villageShopNpcValue.textContent = viewModel.npcLabel;
    }
    if (this.villageShopTitleValue) {
      this.villageShopTitleValue.textContent = viewModel.titleLabel;
    }
    if (this.villageShopSummaryValue) {
      this.villageShopSummaryValue.textContent = viewModel.summaryLabel;
    }

    if (this.villageShopTabsRoot) {
      renderVillageShopTabsFromFeature({
        root: this.villageShopTabsRoot,
        tabs: viewModel.tabs,
        activeTab: viewModel.activeTabKey,
      });
    }

    if (this.villageShopEntriesRoot) {
      renderVillageShopEntriesFromFeature({
        root: this.villageShopEntriesRoot,
        entries: viewModel.entries,
        villageShopType: viewModel.shopType,
        selectedEntryKey: viewModel.selectedEntryKey,
      });
    }

    updateVillageShopDetailsFromFeature({
      selectedEntry: viewModel.selectedEntry,
      activeError: viewModel.activeError,
      gold: this.hudState.gold,
      selectedEntryBusy: viewModel.selectedEntryBusy,
      talkButtonLabel: viewModel.talkButtonLabel,
      canTalk: !viewModel.talkButtonDisabled,
      detailNameValue: this.villageShopDetailNameValue,
      detailMetaValue: this.villageShopDetailMetaValue,
      detailDescriptionValue: this.villageShopDetailDescriptionValue,
      detailComparisonValue: this.villageShopDetailComparisonValue,
      errorValue: this.villageShopErrorValue,
      transactionValue: this.villageShopTransactionValue,
      confirmButton: this.villageShopConfirmButton,
      talkButton: this.villageShopTalkButton,
    });
  }

  private async handleVillageShopPrimaryAction(): Promise<void> {
    const action = this.resolveVillageShopPanel().viewModel.primaryAction;
    if (action.kind === 'select-offer' || action.kind === 'blocked') {
      this.villageFeedbackMessage = action.message;
      this.updateHud();
      return;
    }

    if (action.kind === 'buy-seed') {
      await this.buyVillageSeedOffer(action.offerKey);
      if (!this.villageMarketError) {
        this.villageFeedbackMessage = `${action.entry.name} achete au Marche.`;
      }
      this.updateHud();
      return;
    }

    if (action.kind === 'sell-crop') {
      await this.sellVillageCrop(action.itemKey);
      if (!this.villageMarketError) {
        this.villageFeedbackMessage = `${action.entry.name} vendu au Marche.`;
      }
      this.updateHud();
      return;
    }

    await this.buyBlacksmithOffer(action.offerKey);
    if (!this.blacksmithError) {
      this.villageFeedbackMessage = `${action.entry.name} commande a la Forge.`;
    }
    this.updateHud();
  }

  private async handleVillageShopTalkAction(): Promise<void> {
    const action = this.resolveVillageShopPanel().viewModel.talkAction;
    if (!action.canTalk) {
      this.villageFeedbackMessage = action.message ?? 'Interaction indisponible.';
      this.updateHud();
      return;
    }

    await this.interactVillageNpc(action.npcKey);
    if (!this.villageNpcError) {
      this.villageFeedbackMessage = action.npcKey === 'merchant'
        ? 'Discussion tenue avec la Marchande.'
        : 'Discussion tenue avec le Forgeron.';
    }
    this.updateHud();
  }

  private syncHudSceneMode(): void {
    if (!this.hudPanelRoot) {
      return;
    }

    const isFarm = this.frontSceneMode === 'farm';
    this.hudPanelRoot.classList.toggle('hud-panel-farm-mvp', isFarm);
    this.hudPanelRoot.classList.toggle('hud-panel-village-mvp', !isFarm);
  }

  private getActiveAreaLabel(): string {
    return this.frontSceneMode === 'farm' ? 'Ferme' : 'Village';
  }

  private updateVillageContextPanel(): void {
    const zone = getVillageZoneByKeyFromFeature(VILLAGE_SCENE_ZONES, this.villageSelectedZoneKey);
    const interactionState = zone
      ? getVillageZoneInteractionStateFromLogic({
          isAuthenticated: this.isAuthenticated,
          zone,
          villageMarketUnlocked: this.villageMarketUnlocked,
          blacksmithUnlocked: this.hudState.blacksmithUnlocked,
          blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
          villageNpcState: this.villageNpcState,
          villageNpcRelationships: this.villageNpcRelationships,
        })
      : null;
    updateVillageContextPanelFromFeature({
      zone,
      interactionState,
      isVillageMode: this.frontSceneMode === 'village',
      zoneCount: VILLAGE_SCENE_ZONES.length,
      titleValue: this.villageContextTitleValue,
      roleValue: this.villageContextRoleValue,
      hintValue: this.villageContextHintValue,
      interactButton: this.villageContextInteractButton,
      cycleButton: this.villageContextCycleButton,
    });
  }

  private updateFarmCraftingHud(): void {
    if (this.farmCraftingPanel) {
      this.farmCraftingPanel.hidden = !this.farmCraftingPanelOpen;
    }

    if (this.farmCraftingSummaryValue) {
      this.farmCraftingSummaryValue.textContent = this.getFarmCraftingSummaryLabel();
    }

    if (this.farmCraftingErrorValue) {
      this.farmCraftingErrorValue.hidden = !this.farmCraftingError;
      this.farmCraftingErrorValue.textContent = this.farmCraftingError ?? '';
    }

    this.renderFarmCraftingRecipes();
  }

  private updateLoopHud(): void {
    updateLoopHudFromFeature({
      loopSummaryLabel: getLoopSummaryLabelFromFeature({
        isAuthenticated: this.isAuthenticated,
        loopBusy: this.loopBusy,
        loopState: this.loopState,
      }),
      loopStageLabel: this.loopState?.stageLabel ?? '-',
      loopSuppliesLabel: getLoopSuppliesLabelFromFeature(this.loopState),
      loopPreparationLabel: getLoopPreparationLabelFromFeature(this.loopState),
      loopBlockersLabel: getLoopBlockersLabelFromFeature(this.loopState),
      loopError: this.loopError,
      canPrepare: Boolean(this.isAuthenticated && this.loopState?.preparation.ready),
      loopBusy: this.loopBusy,
      summaryValue: this.loopSummaryValue,
      stageValue: this.loopStageValue,
      suppliesValue: this.loopSuppliesValue,
      prepValue: this.loopPrepValue,
      blockersValue: this.loopBlockersValue,
      errorValue: this.loopErrorValue,
      prepareButton: this.loopPrepareButton,
    });
  }

  private updateTowerStoryHud(): void {
    if (this.towerStorySummaryValue) {
      this.towerStorySummaryValue.textContent = this.getTowerStorySummaryLabel();
    }
    if (this.towerStoryNarrativeValue) {
      this.towerStoryNarrativeValue.textContent = this.getTowerStoryNarrativeLabel();
    }
  }

  private updateAutoSaveHud(): void {
    updateAutoSaveHudFromFeature({
      summaryLabel: getAutoSaveSummaryLabelFromFeature({
        isAuthenticated: this.isAuthenticated,
        autosaveBusy: this.autosaveBusy,
        autosave: this.autosave,
      }),
      metaLabel: getAutoSaveMetaLabelFromFeature({
        isAuthenticated: this.isAuthenticated,
        autosave: this.autosave,
        formatIsoForHud: (value) => this.formatIsoForHud(value),
      }),
      autosaveError: this.autosaveError,
      summaryValue: this.autosaveSummaryValue,
      metaValue: this.autosaveMetaValue,
      errorValue: this.autosaveErrorValue,
    });
    this.renderAutoSaveActions();
  }

  private updateSaveSlotsHud(): void {
    updateSaveSlotsHudFromFeature({
      summaryLabel: getSaveSlotsSummaryLabelFromFeature({
        isAuthenticated: this.isAuthenticated,
        saveSlotsBusy: this.saveSlotsBusy,
        saveSlots: this.saveSlots,
      }),
      saveSlotsError: this.saveSlotsError,
      summaryValue: this.saveSlotsSummaryValue,
      errorValue: this.saveSlotsErrorValue,
    });
    this.renderSaveSlotsList();
  }

  private updateHeroProfileHud(): void {
    updateHeroProfileHudFromFeature({
      isAuthenticated: this.isAuthenticated,
      heroProfileBusy: this.heroProfileBusy,
      heroProfileNameDraft: this.heroProfileNameDraft,
      heroProfileAppearanceDraft: this.heroProfileAppearanceDraft,
      heroProfile: this.heroProfile,
      heroProfileMessage: this.heroProfileMessage,
      heroProfileError: this.heroProfileError,
      heroProfileSummaryLabel: getHeroProfileSummaryLabelFromIntro({
        isAuthenticated: this.isAuthenticated,
        heroProfileBusy: this.heroProfileBusy,
        heroProfile: this.heroProfile,
        getHeroAppearanceLabel: (key) => getHeroAppearanceLabelFromIntro(key, HERO_APPEARANCE_OPTIONS),
      }),
      summaryValue: this.heroProfileSummaryValue,
      nameInput: this.heroProfileNameInput,
      appearanceSelect: this.heroProfileAppearanceSelect,
      saveButton: this.heroProfileSaveButton,
      messageValue: this.heroProfileMessageValue,
      errorValue: this.heroProfileErrorValue,
    });
  }

  private updateIntroHud(): void {
    updateIntroHudFromFeature({
      isAuthenticated: this.isAuthenticated,
      introNarrativeBusy: this.introNarrativeBusy,
      introNarrativeState: this.introNarrativeState,
      introNarrativeError: this.introNarrativeError,
      introSummaryLabel: getIntroSummaryLabelFromIntro({
        isAuthenticated: this.isAuthenticated,
        introNarrativeBusy: this.introNarrativeBusy,
        introNarrativeState: this.introNarrativeState,
      }),
      introNarrativeLabel: getIntroNarrativeLabelFromIntro(this.isAuthenticated, this.introNarrativeState),
      introHintLabel: getIntroHintLabelFromIntro(this.isAuthenticated, this.introNarrativeState),
      introProgressLabel: getIntroProgressLabelFromIntro(this.introNarrativeState),
      introAdvanceButtonLabel: getIntroAdvanceButtonLabelFromIntro(this.isAuthenticated, this.introNarrativeState),
      summaryValue: this.introSummaryValue,
      narrativeValue: this.introNarrativeValue,
      hintValue: this.introHintValue,
      progressValue: this.introProgressValue,
      advanceButton: this.introAdvanceButton,
      errorValue: this.introErrorValue,
    });
  }

  private updateGamepadInput(): void {
    const gamepad = getPrimaryConnectedGamepadFromCommon();
    if (!gamepad) {
      if (this.gamepadPreviousButtonStates.length > 0 || this.gamepadHudFocusIndex !== -1) {
        this.resetGamepadInputState();
      }
      return;
    }

    this.syncGamepadHudFocusables(false);
    const consumption = consumeGamepadJustPressedButtonsFromCommon(gamepad, this.gamepadPreviousButtonStates);
    this.gamepadPreviousButtonStates = consumption.nextStates;
    const justPressedButtons = consumption.justPressed;
    if (justPressedButtons.size === 0) {
      return;
    }

    const navigationStep = computeGamepadNavigationStepFromCommon(justPressedButtons, {
      up: GAMEPAD_BUTTON_DPAD_UP,
      left: GAMEPAD_BUTTON_DPAD_LEFT,
      down: GAMEPAD_BUTTON_DPAD_DOWN,
      right: GAMEPAD_BUTTON_DPAD_RIGHT,
      leftBumper: GAMEPAD_BUTTON_LEFT_BUMPER,
      rightBumper: GAMEPAD_BUTTON_RIGHT_BUMPER,
    });
    if (navigationStep !== 0) {
      this.moveGamepadHudFocus(navigationStep);
    }

    this.handleGamepadCombatShortcuts(justPressedButtons);

    if (justPressedButtons.has(GAMEPAD_BUTTON_A)) {
      if (this.activateFocusedGamepadHudElement()) {
        return;
      }

      if (
        this.isAuthenticated &&
        this.combatState &&
        this.combatState.status === 'active' &&
        this.combatState.turn === 'player' &&
        this.tryPerformCombatActionFromGamepad('attack')
      ) {
        return;
      }

      if (this.combatStartButton && !this.combatStartButton.disabled) {
        void this.startCombat();
      }
    }
  }

  private syncGamepadHudFocusables(focusDomElement: boolean): void {
    const previousFocusedElement =
      this.gamepadHudFocusIndex >= 0 ? this.gamepadHudFocusableElements[this.gamepadHudFocusIndex] ?? null : null;
    const focusables = getGamepadHudFocusableElementsFromCommon(this.hudRoot);
    this.gamepadHudFocusableElements = focusables;

    if (focusables.length === 0) {
      clearGamepadHudFocusFromCommon(this.hudRoot);
      this.gamepadHudFocusIndex = -1;
      return;
    }

    this.gamepadHudFocusIndex = resolveRetainedGamepadHudFocusIndexFromCommon({
      focusables,
      currentIndex: this.gamepadHudFocusIndex,
      previousFocusedElement,
    });
    applyGamepadHudFocusStateFromCommon({
      focusables,
      focusIndex: this.gamepadHudFocusIndex,
      focusDomElement,
    });
  }

  private handleGamepadCombatShortcuts(justPressedButtons: Set<number>): void {
    if (!this.isAuthenticated) {
      return;
    }

    if (
      !this.combatState ||
      this.combatState.status !== 'active' ||
      this.combatState.turn !== 'player'
    ) {
      if (
        justPressedButtons.has(GAMEPAD_BUTTON_Y) &&
        this.combatStartButton &&
        !this.combatStartButton.disabled
      ) {
        void this.startCombat();
      }
      return;
    }

    if (justPressedButtons.has(GAMEPAD_BUTTON_X)) {
      this.tryPerformCombatActionFromGamepad('attack');
    }
    if (justPressedButtons.has(GAMEPAD_BUTTON_Y)) {
      this.tryPerformCombatActionFromGamepad('defend');
    }
    if (justPressedButtons.has(GAMEPAD_BUTTON_B)) {
      this.tryPerformCombatActionFromGamepad('fireball');
    }
  }

  private tryPerformCombatActionFromGamepad(action: CombatActionName): boolean {
    const buttonByAction: Partial<Record<CombatActionName, HTMLButtonElement | null>> = {
      attack: this.combatAttackButton,
      defend: this.combatDefendButton,
      fireball: this.combatFireballButton,
      rally: this.combatRallyButton,
      sunder: this.combatSunderButton,
      mend: this.combatMendButton,
      cleanse: this.combatCleanseButton,
      interrupt: this.combatInterruptButton,
    };

    const button = buttonByAction[action];
    if (!button || button.disabled) {
      return false;
    }

    void this.performCombatAction(action);
    return true;
  }

  private moveGamepadHudFocus(step: number): void {
    this.syncGamepadHudFocusables(false);
    const total = this.gamepadHudFocusableElements.length;
    if (total === 0) {
      return;
    }

    this.gamepadHudFocusIndex = getWrappedGamepadHudFocusIndexFromCommon(this.gamepadHudFocusIndex, total, step);
    applyGamepadHudFocusStateFromCommon({
      focusables: this.gamepadHudFocusableElements,
      focusIndex: this.gamepadHudFocusIndex,
      focusDomElement: true,
    });
  }

  private activateFocusedGamepadHudElement(): boolean {
    this.syncGamepadHudFocusables(false);
    const total = this.gamepadHudFocusableElements.length;
    if (total === 0) {
      return false;
    }

    if (this.gamepadHudFocusIndex < 0 || this.gamepadHudFocusIndex >= total) {
      this.gamepadHudFocusIndex = 0;
      applyGamepadHudFocusStateFromCommon({
        focusables: this.gamepadHudFocusableElements,
        focusIndex: this.gamepadHudFocusIndex,
        focusDomElement: true,
      });
      return false;
    }

    return activateGamepadHudElementFromCommon(this.gamepadHudFocusableElements[this.gamepadHudFocusIndex] ?? null);
  }

  private resetGamepadInputState(): void {
    this.gamepadPreviousButtonStates = [];
    this.gamepadHudFocusableElements = [];
    clearGamepadHudFocusFromCommon(this.hudRoot);
    this.gamepadHudFocusIndex = -1;
  }

  private updateDebugQaHud(): void {
    if (!this.debugQaEnabled || !this.debugQaPanelRoot) {
      return;
    }
    updateDebugQaHudFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      debugQaStatus: this.debugQaStatus,
      debugQaBusyAction: this.debugQaBusyAction,
      isAuthenticated: this.isAuthenticated,
      debugQaError: this.debugQaError,
      debugQaMessage: this.debugQaMessage,
      scriptedIntentsDisplayText: this.getDebugQaScriptedIntentsDisplayText(),
      debugQaRecapOutcomeFilter: this.debugQaRecapOutcomeFilter,
      debugQaRecapEnemyFilter: this.debugQaRecapEnemyFilter,
      debugQaScriptEnemyFilter: this.debugQaScriptEnemyFilter,
      debugQaScriptIntentFilter: this.debugQaScriptIntentFilter,
      debugQaReplayAutoPlaySpeed: this.debugQaReplayAutoPlaySpeed,
      stripCalibrationPreset: this.stripCalibrationPreset,
      hasImportedTrace: Boolean(this.debugQaImportedTrace),
      stepReplayState: this.debugQaStepReplayState,
      replayAutoPlayActive: this.debugQaReplayAutoPlayIntervalId !== null,
      statusValue: this.debugQaStatusValue,
      messageValue: this.debugQaMessageValue,
      scriptedIntentsOutput: this.debugQaScriptedIntentsOutput,
      grantXpInput: this.debugQaGrantXpInput,
      grantGoldInput: this.debugQaGrantGoldInput,
      towerFloorInput: this.debugQaTowerFloorInput,
      statePresetSelect: this.debugQaStatePresetSelect,
      questKeyInput: this.debugQaQuestKeyInput,
      questStatusSelect: this.debugQaQuestStatusSelect,
      loadoutPresetSelect: this.debugQaLoadoutPresetSelect,
      worldFlagsInput: this.debugQaWorldFlagsInput,
      worldFlagsRemoveInput: this.debugQaWorldFlagsRemoveInput,
      worldFlagsReplaceInput: this.debugQaWorldFlagsReplaceInput,
      recapOutcomeFilterSelect: this.debugQaRecapOutcomeFilterSelect,
      recapEnemyFilterInput: this.debugQaRecapEnemyFilterInput,
      scriptEnemyFilterInput: this.debugQaScriptEnemyFilterInput,
      scriptIntentFilterInput: this.debugQaScriptIntentFilterInput,
      grantButton: this.debugQaGrantButton,
      towerFloorButton: this.debugQaTowerFloorButton,
      statePresetButton: this.debugQaStatePresetButton,
      setQuestStatusButton: this.debugQaSetQuestStatusButton,
      loadoutButton: this.debugQaLoadoutButton,
      completeQuestsButton: this.debugQaCompleteQuestsButton,
      setWorldFlagsButton: this.debugQaSetWorldFlagsButton,
      scriptedIntentsButton: this.debugQaScriptedIntentsButton,
      importButton: this.debugQaImportButton,
      replayButton: this.debugQaReplayButton,
      replayStepStartButton: this.debugQaReplayStepStartButton,
      replayStepNextButton: this.debugQaReplayStepNextButton,
      replayAutoPlayButton: this.debugQaReplayAutoPlayButton,
      replayAutoPlaySpeedSelect: this.debugQaReplayAutoPlaySpeedSelect,
      replayStepStopButton: this.debugQaReplayStepStopButton,
      stripCalibrationSelect: this.debugQaStripCalibrationSelect,
      stripCalibrationButton: this.debugQaStripCalibrationButton,
      importFileInput: this.debugQaImportFileInput,
      exportButton: this.debugQaExportButton,
      exportMarkdownButton: this.debugQaExportMarkdownButton,
    });
  }

  private renderAutoSaveActions(): void {
    if (!this.autosaveActionsRoot) {
      return;
    }

    const signature = this.computeAutoSaveRenderSignature();
    if (signature === this.autosaveRenderSignature) {
      return;
    }
    this.autosaveRenderSignature = signature;
    renderAutoSaveActionsFromFeature({
      root: this.autosaveActionsRoot,
      isAuthenticated: this.isAuthenticated,
      hasAutosave: Boolean(this.autosave),
      autosaveBusy: this.autosaveBusy,
      autosaveRestoreSlotBusy: this.autosaveRestoreSlotBusy,
    });
  }

  private renderSaveSlotsList(): void {
    if (!this.saveSlotsListRoot) {
      return;
    }

    const signature = this.computeSaveSlotsRenderSignature();
    if (signature === this.saveSlotsRenderSignature) {
      return;
    }
    this.saveSlotsRenderSignature = signature;
    const slotStates = getSafeSlotStatesFromFeature(this.saveSlots);
    renderSaveSlotsListFromFeature({
      root: this.saveSlotsListRoot,
      isAuthenticated: this.isAuthenticated,
      slotStates,
      saveSlotsBusy: this.saveSlotsBusy,
      saveSlotsActionBusyKey: this.saveSlotsActionBusyKey,
      saveSlotsLoadConfirmSlot: this.saveSlotsLoadConfirmSlot,
      getSaveSlotMetaLabel: (slotState) => getSaveSlotMetaLabelFromFeature({
        slotState,
        formatIsoForHud: (value) => this.formatIsoForHud(value),
      }),
      getSaveSlotStatsPreviewLabel: (slotState) => getSaveSlotStatsPreviewLabelFromFeature(slotState),
      getSaveSlotInventoryPreviewLabel: (slotState) => getSaveSlotInventoryPreviewLabelFromFeature(slotState),
      getSaveSlotEquipmentPreviewLabel: (slotState) => getSaveSlotEquipmentPreviewLabelFromFeature(slotState),
    });
  }

  private renderBlacksmithOffers(): void {
    if (!this.blacksmithOffersRoot) {
      return;
    }

    const signature = this.computeBlacksmithRenderSignature();
    if (signature === this.blacksmithRenderSignature) {
      return;
    }
    this.blacksmithRenderSignature = signature;
    renderBlacksmithOffersFromFeature({
      root: this.blacksmithOffersRoot,
      isAuthenticated: this.isAuthenticated,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      blacksmithBusy: this.blacksmithBusy,
      gold: this.hudState.gold,
      offers: this.blacksmithOffers,
    });
  }

  private renderVillageMarketOffers(): void {
    const seedsRoot = this.villageMarketSeedsRoot;
    const buybackRoot = this.villageMarketBuybackRoot;
    if (!seedsRoot || !buybackRoot) {
      return;
    }

    const signature = this.computeVillageMarketRenderSignature();
    if (signature === this.villageMarketRenderSignature) {
      return;
    }
    this.villageMarketRenderSignature = signature;
    renderVillageMarketOffersFromFeature({
      seedsRoot,
      buybackRoot,
      isAuthenticated: this.isAuthenticated,
      villageMarketUnlocked: this.villageMarketUnlocked,
      villageMarketBusy: this.villageMarketBusy,
      gold: this.hudState.gold,
      seedOffers: this.villageMarketSeedOffers,
      buybackOffers: this.villageMarketBuybackOffers,
    });
  }

  private renderFarmPanel(): void {
    const seedSelect = this.farmSeedSelect;
    const plotsRoot = this.farmPlotsRoot;
    if (!seedSelect || !plotsRoot) {
      return;
    }

    const signature = this.computeFarmRenderSignature();
    if (signature === this.farmRenderSignature) {
      return;
    }
    this.farmRenderSignature = signature;
    const result = renderFarmPanelFromFeature({
      seedSelect,
      plotsRoot,
      isAuthenticated: this.isAuthenticated,
      farmBusy: this.farmBusy,
      farmState: this.farmState,
      selectedSeedItemKey: this.farmSelectedSeedItemKey,
      selectedPlotKey: this.farmSelectedPlotKey,
      formatFarmLabel: (raw) => this.formatFarmLabel(raw),
      getFarmPlotPhaseLabel: (plot) => getFarmPlotPhaseLabelFromLogic(plot),
      getFarmPlotStatusLabel: (plot) => this.getFarmPlotStatusLabel(plot),
    });
    this.farmSelectedSeedItemKey = result.selectedSeedItemKey;
  }

  private renderFarmCraftingRecipes(): void {
    const craftingRoot = this.farmCraftingListRoot;
    if (!craftingRoot) {
      return;
    }

    const signature = this.computeFarmCraftingRenderSignature();
    if (signature === this.farmCraftingRenderSignature) {
      return;
    }
    this.farmCraftingRenderSignature = signature;
    renderFarmCraftingRecipesFromFeature({
      craftingRoot,
      isAuthenticated: this.isAuthenticated,
      farmCraftingBusy: this.farmCraftingBusy,
      farmBusy: this.farmBusy,
      craftingState: this.farmCraftingState,
      formatFarmLabel: (raw) => this.formatFarmLabel(raw),
    });
  }

  private renderQuestList(): void {
    if (!this.questsListRoot) {
      return;
    }

    const signature = this.computeQuestRenderSignature();
    if (signature === this.questsRenderSignature) {
      return;
    }
    this.questsRenderSignature = signature;
    renderQuestListFromFeature({
      root: this.questsListRoot,
      isAuthenticated: this.isAuthenticated,
      questBusy: this.questBusy,
      quests: this.quests,
      getQuestStatusLabel: (status) => this.getQuestStatusLabel(status),
    });
  }

  private getVillageMarketSummaryLabel(): string {
    return getVillageMarketSummaryLabelFromFeature({
      isAuthenticated: this.isAuthenticated,
      villageMarketUnlocked: this.villageMarketUnlocked,
      villageMarketBusy: this.villageMarketBusy,
      villageMarketSeedOffersCount: this.villageMarketSeedOffers.length,
      villageMarketBuybackOffersCount: this.villageMarketBuybackOffers.length,
    });
  }

  private getFarmSummaryLabel(): string {
    return getFarmSummaryLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      farmBusy: this.farmBusy,
      farmState: this.farmState,
    });
  }

  private getFarmStorySummaryLabel(): string {
    return getFarmStorySummaryLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      farmBusy: this.farmBusy,
      farmStoryState: this.farmStoryState,
    });
  }

  private getFarmStoryNarrativeLabel(): string {
    return getFarmStoryNarrativeLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      farmBusy: this.farmBusy,
      farmStoryState: this.farmStoryState,
    });
  }

  private getFarmCraftingSummaryLabel(): string {
    return getFarmCraftingSummaryLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      farmCraftingBusy: this.farmCraftingBusy,
      farmCraftingState: this.farmCraftingState,
    });
  }

  private getTowerStorySummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (!this.towerStoryState) {
      return this.questBusy ? 'Loading...' : 'No data';
    }

    const towerStory = this.towerStoryState;
    return `Reported ${towerStory.reportedEvents}/${towerStory.totalEvents} | Reached ${towerStory.reachedEvents}/${towerStory.totalEvents}`;
  }

  private getTowerStoryNarrativeLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connecte toi pour suivre les beats narratifs lies aux paliers de tour.';
    }

    if (!this.towerStoryState) {
      return 'Aucune donnee Tower Story chargee.';
    }

    return `${this.towerStoryState.activeEventTitle}: ${this.towerStoryState.activeEventNarrative}`;
  }

  private getFarmPlotStatusLabel(plot: FarmPlotStateLike): string {
    return getFarmPlotStatusLabelFromLogic(plot);
  }

  private formatFarmLabel(raw: string): string {
    return formatFarmLabelFromLogic(raw);
  }

  private computeQuestRenderSignature(): string {
    const questParts = this.quests.map((quest) => {
      const objectiveParts = quest.objectives.map((objective) => (
        `${objective.key}:${objective.current}/${objective.target}:${objective.completed ? '1' : '0'}`
      ));

      return `${quest.key}:${quest.status}:${quest.canClaim ? '1' : '0'}:${objectiveParts.join(',')}`;
    });

    return [
      this.isAuthenticated ? '1' : '0',
      this.questBusy ? '1' : '0',
      this.questError ?? '',
      questParts.join(';'),
    ].join('|');
  }

  private computeBlacksmithRenderSignature(): string {
    const offers = this.blacksmithOffers.map((offer) => (
      `${offer.offerKey}:${offer.goldPrice}:${offer.name}:${offer.description}:${offer.tier}:${offer.requiredFlags.join(',')}`
    ));

    return [
      this.isAuthenticated ? '1' : '0',
      this.blacksmithBusy ? '1' : '0',
      this.hudState.blacksmithUnlocked ? '1' : '0',
      this.hudState.blacksmithCurseLifted ? '1' : '0',
      this.hudState.gold,
      this.blacksmithError ?? '',
      offers.join(';'),
    ].join('|');
  }

  private computeVillageMarketRenderSignature(): string {
    const seedParts = this.villageMarketSeedOffers.map((offer) => (
      `${offer.offerKey}:${offer.goldPrice}:${offer.name}:${offer.description}`
    ));
    const buybackParts = this.villageMarketBuybackOffers.map((offer) => (
      `${offer.itemKey}:${offer.goldValue}:${offer.ownedQuantity}:${offer.name}`
    ));

    return [
      this.isAuthenticated ? '1' : '0',
      this.villageMarketUnlocked ? '1' : '0',
      this.villageMarketBusy ? '1' : '0',
      this.hudState.gold,
      this.villageMarketError ?? '',
      seedParts.join(';'),
      buybackParts.join(';'),
    ].join('|');
  }

  private computeFarmRenderSignature(): string {
    const farm = this.farmState;
    const cropParts = farm
      ? farm.cropCatalog.map((entry) => (
          `${entry.cropKey}:${entry.seedItemKey}:${entry.growthDays}:${entry.unlocked ? '1' : '0'}`
        ))
      : [];
    const plotParts = farm
      ? farm.plots.map((plot) => (
          `${plot.plotKey}:${plot.row}:${plot.col}:${plot.cropKey ?? '-'}:${plot.growthProgressDays}:${plot.growthDays ?? '-'}:${plot.daysToMaturity ?? '-'}:${plot.wateredToday ? '1' : '0'}:${plot.readyToHarvest ? '1' : '0'}`
        ))
      : [];

    return [
      this.isAuthenticated ? '1' : '0',
      this.farmBusy ? '1' : '0',
      this.farmError ?? '',
      this.farmSelectedSeedItemKey,
      this.farmSelectedPlotKey ?? '',
      this.farmCraftingPanelOpen ? '1' : '0',
      farm
        ? `${farm.unlocked ? '1' : '0'}:${farm.totalPlots}:${farm.plantedPlots}:${farm.wateredPlots}:${farm.readyPlots}`
        : 'none',
      cropParts.join(';'),
      plotParts.join(';'),
    ].join('|');
  }

  private computeFarmCraftingRenderSignature(): string {
    const crafting = this.farmCraftingState;
    const recipeParts = crafting
      ? crafting.recipes.map((recipe) => (
          `${recipe.recipeKey}:${recipe.unlocked ? '1' : '0'}:${recipe.maxCraftable}:${recipe.outputItemKey}:${recipe.outputQuantity}:${recipe.ingredients.map((entry) => `${entry.itemKey}:${entry.ownedQuantity}/${entry.requiredQuantity}`).join(',')}`
        ))
      : [];

    return [
      this.isAuthenticated ? '1' : '0',
      this.farmCraftingBusy ? '1' : '0',
      this.farmBusy ? '1' : '0',
      this.farmCraftingError ?? '',
      crafting ? `${crafting.unlocked ? '1' : '0'}:${crafting.craftableRecipes}` : 'none',
      recipeParts.join(';'),
    ].join('|');
  }

  private computeAutoSaveRenderSignature(): string {
    return computeAutoSaveRenderSignatureFromFeature({
      isAuthenticated: this.isAuthenticated,
      autosaveBusy: this.autosaveBusy,
      autosaveRestoreSlotBusy: this.autosaveRestoreSlotBusy,
      autosaveError: this.autosaveError,
      autosave: this.autosave,
    });
  }

  private computeSaveSlotsRenderSignature(): string {
    return computeSaveSlotsRenderSignatureFromFeature({
      isAuthenticated: this.isAuthenticated,
      saveSlotsBusy: this.saveSlotsBusy,
      saveSlotsActionBusyKey: this.saveSlotsActionBusyKey,
      saveSlotsLoadConfirmSlot: this.saveSlotsLoadConfirmSlot,
      saveSlotsError: this.saveSlotsError,
      slotStates: getSafeSlotStatesFromFeature(this.saveSlots),
    });
  }

  private getQuestStatusLabel(status: QuestStatus): string {
    return getQuestStatusLabelFromFeature(status);
  }

  private updateCombatButtons(): void {
    const availability = computeCombatActionAvailabilityFromFeature({
      isAuthenticated: this.isAuthenticated,
      combatState: this.combatState,
      isPlayerDarkened: getCombatStatusTurnsFromLogic(this.combatState, 'playerDarkenedTurns') > 0,
      hasCleanseableDebuffs: hasCleanseableDebuffsFromLogic(this.combatState),
      hasInterruptibleEnemyIntent: hasInterruptibleEnemyIntentFromLogic(this.combatState),
    });

    if (this.combatStartButton) {
      this.combatStartButton.disabled = !this.isAuthenticated || this.combatBusy;
    }

    if (this.combatAttackButton) {
      this.combatAttackButton.disabled = !availability.playerTurn || this.combatBusy;
    }

    if (this.combatDefendButton) {
      this.combatDefendButton.disabled = !availability.playerTurn || this.combatBusy;
    }

    if (this.combatFireballButton) {
      this.combatFireballButton.disabled = !availability.fireballReady || this.combatBusy;
    }

    if (this.combatMendButton) {
      this.combatMendButton.disabled = !availability.effectiveMendReady || this.combatBusy;
    }

    if (this.combatCleanseButton) {
      this.combatCleanseButton.disabled = !availability.cleanseReady || this.combatBusy;
    }

    if (this.combatInterruptButton) {
      this.combatInterruptButton.disabled = !availability.interruptReady || this.combatBusy;
    }

    if (this.combatRallyButton) {
      this.combatRallyButton.disabled = !availability.rallyReady || this.combatBusy;
    }

    if (this.combatSunderButton) {
      this.combatSunderButton.disabled = !availability.sunderReady || this.combatBusy;
    }

    if (this.combatForfeitButton) {
      this.combatForfeitButton.disabled = !availability.active || this.combatBusy;
    }
  }

  private renderCombatLogs(): void {
    if (!this.combatLogsList) {
      return;
    }
    renderCombatLogsFromFeature({
      root: this.combatLogsList,
      combatLogs: this.combatLogs,
      fallback: this.getCombatLogsFallback(),
    });
  }

  private getCombatLogsFallback(): string {
    return getCombatLogsFallbackFromFeature({
      isAuthenticated: this.isAuthenticated,
      combatBusy: this.combatBusy,
      hasCombatState: Boolean(this.combatState),
    });
  }

  private setHudText(key: string, value: string): void {
    const element = this.hudRoot?.querySelector<HTMLElement>(`[data-hud="${key}"]`);
    if (element) {
      element.textContent = value;
    }
  }

  private renderCombatEffectChips(key: string, effects: CombatEffectChip[]): void {
    const element = this.hudRoot?.querySelector<HTMLElement>(`[data-hud="${key}"]`);
    if (!element) {
      return;
    }
    renderCombatEffectChipsFromFeature({
      element,
      effects,
    });
  }

  private renderCombatEnemySprite(): void {
    const stripElement = this.hudRoot?.querySelector<HTMLElement>('[data-hud="combatEnemyStrip"]');
    const image = this.hudRoot?.querySelector<HTMLImageElement>('[data-hud="combatEnemySprite"]');
    const fallback = this.hudRoot?.querySelector<HTMLElement>('[data-hud="combatEnemySpriteFallback"]');
    if (!stripElement || !image || !fallback) {
      return;
    }

    const enemy = this.combatState?.enemy;
    const preferredAnimation = this.getEnemyHudStripPreferredAnimation();
    const enemyStrip = enemy ? this.getStripManifestEntry(enemy.key) : null;
    const portraitPath = enemy ? this.getCombatEnemyPortraitPath(enemy.key, preferredAnimation) : null;
    const spritePath = enemy ? this.getCombatEnemySpritePath(enemy.key) : null;

    renderCombatEnemySpriteFromFeature({
      stripElement,
      image,
      fallback,
      enemy: enemy ? { key: enemy.key, name: enemy.name } : null,
      preferredAnimation,
      enemyStrip,
      portraitPath,
      spritePath,
      stopEnemyHudStripPlayback: () => this.stopEnemyHudStripPlayback(),
      startEnemyHudStripPlayback: (element, enemyKey, strip, animation) =>
        this.startEnemyHudStripPlayback(element, enemyKey, strip, animation),
      toPortraitStateKey: (animation) => this.toPortraitStateKey(animation),
    });
  }

  private getEnemyHudStripPreferredAnimation(): StripAnimationName {
    return getEnemyHudStripPreferredAnimationFromFeature({
      enemyHudStripOverrideAnimation: this.enemyHudStripOverrideAnimation,
      combatState: this.combatState,
    });
  }

  private startEnemyHudStripPlayback(
    element: HTMLElement,
    enemyKey: string,
    strip: SpriteManifestStripEntry,
    animation: StripAnimationName,
  ): void {
    const frames = this.getStripFrames(strip, animation);
    if (frames.length === 0) {
      this.stopEnemyHudStripPlayback();
      return;
    }

    const shouldKeepCurrent =
      this.enemyHudStripPlayback?.enemyKey === enemyKey &&
      this.enemyHudStripPlayback?.stripKey === strip.key &&
      this.enemyHudStripPlayback?.animation === animation;

    if (shouldKeepCurrent) {
      return;
    }

    this.stopEnemyHudStripPlayback();

    const frameCount = Math.max(1, strip.frameCount);
    element.style.backgroundImage = `url("${this.resolveSpriteAssetPath(strip.path)}")`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundSize = `${frameCount * 100}% 100%`;
    this.applyEnemyHudStripFrame(element, frames[0] ?? 0, frameCount);

    this.enemyHudStripPlayback = {
      enemyKey,
      stripKey: strip.key,
      animation,
      frames,
      frameCount,
      frameCursor: 0,
    };
    element.dataset.enemyKey = enemyKey;
    element.dataset.stripAnimation = animation;

    if (frames.length <= 1) {
      return;
    }

    const hudTimings = this.getStripHudTimings(strip);
    const intervalMs =
      animation === 'hit'
        ? hudTimings.hitIntervalMs
        : animation === 'cast'
          ? hudTimings.castIntervalMs
          : hudTimings.idleIntervalMs;

    this.enemyHudStripIntervalId = window.setInterval(() => {
      if (!this.enemyHudStripPlayback) {
        return;
      }

      this.enemyHudStripPlayback.frameCursor =
        (this.enemyHudStripPlayback.frameCursor + 1) % this.enemyHudStripPlayback.frames.length;
      const frameIndex = this.enemyHudStripPlayback.frames[this.enemyHudStripPlayback.frameCursor] ?? 0;
      this.applyEnemyHudStripFrame(element, frameIndex, this.enemyHudStripPlayback.frameCount);
    }, intervalMs);
  }

  private applyEnemyHudStripFrame(element: HTMLElement, frameIndex: number, frameCount: number): void {
    applyEnemyHudStripFrameFromFeature({
      element,
      frameIndex,
      frameCount,
    });
  }

  private stopEnemyHudStripPlayback(): void {
    if (this.enemyHudStripIntervalId !== null) {
      window.clearInterval(this.enemyHudStripIntervalId);
      this.enemyHudStripIntervalId = null;
    }

    const stripElement = this.hudRoot?.querySelector<HTMLElement>('[data-hud="combatEnemyStrip"]');
    if (stripElement) {
      stripElement.dataset.enemyKey = '';
      stripElement.dataset.stripAnimation = '';
    }

    this.enemyHudStripPlayback = null;
  }

  private triggerEnemyHudStripOverride(animation: StripAnimationName, durationMs: number): void {
    this.enemyHudStripOverrideAnimation = animation;

    if (this.enemyHudStripOverrideTimeoutId !== null) {
      window.clearTimeout(this.enemyHudStripOverrideTimeoutId);
      this.enemyHudStripOverrideTimeoutId = null;
    }

    this.enemyHudStripOverrideTimeoutId = window.setTimeout(() => {
      this.enemyHudStripOverrideAnimation = null;
      this.enemyHudStripOverrideTimeoutId = null;
      this.updateHud();
    }, durationMs);
  }

  private clearEnemyHudStripOverride(): void {
    if (this.enemyHudStripOverrideTimeoutId !== null) {
      window.clearTimeout(this.enemyHudStripOverrideTimeoutId);
      this.enemyHudStripOverrideTimeoutId = null;
    }
    this.enemyHudStripOverrideAnimation = null;
  }

  private getStripManifestEntry(entityKey: string): SpriteManifestStripEntry | null {
    return getStripManifestEntryFromFeature({
      manifest: this.getSpriteManifest(),
      entityKey,
    });
  }

  private getStripFrames(strip: SpriteManifestStripEntry, animation: StripAnimationName): number[] {
    return getStripFramesFromFeature(strip, animation);
  }

  private getStripPlayerTimings(strip: SpriteManifestStripEntry | null): {
    idleFps: number;
    hitFps: number;
    castFps: number;
    hitDurationMs: number;
    castDurationMs: number;
  } {
    return getStripPlayerTimingsFromFeature({
      strip,
      preset: this.getActiveStripCalibrationPreset(),
    });
  }

  private getStripHudTimings(strip: SpriteManifestStripEntry | null): {
    idleIntervalMs: number;
    hitIntervalMs: number;
    castIntervalMs: number;
    hitDurationMs: number;
    castDurationMs: number;
  } {
    return getStripHudTimingsFromFeature({
      strip,
      preset: this.getActiveStripCalibrationPreset(),
    });
  }

  private resolveTimingValue(value: number | undefined, fallback: number, min: number, max: number): number {
    return resolveTimingValueFromFeature(value, fallback, min, max);
  }

  private ensureStripAnimations(strip: SpriteManifestStripEntry): void {
    const playerTimings = this.getStripPlayerTimings(strip);

    for (const animation of ['idle', 'hit', 'cast'] as const) {
      const animationKey = `${strip.key}-${animation}`;
      if (this.anims.exists(animationKey)) {
        continue;
      }

      const frames = this.getStripFrames(strip, animation);
      const frameRate =
        animation === 'hit' ? playerTimings.hitFps : animation === 'cast' ? playerTimings.castFps : playerTimings.idleFps;
      this.anims.create({
        key: animationKey,
        frames: this.anims.generateFrameNumbers(strip.key, { frames }),
        frameRate,
        repeat: animation === 'idle' ? -1 : 0,
      });
    }
  }

  private playPlayerStripAnimation(animation: StripAnimationName, force = false): void {
    if (!this.playerUsesStripAnimation || !this.player) {
      return;
    }

    const playerStrip = this.getStripManifestEntry('player-hero');
    if (!playerStrip) {
      return;
    }

    const animationKey = `${playerStrip.key}-${animation}`;
    if (!this.anims.exists(animationKey)) {
      return;
    }

    const currentKey = this.player.anims.currentAnim?.key;
    if (!force && currentKey === animationKey) {
      return;
    }

    this.player.play(animationKey, true);
  }

  private triggerPlayerStripAction(animation: Exclude<StripAnimationName, 'idle'>, durationMs = 360): void {
    if (!this.playerUsesStripAnimation) {
      return;
    }

    if (this.playerStripActionTimer) {
      this.playerStripActionTimer.remove(false);
      this.playerStripActionTimer = null;
    }

    this.playPlayerStripAnimation(animation, true);
    this.triggerPlayerStripAccent(animation, durationMs);
    this.playerStripActionTimer = this.time.delayedCall(durationMs, () => {
      this.playerStripActionTimer = null;
      this.playPlayerStripAnimation('idle', true);
    });
  }

  private triggerPlayerStripAccent(animation: Exclude<StripAnimationName, 'idle'>, durationMs: number): void {
    if (!this.player) {
      return;
    }

    if (this.playerStripAccentTimer) {
      this.playerStripAccentTimer.remove(false);
      this.playerStripAccentTimer = null;
    }

    const tint = animation === 'hit' ? 0xff8c8c : 0x8cb8ff;
    this.player.setTint(tint);
    const clearDelay = Math.max(90, Math.min(220, Math.round(durationMs * 0.45)));

    this.playerStripAccentTimer = this.time.delayedCall(clearDelay, () => {
      this.playerStripAccentTimer = null;
      this.player.clearTint();
    });
  }

  private getCombatEnemyPortraitPath(enemyKey: string, animation: StripAnimationName): string | null {
    return getCombatEnemyPortraitPathFromFeature({
      enemyKey,
      animation,
      manifest: this.getSpriteManifest(),
      resolvePortraitEntryPath: (entry, animationValue) =>
        this.resolvePortraitEntryPath(entry, animationValue),
    });
  }

  private resolvePortraitEntryPath(
    entry: string | SpriteManifestPortraitEntry | undefined,
    animation: StripAnimationName,
  ): string | null {
    return resolvePortraitEntryPathFromFeature({
      entry,
      animation,
      asString: (value) => this.payloadGateway.asString(value),
    });
  }

  private toPortraitStateKey(animation: StripAnimationName): SpriteManifestPortraitState {
    return toPortraitStateKeyFromFeature(animation);
  }

  private getCombatEnemySpritePath(enemyKey: string): string | null {
    return getCombatEnemySpritePathFromFeature({
      enemyKey,
      manifest: this.getSpriteManifest(),
      textureExists: (key) => this.textures.exists(key),
    });
  }

  private resolveSpriteAssetPath(path: string): string {
    return resolveSpriteAssetPathFromFeature(path);
  }

  private getSpriteManifest(): SpriteManifest {
    if (this.spriteManifest) {
      return this.spriteManifest;
    }

    const manifest = resolveSpriteManifestFromFeature(this.cache.json.get('sprite-manifest'));
    this.spriteManifest = manifest;
    return manifest;
  }

  private async bootstrapSessionState(): Promise<void> {
    const authenticated = await this.refreshAuthState();
    if (authenticated) {
      await this.refreshGameplayState();
      await this.refreshHeroProfileState();
      await this.refreshAutoSaveState();
      await this.refreshSaveSlotsState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
      await this.refreshQuestState();
      await this.refreshCombatState();
      return;
    }

    this.resetGameplayHudState();
    this.resetIntroNarrativeState();
    this.resetHeroProfileState();
    this.resetAutoSaveState();
    this.resetSaveSlotsState();
    this.resetBlacksmithState();
    this.resetVillageMarketState();
    this.resetQuestState();
    this.resetCombatState();
    this.updateHud();
  }

  private async refreshAuthState(): Promise<boolean> {
    try {
      const payload = await this.fetchJson<{ user?: { displayName?: string; email?: string } }>('/auth/me', {
        method: 'GET',
      });

      const displayName = payload.user?.displayName ?? payload.user?.email ?? 'Joueur';
      this.authStatus = `Connecte: ${displayName}`;
      this.isAuthenticated = true;
    } catch {
      this.authStatus = 'Non connecte';
      this.isAuthenticated = false;
    } finally {
      this.updateHud();
    }

    return this.isAuthenticated;
  }

  private async refreshGameplayState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetGameplayHudState();
      this.resetIntroNarrativeState();
      this.updateHud();
      return;
    }

    try {
      const payload = await this.fetchJson<unknown>('/gameplay/state', {
        method: 'GET',
      });
      this.applyGameplaySnapshot(payload);
      this.farmCraftingError = null;
      this.villageNpcError = null;
      this.loopError = null;
    } catch {
      // Keep previous HUD progression values if gameplay refresh fails.
    } finally {
      this.updateHud();
    }
  }

  private async refreshHeroProfileState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetHeroProfileState();
      this.updateHud();
      return;
    }

    this.heroProfileBusy = true;
    this.heroProfileError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/profile', {
        method: 'GET',
      });
      this.heroProfile = this.payloadGateway.normalizeHeroProfilePayload(payload);
      this.heroProfileMessage = this.heroProfile
        ? null
        : 'Aucun profil hero. Cree ton personnage.';
      this.heroProfileNameDraft = this.heroProfile?.heroName ?? '';
      this.heroProfileAppearanceDraft = this.heroProfile?.appearanceKey ?? 'default';
    } catch (error) {
      this.heroProfileError = this.getErrorMessage(error, 'Unable to load hero profile.');
      this.heroProfile = null;
    } finally {
      this.heroProfileBusy = false;
      this.updateHud();
    }
  }

  private async refreshQuestState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetQuestState();
      this.updateHud();
      return;
    }

    this.questBusy = true;
    this.questError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/quests', {
        method: 'GET',
      });
      this.quests = this.payloadGateway.normalizeQuestsPayload(payload);
    } catch (error) {
      this.questError = this.getErrorMessage(error, 'Unable to load quests.');
      if (this.quests.length === 0) {
        this.quests = [];
      }
    } finally {
      this.questBusy = false;
      this.updateHud();
    }
  }

  private async refreshBlacksmithState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetBlacksmithState();
      this.updateHud();
      return;
    }

    this.blacksmithBusy = true;
    this.blacksmithError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/shops/blacksmith', {
        method: 'GET',
      });

      const parsed = this.payloadGateway.normalizeBlacksmithPayload(payload);
      this.blacksmithOffers = parsed.offers;
    } catch (error) {
      this.blacksmithError = this.getErrorMessage(error, 'Unable to load blacksmith shop.');
      if (this.blacksmithOffers.length === 0) {
        this.blacksmithOffers = [];
      }
    } finally {
      this.blacksmithBusy = false;
      this.updateHud();
    }
  }

  private async refreshVillageMarketState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetVillageMarketState();
      this.updateHud();
      return;
    }

    this.villageMarketBusy = true;
    this.villageMarketError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/shops/village-market', {
        method: 'GET',
      });
      const parsed = this.payloadGateway.normalizeVillageMarketPayload(payload);
      this.villageMarketUnlocked = parsed.unlocked;
      this.villageMarketSeedOffers = parsed.seedOffers;
      this.villageMarketBuybackOffers = parsed.cropBuybackOffers;
    } catch (error) {
      this.villageMarketError = this.getErrorMessage(error, 'Unable to load village market.');
      this.villageMarketUnlocked = false;
      if (this.villageMarketSeedOffers.length === 0) {
        this.villageMarketSeedOffers = [];
      }
      if (this.villageMarketBuybackOffers.length === 0) {
        this.villageMarketBuybackOffers = [];
      }
    } finally {
      this.villageMarketBusy = false;
      this.updateHud();
    }
  }

  private async refreshAutoSaveState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetAutoSaveState();
      this.updateHud();
      return;
    }

    this.autosaveBusy = true;
    this.autosaveError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/saves/auto/latest', {
        method: 'GET',
      });

      this.autosave = this.payloadGateway.normalizeAutoSavePayload(payload);
    } catch (error) {
      this.autosaveError = this.getErrorMessage(error, 'Unable to load autosave.');
      this.autosave = null;
    } finally {
      this.autosaveBusy = false;
      this.updateHud();
    }
  }

  private async refreshSaveSlotsState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetSaveSlotsState();
      this.updateHud();
      return;
    }

    this.saveSlotsBusy = true;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/saves', {
        method: 'GET',
      });
      const slots = this.payloadGateway.normalizeSaveSlotsPayload(payload);
      const previewsBySlot = await this.loadSaveSlotPreviews(slots);
      this.saveSlots = slots.map((slot) => ({
        ...slot,
        preview: slot.exists ? (previewsBySlot.get(slot.slot) ?? null) : null,
      }));

      if (
        this.saveSlotsLoadConfirmSlot !== null &&
        !this.saveSlots.some((slot) => slot.slot === this.saveSlotsLoadConfirmSlot && slot.exists)
      ) {
        this.saveSlotsLoadConfirmSlot = null;
      }
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, 'Unable to load save slots.');
      if (this.saveSlots.length === 0) {
        this.saveSlots = [];
      }
    } finally {
      this.saveSlotsBusy = false;
      this.updateHud();
    }
  }

  private async loadSaveSlotPreviews(slots: SaveSlotState[]): Promise<Map<number, SaveSlotPreview | null>> {
    const previewsBySlot = new Map<number, SaveSlotPreview | null>();
    const existingSlots = slots.filter((slot) => slot.exists);

    await Promise.all(
      existingSlots.map(async (slot) => {
        try {
          const payload = await this.fetchJson<unknown>(`/saves/${slot.slot}`, {
            method: 'GET',
          });
          previewsBySlot.set(slot.slot, this.payloadGateway.normalizeSaveSlotPreviewPayload(payload));
        } catch {
          previewsBySlot.set(slot.slot, null);
        }
      }),
    );

    return previewsBySlot;
  }

  private async refreshCombatState(): Promise<void> {
    if (!this.isAuthenticated) {
      this.resetCombatState();
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Chargement du combat...';
    this.clearCombatError();
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/combat/current', {
        method: 'GET',
      });
      const encounter = this.payloadGateway.normalizeCombatPayload(payload);

      if (encounter) {
        this.applyCombatSnapshot(encounter);
      } else {
        this.resetCombatState();
      }
    } catch (error) {
      const message = this.getErrorMessage(error, 'Impossible de charger le combat.');
      this.setCombatError(message);
      if (!this.combatState) {
        this.combatStatus = 'error';
        this.combatMessage = message;
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async startCombat(): Promise<void> {
    if (!this.isAuthenticated) {
      this.setCombatError('Connecte toi pour demarrer un combat.');
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Demarrage du combat...';
    this.clearCombatError();
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/combat/start', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const encounter = this.payloadGateway.normalizeCombatPayload(payload);

      if (!encounter) {
        throw new Error('Combat start returned an empty payload.');
      }

      this.applyCombatSnapshot(encounter);
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
      await this.refreshQuestState();
    } catch (error) {
      this.setCombatError(this.getErrorMessage(error, 'Impossible de demarrer le combat.'));
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      } else {
        this.combatStatus = 'error';
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async performCombatAction(action: CombatActionName): Promise<void> {
    const validationError = validateCombatActionRequestFromFeature({
      isAuthenticated: this.isAuthenticated,
      action,
      combatState: this.combatState,
      hasCleanseableDebuffs: hasCleanseableDebuffsFromLogic(this.combatState),
      hasInterruptibleEnemyIntent: hasInterruptibleEnemyIntentFromLogic(this.combatState),
      isPlayerDarkened: getCombatStatusTurnsFromLogic(this.combatState, 'playerDarkenedTurns') > 0,
    });
    if (validationError) {
      this.setCombatError(validationError);
      this.updateHud();
      return;
    }
    const combatState = this.combatState;
    if (!combatState) {
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Action en cours...';
    this.clearCombatError();
    this.updateHud();

    try {
      const encounterId = this.combatEncounterId ?? combatState.id;
      const payload = await this.fetchJson<unknown>(`/combat/${encounterId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      const encounter = this.payloadGateway.normalizeCombatPayload(payload);

      if (!encounter) {
        throw new Error('Combat action returned an empty payload.');
      }

      this.playPlayerCombatActionAnimation(action);
      this.applyCombatSnapshot(encounter);
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
      await this.refreshQuestState();
    } catch (error) {
      this.setCombatError(this.getErrorMessage(error, 'Impossible de jouer cette action.'));
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      } else {
        this.combatStatus = 'error';
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private async forfeitCombat(): Promise<void> {
    if (!this.isAuthenticated) {
      this.setCombatError('Connecte toi pour fuir un combat.');
      this.updateHud();
      return;
    }

    if (!this.combatState || this.combatState.status !== 'active') {
      this.setCombatError('Aucun combat actif.');
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Fuite en cours...';
    this.clearCombatError();
    this.updateHud();

    try {
      const encounterId = this.combatEncounterId ?? this.combatState.id;
      const payload = await this.fetchJson<unknown>(`/combat/${encounterId}/forfeit`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Player chose to flee from the UI.' }),
      });
      const encounter = this.payloadGateway.normalizeCombatPayload(payload);

      if (!encounter) {
        throw new Error('Combat forfeit returned an empty payload.');
      }

      this.applyCombatSnapshot(encounter);
      await this.refreshGameplayState();
      await this.refreshAutoSaveState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
      await this.refreshQuestState();
    } catch (error) {
      this.setCombatError(this.getErrorMessage(error, 'Impossible de fuir le combat.'));
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      } else {
        this.combatStatus = 'error';
      }
    } finally {
      this.combatBusy = false;
      if (this.combatState) {
        this.combatStatus = this.combatState.status;
      }
      this.updateHud();
    }
  }

  private playPlayerCombatActionAnimation(action: CombatActionName): void {
    const playerStrip = this.getStripManifestEntry('player-hero');
    const playerTimings = this.getStripPlayerTimings(playerStrip);
    const animation = getPlayerCombatActionAnimationFromFeature(action);
    this.triggerPlayerStripAction(
      animation,
      animation === 'hit' ? playerTimings.hitDurationMs : playerTimings.castDurationMs,
    );
  }

  private async logout(): Promise<void> {
    try {
      await this.fetchJson('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore logout errors and re-sync state below.
    } finally {
      await this.bootstrapSessionState();
    }
  }

  private async claimQuest(questKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.questError = 'Login required to claim quests.';
      this.updateHud();
      return;
    }

    this.questBusy = true;
    this.questError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/quests/${questKey}/claim`, {
        method: 'POST',
      });
      await this.refreshGameplayState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
      await this.refreshQuestState();
    } catch (error) {
      this.questError = this.getErrorMessage(error, 'Unable to claim this quest.');
    } finally {
      this.questBusy = false;
      this.updateHud();
    }
  }

  private async buyBlacksmithOffer(offerKey: string): Promise<void> {
    await runBuyBlacksmithOfferActionFromFeature({
      offerKey,
      isAuthenticated: this.isAuthenticated,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshBlacksmithState: () => this.refreshBlacksmithState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      setBlacksmithBusy: (busy) => {
        this.blacksmithBusy = busy;
      },
      setBlacksmithError: (error) => {
        this.blacksmithError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async buyVillageSeedOffer(offerKey: string): Promise<void> {
    await runBuyVillageSeedOfferActionFromFeature({
      offerKey,
      isAuthenticated: this.isAuthenticated,
      villageMarketUnlocked: this.villageMarketUnlocked,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      refreshBlacksmithState: () => this.refreshBlacksmithState(),
      setVillageMarketBusy: (busy) => {
        this.villageMarketBusy = busy;
      },
      setVillageMarketError: (error) => {
        this.villageMarketError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async sellVillageCrop(itemKey: string): Promise<void> {
    await runSellVillageCropActionFromFeature({
      itemKey,
      isAuthenticated: this.isAuthenticated,
      villageMarketUnlocked: this.villageMarketUnlocked,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      refreshBlacksmithState: () => this.refreshBlacksmithState(),
      setVillageMarketBusy: (busy) => {
        this.villageMarketBusy = busy;
      },
      setVillageMarketError: (error) => {
        this.villageMarketError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async interactVillageNpc(npcKey: VillageNpcKey): Promise<void> {
    if (!this.isAuthenticated) {
      this.villageNpcError = 'Login required to interact with village NPCs.';
      this.updateHud();
      return;
    }

    const npc = this.villageNpcState[npcKey];
    const relationship = this.villageNpcRelationships[npcKey];
    if (!npc.available) {
      this.villageNpcError = `${getVillageNpcDisplayNameFromLogic(npcKey)} is unavailable right now.`;
      this.updateHud();
      return;
    }
    if (!relationship.canTalkToday) {
      this.villageNpcError = `${getVillageNpcDisplayNameFromLogic(npcKey)} already talked today.`;
      this.updateHud();
      return;
    }

    this.villageNpcBusy = true;
    this.villageNpcError = null;
    this.updateHud();

    try {
      await this.fetchJson('/gameplay/village/npc/interact', {
        method: 'POST',
        body: JSON.stringify({
          npcKey,
        }),
      });
      await this.refreshGameplayState();
    } catch (error) {
      this.villageNpcError = this.getErrorMessage(error, 'Unable to interact with this NPC.');
    } finally {
      this.villageNpcBusy = false;
      this.updateHud();
    }
  }

  private async prepareCombatLoop(): Promise<void> {
    if (!this.isAuthenticated) {
      this.loopError = 'Login required to prepare combat.';
      this.updateHud();
      return;
    }

    if (!this.loopState?.preparation.ready) {
      this.loopError = this.loopState?.preparation.nextStep ?? 'Preparation unavailable.';
      this.updateHud();
      return;
    }

    this.loopBusy = true;
    this.loopError = null;
    this.updateHud();

    try {
      await this.fetchJson('/gameplay/combat/prepare', {
        method: 'POST',
      });
      await this.refreshGameplayState();
      await this.refreshVillageMarketState();
      await this.refreshBlacksmithState();
      await this.refreshQuestState();
    } catch (error) {
      this.loopError = this.getErrorMessage(error, 'Unable to prepare combat.');
    } finally {
      this.loopBusy = false;
      this.updateHud();
    }
  }

  private async sleepAtFarm(): Promise<void> {
    await runSleepAtFarmActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      farmUnlocked: Boolean(this.farmState?.unlocked),
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      applyGameplaySnapshot: (payload) => this.applyGameplaySnapshot(payload),
      setFarmBusy: (busy) => {
        this.farmBusy = busy;
      },
      setFarmError: (error) => {
        this.farmError = error;
      },
      setFarmFeedbackMessage: (message) => {
        this.farmFeedbackMessage = message;
      },
      getCurrentDay: () => this.hudState.day,
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async craftFarmRecipe(recipeKey: string): Promise<void> {
    await runCraftFarmRecipeActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      craftingState: this.farmCraftingState,
      recipeKey,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      formatFarmLabel: (raw) => this.formatFarmLabel(raw),
      setFarmFeedbackMessage: (message) => {
        this.farmFeedbackMessage = message;
      },
      setFarmCraftingPanelOpen: (open) => {
        this.farmCraftingPanelOpen = open;
      },
      setFarmCraftingBusy: (busy) => {
        this.farmCraftingBusy = busy;
      },
      setFarmCraftingError: (error) => {
        this.farmCraftingError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async plantFarmPlot(plotKey: string): Promise<void> {
    await runPlantFarmPlotActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      farmUnlocked: Boolean(this.farmState?.unlocked),
      plotKey,
      seedItemKey: this.farmSelectedSeedItemKey,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      formatFarmLabel: (raw) => this.formatFarmLabel(raw),
      setFarmBusy: (busy) => {
        this.farmBusy = busy;
      },
      setFarmError: (error) => {
        this.farmError = error;
      },
      setFarmFeedbackMessage: (message) => {
        this.farmFeedbackMessage = message;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async waterFarmPlot(plotKey: string): Promise<void> {
    await runWaterFarmPlotActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      farmUnlocked: Boolean(this.farmState?.unlocked),
      plotKey,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      setFarmBusy: (busy) => {
        this.farmBusy = busy;
      },
      setFarmError: (error) => {
        this.farmError = error;
      },
      setFarmFeedbackMessage: (message) => {
        this.farmFeedbackMessage = message;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async harvestFarmPlot(plotKey: string): Promise<void> {
    const harvestedCropKey = getFarmPlotByKeyFromLogic(plotKey, this.farmState)?.cropKey ?? null;
    const harvestedCropLabel = harvestedCropKey ? this.formatFarmLabel(harvestedCropKey) : null;
    await runHarvestFarmPlotActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      farmUnlocked: Boolean(this.farmState?.unlocked),
      plotKey,
      harvestedCropLabel,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      setFarmBusy: (busy) => {
        this.farmBusy = busy;
      },
      setFarmError: (error) => {
        this.farmError = error;
      },
      setFarmFeedbackMessage: (message) => {
        this.farmFeedbackMessage = message;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async restoreAutoSaveToSlot(slot: number): Promise<void> {
    await runRestoreAutoSaveToSlotActionFromFeature({
      slot,
      isAuthenticated: this.isAuthenticated,
      hasAutosave: Boolean(this.autosave),
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshAutoSaveState: () => this.refreshAutoSaveState(),
      refreshSaveSlotsState: () => this.refreshSaveSlotsState(),
      setSaveSlotsLoadConfirmSlot: (nextSlot) => {
        this.saveSlotsLoadConfirmSlot = nextSlot;
      },
      setAutosaveRestoreSlotBusy: (nextSlot) => {
        this.autosaveRestoreSlotBusy = nextSlot;
      },
      setAutosaveError: (error) => {
        this.autosaveError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private toggleLoadSaveSlotConfirmation(slot: number): void {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to load saves.';
      this.updateHud();
      return;
    }

    if (!hasExistingSaveSlotFromFeature({ slot, saveSlots: this.saveSlots })) {
      this.saveSlotsError = `Slot ${slot} is empty.`;
      this.updateHud();
      return;
    }

    if (this.saveSlotsActionBusyKey) {
      return;
    }

    this.saveSlotsError = null;
    this.saveSlotsLoadConfirmSlot = this.saveSlotsLoadConfirmSlot === slot ? null : slot;
    this.updateHud();
  }

  private clearLoadSaveSlotConfirmation(slot: number): void {
    if (this.saveSlotsLoadConfirmSlot === slot) {
      this.saveSlotsLoadConfirmSlot = null;
      this.updateHud();
    }
  }

  private async captureSaveSlot(slot: number): Promise<void> {
    await runCaptureSaveSlotActionFromFeature({
      slot,
      isAuthenticated: this.isAuthenticated,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshSaveSlotsState: () => this.refreshSaveSlotsState(),
      setSaveSlotsLoadConfirmSlot: (nextSlot) => {
        this.saveSlotsLoadConfirmSlot = nextSlot;
      },
      setSaveSlotsActionBusyKey: (busyKey) => {
        this.saveSlotsActionBusyKey = busyKey;
      },
      setSaveSlotsError: (error) => {
        this.saveSlotsError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async loadSaveSlot(slot: number): Promise<void> {
    await runLoadSaveSlotActionFromFeature({
      slot,
      isAuthenticated: this.isAuthenticated,
      hasExistingSaveSlot: hasExistingSaveSlotFromFeature({ slot, saveSlots: this.saveSlots }),
      saveSlotsLoadConfirmSlot: this.saveSlotsLoadConfirmSlot,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshGameplayState: () => this.refreshGameplayState(),
      refreshCombatState: () => this.refreshCombatState(),
      refreshQuestState: () => this.refreshQuestState(),
      refreshBlacksmithState: () => this.refreshBlacksmithState(),
      refreshVillageMarketState: () => this.refreshVillageMarketState(),
      refreshAutoSaveState: () => this.refreshAutoSaveState(),
      refreshSaveSlotsState: () => this.refreshSaveSlotsState(),
      setSaveSlotsLoadConfirmSlot: (nextSlot) => {
        this.saveSlotsLoadConfirmSlot = nextSlot;
      },
      setSaveSlotsActionBusyKey: (busyKey) => {
        this.saveSlotsActionBusyKey = busyKey;
      },
      setSaveSlotsError: (error) => {
        this.saveSlotsError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async deleteSaveSlot(slot: number): Promise<void> {
    await runDeleteSaveSlotActionFromFeature({
      slot,
      isAuthenticated: this.isAuthenticated,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      refreshSaveSlotsState: () => this.refreshSaveSlotsState(),
      setSaveSlotsLoadConfirmSlot: (nextSlot) => {
        this.saveSlotsLoadConfirmSlot = nextSlot;
      },
      setSaveSlotsActionBusyKey: (busyKey) => {
        this.saveSlotsActionBusyKey = busyKey;
      },
      setSaveSlotsError: (error) => {
        this.saveSlotsError = error;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async saveHeroProfile(): Promise<void> {
    await runSaveHeroProfileActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      heroProfileBusy: this.heroProfileBusy,
      heroProfileNameDraft: this.heroProfileNameDraft,
      heroProfileAppearanceDraft: this.heroProfileAppearanceDraft,
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      normalizeHeroProfilePayload: (payload) => this.payloadGateway.normalizeHeroProfilePayload(payload),
      setHeroProfileBusy: (busy) => {
        this.heroProfileBusy = busy;
      },
      setHeroProfileError: (error) => {
        this.heroProfileError = error;
      },
      setHeroProfileMessage: (message) => {
        this.heroProfileMessage = message;
      },
      setHeroProfile: (profile) => {
        this.heroProfile = profile;
      },
      setHeroProfileNameDraft: (name) => {
        this.heroProfileNameDraft = name;
      },
      setHeroProfileAppearanceDraft: (appearance) => {
        this.heroProfileAppearanceDraft = appearance;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private async advanceIntroNarrative(): Promise<void> {
    await runAdvanceIntroNarrativeActionFromFeature({
      isAuthenticated: this.isAuthenticated,
      introNarrativeBusy: this.introNarrativeBusy,
      introNarrativeCompleted: Boolean(this.introNarrativeState?.completed),
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      normalizeGameplayIntroPayload: (payload) => this.payloadGateway.normalizeGameplayIntroPayload(payload),
      refreshGameplayState: () => this.refreshGameplayState(),
      setIntroNarrativeBusy: (busy) => {
        this.introNarrativeBusy = busy;
      },
      setIntroNarrativeError: (error) => {
        this.introNarrativeError = error;
      },
      setIntroNarrativeState: (state) => {
        this.introNarrativeState = state;
      },
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private applyGameplaySnapshot(payload: unknown): void {
    if (!this.payloadGateway.isRecord(payload)) {
      return;
    }

    const introNarrativeState = this.payloadGateway.normalizeGameplayIntroPayload(payload);
    if (introNarrativeState) {
      this.introNarrativeState = introNarrativeState;
      this.introNarrativeError = null;
    }

    const world = this.payloadGateway.asRecord(payload.world);
    if (world) {
      const day = this.payloadGateway.asNumber(world.day);
      const zone = this.payloadGateway.asString(world.zone);

      if (day !== null) {
        this.hudState.day = Math.max(1, Math.round(day));
      }

      if (zone) {
        this.hudState.area = zone;
      }
    }

    const farm = this.payloadGateway.normalizeGameplayFarmPayload(payload);
    if (farm) {
      this.farmState = farm;
      if (farm.unlocked) {
        const unlockedSeedKeys = new Set(
          farm.cropCatalog.filter((entry) => entry.unlocked).map((entry) => entry.seedItemKey),
        );
        if (!unlockedSeedKeys.has(this.farmSelectedSeedItemKey)) {
          this.farmSelectedSeedItemKey = farm.cropCatalog.find((entry) => entry.unlocked)?.seedItemKey ?? '';
        }
        if (
          !this.farmSelectedPlotKey ||
          !farm.plots.some((plot) => plot.plotKey === this.farmSelectedPlotKey)
        ) {
          const preferredPlot =
            farm.plots.find((plot) => plot.readyToHarvest) ??
            farm.plots.find((plot) => !plot.cropKey) ??
            farm.plots[0] ??
            null;
          this.farmSelectedPlotKey = preferredPlot?.plotKey ?? null;
        }
      } else {
        this.farmSelectedSeedItemKey = '';
        this.farmSelectedPlotKey = null;
      }
    }

    const farmStory = this.payloadGateway.normalizeGameplayFarmStoryPayload(payload);
    if (farmStory) {
      this.farmStoryState = farmStory;
    }

    const crafting = this.payloadGateway.normalizeGameplayCraftingPayload(payload);
    if (crafting) {
      this.farmCraftingState = crafting;
    }

    const loop = this.payloadGateway.normalizeGameplayLoopPayload(payload);
    if (loop) {
      this.loopState = loop;
    }

    const progression = this.payloadGateway.asRecord(payload.progression);
    if (!progression) {
      return;
    }

    const gold = this.payloadGateway.asNumber(progression.gold);
    const level = this.payloadGateway.asNumber(progression.level);
    const experience = this.payloadGateway.asNumber(progression.experience);
    const experienceToNextLevel = this.payloadGateway.asNumber(progression.experienceToNextLevel);
    const currentHp = this.payloadGateway.asNumber(progression.currentHp);
    const maxHp = this.payloadGateway.asNumber(progression.maxHp);
    const currentMp = this.payloadGateway.asNumber(progression.currentMp);
    const maxMp = this.payloadGateway.asNumber(progression.maxMp);

    if (gold !== null) {
      this.hudState.gold = Math.max(0, Math.round(gold));
    }

    if (level !== null) {
      this.hudState.level = Math.max(1, Math.round(level));
    }

    if (experience !== null) {
      this.hudState.xp = Math.max(0, Math.round(experience));
    }

    if (experienceToNextLevel !== null) {
      this.hudState.xpToNext = Math.max(1, Math.round(experienceToNextLevel));
    }

    if (maxHp !== null) {
      this.hudState.maxHp = Math.max(1, Math.round(maxHp));
    }
    if (currentHp !== null) {
      this.hudState.hp = Math.max(0, Math.min(this.hudState.maxHp, Math.round(currentHp)));
    }
    if (maxMp !== null) {
      this.hudState.maxMp = Math.max(1, Math.round(maxMp));
    }
    if (currentMp !== null) {
      this.hudState.mp = Math.max(0, Math.min(this.hudState.maxMp, Math.round(currentMp)));
    }

    const village = this.payloadGateway.asRecord(payload.village);
    if (village) {
      const blacksmith = this.payloadGateway.asRecord(village.blacksmith);
      if (blacksmith) {
        this.hudState.blacksmithUnlocked = Boolean(blacksmith.unlocked);
        this.hudState.blacksmithCurseLifted = Boolean(blacksmith.curseLifted);
      }

      const npcs = this.payloadGateway.asRecord(village.npcs);
      if (npcs) {
        const mayor = this.payloadGateway.normalizeVillageNpcEntry(npcs.mayor);
        const blacksmithNpc = this.payloadGateway.normalizeVillageNpcEntry(npcs.blacksmith);
        const merchant = this.payloadGateway.normalizeVillageNpcEntry(npcs.merchant);

        if (mayor) {
          this.villageNpcState.mayor = mayor;
        }
        if (blacksmithNpc) {
          this.villageNpcState.blacksmith = blacksmithNpc;
        }
        if (merchant) {
          this.villageNpcState.merchant = merchant;
        }
      }

      const relationships = this.payloadGateway.asRecord(village.relationships);
      if (relationships) {
        const mayorRelationship = this.payloadGateway.normalizeVillageNpcRelationshipEntry(relationships.mayor);
        const blacksmithRelationship = this.payloadGateway.normalizeVillageNpcRelationshipEntry(relationships.blacksmith);
        const merchantRelationship = this.payloadGateway.normalizeVillageNpcRelationshipEntry(relationships.merchant);

        if (mayorRelationship) {
          this.villageNpcRelationships.mayor = mayorRelationship;
        }
        if (blacksmithRelationship) {
          this.villageNpcRelationships.blacksmith = blacksmithRelationship;
        }
        if (merchantRelationship) {
          this.villageNpcRelationships.merchant = merchantRelationship;
        }
      }
    }

    const tower = this.payloadGateway.asRecord(payload.tower);
    if (tower) {
      const currentFloor = this.payloadGateway.asNumber(tower.currentFloor);
      const highestFloor = this.payloadGateway.asNumber(tower.highestFloor);
      const bossFloor10Defeated = tower.bossFloor10Defeated;

      if (currentFloor !== null) {
        this.hudState.towerCurrentFloor = Math.max(1, Math.round(currentFloor));
      }

      if (highestFloor !== null) {
        this.hudState.towerHighestFloor = Math.max(1, Math.round(highestFloor));
      }

      this.hudState.towerBossFloor10Defeated = Boolean(bossFloor10Defeated);
    }

    const towerStory = this.payloadGateway.normalizeGameplayTowerStoryPayload(payload);
    if (towerStory) {
      this.towerStoryState = towerStory;
    }
  }

  private resetGameplayHudState(): void {
    this.hudState.day = 1;
    this.hudState.area = 'Ferme';
    this.hudState.gold = 120;
    this.hudState.level = 1;
    this.hudState.xp = 0;
    this.hudState.xpToNext = 100;
    this.hudState.towerCurrentFloor = 1;
    this.hudState.towerHighestFloor = 1;
    this.hudState.towerBossFloor10Defeated = false;
    this.hudState.blacksmithUnlocked = false;
    this.hudState.blacksmithCurseLifted = false;
    this.villageNpcState = {
      mayor: { stateKey: 'offscreen', available: false },
      blacksmith: { stateKey: 'cursed', available: false },
      merchant: { stateKey: 'absent', available: false },
    };
    this.villageNpcRelationships = {
      mayor: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
      blacksmith: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
      merchant: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
    };
    this.villageNpcBusy = false;
    this.villageNpcError = null;
    this.villageShopControllerState = createVillageShopControllerStateFromFeature();
    this.farmState = null;
    this.farmBusy = false;
    this.farmError = null;
    this.farmSelectedSeedItemKey = '';
    this.farmSelectedPlotKey = null;
    this.farmFeedbackMessage = null;
    this.farmCraftingPanelOpen = false;
    this.farmRenderSignature = '';
    this.farmCraftingState = null;
    this.farmCraftingBusy = false;
    this.farmCraftingError = null;
    this.farmCraftingRenderSignature = '';
    this.farmSceneRenderSignature = '';
    this.villageSceneRenderSignature = '';
    this.villageSelectedZoneKey = null;
    this.villageFeedbackMessage = null;
    this.frontSceneMode = 'farm';

    if (this.player) {
      this.player.setPosition(FARM_SCENE_PLAYER_SPAWN.x, FARM_SCENE_PLAYER_SPAWN.y);
      this.drawDecor();
      this.rebuildSceneObstacles();
    }
  }

  private resetHeroProfileState(): void {
    this.heroProfile = null;
    this.heroProfileBusy = false;
    this.heroProfileError = null;
    this.heroProfileMessage = null;
    this.heroProfileNameDraft = '';
    this.heroProfileAppearanceDraft = 'default';
  }

  private resetIntroNarrativeState(): void {
    this.introNarrativeState = null;
    this.introNarrativeBusy = false;
    this.introNarrativeError = null;
  }

  private resetAutoSaveState(): void {
    this.autosave = null;
    this.autosaveBusy = false;
    this.autosaveRestoreSlotBusy = null;
    this.autosaveError = null;
    this.autosaveRenderSignature = '';
  }

  private resetSaveSlotsState(): void {
    this.saveSlots = [];
    this.saveSlotsBusy = false;
    this.saveSlotsActionBusyKey = null;
    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsError = null;
    this.saveSlotsRenderSignature = '';
  }

  private resetBlacksmithState(): void {
    this.blacksmithOffers = [];
    this.blacksmithBusy = false;
    this.blacksmithError = null;
    this.blacksmithRenderSignature = '';
    this.villageShopControllerState = {
      ...this.villageShopControllerState,
      renderSignature: '',
    };
  }

  private resetVillageMarketState(): void {
    this.villageMarketUnlocked = false;
    this.villageMarketSeedOffers = [];
    this.villageMarketBuybackOffers = [];
    this.villageMarketBusy = false;
    this.villageMarketError = null;
    this.villageMarketRenderSignature = '';
    this.villageShopControllerState = {
      ...this.villageShopControllerState,
      renderSignature: '',
    };
  }

  private resetQuestState(): void {
    this.quests = [];
    this.questBusy = false;
    this.questError = null;
    this.questsRenderSignature = '';
  }

  private applyCombatSnapshot(snapshot: CombatEncounterState): void {
    const previousPlayerHp = this.combatState?.player.hp ?? this.hudState.hp;
    const previousEnemyHp = this.combatState?.enemy.currentHp ?? null;
    const enemyHudTimings = this.getStripHudTimings(this.getStripManifestEntry(snapshot.enemy.key));
    const playerTimings = this.getStripPlayerTimings(this.getStripManifestEntry('player-hero'));

    this.combatEncounterId = snapshot.id;
    this.combatState = snapshot;
    this.combatStatus = snapshot.status;
    this.combatLogs = snapshot.logs.slice(-20);
    this.combatMessage = resolveCombatMessageFromLogic(snapshot);
    this.combatError = null;
    this.syncHudStateFromCombat(snapshot);

    if (snapshot.player.hp < previousPlayerHp) {
      this.triggerPlayerStripAction('hit', playerTimings.hitDurationMs);
    }

    if (previousEnemyHp !== null && snapshot.enemy.currentHp < previousEnemyHp) {
      this.triggerEnemyHudStripOverride('hit', enemyHudTimings.hitDurationMs);
    } else if (snapshot.status === 'active' && snapshot.turn === 'enemy') {
      this.triggerEnemyHudStripOverride('cast', enemyHudTimings.castDurationMs);
    }
  }

  private resetCombatState(): void {
    this.combatEncounterId = null;
    this.combatState = null;
    this.combatLogs = [];
    this.combatStatus = 'idle';
    this.combatMessage = this.isAuthenticated ? 'Aucun combat actif.' : 'Connecte toi pour lancer un combat.';
    this.combatError = null;
    this.stopDebugQaStepReplayAutoPlay(false);
    this.debugQaStepReplayState = null;
    this.syncHudStateFromCombat(null);
    this.stopEnemyHudStripPlayback();
    this.clearEnemyHudStripOverride();
  }

  private syncHudStateFromCombat(snapshot: CombatEncounterState | null): void {
    if (!snapshot) {
      return;
    }

    this.hudState.hp = snapshot.player.hp;
    this.hudState.maxHp = snapshot.player.maxHp;
    this.hudState.mp = snapshot.player.mp;
    this.hudState.maxMp = snapshot.player.maxMp;
  }

  private renderCombatEnemyTelegraphs(): void {
    this.renderCombatEnemyIntentChip('[data-hud="combatEnemyIntent"]', 'enemyTelegraphIntent', false);
    this.renderCombatEnemyIntentChip('[data-hud="combatEnemyIntentNext"]', 'enemyTelegraphNextIntent', true);
  }

  private renderCombatEnemyIntentChip(
    selector: string,
    intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent',
    isPreview: boolean,
  ): void {
    const element = this.hudRoot?.querySelector<HTMLElement>(selector);
    if (!element) {
      return;
    }

    const intentUi = getCombatEnemyIntentUiFromFeature({
      combatState: this.combatState,
      intentKey,
      isPreview,
    });
    element.classList.add('combat-intent-chip');
    element.replaceChildren();
    if (intentUi.icon !== 'none') {
      const icon = document.createElement('span');
      icon.classList.add('combat-intent-icon');
      icon.dataset.intentIcon = intentUi.icon;
      icon.textContent = intentUi.iconLabel;
      const iconTooltip = getCombatIntentIconTooltipFromFeature(intentUi.iconLabel);
      icon.title = iconTooltip;
      icon.setAttribute('aria-label', iconTooltip);
      element.appendChild(icon);
    }

    const text = document.createElement('span');
    text.classList.add('combat-intent-text');
    text.textContent = intentUi.label;
    element.appendChild(text);

    element.dataset.intentTone = intentUi.tone;
    element.dataset.intentPulse = intentUi.pulse ? '1' : '0';
    element.dataset.intentLayer = isPreview ? 'next' : 'current';
  }

  private clearCombatError(): void {
    this.combatError = null;
  }

  private setCombatError(message: string): void {
    this.combatError = message;
  }

  private syncDebugQaFiltersFromInputs(): void {
    const rawOutcome = this.debugQaRecapOutcomeFilterSelect?.value.trim() ?? this.debugQaRecapOutcomeFilter;
    const isKnownOutcome = DEBUG_QA_RECAP_OUTCOME_FILTER_OPTIONS.some((option) => option.key === rawOutcome);
    this.debugQaRecapOutcomeFilter = isKnownOutcome ? (rawOutcome as DebugQaRecapOutcomeFilter) : 'all';
    this.debugQaRecapEnemyFilter = this.debugQaRecapEnemyFilterInput?.value ?? this.debugQaRecapEnemyFilter;
    this.debugQaScriptEnemyFilter = this.debugQaScriptEnemyFilterInput?.value ?? this.debugQaScriptEnemyFilter;
    this.debugQaScriptIntentFilter = this.debugQaScriptIntentFilterInput?.value ?? this.debugQaScriptIntentFilter;
  }

  private syncDebugQaFiltersToInputs(): void {
    if (this.debugQaRecapOutcomeFilterSelect) {
      this.debugQaRecapOutcomeFilterSelect.value = this.debugQaRecapOutcomeFilter;
    }
    if (this.debugQaRecapEnemyFilterInput) {
      this.debugQaRecapEnemyFilterInput.value = this.debugQaRecapEnemyFilter;
    }
    if (this.debugQaScriptEnemyFilterInput) {
      this.debugQaScriptEnemyFilterInput.value = this.debugQaScriptEnemyFilter;
    }
    if (this.debugQaScriptIntentFilterInput) {
      this.debugQaScriptIntentFilterInput.value = this.debugQaScriptIntentFilter;
    }
  }

  private doesCombatStateMatchRecapFilters(snapshot: CombatEncounterState | null): boolean {
    return doesCombatStateMatchRecapFiltersFromDebugQa(
      snapshot,
      this.debugQaRecapOutcomeFilter,
      this.debugQaRecapEnemyFilter,
    );
  }

  private filterCombatDebugReference(reference: CombatDebugReference): CombatDebugReference {
    return filterCombatDebugReferenceFromDebugQa(
      reference,
      this.debugQaScriptEnemyFilter,
      this.debugQaScriptIntentFilter,
    );
  }

  private getDebugQaScriptedIntentsDisplayText(): string {
    return getDebugQaScriptedIntentsDisplayTextFromDebugQa(
      this.debugQaScriptedIntentsReference,
      this.debugQaScriptedIntentsText,
      this.debugQaScriptEnemyFilter,
      this.debugQaScriptIntentFilter,
    );
  }

  private async exportDebugQaTrace(): Promise<void> {
    exportDebugQaTraceFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      hasDebugQaPanel: Boolean(this.debugQaPanelRoot),
      syncDebugQaFiltersFromInputs: () => this.syncDebugQaFiltersFromInputs(),
      buildDebugQaTracePayload: () => this.buildDebugQaTracePayload(),
      buildDebugQaTraceFilename: (timestamp) => this.buildDebugQaTraceFilename(timestamp),
      downloadJsonFile: (filename, payload) => this.downloadJsonFile(filename, payload),
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private async exportDebugQaMarkdownReport(): Promise<void> {
    exportDebugQaMarkdownReportFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      hasDebugQaPanel: Boolean(this.debugQaPanelRoot),
      syncDebugQaFiltersFromInputs: () => this.syncDebugQaFiltersFromInputs(),
      buildDebugQaMarkdownReport: (timestamp) => this.buildDebugQaMarkdownReport(timestamp),
      buildDebugQaMarkdownFilename: (timestamp) => this.buildDebugQaMarkdownFilename(timestamp),
      downloadTextFile: (filename, contents, contentType) => this.downloadTextFile(filename, contents, contentType),
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private async loadCombatDebugScriptedIntents(): Promise<void> {
    await loadCombatDebugScriptedIntentsFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      hasDebugQaPanel: Boolean(this.debugQaPanelRoot),
      debugQaStatus: this.debugQaStatus,
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      setDebugQaScriptedIntentsReference: (reference) => {
        this.debugQaScriptedIntentsReference = reference;
      },
      setDebugQaScriptedIntentsText: (value) => {
        this.debugQaScriptedIntentsText = value;
      },
      fetchJson: (path) => this.fetchJson<CombatDebugReference>(path),
      formatCombatDebugScriptedIntentsReference: (reference) =>
        this.formatCombatDebugScriptedIntentsReference(reference),
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private triggerDebugQaTraceImport(): void {
    triggerDebugQaTraceImportFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      debugQaStatus: this.debugQaStatus,
      importFileInput: this.debugQaImportFileInput,
    });
  }

  private toggleDebugQaStepReplayAutoPlay(): void {
    toggleDebugQaStepReplayAutoPlayFromFeature({
      stepReplayState: this.debugQaStepReplayState,
      replayAutoPlayIntervalId: this.debugQaReplayAutoPlayIntervalId,
      replayAutoPlaySpeedSelectValue:
        this.debugQaReplayAutoPlaySpeedSelect?.value ?? this.debugQaReplayAutoPlaySpeed,
      replayAutoPlaySpeed: this.debugQaReplayAutoPlaySpeed,
      replayAutoPlaySpeedOptions: DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS,
      setReplayAutoPlaySpeed: (value) => {
        this.debugQaReplayAutoPlaySpeed = value;
      },
      setReplayAutoPlayIntervalId: (value) => {
        this.debugQaReplayAutoPlayIntervalId = value;
      },
      persistDebugQaReplayAutoPlaySpeed: (value) => this.persistDebugQaReplayAutoPlaySpeed(value),
      stopDebugQaStepReplayAutoPlay: (updateHud) => this.stopDebugQaStepReplayAutoPlay(updateHud),
      advanceDebugQaStepReplay: () => this.advanceDebugQaStepReplay(),
      hasStepReplayState: () => this.debugQaStepReplayState !== null,
      setDebugQaStatus: (value) => {
        this.debugQaStatus = value;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private stopDebugQaStepReplayAutoPlay(updateHud: boolean): void {
    stopDebugQaStepReplayAutoPlayFromFeature({
      replayAutoPlayIntervalId: this.debugQaReplayAutoPlayIntervalId,
      setReplayAutoPlayIntervalId: (value) => {
        this.debugQaReplayAutoPlayIntervalId = value;
      },
      updateHudOnStop: updateHud,
      updateHud: () => this.updateHud(),
    });
  }

  private readDebugQaReplayAutoPlaySpeed(): DebugQaReplayAutoPlaySpeedKey {
    return readDebugQaReplayAutoPlaySpeedFromFeature(
      this.debugQaReplayAutoPlaySpeedSelect?.value ?? this.debugQaReplayAutoPlaySpeed,
    );
  }

  private readStoredDebugQaReplayAutoPlaySpeed(): DebugQaReplayAutoPlaySpeedKey {
    return readStoredDebugQaReplayAutoPlaySpeedFromFeature(
      DEBUG_QA_REPLAY_AUTOPLAY_SPEED_STORAGE_KEY,
      (key) => this.readStorageValue(key),
    );
  }

  private persistDebugQaReplayAutoPlaySpeed(speed: DebugQaReplayAutoPlaySpeedKey): void {
    persistDebugQaReplayAutoPlaySpeedFromFeature(
      DEBUG_QA_REPLAY_AUTOPLAY_SPEED_STORAGE_KEY,
      speed,
      (key, value) => this.writeStorageValue(key, value),
    );
  }

  private getDebugQaReplayAutoPlayIntervalMs(speed: DebugQaReplayAutoPlaySpeedKey): number {
    return getDebugQaReplayAutoPlayIntervalMsFromFeature(speed, DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS);
  }

  private getDebugQaReplayAutoPlaySpeedLabel(speed: DebugQaReplayAutoPlaySpeedKey): string {
    return getDebugQaReplayAutoPlaySpeedLabelFromFeature(speed, DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS);
  }

  private applyStripCalibrationPreset(): void {
    applyStripCalibrationPresetFromFeature({
      stripCalibrationEnabled: this.stripCalibrationEnabled,
      stripCalibrationPresetSelectValue:
        this.debugQaStripCalibrationSelect?.value ?? this.stripCalibrationPreset,
      stripCalibrationPreset: this.stripCalibrationPreset,
      persistStripCalibrationPreset: (value) => this.persistStripCalibrationPreset(value),
      setStripCalibrationPreset: (value) => {
        this.stripCalibrationPreset = value;
      },
      refreshStripCalibrationRuntime: () => this.refreshStripCalibrationRuntime(),
      getActiveStripCalibrationPreset: () => this.getActiveStripCalibrationPreset(),
      setDebugQaStatus: (value) => {
        this.debugQaStatus = value;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private readStripCalibrationPresetFromUi(): StripCalibrationPresetKey {
    return readStripCalibrationPresetFromUiFromFeature(
      this.debugQaStripCalibrationSelect?.value ?? this.stripCalibrationPreset,
    );
  }

  private readStoredStripCalibrationPreset(): StripCalibrationPresetKey {
    return readStoredStripCalibrationPresetFromFeature(DEBUG_QA_STRIP_CALIBRATION_STORAGE_KEY, (key) =>
      this.readStorageValue(key),
    );
  }

  private persistStripCalibrationPreset(preset: StripCalibrationPresetKey): void {
    persistStripCalibrationPresetFromFeature(DEBUG_QA_STRIP_CALIBRATION_STORAGE_KEY, preset, (key, value) =>
      this.writeStorageValue(key, value),
    );
  }

  private refreshStripCalibrationRuntime(): void {
    const playerStrip = this.getStripManifestEntry('player-hero');
    if (playerStrip) {
      for (const animation of ['idle', 'hit', 'cast'] as const) {
        const animationKey = `${playerStrip.key}-${animation}`;
        if (this.anims.exists(animationKey)) {
          this.anims.remove(animationKey);
        }
      }

      this.ensureStripAnimations(playerStrip);
      if (this.playerUsesStripAnimation && !this.playerStripActionTimer) {
        this.playPlayerStripAnimation('idle', true);
      }
    }

    this.stopEnemyHudStripPlayback();
    if (this.combatState) {
      this.renderCombatEnemySprite();
    }
  }

  private getActiveStripCalibrationPreset(): StripCalibrationPreset | null {
    if (!this.stripCalibrationEnabled) {
      return null;
    }

    return STRIP_CALIBRATION_PRESETS.find((preset) => preset.key === this.stripCalibrationPreset) ?? null;
  }

  private readStorageValue(key: string): string | null {
    return readStorageValueFromFeature(key);
  }

  private writeStorageValue(key: string, value: string): void {
    writeStorageValueFromFeature(key, value);
  }

  private formatCombatDebugScriptedIntentsReference(reference: CombatDebugReference): string {
    return formatCombatDebugScriptedIntentsReferenceFromDebugQa(reference);
  }

  private replayImportedDebugQaTrace(): void {
    replayImportedDebugQaTraceFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      importedTrace: this.debugQaImportedTrace,
      stopDebugQaStepReplay: (restoreBaseline) => this.stopDebugQaStepReplay(restoreBaseline),
      applyImportedDebugQaTrace: (trace) => this.applyImportedDebugQaTrace(trace),
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private startDebugQaStepReplay(): void {
    startDebugQaStepReplayFromFeature({
      debugQaEnabled: this.debugQaEnabled,
      importedTrace: this.debugQaImportedTrace,
      stopDebugQaStepReplay: (restoreBaseline) => this.stopDebugQaStepReplay(restoreBaseline),
      captureDebugQaReplayBaseline: () => this.captureDebugQaReplayBaseline(),
      applyImportedDebugQaTrace: (trace) => this.applyImportedDebugQaTrace(trace),
      cloneCombatState: (state) => this.cloneCombatState(state),
      combatState: this.combatState,
      setCombatState: (state) => {
        this.combatState = state;
      },
      setCombatStatus: (status) => {
        this.combatStatus = status;
      },
      setCombatLogs: (logs) => {
        this.combatLogs = logs;
      },
      setCombatMessage: (value) => {
        this.combatMessage = value;
      },
      setCombatError: (value) => {
        this.combatError = value;
      },
      setDebugQaStepReplayState: (value) => {
        this.debugQaStepReplayState = value;
      },
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private advanceDebugQaStepReplay(): void {
    advanceDebugQaStepReplayFromFeature({
      stepReplayState: this.debugQaStepReplayState,
      stopDebugQaStepReplayAutoPlay: (updateHud) => this.stopDebugQaStepReplayAutoPlay(updateHud),
      applyImportedDebugQaTrace: (trace) => this.applyImportedDebugQaTrace(trace),
      cloneCombatState: (state) => this.cloneCombatState(state),
      combatState: this.combatState,
      combatMessage: this.combatMessage,
      setCombatState: (state) => {
        this.combatState = state;
      },
      setCombatStatus: (status) => {
        this.combatStatus = status;
      },
      setCombatLogs: (logs) => {
        this.combatLogs = logs;
      },
      setCombatMessage: (value) => {
        this.combatMessage = value;
      },
      setCombatError: (value) => {
        this.combatError = value;
      },
      setDebugQaStepReplayState: (value) => {
        this.debugQaStepReplayState = value;
      },
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private stopDebugQaStepReplay(restoreBaseline: boolean): void {
    stopDebugQaStepReplayFromFeature({
      restoreBaseline,
      stopDebugQaStepReplayAutoPlay: (updateHud) => this.stopDebugQaStepReplayAutoPlay(updateHud),
      stepReplayState: this.debugQaStepReplayState,
      setDebugQaStepReplayState: (value) => {
        this.debugQaStepReplayState = value;
      },
      restoreDebugQaReplayBaseline: (baseline) => this.restoreDebugQaReplayBaseline(baseline),
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private captureDebugQaReplayBaseline(): DebugQaReplayBaseline {
    return captureDebugQaReplayBaselineFromFeature({
      state: {
        isAuthenticated: this.isAuthenticated,
        authStatus: this.authStatus,
        hudState: this.hudState,
        combatEncounterId: this.combatEncounterId,
        combatStatus: this.combatStatus,
        combatState: this.combatState,
        combatLogs: this.combatLogs,
        combatMessage: this.combatMessage,
        combatError: this.combatError,
      },
      cloneCombatState: (state) => this.cloneCombatState(state),
    });
  }

  private restoreDebugQaReplayBaseline(baseline: DebugQaReplayBaseline): void {
    const nextState = restoreDebugQaReplayBaselineFromFeature({
      baseline,
      cloneCombatState: (state) => this.cloneCombatState(state),
    });
    this.isAuthenticated = nextState.isAuthenticated;
    this.authStatus = nextState.authStatus;
    this.hudState = nextState.hudState;
    this.combatEncounterId = nextState.combatEncounterId;
    this.combatStatus = nextState.combatStatus;
    this.combatState = nextState.combatState;
    this.combatLogs = nextState.combatLogs;
    this.combatMessage = nextState.combatMessage;
    this.combatError = nextState.combatError;
  }

  private async handleDebugQaImportFileChange(event: Event): Promise<void> {
    await handleDebugQaImportFileChangeFromFeature({
      event,
      debugQaEnabled: this.debugQaEnabled,
      stepReplayState: this.debugQaStepReplayState,
      stopDebugQaStepReplay: (restoreBaseline) => this.stopDebugQaStepReplay(restoreBaseline),
      parseImportedDebugQaTrace: (rawPayload, sourceFile) => this.parseImportedDebugQaTrace(rawPayload, sourceFile),
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      setDebugQaImportedTrace: (trace) => {
        this.debugQaImportedTrace = trace;
      },
      setDebugQaStatus: (status) => {
        this.debugQaStatus = status;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      updateHud: () => this.updateHud(),
    });
  }

  private parseImportedDebugQaTrace(rawPayload: unknown, sourceFile: string): ImportedDebugQaTrace | null {
    return parseImportedDebugQaTraceFromDebugQa(rawPayload, sourceFile, {
      parsers: {
        asRecord: (value) => this.payloadGateway.asRecord(value),
        asString: (value) => this.payloadGateway.asString(value),
        asStringArray: (value) => this.payloadGateway.asStringArray(value),
        asNumber: (value) => this.payloadGateway.asNumber(value),
        asCombatUiStatus: (value) => this.payloadGateway.asCombatUiStatus(value),
      },
      normalizeCombatPayload: (value) => this.payloadGateway.normalizeCombatPayload(value),
    });
  }

  private applyImportedDebugQaTrace(trace: ImportedDebugQaTrace): void {
    const nextState = applyImportedDebugQaTraceFromFeature({
      trace,
      currentState: {
        isAuthenticated: this.isAuthenticated,
        authStatus: this.authStatus,
        hudState: this.hudState,
        combatEncounterId: this.combatEncounterId,
        combatStatus: this.combatStatus,
        combatState: this.combatState,
        combatLogs: this.combatLogs,
        combatMessage: this.combatMessage,
        combatError: this.combatError,
      },
      cloneCombatState: (state) => this.cloneCombatState(state),
    });

    this.isAuthenticated = nextState.isAuthenticated;
    this.authStatus = nextState.authStatus;
    this.hudState = nextState.hudState;
    this.combatEncounterId = nextState.combatEncounterId;
    this.combatStatus = nextState.combatStatus;
    this.combatState = nextState.combatState;
    this.combatLogs = nextState.combatLogs;
    this.combatMessage = nextState.combatMessage;
    this.combatError = nextState.combatError;
  }

  private buildDebugQaTracePayload(): DebugQaTracePayload {
    const timestamp = new Date().toISOString();
    return buildDebugQaTracePayloadFromFeature({
      timestamp,
      frontend: {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        apiBaseUrl: API_BASE_URL,
        locationHref: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
      auth: {
        authenticated: this.isAuthenticated,
        status: this.authStatus,
      },
      hudState: this.hudState,
      hudSummaries: {
        combat: getCombatStatusLabelFromLogic(this.combatStatus),
        quests: getQuestSummaryLabelFromFeature({
          isAuthenticated: this.isAuthenticated,
          questBusy: this.questBusy,
          quests: this.quests,
        }),
        blacksmith: getBlacksmithShopSummaryLabelFromFeature({
          isAuthenticated: this.isAuthenticated,
          blacksmithUnlocked: this.hudState.blacksmithUnlocked,
          blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
          blacksmithBusy: this.blacksmithBusy,
          blacksmithOffersCount: this.blacksmithOffers.length,
          gold: this.hudState.gold,
        }),
        autosave: getAutoSaveSummaryLabelFromFeature({
          isAuthenticated: this.isAuthenticated,
          autosaveBusy: this.autosaveBusy,
          autosave: this.autosave,
        }),
        saveSlots: getSaveSlotsSummaryLabelFromFeature({
          isAuthenticated: this.isAuthenticated,
          saveSlotsBusy: this.saveSlotsBusy,
          saveSlots: this.saveSlots,
        }),
      },
      combat: this.buildCombatTraceSnapshot(),
      debugQa: {
        enabled: this.debugQaEnabled,
        status: this.debugQaStatus,
        busyAction: this.debugQaBusyAction,
        message: this.debugQaMessage,
        error: this.debugQaError,
        filters: {
          recapOutcome: this.debugQaRecapOutcomeFilter,
          recapEnemyQuery: this.debugQaRecapEnemyFilter,
          scriptedEnemyQuery: this.debugQaScriptEnemyFilter,
          scriptedIntentQuery: this.debugQaScriptIntentFilter,
        },
        scriptedIntentsReference: {
          loaded: this.debugQaScriptedIntentsReference !== null,
          enemyProfiles: this.debugQaScriptedIntentsReference?.scriptedIntents.length ?? 0,
        },
        replayAutoPlay: {
          active: this.debugQaReplayAutoPlayIntervalId !== null,
          speed: this.debugQaReplayAutoPlaySpeed,
          intervalMs: this.getDebugQaReplayAutoPlayIntervalMs(this.debugQaReplayAutoPlaySpeed),
        },
        stripCalibrationPreset: this.stripCalibrationPreset,
      },
    });
  }

  private buildCombatTraceSnapshot(): DebugQaTracePayload['combat'] {
    return buildCombatTraceSnapshotFromFeature({
      combatEncounterId: this.combatEncounterId,
      combatStatus: this.combatStatus,
      combatMessage: this.combatMessage,
      combatError: this.combatError,
      combatLogs: this.combatLogs,
      combatState: this.combatState,
      getCombatTelemetryLabel: () => getCombatTelemetryLabelFromLogic(this.combatState),
      cloneCombatState: (state) => this.cloneCombatState(state),
    });
  }

  private buildDebugQaMarkdownReport(timestamp: string): string {
    return buildDebugQaMarkdownReportFromDebugQa({
      timestamp,
      mode: import.meta.env.MODE,
      url: window.location.href,
      recapOutcomeFilter: this.debugQaRecapOutcomeFilter,
      recapEnemyFilter: this.debugQaRecapEnemyFilter,
      scriptEnemyFilter: this.debugQaScriptEnemyFilter,
      scriptIntentFilter: this.debugQaScriptIntentFilter,
      combatState: this.combatState,
      combatLogs: this.combatLogs,
      debugQaScriptedIntentsReference: this.debugQaScriptedIntentsReference,
    });
  }

  private buildDebugQaTraceFilename(timestamp: string): string {
    return buildDebugQaTraceFilenameFromDebugQa(timestamp);
  }

  private buildDebugQaMarkdownFilename(timestamp: string): string {
    return buildDebugQaMarkdownFilenameFromDebugQa(timestamp);
  }

  private downloadJsonFile(filename: string, payload: unknown): void {
    downloadJsonFileFromDebugQa(filename, payload);
  }

  private downloadTextFile(filename: string, contents: string, contentType = 'text/plain;charset=utf-8'): void {
    downloadTextFileFromDebugQa(filename, contents, contentType);
  }

  private async handleDebugQaAction(action: DebugQaActionName): Promise<void> {
    await runDebugQaActionFromFeature({
      action,
      debugQaEnabled: this.debugQaEnabled,
      isAuthenticated: this.isAuthenticated,
      request: this.buildDebugQaRequest(action),
      fetchJson: (path, init) => this.fetchJson<unknown>(path, init),
      setDebugQaBusyAction: (value) => {
        this.debugQaBusyAction = value;
      },
      setDebugQaStatus: (value) => {
        this.debugQaStatus = value;
      },
      setDebugQaError: (value) => {
        this.debugQaError = value;
      },
      setDebugQaMessage: (value) => {
        this.debugQaMessage = value;
      },
      getDebugQaSuccessMessage: (payload, fallback) => this.getDebugQaSuccessMessage(action, payload, fallback),
      bootstrapSessionState: () => this.bootstrapSessionState(),
      getErrorMessage: (error, fallback) => this.getErrorMessage(error, fallback),
      updateHud: () => this.updateHud(),
    });
  }

  private buildDebugQaRequest(
    action: DebugQaActionName,
  ):
    | {
        path: string;
        body: Record<string, unknown>;
        loadingLabel: string;
        successLabel: string;
        failureLabel: string;
      }
    | null {
    return buildDebugQaRequestFromFeature({
      action,
      grantXp: readDebugQaNumberFromDebugQa(this.debugQaGrantXpInput, 250),
      grantGold: readDebugQaNumberFromDebugQa(this.debugQaGrantGoldInput, 500),
      towerFloor: readDebugQaNumberFromDebugQa(this.debugQaTowerFloorInput, 10, 1, 10),
      statePresetKey: (this.debugQaStatePresetSelect?.value.trim() || 'mid_tower') as DebugStatePresetKey,
      loadoutPresetKey: this.debugQaLoadoutPresetSelect?.value.trim() || 'tower_mid',
      worldFlags: readDebugQaFlagListFromDebugQa(this.debugQaWorldFlagsInput),
      worldFlagsToRemove: readDebugQaFlagListFromDebugQa(this.debugQaWorldFlagsRemoveInput),
      replaceWorldFlags: Boolean(this.debugQaWorldFlagsReplaceInput?.checked),
      questKey: this.debugQaQuestKeyInput?.value.trim() ?? '',
      questStatusRaw: this.debugQaQuestStatusSelect?.value.trim() ?? '',
      isQuestStatusValue: (value) => isQuestStatusValueFromDebugQa(value),
    });
  }

  private getDebugQaSuccessMessage(
    action: DebugQaActionName,
    payload: unknown,
    fallback: string,
  ): string {
    return getDebugQaSuccessMessageFromFeature({
      action,
      payload,
      fallback,
      formatApplyStatePresetSuccess: (payloadValue) => this.formatApplyStatePresetSuccess(payloadValue),
      formatSetWorldFlagsSuccess: (payloadValue) => this.formatSetWorldFlagsSuccess(payloadValue),
      formatSetQuestStatusSuccess: (payloadValue) => this.formatSetQuestStatusSuccess(payloadValue),
    });
  }

  private formatApplyStatePresetSuccess(payload: unknown): string | null {
    return formatApplyStatePresetSuccessFromDebugQa(payload, {
      asRecord: (value) => this.payloadGateway.asRecord(value),
      asString: (value) => this.payloadGateway.asString(value),
      asStringArray: (value) => this.payloadGateway.asStringArray(value),
      asNumber: (value) => this.payloadGateway.asNumber(value),
    });
  }

  private formatSetWorldFlagsSuccess(payload: unknown): string | null {
    return formatSetWorldFlagsSuccessFromDebugQa(payload, {
      asRecord: (value) => this.payloadGateway.asRecord(value),
      asStringArray: (value) => this.payloadGateway.asStringArray(value),
    });
  }

  private formatSetQuestStatusSuccess(payload: unknown): string | null {
    return formatSetQuestStatusSuccessFromDebugQa(payload, {
      asRecord: (value) => this.payloadGateway.asRecord(value),
      asString: (value) => this.payloadGateway.asString(value),
    });
  }

  private readHeroProfileAppearanceFromUi(): HeroAppearanceKey {
    const raw = this.heroProfileAppearanceSelect?.value?.trim() ?? '';
    if (isHeroAppearanceKey(raw)) {
      return raw;
    }

    return 'default';
  }

  private readFarmSeedSelectionFromUi(): string {
    const value = this.farmSeedSelect?.value?.trim() ?? '';
    if (!value) {
      return '';
    }

    const farm = this.farmState;
    if (!farm) {
      return value;
    }

    const availableSeeds = new Set(
      farm.cropCatalog
        .filter((entry) => entry.unlocked)
        .map((entry) => entry.seedItemKey),
    );
    return availableSeeds.has(value) ? value : '';
  }

  private getDayPhaseKey(): 'day' | 'night' {
    return getDayPhaseKeyFromVillageHud(this.hudState.day);
  }

  private getDayPhaseLabel(): string {
    return getDayPhaseLabelFromVillageHud(this.hudState.day);
  }

  private updateDayPhaseVisual(): void {
    const phase = this.getDayPhaseKey();
    const gameShell = document.getElementById('game-shell');
    if (gameShell) {
      gameShell.dataset.dayPhase = phase;
    }
  }

  private getVillageNpcDialogueLabel(npcKey: VillageNpcKey): string {
    return getVillageNpcDialogueLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      npcKey,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
  }

  private getVillageNpcUnavailableDialogue(npcKey: VillageNpcKey, stateKey: string): string {
    return getVillageNpcUnavailableDialogueFromLogic(npcKey, stateKey);
  }

  private getVillageNpcCooldownDialogue(
    npcKey: VillageNpcKey,
    tier: VillageNpcRelationshipTier,
  ): string {
    return getVillageNpcCooldownDialogueFromLogic(npcKey, tier);
  }

  private getMayorContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
    return getMayorContextDialogueFromLogic(tier, stateKey);
  }

  private getBlacksmithContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
    return getBlacksmithContextDialogueFromLogic(tier, stateKey);
  }

  private getMerchantContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
    return getMerchantContextDialogueFromLogic(tier, stateKey);
  }

  private formatVillageNpcStateLabel(stateKey: string): string {
    return formatVillageNpcStateLabelFromLogic(stateKey);
  }

  private formatVillageRelationshipTierLabel(tier: VillageNpcRelationshipTier): string {
    return formatVillageRelationshipTierLabelFromLogic(tier);
  }

  private async fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    return fetchJsonFromApi<T>(path, init);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return formatRequestErrorFromApi(error, fallback);
  }

  private formatIsoForHud(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const dd = `${date.getDate()}`.padStart(2, '0');
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = `${date.getHours()}`.padStart(2, '0');
    const min = `${date.getMinutes()}`.padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  private formatValue(value: number): string {
    return `${Math.max(0, Math.round(value))}`;
  }

  private cloneCombatState(state: CombatEncounterState): CombatEncounterState {
    const cloned: CombatEncounterState = {
      ...state,
      logs: [...state.logs],
      player: { ...state.player },
      enemy: { ...state.enemy },
    };

    if (state.scriptState) {
      cloned.scriptState = { ...state.scriptState };
    }

    return cloned;
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(80, 50);
  }

  private drawDecor(): void {
    if (this.farmSceneBackground) {
      this.farmSceneBackground.destroy();
      this.farmSceneBackground = null;
    }
    this.clearFarmSceneVisuals();
    this.clearVillageSceneVisuals();

    for (const label of this.farmSceneStaticLabels) {
      label.destroy();
    }
    this.farmSceneStaticLabels = [];

    const graphics = this.add.graphics();
    graphics.setDepth(1);
    this.farmSceneBackground = graphics;

    if (this.frontSceneMode === 'village') {
      this.drawVillageDecor(graphics);
      return;
    }

    this.drawFarmDecor(graphics);
  }

  private drawFarmDecor(graphics: Phaser.GameObjects.Graphics): void {
    drawFarmSceneBackdrop(graphics);

    this.farmSceneStaticLabels.push(...createFarmStaticLabelsFromFeature(this));

    this.createFarmActionZone(220, 236, 222, 146, () => {
      void this.sleepAtFarm();
    });
    this.createFarmActionZone(218, 446, 196, 74, () => {
      this.toggleFarmCraftingPanel();
    });
    this.createFarmActionZone(1278, 418, 174, 280, () => {
      this.handleFarmVillageExitIntent();
    });

    this.farmSceneActionHintLabel = createFarmActionHintLabelFromFeature(this);

    this.renderFarmScene();
  }

  private drawVillageDecor(graphics: Phaser.GameObjects.Graphics): void {
    drawVillageSceneBackdrop(graphics);

    this.farmSceneStaticLabels.push(...createVillageStaticLabelsFromFeature(this));

    for (const zone of VILLAGE_SCENE_ZONES) {
      this.createVillageActionZone(zone);
    }

    this.villageSceneActionHintLabel = createVillageActionHintLabelFromFeature(this);

    this.ensureVillageSelectedZone();
    this.renderVillageScene();
  }

  private createVillageActionZone(config: VillageSceneZoneConfig): void {
    const visual = createVillageActionZoneFromFeature({
      scene: this,
      config,
      getZoneStateLabel: (zone) => getVillageZoneStateLabelFromLogic({
        isAuthenticated: this.isAuthenticated,
        zone,
        villageMarketUnlocked: this.villageMarketUnlocked,
        villageMarketSeedOffersCount: this.villageMarketSeedOffers.length,
        blacksmithUnlocked: this.hudState.blacksmithUnlocked,
        blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
        villageNpcState: this.villageNpcState,
        villageNpcRelationships: this.villageNpcRelationships,
      }),
      onHover: () => {
        this.setVillageSelectedZone(config.key, false);
        this.updateHud();
      },
      onInteract: () => {
        this.setVillageSelectedZone(config.key, true);
        void this.handleVillageInteractionIntent(config.key);
      },
    });
    this.villageSceneZoneVisuals.set(config.key, visual);
  }

  private createFarmActionZone(
    x: number,
    y: number,
    width: number,
    height: number,
    onTrigger: () => void,
  ): void {
    const trigger = createFarmActionZoneFromFeature({ scene: this, x, y, width, height, onTrigger });
    this.farmSceneStaticLabels.push(trigger);
  }

  private clearFarmSceneVisuals(): void {
    clearFarmScenePlotVisualsFromFeature(this.farmScenePlotVisuals);
    this.farmSceneRenderSignature = '';

    if (this.farmSceneActionHintLabel) {
      this.farmSceneActionHintLabel.destroy();
      this.farmSceneActionHintLabel = null;
    }
  }

  private clearVillageSceneVisuals(): void {
    clearVillageSceneZoneVisualsFromFeature(this.villageSceneZoneVisuals);
    this.villageSceneRenderSignature = '';

    if (this.villageSceneActionHintLabel) {
      this.villageSceneActionHintLabel.destroy();
      this.villageSceneActionHintLabel = null;
    }
  }

  private renderFarmScene(): void {
    if (this.frontSceneMode !== 'farm') {
      return;
    }

    const signature = `${this.computeFarmRenderSignature()}|${this.getDayPhaseKey()}`;
    if (signature === this.farmSceneRenderSignature) {
      return;
    }
    this.farmSceneRenderSignature = signature;

    this.ensureSelectedFarmPlot();
    const slots = getFarmSceneSlotsFromLogic(this.farmState) as FarmScenePlotSlot[];
    renderFarmScenePlotVisualsFromFeature({
      scene: this,
      plotVisuals: this.farmScenePlotVisuals,
      slots,
      selectedPlotKey: this.farmSelectedPlotKey,
      getPlotPosition: (slot) => getFarmScenePlotPositionFromLogic(slot),
      getPlotPhase: (plot) => getFarmPlotPhaseFromLogic(plot),
      getPlotPalette: (phase, selected) => getFarmScenePlotPaletteFromLogic(phase, selected),
      getPlotPhaseLabel: (plot) => getFarmPlotPhaseLabelFromLogic(plot),
      onSelectPlot: (plotKey) => {
        this.setSelectedFarmPlot(plotKey, true);
        this.updateHud();
      },
    });

    if (this.farmSceneActionHintLabel) {
      this.farmSceneActionHintLabel.setText(getFarmFeedbackLabelFromLogic({
        farmError: this.farmError,
        farmCraftingError: this.farmCraftingError,
        farmBusy: this.farmBusy,
        farmCraftingBusy: this.farmCraftingBusy,
        farmFeedbackMessage: this.farmFeedbackMessage,
        isAuthenticated: this.isAuthenticated,
        farmUnlocked: Boolean(this.farmState?.unlocked),
      }));
    }
  }

  private renderVillageScene(): void {
    if (this.frontSceneMode !== 'village') {
      return;
    }

    const signature = this.getVillageRenderSignature();
    if (signature === this.villageSceneRenderSignature) {
      return;
    }
    this.villageSceneRenderSignature = signature;

    renderVillageSceneZoneVisualsFromFeature({
      zoneVisuals: this.villageSceneZoneVisuals,
      selectedZoneKey: this.villageSelectedZoneKey,
      getZoneStateLabel: (zone) => getVillageZoneStateLabelFromLogic({
        isAuthenticated: this.isAuthenticated,
        zone,
        villageMarketUnlocked: this.villageMarketUnlocked,
        villageMarketSeedOffersCount: this.villageMarketSeedOffers.length,
        blacksmithUnlocked: this.hudState.blacksmithUnlocked,
        blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
        villageNpcState: this.villageNpcState,
        villageNpcRelationships: this.villageNpcRelationships,
      }),
      getZoneStateColor: (zone) => getVillageZoneStateColorFromLogic({
        isAuthenticated: this.isAuthenticated,
        zone,
        villageMarketUnlocked: this.villageMarketUnlocked,
        blacksmithUnlocked: this.hudState.blacksmithUnlocked,
        interactionState: getVillageZoneInteractionStateFromLogic({
          isAuthenticated: this.isAuthenticated,
          zone,
          villageMarketUnlocked: this.villageMarketUnlocked,
          blacksmithUnlocked: this.hudState.blacksmithUnlocked,
          blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
          villageNpcState: this.villageNpcState,
          villageNpcRelationships: this.villageNpcRelationships,
        }),
      }),
    });

    if (this.villageSceneActionHintLabel) {
      this.villageSceneActionHintLabel.setText(getVillageInteractionFeedbackLabelFromLogic({
        villageNpcError: this.villageNpcError,
        villageFeedbackMessage: this.villageFeedbackMessage,
        frontSceneMode: this.frontSceneMode,
        isAuthenticated: this.isAuthenticated,
        villageShopPanelOpen: this.villageShopControllerState.isOpen,
        villageShopType: this.villageShopControllerState.shopType,
      }));
    }
  }

  private getVillageRenderSignature(): string {
    return buildVillageRenderSignatureFromFeature({
      frontSceneMode: this.frontSceneMode,
      selectedZoneKey: this.villageSelectedZoneKey,
      villageMarketUnlocked: this.villageMarketUnlocked,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      villageFeedbackMessage: this.villageFeedbackMessage,
      villageNpcError: this.villageNpcError,
      dayPhaseKey: this.getDayPhaseKey(),
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
  }

  private ensureVillageSelectedZone(): void {
    this.villageSelectedZoneKey = ensureVillageSelectedZoneKeyFromFeature({
      zones: VILLAGE_SCENE_ZONES,
      selectedZoneKey: this.villageSelectedZoneKey,
      villageNpcState: this.villageNpcState,
    });
  }

  private setVillageSelectedZone(zoneKey: VillageSceneZoneKey, announceSelection: boolean): void {
    if (!VILLAGE_SCENE_ZONES.some((zone) => zone.key === zoneKey)) {
      return;
    }

    if (this.villageSelectedZoneKey === zoneKey) {
      return;
    }

    this.villageSelectedZoneKey = zoneKey;
    this.villageSceneRenderSignature = '';
    if (announceSelection) {
      const zone = getVillageZoneByKeyFromFeature(VILLAGE_SCENE_ZONES, zoneKey);
      if (zone) {
        this.villageFeedbackMessage = `Cible active: ${zone.title}.`;
      }
    }
  }

  private updateVillageSelectionFromPlayerPosition(): void {
    if (!this.player) {
      return;
    }

    const nearestKey = getNearestVillageZoneKeyFromFeature({
      zones: VILLAGE_SCENE_ZONES,
      playerX: this.player.x,
      playerY: this.player.y,
      maxDistanceSq: 420 * 420,
    });
    if (!nearestKey) {
      return;
    }

    this.setVillageSelectedZone(nearestKey, false);
  }

  private cycleVillageTarget(step: number, announceSelection: boolean): void {
    if (this.frontSceneMode !== 'village' || VILLAGE_SCENE_ZONES.length === 0) {
      return;
    }

    this.ensureVillageSelectedZone();
    const nextZoneKey = getCycledVillageZoneKeyFromFeature({
      zones: VILLAGE_SCENE_ZONES,
      currentSelectedZoneKey: this.villageSelectedZoneKey,
      step,
    });
    if (!nextZoneKey) {
      return;
    }
    this.setVillageSelectedZone(nextZoneKey, announceSelection);
  }

  private ensureSelectedFarmPlot(): void {
    const slots = getFarmSceneSlotsFromLogic(this.farmState);
    this.farmSelectedPlotKey = resolveSelectedFarmPlotKeyFromLogic(slots, this.farmSelectedPlotKey);
  }

  private setSelectedFarmPlot(plotKey: string, announceSelection: boolean): void {
    const slot = getFarmSlotByKeyFromLogic(getFarmSceneSlotsFromLogic(this.farmState), plotKey);
    if (!slot) {
      return;
    }

    this.farmSelectedPlotKey = plotKey;
    this.farmError = null;
    if (announceSelection) {
      this.farmFeedbackMessage = `Parcelle ${slot.row}-${slot.col} ciblee.`;
    }
    this.farmSceneRenderSignature = '';
  }

  private updateFarmContextPanel(): void {
    const farm = this.farmState;
    const selectedPlot = getFarmPlotByKeyFromLogic(this.farmSelectedPlotKey, this.farmState);
    const context = buildFarmContextViewModelFromFeature({
      isAuthenticated: this.isAuthenticated,
      farmUnlocked: Boolean(farm?.unlocked),
      selectedPlot,
      selectedSeedItemKey: this.farmSelectedSeedItemKey,
      farmBusy: this.farmBusy,
      getFarmPlotStatusLabel: (plot) => this.getFarmPlotStatusLabel(plot),
      formatFarmLabel: (raw) => this.formatFarmLabel(raw),
    });

    if (this.farmContextTitleValue) {
      this.farmContextTitleValue.textContent = context.title;
    }

    if (this.farmContextStatusValue) {
      this.farmContextStatusValue.textContent = context.status;
    }
    const selectedPlotKey = context.selectedPlotKey;

    const plantButton = this.farmContextPlantButton;
    if (plantButton) {
      plantButton.dataset.farmAction = 'plant';
      if (selectedPlotKey) {
        plantButton.dataset.plotKey = selectedPlotKey;
      } else {
        delete plantButton.dataset.plotKey;
      }
      plantButton.textContent = context.plantLabel;
      plantButton.disabled = !context.canPlant;
    }

    const waterButton = this.farmContextWaterButton;
    if (waterButton) {
      waterButton.dataset.farmAction = 'water';
      if (selectedPlotKey) {
        waterButton.dataset.plotKey = selectedPlotKey;
      } else {
        delete waterButton.dataset.plotKey;
      }
      waterButton.disabled = !context.canWater;
    }

    const harvestButton = this.farmContextHarvestButton;
    if (harvestButton) {
      harvestButton.dataset.farmAction = 'harvest';
      if (selectedPlotKey) {
        harvestButton.dataset.plotKey = selectedPlotKey;
      } else {
        delete harvestButton.dataset.plotKey;
      }
      harvestButton.disabled = !context.canHarvest;
    }
  }

  private toggleFarmCraftingPanel(): void {
    if (!this.isAuthenticated) {
      this.farmFeedbackMessage = 'Connexion requise pour ouvrir le craft.';
      this.updateHud();
      return;
    }

    if (!this.farmState?.unlocked) {
      this.farmFeedbackMessage = 'Le coin craft se debloque avec la ferme.';
      this.updateHud();
      return;
    }

    this.farmCraftingPanelOpen = !this.farmCraftingPanelOpen;
    this.farmFeedbackMessage = this.farmCraftingPanelOpen
      ? 'Coin craft ouvert.'
      : 'Coin craft ferme.';
    this.updateHud();
  }

  private handleFarmVillageExitIntent(): void {
    if (!this.isAuthenticated) {
      this.farmFeedbackMessage = 'Connexion requise pour quitter la ferme.';
      this.updateHud();
      return;
    }

    this.setFrontSceneMode('village', 'Tu rejoins le village. Le hub est maintenant jouable.');
  }

  private setFrontSceneMode(mode: FrontSceneMode, feedbackMessage: string): void {
    const modeChanged = this.frontSceneMode !== mode;
    this.frontSceneMode = mode;
    this.hudState.area = mode === 'farm' ? 'Ferme' : 'Village';

    if (mode === 'farm') {
      this.farmFeedbackMessage = feedbackMessage;
      this.villageFeedbackMessage = null;
      this.villageShopControllerState = closeVillageShopControllerPanelFromFeature(this.villageShopControllerState);
      this.player.setPosition(FARM_SCENE_PLAYER_SPAWN.x, FARM_SCENE_PLAYER_SPAWN.y);
    } else {
      this.villageFeedbackMessage = feedbackMessage;
      this.farmFeedbackMessage = null;
      if (modeChanged) {
        this.villageShopControllerState = closeVillageShopControllerPanelFromFeature(this.villageShopControllerState);
      }
      this.player.setPosition(VILLAGE_SCENE_PLAYER_SPAWN.x, VILLAGE_SCENE_PLAYER_SPAWN.y);
      this.ensureVillageSelectedZone();
    }

    this.player.body?.setVelocity(0, 0);

    if (modeChanged) {
      this.drawDecor();
      this.rebuildSceneObstacles();
      this.syncHudSceneMode();
    } else if (mode === 'village') {
      this.renderVillageScene();
    } else {
      this.renderFarmScene();
    }

    this.updateHud();
  }

  private handleVillageHotkeys(): void {
    if (this.frontSceneMode !== 'village' || isTypingInsideFieldFromCommon(document.activeElement)) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.villageHotkeys.cycleTarget)) {
      this.cycleVillageTarget(1, true);
      this.updateHud();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.villageHotkeys.interact)) {
      void this.handleVillageInteractionIntent();
    }
  }

  private async handleVillageInteractionIntent(targetKey?: VillageSceneZoneKey): Promise<void> {
    if (this.frontSceneMode !== 'village') {
      return;
    }

    const selectedZone = getVillageZoneByKeyFromFeature(VILLAGE_SCENE_ZONES, targetKey ?? this.villageSelectedZoneKey);
    const interactionState = selectedZone
      ? getVillageZoneInteractionStateFromLogic({
          isAuthenticated: this.isAuthenticated,
          zone: selectedZone,
          villageMarketUnlocked: this.villageMarketUnlocked,
          blacksmithUnlocked: this.hudState.blacksmithUnlocked,
          blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
          villageNpcState: this.villageNpcState,
          villageNpcRelationships: this.villageNpcRelationships,
        })
      : null;
    const interactionPlan = buildVillageInteractionPlanFromFeature({
      targetKey,
      selectedZoneKey: this.villageSelectedZoneKey,
      zones: VILLAGE_SCENE_ZONES,
      interactionState,
      villageShopPanelOpen: this.villageShopControllerState.isOpen,
      secondaryDialogueMessage: getVillageSecondaryDialogueFromLogic({
        isAuthenticated: this.isAuthenticated,
        towerHighestFloor: this.hudState.towerHighestFloor,
      }),
    });

    for (const step of interactionPlan.steps) {
      if (step.kind === 'select-zone') {
        this.setVillageSelectedZone(step.zoneKey, step.announceSelection);
        continue;
      }

      if (step.kind === 'close-shop-panel') {
        this.villageShopControllerState = closeVillageShopControllerPanelFromFeature(this.villageShopControllerState);
        continue;
      }

      if (step.kind === 'open-shop-panel') {
        this.openVillageShopPanel(step.shopType, step.feedbackMessage);
        return;
      }

      if (step.kind === 'talk-npc') {
        await this.interactVillageNpc(step.npcKey);
        if (!this.villageNpcError) {
          this.villageFeedbackMessage = step.successMessage;
        }
        this.updateHud();
        return;
      }

      if (step.kind === 'switch-front-scene') {
        this.setFrontSceneMode(step.sceneMode, step.feedbackMessage);
        return;
      }

      this.villageFeedbackMessage = step.message;
    }

    this.updateHud();
  }

  private handleFarmHotkeys(): void {
    const hotkeyResolution = resolveFarmHotkeyCommandFromFeature({
      isTypingInsideField: isTypingInsideFieldFromCommon(document.activeElement),
      hotkeys: {
        craft: Phaser.Input.Keyboard.JustDown(this.farmHotkeys.craft),
        sleep: Phaser.Input.Keyboard.JustDown(this.farmHotkeys.sleep),
        plant: Phaser.Input.Keyboard.JustDown(this.farmHotkeys.plant),
        water: Phaser.Input.Keyboard.JustDown(this.farmHotkeys.water),
        harvest: Phaser.Input.Keyboard.JustDown(this.farmHotkeys.harvest),
      },
      selectedPlotKey: this.farmSelectedPlotKey,
    });

    if (hotkeyResolution.kind === 'toggle-crafting-panel') {
      this.toggleFarmCraftingPanel();
      return;
    }

    if (hotkeyResolution.kind === 'sleep-at-farm') {
      void this.sleepAtFarm();
      return;
    }

    if (hotkeyResolution.kind === 'plot-action') {
      if (hotkeyResolution.farmAction === 'plant') {
        void this.plantFarmPlot(hotkeyResolution.plotKey);
        return;
      }

      if (hotkeyResolution.farmAction === 'water') {
        void this.waterFarmPlot(hotkeyResolution.plotKey);
        return;
      }

      if (hotkeyResolution.farmAction === 'harvest') {
        void this.harvestFarmPlot(hotkeyResolution.plotKey);
      }
    }
  }

  private rebuildSceneObstacles(): void {
    for (const collider of this.sceneObstacleColliders) {
      collider.destroy();
    }
    this.sceneObstacleColliders = [];

    for (const obstacle of this.sceneObstacles) {
      obstacle.destroy();
    }
    this.sceneObstacles = [];

    const layout = getSceneObstacleLayoutFromCommon(this.frontSceneMode);

    for (const entry of layout) {
      const obstacle = this.createObstacle(entry.x, entry.y, entry.width, entry.height);
      this.sceneObstacles.push(obstacle);
      this.sceneObstacleColliders.push(this.physics.add.collider(this.player, obstacle));
    }
  }

  private createObstacle(x: number, y: number, width: number, height: number): Phaser.GameObjects.Rectangle {
    const obstacle = this.add.rectangle(x, y, width, height, 0x0f1410, 0.001);
    obstacle.setDepth(3);
    this.physics.add.existing(obstacle, true);
    return obstacle;
  }
}
