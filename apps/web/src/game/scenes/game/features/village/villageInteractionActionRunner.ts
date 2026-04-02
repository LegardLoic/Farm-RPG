import type { FrontSceneMode, VillageSceneZoneKey, VillageShopType } from '../../gameScene.types';
import type { VillageNpcKey } from './villageLogic';
import type { VillageInteractionPlanStep } from './villageInteractionController';

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
