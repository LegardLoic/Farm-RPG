import type { BlacksmithOffer, VillageCropBuybackOffer, VillageSeedOffer } from './shops.types';

export const BLACKSMITH_SHOP_UNLOCK_FLAG = 'blacksmith_shop_tier_1_unlocked';
export const BLACKSMITH_TIER_2_UNLOCK_FLAGS = ['story_floor_5_cleared'] as const;
export const BLACKSMITH_TIER_3_UNLOCK_FLAGS = ['story_floor_8_cleared'] as const;
export const VILLAGE_MARKET_UNLOCK_FLAGS = ['intro_farm_assigned', 'floor_3_cleared'] as const;

export const BLACKSMITH_OFFERS: BlacksmithOffer[] = [
  {
    offerKey: 'iron_sword_basic',
    itemKey: 'iron_sword',
    name: 'Iron Sword',
    description: 'Balanced blade for early tower fights.',
    goldPrice: 30,
    tier: 1,
    requiredFlags: [],
  },
  {
    offerKey: 'leather_boots_basic',
    itemKey: 'leather_boots',
    name: 'Leather Boots',
    description: 'Light boots that help with footing in rough terrain.',
    goldPrice: 24,
    tier: 1,
    requiredFlags: [],
  },
  {
    offerKey: 'mana_tonic_small',
    itemKey: 'mana_tonic',
    name: 'Mana Tonic',
    description: 'A quick restorative tonic for casters.',
    goldPrice: 18,
    tier: 1,
    requiredFlags: [],
  },
  {
    offerKey: 'steel_sword_advanced',
    itemKey: 'steel_sword',
    name: 'Steel Sword',
    description: 'A sturdier blade forged for deeper tower runs.',
    goldPrice: 78,
    tier: 2,
    requiredFlags: [...BLACKSMITH_TIER_2_UNLOCK_FLAGS],
  },
  {
    offerKey: 'tower_guard_shield',
    itemKey: 'tower_guard_shield',
    name: 'Tower Guard Shield',
    description: 'Reinforced shield for mid-tier tower pressure.',
    goldPrice: 84,
    tier: 2,
    requiredFlags: [...BLACKSMITH_TIER_2_UNLOCK_FLAGS],
  },
  {
    offerKey: 'greater_mana_tonic',
    itemKey: 'greater_mana_tonic',
    name: 'Greater Mana Tonic',
    description: 'Restores more mana for longer encounters.',
    goldPrice: 54,
    tier: 2,
    requiredFlags: [...BLACKSMITH_TIER_2_UNLOCK_FLAGS],
  },
  {
    offerKey: 'mithril_sword_masterwork',
    itemKey: 'mithril_sword',
    name: 'Mithril Sword',
    description: 'A masterwork blade reserved for the deepest tower layers.',
    goldPrice: 132,
    tier: 3,
    requiredFlags: [...BLACKSMITH_TIER_3_UNLOCK_FLAGS],
  },
  {
    offerKey: 'dragon_scale_armor',
    itemKey: 'dragon_scale_armor',
    name: 'Dragon Scale Armor',
    description: 'Heavy armor tempered to withstand elite tower threats.',
    goldPrice: 156,
    tier: 3,
    requiredFlags: [...BLACKSMITH_TIER_3_UNLOCK_FLAGS],
  },
  {
    offerKey: 'elixir_of_vigor',
    itemKey: 'elixir_of_vigor',
    name: 'Elixir of Vigor',
    description: 'A potent restorative for long expeditions and boss fights.',
    goldPrice: 96,
    tier: 3,
    requiredFlags: [...BLACKSMITH_TIER_3_UNLOCK_FLAGS],
  },
];

export const VILLAGE_SEED_OFFERS: VillageSeedOffer[] = [
  {
    offerKey: 'turnip_seed_packet',
    itemKey: 'turnip_seed',
    name: 'Turnip Seeds',
    description: 'Fast-growing seeds ideal for first harvest cycles.',
    goldPrice: 8,
    requiredFlags: [],
  },
  {
    offerKey: 'carrot_seed_packet',
    itemKey: 'carrot_seed',
    name: 'Carrot Seeds',
    description: 'Balanced seeds for steady village demand.',
    goldPrice: 12,
    requiredFlags: [],
  },
  {
    offerKey: 'wheat_seed_packet',
    itemKey: 'wheat_seed',
    name: 'Wheat Seeds',
    description: 'Bulk crop seeds useful for crafting and trade.',
    goldPrice: 15,
    requiredFlags: ['story_floor_5_cleared'],
  },
];

export const VILLAGE_CROP_BUYBACK_OFFERS: VillageCropBuybackOffer[] = [
  {
    itemKey: 'turnip',
    name: 'Turnip',
    description: 'Village staple crop.',
    goldValue: 10,
    requiredFlags: [],
  },
  {
    itemKey: 'carrot',
    name: 'Carrot',
    description: 'Reliable produce for village kitchens.',
    goldValue: 15,
    requiredFlags: [],
  },
  {
    itemKey: 'wheat',
    name: 'Wheat',
    description: 'High-demand grain for reserves and feed.',
    goldValue: 18,
    requiredFlags: ['story_floor_5_cleared'],
  },
];

export const VILLAGE_CROP_SALE_BASE_EXPERIENCE: Record<string, number> = {
  turnip: 2,
  carrot: 3,
  wheat: 4,
};

export type VillageSaleExperienceTier = {
  key: 'farm_bootstrap' | 'watch_support' | 'supply_route' | 'vanguard_supply' | 'act1_war_effort';
  requiredFlags: string[];
  experienceMultiplier: number;
};

export const VILLAGE_SALE_EXPERIENCE_TIERS: VillageSaleExperienceTier[] = [
  {
    key: 'farm_bootstrap',
    requiredFlags: [],
    experienceMultiplier: 1,
  },
  {
    key: 'watch_support',
    requiredFlags: ['story_floor_3_cleared'],
    experienceMultiplier: 1.1,
  },
  {
    key: 'supply_route',
    requiredFlags: ['story_floor_5_cleared'],
    experienceMultiplier: 1.22,
  },
  {
    key: 'vanguard_supply',
    requiredFlags: ['story_floor_8_cleared'],
    experienceMultiplier: 1.36,
  },
  {
    key: 'act1_war_effort',
    requiredFlags: ['story_act_1_complete'],
    experienceMultiplier: 1.5,
  },
];

export function resolveVillageSaleExperienceTier(worldFlags: Set<string>): VillageSaleExperienceTier {
  let resolvedTier = VILLAGE_SALE_EXPERIENCE_TIERS[0];

  for (const tier of VILLAGE_SALE_EXPERIENCE_TIERS) {
    if (tier.requiredFlags.every((flag) => worldFlags.has(flag))) {
      resolvedTier = tier;
    }
  }

  return resolvedTier;
}
