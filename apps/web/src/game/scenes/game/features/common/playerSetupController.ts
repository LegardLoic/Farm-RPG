import type Phaser from 'phaser';
import type {
  SpriteManifest,
  SpriteManifestStripEntry,
  StripAnimationName,
} from '../../gameScene.stateTypes';

type SceneSpawnPoint = {
  x: number;
  y: number;
};

export type PlayerSetupSceneLike = {
  player: Phaser.Physics.Arcade.Sprite;
  playerUsesStripAnimation: boolean;
  physics: Phaser.Physics.Arcade.ArcadePhysics;
  textures: Phaser.Textures.TextureManager;
  getSpriteManifest(): SpriteManifest;
  getStripManifestEntry(entityKey: string): SpriteManifestStripEntry | null;
  ensureStripAnimations(strip: SpriteManifestStripEntry): void;
  getStripFrames(strip: SpriteManifestStripEntry, animation: StripAnimationName): number[];
  playPlayerStripAnimation(animation: StripAnimationName, force?: boolean): void;
  rebuildSceneObstacles(): void;
};

export function setupPlayerForScene(scene: PlayerSetupSceneLike, spawn: SceneSpawnPoint): void {
  const manifest = scene.getSpriteManifest();
  const playerSprite = manifest.sprites['player-hero'];
  if (!playerSprite) {
    throw new Error('Player sprite manifest entry is missing');
  }

  const playerStrip = scene.getStripManifestEntry('player-hero');
  const canUsePlayerStrip = Boolean(playerStrip && scene.textures.exists(playerStrip.key));

  if (canUsePlayerStrip && playerStrip) {
    scene.ensureStripAnimations(playerStrip);
    const idleFrames = scene.getStripFrames(playerStrip, 'idle');
    const firstFrame = idleFrames[0] ?? 0;

    scene.player = scene.physics.add.sprite(spawn.x, spawn.y, playerStrip.key, firstFrame);
    scene.player.setOrigin(playerStrip.origin?.x ?? playerSprite.origin.x, playerStrip.origin?.y ?? playerSprite.origin.y);
    scene.player.setScale(playerStrip.scale?.x ?? playerSprite.scale.x, playerStrip.scale?.y ?? playerSprite.scale.y);
    scene.player.setCollideWorldBounds(true);
    scene.player.setSize(playerStrip.physics?.width ?? playerSprite.physics.width, playerStrip.physics?.height ?? playerSprite.physics.height);
    scene.player.setOffset(playerStrip.physics?.offsetX ?? playerSprite.physics.offsetX, playerStrip.physics?.offsetY ?? playerSprite.physics.offsetY);
    scene.player.setDepth(34);
    scene.playerUsesStripAnimation = true;
    scene.playPlayerStripAnimation('idle', true);
  } else {
    if (!scene.textures.exists(playerSprite.key)) {
      throw new Error(`Player sprite texture not loaded: ${playerSprite.key}`);
    }

    scene.player = scene.physics.add.sprite(spawn.x, spawn.y, playerSprite.key);
    scene.player.setOrigin(playerSprite.origin.x, playerSprite.origin.y);
    scene.player.setScale(playerSprite.scale.x, playerSprite.scale.y);
    scene.player.setCollideWorldBounds(true);
    scene.player.setSize(playerSprite.physics.width, playerSprite.physics.height);
    scene.player.setOffset(playerSprite.physics.offsetX, playerSprite.physics.offsetY);
    scene.player.setDepth(34);
    scene.playerUsesStripAnimation = false;
  }

  scene.rebuildSceneObstacles();
}
