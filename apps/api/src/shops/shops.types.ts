export interface BlacksmithOffer {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
  tier: 1 | 2 | 3;
  requiredFlags: string[];
}

export interface BlacksmithShopState {
  unlocked: boolean;
  offers: BlacksmithOffer[];
}

export interface BlacksmithPurchaseResult {
  offer: BlacksmithOffer;
  quantity: number;
  totalCost: number;
  newGold: number;
  inventoryItem: {
    itemKey: string;
    quantityAdded: number;
    totalQuantity: number;
  };
}

export interface VillageSeedOffer {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
  requiredFlags: string[];
}

export interface VillageCropBuybackOffer {
  itemKey: string;
  name: string;
  description: string;
  goldValue: number;
  requiredFlags: string[];
}

export interface VillageMarketState {
  unlocked: boolean;
  seedOffers: VillageSeedOffer[];
  cropBuybackOffers: Array<VillageCropBuybackOffer & { ownedQuantity: number }>;
}

export interface VillageSeedPurchaseResult {
  offer: VillageSeedOffer;
  quantity: number;
  totalCost: number;
  newGold: number;
  inventoryItem: {
    itemKey: string;
    quantityAdded: number;
    totalQuantity: number;
  };
}

export interface VillageCropSaleResult {
  itemKey: string;
  quantitySold: number;
  unitGoldValue: number;
  totalGoldGained: number;
  newGold: number;
  remainingQuantity: number;
}
