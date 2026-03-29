export interface BlacksmithOffer {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
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
