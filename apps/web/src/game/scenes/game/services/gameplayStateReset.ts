import { FARM_SCENE_PLAYER_SPAWN } from '../gameScene.constants';
import { createVillageShopControllerState as createVillageShopControllerStateFromFeature } from '../features/shops/villageShopController';
import type { FrontSceneMode } from '../gameScene.types';
import type { HudState, VillageNpcHudState, VillageNpcRelationshipHudState } from '../gameScene.stateTypes';

export type GameplayStateResetSceneLike = {
  hudState: HudState;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
  villageNpcBusy: boolean;
  villageNpcError: string | null;
  villageShopControllerState: ReturnType<typeof createVillageShopControllerStateFromFeature>;
  farmState: unknown;
  farmBusy: boolean;
  farmError: string | null;
  farmSelectedSeedItemKey: string;
  farmSelectedPlotKey: string | null;
  farmFeedbackMessage: string | null;
  farmCraftingPanelOpen: boolean;
  farmRenderSignature: string;
  farmCraftingState: unknown;
  farmCraftingBusy: boolean;
  farmCraftingError: string | null;
  farmCraftingRenderSignature: string;
  farmSceneRenderSignature: string;
  villageSceneRenderSignature: string;
  villageSelectedZoneKey: string | null;
  villageFeedbackMessage: string | null;
  frontSceneMode: FrontSceneMode;
  player: { setPosition(x: number, y: number): void } | null;
  drawDecor(): void;
  rebuildSceneObstacles(): void;
};

export function resetGameplayHudStateForScene(scene: GameplayStateResetSceneLike): void {
  scene.hudState.day = 1;
  scene.hudState.area = 'Ferme';
  scene.hudState.gold = 120;
  scene.hudState.level = 1;
  scene.hudState.xp = 0;
  scene.hudState.xpToNext = 100;
  scene.hudState.towerCurrentFloor = 1;
  scene.hudState.towerHighestFloor = 1;
  scene.hudState.towerBossFloor10Defeated = false;
  scene.hudState.blacksmithUnlocked = false;
  scene.hudState.blacksmithCurseLifted = false;
  scene.villageNpcState = {
    mayor: { stateKey: 'offscreen', available: false },
    blacksmith: { stateKey: 'cursed', available: false },
    merchant: { stateKey: 'absent', available: false },
  };
  scene.villageNpcRelationships = {
    mayor: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
    blacksmith: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
    merchant: { friendship: 0, tier: 'stranger', lastInteractionDay: null, canTalkToday: false },
  };
  scene.villageNpcBusy = false;
  scene.villageNpcError = null;
  scene.villageShopControllerState = createVillageShopControllerStateFromFeature();
  scene.farmState = null;
  scene.farmBusy = false;
  scene.farmError = null;
  scene.farmSelectedSeedItemKey = '';
  scene.farmSelectedPlotKey = null;
  scene.farmFeedbackMessage = null;
  scene.farmCraftingPanelOpen = false;
  scene.farmRenderSignature = '';
  scene.farmCraftingState = null;
  scene.farmCraftingBusy = false;
  scene.farmCraftingError = null;
  scene.farmCraftingRenderSignature = '';
  scene.farmSceneRenderSignature = '';
  scene.villageSceneRenderSignature = '';
  scene.villageSelectedZoneKey = null;
  scene.villageFeedbackMessage = null;
  scene.frontSceneMode = 'farm';

  if (scene.player) {
    scene.player.setPosition(FARM_SCENE_PLAYER_SPAWN.x, FARM_SCENE_PLAYER_SPAWN.y);
    scene.drawDecor();
    scene.rebuildSceneObstacles();
  }
}
