import type {
  CombatEncounterState,
  CombatUiStatus,
  DebugQaReplayBaseline,
  DebugQaStatus,
  DebugQaStepReplayState,
  ImportedDebugQaTrace,
} from '../../gameScene.stateTypes';
import { applyDebugQaFeedback } from './debugQaStateAdapters';

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
