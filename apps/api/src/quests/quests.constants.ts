import type { QuestDefinition } from './quests.types';

export const QUEST_STATES_TABLE = 'quest_states';

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    key: 'first_steps',
    title: 'First Steps In The Tower',
    description: 'Win your first battle to prove the village can still resist.',
    objectives: [
      {
        key: 'victory_1',
        description: 'Win 1 combat',
        metric: 'victories_total',
        target: 1,
      },
    ],
    rewards: {
      experience: 20,
      gold: 25,
      items: [
        {
          itemKey: 'healing_herb',
          quantity: 2,
        },
      ],
      flags: ['notice_board_unlocked'],
    },
  },
  {
    key: 'blacksmith_rescue',
    title: 'Lift The Blacksmith Curse',
    description: 'Defeat enough tower threats to weaken the curse on the blacksmith.',
    objectives: [
      {
        key: 'victory_5',
        description: 'Win 5 combats',
        metric: 'victories_total',
        target: 5,
      },
      {
        key: 'goblin_hunt_3',
        description: 'Defeat 3 Forest Goblins',
        metric: 'enemy_victories',
        target: 3,
        enemyKey: 'forest_goblin',
      },
    ],
    rewards: {
      experience: 60,
      gold: 45,
      items: [
        {
          itemKey: 'iron_ore',
          quantity: 3,
        },
      ],
      flags: ['blacksmith_curse_lifted', 'blacksmith_shop_tier_1_unlocked'],
    },
  },
  {
    key: 'farm_first_harvest',
    title: 'Fresh Soil, First Harvest',
    description: 'Harvest your first crop from the new farm and prove it can sustain the village.',
    objectives: [
      {
        key: 'harvest_1_crop',
        description: 'Harvest 1 crop',
        metric: 'farm_harvest_total',
        target: 1,
      },
    ],
    rewards: {
      experience: 18,
      gold: 20,
      items: [
        {
          itemKey: 'turnip_seed',
          quantity: 2,
        },
      ],
      flags: [],
    },
  },
  {
    key: 'turnip_delivery_request',
    title: 'Merchant Turnip Request',
    description: 'Deliver turnips to the village market to reopen local trade routes.',
    objectives: [
      {
        key: 'deliver_turnip_3',
        description: 'Deliver 3 turnips to the village market',
        metric: 'village_delivery_crop',
        target: 3,
        cropKey: 'turnip',
      },
    ],
    rewards: {
      experience: 28,
      gold: 35,
      items: [
        {
          itemKey: 'carrot_seed',
          quantity: 2,
        },
      ],
      flags: ['village_trade_reopened'],
    },
  },
  {
    key: 'granary_restock',
    title: 'Granary Restock',
    description: 'Build a stable food flow by harvesting and delivering enough crops to the village.',
    objectives: [
      {
        key: 'harvest_8_crops',
        description: 'Harvest 8 crops',
        metric: 'farm_harvest_total',
        target: 8,
      },
      {
        key: 'deliver_5_crops',
        description: 'Deliver 5 crops to the village market',
        metric: 'village_delivery_total',
        target: 5,
      },
    ],
    rewards: {
      experience: 55,
      gold: 60,
      items: [
        {
          itemKey: 'wheat_seed',
          quantity: 2,
        },
        {
          itemKey: 'healing_herb',
          quantity: 1,
        },
      ],
      flags: ['village_supply_line_stable'],
    },
  },
  {
    key: 'village_mayor_briefing',
    title: 'Mayor Briefing',
    description:
      'Debrief with the mayor after your first field runs so the village watch can adapt patrol routes.',
    objectives: [
      {
        key: 'talk_mayor_1',
        description: 'Talk to the mayor 1 time',
        metric: 'village_npc_interaction_npc',
        target: 1,
        npcKey: 'mayor',
      },
      {
        key: 'friendship_mayor_3',
        description: 'Reach friendship 3 with the mayor',
        metric: 'village_npc_friendship_npc',
        target: 3,
        npcKey: 'mayor',
      },
    ],
    rewards: {
      experience: 24,
      gold: 26,
      items: [
        {
          itemKey: 'healing_herb',
          quantity: 1,
        },
      ],
      flags: ['village_mayor_briefing_done'],
    },
  },
  {
    key: 'blacksmith_forge_update',
    title: 'Forge Status Update',
    description:
      'Check in with the blacksmith as soon as the curse weakens and gather actionable forge requests.',
    objectives: [
      {
        key: 'talk_blacksmith_2',
        description: 'Talk to the blacksmith 2 times',
        metric: 'village_npc_interaction_npc',
        target: 2,
        npcKey: 'blacksmith',
      },
      {
        key: 'friendship_blacksmith_4',
        description: 'Reach friendship 4 with the blacksmith',
        metric: 'village_npc_friendship_npc',
        target: 4,
        npcKey: 'blacksmith',
      },
    ],
    rewards: {
      experience: 34,
      gold: 38,
      items: [
        {
          itemKey: 'iron_ore',
          quantity: 2,
        },
      ],
      flags: ['village_forge_update_done'],
    },
  },
  {
    key: 'merchant_route_sync',
    title: 'Merchant Route Sync',
    description:
      'Coordinate with the merchant to sync crop deliveries and tower supply movement once trade routes open.',
    objectives: [
      {
        key: 'talk_merchant_2',
        description: 'Talk to the merchant 2 times',
        metric: 'village_npc_interaction_npc',
        target: 2,
        npcKey: 'merchant',
      },
      {
        key: 'npc_talks_6_total',
        description: 'Reach 6 total village NPC interactions',
        metric: 'village_npc_interaction_total',
        target: 6,
      },
    ],
    rewards: {
      experience: 48,
      gold: 46,
      items: [
        {
          itemKey: 'carrot_seed',
          quantity: 2,
        },
      ],
      flags: ['village_merchant_route_sync_done'],
    },
  },
  {
    key: 'story_floor_3',
    title: 'Smoke Above The Fields',
    description: 'Reach floor 3 of the tower and report the first signs of corruption.',
    objectives: [
      {
        key: 'reach_floor_3',
        description: 'Reach tower floor 3',
        metric: 'tower_highest_floor',
        target: 3,
      },
    ],
    rewards: {
      experience: 45,
      gold: 35,
      items: [
        {
          itemKey: 'healing_herb',
          quantity: 2,
        },
      ],
      flags: ['story_floor_3_cleared'],
    },
  },
  {
    key: 'story_floor_5',
    title: 'Bell Of The Village',
    description: 'Reach floor 5 to secure the route back to the village watch.',
    objectives: [
      {
        key: 'reach_floor_5',
        description: 'Reach tower floor 5',
        metric: 'tower_highest_floor',
        target: 5,
      },
    ],
    rewards: {
      experience: 75,
      gold: 55,
      items: [
        {
          itemKey: 'iron_ore',
          quantity: 2,
        },
      ],
      flags: ['story_floor_5_cleared'],
    },
  },
  {
    key: 'story_floor_8',
    title: 'Ashen Vanguard',
    description: 'Reach floor 8 where the Ash scouts start organizing deeper defenses.',
    objectives: [
      {
        key: 'reach_floor_8',
        description: 'Reach tower floor 8',
        metric: 'tower_highest_floor',
        target: 8,
      },
    ],
    rewards: {
      experience: 110,
      gold: 90,
      items: [
        {
          itemKey: 'ember_dust',
          quantity: 3,
        },
      ],
      flags: ['story_floor_8_cleared'],
    },
  },
  {
    key: 'story_floor_10',
    title: 'Heart Of The Curse',
    description: 'Reach floor 10 and break the first major knot of the tower curse.',
    objectives: [
      {
        key: 'reach_floor_10',
        description: 'Reach tower floor 10',
        metric: 'tower_highest_floor',
        target: 10,
      },
    ],
    rewards: {
      experience: 180,
      gold: 140,
      items: [
        {
          itemKey: 'scout_badge',
          quantity: 1,
        },
        {
          itemKey: 'mana_tonic',
          quantity: 2,
        },
      ],
      flags: ['story_act_1_complete'],
    },
  },
];
