import type { CombatEncounterState, HeroProfileState, HudState } from '../../gameScene.stateTypes';
import { getCharacterCatalogEntry, getCharacterRarityLabel } from './characterEquipmentCatalog';
import {
  CHARACTER_EQUIPMENT_SLOTS,
  type CharacterEquipmentEntryState,
  type CharacterEquipmentSlot,
  type CharacterInventoryItemState,
  type CharacterPrimaryStatKey,
  type CharacterPrimaryStats,
  createEmptyCharacterEquipmentState,
  isCharacterEquipmentSlot,
} from './characterEquipmentTypes';

export type CharacterPayloadParsers = {
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asNumber: (value: unknown) => number | null;
};

export type CharacterStatsLineViewModel = {
  label: string;
  value: string;
  emphasize: boolean;
};

export type CharacterSlotEntryViewModel = {
  slot: CharacterEquipmentSlot;
  slotLabel: string;
  itemKey: string | null;
  itemName: string;
  rarityLabel: string;
  selected: boolean;
};

export type CharacterDetailViewModel = {
  name: string;
  slotLabel: string;
  rarityLabel: string;
  bonusLabel: string;
  description: string;
  linkedSkillLabel: string;
  buildHintLabel: string;
};

export type CharacterInventoryEntryViewModel = {
  itemKey: string;
  itemName: string;
  quantity: number;
  rarityLabel: string;
  selected: boolean;
  compatible: boolean;
  compatibilityReason: string;
  equipped: boolean;
};

export type CharacterLinkedSkillViewModel = {
  name: string;
  sourceItemLabel: string;
  sourceSlotLabel: string;
  costLabel: string;
};

export type CharacterPanelViewModel = {
  visible: boolean;
  openButtonLabel: string;
  title: string;
  subtitle: string;
  heroIdentity: string;
  heroBuildSummary: string;
  stats: CharacterStatsLineViewModel[];
  secondaryStats: CharacterStatsLineViewModel[];
  slots: CharacterSlotEntryViewModel[];
  detail: CharacterDetailViewModel;
  comparisonLabel: string;
  linkedSkills: CharacterLinkedSkillViewModel[];
  inventoryEntries: CharacterInventoryEntryViewModel[];
  selectedSlot: CharacterEquipmentSlot;
  selectedSlotLabel: string;
  canUnequipSelectedSlot: boolean;
  busy: boolean;
  actionBusy: boolean;
  activeError: string | null;
  renderSignature: string;
};

const SLOT_LABELS: Record<CharacterEquipmentSlot, string> = {
  helmet: 'Casque',
  amulet: 'Amulette',
  chest: 'Torse',
  legs: 'Jambes',
  boots: 'Bottes',
  gloves: 'Gants',
  ring_left: 'Bague 1',
  ring_right: 'Bague 2',
  main_hand: 'Main droite',
  off_hand: 'Main gauche',
};

const STAT_LABELS: Record<CharacterPrimaryStatKey, string> = {
  for: 'FOR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  vit: 'VIT',
};

const EQUIPMENT_KEY_HINTS = [
  'sword',
  'shield',
  'boots',
  'armor',
  'helm',
  'helmet',
  'chest',
  'legs',
  'gloves',
  'ring',
  'amulet',
  'focus',
  'hammer',
  'dagger',
  'badge',
  'insignia',
  'relic',
  'plate',
  'alloy',
  'shard',
];

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

export function getCharacterSlotLabel(slot: CharacterEquipmentSlot): string {
  return SLOT_LABELS[slot];
}

export function normalizeCharacterEquipmentPayload(
  payload: unknown,
  parsers: CharacterPayloadParsers,
): CharacterEquipmentEntryState[] {
  const root = parsers.asRecord(payload);
  if (!root) {
    return createEmptyCharacterEquipmentState();
  }

  const rawEntries = Array.isArray(root.equipment) ? root.equipment : [];
  const bySlot = new Map<CharacterEquipmentSlot, string | null>();
  for (const entry of rawEntries) {
    const record = parsers.asRecord(entry);
    if (!record) {
      continue;
    }

    const rawSlot = parsers.asString(record.slot)?.trim();
    if (!rawSlot || !isCharacterEquipmentSlot(rawSlot)) {
      continue;
    }

    const rawItemKey = parsers.asString(record.itemKey)?.trim() ?? '';
    bySlot.set(rawSlot, rawItemKey.length > 0 ? rawItemKey : null);
  }

  return CHARACTER_EQUIPMENT_SLOTS.map((slot) => ({
    slot,
    itemKey: bySlot.get(slot) ?? null,
  }));
}

