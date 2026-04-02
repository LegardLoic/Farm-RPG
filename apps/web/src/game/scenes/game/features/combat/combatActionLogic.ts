import type { CombatActionName, CombatEncounterState } from '../../gameScene.stateTypes';

export const FIREBALL_MANA_COST = 5;
export const RALLY_MANA_COST = 3;
export const SUNDER_MANA_COST = 4;
export const MEND_MANA_COST = 3;
export const CLEANSE_MANA_COST = 3;
export const INTERRUPT_MANA_COST = 4;

export type CombatActionAvailability = {
  active: boolean;
  playerTurn: boolean;
  fireballReady: boolean;
  mendReady: boolean;
  cleanseReady: boolean;
  interruptReady: boolean;
  rallyReady: boolean;
  sunderReady: boolean;
  effectiveMendReady: boolean;
};

type CombatActionContext = {
  isAuthenticated: boolean;
  combatState: CombatEncounterState | null;
  isPlayerDarkened: boolean;
  hasCleanseableDebuffs: boolean;
  hasInterruptibleEnemyIntent: boolean;
};

export function computeCombatActionAvailability(context: CombatActionContext): CombatActionAvailability {
  const active = Boolean(context.isAuthenticated && context.combatState && context.combatState.status === 'active');
  const playerTurn = Boolean(active && context.combatState?.turn === 'player');
  const mana = context.combatState?.player.mp ?? 0;
  const hp = context.combatState?.player.hp ?? 0;
  const maxHp = context.combatState?.player.maxHp ?? 0;
  const fireballReady = Boolean(playerTurn && mana >= FIREBALL_MANA_COST && !context.isPlayerDarkened);
  const mendReady = Boolean(playerTurn && mana >= MEND_MANA_COST && hp < maxHp);
  const cleanseReady = Boolean(playerTurn && mana >= CLEANSE_MANA_COST && context.hasCleanseableDebuffs);
  const interruptReady = Boolean(
    playerTurn &&
      mana >= INTERRUPT_MANA_COST &&
      !context.isPlayerDarkened &&
      context.hasInterruptibleEnemyIntent,
  );
  const rallyReady = Boolean(playerTurn && mana >= RALLY_MANA_COST && !context.isPlayerDarkened);
  const sunderReady = Boolean(playerTurn && mana >= SUNDER_MANA_COST);

  return {
    active,
    playerTurn,
    fireballReady,
    mendReady,
    cleanseReady,
    interruptReady,
    rallyReady,
    sunderReady,
    effectiveMendReady: Boolean(mendReady && !context.isPlayerDarkened),
  };
}

export function validateCombatActionRequest(input: CombatActionContext & { action: CombatActionName }): string | null {
  if (!input.isAuthenticated) {
    return 'Connecte toi pour agir en combat.';
  }

  if (!input.combatState || input.combatState.status !== 'active') {
    return 'Aucun combat actif.';
  }

  if (input.combatState.turn !== 'player') {
    return 'Ce nest pas ton tour.';
  }

  const player = input.combatState.player;
  if (input.action === 'fireball' && player.mp < FIREBALL_MANA_COST) {
    return 'Pas assez de MP pour Fireball.';
  }

  if (input.action === 'rally' && player.mp < RALLY_MANA_COST) {
    return 'Pas assez de MP pour Rally.';
  }

  if (input.action === 'sunder' && player.mp < SUNDER_MANA_COST) {
    return 'Pas assez de MP pour Sunder.';
  }

  if (input.action === 'mend' && player.mp < MEND_MANA_COST) {
    return 'Pas assez de MP pour Mend.';
  }

  if (input.action === 'mend' && player.hp >= player.maxHp) {
    return 'Tes PV sont deja au maximum.';
  }

  if (input.action === 'cleanse' && player.mp < CLEANSE_MANA_COST) {
    return 'Pas assez de MP pour Cleanse.';
  }

  if (input.action === 'cleanse' && !input.hasCleanseableDebuffs) {
    return 'Aucun debuff a retirer.';
  }

  if (input.action === 'interrupt' && player.mp < INTERRUPT_MANA_COST) {
    return 'Pas assez de MP pour Interrupt.';
  }

  const blockedByDarkness =
    input.action === 'fireball' ||
    input.action === 'rally' ||
    input.action === 'mend' ||
    input.action === 'interrupt';
  if (input.isPlayerDarkened && blockedByDarkness) {
    return 'Tu es sous Obscurite et ne peux pas te concentrer sur ce skill.';
  }

  if (input.action === 'interrupt' && !input.hasInterruptibleEnemyIntent) {
    return 'Aucune intention ennemie interruptible.';
  }

  return null;
}

export function getPlayerCombatActionAnimation(action: CombatActionName): 'hit' | 'cast' {
  if (action === 'attack' || action === 'sunder' || action === 'interrupt') {
    return 'hit';
  }
  return 'cast';
}
