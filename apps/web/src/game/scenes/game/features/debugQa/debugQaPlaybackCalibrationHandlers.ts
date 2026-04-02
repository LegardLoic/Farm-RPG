import type {
  DebugQaReplayAutoPlaySpeedKey,
  DebugQaStatus,
  DebugQaStepReplayState,
  StripCalibrationPreset,
  StripCalibrationPresetKey,
} from '../../gameScene.stateTypes';
import type { DebugQaReplayAutoPlaySpeedOption } from './debugQaHelpers';

export function readDebugQaReplayAutoPlaySpeed(value: string): DebugQaReplayAutoPlaySpeedKey {
  return value === 'slow' || value === 'normal' || value === 'fast' ? value : 'normal';
}

export function readStoredDebugQaReplayAutoPlaySpeed(
  storageKey: string,
  readStorageValue: (key: string) => string | null,
): DebugQaReplayAutoPlaySpeedKey {
  return readDebugQaReplayAutoPlaySpeed(readStorageValue(storageKey) ?? 'normal');
}

export function persistDebugQaReplayAutoPlaySpeed(
  storageKey: string,
  speed: DebugQaReplayAutoPlaySpeedKey,
  writeStorageValue: (key: string, value: string) => void,
): void {
  writeStorageValue(storageKey, speed);
}

export function stopDebugQaStepReplayAutoPlay(input: {
  replayAutoPlayIntervalId: number | null;
  setReplayAutoPlayIntervalId: (value: number | null) => void;
  updateHud: () => void;
  updateHudOnStop: boolean;
}): void {
  if (input.replayAutoPlayIntervalId !== null) {
    window.clearInterval(input.replayAutoPlayIntervalId);
    input.setReplayAutoPlayIntervalId(null);
    if (input.updateHudOnStop) {
      input.updateHud();
    }
  }
}

export function toggleDebugQaStepReplayAutoPlay(input: {
  stepReplayState: DebugQaStepReplayState | null;
  replayAutoPlayIntervalId: number | null;
  replayAutoPlaySpeedSelectValue: string;
  replayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  replayAutoPlaySpeedOptions: DebugQaReplayAutoPlaySpeedOption[];
  setReplayAutoPlaySpeed: (value: DebugQaReplayAutoPlaySpeedKey) => void;
  setReplayAutoPlayIntervalId: (value: number | null) => void;
  persistDebugQaReplayAutoPlaySpeed: (value: DebugQaReplayAutoPlaySpeedKey) => void;
  stopDebugQaStepReplayAutoPlay: (updateHud: boolean) => void;
  advanceDebugQaStepReplay: () => void;
  hasStepReplayState: () => boolean;
  setDebugQaStatus: (value: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.stepReplayState) {
    input.setDebugQaStatus('error');
    input.setDebugQaError('Demarre un replay pas a pas avant d activer l auto-play.');
    input.setDebugQaMessage(null);
    input.updateHud();
    return;
  }

  if (input.replayAutoPlayIntervalId !== null) {
    input.stopDebugQaStepReplayAutoPlay(true);
    input.setDebugQaStatus('success');
    input.setDebugQaError(null);
    input.setDebugQaMessage('Auto-play en pause.');
    input.updateHud();
    return;
  }

  const selectedSpeed = readDebugQaReplayAutoPlaySpeed(
    input.replayAutoPlaySpeedSelectValue || input.replayAutoPlaySpeed,
  );
  input.setReplayAutoPlaySpeed(selectedSpeed);
  input.persistDebugQaReplayAutoPlaySpeed(selectedSpeed);

  const intervalMs = getDebugQaReplayAutoPlayIntervalMs(selectedSpeed, input.replayAutoPlaySpeedOptions);
  const intervalId = window.setInterval(() => {
    if (!input.hasStepReplayState()) {
      input.stopDebugQaStepReplayAutoPlay(true);
      return;
    }

    input.advanceDebugQaStepReplay();
    if (!input.hasStepReplayState()) {
      input.stopDebugQaStepReplayAutoPlay(true);
    }
  }, intervalMs);
  input.setReplayAutoPlayIntervalId(intervalId);

  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Auto-play actif (${getDebugQaReplayAutoPlaySpeedLabel(selectedSpeed, input.replayAutoPlaySpeedOptions)}).`);
  input.updateHud();
}

export function getDebugQaReplayAutoPlayIntervalMs(
  speed: DebugQaReplayAutoPlaySpeedKey,
  options: DebugQaReplayAutoPlaySpeedOption[],
): number {
  const option = options.find((entry) => entry.key === speed);
  return option?.intervalMs ?? 900;
}

export function getDebugQaReplayAutoPlaySpeedLabel(
  speed: DebugQaReplayAutoPlaySpeedKey,
  options: DebugQaReplayAutoPlaySpeedOption[],
): string {
  const option = options.find((entry) => entry.key === speed);
  return option?.label ?? 'Normal (900ms)';
}

export function readStripCalibrationPresetFromUi(value: string): StripCalibrationPresetKey {
  return value === 'manifest' || value === 'snappy' || value === 'cinematic' ? value : 'manifest';
}

export function readStoredStripCalibrationPreset(
  storageKey: string,
  readStorageValue: (key: string) => string | null,
): StripCalibrationPresetKey {
  return readStripCalibrationPresetFromUi(readStorageValue(storageKey) ?? 'manifest');
}

export function persistStripCalibrationPreset(
  storageKey: string,
  preset: StripCalibrationPresetKey,
  writeStorageValue: (key: string, value: string) => void,
): void {
  writeStorageValue(storageKey, preset);
}

export function applyStripCalibrationPreset(input: {
  stripCalibrationEnabled: boolean;
  stripCalibrationPresetSelectValue: string;
  stripCalibrationPreset: StripCalibrationPresetKey;
  persistStripCalibrationPreset: (value: StripCalibrationPresetKey) => void;
  setStripCalibrationPreset: (value: StripCalibrationPresetKey) => void;
  refreshStripCalibrationRuntime: () => void;
  getActiveStripCalibrationPreset: () => StripCalibrationPreset | null;
  setDebugQaStatus: (value: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.stripCalibrationEnabled) {
    return;
  }

  const nextPreset = readStripCalibrationPresetFromUi(
    input.stripCalibrationPresetSelectValue || input.stripCalibrationPreset,
  );
  input.setStripCalibrationPreset(nextPreset);
  input.persistStripCalibrationPreset(nextPreset);
  input.refreshStripCalibrationRuntime();

  const activePreset = input.getActiveStripCalibrationPreset();
  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Strip calibration active: ${activePreset?.label ?? 'Manifest default'}.`);
  input.updateHud();
}

