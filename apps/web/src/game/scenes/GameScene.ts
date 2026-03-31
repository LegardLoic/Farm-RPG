import Phaser from 'phaser';
import { API_BASE_URL } from '../../config/env';

type HudState = {
  day: number;
  gold: number;
  level: number;
  xp: number;
  xpToNext: number;
  towerCurrentFloor: number;
  towerHighestFloor: number;
  towerBossFloor10Defeated: boolean;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  area: string;
};

type VillageNpcHudEntry = {
  stateKey: string;
  available: boolean;
};

type VillageNpcRelationshipTier = 'stranger' | 'familiar' | 'trusted' | 'ally';
type VillageNpcKey = 'mayor' | 'blacksmith' | 'merchant';

type VillageNpcRelationshipHudEntry = {
  friendship: number;
  tier: VillageNpcRelationshipTier;
  lastInteractionDay: number | null;
  canTalkToday: boolean;
};

type VillageNpcHudState = {
  mayor: VillageNpcHudEntry;
  blacksmith: VillageNpcHudEntry;
  merchant: VillageNpcHudEntry;
};

type VillageNpcRelationshipHudState = {
  mayor: VillageNpcRelationshipHudEntry;
  blacksmith: VillageNpcRelationshipHudEntry;
  merchant: VillageNpcRelationshipHudEntry;
};

type CombatStatus = 'active' | 'won' | 'lost' | 'fled';
type CombatTurn = 'player' | 'enemy';
type CombatUiStatus = CombatStatus | 'idle' | 'loading' | 'error';
type CombatActionName =
  | 'attack'
  | 'defend'
  | 'fireball'
  | 'rally'
  | 'sunder'
  | 'mend'
  | 'cleanse'
  | 'interrupt';
type QuestStatus = 'active' | 'completed' | 'claimed';
type DebugQaActionName =
  | 'grant-resources'
  | 'set-tower-floor'
  | 'apply-state-preset'
  | 'apply-loadout-preset'
  | 'complete-quests'
  | 'set-world-flags'
  | 'set-quest-status';
type DebugLoadoutPresetKey = 'starter' | 'tower_mid' | 'boss_trial';
type DebugStatePresetKey = 'village_open' | 'mid_tower' | 'act1_done';
type DebugQaStatus = 'idle' | 'loading' | 'success' | 'error';
type DebugQaRecapOutcomeFilter = 'all' | CombatStatus;
type CombatEffectTone = 'neutral' | 'calm' | 'warning' | 'danger' | 'utility';
type DebugQaReplayAutoPlaySpeedKey = 'slow' | 'normal' | 'fast';
type StripCalibrationPresetKey = 'manifest' | 'snappy' | 'cinematic';

type CombatDebugPlayerSkillSummary = {
  key: CombatActionName;
  label: string;
  manaCost: number;
  blockedBySilence: boolean;
  description: string;
};

type CombatDebugEnemySummary = {
  key: string;
  name: string;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  scriptedFloor: number | null;
  scriptedBossEncounter: boolean;
};

type CombatDebugEnemyIntentSummary = {
  key: string;
  label: string;
  interruptible: boolean;
  trigger: string;
};

type CombatDebugEnemyScriptSummary = {
  enemyKey: string;
  enemyName: string;
  scriptedFloor: number | null;
  scriptedBossEncounter: boolean;
  intents: CombatDebugEnemyIntentSummary[];
};

type CombatDebugReference = {
  playerSkills: CombatDebugPlayerSkillSummary[];
  enemies: CombatDebugEnemySummary[];
  scriptedFloors: Array<{
    floor: number;
    enemyKey: string;
    enemyName: string;
    scriptedBossEncounter: boolean;
  }>;
  scriptedIntents: CombatDebugEnemyScriptSummary[];
};

const FIREBALL_MANA_COST = 5;
const RALLY_MANA_COST = 3;
const SUNDER_MANA_COST = 4;
const MEND_MANA_COST = 3;
const CLEANSE_MANA_COST = 3;
const INTERRUPT_MANA_COST = 4;

type CombatUnitState = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  defending: boolean;
};

type CombatEnemyState = {
  key: string;
  name: string;
  hp: number;
  mp: number;
  currentHp: number;
  currentMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
};

type CombatRewardItem = {
  itemKey: string;
  quantity: number;
  rarity: string;
  source: string;
};

type CombatRewardSummary = {
  experience: number;
  gold: number;
  items: CombatRewardItem[];
  levelBefore: number;
  levelAfter: number;
};

type CombatDefeatPenaltySummary = {
  goldLossPercent: number;
  goldLost: number;
  itemsLost: Array<{ itemKey: string; quantity: number }>;
  respawnZone: string;
  respawnDay: number;
  playerHpAfterDefeat: number;
};

type CombatEncounterRecap = {
  outcome: CombatStatus;
  rounds: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  mpSpent: number;
  mpRecovered: number;
  poisonApplied: number;
  ceciteApplied: number;
  obscuriteApplied: number;
  debuffsCleansed: number;
  blindMisses: number;
  rewards: {
    experience: number;
    gold: number;
    lootItems: number;
  };
  penalties: {
    goldLost: number;
    itemsLost: number;
  };
};

type CombatEncounterState = {
  id: string;
  status: CombatStatus;
  turn: CombatTurn;
  round: number;
  logs: string[];
  scriptState?: Record<string, boolean | number | string>;
  player: CombatUnitState;
  enemy: CombatEnemyState;
  lastAction: string | null;
  rewards?: CombatRewardSummary | null;
  defeatPenalty?: CombatDefeatPenaltySummary | null;
  recap?: CombatEncounterRecap | null;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  endedAt: string | null | undefined;
};

type CombatEffectChip = {
  label: string;
  tone: CombatEffectTone;
};

type SpriteManifest = {
  frameSize: { width: number; height: number };
  origin: { x: number; y: number };
  sprites: Record<string, SpriteManifestSpriteEntry>;
  strips?: Record<string, SpriteManifestStripEntry>;
  portraits?: {
    frameSize?: { width: number; height: number };
    byEnemyKey?: Record<string, string | SpriteManifestPortraitEntry>;
    fallback?: string | SpriteManifestPortraitEntry;
  };
};

type SpriteManifestPortraitState = 'normal' | 'hit' | 'cast';

type SpriteManifestPortraitEntry = {
  key?: string;
  path?: string;
  states?: Partial<Record<SpriteManifestPortraitState, string>>;
};

type SpriteManifestSpriteEntry = {
  key: string;
  path: string;
  scale: { x: number; y: number };
  origin: { x: number; y: number };
  physics: { width: number; height: number; offsetX: number; offsetY: number };
};

type SpriteManifestStripEntry = {
  key: string;
  path: string;
  frameSize: { width: number; height: number };
  frameCount: number;
  animations?: Record<string, number[]>;
  timings?: {
    player?: {
      idleFps?: number;
      hitFps?: number;
      castFps?: number;
      hitDurationMs?: number;
      castDurationMs?: number;
    };
    hud?: {
      idleIntervalMs?: number;
      hitIntervalMs?: number;
      castIntervalMs?: number;
      hitDurationMs?: number;
      castDurationMs?: number;
    };
  };
  scale?: { x: number; y: number };
  origin?: { x: number; y: number };
  physics?: { width: number; height: number; offsetX: number; offsetY: number };
};

type QuestObjectiveState = {
  key: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
};

type QuestState = {
  key: string;
  title: string;
  description: string;
  status: QuestStatus;
  canClaim: boolean;
  objectives: QuestObjectiveState[];
};

type BlacksmithOfferState = {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
};

type VillageSeedOfferState = {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
};

type VillageCropBuybackOfferState = {
  itemKey: string;
  name: string;
  description: string;
  goldValue: number;
  ownedQuantity: number;
};

type FarmCropCatalogEntryState = {
  cropKey: string;
  seedItemKey: string;
  harvestItemKey: string;
  growthDays: number;
  requiredFlags: string[];
  unlocked: boolean;
};

type FarmPlotState = {
  plotKey: string;
  row: number;
  col: number;
  cropKey: string | null;
  plantedDay: number | null;
  growthDays: number | null;
  wateredToday: boolean;
  growthProgressDays: number;
  daysToMaturity: number | null;
  readyToHarvest: boolean;
};

type FarmState = {
  unlocked: boolean;
  totalPlots: number;
  plantedPlots: number;
  wateredPlots: number;
  readyPlots: number;
  cropCatalog: FarmCropCatalogEntryState[];
  plots: FarmPlotState[];
};

type FarmCraftIngredientState = {
  itemKey: string;
  requiredQuantity: number;
  ownedQuantity: number;
};

type FarmCraftRecipeState = {
  recipeKey: string;
  name: string;
  description: string;
  outputItemKey: string;
  outputQuantity: number;
  requiredFlags: string[];
  unlocked: boolean;
  ingredients: FarmCraftIngredientState[];
  maxCraftable: number;
};

type FarmCraftingState = {
  unlocked: boolean;
  recipes: FarmCraftRecipeState[];
  craftableRecipes: number;
};

type AutoSaveState = {
  version: number;
  reason: string;
  updatedAt: string;
};

type SaveSlotState = {
  slot: number;
  exists: boolean;
  version: number | null;
  label: string | null;
  updatedAt: string | null;
  preview: SaveSlotPreview | null;
};

type SaveSlotPreview = {
  playerLevel: number | null;
  gold: number | null;
  towerCurrentFloor: number | null;
  towerHighestFloor: number | null;
  inventoryTop: Array<{ itemKey: string; quantity: number }>;
  equipmentTop: Array<{ slot: string; itemKey: string }>;
  equippedCount: number;
};

type HeroAppearanceKey = 'default' | 'ember' | 'forest' | 'night';

type HeroProfileState = {
  heroName: string;
  appearanceKey: HeroAppearanceKey;
  createdAt: string;
  updatedAt: string;
};

type IntroNarrativeStepKey =
  | 'arrive_village'
  | 'meet_mayor'
  | 'farm_assignment'
  | 'completed';

type IntroNarrativeState = {
  currentStep: IntroNarrativeStepKey;
  completed: boolean;
  steps: {
    arriveVillage: boolean;
    metMayor: boolean;
    farmAssigned: boolean;
  };
};

type DebugQaPresetOption = {
  key: string;
  label: string;
};

type DebugQaTracePayload = {
  timestamp: string;
  frontend: {
    mode: string;
    dev: boolean;
    prod: boolean;
    apiBaseUrl: string;
    locationHref: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
  };
  auth: {
    authenticated: boolean;
    status: string;
  };
  hud: {
    state: HudState;
    summaries: {
      combat: string;
      quests: string;
      blacksmith: string;
      autosave: string;
      saveSlots: string;
    };
  };
  combat: {
    encounterId: string | null;
    status: CombatUiStatus;
    message: string;
    error: string | null;
    telemetry: string;
    logs: string[];
    state: CombatEncounterState | null;
  };
  debugQa: {
    enabled: boolean;
    status: DebugQaStatus;
    busyAction: DebugQaActionName | null;
    message: string | null;
    error: string | null;
    filters: {
      recapOutcome: DebugQaRecapOutcomeFilter;
      recapEnemyQuery: string;
      scriptedEnemyQuery: string;
      scriptedIntentQuery: string;
    };
    scriptedIntentsReference: {
      loaded: boolean;
      enemyProfiles: number;
    };
    replayAutoPlay: {
      active: boolean;
      speed: DebugQaReplayAutoPlaySpeedKey;
      intervalMs: number;
    };
    stripCalibrationPreset: StripCalibrationPresetKey;
  };
};

type ImportedDebugQaTrace = {
  sourceFile: string;
  timestamp: string;
  authAuthenticated: boolean | null;
  authStatus: string | null;
  hudState: Partial<HudState>;
  combatEncounterId: string | null;
  combatStatus: CombatUiStatus | null;
  combatMessage: string | null;
  combatError: string | null;
  combatLogs: string[];
  combatState: CombatEncounterState | null;
};

type StripAnimationName = 'idle' | 'hit' | 'cast';

type HudStripPlaybackState = {
  enemyKey: string;
  stripKey: string;
  animation: StripAnimationName;
  frames: number[];
  frameCount: number;
  frameCursor: number;
};

type DebugQaReplayBaseline = {
  isAuthenticated: boolean;
  authStatus: string;
  hudState: HudState;
  combatEncounterId: string | null;
  combatStatus: CombatUiStatus;
  combatState: CombatEncounterState | null;
  combatLogs: string[];
  combatMessage: string;
  combatError: string | null;
};

type DebugQaStepReplayState = {
  logs: string[];
  stepIndex: number;
  totalSteps: number;
  finalTrace: ImportedDebugQaTrace;
  baseline: DebugQaReplayBaseline;
};

