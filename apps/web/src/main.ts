import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import './styles.css';

const game = new Phaser.Game(createGameConfig());

void game;
