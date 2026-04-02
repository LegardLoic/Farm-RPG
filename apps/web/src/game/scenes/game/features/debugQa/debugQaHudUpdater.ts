import type {
  DebugQaActionName,
  DebugQaRecapOutcomeFilter,
  DebugQaReplayAutoPlaySpeedKey,
  DebugQaStatus,
  DebugQaStepReplayState,
  StripCalibrationPresetKey,
} from '../../gameScene.stateTypes';
import { updateDebugQaHud as updateDebugQaHudFromRenderer } from './debugQaHudRenderer';

export type DebugQaHudSceneLike = {
  debugQaEnabled: boolean;
  debugQaPanelRoot: HTMLElement | null;
  debugQaStatus: DebugQaStatus;
  debugQaBusyAction: DebugQaActionName | null;
  isAuthenticated: boolean;
  debugQaError: string | null;
  debugQaMessage: string | null;
  debugQaRecapOutcomeFilter: DebugQaRecapOutcomeFilter;
  debugQaRecapEnemyFilter: string;
  debugQaScriptEnemyFilter: string;
  debugQaScriptIntentFilter: string;
  debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  stripCalibrationPreset: StripCalibrationPresetKey;
  debugQaImportedTrace: unknown | null;
  debugQaStepReplayState: DebugQaStepReplayState | null;
  debugQaReplayAutoPlayIntervalId: number | null;
  debugQaStatusValue: HTMLElement | null;
  debugQaMessageValue: HTMLElement | null;
  debugQaScriptedIntentsOutput: HTMLElement | null;
  debugQaGrantXpInput: HTMLInputElement | null;
  debugQaGrantGoldInput: HTMLInputElement | null;
  debugQaTowerFloorInput: HTMLInputElement | null;
  debugQaStatePresetSelect: HTMLSelectElement | null;
  debugQaQuestKeyInput: HTMLInputElement | null;
  debugQaQuestStatusSelect: HTMLSelectElement | null;
  debugQaLoadoutPresetSelect: HTMLSelectElement | null;
  debugQaWorldFlagsInput: HTMLTextAreaElement | null;
  debugQaWorldFlagsRemoveInput: HTMLTextAreaElement | null;
  debugQaWorldFlagsReplaceInput: HTMLInputElement | null;
  debugQaRecapOutcomeFilterSelect: HTMLSelectElement | null;
  debugQaRecapEnemyFilterInput: HTMLInputElement | null;
  debugQaScriptEnemyFilterInput: HTMLInputElement | null;
  debugQaScriptIntentFilterInput: HTMLInputElement | null;
  debugQaGrantButton: HTMLButtonElement | null;
  debugQaTowerFloorButton: HTMLButtonElement | null;
  debugQaStatePresetButton: HTMLButtonElement | null;
  debugQaSetQuestStatusButton: HTMLButtonElement | null;
  debugQaLoadoutButton: HTMLButtonElement | null;
  debugQaCompleteQuestsButton: HTMLButtonElement | null;
  debugQaSetWorldFlagsButton: HTMLButtonElement | null;
  debugQaScriptedIntentsButton: HTMLButtonElement | null;
  debugQaImportButton: HTMLButtonElement | null;
  debugQaReplayButton: HTMLButtonElement | null;
  debugQaReplayStepStartButton: HTMLButtonElement | null;
  debugQaReplayStepNextButton: HTMLButtonElement | null;
  debugQaReplayAutoPlayButton: HTMLButtonElement | null;
  debugQaReplayAutoPlaySpeedSelect: HTMLSelectElement | null;
  debugQaReplayStepStopButton: HTMLButtonElement | null;
  debugQaStripCalibrationSelect: HTMLSelectElement | null;
  debugQaStripCalibrationButton: HTMLButtonElement | null;
  debugQaImportFileInput: HTMLInputElement | null;
  debugQaExportButton: HTMLButtonElement | null;
  debugQaExportMarkdownButton: HTMLButtonElement | null;
  getDebugQaScriptedIntentsDisplayText(): string;
};

