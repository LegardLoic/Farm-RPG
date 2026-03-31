export const PLAYER_PROGRESSION_TABLE = 'player_progression';
export const WORLD_FLAGS_TABLE = 'world_flags';
export const WORLD_STATE_TABLE = 'world_state';
export const FARM_PLOTS_TABLE = 'farm_plots';
export const VILLAGE_NPC_RELATIONSHIPS_TABLE = 'village_npc_relationships';

export const BASE_PLAYER_LEVEL = 1;
export const BASE_PLAYER_EXPERIENCE = 0;
export const BASE_PLAYER_GOLD = 120;
export const BASE_PLAYER_MAX_HP = 32;
export const BASE_PLAYER_CURRENT_HP = BASE_PLAYER_MAX_HP;
export const BASE_PLAYER_MAX_MP = 15;
export const BASE_PLAYER_CURRENT_MP = BASE_PLAYER_MAX_MP;
export const BASE_WORLD_ZONE = 'Ferme';
export const BASE_WORLD_DAY = 1;
export const PLAYER_MAX_LEVEL = 10;
export const INTRO_FLAG_ARRIVED_VILLAGE = 'intro_arrived_village';
export const INTRO_FLAG_MET_MAYOR = 'intro_met_mayor';
export const INTRO_FLAG_FARM_ASSIGNED = 'intro_farm_assigned';
export const INTRO_PROGRESS_FLAGS = [
  INTRO_FLAG_ARRIVED_VILLAGE,
  INTRO_FLAG_MET_MAYOR,
  INTRO_FLAG_FARM_ASSIGNED,
] as const;

export const COMBAT_PREPARATION_FLAG_HP = 'combat_prep_hp';
export const COMBAT_PREPARATION_FLAG_MP = 'combat_prep_mp';
export const COMBAT_PREPARATION_FLAG_ATTACK = 'combat_prep_attack';
export const COMBAT_PREPARATION_FLAGS = [
  COMBAT_PREPARATION_FLAG_HP,
  COMBAT_PREPARATION_FLAG_MP,
  COMBAT_PREPARATION_FLAG_ATTACK,
] as const;

export const VILLAGE_NPC_KEYS = ['mayor', 'blacksmith', 'merchant'] as const;
export type VillageNpcKey = (typeof VILLAGE_NPC_KEYS)[number];

export const FARM_PLOT_LAYOUT = [
  { plotKey: 'plot_r1_c1', row: 1, col: 1 },
  { plotKey: 'plot_r1_c2', row: 1, col: 2 },
  { plotKey: 'plot_r1_c3', row: 1, col: 3 },
  { plotKey: 'plot_r1_c4', row: 1, col: 4 },
  { plotKey: 'plot_r2_c1', row: 2, col: 1 },
  { plotKey: 'plot_r2_c2', row: 2, col: 2 },
  { plotKey: 'plot_r2_c3', row: 2, col: 3 },
  { plotKey: 'plot_r2_c4', row: 2, col: 4 },
  { plotKey: 'plot_r3_c1', row: 3, col: 1 },
  { plotKey: 'plot_r3_c2', row: 3, col: 2 },
  { plotKey: 'plot_r3_c3', row: 3, col: 3 },
  { plotKey: 'plot_r3_c4', row: 3, col: 4 },
] as const;

export type FarmCropDefinition = {
  cropKey: string;
  seedItemKey: string;
  harvestItemKey: string;
  growthDays: number;
  requiredFlags: string[];
};

export type FarmCraftIngredientDefinition = {
  itemKey: string;
  quantity: number;
};

export type FarmCraftRecipeDefinition = {
  recipeKey: string;
  name: string;
  description: string;
  outputItemKey: string;
  outputQuantity: number;
  ingredients: FarmCraftIngredientDefinition[];
  requiredFlags: string[];
};

export const FARM_CROP_CATALOG: FarmCropDefinition[] = [
  {
    cropKey: 'turnip',
    seedItemKey: 'turnip_seed',
    harvestItemKey: 'turnip',
    growthDays: 2,
    requiredFlags: [],
  },
  {
    cropKey: 'carrot',
    seedItemKey: 'carrot_seed',
    harvestItemKey: 'carrot',
    growthDays: 3,
    requiredFlags: [],
  },
  {
    cropKey: 'wheat',
    seedItemKey: 'wheat_seed',
    harvestItemKey: 'wheat',
    growthDays: 4,
    requiredFlags: ['story_floor_5_cleared'],
  },
];

export const FARM_CRAFT_RECIPES: FarmCraftRecipeDefinition[] = [
  {
    recipeKey: 'field_medicine',
    name: 'Field Medicine',
    description: 'Turnips and carrots pressed into a basic combat healing herb.',
    outputItemKey: 'healing_herb',
    outputQuantity: 1,
    ingredients: [
      { itemKey: 'turnip', quantity: 2 },
      { itemKey: 'carrot', quantity: 1 },
    ],
    requiredFlags: [],
  },
  {
    recipeKey: 'focus_tonic',
    name: 'Focus Tonic',
    description: 'A stronger village brew that restores focus and mana.',
    outputItemKey: 'mana_tonic',
    outputQuantity: 1,
    ingredients: [
      { itemKey: 'carrot', quantity: 2 },
      { itemKey: 'wheat', quantity: 1 },
    ],
    requiredFlags: ['story_floor_5_cleared'],
  },
];

const PLAYER_XP_TO_NEXT_BY_LEVEL: Record<number, number> = {
  1: 100,
  2: 130,
  3: 170,
  4: 220,
  5: 280,
  6: 350,
  7: 430,
  8: 520,
  9: 620,
  10: 9999,
};

export function clampPlayerLevel(level: number): number {
  const safeLevel = Math.floor(level);
  if (!Number.isFinite(safeLevel) || safeLevel < BASE_PLAYER_LEVEL) {
    return BASE_PLAYER_LEVEL;
  }

  return Math.min(PLAYER_MAX_LEVEL, safeLevel);
}

export function xpRequiredForLevel(level: number): number {
  return PLAYER_XP_TO_NEXT_BY_LEVEL[clampPlayerLevel(level)] ?? PLAYER_XP_TO_NEXT_BY_LEVEL[PLAYER_MAX_LEVEL];
}
