import Phaser from 'phaser';
import { createGameConfig } from './config';

export function bootstrapGame(): Phaser.Game {
  return new Phaser.Game(createGameConfig());
}
