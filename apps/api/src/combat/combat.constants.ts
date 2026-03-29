import type { CombatEnemyDefinition } from './combat.types';

export const COMBAT_ENCOUNTERS_TABLE = 'combat_encounters';
export const PLAYER_PROGRESSION_TABLE = 'player_progression';

export const COMBAT_STATUSES = ['active', 'won', 'lost', 'fled'] as const;
export const COMBAT_ACTIONS = ['attack', 'defend', 'fireball'] as const;

export const COMBAT_LOG_LIMIT = 20;
export const FIREBALL_MANA_COST = 5;
export const DEFAULT_COMBAT_ENEMY_KEY = 'forest_goblin';

export const BASE_PLAYER_LEVEL = 1;
export const BASE_PLAYER_EXPERIENCE = 0;
export const BASE_PLAYER_GOLD = 120;

export const DEFAULT_PLAYER_COMBAT_STATE = {
  hp: 32,
  maxHp: 32,
  mp: 15,
  maxMp: 15,
  attack: 7,
  defense: 2,
  magicAttack: 10,
  speed: 6,
  defending: false,
} as const;

export const COMBAT_ENEMY_DEFINITIONS: Record<string, CombatEnemyDefinition> = {
  forest_goblin: {
    key: 'forest_goblin',
    name: 'Forest Goblin',
    hp: 24,
    mp: 4,
    attack: 5,
    defense: 1,
    magicAttack: 2,
    speed: 4,
    rewards: {
      experience: 28,
      gold: 12,
      loot: [
        {
          itemKey: 'goblin_ear',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.85,
        },
        {
          itemKey: 'healing_herb',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 0.35,
        },
      ],
    },
  },
  training_dummy: {
    key: 'training_dummy',
    name: 'Training Dummy',
    hp: 18,
    mp: 0,
    attack: 3,
    defense: 0,
    magicAttack: 0,
    speed: 1,
    rewards: {
      experience: 12,
      gold: 4,
      loot: [
        {
          itemKey: 'wood_scrap',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 0.75,
        },
      ],
    },
  },
  ash_scout: {
    key: 'ash_scout',
    name: 'Ash Scout',
    hp: 20,
    mp: 6,
    attack: 6,
    defense: 2,
    magicAttack: 4,
    speed: 6,
    rewards: {
      experience: 36,
      gold: 18,
      loot: [
        {
          itemKey: 'scout_badge',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 0.45,
        },
        {
          itemKey: 'ember_dust',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.6,
        },
      ],
    },
  },
};
