import {
  VILLAGE_FORGE_SHOP_TABS,
  VILLAGE_MARKET_SHOP_TABS,
} from './frontSceneConfig';
import type {
  BlacksmithOfferState,
  ForgeShopCategoryKey,
  FrontSceneMode,
  VillageCropBuybackOfferState,
  VillageSeedOfferState,
  VillageShopPanelEntry,
  VillageShopTabKey,
  VillageShopTabOption,
  VillageShopType,
} from './frontSceneConfig';

export function getVillageShopTabs(shopType: VillageShopType): VillageShopTabOption[] {
  return shopType === 'market' ? VILLAGE_MARKET_SHOP_TABS : VILLAGE_FORGE_SHOP_TABS;
}

export function getForgeOfferCategory(offer: BlacksmithOfferState): ForgeShopCategoryKey {
  const key = `${offer.offerKey} ${offer.itemKey}`.toLowerCase();
  if (/(sword|dagger|hammer|shield|blade|staff|axe|bow|spear|lance|focus)/.test(key)) {
    return 'weapons';
  }
  if (/(armor|armour|chest|helm|helmet|leg|boot|glove|gauntlet|plate|leather)/.test(key)) {
    return 'armors';
  }

  return 'accessories';
}

export function getForgeCategoryLabel(category: ForgeShopCategoryKey): string {
  if (category === 'weapons') {
    return 'Arme';
  }
  if (category === 'armors') {
    return 'Armure';
  }

  return 'Accessoire';
}

export function getForgeTierLabel(tier: number): string {
  if (tier >= 3) {
    return 'Palier III';
  }
  if (tier === 2) {
    return 'Palier II';
  }

  return 'Palier I';
}

export function getForgeRecommendedTier(towerHighestFloor: number): 1 | 2 | 3 {
  if (towerHighestFloor >= 8) {
    return 3;
  }
  if (towerHighestFloor >= 5) {
    return 2;
  }

  return 1;
}

export function getForgeComparisonLabel(offer: BlacksmithOfferState, towerHighestFloor: number): string {
  const recommended = getForgeRecommendedTier(towerHighestFloor);
  if (offer.tier > recommended) {
    return `Comparaison simple: ${getForgeTierLabel(offer.tier)} au-dessus du palier conseille (${getForgeTierLabel(recommended)}).`;
  }
  if (offer.tier < recommended) {
    return `Comparaison simple: ${getForgeTierLabel(offer.tier)} plus conservateur que ton palier conseille (${getForgeTierLabel(recommended)}).`;
  }

  return `Comparaison simple: ${getForgeTierLabel(offer.tier)} aligne avec ton palier conseille actuel.`;
}

export function buildVillageShopEntries(input: {
  villageShopType: VillageShopType;
  villageShopTab: VillageShopTabKey;
  villageMarketBuybackOffers: VillageCropBuybackOfferState[];
  villageMarketSeedOffers: VillageSeedOfferState[];
  villageMarketUnlocked: boolean;
  villageMarketBusy: boolean;
  hudGold: number;
  blacksmithOffers: BlacksmithOfferState[];
  blacksmithUnlocked: boolean;
  blacksmithBusy: boolean;
  towerHighestFloor: number;
}): VillageShopPanelEntry[] {
  if (input.villageShopType === 'market') {
    if (input.villageShopTab === 'sell') {
      return input.villageMarketBuybackOffers.map((offer) => ({
        entryKey: `market-sell:${offer.itemKey}`,
        source: 'market-sell',
        name: offer.name,
        description: offer.description,
        priceValue: offer.goldValue,
        priceLabel: `+${offer.goldValue} po`,
        actionLabel: `Vendre x1 (+${offer.goldValue} po)`,
        canTransact: input.villageMarketUnlocked && !input.villageMarketBusy && offer.ownedQuantity > 0,
        offerKey: null,
        itemKey: offer.itemKey,
        ownedQuantity: offer.ownedQuantity,
        usageLabel: 'Recolte vendable au comptoir du village.',
        detailMeta: `Recolte • Stock ${offer.ownedQuantity} • Vente ${offer.goldValue} po`,
        comparisonLabel:
          offer.ownedQuantity > 0
            ? 'Transaction immediate: conversion en or sans menu supplementaire.'
            : 'Stock vide: retourne a la ferme pour recolter.',
        badgeLabel: `Stock ${offer.ownedQuantity}`,
      }));
    }

    return input.villageMarketSeedOffers.map((offer) => ({
      entryKey: `market-buy:${offer.offerKey}`,
      source: 'market-buy',
      name: offer.name,
      description: offer.description,
      priceValue: offer.goldPrice,
      priceLabel: `${offer.goldPrice} po`,
      actionLabel: `Acheter x1 (${offer.goldPrice} po)`,
      canTransact: input.villageMarketUnlocked && !input.villageMarketBusy && input.hudGold >= offer.goldPrice,
      offerKey: offer.offerKey,
      itemKey: offer.itemKey,
      ownedQuantity: null,
      usageLabel: 'Graine a planter sur une parcelle de ferme.',
      detailMeta: `Graine • Cout ${offer.goldPrice} po`,
      comparisonLabel:
        input.hudGold >= offer.goldPrice
          ? 'Accessible maintenant: achat direct puis retour a la ferme.'
          : 'Or insuffisant: vends des recoltes ou progresse en Tour.',
      badgeLabel: input.hudGold >= offer.goldPrice ? 'Disponible' : 'Hors budget',
    }));
  }

  const category =
    input.villageShopTab === 'armors' || input.villageShopTab === 'accessories' ? input.villageShopTab : 'weapons';
  const recommendedTier = getForgeRecommendedTier(input.towerHighestFloor);

  return input.blacksmithOffers
    .filter((offer) => getForgeOfferCategory(offer) === category)
    .sort((left, right) => left.tier - right.tier || left.goldPrice - right.goldPrice || left.name.localeCompare(right.name))
    .map((offer) => ({
      entryKey: `forge:${offer.offerKey}`,
      source: 'forge',
      name: offer.name,
      description: offer.description,
      priceValue: offer.goldPrice,
      priceLabel: `${offer.goldPrice} po`,
      actionLabel: `Acheter (${offer.goldPrice} po)`,
      canTransact: input.blacksmithUnlocked && !input.blacksmithBusy && input.hudGold >= offer.goldPrice,
      offerKey: offer.offerKey,
      itemKey: offer.itemKey,
      ownedQuantity: null,
      usageLabel: `${getForgeCategoryLabel(category)} de ${getForgeTierLabel(offer.tier)}.`,
      detailMeta: `${getForgeCategoryLabel(category)} • ${getForgeTierLabel(offer.tier)} • ${offer.goldPrice} po`,
      comparisonLabel: getForgeComparisonLabel(offer, input.towerHighestFloor),
      badgeLabel:
        offer.tier > recommendedTier
          ? `${getForgeTierLabel(offer.tier)} • Exigeant`
          : offer.tier < recommendedTier
            ? `${getForgeTierLabel(offer.tier)} • Stable`
            : `${getForgeTierLabel(offer.tier)} • Aligne`,
    }));
}