export function readStorageValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

export type DebugQaReplayAutoPlaySceneLike = {
  debugQaStepReplayState: DebugQaStepReplayState | null;
  debugQaReplayAutoPlayIntervalId: number | null;
  debugQaReplayAutoPlaySpeedSelect: HTMLSelectElement | null;
  debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  debugQaStatus: DebugQaStatus;
  debugQaError: string | null;
  debugQaMessage: string | null;
  stopDebugQaStepReplayAutoPlay(updateHud: boolean): void;
  advanceDebugQaStepReplay(): void;
  persistDebugQaReplayAutoPlaySpeed(speed: DebugQaReplayAutoPlaySpeedKey): void;
  updateHud(): void;
};

export type StripCalibrationSceneLike = {
  stripCalibrationEnabled: boolean;
  debugQaStripCalibrationSelect: HTMLSelectElement | null;
  stripCalibrationPreset: StripCalibrationPresetKey;
  debugQaStatus: DebugQaStatus;
  debugQaError: string | null;
  debugQaMessage: string | null;
  persistStripCalibrationPreset(preset: StripCalibrationPresetKey): void;
  refreshStripCalibrationRuntime(): void;
  getActiveStripCalibrationPreset(): StripCalibrationPreset | null;
  updateHud(): void;
};

export function toggleDebugQaStepReplayAutoPlayForScene(
  scene: DebugQaReplayAutoPlaySceneLike,
  replayAutoPlaySpeedOptions: DebugQaReplayAutoPlaySpeedOption[],
): void {
  toggleDebugQaStepReplayAutoPlay({
    stepReplayState: scene.debugQaStepReplayState,
    replayAutoPlayIntervalId: scene.debugQaReplayAutoPlayIntervalId,
    replayAutoPlaySpeedSelectValue:
      scene.debugQaReplayAutoPlaySpeedSelect?.value ?? scene.debugQaReplayAutoPlaySpeed,
    replayAutoPlaySpeed: scene.debugQaReplayAutoPlaySpeed,
    replayAutoPlaySpeedOptions,
    setReplayAutoPlaySpeed: (value) => {
      scene.debugQaReplayAutoPlaySpeed = value;
    },
    setReplayAutoPlayIntervalId: (value) => {
      scene.debugQaReplayAutoPlayIntervalId = value;
    },
    persistDebugQaReplayAutoPlaySpeed: (value) => scene.persistDebugQaReplayAutoPlaySpeed(value),
    stopDebugQaStepReplayAutoPlay: (updateHud) => scene.stopDebugQaStepReplayAutoPlay(updateHud),
    advanceDebugQaStepReplay: () => scene.advanceDebugQaStepReplay(),
    hasStepReplayState: () => scene.debugQaStepReplayState !== null,
    setDebugQaStatus: (value) => {
      scene.debugQaStatus = value;
    },
    setDebugQaError: (value) => {
      scene.debugQaError = value;
    },
    setDebugQaMessage: (value) => {
      scene.debugQaMessage = value;
    },
    updateHud: () => scene.updateHud(),
  });
}

export function stopDebugQaStepReplayAutoPlayForScene(
  scene: DebugQaReplayAutoPlaySceneLike,
  updateHudOnStop: boolean,
): void {
  stopDebugQaStepReplayAutoPlay({
    replayAutoPlayIntervalId: scene.debugQaReplayAutoPlayIntervalId,
    setReplayAutoPlayIntervalId: (value) => {
      scene.debugQaReplayAutoPlayIntervalId = value;
    },
    updateHudOnStop,
    updateHud: () => scene.updateHud(),
  });
}

export function applyStripCalibrationPresetForScene(scene: StripCalibrationSceneLike): void {
  applyStripCalibrationPreset({
    stripCalibrationEnabled: scene.stripCalibrationEnabled,
    stripCalibrationPresetSelectValue:
      scene.debugQaStripCalibrationSelect?.value ?? scene.stripCalibrationPreset,
    stripCalibrationPreset: scene.stripCalibrationPreset,
    persistStripCalibrationPreset: (value) => scene.persistStripCalibrationPreset(value),
    setStripCalibrationPreset: (value) => {
      scene.stripCalibrationPreset = value;
    },
    refreshStripCalibrationRuntime: () => scene.refreshStripCalibrationRuntime(),
    getActiveStripCalibrationPreset: () => scene.getActiveStripCalibrationPreset(),
    setDebugQaStatus: (value) => {
      scene.debugQaStatus = value;
    },
    setDebugQaError: (value) => {
      scene.debugQaError = value;
    },
    setDebugQaMessage: (value) => {
      scene.debugQaMessage = value;
    },
    updateHud: () => scene.updateHud(),
  });
}
