import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0c1220');

    this.add
      .text(width / 2, height / 2 - 24, 'RPG FARM', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#f4e7c1',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, 'Initialisation du monde...', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#cdd7eb',
      })
      .setOrigin(0.5);

    this.time.delayedCall(250, () => {
      this.scene.start('GameScene');
    });
  }
}
