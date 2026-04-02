import type {
  CombatEncounterState,
  CombatUiStatus,
  DebugQaReplayBaseline,
  DebugQaTracePayload,
  HudState,
  ImportedDebugQaTrace,
} from '../../gameScene.stateTypes';
import {
  applyImportedDebugQaTraceState,
  buildCombatTraceSnapshotState,
  buildDebugQaTracePayloadState,
  captureDebugQaReplayBaselineState,
  restoreDebugQaReplayBaselineState,
  type DebugQaReplayRuntimeState,
} from './debugQaStateAdapters';

export type { DebugQaReplayRuntimeState } from './debugQaStateAdapters';

export function captureDebugQaReplayBaseline(input: {
  state: DebugQaReplayRuntimeState;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaReplayBaseline {
  return captureDebugQaReplayBaselineState(input);
}

export function restoreDebugQaReplayBaseline(input: {
  baseline: DebugQaReplayBaseline;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaReplayRuntimeState {
  return restoreDebugQaReplayBaselineState(input);
}

export function applyImportedDebugQaTrace(input: {
  trace: ImportedDebugQaTrace;
  currentState: DebugQaReplayRuntimeState;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaReplayRuntimeState {
  return applyImportedDebugQaTraceState(input);
}

export function buildCombatTraceSnapshot(input: {
  combatEncounterId: string | null;
  combatStatus: CombatUiStatus;
  combatMessage: string;
  combatError: string | null;
  combatLogs: string[];
  combatState: CombatEncounterState | null;
  getCombatTelemetryLabel: () => string;
  cloneCombatState: (state: CombatEncounterState) => CombatEncounterState;
}): DebugQaTracePayload['combat'] {
  return buildCombatTraceSnapshotState(input);
}

export function buildDebugQaTracePayload(input: {
  timestamp: string;
  frontend: DebugQaTracePayload['frontend'];
  auth: DebugQaTracePayload['auth'];
  hudState: HudState;
  hudSummaries: DebugQaTracePayload['hud']['summaries'];
  combat: DebugQaTracePayload['combat'];
  debugQa: DebugQaTracePayload['debugQa'];
}): DebugQaTracePayload {
  return buildDebugQaTracePayloadState(input);
}
