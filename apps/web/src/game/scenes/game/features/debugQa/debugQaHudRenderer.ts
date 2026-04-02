import type {
  DebugQaActionName,
  DebugQaRecapOutcomeFilter,
  DebugQaReplayAutoPlaySpeedKey,
  DebugQaStatus,
  DebugQaStepReplayState,
  StripCalibrationPresetKey,
} from '../../gameScene.stateTypes';

export function updateDebugQaHud(params: {
  debugQaEnabled: boolean;
  debugQaStatus: DebugQaStatus;
  debugQaBusyAction: DebugQaActionName | null;
  isAuthenticated: boolean;
  debugQaError: string | null;
  debugQaMessage: string | null;
  scriptedIntentsDisplayText: string;
  debugQaRecapOutcomeFilter: DebugQaRecapOutcomeFilter;
  debugQaRecapEnemyFilter: string;
  debugQaScriptEnemyFilter: string;
  debugQaScriptIntentFilter: string;
  debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  stripCalibrationPreset: StripCalibrationPresetKey;
  hasImportedTrace: boolean;
  stepReplayState: DebugQaStepReplayState | null;
  replayAutoPlayActive: boolean;
  statusValue: HTMLElement | null;
  messageValue: HTMLElement | null;
  scriptedIntentsOutput: HTMLElement | null;
  grantXpInput: HTMLInputElement | null;
  grantGoldInput: HTMLInputElement | null;
  towerFloorInput: HTMLInputElement | null;
  statePresetSelect: HTMLSelectElement | null;
  questKeyInput: HTMLInputElement | null;
  questStatusSelect: HTMLSelectElement | null;
  loadoutPresetSelect: HTMLSelectElement | null;
  worldFlagsInput: HTMLTextAreaElement | null;
  worldFlagsRemoveInput: HTMLTextAreaElement | null;
  worldFlagsReplaceInput: HTMLInputElement | null;
  recapOutcomeFilterSelect: HTMLSelectElement | null;
  recapEnemyFilterInput: HTMLInputElement | null;
  scriptEnemyFilterInput: HTMLInputElement | null;
  scriptIntentFilterInput: HTMLInputElement | null;
  grantButton: HTMLButtonElement | null;
  towerFloorButton: HTMLButtonElement | null;
  statePresetButton: HTMLButtonElement | null;
  setQuestStatusButton: HTMLButtonElement | null;
  loadoutButton: HTMLButtonElement | null;
  completeQuestsButton: HTMLButtonElement | null;
  setWorldFlagsButton: HTMLButtonElement | null;
  scriptedIntentsButton: HTMLButtonElement | null;
  importButton: HTMLButtonElement | null;
  replayButton: HTMLButtonElement | null;
  replayStepStartButton: HTMLButtonElement | null;
  replayStepNextButton: HTMLButtonElement | null;
  replayAutoPlayButton: HTMLButtonElement | null;
  replayAutoPlaySpeedSelect: HTMLSelectElement | null;
  replayStepStopButton: HTMLButtonElement | null;
  stripCalibrationSelect: HTMLSelectElement | null;
  stripCalibrationButton: HTMLButtonElement | null;
  importFileInput: HTMLInputElement | null;
  exportButton: HTMLButtonElement | null;
  exportMarkdownButton: HTMLButtonElement | null;
}): void {
  if (!params.debugQaEnabled) {
    return;
  }

  if (params.statusValue) {
    params.statusValue.textContent = getDebugQaStatusLabel(params.debugQaStatus);
    params.statusValue.dataset.status = params.debugQaStatus;
  }

  if (params.messageValue) {
    const message = params.debugQaError ?? params.debugQaMessage;
    params.messageValue.hidden = !message;
    params.messageValue.textContent = message ?? '';
    params.messageValue.dataset.variant = params.debugQaError
      ? 'error'
      : params.debugQaStatus === 'success'
        ? 'success'
        : 'info';
  }

  if (params.scriptedIntentsOutput) {
    params.scriptedIntentsOutput.textContent = params.scriptedIntentsDisplayText;
  }

  const loading = params.debugQaStatus === 'loading';
  const requiresAuthDisabled = !params.isAuthenticated || loading;
  const replayActive = Boolean(params.stepReplayState);

  setDisabled(params.grantXpInput, requiresAuthDisabled);
  setDisabled(params.grantGoldInput, requiresAuthDisabled);
  setDisabled(params.towerFloorInput, requiresAuthDisabled);
  setDisabled(params.statePresetSelect, requiresAuthDisabled);
  setDisabled(params.questKeyInput, requiresAuthDisabled);
  setDisabled(params.questStatusSelect, requiresAuthDisabled);
  setDisabled(params.loadoutPresetSelect, requiresAuthDisabled);
  setDisabled(params.worldFlagsInput, requiresAuthDisabled);
  setDisabled(params.worldFlagsRemoveInput, requiresAuthDisabled);
  setDisabled(params.worldFlagsReplaceInput, requiresAuthDisabled);

  if (params.recapOutcomeFilterSelect) {
    params.recapOutcomeFilterSelect.disabled = loading;
    params.recapOutcomeFilterSelect.value = params.debugQaRecapOutcomeFilter;
  }
  if (params.recapEnemyFilterInput) {
    params.recapEnemyFilterInput.disabled = loading;
    params.recapEnemyFilterInput.value = params.debugQaRecapEnemyFilter;
  }
  if (params.scriptEnemyFilterInput) {
    params.scriptEnemyFilterInput.disabled = loading;
    params.scriptEnemyFilterInput.value = params.debugQaScriptEnemyFilter;
  }
  if (params.scriptIntentFilterInput) {
    params.scriptIntentFilterInput.disabled = loading;
    params.scriptIntentFilterInput.value = params.debugQaScriptIntentFilter;
  }

  setButtonState(params.grantButton, requiresAuthDisabled, params.debugQaBusyAction === 'grant-resources', 'Granting...', 'Grant resources');
  setButtonState(params.towerFloorButton, requiresAuthDisabled, params.debugQaBusyAction === 'set-tower-floor', 'Applying...', 'Set tower floor');
  setButtonState(params.statePresetButton, requiresAuthDisabled, params.debugQaBusyAction === 'apply-state-preset', 'Applying...', 'Apply state preset');
  setButtonState(params.setQuestStatusButton, requiresAuthDisabled, params.debugQaBusyAction === 'set-quest-status', 'Applying...', 'Set quest status');
  setButtonState(params.loadoutButton, requiresAuthDisabled, params.debugQaBusyAction === 'apply-loadout-preset', 'Applying...', 'Apply loadout');
  setButtonState(params.completeQuestsButton, requiresAuthDisabled, params.debugQaBusyAction === 'complete-quests', 'Completing...', 'Complete quests');
  setButtonState(params.setWorldFlagsButton, requiresAuthDisabled, params.debugQaBusyAction === 'set-world-flags', 'Applying...', 'Set world flags');

  const scriptedIntentsLoading = params.debugQaStatus === 'loading' && params.debugQaBusyAction === null;
  if (params.scriptedIntentsButton) {
    params.scriptedIntentsButton.disabled = loading || !params.debugQaEnabled;
    params.scriptedIntentsButton.textContent = scriptedIntentsLoading ? 'Loading reference...' : 'Load scripted intents';
  }

  if (params.importButton) {
    params.importButton.disabled = loading || replayActive;
    params.importButton.textContent = loading ? 'Importing...' : 'Import JSON trace';
  }
  if (params.replayButton) {
    params.replayButton.disabled = loading || !params.hasImportedTrace || replayActive;
    params.replayButton.textContent = 'Replay imported trace';
  }
  if (params.replayStepStartButton) {
    params.replayStepStartButton.disabled = loading || !params.hasImportedTrace || replayActive;
    params.replayStepStartButton.textContent = 'Start step replay';
  }
  if (params.replayStepNextButton) {
    const replayLabel = params.stepReplayState
      ? `Next step (${params.stepReplayState.stepIndex}/${params.stepReplayState.totalSteps})`
      : 'Next step';
    params.replayStepNextButton.disabled = !replayActive || params.replayAutoPlayActive;
    params.replayStepNextButton.textContent = replayLabel;
  }
  if (params.replayAutoPlayButton) {
    params.replayAutoPlayButton.disabled = !replayActive;
    params.replayAutoPlayButton.textContent = params.replayAutoPlayActive ? 'Pause auto-play' : 'Start auto-play';
  }
  if (params.replayAutoPlaySpeedSelect) {
    params.replayAutoPlaySpeedSelect.disabled = !replayActive || params.replayAutoPlayActive;
    params.replayAutoPlaySpeedSelect.value = params.debugQaReplayAutoPlaySpeed;
  }
  if (params.replayStepStopButton) {
    params.replayStepStopButton.disabled = !replayActive;
    params.replayStepStopButton.textContent = 'Stop step replay';
  }

  if (params.stripCalibrationSelect) {
    params.stripCalibrationSelect.disabled = loading;
    params.stripCalibrationSelect.value = params.stripCalibrationPreset;
  }
  if (params.stripCalibrationButton) {
    params.stripCalibrationButton.disabled = loading;
    params.stripCalibrationButton.textContent = 'Apply strip calibration';
  }

  if (params.importFileInput) {
    params.importFileInput.disabled = loading || replayActive;
  }
  if (params.exportButton) {
    params.exportButton.disabled = loading || replayActive;
    params.exportButton.textContent = 'Export JSON trace';
  }
  if (params.exportMarkdownButton) {
    params.exportMarkdownButton.disabled = loading || replayActive;
    params.exportMarkdownButton.textContent = 'Export Markdown recap';
  }
}

function getDebugQaStatusLabel(status: DebugQaStatus): string {
  if (status === 'loading') {
    return 'Applying...';
  }
  if (status === 'success') {
    return 'Ready';
  }
  if (status === 'error') {
    return 'Issue';
  }
  return 'Idle';
}

function setDisabled(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
  disabled: boolean,
): void {
  if (element) {
    element.disabled = disabled;
  }
}

function setButtonState(
  button: HTMLButtonElement | null,
  disabled: boolean,
  busy: boolean,
  busyLabel: string,
  idleLabel: string,
): void {
  if (!button) {
    return;
  }
  button.disabled = disabled;
  button.textContent = busy ? busyLabel : idleLabel;
}
