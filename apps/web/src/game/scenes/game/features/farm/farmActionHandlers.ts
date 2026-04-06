import type { FarmCraftingState } from '../../services/payloadNormalizers';

type FetchJson = (path: string, init?: RequestInit) => Promise<unknown>;
type AsyncRefresh = () => Promise<void>;
type HudUpdater = () => void;

type ErrorMessageFormatter = (error: unknown, fallback: string) => string;

type SetFarmBusy = (busy: boolean) => void;
type SetFarmError = (error: string | null) => void;
type SetFarmFeedbackMessage = (message: string | null) => void;
type SetFarmCraftingBusy = (busy: boolean) => void;
type SetFarmCraftingError = (error: string | null) => void;
type SetFarmCraftingPanelOpen = (open: boolean) => void;

export async function runSleepAtFarmAction(input: {
  isAuthenticated: boolean;
  farmUnlocked: boolean;
  fetchJson: FetchJson;
  applyGameplaySnapshot: (payload: unknown) => void;
  setFarmBusy: SetFarmBusy;
  setFarmError: SetFarmError;
  setFarmFeedbackMessage: SetFarmFeedbackMessage;
  getCurrentDay: () => number;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setFarmError('Login required to sleep at farm.');
    input.updateHud();
    return;
  }

  if (!input.farmUnlocked) {
    input.setFarmError('Farm is locked.');
    input.updateHud();
    return;
  }

  input.setFarmBusy(true);
  input.setFarmError(null);
  input.updateHud();

  try {
    const payload = await input.fetchJson('/gameplay/sleep', {
      method: 'POST',
    });
    input.applyGameplaySnapshot(payload);
    input.setFarmFeedbackMessage(`Nuit passee. Jour ${input.getCurrentDay()}.`);
  } catch (error) {
    input.setFarmError(input.getErrorMessage(error, 'Unable to sleep right now.'));
  } finally {
    input.setFarmBusy(false);
    input.updateHud();
  }
}

export async function runCraftFarmRecipeAction(input: {
  isAuthenticated: boolean;
  craftingState: FarmCraftingState | null;
  recipeKey: string;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshCharacterState?: AsyncRefresh;
  formatFarmLabel: (raw: string) => string;
  setFarmFeedbackMessage: SetFarmFeedbackMessage;
  setFarmCraftingPanelOpen: SetFarmCraftingPanelOpen;
  setFarmCraftingBusy: SetFarmCraftingBusy;
  setFarmCraftingError: SetFarmCraftingError;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setFarmCraftingError('Login required to craft farm consumables.');
    input.updateHud();
    return;
  }

  const crafting = input.craftingState;
  if (!crafting?.unlocked) {
    input.setFarmCraftingError('Farm crafting is locked.');
    input.updateHud();
    return;
  }

  const recipe = crafting.recipes.find((entry) => entry.recipeKey === input.recipeKey);
  if (!recipe || !recipe.unlocked) {
    input.setFarmCraftingError('Recipe is locked.');
    input.updateHud();
    return;
  }

  if (recipe.maxCraftable < 1) {
    input.setFarmCraftingError('Not enough farm ingredients for this recipe.');
    input.updateHud();
    return;
  }

  input.setFarmCraftingBusy(true);
  input.setFarmCraftingError(null);
  input.updateHud();

  try {
    await input.fetchJson('/gameplay/crafting/craft', {
      method: 'POST',
      body: JSON.stringify({
        recipeKey: input.recipeKey,
        quantity: 1,
      }),
    });
    await input.refreshGameplayState();
    await input.refreshVillageMarketState();
    if (input.refreshCharacterState) {
      await input.refreshCharacterState();
    }
    input.setFarmFeedbackMessage(`Craft termine: ${input.formatFarmLabel(recipe.outputItemKey)} +${recipe.outputQuantity}.`);
    input.setFarmCraftingPanelOpen(true);
  } catch (error) {
    input.setFarmCraftingError(input.getErrorMessage(error, 'Unable to craft this recipe.'));
  } finally {
    input.setFarmCraftingBusy(false);
    input.updateHud();
  }
}

