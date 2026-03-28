export const COMBAT_ENCOUNTERS_TABLE = 'combat_encounters';

export const COMBAT_STATUSES = ['active', 'won', 'lost', 'fled'] as const;
export const COMBAT_ACTIONS = ['attack', 'defend', 'fireball'] as const;

export const COMBAT_LOG_LIMIT = 20;
export const FIREBALL_MANA_COST = 5;
export const DEFAULT_COMBAT_ENEMY_KEY = 'forest_goblin';

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

export const COMBAT_ENEMY_DEFINITIONS = {
  forest_goblin: {
    key: 'forest_goblin',
    name: 'Forest Goblin',
    hp: 24,
    mp: 4,
    attack: 5,
    defense: 1,
    magicAttack: 2,
    speed: 4,
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
  },
} as const;