export function normalizeCharacterInventoryPayload(
  payload: unknown,
  parsers: CharacterPayloadParsers,
): CharacterInventoryItemState[] {
  const root = parsers.asRecord(payload);
  if (!root) {
    return [];
  }

  const rawItems = Array.isArray(root.items) ? root.items : [];
  const parsed = rawItems
    .map((entry) => {
      const record = parsers.asRecord(entry);
      if (!record) {
        return null;
      }

      const itemKey = parsers.asString(record.itemKey)?.trim() ?? '';
      const quantity = parsers.asNumber(record.quantity);
      if (!itemKey || quantity === null) {
        return null;
      }

      return {
        itemKey,
        quantity: Math.max(0, Math.round(quantity)),
      };
    })
    .filter((entry): entry is CharacterInventoryItemState => entry !== null)
    .filter((entry) => entry.quantity > 0)
    .sort((left, right) => right.quantity - left.quantity || left.itemKey.localeCompare(right.itemKey));

  return parsed;
}

function isLikelyEquipmentItem(itemKey: string): boolean {
  const normalized = itemKey.trim().toLowerCase();
  return EQUIPMENT_KEY_HINTS.some((hint) => normalized.includes(hint));
}

function computePrimaryStats(hudState: HudState, equipment: CharacterEquipmentEntryState[]): CharacterPrimaryStats {
  const base = Math.max(4, Math.round(4 + hudState.level * 0.7));
  const stats: CharacterPrimaryStats = {
    for: base,
    dex: base,
    con: base,
    int: base,
    vit: base,
  };

  for (const entry of equipment) {
    if (!entry.itemKey) {
      continue;
    }

    const catalogEntry = getCharacterCatalogEntry(entry.itemKey);
    if (!catalogEntry) {
      continue;
    }

    for (const statKey of Object.keys(catalogEntry.statBonuses) as CharacterPrimaryStatKey[]) {
      stats[statKey] += catalogEntry.statBonuses[statKey] ?? 0;
    }
  }

  return stats;
}

function computeBuildSummary(primaryStats: CharacterPrimaryStats): string {
  const ranked = (Object.keys(primaryStats) as CharacterPrimaryStatKey[])
    .map((key) => ({ key, value: primaryStats[key] }))
    .sort((left, right) => right.value - left.value);

  const top = ranked[0];
  const second = ranked[1];
  if (!top || !second) {
    return 'Orientation: Hybride lisible.';
  }

  if (top.value - second.value <= 1) {
    return `Orientation: Hybride (${STAT_LABELS[top.key]} / ${STAT_LABELS[second.key]}).`;
  }

  if (top.key === 'for') {
    return 'Orientation: Force / frontal.';
  }
  if (top.key === 'dex') {
    return 'Orientation: Dexterite / precision.';
  }
  if (top.key === 'int') {
    return 'Orientation: Intelligence / competences.';
  }
  return 'Orientation: Defense / robustesse.';
}

function getComparisonLabel(
  selectedSlot: CharacterEquipmentSlot,
  selectedInventoryItemKey: string | null,
  equipmentBySlot: Map<CharacterEquipmentSlot, string | null>,
): string {
  if (!selectedInventoryItemKey) {
    return 'Comparaison: selectionne un objet de l inventaire pour comparer.';
  }

  const equippedItemKey = equipmentBySlot.get(selectedSlot) ?? null;
  if (equippedItemKey === selectedInventoryItemKey) {
    return 'Comparaison: cet objet est deja equipe sur ce slot.';
  }

  const selectedMeta = getCharacterCatalogEntry(selectedInventoryItemKey);
  const equippedMeta = equippedItemKey ? getCharacterCatalogEntry(equippedItemKey) : null;

  const deltas: string[] = [];
  for (const statKey of Object.keys(STAT_LABELS) as CharacterPrimaryStatKey[]) {
    const selectedValue = selectedMeta?.statBonuses[statKey] ?? 0;
    const equippedValue = equippedMeta?.statBonuses[statKey] ?? 0;
    const delta = selectedValue - equippedValue;
    if (delta === 0) {
      continue;
    }
    const prefix = delta > 0 ? '+' : '';
    deltas.push(`${STAT_LABELS[statKey]} ${prefix}${delta}`);
  }

  if (deltas.length === 0) {
    return 'Comparaison: impact de stats mineur, verifie surtout la synergie de build.';
  }

  return `Comparaison: ${deltas.join(' | ')}`;
}

function isCatalogItemCompatibleWithSlot(itemKey: string, slot: CharacterEquipmentSlot): boolean {
  const catalogEntry = getCharacterCatalogEntry(itemKey);
  if (!catalogEntry) {
    return true;
  }

  return catalogEntry.compatibleSlots.includes(slot);
}

