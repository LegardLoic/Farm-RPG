import type { GameplayLoopState } from '../../services/payloadNormalizers';

type FetchJson = (path: string, init?: RequestInit) => Promise<unknown>;
type AsyncRefresh = () => Promise<void>;
type HudUpdater = () => void;
type ErrorMessageFormatter = (error: unknown, fallback: string) => string;

export async function runPrepareCombatLoopAction(input: {
  isAuthenticated: boolean;
  loopState: GameplayLoopState | null;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshBlacksmithState: AsyncRefresh;
  refreshQuestState: AsyncRefresh;
  setLoopBusy: (busy: boolean) => void;
  setLoopError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setLoopError('Login required to prepare combat.');
    input.updateHud();
    return;
  }

  if (!input.loopState?.preparation.ready) {
    input.setLoopError(input.loopState?.preparation.nextStep ?? 'Preparation unavailable.');
    input.updateHud();
    return;
  }

  input.setLoopBusy(true);
  input.setLoopError(null);
  input.updateHud();

  try {
    await input.fetchJson('/gameplay/combat/prepare', {
      method: 'POST',
    });
    await input.refreshGameplayState();
    await input.refreshVillageMarketState();
    await input.refreshBlacksmithState();
    await input.refreshQuestState();
  } catch (error) {
    input.setLoopError(input.getErrorMessage(error, 'Unable to prepare combat.'));
  } finally {
    input.setLoopBusy(false);
    input.updateHud();
  }
}

export type CombatLoopActionSceneLike = {
  isAuthenticated: boolean;
  loopState: GameplayLoopState | null;
  loopBusy: boolean;
  loopError: string | null;
  postPrepareCombatLoop(): Promise<unknown>;
  refreshGameplayState(): Promise<void>;
  refreshVillageMarketState(): Promise<void>;
  refreshBlacksmithState(): Promise<void>;
  refreshQuestState(): Promise<void>;
  getErrorMessage(error: unknown, fallback: string): string;
  updateHud(): void;
};

export async function runPrepareCombatLoopActionForScene(scene: CombatLoopActionSceneLike): Promise<void> {
  await runPrepareCombatLoopAction({
    isAuthenticated: scene.isAuthenticated,
    loopState: scene.loopState,
    fetchJson: () => scene.postPrepareCombatLoop(),
    refreshGameplayState: () => scene.refreshGameplayState(),
    refreshVillageMarketState: () => scene.refreshVillageMarketState(),
    refreshBlacksmithState: () => scene.refreshBlacksmithState(),
    refreshQuestState: () => scene.refreshQuestState(),
    setLoopBusy: (busy) => {
      scene.loopBusy = busy;
    },
    setLoopError: (error) => {
      scene.loopError = error;
    },
    getErrorMessage: (error, fallback) => scene.getErrorMessage(error, fallback),
    updateHud: () => scene.updateHud(),
  });
}
