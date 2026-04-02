import type Phaser from 'phaser';
import type { FarmPlotState } from './services/payloadNormalizers';

export type HudState = {
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

export type VillageNpcHudEntry = {
  stateKey: string;
  available: boolean;
};

export type VillageNpcRelationshipTier = 'stranger' | 'familiar' | 'trusted' | 'ally';
export type VillageNpcKey = 'mayor' | 'blacksmith' | 'merchant';

export type VillageNpcRelationshipHudEntry = {
  friendship: number;
  tier: VillageNpcRelationshipTier;
  lastInteractionDay: number | null;
  canTalkToday: boolean;
};

export type VillageNpcHudState = {
  mayor: VillageNpcHudEntry;
  blacksmith: VillageNpcHudEntry;
  merchant: VillageNpcHudEntry;
};

export type VillageNpcRelationshipHudState = {
  mayor: VillageNpcRelationshipHudEntry;
  blacksmith: VillageNpcRelationshipHudEntry;
  merchant: VillageNpcRelationshipHudEntry;
};

export type CombatStatus = 'active' | 'won' | 'lost' | 'fled';
export type CombatTurn = 'player' | 'enemy';
export type CombatUiStatus = CombatStatus | 'idle' | 'loading' | 'error';
export type CombatActionName =
  | 'attack'
  | 'defend'
  | 'fireball'
  | 'rally'
  | 'sunder'
  | 'mend'
  | 'cleanse'
  | 'interrupt';
export type QuestStatus = 'active' | 'completed' | 'claimed';
export type DebugQaActionName =
  | 'grant-resources'
  | 'set-tower-floor'
  | 'apply-state-preset'
  | 'apply-loadout-preset'
  | 'complete-quests'
  | 'set-world-flags'
  | 'set-quest-status';
export type DebugLoadoutPresetKey = 'starter' | 'tower_mid' | 'boss_trial';
export type DebugStatePresetKey = 'village_open' | 'mid_tower' | 'act1_done';
export type DebugQaStatus = 'idle' | 'loading' | 'success' | 'error';
export type DebugQaRecapOutcomeFilter = 'all' | CombatStatus;
export type CombatEffectTone = 'neutral' | 'calm' | 'warning' | 'danger' | 'utility';
export type DebugQaReplayAutoPlaySpeedKey = 'slow' | 'normal' | 'fast';
export type StripCalibrationPresetKey = 'manifest' | 'snappy' | 'cinematic';

export type CombatDebugPlayerSkillSummary = {
  key: CombatActionName;
  label: string;
  manaCost: number;
  blockedBySilence: boolean;
  description: string;
};

export type CombatDebugEnemySummary = {
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

export type CombatDebugEnemyIntentSummary = {
  key: string;
  label: string;
  interruptible: boolean;
  trigger: string;
};

export type CombatDebugEnemyScriptSummary = {
  enemyKey: string;
  enemyName: string;
  scriptedFloor: number | null;
  scriptedBossEncounter: boolean;
  intents: CombatDebugEnemyIntentSummary[];
};

export type CombatDebugReference = {
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


export type CombatUnitState = {
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

export type CombatEnemyState = {
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

export type CombatRewardItem = {
  itemKey: string;
  quantity: number;
  rarity: string;
  source: string;
};

export type CombatRewardSummary = {
  experience: number;
  gold: number;
  items: CombatRewardItem[];
  levelBefore: number;
  levelAfter: number;
};

export type CombatDefeatPenaltySummary = {
  goldLossPercent: number;
  goldLost: number;
  itemsLost: Array<{ itemKey: string; quantity: number }>;
  respawnZone: string;
  respawnDay: number;
  playerHpAfterDefeat: number;
};

export type CombatEncounterRecap = {
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

export type CombatEncounterState = {
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

export type CombatEffectChip = {
  label: string;
  tone: CombatEffectTone;
};

export type SpriteManifest = {
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

export type SpriteManifestPortraitState = 'normal' | 'hit' | 'cast';

export type SpriteManifestPortraitEntry = {
  key?: string;
  path?: string;
  states?: Partial<Record<SpriteManifestPortraitState, string>>;
};

export type SpriteManifestSpriteEntry = {
  key: string;
  path: string;
  scale: { x: number; y: number };
  origin: { x: number; y: number };
  physics: { width: number; height: number; offsetX: number; offsetY: number };
};

export type SpriteManifestStripEntry = {
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

export type QuestObjectiveState = {
  key: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
};

export type QuestState = {
  key: string;
  title: string;
  description: string;
  status: QuestStatus;
  canClaim: boolean;
  objectives: QuestObjectiveState[];
};

export type FarmPlotPhase = 'empty' | 'planted' | 'watered' | 'ready';

export type FarmScenePlotSlot = {
  plotKey: string;
  row: number;
  col: number;
  plot: FarmPlotState | null;
};

export type FarmScenePlotVisual = {
  slot: FarmScenePlotSlot;
  frame: Phaser.GameObjects.Rectangle;
  bed: Phaser.GameObjects.Rectangle;
  crop: Phaser.GameObjects.Rectangle;
  badge: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
};

export type AutoSaveState = {
  version: number;
  reason: string;
  updatedAt: string;
};

export type SaveSlotState = {
  slot: number;
  exists: boolean;
  version: number | null;
  label: string | null;
  updatedAt: string | null;
  preview: SaveSlotPreview | null;
};

export type SaveSlotPreview = {
  playerLevel: number | null;
  gold: number | null;
  towerCurrentFloor: number | null;
  towerHighestFloor: number | null;
  inventoryTop: Array<{ itemKey: string; quantity: number }>;
  equipmentTop: Array<{ slot: string; itemKey: string }>;
  equippedCount: number;
};

export type HeroAppearanceKey = 'default' | 'ember' | 'forest' | 'night';

export type HeroProfileState = {
  heroName: string;
  appearanceKey: HeroAppearanceKey;
  createdAt: string;
  updatedAt: string;
};

export type IntroNarrativeStepKey =
  | 'arrive_village'
  | 'meet_mayor'
  | 'farm_assignment'
  | 'completed';

export type IntroNarrativeState = {
  currentStep: IntroNarrativeStepKey;
  completed: boolean;
  steps: {
    arriveVillage: boolean;
    metMayor: boolean;
    farmAssigned: boolean;
  };
};

export type DebugQaPresetOption = {
  key: string;
  label: string;
};

export type DebugQaTracePayload = {
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

export type ImportedDebugQaTrace = {
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

export type StripAnimationName = 'idle' | 'hit' | 'cast';

export type HudStripPlaybackState = {
  enemyKey: string;
  stripKey: string;
  animation: StripAnimationName;
  frames: number[];
  frameCount: number;
  frameCursor: number;
};

export type DebugQaReplayBaseline = {
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

export type DebugQaStepReplayState = {
  logs: string[];
  stepIndex: number;
  totalSteps: number;
  finalTrace: ImportedDebugQaTrace;
  baseline: DebugQaReplayBaseline;
};

export type StripCalibrationPreset = {
  key: StripCalibrationPresetKey;
  label: string;
  playerFpsMultiplier: number;
  playerActionDurationMultiplier: number;
  hudIntervalMultiplier: number;
  hudActionDurationMultiplier: number;
};

