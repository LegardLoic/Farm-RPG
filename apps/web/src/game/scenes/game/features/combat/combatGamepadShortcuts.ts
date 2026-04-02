import type { CombatActionName, CombatEncounterState } from '../../gameScene.stateTypes';

export type CombatGamepadShortcutResolution = {
  shouldStartCombat: boolean;
  actions: CombatActionName[];
};

export function resolveCombatGamepadShortcuts(input: {
  isAuthenticated: boolean;
  combatState: Pick<CombatEncounterState, 'status' | 'turn'> | null;
  justPressedButtons: ReadonlySet<number>;
  startButton: number;
  attackButton: number;
  defendButton: number;
  fireballButton: number;
}): CombatGamepadShortcutResolution {
  if (!input.isAuthenticated) {
    return {
      shouldStartCombat: false,
      actions: [],
    };
  }

  const isPlayerTurn = Boolean(
    input.combatState &&
      input.combatState.status === 'active' &&
      input.combatState.turn === 'player',
  );

  if (!isPlayerTurn) {
    return {
      shouldStartCombat: input.justPressedButtons.has(input.startButton),
      actions: [],
    };
  }

  const actions: CombatActionName[] = [];
  if (input.justPressedButtons.has(input.attackButton)) {
    actions.push('attack');
  }
  if (input.justPressedButtons.has(input.defendButton)) {
    actions.push('defend');
  }
  if (input.justPressedButtons.has(input.fireballButton)) {
    actions.push('fireball');
  }

  return {
    shouldStartCombat: false,
    actions,
  };
}
