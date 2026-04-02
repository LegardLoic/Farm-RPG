import type {
  CombatDebugReference,
  CombatEncounterState,
  CombatUiStatus,
  DebugQaRecapOutcomeFilter,
  DebugQaReplayAutoPlaySpeedKey,
  HudState,
  ImportedDebugQaTrace,
  QuestStatus,
} from '../../gameScene.stateTypes';

export type DebugQaReplayAutoPlaySpeedOption = {
  key: DebugQaReplayAutoPlaySpeedKey;
  label: string;
  intervalMs: number;
};

export type DebugQaValueParsers = {
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asStringArray: (value: unknown) => string[];
  asNumber: (value: unknown) => number | null;
  asCombatUiStatus: (value: unknown) => CombatUiStatus | null;
};

export function normalizeDebugQaFilterQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function isDebugQaQueryMatch(query: string, values: Array<string | null | undefined>): boolean {
  if (!query) {
    return true;
  }

  return values.some((value) => (value ?? '').toLowerCase().includes(query));
}

export function doesCombatStateMatchRecapFilters(
  snapshot: CombatEncounterState | null,
  recapOutcomeFilter: DebugQaRecapOutcomeFilter,
  recapEnemyFilter: string,
): boolean {
  if (!snapshot) {
    return false;
  }

  if (recapOutcomeFilter !== 'all' && snapshot.status !== recapOutcomeFilter) {
    return false;
  }

  const enemyQuery = normalizeDebugQaFilterQuery(recapEnemyFilter);
  if (!enemyQuery) {
    return true;
  }

  return isDebugQaQueryMatch(enemyQuery, [snapshot.enemy.key, snapshot.enemy.name]);
}

export function filterCombatDebugReference(
  reference: CombatDebugReference,
  scriptEnemyFilter: string,
  scriptIntentFilter: string,
): CombatDebugReference {
  const enemyQuery = normalizeDebugQaFilterQuery(scriptEnemyFilter);
  const intentQuery = normalizeDebugQaFilterQuery(scriptIntentFilter);
  if (!enemyQuery && !intentQuery) {
    return reference;
  }

  const scriptedIntents = reference.scriptedIntents
    .filter((enemy) => isDebugQaQueryMatch(enemyQuery, [enemy.enemyKey, enemy.enemyName]))
    .map((enemy) => {
      const filteredIntents = enemy.intents.filter((intent) =>
        isDebugQaQueryMatch(intentQuery, [intent.key, intent.label, intent.trigger]),
      );
      return {
        ...enemy,
        intents: filteredIntents,
      };
    })
    .filter((enemy) => intentQuery.length === 0 || enemy.intents.length > 0);

  const allowedEnemyKeys = new Set(scriptedIntents.map((enemy) => enemy.enemyKey));
  const scriptedFloors = reference.scriptedFloors.filter((floor) => allowedEnemyKeys.has(floor.enemyKey));
  const enemies = reference.enemies.filter((enemy) => allowedEnemyKeys.has(enemy.key));

  return {
    playerSkills: reference.playerSkills,
    enemies,
    scriptedFloors,
    scriptedIntents,
  };
}

export function formatCombatDebugScriptedIntentsReference(reference: CombatDebugReference): string {
  const lines: string[] = [];

  lines.push(`Player skills (${reference.playerSkills.length})`);
  for (const skill of reference.playerSkills) {
    lines.push(
      `- ${skill.label} [${skill.key}] | mana ${skill.manaCost} | obscurite ${skill.blockedBySilence ? 'blocked' : 'open'}`,
    );
    lines.push(`  ${skill.description}`);
  }

  lines.push('');
  lines.push(`Scripted floors (${reference.scriptedFloors.length})`);
  for (const floor of reference.scriptedFloors) {
    lines.push(`- Floor ${floor.floor}: ${floor.enemyName} [${floor.enemyKey}] | boss ${floor.scriptedBossEncounter ? 'yes' : 'no'}`);
  }

  lines.push('');
  lines.push(`Enemy intent scripts (${reference.scriptedIntents.length})`);
  for (const enemy of reference.scriptedIntents) {
    lines.push(
      `- ${enemy.enemyName} [${enemy.enemyKey}] | floor ${enemy.scriptedFloor ?? 'n/a'} | boss ${enemy.scriptedBossEncounter ? 'yes' : 'no'}`,
    );
    for (const intent of enemy.intents) {
      lines.push(`  * ${intent.label} [${intent.key}] | interruptible ${intent.interruptible ? 'yes' : 'no'} | ${intent.trigger}`);
    }
  }

  return lines.join('\n');
}

export function getDebugQaScriptedIntentsDisplayText(
  debugQaScriptedIntentsReference: CombatDebugReference | null,
  debugQaScriptedIntentsText: string,
  scriptEnemyFilter: string,
  scriptIntentFilter: string,
): string {
  if (!debugQaScriptedIntentsReference) {
    return debugQaScriptedIntentsText;
  }

  const filteredReference = filterCombatDebugReference(
    debugQaScriptedIntentsReference,
    scriptEnemyFilter,
    scriptIntentFilter,
  );
  const enemyFilterLabel = scriptEnemyFilter.trim() || '-';
  const intentFilterLabel = scriptIntentFilter.trim() || '-';
  return [
    `Filters => enemy: "${enemyFilterLabel}" | intent: "${intentFilterLabel}"`,
    '',
    formatCombatDebugScriptedIntentsReference(filteredReference),
  ].join('\n');
}

