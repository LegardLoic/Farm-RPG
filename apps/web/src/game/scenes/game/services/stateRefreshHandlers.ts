import type {
  CombatEncounterState,
  CombatUiStatus,
  SaveSlotPreview,
  SaveSlotState,
} from '../gameScene.stateTypes';
import type { VillageCropBuybackOfferState, VillageSeedOfferState } from '../gameScene.types';

type RefreshPayloadGatewayLike = {
  normalizeCombatPayload(payload: unknown): CombatEncounterState | null;
  normalizeVillageMarketPayload(payload: unknown): {
    unlocked: boolean;
    seedOffers: VillageSeedOfferState[];
    cropBuybackOffers: VillageCropBuybackOfferState[];
  };
  normalizeSaveSlotsPayload(payload: unknown): SaveSlotState[];
};

export type RefreshCombatStateSceneLike = {
  isAuthenticated: boolean;
  combatBusy: boolean;
  combatStatus: CombatUiStatus;
  combatMessage: string;
  combatState: CombatEncounterState | null;
  payloadGateway: RefreshPayloadGatewayLike;
  fetchJson<T>(path: string, init?: RequestInit): Promise<T>;
  resetCombatState(): void;
  clearCombatError(): void;
  applyCombatSnapshot(snapshot: CombatEncounterState): void;
  setCombatError(message: string): void;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

export async function refreshCombatStateForScene(scene: RefreshCombatStateSceneLike): Promise<void> {
  if (!scene.isAuthenticated) {
    scene.resetCombatState();
    scene.updateHud();
    return;
  }

  scene.combatBusy = true;
  scene.combatStatus = 'loading';
  scene.combatMessage = 'Chargement du combat...';
  scene.clearCombatError();
  scene.updateHud();

  try {
    const payload = await scene.fetchJson<unknown>('/combat/current', {
      method: 'GET',
    });
    const encounter = scene.payloadGateway.normalizeCombatPayload(payload);

    if (encounter) {
      scene.applyCombatSnapshot(encounter);
    } else {
      scene.resetCombatState();
    }
  } catch (error) {
    const message = scene.getErrorMessage(error, 'Impossible de charger le combat.');
    scene.setCombatError(message);
    if (!scene.combatState) {
      scene.combatStatus = 'error';
      scene.combatMessage = message;
    }
  } finally {
    scene.combatBusy = false;
    if (scene.combatState) {
      scene.combatStatus = scene.combatState.status;
    }
    scene.updateHud();
  }
}

export type RefreshVillageMarketStateSceneLike = {
  isAuthenticated: boolean;
  villageMarketBusy: boolean;
  villageMarketError: string | null;
  villageMarketUnlocked: boolean;
  villageMarketSeedOffers: VillageSeedOfferState[];
  villageMarketBuybackOffers: VillageCropBuybackOfferState[];
  payloadGateway: RefreshPayloadGatewayLike;
  fetchJson<T>(path: string, init?: RequestInit): Promise<T>;
  resetVillageMarketState(): void;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

export async function refreshVillageMarketStateForScene(scene: RefreshVillageMarketStateSceneLike): Promise<void> {
  if (!scene.isAuthenticated) {
    scene.resetVillageMarketState();
    scene.updateHud();
    return;
  }

  scene.villageMarketBusy = true;
  scene.villageMarketError = null;
  scene.updateHud();

  try {
    const payload = await scene.fetchJson<unknown>('/shops/village-market', {
      method: 'GET',
    });
    const parsed = scene.payloadGateway.normalizeVillageMarketPayload(payload);
    scene.villageMarketUnlocked = parsed.unlocked;
    scene.villageMarketSeedOffers = parsed.seedOffers;
    scene.villageMarketBuybackOffers = parsed.cropBuybackOffers;
  } catch (error) {
    scene.villageMarketError = scene.getErrorMessage(error, 'Unable to load village market.');
    scene.villageMarketUnlocked = false;
    if (scene.villageMarketSeedOffers.length === 0) {
      scene.villageMarketSeedOffers = [];
    }
    if (scene.villageMarketBuybackOffers.length === 0) {
      scene.villageMarketBuybackOffers = [];
    }
  } finally {
    scene.villageMarketBusy = false;
    scene.updateHud();
  }
}

export type RefreshSaveSlotsStateSceneLike = {
  isAuthenticated: boolean;
  saveSlotsBusy: boolean;
  saveSlotsError: string | null;
  saveSlots: SaveSlotState[];
  saveSlotsLoadConfirmSlot: number | null;
  payloadGateway: RefreshPayloadGatewayLike;
  fetchJson<T>(path: string, init?: RequestInit): Promise<T>;
  resetSaveSlotsState(): void;
  loadSaveSlotPreviews(slots: SaveSlotState[]): Promise<Map<number, SaveSlotPreview | null>>;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

export async function refreshSaveSlotsStateForScene(scene: RefreshSaveSlotsStateSceneLike): Promise<void> {
  if (!scene.isAuthenticated) {
    scene.resetSaveSlotsState();
    scene.updateHud();
    return;
  }

  scene.saveSlotsBusy = true;
  scene.saveSlotsError = null;
  scene.updateHud();

  try {
    const payload = await scene.fetchJson<unknown>('/saves', {
      method: 'GET',
    });
    const slots = scene.payloadGateway.normalizeSaveSlotsPayload(payload);
    const previewsBySlot = await scene.loadSaveSlotPreviews(slots);
    scene.saveSlots = slots.map((slot) => ({
      ...slot,
      preview: slot.exists ? (previewsBySlot.get(slot.slot) ?? null) : null,
    }));

    if (
      scene.saveSlotsLoadConfirmSlot !== null &&
      !scene.saveSlots.some((slot) => slot.slot === scene.saveSlotsLoadConfirmSlot && slot.exists)
    ) {
      scene.saveSlotsLoadConfirmSlot = null;
    }
  } catch (error) {
    scene.saveSlotsError = scene.getErrorMessage(error, 'Unable to load save slots.');
    if (scene.saveSlots.length === 0) {
      scene.saveSlots = [];
    }
  } finally {
    scene.saveSlotsBusy = false;
    scene.updateHud();
  }
}
