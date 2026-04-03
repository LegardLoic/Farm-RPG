import type {
  CharacterInventoryEntryViewModel,
  CharacterPanelViewModel,
  CharacterSlotEntryViewModel,
  CharacterStatsLineViewModel,
} from './characterEquipmentLogic';

export type CharacterHudUpdateSceneLike = {
  characterPanelRoot: HTMLElement | null;
  characterToggleButton: HTMLButtonElement | null;
  characterIdentityValue: HTMLElement | null;
  characterSummaryValue: HTMLElement | null;
  characterStatsRoot: HTMLElement | null;
  characterSecondaryStatsRoot: HTMLElement | null;
  characterSlotsRoot: HTMLElement | null;
  characterDetailNameValue: HTMLElement | null;
  characterDetailMetaValue: HTMLElement | null;
  characterDetailDescriptionValue: HTMLElement | null;
  characterComparisonValue: HTMLElement | null;
  characterBuildValue: HTMLElement | null;
  characterLinkedSkillsRoot: HTMLElement | null;
  characterInventoryRoot: HTMLElement | null;
  characterRefreshButton: HTMLButtonElement | null;
  characterUnequipButton: HTMLButtonElement | null;
  characterErrorValue: HTMLElement | null;
  characterRenderSignature: string;
  buildCharacterPanelViewModel(): CharacterPanelViewModel;
};

function renderStats(root: HTMLElement, rows: CharacterStatsLineViewModel[]): void {
  root.replaceChildren();
  for (const row of rows) {
    const item = document.createElement('div');
    item.classList.add('character-stat-line');
    if (row.emphasize) {
      item.classList.add('primary');
    }

    const label = document.createElement('span');
    label.textContent = row.label;
    item.appendChild(label);

    const value = document.createElement('strong');
    value.textContent = row.value;
    item.appendChild(value);

    root.appendChild(item);
  }
}

function renderSlots(root: HTMLElement, rows: CharacterSlotEntryViewModel[]): void {
  root.replaceChildren();
  for (const row of rows) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('character-slot-entry');
    if (row.selected) {
      button.classList.add('selected');
    }
    button.dataset.characterAction = 'select-slot';
    button.dataset.slot = row.slot;

    const slot = document.createElement('span');
    slot.classList.add('character-slot-label');
    slot.textContent = row.slotLabel;
    button.appendChild(slot);

    const item = document.createElement('strong');
    item.classList.add('character-slot-item');
    item.textContent = row.itemName;
    button.appendChild(item);

    const rarity = document.createElement('small');
    rarity.classList.add('character-slot-rarity');
    rarity.textContent = row.rarityLabel;
    button.appendChild(rarity);

    root.appendChild(button);
  }
}

function renderLinkedSkills(root: HTMLElement, viewModel: CharacterPanelViewModel): void {
  root.replaceChildren();
  if (viewModel.linkedSkills.length === 0) {
    const line = document.createElement('li');
    line.classList.add('character-linked-skill-empty');
    line.textContent = 'Aucune competence liee active.';
    root.appendChild(line);
    return;
  }

  for (const skill of viewModel.linkedSkills) {
    const line = document.createElement('li');
    line.classList.add('character-linked-skill');
    line.textContent = `${skill.name} | ${skill.sourceItemLabel} (${skill.sourceSlotLabel}) | ${skill.costLabel}`;
    root.appendChild(line);
  }
}

