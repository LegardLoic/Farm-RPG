import type Phaser from 'phaser';

export type FarmPlotLayoutFallbackEntry = {
  plotKey: string;
  row: number;
  col: number;
};

export type FrontSceneMode = 'farm' | 'village';

export type VillageSceneZoneKey = 'mayor' | 'market' | 'forge' | 'calm' | 'farm_exit' | 'tower_exit';

export type VillageSceneZoneActionKey =
  | 'talk-mayor'
  | 'talk-merchant'
  | 'talk-blacksmith'
  | 'talk-secondary'
  | 'open-market'
  | 'open-forge'
  | 'go-farm'
  | 'go-tower';

export type VillageShopType = 'market' | 'forge';
export type VillageShopTabKey = 'buy' | 'sell' | 'weapons' | 'armors' | 'accessories';
export type ForgeShopCategoryKey = 'weapons' | 'armors' | 'accessories';

export type VillageShopTabOption = {
  key: VillageShopTabKey;
  label: string;
};

export type VillageShopPanelEntry = {
  entryKey: string;
  source: 'market-buy' | 'market-sell' | 'forge';
  name: string;
  description: string;
  priceValue: number;
  priceLabel: string;
  actionLabel: string;
  canTransact: boolean;
  offerKey: string | null;
  itemKey: string;
  ownedQuantity: number | null;
  usageLabel: string;
  detailMeta: string;
  comparisonLabel: string;
  badgeLabel: string;
};

export type VillageSceneZoneConfig = {
  key: VillageSceneZoneKey;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  role: string;
  hint: string;
  actionLabel: string;
  actionKey: VillageSceneZoneActionKey;
  npcKey?: 'mayor' | 'blacksmith' | 'merchant';
};

export type VillageSceneZoneVisual = {
  config: VillageSceneZoneConfig;
  frame: Phaser.GameObjects.Rectangle;
  overlay: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  state: Phaser.GameObjects.Text;
};

export type BlacksmithOfferState = {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
  tier: 1 | 2 | 3;
  requiredFlags: string[];
};

export type VillageSeedOfferState = {
  offerKey: string;
  itemKey: string;
  name: string;
  description: string;
  goldPrice: number;
};

export type VillageCropBuybackOfferState = {
  itemKey: string;
  name: string;
  description: string;
  goldValue: number;
  ownedQuantity: number;
};
