export const PLAYER_PROGRESSION_TABLE = 'player_progression';
export const WORLD_FLAGS_TABLE = 'world_flags';
export const WORLD_STATE_TABLE = 'world_state';
export const FARM_PLOTS_TABLE = 'farm_plots';

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