export function getDebugQaReplayAutoPlayIntervalMs(
  speed: DebugQaReplayAutoPlaySpeedKey,
  options: DebugQaReplayAutoPlaySpeedOption[],
): number {
  const option = options.find((entry) => entry.key === speed);
  return option?.intervalMs ?? 900;
}

export function getDebugQaReplayAutoPlaySpeedLabel(
  speed: DebugQaReplayAutoPlaySpeedKey,
  options: DebugQaReplayAutoPlaySpeedOption[],
): string {
  const option = options.find((entry) => entry.key === speed);
  return option?.label ?? 'Normal (900ms)';
}

export function parseImportedDebugQaTrace(
  rawPayload: unknown,
  sourceFile: string,
  options: {
    parsers: DebugQaValueParsers;
    normalizeCombatPayload: (value: unknown) => CombatEncounterState | null;
  },
): ImportedDebugQaTrace | null {
  const { parsers, normalizeCombatPayload } = options;
  if (!parsers.asRecord(rawPayload)) {
    return null;
  }

  const root = parsers.asRecord(rawPayload);
  if (!root) {
    return null;
  }

  const timestamp = parsers.asString(root.timestamp) ?? new Date().toISOString();
  const authRecord = parsers.asRecord(root.auth);
  const hudRecord = parsers.asRecord(root.hud);
  const hudStateRecord = parsers.asRecord(hudRecord?.state);
  const combatRecord = parsers.asRecord(root.combat);

  const authAuthenticatedValue = authRecord?.authenticated;
  const authAuthenticated = typeof authAuthenticatedValue === 'boolean' ? authAuthenticatedValue : null;
  const authStatus = parsers.asString(authRecord?.status);
  const hudState = normalizeImportedHudState(hudStateRecord, parsers);
  const combatState = normalizeCombatPayload(combatRecord?.state ?? null);
  const combatEncounterId = parsers.asString(combatRecord?.encounterId) ?? combatState?.id ?? null;
  const combatStatus = parsers.asCombatUiStatus(combatRecord?.status) ?? (combatState?.status ?? null);
  const combatMessage = parsers.asString(combatRecord?.message);
  const combatError = parsers.asString(combatRecord?.error);
  const combatLogs = parsers.asStringArray(combatRecord?.logs).slice(-20);

  const hasUsefulData =
    authAuthenticated !== null ||
    authStatus !== null ||
    Object.keys(hudState).length > 0 ||
    combatState !== null ||
    combatStatus !== null ||
    combatEncounterId !== null ||
    combatMessage !== null ||
    combatError !== null ||
    combatLogs.length > 0;

  if (!hasUsefulData) {
    return null;
  }

  return {
    sourceFile,
    timestamp,
    authAuthenticated,
    authStatus,
    hudState,
    combatEncounterId,
    combatStatus,
    combatMessage,
    combatError,
    combatLogs,
    combatState,
  };
}

export function normalizeImportedHudState(
  rawState: Record<string, unknown> | null,
  parsers: Pick<DebugQaValueParsers, 'asNumber' | 'asString'>,
): Partial<HudState> {
  if (!rawState) {
    return {};
  }

  const normalized: Partial<HudState> = {};
  const day = parsers.asNumber(rawState.day);
  const gold = parsers.asNumber(rawState.gold);
  const level = parsers.asNumber(rawState.level);
  const xp = parsers.asNumber(rawState.xp);
  const xpToNext = parsers.asNumber(rawState.xpToNext);
  const towerCurrentFloor = parsers.asNumber(rawState.towerCurrentFloor);
  const towerHighestFloor = parsers.asNumber(rawState.towerHighestFloor);
  const hp = parsers.asNumber(rawState.hp);
  const maxHp = parsers.asNumber(rawState.maxHp);
  const mp = parsers.asNumber(rawState.mp);
  const maxMp = parsers.asNumber(rawState.maxMp);
  const stamina = parsers.asNumber(rawState.stamina);
  const area = parsers.asString(rawState.area);

  if (day !== null) {
    normalized.day = Math.max(1, Math.round(day));
  }
  if (gold !== null) {
    normalized.gold = Math.max(0, Math.round(gold));
  }
  if (level !== null) {
    normalized.level = Math.max(1, Math.round(level));
  }
  if (xp !== null) {
    normalized.xp = Math.max(0, Math.round(xp));
  }
  if (xpToNext !== null) {
    normalized.xpToNext = Math.max(1, Math.round(xpToNext));
  }
  if (towerCurrentFloor !== null) {
    normalized.towerCurrentFloor = Math.max(1, Math.round(towerCurrentFloor));
  }
  if (towerHighestFloor !== null) {
    normalized.towerHighestFloor = Math.max(1, Math.round(towerHighestFloor));
  }
  if (typeof rawState.towerBossFloor10Defeated === 'boolean') {
    normalized.towerBossFloor10Defeated = rawState.towerBossFloor10Defeated;
  }
  if (typeof rawState.blacksmithUnlocked === 'boolean') {
    normalized.blacksmithUnlocked = rawState.blacksmithUnlocked;
  }
  if (typeof rawState.blacksmithCurseLifted === 'boolean') {
    normalized.blacksmithCurseLifted = rawState.blacksmithCurseLifted;
  }
  if (hp !== null) {
    normalized.hp = Math.max(0, hp);
  }
  if (maxHp !== null) {
    normalized.maxHp = Math.max(1, maxHp);
  }
  if (mp !== null) {
    normalized.mp = Math.max(0, mp);
  }
  if (maxMp !== null) {
    normalized.maxMp = Math.max(1, maxMp);
  }
  if (stamina !== null) {
    normalized.stamina = Math.max(0, stamina);
  }
  if (area) {
    normalized.area = area;
  }

  return normalized;
}

