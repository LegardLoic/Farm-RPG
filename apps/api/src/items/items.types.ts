import type { EquipmentSlot } from '../equipment/equipment.constants';

export const GAME_ITEM_CATEGORIES = [
  'tool',
  'seed',
  'crop',
  'consumable',
  'equipment',
  'resource',
  'quest',
  'material',
] as const;

export type GameItemCategory = (typeof GAME_ITEM_CATEGORIES)[number];

export const GAME_ITEM_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
export type GameItemRarity = (typeof GAME_ITEM_RARITIES)[number];

// itemKey convention: lowercase snake_case (letters+digits), e.g. "turnip_seed".
export const GAME_ITEM_KEY_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const GAME_ITEM_KEY_MAX_LENGTH = 64;

export const FARM_TOOL_TYPES = ['hoe', 'watering_can', 'scythe', 'sickle'] as const;
export type FarmToolType = (typeof FARM_TOOL_TYPES)[number];

export type GameItemDefinition = {
  itemKey: string;
  name: string;
  category: GameItemCategory;
  description?: string;
  rarity?: GameItemRarity;
  stackable?: boolean;
  maxStack?: number | null;
  equipSlots?: EquipmentSlot[];
  toolType?: FarmToolType | null;
  buyPrice?: number | null;
  sellPrice?: number | null;
  tags?: string[];
  enabled?: boolean;
  notes?: string;
};

export type NormalizedGameItemDefinition = {
  itemKey: string;
  name: string;
  category: GameItemCategory;
  description: string;
  rarity: GameItemRarity;
  stackable: boolean;
  maxStack: number | null;
  equipSlots: EquipmentSlot[];
  toolType: FarmToolType | null;
  buyPrice: number | null;
  sellPrice: number | null;
  tags: string[];
  enabled: boolean;
  notes: string | null;
};
