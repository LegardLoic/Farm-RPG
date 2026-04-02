import type { CombatEncounterState } from '../../gameScene.stateTypes';
import { computeCombatActionAvailability as computeCombatActionAvailabilityFromFeature } from './combatActionLogic';
import {
  getCombatStatusTurns as getCombatStatusTurnsFromLogic,
  hasCleanseableDebuffs as hasCleanseableDebuffsFromLogic,
  hasInterruptibleEnemyIntent as hasInterruptibleEnemyIntentFromLogic,
} from './combatHudLogic';

export type CombatButtonSceneLike = {
  isAuthenticated: boolean;
  combatState: CombatEncounterState | null;
  combatBusy: boolean;
  combatStartButton: HTMLButtonElement | null;
  combatAttackButton: HTMLButtonElement | null;
  combatDefendButton: HTMLButtonElement | null;
  combatFireballButton: HTMLButtonElement | null;
  combatMendButton: HTMLButtonElement | null;
  combatCleanseButton: HTMLButtonElement | null;
  combatInterruptButton: HTMLButtonElement | null;
  combatRallyButton: HTMLButtonElement | null;
  combatSunderButton: HTMLButtonElement | null;
  combatForfeitButton: HTMLButtonElement | null;
};

export function updateCombatButtonsForScene(scene: CombatButtonSceneLike): void {
  const availability = computeCombatActionAvailabilityFromFeature({
    isAuthenticated: scene.isAuthenticated,
    combatState: scene.combatState,
    isPlayerDarkened: getCombatStatusTurnsFromLogic(scene.combatState, 'playerDarkenedTurns') > 0,
    hasCleanseableDebuffs: hasCleanseableDebuffsFromLogic(scene.combatState),
    hasInterruptibleEnemyIntent: hasInterruptibleEnemyIntentFromLogic(scene.combatState),
  });

  if (scene.combatStartButton) {
    scene.combatStartButton.disabled = !scene.isAuthenticated || scene.combatBusy;
  }

  if (scene.combatAttackButton) {
    scene.combatAttackButton.disabled = !availability.playerTurn || scene.combatBusy;
  }

  if (scene.combatDefendButton) {
    scene.combatDefendButton.disabled = !availability.playerTurn || scene.combatBusy;
  }

  if (scene.combatFireballButton) {
    scene.combatFireballButton.disabled = !availability.fireballReady || scene.combatBusy;
  }

  if (scene.combatMendButton) {
    scene.combatMendButton.disabled = !availability.effectiveMendReady || scene.combatBusy;
  }

  if (scene.combatCleanseButton) {
    scene.combatCleanseButton.disabled = !availability.cleanseReady || scene.combatBusy;
  }

  if (scene.combatInterruptButton) {
    scene.combatInterruptButton.disabled = !availability.interruptReady || scene.combatBusy;
  }

  if (scene.combatRallyButton) {
    scene.combatRallyButton.disabled = !availability.rallyReady || scene.combatBusy;
  }

  if (scene.combatSunderButton) {
    scene.combatSunderButton.disabled = !availability.sunderReady || scene.combatBusy;
  }

  if (scene.combatForfeitButton) {
    scene.combatForfeitButton.disabled = !availability.active || scene.combatBusy;
  }
}
