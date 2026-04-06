import { buildHudRootSummary as buildHudRootSummaryFromHud } from './hudRootSummary';

export type HudMainUpdateSceneLike = {
  hudRoot: HTMLElement | null;
  hudState: unknown;
  authStatus: string;
  isAuthenticated: boolean;
  loginButton: HTMLButtonElement | null;
  logoutButton: HTMLButtonElement | null;
  syncHudSceneMode(): void;
  getActiveAreaLabel(): string;
  getDayPhaseLabel(): string;
  formatValue(value: number): string;
  setHudText(key: string, value: string): void;
  updateHeroProfileHud(): void;
  updateIntroHud(): void;
  updateCharacterHud(): void;
  updateInGameInventoryHotbar(): void;
  updateCombatHud(): void;
  updateQuestHud(): void;
  updateVillageNpcHud(): void;
  updateBlacksmithHud(): void;
  updateVillageMarketHud(): void;
  updateFarmHud(): void;
  updateVillageMvpHud(): void;
  updateVillageShopPanel(): void;
  updateFarmCraftingHud(): void;
  updateLoopHud(): void;
  updateTowerStoryHud(): void;
  updateAutoSaveHud(): void;
  updateSaveSlotsHud(): void;
  updateDebugQaHud(): void;
  updateDayPhaseVisual(): void;
};

export function updateHudForScene(scene: HudMainUpdateSceneLike): void {
  if (!scene.hudRoot) {
    return;
  }

  scene.syncHudSceneMode();
  const activeAreaLabel = scene.getActiveAreaLabel();
  const hudSummary = buildHudRootSummaryFromHud({
    hudState: scene.hudState as Parameters<typeof buildHudRootSummaryFromHud>[0]['hudState'],
    activeAreaLabel,
    authStatus: scene.authStatus,
    dayPhaseLabel: scene.getDayPhaseLabel(),
    formatValue: (value) => scene.formatValue(value),
  });
  for (const [key, value] of Object.entries(hudSummary)) {
    scene.setHudText(key, value);
  }
  scene.updateHeroProfileHud();
  scene.updateIntroHud();
  scene.updateCharacterHud();
  scene.updateInGameInventoryHotbar();
  scene.updateCombatHud();
  scene.updateQuestHud();
  scene.updateVillageNpcHud();
  scene.updateBlacksmithHud();
  scene.updateVillageMarketHud();
  scene.updateFarmHud();
  scene.updateVillageMvpHud();
  scene.updateVillageShopPanel();
  scene.updateFarmCraftingHud();
  scene.updateLoopHud();
  scene.updateTowerStoryHud();
  scene.updateAutoSaveHud();
  scene.updateSaveSlotsHud();
  scene.updateDebugQaHud();
  scene.updateDayPhaseVisual();

  if (scene.loginButton) {
    scene.loginButton.hidden = scene.isAuthenticated;
  }

  if (scene.logoutButton) {
    scene.logoutButton.hidden = !scene.isAuthenticated;
  }
}
