export const PLAYER_PROGRESSION_TABLE = 'player_progression';
export const WORLD_FLAGS_TABLE = 'world_flags';
export const WORLD_STATE_TABLE = 'world_state';

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
