import type { EquipmentSlot } from './equipment.constants';

export interface EquippedItem {
  slot: EquipmentSlot;
  itemKey: string | null;
}