function renderInventory(root: HTMLElement, viewModel: CharacterPanelViewModel): void {
  root.replaceChildren();
  if (viewModel.inventoryEntries.length === 0) {
    const empty = document.createElement('li');
    empty.classList.add('character-inventory-empty');
    empty.textContent = 'Aucun objet equipable detecte en inventaire.';
    root.appendChild(empty);
    return;
  }

  for (const entry of viewModel.inventoryEntries) {
    const row = document.createElement('li');
    row.classList.add('character-inventory-entry');
    if (entry.selected) {
      row.classList.add('selected');
    }
    if (!entry.compatible) {
      row.classList.add('incompatible');
    }

    const meta = document.createElement('div');
    meta.classList.add('character-inventory-meta');

    const name = document.createElement('strong');
    name.textContent = entry.itemName;
    meta.appendChild(name);

    const line = document.createElement('span');
    line.textContent = `${entry.rarityLabel} | x${entry.quantity}${entry.equipped ? ' | deja equipe' : ''}`;
    meta.appendChild(line);

    const reason = document.createElement('small');
    reason.textContent = entry.compatibilityReason;
    meta.appendChild(reason);

    row.appendChild(meta);

    const actions = document.createElement('div');
    actions.classList.add('character-inventory-actions');

    const inspectButton = document.createElement('button');
    inspectButton.type = 'button';
    inspectButton.classList.add('character-inventory-button');
    inspectButton.textContent = 'Details';
    inspectButton.dataset.characterAction = 'select-item';
    inspectButton.dataset.itemKey = entry.itemKey;
    actions.appendChild(inspectButton);

    const equipButton = document.createElement('button');
    equipButton.type = 'button';
    equipButton.classList.add('character-inventory-button', 'equip');
    equipButton.textContent = 'Equiper';
    equipButton.dataset.characterAction = 'equip-item';
    equipButton.dataset.itemKey = entry.itemKey;
    equipButton.dataset.slot = viewModel.selectedSlot;
    equipButton.disabled = viewModel.actionBusy || viewModel.busy || !entry.compatible;
    actions.appendChild(equipButton);

    row.appendChild(actions);
    root.appendChild(row);
  }
}

export function updateCharacterHudForScene(scene: CharacterHudUpdateSceneLike): void {
  const viewModel = scene.buildCharacterPanelViewModel();

  if (scene.characterToggleButton) {
    scene.characterToggleButton.textContent = viewModel.openButtonLabel;
  }

  if (!scene.characterPanelRoot) {
    return;
  }

  scene.characterPanelRoot.hidden = !viewModel.visible;
  if (!viewModel.visible) {
    scene.characterRenderSignature = viewModel.renderSignature;
    return;
  }

  if (scene.characterRenderSignature === viewModel.renderSignature) {
    return;
  }

  if (scene.characterIdentityValue) {
    scene.characterIdentityValue.textContent = viewModel.heroIdentity;
  }
  if (scene.characterSummaryValue) {
    scene.characterSummaryValue.textContent = viewModel.subtitle;
  }
  if (scene.characterStatsRoot) {
    renderStats(scene.characterStatsRoot, viewModel.stats);
  }
  if (scene.characterSecondaryStatsRoot) {
    renderStats(scene.characterSecondaryStatsRoot, viewModel.secondaryStats);
  }
  if (scene.characterSlotsRoot) {
    renderSlots(scene.characterSlotsRoot, viewModel.slots);
  }
  if (scene.characterDetailNameValue) {
    scene.characterDetailNameValue.textContent = viewModel.detail.name;
  }
  if (scene.characterDetailMetaValue) {
    scene.characterDetailMetaValue.textContent = `${viewModel.detail.slotLabel} | ${viewModel.detail.rarityLabel} | ${viewModel.detail.bonusLabel}`;
  }
  if (scene.characterDetailDescriptionValue) {
    scene.characterDetailDescriptionValue.textContent = `${viewModel.detail.description} ${viewModel.detail.buildHintLabel}`;
  }
  if (scene.characterComparisonValue) {
    scene.characterComparisonValue.textContent = viewModel.comparisonLabel;
  }
  if (scene.characterBuildValue) {
    scene.characterBuildValue.textContent = viewModel.heroBuildSummary;
  }
  if (scene.characterLinkedSkillsRoot) {
    renderLinkedSkills(scene.characterLinkedSkillsRoot, viewModel);
  }
  if (scene.characterInventoryRoot) {
    renderInventory(scene.characterInventoryRoot, viewModel);
  }
  if (scene.characterRefreshButton) {
    scene.characterRefreshButton.disabled = viewModel.busy || viewModel.actionBusy;
  }
  if (scene.characterUnequipButton) {
    scene.characterUnequipButton.disabled = viewModel.actionBusy || viewModel.busy || !viewModel.canUnequipSelectedSlot;
    scene.characterUnequipButton.dataset.slot = viewModel.selectedSlot;
    scene.characterUnequipButton.textContent = `Retirer ${viewModel.selectedSlotLabel}`;
  }
  if (scene.characterErrorValue) {
    scene.characterErrorValue.hidden = !viewModel.activeError;
    scene.characterErrorValue.textContent = viewModel.activeError ?? '';
  }

  scene.characterRenderSignature = viewModel.renderSignature;
}
