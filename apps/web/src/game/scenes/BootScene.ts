import Phaser from 'phaser';
import { preloadWorldPlayerSprites as preloadWorldPlayerSpritesFromFeature } from './game/features/common/playerWorldAnimations';

const FARM_TILESET_IMAGES = [
  { key: 'ground_grasss', path: 'Terrain/ground_grass/ground_grasss.png' },
  { key: 'water_detilazation', path: 'Terrain/water/water_detilazation.png' },
  { key: 'Water_detilazation2', path: 'Terrain/water/water_detilazation_v2.png' },
  { key: 'Water_coasts', path: 'Terrain/ground_grass/Water_coasts.png' },
  { key: 'Details', path: 'Decor_Below/Details.png' },
  { key: 'Houses', path: 'architecture/house/Houses.png' },
  { key: 'Doors', path: 'architecture/house/Doors.png' },
  { key: 'house_windows', path: 'architecture/house/house_windows.png' },
  { key: 'Objects_outside', path: 'architecture/Objects_outside.png' },
  { key: 'bird_fly_animation', path: 'architecture/bird_fly_animation.png' },
  { key: 'exterior', path: 'architecture/house/exterior.png' },
  { key: 'Trees_shadow_source', path: 'architecture/Trees_shadow_source.png' },
  { key: 'Trees_texture_shadows_dark_source', path: 'architecture/Trees_texture_shadows_dark_source.png' },
  { key: 'Details__2', path: 'architecture/Details_desert.png' },
  { key: 'Icons', path: 'architecture/Icons.png' },
  { key: 'Objects', path: 'architecture/Objects.png' },
] as const;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.setPath('/assets/maps');
    this.load.json('farm-map-tiled', 'farm.tmj');

    this.load.setPath('/assets/tiles');
    for (const tilesetImage of FARM_TILESET_IMAGES) {
      this.load.image(tilesetImage.key, tilesetImage.path);
    }

    preloadWorldPlayerSpritesFromFeature(this);

    this.load.setPath('/assets/sprites');
    this.load.json('sprite-manifest', 'manifest.json');
    this.load.svg('player-hero', 'characters/player-hero.svg');
    this.load.spritesheet('player-hero-strip', 'strips/characters/player-hero-strip.svg', {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 2,
    });
    this.load.svg('enemy-forest-goblin', 'characters/enemy-forest-goblin.svg');
    this.load.svg('enemy-training-dummy', 'characters/enemy-training-dummy.svg');
    this.load.svg('enemy-ash-scout', 'characters/enemy-ash-scout.svg');
    this.load.svg('enemy-thorn-beast-alpha', 'characters/enemy-thorn-beast-alpha.svg');
    this.load.svg('enemy-cinder-warden', 'characters/enemy-cinder-warden.svg');
    this.load.svg('enemy-ash-vanguard-captain', 'characters/enemy-ash-vanguard-captain.svg');
    this.load.svg('enemy-curse-heart-avatar', 'characters/enemy-curse-heart-avatar.svg');
    this.load.spritesheet('enemy-thorn-beast-alpha-strip', 'strips/characters/enemy-thorn-beast-alpha-strip.svg', {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 2,
    });
    this.load.spritesheet('enemy-cinder-warden-strip', 'strips/characters/enemy-cinder-warden-strip.svg', {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 2,
    });
    this.load.spritesheet('enemy-ash-vanguard-captain-strip', 'strips/characters/enemy-ash-vanguard-captain-strip.svg', {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 2,
    });
    this.load.spritesheet('enemy-curse-heart-avatar-strip', 'strips/characters/enemy-curse-heart-avatar-strip.svg', {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 2,
    });
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
