import type { EquipmentSlot } from '../equipment/equipment.constants';
import {
  GAME_ITEM_KEY_MAX_LENGTH,
  GAME_ITEM_KEY_PATTERN,
  type NormalizedGameItemDefinition,
  type GameItemDefinition,
} from './items.types';

function normalizeItemKey(itemKey: string): string {
  return itemKey.trim().toLowerCase();
}

function assertFiniteNonNegativeInteger(value: number, label: string, itemKey: string): void {
  if (!Number.isFinite(value) || Math.floor(value) !== value || value < 0) {
    throw new Error(`Game item "${itemKey}" has invalid ${label}: ${value}`);
  }
}

function toDefaultStackable(category: GameItemDefinition['category']): boolean {
  return category !== 'equipment' && category !== 'tool';
}

function toDefaultMaxStack(stackable: boolean): number | null {
  return stackable ? 999 : 1;
}

function normalizeItemDefinition(entry: GameItemDefinition): NormalizedGameItemDefinition {
  const itemKey = normalizeItemKey(entry.itemKey);
  const name = entry.name.trim();
  if (!itemKey) {
    throw new Error('Game item catalog contains an empty itemKey');
  }
  if (itemKey.length > GAME_ITEM_KEY_MAX_LENGTH) {
    throw new Error(`Game item "${itemKey}" exceeds max itemKey length (${GAME_ITEM_KEY_MAX_LENGTH})`);
  }
  if (!GAME_ITEM_KEY_PATTERN.test(itemKey)) {
    throw new Error(`Game item "${itemKey}" must match lowercase snake_case`);
  }
  if (!name) {
    throw new Error(`Game item catalog entry "${itemKey}" has an empty name`);
  }

  const stackable = typeof entry.stackable === 'boolean'
    ? entry.stackable
    : toDefaultStackable(entry.category);
  const maxStack = entry.maxStack ?? toDefaultMaxStack(stackable);
  const equipSlots: EquipmentSlot[] = Array.isArray(entry.equipSlots)
    ? [...new Set(entry.equipSlots)]
    : [];
  const tags = Array.isArray(entry.tags)
    ? [...new Set(entry.tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0))]
    : [];

  if (entry.category === 'tool' && !entry.toolType) {
    throw new Error(`Game item "${itemKey}" is category "tool" but has no toolType`);
  }
  if (entry.category !== 'tool' && entry.toolType) {
    throw new Error(`Game item "${itemKey}" has toolType but category is "${entry.category}"`);
  }
  if (entry.category === 'equipment' && equipSlots.length === 0) {
    throw new Error(`Game item "${itemKey}" is category "equipment" but has no equipSlots`);
  }
  if (entry.category !== 'equipment' && equipSlots.length > 0) {
    throw new Error(`Game item "${itemKey}" has equipSlots but category is "${entry.category}"`);
  }

  if (!stackable && maxStack !== 1) {
    throw new Error(`Game item "${itemKey}" is non-stackable but maxStack is ${maxStack}`);
  }
  if (stackable && (maxStack === null || maxStack <= 1)) {
    throw new Error(`Game item "${itemKey}" is stackable but maxStack is ${maxStack}`);
  }
  if (typeof maxStack === 'number') {
    assertFiniteNonNegativeInteger(maxStack, 'maxStack', itemKey);
  }
  if (typeof entry.buyPrice === 'number') {
    assertFiniteNonNegativeInteger(entry.buyPrice, 'buyPrice', itemKey);
  }
  if (typeof entry.sellPrice === 'number') {
    assertFiniteNonNegativeInteger(entry.sellPrice, 'sellPrice', itemKey);
  }

  return {
    itemKey,
    name,
    category: entry.category,
    description: entry.description?.trim() ?? '',
    rarity: entry.rarity ?? 'common',
    stackable,
    maxStack,
    equipSlots,
    toolType: entry.toolType ?? null,
    buyPrice: entry.buyPrice ?? null,
    sellPrice: entry.sellPrice ?? null,
    tags,
    enabled: entry.enabled ?? true,
    notes: entry.notes?.trim() || null,
  };
}

function buildCatalog(entries: GameItemDefinition[]): NormalizedGameItemDefinition[] {
  const seen = new Set<string>();
  return entries.map((entry) => {
    const normalized = normalizeItemDefinition(entry);
    if (seen.has(normalized.itemKey)) {
      throw new Error(`Duplicate game item key: ${normalized.itemKey}`);
    }
    seen.add(normalized.itemKey);
    return normalized;
  });
}

