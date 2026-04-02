import type { CombatStatus, CombatTurn, CombatUiStatus, QuestStatus } from '../gameScene.stateTypes';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim());
}

export function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function asCombatStatus(value: unknown): CombatStatus | null {
  if (value === 'active' || value === 'won' || value === 'lost' || value === 'fled') {
    return value;
  }

  return null;
}

export function asCombatUiStatus(value: unknown): CombatUiStatus | null {
  if (value === 'idle' || value === 'loading' || value === 'error') {
    return value;
  }

  return asCombatStatus(value);
}

export function asQuestStatus(value: unknown): QuestStatus | null {
  if (value === 'active' || value === 'completed' || value === 'claimed') {
    return value;
  }

  return null;
}

export function asCombatTurn(value: unknown): CombatTurn | null {
  if (value === 'player' || value === 'enemy') {
    return value;
  }

  return null;
}

