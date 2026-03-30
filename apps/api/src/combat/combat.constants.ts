import type { CombatEnemyDefinition, CombatLootDropDefinition } from './combat.types';

export const COMBAT_ENCOUNTERS_TABLE = 'combat_encounters';

export const COMBAT_STATUSES = ['active', 'won', 'lost', 'fled'] as const;
export const COMBAT_ACTIONS = [
  'attack',
  'defend',
  'fireball',
  'rally',
  'sunder',
  'mend',
  'cleanse',
  'interrupt',
] as const;

export const COMBAT_LOG_LIMIT = 20;
export const FIREBALL_MANA_COST = 5;
export const RALLY_MANA_COST = 3;
export const SUNDER_MANA_COST = 4;
export const MEND_MANA_COST = 3;
export const CLEANSE_MANA_COST = 3;
export const INTERRUPT_MANA_COST = 4;
export const PLAYER_BURNING_DAMAGE = 2;
export const PLAYER_BURNING_DURATION_TURNS = 2;
export const PLAYER_SILENCED_DURATION_TURNS = 2;
export const RALLY_DURATION_TURNS = 2;
export const SUNDER_DURATION_TURNS = 2;
export const CLEANSE_REACTION_WINDOW_TURNS = 1;
export const INTERRUPT_REACTION_WINDOW_TURNS = 2;
export const DEFEAT_GOLD_LOSS_PERCENT_MIN = 10;
export const DEFEAT_GOLD_LOSS_PERCENT_MAX = 30;
export const DEFEAT_ITEM_STACKS_LOST_MIN = 1;
export const DEFEAT_ITEM_STACKS_LOST_MAX = 3;
export const THORN_BEAST_ALPHA_ROOT_SMASH_INTERVAL = 3;
export const CINDER_WARDEN_CINDER_BURST_INTERVAL = 3;
export const ASH_VANGUARD_CAPTAIN_TWIN_SLASH_INTERVAL = 4;
export const CURSE_HEART_AVATAR_CATACLYSM_INTERVAL = 2;
export const CINDER_WARDEN_PURGE_MANA_COST = 4;
export const ASH_CAPTAIN_PURGE_MANA_COST = 4;
export const CURSE_AVATAR_DISPEL_MANA_COST = 5;
export const DEFAULT_COMBAT_ENEMY_KEY = 'forest_goblin';
export const TOWER_FLOOR_SCRIPTED_ENEMIES: Record<number, string> = {
  3: 'thorn_beast_alpha',
  5: 'cinder_warden',
  8: 'ash_vanguard_captain',
  10: 'curse_heart_avatar',
};

export const FLOOR_LOOT_TABLES: Array<{
  key: string;
  minFloor: number;
  maxFloor: number;
  drops: CombatLootDropDefinition[];
}> = [
  {
    key: 'floor_1_2',
    minFloor: 1,
    maxFloor: 2,
    drops: [
      {
        itemKey: 'healing_herb',
        minQuantity: 1,
        maxQuantity: 1,
        chance: 0.4,
        rarity: 'common',
      },
      {
        itemKey: 'wood_scrap',
        minQuantity: 1,
        maxQuantity: 2,
        chance: 0.55,
        rarity: 'common',
      },
    ],
  },
  {
    key: 'floor_3_4',
    minFloor: 3,
    maxFloor: 4,
    drops: [
      {
        itemKey: 'thorn_shard',
        minQuantity: 1,
        maxQuantity: 2,
        chance: 0.45,
        rarity: 'uncommon',
      },
      {
        itemKey: 'healing_herb',
        minQuantity: 1,
        maxQuantity: 2,
        chance: 0.35,
        rarity: 'common',
      },
    ],
  },
  {
    key: 'floor_5_7',
    minFloor: 5,
    maxFloor: 7,
    drops: [
      {
        itemKey: 'ember_dust',
        minQuantity: 1,
        maxQuantity: 2,
        chance: 0.5,
        rarity: 'uncommon',
      },
      {
        itemKey: 'mana_tonic',
        minQuantity: 1,
        maxQuantity: 1,
        chance: 0.25,
        rarity: 'rare',
      },
    ],
  },
  {
    key: 'floor_8_10',
    minFloor: 8,
    maxFloor: 10,
    drops: [
      {
        itemKey: 'iron_ore',
        minQuantity: 1,
        maxQuantity: 3,
        chance: 0.55,
        rarity: 'uncommon',
      },
      {
        itemKey: 'scout_badge',
        minQuantity: 1,
        maxQuantity: 1,
        chance: 0.3,
        rarity: 'rare',
      },
      {
        itemKey: 'mana_tonic',
        minQuantity: 1,
        maxQuantity: 1,
        chance: 0.2,
        rarity: 'rare',
      },
    ],
  },
];

export const BOSS_SPECIFIC_BONUS_LOOT: Record<string, CombatLootDropDefinition[]> = {
  thorn_beast_alpha: [
    {
      itemKey: 'alpha_thorn_core',
      minQuantity: 1,
      maxQuantity: 1,
      chance: 0.5,
      rarity: 'rare',
    },
  ],
  cinder_warden: [
    {
      itemKey: 'warden_ember_plate',
      minQuantity: 1,
      maxQuantity: 1,
      chance: 0.45,
      rarity: 'rare',
    },
  ],
  ash_vanguard_captain: [
    {
      itemKey: 'vanguard_insignia',
      minQuantity: 1,
      maxQuantity: 1,
      chance: 0.4,
      rarity: 'rare',
    },
    {
      itemKey: 'tempered_alloy',
      minQuantity: 1,
      maxQuantity: 1,
      chance: 0.16,
      rarity: 'epic',
    },
  ],
  curse_heart_avatar: [
    {
      itemKey: 'curse_heart_shard',
      minQuantity: 1,
      maxQuantity: 1,
      chance: 0.75,
      rarity: 'epic',
    },
    {
      itemKey: 'relic_of_unbinding',
      minQuantity: 1,
      maxQuantity: 1,
      chance: 0.08,
      rarity: 'legendary',
    },
  ],
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
          rarity: 'common',
        },
        {
          itemKey: 'healing_herb',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 0.35,
          rarity: 'common',
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
          rarity: 'common',
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
          rarity: 'uncommon',
        },
        {
          itemKey: 'ember_dust',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.6,
          rarity: 'uncommon',
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
          rarity: 'uncommon',
        },
        {
          itemKey: 'healing_herb',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.6,
          rarity: 'common',
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
          rarity: 'uncommon',
        },
        {
          itemKey: 'mana_tonic',
          minQuantity: 1,
          maxQuantity: 1,
          chance: 0.55,
          rarity: 'rare',
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
          rarity: 'uncommon',
        },
        {
          itemKey: 'iron_ore',
          minQuantity: 2,
          maxQuantity: 3,
          chance: 0.75,
          rarity: 'rare',
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
          rarity: 'epic',
        },
        {
          itemKey: 'mana_tonic',
          minQuantity: 1,
          maxQuantity: 2,
          chance: 0.8,
          rarity: 'rare',
        },
      ],
    },
  },
};
