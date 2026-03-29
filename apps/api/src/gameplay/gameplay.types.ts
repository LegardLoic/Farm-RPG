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

export interface GameplayTowerState {
  currentFloor: number;
  highestFloor: number;
  bossFloor10Defeated: boolean;
  mvpCompleted: boolean;
  nextBossFloor: number | null;
}
