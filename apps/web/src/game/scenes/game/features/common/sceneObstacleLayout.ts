import type { FrontSceneMode } from '../../gameScene.types';

export type SceneObstacleLayoutEntry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const VILLAGE_SCENE_OBSTACLE_LAYOUT: readonly SceneObstacleLayoutEntry[] = [
  { x: 286, y: 232, width: 248, height: 170 },
  { x: 1262, y: 238, width: 246, height: 184 },
  { x: 1040, y: 566, width: 272, height: 120 },
  { x: 346, y: 614, width: 126, height: 34 },
  { x: 808, y: 98, width: 264, height: 86 },
  { x: 808, y: 804, width: 286, height: 72 },
  { x: 808, y: 438, width: 232, height: 160 },
];

const FARM_SCENE_OBSTACLE_LAYOUT: readonly SceneObstacleLayoutEntry[] = [
  { x: 220, y: 235, width: 230, height: 150 },
  { x: 220, y: 432, width: 62, height: 44 },
  { x: 1325, y: 330, width: 120, height: 520 },
  { x: 620, y: 682, width: 760, height: 58 },
];

export function getSceneObstacleLayout(frontSceneMode: FrontSceneMode): readonly SceneObstacleLayoutEntry[] {
  return frontSceneMode === 'village' ? VILLAGE_SCENE_OBSTACLE_LAYOUT : FARM_SCENE_OBSTACLE_LAYOUT;
}
