export const PLAYER_PROFILES_TABLE = 'player_profiles';

export const HERO_NAME_MIN_LENGTH = 2;
export const HERO_NAME_MAX_LENGTH = 24;

export const HERO_APPEARANCE_KEYS = ['default', 'ember', 'forest', 'night'] as const;

export type HeroAppearanceKey = (typeof HERO_APPEARANCE_KEYS)[number];

export const DEFAULT_HERO_APPEARANCE_KEY: HeroAppearanceKey = 'default';
