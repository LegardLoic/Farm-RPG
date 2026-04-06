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
import {
  clearFarmScenePlotVisuals as clearFarmScenePlotVisualsFromFeature,
  renderFarmScenePlotVisuals as renderFarmScenePlotVisualsFromFeature,
} from './farmSceneRenderer';
import type { FarmTiledMapRuntime } from './farmTiledMap';

export type FarmSceneModeRenderLike = Phaser.Scene & {
  frontSceneMode: string;
  farmSceneRenderSignature: string;
  farmScenePlotVisuals: Map<string, FarmScenePlotVisual>;
  farmTiledRuntime: FarmTiledMapRuntime | null;
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

  const hasFarmPlotsFromTiled = (scene.farmTiledRuntime?.farmPlots.tiles.length ?? 0) > 0;
  const signature = `${scene.computeFarmRenderSignature()}|${scene.getDayPhaseKey()}|tiledFarmPlots:${hasFarmPlotsFromTiled ? '1' : '0'}`;
  if (signature === scene.farmSceneRenderSignature) {
    return;
  }
  scene.farmSceneRenderSignature = signature;

  // Legacy rectangular overlay should never render when Tiled FarmPlots tiles are available.
  if (hasFarmPlotsFromTiled) {
    clearFarmScenePlotVisualsFromFeature(scene.farmScenePlotVisuals);
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
    return;
  }

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
