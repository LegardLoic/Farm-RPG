export type QuestStatus = 'active' | 'completed' | 'claimed';

export interface QuestProgressState {
  victoriesTotal: number;
  enemyVictories: Record<string, number>;
  lastVictoryAt: string | null;
  completedAt: string | null;
  claimedAt: string | null;
}

export interface QuestObjectiveDefinition {
  key: string;
  description: string;
  metric: 'victories_total' | 'enemy_victories';
  target: number;
  enemyKey?: string;
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
