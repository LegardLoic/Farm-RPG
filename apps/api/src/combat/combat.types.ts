export type CombatStatus = 'active' | 'won' | 'lost' | 'fled';
export type CombatActionName = 'attack' | 'defend' | 'fireball' | 'rally' | 'sunder';
export type CombatTurn = 'player' | 'enemy';
export type CombatLootRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type CombatLootSource = 'enemy' | 'floor' | 'boss';

export interface CombatUnitState {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  defending: boolean;
}

export interface CombatLootDropDefinition {
  itemKey: string;
  minQuantity: number;
  maxQuantity: number;
  chance: number;
  rarity?: CombatLootRarity;
}

export interface CombatRewardProfile {
  experience: number;
  gold: number;
  loot: CombatLootDropDefinition[];
}

export interface CombatEnemyDefinition {
  key: string;
  name: string;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  rewards: CombatRewardProfile;
}

export interface CombatRewardItem {
  itemKey: string;
  quantity: number;
  rarity: CombatLootRarity;
  source: CombatLootSource;
}

export interface CombatRewardSummary {
  experience: number;
  gold: number;
  items: CombatRewardItem[];
  levelBefore: number;
  levelAfter: number;
}

export interface CombatEncounterState {
  id: string;
  userId: string;
  enemyKey: string;
  towerFloor: number;
  isScriptedBossEncounter: boolean;
  turn: CombatTurn;
  status: CombatStatus;
  round: number;
  logs: string[];
  player: CombatUnitState;
  enemy: CombatEnemyDefinition & { currentHp: number; currentMp: number };
  scriptState?: Record<string, boolean | number | string>;
  lastAction: CombatActionName | null;
  rewards: CombatRewardSummary | null;
  rewardsGranted: boolean;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

export interface CombatEncounterSummary {
  id: string;
  enemyKey: string;
  status: CombatStatus;
  turn: CombatTurn;
  round: number;
  createdAt: string;
  updatedAt: string;
}

export interface CombatActionResult {
  encounter: CombatEncounterState;
  summary: CombatEncounterSummary;
}
