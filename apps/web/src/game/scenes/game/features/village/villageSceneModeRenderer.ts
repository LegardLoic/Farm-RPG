import type { FrontSceneMode, VillageSceneZoneKey, VillageSceneZoneVisual, VillageShopType } from '../../gameScene.types';
import {
  getVillageInteractionFeedbackLabel as getVillageInteractionFeedbackLabelFromLogic,
  getVillageZoneInteractionState as getVillageZoneInteractionStateFromLogic,
  getVillageZoneStateColor as getVillageZoneStateColorFromLogic,
  getVillageZoneStateLabel as getVillageZoneStateLabelFromLogic,
  type VillageNpcHudState,
  type VillageNpcRelationshipHudState,
} from './villageLogic';
import { renderVillageSceneZoneVisuals as renderVillageSceneZoneVisualsFromFeature } from './villageSceneRenderer';

export type VillageSceneModeRenderLike = {
  frontSceneMode: FrontSceneMode;
  villageSceneRenderSignature: string;
  villageSelectedZoneKey: VillageSceneZoneKey | null;
  villageSceneZoneVisuals: Map<VillageSceneZoneKey, VillageSceneZoneVisual>;
  villageSceneActionHintLabel: { setText(text: string): void } | null;
  villageMarketUnlocked: boolean;
  villageMarketSeedOffers: unknown[];
  hudState: {
    blacksmithUnlocked: boolean;
    blacksmithCurseLifted: boolean;
  };
  isAuthenticated: boolean;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
  villageNpcError: string | null;
  villageFeedbackMessage: string | null;
  villageShopControllerState: {
    isOpen: boolean;
    shopType: VillageShopType;
  };
  getVillageRenderSignature(): string;
};

export function renderVillageSceneForScene(scene: VillageSceneModeRenderLike): void {
  if (scene.frontSceneMode !== 'village') {
    return;
  }

  const signature = scene.getVillageRenderSignature();
  if (signature === scene.villageSceneRenderSignature) {
    return;
  }
  scene.villageSceneRenderSignature = signature;

  renderVillageSceneZoneVisualsFromFeature({
    zoneVisuals: scene.villageSceneZoneVisuals,
    selectedZoneKey: scene.villageSelectedZoneKey,
    getZoneStateLabel: (zone) => getVillageZoneStateLabelFromLogic({
      isAuthenticated: scene.isAuthenticated,
      zone,
      villageMarketUnlocked: scene.villageMarketUnlocked,
      villageMarketSeedOffersCount: scene.villageMarketSeedOffers.length,
      blacksmithUnlocked: scene.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: scene.hudState.blacksmithCurseLifted,
      villageNpcState: scene.villageNpcState,
      villageNpcRelationships: scene.villageNpcRelationships,
    }),
    getZoneStateColor: (zone) => getVillageZoneStateColorFromLogic({
      isAuthenticated: scene.isAuthenticated,
      zone,
      villageMarketUnlocked: scene.villageMarketUnlocked,
      blacksmithUnlocked: scene.hudState.blacksmithUnlocked,
      interactionState: getVillageZoneInteractionStateFromLogic({
        isAuthenticated: scene.isAuthenticated,
        zone,
        villageMarketUnlocked: scene.villageMarketUnlocked,
        blacksmithUnlocked: scene.hudState.blacksmithUnlocked,
        blacksmithCurseLifted: scene.hudState.blacksmithCurseLifted,
        villageNpcState: scene.villageNpcState,
        villageNpcRelationships: scene.villageNpcRelationships,
      }),
    }),
  });

  if (scene.villageSceneActionHintLabel) {
    scene.villageSceneActionHintLabel.setText(getVillageInteractionFeedbackLabelFromLogic({
      villageNpcError: scene.villageNpcError,
      villageFeedbackMessage: scene.villageFeedbackMessage,
      frontSceneMode: scene.frontSceneMode,
      isAuthenticated: scene.isAuthenticated,
      villageShopPanelOpen: scene.villageShopControllerState.isOpen,
      villageShopType: scene.villageShopControllerState.shopType,
    }));
  }
}
