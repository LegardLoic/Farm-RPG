import {
  computeGamepadNavigationStep as computeGamepadNavigationStepFromCommon,
  consumeGamepadJustPressedButtons as consumeGamepadJustPressedButtonsFromCommon,
} from './gamepadHudLogic';

export type GamepadFrameResolution =
  | {
      kind: 'disconnected';
    }
  | {
      kind: 'connected';
      justPressedButtons: ReadonlySet<number>;
      nextPreviousButtonStates: boolean[];
      navigationStep: -1 | 0 | 1;
    };

export function resolveGamepadFrame(input: {
  gamepad: Gamepad | null;
  previousButtonStates: boolean[];
  navigationButtons: {
    up: number;
    left: number;
    down: number;
    right: number;
    leftBumper: number;
    rightBumper: number;
  };
}): GamepadFrameResolution {
  if (!input.gamepad) {
    return {
      kind: 'disconnected',
    };
  }

  const consumption = consumeGamepadJustPressedButtonsFromCommon(input.gamepad, input.previousButtonStates);
  const navigationStep = computeGamepadNavigationStepFromCommon(consumption.justPressed, input.navigationButtons);
  return {
    kind: 'connected',
    justPressedButtons: consumption.justPressed,
    nextPreviousButtonStates: consumption.nextStates,
    navigationStep,
  };
}
