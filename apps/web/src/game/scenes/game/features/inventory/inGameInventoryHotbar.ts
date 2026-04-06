import { getCharacterCatalogEntry } from '../character/characterEquipmentCatalog';
import type { CharacterInventoryItemState } from '../character/characterEquipmentTypes';

export const IN_GAME_HOTBAR_SLOT_COUNT = 10;

type InGameInventoryHotbarTone = 'gear' | 'seed' | 'resource' | 'tool' | 'misc' | 'empty';

type InGameInventoryHotbarSlotViewModel = {
  slotIndex: number;
  shortcutLabel: string;
  selected: boolean;
  tone: InGameInventoryHotbarTone;
  itemKey: string | null;
  itemName: string;
  quantity: number;
  iconLabel: string;
};

type InGameInventoryHotbarViewModel = {
  slots: InGameInventoryHotbarSlotViewModel[];
  selectedItemLabel: string;
  hintLabel: string;
  renderSignature: string;
};

export type InGameInventoryHotbarSceneLike = {
  isAuthenticated: boolean;
  characterInventory: CharacterInventoryItemState[];
  inventoryHotbarSelectedIndex: number;
  inventoryHotbarRenderSignature: string;
  inventoryHotbarSlotsRoot: HTMLElement | null;
  inventoryHotbarItemValue: HTMLElement | null;
  inventoryHotbarHintValue: HTMLElement | null;
};

function formatKeyAsLabel(value: string): string {
  return value
    .split('_')
    .filter((segment) => segment.length > 0)
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ');
}

function getItemDisplayName(itemKey: string): string {
  return getCharacterCatalogEntry(itemKey)?.name ?? formatKeyAsLabel(itemKey);
}

function normalizeHotbarIndex(index: number): number {
  if (!Number.isFinite(index)) {
    return 0;
  }

  const rounded = Math.trunc(index);
  return ((rounded % IN_GAME_HOTBAR_SLOT_COUNT) + IN_GAME_HOTBAR_SLOT_COUNT) % IN_GAME_HOTBAR_SLOT_COUNT;
}

function resolveTone(itemKey: string | null): InGameInventoryHotbarTone {
  if (!itemKey) {
    return 'empty';
  }

  const normalized = itemKey.trim().toLowerCase();
  if (normalized.includes('seed')) {
    return 'seed';
  }
  if (
    normalized.includes('hoe') ||
    normalized.includes('axe') ||
    normalized.includes('pick') ||
    normalized.includes('can')
  ) {
    return 'tool';
  }
  if (
    normalized.includes('grass') ||
    normalized.includes('fiber') ||
    normalized.includes('stone') ||
    normalized.includes('wood') ||
    normalized.includes('tree')
  ) {
    return 'resource';
  }
  if (getCharacterCatalogEntry(normalized)) {
    return 'gear';
  }
  return 'misc';
}

function resolveIconLabel(itemKey: string | null): string {
  if (!itemKey) {
    return '--';
  }

  const normalized = itemKey.trim().toLowerCase();
  if (normalized.includes('sword')) {
    return 'SW';
  }
  if (normalized.includes('shield')) {
    return 'SH';
  }
  if (normalized.includes('axe')) {
    return 'AX';
  }
  if (normalized.includes('hoe')) {
    return 'HO';
  }
  if (normalized.includes('pick')) {
    return 'PK';
  }
  if (normalized.includes('seed')) {
    return 'SD';
  }
  if (normalized.includes('wood')) {
    return 'WD';
  }
  if (normalized.includes('stone')) {
    return 'ST';
  }
  if (normalized.includes('fiber')) {
    return 'FB';
  }
  if (normalized.includes('grass')) {
    return 'GR';
  }
  if (normalized.includes('ring')) {
    return 'RG';
  }
  if (normalized.includes('amulet')) {
    return 'AM';
  }
  if (normalized.includes('boots')) {
    return 'BT';
  }

  const label = formatKeyAsLabel(itemKey).replace(/[^a-zA-Z0-9]/g, '');
  const trimmed = label.length >= 2 ? label.slice(0, 2) : label;
  return trimmed.toUpperCase() || 'IT';
}

function getShortcutLabel(slotIndex: number): string {
  if (slotIndex === 9) {
    return '0';
  }
  return `${slotIndex + 1}`;
}

