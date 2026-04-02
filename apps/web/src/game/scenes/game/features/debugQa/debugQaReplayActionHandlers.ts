import type {
  CombatEncounterState,
  CombatUiStatus,
  DebugQaReplayBaseline,
  DebugQaStatus,
  DebugQaStepReplayState,
  ImportedDebugQaTrace,
} from '../../gameScene.stateTypes';
import { applyDebugQaFeedback } from './debugQaStateAdapters';

export type DebugQaReplaySceneLike = {
  debugQaEnabled: boolean;
  debugQaImportedTrace: ImportedDebugQaTrace | null;
  debugQaStepReplayState: DebugQaStepReplayState | null;
  debugQaStatus: DebugQaStatus;
  debugQaError: string | null;
  debugQaMessage: string | null;
  combatState: CombatEncounterState | null;
  combatStatus: CombatUiStatus;
  combatLogs: string[];
  combatMessage: string;
  combatError: string | null;
  stopDebugQaStepReplay(restoreBaseline: boolean): void;
  stopDebugQaStepReplayAutoPlay(updateHud: boolean): void;
  captureDebugQaReplayBaseline(): DebugQaReplayBaseline;
  applyImportedDebugQaTrace(trace: ImportedDebugQaTrace): void;
  cloneCombatState(state: CombatEncounterState): CombatEncounterState;
  restoreDebugQaReplayBaseline(baseline: DebugQaReplayBaseline): void;
  parseImportedDebugQaTrace(rawPayload: unknown, sourceFile: string): ImportedDebugQaTrace | null;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

export function replayImportedDebugQaTrace(input: {
  debugQaEnabled: boolean;
  importedTrace: ImportedDebugQaTrace | null;
  stopDebugQaStepReplay: (restoreBaseline: boolean) => void;
  applyImportedDebugQaTrace: (trace: ImportedDebugQaTrace) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.debugQaEnabled) {
    return;
  }

  if (!input.importedTrace) {
    applyDebugQaFeedback(input, {
      status: 'error',
      error: 'Importe un JSON trace avant de lancer Replay.',
      message: null,
    });
    return;
  }

  input.stopDebugQaStepReplay(false);
  input.applyImportedDebugQaTrace(input.importedTrace);
  applyDebugQaFeedback(input, {
    status: 'success',
    error: null,
    message: `Replay QA applique (${input.importedTrace.sourceFile}).`,
  });
}

export function startDebugQaStepReplay(input: {
  debugQaEnabled: boolean;
  importedTrace: ImportedDebugQaTrace | null;
  stopDebugQaStepReplay: (restoreBaseline: boolean) => void;
  captureDebugQaReplayBaseline: () => DebugQaReplayBaseline;
  applyImportedDebugQaTrace: (trace: ImportedDebugQaTrace) => void;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
  combatState: CombatEncounterState | null;
  setCombatState: (state: CombatEncounterState | null) => void;
  setCombatStatus: (status: CombatUiStatus) => void;
  setCombatLogs: (logs: string[]) => void;
  setCombatMessage: (value: string) => void;
  setCombatError: (value: string | null) => void;
  setDebugQaStepReplayState: (value: DebugQaStepReplayState | null) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.debugQaEnabled) {
    return;
  }

  if (!input.importedTrace) {
    applyDebugQaFeedback(input, {
      status: 'error',
      error: 'Importe un JSON trace avant de lancer le replay pas a pas.',
      message: null,
    });
    return;
  }

  const logs = input.importedTrace.combatLogs.slice(-20);
  if (logs.length === 0) {
    applyDebugQaFeedback(input, {
      status: 'error',
      error: 'La trace importee ne contient pas de logs combat exploitables.',
      message: null,
    });
    return;
  }

  input.stopDebugQaStepReplay(false);
  const baseline = input.captureDebugQaReplayBaseline();
  input.applyImportedDebugQaTrace(input.importedTrace);

  input.setCombatStatus('active');
  input.setCombatLogs([]);
  input.setCombatMessage(`Replay step 0/${logs.length}`);
  input.setCombatError(null);

  if (input.combatState) {
    const nextCombatState = input.cloneCombatState(input.combatState);
    nextCombatState.status = 'active';
    nextCombatState.logs = [];
    nextCombatState.round = 1;
    nextCombatState.turn = 'player';
    input.setCombatState(nextCombatState);
  }

  input.setDebugQaStepReplayState({
    logs,
    stepIndex: 0,
    totalSteps: logs.length,
    finalTrace: input.importedTrace,
    baseline,
  });

  applyDebugQaFeedback(input, {
    status: 'success',
    error: null,
    message: `Replay pas a pas demarre (${logs.length} steps).`,
  });
}

export function advanceDebugQaStepReplay(input: {
  stepReplayState: DebugQaStepReplayState | null;
  stopDebugQaStepReplayAutoPlay: (updateHud: boolean) => void;
  applyImportedDebugQaTrace: (trace: ImportedDebugQaTrace) => void;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
  combatState: CombatEncounterState | null;
  combatMessage: string;
  setCombatState: (state: CombatEncounterState | null) => void;
  setCombatStatus: (status: CombatUiStatus) => void;
  setCombatLogs: (logs: string[]) => void;
  setCombatMessage: (value: string) => void;
  setCombatError: (value: string | null) => void;
  setDebugQaStepReplayState: (value: DebugQaStepReplayState | null) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.stepReplayState) {
    input.stopDebugQaStepReplayAutoPlay(false);
    applyDebugQaFeedback(input, {
      status: 'error',
      error: 'Demarre un replay pas a pas avant d avancer.',
      message: null,
    });
    return;
  }

  const replay = input.stepReplayState;
  if (replay.stepIndex >= replay.totalSteps) {
    input.stopDebugQaStepReplayAutoPlay(false);
    input.applyImportedDebugQaTrace(replay.finalTrace);
    input.setDebugQaStepReplayState(null);
    applyDebugQaFeedback(input, {
      status: 'success',
      error: null,
      message: 'Replay pas a pas termine (etat final applique).',
    });
    return;
  }

  const nextStep = replay.stepIndex + 1;
  replay.stepIndex = nextStep;

  const nextLogs = replay.logs.slice(0, nextStep);
  const nextMessage = replay.logs[nextStep - 1] ?? input.combatMessage;
  const nextStatus: CombatUiStatus = nextStep >= replay.totalSteps ? (replay.finalTrace.combatStatus ?? 'active') : 'active';

  input.setCombatLogs(nextLogs);
  input.setCombatMessage(nextMessage);
  input.setCombatError(null);
  input.setCombatStatus(nextStatus);

  if (input.combatState) {
    const nextCombatState = input.cloneCombatState(input.combatState);
    nextCombatState.logs = [...nextLogs];
    nextCombatState.round = Math.max(1, Math.ceil(nextStep / 2));
    nextCombatState.turn = nextStep % 2 === 0 ? 'player' : 'enemy';
    nextCombatState.status =
      nextStatus === 'active' || nextStatus === 'won' || nextStatus === 'lost' || nextStatus === 'fled'
        ? nextStatus
        : 'active';
    input.setCombatState(nextCombatState);
  }

  applyDebugQaFeedback(input, {
    status: 'success',
    error: null,
    message: `Replay step ${nextStep}/${replay.totalSteps}`,
  });
}

export function stopDebugQaStepReplay(input: {
  restoreBaseline: boolean;
  stopDebugQaStepReplayAutoPlay: (updateHud: boolean) => void;
  stepReplayState: DebugQaStepReplayState | null;
  setDebugQaStepReplayState: (value: DebugQaStepReplayState | null) => void;
  restoreDebugQaReplayBaseline: (baseline: DebugQaReplayBaseline) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  input.stopDebugQaStepReplayAutoPlay(false);
  const replay = input.stepReplayState;
  input.setDebugQaStepReplayState(null);

  if (!replay) {
    return;
  }

  if (input.restoreBaseline) {
    input.restoreDebugQaReplayBaseline(replay.baseline);
    applyDebugQaFeedback(input, {
      status: 'success',
      error: null,
      message: 'Replay pas a pas stoppe (etat precedent restaure).',
    });
  }
}

export async function handleDebugQaImportFileChange(input: {
  event: Event;
  debugQaEnabled: boolean;
  stepReplayState: DebugQaStepReplayState | null;
  stopDebugQaStepReplay: (restoreBaseline: boolean) => void;
  parseImportedDebugQaTrace: (rawPayload: unknown, sourceFile: string) => ImportedDebugQaTrace | null;
  getErrorMessage: (error: unknown, fallback: string) => string;
  setDebugQaImportedTrace: (trace: ImportedDebugQaTrace | null) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): Promise<void> {
  const sourceInput = input.event.target as HTMLInputElement | null;
  const file = sourceInput?.files?.[0];
  if (!file || !input.debugQaEnabled) {
    return;
  }

  if (input.stepReplayState) {
    input.stopDebugQaStepReplay(true);
  }

  applyDebugQaFeedback(input, {
    status: 'loading',
    error: null,
    message: `Importing ${file.name}...`,
  });

  try {
    const rawText = await file.text();
    const rawPayload = JSON.parse(rawText) as unknown;
    const importedTrace = input.parseImportedDebugQaTrace(rawPayload, file.name);
    if (!importedTrace) {
      throw new Error('Le fichier ne contient pas un JSON trace QA valide.');
    }

    input.setDebugQaImportedTrace(importedTrace);
    applyDebugQaFeedback(input, {
      status: 'success',
      error: null,
      message: `Trace importee: ${file.name} (${importedTrace.timestamp}).`,
    });
  } catch (error) {
    applyDebugQaFeedback(input, {
      status: 'error',
      error: input.getErrorMessage(error, 'Impossible d importer la trace JSON.'),
      message: null,
    });
  } finally {
    if (sourceInput) {
      sourceInput.value = '';
    }
  }
}

export function replayImportedDebugQaTraceForScene(scene: DebugQaReplaySceneLike): void {
  replayImportedDebugQaTrace({
    debugQaEnabled: scene.debugQaEnabled,
    importedTrace: scene.debugQaImportedTrace,
    stopDebugQaStepReplay: (restoreBaseline) => scene.stopDebugQaStepReplay(restoreBaseline),
    applyImportedDebugQaTrace: (trace) => scene.applyImportedDebugQaTrace(trace),
    setDebugQaStatus: (status) => {
      scene.debugQaStatus = status;
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

export function startDebugQaStepReplayForScene(scene: DebugQaReplaySceneLike): void {
  startDebugQaStepReplay({
    debugQaEnabled: scene.debugQaEnabled,
    importedTrace: scene.debugQaImportedTrace,
    stopDebugQaStepReplay: (restoreBaseline) => scene.stopDebugQaStepReplay(restoreBaseline),
    captureDebugQaReplayBaseline: () => scene.captureDebugQaReplayBaseline(),
    applyImportedDebugQaTrace: (trace) => scene.applyImportedDebugQaTrace(trace),
    cloneCombatState: (state) => scene.cloneCombatState(state),
    combatState: scene.combatState,
    setCombatState: (state) => {
      scene.combatState = state;
    },
    setCombatStatus: (status) => {
      scene.combatStatus = status;
    },
    setCombatLogs: (logs) => {
      scene.combatLogs = logs;
    },
    setCombatMessage: (value) => {
      scene.combatMessage = value;
    },
    setCombatError: (value) => {
      scene.combatError = value;
    },
    setDebugQaStepReplayState: (value) => {
      scene.debugQaStepReplayState = value;
    },
    setDebugQaStatus: (status) => {
      scene.debugQaStatus = status;
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

export function advanceDebugQaStepReplayForScene(scene: DebugQaReplaySceneLike): void {
  advanceDebugQaStepReplay({
    stepReplayState: scene.debugQaStepReplayState,
    stopDebugQaStepReplayAutoPlay: (updateHud) => scene.stopDebugQaStepReplayAutoPlay(updateHud),
    applyImportedDebugQaTrace: (trace) => scene.applyImportedDebugQaTrace(trace),
    cloneCombatState: (state) => scene.cloneCombatState(state),
    combatState: scene.combatState,
    combatMessage: scene.combatMessage,
    setCombatState: (state) => {
      scene.combatState = state;
    },
    setCombatStatus: (status) => {
      scene.combatStatus = status;
    },
    setCombatLogs: (logs) => {
      scene.combatLogs = logs;
    },
    setCombatMessage: (value) => {
      scene.combatMessage = value;
    },
    setCombatError: (value) => {
      scene.combatError = value;
    },
    setDebugQaStepReplayState: (value) => {
      scene.debugQaStepReplayState = value;
    },
    setDebugQaStatus: (status) => {
      scene.debugQaStatus = status;
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

export function stopDebugQaStepReplayForScene(scene: DebugQaReplaySceneLike, restoreBaseline: boolean): void {
  stopDebugQaStepReplay({
    restoreBaseline,
    stopDebugQaStepReplayAutoPlay: (updateHud) => scene.stopDebugQaStepReplayAutoPlay(updateHud),
    stepReplayState: scene.debugQaStepReplayState,
    setDebugQaStepReplayState: (value) => {
      scene.debugQaStepReplayState = value;
    },
    restoreDebugQaReplayBaseline: (baseline) => scene.restoreDebugQaReplayBaseline(baseline),
    setDebugQaStatus: (status) => {
      scene.debugQaStatus = status;
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

export async function handleDebugQaImportFileChangeForScene(
  scene: DebugQaReplaySceneLike,
  event: Event,
): Promise<void> {
  await handleDebugQaImportFileChange({
    event,
    debugQaEnabled: scene.debugQaEnabled,
    stepReplayState: scene.debugQaStepReplayState,
    stopDebugQaStepReplay: (restoreBaseline) => scene.stopDebugQaStepReplay(restoreBaseline),
    parseImportedDebugQaTrace: (rawPayload, sourceFile) => scene.parseImportedDebugQaTrace(rawPayload, sourceFile),
    getErrorMessage: (error, fallback) => scene.getErrorMessage(error, fallback),
    setDebugQaImportedTrace: (trace) => {
      scene.debugQaImportedTrace = trace;
    },
    setDebugQaStatus: (status) => {
      scene.debugQaStatus = status;
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
