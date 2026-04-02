type FetchJson = (path: string, init?: RequestInit) => Promise<unknown>;
type AsyncRefresh = () => Promise<void>;
type HudUpdater = () => void;
type ErrorMessageFormatter = (error: unknown, fallback: string) => string;

export async function runBuyBlacksmithOfferAction(input: {
  offerKey: string;
  isAuthenticated: boolean;
  blacksmithUnlocked: boolean;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshBlacksmithState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  setBlacksmithBusy: (busy: boolean) => void;
  setBlacksmithError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setBlacksmithError('Login required to buy items.');
    input.updateHud();
    return;
  }

  if (!input.blacksmithUnlocked) {
    input.setBlacksmithError('Blacksmith shop is locked.');
    input.updateHud();
    return;
  }

  input.setBlacksmithBusy(true);
  input.setBlacksmithError(null);
  input.updateHud();

  try {
    await input.fetchJson('/shops/blacksmith/buy', {
      method: 'POST',
      body: JSON.stringify({
        offerKey: input.offerKey,
        quantity: 1,
      }),
    });
    await input.refreshGameplayState();
    await input.refreshBlacksmithState();
    await input.refreshVillageMarketState();
  } catch (error) {
    input.setBlacksmithError(input.getErrorMessage(error, 'Unable to buy this item.'));
  } finally {
    input.setBlacksmithBusy(false);
    input.updateHud();
  }
}

export async function runBuyVillageSeedOfferAction(input: {
  offerKey: string;
  isAuthenticated: boolean;
  villageMarketUnlocked: boolean;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshBlacksmithState: AsyncRefresh;
  setVillageMarketBusy: (busy: boolean) => void;
  setVillageMarketError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setVillageMarketError('Login required to buy seeds.');
    input.updateHud();
    return;
  }

  if (!input.villageMarketUnlocked) {
    input.setVillageMarketError('Village market is locked.');
    input.updateHud();
    return;
  }

  input.setVillageMarketBusy(true);
  input.setVillageMarketError(null);
  input.updateHud();

  try {
    await input.fetchJson('/shops/village-market/buy-seed', {
      method: 'POST',
      body: JSON.stringify({
        offerKey: input.offerKey,
        quantity: 1,
      }),
    });
    await input.refreshGameplayState();
    await input.refreshVillageMarketState();
    await input.refreshBlacksmithState();
  } catch (error) {
    input.setVillageMarketError(input.getErrorMessage(error, 'Unable to buy this seed offer.'));
  } finally {
    input.setVillageMarketBusy(false);
    input.updateHud();
  }
}

export async function runSellVillageCropAction(input: {
  itemKey: string;
  isAuthenticated: boolean;
  villageMarketUnlocked: boolean;
  fetchJson: FetchJson;
  refreshGameplayState: AsyncRefresh;
  refreshVillageMarketState: AsyncRefresh;
  refreshBlacksmithState: AsyncRefresh;
  setVillageMarketBusy: (busy: boolean) => void;
  setVillageMarketError: (error: string | null) => void;
  getErrorMessage: ErrorMessageFormatter;
  updateHud: HudUpdater;
}): Promise<void> {
  if (!input.isAuthenticated) {
    input.setVillageMarketError('Login required to sell crops.');
    input.updateHud();
    return;
  }

  if (!input.villageMarketUnlocked) {
    input.setVillageMarketError('Village market is locked.');
    input.updateHud();
    return;
  }

  input.setVillageMarketBusy(true);
  input.setVillageMarketError(null);
  input.updateHud();

  try {
    await input.fetchJson('/shops/village-market/sell-crop', {
      method: 'POST',
      body: JSON.stringify({
        itemKey: input.itemKey,
        quantity: 1,
      }),
    });
    await input.refreshGameplayState();
    await input.refreshVillageMarketState();
    await input.refreshBlacksmithState();
  } catch (error) {
    input.setVillageMarketError(input.getErrorMessage(error, 'Unable to sell this crop.'));
  } finally {
    input.setVillageMarketBusy(false);
    input.updateHud();
  }
}
