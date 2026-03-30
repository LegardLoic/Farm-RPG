import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.setPath('/assets/sprites');
    this.load.json('sprite-manifest', 'manifest.json');
    this.load.svg('player-hero', 'characters/player-hero.svg');
    this.load.svg('player-hero-strip', 'strips/characters/player-hero-strip.svg');
    this.load.svg('enemy-forest-goblin', 'characters/enemy-forest-goblin.svg');
    this.load.svg('enemy-training-dummy', 'characters/enemy-training-dummy.svg');
    this.load.svg('enemy-ash-scout', 'characters/enemy-ash-scout.svg');
    this.load.svg('enemy-thorn-beast-alpha', 'characters/enemy-thorn-beast-alpha.svg');
    this.load.svg('enemy-cinder-warden', 'characters/enemy-cinder-warden.svg');
    this.load.svg('enemy-ash-vanguard-captain', 'characters/enemy-ash-vanguard-captain.svg');
    this.load.svg('enemy-curse-heart-avatar', 'characters/enemy-curse-heart-avatar.svg');
    this.load.svg('enemy-thorn-beast-alpha-strip', 'strips/characters/enemy-thorn-beast-alpha-strip.svg');
    this.load.svg('enemy-cinder-warden-strip', 'strips/characters/enemy-cinder-warden-strip.svg');
    this.load.svg('enemy-ash-vanguard-captain-strip', 'strips/characters/enemy-ash-vanguard-captain-strip.svg');
    this.load.svg('enemy-curse-heart-avatar-strip', 'strips/characters/enemy-curse-heart-avatar-strip.svg');
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
