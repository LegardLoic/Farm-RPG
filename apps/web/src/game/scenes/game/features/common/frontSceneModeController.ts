import type { FrontSceneMode } from '../../gameScene.types';
import {
  closeVillageShopControllerPanel as closeVillageShopControllerPanelFromFeature,
  type VillageShopControllerState,
} from '../shops/villageShopController';

type SceneSpawnPoint = {
  x: number;
  y: number;
};

type ScenePlayerLike = {
  setPosition(x: number, y: number): void;
  body?: {
    setVelocity(x: number, y: number): void;
  } | null;
};

export type FrontSceneModeSceneLike = {
  frontSceneMode: FrontSceneMode;
  hudState: {
    area: string;
  };
  farmFeedbackMessage: string | null;
  villageFeedbackMessage: string | null;
  villageShopControllerState: VillageShopControllerState;
  player: ScenePlayerLike;
  ensureVillageSelectedZone(): void;
  drawDecor(): void;
  rebuildSceneObstacles(): void;
  syncHudSceneMode(): void;
  renderVillageScene(): void;
  renderFarmScene(): void;
  updateHud(): void;
};

export function setFrontSceneModeForScene(
  scene: FrontSceneModeSceneLike,
  input: {
    mode: FrontSceneMode;
    feedbackMessage: string;
    farmSpawn: SceneSpawnPoint;
    villageSpawn: SceneSpawnPoint;
  },
): void {
  const modeChanged = scene.frontSceneMode !== input.mode;
  scene.frontSceneMode = input.mode;
  scene.hudState.area = input.mode === 'farm' ? 'Ferme' : 'Village';

  if (input.mode === 'farm') {
    scene.farmFeedbackMessage = input.feedbackMessage;
    scene.villageFeedbackMessage = null;
    scene.villageShopControllerState = closeVillageShopControllerPanelFromFeature(scene.villageShopControllerState);
    scene.player.setPosition(input.farmSpawn.x, input.farmSpawn.y);
  } else {
    scene.villageFeedbackMessage = input.feedbackMessage;
    scene.farmFeedbackMessage = null;
    if (modeChanged) {
      scene.villageShopControllerState = closeVillageShopControllerPanelFromFeature(scene.villageShopControllerState);
    }
    scene.player.setPosition(input.villageSpawn.x, input.villageSpawn.y);
    scene.ensureVillageSelectedZone();
  }

  scene.player.body?.setVelocity(0, 0);

  if (modeChanged) {
    scene.drawDecor();
    scene.rebuildSceneObstacles();
    scene.syncHudSceneMode();
  } else if (input.mode === 'village') {
    scene.renderVillageScene();
  } else {
    scene.renderFarmScene();
  }

  scene.updateHud();
}
