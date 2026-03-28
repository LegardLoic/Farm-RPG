export type CombatStatus = 'active' | 'won' | 'lost' | 'fled';
export type CombatActionName = 'attack' | 'defend' | 'fireball';
export type CombatTurn = 'player' | 'enemy';

export interface CombatUnitState {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  defending: boolean;
}

export interface CombatEnemyDefinition {
  key: string;
  name: string;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
}

export interface CombatEncounterState {
  id: string;
  userId: string;
  enemyKey: string;
  turn: CombatTurn;
  status: CombatStatus;
  round: number;
  logs: string[];
  player: CombatUnitState;
  enemy: CombatEnemyDefinition & { currentHp: number; currentMp: number };
  lastAction: CombatActionName | null;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

export interface CombatEncounterSummary {
  id: string;
  enemyKey: string;
  status: CombatStatus;
  turn: CombatTurn;
  round: number;
  createdAt: string;
  updatedAt: string;
}

export interface CombatEncounterRecord {
  id: string;
  user_id: string;
  enemy_key: string;
  status: CombatStatus;
  state_json: CombatEncounterState;
  created_at: Date | string;
  updated_at: Date | string;
  ended_at: Date | string | null;
}

export interface CombatActionResult {
  encounter: CombatEncounterState;
  summary: CombatEncounterSummary;
}

export interface CombatEncounterSnapshot {
  id: string;
  userId: string;
  status: CombatStatus;
  state: CombatEncounterState;
}
