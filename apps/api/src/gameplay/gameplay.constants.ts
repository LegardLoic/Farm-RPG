export const PLAYER_PROGRESSION_TABLE = 'player_progression';
export const WORLD_FLAGS_TABLE = 'world_flags';

export const BASE_PLAYER_LEVEL = 1;
export const BASE_PLAYER_EXPERIENCE = 0;
export const BASE_PLAYER_GOLD = 120;

export function xpRequiredForLevel(level: number): number {
  return 100 + Math.max(0, level - 1) * 25;
}
