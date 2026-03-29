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