function buildSlots(
  inventory: CharacterInventoryItemState[],
  selectedIndex: number,
): InGameInventoryHotbarSlotViewModel[] {
  const selected = normalizeHotbarIndex(selectedIndex);
  const slots: InGameInventoryHotbarSlotViewModel[] = [];

  for (let slotIndex = 0; slotIndex < IN_GAME_HOTBAR_SLOT_COUNT; slotIndex += 1) {
    const entry = inventory[slotIndex] ?? null;
    const itemKey = entry?.itemKey ?? null;
    slots.push({
      slotIndex,
      shortcutLabel: getShortcutLabel(slotIndex),
      selected: slotIndex === selected,
      tone: resolveTone(itemKey),
      itemKey,
      itemName: itemKey ? getItemDisplayName(itemKey) : 'Slot vide',
      quantity: entry?.quantity ?? 0,
      iconLabel: resolveIconLabel(itemKey),
    });
  }

  return slots;
}

function buildViewModel(input: {
  isAuthenticated: boolean;
  inventory: CharacterInventoryItemState[];
  selectedIndex: number;
}): InGameInventoryHotbarViewModel {
  const slots = buildSlots(input.inventory, input.selectedIndex);
  const selectedSlot = slots.find((slot) => slot.selected) ?? slots[0] ?? null;

  let selectedItemLabel = 'Connexion requise';
  let hintLabel = 'Connecte-toi pour activer la barre rapide.';

  if (input.isAuthenticated) {
    if (selectedSlot?.itemKey) {
      selectedItemLabel = `${selectedSlot.itemName} x${selectedSlot.quantity}`;
    } else {
      selectedItemLabel = 'Slot vide';
    }
    hintLabel = 'Raccourcis: Shift+1..0/molette pour slot actif, clic gauche pres d une tuile farmable pour agir.';
  }

  const renderSignature = [
    input.isAuthenticated ? 'auth:1' : 'auth:0',
    `selected:${normalizeHotbarIndex(input.selectedIndex)}`,
    ...slots.map((slot) => `${slot.itemKey ?? '-'}:${slot.quantity}:${slot.tone}`),
  ].join('|');

  return {
    slots,
    selectedItemLabel,
    hintLabel,
    renderSignature,
  };
}

function renderSlots(root: HTMLElement, slots: InGameInventoryHotbarSlotViewModel[]): void {
  root.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const slot of slots) {
    const item = document.createElement('li');
    item.classList.add('hud-inventory-hotbar-item');

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('hud-inventory-hotbar-slot');
    button.dataset.hotbarAction = 'select';
    button.dataset.slotIndex = `${slot.slotIndex}`;
    button.dataset.hotbarTone = slot.tone;
    if (!slot.itemKey) {
      button.dataset.hotbarEmpty = '1';
    }
    if (slot.selected) {
      button.dataset.selected = '1';
    }
    button.title = slot.itemKey
      ? `${slot.itemName} x${slot.quantity}`
      : `Slot ${slot.shortcutLabel} vide`;

    const icon = document.createElement('span');
    icon.classList.add('hud-inventory-hotbar-icon');
    icon.textContent = slot.iconLabel;

    const shortcut = document.createElement('span');
    shortcut.classList.add('hud-inventory-hotbar-shortcut');
    shortcut.textContent = slot.shortcutLabel;

    button.append(icon, shortcut);

    if (slot.quantity > 1) {
      const quantity = document.createElement('span');
      quantity.classList.add('hud-inventory-hotbar-qty');
      quantity.textContent = `${slot.quantity}`;
      button.append(quantity);
    }

    item.append(button);
    fragment.append(item);
  }

  root.append(fragment);
}

export function updateInGameInventoryHotbar(scene: InGameInventoryHotbarSceneLike): void {
  if (!scene.inventoryHotbarSlotsRoot) {
    return;
  }

  const viewModel = buildViewModel({
    isAuthenticated: scene.isAuthenticated,
    inventory: scene.characterInventory,
    selectedIndex: scene.inventoryHotbarSelectedIndex,
  });

  if (scene.inventoryHotbarRenderSignature === viewModel.renderSignature) {
    return;
  }
  scene.inventoryHotbarRenderSignature = viewModel.renderSignature;

  renderSlots(scene.inventoryHotbarSlotsRoot, viewModel.slots);

  if (scene.inventoryHotbarItemValue) {
    scene.inventoryHotbarItemValue.textContent = viewModel.selectedItemLabel;
  }
  if (scene.inventoryHotbarHintValue) {
    scene.inventoryHotbarHintValue.textContent = viewModel.hintLabel;
  }
}
