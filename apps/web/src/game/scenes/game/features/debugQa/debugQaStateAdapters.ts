import type {
  CombatEncounterState,
  CombatUiStatus,
  DebugQaReplayBaseline,
  DebugQaStatus,
  DebugQaTracePayload,
  HudState,
  ImportedDebugQaTrace,
} from '../../gameScene.stateTypes';

export type DebugQaReplayRuntimeState = {
  isAuthenticated: boolean;
  authStatus: string;
  hudState: HudState;
  combatEncounterId: string | null;
  combatStatus: CombatUiStatus;
  combatState: CombatEncounterState | null;
  combatLogs: string[];
  combatMessage: string;
  combatError: string | null;
};

export type DebugQaFeedbackTarget = {
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
};

export function applyDebugQaFeedback(
  target: DebugQaFeedbackTarget,
  feedback: {
    status: DebugQaStatus;
    error: string | null;
    message: string | null;
  },
): void {
  target.setDebugQaStatus(feedback.status);
  target.setDebugQaError(feedback.error);
  target.setDebugQaMessage(feedback.message);
  target.updateHud();
}

export function captureDebugQaReplayBaselineState(input: {
  state: DebugQaReplayRuntimeState;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaReplayBaseline {
  return {
    isAuthenticated: input.state.isAuthenticated,
    authStatus: input.state.authStatus,
    hudState: { ...input.state.hudState },
    combatEncounterId: input.state.combatEncounterId,
    combatStatus: input.state.combatStatus,
    combatState: input.state.combatState ? input.cloneCombatState(input.state.combatState) : null,
    combatLogs: [...input.state.combatLogs],
    combatMessage: input.state.combatMessage,
    combatError: input.state.combatError,
  };
}

export function restoreDebugQaReplayBaselineState(input: {
  baseline: DebugQaReplayBaseline;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaReplayRuntimeState {
  const { baseline, cloneCombatState } = input;
  return {
    isAuthenticated: baseline.isAuthenticated,
    authStatus: baseline.authStatus,
    hudState: { ...baseline.hudState },
    combatEncounterId: baseline.combatEncounterId,
    combatStatus: baseline.combatStatus,
    combatState: baseline.combatState ? cloneCombatState(baseline.combatState) : null,
    combatLogs: [...baseline.combatLogs],
    combatMessage: baseline.combatMessage,
    combatError: baseline.combatError,
  };
}

export function applyImportedDebugQaTraceState(input: {
  trace: ImportedDebugQaTrace;
  currentState: DebugQaReplayRuntimeState;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaReplayRuntimeState {
  const { trace, currentState, cloneCombatState } = input;

  const nextState: DebugQaReplayRuntimeState = {
    ...currentState,
    hudState: {
      ...currentState.hudState,
      ...trace.hudState,
    },
  };

  if (trace.authAuthenticated !== null) {
    nextState.isAuthenticated = trace.authAuthenticated;
  }
  if (trace.authStatus) {
    nextState.authStatus = trace.authStatus;
  }

  if (trace.combatState) {
    nextState.combatState = cloneCombatState(trace.combatState);
    nextState.combatEncounterId = trace.combatState.id;
    nextState.combatStatus = trace.combatState.status;
    nextState.combatLogs = [...trace.combatState.logs].slice(-20);
  } else {
    nextState.combatEncounterId = trace.combatEncounterId;
    nextState.combatStatus = trace.combatStatus ?? 'idle';
    nextState.combatLogs = [...trace.combatLogs].slice(-20);
    if (!trace.combatEncounterId) {
      nextState.combatState = null;
    }
  }

  if (trace.combatMessage) {
    nextState.combatMessage = trace.combatMessage;
  } else if (!trace.combatState && !trace.combatEncounterId) {
    nextState.combatMessage = 'Aucun combat actif.';
  }

  nextState.combatError = trace.combatError;
  return nextState;
}

export function buildCombatTraceSnapshotState(input: {
  combatEncounterId: string | null;
  combatStatus: CombatUiStatus;
  combatMessage: string;
  combatError: string | null;
  combatLogs: string[];
  combatState: CombatEncounterState | null;
  getCombatTelemetryLabel: () => string;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaTracePayload['combat'] {
  const baseSnapshot = {
    encounterId: input.combatEncounterId,
    status: input.combatStatus,
    message: input.combatMessage,
    error: input.combatError,
    telemetry: input.getCombatTelemetryLabel(),
    logs: [...input.combatLogs],
  };

  if (!input.combatState) {
    return {
      ...baseSnapshot,
      state: null,
    };
  }

  return {
    ...baseSnapshot,
    state: input.cloneCombatState(input.combatState),
  };
}

export function buildDebugQaTracePayloadState(input: {
  timestamp: string;
  frontend: DebugQaTracePayload['frontend'];
  auth: DebugQaTracePayload['auth'];
  hudState: HudState;
  hudSummaries: DebugQaTracePayload['hud']['summaries'];
  combat: DebugQaTracePayload['combat'];
  debugQa: DebugQaTracePayload['debugQa'];
}): DebugQaTracePayload {
  return {
    timestamp: input.timestamp,
    frontend: input.frontend,
    auth: input.auth,
    hud: {
      state: { ...input.hudState },
      summaries: input.hudSummaries,
    },
    combat: input.combat,
    debugQa: input.debugQa,
  };
}
