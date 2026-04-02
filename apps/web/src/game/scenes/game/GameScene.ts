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
import { resetGameplayHudStateForScene as resetGameplayHudStateForSceneFromService } from './services/gameplayStateReset';
import { createGameScenePayloadGateway } from './services/gameScenePayloadGateway';
import { applyGameplaySnapshotForScene as applyGameplaySnapshotForSceneFromService } from './services/gameplaySnapshotApplier';
import {
  refreshCombatStateForScene as refreshCombatStateForSceneFromService,
  refreshSaveSlotsStateForScene as refreshSaveSlotsStateForSceneFromService,
  refreshVillageMarketStateForScene as refreshVillageMarketStateForSceneFromService,
} from './services/stateRefreshHandlers';
import {
  type FarmPlotStateLike,
  formatFarmLabel as formatFarmLabelFromLogic,
  getFarmCraftingSummaryLabel as getFarmCraftingSummaryLabelFromLogic,
  getFarmFeedbackLabel as getFarmFeedbackLabelFromLogic,
  getFarmPlotByKey as getFarmPlotByKeyFromLogic,
  getFarmPlotPhase as getFarmPlotPhaseFromLogic,
  getFarmPlotPhaseLabel as getFarmPlotPhaseLabelFromLogic,
  getFarmPlotStatusLabel as getFarmPlotStatusLabelFromLogic,
  getFarmScenePlotPalette as getFarmScenePlotPaletteFromLogic,
  getFarmScenePlotPosition as getFarmScenePlotPositionFromLogic,
  getFarmSceneSlots as getFarmSceneSlotsFromLogic,
  getFarmSlotByKey as getFarmSlotByKeyFromLogic,
  getFarmStoryNarrativeLabel as getFarmStoryNarrativeLabelFromLogic,
  getFarmStorySummaryLabel as getFarmStorySummaryLabelFromLogic,
  getFarmSummaryLabel as getFarmSummaryLabelFromLogic,
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
import { renderFarmSceneForScene as renderFarmSceneForSceneFromFeature } from './features/farm/farmSceneModeRenderer';
import { createFarmActionZone as createFarmActionZoneFromFeature } from './features/farm/farmSceneZones';
import { buildFarmContextViewModel as buildFarmContextViewModelFromFeature } from './features/farm/farmContextLogic';
import { updateFarmContextPanel as updateFarmContextPanelFromFeature } from './features/farm/farmContextHudRenderer';
import {
  runCraftFarmRecipeAction as runCraftFarmRecipeActionFromFeature,
  runHarvestFarmPlotAction as runHarvestFarmPlotActionFromFeature,
  runPlantFarmPlotAction as runPlantFarmPlotActionFromFeature,
  runSleepAtFarmAction as runSleepAtFarmActionFromFeature,
  runWaterFarmPlotAction as runWaterFarmPlotActionFromFeature,
} from './features/farm/farmActionHandlers';
import {
  resolveFarmHotkeyCommand as resolveFarmHotkeyCommandFromFeature,
  runFarmHotkeyCommand as runFarmHotkeyCommandFromFeature,
} from './features/farm/farmHotkeyController';
import { updateFarmHudForScene as updateFarmHudForSceneFromFeature } from './features/farm/farmHudUpdater';
import { isTypingInsideField as isTypingInsideFieldFromCommon } from './features/common/inputGuards';
import {
  activateGamepadHudElement as activateGamepadHudElementFromCommon,
  applyGamepadHudFocusState as applyGamepadHudFocusStateFromCommon,
  clearGamepadHudFocus as clearGamepadHudFocusFromCommon,
  getGamepadHudFocusableElements as getGamepadHudFocusableElementsFromCommon,
  getWrappedGamepadHudFocusIndex as getWrappedGamepadHudFocusIndexFromCommon,
  resolveRetainedGamepadHudFocusIndex as resolveRetainedGamepadHudFocusIndexFromCommon,
} from './features/common/gamepadHudLogic';
import { updateGamepadInputFrame as updateGamepadInputFrameFromFeature } from './features/common/gamepadInputController';
import { getSceneObstacleLayout as getSceneObstacleLayoutFromCommon } from './features/common/sceneObstacleLayout';
import { setFrontSceneModeForScene as setFrontSceneModeForSceneFromCommon } from './features/common/frontSceneModeController';
import { setupPlayerForScene as setupPlayerForSceneFromCommon } from './features/common/playerSetupController';
import {
  renderFarmCraftingRecipes as renderFarmCraftingRecipesFromFeature,
  renderFarmPanel as renderFarmPanelFromFeature,
} from './features/farm/farmHudRenderer';
import {
  getPlayerCombatActionAnimation as getPlayerCombatActionAnimationFromFeature,
} from './features/combat/combatActionLogic';
import { updateCombatButtonsForScene as updateCombatButtonsForSceneFromFeature } from './features/combat/combatButtonUpdater';
import { runForfeitCombatActionForScene as runForfeitCombatActionForSceneFromFeature, runPerformCombatActionForScene as runPerformCombatActionForSceneFromFeature, runStartCombatActionForScene as runStartCombatActionForSceneFromFeature } from './features/combat/combatSessionActionHandlers';
import {
  getCombatEnemyIntentUi as getCombatEnemyIntentUiFromFeature,
  getCombatIntentIconTooltip as getCombatIntentIconTooltipFromFeature,
} from './features/combat/combatIntentUiLogic';
import { startEnemyHudStripPlaybackForScene as startEnemyHudStripPlaybackForSceneFromFeature } from './features/combat/enemyHudStripPlaybackController';
import { resolveCombatGamepadShortcuts as resolveCombatGamepadShortcutsFromFeature } from './features/combat/combatGamepadShortcuts';
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
import { runPrepareCombatLoopActionForScene as runPrepareCombatLoopActionForSceneFromFeature } from './features/combat/combatLoopActionHandlers';
import { updateCombatHudForScene as updateCombatHudForSceneFromFeature } from './features/combat/combatHudUpdater';
import {
  getCombatLogsFallback as getCombatLogsFallbackFromFeature,
  renderCombatEffectChips as renderCombatEffectChipsFromFeature,
  renderCombatEnemyIntentChip as renderCombatEnemyIntentChipFromFeature,
  renderCombatEnemySprite as renderCombatEnemySpriteFromFeature,
  renderCombatLogs as renderCombatLogsFromFeature,
} from './features/combat/combatHudRenderer';
import {
  getCombatRecapLabel as getCombatRecapLabelFromLogic,
  getCombatTelemetryLabel as getCombatTelemetryLabelFromLogic,
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
  updateVillageShopPanelForScene as updateVillageShopPanelForSceneFromFeature,
} from './features/shops/villageShopPanelUpdater';
import {
  runBuyBlacksmithOfferAction as runBuyBlacksmithOfferActionFromFeature,
  runBuyVillageSeedOfferAction as runBuyVillageSeedOfferActionFromFeature,
  runSellVillageCropAction as runSellVillageCropActionFromFeature,
} from './features/shops/shopActionHandlers';
import { runVillageShopPrimaryActionForScene as runVillageShopPrimaryActionForSceneFromFeature } from './features/shops/villageShopActionHandlers';
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
  formatVillageRelationshipTierLabel as formatVillageRelationshipTierLabelFromLogic,
  getBlacksmithContextDialogue as getBlacksmithContextDialogueFromLogic,
  getMayorContextDialogue as getMayorContextDialogueFromLogic,
  getMerchantContextDialogue as getMerchantContextDialogueFromLogic,
  getVillageNpcDialogueLabel as getVillageNpcDialogueLabelFromLogic,
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
import { renderVillageSceneForScene as renderVillageSceneForSceneFromFeature } from './features/village/villageSceneModeRenderer';
import {
  buildVillageRenderSignature as buildVillageRenderSignatureFromFeature,
  ensureVillageSelectedZoneKey as ensureVillageSelectedZoneKeyFromFeature,
  getCycledVillageZoneKey as getCycledVillageZoneKeyFromFeature,
  getNearestVillageZoneKey as getNearestVillageZoneKeyFromFeature,
  getVillageZoneByKey as getVillageZoneByKeyFromFeature,
} from './features/village/villageSceneSelection';
import { createVillageActionZone as createVillageActionZoneFromFeature } from './features/village/villageSceneZones';
import { updateVillageContextPanel as updateVillageContextPanelFromFeature } from './features/village/villageContextHudRenderer';
import { updateVillageMvpHudForScene as updateVillageMvpHudForSceneFromFeature } from './features/village/villageMvpHudUpdater';
import {
  runVillageInteractionIntentForScene as runVillageInteractionIntentForSceneFromFeature,
} from './features/village/villageInteractionActionRunner';
import {
  runInteractVillageNpcActionForScene as runInteractVillageNpcActionForSceneFromFeature,
} from './features/village/villageNpcActionHandlers';
import { updateVillageNpcHud as updateVillageNpcHudFromFeature } from './features/village/villageNpcHudRenderer';
import {
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
  runDebugQaActionForScene as runDebugQaActionForSceneFromFeature,
} from './features/debugQa/debugQaActionHandlers';
import { updateDebugQaHudForScene as updateDebugQaHudForSceneFromFeature } from './features/debugQa/debugQaHudUpdater';
import {
  exportDebugQaMarkdownReportForScene as exportDebugQaMarkdownReportForSceneFromFeature,
  exportDebugQaTraceForScene as exportDebugQaTraceForSceneFromFeature,
  loadCombatDebugScriptedIntentsForScene as loadCombatDebugScriptedIntentsForSceneFromFeature,
  triggerDebugQaTraceImportForScene as triggerDebugQaTraceImportForSceneFromFeature,
} from './features/debugQa/debugQaTraceActionHandlers';
import {
  advanceDebugQaStepReplayForScene as advanceDebugQaStepReplayForSceneFromFeature,
  handleDebugQaImportFileChangeForScene as handleDebugQaImportFileChangeForSceneFromFeature,
  replayImportedDebugQaTraceForScene as replayImportedDebugQaTraceForSceneFromFeature,
  startDebugQaStepReplayForScene as startDebugQaStepReplayForSceneFromFeature,
  stopDebugQaStepReplayForScene as stopDebugQaStepReplayForSceneFromFeature,
} from './features/debugQa/debugQaReplayActionHandlers';
import {
  applyStripCalibrationPresetForScene as applyStripCalibrationPresetForSceneFromFeature,
  getDebugQaReplayAutoPlayIntervalMs as getDebugQaReplayAutoPlayIntervalMsFromFeature,
  getDebugQaReplayAutoPlaySpeedLabel as getDebugQaReplayAutoPlaySpeedLabelFromFeature,
  persistDebugQaReplayAutoPlaySpeed as persistDebugQaReplayAutoPlaySpeedFromFeature,
  persistStripCalibrationPreset as persistStripCalibrationPresetFromFeature,
  readDebugQaReplayAutoPlaySpeed as readDebugQaReplayAutoPlaySpeedFromFeature,
  readStorageValue as readStorageValueFromFeature,
  readStoredDebugQaReplayAutoPlaySpeed as readStoredDebugQaReplayAutoPlaySpeedFromFeature,
  readStoredStripCalibrationPreset as readStoredStripCalibrationPresetFromFeature,
  readStripCalibrationPresetFromUi as readStripCalibrationPresetFromUiFromFeature,
  stopDebugQaStepReplayAutoPlayForScene as stopDebugQaStepReplayAutoPlayForSceneFromFeature,
  toggleDebugQaStepReplayAutoPlayForScene as toggleDebugQaStepReplayAutoPlayForSceneFromFeature,
  writeStorageValue as writeStorageValueFromFeature,
} from './features/debugQa/debugQaPlaybackCalibrationHandlers';
import {
  applyImportedDebugQaTrace as applyImportedDebugQaTraceFromFeature,
  buildCombatTraceSnapshot as buildCombatTraceSnapshotFromFeature,
  captureDebugQaReplayBaseline as captureDebugQaReplayBaselineFromFeature,
  restoreDebugQaReplayBaseline as restoreDebugQaReplayBaselineFromFeature,
} from './features/debugQa/debugQaTraceBuilders';
import { buildDebugQaTracePayloadForScene as buildDebugQaTracePayloadForSceneFromFeature } from './features/debugQa/debugQaTracePayloadSceneBuilder';
import { updateHudForScene as updateHudForSceneFromHud } from './hud/hudMainUpdater';
import {
  setupHudForScene as setupHudForSceneFromHud,
  teardownHudForScene as teardownHudForSceneFromHud,
} from './hud/hudSceneLifecycle';
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
    setupPlayerForSceneFromCommon(
      this as unknown as Parameters<typeof setupPlayerForSceneFromCommon>[0],
      FARM_SCENE_PLAYER_SPAWN,
    );
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
    setupHudForSceneFromHud(this as unknown as Parameters<typeof setupHudForSceneFromHud>[0], {
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
  }

  private teardownHud(): void {
    teardownHudForSceneFromHud(this as unknown as Parameters<typeof teardownHudForSceneFromHud>[0]);
  }
  private updateHud(): void {
    updateHudForSceneFromHud(this as unknown as Parameters<typeof updateHudForSceneFromHud>[0]);
  }

  private updateCombatHud(): void {
    this.setHudText('combatRecap', getCombatRecapLabelFromLogic(this.combatState));
    this.setHudText('combatTelemetry', getCombatTelemetryLabelFromLogic(this.combatState));
    updateCombatHudForSceneFromFeature(
      this as unknown as Parameters<typeof updateCombatHudForSceneFromFeature>[0],
    );
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
    updateVillageNpcHudFromFeature({
      isAuthenticated: this.isAuthenticated,
      villageNpcBusy: this.villageNpcBusy,
      villageNpcError: this.villageNpcError,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
      elements: {
        summaryValue: this.villageNpcSummaryValue,
        mayorValue: this.villageNpcMayorValue,
        blacksmithValue: this.villageNpcBlacksmithValue,
        merchantValue: this.villageNpcMerchantValue,
        mayorDialogueValue: this.villageNpcMayorDialogueValue,
        blacksmithDialogueValue: this.villageNpcBlacksmithDialogueValue,
        merchantDialogueValue: this.villageNpcMerchantDialogueValue,
        errorValue: this.villageNpcErrorValue,
        talkMayorButton: this.villageNpcTalkMayorButton,
        talkBlacksmithButton: this.villageNpcTalkBlacksmithButton,
        talkMerchantButton: this.villageNpcTalkMerchantButton,
      },
    });
  }

  // Kept for compatibility with existing regression tests while rendering moved to feature modules.
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
    updateFarmHudForSceneFromFeature(this as unknown as Parameters<typeof updateFarmHudForSceneFromFeature>[0]);
  }

  private updateVillageMvpHud(): void {
    updateVillageMvpHudForSceneFromFeature(this as unknown as Parameters<typeof updateVillageMvpHudForSceneFromFeature>[0]);
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
    updateVillageShopPanelForSceneFromFeature(this as unknown as Parameters<typeof updateVillageShopPanelForSceneFromFeature>[0]);
  }

  private async handleVillageShopPrimaryAction(): Promise<void> {
    await runVillageShopPrimaryActionForSceneFromFeature(
      this as unknown as Parameters<typeof runVillageShopPrimaryActionForSceneFromFeature>[0],
    );
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
    updateGamepadInputFrameFromFeature(
      this as unknown as Parameters<typeof updateGamepadInputFrameFromFeature>[0],
      {
        buttonA: GAMEPAD_BUTTON_A,
        dpadUp: GAMEPAD_BUTTON_DPAD_UP,
        dpadLeft: GAMEPAD_BUTTON_DPAD_LEFT,
        dpadDown: GAMEPAD_BUTTON_DPAD_DOWN,
        dpadRight: GAMEPAD_BUTTON_DPAD_RIGHT,
        leftBumper: GAMEPAD_BUTTON_LEFT_BUMPER,
        rightBumper: GAMEPAD_BUTTON_RIGHT_BUMPER,
      },
    );
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
    const resolution = resolveCombatGamepadShortcutsFromFeature({
      isAuthenticated: this.isAuthenticated,
      combatState: this.combatState,
      justPressedButtons,
      startButton: GAMEPAD_BUTTON_Y,
      attackButton: GAMEPAD_BUTTON_X,
      defendButton: GAMEPAD_BUTTON_Y,
      fireballButton: GAMEPAD_BUTTON_B,
    });

    if (
      resolution.shouldStartCombat &&
      this.combatStartButton &&
      !this.combatStartButton.disabled
    ) {
      void this.startCombat();
    }

    for (const action of resolution.actions) {
      this.tryPerformCombatActionFromGamepad(action);
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
    updateDebugQaHudForSceneFromFeature(this as unknown as Parameters<typeof updateDebugQaHudForSceneFromFeature>[0]);
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
      getQuestStatusLabel: (status) => getQuestStatusLabelFromFeature(status),
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

  private updateCombatButtons(): void {
    updateCombatButtonsForSceneFromFeature(this as unknown as Parameters<typeof updateCombatButtonsForSceneFromFeature>[0]);
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
    startEnemyHudStripPlaybackForSceneFromFeature(
      this as unknown as Parameters<typeof startEnemyHudStripPlaybackForSceneFromFeature>[0],
      element,
      enemyKey,
      strip,
      animation,
    );
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
    await refreshVillageMarketStateForSceneFromService(this as unknown as Parameters<typeof refreshVillageMarketStateForSceneFromService>[0]);
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
    await refreshSaveSlotsStateForSceneFromService(this as unknown as Parameters<typeof refreshSaveSlotsStateForSceneFromService>[0]);
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
    await refreshCombatStateForSceneFromService(this as unknown as Parameters<typeof refreshCombatStateForSceneFromService>[0]);
  }

  private async startCombat(): Promise<void> {
    await runStartCombatActionForSceneFromFeature(this as unknown as Parameters<typeof runStartCombatActionForSceneFromFeature>[0]);
  }

  private async performCombatAction(action: CombatActionName): Promise<void> {
    await runPerformCombatActionForSceneFromFeature(this as unknown as Parameters<typeof runPerformCombatActionForSceneFromFeature>[0], action);
  }

  private async forfeitCombat(): Promise<void> {
    await runForfeitCombatActionForSceneFromFeature(this as unknown as Parameters<typeof runForfeitCombatActionForSceneFromFeature>[0]);
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
    await runInteractVillageNpcActionForSceneFromFeature(
      this as unknown as Parameters<typeof runInteractVillageNpcActionForSceneFromFeature>[0],
      npcKey,
    );
  }

  private async postVillageNpcInteraction(npcKey: VillageNpcKey): Promise<void> {
    await this.fetchJson('/gameplay/village/npc/interact', {
      method: 'POST',
      body: JSON.stringify({
        npcKey,
      }),
    });
  }

  private async prepareCombatLoop(): Promise<void> {
    await runPrepareCombatLoopActionForSceneFromFeature(
      this as unknown as Parameters<typeof runPrepareCombatLoopActionForSceneFromFeature>[0],
    );
  }

  private async postPrepareCombatLoop(): Promise<void> {
    await this.fetchJson('/gameplay/combat/prepare', {
      method: 'POST',
    });
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
    applyGameplaySnapshotForSceneFromService(
      this as unknown as Parameters<typeof applyGameplaySnapshotForSceneFromService>[0],
      payload,
    );
  }

  private resetGameplayHudState(): void {
    resetGameplayHudStateForSceneFromService(this as unknown as Parameters<typeof resetGameplayHudStateForSceneFromService>[0]);
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
    renderCombatEnemyIntentChipFromFeature({
      hudRoot: this.hudRoot,
      selector,
      intentKey,
      isPreview,
      combatState: this.combatState,
      getCombatEnemyIntentUi: (input) => getCombatEnemyIntentUiFromFeature(input),
      getCombatIntentIconTooltip: (label) => getCombatIntentIconTooltipFromFeature(label),
    });
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
    exportDebugQaTraceForSceneFromFeature(
      this as unknown as Parameters<typeof exportDebugQaTraceForSceneFromFeature>[0],
    );
  }

  private async exportDebugQaMarkdownReport(): Promise<void> {
    exportDebugQaMarkdownReportForSceneFromFeature(
      this as unknown as Parameters<typeof exportDebugQaMarkdownReportForSceneFromFeature>[0],
    );
  }

  private async loadCombatDebugScriptedIntents(): Promise<void> {
    await loadCombatDebugScriptedIntentsForSceneFromFeature(
      this as unknown as Parameters<typeof loadCombatDebugScriptedIntentsForSceneFromFeature>[0],
    );
  }

  private triggerDebugQaTraceImport(): void {
    triggerDebugQaTraceImportForSceneFromFeature(
      this as unknown as Parameters<typeof triggerDebugQaTraceImportForSceneFromFeature>[0],
    );
  }

  private toggleDebugQaStepReplayAutoPlay(): void {
    toggleDebugQaStepReplayAutoPlayForSceneFromFeature(
      this as unknown as Parameters<typeof toggleDebugQaStepReplayAutoPlayForSceneFromFeature>[0],
      DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS,
    );
  }

  private stopDebugQaStepReplayAutoPlay(updateHud: boolean): void {
    stopDebugQaStepReplayAutoPlayForSceneFromFeature(
      this as unknown as Parameters<typeof stopDebugQaStepReplayAutoPlayForSceneFromFeature>[0],
      updateHud,
    );
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
    applyStripCalibrationPresetForSceneFromFeature(
      this as unknown as Parameters<typeof applyStripCalibrationPresetForSceneFromFeature>[0],
    );
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
    replayImportedDebugQaTraceForSceneFromFeature(
      this as unknown as Parameters<typeof replayImportedDebugQaTraceForSceneFromFeature>[0],
    );
  }

  private startDebugQaStepReplay(): void {
    startDebugQaStepReplayForSceneFromFeature(
      this as unknown as Parameters<typeof startDebugQaStepReplayForSceneFromFeature>[0],
    );
  }

  private advanceDebugQaStepReplay(): void {
    advanceDebugQaStepReplayForSceneFromFeature(
      this as unknown as Parameters<typeof advanceDebugQaStepReplayForSceneFromFeature>[0],
    );
  }

  private stopDebugQaStepReplay(restoreBaseline: boolean): void {
    stopDebugQaStepReplayForSceneFromFeature(
      this as unknown as Parameters<typeof stopDebugQaStepReplayForSceneFromFeature>[0],
      restoreBaseline,
    );
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
    await handleDebugQaImportFileChangeForSceneFromFeature(
      this as unknown as Parameters<typeof handleDebugQaImportFileChangeForSceneFromFeature>[0],
      event,
    );
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
    return buildDebugQaTracePayloadForSceneFromFeature(this as unknown as Parameters<typeof buildDebugQaTracePayloadForSceneFromFeature>[0]);
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
    await runDebugQaActionForSceneFromFeature(
      this as unknown as Parameters<typeof runDebugQaActionForSceneFromFeature>[0],
      action,
    );
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

  // Kept for compatibility with existing regression tests while rendering moved to feature modules.
  private getVillageNpcDialogueLabel(npcKey: VillageNpcKey): string {
    return getVillageNpcDialogueLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      npcKey,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
  }

  // Kept for compatibility with existing regression tests while rendering moved to feature modules.
  private getMayorContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
    return getMayorContextDialogueFromLogic(tier, stateKey);
  }

  // Kept for compatibility with existing regression tests while rendering moved to feature modules.
  private getBlacksmithContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
    return getBlacksmithContextDialogueFromLogic(tier, stateKey);
  }

  // Kept for compatibility with existing regression tests while rendering moved to feature modules.
  private getMerchantContextDialogue(tier: VillageNpcRelationshipTier, stateKey: string): string {
    return getMerchantContextDialogueFromLogic(tier, stateKey);
  }

  // Kept for compatibility with existing regression tests while rendering moved to feature modules.
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
    renderFarmSceneForSceneFromFeature(this as unknown as Parameters<typeof renderFarmSceneForSceneFromFeature>[0]);
  }

  private renderVillageScene(): void {
    renderVillageSceneForSceneFromFeature(this as unknown as Parameters<typeof renderVillageSceneForSceneFromFeature>[0]);
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
    updateFarmContextPanelFromFeature({
      context,
      titleValue: this.farmContextTitleValue,
      statusValue: this.farmContextStatusValue,
      plantButton: this.farmContextPlantButton,
      waterButton: this.farmContextWaterButton,
      harvestButton: this.farmContextHarvestButton,
    });
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
    setFrontSceneModeForSceneFromCommon(
      this as unknown as Parameters<typeof setFrontSceneModeForSceneFromCommon>[0],
      {
        mode,
        feedbackMessage,
        farmSpawn: FARM_SCENE_PLAYER_SPAWN,
        villageSpawn: VILLAGE_SCENE_PLAYER_SPAWN,
      },
    );
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
    await runVillageInteractionIntentForSceneFromFeature(
      this as unknown as Parameters<typeof runVillageInteractionIntentForSceneFromFeature>[0],
      VILLAGE_SCENE_ZONES,
      targetKey,
    );
  }

  private closeVillageShopPanelForInteractionIntent(): void {
    this.villageShopControllerState = closeVillageShopControllerPanelFromFeature(this.villageShopControllerState);
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
    runFarmHotkeyCommandFromFeature(hotkeyResolution, {
      toggleCraftingPanel: () => this.toggleFarmCraftingPanel(),
      sleepAtFarm: () => {
        void this.sleepAtFarm();
      },
      plantPlot: (plotKey) => {
        void this.plantFarmPlot(plotKey);
      },
      waterPlot: (plotKey) => {
        void this.waterFarmPlot(plotKey);
      },
      harvestPlot: (plotKey) => {
        void this.harvestFarmPlot(plotKey);
      },
    });
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
