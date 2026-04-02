import type Phaser from 'phaser';
import type { VillageSceneZoneConfig, VillageSceneZoneVisual } from '../../gameScene.types';

export function createVillageActionZone(params: {
  scene: Phaser.Scene;
  config: VillageSceneZoneConfig;
  getZoneStateLabel: (config: VillageSceneZoneConfig) => string;
  onHover: () => void;
  onInteract: () => void;
}): VillageSceneZoneVisual {
  const { scene, config } = params;

  const frame = scene.add.rectangle(config.x, config.y, config.width, config.height, 0x3a3f43, 0.12);
  frame.setStrokeStyle(2, 0xd4c39a, 0.42);
  frame.setDepth(14);
  frame.setInteractive({ useHandCursor: true });
  frame.on('pointerover', () => params.onHover());
  frame.on('pointerdown', () => params.onInteract());

  const overlay = scene.add.rectangle(config.x, config.y + 20, config.width - 24, config.height - 48, 0x111418, 0.22);
  overlay.setDepth(15);

  const title = scene.add
    .text(config.x, config.y - config.height * 0.3, config.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#f1e5cb',
      stroke: '#161312',
      strokeThickness: 3,
    })
    .setOrigin(0.5)
    .setDepth(16);

  const state = scene.add
    .text(config.x, config.y + config.height * 0.22, params.getZoneStateLabel(config), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '11px',
      color: '#c8d4dc',
      stroke: '#111315',
      strokeThickness: 3,
    })
    .setOrigin(0.5)
    .setDepth(16);

  return {
    config,
    frame,
    overlay,
    title,
    state,
  };
}