/*
Catalog authoring guide:
- Add entries only in RAW_GAME_ITEM_CATALOG.
- Keep keys in lowercase snake_case.
- Use category "tool" with toolType, category "equipment" with equipSlots.
- If an item can stack, keep maxStack > 1.
*/
const RAW_GAME_ITEM_CATALOG: GameItemDefinition[] = [
  // Farm tools
  {
    itemKey: 'starter_hoe',
    name: 'Starter Hoe',
    category: 'tool',
    description: 'Basic hoe used to till farm tiles.',
    toolType: 'hoe',
    stackable: false,
    tags: ['farm', 'tool'],
  },
  {
    itemKey: 'starter_watering_can',
    name: 'Starter Watering Can',
    category: 'tool',
    description: 'Basic watering can used on tilled soil.',
    toolType: 'watering_can',
    stackable: false,
    tags: ['farm', 'tool'],
  },
  {
    itemKey: 'starter_scythe',
    name: 'Starter Scythe',
    category: 'tool',
    description: 'Starter harvest tool for crop collection.',
    toolType: 'scythe',
    stackable: false,
    tags: ['farm', 'tool', 'harvest'],
  },
  {
    itemKey: 'starter_sickle',
    name: 'Starter Sickle',
    category: 'tool',
    description: 'Alternate harvest tool. Treated as a scythe-equivalent.',
    toolType: 'sickle',
    stackable: false,
    tags: ['farm', 'tool', 'harvest'],
  },

  // Seeds
  {
    itemKey: 'turnip_seed',
    name: 'Turnip Seeds',
    category: 'seed',
    description: 'Fast-growing seeds ideal for early farm loops.',
    buyPrice: 8,
    tags: ['farm', 'seed', 'turnip'],
  },
  {
    itemKey: 'carrot_seed',
    name: 'Carrot Seeds',
    category: 'seed',
    description: 'Reliable seeds for day-to-day farming.',
    buyPrice: 12,
    tags: ['farm', 'seed', 'carrot'],
  },
  {
    itemKey: 'wheat_seed',
    name: 'Wheat Seeds',
    category: 'seed',
    description: 'Bulk crop seeds for food and crafting.',
    buyPrice: 15,
    tags: ['farm', 'seed', 'wheat'],
  },

  // Crops
  {
    itemKey: 'turnip',
    name: 'Turnip',
    category: 'crop',
    description: 'Village staple crop.',
    sellPrice: 10,
    tags: ['farm', 'crop'],
  },
  {
    itemKey: 'carrot',
    name: 'Carrot',
    category: 'crop',
    description: 'Reliable produce for village kitchens.',
    sellPrice: 15,
    tags: ['farm', 'crop'],
  },
  {
    itemKey: 'wheat',
    name: 'Wheat',
    category: 'crop',
    description: 'High-demand grain used by village stores and crafters.',
    sellPrice: 18,
    tags: ['farm', 'crop'],
  },

  // Consumables
  {
    itemKey: 'healing_herb',
    name: 'Healing Herb',
    category: 'consumable',
    description: 'Basic restorative used during tower runs.',
    tags: ['consumable', 'combat'],
  },
  {
    itemKey: 'mana_tonic',
    name: 'Mana Tonic',
    category: 'consumable',
    description: 'Recovers mana for longer encounters.',
    buyPrice: 18,
    tags: ['consumable', 'combat'],
  },
  {
    itemKey: 'greater_mana_tonic',
    name: 'Greater Mana Tonic',
    category: 'consumable',
    description: 'More potent mana restoration than the standard tonic.',
    buyPrice: 54,
    tags: ['consumable', 'combat'],
  },
  {
    itemKey: 'elixir_of_vigor',
    name: 'Elixir of Vigor',
    category: 'consumable',
    description: 'High-tier restorative for deep tower attempts.',
    buyPrice: 96,
    tags: ['consumable', 'combat'],
  },

  // Materials
  {
    itemKey: 'wood_scrap',
    name: 'Wood Scrap',
    category: 'material',
    description: 'Common salvage from weaker enemies.',
    tags: ['material', 'drop'],
  },
  {
    itemKey: 'iron_ore',
    name: 'Iron Ore',
    category: 'material',
    description: 'Refining material used by blacksmith progression.',
    tags: ['material', 'drop', 'craft'],
  },
  {
    itemKey: 'ember_dust',
    name: 'Ember Dust',
    category: 'material',
    description: 'Corrupted residue found in mid-to-late tower floors.',
    tags: ['material', 'drop'],
  },

  // Quest items
  {
    itemKey: 'goblin_ear',
    name: 'Goblin Ear',
    category: 'quest',
    description: 'Proof of encounter from goblin skirmishes.',
    tags: ['quest', 'drop'],
  },
  {
    itemKey: 'cursed_core_fragment',
    name: 'Cursed Core Fragment',
    category: 'quest',
    rarity: 'rare',
    description: 'Fragment tied to corruption research objectives.',
    tags: ['quest', 'drop'],
  },
  {
    itemKey: 'alpha_thorn_core',
    name: 'Alpha Thorn Core',
    category: 'quest',
    rarity: 'epic',
    description: 'Rare drop from elite thorn-line targets.',
    tags: ['quest', 'drop', 'boss'],
  },

  // Equipment
  {
    itemKey: 'iron_sword',
    name: 'Iron Sword',
    category: 'equipment',
    description: 'Balanced blade for early tower fights.',
    rarity: 'common',
    stackable: false,
    equipSlots: ['main_hand'],
    buyPrice: 30,
    tags: ['equipment', 'weapon'],
  },
  {
    itemKey: 'steel_sword',
    name: 'Steel Sword',
    category: 'equipment',
    description: 'A sturdier blade forged for deeper tower runs.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['main_hand'],
    buyPrice: 78,
    tags: ['equipment', 'weapon'],
  },
  {
    itemKey: 'mithril_sword',
    name: 'Mithril Sword',
    category: 'equipment',
    description: 'A masterwork blade for high-floor encounters.',
    rarity: 'epic',
    stackable: false,
    equipSlots: ['main_hand'],
    buyPrice: 132,
    tags: ['equipment', 'weapon'],
  },
  {
    itemKey: 'tower_guard_shield',
    name: 'Tower Guard Shield',
    category: 'equipment',
    description: 'Reinforced shield for mid-tier pressure.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['off_hand'],
    buyPrice: 84,
    tags: ['equipment', 'shield'],
  },
  {
    itemKey: 'dragon_scale_armor',
    name: 'Dragon Scale Armor',
    category: 'equipment',
    description: 'Heavy armor tempered for elite tower threats.',
    rarity: 'epic',
    stackable: false,
    equipSlots: ['chest'],
    buyPrice: 156,
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'leather_boots',
    name: 'Leather Boots',
    category: 'equipment',
    description: 'Light boots with stable movement support.',
    rarity: 'common',
    stackable: false,
    equipSlots: ['boots'],
    buyPrice: 24,
    tags: ['equipment', 'boots'],
  },
  {
    itemKey: 'field_boots',
    name: 'Field Boots',
    category: 'equipment',
    description: 'Farm-grade boots with balanced comfort and grip.',
    rarity: 'common',
    stackable: false,
    equipSlots: ['boots'],
    tags: ['equipment', 'boots'],
  },
  {
    itemKey: 'ironbound_boots',
    name: 'Ironbound Boots',
    category: 'equipment',
    description: 'Heavy boots tuned for defensive loadouts.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['boots'],
    tags: ['equipment', 'boots'],
  },
  {
    itemKey: 'work_gloves',
    name: 'Work Gloves',
    category: 'equipment',
    description: 'Utility gloves with minor handling bonuses.',
    rarity: 'common',
    stackable: false,
    equipSlots: ['gloves'],
    tags: ['equipment', 'gloves'],
  },
  {
    itemKey: 'guard_gauntlets',
    name: 'Guard Gauntlets',
    category: 'equipment',
    description: 'Reinforced gauntlets from guard issue equipment.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['gloves'],
    tags: ['equipment', 'gloves'],
  },
  {
    itemKey: 'focus_amulet',
    name: 'Focus Amulet',
    category: 'equipment',
    description: 'Accessory oriented toward control and precision.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['amulet'],
    tags: ['equipment', 'amulet'],
  },
  {
    itemKey: 'vigor_amulet',
    name: 'Vigor Amulet',
    category: 'equipment',
    description: 'Accessory oriented toward durability.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['amulet'],
    tags: ['equipment', 'amulet'],
  },
  {
    itemKey: 'vigor_ring',
    name: 'Vigor Ring',
    category: 'equipment',
    description: 'Ring boosting frontline survivability.',
    rarity: 'uncommon',
    stackable: false,
    equipSlots: ['ring_left', 'ring_right'],
    tags: ['equipment', 'ring'],
  },
  {
    itemKey: 'clarity_ring',
    name: 'Clarity Ring',
    category: 'equipment',
    description: 'Ring favoring spell economy and consistency.',
    rarity: 'uncommon',
    stackable: false,
    equipSlots: ['ring_left', 'ring_right'],
    tags: ['equipment', 'ring'],
  },
  {
    itemKey: 'precision_ring',
    name: 'Precision Ring',
    category: 'equipment',
    description: 'Ring tuned for accuracy-oriented builds.',
    rarity: 'uncommon',
    stackable: false,
    equipSlots: ['ring_left', 'ring_right'],
    tags: ['equipment', 'ring'],
  },
  {
    itemKey: 'guard_ring',
    name: 'Guard Ring',
    category: 'equipment',
    description: 'Ring used by tower sentry units.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['ring_left', 'ring_right'],
    tags: ['equipment', 'ring'],
  },
  {
    itemKey: 'scout_badge',
    name: 'Scout Badge',
    category: 'equipment',
    description: 'Token of rank with lightweight stat utility.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['ring_left', 'ring_right'],
    tags: ['equipment', 'badge'],
  },
  {
    itemKey: 'vanguard_insignia',
    name: 'Vanguard Insignia',
    category: 'equipment',
    description: 'High-tier insignia awarded for frontline service.',
    rarity: 'epic',
    stackable: false,
    equipSlots: ['ring_left', 'ring_right'],
    tags: ['equipment', 'badge'],
  },
  {
    itemKey: 'thorn_shard',
    name: 'Thorn Shard',
    category: 'equipment',
    description: 'Corrupted shard adapted as an offensive charm.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['off_hand'],
    tags: ['equipment', 'charm'],
  },
  {
    itemKey: 'relic_of_unbinding',
    name: 'Relic of Unbinding',
    category: 'equipment',
    description: 'Rare relic associated with curse resistance.',
    rarity: 'legendary',
    stackable: false,
    equipSlots: ['off_hand'],
    tags: ['equipment', 'relic'],
  },
  {
    itemKey: 'curse_heart_shard',
    name: 'Curse Heart Shard',
    category: 'equipment',
    description: 'Dangerous shard carrying volatile power.',
    rarity: 'legendary',
    stackable: false,
    equipSlots: ['off_hand'],
    tags: ['equipment', 'relic'],
  },
  {
    itemKey: 'tempered_alloy',
    name: 'Tempered Alloy',
    category: 'equipment',
    description: 'Dense alloy plate used as advanced armor component.',
    rarity: 'epic',
    stackable: false,
    equipSlots: ['helmet', 'chest', 'legs', 'gloves'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'warden_ember_plate',
    name: 'Warden Ember Plate',
    category: 'equipment',
    description: 'Late-tier plate linked to ember-wardens.',
    rarity: 'legendary',
    stackable: false,
    equipSlots: ['chest'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'wooden_armor',
    name: 'Wooden Armor',
    category: 'equipment',
    description: 'Improvised wood armor for early progression.',
    rarity: 'common',
    stackable: false,
    equipSlots: ['chest'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'reinforced_leather_chest',
    name: 'Reinforced Leather Chest',
    category: 'equipment',
    description: 'Midline chest armor with balanced defenses.',
    rarity: 'uncommon',
    stackable: false,
    equipSlots: ['chest'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'guard_chestplate',
    name: 'Guard Chestplate',
    category: 'equipment',
    description: 'Standard issue chestplate for tower guards.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['chest'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'traveler_leggings',
    name: 'Traveler Leggings',
    category: 'equipment',
    description: 'Light leggings for mobility-heavy routes.',
    rarity: 'common',
    stackable: false,
    equipSlots: ['legs'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'guard_legplates',
    name: 'Guard Legplates',
    category: 'equipment',
    description: 'Weighted leg protection for sustained engagements.',
    rarity: 'rare',
    stackable: false,
    equipSlots: ['legs'],
    tags: ['equipment', 'armor'],
  },
  {
    itemKey: 'ember_focus',
    name: 'Ember Focus',
    category: 'equipment',
    description: 'Catalyst used for fire-oriented control loadouts.',
    rarity: 'epic',
    stackable: false,
    equipSlots: ['off_hand'],
    tags: ['equipment', 'focus'],
  },
  {
    itemKey: 'warden_hammer',
    name: 'Warden Hammer',
    category: 'equipment',
    description: 'Heavy weapon with high burst potential.',
    rarity: 'epic',
    stackable: false,
    equipSlots: ['main_hand'],
    tags: ['equipment', 'weapon'],
  },
];

export const GAME_ITEM_CATALOG: NormalizedGameItemDefinition[] = buildCatalog(RAW_GAME_ITEM_CATALOG);

export const GAME_ITEM_CATALOG_BY_KEY = new Map(
  GAME_ITEM_CATALOG.map((entry) => [entry.itemKey, entry] as const),
);

export function listGameItemDefinitions(): NormalizedGameItemDefinition[] {
  return GAME_ITEM_CATALOG.map((entry) => ({ ...entry, equipSlots: [...entry.equipSlots], tags: [...entry.tags] }));
}

export function getGameItemDefinition(itemKey: string): NormalizedGameItemDefinition | null {
  const normalizedKey = normalizeItemKey(itemKey);
  const entry = GAME_ITEM_CATALOG_BY_KEY.get(normalizedKey);
  if (!entry) {
    return null;
  }
  return {
    ...entry,
    equipSlots: [...entry.equipSlots],
    tags: [...entry.tags],
  };
}

export function hasGameItemDefinition(itemKey: string): boolean {
  return GAME_ITEM_CATALOG_BY_KEY.has(normalizeItemKey(itemKey));
}
