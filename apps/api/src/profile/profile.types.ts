import type { HeroAppearanceKey } from './profile.constants';

export type PlayerProfileState = {
  heroName: string;
  appearanceKey: HeroAppearanceKey;
  createdAt: string;
  updatedAt: string;
};