export function formatDebugQaFlagPreview(flags: string[]): string {
  if (flags.length === 0) {
    return 'none';
  }

  const preview = flags.slice(0, 3).join(', ');
  if (flags.length <= 3) {
    return preview;
  }

  return `${preview}, ...`;
}

export function formatApplyStatePresetSuccess(
  payload: unknown,
  parsers: Pick<DebugQaValueParsers, 'asRecord' | 'asString' | 'asStringArray' | 'asNumber'>,
): string | null {
  const root = parsers.asRecord(payload);
  const statePreset = parsers.asRecord(root?.statePreset);
  const preset = parsers.asRecord(statePreset?.preset);
  const tower = parsers.asRecord(statePreset?.tower);
  const towerBefore = parsers.asRecord(tower?.before);
  const towerAfter = parsers.asRecord(tower?.after);
  const worldFlags = parsers.asRecord(statePreset?.worldFlags);

  const presetKey = parsers.asString(preset?.key);
  const floorBefore = parsers.asNumber(towerBefore?.currentFloor);
  const floorAfter = parsers.asNumber(towerAfter?.currentFloor);
  const addedFlags = parsers.asStringArray(worldFlags?.added);
  const removedFlags = parsers.asStringArray(worldFlags?.removed);

  if (!presetKey || floorBefore === null || floorAfter === null) {
    return null;
  }

  const addedPreview = formatDebugQaFlagPreview(addedFlags);
  const removedPreview = formatDebugQaFlagPreview(removedFlags);
  return `Preset ${presetKey}: floor ${Math.round(floorBefore)} -> ${Math.round(floorAfter)} | +${addedFlags.length} (${addedPreview}) / -${removedFlags.length} (${removedPreview})`;
}

export function formatSetWorldFlagsSuccess(
  payload: unknown,
  parsers: Pick<DebugQaValueParsers, 'asRecord' | 'asStringArray'>,
): string | null {
  const root = parsers.asRecord(payload);
  const worldFlags = parsers.asRecord(root?.worldFlags);
  const addedFlags = parsers.asStringArray(worldFlags?.added);
  const removedFlags = parsers.asStringArray(worldFlags?.removed);
  const afterFlags = parsers.asStringArray(worldFlags?.after);

  if (!worldFlags) {
    return null;
  }

  const addedPreview = formatDebugQaFlagPreview(addedFlags);
  const removedPreview = formatDebugQaFlagPreview(removedFlags);
  return `World flags updated: total ${afterFlags.length} | +${addedFlags.length} (${addedPreview}) / -${removedFlags.length} (${removedPreview})`;
}

export function formatSetQuestStatusSuccess(
  payload: unknown,
  parsers: Pick<DebugQaValueParsers, 'asRecord' | 'asString'>,
): string | null {
  const root = parsers.asRecord(payload);
  const quest = parsers.asRecord(root?.quest);

  const questKey = parsers.asString(quest?.questKey);
  const previousStatus = parsers.asString(quest?.previousStatus);
  const nextStatus = parsers.asString(quest?.nextStatus);
  if (!questKey || !previousStatus || !nextStatus) {
    return null;
  }

  return `Quest ${questKey}: ${previousStatus} -> ${nextStatus}`;
}

export function readDebugQaNumber(
  input: HTMLInputElement | null,
  fallback: number,
  min?: number,
  max?: number,
): number {
  const raw = input?.value?.trim();
  const parsed = raw ? Number(raw) : fallback;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const rounded = Math.round(parsed);
  if (typeof min === 'number' && rounded < min) {
    return min;
  }
  if (typeof max === 'number' && rounded > max) {
    return max;
  }

  return Math.max(0, rounded);
}

export function isQuestStatusValue(value: string): value is QuestStatus {
  return value === 'active' || value === 'completed' || value === 'claimed';
}

export function readDebugQaFlagList(input: HTMLTextAreaElement | null): string[] {
  const raw = input?.value ?? '';
  if (!raw.trim()) {
    return [];
  }

  const values = raw
    .split(/[\n,;]+/g)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);

  return [...new Set(values)];
}

