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

export function xpRequiredForLevel(level: number): number {
  return 100 + Math.max(0, level - 1) * 25;
}