export function updateDebugQaHudForScene(scene: DebugQaHudSceneLike): void {
  if (!scene.debugQaEnabled || !scene.debugQaPanelRoot) {
    return;
  }

  updateDebugQaHudFromRenderer({
    debugQaEnabled: scene.debugQaEnabled,
    debugQaStatus: scene.debugQaStatus,
    debugQaBusyAction: scene.debugQaBusyAction,
    isAuthenticated: scene.isAuthenticated,
    debugQaError: scene.debugQaError,
    debugQaMessage: scene.debugQaMessage,
    scriptedIntentsDisplayText: scene.getDebugQaScriptedIntentsDisplayText(),
    debugQaRecapOutcomeFilter: scene.debugQaRecapOutcomeFilter,
    debugQaRecapEnemyFilter: scene.debugQaRecapEnemyFilter,
    debugQaScriptEnemyFilter: scene.debugQaScriptEnemyFilter,
    debugQaScriptIntentFilter: scene.debugQaScriptIntentFilter,
    debugQaReplayAutoPlaySpeed: scene.debugQaReplayAutoPlaySpeed,
    stripCalibrationPreset: scene.stripCalibrationPreset,
    hasImportedTrace: Boolean(scene.debugQaImportedTrace),
    stepReplayState: scene.debugQaStepReplayState,
    replayAutoPlayActive: scene.debugQaReplayAutoPlayIntervalId !== null,
    statusValue: scene.debugQaStatusValue,
    messageValue: scene.debugQaMessageValue,
    scriptedIntentsOutput: scene.debugQaScriptedIntentsOutput,
    grantXpInput: scene.debugQaGrantXpInput,
    grantGoldInput: scene.debugQaGrantGoldInput,
    towerFloorInput: scene.debugQaTowerFloorInput,
    statePresetSelect: scene.debugQaStatePresetSelect,
    questKeyInput: scene.debugQaQuestKeyInput,
    questStatusSelect: scene.debugQaQuestStatusSelect,
    loadoutPresetSelect: scene.debugQaLoadoutPresetSelect,
    worldFlagsInput: scene.debugQaWorldFlagsInput,
    worldFlagsRemoveInput: scene.debugQaWorldFlagsRemoveInput,
    worldFlagsReplaceInput: scene.debugQaWorldFlagsReplaceInput,
    recapOutcomeFilterSelect: scene.debugQaRecapOutcomeFilterSelect,
    recapEnemyFilterInput: scene.debugQaRecapEnemyFilterInput,
    scriptEnemyFilterInput: scene.debugQaScriptEnemyFilterInput,
    scriptIntentFilterInput: scene.debugQaScriptIntentFilterInput,
    grantButton: scene.debugQaGrantButton,
    towerFloorButton: scene.debugQaTowerFloorButton,
    statePresetButton: scene.debugQaStatePresetButton,
    setQuestStatusButton: scene.debugQaSetQuestStatusButton,
    loadoutButton: scene.debugQaLoadoutButton,
    completeQuestsButton: scene.debugQaCompleteQuestsButton,
    setWorldFlagsButton: scene.debugQaSetWorldFlagsButton,
    scriptedIntentsButton: scene.debugQaScriptedIntentsButton,
    importButton: scene.debugQaImportButton,
    replayButton: scene.debugQaReplayButton,
    replayStepStartButton: scene.debugQaReplayStepStartButton,
    replayStepNextButton: scene.debugQaReplayStepNextButton,
    replayAutoPlayButton: scene.debugQaReplayAutoPlayButton,
    replayAutoPlaySpeedSelect: scene.debugQaReplayAutoPlaySpeedSelect,
    replayStepStopButton: scene.debugQaReplayStepStopButton,
    stripCalibrationSelect: scene.debugQaStripCalibrationSelect,
    stripCalibrationButton: scene.debugQaStripCalibrationButton,
    importFileInput: scene.debugQaImportFileInput,
    exportButton: scene.debugQaExportButton,
    exportMarkdownButton: scene.debugQaExportMarkdownButton,
  });
}
