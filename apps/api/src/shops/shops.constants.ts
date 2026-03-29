import type { BlacksmithOffer } from './shops.types';

export const BLACKSMITH_SHOP_UNLOCK_FLAG = 'blacksmith_shop_tier_1_unlocked';

export const BLACKSMITH_OFFERS: BlacksmithOffer[] = [
  {
    offerKey: 'iron_sword_basic',
    itemKey: 'iron_sword',
    name: 'Iron Sword',
    description: 'Balanced blade for early tower fights.',
    goldPrice: 30,
  },
  {
    offerKey: 'leather_boots_basic',
    itemKey: 'leather_boots',
    name: 'Leather Boots',
    description: 'Light boots that help with footing in rough terrain.',
    goldPrice: 24,
  },
  {
    offerKey: 'mana_tonic_small',
    itemKey: 'mana_tonic',
    name: 'Mana Tonic',
    description: 'A quick restorative tonic for casters.',
    goldPrice: 18,
  },
];
