import type {
  DebugQaActionName,
  DebugStatePresetKey,
  QuestStatus,
} from '../../gameScene.stateTypes';

export type DebugQaRequest = {
  path: string;
  body: Record<string, unknown>;
  loadingLabel: string;
  successLabel: string;
  failureLabel: string;
};

export function buildDebugQaRequest(input: {
  action: DebugQaActionName;
  grantXp: number;
  grantGold: number;
  towerFloor: number;
  statePresetKey: DebugStatePresetKey;
  loadoutPresetKey: string;
  worldFlags: string[];
  worldFlagsToRemove: string[];
  replaceWorldFlags: boolean;
  questKey: string;
  questStatusRaw: string;
  isQuestStatusValue: (value: string) => value is QuestStatus;
}): DebugQaRequest | null {
  switch (input.action) {
    case 'grant-resources':
      return {
        path: '/debug/admin/grant-resources',
        body: {
          experience: input.grantXp,
          gold: input.grantGold,
          items: [],
        },
        loadingLabel: `Granting ${input.grantXp} XP / ${input.grantGold} gold...`,
        successLabel: `Granted ${input.grantXp} XP / ${input.grantGold} gold.`,
        failureLabel: 'Unable to grant debug resources.',
      };
    case 'set-tower-floor':
      return {
        path: '/debug/admin/set-tower-floor',
        body: { floor: input.towerFloor },
        loadingLabel: `Setting tower floor to ${input.towerFloor}...`,
        successLabel: `Tower floor set to ${input.towerFloor}.`,
        failureLabel: 'Unable to set tower floor.',
      };
    case 'apply-state-preset':
      return {
        path: '/debug/admin/apply-state-preset',
        body: { presetKey: input.statePresetKey },
        loadingLabel: `Applying ${input.statePresetKey} state preset...`,
        successLabel: `State preset ${input.statePresetKey} applied.`,
        failureLabel: 'Unable to apply state preset.',
      };
    case 'apply-loadout-preset':
      return {
        path: '/debug/admin/apply-loadout-preset',
        body: { presetKey: input.loadoutPresetKey },
        loadingLabel: `Applying ${input.loadoutPresetKey} loadout...`,
        successLabel: `Loadout preset ${input.loadoutPresetKey} applied.`,
        failureLabel: 'Unable to apply loadout preset.',
      };
    case 'complete-quests':
      return {
        path: '/debug/admin/complete-quests',
        body: {},
        loadingLabel: 'Completing quests...',
        successLabel: 'Quests marked as completed.',
        failureLabel: 'Unable to complete quests.',
      };
    case 'set-world-flags':
      if (!input.replaceWorldFlags && input.worldFlags.length === 0 && input.worldFlagsToRemove.length === 0) {
        return null;
      }
      return {
        path: '/debug/admin/set-world-flags',
        body: {
          flags: input.worldFlags,
          removeFlags: input.worldFlagsToRemove,
          replace: input.replaceWorldFlags,
        },
        loadingLabel: input.replaceWorldFlags ? 'Replacing world flags...' : 'Updating world flags...',
        successLabel: input.replaceWorldFlags ? 'World flags replaced.' : 'World flags updated.',
        failureLabel: 'Unable to set world flags.',
      };
    case 'set-quest-status': {
      const status = input.questStatusRaw;
      if (!input.questKey || !input.isQuestStatusValue(status)) {
        return null;
      }
      return {
        path: '/debug/admin/set-quest-status',
        body: {
          questKey: input.questKey,
          status,
        },
        loadingLabel: `Setting quest ${input.questKey} to ${status}...`,
        successLabel: `Quest ${input.questKey} set to ${status}.`,
        failureLabel: 'Unable to set quest status.',
      };
    }
    default:
      return null;
  }
}

export function getDebugQaSuccessMessage(input: {
  action: DebugQaActionName;
  payload: unknown;
  fallback: string;
  formatApplyStatePresetSuccess: (payload: unknown) => string | null;
  formatSetWorldFlagsSuccess: (payload: unknown) => string | null;
  formatSetQuestStatusSuccess: (payload: unknown) => string | null;
}): string {
  if (input.action === 'apply-state-preset') {
    const message = input.formatApplyStatePresetSuccess(input.payload);
    if (message) {
      return message;
    }
  }

  if (input.action === 'set-world-flags') {
    const message = input.formatSetWorldFlagsSuccess(input.payload);
    if (message) {
      return message;
    }
  }

  if (input.action === 'set-quest-status') {
    const message = input.formatSetQuestStatusSuccess(input.payload);
    if (message) {
      return message;
    }
  }

  return input.fallback;
}

export async function runDebugQaAction(input: {
  action: DebugQaActionName;
  debugQaEnabled: boolean;
  isAuthenticated: boolean;
  request: DebugQaRequest | null;
  fetchJson: (path: string, init?: RequestInit) => Promise<unknown>;
  setDebugQaBusyAction: (value: DebugQaActionName | null) => void;
  setDebugQaStatus: (value: 'idle' | 'loading' | 'success' | 'error') => void;
  setDebugQaError: (value: string | null) => void;
  setDebugQaMessage: (value: string | null) => void;
  getDebugQaSuccessMessage: (payload: unknown, fallback: string) => string;
  bootstrapSessionState: () => Promise<void>;
  getErrorMessage: (error: unknown, fallback: string) => string;
  updateHud: () => void;
}): Promise<void> {
  if (!input.debugQaEnabled) {
    return;
  }

  if (!input.isAuthenticated) {
    input.setDebugQaError('Connecte toi pour utiliser le debug QA.');
    input.setDebugQaMessage(null);
    input.setDebugQaStatus('error');
    input.updateHud();
    return;
  }

  if (!input.request) {
    input.setDebugQaError('Debug QA values are invalid.');
    input.setDebugQaMessage(null);
    input.setDebugQaStatus('error');
    input.updateHud();
    return;
  }

  input.setDebugQaBusyAction(input.action);
  input.setDebugQaStatus('loading');
  input.setDebugQaError(null);
  input.setDebugQaMessage(input.request.loadingLabel);
  input.updateHud();

  try {
    const responsePayload = await input.fetchJson(input.request.path, {
      method: 'POST',
      body: JSON.stringify(input.request.body),
    });
    input.setDebugQaStatus('success');
    input.setDebugQaMessage(input.getDebugQaSuccessMessage(responsePayload, input.request.successLabel));
    await input.bootstrapSessionState();
  } catch (error) {
    input.setDebugQaStatus('error');
    input.setDebugQaError(input.getErrorMessage(error, input.request.failureLabel));
    input.setDebugQaMessage(null);
  } finally {
    input.setDebugQaBusyAction(null);
    input.updateHud();
  }
}