function buildInventoryEntries(
  inventory: CharacterInventoryItemState[],
  equipment: CharacterEquipmentEntryState[],
  selectedSlot: CharacterEquipmentSlot,
  selectedInventoryItemKey: string | null,
): CharacterInventoryEntryViewModel[] {
  const equippedKeys = new Set(equipment.map((entry) => entry.itemKey).filter((value): value is string => Boolean(value)));

  const entries = inventory
    .filter((entry) => {
      const known = getCharacterCatalogEntry(entry.itemKey);
      if (known) {
        return true;
      }

      if (equippedKeys.has(entry.itemKey)) {
        return true;
      }

      return isLikelyEquipmentItem(entry.itemKey);
    })
    .map((entry) => {
      const catalogEntry = getCharacterCatalogEntry(entry.itemKey);
      const compatible = isCatalogItemCompatibleWithSlot(entry.itemKey, selectedSlot);
      const reason = compatible
        ? 'Compatible'
        : `Incompatible avec ${getCharacterSlotLabel(selectedSlot)}.`;

      return {
        itemKey: entry.itemKey,
        itemName: getItemDisplayName(entry.itemKey),
        quantity: entry.quantity,
        rarityLabel: getCharacterRarityLabel(catalogEntry?.rarity ?? 'common'),
        selected: selectedInventoryItemKey === entry.itemKey,
        compatible,
        compatibilityReason: reason,
        equipped: equippedKeys.has(entry.itemKey),
      };
    })
    .sort((left, right) => {
      if (left.compatible !== right.compatible) {
        return Number(right.compatible) - Number(left.compatible);
      }
      return left.itemName.localeCompare(right.itemName);
    });

  return entries;
}

function getDetailViewModel(
  selectedSlot: CharacterEquipmentSlot,
  selectedInventoryItemKey: string | null,
  equipmentBySlot: Map<CharacterEquipmentSlot, string | null>,
): CharacterDetailViewModel {
  const selectedEquippedItemKey = equipmentBySlot.get(selectedSlot) ?? null;
  const detailItemKey = selectedInventoryItemKey ?? selectedEquippedItemKey;
  if (!detailItemKey) {
    return {
      name: 'Slot vide',
      slotLabel: getCharacterSlotLabel(selectedSlot),
      rarityLabel: 'Aucune',
      bonusLabel: 'Bonus: -',
      description: 'Selectionne un objet equipe ou un objet de l inventaire.',
      linkedSkillLabel: 'Competence liee: -',
      buildHintLabel: 'Build: aucun impact tant que le slot est vide.',
    };
  }

  const catalogEntry = getCharacterCatalogEntry(detailItemKey);
  if (!catalogEntry) {
    return {
      name: getItemDisplayName(detailItemKey),
      slotLabel: getCharacterSlotLabel(selectedSlot),
      rarityLabel: 'Non catalogue',
      bonusLabel: 'Bonus: donnees detaillees indisponibles.',
      description: 'Objet detecte dans l inventaire/equipement mais non documente dans le catalogue MVP front.',
      linkedSkillLabel: 'Competence liee: inconnue',
      buildHintLabel: 'Build: verifier en combat ou via les prochains contenus.',
    };
  }

  const bonusParts = (Object.keys(catalogEntry.statBonuses) as CharacterPrimaryStatKey[])
    .map((statKey) => `${STAT_LABELS[statKey]} +${catalogEntry.statBonuses[statKey] ?? 0}`);
  const bonusLabel = bonusParts.length > 0 ? `Bonus: ${bonusParts.join(' | ')}` : 'Bonus: -';

  return {
    name: catalogEntry.name,
    slotLabel: getCharacterSlotLabel(selectedSlot),
    rarityLabel: getCharacterRarityLabel(catalogEntry.rarity),
    bonusLabel,
    description: catalogEntry.description,
    linkedSkillLabel: catalogEntry.linkedSkill
      ? `Competence liee: ${catalogEntry.linkedSkill.name} (${catalogEntry.linkedSkill.costLabel})`
      : 'Competence liee: -',
    buildHintLabel: `Build: ${catalogEntry.buildHint}.`,
  };
}

function buildLinkedSkills(equipment: CharacterEquipmentEntryState[]): CharacterLinkedSkillViewModel[] {
  const rows: CharacterLinkedSkillViewModel[] = [];
  for (const entry of equipment) {
    if (!entry.itemKey) {
      continue;
    }

    const catalogEntry = getCharacterCatalogEntry(entry.itemKey);
    if (!catalogEntry?.linkedSkill) {
      continue;
    }

    rows.push({
      name: catalogEntry.linkedSkill.name,
      sourceItemLabel: catalogEntry.name,
      sourceSlotLabel: getCharacterSlotLabel(entry.slot),
      costLabel: catalogEntry.linkedSkill.costLabel,
    });
  }

  return rows;
}

