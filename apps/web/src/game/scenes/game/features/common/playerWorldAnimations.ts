import Phaser from 'phaser';

export const WORLD_PLAYER_DIRECTIONS = ['north', 'south', 'east', 'west'] as const;
export type WorldPlayerDirection = (typeof WORLD_PLAYER_DIRECTIONS)[number];

const WORLD_PLAYER_ASSET_ROOT = '/assets/Spritesheet/Main_Character';
const WORLD_PLAYER_DEFAULT_WALK_FPS = 10;

const WORLD_PLAYER_IDLE_TEXTURE_KEYS: Record<WorldPlayerDirection, string> = {
  north: 'player-world-idle-north',
  south: 'player-world-idle-south',
  east: 'player-world-idle-east',
  west: 'player-world-idle-west',
};

const WORLD_PLAYER_WALK_ANIMATION_KEYS: Record<WorldPlayerDirection, string> = {
  north: 'player-world-walk-north',
  south: 'player-world-walk-south',
  east: 'player-world-walk-east',
  west: 'player-world-walk-west',
};

const WORLD_PLAYER_WALK_FRAME_TOTAL_BY_DIRECTION: Record<WorldPlayerDirection, number> = {
  north: 8,
  south: 6,
  east: 6,
  west: 6,
};

const WORLD_PLAYER_WALK_FRAME_KEYS: Record<WorldPlayerDirection, string[]> = {
  north: buildWorldPlayerWalkFrameKeys('north'),
  south: buildWorldPlayerWalkFrameKeys('south'),
  east: buildWorldPlayerWalkFrameKeys('east'),
  west: buildWorldPlayerWalkFrameKeys('west'),
};

const WORLD_PLAYER_WALK_FRAME_ALIGNMENT_OFFSETS: Record<
  WorldPlayerDirection,
  Array<{ x: number; y: number }>
> = {
  north: [
    { x: -1, y: -6 },
    { x: -2, y: -6 },
    { x: -2, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -6 },
    { x: 2, y: -6 },
    { x: 2, y: 3 },
    { x: 0, y: -1 },
  ],
  south: [
    { x: 0, y: 0 },
    { x: 1, y: -7 },
    { x: 1, y: -4 },
    { x: 0, y: -1 },
    { x: -1, y: -6 },
    { x: -1, y: -5 },
  ],
  east: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 3, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 2 },
    { x: 3, y: 2 },
  ],
  west: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: -2, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: -2, y: 2 },
  ],
};

export const WORLD_PLAYER_DEFAULT_DIRECTION: WorldPlayerDirection = 'south';
export const WORLD_PLAYER_SCALE = 0.5;

function getWorldPlayerTextureKeys(): string[] {
  const output: string[] = [];

  for (const direction of WORLD_PLAYER_DIRECTIONS) {
    output.push(WORLD_PLAYER_IDLE_TEXTURE_KEYS[direction]);
    output.push(...WORLD_PLAYER_WALK_FRAME_KEYS[direction]);
    output.push(...getWorldPlayerAlignedWalkFrameKeys(direction));
  }

  return output;
}

function buildWorldPlayerWalkFrameKeys(direction: WorldPlayerDirection): string[] {
  const total = WORLD_PLAYER_WALK_FRAME_TOTAL_BY_DIRECTION[direction];
  const output: string[] = [];

  for (let index = 0; index < total; index += 1) {
    output.push(`player-world-walk-${direction}-${String(index).padStart(3, '0')}`);
  }

  return output;
}

export function preloadWorldPlayerSprites(scene: Phaser.Scene): void {
  scene.load.setPath(WORLD_PLAYER_ASSET_ROOT);

  for (const direction of WORLD_PLAYER_DIRECTIONS) {
    scene.load.image(WORLD_PLAYER_IDLE_TEXTURE_KEYS[direction], `rotations/${direction}.png`);
  }

  for (const direction of WORLD_PLAYER_DIRECTIONS) {
    const frameTotal = WORLD_PLAYER_WALK_FRAME_TOTAL_BY_DIRECTION[direction];
    for (let index = 0; index < frameTotal; index += 1) {
      const frameId = String(index).padStart(3, '0');
      scene.load.image(`player-world-walk-${direction}-${frameId}`, `animations/walk/${direction}/frame_${frameId}.png`);
    }
  }
}

export function hasWorldPlayerIdleSprites(textures: Phaser.Textures.TextureManager): boolean {
  return WORLD_PLAYER_DIRECTIONS.every((direction) => textures.exists(WORLD_PLAYER_IDLE_TEXTURE_KEYS[direction]));
}

