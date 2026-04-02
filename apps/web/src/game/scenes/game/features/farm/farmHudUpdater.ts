import { type FarmStateLike, getFarmFeedbackLabel as getFarmFeedbackLabelFromLogic, getFarmReadyPlotsLabel as getFarmReadyPlotsLabelFromLogic, getSelectedSeedLabel as getSelectedSeedLabelFromLogic } from './farmLogic';
import { updateFarmHudValues as updateFarmHudValuesFromFeature } from './farmHudRenderer';

export type FarmHudUpdateSceneLike = {
  isAuthenticated: boolean;
  farmState: FarmStateLike | null;
  farmBusy: boolean;
  farmError: string | null;
  farmCraftingError: string | null;
  farmCraftingBusy: boolean;
  farmCraftingPanelOpen: boolean;
  farmSelectedSeedItemKey: string;
  farmFeedbackMessage: string | null;
  frontSceneMode: string;
  farmSummaryValue: HTMLElement | null;
  farmStorySummaryValue: HTMLElement | null;
  farmStoryNarrativeValue: HTMLElement | null;
  farmErrorValue: HTMLElement | null;
  farmSleepButton: HTMLButtonElement | null;
  farmCraftingToggleButton: HTMLButtonElement | null;
  farmGoVillageButton: HTMLButtonElement | null;
  farmContextSeedValue: HTMLElement | null;
  farmContextReadyValue: HTMLElement | null;
  farmContextFeedbackValue: HTMLElement | null;
  ensureSelectedFarmPlot(): void;
  getFarmSummaryLabel(): string;
  getFarmStorySummaryLabel(): string;
  getFarmStoryNarrativeLabel(): string;
  updateFarmContextPanel(): void;
  renderFarmPanel(): void;
  renderFarmScene(): void;
};

export function updateFarmHudForScene(scene: FarmHudUpdateSceneLike): void {
  scene.ensureSelectedFarmPlot();
  const canSleep = Boolean(scene.isAuthenticated && scene.farmState?.unlocked);
  const feedback = getFarmFeedbackLabelFromLogic({
    farmError: scene.farmError,
    farmCraftingError: scene.farmCraftingError,
    farmBusy: scene.farmBusy,
    farmCraftingBusy: scene.farmCraftingBusy,
    farmFeedbackMessage: scene.farmFeedbackMessage,
    isAuthenticated: scene.isAuthenticated,
    farmUnlocked: Boolean(scene.farmState?.unlocked),
  });
  updateFarmHudValuesFromFeature({
    summaryValue: scene.farmSummaryValue,
    storySummaryValue: scene.farmStorySummaryValue,
    storyNarrativeValue: scene.farmStoryNarrativeValue,
    errorValue: scene.farmErrorValue,
    sleepButton: scene.farmSleepButton,
    craftingToggleButton: scene.farmCraftingToggleButton,
    goVillageButton: scene.farmGoVillageButton,
    contextSeedValue: scene.farmContextSeedValue,
    contextReadyValue: scene.farmContextReadyValue,
    contextFeedbackValue: scene.farmContextFeedbackValue,
    summaryLabel: scene.getFarmSummaryLabel(),
    storySummaryLabel: scene.getFarmStorySummaryLabel(),
    storyNarrativeLabel: scene.getFarmStoryNarrativeLabel(),
    farmError: scene.farmError,
    sleepButtonDisabled: !canSleep || scene.farmBusy,
    sleepButtonLabel: scene.farmBusy ? 'Dormir...' : 'Dormir (+1 jour)',
    craftingToggleDisabled: !scene.isAuthenticated || !scene.farmState?.unlocked,
    craftingToggleLabel: scene.farmCraftingPanelOpen ? 'Fermer craft' : 'Ouvrir craft',
    goVillageDisabled: !scene.isAuthenticated,
    selectedSeedLabel: getSelectedSeedLabelFromLogic(scene.farmSelectedSeedItemKey),
    readyPlotsLabel: getFarmReadyPlotsLabelFromLogic(scene.farmState),
    feedbackTone: scene.farmError ? 'error' : 'info',
    feedbackLabel: feedback,
  });
  scene.updateFarmContextPanel();
  scene.renderFarmPanel();
  if (scene.frontSceneMode === 'farm') {
    scene.renderFarmScene();
  }
}
