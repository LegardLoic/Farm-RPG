export const EQUIPMENT_SLOTS_TABLE = 'equipment_items';

export const EQUIPMENT_SLOTS = [
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

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];
