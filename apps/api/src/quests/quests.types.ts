export type QuestStatus = 'active' | 'completed' | 'claimed';

export interface QuestProgressState {
  victoriesTotal: number;
  enemyVictories: Record<string, number>;
  towerHighestFloor: number;
  cropsHarvestedTotal: number;
  harvestedCrops: Record<string, number>;
  cropsDeliveredTotal: number;
  deliveredCrops: Record<string, number>;
  npcInteractionsTotal: number;
  interactedNpcs: Record<string, number>;
  npcFriendshipLevels: Record<string, number>;
  lastVictoryAt: string | null;
  completedAt: string | null;
  claimedAt: string | null;
}

export interface QuestObjectiveDefinition {
  key: string;
  description: string;
  metric:
    | 'victories_total'
    | 'enemy_victories'
    | 'tower_highest_floor'
    | 'farm_harvest_total'
    | 'farm_harvest_crop'
    | 'village_delivery_total'
    | 'village_delivery_crop'
    | 'village_npc_interaction_total'
    | 'village_npc_interaction_npc'
    | 'village_npc_friendship_npc';
  target: number;
  enemyKey?: string;
  cropKey?: string;
  npcKey?: 'mayor' | 'blacksmith' | 'merchant';
}

export interface QuestRewardDefinition {
  experience: number;
  gold: number;
  items: Array<{
    itemKey: string;
    quantity: number;
  }>;
  flags: string[];
}

export interface QuestDefinition {
  key: string;
  title: string;
  description: string;
  objectives: QuestObjectiveDefinition[];
  rewards: QuestRewardDefinition;
}

export interface QuestObjectiveView {
  key: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface QuestView {
  key: string;
  title: string;
  description: string;
  status: QuestStatus;
  canClaim: boolean;
  objectives: QuestObjectiveView[];
  rewards: QuestRewardDefinition;
}
