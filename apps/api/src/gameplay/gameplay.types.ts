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

export interface GameplayFarmCropCatalogEntry {
  cropKey: string;
  seedItemKey: string;
  harvestItemKey: string;
  growthDays: number;
  requiredFlags: string[];
  unlocked: boolean;
}

export interface GameplayFarmPlotState {
  plotKey: string;
  row: number;
  col: number;
  cropKey: string | null;
  plantedDay: number | null;
  growthDays: number | null;
  wateredToday: boolean;
  growthProgressDays: number;
  daysToMaturity: number | null;
  readyToHarvest: boolean;
}

export interface GameplayFarmState {
  unlocked: boolean;
  totalPlots: number;
  plantedPlots: number;
  wateredPlots: number;
  readyPlots: number;
  cropCatalog: GameplayFarmCropCatalogEntry[];
  plots: GameplayFarmPlotState[];
}

export interface GameplayVillageState {
  blacksmith: {
    unlocked: boolean;
    curseLifted: boolean;
  };
  npcs: {
    mayor: GameplayVillageNpcState;
    blacksmith: GameplayVillageNpcState;
    merchant: GameplayVillageNpcState;
  };
}

export interface GameplayVillageNpcState {
  stateKey: string;
  available: boolean;
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
