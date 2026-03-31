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

export interface GameplayFarmCraftIngredientState {
  itemKey: string;
  requiredQuantity: number;
  ownedQuantity: number;
}

export interface GameplayFarmCraftRecipeState {
  recipeKey: string;
  name: string;
  description: string;
  outputItemKey: string;
  outputQuantity: number;
  requiredFlags: string[];
  unlocked: boolean;
  ingredients: GameplayFarmCraftIngredientState[];
  maxCraftable: number;
}

export interface GameplayFarmCraftingState {
  unlocked: boolean;
  recipes: GameplayFarmCraftRecipeState[];
  craftableRecipes: number;
}

export interface GameplayFarmPlantResult {
  plotKey: string;
  seedItemKey: string;
  cropKey: string;
  plantedDay: number;
  growthDays: number;
  remainingSeedQuantity: number;
}

export interface GameplayFarmWaterResult {
  plotKey: string;
  cropKey: string;
  wateredToday: boolean;
  day: number;
}

export interface GameplayFarmHarvestResult {
  plotKey: string;
  cropKey: string;
  harvestItemKey: string;
  quantityGained: number;
  totalHarvestItemQuantity: number;
}

export interface GameplaySleepResult {
  dayBefore: number;
  dayAfter: number;
}

export interface GameplayFarmCraftResult {
  recipeKey: string;
  craftedQuantity: number;
  outputItemKey: string;
  outputQuantityPerCraft: number;
  totalOutputQuantity: number;
  totalOutputInventoryQuantity: number;
  consumedIngredients: Array<{
    itemKey: string;
    quantityConsumed: number;
    remainingQuantity: number;
  }>;
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
  relationships: {
    mayor: GameplayVillageNpcRelationshipState;
    blacksmith: GameplayVillageNpcRelationshipState;
    merchant: GameplayVillageNpcRelationshipState;
  };
}

export interface GameplayVillageNpcState {
  stateKey: string;
  available: boolean;
}

export type GameplayVillageNpcRelationshipTier = 'stranger' | 'familiar' | 'trusted' | 'ally';

export interface GameplayVillageNpcRelationshipState {
  friendship: number;
  tier: GameplayVillageNpcRelationshipTier;
  lastInteractionDay: number | null;
  canTalkToday: boolean;
}

export interface GameplayVillageNpcInteractResult {
  npcKey: 'mayor' | 'blacksmith' | 'merchant';
  friendshipBefore: number;
  friendshipAfter: number;
  tierBefore: GameplayVillageNpcRelationshipTier;
  tierAfter: GameplayVillageNpcRelationshipTier;
  day: number;
}

export interface GameplayCombatPreparationState {
  active: boolean;
  hpBoostActive: boolean;
  mpBoostActive: boolean;
  attackBoostActive: boolean;
}

export interface GameplayLoopState {
  stageKey: 'tower_bootstrap' | 'village_sync' | 'farm_scale' | 'combat_mastery';
  stageLabel: string;
  farmUnlocked: boolean;
  villageMarketUnlocked: boolean;
  supplies: {
    healingHerb: number;
    manaTonic: number;
  };
  relationshipAverage: number;
  preparation: GameplayCombatPreparationState & {
    ready: boolean;
    blockers: string[];
    nextStep: string;
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
