import type {
  CombatDebugReference,
  DebugQaStatus,
  DebugQaTracePayload,
} from '../../gameScene.stateTypes';

export function exportDebugQaTrace(input: {
  debugQaEnabled: boolean;
  hasDebugQaPanel: boolean;
  syncDebugQaFiltersFromInputs: () => void;
  buildDebugQaTracePayload: () => DebugQaTracePayload;
  buildDebugQaTraceFilename: (timestamp: string) => string;
  downloadJsonFile: (filename: string, payload: unknown) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.debugQaEnabled || !input.hasDebugQaPanel) {
    return;
  }

  input.syncDebugQaFiltersFromInputs();
  const payload = input.buildDebugQaTracePayload();
  const filename = input.buildDebugQaTraceFilename(payload.timestamp);
  input.downloadJsonFile(filename, payload);

  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Exported local QA trace to ${filename}.`);
  input.updateHud();
}

export function exportDebugQaMarkdownReport(input: {
  debugQaEnabled: boolean;
  hasDebugQaPanel: boolean;
  syncDebugQaFiltersFromInputs: () => void;
  buildDebugQaMarkdownReport: (timestamp: string) => string;
  buildDebugQaMarkdownFilename: (timestamp: string) => string;
  downloadTextFile: (filename: string, contents: string, contentType?: string) => void;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  updateHud: () => void;
}): void {
  if (!input.debugQaEnabled || !input.hasDebugQaPanel) {
    return;
  }

  input.syncDebugQaFiltersFromInputs();
  const timestamp = new Date().toISOString();
  const markdown = input.buildDebugQaMarkdownReport(timestamp);
  const filename = input.buildDebugQaMarkdownFilename(timestamp);
  input.downloadTextFile(filename, markdown, 'text/markdown;charset=utf-8');

  input.setDebugQaStatus('success');
  input.setDebugQaError(null);
  input.setDebugQaMessage(`Exported markdown QA report to ${filename}.`);
  input.updateHud();
}

export async function loadCombatDebugScriptedIntents(input: {
  debugQaEnabled: boolean;
  hasDebugQaPanel: boolean;
  debugQaStatus: DebugQaStatus;
  setDebugQaStatus: (status: DebugQaStatus) => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  setDebugQaScriptedIntentsReference: (reference: CombatDebugReference | null) => void;
  setDebugQaScriptedIntentsText: (value: string) => void;
  fetchJson: (path: string) => Promise<CombatDebugReference>;
  formatCombatDebugScriptedIntentsReference: (reference: CombatDebugReference) => string;
  getErrorMessage: (error: unknown, fallback: string) => string;
  updateHud: () => void;
}): Promise<void> {
  if (!input.debugQaEnabled || !input.hasDebugQaPanel || input.debugQaStatus === 'loading') {
    return;
  }

  input.setDebugQaStatus('loading');
  input.setDebugQaError(null);
  input.setDebugQaMessage('Loading combat scripted intents reference...');
  input.setDebugQaScriptedIntentsReference(null);
  input.setDebugQaScriptedIntentsText('Loading combat scripted intents reference...');
  input.updateHud();

  try {
    const reference = await input.fetchJson('/combat/debug/scripted-intents');
    input.setDebugQaScriptedIntentsReference(reference);
    input.setDebugQaScriptedIntentsText(input.formatCombatDebugScriptedIntentsReference(reference));

    input.setDebugQaStatus('success');
    input.setDebugQaError(null);
    input.setDebugQaMessage(`Loaded ${reference.scriptedIntents.length} scripted enemy profiles.`);
  } catch (error) {
    input.setDebugQaStatus('error');
    input.setDebugQaError(input.getErrorMessage(error, 'Unable to load combat scripted intents reference.'));
    input.setDebugQaMessage(null);
    input.setDebugQaScriptedIntentsReference(null);
    input.setDebugQaScriptedIntentsText(
      'Unable to load the combat scripted intents reference. Check the error message above and retry.',
    );
  } finally {
    input.updateHud();
  }
}

export function triggerDebugQaTraceImport(input: {
  debugQaEnabled: boolean;
  debugQaStatus: DebugQaStatus;
  importFileInput: HTMLInputElement | null;
}): void {
  if (!input.debugQaEnabled || !input.importFileInput || input.debugQaStatus === 'loading') {
    return;
  }

  input.importFileInput.value = '';
  input.importFileInput.click();
}