export function applyWorldPlayerSmoothFiltering(textures: Phaser.Textures.TextureManager): void {
  for (const textureKey of getWorldPlayerTextureKeys()) {
    if (!textures.exists(textureKey)) {
      continue;
    }

    const texture = textures.get(textureKey);
    texture.setFilter(resolveWorldPlayerFilterMode(textureKey));
  }
}

function getWorldPlayerAlignedWalkFrameKeys(direction: WorldPlayerDirection): string[] {
  return WORLD_PLAYER_WALK_FRAME_KEYS[direction].map((key) => `${key}-aligned`);
}

function ensureWorldPlayerAlignedWalkFrames(scene: Phaser.Scene): void {
  for (const direction of WORLD_PLAYER_DIRECTIONS) {
    const sourceFrameKeys = WORLD_PLAYER_WALK_FRAME_KEYS[direction];
    const alignedFrameKeys = getWorldPlayerAlignedWalkFrameKeys(direction);
    const offsets = WORLD_PLAYER_WALK_FRAME_ALIGNMENT_OFFSETS[direction];

    for (let index = 0; index < sourceFrameKeys.length; index += 1) {
      const sourceKey = sourceFrameKeys[index];
      const alignedKey = alignedFrameKeys[index];
      const offset = offsets[index] ?? { x: 0, y: 0 };

      if (!sourceKey || !alignedKey || scene.textures.exists(alignedKey) || !scene.textures.exists(sourceKey)) {
        continue;
      }

      const sourceTexture = scene.textures.get(sourceKey);
      const sourceImage = sourceTexture.getSourceImage() as CanvasImageSource & {
        width?: number;
        height?: number;
      };
      const width = Math.max(1, Math.round(sourceImage.width ?? sourceTexture.source[0]?.width ?? 92));
      const height = Math.max(1, Math.round(sourceImage.height ?? sourceTexture.source[0]?.height ?? 92));

      const alignedTexture = scene.textures.createCanvas(alignedKey, width, height);
      if (!alignedTexture) {
        continue;
      }

      const context = alignedTexture.getContext();
      context.clearRect(0, 0, width, height);
      context.drawImage(sourceImage, offset.x, offset.y);
      alignedTexture.refresh();
      scene.textures.get(alignedKey).setFilter(resolveWorldPlayerFilterMode(alignedKey));
    }
  }
}

function resolveWorldPlayerFilterMode(textureKey: string): Phaser.Textures.FilterMode {
  void textureKey;
  return Phaser.Textures.FilterMode.LINEAR;
}

export function ensureWorldPlayerWalkAnimations(scene: Phaser.Scene, frameRate = WORLD_PLAYER_DEFAULT_WALK_FPS): void {
  ensureWorldPlayerAlignedWalkFrames(scene);

  for (const direction of WORLD_PLAYER_DIRECTIONS) {
    const animationKey = WORLD_PLAYER_WALK_ANIMATION_KEYS[direction];
    if (scene.anims.exists(animationKey)) {
      continue;
    }

    const alignedFrameKeys = getWorldPlayerAlignedWalkFrameKeys(direction);
    const hasAlignedFrames = alignedFrameKeys.every((key) => scene.textures.exists(key));
    const frameKeys = hasAlignedFrames ? alignedFrameKeys : WORLD_PLAYER_WALK_FRAME_KEYS[direction];
    if (frameKeys.length === 0 || !frameKeys.every((key) => scene.textures.exists(key))) {
      continue;
    }

    scene.anims.create({
      key: animationKey,
      frames: frameKeys.map((key) => ({ key })),
      frameRate,
      repeat: -1,
    });
  }
}

export function getWorldPlayerIdleTextureKey(direction: WorldPlayerDirection): string {
  return WORLD_PLAYER_IDLE_TEXTURE_KEYS[direction];
}

export function getWorldPlayerWalkAnimationKey(direction: WorldPlayerDirection): string {
  return WORLD_PLAYER_WALK_ANIMATION_KEYS[direction];
}

export function resolveWorldPlayerDirection(
  velocityX: number,
  velocityY: number,
  fallback: WorldPlayerDirection,
): WorldPlayerDirection {
  const absX = Math.abs(velocityX);
  const absY = Math.abs(velocityY);

  if (absX <= 0.001 && absY <= 0.001) {
    return fallback;
  }

  if (absX > absY) {
    return velocityX > 0 ? 'east' : 'west';
  }

  if (absY > absX) {
    return velocityY > 0 ? 'south' : 'north';
  }

  return fallback;
}
