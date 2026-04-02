type FetchJson = (path: string, init?: RequestInit) => Promise<unknown>;
type AsyncRefresh = () => Promise<void>;
type HudUpdater = () => void;
type ErrorMessageFormatter = (error: unknown, fallback: string) => string;

export async function runRestoreAutoSaveToSlotAction(input: {
  slot: number;
  isAuthenticated: boolean;
  hasAutosave: boolean;
  fetchJson: FetchJson;
  refreshAutoSaveState: AsyncRefresh;
  refreshSaveSlotsState: AsyncRefresh;
  setSaveSlotsLoadConfirmSlot: (slot: number | null) => void;
  setAutosaveRestoreSlotBusy: (slot: number | null) => void;
  setAutosaveError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setAutosaveError('Login required to restore autosave.');
    input.updateHud();
    return;
  }

  if (!input.hasAutosave) {
    input.setAutosaveError('No autosave available.');
    input.updateHud();
    return;
  }

  input.setSaveSlotsLoadConfirmSlot(null);
  input.setAutosaveRestoreSlotBusy(input.slot);
  input.setAutosaveError(null);
  input.updateHud();

  try {
    await input.fetchJson(`/saves/auto/restore/${input.slot}`, {
      method: 'POST',
    });
    await input.refreshAutoSaveState();
    await input.refreshSaveSlotsState();
  } catch (error) {
    input.setAutosaveError(input.getErrorMessage(error, `Unable to restore autosave to slot ${input.slot}.`));
  } finally {
    input.setAutosaveRestoreSlotBusy(null);
    input.updateHud();
  }
}

export async function runCaptureSaveSlotAction(input: {
  slot: number;
  isAuthenticated: boolean;
  fetchJson: FetchJson;
  refreshSaveSlotsState: AsyncRefresh;
  setSaveSlotsLoadConfirmSlot: (slot: number | null) => void;
  setSaveSlotsActionBusyKey: (busyKey: string | null) => void;
  setSaveSlotsError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setSaveSlotsError('Login required to capture saves.');
    input.updateHud();
    return;
  }

  input.setSaveSlotsLoadConfirmSlot(null);
  input.setSaveSlotsActionBusyKey(`capture:${input.slot}`);
  input.setSaveSlotsError(null);
  input.updateHud();

  try {
    await input.fetchJson(`/saves/${input.slot}/capture`, {
      method: 'POST',
    });
    await input.refreshSaveSlotsState();
  } catch (error) {
    input.setSaveSlotsError(input.getErrorMessage(error, `Unable to capture slot ${input.slot}.`));
  } finally {
    input.setSaveSlotsActionBusyKey(null);
    input.updateHud();
  }
}

export async function runLoadSaveSlotAction(input: {
  slot: number;
  isAuthenticated: boolean;
  hasExistingSaveSlot: boolean;
  saveSlotsLoadConfirmSlot: number | null;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshCombatState: AsyncRefresh;
  refreshQuestState: AsyncRefresh;
  refreshBlacksmithState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshAutoSaveState: AsyncRefresh;
  refreshSaveSlotsState: AsyncRefresh;
  setSaveSlotsLoadConfirmSlot: (slot: number | null) => void;
  setSaveSlotsActionBusyKey: (busyKey: string | null) => void;
  setSaveSlotsError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setSaveSlotsError('Login required to load saves.');
    input.updateHud();
    return;
  }

  if (!input.hasExistingSaveSlot) {
    input.setSaveSlotsError(`Slot ${input.slot} is empty.`);
    input.setSaveSlotsLoadConfirmSlot(null);
    input.updateHud();
    return;
  }

  if (input.saveSlotsLoadConfirmSlot !== input.slot) {
    input.setSaveSlotsError(`Confirm load for slot ${input.slot} first.`);
    input.setSaveSlotsLoadConfirmSlot(input.slot);
    input.updateHud();
    return;
  }

  input.setSaveSlotsLoadConfirmSlot(null);
  input.setSaveSlotsActionBusyKey(`load:${input.slot}`);
  input.setSaveSlotsError(null);
  input.updateHud();

  try {
    await input.fetchJson(`/saves/${input.slot}/load`, {
      method: 'POST',
    });
    await input.refreshGameplayState();
    await input.refreshCombatState();
    await input.refreshQuestState();
    await input.refreshBlacksmithState();
    await input.refreshVillageMarketState();
    await input.refreshAutoSaveState();
    await input.refreshSaveSlotsState();
  } catch (error) {
    input.setSaveSlotsError(input.getErrorMessage(error, `Unable to load slot ${input.slot}.`));
  } finally {
    input.setSaveSlotsActionBusyKey(null);
    input.updateHud();
  }
}

export async function runDeleteSaveSlotAction(input: {
  slot: number;
  isAuthenticated: boolean;
  fetchJson: FetchJson;
  refreshSaveSlotsState: AsyncRefresh;
  setSaveSlotsLoadConfirmSlot: (slot: number | null) => void;
  setSaveSlotsActionBusyKey: (busyKey: string | null) => void;
  setSaveSlotsError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setSaveSlotsError('Login required to delete saves.');
    input.updateHud();
    return;
  }

  input.setSaveSlotsLoadConfirmSlot(null);
  input.setSaveSlotsActionBusyKey(`delete:${input.slot}`);
  input.setSaveSlotsError(null);
  input.updateHud();

  try {
    await input.fetchJson(`/saves/${input.slot}`, {
      method: 'DELETE',
    });
    await input.refreshSaveSlotsState();
  } catch (error) {
    input.setSaveSlotsError(input.getErrorMessage(error, `Unable to delete slot ${input.slot}.`));
  } finally {
    input.setSaveSlotsActionBusyKey(null);
    input.updateHud();
  }
}
