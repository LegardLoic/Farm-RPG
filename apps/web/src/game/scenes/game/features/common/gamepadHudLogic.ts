export type GamepadNavigationButtons = {
  up: number;
  left: number;
  down: number;
  right: number;
  leftBumper: number;
  rightBumper: number;
};

export function getPrimaryConnectedGamepad(): Gamepad | null {
  const pads = navigator.getGamepads?.();
  if (!pads) {
    return null;
  }

  for (const pad of pads) {
    if (pad?.connected) {
      return pad;
    }
  }

  return null;
}

export function consumeGamepadJustPressedButtons(
  gamepad: Gamepad,
  previousStates: boolean[],
): { justPressed: Set<number>; nextStates: boolean[] } {
  const justPressed = new Set<number>();
  const nextStates: boolean[] = [];

  gamepad.buttons.forEach((button, index) => {
    const pressed = Boolean(button.pressed);
    const previous = previousStates[index] ?? false;
    nextStates[index] = pressed;
    if (pressed && !previous) {
      justPressed.add(index);
    }
  });

  return {
    justPressed,
    nextStates,
  };
}

export function computeGamepadNavigationStep(
  justPressedButtons: Set<number>,
  buttons: GamepadNavigationButtons,
): -1 | 0 | 1 {
  let step = 0;
  if (justPressedButtons.has(buttons.up) || justPressedButtons.has(buttons.left)) {
    step -= 1;
  }
  if (justPressedButtons.has(buttons.down) || justPressedButtons.has(buttons.right)) {
    step += 1;
  }
  if (justPressedButtons.has(buttons.leftBumper)) {
    step -= 1;
  }
  if (justPressedButtons.has(buttons.rightBumper)) {
    step += 1;
  }

  if (step < 0) {
    return -1;
  }
  if (step > 0) {
    return 1;
  }

  return 0;
}

export function isHudElementGamepadFocusable(element: HTMLElement): boolean {
  const isFormControl = element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement;
  const disabled = isFormControl ? element.disabled : element.hasAttribute('disabled');
  if (disabled) {
    return false;
  }

  if (element.matches('[hidden]')) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

export function getGamepadHudFocusableElements(hudRoot: HTMLElement | null): HTMLElement[] {
  if (!hudRoot) {
    return [];
  }

  const selector = [
    'button',
    'select',
    'input:not([type="hidden"]):not([type="file"])',
    'textarea',
  ].join(', ');

  return Array.from(hudRoot.querySelectorAll<HTMLElement>(selector)).filter((element) =>
    isHudElementGamepadFocusable(element),
  );
}

export function resolveRetainedGamepadHudFocusIndex(input: {
  focusables: HTMLElement[];
  currentIndex: number;
  previousFocusedElement: HTMLElement | null;
}): number {
  if (input.focusables.length === 0) {
    return -1;
  }

  if (input.previousFocusedElement) {
    const retainedIndex = input.focusables.indexOf(input.previousFocusedElement);
    if (retainedIndex >= 0) {
      return retainedIndex;
    }
  }

  if (input.currentIndex >= input.focusables.length) {
    return input.focusables.length - 1;
  }

  return input.currentIndex;
}

export function getWrappedGamepadHudFocusIndex(currentIndex: number, total: number, step: number): number {
  if (total <= 0) {
    return -1;
  }

  if (currentIndex < 0) {
    return step > 0 ? 0 : total - 1;
  }

  return (currentIndex + step + total) % total;
}

export function applyGamepadHudFocusState(input: {
  focusables: HTMLElement[];
  focusIndex: number;
  focusDomElement: boolean;
}): void {
  input.focusables.forEach((element, index) => {
    if (index === input.focusIndex) {
      element.dataset.gamepadFocused = '1';
    } else {
      delete element.dataset.gamepadFocused;
    }
  });

  if (!input.focusDomElement || input.focusIndex < 0) {
    return;
  }

  const active = input.focusables[input.focusIndex];
  if (!active) {
    return;
  }

  active.focus({ preventScroll: true });
  active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

export function clearGamepadHudFocus(hudRoot: HTMLElement | null): void {
  if (!hudRoot) {
    return;
  }

  hudRoot.querySelectorAll<HTMLElement>('[data-gamepad-focused="1"]').forEach((element) => {
    delete element.dataset.gamepadFocused;
  });
}

export function activateGamepadHudElement(active: HTMLElement | null): boolean {
  if (!active) {
    return false;
  }

  if (active instanceof HTMLButtonElement) {
    active.click();
    return true;
  }

  if (active instanceof HTMLSelectElement) {
    if (active.options.length === 0) {
      return false;
    }
    const nextIndex = (active.selectedIndex + 1 + active.options.length) % active.options.length;
    active.selectedIndex = nextIndex;
    active.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  if (active instanceof HTMLInputElement && active.type === 'checkbox') {
    active.checked = !active.checked;
    active.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  active.focus({ preventScroll: true });
  return true;
}
