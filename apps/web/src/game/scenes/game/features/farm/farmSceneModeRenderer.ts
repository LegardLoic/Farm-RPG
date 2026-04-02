import type Phaser from 'phaser';
import type { FarmScenePlotSlot, FarmScenePlotVisual } from '../../gameScene.stateTypes';
import {
  type FarmStateLike,
  getFarmFeedbackLabel as getFarmFeedbackLabelFromLogic,
  getFarmPlotPhase as getFarmPlotPhaseFromLogic,
  getFarmPlotPhaseLabel as getFarmPlotPhaseLabelFromLogic,
  getFarmScenePlotPalette as getFarmScenePlotPaletteFromLogic,
  getFarmScenePlotPosition as getFarmScenePlotPositionFromLogic,
  getFarmSceneSlots as getFarmSceneSlotsFromLogic,
} from './farmLogic';
import { renderFarmScenePlotVisuals as renderFarmScenePlotVisualsFromFeature } from './farmSceneRenderer';

export type FarmSceneModeRenderLike = Phaser.Scene & {
  frontSceneMode: string;
  farmSceneRenderSignature: string;
  farmScenePlotVisuals: Map<string, FarmScenePlotVisual>;
  farmSelectedPlotKey: string | null;
  farmError: string | null;
  farmCraftingError: string | null;
  farmBusy: boolean;
  farmCraftingBusy: boolean;
  farmFeedbackMessage: string | null;
  isAuthenticated: boolean;
  farmState: FarmStateLike | null;
  farmSceneActionHintLabel: { setText(text: string): void } | null;
  computeFarmRenderSignature(): string;
  getDayPhaseKey(): 'day' | 'night';
  ensureSelectedFarmPlot(): void;
  setSelectedFarmPlot(plotKey: string, announceSelection: boolean): void;
  updateHud(): void;
};

export function renderFarmSceneForScene(scene: FarmSceneModeRenderLike): void {
  if (scene.frontSceneMode !== 'farm') {
    return;
  }

  const signature = `${scene.computeFarmRenderSignature()}|${scene.getDayPhaseKey()}`;
  if (signature === scene.farmSceneRenderSignature) {
    return;
  }
  scene.farmSceneRenderSignature = signature;

  scene.ensureSelectedFarmPlot();
  const slots = getFarmSceneSlotsFromLogic(scene.farmState) as FarmScenePlotSlot[];
  renderFarmScenePlotVisualsFromFeature({
    scene,
    plotVisuals: scene.farmScenePlotVisuals,
    slots,
    selectedPlotKey: scene.farmSelectedPlotKey,
    getPlotPosition: (slot) => getFarmScenePlotPositionFromLogic(slot),
    getPlotPhase: (plot) => getFarmPlotPhaseFromLogic(plot),
    getPlotPalette: (phase, selected) => getFarmScenePlotPaletteFromLogic(phase, selected),
    getPlotPhaseLabel: (plot) => getFarmPlotPhaseLabelFromLogic(plot),
    onSelectPlot: (plotKey) => {
      scene.setSelectedFarmPlot(plotKey, true);
      scene.updateHud();
    },
  });

  if (scene.farmSceneActionHintLabel) {
    scene.farmSceneActionHintLabel.setText(getFarmFeedbackLabelFromLogic({
      farmError: scene.farmError,
      farmCraftingError: scene.farmCraftingError,
      farmBusy: scene.farmBusy,
      farmCraftingBusy: scene.farmCraftingBusy,
      farmFeedbackMessage: scene.farmFeedbackMessage,
      isAuthenticated: scene.isAuthenticated,
      farmUnlocked: Boolean((scene.farmState as { unlocked?: boolean } | null)?.unlocked),
    }));
  }
}
