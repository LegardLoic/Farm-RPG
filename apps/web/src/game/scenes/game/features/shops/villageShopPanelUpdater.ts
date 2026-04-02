import type { VillageShopControllerResolution, VillageShopControllerState } from './villageShopController';
import {
  renderVillageShopEntries as renderVillageShopEntriesFromFeature,
  renderVillageShopTabs as renderVillageShopTabsFromFeature,
  updateVillageShopDetails as updateVillageShopDetailsFromFeature,
} from './villageShopHudRenderer';

export type VillageShopPanelSceneLike = {
  villageShopPanelRoot: HTMLElement | null;
  villageShopControllerState: VillageShopControllerState;
  hudState: { gold: number };
  villageShopNpcValue: HTMLElement | null;
  villageShopTitleValue: HTMLElement | null;
  villageShopSummaryValue: HTMLElement | null;
  villageShopTabsRoot: HTMLElement | null;
  villageShopEntriesRoot: HTMLElement | null;
  villageShopDetailNameValue: HTMLElement | null;
  villageShopDetailMetaValue: HTMLElement | null;
  villageShopDetailDescriptionValue: HTMLElement | null;
  villageShopDetailComparisonValue: HTMLElement | null;
  villageShopErrorValue: HTMLElement | null;
  villageShopTransactionValue: HTMLElement | null;
  villageShopConfirmButton: HTMLButtonElement | null;
  villageShopTalkButton: HTMLButtonElement | null;
  resolveVillageShopPanel(): VillageShopControllerResolution;
};

export function updateVillageShopPanelForScene(scene: VillageShopPanelSceneLike): void {
  if (!scene.villageShopPanelRoot) {
    return;
  }

  const previousSignature = scene.villageShopControllerState.renderSignature;
  const resolution = scene.resolveVillageShopPanel();
  const viewModel = resolution.viewModel;
  scene.villageShopPanelRoot.hidden = !viewModel.isVisible;
  if (!viewModel.isVisible || viewModel.renderSignature === previousSignature) {
    return;
  }

  if (scene.villageShopNpcValue) {
    scene.villageShopNpcValue.textContent = viewModel.npcLabel;
  }
  if (scene.villageShopTitleValue) {
    scene.villageShopTitleValue.textContent = viewModel.titleLabel;
  }
  if (scene.villageShopSummaryValue) {
    scene.villageShopSummaryValue.textContent = viewModel.summaryLabel;
  }

  if (scene.villageShopTabsRoot) {
    renderVillageShopTabsFromFeature({
      root: scene.villageShopTabsRoot,
      tabs: viewModel.tabs,
      activeTab: viewModel.activeTabKey,
    });
  }

  if (scene.villageShopEntriesRoot) {
    renderVillageShopEntriesFromFeature({
      root: scene.villageShopEntriesRoot,
      entries: viewModel.entries,
      villageShopType: viewModel.shopType,
      selectedEntryKey: viewModel.selectedEntryKey,
    });
  }

  updateVillageShopDetailsFromFeature({
    selectedEntry: viewModel.selectedEntry,
    activeError: viewModel.activeError,
    gold: scene.hudState.gold,
    selectedEntryBusy: viewModel.selectedEntryBusy,
    talkButtonLabel: viewModel.talkButtonLabel,
    canTalk: !viewModel.talkButtonDisabled,
    detailNameValue: scene.villageShopDetailNameValue,
    detailMetaValue: scene.villageShopDetailMetaValue,
    detailDescriptionValue: scene.villageShopDetailDescriptionValue,
    detailComparisonValue: scene.villageShopDetailComparisonValue,
    errorValue: scene.villageShopErrorValue,
    transactionValue: scene.villageShopTransactionValue,
    confirmButton: scene.villageShopConfirmButton,
    talkButton: scene.villageShopTalkButton,
  });
}
