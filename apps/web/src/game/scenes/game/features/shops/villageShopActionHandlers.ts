import type { VillageShopControllerResolution } from './villageShopController';

export type VillageShopPrimaryActionSceneLike = {
  villageFeedbackMessage: string | null;
  villageMarketError: string | null;
  blacksmithError: string | null;
  resolveVillageShopPanel(): VillageShopControllerResolution;
  buyVillageSeedOffer(offerKey: string): Promise<void>;
  sellVillageCrop(itemKey: string): Promise<void>;
  buyBlacksmithOffer(offerKey: string): Promise<void>;
  updateHud(): void;
};

export async function runVillageShopPrimaryActionForScene(scene: VillageShopPrimaryActionSceneLike): Promise<void> {
  const action = scene.resolveVillageShopPanel().viewModel.primaryAction;
  if (action.kind === 'select-offer' || action.kind === 'blocked') {
    scene.villageFeedbackMessage = action.message;
    scene.updateHud();
    return;
  }

  if (action.kind === 'buy-seed') {
    await scene.buyVillageSeedOffer(action.offerKey);
    if (!scene.villageMarketError) {
      scene.villageFeedbackMessage = `${action.entry.name} achete au Marche.`;
    }
    scene.updateHud();
    return;
  }

  if (action.kind === 'sell-crop') {
    await scene.sellVillageCrop(action.itemKey);
    if (!scene.villageMarketError) {
      scene.villageFeedbackMessage = `${action.entry.name} vendu au Marche.`;
    }
    scene.updateHud();
    return;
  }

  await scene.buyBlacksmithOffer(action.offerKey);
  if (!scene.blacksmithError) {
    scene.villageFeedbackMessage = `${action.entry.name} commande a la Forge.`;
  }
  scene.updateHud();
}
