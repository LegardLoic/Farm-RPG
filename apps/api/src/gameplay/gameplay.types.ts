export interface PlayerProgressionState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  gold: number;
}

export interface GameplayWorldState {
  zone: string;
  day: number;
}

export interface GameplayVillageState {
  blacksmith: {
    unlocked: boolean;
    curseLifted: boolean;
  };
}
