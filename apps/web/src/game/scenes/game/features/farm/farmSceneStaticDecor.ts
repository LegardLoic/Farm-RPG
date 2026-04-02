import Phaser from 'phaser';

export function createFarmStaticLabels(scene: Phaser.Scene): Phaser.GameObjects.Text[] {
  return [
    scene.add
      .text(218, 130, 'Maison', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#f3e5c5',
        stroke: '#1d140c',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(218, 390, 'Coin craft', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#f1d9ab',
        stroke: '#1d140c',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(1244, 236, 'Sortie village', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: '#f6ddaf',
        stroke: '#1d140c',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
  ];
}

export function createFarmActionHintLabel(scene: Phaser.Scene): Phaser.GameObjects.Text {
  return scene.add
    .text(804, 690, '1 planter • 2 arroser • 3 recolter • F dormir • C craft', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#e8f2dd',
      stroke: '#192015',
      strokeThickness: 3,
    })
    .setOrigin(0.5)
    .setDepth(20);
}
