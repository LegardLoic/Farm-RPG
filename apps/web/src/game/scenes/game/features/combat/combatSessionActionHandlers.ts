import type {
  CombatActionName,
  CombatEncounterState,
  CombatUiStatus,
} from '../../gameScene.stateTypes';
import {
  getCombatStatusTurns as getCombatStatusTurnsFromLogic,
  hasCleanseableDebuffs as hasCleanseableDebuffsFromLogic,
  hasInterruptibleEnemyIntent as hasInterruptibleEnemyIntentFromLogic,
} from './combatHudLogic';
import { validateCombatActionRequest as validateCombatActionRequestFromFeature } from './combatActionLogic';

type CombatPayloadGatewayLike = {
  normalizeCombatPayload(payload: unknown): CombatEncounterState | null;
};

export type CombatSessionSceneLike = {
  isAuthenticated: boolean;
  combatBusy: boolean;
  combatEncounterId: string | null;
  combatState: CombatEncounterState | null;
  combatStatus: CombatUiStatus;
  combatMessage: string;
  payloadGateway: CombatPayloadGatewayLike;
  fetchJson<T>(path: string, init?: RequestInit): Promise<T>;
  setCombatError(message: string): void;
  clearCombatError(): void;
  getErrorMessage(error: unknown, fallback: string): string;
  applyCombatSnapshot(snapshot: CombatEncounterState): void;
  playPlayerCombatActionAnimation(action: CombatActionName): void;
  refreshGameplayState(): Promise<void>;
  refreshAutoSaveState(): Promise<void>;
  refreshBlacksmithState(): Promise<void>;
  refreshVillageMarketState(): Promise<void>;
  refreshQuestState(): Promise<void>;
  updateHud(): void;
};

async function refreshPostCombatState(scene: CombatSessionSceneLike): Promise<void> {
  await scene.refreshGameplayState();
  await scene.refreshAutoSaveState();
  await scene.refreshBlacksmithState();
  await scene.refreshVillageMarketState();
  await scene.refreshQuestState();
}

function restoreCombatStatusFromSnapshot(scene: CombatSessionSceneLike): void {
  if (scene.combatState) {
    scene.combatStatus = scene.combatState.status;
  } else {
    scene.combatStatus = 'error';
  }
}

export async function runStartCombatActionForScene(scene: CombatSessionSceneLike): Promise<void> {
  if (!scene.isAuthenticated) {
    scene.setCombatError('Connecte toi pour demarrer un combat.');
    scene.updateHud();
    return;
  }

  scene.combatBusy = true;
  scene.combatStatus = 'loading';
  scene.combatMessage = 'Demarrage du combat...';
  scene.clearCombatError();
  scene.updateHud();

  try {
    const payload = await scene.fetchJson<unknown>('/combat/start', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const encounter = scene.payloadGateway.normalizeCombatPayload(payload);

    if (!encounter) {
      throw new Error('Combat start returned an empty payload.');
    }

    scene.applyCombatSnapshot(encounter);
    await refreshPostCombatState(scene);
  } catch (error) {
    scene.setCombatError(scene.getErrorMessage(error, 'Impossible de demarrer le combat.'));
    restoreCombatStatusFromSnapshot(scene);
  } finally {
    scene.combatBusy = false;
    if (scene.combatState) {
      scene.combatStatus = scene.combatState.status;
    }
    scene.updateHud();
  }
}

export async function runPerformCombatActionForScene(
  scene: CombatSessionSceneLike,
  action: CombatActionName,
): Promise<void> {
  const validationError = validateCombatActionRequestFromFeature({
    isAuthenticated: scene.isAuthenticated,
    action,
    combatState: scene.combatState,
    hasCleanseableDebuffs: hasCleanseableDebuffsFromLogic(scene.combatState),
    hasInterruptibleEnemyIntent: hasInterruptibleEnemyIntentFromLogic(scene.combatState),
    isPlayerDarkened: getCombatStatusTurnsFromLogic(scene.combatState, 'playerDarkenedTurns') > 0,
  });
  if (validationError) {
    scene.setCombatError(validationError);
    scene.updateHud();
    return;
  }
  const combatState = scene.combatState;
  if (!combatState) {
    return;
  }

  scene.combatBusy = true;
  scene.combatStatus = 'loading';
  scene.combatMessage = 'Action en cours...';
  scene.clearCombatError();
  scene.updateHud();

  try {
    const encounterId = scene.combatEncounterId ?? combatState.id;
    const payload = await scene.fetchJson<unknown>(`/combat/${encounterId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    const encounter = scene.payloadGateway.normalizeCombatPayload(payload);

    if (!encounter) {
      throw new Error('Combat action returned an empty payload.');
    }

    scene.playPlayerCombatActionAnimation(action);
    scene.applyCombatSnapshot(encounter);
    await refreshPostCombatState(scene);
  } catch (error) {
    scene.setCombatError(scene.getErrorMessage(error, 'Impossible de jouer cette action.'));
    restoreCombatStatusFromSnapshot(scene);
  } finally {
    scene.combatBusy = false;
    if (scene.combatState) {
      scene.combatStatus = scene.combatState.status;
    }
    scene.updateHud();
  }
}

export async function runForfeitCombatActionForScene(scene: CombatSessionSceneLike): Promise<void> {
  if (!scene.isAuthenticated) {
    scene.setCombatError('Connecte toi pour fuir un combat.');
    scene.updateHud();
    return;
  }

  if (!scene.combatState || scene.combatState.status !== 'active') {
    scene.setCombatError('Aucun combat actif.');
    scene.updateHud();
    return;
  }

  scene.combatBusy = true;
  scene.combatStatus = 'loading';
  scene.combatMessage = 'Fuite en cours...';
  scene.clearCombatError();
  scene.updateHud();

  try {
    const encounterId = scene.combatEncounterId ?? scene.combatState.id;
    const payload = await scene.fetchJson<unknown>(`/combat/${encounterId}/forfeit`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Player chose to flee from the UI.' }),
    });
    const encounter = scene.payloadGateway.normalizeCombatPayload(payload);

    if (!encounter) {
      throw new Error('Combat forfeit returned an empty payload.');
    }

    scene.applyCombatSnapshot(encounter);
    await refreshPostCombatState(scene);
  } catch (error) {
    scene.setCombatError(scene.getErrorMessage(error, 'Impossible de fuir le combat.'));
    restoreCombatStatusFromSnapshot(scene);
  } finally {
    scene.combatBusy = false;
    if (scene.combatState) {
      scene.combatStatus = scene.combatState.status;
    }
    scene.updateHud();
  }
}
