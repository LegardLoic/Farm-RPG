import type { VillageSceneZoneConfig, VillageSceneZoneKey, VillageSceneZoneVisual } from '../../gameScene.types';

export function clearVillageSceneZoneVisuals(
  zoneVisuals: Map<VillageSceneZoneKey, VillageSceneZoneVisual>,
): void {
  for (const visual of zoneVisuals.values()) {
    visual.frame.destroy();
    visual.overlay.destroy();
    visual.title.destroy();
    visual.state.destroy();
  }
  zoneVisuals.clear();
}

export function renderVillageSceneZoneVisuals(params: {
  zoneVisuals: Map<VillageSceneZoneKey, VillageSceneZoneVisual>;
  selectedZoneKey: VillageSceneZoneKey | null;
  getZoneStateLabel: (zone: VillageSceneZoneConfig) => string;
  getZoneStateColor: (zone: VillageSceneZoneConfig) => string;
}): void {
  for (const visual of params.zoneVisuals.values()) {
    const selected = visual.config.key === params.selectedZoneKey;
    const stateLabel = params.getZoneStateLabel(visual.config);
    const stateColor = params.getZoneStateColor(visual.config);

    visual.frame.setFillStyle(selected ? 0x4b5f72 : 0x3a3f43, selected ? 0.26 : 0.12);
    visual.frame.setStrokeStyle(2, selected ? 0xffdd9f : 0xd4c39a, selected ? 0.95 : 0.42);
    visual.overlay.setFillStyle(selected ? 0x1f2730 : 0x111418, selected ? 0.42 : 0.22);
    visual.title.setColor(selected ? '#ffeac2' : '#f1e5cb');
    visual.state.setText(stateLabel);
    visual.state.setColor(stateColor);
  }
}

