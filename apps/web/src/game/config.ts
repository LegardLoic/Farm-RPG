import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { FarmHouseScene } from './scenes/FarmHouseScene';
import { GameScene } from './scenes/game/GameScene';

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game-root',
    backgroundColor: '#0f1621',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, GameScene, FarmHouseScene],
  };
}
