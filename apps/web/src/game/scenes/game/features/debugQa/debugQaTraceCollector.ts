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
import { getCombatStatusLabel as getCombatStatusLabelFromLogic } from '../combat/combatHudLogic';
import { getQuestSummaryLabel as getQuestSummaryLabelFromFeature } from '../quests/questHudLogic';
import { getBlacksmithShopSummaryLabel as getBlacksmithShopSummaryLabelFromFeature } from '../shops/shopHudLogic';
import {
  getAutoSaveSummaryLabel as getAutoSaveSummaryLabelFromFeature,
  getSaveSlotsSummaryLabel as getSaveSlotsSummaryLabelFromFeature,
} from '../saves/saveHudLogic';
import { buildDebugQaTracePayload as buildDebugQaTracePayloadFromFeature } from './debugQaTraceBuilders';

export function buildDebugQaTracePayloadFromScene(input: {
  timestamp: string;
  frontend: DebugQaTracePayload['frontend'];
  isAuthenticated: boolean;
  authStatus: DebugQaTracePayload['auth']['status'];
  hudState: HudState;
  combatStatus: CombatUiStatus;
  questBusy: boolean;
  quests: QuestState[];
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  blacksmithBusy: boolean;
  blacksmithOffersCount: number;
  gold: number;
  autosaveBusy: boolean;
  autosave: AutoSaveState | null;
  saveSlotsBusy: boolean;
  saveSlots: SaveSlotState[];
  combat: DebugQaTracePayload['combat'];
  debugQaEnabled: boolean;
  debugQaStatus: DebugQaStatus;
  debugQaBusyAction: DebugQaActionName | null;
  debugQaMessage: string | null;
  debugQaError: string | null;
  debugQaRecapOutcomeFilter: DebugQaRecapOutcomeFilter;
  debugQaRecapEnemyFilter: string;
  debugQaScriptEnemyFilter: string;
  debugQaScriptIntentFilter: string;
  debugQaScriptedIntentsLoaded: boolean;
  debugQaScriptedEnemyProfilesCount: number;
  debugQaReplayAutoPlayActive: boolean;
  debugQaReplayAutoPlaySpeed: DebugQaReplayAutoPlaySpeedKey;
  debugQaReplayAutoPlayIntervalMs: number;
  stripCalibrationPreset: StripCalibrationPresetKey;
}): DebugQaTracePayload {
  return buildDebugQaTracePayloadFromFeature({
    timestamp: input.timestamp,
    frontend: input.frontend,
    auth: {
      authenticated: input.isAuthenticated,
      status: input.authStatus,
    },
    hudState: input.hudState,
    hudSummaries: {
      combat: getCombatStatusLabelFromLogic(input.combatStatus),
      quests: getQuestSummaryLabelFromFeature({
        isAuthenticated: input.isAuthenticated,
        questBusy: input.questBusy,
        quests: input.quests,
      }),
      blacksmith: getBlacksmithShopSummaryLabelFromFeature({
        isAuthenticated: input.isAuthenticated,
        blacksmithUnlocked: input.blacksmithUnlocked,
        blacksmithCurseLifted: input.blacksmithCurseLifted,
        blacksmithBusy: input.blacksmithBusy,
        blacksmithOffersCount: input.blacksmithOffersCount,
        gold: input.gold,
      }),
      autosave: getAutoSaveSummaryLabelFromFeature({
        isAuthenticated: input.isAuthenticated,
        autosaveBusy: input.autosaveBusy,
        autosave: input.autosave,
      }),
      saveSlots: getSaveSlotsSummaryLabelFromFeature({
        isAuthenticated: input.isAuthenticated,
        saveSlotsBusy: input.saveSlotsBusy,
        saveSlots: input.saveSlots,
      }),
    },
    combat: input.combat,
    debugQa: {
      enabled: input.debugQaEnabled,
      status: input.debugQaStatus,
      busyAction: input.debugQaBusyAction,
      message: input.debugQaMessage,
      error: input.debugQaError,
      filters: {
        recapOutcome: input.debugQaRecapOutcomeFilter,
        recapEnemyQuery: input.debugQaRecapEnemyFilter,
        scriptedEnemyQuery: input.debugQaScriptEnemyFilter,
        scriptedIntentQuery: input.debugQaScriptIntentFilter,
      },
      scriptedIntentsReference: {
        loaded: input.debugQaScriptedIntentsLoaded,
        enemyProfiles: input.debugQaScriptedEnemyProfilesCount,
      },
      replayAutoPlay: {
        active: input.debugQaReplayAutoPlayActive,
        speed: input.debugQaReplayAutoPlaySpeed,
        intervalMs: input.debugQaReplayAutoPlayIntervalMs,
      },
      stripCalibrationPreset: input.stripCalibrationPreset,
    },
  });
}
