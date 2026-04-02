import type { HudStripPlaybackState, SpriteManifestStripEntry, StripAnimationName } from '../../gameScene.stateTypes';

type HudStripTimingSnapshot = {
  idleIntervalMs: number;
  hitIntervalMs: number;
  castIntervalMs: number;
  hitDurationMs: number;
  castDurationMs: number;
};

export type EnemyHudStripPlaybackSceneLike = {
  enemyHudStripPlayback: HudStripPlaybackState | null;
  enemyHudStripIntervalId: number | null;
  stopEnemyHudStripPlayback(): void;
  getStripFrames(strip: SpriteManifestStripEntry, animation: StripAnimationName): number[];
  resolveSpriteAssetPath(path: string): string;
  applyEnemyHudStripFrame(element: HTMLElement, frameIndex: number, frameCount: number): void;
  getStripHudTimings(strip: SpriteManifestStripEntry | null): HudStripTimingSnapshot;
};

export function startEnemyHudStripPlaybackForScene(
  scene: EnemyHudStripPlaybackSceneLike,
  element: HTMLElement,
  enemyKey: string,
  strip: SpriteManifestStripEntry,
  animation: StripAnimationName,
): void {
  const frames = scene.getStripFrames(strip, animation);
  if (frames.length === 0) {
    scene.stopEnemyHudStripPlayback();
    return;
  }

  const shouldKeepCurrent =
    scene.enemyHudStripPlayback?.enemyKey === enemyKey &&
    scene.enemyHudStripPlayback?.stripKey === strip.key &&
    scene.enemyHudStripPlayback?.animation === animation;

  if (shouldKeepCurrent) {
    return;
  }

  scene.stopEnemyHudStripPlayback();

  const frameCount = Math.max(1, strip.frameCount);
  element.style.backgroundImage = `url("${scene.resolveSpriteAssetPath(strip.path)}")`;
  element.style.backgroundRepeat = 'no-repeat';
  element.style.backgroundSize = `${frameCount * 100}% 100%`;
  scene.applyEnemyHudStripFrame(element, frames[0] ?? 0, frameCount);

  scene.enemyHudStripPlayback = {
    enemyKey,
    stripKey: strip.key,
    animation,
    frames,
    frameCount,
    frameCursor: 0,
  };
  element.dataset.enemyKey = enemyKey;
  element.dataset.stripAnimation = animation;

  if (frames.length <= 1) {
    return;
  }

  const hudTimings = scene.getStripHudTimings(strip);
  const intervalMs =
    animation === 'hit'
      ? hudTimings.hitIntervalMs
      : animation === 'cast'
        ? hudTimings.castIntervalMs
        : hudTimings.idleIntervalMs;

  scene.enemyHudStripIntervalId = window.setInterval(() => {
    if (!scene.enemyHudStripPlayback) {
      return;
    }

    scene.enemyHudStripPlayback.frameCursor =
      (scene.enemyHudStripPlayback.frameCursor + 1) % scene.enemyHudStripPlayback.frames.length;
    const frameIndex = scene.enemyHudStripPlayback.frames[scene.enemyHudStripPlayback.frameCursor] ?? 0;
    scene.applyEnemyHudStripFrame(element, frameIndex, scene.enemyHudStripPlayback.frameCount);
  }, intervalMs);
}
