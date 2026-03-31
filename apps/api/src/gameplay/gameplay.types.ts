export interface PlayerProgressionState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  gold: number;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
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

export type GameplayIntroStepKey =
  | 'arrive_village'
  | 'meet_mayor'
  | 'farm_assignment'
  | 'completed';

export interface GameplayIntroState {
  currentStep: GameplayIntroStepKey;
  completed: boolean;
  steps: {
    arriveVillage: boolean;
    metMayor: boolean;
    farmAssigned: boolean;
  };
}

export interface GameplayTowerState {
  currentFloor: number;
  highestFloor: number;
  bossFloor10Defeated: boolean;
  mvpCompleted: boolean;
  nextBossFloor: number | null;
}
