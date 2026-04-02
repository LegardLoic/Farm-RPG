import type { AutoSaveState, SaveSlotState } from '../../gameScene.stateTypes';

export function getAutoSaveSummaryLabel(params: {
  isAuthenticated: boolean;
  autosaveBusy: boolean;
  autosave: AutoSaveState | null;
}): string {
  if (!params.isAuthenticated) {
    return 'Login required';
  }

  if (params.autosaveBusy && !params.autosave) {
    return 'Loading...';
  }

  if (!params.autosave) {
    return 'No autosave';
  }

  return `v${params.autosave.version} | ${params.autosave.reason}`;
}

export function getAutoSaveMetaLabel(params: {
  isAuthenticated: boolean;
  autosave: AutoSaveState | null;
  formatIsoForHud: (value: string) => string;
}): string {
  if (!params.isAuthenticated) {
    return 'Connect to view autosave.';
  }

  if (!params.autosave) {
    return 'No milestone autosave available yet.';
  }

  return `Updated: ${params.formatIsoForHud(params.autosave.updatedAt)}`;
}

export function getSaveSlotsSummaryLabel(params: {
  isAuthenticated: boolean;
  saveSlotsBusy: boolean;
  saveSlots: SaveSlotState[];
}): string {
  if (!params.isAuthenticated) {
    return 'Login required';
  }

  if (params.saveSlotsBusy && params.saveSlots.length === 0) {
    return 'Loading...';
  }

  const usedCount = params.saveSlots.filter((slot) => slot.exists).length;
  return `${usedCount}/3 used`;
}

export function getSafeSlotStates(saveSlots: SaveSlotState[]): SaveSlotState[] {
  const bySlot = new Map<number, SaveSlotState>();
  for (const slotState of saveSlots) {
    bySlot.set(slotState.slot, slotState);
  }

  return [1, 2, 3].map((slot) => {
    const entry = bySlot.get(slot);
    if (entry) {
      return entry;
    }

    return {
      slot,
      exists: false,
      version: null,
      label: null,
      updatedAt: null,
      preview: null,
    };
  });
}

export function hasExistingSaveSlot(params: {
  slot: number;
  saveSlots: SaveSlotState[];
}): boolean {
  const slotState = getSafeSlotStates(params.saveSlots).find((entry) => entry.slot === params.slot);
  return Boolean(slotState?.exists);
}

export function getSaveSlotMetaLabel(params: {
  slotState: SaveSlotState;
  formatIsoForHud: (value: string) => string;
}): string {
  if (!params.slotState.exists) {
    return 'Empty slot.';
  }

  const label = params.slotState.label?.trim() ? params.slotState.label.trim() : 'Manual save';
  const updated = params.slotState.updatedAt ? params.formatIsoForHud(params.slotState.updatedAt) : 'Unknown';
  return `${label} | Updated: ${updated}`;
}

export function getSaveSlotStatsPreviewLabel(slotState: SaveSlotState): string {
  if (!slotState.preview) {
    return 'Stats: preview unavailable.';
  }

  const level = slotState.preview.playerLevel !== null ? `${slotState.preview.playerLevel}` : '?';
  const gold = slotState.preview.gold !== null ? `${slotState.preview.gold}` : '?';
  const floorCurrent = slotState.preview.towerCurrentFloor !== null ? `${slotState.preview.towerCurrentFloor}` : '?';
  const floorHighest = slotState.preview.towerHighestFloor !== null ? `${slotState.preview.towerHighestFloor}` : '?';

  return `Stats: Lvl ${level} | Gold ${gold} | Floor ${floorCurrent}/${floorHighest}`;
}

export function getSaveSlotInventoryPreviewLabel(slotState: SaveSlotState): string {
  if (!slotState.preview) {
    return 'Inventory: preview unavailable.';
  }

  if (slotState.preview.inventoryTop.length === 0) {
    return 'Inventory: empty.';
  }

  const items = slotState.preview.inventoryTop.map((entry) => `${entry.itemKey} x${entry.quantity}`).join(', ');
  return `Inventory: ${items}`;
}

export function getSaveSlotEquipmentPreviewLabel(slotState: SaveSlotState): string {
  if (!slotState.preview) {
    return 'Equipment: preview unavailable.';
  }

  if (slotState.preview.equippedCount === 0) {
    return 'Equipment: none equipped.';
  }

  const equipped = slotState.preview.equipmentTop.map((entry) => `${entry.slot}:${entry.itemKey}`).join(', ');
  return `Equipment: ${slotState.preview.equippedCount} equipped (${equipped})`;
}

export function computeAutoSaveRenderSignature(params: {
  isAuthenticated: boolean;
  autosaveBusy: boolean;
  autosaveRestoreSlotBusy: number | null;
  autosaveError: string | null;
  autosave: AutoSaveState | null;
}): string {
  return [
    params.isAuthenticated ? '1' : '0',
    params.autosaveBusy ? '1' : '0',
    params.autosaveRestoreSlotBusy ?? '-',
    params.autosaveError ?? '',
    params.autosave ? `${params.autosave.version}:${params.autosave.reason}:${params.autosave.updatedAt}` : 'none',
  ].join('|');
}

export function computeSaveSlotsRenderSignature(params: {
  isAuthenticated: boolean;
  saveSlotsBusy: boolean;
  saveSlotsActionBusyKey: string | null;
  saveSlotsLoadConfirmSlot: number | null;
  saveSlotsError: string | null;
  slotStates: SaveSlotState[];
}): string {
  const slots = params.slotStates
    .map((slot) => {
      const preview = slot.preview
        ? `${slot.preview.playerLevel ?? '-'}:${slot.preview.gold ?? '-'}:${slot.preview.towerCurrentFloor ?? '-'}:${slot.preview.towerHighestFloor ?? '-'}:${slot.preview.inventoryTop.map((entry) => `${entry.itemKey}:${entry.quantity}`).join(',')}:${slot.preview.equipmentTop.map((entry) => `${entry.slot}:${entry.itemKey}`).join(',')}:${slot.preview.equippedCount}`
        : 'none';

      return `${slot.slot}:${slot.exists ? '1' : '0'}:${slot.version ?? '-'}:${slot.label ?? '-'}:${slot.updatedAt ?? '-'}:${preview}`;
    })
    .join(';');

  return [
    params.isAuthenticated ? '1' : '0',
    params.saveSlotsBusy ? '1' : '0',
    params.saveSlotsActionBusyKey ?? '-',
    params.saveSlotsLoadConfirmSlot ?? '-',
    params.saveSlotsError ?? '',
    slots,
  ].join('|');
}