export function buildCharacterPanelViewModel(input: {
  isAuthenticated: boolean;
  panelOpen: boolean;
  busy: boolean;
  actionBusy: boolean;
  error: string | null;
  heroProfile: HeroProfileState | null;
  heroAppearanceLabel: string;
  hudState: HudState;
  combatState: CombatEncounterState | null;
  equipment: CharacterEquipmentEntryState[];
  inventory: CharacterInventoryItemState[];
  selectedSlot: CharacterEquipmentSlot;
  selectedInventoryItemKey: string | null;
}): CharacterPanelViewModel {
  const equipmentBySlot = new Map(input.equipment.map((entry) => [entry.slot, entry.itemKey] as const));
  const selectedSlotItemKey = equipmentBySlot.get(input.selectedSlot) ?? null;
  const inventoryHasSelectedItem =
    input.selectedInventoryItemKey !== null &&
    input.inventory.some((entry) => entry.itemKey === input.selectedInventoryItemKey);
  const selectedInventoryItemKey = inventoryHasSelectedItem ? input.selectedInventoryItemKey : null;

  const primaryStats = computePrimaryStats(input.hudState, input.equipment);
  const primaryLines = (Object.keys(primaryStats) as CharacterPrimaryStatKey[]).map((key) => ({
    label: STAT_LABELS[key],
    value: `${primaryStats[key]}`,
    emphasize: true,
  }));

  const secondaryLines: CharacterStatsLineViewModel[] = [
    { label: 'PV max', value: `${input.hudState.maxHp}`, emphasize: false },
    { label: 'MP max', value: `${input.hudState.maxMp}`, emphasize: false },
    {
      label: 'Attaque',
      value: `${Math.max(0, Math.round(input.combatState?.player.attack ?? primaryStats.for + Math.floor(primaryStats.dex / 2)))}`,
      emphasize: false,
    },
    {
      label: 'Defense',
      value: `${Math.max(0, Math.round(input.combatState?.player.defense ?? primaryStats.con + Math.floor(primaryStats.vit / 2)))}`,
      emphasize: false,
    },
  ];

  const slots: CharacterSlotEntryViewModel[] = CHARACTER_EQUIPMENT_SLOTS.map((slot) => {
    const itemKey = equipmentBySlot.get(slot) ?? null;
    const catalogEntry = itemKey ? getCharacterCatalogEntry(itemKey) : null;
    return {
      slot,
      slotLabel: getCharacterSlotLabel(slot),
      itemKey,
      itemName: itemKey ? getItemDisplayName(itemKey) : 'Vide',
      rarityLabel: itemKey ? getCharacterRarityLabel(catalogEntry?.rarity ?? 'common') : 'Aucune',
      selected: slot === input.selectedSlot,
    };
  });

  const detail = getDetailViewModel(input.selectedSlot, selectedInventoryItemKey, equipmentBySlot);
  const comparisonLabel = getComparisonLabel(input.selectedSlot, selectedInventoryItemKey, equipmentBySlot);
  const linkedSkills = buildLinkedSkills(input.equipment);
  const inventoryEntries = buildInventoryEntries(
    input.inventory,
    input.equipment,
    input.selectedSlot,
    selectedInventoryItemKey,
  );

  const heroName = input.heroProfile?.heroName ?? 'Heros sans profil';
  const heroIdentity = `${heroName} | Niveau ${input.hudState.level} | ${input.heroAppearanceLabel}`;
  const heroBuildSummary = computeBuildSummary(primaryStats);

  const renderSignature = [
    input.isAuthenticated ? 'auth:1' : 'auth:0',
    input.panelOpen ? 'open:1' : 'open:0',
    input.busy ? 'busy:1' : 'busy:0',
    input.actionBusy ? 'action:1' : 'action:0',
    input.error ?? '-',
    input.selectedSlot,
    selectedInventoryItemKey ?? '-',
    input.heroProfile?.heroName ?? '-',
    input.hudState.level,
    ...input.equipment.map((entry) => `${entry.slot}:${entry.itemKey ?? '-'}`),
    ...input.inventory.map((entry) => `${entry.itemKey}:${entry.quantity}`),
  ].join('|');

  return {
    visible: input.panelOpen,
    openButtonLabel: input.panelOpen ? 'Fermer fiche (P)' : 'Fiche perso (P)',
    title: 'Personnage / Equipement',
    subtitle: input.isAuthenticated
      ? 'Lisibilite du build: stats, slots, detail et comparaison.'
      : 'Connexion requise pour afficher la fiche.',
    heroIdentity,
    heroBuildSummary,
    stats: primaryLines,
    secondaryStats: secondaryLines,
    slots,
    detail,
    comparisonLabel,
    linkedSkills,
    inventoryEntries,
    selectedSlot: input.selectedSlot,
    selectedSlotLabel: getCharacterSlotLabel(input.selectedSlot),
    canUnequipSelectedSlot: Boolean(selectedSlotItemKey),
    busy: input.busy,
    actionBusy: input.actionBusy,
    activeError: input.error,
    renderSignature,
  };
}
