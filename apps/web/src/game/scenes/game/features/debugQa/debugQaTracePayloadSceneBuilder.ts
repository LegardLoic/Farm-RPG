import { API_BASE_URL } from '../../../../../config/env';
import type {
  AutoSaveState,
  CombatUiStatus,
  DebugQaActionName,
  DebugQaRecapOutcomeFilter,
  DebugQaReplayAutoPlaySpeedKey,
  DebugQaStatus,
  DebugQaTracePayload,
  HudState,
  QuestState,
  SaveSlotState,
  StripCalibrationPresetKey,
} from '../../gameScene.stateTypes';
import { buildDebugQaTracePayloadFromScene as buildDebugQaTracePayloadFromSceneFromFeature } from './debugQaTraceCollector';

export type DebugQaTracePayloadSceneLike = {
  isAuthenticated: boolean;
  authStatus: DebugQaTracePayload['auth']['status'];
  hudState: HudState;
  combatStatus: CombatUiStatus;
  questBusy: boolean;
  quests: QuestState[];
  blacksmithBusy: boolean;
  blacksmithOffers: unknown[];
  autosaveBusy: boolean;
  autosave: AutoSaveState | null;
  saveSlotsBusy: boolean;
  saveSlots: SaveSlotState[];
  debugQaEnabled: boolean;
  debugQaStatus: DebugQaStatus;
  debugQaBusyAction: DebugQaActionName | null;
  debugQaMessage: string | null;
  debugQaError: string | null;
  debugQaRecapOutcomeFilter: DebugQaRecapOutcomeFilter;
  debugQaRecapEnemyFilter: string;
  debugQaScriptEnemyFilter: string;
  debugQaScriptIntentFilter: string;
  debugQaScriptedIntentsReference: { scriptedIntents: unknown[] } | null;
  debugQaReplayAutoPlayIntervalId: number | null;
  debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  stripCalibrationPreset: StripCalibrationPresetKey;
  buildCombatTraceSnapshot(): DebugQaTracePayload['combat'];
  getDebugQaReplayAutoPlayIntervalMs(speed: DebugQaReplayAutoPlaySpeedKey): number;
};

export function buildDebugQaTracePayloadForScene(scene: DebugQaTracePayloadSceneLike): DebugQaTracePayload {
  const timestamp = new Date().toISOString();
  return buildDebugQaTracePayloadFromSceneFromFeature({
    timestamp,
    frontend: {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      apiBaseUrl: API_BASE_URL,
      locationHref: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
    isAuthenticated: scene.isAuthenticated,
    authStatus: scene.authStatus,
    hudState: scene.hudState,
    combatStatus: scene.combatStatus,
    questBusy: scene.questBusy,
    quests: scene.quests,
    blacksmithUnlocked: scene.hudState.blacksmithUnlocked,
    blacksmithCurseLifted: scene.hudState.blacksmithCurseLifted,
    blacksmithBusy: scene.blacksmithBusy,
    blacksmithOffersCount: scene.blacksmithOffers.length,
    gold: scene.hudState.gold,
    autosaveBusy: scene.autosaveBusy,
    autosave: scene.autosave,
    saveSlotsBusy: scene.saveSlotsBusy,
    saveSlots: scene.saveSlots,
    combat: scene.buildCombatTraceSnapshot(),
    debugQaEnabled: scene.debugQaEnabled,
    debugQaStatus: scene.debugQaStatus,
    debugQaBusyAction: scene.debugQaBusyAction,
    debugQaMessage: scene.debugQaMessage,
    debugQaError: scene.debugQaError,
    debugQaRecapOutcomeFilter: scene.debugQaRecapOutcomeFilter,
    debugQaRecapEnemyFilter: scene.debugQaRecapEnemyFilter,
    debugQaScriptEnemyFilter: scene.debugQaScriptEnemyFilter,
    debugQaScriptIntentFilter: scene.debugQaScriptIntentFilter,
    debugQaScriptedIntentsLoaded: scene.debugQaScriptedIntentsReference !== null,
    debugQaScriptedEnemyProfilesCount: scene.debugQaScriptedIntentsReference?.scriptedIntents.length ?? 0,
    debugQaReplayAutoPlayActive: scene.debugQaReplayAutoPlayIntervalId !== null,
    debugQaReplayAutoPlaySpeed: scene.debugQaReplayAutoPlaySpeed,
    debugQaReplayAutoPlayIntervalMs: scene.getDebugQaReplayAutoPlayIntervalMs(scene.debugQaReplayAutoPlaySpeed),
    stripCalibrationPreset: scene.stripCalibrationPreset,
  });
}
