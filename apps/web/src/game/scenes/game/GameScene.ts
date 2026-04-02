import Phaser from 'phaser';
import { API_BASE_URL } from '../../../config/env';
import {
  FARM_SCENE_PLAYER_SPAWN,
  VILLAGE_SCENE_PLAYER_SPAWN,
  VILLAGE_SCENE_ZONES,
} from './gameScene.constants';
import type {
  BlacksmithOfferState,
  ForgeShopCategoryKey,
  FrontSceneMode,
  VillageCropBuybackOfferState,
  VillageSceneZoneConfig,
  VillageSceneZoneKey,
  VillageSceneZoneVisual,
  VillageSeedOfferState,
  VillageShopPanelEntry,
  VillageShopTabKey,
  VillageShopTabOption,
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
  normalizeBlacksmithPayload as parseBlacksmithPayload,
  normalizeFarmCraftIngredientState as parseFarmCraftIngredientState,
  normalizeFarmCraftRecipeState as parseFarmCraftRecipeState,
  normalizeFarmCropCatalogEntry as parseFarmCropCatalogEntry,
  normalizeFarmPlotState as parseFarmPlotState,
  normalizeFarmStoryEventEntry as parseFarmStoryEventEntry,
  normalizeGameplayCraftingPayload as parseGameplayCraftingPayload,
  normalizeGameplayFarmPayload as parseGameplayFarmPayload,
  normalizeGameplayFarmStoryPayload as parseGameplayFarmStoryPayload,
  normalizeGameplayLoopPayload as parseGameplayLoopPayload,
  normalizeGameplayTowerStoryPayload as parseGameplayTowerStoryPayload,
  normalizeTowerStoryEventEntry as parseTowerStoryEventEntry,
  normalizeVillageMarketPayload as parseVillageMarketPayload,
} from './services/payloadNormalizers';
import {
  type GameplayPayloadParsers,
  parseAutoSavePayload as parseAutoSavePayloadFromService,
  parseCombatPayload as parseCombatPayloadFromService,
  parseHeroProfilePayload as parseHeroProfilePayloadFromService,
  parseQuestsPayload as parseQuestsPayloadFromService,
  parseSaveSlotPreviewPayload as parseSaveSlotPreviewPayloadFromService,
  parseSaveSlotsPayload as parseSaveSlotsPayloadFromService,
} from './services/gameplayPayloadParsers';
import {
  fetchJson as fetchJsonFromApi,
  formatRequestError as formatRequestErrorFromApi,
} from './services/apiClient';
import {
  asCombatStatus as asCombatStatusFromParser,
  asCombatTurn as asCombatTurnFromParser,
  asCombatUiStatus as asCombatUiStatusFromParser,
  asNumber as asNumberFromParser,
  asQuestStatus as asQuestStatusFromParser,
  asRecord as asRecordFromParser,
  asString as asStringFromParser,
  asStringArray as asStringArrayFromParser,
  isRecord as isRecordFromParser,
} from './services/valueParsers';
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
  getCombatEnemySpritePath as getCombatEnemySpritePathFromFeature,
  resolvePortraitEntryPath as resolvePortraitEntryPathFromFeature,
  resolveSpriteAssetPath as resolveSpriteAssetPathFromFeature,
  resolveSpriteManifest as resolveSpriteManifestFromFeature,
  toPortraitStateKey as toPortraitStateKeyFromFeature,
} from './features/combat/spriteManifestLogic';
import {
  buildVillageShopEntries as buildVillageShopEntriesFromLogic,
  computeVillageShopRenderSignature as computeVillageShopRenderSignatureFromLogic,
  getForgeCategoryLabel as getForgeCategoryLabelFromLogic,
  getForgeComparisonLabel as getForgeComparisonLabelFromLogic,
  getForgeOfferCategory as getForgeOfferCategoryFromLogic,
  getForgeRecommendedTier as getForgeRecommendedTierFromLogic,
  getForgeTierLabel as getForgeTierLabelFromLogic,
  getVillageShopActiveError as getVillageShopActiveErrorFromLogic,
  getVillageShopSummaryLabel as getVillageShopSummaryLabelFromLogic,
  getVillageShopTabs as getVillageShopTabsFromLogic,
  getVillageShopTalkButtonLabel as getVillageShopTalkButtonLabelFromLogic,
  selectVillageShopEntry as selectVillageShopEntryFromLogic,
} from './features/shops/villageShopLogic';
import {
  renderBlacksmithOffers as renderBlacksmithOffersFromFeature,
  renderVillageMarketOffers as renderVillageMarketOffersFromFeature,
} from './features/shops/shopHudRenderer';
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
import {
  getBlacksmithStatusLabel as getBlacksmithStatusLabelFromVillageHud,
  getDayPhaseKey as getDayPhaseKeyFromVillageHud,
  getDayPhaseLabel as getDayPhaseLabelFromVillageHud,
  normalizeVillageNpcEntry as normalizeVillageNpcEntryFromVillageHud,
  normalizeVillageNpcRelationshipEntry as normalizeVillageNpcRelationshipEntryFromVillageHud,
} from './features/village/villageHudParsers';
import {
  getHeroAppearanceLabel as getHeroAppearanceLabelFromIntro,
  getHeroProfileSummaryLabel as getHeroProfileSummaryLabelFromIntro,
  getIntroAdvanceButtonLabel as getIntroAdvanceButtonLabelFromIntro,
  getIntroHintLabel as getIntroHintLabelFromIntro,
  getIntroNarrativeLabel as getIntroNarrativeLabelFromIntro,
  getIntroProgressLabel as getIntroProgressLabelFromIntro,
  getIntroSummaryLabel as getIntroSummaryLabelFromIntro,
  normalizeGameplayIntroPayload as normalizeGameplayIntroPayloadFromIntro,
} from './features/intro/introLogic';
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
  formatDebugQaFlagPreview as formatDebugQaFlagPreviewFromDebugQa,
  formatSetQuestStatusSuccess as formatSetQuestStatusSuccessFromDebugQa,
  formatSetWorldFlagsSuccess as formatSetWorldFlagsSuccessFromDebugQa,
  getDebugQaReplayAutoPlayIntervalMs as getDebugQaReplayAutoPlayIntervalMsFromDebugQa,
  getDebugQaReplayAutoPlaySpeedLabel as getDebugQaReplayAutoPlaySpeedLabelFromDebugQa,
  getDebugQaScriptedIntentsDisplayText as getDebugQaScriptedIntentsDisplayTextFromDebugQa,
  isDebugQaQueryMatch as isDebugQaQueryMatchFromDebugQa,
  isQuestStatusValue as isQuestStatusValueFromDebugQa,
  normalizeDebugQaFilterQuery as normalizeDebugQaFilterQueryFromDebugQa,
  normalizeImportedHudState as normalizeImportedHudStateFromDebugQa,
  parseImportedDebugQaTrace as parseImportedDebugQaTraceFromDebugQa,
  readDebugQaFlagList as readDebugQaFlagListFromDebugQa,
  readDebugQaNumber as readDebugQaNumberFromDebugQa,
} from './features/debugQa/debugQaHelpers';
import {
  bindHudElements as bindHudElementsFromHud,
  clearHudElementBindings as clearHudElementBindingsFromHud,
} from './hud/hudBindings';
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
  FarmPlotPhase,
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
  private villageShopPanelOpen = false;
  private villageShopType: VillageShopType = 'market';
  private villageShopTab: VillageShopTabKey = 'buy';
  private villageShopSelectedEntryKey: string | null = null;
  private villageShopRenderSignature = '';
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
    if (this.debugQaReplayAutoPlaySpeedSelect) {
      this.debugQaReplayAutoPlaySpeedSelect.addEventListener('change', this.onDebugQaReplayAutoPlaySpeedChange);
    }
    if (this.debugQaStripCalibrationSelect) {
      this.debugQaStripCalibrationSelect.addEventListener('change', this.onDebugQaStripCalibrationChange);
    }
    if (this.debugQaRecapOutcomeFilterSelect) {
      this.debugQaRecapOutcomeFilterSelect.addEventListener('change', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaRecapEnemyFilterInput) {
      this.debugQaRecapEnemyFilterInput.addEventListener('input', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaScriptEnemyFilterInput) {
      this.debugQaScriptEnemyFilterInput.addEventListener('input', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaScriptIntentFilterInput) {
      this.debugQaScriptIntentFilterInput.addEventListener('input', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaImportFileInput) {
      this.debugQaImportFileInput.addEventListener('change', this.onDebugQaImportFileChange);
    }
    if (this.heroProfileNameInput) {
      this.heroProfileNameInput.addEventListener('input', this.onHeroProfileNameInput);
    }
    if (this.heroProfileAppearanceSelect) {
      this.heroProfileAppearanceSelect.addEventListener('change', this.onHeroProfileAppearanceChange);
    }
    if (this.farmSeedSelect) {
      this.farmSeedSelect.addEventListener('change', this.onFarmSeedSelectionChange);
    }
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

    if (this.debugQaImportFileInput) {
      this.debugQaImportFileInput.removeEventListener('change', this.onDebugQaImportFileChange);
    }
    if (this.debugQaReplayAutoPlaySpeedSelect) {
      this.debugQaReplayAutoPlaySpeedSelect.removeEventListener('change', this.onDebugQaReplayAutoPlaySpeedChange);
    }
    if (this.debugQaStripCalibrationSelect) {
      this.debugQaStripCalibrationSelect.removeEventListener('change', this.onDebugQaStripCalibrationChange);
    }
    if (this.debugQaRecapOutcomeFilterSelect) {
      this.debugQaRecapOutcomeFilterSelect.removeEventListener('change', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaRecapEnemyFilterInput) {
      this.debugQaRecapEnemyFilterInput.removeEventListener('input', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaScriptEnemyFilterInput) {
      this.debugQaScriptEnemyFilterInput.removeEventListener('input', this.onDebugQaFilterInputChange);
    }
    if (this.debugQaScriptIntentFilterInput) {
      this.debugQaScriptIntentFilterInput.removeEventListener('input', this.onDebugQaFilterInputChange);
    }
    if (this.heroProfileNameInput) {
      this.heroProfileNameInput.removeEventListener('input', this.onHeroProfileNameInput);
    }
    if (this.heroProfileAppearanceSelect) {
      this.heroProfileAppearanceSelect.removeEventListener('change', this.onHeroProfileAppearanceChange);
    }
    if (this.farmSeedSelect) {
      this.farmSeedSelect.removeEventListener('change', this.onFarmSeedSelectionChange);
    }

    if (this.hudRoot) {
      this.hudRoot.removeEventListener('click', this.onHudClick);
      this.hudRoot.innerHTML = '';
      this.hudRoot = null;
    }

    clearHudElementBindingsFromHud(this as unknown as Record<string, unknown>);
    this.questsRenderSignature = '';
    this.blacksmithRenderSignature = '';
    this.villageMarketRenderSignature = '';
    this.farmRenderSignature = '';
    this.villageMarketUnlocked = false;
    this.villageMarketSeedOffers = [];
    this.villageMarketBuybackOffers = [];
    this.villageMarketBusy = false;
    this.villageMarketError = null;
    this.farmState = null;
    this.farmStoryState = null;
    this.farmBusy = false;
    this.farmError = null;
    this.farmSelectedSeedItemKey = '';
    this.farmSelectedPlotKey = null;
    this.farmFeedbackMessage = null;
    this.farmCraftingPanelOpen = false;
    this.farmCraftingState = null;
    this.farmCraftingBusy = false;
    this.farmCraftingError = null;
    this.farmCraftingRenderSignature = '';
    this.frontSceneMode = 'farm';
    this.villageSelectedZoneKey = null;
    this.villageFeedbackMessage = null;
    this.farmSceneRenderSignature = '';
    this.villageSceneRenderSignature = '';
    this.loopState = null;
    this.loopBusy = false;
    this.loopError = null;
    this.towerStoryState = null;
    this.villageNpcState = {
      mayor: { stateKey: 'offscreen', available: false },
      blacksmith: { stateKey: 'cursed', available: false },
      merchant: { stateKey: 'absent', available: false },
    };
    this.autosaveRenderSignature = '';
    this.saveSlotsRenderSignature = '';
    this.heroProfile = null;
    this.heroProfileBusy = false;
    this.heroProfileError = null;
    this.heroProfileMessage = null;
    this.heroProfileNameDraft = '';
    this.heroProfileAppearanceDraft = 'default';
    this.introNarrativeState = null;
    this.introNarrativeBusy = false;
    this.introNarrativeError = null;
    this.debugQaBusyAction = null;
    this.debugQaStatus = 'idle';
    this.debugQaMessage = null;
    this.debugQaError = null;
    this.debugQaImportedTrace = null;
    this.debugQaStepReplayState = null;
    this.debugQaReplayAutoPlayIntervalId = null;
    this.debugQaReplayAutoPlaySpeed = 'normal';
    this.stripCalibrationPreset = 'manifest';
    this.debugQaRecapOutcomeFilter = 'all';
    this.debugQaRecapEnemyFilter = '';
    this.debugQaScriptEnemyFilter = '';
    this.debugQaScriptIntentFilter = '';
    this.debugQaScriptedIntentsReference = null;
    this.debugQaScriptedIntentsText = 'Click "Load reference" to inspect the combat script QA payload.';
    this.spriteManifest = null;
    this.playerUsesStripAnimation = false;
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
    this.setHudText('blacksmithStatus', this.getBlacksmithStatusLabel());
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
    this.setHudText('combatName', this.getCombatName());
    this.setHudText('combatStatus', this.getCombatStatusLabel());
    this.setHudText('combatEncounterId', this.combatEncounterId ?? '-');
    this.setHudText('combatTurn', this.getCombatTurnLabel());
    this.setHudText('combatRound', this.combatState ? `${this.combatState.round}` : '-');
    this.setHudText('combatResult', this.combatMessage);
    this.setHudText('combatRecap', this.getCombatRecapLabel());
    this.setHudText('combatPlayerHp', this.getCombatUnitValue(this.hudState.hp, this.hudState.maxHp));
    this.setHudText('combatPlayerMp', this.getCombatUnitValue(this.hudState.mp, this.hudState.maxMp));
    this.renderCombatEffectChips('combatPlayerEffects', this.getCombatPlayerEffectChips());
    this.setHudText('combatEnemyName', this.combatState ? this.combatState.enemy.name : '-');
    this.renderCombatEnemySprite();
    this.setHudText('combatEnemyHp', this.getCombatEnemyValue('hp'));
    this.setHudText('combatEnemyMp', this.getCombatEnemyValue('mp'));
    this.renderCombatEffectChips('combatEnemyEffects', this.getCombatEnemyEffectChips());
    this.setHudText('combatTelemetry', this.getCombatTelemetryLabel());
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
      this.questsSummaryValue.textContent = this.getQuestSummaryLabel();
    }

    if (this.questsErrorValue) {
      this.questsErrorValue.hidden = !this.questError;
      this.questsErrorValue.textContent = this.questError ?? '';
    }

    this.renderQuestList();
  }

  private updateVillageNpcHud(): void {
    if (this.villageNpcSummaryValue) {
      this.villageNpcSummaryValue.textContent = this.getVillageNpcSummaryLabel();
    }

    if (this.villageNpcMayorValue) {
      this.villageNpcMayorValue.textContent = this.getVillageNpcEntryLabel('mayor');
    }

    if (this.villageNpcBlacksmithValue) {
      this.villageNpcBlacksmithValue.textContent = this.getVillageNpcEntryLabel('blacksmith');
    }

    if (this.villageNpcMerchantValue) {
      this.villageNpcMerchantValue.textContent = this.getVillageNpcEntryLabel('merchant');
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
      this.blacksmithSummaryValue.textContent = this.getBlacksmithShopSummaryLabel();
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
      this.farmContextSeedValue.textContent = this.getSelectedSeedLabel();
    }

    if (this.farmContextReadyValue) {
      this.farmContextReadyValue.textContent = this.getFarmReadyPlotsLabel();
    }

    this.updateFarmContextPanel();

    if (this.farmContextFeedbackValue) {
      const feedback = this.getFarmFeedbackLabel();
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
      this.villageObjectiveValue.textContent = this.getVillageObjectiveLabel();
    }

    this.updateVillageContextPanel();

    if (this.villageContextFeedbackValue) {
      const hasError = Boolean(this.villageNpcError);
      this.villageContextFeedbackValue.dataset.tone = hasError ? 'error' : 'info';
      this.villageContextFeedbackValue.textContent = this.getVillageInteractionFeedbackLabel();
    }

    if (this.frontSceneMode === 'village') {
      this.renderVillageScene();
    }
  }

  private openVillageShopPanel(shopType: VillageShopType, feedbackMessage: string): void {
    if (this.villageShopType !== shopType) {
      this.villageShopType = shopType;
      this.villageShopTab = shopType === 'market' ? 'buy' : 'weapons';
      this.villageShopSelectedEntryKey = null;
    }

    this.villageShopPanelOpen = true;
    this.villageShopRenderSignature = '';
    this.villageFeedbackMessage = feedbackMessage;
    this.updateHud();
  }

  private closeVillageShopPanel(feedbackMessage?: string): void {
    if (!this.villageShopPanelOpen) {
      return;
    }

    this.villageShopPanelOpen = false;
    this.villageShopSelectedEntryKey = null;
    this.villageShopRenderSignature = '';
    if (feedbackMessage) {
      this.villageFeedbackMessage = feedbackMessage;
    }
    this.updateHud();
  }

  private setVillageShopTab(tabKey: VillageShopTabKey): void {
    const tabs = this.getVillageShopTabs();
    if (!tabs.some((tab) => tab.key === tabKey) || this.villageShopTab === tabKey) {
      return;
    }

    this.villageShopTab = tabKey;
    this.villageShopSelectedEntryKey = null;
    this.villageShopRenderSignature = '';
    this.updateHud();
  }

  private selectVillageShopEntry(entryKey: string): void {
    if (this.villageShopSelectedEntryKey === entryKey) {
      return;
    }
    this.villageShopSelectedEntryKey = entryKey;
    this.villageShopRenderSignature = '';
    this.updateHud();
  }

  private getVillageShopTabs(): VillageShopTabOption[] {
    return getVillageShopTabsFromLogic(this.villageShopType);
  }

  private getVillageShopEntries(): VillageShopPanelEntry[] {
    return buildVillageShopEntriesFromLogic({
      villageShopType: this.villageShopType,
      villageShopTab: this.villageShopTab,
      villageMarketBuybackOffers: this.villageMarketBuybackOffers,
      villageMarketSeedOffers: this.villageMarketSeedOffers,
      villageMarketUnlocked: this.villageMarketUnlocked,
      villageMarketBusy: this.villageMarketBusy,
      hudGold: this.hudState.gold,
      blacksmithOffers: this.blacksmithOffers,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithBusy: this.blacksmithBusy,
      towerHighestFloor: this.hudState.towerHighestFloor,
    });
  }

  private getVillageShopSelectedEntry(entries: VillageShopPanelEntry[]): VillageShopPanelEntry | null {
    const result = selectVillageShopEntryFromLogic(entries, this.villageShopSelectedEntryKey);
    this.villageShopSelectedEntryKey = result.selectedEntryKey;
    return result.selectedEntry;
  }

  private computeVillageShopRenderSignature(
    tabs: VillageShopTabOption[],
    entries: VillageShopPanelEntry[],
    selectedEntry: VillageShopPanelEntry | null,
  ): string {
    return computeVillageShopRenderSignatureFromLogic({
      frontSceneMode: this.frontSceneMode,
      villageShopPanelOpen: this.villageShopPanelOpen,
      villageShopType: this.villageShopType,
      villageShopTab: this.villageShopTab,
      villageShopSelectedEntryKey: this.villageShopSelectedEntryKey,
      isAuthenticated: this.isAuthenticated,
      hudGold: this.hudState.gold,
      blacksmithBusy: this.blacksmithBusy,
      villageMarketBusy: this.villageMarketBusy,
      villageNpcBusy: this.villageNpcBusy,
      activeError: this.getVillageShopActiveError(),
      selectedEntryKey: selectedEntry?.entryKey ?? null,
      tabs,
      entries,
    });
  }

  private renderVillageShopTabs(tabs: VillageShopTabOption[]): void {
    if (!this.villageShopTabsRoot) {
      return;
    }

    this.villageShopTabsRoot.replaceChildren();
    for (const tab of tabs) {
      const button = document.createElement('button');
      button.classList.add('hud-village-shop-tab');
      if (tab.key === this.villageShopTab) {
        button.classList.add('active');
      }
      button.dataset.villageShopAction = 'tab';
      button.dataset.shopTab = tab.key;
      button.textContent = tab.label;
      this.villageShopTabsRoot.appendChild(button);
    }
  }

  private renderVillageShopEntries(entries: VillageShopPanelEntry[]): void {
    if (!this.villageShopEntriesRoot) {
      return;
    }

    this.villageShopEntriesRoot.replaceChildren();
    if (entries.length === 0) {
      const empty = document.createElement('li');
      empty.classList.add('hud-village-shop-entry-empty');
      empty.textContent = this.villageShopType === 'market'
        ? 'Aucune offre visible pour cet onglet.'
        : 'Catalogue de forge vide pour cette categorie.';
      this.villageShopEntriesRoot.appendChild(empty);
      return;
    }

    for (const entry of entries) {
      const row = document.createElement('li');
      row.classList.add('hud-village-shop-entry-row');

      const button = document.createElement('button');
      button.classList.add('hud-village-shop-entry');
      button.dataset.villageShopAction = 'select';
      button.dataset.shopEntryKey = entry.entryKey;
      button.dataset.selected = entry.entryKey === this.villageShopSelectedEntryKey ? '1' : '0';

      const header = document.createElement('div');
      header.classList.add('hud-village-shop-entry-header');
      const name = document.createElement('strong');
      name.textContent = entry.name;
      const price = document.createElement('span');
      price.textContent = entry.priceLabel;
      header.append(name, price);

      const meta = document.createElement('p');
      meta.classList.add('hud-village-shop-entry-meta');
      meta.textContent = entry.badgeLabel;

      button.append(header, meta);
      row.appendChild(button);
      this.villageShopEntriesRoot.appendChild(row);
    }
  }

  private updateVillageShopPanel(): void {
    if (!this.villageShopPanelRoot) {
      return;
    }

    const visible = this.frontSceneMode === 'village' && this.villageShopPanelOpen;
    this.villageShopPanelRoot.hidden = !visible;
    if (!visible) {
      this.villageShopRenderSignature = '';
      return;
    }

    const tabs = this.getVillageShopTabs();
    if (!tabs.some((tab) => tab.key === this.villageShopTab)) {
      this.villageShopTab = tabs[0]?.key ?? (this.villageShopType === 'market' ? 'buy' : 'weapons');
      this.villageShopSelectedEntryKey = null;
    }

    const entries = this.getVillageShopEntries();
    const selectedEntry = this.getVillageShopSelectedEntry(entries);
    const signature = this.computeVillageShopRenderSignature(tabs, entries, selectedEntry);
    if (signature === this.villageShopRenderSignature) {
      return;
    }
    this.villageShopRenderSignature = signature;

    if (this.villageShopNpcValue) {
      this.villageShopNpcValue.textContent = this.villageShopType === 'market' ? 'Marchande' : 'Forgeron';
    }
    if (this.villageShopTitleValue) {
      this.villageShopTitleValue.textContent = this.villageShopType === 'market' ? 'Marche du village' : 'Forge du village';
    }
    if (this.villageShopSummaryValue) {
      this.villageShopSummaryValue.textContent = this.getVillageShopSummaryLabel();
    }

    this.renderVillageShopTabs(tabs);
    this.renderVillageShopEntries(entries);

    if (this.villageShopDetailNameValue) {
      this.villageShopDetailNameValue.textContent = selectedEntry?.name ?? 'Selectionne un objet';
    }
    if (this.villageShopDetailMetaValue) {
      this.villageShopDetailMetaValue.textContent = selectedEntry?.detailMeta ?? '-';
    }
    if (this.villageShopDetailDescriptionValue) {
      this.villageShopDetailDescriptionValue.textContent =
        selectedEntry ? `${selectedEntry.description} ${selectedEntry.usageLabel}` : 'Le detail apparait ici.';
    }
    if (this.villageShopDetailComparisonValue) {
      this.villageShopDetailComparisonValue.textContent = selectedEntry?.comparisonLabel ?? '-';
    }

    const activeError = this.getVillageShopActiveError();
    if (this.villageShopErrorValue) {
      this.villageShopErrorValue.hidden = !activeError;
      this.villageShopErrorValue.textContent = activeError ?? '';
    }

    if (this.villageShopTransactionValue) {
      if (selectedEntry) {
        const stockPart = selectedEntry.ownedQuantity === null ? '' : ` | Stock ${selectedEntry.ownedQuantity}`;
        this.villageShopTransactionValue.textContent =
          `Action: ${selectedEntry.actionLabel}${stockPart} | Or ${this.hudState.gold} po`;
      } else {
        this.villageShopTransactionValue.textContent = `Or actuel: ${this.hudState.gold} po`;
      }
    }

    if (this.villageShopConfirmButton) {
      if (!selectedEntry) {
        this.villageShopConfirmButton.textContent = 'Selectionner un objet';
        this.villageShopConfirmButton.disabled = true;
      } else {
        const busy = selectedEntry.source === 'forge' ? this.blacksmithBusy : this.villageMarketBusy;
        this.villageShopConfirmButton.textContent = busy ? 'Transaction...' : selectedEntry.actionLabel;
        this.villageShopConfirmButton.disabled = !selectedEntry.canTransact;
      }
    }

    if (this.villageShopTalkButton) {
      const npcKey: VillageNpcKey = this.villageShopType === 'market' ? 'merchant' : 'blacksmith';
      const npc = this.villageNpcState[npcKey];
      const relation = this.villageNpcRelationships[npcKey];
      const canTalk = this.isAuthenticated && npc.available && relation.canTalkToday && !this.villageNpcBusy;
      this.villageShopTalkButton.disabled = !canTalk;
      this.villageShopTalkButton.textContent = this.getVillageShopTalkButtonLabel(npcKey);
    }
  }

  private getVillageShopSummaryLabel(): string {
    return getVillageShopSummaryLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      villageShopType: this.villageShopType,
      villageMarketUnlocked: this.villageMarketUnlocked,
      villageMarketBusy: this.villageMarketBusy,
      villageMarketSeedOffersCount: this.villageMarketSeedOffers.length,
      villageMarketBuybackOffersCount: this.villageMarketBuybackOffers.length,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      blacksmithBusy: this.blacksmithBusy,
      blacksmithOffersCount: this.blacksmithOffers.length,
    });
  }

  private getVillageShopActiveError(): string | null {
    return getVillageShopActiveErrorFromLogic(this.villageShopType, this.villageMarketError, this.blacksmithError);
  }

  private getVillageShopTalkButtonLabel(npcKey: VillageNpcKey): string {
    const npc = this.villageNpcState[npcKey];
    const relation = this.villageNpcRelationships[npcKey];
    return getVillageShopTalkButtonLabelFromLogic({
      villageNpcBusy: this.villageNpcBusy,
      isAuthenticated: this.isAuthenticated,
      npcAvailable: npc.available,
      canTalkToday: relation.canTalkToday,
    });
  }

  private getForgeOfferCategory(offer: BlacksmithOfferState): ForgeShopCategoryKey {
    return getForgeOfferCategoryFromLogic(offer);
  }

  private getForgeCategoryLabel(category: ForgeShopCategoryKey): string {
    return getForgeCategoryLabelFromLogic(category);
  }

  private getForgeTierLabel(tier: number): string {
    return getForgeTierLabelFromLogic(tier);
  }

  private getForgeRecommendedTier(): 1 | 2 | 3 {
    return getForgeRecommendedTierFromLogic(this.hudState.towerHighestFloor);
  }

  private getForgeComparisonLabel(offer: BlacksmithOfferState): string {
    return getForgeComparisonLabelFromLogic(offer, this.hudState.towerHighestFloor);
  }

  private async handleVillageShopPrimaryAction(): Promise<void> {
    const entries = this.getVillageShopEntries();
    const selectedEntry = this.getVillageShopSelectedEntry(entries);
    if (!selectedEntry) {
      this.villageFeedbackMessage = 'Selectionne une offre avant de valider.';
      this.updateHud();
      return;
    }

    if (!selectedEntry.canTransact) {
      this.villageFeedbackMessage = selectedEntry.source === 'market-sell'
        ? 'Stock insuffisant ou transaction indisponible.'
        : 'Transaction indisponible pour le moment.';
      this.updateHud();
      return;
    }

    if (selectedEntry.source === 'market-buy') {
      if (selectedEntry.offerKey) {
        await this.buyVillageSeedOffer(selectedEntry.offerKey);
        if (!this.villageMarketError) {
          this.villageFeedbackMessage = `${selectedEntry.name} achete au Marche.`;
        }
      }
      this.updateHud();
      return;
    }

    if (selectedEntry.source === 'market-sell') {
      await this.sellVillageCrop(selectedEntry.itemKey);
      if (!this.villageMarketError) {
        this.villageFeedbackMessage = `${selectedEntry.name} vendu au Marche.`;
      }
      this.updateHud();
      return;
    }

    if (selectedEntry.offerKey) {
      await this.buyBlacksmithOffer(selectedEntry.offerKey);
      if (!this.blacksmithError) {
        this.villageFeedbackMessage = `${selectedEntry.name} commande a la Forge.`;
      }
      this.updateHud();
    }
  }

  private async handleVillageShopTalkAction(): Promise<void> {
    const npcKey: VillageNpcKey = this.villageShopType === 'market' ? 'merchant' : 'blacksmith';
    await this.interactVillageNpc(npcKey);
    if (!this.villageNpcError) {
      this.villageFeedbackMessage = npcKey === 'merchant'
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

  private getVillageObjectiveLabel(): string {
    return getVillageObjectiveLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      frontSceneMode: this.frontSceneMode,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      villageMarketUnlocked: this.villageMarketUnlocked,
    });
  }

  private updateVillageContextPanel(): void {
    const zone = this.getVillageZoneByKey(this.villageSelectedZoneKey);
    const interactionState = zone ? this.getVillageZoneInteractionState(zone) : null;

    if (this.villageContextTitleValue) {
      this.villageContextTitleValue.textContent = zone?.title ?? 'Aucune cible';
    }
    if (this.villageContextRoleValue) {
      this.villageContextRoleValue.textContent = zone?.role ?? 'Selectionne une zone du village.';
    }
    if (this.villageContextHintValue) {
      if (!zone) {
        this.villageContextHintValue.textContent = 'Utilise R ou clique une zone pour choisir une interaction.';
      } else if (interactionState && !interactionState.enabled) {
        this.villageContextHintValue.textContent = interactionState.reason;
      } else {
        this.villageContextHintValue.textContent = zone.hint;
      }
    }

    if (this.villageContextInteractButton) {
      if (zone) {
        this.villageContextInteractButton.dataset.targetKey = zone.key;
      } else {
        delete this.villageContextInteractButton.dataset.targetKey;
      }
      this.villageContextInteractButton.textContent = zone ? `${zone.actionLabel} (E)` : 'Interagir';
      this.villageContextInteractButton.disabled =
        this.frontSceneMode !== 'village' || !zone || !interactionState || !interactionState.enabled;
    }

    if (this.villageContextCycleButton) {
      this.villageContextCycleButton.disabled = this.frontSceneMode !== 'village' || VILLAGE_SCENE_ZONES.length < 2;
    }
  }

  private getVillageInteractionFeedbackLabel(): string {
    return getVillageInteractionFeedbackLabelFromLogic({
      villageNpcError: this.villageNpcError,
      villageFeedbackMessage: this.villageFeedbackMessage,
      frontSceneMode: this.frontSceneMode,
      isAuthenticated: this.isAuthenticated,
      villageShopPanelOpen: this.villageShopPanelOpen,
      villageShopType: this.villageShopType,
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
    if (this.loopSummaryValue) {
      this.loopSummaryValue.textContent = this.getLoopSummaryLabel();
    }
    if (this.loopStageValue) {
      this.loopStageValue.textContent = this.loopState?.stageLabel ?? '-';
    }
    if (this.loopSuppliesValue) {
      this.loopSuppliesValue.textContent = this.getLoopSuppliesLabel();
    }
    if (this.loopPrepValue) {
      this.loopPrepValue.textContent = this.getLoopPreparationLabel();
    }
    if (this.loopBlockersValue) {
      this.loopBlockersValue.textContent = this.getLoopBlockersLabel();
    }
    if (this.loopErrorValue) {
      this.loopErrorValue.hidden = !this.loopError;
      this.loopErrorValue.textContent = this.loopError ?? '';
    }
    if (this.loopPrepareButton) {
      const canPrepare = Boolean(this.isAuthenticated && this.loopState?.preparation.ready);
      this.loopPrepareButton.disabled = !canPrepare || this.loopBusy;
      this.loopPrepareButton.textContent = this.loopBusy ? 'Preparing...' : 'Prepare combat';
    }
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
    if (this.autosaveSummaryValue) {
      this.autosaveSummaryValue.textContent = this.getAutoSaveSummaryLabel();
    }

    if (this.autosaveMetaValue) {
      this.autosaveMetaValue.textContent = this.getAutoSaveMetaLabel();
    }

    if (this.autosaveErrorValue) {
      this.autosaveErrorValue.hidden = !this.autosaveError;
      this.autosaveErrorValue.textContent = this.autosaveError ?? '';
    }

    this.renderAutoSaveActions();
  }

  private updateSaveSlotsHud(): void {
    if (this.saveSlotsSummaryValue) {
      this.saveSlotsSummaryValue.textContent = this.getSaveSlotsSummaryLabel();
    }

    if (this.saveSlotsErrorValue) {
      this.saveSlotsErrorValue.hidden = !this.saveSlotsError;
      this.saveSlotsErrorValue.textContent = this.saveSlotsError ?? '';
    }

    this.renderSaveSlotsList();
  }

  private updateHeroProfileHud(): void {
    const disabled = !this.isAuthenticated || this.heroProfileBusy;
    const trimmedDraftName = this.heroProfileNameDraft.trim();

    if (this.heroProfileSummaryValue) {
      this.heroProfileSummaryValue.textContent = this.getHeroProfileSummaryLabel();
    }

    if (this.heroProfileNameInput) {
      if (this.heroProfileNameInput.value !== this.heroProfileNameDraft) {
        this.heroProfileNameInput.value = this.heroProfileNameDraft;
      }
      this.heroProfileNameInput.disabled = disabled;
    }

    if (this.heroProfileAppearanceSelect) {
      if (this.heroProfileAppearanceSelect.value !== this.heroProfileAppearanceDraft) {
        this.heroProfileAppearanceSelect.value = this.heroProfileAppearanceDraft;
      }
      this.heroProfileAppearanceSelect.disabled = disabled;
    }

    if (this.heroProfileSaveButton) {
      this.heroProfileSaveButton.disabled = disabled || trimmedDraftName.length < 2;
      this.heroProfileSaveButton.textContent = this.heroProfileBusy
        ? 'Sauvegarde...'
        : this.heroProfile
          ? 'Mettre a jour profil'
          : 'Creer profil';
    }

    if (this.heroProfileMessageValue) {
      this.heroProfileMessageValue.hidden = !this.heroProfileMessage;
      this.heroProfileMessageValue.textContent = this.heroProfileMessage ?? '';
    }

    if (this.heroProfileErrorValue) {
      this.heroProfileErrorValue.hidden = !this.heroProfileError;
      this.heroProfileErrorValue.textContent = this.heroProfileError ?? '';
    }
  }

  private updateIntroHud(): void {
    const state = this.introNarrativeState;
    const disabled = !this.isAuthenticated || this.introNarrativeBusy || Boolean(state?.completed);

    if (this.introSummaryValue) {
      this.introSummaryValue.textContent = this.getIntroSummaryLabel();
    }

    if (this.introNarrativeValue) {
      this.introNarrativeValue.textContent = this.getIntroNarrativeLabel();
    }

    if (this.introHintValue) {
      this.introHintValue.textContent = this.getIntroHintLabel();
    }

    if (this.introProgressValue) {
      this.introProgressValue.textContent = this.getIntroProgressLabel();
    }

    if (this.introAdvanceButton) {
      this.introAdvanceButton.disabled = disabled;
      this.introAdvanceButton.textContent = this.introNarrativeBusy ? 'Avance...' : this.getIntroAdvanceButtonLabel();
    }

    if (this.introErrorValue) {
      this.introErrorValue.hidden = !this.introNarrativeError;
      this.introErrorValue.textContent = this.introNarrativeError ?? '';
    }
  }

  private updateGamepadInput(): void {
    const gamepad = this.getPrimaryConnectedGamepad();
    if (!gamepad) {
      if (this.gamepadPreviousButtonStates.length > 0 || this.gamepadHudFocusIndex !== -1) {
        this.resetGamepadInputState();
      }
      return;
    }

    this.updateGamepadHudFocusables();
    const justPressedButtons = this.consumeGamepadJustPressedButtons(gamepad);
    if (justPressedButtons.size === 0) {
      return;
    }

    this.handleGamepadHudNavigation(justPressedButtons);
    this.handleGamepadCombatShortcuts(justPressedButtons);

    if (justPressedButtons.has(GAMEPAD_BUTTON_A)) {
      if (this.activateFocusedGamepadHudElement()) {
        return;
      }
      if (this.tryHandleGamepadPrimaryCombatAction()) {
        return;
      }
    }
  }

  private getPrimaryConnectedGamepad(): Gamepad | null {
    const pads = navigator.getGamepads?.();
    if (!pads) {
      return null;
    }

    for (const pad of pads) {
      if (pad?.connected) {
        return pad;
      }
    }

    return null;
  }

  private consumeGamepadJustPressedButtons(gamepad: Gamepad): Set<number> {
    const justPressed = new Set<number>();
    const nextStates: boolean[] = [];

    gamepad.buttons.forEach((button, index) => {
      const pressed = Boolean(button.pressed);
      const previous = this.gamepadPreviousButtonStates[index] ?? false;
      nextStates[index] = pressed;
      if (pressed && !previous) {
        justPressed.add(index);
      }
    });

    this.gamepadPreviousButtonStates = nextStates;
    return justPressed;
  }

  private handleGamepadHudNavigation(justPressedButtons: Set<number>): void {
    let step = 0;
    if (justPressedButtons.has(GAMEPAD_BUTTON_DPAD_UP) || justPressedButtons.has(GAMEPAD_BUTTON_DPAD_LEFT)) {
      step -= 1;
    }
    if (justPressedButtons.has(GAMEPAD_BUTTON_DPAD_DOWN) || justPressedButtons.has(GAMEPAD_BUTTON_DPAD_RIGHT)) {
      step += 1;
    }
    if (justPressedButtons.has(GAMEPAD_BUTTON_LEFT_BUMPER)) {
      step -= 1;
    }
    if (justPressedButtons.has(GAMEPAD_BUTTON_RIGHT_BUMPER)) {
      step += 1;
    }

    if (step < 0) {
      this.moveGamepadHudFocus(-1);
      return;
    }
    if (step > 0) {
      this.moveGamepadHudFocus(1);
    }
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

  private tryHandleGamepadPrimaryCombatAction(): boolean {
    if (!this.isAuthenticated) {
      return false;
    }

    if (
      this.combatState &&
      this.combatState.status === 'active' &&
      this.combatState.turn === 'player'
    ) {
      return this.tryPerformCombatActionFromGamepad('attack');
    }

    if (this.combatStartButton && !this.combatStartButton.disabled) {
      void this.startCombat();
      return true;
    }

    return false;
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

  private updateGamepadHudFocusables(): void {
    if (!this.hudRoot) {
      this.clearGamepadHudFocus(true);
      this.gamepadHudFocusableElements = [];
      return;
    }

    const previousFocusedElement =
      this.gamepadHudFocusIndex >= 0 ? this.gamepadHudFocusableElements[this.gamepadHudFocusIndex] : null;
    const focusables = this.getGamepadHudFocusableElements();
    this.gamepadHudFocusableElements = focusables;

    if (focusables.length === 0) {
      this.clearGamepadHudFocus(true);
      return;
    }

    if (previousFocusedElement) {
      const retainedIndex = focusables.indexOf(previousFocusedElement);
      if (retainedIndex >= 0) {
        this.gamepadHudFocusIndex = retainedIndex;
      } else if (this.gamepadHudFocusIndex >= focusables.length) {
        this.gamepadHudFocusIndex = focusables.length - 1;
      }
    } else if (this.gamepadHudFocusIndex >= focusables.length) {
      this.gamepadHudFocusIndex = focusables.length - 1;
    }

    this.applyGamepadHudFocusState(false);
  }

  private getGamepadHudFocusableElements(): HTMLElement[] {
    if (!this.hudRoot) {
      return [];
    }

    const selector = [
      'button',
      'select',
      'input:not([type="hidden"]):not([type="file"])',
      'textarea',
    ].join(', ');

    return Array.from(this.hudRoot.querySelectorAll<HTMLElement>(selector)).filter((element) =>
      this.isHudElementGamepadFocusable(element),
    );
  }

  private isHudElementGamepadFocusable(element: HTMLElement): boolean {
    const isFormControl = element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    const disabled = isFormControl ? element.disabled : element.hasAttribute('disabled');
    if (disabled) {
      return false;
    }

    if (element.matches('[hidden]')) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  private moveGamepadHudFocus(step: number): void {
    this.updateGamepadHudFocusables();
    const total = this.gamepadHudFocusableElements.length;
    if (total === 0) {
      return;
    }

    if (this.gamepadHudFocusIndex < 0) {
      this.gamepadHudFocusIndex = step > 0 ? 0 : total - 1;
    } else {
      this.gamepadHudFocusIndex = (this.gamepadHudFocusIndex + step + total) % total;
    }

    this.focusGamepadHudElement(this.gamepadHudFocusIndex, true);
  }

  private focusGamepadHudElement(index: number, focusDomElement: boolean): void {
    if (index < 0 || index >= this.gamepadHudFocusableElements.length) {
      return;
    }

    this.gamepadHudFocusIndex = index;
    this.applyGamepadHudFocusState(focusDomElement);
  }

  private applyGamepadHudFocusState(focusDomElement: boolean): void {
    this.gamepadHudFocusableElements.forEach((element, index) => {
      if (index === this.gamepadHudFocusIndex) {
        element.dataset.gamepadFocused = '1';
      } else {
        delete element.dataset.gamepadFocused;
      }
    });

    if (!focusDomElement || this.gamepadHudFocusIndex < 0) {
      return;
    }

    const active = this.gamepadHudFocusableElements[this.gamepadHudFocusIndex];
    if (!active) {
      return;
    }

    active.focus({ preventScroll: true });
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  private activateFocusedGamepadHudElement(): boolean {
    this.updateGamepadHudFocusables();
    const total = this.gamepadHudFocusableElements.length;
    if (total === 0) {
      return false;
    }

    if (this.gamepadHudFocusIndex < 0 || this.gamepadHudFocusIndex >= total) {
      this.focusGamepadHudElement(0, true);
      return false;
    }

    const active = this.gamepadHudFocusableElements[this.gamepadHudFocusIndex];
    if (!active) {
      return false;
    }

    if (active instanceof HTMLButtonElement) {
      active.click();
      return true;
    }

    if (active instanceof HTMLSelectElement) {
      if (active.options.length === 0) {
        return false;
      }
      const nextIndex = (active.selectedIndex + 1 + active.options.length) % active.options.length;
      active.selectedIndex = nextIndex;
      active.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    if (active instanceof HTMLInputElement && active.type === 'checkbox') {
      active.checked = !active.checked;
      active.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    active.focus({ preventScroll: true });
    return true;
  }

  private clearGamepadHudFocus(resetIndex: boolean): void {
    if (this.hudRoot) {
      this.hudRoot.querySelectorAll<HTMLElement>('[data-gamepad-focused="1"]').forEach((element) => {
        delete element.dataset.gamepadFocused;
      });
    }

    if (resetIndex) {
      this.gamepadHudFocusIndex = -1;
    }
  }

  private resetGamepadInputState(): void {
    this.gamepadPreviousButtonStates = [];
    this.gamepadHudFocusableElements = [];
    this.clearGamepadHudFocus(true);
  }

  private updateDebugQaHud(): void {
    if (!this.debugQaEnabled || !this.debugQaPanelRoot) {
      return;
    }

    if (this.debugQaStatusValue) {
      this.debugQaStatusValue.textContent = this.getDebugQaStatusLabel();
      this.debugQaStatusValue.dataset.status = this.debugQaStatus;
    }

    if (this.debugQaMessageValue) {
      const message = this.debugQaError ?? this.debugQaMessage;
      this.debugQaMessageValue.hidden = !message;
      this.debugQaMessageValue.textContent = message ?? '';
      this.debugQaMessageValue.dataset.variant = this.debugQaError ? 'error' : this.debugQaStatus === 'success' ? 'success' : 'info';
    }

    if (this.debugQaScriptedIntentsOutput) {
      this.debugQaScriptedIntentsOutput.textContent = this.getDebugQaScriptedIntentsDisplayText();
    }

    const loading = this.debugQaStatus === 'loading';
    const requiresAuthDisabled = !this.isAuthenticated || loading;
    if (this.debugQaGrantXpInput) {
      this.debugQaGrantXpInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaGrantGoldInput) {
      this.debugQaGrantGoldInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaTowerFloorInput) {
      this.debugQaTowerFloorInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaStatePresetSelect) {
      this.debugQaStatePresetSelect.disabled = requiresAuthDisabled;
    }
    if (this.debugQaQuestKeyInput) {
      this.debugQaQuestKeyInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaQuestStatusSelect) {
      this.debugQaQuestStatusSelect.disabled = requiresAuthDisabled;
    }
    if (this.debugQaLoadoutPresetSelect) {
      this.debugQaLoadoutPresetSelect.disabled = requiresAuthDisabled;
    }
    if (this.debugQaWorldFlagsInput) {
      this.debugQaWorldFlagsInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaWorldFlagsRemoveInput) {
      this.debugQaWorldFlagsRemoveInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaWorldFlagsReplaceInput) {
      this.debugQaWorldFlagsReplaceInput.disabled = requiresAuthDisabled;
    }
    if (this.debugQaRecapOutcomeFilterSelect) {
      this.debugQaRecapOutcomeFilterSelect.disabled = loading;
      this.debugQaRecapOutcomeFilterSelect.value = this.debugQaRecapOutcomeFilter;
    }
    if (this.debugQaRecapEnemyFilterInput) {
      this.debugQaRecapEnemyFilterInput.disabled = loading;
      this.debugQaRecapEnemyFilterInput.value = this.debugQaRecapEnemyFilter;
    }
    if (this.debugQaScriptEnemyFilterInput) {
      this.debugQaScriptEnemyFilterInput.disabled = loading;
      this.debugQaScriptEnemyFilterInput.value = this.debugQaScriptEnemyFilter;
    }
    if (this.debugQaScriptIntentFilterInput) {
      this.debugQaScriptIntentFilterInput.disabled = loading;
      this.debugQaScriptIntentFilterInput.value = this.debugQaScriptIntentFilter;
    }

    if (this.debugQaGrantButton) {
      this.debugQaGrantButton.disabled = requiresAuthDisabled;
      this.debugQaGrantButton.textContent =
        this.debugQaBusyAction === 'grant-resources' ? 'Granting...' : 'Grant resources';
    }
    if (this.debugQaTowerFloorButton) {
      this.debugQaTowerFloorButton.disabled = requiresAuthDisabled;
      this.debugQaTowerFloorButton.textContent =
        this.debugQaBusyAction === 'set-tower-floor' ? 'Applying...' : 'Set tower floor';
    }
    if (this.debugQaStatePresetButton) {
      this.debugQaStatePresetButton.disabled = requiresAuthDisabled;
      this.debugQaStatePresetButton.textContent =
        this.debugQaBusyAction === 'apply-state-preset' ? 'Applying...' : 'Apply state preset';
    }
    if (this.debugQaSetQuestStatusButton) {
      this.debugQaSetQuestStatusButton.disabled = requiresAuthDisabled;
      this.debugQaSetQuestStatusButton.textContent =
        this.debugQaBusyAction === 'set-quest-status' ? 'Applying...' : 'Set quest status';
    }
    if (this.debugQaLoadoutButton) {
      this.debugQaLoadoutButton.disabled = requiresAuthDisabled;
      this.debugQaLoadoutButton.textContent =
        this.debugQaBusyAction === 'apply-loadout-preset' ? 'Applying...' : 'Apply loadout';
    }
    if (this.debugQaCompleteQuestsButton) {
      this.debugQaCompleteQuestsButton.disabled = requiresAuthDisabled;
      this.debugQaCompleteQuestsButton.textContent =
        this.debugQaBusyAction === 'complete-quests' ? 'Completing...' : 'Complete quests';
    }
    if (this.debugQaSetWorldFlagsButton) {
      this.debugQaSetWorldFlagsButton.disabled = requiresAuthDisabled;
      this.debugQaSetWorldFlagsButton.textContent =
        this.debugQaBusyAction === 'set-world-flags' ? 'Applying...' : 'Set world flags';
    }
    const scriptedIntentsLoading = this.debugQaStatus === 'loading' && this.debugQaBusyAction === null;
    const scriptedIntentsButtonDisabled = loading || !this.debugQaEnabled;
    const scriptedIntentsLabel = scriptedIntentsLoading ? 'Loading reference...' : 'Load scripted intents';
    if (this.debugQaScriptedIntentsButton) {
      this.debugQaScriptedIntentsButton.disabled = scriptedIntentsButtonDisabled;
      this.debugQaScriptedIntentsButton.textContent = scriptedIntentsLabel;
    }

    const replayActive = Boolean(this.debugQaStepReplayState);
    const autoPlayActive = this.debugQaReplayAutoPlayIntervalId !== null;

    if (this.debugQaImportButton) {
      this.debugQaImportButton.disabled = loading || replayActive;
      this.debugQaImportButton.textContent = loading ? 'Importing...' : 'Import JSON trace';
    }

    if (this.debugQaReplayButton) {
      this.debugQaReplayButton.disabled = loading || !this.debugQaImportedTrace || replayActive;
      this.debugQaReplayButton.textContent = 'Replay imported trace';
    }

    if (this.debugQaReplayStepStartButton) {
      this.debugQaReplayStepStartButton.disabled = loading || !this.debugQaImportedTrace || replayActive;
      this.debugQaReplayStepStartButton.textContent = 'Start step replay';
    }

    if (this.debugQaReplayStepNextButton) {
      const replayLabel = this.debugQaStepReplayState
        ? `Next step (${this.debugQaStepReplayState.stepIndex}/${this.debugQaStepReplayState.totalSteps})`
        : 'Next step';
      this.debugQaReplayStepNextButton.disabled = !replayActive || autoPlayActive;
      this.debugQaReplayStepNextButton.textContent = replayLabel;
    }

    if (this.debugQaReplayAutoPlayButton) {
      this.debugQaReplayAutoPlayButton.disabled = !replayActive;
      this.debugQaReplayAutoPlayButton.textContent = autoPlayActive ? 'Pause auto-play' : 'Start auto-play';
    }

    if (this.debugQaReplayAutoPlaySpeedSelect) {
      this.debugQaReplayAutoPlaySpeedSelect.disabled = !replayActive || autoPlayActive;
      this.debugQaReplayAutoPlaySpeedSelect.value = this.debugQaReplayAutoPlaySpeed;
    }

    if (this.debugQaReplayStepStopButton) {
      this.debugQaReplayStepStopButton.disabled = !replayActive;
      this.debugQaReplayStepStopButton.textContent = 'Stop step replay';
    }

    if (this.debugQaStripCalibrationSelect) {
      this.debugQaStripCalibrationSelect.disabled = loading;
      this.debugQaStripCalibrationSelect.value = this.stripCalibrationPreset;
    }

    if (this.debugQaStripCalibrationButton) {
      this.debugQaStripCalibrationButton.disabled = loading;
      this.debugQaStripCalibrationButton.textContent = 'Apply strip calibration';
    }

    if (this.debugQaImportFileInput) {
      this.debugQaImportFileInput.disabled = loading || replayActive;
    }

    if (this.debugQaExportButton) {
      this.debugQaExportButton.disabled = loading || replayActive;
      this.debugQaExportButton.textContent = 'Export JSON trace';
    }
    if (this.debugQaExportMarkdownButton) {
      this.debugQaExportMarkdownButton.disabled = loading || replayActive;
      this.debugQaExportMarkdownButton.textContent = 'Export Markdown recap';
    }
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

    this.autosaveActionsRoot.replaceChildren();

    if (!this.isAuthenticated || !this.autosave) {
      return;
    }

    for (const slot of [1, 2, 3]) {
      const button = document.createElement('button');
      button.classList.add('hud-autosave-restore');
      button.dataset.saveAction = 'restore';
      button.dataset.slot = `${slot}`;
      button.textContent = this.autosaveRestoreSlotBusy === slot ? `Restoring S${slot}...` : `Restore to Slot ${slot}`;
      button.disabled = this.autosaveBusy || this.autosaveRestoreSlotBusy !== null;
      this.autosaveActionsRoot.appendChild(button);
    }
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

    this.saveSlotsListRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('save-slot-item', 'empty');
      item.textContent = 'Connect to manage save slots.';
      this.saveSlotsListRoot.appendChild(item);
      return;
    }

    const slotStates = this.getSafeSlotStates();
    for (const slotState of slotStates) {
      const item = document.createElement('li');
      item.classList.add('save-slot-item');
      item.dataset.exists = slotState.exists ? '1' : '0';

      const header = document.createElement('div');
      header.classList.add('save-slot-header');

      const title = document.createElement('strong');
      title.textContent = `Slot ${slotState.slot}`;
      header.appendChild(title);

      const badge = document.createElement('span');
      badge.classList.add('save-slot-state');
      badge.textContent = slotState.exists ? `v${slotState.version ?? 1}` : 'Empty';
      header.appendChild(badge);
      item.appendChild(header);

      const meta = document.createElement('p');
      meta.classList.add('save-slot-meta');
      meta.textContent = this.getSaveSlotMetaLabel(slotState);
      item.appendChild(meta);

      if (slotState.exists) {
        const preview = document.createElement('div');
        preview.classList.add('save-slot-preview');

        const previewStats = document.createElement('p');
        previewStats.classList.add('save-slot-preview-line');
        previewStats.textContent = this.getSaveSlotStatsPreviewLabel(slotState);
        preview.appendChild(previewStats);

        const previewInventory = document.createElement('p');
        previewInventory.classList.add('save-slot-preview-line');
        previewInventory.textContent = this.getSaveSlotInventoryPreviewLabel(slotState);
        preview.appendChild(previewInventory);

        const previewEquipment = document.createElement('p');
        previewEquipment.classList.add('save-slot-preview-line');
        previewEquipment.textContent = this.getSaveSlotEquipmentPreviewLabel(slotState);
        preview.appendChild(previewEquipment);

        item.appendChild(preview);
      }

      const actions = document.createElement('div');
      actions.classList.add('save-slot-actions');

      const captureBusy = this.saveSlotsActionBusyKey === `capture:${slotState.slot}`;
      const loadBusy = this.saveSlotsActionBusyKey === `load:${slotState.slot}`;
      const deleteBusy = this.saveSlotsActionBusyKey === `delete:${slotState.slot}`;
      const hasBusyAction = this.saveSlotsActionBusyKey !== null;
      const isLoadConfirmOpen = this.saveSlotsLoadConfirmSlot === slotState.slot;
      const hasLoadConfirmOpen = this.saveSlotsLoadConfirmSlot !== null;

      const captureButton = document.createElement('button');
      captureButton.classList.add('hud-save-action', 'capture');
      captureButton.dataset.saveAction = 'capture';
      captureButton.dataset.slot = `${slotState.slot}`;
      captureButton.textContent = captureBusy ? 'Saving...' : 'Capture';
      captureButton.disabled = this.saveSlotsBusy || hasBusyAction || hasLoadConfirmOpen;
      actions.appendChild(captureButton);

      const loadButton = document.createElement('button');
      loadButton.classList.add('hud-save-action');
      loadButton.dataset.saveAction = 'load';
      loadButton.dataset.slot = `${slotState.slot}`;
      loadButton.textContent = loadBusy ? 'Loading...' : (isLoadConfirmOpen ? 'Selected' : 'Load');
      loadButton.disabled =
        this.saveSlotsBusy ||
        hasBusyAction ||
        !slotState.exists ||
        (hasLoadConfirmOpen && !isLoadConfirmOpen);
      actions.appendChild(loadButton);

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('hud-save-action', 'danger');
      deleteButton.dataset.saveAction = 'delete';
      deleteButton.dataset.slot = `${slotState.slot}`;
      deleteButton.textContent = deleteBusy ? 'Deleting...' : 'Delete';
      deleteButton.disabled = this.saveSlotsBusy || hasBusyAction || !slotState.exists || hasLoadConfirmOpen;
      actions.appendChild(deleteButton);

      item.appendChild(actions);

      if (isLoadConfirmOpen) {
        const confirmPanel = document.createElement('div');
        confirmPanel.classList.add('save-slot-load-confirm');

        const confirmMessage = document.createElement('p');
        confirmMessage.classList.add('save-slot-load-confirm-message');
        confirmMessage.textContent = `Load Slot ${slotState.slot}? This will replace your current progression.`;
        confirmPanel.appendChild(confirmMessage);

        const confirmActions = document.createElement('div');
        confirmActions.classList.add('save-slot-load-confirm-actions');

        const confirmButton = document.createElement('button');
        confirmButton.classList.add('hud-save-action', 'confirm');
        confirmButton.dataset.saveAction = 'confirm-load';
        confirmButton.dataset.slot = `${slotState.slot}`;
        confirmButton.textContent = loadBusy ? 'Loading...' : 'Confirm Load';
        confirmButton.disabled = this.saveSlotsBusy || hasBusyAction;
        confirmActions.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('hud-save-action', 'cancel');
        cancelButton.dataset.saveAction = 'cancel-load';
        cancelButton.dataset.slot = `${slotState.slot}`;
        cancelButton.textContent = 'Cancel';
        cancelButton.disabled = this.saveSlotsBusy || hasBusyAction;
        confirmActions.appendChild(cancelButton);

        confirmPanel.appendChild(confirmActions);
        item.appendChild(confirmPanel);
      }

      this.saveSlotsListRoot.appendChild(item);
    }
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
      getFarmPlotPhaseLabel: (plot) => this.getFarmPlotPhaseLabel(plot),
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

    this.questsListRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('quest-item', 'empty');
      item.textContent = 'Connect to see quests.';
      this.questsListRoot.appendChild(item);
      return;
    }

    if (this.quests.length === 0) {
      const item = document.createElement('li');
      item.classList.add('quest-item', 'empty');
      item.textContent = this.questBusy ? 'Loading quests...' : 'No quests available.';
      this.questsListRoot.appendChild(item);
      return;
    }

    for (const quest of this.quests) {
      const item = document.createElement('li');
      item.classList.add('quest-item');
      item.dataset.status = quest.status;

      const header = document.createElement('div');
      header.classList.add('quest-item-header');

      const title = document.createElement('strong');
      title.textContent = quest.title;
      header.appendChild(title);

      const badge = document.createElement('span');
      badge.classList.add('quest-status');
      badge.textContent = this.getQuestStatusLabel(quest.status);
      header.appendChild(badge);

      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('quest-description');
      description.textContent = quest.description;
      item.appendChild(description);

      const objectives = document.createElement('ul');
      objectives.classList.add('quest-objectives');
      for (const objective of quest.objectives) {
        const objectiveItem = document.createElement('li');
        objectiveItem.textContent = `${objective.description}: ${objective.current}/${objective.target}`;
        if (objective.completed) {
          objectiveItem.classList.add('completed');
        }
        objectives.appendChild(objectiveItem);
      }
      item.appendChild(objectives);

      if (quest.canClaim) {
        const claimButton = document.createElement('button');
        claimButton.classList.add('hud-quest-claim');
        claimButton.textContent = 'Claim';
        claimButton.dataset.questAction = 'claim';
        claimButton.dataset.questKey = quest.key;
        claimButton.disabled = this.questBusy;
        item.appendChild(claimButton);
      }

      this.questsListRoot.appendChild(item);
    }
  }

  private getQuestSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.questBusy && this.quests.length === 0) {
      return 'Loading...';
    }

    const active = this.quests.filter((quest) => quest.status === 'active').length;
    const completed = this.quests.filter((quest) => quest.status === 'completed').length;
    const claimed = this.quests.filter((quest) => quest.status === 'claimed').length;
    return `Active ${active} | Ready ${completed} | Claimed ${claimed}`;
  }

  private getBlacksmithShopSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (!this.hudState.blacksmithUnlocked) {
      return this.hudState.blacksmithCurseLifted ? 'Recovering' : 'Locked';
    }

    return this.blacksmithBusy
      ? 'Refreshing...'
      : `${this.blacksmithOffers.length} offers | Gold ${this.hudState.gold}`;
  }

  private getVillageMarketSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (!this.villageMarketUnlocked) {
      return this.villageMarketBusy ? 'Checking unlock...' : 'Locked';
    }

    return this.villageMarketBusy
      ? 'Refreshing...'
      : `${this.villageMarketSeedOffers.length} seeds | ${this.villageMarketBuybackOffers.length} crops`;
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

  private getLoopSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.loopBusy && !this.loopState) {
      return 'Loading...';
    }

    if (!this.loopState) {
      return 'No data';
    }

    if (this.loopState.preparation.active) {
      return 'Preparation active';
    }

    return this.loopState.preparation.ready ? 'Preparation ready' : 'Preparation blocked';
  }

  private getLoopSuppliesLabel(): string {
    if (!this.loopState) {
      return '-';
    }

    return `Herb ${this.loopState.supplies.healingHerb} | Tonic ${this.loopState.supplies.manaTonic}`;
  }

  private getLoopPreparationLabel(): string {
    if (!this.loopState) {
      return '-';
    }

    const prep = this.loopState.preparation;
    if (!prep.active) {
      return prep.ready ? 'Ready to apply' : 'Inactive';
    }

    const bonuses: string[] = [];
    if (prep.hpBoostActive) {
      bonuses.push('+HP');
    }
    if (prep.mpBoostActive) {
      bonuses.push('+MP');
    }
    if (prep.attackBoostActive) {
      bonuses.push('+ATK');
    }

    return bonuses.length > 0 ? bonuses.join(' / ') : 'Active';
  }

  private getLoopBlockersLabel(): string {
    if (!this.loopState) {
      return '-';
    }

    if (this.loopState.preparation.blockers.length > 0) {
      return this.loopState.preparation.blockers[0] ?? '-';
    }

    return this.loopState.preparation.nextStep;
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

  private getAutoSaveSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.autosaveBusy && !this.autosave) {
      return 'Loading...';
    }

    if (!this.autosave) {
      return 'No autosave';
    }

    return `v${this.autosave.version} | ${this.autosave.reason}`;
  }

  private getAutoSaveMetaLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connect to view autosave.';
    }

    if (!this.autosave) {
      return 'No milestone autosave available yet.';
    }

    return `Updated: ${this.formatIsoForHud(this.autosave.updatedAt)}`;
  }

  private getSaveSlotsSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.saveSlotsBusy && this.saveSlots.length === 0) {
      return 'Loading...';
    }

    const usedCount = this.saveSlots.filter((slot) => slot.exists).length;
    return `${usedCount}/3 used`;
  }

  private getSafeSlotStates(): SaveSlotState[] {
    const bySlot = new Map<number, SaveSlotState>();
    for (const slotState of this.saveSlots) {
      bySlot.set(slotState.slot, slotState);
    }

    return [1, 2, 3].map((slot) => {
      const entry = bySlot.get(slot);
      if (entry) {
        return entry;
      }

      return {
        slot,
        exists: false,
        version: null,
        label: null,
        updatedAt: null,
        preview: null,
      };
    });
  }

  private hasExistingSaveSlot(slot: number): boolean {
    const slotState = this.getSafeSlotStates().find((entry) => entry.slot === slot);
    return Boolean(slotState?.exists);
  }

  private getSaveSlotMetaLabel(slotState: SaveSlotState): string {
    if (!slotState.exists) {
      return 'Empty slot.';
    }

    const label = slotState.label?.trim() ? slotState.label.trim() : 'Manual save';
    const updated = slotState.updatedAt ? this.formatIsoForHud(slotState.updatedAt) : 'Unknown';
    return `${label} | Updated: ${updated}`;
  }

  private getSaveSlotStatsPreviewLabel(slotState: SaveSlotState): string {
    if (!slotState.preview) {
      return 'Stats: preview unavailable.';
    }

    const level = slotState.preview.playerLevel !== null ? `${slotState.preview.playerLevel}` : '?';
    const gold = slotState.preview.gold !== null ? `${slotState.preview.gold}` : '?';
    const floorCurrent = slotState.preview.towerCurrentFloor !== null ? `${slotState.preview.towerCurrentFloor}` : '?';
    const floorHighest = slotState.preview.towerHighestFloor !== null ? `${slotState.preview.towerHighestFloor}` : '?';

    return `Stats: Lvl ${level} | Gold ${gold} | Floor ${floorCurrent}/${floorHighest}`;
  }

  private getSaveSlotInventoryPreviewLabel(slotState: SaveSlotState): string {
    if (!slotState.preview) {
      return 'Inventory: preview unavailable.';
    }

    if (slotState.preview.inventoryTop.length === 0) {
      return 'Inventory: empty.';
    }

    const items = slotState.preview.inventoryTop.map((entry) => `${entry.itemKey} x${entry.quantity}`).join(', ');
    return `Inventory: ${items}`;
  }

  private getSaveSlotEquipmentPreviewLabel(slotState: SaveSlotState): string {
    if (!slotState.preview) {
      return 'Equipment: preview unavailable.';
    }

    if (slotState.preview.equippedCount === 0) {
      return 'Equipment: none equipped.';
    }

    const equipped = slotState.preview.equipmentTop
      .map((entry) => `${entry.slot}:${entry.itemKey}`)
      .join(', ');
    return `Equipment: ${slotState.preview.equippedCount} equipped (${equipped})`;
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
    return [
      this.isAuthenticated ? '1' : '0',
      this.autosaveBusy ? '1' : '0',
      this.autosaveRestoreSlotBusy ?? '-',
      this.autosaveError ?? '',
      this.autosave
        ? `${this.autosave.version}:${this.autosave.reason}:${this.autosave.updatedAt}`
        : 'none',
    ].join('|');
  }

  private computeSaveSlotsRenderSignature(): string {
    const slots = this.getSafeSlotStates()
      .map((slot) => {
        const preview = slot.preview
          ? `${slot.preview.playerLevel ?? '-'}:${slot.preview.gold ?? '-'}:${slot.preview.towerCurrentFloor ?? '-'}:${slot.preview.towerHighestFloor ?? '-'}:${slot.preview.inventoryTop.map((entry) => `${entry.itemKey}:${entry.quantity}`).join(',')}:${slot.preview.equipmentTop.map((entry) => `${entry.slot}:${entry.itemKey}`).join(',')}:${slot.preview.equippedCount}`
          : 'none';

        return `${slot.slot}:${slot.exists ? '1' : '0'}:${slot.version ?? '-'}:${slot.label ?? '-'}:${slot.updatedAt ?? '-'}:${preview}`;
      })
      .join(';');

    return [
      this.isAuthenticated ? '1' : '0',
      this.saveSlotsBusy ? '1' : '0',
      this.saveSlotsActionBusyKey ?? '-',
      this.saveSlotsLoadConfirmSlot ?? '-',
      this.saveSlotsError ?? '',
      slots,
    ].join('|');
  }

  private getQuestStatusLabel(status: QuestStatus): string {
    if (status === 'active') {
      return 'Active';
    }

    if (status === 'completed') {
      return 'Ready';
    }

    return 'Claimed';
  }

  private updateCombatButtons(): void {
    const availability = computeCombatActionAvailabilityFromFeature({
      isAuthenticated: this.isAuthenticated,
      combatState: this.combatState,
      isPlayerDarkened: this.getCombatStatusTurns('playerDarkenedTurns') > 0,
      hasCleanseableDebuffs: this.hasCleanseableDebuffs(),
      hasInterruptibleEnemyIntent: this.hasInterruptibleEnemyIntent(),
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

    this.combatLogsList.replaceChildren();
    const entries = this.combatLogs.length > 0 ? this.combatLogs : [this.getCombatLogsFallback()];

    for (const entry of entries) {
      const item = document.createElement('li');
      item.textContent = entry;
      if (this.combatLogs.length === 0) {
        item.classList.add('combat-log-empty');
      }
      this.combatLogsList.appendChild(item);
    }
  }

  private getCombatLogsFallback(): string {
    if (!this.isAuthenticated) {
      return 'Connecte toi pour lancer un combat.';
    }

    if (this.combatBusy) {
      return 'Chargement du combat...';
    }

    return this.combatState ? 'Aucun log de combat pour le moment.' : 'Aucun combat actif.';
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

    element.classList.add('combat-effects-value');
    element.replaceChildren();

    if (effects.length === 0) {
      const none = document.createElement('span');
      none.classList.add('combat-effect-chip', 'empty');
      none.textContent = 'None';
      element.appendChild(none);
      return;
    }

    for (const effect of effects) {
      const chip = document.createElement('span');
      chip.classList.add('combat-effect-chip');
      chip.dataset.effectTone = effect.tone;
      chip.textContent = effect.label;
      element.appendChild(chip);
    }
  }

  private renderCombatEnemySprite(): void {
    const stripElement = this.hudRoot?.querySelector<HTMLElement>('[data-hud="combatEnemyStrip"]');
    const image = this.hudRoot?.querySelector<HTMLImageElement>('[data-hud="combatEnemySprite"]');
    const fallback = this.hudRoot?.querySelector<HTMLElement>('[data-hud="combatEnemySpriteFallback"]');
    if (!stripElement || !image || !fallback) {
      return;
    }

    const enemy = this.combatState?.enemy;
    if (!enemy) {
      this.stopEnemyHudStripPlayback();
      stripElement.hidden = true;
      stripElement.style.removeProperty('background-image');
      image.hidden = true;
      image.removeAttribute('src');
      image.dataset.enemyKey = '';
      image.dataset.visualType = '';
      image.dataset.visualState = '';
      fallback.hidden = false;
      fallback.textContent = 'No enemy';
      return;
    }

    const preferredAnimation = this.getEnemyHudStripPreferredAnimation();
    const enemyStrip = this.getStripManifestEntry(enemy.key);
    if (enemyStrip?.path) {
      this.startEnemyHudStripPlayback(stripElement, enemy.key, enemyStrip, preferredAnimation);
      stripElement.hidden = false;
      image.hidden = true;
      image.removeAttribute('src');
      image.dataset.enemyKey = '';
      image.dataset.visualType = '';
      image.dataset.visualState = '';
      fallback.hidden = true;
      fallback.textContent = '';
      return;
    }

    this.stopEnemyHudStripPlayback();
    stripElement.hidden = true;
    stripElement.style.removeProperty('background-image');

    const portraitPath = this.getCombatEnemyPortraitPath(enemy.key, preferredAnimation);
    const visualPath = portraitPath ?? this.getCombatEnemySpritePath(enemy.key);
    if (!visualPath) {
      image.hidden = true;
      image.removeAttribute('src');
      image.dataset.enemyKey = '';
      image.dataset.visualType = '';
      image.dataset.visualState = '';
      fallback.hidden = false;
      fallback.textContent = enemy.key;
      return;
    }

    const visualType = portraitPath ? 'portrait' : 'sprite';
    const visualState = visualType === 'portrait' ? this.toPortraitStateKey(preferredAnimation) : '';
    if (
      image.dataset.enemyKey !== enemy.key ||
      image.getAttribute('src') !== visualPath ||
      image.dataset.visualType !== visualType ||
      image.dataset.visualState !== visualState
    ) {
      image.src = visualPath;
      image.dataset.enemyKey = enemy.key;
      image.dataset.visualType = visualType;
      image.dataset.visualState = visualState;
    }
    image.alt = `${enemy.name} ${visualType}`;
    image.hidden = false;
    fallback.hidden = true;
    fallback.textContent = '';
  }

  private getEnemyHudStripPreferredAnimation(): StripAnimationName {
    if (this.enemyHudStripOverrideAnimation) {
      return this.enemyHudStripOverrideAnimation;
    }

    if (!this.combatState || this.combatState.status !== 'active') {
      return 'idle';
    }

    return this.combatState.turn === 'enemy' ? 'cast' : 'idle';
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
    const safeFrameCount = Math.max(1, frameCount);
    const clampedIndex = Phaser.Math.Clamp(frameIndex, 0, safeFrameCount - 1);
    const ratio = safeFrameCount === 1 ? 0 : clampedIndex / (safeFrameCount - 1);
    element.style.backgroundPosition = `${ratio * 100}% 0%`;
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
    const manifest = this.getSpriteManifest();
    if (!manifest.strips) {
      return null;
    }

    const directEntry = manifest.strips[entityKey];
    if (directEntry) {
      return directEntry;
    }

    for (const entry of Object.values(manifest.strips)) {
      if (entry.key === entityKey) {
        return entry;
      }
    }

    return null;
  }

  private getStripFrames(strip: SpriteManifestStripEntry, animation: StripAnimationName): number[] {
    const maxFrame = Math.max(0, strip.frameCount - 1);
    const configured = strip.animations?.[animation];
    const sanitized = Array.isArray(configured)
      ? configured.filter((frame): frame is number => Number.isInteger(frame) && frame >= 0 && frame <= maxFrame)
      : [];

    if (sanitized.length > 0) {
      return sanitized;
    }

    if (animation === 'hit') {
      return [Math.min(1, maxFrame), maxFrame];
    }
    if (animation === 'cast') {
      return [0, maxFrame];
    }
    if (maxFrame <= 0) {
      return [0];
    }
    return [0, Math.min(1, maxFrame)];
  }

  private getStripPlayerTimings(strip: SpriteManifestStripEntry | null): {
    idleFps: number;
    hitFps: number;
    castFps: number;
    hitDurationMs: number;
    castDurationMs: number;
  } {
    const player = strip?.timings?.player;
    const base = {
      idleFps: this.resolveTimingValue(player?.idleFps, 4, 1, 24),
      hitFps: this.resolveTimingValue(player?.hitFps, 8, 1, 24),
      castFps: this.resolveTimingValue(player?.castFps, 8, 1, 24),
      hitDurationMs: this.resolveTimingValue(player?.hitDurationMs, 360, 80, 3000),
      castDurationMs: this.resolveTimingValue(player?.castDurationMs, 420, 80, 3000),
    };

    const preset = this.getActiveStripCalibrationPreset();
    if (!preset) {
      return base;
    }

    return {
      idleFps: this.scaleTimingWithPreset(base.idleFps, preset.playerFpsMultiplier, 1, 24),
      hitFps: this.scaleTimingWithPreset(base.hitFps, preset.playerFpsMultiplier, 1, 24),
      castFps: this.scaleTimingWithPreset(base.castFps, preset.playerFpsMultiplier, 1, 24),
      hitDurationMs: this.scaleTimingWithPreset(base.hitDurationMs, preset.playerActionDurationMultiplier, 80, 3000),
      castDurationMs: this.scaleTimingWithPreset(base.castDurationMs, preset.playerActionDurationMultiplier, 80, 3000),
    };
  }

  private getStripHudTimings(strip: SpriteManifestStripEntry | null): {
    idleIntervalMs: number;
    hitIntervalMs: number;
    castIntervalMs: number;
    hitDurationMs: number;
    castDurationMs: number;
  } {
    const hud = strip?.timings?.hud;
    const base = {
      idleIntervalMs: this.resolveTimingValue(hud?.idleIntervalMs, 240, 60, 2000),
      hitIntervalMs: this.resolveTimingValue(hud?.hitIntervalMs, 140, 60, 2000),
      castIntervalMs: this.resolveTimingValue(hud?.castIntervalMs, 170, 60, 2000),
      hitDurationMs: this.resolveTimingValue(hud?.hitDurationMs, 460, 80, 3000),
      castDurationMs: this.resolveTimingValue(hud?.castDurationMs, 420, 80, 3000),
    };

    const preset = this.getActiveStripCalibrationPreset();
    if (!preset) {
      return base;
    }

    return {
      idleIntervalMs: this.scaleTimingWithPreset(base.idleIntervalMs, preset.hudIntervalMultiplier, 60, 2000),
      hitIntervalMs: this.scaleTimingWithPreset(base.hitIntervalMs, preset.hudIntervalMultiplier, 60, 2000),
      castIntervalMs: this.scaleTimingWithPreset(base.castIntervalMs, preset.hudIntervalMultiplier, 60, 2000),
      hitDurationMs: this.scaleTimingWithPreset(base.hitDurationMs, preset.hudActionDurationMultiplier, 80, 3000),
      castDurationMs: this.scaleTimingWithPreset(base.castDurationMs, preset.hudActionDurationMultiplier, 80, 3000),
    };
  }

  private resolveTimingValue(value: number | undefined, fallback: number, min: number, max: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }
    return Phaser.Math.Clamp(Math.round(value), min, max);
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
    const manifest = this.getSpriteManifest();
    const byEnemyKey = manifest.portraits?.byEnemyKey;
    if (byEnemyKey && typeof byEnemyKey === 'object') {
      const directPath = byEnemyKey[enemyKey];
      const resolvedDirectPath = this.resolvePortraitEntryPath(directPath, animation);
      if (resolvedDirectPath) {
        return resolvedDirectPath;
      }
    }

    return this.resolvePortraitEntryPath(manifest.portraits?.fallback, animation);
  }

  private resolvePortraitEntryPath(
    entry: string | SpriteManifestPortraitEntry | undefined,
    animation: StripAnimationName,
  ): string | null {
    return resolvePortraitEntryPathFromFeature({
      entry,
      animation,
      asString: (value) => this.asString(value),
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
      this.heroProfile = this.normalizeHeroProfilePayload(payload);
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
      this.quests = this.normalizeQuestsPayload(payload);
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

      const parsed = this.normalizeBlacksmithPayload(payload);
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
      const parsed = this.normalizeVillageMarketPayload(payload);
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

      this.autosave = this.normalizeAutoSavePayload(payload);
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
      const slots = this.normalizeSaveSlotsPayload(payload);
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
          previewsBySlot.set(slot.slot, this.normalizeSaveSlotPreviewPayload(payload));
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
      const encounter = this.normalizeCombatPayload(payload);

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
      const encounter = this.normalizeCombatPayload(payload);

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
      hasCleanseableDebuffs: this.hasCleanseableDebuffs(),
      hasInterruptibleEnemyIntent: this.hasInterruptibleEnemyIntent(),
      isPlayerDarkened: this.getCombatStatusTurns('playerDarkenedTurns') > 0,
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
      const encounter = this.normalizeCombatPayload(payload);

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
      const encounter = this.normalizeCombatPayload(payload);

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
      this.villageNpcError = `${this.getVillageNpcDisplayName(npcKey)} is unavailable right now.`;
      this.updateHud();
      return;
    }
    if (!relationship.canTalkToday) {
      this.villageNpcError = `${this.getVillageNpcDisplayName(npcKey)} already talked today.`;
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
    const harvestedCropKey = this.getFarmPlotByKey(plotKey)?.cropKey ?? null;
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

    if (!this.hasExistingSaveSlot(slot)) {
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
      hasExistingSaveSlot: this.hasExistingSaveSlot(slot),
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
    if (!this.isAuthenticated) {
      this.heroProfileError = 'Login required to create hero profile.';
      this.updateHud();
      return;
    }

    if (this.heroProfileBusy) {
      return;
    }

    const heroName = this.heroProfileNameDraft.trim();
    if (heroName.length < 2 || heroName.length > 24) {
      this.heroProfileError = 'Hero name must contain 2-24 characters.';
      this.updateHud();
      return;
    }

    this.heroProfileBusy = true;
    this.heroProfileError = null;
    this.heroProfileMessage = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          heroName,
          appearanceKey: this.heroProfileAppearanceDraft,
        }),
      });
      const profile = this.normalizeHeroProfilePayload(payload);
      if (profile) {
        this.heroProfile = profile;
        this.heroProfileNameDraft = profile.heroName;
        this.heroProfileAppearanceDraft = profile.appearanceKey;
        this.heroProfileMessage = 'Profil hero sauvegarde.';
      } else {
        this.heroProfileError = 'Profile payload missing in response.';
      }
    } catch (error) {
      this.heroProfileError = this.getErrorMessage(error, 'Unable to save hero profile.');
    } finally {
      this.heroProfileBusy = false;
      this.updateHud();
    }
  }

  private async advanceIntroNarrative(): Promise<void> {
    if (!this.isAuthenticated) {
      this.introNarrativeError = 'Login required to continue intro.';
      this.updateHud();
      return;
    }

    if (this.introNarrativeBusy || this.introNarrativeState?.completed) {
      return;
    }

    this.introNarrativeBusy = true;
    this.introNarrativeError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/gameplay/intro/advance', {
        method: 'POST',
      });
      const introState = this.normalizeGameplayIntroPayload(payload);
      if (introState) {
        this.introNarrativeState = introState;
      }

      await this.refreshGameplayState();
    } catch (error) {
      this.introNarrativeError = this.getErrorMessage(error, 'Unable to continue intro sequence.');
    } finally {
      this.introNarrativeBusy = false;
      this.updateHud();
    }
  }

  private applyGameplaySnapshot(payload: unknown): void {
    if (!this.isRecord(payload)) {
      return;
    }

    const introNarrativeState = this.normalizeGameplayIntroPayload(payload);
    if (introNarrativeState) {
      this.introNarrativeState = introNarrativeState;
      this.introNarrativeError = null;
    }

    const world = this.asRecord(payload.world);
    if (world) {
      const day = this.asNumber(world.day);
      const zone = this.asString(world.zone);

      if (day !== null) {
        this.hudState.day = Math.max(1, Math.round(day));
      }

      if (zone) {
        this.hudState.area = zone;
      }
    }

    const farm = this.normalizeGameplayFarmPayload(payload);
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

    const farmStory = this.normalizeGameplayFarmStoryPayload(payload);
    if (farmStory) {
      this.farmStoryState = farmStory;
    }

    const crafting = this.normalizeGameplayCraftingPayload(payload);
    if (crafting) {
      this.farmCraftingState = crafting;
    }

    const loop = this.normalizeGameplayLoopPayload(payload);
    if (loop) {
      this.loopState = loop;
    }

    const progression = this.asRecord(payload.progression);
    if (!progression) {
      return;
    }

    const gold = this.asNumber(progression.gold);
    const level = this.asNumber(progression.level);
    const experience = this.asNumber(progression.experience);
    const experienceToNextLevel = this.asNumber(progression.experienceToNextLevel);
    const currentHp = this.asNumber(progression.currentHp);
    const maxHp = this.asNumber(progression.maxHp);
    const currentMp = this.asNumber(progression.currentMp);
    const maxMp = this.asNumber(progression.maxMp);

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

    const village = this.asRecord(payload.village);
    if (village) {
      const blacksmith = this.asRecord(village.blacksmith);
      if (blacksmith) {
        this.hudState.blacksmithUnlocked = Boolean(blacksmith.unlocked);
        this.hudState.blacksmithCurseLifted = Boolean(blacksmith.curseLifted);
      }

      const npcs = this.asRecord(village.npcs);
      if (npcs) {
        const mayor = this.normalizeVillageNpcEntry(npcs.mayor);
        const blacksmithNpc = this.normalizeVillageNpcEntry(npcs.blacksmith);
        const merchant = this.normalizeVillageNpcEntry(npcs.merchant);

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

      const relationships = this.asRecord(village.relationships);
      if (relationships) {
        const mayorRelationship = this.normalizeVillageNpcRelationshipEntry(relationships.mayor);
        const blacksmithRelationship = this.normalizeVillageNpcRelationshipEntry(relationships.blacksmith);
        const merchantRelationship = this.normalizeVillageNpcRelationshipEntry(relationships.merchant);

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

    const tower = this.asRecord(payload.tower);
    if (tower) {
      const currentFloor = this.asNumber(tower.currentFloor);
      const highestFloor = this.asNumber(tower.highestFloor);
      const bossFloor10Defeated = tower.bossFloor10Defeated;

      if (currentFloor !== null) {
        this.hudState.towerCurrentFloor = Math.max(1, Math.round(currentFloor));
      }

      if (highestFloor !== null) {
        this.hudState.towerHighestFloor = Math.max(1, Math.round(highestFloor));
      }

      this.hudState.towerBossFloor10Defeated = Boolean(bossFloor10Defeated);
    }

    const towerStory = this.normalizeGameplayTowerStoryPayload(payload);
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
    this.villageShopPanelOpen = false;
    this.villageShopType = 'market';
    this.villageShopTab = 'buy';
    this.villageShopSelectedEntryKey = null;
    this.villageShopRenderSignature = '';
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
    this.villageShopRenderSignature = '';
  }

  private resetVillageMarketState(): void {
    this.villageMarketUnlocked = false;
    this.villageMarketSeedOffers = [];
    this.villageMarketBuybackOffers = [];
    this.villageMarketBusy = false;
    this.villageMarketError = null;
    this.villageMarketRenderSignature = '';
    this.villageShopRenderSignature = '';
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
    this.combatMessage = this.resolveCombatMessage(snapshot);
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

  private resolveCombatMessage(snapshot: CombatEncounterState): string {
    const latestLog = snapshot.logs[snapshot.logs.length - 1];
    if (latestLog) {
      return latestLog;
    }

    if (snapshot.status === 'active') {
      return snapshot.turn === 'player' ? 'A toi de jouer.' : 'Tour ennemi.';
    }

    if (snapshot.status === 'won') {
      return 'Victoire. Combat termine.';
    }

    if (snapshot.status === 'lost') {
      return 'Defaite. Reviens plus fort.';
    }

    if (snapshot.status === 'fled') {
      return 'Tu as fui le combat.';
    }

    return 'Combat termine.';
  }

  private getCombatRecapLabel(): string {
    if (!this.combatState || this.combatState.status === 'active') {
      return 'Recap: -';
    }

    const recap = this.combatState.recap;
    if (!recap) {
      return 'Recap: pending';
    }

    const summaryLine = [
      `Recap ${this.getCombatRecapOutcomeLabel(recap.outcome)}`,
      `R${recap.rounds}`,
      `DMG +${recap.damageDealt}/-${recap.damageTaken}`,
      `Heal +${recap.healingDone}`,
      `MP -${recap.mpSpent}/+${recap.mpRecovered}`,
    ].join(' | ');

    const statusLine = [
      `Status P${recap.poisonApplied}/C${recap.ceciteApplied}/O${recap.obscuriteApplied}`,
      `Cleanse ${recap.debuffsCleansed}`,
      `Blind miss ${recap.blindMisses}`,
    ].join(' | ');

    const rewardsLine = [
      `Rewards XP +${recap.rewards.experience}`,
      `Gold +${recap.rewards.gold}`,
      `Loot x${recap.rewards.lootItems}`,
    ].join(' | ');

    const penaltyLine =
      recap.penalties.goldLost > 0 || recap.penalties.itemsLost > 0
        ? `Penalties Gold -${recap.penalties.goldLost} | Items -${recap.penalties.itemsLost}`
        : '';

    return [summaryLine, statusLine, rewardsLine, penaltyLine].filter((line) => line.length > 0).join('\n');
  }

  private getCombatRecapOutcomeLabel(status: CombatStatus): string {
    if (status === 'won') {
      return 'Victory';
    }
    if (status === 'lost') {
      return 'Defeat';
    }
    if (status === 'fled') {
      return 'Flee';
    }
    return 'Active';
  }

  private getCombatName(): string {
    if (!this.combatState) {
      return this.isAuthenticated ? 'Aucun combat actif' : 'Connecte toi pour combattre';
    }

    return this.combatState.enemy.name;
  }

  private getCombatStatusLabel(): string {
    switch (this.combatStatus) {
      case 'loading':
        return 'Chargement';
      case 'idle':
        return 'Inactif';
      case 'error':
        return 'Erreur';
      case 'active':
        return 'En cours';
      case 'won':
        return 'Victoire';
      case 'lost':
        return 'Defaite';
      case 'fled':
        return 'Fuite';
      default:
        return 'Inactif';
    }
  }

  private getCombatTurnLabel(): string {
    if (!this.combatState) {
      return '-';
    }

    return this.combatState.turn === 'player' ? 'Joueur' : 'Ennemi';
  }

  private getCombatUnitValue(current: number, max: number): string {
    return `${this.formatValue(current)} / ${this.formatValue(max)}`;
  }

  private getCombatEnemyValue(stat: 'hp' | 'mp'): string {
    if (!this.combatState) {
      return '-';
    }

    if (stat === 'hp') {
      return this.getCombatUnitValue(this.combatState.enemy.currentHp, this.combatState.enemy.hp);
    }

    return this.getCombatUnitValue(this.combatState.enemy.currentMp, this.combatState.enemy.mp);
  }

  private getCombatPlayerEffectChips(): CombatEffectChip[] {
    if (!this.combatState) {
      return [];
    }

    const effects: CombatEffectChip[] = [];

    const rallyTurns = this.getCombatScriptTurns('playerRallyTurns');
    if (rallyTurns > 0) {
      effects.push({ label: `Rally ${rallyTurns}t`, tone: 'calm' });
    }

    const poisonedTurns = this.getCombatStatusTurns('playerPoisonedTurns');
    if (poisonedTurns > 0) {
      effects.push({ label: `Poison ${poisonedTurns}t`, tone: 'danger' });
    }

    const blindedTurns = this.getCombatStatusTurns('playerBlindedTurns');
    if (blindedTurns > 0) {
      effects.push({ label: `Cecite ${blindedTurns}t`, tone: 'warning' });
    }

    const darkenedTurns = this.getCombatStatusTurns('playerDarkenedTurns');
    if (darkenedTurns > 0) {
      effects.push({ label: `Obscurite ${darkenedTurns}t`, tone: 'warning' });
    }

    const cleanseWindowTurns = this.getCombatScriptTurns('playerCleanseReactionWindowTurns');
    if (cleanseWindowTurns > 0) {
      effects.push({ label: `Cleanse window ${cleanseWindowTurns}t`, tone: 'utility' });
    }

    const interruptWindowTurns = this.getCombatScriptTurns('playerInterruptReactionWindowTurns');
    if (interruptWindowTurns > 0) {
      effects.push({ label: `Interrupt window ${interruptWindowTurns}t`, tone: 'warning' });
    }

    return effects;
  }

  private getCombatEnemyEffectChips(): CombatEffectChip[] {
    if (!this.combatState) {
      return [];
    }

    const effects: CombatEffectChip[] = [];
    const shatterTurns = this.getCombatScriptTurns('enemyShatterTurns');
    if (shatterTurns > 0) {
      effects.push({ label: `Exposed ${shatterTurns}t`, tone: 'utility' });
    }

    if (this.getCombatScriptFlag('avatarEnraged')) {
      effects.push({ label: 'Enraged', tone: 'danger' });
    }

    return effects;
  }

  private getCombatTelemetryLabel(): string {
    if (!this.combatState) {
      return '-';
    }

    const cleanseUses = this.getCombatScriptTurns('telemetryCleanseUses');
    const interruptUses = this.getCombatScriptTurns('telemetryInterruptUses');
    const bossSpecialCasts = this.getCombatScriptTurns('telemetryBossSpecialCasts');
    const specials = this.getCombatBossSpecialTelemetryParts();

    const hasTelemetry =
      cleanseUses > 0 || interruptUses > 0 || bossSpecialCasts > 0 || specials.length > 0;
    if (!hasTelemetry) {
      return 'No data';
    }

    const base = [`C:${cleanseUses}`, `I:${interruptUses}`, `B:${bossSpecialCasts}`];
    if (specials.length === 0) {
      return base.join(' | ');
    }

    return `${base.join(' | ')} | ${specials.join(', ')}`;
  }

  private getCombatBossSpecialTelemetryParts(): string[] {
    if (!this.combatState?.scriptState) {
      return [];
    }

    const prefix = 'telemetryBossSpecialCast_';
    const parts: string[] = [];
    for (const [key, value] of Object.entries(this.combatState.scriptState)) {
      if (!key.startsWith(prefix) || typeof value !== 'number' || !Number.isFinite(value)) {
        continue;
      }

      const count = Math.max(0, Math.floor(value));
      if (count <= 0) {
        continue;
      }

      const intent = key.slice(prefix.length).toUpperCase();
      parts.push(`${intent}:${count}`);
    }

    return parts.sort();
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

    const intentUi = this.getCombatEnemyIntentUi(intentKey, isPreview);
    element.classList.add('combat-intent-chip');
    element.replaceChildren();
    if (intentUi.icon !== 'none') {
      const icon = document.createElement('span');
      icon.classList.add('combat-intent-icon');
      icon.dataset.intentIcon = intentUi.icon;
      icon.textContent = intentUi.iconLabel;
      const iconTooltip = this.getCombatIntentIconTooltip(intentUi.iconLabel);
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

  private getCombatEnemyIntentUi(
    intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent',
    isPreview: boolean,
  ): {
    label: string;
    tone: 'neutral' | 'calm' | 'warning' | 'danger' | 'utility';
    pulse: boolean;
    icon: 'none' | 'attack' | 'magic' | 'cleanse' | 'dispel' | 'ulti';
    iconLabel: string;
  } {
    if (!this.combatState || this.combatState.status !== 'active' || this.combatState.turn !== 'player') {
      return { label: '-', tone: 'neutral', pulse: false, icon: 'none', iconLabel: '-' };
    }

    const intent = this.combatState.scriptState?.[intentKey];
    if (typeof intent !== 'string' || intent.length === 0) {
      return isPreview
        ? { label: 'NO PREVIEW', tone: 'neutral', pulse: false, icon: 'none', iconLabel: '-' }
        : { label: 'UNCLEAR', tone: 'warning', pulse: false, icon: 'none', iconLabel: '?' };
    }

    const mapped = this.mapEnemyIntentUi(intent);
    if (!mapped) {
      return { label: 'UNCLEAR', tone: 'warning', pulse: false, icon: 'none', iconLabel: '?' };
    }

    return {
      label: isPreview ? `NEXT: ${mapped.preview}` : mapped.current,
      tone: mapped.tone,
      pulse: isPreview ? false : mapped.pulse,
      icon: mapped.icon,
      iconLabel: mapped.iconLabel,
    };
  }

  private mapEnemyIntentUi(intent: string):
    | {
      current: string;
      preview: string;
      tone: 'calm' | 'warning' | 'danger' | 'utility';
      pulse: boolean;
      icon: 'attack' | 'magic' | 'cleanse' | 'dispel' | 'ulti';
      iconLabel: string;
    }
    | null {
    switch (intent) {
      case 'basic_strike':
        return {
          current: 'ATK: STRIKE',
          preview: 'STRIKE',
          tone: 'calm',
          pulse: false,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'root_smash':
        return {
          current: 'SKILL: ROOT SMASH',
          preview: 'ROOT SMASH',
          tone: 'danger',
          pulse: true,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'opening_punish':
        return {
          current: 'SKILL: PUNISH',
          preview: 'PUNISH',
          tone: 'warning',
          pulse: false,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'cinder_burst':
        return {
          current: 'SKILL: CINDER BURST',
          preview: 'CINDER BURST',
          tone: 'danger',
          pulse: true,
          icon: 'magic',
          iconLabel: 'MAG',
        };
      case 'molten_shell':
        return {
          current: 'UTILITY: CLEANSE',
          preview: 'CLEANSE',
          tone: 'utility',
          pulse: false,
          icon: 'cleanse',
          iconLabel: 'CLN',
        };
      case 'twin_slash':
        return {
          current: 'SKILL: TWIN SLASH',
          preview: 'TWIN SLASH',
          tone: 'danger',
          pulse: true,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'iron_recenter':
        return {
          current: 'UTILITY: CLEANSE',
          preview: 'CLEANSE',
          tone: 'utility',
          pulse: false,
          icon: 'cleanse',
          iconLabel: 'CLN',
        };
      case 'cataclysm_ray':
        return {
          current: 'ULT: CATACLYSM RAY',
          preview: 'CATACLYSM RAY',
          tone: 'danger',
          pulse: true,
          icon: 'ulti',
          iconLabel: 'ULT',
        };
      case 'cursed_claw':
        return {
          current: 'ATK: CURSED CLAW',
          preview: 'CURSED CLAW',
          tone: 'warning',
          pulse: false,
          icon: 'attack',
          iconLabel: 'ATK',
        };
      case 'null_sigil':
        return {
          current: 'UTILITY: DISPEL',
          preview: 'DISPEL',
          tone: 'utility',
          pulse: false,
          icon: 'dispel',
          iconLabel: 'DSP',
        };
      default:
        return null;
    }
  }

  private getCombatIntentIconTooltip(iconLabel: string): string {
    switch (iconLabel) {
      case 'ATK':
        return 'ATK: attaque physique';
      case 'MAG':
        return 'MAG: attaque magique';
      case 'CLN':
        return 'CLN: retire un debuff ennemi';
      case 'DSP':
        return 'DSP: retire un buff joueur';
      case 'ULT':
        return 'ULT: attaque ultime';
      default:
        return iconLabel;
    }
  }

  private getCombatScriptTurns(key: string): number {
    const raw = this.combatState?.scriptState?.[key];
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      return 0;
    }

    return Math.max(0, Math.floor(raw));
  }

  private getCombatStatusTurns(
    key: 'playerPoisonedTurns' | 'playerBlindedTurns' | 'playerDarkenedTurns',
  ): number {
    const scriptState = this.combatState?.scriptState;
    if (scriptState && Object.prototype.hasOwnProperty.call(scriptState, key)) {
      return this.getCombatScriptTurns(key);
    }

    if (key === 'playerPoisonedTurns') {
      return this.getCombatScriptTurns('playerBurningTurns');
    }

    if (key === 'playerDarkenedTurns') {
      return this.getCombatScriptTurns('playerSilencedTurns');
    }

    return 0;
  }

  private getCombatScriptFlag(key: string): boolean {
    return this.combatState?.scriptState?.[key] === true;
  }

  private hasCleanseableDebuffs(): boolean {
    return (
      this.getCombatStatusTurns('playerPoisonedTurns') > 0 ||
      this.getCombatStatusTurns('playerBlindedTurns') > 0 ||
      this.getCombatStatusTurns('playerDarkenedTurns') > 0
    );
  }

  private hasInterruptibleEnemyIntent(): boolean {
    if (!this.combatState || this.combatState.status !== 'active' || this.combatState.turn !== 'player') {
      return false;
    }

    const raw = this.combatState.scriptState?.enemyTelegraphIntent;
    if (typeof raw !== 'string' || raw.length === 0) {
      return false;
    }

    return this.isInterruptibleEnemyIntent(raw);
  }

  private isInterruptibleEnemyIntent(intent: string): boolean {
    return (
      intent === 'cinder_burst' ||
      intent === 'molten_shell' ||
      intent === 'iron_recenter' ||
      intent === 'null_sigil' ||
      intent === 'cataclysm_ray' ||
      intent === 'root_smash'
    );
  }

  private clearCombatError(): void {
    this.combatError = null;
  }

  private setCombatError(message: string): void {
    this.combatError = message;
  }

  private getDebugQaStatusLabel(): string {
    if (this.debugQaStatus === 'loading') {
      return 'Loading...';
    }

    if (this.debugQaStatus === 'error') {
      return 'Error';
    }

    if (this.debugQaStatus === 'success') {
      return 'Done';
    }

    return 'Idle';
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

  private normalizeDebugQaFilterQuery(value: string): string {
    return normalizeDebugQaFilterQueryFromDebugQa(value);
  }

  private isDebugQaQueryMatch(query: string, values: Array<string | null | undefined>): boolean {
    return isDebugQaQueryMatchFromDebugQa(query, values);
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
    if (!this.debugQaEnabled || !this.debugQaPanelRoot) {
      return;
    }

    this.syncDebugQaFiltersFromInputs();
    const payload = this.buildDebugQaTracePayload();
    const filename = this.buildDebugQaTraceFilename(payload.timestamp);
    this.downloadJsonFile(filename, payload);

    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Exported local QA trace to ${filename}.`;
    this.updateHud();
  }

  private async exportDebugQaMarkdownReport(): Promise<void> {
    if (!this.debugQaEnabled || !this.debugQaPanelRoot) {
      return;
    }

    this.syncDebugQaFiltersFromInputs();
    const timestamp = new Date().toISOString();
    const markdown = this.buildDebugQaMarkdownReport(timestamp);
    const filename = this.buildDebugQaMarkdownFilename(timestamp);
    this.downloadTextFile(filename, markdown, 'text/markdown;charset=utf-8');

    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Exported markdown QA report to ${filename}.`;
    this.updateHud();
  }

  private async loadCombatDebugScriptedIntents(): Promise<void> {
    if (!this.debugQaEnabled || !this.debugQaPanelRoot || this.debugQaStatus === 'loading') {
      return;
    }

    this.debugQaStatus = 'loading';
    this.debugQaError = null;
    this.debugQaMessage = 'Loading combat scripted intents reference...';
    this.debugQaScriptedIntentsReference = null;
    this.debugQaScriptedIntentsText = 'Loading combat scripted intents reference...';
    this.updateHud();

    try {
      const reference = await this.fetchJson<CombatDebugReference>('/combat/debug/scripted-intents');
      this.debugQaScriptedIntentsReference = reference;
      this.debugQaScriptedIntentsText = this.formatCombatDebugScriptedIntentsReference(reference);

      this.debugQaStatus = 'success';
      this.debugQaError = null;
      this.debugQaMessage = `Loaded ${reference.scriptedIntents.length} scripted enemy profiles.`;
    } catch (error) {
      this.debugQaStatus = 'error';
      this.debugQaError = this.getErrorMessage(error, 'Unable to load combat scripted intents reference.');
      this.debugQaMessage = null;
      this.debugQaScriptedIntentsReference = null;
      this.debugQaScriptedIntentsText =
        'Unable to load the combat scripted intents reference. Check the error message above and retry.';
    } finally {
      this.updateHud();
    }
  }

  private triggerDebugQaTraceImport(): void {
    if (!this.debugQaEnabled || !this.debugQaImportFileInput || this.debugQaStatus === 'loading') {
      return;
    }

    this.debugQaImportFileInput.value = '';
    this.debugQaImportFileInput.click();
  }

  private toggleDebugQaStepReplayAutoPlay(): void {
    if (!this.debugQaStepReplayState) {
      this.debugQaStatus = 'error';
      this.debugQaError = 'Demarre un replay pas a pas avant d activer l auto-play.';
      this.debugQaMessage = null;
      this.updateHud();
      return;
    }

    if (this.debugQaReplayAutoPlayIntervalId !== null) {
      this.stopDebugQaStepReplayAutoPlay(true);
      this.debugQaStatus = 'success';
      this.debugQaError = null;
      this.debugQaMessage = 'Auto-play en pause.';
      this.updateHud();
      return;
    }

    const selectedSpeed = this.readDebugQaReplayAutoPlaySpeed();
    this.debugQaReplayAutoPlaySpeed = selectedSpeed;
    this.persistDebugQaReplayAutoPlaySpeed(selectedSpeed);
    const intervalMs = this.getDebugQaReplayAutoPlayIntervalMs(selectedSpeed);
    this.debugQaReplayAutoPlayIntervalId = window.setInterval(() => {
      if (!this.debugQaStepReplayState) {
        this.stopDebugQaStepReplayAutoPlay(true);
        return;
      }

      this.advanceDebugQaStepReplay();
      if (!this.debugQaStepReplayState) {
        this.stopDebugQaStepReplayAutoPlay(true);
      }
    }, intervalMs);

    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Auto-play actif (${this.getDebugQaReplayAutoPlaySpeedLabel(selectedSpeed)}).`;
    this.updateHud();
  }

  private stopDebugQaStepReplayAutoPlay(updateHud: boolean): void {
    if (this.debugQaReplayAutoPlayIntervalId !== null) {
      window.clearInterval(this.debugQaReplayAutoPlayIntervalId);
      this.debugQaReplayAutoPlayIntervalId = null;
      if (updateHud) {
        this.updateHud();
      }
    }
  }

  private readDebugQaReplayAutoPlaySpeed(): DebugQaReplayAutoPlaySpeedKey {
    const value = this.debugQaReplayAutoPlaySpeedSelect?.value ?? this.debugQaReplayAutoPlaySpeed;
    return value === 'slow' || value === 'normal' || value === 'fast' ? value : 'normal';
  }

  private readStoredDebugQaReplayAutoPlaySpeed(): DebugQaReplayAutoPlaySpeedKey {
    const stored = this.readStorageValue(DEBUG_QA_REPLAY_AUTOPLAY_SPEED_STORAGE_KEY);
    return stored === 'slow' || stored === 'normal' || stored === 'fast' ? stored : 'normal';
  }

  private persistDebugQaReplayAutoPlaySpeed(speed: DebugQaReplayAutoPlaySpeedKey): void {
    this.writeStorageValue(DEBUG_QA_REPLAY_AUTOPLAY_SPEED_STORAGE_KEY, speed);
  }

  private getDebugQaReplayAutoPlayIntervalMs(speed: DebugQaReplayAutoPlaySpeedKey): number {
    return getDebugQaReplayAutoPlayIntervalMsFromDebugQa(speed, DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS);
  }

  private getDebugQaReplayAutoPlaySpeedLabel(speed: DebugQaReplayAutoPlaySpeedKey): string {
    return getDebugQaReplayAutoPlaySpeedLabelFromDebugQa(speed, DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS);
  }

  private applyStripCalibrationPreset(): void {
    if (!this.stripCalibrationEnabled) {
      return;
    }

    const nextPreset = this.readStripCalibrationPresetFromUi();
    this.stripCalibrationPreset = nextPreset;
    this.persistStripCalibrationPreset(nextPreset);
    this.refreshStripCalibrationRuntime();

    const activePreset = this.getActiveStripCalibrationPreset();
    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Strip calibration active: ${activePreset?.label ?? 'Manifest default'}.`;
    this.updateHud();
  }

  private readStripCalibrationPresetFromUi(): StripCalibrationPresetKey {
    const value = this.debugQaStripCalibrationSelect?.value ?? this.stripCalibrationPreset;
    return value === 'manifest' || value === 'snappy' || value === 'cinematic' ? value : 'manifest';
  }

  private readStoredStripCalibrationPreset(): StripCalibrationPresetKey {
    const stored = this.readStorageValue(DEBUG_QA_STRIP_CALIBRATION_STORAGE_KEY);
    return stored === 'manifest' || stored === 'snappy' || stored === 'cinematic' ? stored : 'manifest';
  }

  private persistStripCalibrationPreset(preset: StripCalibrationPresetKey): void {
    this.writeStorageValue(DEBUG_QA_STRIP_CALIBRATION_STORAGE_KEY, preset);
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

  private scaleTimingWithPreset(
    value: number,
    multiplier: number,
    min: number,
    max: number,
  ): number {
    const scaled = value * multiplier;
    return Phaser.Math.Clamp(Math.round(scaled), min, max);
  }

  private readStorageValue(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeStorageValue(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage quota / privacy mode failures.
    }
  }

  private formatCombatDebugScriptedIntentsReference(reference: CombatDebugReference): string {
    return formatCombatDebugScriptedIntentsReferenceFromDebugQa(reference);
  }

  private replayImportedDebugQaTrace(): void {
    if (!this.debugQaEnabled) {
      return;
    }

    if (!this.debugQaImportedTrace) {
      this.debugQaStatus = 'error';
      this.debugQaError = 'Importe un JSON trace avant de lancer Replay.';
      this.debugQaMessage = null;
      this.updateHud();
      return;
    }

    this.stopDebugQaStepReplay(false);
    this.applyImportedDebugQaTrace(this.debugQaImportedTrace);
    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Replay QA applique (${this.debugQaImportedTrace.sourceFile}).`;
    this.updateHud();
  }

  private startDebugQaStepReplay(): void {
    if (!this.debugQaEnabled) {
      return;
    }

    if (!this.debugQaImportedTrace) {
      this.debugQaStatus = 'error';
      this.debugQaError = 'Importe un JSON trace avant de lancer le replay pas a pas.';
      this.debugQaMessage = null;
      this.updateHud();
      return;
    }

    const logs = this.debugQaImportedTrace.combatLogs.slice(-20);
    if (logs.length === 0) {
      this.debugQaStatus = 'error';
      this.debugQaError = 'La trace importee ne contient pas de logs combat exploitables.';
      this.debugQaMessage = null;
      this.updateHud();
      return;
    }

    this.stopDebugQaStepReplay(false);
    const baseline = this.captureDebugQaReplayBaseline();
    this.applyImportedDebugQaTrace(this.debugQaImportedTrace);

    this.combatStatus = 'active';
    this.combatLogs = [];
    this.combatMessage = `Replay step 0/${logs.length}`;
    this.combatError = null;

    if (this.combatState) {
      this.combatState = this.cloneCombatState(this.combatState);
      this.combatState.status = 'active';
      this.combatState.logs = [];
      this.combatState.round = 1;
      this.combatState.turn = 'player';
    }

    this.debugQaStepReplayState = {
      logs,
      stepIndex: 0,
      totalSteps: logs.length,
      finalTrace: this.debugQaImportedTrace,
      baseline,
    };

    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Replay pas a pas demarre (${logs.length} steps).`;
    this.updateHud();
  }

  private advanceDebugQaStepReplay(): void {
    if (!this.debugQaStepReplayState) {
      this.stopDebugQaStepReplayAutoPlay(false);
      this.debugQaStatus = 'error';
      this.debugQaError = 'Demarre un replay pas a pas avant d avancer.';
      this.debugQaMessage = null;
      this.updateHud();
      return;
    }

    const replay = this.debugQaStepReplayState;
    if (replay.stepIndex >= replay.totalSteps) {
      this.stopDebugQaStepReplayAutoPlay(false);
      this.applyImportedDebugQaTrace(replay.finalTrace);
      this.debugQaStepReplayState = null;
      this.debugQaStatus = 'success';
      this.debugQaError = null;
      this.debugQaMessage = 'Replay pas a pas termine (etat final applique).';
      this.updateHud();
      return;
    }

    const nextStep = replay.stepIndex + 1;
    replay.stepIndex = nextStep;

    this.combatLogs = replay.logs.slice(0, nextStep);
    this.combatMessage = replay.logs[nextStep - 1] ?? this.combatMessage;
    this.combatError = null;
    this.combatStatus = nextStep >= replay.totalSteps ? (replay.finalTrace.combatStatus ?? 'active') : 'active';

    if (this.combatState) {
      this.combatState = this.cloneCombatState(this.combatState);
      this.combatState.logs = [...this.combatLogs];
      this.combatState.round = Math.max(1, Math.ceil(nextStep / 2));
      this.combatState.turn = nextStep % 2 === 0 ? 'player' : 'enemy';
      const resolvedStatus = this.combatStatus;
      this.combatState.status =
        resolvedStatus === 'active' ||
        resolvedStatus === 'won' ||
        resolvedStatus === 'lost' ||
        resolvedStatus === 'fled'
          ? resolvedStatus
          : 'active';
    }

    this.debugQaStatus = 'success';
    this.debugQaError = null;
    this.debugQaMessage = `Replay step ${nextStep}/${replay.totalSteps}`;
    this.updateHud();
  }

  private stopDebugQaStepReplay(restoreBaseline: boolean): void {
    this.stopDebugQaStepReplayAutoPlay(false);
    const replay = this.debugQaStepReplayState;
    this.debugQaStepReplayState = null;

    if (!replay) {
      return;
    }

    if (restoreBaseline) {
      this.restoreDebugQaReplayBaseline(replay.baseline);
      this.debugQaStatus = 'success';
      this.debugQaError = null;
      this.debugQaMessage = 'Replay pas a pas stoppe (etat precedent restaure).';
      this.updateHud();
    }
  }

  private captureDebugQaReplayBaseline(): DebugQaReplayBaseline {
    return {
      isAuthenticated: this.isAuthenticated,
      authStatus: this.authStatus,
      hudState: { ...this.hudState },
      combatEncounterId: this.combatEncounterId,
      combatStatus: this.combatStatus,
      combatState: this.combatState ? this.cloneCombatState(this.combatState) : null,
      combatLogs: [...this.combatLogs],
      combatMessage: this.combatMessage,
      combatError: this.combatError,
    };
  }

  private restoreDebugQaReplayBaseline(baseline: DebugQaReplayBaseline): void {
    this.isAuthenticated = baseline.isAuthenticated;
    this.authStatus = baseline.authStatus;
    this.hudState = { ...baseline.hudState };
    this.combatEncounterId = baseline.combatEncounterId;
    this.combatStatus = baseline.combatStatus;
    this.combatState = baseline.combatState ? this.cloneCombatState(baseline.combatState) : null;
    this.combatLogs = [...baseline.combatLogs];
    this.combatMessage = baseline.combatMessage;
    this.combatError = baseline.combatError;
  }

  private async handleDebugQaImportFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file || !this.debugQaEnabled) {
      return;
    }

    if (this.debugQaStepReplayState) {
      this.stopDebugQaStepReplay(true);
    }

    this.debugQaStatus = 'loading';
    this.debugQaError = null;
    this.debugQaMessage = `Importing ${file.name}...`;
    this.updateHud();

    try {
      const rawText = await file.text();
      const rawPayload = JSON.parse(rawText) as unknown;
      const importedTrace = this.parseImportedDebugQaTrace(rawPayload, file.name);
      if (!importedTrace) {
        throw new Error('Le fichier ne contient pas un JSON trace QA valide.');
      }

      this.debugQaImportedTrace = importedTrace;
      this.debugQaStatus = 'success';
      this.debugQaError = null;
      this.debugQaMessage = `Trace importee: ${file.name} (${importedTrace.timestamp}).`;
    } catch (error) {
      this.debugQaStatus = 'error';
      this.debugQaError = this.getErrorMessage(error, 'Impossible d importer la trace JSON.');
      this.debugQaMessage = null;
    } finally {
      if (input) {
        input.value = '';
      }
      this.updateHud();
    }
  }

  private parseImportedDebugQaTrace(rawPayload: unknown, sourceFile: string): ImportedDebugQaTrace | null {
    return parseImportedDebugQaTraceFromDebugQa(rawPayload, sourceFile, {
      parsers: {
        asRecord: (value) => this.asRecord(value),
        asString: (value) => this.asString(value),
        asStringArray: (value) => this.asStringArray(value),
        asNumber: (value) => this.asNumber(value),
        asCombatUiStatus: (value) => this.asCombatUiStatus(value),
      },
      normalizeCombatPayload: (value) => this.normalizeCombatPayload(value),
    });
  }

  private normalizeImportedHudState(rawState: Record<string, unknown> | null): Partial<HudState> {
    return normalizeImportedHudStateFromDebugQa(rawState, {
      asNumber: (value) => this.asNumber(value),
      asString: (value) => this.asString(value),
    });
  }

  private applyImportedDebugQaTrace(trace: ImportedDebugQaTrace): void {
    if (trace.authAuthenticated !== null) {
      this.isAuthenticated = trace.authAuthenticated;
    }
    if (trace.authStatus) {
      this.authStatus = trace.authStatus;
    }

    this.hudState = {
      ...this.hudState,
      ...trace.hudState,
    };

    if (trace.combatState) {
      this.combatState = this.cloneCombatState(trace.combatState);
      this.combatEncounterId = trace.combatState.id;
      this.combatStatus = trace.combatState.status;
      this.combatLogs = [...trace.combatState.logs].slice(-20);
    } else {
      this.combatEncounterId = trace.combatEncounterId;
      this.combatStatus = trace.combatStatus ?? 'idle';
      this.combatLogs = [...trace.combatLogs].slice(-20);
      if (!trace.combatEncounterId) {
        this.combatState = null;
      }
    }

    if (trace.combatMessage) {
      this.combatMessage = trace.combatMessage;
    } else if (!trace.combatState && !trace.combatEncounterId) {
      this.combatMessage = 'Aucun combat actif.';
    }

    this.combatError = trace.combatError;
  }

  private buildDebugQaTracePayload(): DebugQaTracePayload {
    const timestamp = new Date().toISOString();
    return {
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
      hud: {
        state: { ...this.hudState },
        summaries: {
          combat: this.getCombatStatusLabel(),
          quests: this.getQuestSummaryLabel(),
          blacksmith: this.getBlacksmithShopSummaryLabel(),
          autosave: this.getAutoSaveSummaryLabel(),
          saveSlots: this.getSaveSlotsSummaryLabel(),
        },
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
    };
  }

  private buildCombatTraceSnapshot(): DebugQaTracePayload['combat'] {
    if (!this.combatState) {
      return {
        encounterId: this.combatEncounterId,
        status: this.combatStatus,
        message: this.combatMessage,
        error: this.combatError,
        telemetry: this.getCombatTelemetryLabel(),
        logs: [...this.combatLogs],
        state: null,
      };
    }

    return {
      encounterId: this.combatEncounterId,
      status: this.combatStatus,
      message: this.combatMessage,
      error: this.combatError,
      telemetry: this.getCombatTelemetryLabel(),
      logs: [...this.combatLogs],
      state: (() => {
        const state: CombatEncounterState = {
          ...this.combatState,
          logs: [...this.combatState.logs],
          player: { ...this.combatState.player },
          enemy: { ...this.combatState.enemy },
        };

        if (this.combatState.scriptState) {
          state.scriptState = { ...this.combatState.scriptState };
        }

        return state;
      })(),
    };
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
    if (!this.debugQaEnabled) {
      return;
    }

    if (!this.isAuthenticated) {
      this.debugQaError = 'Connecte toi pour utiliser le debug QA.';
      this.debugQaMessage = null;
      this.debugQaStatus = 'error';
      this.updateHud();
      return;
    }

    const request = this.buildDebugQaRequest(action);
    if (!request) {
      this.debugQaError = 'Debug QA values are invalid.';
      this.debugQaMessage = null;
      this.debugQaStatus = 'error';
      this.updateHud();
      return;
    }

    this.debugQaBusyAction = action;
    this.debugQaStatus = 'loading';
    this.debugQaError = null;
    this.debugQaMessage = request.loadingLabel;
    this.updateHud();

    try {
      const responsePayload = await this.fetchJson<unknown>(request.path, {
        method: 'POST',
        body: JSON.stringify(request.body),
      });
      this.debugQaStatus = 'success';
      this.debugQaMessage = this.getDebugQaSuccessMessage(action, responsePayload, request.successLabel);
      await this.bootstrapSessionState();
    } catch (error) {
      this.debugQaStatus = 'error';
      this.debugQaError = this.getErrorMessage(error, request.failureLabel);
      this.debugQaMessage = null;
    } finally {
      this.debugQaBusyAction = null;
      this.updateHud();
    }
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
    switch (action) {
      case 'grant-resources': {
        const xp = this.readDebugQaNumber(this.debugQaGrantXpInput, 250);
        const gold = this.readDebugQaNumber(this.debugQaGrantGoldInput, 500);
        return {
          path: '/debug/admin/grant-resources',
          body: {
            experience: xp,
            gold,
            items: [],
          },
          loadingLabel: `Granting ${xp} XP / ${gold} gold...`,
          successLabel: `Granted ${xp} XP / ${gold} gold.`,
          failureLabel: 'Unable to grant debug resources.',
        };
      }
      case 'set-tower-floor': {
        const floor = this.readDebugQaNumber(this.debugQaTowerFloorInput, 10, 1, 10);
        return {
          path: '/debug/admin/set-tower-floor',
          body: { floor },
          loadingLabel: `Setting tower floor to ${floor}...`,
          successLabel: `Tower floor set to ${floor}.`,
          failureLabel: 'Unable to set tower floor.',
        };
      }
      case 'apply-state-preset': {
        const presetKey = (this.debugQaStatePresetSelect?.value.trim() || 'mid_tower') as DebugStatePresetKey;
        return {
          path: '/debug/admin/apply-state-preset',
          body: { presetKey },
          loadingLabel: `Applying ${presetKey} state preset...`,
          successLabel: `State preset ${presetKey} applied.`,
          failureLabel: 'Unable to apply state preset.',
        };
      }
      case 'apply-loadout-preset': {
        const presetKey = this.debugQaLoadoutPresetSelect?.value.trim() || 'tower_mid';
        return {
          path: '/debug/admin/apply-loadout-preset',
          body: { presetKey },
          loadingLabel: `Applying ${presetKey} loadout...`,
          successLabel: `Loadout preset ${presetKey} applied.`,
          failureLabel: 'Unable to apply loadout preset.',
        };
      }
      case 'complete-quests': {
        return {
          path: '/debug/admin/complete-quests',
          body: {},
          loadingLabel: 'Completing quests...',
          successLabel: 'Quests marked as completed.',
          failureLabel: 'Unable to complete quests.',
        };
      }
      case 'set-world-flags': {
        const flags = this.readDebugQaFlagList(this.debugQaWorldFlagsInput);
        const removeFlags = this.readDebugQaFlagList(this.debugQaWorldFlagsRemoveInput);
        const replace = Boolean(this.debugQaWorldFlagsReplaceInput?.checked);
        if (!replace && flags.length === 0 && removeFlags.length === 0) {
          return null;
        }

        return {
          path: '/debug/admin/set-world-flags',
          body: {
            flags,
            removeFlags,
            replace,
          },
          loadingLabel: replace ? 'Replacing world flags...' : 'Updating world flags...',
          successLabel: replace ? 'World flags replaced.' : 'World flags updated.',
          failureLabel: 'Unable to set world flags.',
        };
      }
      case 'set-quest-status': {
        const questKey = this.debugQaQuestKeyInput?.value.trim() ?? '';
        const status = this.debugQaQuestStatusSelect?.value.trim() as QuestStatus;
        if (!questKey || !this.isQuestStatusValue(status)) {
          return null;
        }

        return {
          path: '/debug/admin/set-quest-status',
          body: {
            questKey,
            status,
          },
          loadingLabel: `Setting quest ${questKey} to ${status}...`,
          successLabel: `Quest ${questKey} set to ${status}.`,
          failureLabel: 'Unable to set quest status.',
        };
      }
      default:
        return null;
    }
  }

  private getDebugQaSuccessMessage(
    action: DebugQaActionName,
    payload: unknown,
    fallback: string,
  ): string {
    if (action === 'apply-state-preset') {
      const message = this.formatApplyStatePresetSuccess(payload);
      if (message) {
        return message;
      }
    }

    if (action === 'set-world-flags') {
      const message = this.formatSetWorldFlagsSuccess(payload);
      if (message) {
        return message;
      }
    }

    if (action === 'set-quest-status') {
      const message = this.formatSetQuestStatusSuccess(payload);
      if (message) {
        return message;
      }
    }

    return fallback;
  }

  private formatApplyStatePresetSuccess(payload: unknown): string | null {
    return formatApplyStatePresetSuccessFromDebugQa(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asStringArray: (value) => this.asStringArray(value),
      asNumber: (value) => this.asNumber(value),
    });
  }

  private formatSetWorldFlagsSuccess(payload: unknown): string | null {
    return formatSetWorldFlagsSuccessFromDebugQa(payload, {
      asRecord: (value) => this.asRecord(value),
      asStringArray: (value) => this.asStringArray(value),
    });
  }

  private formatSetQuestStatusSuccess(payload: unknown): string | null {
    return formatSetQuestStatusSuccessFromDebugQa(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
    });
  }

  private formatDebugQaFlagPreview(flags: string[]): string {
    return formatDebugQaFlagPreviewFromDebugQa(flags);
  }

  private readDebugQaNumber(
    input: HTMLInputElement | null,
    fallback: number,
    min?: number,
    max?: number,
  ): number {
    return readDebugQaNumberFromDebugQa(input, fallback, min, max);
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

  private isQuestStatusValue(value: string): value is QuestStatus {
    return isQuestStatusValueFromDebugQa(value);
  }

  private readDebugQaFlagList(input: HTMLTextAreaElement | null): string[] {
    return readDebugQaFlagListFromDebugQa(input);
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

  private getBlacksmithStatusLabel(): string {
    return getBlacksmithStatusLabelFromVillageHud({
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
    });
  }

  private getVillageNpcSummaryLabel(): string {
    return getVillageNpcSummaryLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
  }

  private getVillageNpcEntryLabel(npcKey: VillageNpcKey): string {
    return getVillageNpcEntryLabelFromLogic({
      npcKey,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
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

  private getVillageNpcDisplayName(npcKey: VillageNpcKey): string {
    return getVillageNpcDisplayNameFromLogic(npcKey);
  }

  private getIntroSummaryLabel(): string {
    return getIntroSummaryLabelFromIntro({
      isAuthenticated: this.isAuthenticated,
      introNarrativeBusy: this.introNarrativeBusy,
      introNarrativeState: this.introNarrativeState,
    });
  }

  private getIntroNarrativeLabel(): string {
    return getIntroNarrativeLabelFromIntro(this.isAuthenticated, this.introNarrativeState);
  }

  private getIntroHintLabel(): string {
    return getIntroHintLabelFromIntro(this.isAuthenticated, this.introNarrativeState);
  }

  private getIntroProgressLabel(): string {
    return getIntroProgressLabelFromIntro(this.introNarrativeState);
  }

  private getIntroAdvanceButtonLabel(): string {
    return getIntroAdvanceButtonLabelFromIntro(this.isAuthenticated, this.introNarrativeState);
  }

  private getHeroProfileSummaryLabel(): string {
    return getHeroProfileSummaryLabelFromIntro({
      isAuthenticated: this.isAuthenticated,
      heroProfileBusy: this.heroProfileBusy,
      heroProfile: this.heroProfile,
      getHeroAppearanceLabel: (key) => this.getHeroAppearanceLabel(key),
    });
  }

  private getHeroAppearanceLabel(key: HeroAppearanceKey): string {
    return getHeroAppearanceLabelFromIntro(key, HERO_APPEARANCE_OPTIONS);
  }

  private normalizeGameplayIntroPayload(payload: unknown): IntroNarrativeState | null {
    return normalizeGameplayIntroPayloadFromIntro(
      payload,
      {
        asRecord: (value) => this.asRecord(value),
        asString: (value) => this.asString(value),
      },
      isIntroNarrativeStepKey,
    );
  }

  private normalizeVillageNpcEntry(payload: unknown): VillageNpcHudEntry | null {
    return normalizeVillageNpcEntryFromVillageHud(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
    });
  }

  private normalizeVillageNpcRelationshipEntry(payload: unknown): VillageNpcRelationshipHudEntry | null {
    return normalizeVillageNpcRelationshipEntryFromVillageHud(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    });
  }

  private normalizeGameplayFarmStoryPayload(payload: unknown): FarmStoryState | null {
    return parseGameplayFarmStoryPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmStoryState | null;
  }

  private normalizeFarmStoryEventEntry(payload: unknown): FarmStoryEventState | null {
    return parseFarmStoryEventEntry(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmStoryEventState | null;
  }

  private normalizeGameplayTowerStoryPayload(payload: unknown): TowerStoryState | null {
    return parseGameplayTowerStoryPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as TowerStoryState | null;
  }

  private normalizeTowerStoryEventEntry(payload: unknown): TowerStoryEventState | null {
    return parseTowerStoryEventEntry(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as TowerStoryEventState | null;
  }

  private normalizeGameplayFarmPayload(payload: unknown): FarmState | null {
    return parseGameplayFarmPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmState | null;
  }

  private normalizeGameplayCraftingPayload(payload: unknown): FarmCraftingState | null {
    return parseGameplayCraftingPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmCraftingState | null;
  }

  private normalizeGameplayLoopPayload(payload: unknown): GameplayLoopState | null {
    return parseGameplayLoopPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as GameplayLoopState | null;
  }

  private normalizeFarmCraftRecipeState(payload: unknown): FarmCraftRecipeState | null {
    return parseFarmCraftRecipeState(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmCraftRecipeState | null;
  }

  private normalizeFarmCraftIngredientState(payload: unknown): FarmCraftIngredientState | null {
    return parseFarmCraftIngredientState(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmCraftIngredientState | null;
  }

  private normalizeFarmCropCatalogEntry(payload: unknown): FarmCropCatalogEntryState | null {
    return parseFarmCropCatalogEntry(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmCropCatalogEntryState | null;
  }

  private normalizeFarmPlotState(payload: unknown): FarmPlotState | null {
    return parseFarmPlotState(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    }) as FarmPlotState | null;
  }

  private async fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    return fetchJsonFromApi<T>(path, init);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return formatRequestErrorFromApi(error, fallback);
  }

  private getGameplayPayloadParsers(): GameplayPayloadParsers<CombatStatus, CombatTurn, QuestStatus> {
    return {
      isRecord: (value): value is Record<string, unknown> => this.isRecord(value),
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asStringArray: (value) => this.asStringArray(value),
      asNumber: (value) => this.asNumber(value),
      asCombatStatus: (value) => this.asCombatStatus(value),
      asQuestStatus: (value) => this.asQuestStatus(value),
      asCombatTurn: (value) => this.asCombatTurn(value),
    };
  }

  private normalizeQuestsPayload(payload: unknown): QuestState[] {
    return parseQuestsPayloadFromService(payload, this.getGameplayPayloadParsers());
  }

  private normalizeBlacksmithPayload(payload: unknown): { offers: BlacksmithOfferState[] } {
    return parseBlacksmithPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    });
  }

  private normalizeVillageMarketPayload(payload: unknown): {
    unlocked: boolean;
    seedOffers: VillageSeedOfferState[];
    cropBuybackOffers: VillageCropBuybackOfferState[];
  } {
    return parseVillageMarketPayload(payload, {
      asRecord: (value) => this.asRecord(value),
      asString: (value) => this.asString(value),
      asNumber: (value) => this.asNumber(value),
    });
  }

  private normalizeSaveSlotsPayload(payload: unknown): SaveSlotState[] {
    return parseSaveSlotsPayloadFromService(payload, this.getGameplayPayloadParsers());
  }

  private normalizeAutoSavePayload(payload: unknown): AutoSaveState | null {
    return parseAutoSavePayloadFromService(payload, this.getGameplayPayloadParsers());
  }

  private normalizeHeroProfilePayload(payload: unknown): HeroProfileState | null {
    return parseHeroProfilePayloadFromService(
      payload,
      this.getGameplayPayloadParsers(),
      isHeroAppearanceKey,
    );
  }

  private normalizeSaveSlotPreviewPayload(payload: unknown): SaveSlotPreview | null {
    return parseSaveSlotPreviewPayloadFromService(payload, this.getGameplayPayloadParsers());
  }

  private normalizeCombatPayload(payload: unknown): CombatEncounterState | null {
    return parseCombatPayloadFromService(
      payload,
      this.getGameplayPayloadParsers(),
      this.combatState?.status ?? 'active',
    );
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return asRecordFromParser(value);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return isRecordFromParser(value);
  }

  private asString(value: unknown): string | null {
    return asStringFromParser(value);
  }

  private asStringArray(value: unknown): string[] {
    return asStringArrayFromParser(value);
  }

  private asNumber(value: unknown): number | null {
    return asNumberFromParser(value);
  }

  private asCombatUiStatus(value: unknown): CombatUiStatus | null {
    return asCombatUiStatusFromParser(value);
  }

  private asCombatStatus(value: unknown): CombatStatus | null {
    return asCombatStatusFromParser(value);
  }

  private asQuestStatus(value: unknown): QuestStatus | null {
    return asQuestStatusFromParser(value);
  }

  private asCombatTurn(value: unknown): CombatTurn | null {
    return asCombatTurnFromParser(value);
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

    this.farmSceneStaticLabels.push(
      this.add
        .text(218, 130, 'Maison', {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#f3e5c5',
          stroke: '#1d140c',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(218, 390, 'Coin craft', {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          color: '#f1d9ab',
          stroke: '#1d140c',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(1244, 236, 'Sortie village', {
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          color: '#f6ddaf',
          stroke: '#1d140c',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
    );

    this.createFarmActionZone(220, 236, 222, 146, () => {
      void this.sleepAtFarm();
    });
    this.createFarmActionZone(218, 446, 196, 74, () => {
      this.toggleFarmCraftingPanel();
    });
    this.createFarmActionZone(1278, 418, 174, 280, () => {
      this.handleFarmVillageExitIntent();
    });

    this.farmSceneActionHintLabel = this.add
      .text(804, 690, '1 planter • 2 arroser • 3 recolter • F dormir • C craft', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#e8f2dd',
        stroke: '#192015',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.renderFarmScene();
  }

  private drawVillageDecor(graphics: Phaser.GameObjects.Graphics): void {
    drawVillageSceneBackdrop(graphics);

    this.farmSceneStaticLabels.push(
      this.add
        .text(286, 90, 'Mairie', {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#f5e4bf',
          stroke: '#171311',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(1266, 94, 'Forge', {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#f8d7a4',
          stroke: '#171311',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(1038, 440, 'Marche', {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#f5e0b3',
          stroke: '#171311',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(356, 486, 'Coin calme', {
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          color: '#d5e8cc',
          stroke: '#171311',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(806, 170, 'Vers la Tour', {
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          color: '#dcc6d8',
          stroke: '#171311',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
      this.add
        .text(808, 706, 'Vers la Ferme', {
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          color: '#f0e3c3',
          stroke: '#171311',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12),
    );

    for (const zone of VILLAGE_SCENE_ZONES) {
      this.createVillageActionZone(zone);
    }

    this.villageSceneActionHintLabel = this.add
      .text(804, 862, 'E interagir • R cible suivante • clique une zone pour agir', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#e4ebf2',
        stroke: '#131c1f',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.ensureVillageSelectedZone();
    this.renderVillageScene();
  }

  private createVillageActionZone(config: VillageSceneZoneConfig): void {
    const visual = createVillageActionZoneFromFeature({
      scene: this,
      config,
      getZoneStateLabel: (zone) => this.getVillageZoneStateLabel(zone),
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
    const slots = this.getFarmSceneSlots();
    renderFarmScenePlotVisualsFromFeature({
      scene: this,
      plotVisuals: this.farmScenePlotVisuals,
      slots,
      selectedPlotKey: this.farmSelectedPlotKey,
      getPlotPosition: (slot) => this.getFarmScenePlotPosition(slot),
      getPlotPhase: (plot) => this.getFarmPlotPhase(plot),
      getPlotPalette: (phase, selected) => this.getFarmScenePlotPalette(phase, selected),
      getPlotPhaseLabel: (plot) => this.getFarmPlotPhaseLabel(plot),
      onSelectPlot: (plotKey) => {
        this.setSelectedFarmPlot(plotKey, true);
        this.updateHud();
      },
    });

    if (this.farmSceneActionHintLabel) {
      this.farmSceneActionHintLabel.setText(this.getFarmFeedbackLabel());
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
      getZoneStateLabel: (zone) => this.getVillageZoneStateLabel(zone),
      getZoneStateColor: (zone) => this.getVillageZoneStateColor(zone),
    });

    if (this.villageSceneActionHintLabel) {
      this.villageSceneActionHintLabel.setText(this.getVillageInteractionFeedbackLabel());
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
      const zone = this.getVillageZoneByKey(zoneKey);
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

  private getVillageZoneByKey(zoneKey: VillageSceneZoneKey | null): VillageSceneZoneConfig | null {
    return getVillageZoneByKeyFromFeature(VILLAGE_SCENE_ZONES, zoneKey);
  }

  private getVillageZoneStateLabel(zone: VillageSceneZoneConfig): string {
    return getVillageZoneStateLabelFromLogic({
      isAuthenticated: this.isAuthenticated,
      zone,
      villageMarketUnlocked: this.villageMarketUnlocked,
      villageMarketSeedOffersCount: this.villageMarketSeedOffers.length,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
  }

  private getVillageZoneStateColor(zone: VillageSceneZoneConfig): string {
    const interactionState = this.getVillageZoneInteractionState(zone);
    return getVillageZoneStateColorFromLogic({
      isAuthenticated: this.isAuthenticated,
      zone,
      villageMarketUnlocked: this.villageMarketUnlocked,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      interactionState,
    });
  }

  private getVillageZoneInteractionState(zone: VillageSceneZoneConfig): { enabled: boolean; reason: string } {
    return getVillageZoneInteractionStateFromLogic({
      isAuthenticated: this.isAuthenticated,
      zone,
      villageMarketUnlocked: this.villageMarketUnlocked,
      blacksmithUnlocked: this.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: this.hudState.blacksmithCurseLifted,
      villageNpcState: this.villageNpcState,
      villageNpcRelationships: this.villageNpcRelationships,
    });
  }

  private getFarmSceneSlots(): FarmScenePlotSlot[] {
    return getFarmSceneSlotsFromLogic(this.farmState) as FarmScenePlotSlot[];
  }

  private getFarmScenePlotPosition(slot: FarmScenePlotSlot): { x: number; y: number } {
    return getFarmScenePlotPositionFromLogic(slot);
  }

  private getFarmScenePlotPalette(
    phase: FarmPlotPhase,
    selected: boolean,
  ): { frame: number; bed: number; crop: number; badge: string } {
    return getFarmScenePlotPaletteFromLogic(phase, selected);
  }

  private ensureSelectedFarmPlot(): void {
    const slots = this.getFarmSceneSlots();
    this.farmSelectedPlotKey = resolveSelectedFarmPlotKeyFromLogic(slots, this.farmSelectedPlotKey);
  }

  private setSelectedFarmPlot(plotKey: string, announceSelection: boolean): void {
    const slot = getFarmSlotByKeyFromLogic(this.getFarmSceneSlots(), plotKey);
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

  private getFarmPlotByKey(plotKey: string | null): FarmPlotState | null {
    return getFarmPlotByKeyFromLogic(plotKey, this.farmState) as FarmPlotState | null;
  }

  private getFarmPlotPhase(plot: FarmPlotState | null): FarmPlotPhase {
    return getFarmPlotPhaseFromLogic(plot);
  }

  private getFarmPlotPhaseLabel(plot: FarmPlotState | null): string {
    return getFarmPlotPhaseLabelFromLogic(plot);
  }

  private getSelectedSeedLabel(): string {
    return getSelectedSeedLabelFromLogic(this.farmSelectedSeedItemKey);
  }

  private getFarmReadyPlotsLabel(): string {
    return getFarmReadyPlotsLabelFromLogic(this.farmState);
  }

  private updateFarmContextPanel(): void {
    const farm = this.farmState;
    const selectedPlot = this.getFarmPlotByKey(this.farmSelectedPlotKey);
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

  private getFarmFeedbackLabel(): string {
    return getFarmFeedbackLabelFromLogic({
      farmError: this.farmError,
      farmCraftingError: this.farmCraftingError,
      farmBusy: this.farmBusy,
      farmCraftingBusy: this.farmCraftingBusy,
      farmFeedbackMessage: this.farmFeedbackMessage,
      isAuthenticated: this.isAuthenticated,
      farmUnlocked: Boolean(this.farmState?.unlocked),
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
    const modeChanged = this.frontSceneMode !== mode;
    this.frontSceneMode = mode;
    this.hudState.area = mode === 'farm' ? 'Ferme' : 'Village';

    if (mode === 'farm') {
      this.farmFeedbackMessage = feedbackMessage;
      this.villageFeedbackMessage = null;
      this.villageShopPanelOpen = false;
      this.villageShopRenderSignature = '';
      this.player.setPosition(FARM_SCENE_PLAYER_SPAWN.x, FARM_SCENE_PLAYER_SPAWN.y);
    } else {
      this.villageFeedbackMessage = feedbackMessage;
      this.farmFeedbackMessage = null;
      if (modeChanged) {
        this.villageShopPanelOpen = false;
        this.villageShopRenderSignature = '';
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
    if (this.frontSceneMode !== 'village' || this.isTypingInsideField()) {
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

    const zone = this.getVillageZoneByKey(targetKey ?? this.villageSelectedZoneKey);
    if (!zone) {
      this.villageFeedbackMessage = 'Selectionne une zone du village.';
      this.updateHud();
      return;
    }

    this.setVillageSelectedZone(zone.key, false);
    const interactionState = this.getVillageZoneInteractionState(zone);
    if (!interactionState.enabled) {
      this.villageFeedbackMessage = interactionState.reason;
      this.updateHud();
      return;
    }

    const shopInteraction = zone.actionKey === 'open-market' || zone.actionKey === 'open-forge';
    if (!shopInteraction && this.villageShopPanelOpen) {
      this.villageShopPanelOpen = false;
      this.villageShopRenderSignature = '';
    }

    if (zone.actionKey === 'open-market') {
      this.openVillageShopPanel('market', 'Marche du village ouvert: mode achat/vente actif.');
      return;
    }

    if (zone.actionKey === 'open-forge') {
      this.openVillageShopPanel('forge', 'Forge ouverte: compare les categories avant achat.');
      return;
    }

    if (zone.actionKey === 'talk-mayor') {
      await this.interactVillageNpc('mayor');
      if (!this.villageNpcError) {
        this.villageFeedbackMessage = 'Discussion tenue avec le Maire.';
      }
      this.updateHud();
      return;
    }

    if (zone.actionKey === 'talk-merchant') {
      await this.interactVillageNpc('merchant');
      if (!this.villageNpcError) {
        this.villageFeedbackMessage = 'Discussion tenue avec la Marchande.';
      }
      this.updateHud();
      return;
    }

    if (zone.actionKey === 'talk-blacksmith') {
      await this.interactVillageNpc('blacksmith');
      if (!this.villageNpcError) {
        this.villageFeedbackMessage = 'Discussion tenue avec le Forgeron.';
      }
      this.updateHud();
      return;
    }

    if (zone.actionKey === 'talk-secondary') {
      this.villageFeedbackMessage = this.getVillageSecondaryDialogue();
      this.updateHud();
      return;
    }

    if (zone.actionKey === 'go-farm') {
      this.setFrontSceneMode('farm', 'Retour a la ferme confirme. La boucle reprend.');
      return;
    }

    this.villageFeedbackMessage = 'La route vers la Tour est lisible. L entree jouable arrive au lot 4.';
    this.updateHud();
  }

  private getVillageSecondaryDialogue(): string {
    return getVillageSecondaryDialogueFromLogic({
      isAuthenticated: this.isAuthenticated,
      towerHighestFloor: this.hudState.towerHighestFloor,
    });
  }

  private handleFarmHotkeys(): void {
    if (this.isTypingInsideField()) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.farmHotkeys.craft)) {
      this.toggleFarmCraftingPanel();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.farmHotkeys.sleep)) {
      void this.sleepAtFarm();
      return;
    }

    const plotKey = this.farmSelectedPlotKey;
    if (!plotKey) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.farmHotkeys.plant)) {
      void this.plantFarmPlot(plotKey);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.farmHotkeys.water)) {
      void this.waterFarmPlot(plotKey);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.farmHotkeys.harvest)) {
      void this.harvestFarmPlot(plotKey);
    }
  }

  private isTypingInsideField(): boolean {
    const active = document.activeElement;
    if (!active) {
      return false;
    }

    const tagName = active.tagName.toUpperCase();
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
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

    const layout =
      this.frontSceneMode === 'village'
        ? [
            { x: 286, y: 232, width: 248, height: 170 },
            { x: 1262, y: 238, width: 246, height: 184 },
            { x: 1040, y: 566, width: 272, height: 120 },
            { x: 346, y: 614, width: 126, height: 34 },
            { x: 808, y: 98, width: 264, height: 86 },
            { x: 808, y: 804, width: 286, height: 72 },
            { x: 808, y: 438, width: 232, height: 160 },
          ]
        : [
            { x: 220, y: 235, width: 230, height: 150 },
            { x: 220, y: 432, width: 62, height: 44 },
            { x: 1325, y: 330, width: 120, height: 520 },
            { x: 620, y: 682, width: 760, height: 58 },
          ];

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






