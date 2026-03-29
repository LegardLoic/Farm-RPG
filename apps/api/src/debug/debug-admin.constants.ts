export const DEBUG_FORCE_COMBAT_ENEMY_FLAG_PREFIX = 'debug_force_combat_enemy';

export const DEBUG_STATE_PRESETS = [
  {
    key: 'village_open',
    towerFloor: 3,
    worldFlags: ['blacksmith_curse_lifted', 'blacksmith_shop_tier_1_unlocked', 'floor_3_cleared'],
  },
  {
    key: 'mid_tower',
    towerFloor: 8,
    worldFlags: [
      'blacksmith_curse_lifted',
      'blacksmith_shop_tier_1_unlocked',
      'story_floor_5_cleared',
      'story_floor_8_cleared',
      'floor_3_cleared',
      'floor_5_cleared',
      'floor_8_cleared',
    ],
  },
  {
    key: 'act1_done',
    towerFloor: 10,
    worldFlags: [
      'blacksmith_curse_lifted',
      'blacksmith_shop_tier_1_unlocked',
      'story_floor_3_cleared',
      'story_floor_5_cleared',
      'story_floor_8_cleared',
      'story_floor_10_cleared',
      'floor_3_cleared',
      'floor_5_cleared',
      'floor_8_cleared',
      'boss_floor_10_defeated',
      'tower_mvp_complete',
    ],
  },
] as const;

export const DEBUG_STATE_PRESET_KEYS = DEBUG_STATE_PRESETS.map((preset) => preset.key);
export const DEBUG_STATE_PRESET_WORLD_FLAG_KEYS = [
  ...new Set(DEBUG_STATE_PRESETS.flatMap((preset) => preset.worldFlags)),
];

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
