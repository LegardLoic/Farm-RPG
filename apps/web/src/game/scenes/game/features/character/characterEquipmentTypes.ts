export const CHARACTER_EQUIPMENT_SLOTS = [
  'helmet',
  'amulet',
  'chest',
  'legs',
  'boots',
  'gloves',
  'ring_left',
  'ring_right',
  'main_hand',
  'off_hand',
] as const;

export type CharacterEquipmentSlot = (typeof CHARACTER_EQUIPMENT_SLOTS)[number];

export type CharacterInventoryItemState = {
  itemKey: string;
  quantity: number;
};

export type CharacterEquipmentEntryState = {
  slot: CharacterEquipmentSlot;
  itemKey: string | null;
};

export type CharacterPrimaryStatKey = 'for' | 'dex' | 'con' | 'int' | 'vit';
export type CharacterPrimaryStats = Record<CharacterPrimaryStatKey, number>;

export type CharacterItemRarity = 'common' | 'rare' | 'epic';

export type CharacterLinkedSkill = {
  name: string;
  costLabel: string;
};

export type CharacterEquipmentCatalogEntry = {
  itemKey: string;
  name: string;
  description: string;
  rarity: CharacterItemRarity;
  compatibleSlots: CharacterEquipmentSlot[];
  statBonuses: Partial<CharacterPrimaryStats>;
  linkedSkill: CharacterLinkedSkill | null;
  buildHint: string;
};

export function isCharacterEquipmentSlot(value: string): value is CharacterEquipmentSlot {
  return CHARACTER_EQUIPMENT_SLOTS.includes(value as CharacterEquipmentSlot);
}

export function createEmptyCharacterEquipmentState(): CharacterEquipmentEntryState[] {
  return CHARACTER_EQUIPMENT_SLOTS.map((slot) => ({ slot, itemKey: null }));
}
