import Phaser from 'phaser';

export function createVillageStaticLabels(scene: Phaser.Scene): Phaser.GameObjects.Text[] {
  return [
    scene.add
      .text(286, 90, 'Mairie', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#f5e4bf',
        stroke: '#171311',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(1266, 94, 'Forge', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#f8d7a4',
        stroke: '#171311',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(1038, 440, 'Marche', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#f5e0b3',
        stroke: '#171311',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(356, 486, 'Coin calme', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: '#d5e8cc',
        stroke: '#171311',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(806, 170, 'Vers la Tour', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: '#dcc6d8',
        stroke: '#171311',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
    scene.add
      .text(808, 706, 'Vers la Ferme', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: '#f0e3c3',
        stroke: '#171311',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(12),
  ];
}

export function createVillageActionHintLabel(scene: Phaser.Scene): Phaser.GameObjects.Text {
  return scene.add
    .text(804, 862, 'E interagir • R cible suivante • clique une zone pour agir', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#e4ebf2',
      stroke: '#131c1f',
      strokeThickness: 3,
    })
    .setOrigin(0.5)
    .setDepth(21);
}
