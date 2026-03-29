import type { CombatEnemyDefinition } from './combat.types';

export const COMBAT_ENCOUNTERS_TABLE = 'combat_encounters';

export const COMBAT_STATUSES = ['active', 'won', 'lost', 'fled'] as const;
export const COMBAT_ACTIONS = ['attack', 'defend', 'fireball'] as const;

export const COMBAT_LOG_LIMIT = 20;
export const FIREBALL_MANA_COST = 5;
export const DEFAULT_COMBAT_ENEMY_KEY = 'forest_goblin';
export const TOWER_FLOOR_SCRIPTED_ENEMIES: Record<number, string> = {
  3: 'thorn_beast_alpha',
  5: 'cinder_warden',
  8: 'ash_vanguard_captain',
  10: 'curse_heart_avatar',
};

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
  thorn_beast_alpha: {
    key: 'thorn_beast_alpha',
    name: 'Thorn Beast Alpha',
    hp: 42,
    mp: 6,
    attack: 9,
    defense: 3,
    magicAttack: 4,
    speed: 4,
    rewards: {
      experience: 64,
      gold: 30,
      loot: [
        {
          itemKey: 'thorn_shard',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.8,
        },
        {
          itemKey: 'healing_herb',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.6,
        },
      ],
    },
  },
  cinder_warden: {
    key: 'cinder_warden',
    name: 'Cinder Warden',
    hp: 56,
    mp: 16,
    attack: 11,
    defense: 4,
    magicAttack: 10,
    speed: 5,
    rewards: {
      experience: 94,
      gold: 46,
      loot: [
        {
          itemKey: 'ember_dust',
          minQuantity: 2,
          maxQuantity: 3,
          chance: 0.9,
        },
        {
          itemKey: 'mana_tonic',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 0.55,
        },
      ],
    },
  },
  ash_vanguard_captain: {
    key: 'ash_vanguard_captain',
    name: 'Ash Vanguard Captain',
    hp: 74,
    mp: 20,
    attack: 14,
    defense: 6,
    magicAttack: 11,
    speed: 8,
    rewards: {
      experience: 140,
      gold: 72,
      loot: [
        {
          itemKey: 'scout_badge',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.8,
        },
        {
          itemKey: 'iron_ore',
          minQuantity: 2,
          maxQuantity: 3,
          chance: 0.75,
        },
      ],
    },
  },
  curse_heart_avatar: {
    key: 'curse_heart_avatar',
    name: 'Curse Heart Avatar',
    hp: 108,
    mp: 30,
    attack: 18,
    defense: 8,
    magicAttack: 16,
    speed: 9,
    rewards: {
      experience: 220,
      gold: 120,
      loot: [
        {
          itemKey: 'cursed_core_fragment',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 1,
        },
        {
          itemKey: 'mana_tonic',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.8,
        },
      ],
    },
  },
};
