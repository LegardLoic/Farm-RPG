import type { CharacterInventoryItemState } from '../character/characterEquipmentTypes';
import { IN_GAME_HOTBAR_SLOT_COUNT } from './inGameInventoryHotbar';

export type FarmHotbarActionIntent =
  | { kind: 'plant'; seedItemKey: string }
  | { kind: 'water'; toolItemKey: string }
  | { kind: 'harvest'; toolItemKey: string }
  | { kind: 'till'; toolItemKey: string }
  | { kind: 'none'; reason: 'empty-slot' | 'unsupported-item' };

function normalizeIndex(index: number): number {
  if (!Number.isFinite(index)) {
    return 0;
  }

  const rounded = Math.trunc(index);
  return ((rounded % IN_GAME_HOTBAR_SLOT_COUNT) + IN_GAME_HOTBAR_SLOT_COUNT) % IN_GAME_HOTBAR_SLOT_COUNT;
}

export function getSelectedHotbarItemKey(
  inventory: CharacterInventoryItemState[],
  selectedIndex: number,
): string | null {
  const itemKey = inventory[normalizeIndex(selectedIndex)]?.itemKey;
  if (!itemKey) {
    return null;
  }

  const normalized = itemKey.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function isSeedInventoryItemKey(itemKey: string): boolean {
  const normalized = itemKey.trim().toLowerCase();
  return normalized.endsWith('_seed') || normalized.endsWith('seed');
}

function isWaterToolItemKey(itemKey: string): boolean {
  const normalized = itemKey.trim().toLowerCase();
  return (
    normalized.includes('watering_can') ||
    normalized.includes('watering') ||
    normalized.includes('water_can') ||
    normalized.includes('wateringcan')
  );
}

function isHarvestToolItemKey(itemKey: string): boolean {
  const normalized = itemKey.trim().toLowerCase();
  return normalized.includes('scythe') || normalized.includes('sickle');
}

function isTillToolItemKey(itemKey: string): boolean {
  const normalized = itemKey.trim().toLowerCase();
  return normalized.includes('hoe');
}

export function resolveFarmHotbarActionIntent(itemKey: string | null): FarmHotbarActionIntent {
  if (!itemKey) {
    return { kind: 'none', reason: 'empty-slot' };
  }

  const normalized = itemKey.trim().toLowerCase();
  if (!normalized) {
    return { kind: 'none', reason: 'empty-slot' };
  }

  if (isSeedInventoryItemKey(normalized)) {
    return {
      kind: 'plant',
      seedItemKey: normalized,
    };
  }

  if (isWaterToolItemKey(normalized)) {
    return {
      kind: 'water',
      toolItemKey: normalized,
    };
  }

  if (isHarvestToolItemKey(normalized)) {
    return {
      kind: 'harvest',
      toolItemKey: normalized,
    };
  }

  if (isTillToolItemKey(normalized)) {
    return {
      kind: 'till',
      toolItemKey: normalized,
    };
  }

  return {
    kind: 'none',
    reason: 'unsupported-item',
  };
}
