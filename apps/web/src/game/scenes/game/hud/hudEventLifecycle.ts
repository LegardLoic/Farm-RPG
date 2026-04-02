type HudEventLifecycleInput = {
  debugQaReplayAutoPlaySpeedSelect: HTMLSelectElement | null;
  debugQaStripCalibrationSelect: HTMLSelectElement | null;
  debugQaRecapOutcomeFilterSelect: HTMLSelectElement | null;
  debugQaRecapEnemyFilterInput: HTMLInputElement | null;
  debugQaScriptEnemyFilterInput: HTMLInputElement | null;
  debugQaScriptIntentFilterInput: HTMLInputElement | null;
  debugQaImportFileInput: HTMLInputElement | null;
  heroProfileNameInput: HTMLInputElement | null;
  heroProfileAppearanceSelect: HTMLSelectElement | null;
  farmSeedSelect: HTMLSelectElement | null;
  onDebugQaReplayAutoPlaySpeedChange: () => void;
  onDebugQaStripCalibrationChange: () => void;
  onDebugQaFilterInputChange: () => void;
  onDebugQaImportFileChange: (event: Event) => void;
  onHeroProfileNameInput: () => void;
  onHeroProfileAppearanceChange: () => void;
  onFarmSeedSelectionChange: () => void;
};

function registerOptionalListeners(input: HudEventLifecycleInput, mode: 'add' | 'remove'): void {
  const register = (target: EventTarget | null, type: string, handler: EventListener) => {
    if (!target) {
      return;
    }

    if (mode === 'add') {
      target.addEventListener(type, handler);
    } else {
      target.removeEventListener(type, handler);
    }
  };

  register(input.debugQaReplayAutoPlaySpeedSelect, 'change', input.onDebugQaReplayAutoPlaySpeedChange);
  register(input.debugQaStripCalibrationSelect, 'change', input.onDebugQaStripCalibrationChange);
  register(input.debugQaRecapOutcomeFilterSelect, 'change', input.onDebugQaFilterInputChange);
  register(input.debugQaRecapEnemyFilterInput, 'input', input.onDebugQaFilterInputChange);
  register(input.debugQaScriptEnemyFilterInput, 'input', input.onDebugQaFilterInputChange);
  register(input.debugQaScriptIntentFilterInput, 'input', input.onDebugQaFilterInputChange);
  register(input.debugQaImportFileInput, 'change', input.onDebugQaImportFileChange);
  register(input.heroProfileNameInput, 'input', input.onHeroProfileNameInput);
  register(input.heroProfileAppearanceSelect, 'change', input.onHeroProfileAppearanceChange);
  register(input.farmSeedSelect, 'change', input.onFarmSeedSelectionChange);
}

export function bindHudEventListeners(input: HudEventLifecycleInput): void {
  registerOptionalListeners(input, 'add');
}

export function unbindHudEventListeners(input: HudEventLifecycleInput): void {
  registerOptionalListeners(input, 'remove');
}
