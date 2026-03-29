export const DEBUG_FORCE_COMBAT_ENEMY_FLAG_PREFIX = 'debug_force_combat_enemy';

export type DebugForcedCombatStartConfig = {
  enemyKey: string;
  isScriptedBossEncounter: boolean;
};

export function buildDebugForceCombatEnemyFlag(config: DebugForcedCombatStartConfig): string {
  const mode = config.isScriptedBossEncounter ? 'scripted' : 'normal';
  return `${DEBUG_FORCE_COMBAT_ENEMY_FLAG_PREFIX}:${config.enemyKey}:${mode}`;
}

export function parseDebugForceCombatEnemyFlag(flagKey: string): DebugForcedCombatStartConfig | null {
  const prefix = `${DEBUG_FORCE_COMBAT_ENEMY_FLAG_PREFIX}:`;
  if (!flagKey.startsWith(prefix)) {
    return null;
  }

  const raw = flagKey.slice(prefix.length);
  const separatorIndex = raw.lastIndexOf(':');
  if (separatorIndex <= 0) {
    return null;
  }

  const enemyKey = raw.slice(0, separatorIndex).trim();
  const rawMode = raw.slice(separatorIndex + 1).trim();
  if (!enemyKey) {
    return null;
  }

  return {
    enemyKey,
    isScriptedBossEncounter: rawMode === 'scripted',
  };
}