export function selectVillageShopEntry(
  entries: VillageShopPanelEntry[],
  selectedEntryKey: string | null,
): { selectedEntry: VillageShopPanelEntry | null; selectedEntryKey: string | null } {
  if (entries.length === 0) {
    return { selectedEntry: null, selectedEntryKey: null };
  }

  const selected = selectedEntryKey ? entries.find((entry) => entry.entryKey === selectedEntryKey) ?? null : null;
  if (selected) {
    return { selectedEntry: selected, selectedEntryKey };
  }

  const first = entries[0] ?? null;
  return {
    selectedEntry: first,
    selectedEntryKey: first?.entryKey ?? null,
  };
}

export function getVillageShopActiveError(
  villageShopType: VillageShopType,
  villageMarketError: string | null,
  blacksmithError: string | null,
): string | null {
  return villageShopType === 'market' ? villageMarketError : blacksmithError;
}

export function getVillageShopSummaryLabel(input: {
  isAuthenticated: boolean;
  villageShopType: VillageShopType;
  villageMarketUnlocked: boolean;
  villageMarketBusy: boolean;
  villageMarketSeedOffersCount: number;
  villageMarketBuybackOffersCount: number;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  blacksmithBusy: boolean;
  blacksmithOffersCount: number;
}): string {
  if (!input.isAuthenticated) {
    return 'Connexion requise pour utiliser ce shop.';
  }

  if (input.villageShopType === 'market') {
    if (!input.villageMarketUnlocked) {
      return 'Marche en reprise: quelques echanges restent verrouilles.';
    }
    if (input.villageMarketBusy) {
      return 'Synchronisation des etals en cours...';
    }

    return `${input.villageMarketSeedOffersCount} graines a l achat • ${input.villageMarketBuybackOffersCount} recoltes en rachat`;
  }

  if (!input.blacksmithUnlocked) {
    return input.blacksmithCurseLifted
      ? 'Forge en reprise: catalogue limite.'
      : 'Forge entravee: progression de Tour requise.';
  }
  if (input.blacksmithBusy) {
    return 'Forgeron en train de trier les offres...';
  }

  return `${input.blacksmithOffersCount} offres de forge • lecture par categories`;
}

export function getVillageShopTalkButtonLabel(input: {
  villageNpcBusy: boolean;
  isAuthenticated: boolean;
  npcAvailable: boolean;
  canTalkToday: boolean;
}): string {
  if (input.villageNpcBusy) {
    return 'Parler...';
  }
  if (!input.isAuthenticated) {
    return 'Connexion requise';
  }
  if (!input.npcAvailable) {
    return 'Indispo';
  }

  return input.canTalkToday ? 'Parler' : 'Deja vu';
}

export function computeVillageShopRenderSignature(input: {
  frontSceneMode: FrontSceneMode;
  villageShopPanelOpen: boolean;
  villageShopType: VillageShopType;
  villageShopTab: VillageShopTabKey;
  villageShopSelectedEntryKey: string | null;
  isAuthenticated: boolean;
  hudGold: number;
  blacksmithBusy: boolean;
  villageMarketBusy: boolean;
  villageNpcBusy: boolean;
  activeError: string | null;
  selectedEntryKey: string | null;
  tabs: VillageShopTabOption[];
  entries: VillageShopPanelEntry[];
}): string {
  const tabParts = input.tabs.map((tab) => `${tab.key}:${tab.label}`);
  const entryParts = input.entries.map(
    (entry) =>
      `${entry.entryKey}:${entry.priceValue}:${entry.canTransact ? '1' : '0'}:${entry.ownedQuantity ?? '-'}:${entry.badgeLabel}`,
  );

  return [
    input.frontSceneMode,
    input.villageShopPanelOpen ? '1' : '0',
    input.villageShopType,
    input.villageShopTab,
    input.villageShopSelectedEntryKey ?? '',
    input.isAuthenticated ? '1' : '0',
    input.hudGold,
    input.blacksmithBusy ? '1' : '0',
    input.villageMarketBusy ? '1' : '0',
    input.villageNpcBusy ? '1' : '0',
    input.activeError ?? '',
    input.selectedEntryKey ?? '',
    tabParts.join(','),
    entryParts.join(';'),
  ].join('|');
}
