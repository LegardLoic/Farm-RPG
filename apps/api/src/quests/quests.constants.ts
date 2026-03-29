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
];
