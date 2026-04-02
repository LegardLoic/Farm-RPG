import type {
  FrontSceneMode,
  VillageSceneZoneConfig,
  VillageSceneZoneKey,
  VillageShopType,
} from '../../gameScene.types';
import type { VillageNpcHudState, VillageNpcKey, VillageNpcRelationshipHudState } from './villageLogic';
import {
  buildVillageInteractionPlanFromState as buildVillageInteractionPlanFromStateFromFeature,
  type VillageInteractionPlanStep,
} from './villageInteractionController';

export async function runVillageInteractionPlan(params: {
  steps: VillageInteractionPlanStep[];
  setSelectedZone: (zoneKey: VillageSceneZoneKey, announceSelection: boolean) => void;
  closeShopPanel: () => void;
  openShopPanel: (shopType: VillageShopType, feedbackMessage: string) => void;
  interactVillageNpc: (npcKey: VillageNpcKey) => Promise<boolean>;
  setFrontSceneMode: (mode: FrontSceneMode, feedbackMessage: string) => void;
  setVillageFeedbackMessage: (message: string) => void;
  updateHud: () => void;
}): Promise<void> {
  for (const step of params.steps) {
    if (step.kind === 'select-zone') {
      params.setSelectedZone(step.zoneKey, step.announceSelection);
      continue;
    }

    if (step.kind === 'close-shop-panel') {
      params.closeShopPanel();
      continue;
    }

    if (step.kind === 'open-shop-panel') {
      params.openShopPanel(step.shopType, step.feedbackMessage);
      return;
    }

    if (step.kind === 'talk-npc') {
      const success = await params.interactVillageNpc(step.npcKey);
      if (success) {
        params.setVillageFeedbackMessage(step.successMessage);
      }
      params.updateHud();
      return;
    }

    if (step.kind === 'switch-front-scene') {
      params.setFrontSceneMode(step.sceneMode, step.feedbackMessage);
      return;
    }

    params.setVillageFeedbackMessage(step.message);
  }

  params.updateHud();
}

export type VillageInteractionIntentSceneLike = {
  frontSceneMode: FrontSceneMode;
  villageSelectedZoneKey: VillageSceneZoneKey | null;
  isAuthenticated: boolean;
  villageMarketUnlocked: boolean;
  hudState: {
    blacksmithUnlocked: boolean;
    blacksmithCurseLifted: boolean;
    towerHighestFloor: number;
  };
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
  villageShopControllerState: {
    isOpen: boolean;
  };
  villageFeedbackMessage: string | null;
  villageNpcError: string | null;
  setVillageSelectedZone(zoneKey: VillageSceneZoneKey, announceSelection: boolean): void;
  closeVillageShopPanelForInteractionIntent(): void;
  openVillageShopPanel(shopType: VillageShopType, feedbackMessage: string): void;
  interactVillageNpc(npcKey: VillageNpcKey): Promise<void>;
  setFrontSceneMode(mode: FrontSceneMode, feedbackMessage: string): void;
  updateHud(): void;
};

export async function runVillageInteractionIntentForScene(
  scene: VillageInteractionIntentSceneLike,
  zones: VillageSceneZoneConfig[],
  targetKey?: VillageSceneZoneKey,
): Promise<void> {
  if (scene.frontSceneMode !== 'village') {
    return;
  }

  const interactionPlan = buildVillageInteractionPlanFromStateFromFeature({
    targetKey,
    selectedZoneKey: scene.villageSelectedZoneKey,
    zones,
    isAuthenticated: scene.isAuthenticated,
    villageMarketUnlocked: scene.villageMarketUnlocked,
    blacksmithUnlocked: scene.hudState.blacksmithUnlocked,
    blacksmithCurseLifted: scene.hudState.blacksmithCurseLifted,
    villageNpcState: scene.villageNpcState,
    villageNpcRelationships: scene.villageNpcRelationships,
    villageShopPanelOpen: scene.villageShopControllerState.isOpen,
    towerHighestFloor: scene.hudState.towerHighestFloor,
  });

  await runVillageInteractionPlan({
    steps: interactionPlan.steps,
    setSelectedZone: (zoneKey, announceSelection) => scene.setVillageSelectedZone(zoneKey, announceSelection),
    closeShopPanel: () => scene.closeVillageShopPanelForInteractionIntent(),
    openShopPanel: (shopType, feedbackMessage) => scene.openVillageShopPanel(shopType, feedbackMessage),
    interactVillageNpc: async (npcKey) => {
      await scene.interactVillageNpc(npcKey);
      return !scene.villageNpcError;
    },
    setFrontSceneMode: (mode, feedbackMessage) => scene.setFrontSceneMode(mode, feedbackMessage),
    setVillageFeedbackMessage: (message) => {
      scene.villageFeedbackMessage = message;
    },
    updateHud: () => scene.updateHud(),
  });
}
