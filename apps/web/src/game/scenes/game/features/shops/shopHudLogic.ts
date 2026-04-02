export function getBlacksmithShopSummaryLabel(params: {
  isAuthenticated: boolean;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  blacksmithBusy: boolean;
  blacksmithOffersCount: number;
  gold: number;
}): string {
  if (!params.isAuthenticated) {
    return 'Login required';
  }

  if (!params.blacksmithUnlocked) {
    return params.blacksmithCurseLifted ? 'Recovering' : 'Locked';
  }

  return params.blacksmithBusy ? 'Refreshing...' : `${params.blacksmithOffersCount} offers | Gold ${params.gold}`;
}

export function getVillageMarketSummaryLabel(params: {
  isAuthenticated: boolean;
  villageMarketUnlocked: boolean;
  villageMarketBusy: boolean;
  villageMarketSeedOffersCount: number;
  villageMarketBuybackOffersCount: number;
}): string {
  if (!params.isAuthenticated) {
    return 'Login required';
  }

  if (!params.villageMarketUnlocked) {
    return params.villageMarketBusy ? 'Checking unlock...' : 'Locked';
  }

  return params.villageMarketBusy
    ? 'Refreshing...'
    : `${params.villageMarketSeedOffersCount} seeds | ${params.villageMarketBuybackOffersCount} crops`;
}
