import type {
  SpriteManifest,
  SpriteManifestPortraitEntry,
  SpriteManifestPortraitState,
  StripAnimationName,
} from '../../gameScene.stateTypes';

const FALLBACK_SPRITE_MANIFEST: SpriteManifest = {
  frameSize: { width: 64, height: 64 },
  origin: { x: 0.5, y: 0.84 },
  sprites: {
    'player-hero': {
      key: 'player-hero',
      path: '/assets/sprites/characters/player-hero.svg',
      scale: { x: 0.28125, y: 0.40625 },
      origin: { x: 0.5, y: 0.84 },
      physics: { width: 14, height: 22, offsetX: 2, offsetY: 2 },
    },
  },
};

export function resolveSpriteAssetPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/assets/sprites/${path}`;
}

export function toPortraitStateKey(animation: StripAnimationName): SpriteManifestPortraitState {
  if (animation === 'hit' || animation === 'cast') {
    return animation;
  }
  return 'normal';
}

export function resolvePortraitEntryPath(input: {
  entry: string | SpriteManifestPortraitEntry | undefined;
  animation: StripAnimationName;
  asString: (value: unknown) => string | null;
}): string | null {
  if (typeof input.entry === 'string') {
    return input.entry.trim().length > 0 ? resolveSpriteAssetPath(input.entry.trim()) : null;
  }

  if (!input.entry || typeof input.entry !== 'object') {
    return null;
  }

  const stateKey = toPortraitStateKey(input.animation);
  const statePath = input.asString(input.entry.states?.[stateKey]);
  if (typeof statePath === 'string' && statePath.trim().length > 0) {
    return resolveSpriteAssetPath(statePath.trim());
  }

  const directPath = input.asString(input.entry.path);
  if (typeof directPath === 'string' && directPath.trim().length > 0) {
    return resolveSpriteAssetPath(directPath.trim());
  }

  return null;
}

export function getCombatEnemySpritePath(input: {
  enemyKey: string;
  manifest: SpriteManifest;
  textureExists: (key: string) => boolean;
}): string | null {
  const directEntry = input.manifest.sprites[input.enemyKey];
  if (directEntry?.path) {
    return resolveSpriteAssetPath(directEntry.path);
  }

  for (const entry of Object.values(input.manifest.sprites)) {
    if (entry.key === input.enemyKey && entry.path) {
      return resolveSpriteAssetPath(entry.path);
    }
  }

  if (input.enemyKey.length > 0 && input.textureExists(input.enemyKey)) {
    return `/assets/sprites/characters/${input.enemyKey}.svg`;
  }

  return null;
}

export function resolveSpriteManifest(payload: unknown): SpriteManifest {
  const manifest = payload as SpriteManifest | undefined;
  if (manifest && manifest.sprites && manifest.sprites['player-hero']) {
    return manifest;
  }
  return FALLBACK_SPRITE_MANIFEST;
}
