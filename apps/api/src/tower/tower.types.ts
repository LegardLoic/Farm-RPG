export interface TowerState {
  currentFloor: number;
  highestFloor: number;
  bossFloor10Defeated: boolean;
  mvpCompleted: boolean;
  nextBossFloor: number | null;
}

export interface TowerVictoryProgress {
  previousFloor: number;
  currentFloor: number;
  reachedMilestoneFlags: string[];
  state: TowerState;
}