export async function runPlantFarmPlotAction(input: {
  isAuthenticated: boolean;
  farmUnlocked: boolean;
  plotKey: string;
  seedItemKey: string;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshCharacterState?: AsyncRefresh;
  formatFarmLabel: (raw: string) => string;
  setFarmBusy: SetFarmBusy;
  setFarmError: SetFarmError;
  setFarmFeedbackMessage: SetFarmFeedbackMessage;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setFarmError('Login required to plant crops.');
    input.updateHud();
    return;
  }

  if (!input.farmUnlocked) {
    input.setFarmError('Farm is locked.');
    input.updateHud();
    return;
  }

  const seedItemKey = input.seedItemKey.trim();
  if (!seedItemKey) {
    input.setFarmError('Select a seed before planting.');
    input.updateHud();
    return;
  }

  input.setFarmBusy(true);
  input.setFarmError(null);
  input.updateHud();

  try {
    await input.fetchJson('/gameplay/farm/plant', {
      method: 'POST',
      body: JSON.stringify({
        plotKey: input.plotKey,
        seedItemKey,
      }),
    });
    await input.refreshGameplayState();
    await input.refreshVillageMarketState();
    if (input.refreshCharacterState) {
      await input.refreshCharacterState();
    }
    input.setFarmFeedbackMessage(`Parcelle semee: ${input.formatFarmLabel(seedItemKey)}.`);
  } catch (error) {
    input.setFarmError(input.getErrorMessage(error, 'Unable to plant this plot.'));
  } finally {
    input.setFarmBusy(false);
    input.updateHud();
  }
}

export async function runWaterFarmPlotAction(input: {
  isAuthenticated: boolean;
  farmUnlocked: boolean;
  plotKey: string;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  setFarmBusy: SetFarmBusy;
  setFarmError: SetFarmError;
  setFarmFeedbackMessage: SetFarmFeedbackMessage;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setFarmError('Login required to water crops.');
    input.updateHud();
    return;
  }

  if (!input.farmUnlocked) {
    input.setFarmError('Farm is locked.');
    input.updateHud();
    return;
  }

  input.setFarmBusy(true);
  input.setFarmError(null);
  input.updateHud();

  try {
    await input.fetchJson('/gameplay/farm/water', {
      method: 'POST',
      body: JSON.stringify({
        plotKey: input.plotKey,
      }),
    });
    await input.refreshGameplayState();
    input.setFarmFeedbackMessage('Parcelle arrosee.');
  } catch (error) {
    input.setFarmError(input.getErrorMessage(error, 'Unable to water this plot.'));
  } finally {
    input.setFarmBusy(false);
    input.updateHud();
  }
}

export async function runHarvestFarmPlotAction(input: {
  isAuthenticated: boolean;
  farmUnlocked: boolean;
  plotKey: string;
  harvestedCropLabel: string | null;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshCharacterState?: AsyncRefresh;
  setFarmBusy: SetFarmBusy;
  setFarmError: SetFarmError;
  setFarmFeedbackMessage: SetFarmFeedbackMessage;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setFarmError('Login required to harvest crops.');
    input.updateHud();
    return;
  }

  if (!input.farmUnlocked) {
    input.setFarmError('Farm is locked.');
    input.updateHud();
    return;
  }

  input.setFarmBusy(true);
  input.setFarmError(null);
  input.updateHud();

  try {
    await input.fetchJson('/gameplay/farm/harvest', {
      method: 'POST',
      body: JSON.stringify({
        plotKey: input.plotKey,
      }),
    });
    await input.refreshGameplayState();
    await input.refreshVillageMarketState();
    if (input.refreshCharacterState) {
      await input.refreshCharacterState();
    }
    input.setFarmFeedbackMessage(
      input.harvestedCropLabel ? `Recolte terminee: ${input.harvestedCropLabel}.` : 'Recolte terminee.',
    );
  } catch (error) {
    input.setFarmError(input.getErrorMessage(error, 'Unable to harvest this plot.'));
  } finally {
    input.setFarmBusy(false);
    input.updateHud();
  }
}
