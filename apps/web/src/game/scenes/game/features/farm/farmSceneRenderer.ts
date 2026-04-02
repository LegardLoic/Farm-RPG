import type Phaser from 'phaser';
import type { FarmPlotPhase, FarmScenePlotSlot, FarmScenePlotVisual } from '../../gameScene.stateTypes';

export type FarmScenePlotPalette = {
  frame: number;
  bed: number;
  crop: number;
  badge: string;
};

export function clearFarmScenePlotVisuals(plotVisuals: Map<string, FarmScenePlotVisual>): void {
  for (const visual of plotVisuals.values()) {
    visual.frame.destroy();
    visual.bed.destroy();
    visual.crop.destroy();
    visual.badge.destroy();
    visual.label.destroy();
  }
  plotVisuals.clear();
}

export function renderFarmScenePlotVisuals(params: {
  scene: Phaser.Scene;
  plotVisuals: Map<string, FarmScenePlotVisual>;
  slots: FarmScenePlotSlot[];
  selectedPlotKey: string | null;
  getPlotPosition: (slot: FarmScenePlotSlot) => { x: number; y: number };
  getPlotPhase: (plot: FarmScenePlotSlot['plot']) => FarmPlotPhase;
  getPlotPalette: (phase: FarmPlotPhase, selected: boolean) => FarmScenePlotPalette;
  getPlotPhaseLabel: (plot: FarmScenePlotSlot['plot']) => string;
  onSelectPlot: (plotKey: string) => void;
}): void {
  clearFarmScenePlotVisuals(params.plotVisuals);

  for (const slot of params.slots) {
    const position = params.getPlotPosition(slot);
    const phase = params.getPlotPhase(slot.plot);
    const selected = slot.plotKey === params.selectedPlotKey;
    const palette = params.getPlotPalette(phase, selected);

    const frame = params.scene.add.rectangle(position.x, position.y, 108, 68, palette.frame, 0.9);
    frame.setStrokeStyle(2, selected ? 0xf6d88f : 0x29311e, selected ? 1 : 0.6);
    frame.setDepth(14);
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      params.onSelectPlot(slot.plotKey);
    });

    const bed = params.scene.add.rectangle(position.x, position.y + 2, 92, 50, palette.bed, 1);
    bed.setDepth(15);

    const crop = params.scene.add.rectangle(
      position.x,
      position.y - 2,
      54,
      26,
      palette.crop,
      phase === 'empty' ? 0.44 : 1,
    );
    crop.setDepth(16);

    const badge = params.scene.add
      .text(position.x, position.y - 34, params.getPlotPhaseLabel(slot.plot), {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        color: palette.badge,
        stroke: '#161f12',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(17);

    const label = params.scene.add
      .text(position.x, position.y + 31, `${slot.row}-${slot.col}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '10px',
        color: '#e8efdc',
        stroke: '#18210f',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(17);

    params.plotVisuals.set(slot.plotKey, {
      slot,
      frame,
      bed,
      crop,
      badge,
      label,
    });
  }
}

