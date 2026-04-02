import type {
  CombatEncounterState,
  CombatUiStatus,
  DebugQaReplayBaseline,
  DebugQaStatus,
  DebugQaStepReplayState,
  ImportedDebugQaTrace,
} from '../../gameScene.stateTypes';

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
    input.setDebugQaStatus('error');
    input.setDebugQaError('Importe un JSON trace avant de lancer Replay.');
    input.setDebugQaMessage(null);
    input.updateHud();
    return;
  }

  input.stopDebugQaStepReplay(false);
  input.applyImportedDebugQaTrace(input.importedTrace);
  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Replay QA applique (${input.importedTrace.sourceFile}).`);
  input.updateHud();
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
    input.setDebugQaStatus('error');
    input.setDebugQaError('Importe un JSON trace avant de lancer le replay pas a pas.');
    input.setDebugQaMessage(null);
    input.updateHud();
    return;
  }

  const logs = input.importedTrace.combatLogs.slice(-20);
  if (logs.length === 0) {
    input.setDebugQaStatus('error');
    input.setDebugQaError('La trace importee ne contient pas de logs combat exploitables.');
    input.setDebugQaMessage(null);
    input.updateHud();
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

  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Replay pas a pas demarre (${logs.length} steps).`);
  input.updateHud();
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
    input.setDebugQaStatus('error');
    input.setDebugQaError('Demarre un replay pas a pas avant d avancer.');
    input.setDebugQaMessage(null);
    input.updateHud();
    return;
  }

  const replay = input.stepReplayState;
  if (replay.stepIndex >= replay.totalSteps) {
    input.stopDebugQaStepReplayAutoPlay(false);
    input.applyImportedDebugQaTrace(replay.finalTrace);
    input.setDebugQaStepReplayState(null);
    input.setDebugQaStatus('success');
    input.setDebugQaError(null);
    input.setDebugQaMessage('Replay pas a pas termine (etat final applique).');
    input.updateHud();
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

  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Replay step ${nextStep}/${replay.totalSteps}`);
  input.updateHud();
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
    input.setDebugQaStatus('success');
    input.setDebugQaError(null);
    input.setDebugQaMessage('Replay pas a pas stoppe (etat precedent restaure).');
    input.updateHud();
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

  input.setDebugQaStatus('loading');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Importing ${file.name}...`);
  input.updateHud();

  try {
    const rawText = await file.text();
    const rawPayload = JSON.parse(rawText) as unknown;
    const importedTrace = input.parseImportedDebugQaTrace(rawPayload, file.name);
    if (!importedTrace) {
      throw new Error('Le fichier ne contient pas un JSON trace QA valide.');
    }

    input.setDebugQaImportedTrace(importedTrace);
    input.setDebugQaStatus('success');
    input.setDebugQaError(null);
    input.setDebugQaMessage(`Trace importee: ${file.name} (${importedTrace.timestamp}).`);
  } catch (error) {
    input.setDebugQaStatus('error');
    input.setDebugQaError(input.getErrorMessage(error, 'Impossible d importer la trace JSON.'));
    input.setDebugQaMessage(null);
  } finally {
    if (sourceInput) {
      sourceInput.value = '';
    }
    input.updateHud();
  }
}
