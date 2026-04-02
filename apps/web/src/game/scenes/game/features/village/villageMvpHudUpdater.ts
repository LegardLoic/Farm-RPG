import type { FrontSceneMode, VillageShopType } from '../../gameScene.types';
import { getVillageInteractionFeedbackLabel as getVillageInteractionFeedbackLabelFromLogic, getVillageObjectiveLabel as getVillageObjectiveLabelFromLogic } from './villageLogic';

export type VillageMvpHudUpdateSceneLike = {
  isAuthenticated: boolean;
  frontSceneMode: FrontSceneMode;
  villageMarketUnlocked: boolean;
  villageNpcError: string | null;
  villageFeedbackMessage: string | null;
  hudState: {
    blacksmithUnlocked: boolean;
  };
  villageShopControllerState: {
    isOpen: boolean;
    shopType: VillageShopType;
  };
  villageObjectiveValue: HTMLElement | null;
  villageContextFeedbackValue: HTMLElement | null;
  ensureVillageSelectedZone(): void;
  updateVillageContextPanel(): void;
  renderVillageScene(): void;
};

export function updateVillageMvpHudForScene(scene: VillageMvpHudUpdateSceneLike): void {
  scene.ensureVillageSelectedZone();

  if (scene.villageObjectiveValue) {
    scene.villageObjectiveValue.textContent = getVillageObjectiveLabelFromLogic({
      isAuthenticated: scene.isAuthenticated,
      frontSceneMode: scene.frontSceneMode,
      blacksmithUnlocked: scene.hudState.blacksmithUnlocked,
      villageMarketUnlocked: scene.villageMarketUnlocked,
    });
  }

  scene.updateVillageContextPanel();

  if (scene.villageContextFeedbackValue) {
    const hasError = Boolean(scene.villageNpcError);
    scene.villageContextFeedbackValue.dataset.tone = hasError ? 'error' : 'info';
    scene.villageContextFeedbackValue.textContent = getVillageInteractionFeedbackLabelFromLogic({
      villageNpcError: scene.villageNpcError,
      villageFeedbackMessage: scene.villageFeedbackMessage,
      frontSceneMode: scene.frontSceneMode,
      isAuthenticated: scene.isAuthenticated,
      villageShopPanelOpen: scene.villageShopControllerState.isOpen,
      villageShopType: scene.villageShopControllerState.shopType,
    });
  }

  if (scene.frontSceneMode === 'village') {
    scene.renderVillageScene();
  }
}
