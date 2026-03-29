import type { EquipmentSlot } from '../equipment/equipment.constants';

export type DebugLoadoutPresetDefinition = {
  key: string;
  name: string;
  description: string;
  equipment: Array<{
    slot: EquipmentSlot;
    itemKey: string;
  }>;
  inventory: Array<{
    itemKey: string;
    quantity: number;
  }>;
  resources: {
    gold: number;
    experience: number;
  };
};

export const DEBUG_LOADOUT_PRESETS: DebugLoadoutPresetDefinition[] = [
  {
    key: 'starter',
    name: 'Starter Scout',
    description: 'Early run setup for floor 1-3 QA.',
    equipment: [
      { slot: 'main_hand', itemKey: 'iron_sword' },
      { slot: 'off_hand', itemKey: 'scout_badge' },
      { slot: 'boots', itemKey: 'leather_boots' },
      { slot: 'ring_left', itemKey: 'thorn_shard' },
    ],
    inventory: [
      { itemKey: 'healing_herb', quantity: 8 },
      { itemKey: 'mana_tonic', quantity: 4 },
      { itemKey: 'wood_scrap', quantity: 6 },
    ],
    resources: {
      gold: 100,
      experience: 0,
    },
  },
  {
    key: 'tower_mid',
    name: 'Mid Tower Patrol',
    description: 'Balanced setup for floor 5-8 QA and shop loops.',
    equipment: [
      { slot: 'helmet', itemKey: 'warden_ember_plate' },
      { slot: 'chest', itemKey: 'tempered_alloy' },
      { slot: 'boots', itemKey: 'leather_boots' },
      { slot: 'main_hand', itemKey: 'iron_sword' },
      { slot: 'off_hand', itemKey: 'vanguard_insignia' },
      { slot: 'ring_left', itemKey: 'scout_badge' },
      { slot: 'ring_right', itemKey: 'thorn_shard' },
    ],
    inventory: [
      { itemKey: 'healing_herb', quantity: 12 },
      { itemKey: 'mana_tonic', quantity: 8 },
      { itemKey: 'ember_dust', quantity: 10 },
      { itemKey: 'iron_ore', quantity: 8 },
    ],
    resources: {
      gold: 250,
      experience: 150,
    },
  },
  {
    key: 'boss_trial',
    name: 'Boss Trial Kit',
    description: 'Full setup for floor 10 and scripted boss QA.',
    equipment: [
      { slot: 'helmet', itemKey: 'relic_of_unbinding' },
      { slot: 'amulet', itemKey: 'curse_heart_shard' },
      { slot: 'chest', itemKey: 'tempered_alloy' },
      { slot: 'legs', itemKey: 'tempered_alloy' },
      { slot: 'boots', itemKey: 'leather_boots' },
      { slot: 'gloves', itemKey: 'tempered_alloy' },
      { slot: 'ring_left', itemKey: 'scout_badge' },
      { slot: 'ring_right', itemKey: 'vanguard_insignia' },
      { slot: 'main_hand', itemKey: 'iron_sword' },
      { slot: 'off_hand', itemKey: 'curse_heart_shard' },
    ],
    inventory: [
      { itemKey: 'healing_herb', quantity: 20 },
      { itemKey: 'mana_tonic', quantity: 20 },
      { itemKey: 'ember_dust', quantity: 15 },
      { itemKey: 'iron_ore', quantity: 15 },
      { itemKey: 'alpha_thorn_core', quantity: 3 },
    ],
    resources: {
      gold: 500,
      experience: 400,
    },
  },
];

export const DEBUG_LOADOUT_PRESET_KEYS = DEBUG_LOADOUT_PRESETS.map((preset) => preset.key);
