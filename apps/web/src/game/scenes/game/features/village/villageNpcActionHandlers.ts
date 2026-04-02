import { getVillageNpcDisplayName as getVillageNpcDisplayNameFromLogic, type VillageNpcKey } from './villageLogic';

type FetchJson = (path: string, init?: RequestInit) => Promise<unknown>;
type RefreshGameplayState = () => Promise<void>;
type HudUpdater = () => void;
type ErrorMessageFormatter = (error: unknown, fallback: string) => string;

export async function runInteractVillageNpcAction(input: {
  npcKey: VillageNpcKey;
  isAuthenticated: boolean;
  npcAvailable: boolean;
  canTalkToday: boolean;
  fetchJson: FetchJson;
  refreshGameplayState: RefreshGameplayState;
  setVillageNpcBusy: (busy: boolean) => void;
  setVillageNpcError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  const npcName = getVillageNpcDisplayNameFromLogic(input.npcKey);
  if (!input.isAuthenticated) {
    input.setVillageNpcError('Login required to interact with village NPCs.');
    input.updateHud();
    return;
  }

  if (!input.npcAvailable) {
    input.setVillageNpcError(`${npcName} is unavailable right now.`);
    input.updateHud();
    return;
  }

  if (!input.canTalkToday) {
    input.setVillageNpcError(`${npcName} already talked today.`);
    input.updateHud();
    return;
  }

  input.setVillageNpcBusy(true);
  input.setVillageNpcError(null);
  input.updateHud();

  try {
    await input.fetchJson('/gameplay/village/npc/interact', {
      method: 'POST',
      body: JSON.stringify({
        npcKey: input.npcKey,
      }),
    });
    await input.refreshGameplayState();
  } catch (error) {
    input.setVillageNpcError(input.getErrorMessage(error, 'Unable to interact with this NPC.'));
  } finally {
    input.setVillageNpcBusy(false);
    input.updateHud();
  }
}

export type VillageNpcActionSceneLike = {
  isAuthenticated: boolean;
  villageNpcState: Record<VillageNpcKey, { available: boolean }>;
  villageNpcRelationships: Record<VillageNpcKey, { canTalkToday: boolean }>;
  villageNpcBusy: boolean;
  villageNpcError: string | null;
  postVillageNpcInteraction(npcKey: VillageNpcKey): Promise<unknown>;
  refreshGameplayState(): Promise<void>;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

export async function runInteractVillageNpcActionForScene(
  scene: VillageNpcActionSceneLike,
  npcKey: VillageNpcKey,
): Promise<void> {
  await runInteractVillageNpcAction({
    npcKey,
    isAuthenticated: scene.isAuthenticated,
    npcAvailable: scene.villageNpcState[npcKey].available,
    canTalkToday: scene.villageNpcRelationships[npcKey].canTalkToday,
    fetchJson: () => scene.postVillageNpcInteraction(npcKey),
    refreshGameplayState: () => scene.refreshGameplayState(),
    setVillageNpcBusy: (busy) => {
      scene.villageNpcBusy = busy;
    },
    setVillageNpcError: (error) => {
      scene.villageNpcError = error;
    },
    getErrorMessage: (error, fallback) => scene.getErrorMessage(error, fallback),
    updateHud: () => scene.updateHud(),
  });
}
