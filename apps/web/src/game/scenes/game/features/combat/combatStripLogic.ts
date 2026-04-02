import type {
  CombatEncounterState,
  SpriteManifest,
  SpriteManifestPortraitEntry,
  SpriteManifestStripEntry,
  StripAnimationName,
  StripCalibrationPreset,
} from '../../gameScene.stateTypes';

export function getEnemyHudStripPreferredAnimation(params: {
  enemyHudStripOverrideAnimation: StripAnimationName | null;
  combatState: Pick<CombatEncounterState, 'status' | 'turn'> | null;
}): StripAnimationName {
  if (params.enemyHudStripOverrideAnimation) {
    return params.enemyHudStripOverrideAnimation;
  }

  if (!params.combatState || params.combatState.status !== 'active') {
    return 'idle';
  }

  return params.combatState.turn === 'enemy' ? 'cast' : 'idle';
}

export function getStripManifestEntry(params: {
  manifest: SpriteManifest;
  entityKey: string;
}): SpriteManifestStripEntry | null {
  if (!params.manifest.strips) {
    return null;
  }

  const directEntry = params.manifest.strips[params.entityKey];
  if (directEntry) {
    return directEntry;
  }

  for (const entry of Object.values(params.manifest.strips)) {
    if (entry.key === params.entityKey) {
      return entry;
    }
  }

  return null;
}

export function getStripFrames(strip: SpriteManifestStripEntry, animation: StripAnimationName): number[] {
  const maxFrame = Math.max(0, strip.frameCount - 1);
  const configured = strip.animations?.[animation];
  const sanitized = Array.isArray(configured)
    ? configured.filter((frame): frame is number => Number.isInteger(frame) && frame >= 0 && frame <= maxFrame)
    : [];

  if (sanitized.length > 0) {
    return sanitized;
  }

  if (animation === 'hit') {
    return [Math.min(1, maxFrame), maxFrame];
  }
  if (animation === 'cast') {
    return [0, maxFrame];
  }
  if (maxFrame <= 0) {
    return [0];
  }
  return [0, Math.min(1, maxFrame)];
}

export function getStripPlayerTimings(params: {
  strip: SpriteManifestStripEntry | null;
  preset: StripCalibrationPreset | null;
}): {
  idleFps: number;
  hitFps: number;
  castFps: number;
  hitDurationMs: number;
  castDurationMs: number;
} {
  const player = params.strip?.timings?.player;
  const base = {
    idleFps: resolveTimingValue(player?.idleFps, 4, 1, 24),
    hitFps: resolveTimingValue(player?.hitFps, 8, 1, 24),
    castFps: resolveTimingValue(player?.castFps, 8, 1, 24),
    hitDurationMs: resolveTimingValue(player?.hitDurationMs, 360, 80, 3000),
    castDurationMs: resolveTimingValue(player?.castDurationMs, 420, 80, 3000),
  };

  if (!params.preset) {
    return base;
  }

  return {
    idleFps: scaleTimingWithPreset(base.idleFps, params.preset.playerFpsMultiplier, 1, 24),
    hitFps: scaleTimingWithPreset(base.hitFps, params.preset.playerFpsMultiplier, 1, 24),
    castFps: scaleTimingWithPreset(base.castFps, params.preset.playerFpsMultiplier, 1, 24),
    hitDurationMs: scaleTimingWithPreset(base.hitDurationMs, params.preset.playerActionDurationMultiplier, 80, 3000),
    castDurationMs: scaleTimingWithPreset(base.castDurationMs, params.preset.playerActionDurationMultiplier, 80, 3000),
  };
}

export function getStripHudTimings(params: {
  strip: SpriteManifestStripEntry | null;
  preset: StripCalibrationPreset | null;
}): {
  idleIntervalMs: number;
  hitIntervalMs: number;
  castIntervalMs: number;
  hitDurationMs: number;
  castDurationMs: number;
} {
  const hud = params.strip?.timings?.hud;
  const base = {
    idleIntervalMs: resolveTimingValue(hud?.idleIntervalMs, 240, 60, 2000),
    hitIntervalMs: resolveTimingValue(hud?.hitIntervalMs, 140, 60, 2000),
    castIntervalMs: resolveTimingValue(hud?.castIntervalMs, 170, 60, 2000),
    hitDurationMs: resolveTimingValue(hud?.hitDurationMs, 460, 80, 3000),
    castDurationMs: resolveTimingValue(hud?.castDurationMs, 420, 80, 3000),
  };

  if (!params.preset) {
    return base;
  }

  return {
    idleIntervalMs: scaleTimingWithPreset(base.idleIntervalMs, params.preset.hudIntervalMultiplier, 60, 2000),
    hitIntervalMs: scaleTimingWithPreset(base.hitIntervalMs, params.preset.hudIntervalMultiplier, 60, 2000),
    castIntervalMs: scaleTimingWithPreset(base.castIntervalMs, params.preset.hudIntervalMultiplier, 60, 2000),
    hitDurationMs: scaleTimingWithPreset(base.hitDurationMs, params.preset.hudActionDurationMultiplier, 80, 3000),
    castDurationMs: scaleTimingWithPreset(base.castDurationMs, params.preset.hudActionDurationMultiplier, 80, 3000),
  };
}

export function resolveTimingValue(value: number | undefined, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return clamp(Math.round(value), min, max);
}

export function scaleTimingWithPreset(baseValue: number, multiplier: number, min: number, max: number): number {
  const safeMultiplier = Number.isFinite(multiplier) ? multiplier : 1;
  return clamp(Math.round(baseValue * safeMultiplier), min, max);
}

export function applyEnemyHudStripFrame(params: {
  element: HTMLElement;
  frameIndex: number;
  frameCount: number;
}): void {
  const safeFrameCount = Math.max(1, params.frameCount);
  const clampedIndex = clamp(params.frameIndex, 0, safeFrameCount - 1);
  const ratio = safeFrameCount === 1 ? 0 : clampedIndex / (safeFrameCount - 1);
  params.element.style.backgroundPosition = `${ratio * 100}% 0%`;
}

export function getCombatEnemyPortraitPath(params: {
  enemyKey: string;
  animation: StripAnimationName;
  manifest: SpriteManifest;
  resolvePortraitEntryPath: (
    entry: string | SpriteManifestPortraitEntry | undefined,
    animation: StripAnimationName,
  ) => string | null;
}): string | null {
  const byEnemyKey = params.manifest.portraits?.byEnemyKey;
  if (byEnemyKey && typeof byEnemyKey === 'object') {
    const directPath = byEnemyKey[params.enemyKey];
    const resolvedDirectPath = params.resolvePortraitEntryPath(directPath, params.animation);
    if (resolvedDirectPath) {
      return resolvedDirectPath;
    }
  }

  return params.resolvePortraitEntryPath(params.manifest.portraits?.fallback, params.animation);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
