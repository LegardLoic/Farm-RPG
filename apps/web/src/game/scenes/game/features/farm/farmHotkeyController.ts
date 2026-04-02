export type FarmHotkeyActionKey = 'craft' | 'sleep' | 'plant' | 'water' | 'harvest';

export type FarmHotkeyState = {
  craft: boolean;
  sleep: boolean;
  plant: boolean;
  water: boolean;
  harvest: boolean;
};

export type FarmHotkeyResolution =
  | {
      kind: 'ignored';
      reason: 'typing-inside-field' | 'no-command' | 'missing-selected-plot';
      hotkey: FarmHotkeyActionKey | null;
    }
  | {
      kind: 'toggle-crafting-panel';
    }
  | {
      kind: 'sleep-at-farm';
    }
  | {
      kind: 'plot-action';
      farmAction: Exclude<FarmHotkeyActionKey, 'craft' | 'sleep'>;
      plotKey: string;
    };

export function normalizeFarmPlotKey(plotKey: string | null | undefined): string | null {
  if (plotKey == null) {
    return null;
  }

  const normalizedPlotKey = plotKey.trim();
  return normalizedPlotKey.length > 0 ? normalizedPlotKey : null;
}

export function resolveFarmHotkeyCommand(input: {
  isTypingInsideField: boolean;
  hotkeys: FarmHotkeyState;
  selectedPlotKey: string | null | undefined;
}): FarmHotkeyResolution {
  if (input.isTypingInsideField) {
    return {
      kind: 'ignored',
      reason: 'typing-inside-field',
      hotkey: null,
    };
  }

  if (input.hotkeys.craft) {
    return {
      kind: 'toggle-crafting-panel',
    };
  }

  if (input.hotkeys.sleep) {
    return {
      kind: 'sleep-at-farm',
    };
  }

  const selectedPlotKey = normalizeFarmPlotKey(input.selectedPlotKey);
  if (!selectedPlotKey) {
    if (input.hotkeys.plant) {
      return {
        kind: 'ignored',
        reason: 'missing-selected-plot',
        hotkey: 'plant',
      };
    }
    if (input.hotkeys.water) {
      return {
        kind: 'ignored',
        reason: 'missing-selected-plot',
        hotkey: 'water',
      };
    }
    if (input.hotkeys.harvest) {
      return {
        kind: 'ignored',
        reason: 'missing-selected-plot',
        hotkey: 'harvest',
      };
    }

    return {
      kind: 'ignored',
      reason: 'no-command',
      hotkey: null,
    };
  }

  if (input.hotkeys.plant) {
    return {
      kind: 'plot-action',
      farmAction: 'plant',
      plotKey: selectedPlotKey,
    };
  }

  if (input.hotkeys.water) {
    return {
      kind: 'plot-action',
      farmAction: 'water',
      plotKey: selectedPlotKey,
    };
  }

  if (input.hotkeys.harvest) {
    return {
      kind: 'plot-action',
      farmAction: 'harvest',
      plotKey: selectedPlotKey,
    };
  }

  return {
    kind: 'ignored',
    reason: 'no-command',
    hotkey: null,
  };
}
