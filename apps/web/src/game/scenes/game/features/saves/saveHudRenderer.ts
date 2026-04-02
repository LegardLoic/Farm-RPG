import type { SaveSlotState } from '../../gameScene.stateTypes';

export function renderAutoSaveActions(params: {
  root: HTMLElement;
  isAuthenticated: boolean;
  hasAutosave: boolean;
  autosaveBusy: boolean;
  autosaveRestoreSlotBusy: number | null;
}): void {
  params.root.replaceChildren();

  if (!params.isAuthenticated || !params.hasAutosave) {
    return;
  }

  for (const slot of [1, 2, 3]) {
    const button = document.createElement('button');
    button.classList.add('hud-autosave-restore');
    button.dataset.saveAction = 'restore';
    button.dataset.slot = `${slot}`;
    button.textContent = params.autosaveRestoreSlotBusy === slot ? `Restoring S${slot}...` : `Restore to Slot ${slot}`;
    button.disabled = params.autosaveBusy || params.autosaveRestoreSlotBusy !== null;
    params.root.appendChild(button);
  }
}

export function renderSaveSlotsList(params: {
  root: HTMLElement;
  isAuthenticated: boolean;
  slotStates: SaveSlotState[];
  saveSlotsBusy: boolean;
  saveSlotsActionBusyKey: string | null;
  saveSlotsLoadConfirmSlot: number | null;
  getSaveSlotMetaLabel: (slotState: SaveSlotState) => string;
  getSaveSlotStatsPreviewLabel: (slotState: SaveSlotState) => string;
  getSaveSlotInventoryPreviewLabel: (slotState: SaveSlotState) => string;
  getSaveSlotEquipmentPreviewLabel: (slotState: SaveSlotState) => string;
}): void {
  params.root.replaceChildren();

  if (!params.isAuthenticated) {
    const item = document.createElement('li');
    item.classList.add('save-slot-item', 'empty');
    item.textContent = 'Connect to manage save slots.';
    params.root.appendChild(item);
    return;
  }

  for (const slotState of params.slotStates) {
    const item = document.createElement('li');
    item.classList.add('save-slot-item');
    item.dataset.exists = slotState.exists ? '1' : '0';

    const header = document.createElement('div');
    header.classList.add('save-slot-header');

    const title = document.createElement('strong');
    title.textContent = `Slot ${slotState.slot}`;
    header.appendChild(title);

    const badge = document.createElement('span');
    badge.classList.add('save-slot-state');
    badge.textContent = slotState.exists ? `v${slotState.version ?? 1}` : 'Empty';
    header.appendChild(badge);
    item.appendChild(header);

    const meta = document.createElement('p');
    meta.classList.add('save-slot-meta');
    meta.textContent = params.getSaveSlotMetaLabel(slotState);
    item.appendChild(meta);

    if (slotState.exists) {
      const preview = document.createElement('div');
      preview.classList.add('save-slot-preview');

      const previewStats = document.createElement('p');
      previewStats.classList.add('save-slot-preview-line');
      previewStats.textContent = params.getSaveSlotStatsPreviewLabel(slotState);
      preview.appendChild(previewStats);

      const previewInventory = document.createElement('p');
      previewInventory.classList.add('save-slot-preview-line');
      previewInventory.textContent = params.getSaveSlotInventoryPreviewLabel(slotState);
      preview.appendChild(previewInventory);

      const previewEquipment = document.createElement('p');
      previewEquipment.classList.add('save-slot-preview-line');
      previewEquipment.textContent = params.getSaveSlotEquipmentPreviewLabel(slotState);
      preview.appendChild(previewEquipment);

      item.appendChild(preview);
    }

    const actions = document.createElement('div');
    actions.classList.add('save-slot-actions');

    const captureBusy = params.saveSlotsActionBusyKey === `capture:${slotState.slot}`;
    const loadBusy = params.saveSlotsActionBusyKey === `load:${slotState.slot}`;
    const deleteBusy = params.saveSlotsActionBusyKey === `delete:${slotState.slot}`;
    const hasBusyAction = params.saveSlotsActionBusyKey !== null;
    const isLoadConfirmOpen = params.saveSlotsLoadConfirmSlot === slotState.slot;
    const hasLoadConfirmOpen = params.saveSlotsLoadConfirmSlot !== null;

    const captureButton = document.createElement('button');
    captureButton.classList.add('hud-save-action', 'capture');
    captureButton.dataset.saveAction = 'capture';
    captureButton.dataset.slot = `${slotState.slot}`;
    captureButton.textContent = captureBusy ? 'Saving...' : 'Capture';
    captureButton.disabled = params.saveSlotsBusy || hasBusyAction || hasLoadConfirmOpen;
    actions.appendChild(captureButton);

    const loadButton = document.createElement('button');
    loadButton.classList.add('hud-save-action');
    loadButton.dataset.saveAction = 'load';
    loadButton.dataset.slot = `${slotState.slot}`;
    loadButton.textContent = loadBusy ? 'Loading...' : isLoadConfirmOpen ? 'Selected' : 'Load';
    loadButton.disabled = params.saveSlotsBusy || hasBusyAction || !slotState.exists || (hasLoadConfirmOpen && !isLoadConfirmOpen);
    actions.appendChild(loadButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('hud-save-action', 'danger');
    deleteButton.dataset.saveAction = 'delete';
    deleteButton.dataset.slot = `${slotState.slot}`;
    deleteButton.textContent = deleteBusy ? 'Deleting...' : 'Delete';
    deleteButton.disabled = params.saveSlotsBusy || hasBusyAction || !slotState.exists || hasLoadConfirmOpen;
    actions.appendChild(deleteButton);

    item.appendChild(actions);

    if (isLoadConfirmOpen) {
      const confirmPanel = document.createElement('div');
      confirmPanel.classList.add('save-slot-load-confirm');

      const confirmMessage = document.createElement('p');
      confirmMessage.classList.add('save-slot-load-confirm-message');
      confirmMessage.textContent = `Load Slot ${slotState.slot}? This will replace your current progression.`;
      confirmPanel.appendChild(confirmMessage);

      const confirmActions = document.createElement('div');
      confirmActions.classList.add('save-slot-load-confirm-actions');

      const confirmButton = document.createElement('button');
      confirmButton.classList.add('hud-save-action', 'confirm');
      confirmButton.dataset.saveAction = 'confirm-load';
      confirmButton.dataset.slot = `${slotState.slot}`;
      confirmButton.textContent = loadBusy ? 'Loading...' : 'Confirm Load';
      confirmButton.disabled = params.saveSlotsBusy || hasBusyAction;
      confirmActions.appendChild(confirmButton);

      const cancelButton = document.createElement('button');
      cancelButton.classList.add('hud-save-action', 'cancel');
      cancelButton.dataset.saveAction = 'cancel-load';
      cancelButton.dataset.slot = `${slotState.slot}`;
      cancelButton.textContent = 'Cancel';
      cancelButton.disabled = params.saveSlotsBusy || hasBusyAction;
      confirmActions.appendChild(cancelButton);

      confirmPanel.appendChild(confirmActions);
      item.appendChild(confirmPanel);
    }

    params.root.appendChild(item);
  }
}
