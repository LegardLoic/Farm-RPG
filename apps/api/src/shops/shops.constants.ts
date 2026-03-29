import type { BlacksmithOffer } from './shops.types';

export const BLACKSMITH_SHOP_UNLOCK_FLAG = 'blacksmith_shop_tier_1_unlocked';
export const BLACKSMITH_TIER_2_UNLOCK_FLAGS = ['story_floor_5_cleared'] as const;

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
];
