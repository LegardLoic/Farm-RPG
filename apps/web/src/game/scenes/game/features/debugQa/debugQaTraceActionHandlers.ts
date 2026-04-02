import type {
  CombatDebugReference,
  DebugQaStatus,
  DebugQaTracePayload,
} from '../../gameScene.stateTypes';
import { applyDebugQaFeedback } from './debugQaStateAdapters';

export type DebugQaTraceSceneLike = {
  debugQaEnabled: boolean;
  debugQaPanelRoot: HTMLElement | null;
  debugQaStatus: DebugQaStatus;
  debugQaImportFileInput: HTMLInputElement | null;
  debugQaScriptedIntentsReference: CombatDebugReference | null;
  debugQaScriptedIntentsText: string;
  debugQaError: string | null;
  debugQaMessage: string | null;
  syncDebugQaFiltersFromInputs(): void;
  buildDebugQaTracePayload(): DebugQaTracePayload;
  buildDebugQaTraceFilename(timestamp: string): string;
  buildDebugQaMarkdownReport(timestamp: string): string;
  buildDebugQaMarkdownFilename(timestamp: string): string;
  downloadJsonFile(filename: string, payload: unknown): void;
  downloadTextFile(filename: string, contents: string, contentType?: string): void;
  fetchJson<T>(path: string): Promise<T>;
  formatCombatDebugScriptedIntentsReference(reference: CombatDebugReference): string;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

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

  applyDebugQaFeedback(input, {
    status: 'success',
    error: null,
    message: `Exported local QA trace to ${filename}.`,
  });
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

  applyDebugQaFeedback(input, {
    status: 'success',
    error: null,
    message: `Exported markdown QA report to ${filename}.`,
  });
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

  applyDebugQaFeedback(input, {
    status: 'loading',
    error: null,
    message: 'Loading combat scripted intents reference...',
  });
  input.setDebugQaScriptedIntentsReference(null);
  input.setDebugQaScriptedIntentsText('Loading combat scripted intents reference...');

  try {
    const reference = await input.fetchJson('/combat/debug/scripted-intents');
    input.setDebugQaScriptedIntentsReference(reference);
    input.setDebugQaScriptedIntentsText(input.formatCombatDebugScriptedIntentsReference(reference));

    applyDebugQaFeedback(input, {
      status: 'success',
      error: null,
      message: `Loaded ${reference.scriptedIntents.length} scripted enemy profiles.`,
    });
  } catch (error) {
    applyDebugQaFeedback(input, {
      status: 'error',
      error: input.getErrorMessage(error, 'Unable to load combat scripted intents reference.'),
      message: null,
    });
    input.setDebugQaScriptedIntentsReference(null);
    input.setDebugQaScriptedIntentsText(
      'Unable to load the combat scripted intents reference. Check the error message above and retry.',
    );
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

export function exportDebugQaTraceForScene(scene: DebugQaTraceSceneLike): void {
  exportDebugQaTrace({
    debugQaEnabled: scene.debugQaEnabled,
    hasDebugQaPanel: Boolean(scene.debugQaPanelRoot),
    syncDebugQaFiltersFromInputs: () => scene.syncDebugQaFiltersFromInputs(),
    buildDebugQaTracePayload: () => scene.buildDebugQaTracePayload(),
    buildDebugQaTraceFilename: (timestamp) => scene.buildDebugQaTraceFilename(timestamp),
    downloadJsonFile: (filename, payload) => scene.downloadJsonFile(filename, payload),
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

export function exportDebugQaMarkdownReportForScene(scene: DebugQaTraceSceneLike): void {
  exportDebugQaMarkdownReport({
    debugQaEnabled: scene.debugQaEnabled,
    hasDebugQaPanel: Boolean(scene.debugQaPanelRoot),
    syncDebugQaFiltersFromInputs: () => scene.syncDebugQaFiltersFromInputs(),
    buildDebugQaMarkdownReport: (timestamp) => scene.buildDebugQaMarkdownReport(timestamp),
    buildDebugQaMarkdownFilename: (timestamp) => scene.buildDebugQaMarkdownFilename(timestamp),
    downloadTextFile: (filename, contents, contentType) => scene.downloadTextFile(filename, contents, contentType),
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

export async function loadCombatDebugScriptedIntentsForScene(scene: DebugQaTraceSceneLike): Promise<void> {
  await loadCombatDebugScriptedIntents({
    debugQaEnabled: scene.debugQaEnabled,
    hasDebugQaPanel: Boolean(scene.debugQaPanelRoot),
    debugQaStatus: scene.debugQaStatus,
    setDebugQaStatus: (status) => {
      scene.debugQaStatus = status;
    },
    setDebugQaError: (value) => {
      scene.debugQaError = value;
    },
    setDebugQaMessage: (value) => {
      scene.debugQaMessage = value;
    },
    setDebugQaScriptedIntentsReference: (reference) => {
      scene.debugQaScriptedIntentsReference = reference;
    },
    setDebugQaScriptedIntentsText: (value) => {
      scene.debugQaScriptedIntentsText = value;
    },
    fetchJson: (path) => scene.fetchJson<CombatDebugReference>(path),
    formatCombatDebugScriptedIntentsReference: (reference) => scene.formatCombatDebugScriptedIntentsReference(reference),
    getErrorMessage: (error, fallback) => scene.getErrorMessage(error, fallback),
    updateHud: () => scene.updateHud(),
  });
}

export function triggerDebugQaTraceImportForScene(scene: DebugQaTraceSceneLike): void {
  triggerDebugQaTraceImport({
    debugQaEnabled: scene.debugQaEnabled,
    debugQaStatus: scene.debugQaStatus,
    importFileInput: scene.debugQaImportFileInput,
  });
}
