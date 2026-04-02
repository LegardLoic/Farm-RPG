import type Phaser from 'phaser';

export function createFarmActionZone(params: {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  onTrigger: () => void;
}): Phaser.GameObjects.Rectangle {
  const trigger = params.scene.add.rectangle(params.x, params.y, params.width, params.height, 0xe2b66d, 0.08);
  trigger.setStrokeStyle(2, 0xe2b66d, 0.38);
  trigger.setDepth(11);
  trigger.setInteractive({ useHandCursor: true });
  trigger.on('pointerdown', () => params.onTrigger());
  return trigger;
}