type StripCalibrationPreset = {
  key: StripCalibrationPresetKey;
  label: string;
  playerFpsMultiplier: number;
  playerActionDurationMultiplier: number;
  hudIntervalMultiplier: number;
  hudActionDurationMultiplier: number;
};

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

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private hudRoot: HTMLElement | null = null;
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
  private farmSeedSelect: HTMLSelectElement | null = null;
  private farmSleepButton: HTMLButtonElement | null = null;
  private farmPlotsRoot: HTMLElement | null = null;
  private farmErrorValue: HTMLElement | null = null;
  private farmCraftingSummaryValue: HTMLElement | null = null;
  private farmCraftingListRoot: HTMLElement | null = null;
  private farmCraftingErrorValue: HTMLElement | null = null;
  private villageNpcSummaryValue: HTMLElement | null = null;
  private villageNpcMayorValue: HTMLElement | null = null;
  private villageNpcBlacksmithValue: HTMLElement | null = null;
  private villageNpcMerchantValue: HTMLElement | null = null;
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
  private farmState: FarmState | null = null;
  private farmBusy = false;
  private farmError: string | null = null;
  private farmSelectedSeedItemKey = '';
  private farmRenderSignature = '';
  private farmCraftingState: FarmCraftingState | null = null;
  private farmCraftingBusy = false;
  private farmCraftingError: string | null = null;
  private farmCraftingRenderSignature = '';
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
    const farmAction = button.dataset.farmAction;
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

    if (farmAction === 'sleep') {
      void this.sleepAtFarm();
      return;
    }

    if (farmAction === 'plant' || farmAction === 'water' || farmAction === 'harvest') {
      const plotKey = button.dataset.plotKey;
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
    this.setupPlayer();
    this.setupInput();
    this.setupHud();
    void this.bootstrapSessionState();
    this.setupCamera();
    this.drawDecor();

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
    this.updateGamepadInput();
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

      this.player = this.physics.add.sprite(240, 220, playerStrip.key, firstFrame);
      this.player.setOrigin(playerStrip.origin?.x ?? playerSprite.origin.x, playerStrip.origin?.y ?? playerSprite.origin.y);
      this.player.setScale(playerStrip.scale?.x ?? playerSprite.scale.x, playerStrip.scale?.y ?? playerSprite.scale.y);
      this.player.setCollideWorldBounds(true);
      this.player.setSize(playerStrip.physics?.width ?? playerSprite.physics.width, playerStrip.physics?.height ?? playerSprite.physics.height);
      this.player.setOffset(playerStrip.physics?.offsetX ?? playerSprite.physics.offsetX, playerStrip.physics?.offsetY ?? playerSprite.physics.offsetY);
      this.playerUsesStripAnimation = true;
      this.playPlayerStripAnimation('idle', true);
    } else {
      if (!this.textures.exists(playerSprite.key)) {
        throw new Error(`Player sprite texture not loaded: ${playerSprite.key}`);
      }

      this.player = this.physics.add.sprite(240, 220, playerSprite.key);
      this.player.setOrigin(playerSprite.origin.x, playerSprite.origin.y);
      this.player.setScale(playerSprite.scale.x, playerSprite.scale.y);
      this.player.setCollideWorldBounds(true);
      this.player.setSize(playerSprite.physics.width, playerSprite.physics.height);
      this.player.setOffset(playerSprite.physics.offsetX, playerSprite.physics.offsetY);
      this.playerUsesStripAnimation = false;
    }

    const obstacles = [
      this.createObstacle(360, 220, 84, 28),
      this.createObstacle(510, 260, 36, 96),
      this.createObstacle(890, 180, 120, 34),
      this.createObstacle(1180, 520, 110, 30),
      this.createObstacle(1250, 620, 34, 120),
    ];

    for (const obstacle of obstacles) {
      this.physics.add.collider(this.player, obstacle);
    }
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupHud(): void {
    this.hudRoot = document.getElementById('hud-root');
    if (!this.hudRoot) {
      throw new Error('HUD root not found. Expected #hud-root in index.html.');
    }

    this.hudRoot.innerHTML = `
      <div class="hud-panel">
        <div class="hud-title">Journal de ferme</div>
        <div class="hud-grid">
          <div class="hud-stat"><span>Jour</span><strong data-hud="day"></strong></div>
          <div class="hud-stat"><span>Cycle</span><strong data-hud="dayPhase"></strong></div>
          <div class="hud-stat"><span>Or</span><strong data-hud="gold"></strong></div>
          <div class="hud-stat"><span>Niveau</span><strong data-hud="level"></strong></div>
          <div class="hud-stat"><span>XP</span><strong data-hud="xp"></strong></div>
          <div class="hud-stat"><span>Etage</span><strong data-hud="towerFloor"></strong></div>
          <div class="hud-stat"><span>Boss 10</span><strong data-hud="towerBoss10"></strong></div>
          <div class="hud-stat"><span>Forgeron</span><strong data-hud="blacksmithStatus"></strong></div>
          <div class="hud-stat"><span>PV</span><strong data-hud="hp"></strong></div>
          <div class="hud-stat"><span>PM</span><strong data-hud="mp"></strong></div>
          <div class="hud-stat"><span>Endurance</span><strong data-hud="stamina"></strong></div>
        </div>
        <div class="hud-location">
          <span>Zone</span>
          <strong data-hud="area"></strong>
        </div>
        <div class="hud-auth">
          <span class="hud-auth-status" data-hud="authStatus"></span>
          <div class="hud-auth-actions">
            <button class="hud-auth-button" data-hud-action="login">Connexion Google</button>
            <button class="hud-auth-button secondary" data-hud-action="logout" hidden>Se deconnecter</button>
          </div>
        </div>
        <div class="hud-hero-profile">
          <div class="hud-hero-profile-header">
            <span>Hero</span>
            <strong data-hud="heroProfileSummary">Non cree</strong>
          </div>
          <label class="hud-hero-profile-field">
            <span>Nom du heros</span>
            <input data-hud="heroProfileName" type="text" maxlength="24" placeholder="Arion" autocomplete="off" />
          </label>
          <label class="hud-hero-profile-field">
            <span>Apparence</span>
            <select data-hud="heroProfileAppearance">
              ${HERO_APPEARANCE_OPTIONS.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
            </select>
          </label>
          <div class="hud-hero-profile-actions">
            <button class="hud-hero-profile-button" data-profile-action="save">Creer profil</button>
          </div>
          <div class="hud-hero-profile-message" data-hud="heroProfileMessage" hidden></div>
          <div class="hud-hero-profile-error" data-hud="heroProfileError" hidden></div>
        </div>
        <div class="hud-intro">
          <div class="hud-intro-header">
            <span>Intro scenario</span>
            <strong data-hud="introSummary">Connexion requise</strong>
          </div>
          <p class="hud-intro-narrative" data-hud="introNarrative">Connecte toi pour lancer la sequence d'intro.</p>
          <p class="hud-intro-hint" data-hud="introHint">MVP: arrivee au village, rencontre du maire, attribution de la ferme.</p>
          <div class="hud-intro-actions">
            <button class="hud-intro-button" data-intro-action="advance">Continuer intro</button>
          </div>
          <p class="hud-intro-progress" data-hud="introProgress">Progression: 0/3</p>
          <div class="hud-intro-error" data-hud="introError" hidden></div>
        </div>
        <div class="hud-combat">
          <div class="hud-combat-header">
            <div>
              <div class="hud-combat-kicker">Combat tour par tour</div>
              <div class="hud-combat-name" data-hud="combatName">Aucun combat actif</div>
            </div>
            <div class="hud-combat-status" data-hud="combatStatus"></div>
          </div>
          <div class="hud-combat-meta">
            <div class="hud-combat-stat"><span>Encounter</span><strong data-hud="combatEncounterId">-</strong></div>
            <div class="hud-combat-stat"><span>Tour</span><strong data-hud="combatTurn">-</strong></div>
            <div class="hud-combat-stat"><span>Round</span><strong data-hud="combatRound">-</strong></div>
            <div class="hud-combat-stat"><span>Resultat</span><strong data-hud="combatResult">Aucun combat actif.</strong></div>
          </div>
          <div class="hud-combat-recap" data-hud="combatRecap">Recap: -</div>
          <div class="hud-combat-grid">
            <div class="combat-card">
              <span>Player</span>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatPlayerHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatPlayerMp">-</strong></div>
              <div class="combat-card-line"><span>Effects</span><strong data-hud="combatPlayerEffects">-</strong></div>
            </div>
            <div class="combat-card enemy">
              <span>Enemy</span>
              <div class="combat-enemy-visual">
                <div class="combat-enemy-strip" data-hud="combatEnemyStrip" hidden></div>
                <img data-hud="combatEnemySprite" alt="Enemy sprite" hidden />
                <span data-hud="combatEnemySpriteFallback">No enemy</span>
              </div>
              <div class="combat-card-line"><span>Name</span><strong data-hud="combatEnemyName">-</strong></div>
              <div class="combat-card-line"><span>HP</span><strong data-hud="combatEnemyHp">-</strong></div>
              <div class="combat-card-line"><span>MP</span><strong data-hud="combatEnemyMp">-</strong></div>
              <div class="combat-card-line"><span>Effects</span><strong data-hud="combatEnemyEffects">-</strong></div>
              <div class="combat-card-line"><span>Telemetry</span><strong data-hud="combatTelemetry">-</strong></div>
              <div class="combat-card-line"><span>Intent</span><strong data-hud="combatEnemyIntent">-</strong></div>
              <div class="combat-card-line"><span>Next</span><strong data-hud="combatEnemyIntentNext">-</strong></div>
            </div>
          </div>
          <div class="hud-intent-help">
            <button type="button" class="hud-intent-help-trigger" aria-label="Aide tags intent">
              ? Tags Intent
            </button>
            <div class="hud-intent-help-popover" role="note">
              <div class="hud-intent-help-line"><strong>ATK</strong><span>attaque physique</span></div>
              <div class="hud-intent-help-line"><strong>MAG</strong><span>attaque magique</span></div>
              <div class="hud-intent-help-line"><strong>CLN</strong><span>retire un debuff ennemi</span></div>
              <div class="hud-intent-help-line"><strong>DSP</strong><span>retire un buff joueur</span></div>
              <div class="hud-intent-help-line"><strong>ULT</strong><span>attaque ultime</span></div>
            </div>
          </div>
          <div class="hud-loot-legend" aria-label="Legende des raretes de loot">
            <div class="hud-loot-legend-header">
              <span>Raretés loot</span>
              <strong>Code couleur</strong>
            </div>
            <div class="hud-loot-legend-pills" role="list">
              <span class="loot-rarity-pill" data-rarity="common" role="listitem">Common</span>
              <span class="loot-rarity-pill" data-rarity="uncommon" role="listitem">Uncommon</span>
              <span class="loot-rarity-pill" data-rarity="rare" role="listitem">Rare</span>
              <span class="loot-rarity-pill" data-rarity="epic" role="listitem">Epic</span>
              <span class="loot-rarity-pill" data-rarity="legendary" role="listitem">Legendary</span>
            </div>
          </div>
          <div class="hud-combat-actions">
            <button class="hud-combat-button primary" data-combat-action="start">Demarrer combat</button>
            <button class="hud-combat-button" data-combat-action="attack">Attack</button>
            <button class="hud-combat-button secondary" data-combat-action="defend">Defend</button>
            <button class="hud-combat-button" data-combat-action="fireball">Fireball</button>
            <button class="hud-combat-button secondary" data-combat-action="mend">Mend (+HP)</button>
            <button class="hud-combat-button secondary" data-combat-action="cleanse">Cleanse</button>
            <button class="hud-combat-button" data-combat-action="interrupt">Interrupt</button>
            <button class="hud-combat-button secondary" data-combat-action="rally">Rally (+Atk)</button>
            <button class="hud-combat-button" data-combat-action="sunder">Sunder (-Def)</button>
            <button class="hud-combat-button danger" data-combat-action="forfeit">Fuir</button>
          </div>
          <div class="hud-combat-error" data-hud="combatError" hidden></div>
          <ul class="hud-combat-log" data-hud="combatLogs"></ul>
        </div>
        <div class="hud-quests">
          <div class="hud-quests-header">
            <span>Quests</span>
            <strong data-hud="questsSummary">No quests loaded.</strong>
          </div>
          <div class="hud-quests-error" data-hud="questsError" hidden></div>
          <ul class="hud-quests-list" data-hud="questsList"></ul>
        </div>
        <div class="hud-village-npcs">
          <div class="hud-village-npcs-header">
            <span>Village PNJ</span>
            <strong data-hud="villageNpcSummary">3 etats suivis</strong>
          </div>
          <div class="hud-village-npc-error" data-hud="villageNpcError" hidden></div>
          <div class="hud-village-npc-grid">
            <div class="hud-village-npc-line">
              <span>Maire</span>
              <div class="hud-village-npc-actions">
                <strong data-hud="villageNpcMayor">-</strong>
                <button class="hud-village-npc-button" data-village-npc-action="talk" data-npc-key="mayor">
                  Parler
                </button>
              </div>
            </div>
            <div class="hud-village-npc-line">
              <span>Forgeron</span>
              <div class="hud-village-npc-actions">
                <strong data-hud="villageNpcBlacksmith">-</strong>
                <button class="hud-village-npc-button" data-village-npc-action="talk" data-npc-key="blacksmith">
                  Parler
                </button>
              </div>
            </div>
            <div class="hud-village-npc-line">
              <span>Marchand</span>
              <div class="hud-village-npc-actions">
                <strong data-hud="villageNpcMerchant">-</strong>
                <button class="hud-village-npc-button" data-village-npc-action="talk" data-npc-key="merchant">
                  Parler
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="hud-blacksmith">
          <div class="hud-blacksmith-header">
            <span>Blacksmith Shop</span>
            <strong data-hud="blacksmithSummary">Locked</strong>
          </div>
          <div class="hud-blacksmith-error" data-hud="blacksmithError" hidden></div>
          <ul class="hud-blacksmith-list" data-hud="blacksmithOffers"></ul>
        </div>
        <div class="hud-village-market">
          <div class="hud-village-market-header">
            <span>Village Market</span>
            <strong data-hud="villageMarketSummary">Locked</strong>
          </div>
          <div class="hud-village-market-error" data-hud="villageMarketError" hidden></div>
          <p class="hud-village-market-subtitle">Seeds</p>
          <ul class="hud-village-market-list" data-hud="villageMarketSeedOffers"></ul>
          <p class="hud-village-market-subtitle">Crop Buyback</p>
          <ul class="hud-village-market-list" data-hud="villageMarketBuybackOffers"></ul>
        </div>
        <div class="hud-farm">
          <div class="hud-farm-header">
            <span>Farm Plots</span>
            <strong data-hud="farmSummary">Locked</strong>
          </div>
          <div class="hud-farm-controls">
            <label class="hud-farm-field">
              <span>Selected seed</span>
              <select data-hud="farmSeedSelect"></select>
            </label>
            <div class="hud-farm-actions">
              <button class="hud-farm-action sleep" data-farm-action="sleep">Sleep (+1 day)</button>
            </div>
          </div>
          <div class="hud-farm-error" data-hud="farmError" hidden></div>
          <ul class="hud-farm-plots" data-hud="farmPlots"></ul>
        </div>
        <div class="hud-farm-crafting">
          <div class="hud-farm-crafting-header">
            <span>Farm Crafting</span>
            <strong data-hud="farmCraftingSummary">Locked</strong>
          </div>
          <div class="hud-farm-crafting-error" data-hud="farmCraftingError" hidden></div>
          <ul class="hud-farm-crafting-list" data-hud="farmCraftingRecipes"></ul>
        </div>
        <div class="hud-autosave">
          <div class="hud-autosave-header">
            <span>Autosave</span>
            <strong data-hud="autosaveSummary">No autosave</strong>
          </div>
          <div class="hud-autosave-meta" data-hud="autosaveMeta">-</div>
          <div class="hud-autosave-error" data-hud="autosaveError" hidden></div>
          <div class="hud-autosave-actions" data-hud="autosaveActions"></div>
        </div>
        <div class="hud-saves">
          <div class="hud-saves-header">
            <span>Save Slots</span>
            <strong data-hud="savesSummary">No slot data</strong>
          </div>
          <div class="hud-saves-error" data-hud="savesError" hidden></div>
          <ul class="hud-saves-list" data-hud="savesList"></ul>
        </div>
        ${
          this.debugQaEnabled
            ? `
        <div class="hud-debug-qa">
          <div class="hud-debug-qa-header">
            <span>Debug QA</span>
            <strong data-hud="debugQaStatus">Idle</strong>
          </div>
          <div class="hud-debug-qa-message" data-hud="debugQaMessage" hidden></div>
          <div class="hud-debug-qa-grid">
            <label class="hud-debug-qa-field">
              <span>Grant XP</span>
              <input data-hud="debugQaXp" type="number" min="0" step="10" value="250" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Grant Gold</span>
              <input data-hud="debugQaGold" type="number" min="0" step="10" value="500" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Tower Floor</span>
              <input data-hud="debugQaFloor" type="number" min="1" max="10" step="1" value="10" />
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>State preset</span>
              <select data-hud="debugQaStatePreset">
                ${DEBUG_QA_STATE_PRESET_OPTIONS.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Quest key</span>
              <input data-hud="debugQaQuestKey" type="text" placeholder="story_floor_8" value="story_floor_8" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Quest status</span>
              <select data-hud="debugQaQuestStatus">
                ${DEBUG_QA_QUEST_STATUS_OPTIONS.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Loadout preset</span>
              <select data-hud="debugQaLoadout">
                ${DEBUG_QA_PRESET_OPTIONS.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>World flags (add)</span>
              <textarea
                data-hud="debugQaWorldFlags"
                rows="2"
                placeholder="blacksmith_shop_tier_1_unlocked, story_floor_8_cleared"
              ></textarea>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>World flags (remove)</span>
              <textarea
                data-hud="debugQaWorldFlagsRemove"
                rows="2"
                placeholder="blacksmith_curse_lifted"
              ></textarea>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide hud-debug-qa-toggle">
              <span>Replace all flags</span>
              <input data-hud="debugQaWorldFlagsReplace" type="checkbox" />
            </label>
            <label class="hud-debug-qa-field">
              <span>Step replay speed</span>
              <select data-hud="debugQaReplayAutoPlaySpeed">
                ${DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field">
              <span>Recap outcome filter</span>
              <select data-hud="debugQaRecapOutcomeFilter">
                ${DEBUG_QA_RECAP_OUTCOME_FILTER_OPTIONS.map((option) => `<option value="${option.key}">${option.label}</option>`).join('')}
              </select>
            </label>
            <label class="hud-debug-qa-field debug-qa-field-wide">
              <span>Recap enemy filter</span>
              <input data-hud="debugQaRecapEnemyFilter" type="text" placeholder="enemy key or enemy name" />
            </label>
            ${
              this.stripCalibrationEnabled
                ? `
            <label class="hud-debug-qa-field">
              <span>Strip calibration</span>
              <select data-hud="debugQaStripCalibrationPreset">
                ${STRIP_CALIBRATION_PRESETS.map((preset) => `<option value="${preset.key}">${preset.label}</option>`).join('')}
              </select>
            </label>
            `
                : ''
            }
          </div>
          <div class="hud-debug-qa-reference">
            <div class="hud-debug-qa-reference-header">
              <span>Combat scripted intents</span>
              <button class="hud-debug-qa-button secondary" data-debug-action="load-scripted-intents">Load reference</button>
            </div>
            <div class="hud-debug-qa-reference-filters">
              <label class="hud-debug-qa-field">
                <span>Script enemy filter</span>
                <input data-hud="debugQaScriptEnemyFilter" type="text" placeholder="enemy key or enemy name" />
              </label>
              <label class="hud-debug-qa-field">
                <span>Script intent filter</span>
                <input data-hud="debugQaScriptIntentFilter" type="text" placeholder="intent key, label or trigger" />
              </label>
            </div>
            <pre class="hud-debug-qa-reference-output" data-hud="debugQaScriptedIntents">Click "Load reference" to inspect the combat script QA payload.</pre>
          </div>
          <div class="hud-debug-qa-actions">
            <button class="hud-debug-qa-button" data-debug-action="grant-resources">Grant resources</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-tower-floor">Set tower floor</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="apply-state-preset">Apply state preset</button>
            <button class="hud-debug-qa-button" data-debug-action="apply-loadout-preset">Apply loadout</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="complete-quests">Complete quests</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-world-flags">Set world flags</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="set-quest-status">Set quest status</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="import-trace">Import JSON trace</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace">Replay imported trace</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-start">Start step replay</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-next">Next step</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-autoplay">Start auto-play</button>
            <button class="hud-debug-qa-button secondary" data-debug-action="replay-trace-step-stop">Stop step replay</button>
            ${
              this.stripCalibrationEnabled
                ? `
            <button class="hud-debug-qa-button secondary" data-debug-action="apply-strip-calibration">Apply strip calibration</button>
              `
                : ''
            }
            <button class="hud-debug-qa-button export" data-debug-action="export-trace" title="Export a local JSON trace of the current QA state">
              Export JSON trace
            </button>
            <button class="hud-debug-qa-button export markdown" data-debug-action="export-markdown" title="Export markdown recap + scripted intents using active filters">
              Export Markdown recap
            </button>
            <input data-hud="debugQaImportFile" type="file" accept=".json,application/json" hidden />
          </div>
        </div>
            `
            : ''
        }
        <div class="hud-help">
          Deplacement: fleches ou ZQSD
          <br />
          Manette: D-pad/LB/RB navigue HUD, A valide, X Attack, Y Defend, B Fireball.
          <br />
          Prototype: ferme, village et tour a venir
        </div>
      </div>
    `;

    this.loginButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-hud-action="login"]');
    this.logoutButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-hud-action="logout"]');
    this.combatStartButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="start"]');
    this.combatAttackButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="attack"]');
    this.combatDefendButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="defend"]');
    this.combatFireballButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="fireball"]');
    this.combatMendButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="mend"]');
    this.combatCleanseButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="cleanse"]');
    this.combatInterruptButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="interrupt"]');
    this.combatRallyButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="rally"]');
    this.combatSunderButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="sunder"]');
    this.combatForfeitButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-combat-action="forfeit"]');
    this.combatLogsList = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatLogs"]');
    this.combatStatusBadge = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatStatus"]');
    this.combatErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="combatError"]');
    this.questsSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="questsSummary"]');
    this.questsListRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="questsList"]');
    this.questsErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="questsError"]');
    this.blacksmithSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="blacksmithSummary"]');
    this.blacksmithOffersRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="blacksmithOffers"]');
    this.blacksmithErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="blacksmithError"]');
    this.villageMarketSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageMarketSummary"]');
    this.villageMarketSeedsRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageMarketSeedOffers"]');
    this.villageMarketBuybackRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageMarketBuybackOffers"]');
    this.villageMarketErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageMarketError"]');
    this.farmSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="farmSummary"]');
    this.farmSeedSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="farmSeedSelect"]');
    this.farmSleepButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-farm-action="sleep"]');
    this.farmPlotsRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="farmPlots"]');
    this.farmErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="farmError"]');
    this.farmCraftingSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="farmCraftingSummary"]');
    this.farmCraftingListRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="farmCraftingRecipes"]');
    this.farmCraftingErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="farmCraftingError"]');
    this.villageNpcSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageNpcSummary"]');
    this.villageNpcMayorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageNpcMayor"]');
    this.villageNpcBlacksmithValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageNpcBlacksmith"]');
    this.villageNpcMerchantValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageNpcMerchant"]');
    this.villageNpcErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="villageNpcError"]');
    this.villageNpcTalkMayorButton = this.hudRoot.querySelector<HTMLButtonElement>(
      '[data-village-npc-action="talk"][data-npc-key="mayor"]',
    );
    this.villageNpcTalkBlacksmithButton = this.hudRoot.querySelector<HTMLButtonElement>(
      '[data-village-npc-action="talk"][data-npc-key="blacksmith"]',
    );
    this.villageNpcTalkMerchantButton = this.hudRoot.querySelector<HTMLButtonElement>(
      '[data-village-npc-action="talk"][data-npc-key="merchant"]',
    );
    this.autosaveSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveSummary"]');
    this.autosaveMetaValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveMeta"]');
    this.autosaveActionsRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveActions"]');
    this.autosaveErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="autosaveError"]');
    this.saveSlotsSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="savesSummary"]');
    this.saveSlotsListRoot = this.hudRoot.querySelector<HTMLElement>('[data-hud="savesList"]');
    this.saveSlotsErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="savesError"]');
    this.heroProfileSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="heroProfileSummary"]');
    this.heroProfileNameInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="heroProfileName"]');
    this.heroProfileAppearanceSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="heroProfileAppearance"]');
    this.heroProfileSaveButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-profile-action="save"]');
    this.heroProfileMessageValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="heroProfileMessage"]');
    this.heroProfileErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="heroProfileError"]');
    this.introSummaryValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="introSummary"]');
    this.introNarrativeValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="introNarrative"]');
    this.introHintValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="introHint"]');
    this.introProgressValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="introProgress"]');
    this.introAdvanceButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-intro-action="advance"]');
    this.introErrorValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="introError"]');
    this.debugQaPanelRoot = this.hudRoot.querySelector<HTMLElement>('.hud-debug-qa');
    this.debugQaStatusValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="debugQaStatus"]');
    this.debugQaMessageValue = this.hudRoot.querySelector<HTMLElement>('[data-hud="debugQaMessage"]');
    this.debugQaGrantXpInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaXp"]');
    this.debugQaGrantGoldInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaGold"]');
    this.debugQaTowerFloorInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaFloor"]');
    this.debugQaStatePresetSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaStatePreset"]');
    this.debugQaQuestKeyInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaQuestKey"]');
    this.debugQaQuestStatusSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaQuestStatus"]');
    this.debugQaLoadoutPresetSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaLoadout"]');
    this.debugQaWorldFlagsInput = this.hudRoot.querySelector<HTMLTextAreaElement>('[data-hud="debugQaWorldFlags"]');
    this.debugQaWorldFlagsRemoveInput = this.hudRoot.querySelector<HTMLTextAreaElement>('[data-hud="debugQaWorldFlagsRemove"]');
    this.debugQaWorldFlagsReplaceInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaWorldFlagsReplace"]');
    this.debugQaReplayAutoPlaySpeedSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaReplayAutoPlaySpeed"]');
    this.debugQaRecapOutcomeFilterSelect = this.hudRoot.querySelector<HTMLSelectElement>(
      '[data-hud="debugQaRecapOutcomeFilter"]',
    );
    this.debugQaRecapEnemyFilterInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaRecapEnemyFilter"]');
    this.debugQaStripCalibrationSelect = this.hudRoot.querySelector<HTMLSelectElement>('[data-hud="debugQaStripCalibrationPreset"]');
    this.debugQaScriptedIntentsButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="load-scripted-intents"]');
    this.debugQaScriptedIntentsOutput = this.hudRoot.querySelector<HTMLElement>('[data-hud="debugQaScriptedIntents"]');
    this.debugQaScriptEnemyFilterInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaScriptEnemyFilter"]');
    this.debugQaScriptIntentFilterInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaScriptIntentFilter"]');
    this.debugQaGrantButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="grant-resources"]');
    this.debugQaTowerFloorButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="set-tower-floor"]');
    this.debugQaStatePresetButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="apply-state-preset"]');
    this.debugQaSetQuestStatusButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="set-quest-status"]');
    this.debugQaLoadoutButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="apply-loadout-preset"]');
    this.debugQaCompleteQuestsButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="complete-quests"]');
    this.debugQaSetWorldFlagsButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="set-world-flags"]');
    this.debugQaImportButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="import-trace"]');
    this.debugQaReplayButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="replay-trace"]');
    this.debugQaReplayStepStartButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="replay-trace-step-start"]');
    this.debugQaReplayStepNextButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="replay-trace-step-next"]');
    this.debugQaReplayAutoPlayButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="replay-trace-step-autoplay"]');
    this.debugQaReplayStepStopButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="replay-trace-step-stop"]');
    this.debugQaStripCalibrationButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="apply-strip-calibration"]');
    this.debugQaImportFileInput = this.hudRoot.querySelector<HTMLInputElement>('[data-hud="debugQaImportFile"]');
    this.debugQaExportButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="export-trace"]');
    this.debugQaExportMarkdownButton = this.hudRoot.querySelector<HTMLButtonElement>('[data-debug-action="export-markdown"]');
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
    this.updateHud();
  }

  private teardownHud(): void {
    this.stopDebugQaStepReplay(false);

    if (this.playerStripActionTimer) {
      this.playerStripActionTimer.remove(false);
      this.playerStripActionTimer = null;
    }
    this.stopEnemyHudStripPlayback();
    this.clearEnemyHudStripOverride();
    this.resetGamepadInputState();

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

    this.loginButton = null;
    this.logoutButton = null;
    this.combatStartButton = null;
    this.combatAttackButton = null;
    this.combatDefendButton = null;
    this.combatFireballButton = null;
    this.combatMendButton = null;
    this.combatCleanseButton = null;
    this.combatInterruptButton = null;
    this.combatRallyButton = null;
    this.combatSunderButton = null;
    this.combatForfeitButton = null;
    this.combatLogsList = null;
    this.combatStatusBadge = null;
    this.combatErrorValue = null;
    this.questsSummaryValue = null;
    this.questsListRoot = null;
    this.questsErrorValue = null;
    this.blacksmithSummaryValue = null;
    this.blacksmithOffersRoot = null;
    this.blacksmithErrorValue = null;
    this.villageMarketSummaryValue = null;
    this.villageMarketSeedsRoot = null;
    this.villageMarketBuybackRoot = null;
    this.villageMarketErrorValue = null;
    this.farmSummaryValue = null;
    this.farmSeedSelect = null;
    this.farmSleepButton = null;
    this.farmPlotsRoot = null;
    this.farmErrorValue = null;
    this.farmCraftingSummaryValue = null;
    this.farmCraftingListRoot = null;
    this.farmCraftingErrorValue = null;
    this.villageNpcSummaryValue = null;
    this.villageNpcMayorValue = null;
    this.villageNpcBlacksmithValue = null;
    this.villageNpcMerchantValue = null;
    this.villageNpcErrorValue = null;
    this.villageNpcTalkMayorButton = null;
    this.villageNpcTalkBlacksmithButton = null;
    this.villageNpcTalkMerchantButton = null;
    this.autosaveSummaryValue = null;
    this.autosaveMetaValue = null;
    this.autosaveActionsRoot = null;
    this.autosaveErrorValue = null;
    this.saveSlotsSummaryValue = null;
    this.saveSlotsListRoot = null;
    this.saveSlotsErrorValue = null;
    this.heroProfileSummaryValue = null;
    this.heroProfileNameInput = null;
    this.heroProfileAppearanceSelect = null;
    this.heroProfileSaveButton = null;
    this.heroProfileMessageValue = null;
    this.heroProfileErrorValue = null;
    this.introSummaryValue = null;
    this.introNarrativeValue = null;
    this.introHintValue = null;
    this.introProgressValue = null;
    this.introAdvanceButton = null;
    this.introErrorValue = null;
    this.debugQaPanelRoot = null;
    this.debugQaStatusValue = null;
    this.debugQaMessageValue = null;
    this.debugQaGrantXpInput = null;
    this.debugQaGrantGoldInput = null;
    this.debugQaTowerFloorInput = null;
    this.debugQaStatePresetSelect = null;
    this.debugQaQuestKeyInput = null;
    this.debugQaQuestStatusSelect = null;
    this.debugQaLoadoutPresetSelect = null;
    this.debugQaWorldFlagsInput = null;
    this.debugQaWorldFlagsRemoveInput = null;
    this.debugQaWorldFlagsReplaceInput = null;
    this.debugQaReplayAutoPlaySpeedSelect = null;
    this.debugQaRecapOutcomeFilterSelect = null;
    this.debugQaRecapEnemyFilterInput = null;
    this.debugQaStripCalibrationSelect = null;
    this.debugQaGrantButton = null;
    this.debugQaTowerFloorButton = null;
    this.debugQaStatePresetButton = null;
    this.debugQaSetQuestStatusButton = null;
    this.debugQaLoadoutButton = null;
    this.debugQaCompleteQuestsButton = null;
    this.debugQaSetWorldFlagsButton = null;
    this.debugQaImportButton = null;
    this.debugQaReplayButton = null;
    this.debugQaReplayStepStartButton = null;
    this.debugQaReplayStepNextButton = null;
    this.debugQaReplayAutoPlayButton = null;
    this.debugQaReplayStepStopButton = null;
    this.debugQaStripCalibrationButton = null;
    this.debugQaScriptedIntentsButton = null;
    this.debugQaScriptedIntentsOutput = null;
    this.debugQaScriptEnemyFilterInput = null;
    this.debugQaScriptIntentFilterInput = null;
    this.debugQaImportFileInput = null;
    this.debugQaExportButton = null;
    this.debugQaExportMarkdownButton = null;
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
    this.farmBusy = false;
    this.farmError = null;
    this.farmSelectedSeedItemKey = '';
    this.farmCraftingState = null;
    this.farmCraftingBusy = false;
    this.farmCraftingError = null;
    this.farmCraftingRenderSignature = '';
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

    this.setHudText('day', `Jour ${this.hudState.day}`);
    this.setHudText('dayPhase', this.getDayPhaseLabel());
    this.setHudText('gold', `${this.hudState.gold} po`);
    this.setHudText('level', `${this.hudState.level}`);
    this.setHudText('xp', `${this.hudState.xp} / ${this.hudState.xpToNext}`);
    this.setHudText('towerFloor', `${this.hudState.towerCurrentFloor} (best ${this.hudState.towerHighestFloor})`);
    this.setHudText('towerBoss10', this.hudState.towerBossFloor10Defeated ? 'Defeated' : 'Pending');
    this.setHudText('blacksmithStatus', this.getBlacksmithStatusLabel());
    this.setHudText('hp', `${this.formatValue(this.hudState.hp)} / ${this.formatValue(this.hudState.maxHp)}`);
    this.setHudText('mp', `${this.formatValue(this.hudState.mp)} / ${this.formatValue(this.hudState.maxMp)}`);
    this.setHudText('stamina', `${Math.max(0, Math.round(this.hudState.stamina))} / 8`);
    this.setHudText('area', this.hudState.area);
    this.setHudText('authStatus', this.authStatus);
    this.updateHeroProfileHud();
    this.updateIntroHud();
    this.updateCombatHud();
    this.updateQuestHud();
    this.updateVillageNpcHud();
    this.updateBlacksmithHud();
    this.updateVillageMarketHud();
    this.updateFarmHud();
    this.updateFarmCraftingHud();
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
    if (this.farmSummaryValue) {
      this.farmSummaryValue.textContent = this.getFarmSummaryLabel();
    }

    if (this.farmErrorValue) {
      this.farmErrorValue.hidden = !this.farmError;
      this.farmErrorValue.textContent = this.farmError ?? '';
    }

    if (this.farmSleepButton) {
      const canSleep = Boolean(this.isAuthenticated && this.farmState?.unlocked);
      this.farmSleepButton.disabled = !canSleep || this.farmBusy;
      this.farmSleepButton.textContent = this.farmBusy ? 'Sleeping...' : 'Sleep (+1 day)';
    }

    this.renderFarmPanel();
  }

  private updateFarmCraftingHud(): void {
    if (this.farmCraftingSummaryValue) {
      this.farmCraftingSummaryValue.textContent = this.getFarmCraftingSummaryLabel();
    }

    if (this.farmCraftingErrorValue) {
      this.farmCraftingErrorValue.hidden = !this.farmCraftingError;
      this.farmCraftingErrorValue.textContent = this.farmCraftingError ?? '';
    }

    this.renderFarmCraftingRecipes();
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

    this.blacksmithOffersRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = 'Connect to access the shop.';
      this.blacksmithOffersRoot.appendChild(item);
      return;
    }

    if (!this.hudState.blacksmithUnlocked) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = this.hudState.blacksmithCurseLifted
        ? 'Blacksmith is recovering. Complete progression to unlock the shop.'
        : 'Blacksmith is still cursed.';
      this.blacksmithOffersRoot.appendChild(item);
      return;
    }

    if (this.blacksmithOffers.length === 0) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = this.blacksmithBusy ? 'Loading offers...' : 'No offers available.';
      this.blacksmithOffersRoot.appendChild(item);
      return;
    }

    for (const offer of this.blacksmithOffers) {
      const item = document.createElement('li');
      item.classList.add('shop-item');

      const header = document.createElement('div');
      header.classList.add('shop-item-header');

      const name = document.createElement('strong');
      name.textContent = offer.name;
      header.appendChild(name);

      const price = document.createElement('span');
      price.classList.add('shop-price');
      price.textContent = `${offer.goldPrice}g`;
      header.appendChild(price);

      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('shop-description');
      description.textContent = offer.description;
      item.appendChild(description);

      const buyButton = document.createElement('button');
      buyButton.classList.add('hud-shop-buy');
      buyButton.textContent = `Buy (${offer.goldPrice}g)`;
      buyButton.dataset.shopAction = 'buy';
      buyButton.dataset.offerKey = offer.offerKey;
      buyButton.disabled = this.blacksmithBusy || this.hudState.gold < offer.goldPrice;
      item.appendChild(buyButton);

      this.blacksmithOffersRoot.appendChild(item);
    }
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

    seedsRoot.replaceChildren();
    buybackRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const seedItem = document.createElement('li');
      seedItem.classList.add('shop-item', 'empty');
      seedItem.textContent = 'Connect to access seed offers.';
      seedsRoot.appendChild(seedItem);

      const buybackItem = document.createElement('li');
      buybackItem.classList.add('shop-item', 'empty');
      buybackItem.textContent = 'Connect to access crop buyback.';
      buybackRoot.appendChild(buybackItem);
      return;
    }

    if (!this.villageMarketUnlocked) {
      const lockMessage = this.villageMarketBusy
        ? 'Checking market unlock...'
        : 'Market locked. Progress intro and floor milestones.';

      const seedItem = document.createElement('li');
      seedItem.classList.add('shop-item', 'empty');
      seedItem.textContent = lockMessage;
      seedsRoot.appendChild(seedItem);

      const buybackItem = document.createElement('li');
      buybackItem.classList.add('shop-item', 'empty');
      buybackItem.textContent = 'Crop buyback unavailable while market is locked.';
      buybackRoot.appendChild(buybackItem);
      return;
    }

    if (this.villageMarketSeedOffers.length === 0) {
      const seedItem = document.createElement('li');
      seedItem.classList.add('shop-item', 'empty');
      seedItem.textContent = this.villageMarketBusy ? 'Loading seed offers...' : 'No seed offers available.';
      seedsRoot.appendChild(seedItem);
    } else {
      for (const offer of this.villageMarketSeedOffers) {
        const item = document.createElement('li');
        item.classList.add('shop-item');

        const header = document.createElement('div');
        header.classList.add('shop-item-header');

        const name = document.createElement('strong');
        name.textContent = offer.name;
        header.appendChild(name);

        const price = document.createElement('span');
        price.classList.add('shop-price');
        price.textContent = `${offer.goldPrice}g`;
        header.appendChild(price);
        item.appendChild(header);

        const description = document.createElement('p');
        description.classList.add('shop-description');
        description.textContent = offer.description;
        item.appendChild(description);

        const buyButton = document.createElement('button');
        buyButton.classList.add('hud-shop-buy');
        buyButton.textContent = `Buy x1 (${offer.goldPrice}g)`;
        buyButton.dataset.marketAction = 'buy-seed';
        buyButton.dataset.offerKey = offer.offerKey;
        buyButton.disabled = this.villageMarketBusy || this.hudState.gold < offer.goldPrice;
        item.appendChild(buyButton);

        seedsRoot.appendChild(item);
      }
    }

    if (this.villageMarketBuybackOffers.length === 0) {
      const buybackItem = document.createElement('li');
      buybackItem.classList.add('shop-item', 'empty');
      buybackItem.textContent = this.villageMarketBusy
        ? 'Loading crop buyback offers...'
        : 'No crop buyback offers available.';
      buybackRoot.appendChild(buybackItem);
      return;
    }

    for (const offer of this.villageMarketBuybackOffers) {
      const item = document.createElement('li');
      item.classList.add('shop-item');

      const header = document.createElement('div');
      header.classList.add('shop-item-header');

      const name = document.createElement('strong');
      name.textContent = offer.name;
      header.appendChild(name);

      const price = document.createElement('span');
      price.classList.add('shop-price');
      price.textContent = `Sell ${offer.goldValue}g`;
      header.appendChild(price);
      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('shop-description');
      description.textContent = `${offer.description} | Owned ${offer.ownedQuantity}`;
      item.appendChild(description);

      const sellButton = document.createElement('button');
      sellButton.classList.add('hud-shop-buy');
      sellButton.textContent = `Sell x1 (${offer.goldValue}g)`;
      sellButton.dataset.marketAction = 'sell-crop';
      sellButton.dataset.itemKey = offer.itemKey;
      sellButton.disabled = this.villageMarketBusy || offer.ownedQuantity < 1;
      item.appendChild(sellButton);

      buybackRoot.appendChild(item);
    }
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

    seedSelect.replaceChildren();
    plotsRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Connexion requise';
      seedSelect.appendChild(option);
      seedSelect.value = '';
      seedSelect.disabled = true;

      const item = document.createElement('li');
      item.classList.add('farm-plot-item', 'empty');
      item.textContent = 'Connecte toi pour gerer la ferme.';
      plotsRoot.appendChild(item);
      return;
    }

    const farm = this.farmState;
    if (!farm) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = this.farmBusy ? 'Chargement...' : 'Aucune donnee ferme';
      seedSelect.appendChild(option);
      seedSelect.value = '';
      seedSelect.disabled = true;

      const item = document.createElement('li');
      item.classList.add('farm-plot-item', 'empty');
      item.textContent = this.farmBusy ? 'Chargement des parcelles...' : 'Aucune donnee ferme disponible.';
      plotsRoot.appendChild(item);
      return;
    }

    const unlockedCrops = farm.cropCatalog.filter((entry) => entry.unlocked);
    if (unlockedCrops.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Aucune graine debloquee';
      seedSelect.appendChild(option);
      this.farmSelectedSeedItemKey = '';
    } else {
      const unlockedSeedKeys = new Set(unlockedCrops.map((entry) => entry.seedItemKey));
      if (!unlockedSeedKeys.has(this.farmSelectedSeedItemKey)) {
        const firstUnlocked = unlockedCrops[0];
        this.farmSelectedSeedItemKey = firstUnlocked ? firstUnlocked.seedItemKey : '';
      }

      for (const crop of unlockedCrops) {
        const option = document.createElement('option');
        option.value = crop.seedItemKey;
        option.textContent = `${this.formatFarmLabel(crop.cropKey)} seed (${crop.growthDays}j)`;
        seedSelect.appendChild(option);
      }
    }

    seedSelect.value = this.farmSelectedSeedItemKey;
    seedSelect.disabled = this.farmBusy || !farm.unlocked || unlockedCrops.length === 0;

    if (!farm.unlocked) {
      const item = document.createElement('li');
      item.classList.add('farm-plot-item', 'empty');
      item.textContent = 'Ferme verrouillee. Termine l intro (attribution de ferme).';
      plotsRoot.appendChild(item);
      return;
    }

    if (farm.plots.length === 0) {
      const item = document.createElement('li');
      item.classList.add('farm-plot-item', 'empty');
      item.textContent = this.farmBusy ? 'Chargement des parcelles...' : 'Aucune parcelle configuree.';
      plotsRoot.appendChild(item);
      return;
    }

    const selectedSeedItemKey = this.farmSelectedSeedItemKey;
    const sortedPlots = [...farm.plots].sort((left, right) => (
      left.row - right.row || left.col - right.col || left.plotKey.localeCompare(right.plotKey)
    ));

    for (const plot of sortedPlots) {
      const item = document.createElement('li');
      item.classList.add('farm-plot-item');
      if (plot.readyToHarvest) {
        item.dataset.ready = '1';
      }
      if (!plot.cropKey) {
        item.dataset.empty = '1';
      }

      const header = document.createElement('div');
      header.classList.add('farm-plot-header');

      const title = document.createElement('strong');
      title.textContent = `Parcelle ${plot.row}-${plot.col}`;
      header.appendChild(title);

      const badge = document.createElement('span');
      badge.classList.add('farm-plot-meta');
      badge.textContent = plot.cropKey ? this.formatFarmLabel(plot.cropKey) : 'Vide';
      header.appendChild(badge);
      item.appendChild(header);

      const status = document.createElement('p');
      status.classList.add('farm-plot-status');
      status.textContent = this.getFarmPlotStatusLabel(plot);
      item.appendChild(status);

      const actions = document.createElement('div');
      actions.classList.add('farm-plot-actions');

      const canPlant = !plot.cropKey && selectedSeedItemKey.length > 0;
      const canWater = Boolean(plot.cropKey) && !plot.wateredToday;
      const canHarvest = Boolean(plot.cropKey) && plot.readyToHarvest;

      const plantButton = document.createElement('button');
      plantButton.classList.add('hud-farm-action', 'plant');
      plantButton.dataset.farmAction = 'plant';
      plantButton.dataset.plotKey = plot.plotKey;
      plantButton.textContent = canPlant
        ? `Plant (${this.formatFarmLabel(selectedSeedItemKey)})`
        : 'Plant';
      plantButton.disabled = this.farmBusy || !farm.unlocked || !canPlant;
      actions.appendChild(plantButton);

      const waterButton = document.createElement('button');
      waterButton.classList.add('hud-farm-action', 'water');
      waterButton.dataset.farmAction = 'water';
      waterButton.dataset.plotKey = plot.plotKey;
      waterButton.textContent = plot.wateredToday ? 'Watered' : 'Water';
      waterButton.disabled = this.farmBusy || !farm.unlocked || !canWater;
      actions.appendChild(waterButton);

      const harvestButton = document.createElement('button');
      harvestButton.classList.add('hud-farm-action', 'harvest');
      harvestButton.dataset.farmAction = 'harvest';
      harvestButton.dataset.plotKey = plot.plotKey;
      harvestButton.textContent = 'Harvest';
      harvestButton.disabled = this.farmBusy || !farm.unlocked || !canHarvest;
      actions.appendChild(harvestButton);

      item.appendChild(actions);
      plotsRoot.appendChild(item);
    }
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

    craftingRoot.replaceChildren();

    if (!this.isAuthenticated) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = 'Connect to access farm crafting.';
      craftingRoot.appendChild(item);
      return;
    }

    if (this.farmCraftingBusy && !this.farmCraftingState) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = 'Loading recipes...';
      craftingRoot.appendChild(item);
      return;
    }

    const crafting = this.farmCraftingState;
    if (!crafting) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = 'No crafting data.';
      craftingRoot.appendChild(item);
      return;
    }

    if (!crafting.unlocked) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = 'Farm crafting locked. Complete farm assignment first.';
      craftingRoot.appendChild(item);
      return;
    }

    const unlockedRecipes = crafting.recipes.filter((recipe) => recipe.unlocked);
    if (unlockedRecipes.length === 0) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'empty');
      item.textContent = this.farmCraftingBusy ? 'Refreshing recipes...' : 'No recipes unlocked yet.';
      craftingRoot.appendChild(item);
      return;
    }

    for (const recipe of unlockedRecipes) {
      const item = document.createElement('li');
      item.classList.add('shop-item', 'farm-crafting-item');

      const header = document.createElement('div');
      header.classList.add('shop-item-header');

      const name = document.createElement('strong');
      name.textContent = recipe.name;
      header.appendChild(name);

      const output = document.createElement('span');
      output.classList.add('shop-price');
      output.textContent = `+${recipe.outputQuantity} ${this.formatFarmLabel(recipe.outputItemKey)}`;
      header.appendChild(output);
      item.appendChild(header);

      const description = document.createElement('p');
      description.classList.add('shop-description');
      description.textContent = recipe.description;
      item.appendChild(description);

      const ingredients = document.createElement('p');
      ingredients.classList.add('farm-crafting-ingredients');
      ingredients.textContent = `Needs: ${recipe.ingredients
        .map((entry) => `${this.formatFarmLabel(entry.itemKey)} ${entry.ownedQuantity}/${entry.requiredQuantity}`)
        .join(' | ')}`;
      item.appendChild(ingredients);

      const craftButton = document.createElement('button');
      craftButton.classList.add('hud-shop-buy');
      craftButton.textContent = `Craft x1 (max ${recipe.maxCraftable})`;
      craftButton.dataset.farmCraftAction = 'craft';
      craftButton.dataset.recipeKey = recipe.recipeKey;
      craftButton.disabled = this.farmCraftingBusy || this.farmBusy || recipe.maxCraftable < 1;
      item.appendChild(craftButton);

      craftingRoot.appendChild(item);
    }
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
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.farmBusy && !this.farmState) {
      return 'Loading...';
    }

    if (!this.farmState) {
      return 'No data';
    }

    if (!this.farmState.unlocked) {
      return this.farmBusy ? 'Checking unlock...' : 'Locked';
    }

    return this.farmBusy
      ? 'Refreshing...'
      : `Ready ${this.farmState.readyPlots} | Planted ${this.farmState.plantedPlots}/${this.farmState.totalPlots}`;
  }

  private getFarmCraftingSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Login required';
    }

    if (this.farmCraftingBusy && !this.farmCraftingState) {
      return 'Loading...';
    }

    if (!this.farmCraftingState) {
      return 'No data';
    }

    if (!this.farmCraftingState.unlocked) {
      return this.farmCraftingBusy ? 'Checking unlock...' : 'Locked';
    }

    const unlockedRecipes = this.farmCraftingState.recipes.filter((recipe) => recipe.unlocked).length;
    return this.farmCraftingBusy
      ? 'Refreshing...'
      : `${this.farmCraftingState.craftableRecipes} craftable | ${unlockedRecipes} recipes`;
  }

  private getFarmPlotStatusLabel(plot: FarmPlotState): string {
    if (!plot.cropKey) {
      return 'Parcelle vide. Selectionne une graine puis plante.';
    }

    const cropLabel = this.formatFarmLabel(plot.cropKey);
    const progress = `${Math.max(0, plot.growthProgressDays)}/${Math.max(1, plot.growthDays ?? 1)}j`;
    const waterLabel = plot.wateredToday ? 'Arrosee aujourd hui' : 'A arroser';
    const maturityLabel = plot.readyToHarvest
      ? 'Prete a recolter'
      : `Maturite: ${Math.max(0, plot.daysToMaturity ?? 0)}j`;

    return `${cropLabel} | Croissance ${progress} | ${waterLabel} | ${maturityLabel}`;
  }

  private formatFarmLabel(raw: string): string {
    const value = raw.trim().toLowerCase();
    if (value.length === 0) {
      return '-';
    }

    return value
      .split('_')
      .filter((part) => part.length > 0)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
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
      `${offer.offerKey}:${offer.goldPrice}:${offer.name}:${offer.description}`
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
    const active = Boolean(this.isAuthenticated && this.combatState && this.combatState.status === 'active');
    const playerTurn = Boolean(active && this.combatState?.turn === 'player');
    const mana = this.combatState?.player.mp ?? 0;
    const hp = this.combatState?.player.hp ?? 0;
    const maxHp = this.combatState?.player.maxHp ?? 0;
    const darkened = this.getCombatStatusTurns('playerDarkenedTurns') > 0;
    const fireballReady = Boolean(playerTurn && mana >= FIREBALL_MANA_COST && !darkened);
    const mendReady = Boolean(playerTurn && mana >= MEND_MANA_COST && hp < maxHp);
    const cleanseReady = Boolean(playerTurn && mana >= CLEANSE_MANA_COST && this.hasCleanseableDebuffs());
    const interruptReady = Boolean(
      playerTurn &&
      mana >= INTERRUPT_MANA_COST &&
      !darkened &&
      this.hasInterruptibleEnemyIntent(),
    );
    const rallyReady = Boolean(playerTurn && mana >= RALLY_MANA_COST && !darkened);
    const sunderReady = Boolean(playerTurn && mana >= SUNDER_MANA_COST);
    const effectiveMendReady = Boolean(mendReady && !darkened);

    if (this.combatStartButton) {
      this.combatStartButton.disabled = !this.isAuthenticated || this.combatBusy;
    }

    if (this.combatAttackButton) {
      this.combatAttackButton.disabled = !playerTurn || this.combatBusy;
    }

    if (this.combatDefendButton) {
      this.combatDefendButton.disabled = !playerTurn || this.combatBusy;
    }

    if (this.combatFireballButton) {
      this.combatFireballButton.disabled = !fireballReady || this.combatBusy;
    }

    if (this.combatMendButton) {
      this.combatMendButton.disabled = !effectiveMendReady || this.combatBusy;
    }

    if (this.combatCleanseButton) {
      this.combatCleanseButton.disabled = !cleanseReady || this.combatBusy;
    }

    if (this.combatInterruptButton) {
      this.combatInterruptButton.disabled = !interruptReady || this.combatBusy;
    }

    if (this.combatRallyButton) {
      this.combatRallyButton.disabled = !rallyReady || this.combatBusy;
    }

    if (this.combatSunderButton) {
      this.combatSunderButton.disabled = !sunderReady || this.combatBusy;
    }

    if (this.combatForfeitButton) {
      this.combatForfeitButton.disabled = !active || this.combatBusy;
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
    this.playerStripActionTimer = this.time.delayedCall(durationMs, () => {
      this.playerStripActionTimer = null;
      this.playPlayerStripAnimation('idle', true);
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
    if (typeof entry === 'string') {
      return entry.trim().length > 0 ? this.resolveSpriteAssetPath(entry.trim()) : null;
    }

    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const stateKey = this.toPortraitStateKey(animation);
    const statePath = this.asString(entry.states?.[stateKey]);
    if (typeof statePath === 'string' && statePath.trim().length > 0) {
      return this.resolveSpriteAssetPath(statePath.trim());
    }

    const directPath = this.asString(entry.path);
    if (typeof directPath === 'string' && directPath.trim().length > 0) {
      return this.resolveSpriteAssetPath(directPath.trim());
    }

    return null;
  }

  private toPortraitStateKey(animation: StripAnimationName): SpriteManifestPortraitState {
    if (animation === 'hit' || animation === 'cast') {
      return animation;
    }
    return 'normal';
  }

  private getCombatEnemySpritePath(enemyKey: string): string | null {
    const manifest = this.getSpriteManifest();
    const directEntry = manifest.sprites[enemyKey];
    if (directEntry?.path) {
      return this.resolveSpriteAssetPath(directEntry.path);
    }

    for (const entry of Object.values(manifest.sprites)) {
      if (entry.key === enemyKey && entry.path) {
        return this.resolveSpriteAssetPath(entry.path);
      }
    }

    if (enemyKey.length > 0 && this.textures.exists(enemyKey)) {
      return `/assets/sprites/characters/${enemyKey}.svg`;
    }

    return null;
  }

  private resolveSpriteAssetPath(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path;
    }
    return `/assets/sprites/${path}`;
  }

  private getSpriteManifest(): SpriteManifest {
    if (this.spriteManifest) {
      return this.spriteManifest;
    }

    const manifest = this.cache.json.get('sprite-manifest') as SpriteManifest | undefined;
    if (manifest && manifest.sprites && manifest.sprites['player-hero']) {
      this.spriteManifest = manifest;
      return manifest;
    }

    const fallbackManifest: SpriteManifest = {
      frameSize: { width: 64, height: 64 },
      origin: { x: 0.5, y: 0.84 },
      sprites: {
        'player-hero': {
          key: 'player-hero',
          path: '/assets/sprites/characters/player-hero.svg',
          scale: { x: 0.28125, y: 0.40625 },
          origin: { x: 0.5, y: 0.84 },
          physics: { width: 14, height: 22, offsetX: 2, offsetY: 2 },
        },
      },
    };
    this.spriteManifest = fallbackManifest;
    return fallbackManifest;
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
    if (!this.isAuthenticated) {
      this.setCombatError('Connecte toi pour agir en combat.');
      this.updateHud();
      return;
    }

    if (!this.combatState || this.combatState.status !== 'active') {
      this.setCombatError('Aucun combat actif.');
      this.updateHud();
      return;
    }

    if (this.combatState.turn !== 'player') {
      this.setCombatError('Ce nest pas ton tour.');
      this.updateHud();
      return;
    }

    if (action === 'fireball' && this.combatState.player.mp < FIREBALL_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Fireball.');
      this.updateHud();
      return;
    }

    if (action === 'rally' && this.combatState.player.mp < RALLY_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Rally.');
      this.updateHud();
      return;
    }

    if (action === 'sunder' && this.combatState.player.mp < SUNDER_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Sunder.');
      this.updateHud();
      return;
    }

    if (action === 'mend' && this.combatState.player.mp < MEND_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Mend.');
      this.updateHud();
      return;
    }

    if (action === 'mend' && this.combatState.player.hp >= this.combatState.player.maxHp) {
      this.setCombatError('Tes PV sont deja au maximum.');
      this.updateHud();
      return;
    }

    if (action === 'cleanse' && this.combatState.player.mp < CLEANSE_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Cleanse.');
      this.updateHud();
      return;
    }

    if (action === 'cleanse' && !this.hasCleanseableDebuffs()) {
      this.setCombatError('Aucun debuff a retirer.');
      this.updateHud();
      return;
    }

    if (action === 'interrupt' && this.combatState.player.mp < INTERRUPT_MANA_COST) {
      this.setCombatError('Pas assez de MP pour Interrupt.');
      this.updateHud();
      return;
    }

    const darkened = this.getCombatStatusTurns('playerDarkenedTurns') > 0;
    const blockedByDarkness =
      action === 'fireball' ||
      action === 'rally' ||
      action === 'mend' ||
      action === 'interrupt';
    if (darkened && blockedByDarkness) {
      this.setCombatError('Tu es sous Obscurite et ne peux pas te concentrer sur ce skill.');
      this.updateHud();
      return;
    }

    if (action === 'interrupt' && !this.hasInterruptibleEnemyIntent()) {
      this.setCombatError('Aucune intention ennemie interruptible.');
      this.updateHud();
      return;
    }

    this.combatBusy = true;
    this.combatStatus = 'loading';
    this.combatMessage = 'Action en cours...';
    this.clearCombatError();
    this.updateHud();

    try {
      const encounterId = this.combatEncounterId ?? this.combatState.id;
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

    if (action === 'attack' || action === 'defend') {
      this.triggerPlayerStripAction('hit', playerTimings.hitDurationMs);
      return;
    }

    this.triggerPlayerStripAction('cast', playerTimings.castDurationMs);
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
    if (!this.isAuthenticated) {
      this.blacksmithError = 'Login required to buy items.';
      this.updateHud();
      return;
    }

    if (!this.hudState.blacksmithUnlocked) {
      this.blacksmithError = 'Blacksmith shop is locked.';
      this.updateHud();
      return;
    }

    this.blacksmithBusy = true;
    this.blacksmithError = null;
    this.updateHud();

    try {
      await this.fetchJson('/shops/blacksmith/buy', {
        method: 'POST',
        body: JSON.stringify({
          offerKey,
          quantity: 1,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
    } catch (error) {
      this.blacksmithError = this.getErrorMessage(error, 'Unable to buy this item.');
    } finally {
      this.blacksmithBusy = false;
      this.updateHud();
    }
  }

  private async buyVillageSeedOffer(offerKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.villageMarketError = 'Login required to buy seeds.';
      this.updateHud();
      return;
    }

    if (!this.villageMarketUnlocked) {
      this.villageMarketError = 'Village market is locked.';
      this.updateHud();
      return;
    }

    this.villageMarketBusy = true;
    this.villageMarketError = null;
    this.updateHud();

    try {
      await this.fetchJson('/shops/village-market/buy-seed', {
        method: 'POST',
        body: JSON.stringify({
          offerKey,
          quantity: 1,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshVillageMarketState();
      await this.refreshBlacksmithState();
    } catch (error) {
      this.villageMarketError = this.getErrorMessage(error, 'Unable to buy this seed offer.');
    } finally {
      this.villageMarketBusy = false;
      this.updateHud();
    }
  }

  private async sellVillageCrop(itemKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.villageMarketError = 'Login required to sell crops.';
      this.updateHud();
      return;
    }

    if (!this.villageMarketUnlocked) {
      this.villageMarketError = 'Village market is locked.';
      this.updateHud();
      return;
    }

    this.villageMarketBusy = true;
    this.villageMarketError = null;
    this.updateHud();

    try {
      await this.fetchJson('/shops/village-market/sell-crop', {
        method: 'POST',
        body: JSON.stringify({
          itemKey,
          quantity: 1,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshVillageMarketState();
      await this.refreshBlacksmithState();
    } catch (error) {
      this.villageMarketError = this.getErrorMessage(error, 'Unable to sell this crop.');
    } finally {
      this.villageMarketBusy = false;
      this.updateHud();
    }
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

  private async sleepAtFarm(): Promise<void> {
    if (!this.isAuthenticated) {
      this.farmError = 'Login required to sleep at farm.';
      this.updateHud();
      return;
    }

    if (!this.farmState?.unlocked) {
      this.farmError = 'Farm is locked.';
      this.updateHud();
      return;
    }

    this.farmBusy = true;
    this.farmError = null;
    this.updateHud();

    try {
      const payload = await this.fetchJson<unknown>('/gameplay/sleep', {
        method: 'POST',
      });
      this.applyGameplaySnapshot(payload);
    } catch (error) {
      this.farmError = this.getErrorMessage(error, 'Unable to sleep right now.');
    } finally {
      this.farmBusy = false;
      this.updateHud();
    }
  }

  private async craftFarmRecipe(recipeKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.farmCraftingError = 'Login required to craft farm consumables.';
      this.updateHud();
      return;
    }

    const crafting = this.farmCraftingState;
    if (!crafting?.unlocked) {
      this.farmCraftingError = 'Farm crafting is locked.';
      this.updateHud();
      return;
    }

    const recipe = crafting.recipes.find((entry) => entry.recipeKey === recipeKey);
    if (!recipe || !recipe.unlocked) {
      this.farmCraftingError = 'Recipe is locked.';
      this.updateHud();
      return;
    }

    if (recipe.maxCraftable < 1) {
      this.farmCraftingError = 'Not enough farm ingredients for this recipe.';
      this.updateHud();
      return;
    }

    this.farmCraftingBusy = true;
    this.farmCraftingError = null;
    this.updateHud();

    try {
      await this.fetchJson('/gameplay/crafting/craft', {
        method: 'POST',
        body: JSON.stringify({
          recipeKey,
          quantity: 1,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshVillageMarketState();
    } catch (error) {
      this.farmCraftingError = this.getErrorMessage(error, 'Unable to craft this recipe.');
    } finally {
      this.farmCraftingBusy = false;
      this.updateHud();
    }
  }

  private async plantFarmPlot(plotKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.farmError = 'Login required to plant crops.';
      this.updateHud();
      return;
    }

    if (!this.farmState?.unlocked) {
      this.farmError = 'Farm is locked.';
      this.updateHud();
      return;
    }

    const seedItemKey = this.farmSelectedSeedItemKey.trim();
    if (!seedItemKey) {
      this.farmError = 'Select a seed before planting.';
      this.updateHud();
      return;
    }

    this.farmBusy = true;
    this.farmError = null;
    this.updateHud();

    try {
      await this.fetchJson('/gameplay/farm/plant', {
        method: 'POST',
        body: JSON.stringify({
          plotKey,
          seedItemKey,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshVillageMarketState();
    } catch (error) {
      this.farmError = this.getErrorMessage(error, 'Unable to plant this plot.');
    } finally {
      this.farmBusy = false;
      this.updateHud();
    }
  }

  private async waterFarmPlot(plotKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.farmError = 'Login required to water crops.';
      this.updateHud();
      return;
    }

    if (!this.farmState?.unlocked) {
      this.farmError = 'Farm is locked.';
      this.updateHud();
      return;
    }

    this.farmBusy = true;
    this.farmError = null;
    this.updateHud();

    try {
      await this.fetchJson('/gameplay/farm/water', {
        method: 'POST',
        body: JSON.stringify({
          plotKey,
        }),
      });
      await this.refreshGameplayState();
    } catch (error) {
      this.farmError = this.getErrorMessage(error, 'Unable to water this plot.');
    } finally {
      this.farmBusy = false;
      this.updateHud();
    }
  }

  private async harvestFarmPlot(plotKey: string): Promise<void> {
    if (!this.isAuthenticated) {
      this.farmError = 'Login required to harvest crops.';
      this.updateHud();
      return;
    }

    if (!this.farmState?.unlocked) {
      this.farmError = 'Farm is locked.';
      this.updateHud();
      return;
    }

    this.farmBusy = true;
    this.farmError = null;
    this.updateHud();

    try {
      await this.fetchJson('/gameplay/farm/harvest', {
        method: 'POST',
        body: JSON.stringify({
          plotKey,
        }),
      });
      await this.refreshGameplayState();
      await this.refreshVillageMarketState();
    } catch (error) {
      this.farmError = this.getErrorMessage(error, 'Unable to harvest this plot.');
    } finally {
      this.farmBusy = false;
      this.updateHud();
    }
  }

  private async restoreAutoSaveToSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.autosaveError = 'Login required to restore autosave.';
      this.updateHud();
      return;
    }

    if (!this.autosave) {
      this.autosaveError = 'No autosave available.';
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.autosaveRestoreSlotBusy = slot;
    this.autosaveError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/auto/restore/${slot}`, {
        method: 'POST',
      });
      await this.refreshAutoSaveState();
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.autosaveError = this.getErrorMessage(error, `Unable to restore autosave to slot ${slot}.`);
    } finally {
      this.autosaveRestoreSlotBusy = null;
      this.updateHud();
    }
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
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to capture saves.';
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsActionBusyKey = `capture:${slot}`;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/${slot}/capture`, {
        method: 'POST',
      });
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, `Unable to capture slot ${slot}.`);
    } finally {
      this.saveSlotsActionBusyKey = null;
      this.updateHud();
    }
  }

  private async loadSaveSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to load saves.';
      this.updateHud();
      return;
    }

    if (!this.hasExistingSaveSlot(slot)) {
      this.saveSlotsError = `Slot ${slot} is empty.`;
      this.saveSlotsLoadConfirmSlot = null;
      this.updateHud();
      return;
    }

    if (this.saveSlotsLoadConfirmSlot !== slot) {
      this.saveSlotsError = `Confirm load for slot ${slot} first.`;
      this.saveSlotsLoadConfirmSlot = slot;
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsActionBusyKey = `load:${slot}`;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/${slot}/load`, {
        method: 'POST',
      });
      await this.refreshGameplayState();
      await this.refreshCombatState();
      await this.refreshQuestState();
      await this.refreshBlacksmithState();
      await this.refreshVillageMarketState();
      await this.refreshAutoSaveState();
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, `Unable to load slot ${slot}.`);
    } finally {
      this.saveSlotsActionBusyKey = null;
      this.updateHud();
    }
  }

  private async deleteSaveSlot(slot: number): Promise<void> {
    if (!this.isAuthenticated) {
      this.saveSlotsError = 'Login required to delete saves.';
      this.updateHud();
      return;
    }

    this.saveSlotsLoadConfirmSlot = null;
    this.saveSlotsActionBusyKey = `delete:${slot}`;
    this.saveSlotsError = null;
    this.updateHud();

    try {
      await this.fetchJson(`/saves/${slot}`, {
        method: 'DELETE',
      });
      await this.refreshSaveSlotsState();
    } catch (error) {
      this.saveSlotsError = this.getErrorMessage(error, `Unable to delete slot ${slot}.`);
    } finally {
      this.saveSlotsActionBusyKey = null;
      this.updateHud();
    }
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
      } else {
        this.farmSelectedSeedItemKey = '';
      }
    }

    const crafting = this.normalizeGameplayCraftingPayload(payload);
    if (crafting) {
      this.farmCraftingState = crafting;
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
    this.farmState = null;
    this.farmBusy = false;
    this.farmError = null;
    this.farmSelectedSeedItemKey = '';
    this.farmRenderSignature = '';
    this.farmCraftingState = null;
    this.farmCraftingBusy = false;
    this.farmCraftingError = null;
    this.farmCraftingRenderSignature = '';
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
  }

  private resetVillageMarketState(): void {
    this.villageMarketUnlocked = false;
    this.villageMarketSeedOffers = [];
    this.villageMarketBuybackOffers = [];
    this.villageMarketBusy = false;
    this.villageMarketError = null;
    this.villageMarketRenderSignature = '';
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

    return `Recap: DMG ${recap.damageDealt}/${recap.damageTaken} | Heal ${recap.healingDone} | MP ${recap.mpSpent}/${recap.mpRecovered} | Status +P${recap.poisonApplied}/+C${recap.ceciteApplied}/+O${recap.obscuriteApplied} cleansed ${recap.debuffsCleansed} | Loot x${recap.rewards.lootItems}`;
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
    return value.trim().toLowerCase();
  }

  private isDebugQaQueryMatch(query: string, values: Array<string | null | undefined>): boolean {
    if (!query) {
      return true;
    }

    return values.some((value) => (value ?? '').toLowerCase().includes(query));
  }

  private doesCombatStateMatchRecapFilters(snapshot: CombatEncounterState | null): boolean {
    if (!snapshot) {
      return false;
    }

    if (this.debugQaRecapOutcomeFilter !== 'all' && snapshot.status !== this.debugQaRecapOutcomeFilter) {
      return false;
    }

    const enemyQuery = this.normalizeDebugQaFilterQuery(this.debugQaRecapEnemyFilter);
    if (!enemyQuery) {
      return true;
    }

    return this.isDebugQaQueryMatch(enemyQuery, [snapshot.enemy.key, snapshot.enemy.name]);
  }

  private filterCombatDebugReference(reference: CombatDebugReference): CombatDebugReference {
    const enemyQuery = this.normalizeDebugQaFilterQuery(this.debugQaScriptEnemyFilter);
    const intentQuery = this.normalizeDebugQaFilterQuery(this.debugQaScriptIntentFilter);
    if (!enemyQuery && !intentQuery) {
      return reference;
    }

    const scriptedIntents = reference.scriptedIntents
      .filter((enemy) => this.isDebugQaQueryMatch(enemyQuery, [enemy.enemyKey, enemy.enemyName]))
      .map((enemy) => {
        const filteredIntents = enemy.intents.filter((intent) =>
          this.isDebugQaQueryMatch(intentQuery, [intent.key, intent.label, intent.trigger]),
        );
        return {
          ...enemy,
          intents: filteredIntents,
        };
      })
      .filter((enemy) => intentQuery.length === 0 || enemy.intents.length > 0);

    const allowedEnemyKeys = new Set(scriptedIntents.map((enemy) => enemy.enemyKey));
    const scriptedFloors = reference.scriptedFloors.filter((floor) => allowedEnemyKeys.has(floor.enemyKey));
    const enemies = reference.enemies.filter((enemy) => allowedEnemyKeys.has(enemy.key));

    return {
      playerSkills: reference.playerSkills,
      enemies,
      scriptedFloors,
      scriptedIntents,
    };
  }

  private getDebugQaScriptedIntentsDisplayText(): string {
    if (!this.debugQaScriptedIntentsReference) {
      return this.debugQaScriptedIntentsText;
    }

    const filteredReference = this.filterCombatDebugReference(this.debugQaScriptedIntentsReference);
    const enemyFilterLabel = this.debugQaScriptEnemyFilter.trim() || '-';
    const intentFilterLabel = this.debugQaScriptIntentFilter.trim() || '-';
    return [
      `Filters => enemy: "${enemyFilterLabel}" | intent: "${intentFilterLabel}"`,
      '',
      this.formatCombatDebugScriptedIntentsReference(filteredReference),
    ].join('\n');
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
    const option = DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS.find((entry) => entry.key === speed);
    return option?.intervalMs ?? 900;
  }

  private getDebugQaReplayAutoPlaySpeedLabel(speed: DebugQaReplayAutoPlaySpeedKey): string {
    const option = DEBUG_QA_REPLAY_AUTOPLAY_SPEED_OPTIONS.find((entry) => entry.key === speed);
    return option?.label ?? 'Normal (900ms)';
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
    const lines: string[] = [];

    lines.push(`Player skills (${reference.playerSkills.length})`);
    for (const skill of reference.playerSkills) {
      lines.push(
        `- ${skill.label} [${skill.key}] | mana ${skill.manaCost} | obscurite ${skill.blockedBySilence ? 'blocked' : 'open'}`,
      );
      lines.push(`  ${skill.description}`);
    }

    lines.push('');
    lines.push(`Scripted floors (${reference.scriptedFloors.length})`);
    for (const floor of reference.scriptedFloors) {
      lines.push(
        `- Floor ${floor.floor}: ${floor.enemyName} [${floor.enemyKey}] | boss ${floor.scriptedBossEncounter ? 'yes' : 'no'}`,
      );
    }

    lines.push('');
    lines.push(`Enemy intent scripts (${reference.scriptedIntents.length})`);
    for (const enemy of reference.scriptedIntents) {
      lines.push(
        `- ${enemy.enemyName} [${enemy.enemyKey}] | floor ${enemy.scriptedFloor ?? 'n/a'} | boss ${enemy.scriptedBossEncounter ? 'yes' : 'no'}`,
      );
      for (const intent of enemy.intents) {
        lines.push(
          `  * ${intent.label} [${intent.key}] | interruptible ${intent.interruptible ? 'yes' : 'no'} | ${intent.trigger}`,
        );
      }
    }

    return lines.join('\n');
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
    if (!this.isRecord(rawPayload)) {
      return null;
    }

    const timestamp = this.asString(rawPayload.timestamp) ?? new Date().toISOString();
    const authRecord = this.asRecord(rawPayload.auth);
    const hudRecord = this.asRecord(rawPayload.hud);
    const hudStateRecord = this.asRecord(hudRecord?.state);
    const combatRecord = this.asRecord(rawPayload.combat);

    const authAuthenticatedValue = authRecord?.authenticated;
    const authAuthenticated =
      typeof authAuthenticatedValue === 'boolean' ? authAuthenticatedValue : null;
    const authStatus = this.asString(authRecord?.status);
    const hudState = this.normalizeImportedHudState(hudStateRecord);
    const combatState = this.normalizeCombatPayload(combatRecord?.state ?? null);
    const combatEncounterId =
      this.asString(combatRecord?.encounterId) ?? combatState?.id ?? null;
    const combatStatus = this.asCombatUiStatus(combatRecord?.status) ?? (combatState?.status ?? null);
    const combatMessage = this.asString(combatRecord?.message);
    const combatError = this.asString(combatRecord?.error);
    const combatLogs = this.asStringArray(combatRecord?.logs).slice(-20);

    const hasUsefulData =
      authAuthenticated !== null ||
      authStatus !== null ||
      Object.keys(hudState).length > 0 ||
      combatState !== null ||
      combatStatus !== null ||
      combatEncounterId !== null ||
      combatMessage !== null ||
      combatError !== null ||
      combatLogs.length > 0;

    if (!hasUsefulData) {
      return null;
    }

    return {
      sourceFile,
      timestamp,
      authAuthenticated,
      authStatus,
      hudState,
      combatEncounterId,
      combatStatus,
      combatMessage,
      combatError,
      combatLogs,
      combatState,
    };
  }

  private normalizeImportedHudState(rawState: Record<string, unknown> | null): Partial<HudState> {
    if (!rawState) {
      return {};
    }

    const normalized: Partial<HudState> = {};
    const day = this.asNumber(rawState.day);
    const gold = this.asNumber(rawState.gold);
    const level = this.asNumber(rawState.level);
    const xp = this.asNumber(rawState.xp);
    const xpToNext = this.asNumber(rawState.xpToNext);
    const towerCurrentFloor = this.asNumber(rawState.towerCurrentFloor);
    const towerHighestFloor = this.asNumber(rawState.towerHighestFloor);
    const hp = this.asNumber(rawState.hp);
    const maxHp = this.asNumber(rawState.maxHp);
    const mp = this.asNumber(rawState.mp);
    const maxMp = this.asNumber(rawState.maxMp);
    const stamina = this.asNumber(rawState.stamina);
    const area = this.asString(rawState.area);

    if (day !== null) {
      normalized.day = Math.max(1, Math.round(day));
    }
    if (gold !== null) {
      normalized.gold = Math.max(0, Math.round(gold));
    }
    if (level !== null) {
      normalized.level = Math.max(1, Math.round(level));
    }
    if (xp !== null) {
      normalized.xp = Math.max(0, Math.round(xp));
    }
    if (xpToNext !== null) {
      normalized.xpToNext = Math.max(1, Math.round(xpToNext));
    }
    if (towerCurrentFloor !== null) {
      normalized.towerCurrentFloor = Math.max(1, Math.round(towerCurrentFloor));
    }
    if (towerHighestFloor !== null) {
      normalized.towerHighestFloor = Math.max(1, Math.round(towerHighestFloor));
    }
    if (typeof rawState.towerBossFloor10Defeated === 'boolean') {
      normalized.towerBossFloor10Defeated = rawState.towerBossFloor10Defeated;
    }
    if (typeof rawState.blacksmithUnlocked === 'boolean') {
      normalized.blacksmithUnlocked = rawState.blacksmithUnlocked;
    }
    if (typeof rawState.blacksmithCurseLifted === 'boolean') {
      normalized.blacksmithCurseLifted = rawState.blacksmithCurseLifted;
    }
    if (hp !== null) {
      normalized.hp = Math.max(0, hp);
    }
    if (maxHp !== null) {
      normalized.maxHp = Math.max(1, maxHp);
    }
    if (mp !== null) {
      normalized.mp = Math.max(0, mp);
    }
    if (maxMp !== null) {
      normalized.maxMp = Math.max(1, maxMp);
    }
    if (stamina !== null) {
      normalized.stamina = Math.max(0, stamina);
    }
    if (area) {
      normalized.area = area;
    }

    return normalized;
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
    const lines: string[] = [];
    const recapEnemyFilter = this.debugQaRecapEnemyFilter.trim();
    const scriptEnemyFilter = this.debugQaScriptEnemyFilter.trim();
    const scriptIntentFilter = this.debugQaScriptIntentFilter.trim();
    const recapMatchesFilters = this.doesCombatStateMatchRecapFilters(this.combatState);

    lines.push('# Farm RPG QA Recap');
    lines.push('');
    lines.push(`Generated at: ${timestamp}`);
    lines.push(`Mode: ${import.meta.env.MODE}`);
    lines.push(`URL: ${window.location.href}`);
    lines.push('');
    lines.push('## Active Filters');
    lines.push(`- Recap outcome: ${this.debugQaRecapOutcomeFilter}`);
    lines.push(`- Recap enemy query: ${recapEnemyFilter || '(none)'}`);
    lines.push(`- Script enemy query: ${scriptEnemyFilter || '(none)'}`);
    lines.push(`- Script intent query: ${scriptIntentFilter || '(none)'}`);
    lines.push('');
    lines.push('## Combat Recap');

    if (!this.combatState) {
      lines.push('- No encounter available in HUD.');
    } else if (!recapMatchesFilters) {
      lines.push('- Current encounter is filtered out by recap filters.');
      lines.push(`- Current enemy: ${this.combatState.enemy.name} [${this.combatState.enemy.key}]`);
      lines.push(`- Current status: ${this.combatState.status}`);
    } else {
      lines.push(`- Encounter: ${this.combatState.id}`);
      lines.push(`- Enemy: ${this.combatState.enemy.name} [${this.combatState.enemy.key}]`);
      lines.push(`- Outcome: ${this.combatState.status}`);
      lines.push(`- Round: ${this.combatState.round}`);

      if (this.combatState.recap) {
        const recap = this.combatState.recap;
        lines.push(`- Damage dealt/taken: ${recap.damageDealt}/${recap.damageTaken}`);
        lines.push(`- Healing done: ${recap.healingDone}`);
        lines.push(`- MP spent/recovered: ${recap.mpSpent}/${recap.mpRecovered}`);
        lines.push(
          `- Status applied: Poison ${recap.poisonApplied}, Cecite ${recap.ceciteApplied}, Obscurite ${recap.obscuriteApplied}`,
        );
        lines.push(`- Debuffs cleansed: ${recap.debuffsCleansed}`);
        lines.push(`- Blind misses: ${recap.blindMisses}`);
        lines.push(
          `- Rewards: XP ${recap.rewards.experience}, Gold ${recap.rewards.gold}, Loot items ${recap.rewards.lootItems}`,
        );
        lines.push(`- Penalties: Gold lost ${recap.penalties.goldLost}, Items lost ${recap.penalties.itemsLost}`);
      } else {
        lines.push('- Recap payload unavailable (encounter still active or recap pending).');
      }
    }

    lines.push('');
    lines.push('### Combat Logs (last 20)');
    if (this.combatLogs.length === 0) {
      lines.push('- No logs captured.');
    } else {
      for (const logLine of this.combatLogs.slice(-20)) {
        lines.push(`- ${logLine}`);
      }
    }

    lines.push('');
    lines.push('## Combat Scripted Intents');
    if (!this.debugQaScriptedIntentsReference) {
      lines.push('- Scripted intents reference is not loaded yet.');
      lines.push('- Use "Load reference" in Debug QA then export again for detailed scripted intents.');
      return lines.join('\n');
    }

    const filteredReference = this.filterCombatDebugReference(this.debugQaScriptedIntentsReference);
    lines.push(
      `- Filtered scripted profiles: ${filteredReference.scriptedIntents.length}/${this.debugQaScriptedIntentsReference.scriptedIntents.length}`,
    );
    lines.push('');
    lines.push('```text');
    lines.push(this.formatCombatDebugScriptedIntentsReference(filteredReference));
    lines.push('```');
    return lines.join('\n');
  }

  private buildDebugQaTraceFilename(timestamp: string): string {
    const safeTimestamp = timestamp.replace(/[:.]/g, '-');
    return `farm-rpg-qa-trace-${safeTimestamp}.json`;
  }

  private buildDebugQaMarkdownFilename(timestamp: string): string {
    const safeTimestamp = timestamp.replace(/[:.]/g, '-');
    return `farm-rpg-qa-recap-${safeTimestamp}.md`;
  }

  private downloadJsonFile(filename: string, payload: unknown): void {
    this.downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  }

  private downloadTextFile(filename: string, contents: string, contentType = 'text/plain;charset=utf-8'): void {
    const blob = new Blob([contents], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
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
    const root = this.asRecord(payload);
    const statePreset = this.asRecord(root?.statePreset);
    const preset = this.asRecord(statePreset?.preset);
    const tower = this.asRecord(statePreset?.tower);
    const towerBefore = this.asRecord(tower?.before);
    const towerAfter = this.asRecord(tower?.after);
    const worldFlags = this.asRecord(statePreset?.worldFlags);

    const presetKey = this.asString(preset?.key);
    const floorBefore = this.asNumber(towerBefore?.currentFloor);
    const floorAfter = this.asNumber(towerAfter?.currentFloor);
    const addedFlags = this.asStringArray(worldFlags?.added);
    const removedFlags = this.asStringArray(worldFlags?.removed);

    if (!presetKey || floorBefore === null || floorAfter === null) {
      return null;
    }

    const addedPreview = this.formatDebugQaFlagPreview(addedFlags);
    const removedPreview = this.formatDebugQaFlagPreview(removedFlags);
    return `Preset ${presetKey}: floor ${Math.round(floorBefore)} -> ${Math.round(floorAfter)} | +${addedFlags.length} (${addedPreview}) / -${removedFlags.length} (${removedPreview})`;
  }

  private formatSetWorldFlagsSuccess(payload: unknown): string | null {
    const root = this.asRecord(payload);
    const worldFlags = this.asRecord(root?.worldFlags);
    const addedFlags = this.asStringArray(worldFlags?.added);
    const removedFlags = this.asStringArray(worldFlags?.removed);
    const afterFlags = this.asStringArray(worldFlags?.after);

    if (!worldFlags) {
      return null;
    }

    const addedPreview = this.formatDebugQaFlagPreview(addedFlags);
    const removedPreview = this.formatDebugQaFlagPreview(removedFlags);
    return `World flags updated: total ${afterFlags.length} | +${addedFlags.length} (${addedPreview}) / -${removedFlags.length} (${removedPreview})`;
  }

  private formatSetQuestStatusSuccess(payload: unknown): string | null {
    const root = this.asRecord(payload);
    const quest = this.asRecord(root?.quest);

    const questKey = this.asString(quest?.questKey);
    const previousStatus = this.asString(quest?.previousStatus);
    const nextStatus = this.asString(quest?.nextStatus);
    if (!questKey || !previousStatus || !nextStatus) {
      return null;
    }

    return `Quest ${questKey}: ${previousStatus} -> ${nextStatus}`;
  }

  private formatDebugQaFlagPreview(flags: string[]): string {
    if (flags.length === 0) {
      return 'none';
    }

    const preview = flags.slice(0, 3).join(', ');
    if (flags.length <= 3) {
      return preview;
    }

    return `${preview}, ...`;
  }

  private readDebugQaNumber(
    input: HTMLInputElement | null,
    fallback: number,
    min?: number,
    max?: number,
  ): number {
    const raw = input?.value?.trim();
    const parsed = raw ? Number(raw) : fallback;
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    const rounded = Math.round(parsed);
    if (typeof min === 'number' && rounded < min) {
      return min;
    }
    if (typeof max === 'number' && rounded > max) {
      return max;
    }

    return Math.max(0, rounded);
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
    return value === 'active' || value === 'completed' || value === 'claimed';
  }

  private readDebugQaFlagList(input: HTMLTextAreaElement | null): string[] {
    const raw = input?.value ?? '';
    if (!raw.trim()) {
      return [];
    }

    const values = raw
      .split(/[\n,;]+/g)
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0);

    return [...new Set(values)];
  }

  private getDayPhaseKey(): 'day' | 'night' {
    return this.hudState.day % 2 === 0 ? 'night' : 'day';
  }

  private getDayPhaseLabel(): string {
    return this.getDayPhaseKey() === 'night' ? 'Nuit' : 'Jour';
  }

  private updateDayPhaseVisual(): void {
    const phase = this.getDayPhaseKey();
    const gameShell = document.getElementById('game-shell');
    if (gameShell) {
      gameShell.dataset.dayPhase = phase;
    }
  }

  private getBlacksmithStatusLabel(): string {
    if (!this.hudState.blacksmithCurseLifted) {
      return 'Cursed';
    }

    if (!this.hudState.blacksmithUnlocked) {
      return 'Recovering';
    }

    return 'Unlocked';
  }

  private getVillageNpcSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connexion requise';
    }

    const availableCount =
      Number(this.villageNpcState.mayor.available) +
      Number(this.villageNpcState.blacksmith.available) +
      Number(this.villageNpcState.merchant.available);
    const friendshipTotal =
      this.villageNpcRelationships.mayor.friendship +
      this.villageNpcRelationships.blacksmith.friendship +
      this.villageNpcRelationships.merchant.friendship;
    return `${availableCount}/3 accessibles | Amitie ${friendshipTotal}`;
  }

  private getVillageNpcEntryLabel(npcKey: VillageNpcKey): string {
    const entry = this.villageNpcState[npcKey];
    const availability = entry.available ? 'Disponible' : 'Indisponible';
    const relationship = this.villageNpcRelationships[npcKey];
    return `${this.formatVillageNpcStateLabel(entry.stateKey)} | ${availability} | Amitie ${relationship.friendship} (${this.formatVillageRelationshipTierLabel(relationship.tier)})`;
  }

  private formatVillageNpcStateLabel(stateKey: string): string {
    switch (stateKey) {
      case 'offscreen':
        return 'Hors village';
      case 'awaiting_meeting':
        return 'Attend rencontre';
      case 'briefing':
        return 'Briefing';
      case 'village_overseer':
        return 'Supervision village';
      case 'tower_strategist':
        return 'Strategie tour';
      case 'cursed':
        return 'Maudit';
      case 'recovering':
        return 'Recuperation';
      case 'open':
        return 'Ouvert';
      case 'masterwork_ready':
        return 'Maitrise';
      case 'absent':
        return 'Absent';
      case 'setting_stall':
        return 'Installe etal';
      case 'traveling_buyer':
        return 'Achat itinerant';
      default:
        return stateKey.replace(/_/g, ' ');
    }
  }

  private formatVillageRelationshipTierLabel(tier: VillageNpcRelationshipTier): string {
    switch (tier) {
      case 'stranger':
        return 'Inconnu';
      case 'familiar':
        return 'Connu';
      case 'trusted':
        return 'Confiant';
      case 'ally':
        return 'Allie';
      default:
        return tier;
    }
  }

  private getVillageNpcDisplayName(npcKey: VillageNpcKey): string {
    if (npcKey === 'mayor') {
      return 'Mayor';
    }
    if (npcKey === 'blacksmith') {
      return 'Blacksmith';
    }

    return 'Merchant';
  }

  private getIntroSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connexion requise';
    }

    if (this.introNarrativeBusy && !this.introNarrativeState) {
      return 'Chargement...';
    }

    if (!this.introNarrativeState) {
      return 'Pre-intro';
    }

    if (this.introNarrativeState.completed) {
      return 'Intro terminee';
    }

    if (this.introNarrativeState.currentStep === 'arrive_village') {
      return 'Acte 1/3';
    }

    if (this.introNarrativeState.currentStep === 'meet_mayor') {
      return 'Acte 2/3';
    }

    return 'Acte 3/3';
  }

  private getIntroNarrativeLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connecte toi pour lancer la sequence d intro.';
    }

    const state = this.introNarrativeState;
    if (!state || state.currentStep === 'arrive_village') {
      return 'Tu arrives au village de Briseterre. Les habitants observent ton chariot charge de graines et de vieux outils.';
    }

    if (state.currentStep === 'meet_mayor') {
      return 'Le maire Elric te recoit sur la place. Il te presente la Tour maudite et te demande de renforcer les defenses du village.';
    }

    if (state.currentStep === 'farm_assignment') {
      return 'Le maire t attribue une parcelle a la lisiere du village. Cette ferme deviendra ta base entre deux expeditions.';
    }

    return 'Intro completee. Tu peux desormais alterner progression tour et preparation de ferme.';
  }

  private getIntroHintLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connecte ton compte puis clique sur "Continuer intro".';
    }

    if (this.introNarrativeState?.completed) {
      return 'Prochaine etape: lot ferme/village pour rendre la parcelle jouable.';
    }

    return 'Clique sur "Continuer intro" pour valider la prochaine scene narrative.';
  }

  private getIntroProgressLabel(): string {
    const state = this.introNarrativeState;
    if (!state) {
      return 'Progression: 0/3';
    }

    const completedSteps =
      Number(state.steps.arriveVillage) +
      Number(state.steps.metMayor) +
      Number(state.steps.farmAssigned);
    return `Progression: ${completedSteps}/3`;
  }

  private getIntroAdvanceButtonLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connexion requise';
    }

    if (this.introNarrativeState?.completed) {
      return 'Intro completee';
    }

    return 'Continuer intro';
  }

  private getHeroProfileSummaryLabel(): string {
    if (!this.isAuthenticated) {
      return 'Connexion requise';
    }

    if (this.heroProfileBusy && !this.heroProfile) {
      return 'Chargement...';
    }

    if (!this.heroProfile) {
      return 'Non cree';
    }

    return `${this.heroProfile.heroName} | ${this.getHeroAppearanceLabel(this.heroProfile.appearanceKey)}`;
  }

  private getHeroAppearanceLabel(key: HeroAppearanceKey): string {
    const option = HERO_APPEARANCE_OPTIONS.find((entry) => entry.key === key);
    return option ? option.label : 'Fermier classique';
  }

  private normalizeGameplayIntroPayload(payload: unknown): IntroNarrativeState | null {
    const root = this.asRecord(payload);
    if (!root) {
      return null;
    }

    const introRecord = this.asRecord(root.intro) ?? root;
    const currentStepRaw = this.asString(introRecord.currentStep);
    if (!currentStepRaw || !isIntroNarrativeStepKey(currentStepRaw)) {
      return null;
    }

    const steps = this.asRecord(introRecord.steps);
    return {
      currentStep: currentStepRaw,
      completed: Boolean(introRecord.completed),
      steps: {
        arriveVillage: Boolean(steps?.arriveVillage),
        metMayor: Boolean(steps?.metMayor),
        farmAssigned: Boolean(steps?.farmAssigned),
      },
    };
  }

  private normalizeVillageNpcEntry(payload: unknown): VillageNpcHudEntry | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const stateKey = this.asString(record.stateKey)?.trim().toLowerCase();
    if (!stateKey) {
      return null;
    }

    return {
      stateKey,
      available: Boolean(record.available),
    };
  }

  private normalizeVillageNpcRelationshipEntry(payload: unknown): VillageNpcRelationshipHudEntry | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const friendshipRaw = this.asNumber(record.friendship);
    const tierRaw = this.asString(record.tier)?.trim().toLowerCase();
    const lastInteractionDayRaw = this.asNumber(record.lastInteractionDay);
    if (
      friendshipRaw === null ||
      !tierRaw ||
      (tierRaw !== 'stranger' && tierRaw !== 'familiar' && tierRaw !== 'trusted' && tierRaw !== 'ally')
    ) {
      return null;
    }

    const lastInteractionDay = lastInteractionDayRaw === null || lastInteractionDayRaw < 1
      ? null
      : Math.round(lastInteractionDayRaw);

    return {
      friendship: Math.max(0, Math.round(friendshipRaw)),
      tier: tierRaw,
      lastInteractionDay,
      canTalkToday: Boolean(record.canTalkToday),
    };
  }

  private normalizeGameplayFarmPayload(payload: unknown): FarmState | null {
    const root = this.asRecord(payload);
    if (!root) {
      return null;
    }

    const farmRecord = this.asRecord(root.farm) ?? root;
    const totalPlots = this.asNumber(farmRecord.totalPlots);
    const plantedPlots = this.asNumber(farmRecord.plantedPlots);
    const wateredPlots = this.asNumber(farmRecord.wateredPlots);
    const readyPlots = this.asNumber(farmRecord.readyPlots);
    const cropCatalogRaw = Array.isArray(farmRecord.cropCatalog) ? farmRecord.cropCatalog : null;
    const plotsRaw = Array.isArray(farmRecord.plots) ? farmRecord.plots : null;

    if (
      totalPlots === null ||
      plantedPlots === null ||
      wateredPlots === null ||
      readyPlots === null ||
      !cropCatalogRaw ||
      !plotsRaw
    ) {
      return null;
    }

    const cropCatalog = cropCatalogRaw
      .map((entry) => this.normalizeFarmCropCatalogEntry(entry))
      .filter((entry): entry is FarmCropCatalogEntryState => entry !== null);
    const plots = plotsRaw
      .map((entry) => this.normalizeFarmPlotState(entry))
      .filter((entry): entry is FarmPlotState => entry !== null)
      .sort((left, right) => left.row - right.row || left.col - right.col || left.plotKey.localeCompare(right.plotKey));

    return {
      unlocked: Boolean(farmRecord.unlocked),
      totalPlots: Math.max(0, Math.round(totalPlots)),
      plantedPlots: Math.max(0, Math.round(plantedPlots)),
      wateredPlots: Math.max(0, Math.round(wateredPlots)),
      readyPlots: Math.max(0, Math.round(readyPlots)),
      cropCatalog,
      plots,
    };
  }

  private normalizeGameplayCraftingPayload(payload: unknown): FarmCraftingState | null {
    const root = this.asRecord(payload);
    if (!root) {
      return null;
    }

    const craftingRecord = this.asRecord(root.crafting) ?? root;
    const recipesRaw = Array.isArray(craftingRecord.recipes) ? craftingRecord.recipes : null;
    const craftableRecipes = this.asNumber(craftingRecord.craftableRecipes);
    if (!recipesRaw || craftableRecipes === null) {
      return null;
    }

    const recipes = recipesRaw
      .map((entry) => this.normalizeFarmCraftRecipeState(entry))
      .filter((entry): entry is FarmCraftRecipeState => entry !== null);

    return {
      unlocked: Boolean(craftingRecord.unlocked),
      craftableRecipes: Math.max(0, Math.round(craftableRecipes)),
      recipes,
    };
  }

  private normalizeFarmCraftRecipeState(payload: unknown): FarmCraftRecipeState | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const recipeKey = this.asString(record.recipeKey);
    const name = this.asString(record.name);
    const description = this.asString(record.description);
    const outputItemKey = this.asString(record.outputItemKey);
    const outputQuantity = this.asNumber(record.outputQuantity);
    const maxCraftable = this.asNumber(record.maxCraftable);
    const requiredFlags = Array.isArray(record.requiredFlags)
      ? record.requiredFlags
          .map((entry) => this.asString(entry))
          .filter((entry): entry is string => entry !== null)
      : [];
    const ingredientsRaw = Array.isArray(record.ingredients) ? record.ingredients : null;

    if (
      !recipeKey ||
      !name ||
      !description ||
      !outputItemKey ||
      outputQuantity === null ||
      maxCraftable === null ||
      !ingredientsRaw
    ) {
      return null;
    }

    const ingredients = ingredientsRaw
      .map((entry) => this.normalizeFarmCraftIngredientState(entry))
      .filter((entry): entry is FarmCraftIngredientState => entry !== null);

    return {
      recipeKey,
      name,
      description,
      outputItemKey,
      outputQuantity: Math.max(1, Math.round(outputQuantity)),
      requiredFlags,
      unlocked: Boolean(record.unlocked),
      ingredients,
      maxCraftable: Math.max(0, Math.round(maxCraftable)),
    };
  }

  private normalizeFarmCraftIngredientState(payload: unknown): FarmCraftIngredientState | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const itemKey = this.asString(record.itemKey);
    const requiredQuantity = this.asNumber(record.requiredQuantity);
    const ownedQuantity = this.asNumber(record.ownedQuantity);
    if (!itemKey || requiredQuantity === null || ownedQuantity === null) {
      return null;
    }

    return {
      itemKey,
      requiredQuantity: Math.max(1, Math.round(requiredQuantity)),
      ownedQuantity: Math.max(0, Math.round(ownedQuantity)),
    };
  }

  private normalizeFarmCropCatalogEntry(payload: unknown): FarmCropCatalogEntryState | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const cropKey = this.asString(record.cropKey);
    const seedItemKey = this.asString(record.seedItemKey);
    const harvestItemKey = this.asString(record.harvestItemKey);
    const growthDays = this.asNumber(record.growthDays);
    const requiredFlags = Array.isArray(record.requiredFlags)
      ? record.requiredFlags
          .map((entry) => this.asString(entry))
          .filter((entry): entry is string => entry !== null)
      : [];

    if (!cropKey || !seedItemKey || !harvestItemKey || growthDays === null) {
      return null;
    }

    return {
      cropKey,
      seedItemKey,
      harvestItemKey,
      growthDays: Math.max(1, Math.round(growthDays)),
      requiredFlags,
      unlocked: Boolean(record.unlocked),
    };
  }

  private normalizeFarmPlotState(payload: unknown): FarmPlotState | null {
    const record = this.asRecord(payload);
    if (!record) {
      return null;
    }

    const plotKey = this.asString(record.plotKey);
    const row = this.asNumber(record.row);
    const col = this.asNumber(record.col);
    const cropKey = this.asString(record.cropKey);
    const plantedDay = this.asNumber(record.plantedDay);
    const growthDays = this.asNumber(record.growthDays);
    const growthProgressDays = this.asNumber(record.growthProgressDays);
    const daysToMaturity = this.asNumber(record.daysToMaturity);

    if (!plotKey || row === null || col === null || growthProgressDays === null) {
      return null;
    }

    return {
      plotKey,
      row: Math.max(1, Math.round(row)),
      col: Math.max(1, Math.round(col)),
      cropKey: cropKey ?? null,
      plantedDay: plantedDay === null ? null : Math.max(1, Math.round(plantedDay)),
      growthDays: growthDays === null ? null : Math.max(1, Math.round(growthDays)),
      wateredToday: Boolean(record.wateredToday),
      growthProgressDays: Math.max(0, Math.round(growthProgressDays)),
      daysToMaturity: daysToMaturity === null ? null : Math.max(0, Math.round(daysToMaturity)),
      readyToHarvest: Boolean(record.readyToHarvest),
    };
  }

  private async fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (init.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });

    const rawBody = await response.text();
    const payload = rawBody.length > 0 ? this.safeParseJson(rawBody) : null;

    if (!response.ok) {
      const message = this.getPayloadMessage(payload) ?? `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload as T;
  }

  private safeParseJson(rawBody: string): unknown {
    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }

  private getPayloadMessage(payload: unknown): string | null {
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload.trim();
    }

    if (!this.isRecord(payload)) {
      return null;
    }

    const message = payload.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }

    if (Array.isArray(message)) {
      const parts = message
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => entry.trim());
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }

    const error = payload.error;
    if (typeof error === 'string' && error.trim().length > 0) {
      return error.trim();
    }

    return null;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    if (typeof error === 'string' && error.trim().length > 0) {
      return error.trim();
    }

    return fallback;
  }

  private normalizeQuestsPayload(payload: unknown): QuestState[] {
    if (!this.isRecord(payload)) {
      return [];
    }

    const rawQuests = payload.quests;
    if (!Array.isArray(rawQuests)) {
      return [];
    }

    return rawQuests
      .map((entry) => this.normalizeQuestState(entry))
      .filter((entry): entry is QuestState => entry !== null);
  }

  private normalizeBlacksmithPayload(payload: unknown): { offers: BlacksmithOfferState[] } {
    if (!this.isRecord(payload)) {
      return { offers: [] };
    }

    const shop = this.asRecord(payload.shop);
    if (!shop) {
      return { offers: [] };
    }

    const rawOffers = shop.offers;
    if (!Array.isArray(rawOffers)) {
      return { offers: [] };
    }

    const offers = rawOffers
      .map((entry) => this.normalizeBlacksmithOffer(entry))
      .filter((entry): entry is BlacksmithOfferState => entry !== null);

    return { offers };
  }

  private normalizeVillageMarketPayload(payload: unknown): {
    unlocked: boolean;
    seedOffers: VillageSeedOfferState[];
    cropBuybackOffers: VillageCropBuybackOfferState[];
  } {
    if (!this.isRecord(payload)) {
      return {
        unlocked: false,
        seedOffers: [],
        cropBuybackOffers: [],
      };
    }

    const shop = this.asRecord(payload.shop);
    if (!shop) {
      return {
        unlocked: false,
        seedOffers: [],
        cropBuybackOffers: [],
      };
    }

    const rawSeedOffers = Array.isArray(shop.seedOffers) ? shop.seedOffers : [];
    const rawBuybackOffers = Array.isArray(shop.cropBuybackOffers) ? shop.cropBuybackOffers : [];

    return {
      unlocked: Boolean(shop.unlocked),
      seedOffers: rawSeedOffers
        .map((entry) => this.normalizeVillageSeedOffer(entry))
        .filter((entry): entry is VillageSeedOfferState => entry !== null),
      cropBuybackOffers: rawBuybackOffers
        .map((entry) => this.normalizeVillageCropBuybackOffer(entry))
        .filter((entry): entry is VillageCropBuybackOfferState => entry !== null),
    };
  }

  private normalizeSaveSlotsPayload(payload: unknown): SaveSlotState[] {
    if (!this.isRecord(payload)) {
      return [];
    }

    const rawSlots = payload.slots;
    if (!Array.isArray(rawSlots)) {
      return [];
    }

    return rawSlots
      .map((entry) => this.normalizeSaveSlot(entry))
      .filter((entry): entry is SaveSlotState => entry !== null)
      .sort((left, right) => left.slot - right.slot);
  }

  private normalizeAutoSavePayload(payload: unknown): AutoSaveState | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const autosave = this.asRecord(payload.autosave);
    if (!autosave) {
      return null;
    }

    const version = this.asNumber(autosave.version);
    const reason = this.asString(autosave.reason);
    const updatedAt = this.asString(autosave.updatedAt);

    if (version === null || !reason || !updatedAt) {
      return null;
    }

    return {
      version: Math.max(1, Math.round(version)),
      reason,
      updatedAt,
    };
  }

  private normalizeHeroProfilePayload(payload: unknown): HeroProfileState | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const profile = this.asRecord(payload.profile);
    if (!profile) {
      return null;
    }

    const heroName = this.asString(profile.heroName);
    const appearanceValue = this.asString(profile.appearanceKey);
    const createdAt = this.asString(profile.createdAt);
    const updatedAt = this.asString(profile.updatedAt);

    if (!heroName || !appearanceValue || !createdAt || !updatedAt || !isHeroAppearanceKey(appearanceValue)) {
      return null;
    }

    return {
      heroName,
      appearanceKey: appearanceValue,
      createdAt,
      updatedAt,
    };
  }

  private normalizeSaveSlot(value: unknown): SaveSlotState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const slotValue = this.asNumber(value.slot);
    if (slotValue === null) {
      return null;
    }

    const slot = Math.round(slotValue);
    if (slot < 1 || slot > 3) {
      return null;
    }

    const exists = Boolean(value.exists);
    const versionValue = this.asNumber(value.version);
    const version = exists && versionValue !== null ? Math.max(1, Math.round(versionValue)) : null;
    const label = this.asString(value.label);
    const updatedAt = this.asString(value.updatedAt);

    return {
      slot,
      exists,
      version,
      label,
      updatedAt,
      preview: null,
    };
  }

  private normalizeSaveSlotPreviewPayload(payload: unknown): SaveSlotPreview | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const save = this.asRecord(payload.save);
    if (!save) {
      return null;
    }

    const snapshot = this.asRecord(save.snapshot);
    if (!snapshot) {
      return null;
    }

    return this.normalizeSaveSlotPreview(snapshot);
  }

  private normalizeSaveSlotPreview(snapshot: Record<string, unknown>): SaveSlotPreview | null {
    const player = this.asRecord(snapshot.player);
    const tower = this.asRecord(snapshot.tower);

    if (!player && !tower && !Array.isArray(snapshot.inventory) && !Array.isArray(snapshot.equipment)) {
      return null;
    }

    const levelValue = player ? this.asNumber(player.level) : null;
    const goldValue = player ? this.asNumber(player.gold) : null;
    const floorCurrentValue = tower ? this.asNumber(tower.currentFloor) : null;
    const floorHighestValue = tower ? this.asNumber(tower.highestFloor) : null;

    const rawInventory = Array.isArray(snapshot.inventory) ? snapshot.inventory : [];
    const inventory = rawInventory
      .map((entry) => this.normalizeSaveSlotPreviewInventoryItem(entry))
      .filter((entry): entry is { itemKey: string; quantity: number } => entry !== null)
      .sort((left, right) => right.quantity - left.quantity || left.itemKey.localeCompare(right.itemKey));

    const rawEquipment = Array.isArray(snapshot.equipment) ? snapshot.equipment : [];
    const equipment = rawEquipment
      .map((entry) => this.normalizeSaveSlotPreviewEquipmentItem(entry))
      .filter((entry): entry is { slot: string; itemKey: string } => entry !== null)
      .sort((left, right) => left.slot.localeCompare(right.slot));

    return {
      playerLevel: levelValue !== null ? Math.max(1, Math.round(levelValue)) : null,
      gold: goldValue !== null ? Math.max(0, Math.round(goldValue)) : null,
      towerCurrentFloor: floorCurrentValue !== null ? Math.max(1, Math.round(floorCurrentValue)) : null,
      towerHighestFloor: floorHighestValue !== null ? Math.max(1, Math.round(floorHighestValue)) : null,
      inventoryTop: inventory.slice(0, 3),
      equipmentTop: equipment.slice(0, 3),
      equippedCount: equipment.length,
    };
  }

  private normalizeSaveSlotPreviewInventoryItem(value: unknown): { itemKey: string; quantity: number } | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const itemKey = this.asString(value.itemKey);
    const quantity = this.asNumber(value.quantity);
    if (!itemKey || quantity === null) {
      return null;
    }

    const roundedQuantity = Math.round(quantity);
    if (roundedQuantity <= 0) {
      return null;
    }

    return {
      itemKey,
      quantity: roundedQuantity,
    };
  }

  private normalizeSaveSlotPreviewEquipmentItem(value: unknown): { slot: string; itemKey: string } | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const slot = this.asString(value.slot);
    const itemKey = this.asString(value.itemKey);
    if (!slot || !itemKey) {
      return null;
    }

    return {
      slot,
      itemKey,
    };
  }

  private normalizeBlacksmithOffer(value: unknown): BlacksmithOfferState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const offerKey = this.asString(value.offerKey);
    const itemKey = this.asString(value.itemKey);
    const name = this.asString(value.name);
    const description = this.asString(value.description);
    const goldPrice = this.asNumber(value.goldPrice);

    if (!offerKey || !itemKey || !name || !description || goldPrice === null) {
      return null;
    }

    return {
      offerKey,
      itemKey,
      name,
      description,
      goldPrice: Math.max(0, Math.round(goldPrice)),
    };
  }

  private normalizeVillageSeedOffer(value: unknown): VillageSeedOfferState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const offerKey = this.asString(value.offerKey);
    const itemKey = this.asString(value.itemKey);
    const name = this.asString(value.name);
    const description = this.asString(value.description);
    const goldPrice = this.asNumber(value.goldPrice);

    if (!offerKey || !itemKey || !name || !description || goldPrice === null) {
      return null;
    }

    return {
      offerKey,
      itemKey,
      name,
      description,
      goldPrice: Math.max(0, Math.round(goldPrice)),
    };
  }

  private normalizeVillageCropBuybackOffer(value: unknown): VillageCropBuybackOfferState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const itemKey = this.asString(value.itemKey);
    const name = this.asString(value.name);
    const description = this.asString(value.description);
    const goldValue = this.asNumber(value.goldValue);
    const ownedQuantity = this.asNumber(value.ownedQuantity);

    if (!itemKey || !name || !description || goldValue === null || ownedQuantity === null) {
      return null;
    }

    return {
      itemKey,
      name,
      description,
      goldValue: Math.max(0, Math.round(goldValue)),
      ownedQuantity: Math.max(0, Math.round(ownedQuantity)),
    };
  }

  private normalizeQuestState(value: unknown): QuestState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const key = this.asString(value.key);
    const title = this.asString(value.title);
    const description = this.asString(value.description);
    const status = this.asQuestStatus(value.status);
    const rawObjectives = value.objectives;

    if (!key || !title || !description || !status || !Array.isArray(rawObjectives)) {
      return null;
    }

    const objectives = rawObjectives
      .map((objective) => this.normalizeQuestObjective(objective))
      .filter((objective): objective is QuestObjectiveState => objective !== null);

    return {
      key,
      title,
      description,
      status,
      canClaim: Boolean(value.canClaim),
      objectives,
    };
  }

  private normalizeQuestObjective(value: unknown): QuestObjectiveState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const key = this.asString(value.key);
    const description = this.asString(value.description);
    const current = this.asNumber(value.current);
    const target = this.asNumber(value.target);

    if (!key || !description || current === null || target === null) {
      return null;
    }

    return {
      key,
      description,
      current: Math.max(0, Math.round(current)),
      target: Math.max(1, Math.round(target)),
      completed: Boolean(value.completed),
    };
  }

  private normalizeCombatPayload(payload: unknown): CombatEncounterState | null {
    if (!this.isRecord(payload)) {
      return null;
    }

    const directEncounter = this.extractCombatStateCandidate(payload.encounter);
    if (directEncounter) {
      return directEncounter;
    }

    const nestedState = this.extractCombatStateCandidate(payload.state);
    if (nestedState) {
      return nestedState;
    }

    const dataState = this.extractCombatStateCandidate(payload.data);
    if (dataState) {
      return dataState;
    }

    return this.normalizeCombatState(payload);
  }

  private extractCombatStateCandidate(value: unknown): CombatEncounterState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    if (this.isRecord(value.encounter)) {
      const fromEncounter = this.normalizeCombatState(value.encounter);
      if (fromEncounter) {
        return fromEncounter;
      }
    }

    if (this.isRecord(value.state)) {
      const fromState = this.normalizeCombatState(value.state);
      if (fromState) {
        return fromState;
      }
    }

    if (this.isRecord(value.data)) {
      const fromData = this.normalizeCombatState(value.data);
      if (fromData) {
        return fromData;
      }
    }

    return this.normalizeCombatState(value);
  }

  private normalizeCombatState(value: unknown): CombatEncounterState | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const id = this.asString(value.id);
    const status = this.asCombatStatus(value.status);
    const turn = this.asCombatTurn(value.turn) ?? 'player';
    const round = this.asNumber(value.round) ?? 1;
    const playerRecord = this.asRecord(value.player);
    const enemyRecord = this.asRecord(value.enemy);

    if (!id || !status || !playerRecord || !enemyRecord) {
      return null;
    }

    const player = this.normalizePlayerState(playerRecord);
    const enemy = this.normalizeEnemyState(enemyRecord);

    if (!player || !enemy) {
      return null;
    }

    return {
      id,
      status,
      turn,
      round,
      logs: this.asStringArray(value.logs).slice(-20),
      scriptState: this.normalizeCombatScriptState(value.scriptState),
      player,
      enemy,
      lastAction: this.asString(value.lastAction),
      rewards: this.normalizeCombatRewardSummary(value.rewards),
      defeatPenalty: this.normalizeCombatDefeatPenalty(value.defeatPenalty),
      recap: this.normalizeCombatRecap(value.recap),
      createdAt: this.asString(value.createdAt) ?? undefined,
      updatedAt: this.asString(value.updatedAt) ?? undefined,
      endedAt: this.asString(value.endedAt) ?? null,
    };
  }

  private normalizeCombatScriptState(value: unknown): Record<string, boolean | number | string> {
    if (!this.isRecord(value)) {
      return {};
    }

    const normalized: Record<string, boolean | number | string> = {};
    for (const [key, entryValue] of Object.entries(value)) {
      if (
        typeof entryValue === 'boolean' ||
        typeof entryValue === 'number' ||
        typeof entryValue === 'string'
      ) {
        normalized[key] = entryValue;
      }
    }

    return normalized;
  }

  private normalizePlayerState(value: Record<string, unknown>): CombatUnitState | null {
    const hp = this.asNumber(value.hp);
    const maxHp = this.asNumber(value.maxHp) ?? hp;
    const mp = this.asNumber(value.mp);
    const maxMp = this.asNumber(value.maxMp) ?? mp;

    if (hp === null || maxHp === null || mp === null || maxMp === null) {
      return null;
    }

    return {
      hp,
      maxHp,
      mp,
      maxMp,
      attack: this.asNumber(value.attack) ?? 0,
      defense: this.asNumber(value.defense) ?? 0,
      magicAttack: this.asNumber(value.magicAttack) ?? 0,
      speed: this.asNumber(value.speed) ?? 0,
      defending: Boolean(value.defending),
    };
  }

  private normalizeEnemyState(value: Record<string, unknown>): CombatEnemyState | null {
    const baseHp = this.asNumber(value.hp);
    const baseMp = this.asNumber(value.mp);
    const currentHp = this.asNumber(value.currentHp) ?? baseHp;
    const currentMp = this.asNumber(value.currentMp) ?? baseMp;

    if (baseHp === null || baseMp === null || currentHp === null || currentMp === null) {
      return null;
    }

    return {
      key: this.asString(value.key) ?? 'enemy',
      name: this.asString(value.name) ?? 'Enemy',
      hp: baseHp,
      mp: baseMp,
      currentHp,
      currentMp,
      attack: this.asNumber(value.attack) ?? 0,
      defense: this.asNumber(value.defense) ?? 0,
      magicAttack: this.asNumber(value.magicAttack) ?? 0,
      speed: this.asNumber(value.speed) ?? 0,
    };
  }

  private normalizeCombatRewardSummary(value: unknown): CombatRewardSummary | null {
    if (!this.isRecord(value)) {
      return null;
    }

    return {
      experience: Math.max(0, Math.round(this.asNumber(value.experience) ?? 0)),
      gold: Math.max(0, Math.round(this.asNumber(value.gold) ?? 0)),
      items: this.normalizeCombatRewardItems(value.items),
      levelBefore: Math.max(1, Math.round(this.asNumber(value.levelBefore) ?? 1)),
      levelAfter: Math.max(1, Math.round(this.asNumber(value.levelAfter) ?? 1)),
    };
  }

  private normalizeCombatRewardItems(value: unknown): CombatRewardItem[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const items: CombatRewardItem[] = [];
    for (const entry of value) {
      if (!this.isRecord(entry)) {
        continue;
      }

      const itemKey = this.asString(entry.itemKey);
      const quantity = this.asNumber(entry.quantity);
      if (!itemKey || quantity === null) {
        continue;
      }

      items.push({
        itemKey,
        quantity: Math.max(0, Math.round(quantity)),
        rarity: this.asString(entry.rarity) ?? 'common',
        source: this.asString(entry.source) ?? 'enemy',
      });
    }

    return items;
  }

  private normalizeCombatDefeatPenalty(value: unknown): CombatDefeatPenaltySummary | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const itemsLost = Array.isArray(value.itemsLost)
      ? value.itemsLost
          .filter((entry): entry is Record<string, unknown> => this.isRecord(entry))
          .map((entry) => ({
            itemKey: this.asString(entry.itemKey) ?? 'item',
            quantity: Math.max(0, Math.round(this.asNumber(entry.quantity) ?? 0)),
          }))
      : [];

    return {
      goldLossPercent: Math.max(0, Math.round(this.asNumber(value.goldLossPercent) ?? 0)),
      goldLost: Math.max(0, Math.round(this.asNumber(value.goldLost) ?? 0)),
      itemsLost,
      respawnZone: this.asString(value.respawnZone) ?? 'Ferme',
      respawnDay: Math.max(1, Math.round(this.asNumber(value.respawnDay) ?? 1)),
      playerHpAfterDefeat: Math.max(0, Math.round(this.asNumber(value.playerHpAfterDefeat) ?? 1)),
    };
  }

  private normalizeCombatRecap(value: unknown): CombatEncounterRecap | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const rewardsRecord = this.asRecord(value.rewards);
    const penaltiesRecord = this.asRecord(value.penalties);
    const outcome = this.asCombatStatus(value.outcome) ?? this.combatState?.status ?? 'active';

    return {
      outcome,
      rounds: Math.max(1, Math.round(this.asNumber(value.rounds) ?? 1)),
      damageDealt: Math.max(0, Math.round(this.asNumber(value.damageDealt) ?? 0)),
      damageTaken: Math.max(0, Math.round(this.asNumber(value.damageTaken) ?? 0)),
      healingDone: Math.max(0, Math.round(this.asNumber(value.healingDone) ?? 0)),
      mpSpent: Math.max(0, Math.round(this.asNumber(value.mpSpent) ?? 0)),
      mpRecovered: Math.max(0, Math.round(this.asNumber(value.mpRecovered) ?? 0)),
      poisonApplied: Math.max(0, Math.round(this.asNumber(value.poisonApplied) ?? 0)),
      ceciteApplied: Math.max(0, Math.round(this.asNumber(value.ceciteApplied) ?? 0)),
      obscuriteApplied: Math.max(0, Math.round(this.asNumber(value.obscuriteApplied) ?? 0)),
      debuffsCleansed: Math.max(0, Math.round(this.asNumber(value.debuffsCleansed) ?? 0)),
      blindMisses: Math.max(0, Math.round(this.asNumber(value.blindMisses) ?? 0)),
      rewards: {
        experience: Math.max(0, Math.round(this.asNumber(rewardsRecord?.experience) ?? 0)),
        gold: Math.max(0, Math.round(this.asNumber(rewardsRecord?.gold) ?? 0)),
        lootItems: Math.max(0, Math.round(this.asNumber(rewardsRecord?.lootItems) ?? 0)),
      },
      penalties: {
        goldLost: Math.max(0, Math.round(this.asNumber(penaltiesRecord?.goldLost) ?? 0)),
        itemsLost: Math.max(0, Math.round(this.asNumber(penaltiesRecord?.itemsLost) ?? 0)),
      },
    };
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return this.isRecord(value) ? value : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry) => entry.trim());
  }

  private asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private asCombatUiStatus(value: unknown): CombatUiStatus | null {
    if (value === 'idle' || value === 'loading' || value === 'error') {
      return value;
    }

    return this.asCombatStatus(value);
  }

  private asCombatStatus(value: unknown): CombatStatus | null {
    if (value === 'active' || value === 'won' || value === 'lost' || value === 'fled') {
      return value;
    }

    return null;
  }

  private asQuestStatus(value: unknown): QuestStatus | null {
    if (value === 'active' || value === 'completed' || value === 'claimed') {
      return value;
    }

    return null;
  }

  private asCombatTurn(value: unknown): CombatTurn | null {
    if (value === 'player' || value === 'enemy') {
      return value;
    }

    return null;
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
    const graphics = this.add.graphics();

    graphics.fillStyle(0x1a6a3f, 1);
    graphics.fillRect(0, 0, 1600, 900);

    graphics.fillStyle(0x5c9a58, 1);
    for (let x = 0; x < 1600; x += 64) {
      for (let y = 0; y < 900; y += 64) {
        const offset = (x + y) % 2 === 0 ? 6 : 0;
        graphics.fillRect(x + offset, y + offset, 56, 56);
      }
    }

    graphics.lineStyle(1, 0x88a97d, 0.3);
    for (let x = 0; x <= 1600; x += 64) {
      graphics.lineBetween(x, 0, x, 900);
    }
    for (let y = 0; y <= 900; y += 64) {
      graphics.lineBetween(0, y, 1600, y);
    }

    graphics.fillStyle(0x8a6d3b, 1);
    graphics.fillRoundedRect(180, 140, 140, 90, 12);
    graphics.fillStyle(0xb98b4d, 1);
    graphics.fillRoundedRect(178, 138, 144, 10, 4);
    graphics.fillStyle(0xd9c28b, 1);
    graphics.fillRect(232, 174, 32, 56);

    graphics.fillStyle(0x4a6fa5, 1);
    graphics.fillRoundedRect(820, 420, 170, 110, 14);
    graphics.fillStyle(0x9dc0eb, 1);
    graphics.fillRect(900, 454, 28, 44);

    graphics.fillStyle(0x754d2b, 1);
    graphics.fillRoundedRect(1120, 120, 160, 130, 14);
    graphics.fillStyle(0x493022, 1);
    graphics.fillRect(1182, 170, 36, 80);

    graphics.destroy();
  }

  private createObstacle(x: number, y: number, width: number, height: number): Phaser.GameObjects.Rectangle {
    const obstacle = this.add.rectangle(x, y, width, height, 0x354b2f, 0.35);
    this.physics.add.existing(obstacle, true);
    return obstacle;
  }
}
