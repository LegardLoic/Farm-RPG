import type { CombatActionName, CombatEncounterState } from '../../gameScene.stateTypes';
import { getPrimaryConnectedGamepad as getPrimaryConnectedGamepadFromCommon } from './gamepadHudLogic';
import { resolveGamepadFrame as resolveGamepadFrameFromCommon } from './gamepadFrameController';

export type GamepadInputButtons = {
  buttonA: number;
  dpadUp: number;
  dpadLeft: number;
  dpadDown: number;
  dpadRight: number;
  leftBumper: number;
  rightBumper: number;
};

export type GamepadInputSceneLike = {
  gamepadPreviousButtonStates: boolean[];
  gamepadHudFocusIndex: number;
  isAuthenticated: boolean;
  combatState: CombatEncounterState | null;
  combatStartButton: HTMLButtonElement | null;
  resetGamepadInputState(): void;
  syncGamepadHudFocusables(focusDomElement: boolean): void;
  moveGamepadHudFocus(step: number): void;
  handleGamepadCombatShortcuts(justPressedButtons: Set<number>): void;
  activateFocusedGamepadHudElement(): boolean;
  tryPerformCombatActionFromGamepad(action: CombatActionName): boolean;
  startCombat(): Promise<void>;
};

export function updateGamepadInputFrame(scene: GamepadInputSceneLike, buttons: GamepadInputButtons): void {
  const gamepad = getPrimaryConnectedGamepadFromCommon();
  if (!gamepad) {
    if (scene.gamepadPreviousButtonStates.length > 0 || scene.gamepadHudFocusIndex !== -1) {
      scene.resetGamepadInputState();
    }
    return;
  }

  scene.syncGamepadHudFocusables(false);
  const frame = resolveGamepadFrameFromCommon({
    gamepad,
    previousButtonStates: scene.gamepadPreviousButtonStates,
    navigationButtons: {
      up: buttons.dpadUp,
      left: buttons.dpadLeft,
      down: buttons.dpadDown,
      right: buttons.dpadRight,
      leftBumper: buttons.leftBumper,
      rightBumper: buttons.rightBumper,
    },
  });
  if (frame.kind !== 'connected') {
    return;
  }
  scene.gamepadPreviousButtonStates = frame.nextPreviousButtonStates;
  const justPressedButtons = frame.justPressedButtons;
  if (justPressedButtons.size === 0) {
    return;
  }

  if (frame.navigationStep !== 0) {
    scene.moveGamepadHudFocus(frame.navigationStep);
  }

  scene.handleGamepadCombatShortcuts(new Set(justPressedButtons));

  if (justPressedButtons.has(buttons.buttonA)) {
    if (scene.activateFocusedGamepadHudElement()) {
      return;
    }

    if (
      scene.isAuthenticated &&
      scene.combatState &&
      scene.combatState.status === 'active' &&
      scene.combatState.turn === 'player' &&
      scene.tryPerformCombatActionFromGamepad('attack')
    ) {
      return;
    }

    if (scene.combatStartButton && !scene.combatStartButton.disabled) {
      void scene.startCombat();
    }
  }
}
