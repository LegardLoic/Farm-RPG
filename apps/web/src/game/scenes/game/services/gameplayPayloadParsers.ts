export type GameplayPayloadParsers<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
> = {
  isRecord: (value: unknown) => value is Record<string, unknown>;
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asStringArray: (value: unknown) => string[];
  asNumber: (value: unknown) => number | null;
  asCombatStatus: (value: unknown) => TCombatStatus | null;
  asQuestStatus: (value: unknown) => TQuestStatus | null;
  asCombatTurn: (value: unknown) => TCombatTurn | null;
};

export type ParsedQuestObjectiveState = {
  key: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
};

export type ParsedQuestState<TQuestStatus extends string> = {
  key: string;
  title: string;
  description: string;
  status: TQuestStatus;
  canClaim: boolean;
  objectives: ParsedQuestObjectiveState[];
};

export type ParsedAutoSaveState = {
  version: number;
  reason: string;
  updatedAt: string;
};

export type ParsedSaveSlotPreviewState = {
  playerLevel: number | null;
  gold: number | null;
  towerCurrentFloor: number | null;
  towerHighestFloor: number | null;
  inventoryTop: Array<{ itemKey: string; quantity: number }>;
  equipmentTop: Array<{ slot: string; itemKey: string }>;
  equippedCount: number;
};

export type ParsedSaveSlotState = {
  slot: number;
  exists: boolean;
  version: number | null;
  label: string | null;
  updatedAt: string | null;
  preview: ParsedSaveSlotPreviewState | null;
};

export type ParsedHeroProfileState<THeroAppearanceKey extends string> = {
  heroName: string;
  appearanceKey: THeroAppearanceKey;
  createdAt: string;
  updatedAt: string;
};

export type ParsedCombatUnitState = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
  defending: boolean;
};

export type ParsedCombatEnemyState = {
  key: string;
  name: string;
  hp: number;
  mp: number;
  currentHp: number;
  currentMp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  speed: number;
};

export type ParsedCombatRewardItemState = {
  itemKey: string;
  quantity: number;
  rarity: string;
  source: string;
};

export type ParsedCombatRewardSummaryState = {
  experience: number;
  gold: number;
  items: ParsedCombatRewardItemState[];
  levelBefore: number;
  levelAfter: number;
};

export type ParsedCombatDefeatPenaltyState = {
  goldLossPercent: number;
  goldLost: number;
  itemsLost: Array<{ itemKey: string; quantity: number }>;
  respawnZone: string;
  respawnDay: number;
  playerHpAfterDefeat: number;
};

export type ParsedCombatEncounterRecapState<TCombatStatus extends string> = {
  outcome: TCombatStatus;
  rounds: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  mpSpent: number;
  mpRecovered: number;
  poisonApplied: number;
  ceciteApplied: number;
  obscuriteApplied: number;
  debuffsCleansed: number;
  blindMisses: number;
  rewards: {
    experience: number;
    gold: number;
    lootItems: number;
  };
  penalties: {
    goldLost: number;
    itemsLost: number;
  };
};

export type ParsedCombatEncounterState<TCombatStatus extends string, TCombatTurn extends string> = {
  id: string;
  status: TCombatStatus;
  turn: TCombatTurn;
  round: number;
  logs: string[];
  scriptState?: Record<string, boolean | number | string>;
  player: ParsedCombatUnitState;
  enemy: ParsedCombatEnemyState;
  lastAction: string | null;
  rewards?: ParsedCombatRewardSummaryState | null;
  defeatPenalty?: ParsedCombatDefeatPenaltyState | null;
  recap?: ParsedCombatEncounterRecapState<TCombatStatus> | null;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  endedAt: string | null | undefined;
};

export function parseQuestsPayload<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  payload: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedQuestState<TQuestStatus>[] {
  if (!parsers.isRecord(payload)) {
    return [];
  }

  const rawQuests = payload.quests;
  if (!Array.isArray(rawQuests)) {
    return [];
  }

  return rawQuests
    .map((entry) => parseQuestState(entry, parsers))
    .filter((entry): entry is ParsedQuestState<TQuestStatus> => entry !== null);
}

export function parseSaveSlotsPayload<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  payload: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedSaveSlotState[] {
  if (!parsers.isRecord(payload)) {
    return [];
  }

  const rawSlots = payload.slots;
  if (!Array.isArray(rawSlots)) {
    return [];
  }

  return rawSlots
    .map((entry) => parseSaveSlot(entry, parsers))
    .filter((entry): entry is ParsedSaveSlotState => entry !== null)
    .sort((left, right) => left.slot - right.slot);
}

export function parseAutoSavePayload<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  payload: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedAutoSaveState | null {
  if (!parsers.isRecord(payload)) {
    return null;
  }

  const autosave = parsers.asRecord(payload.autosave);
  if (!autosave) {
    return null;
  }

  const version = parsers.asNumber(autosave.version);
  const reason = parsers.asString(autosave.reason);
  const updatedAt = parsers.asString(autosave.updatedAt);

  if (version === null || !reason || !updatedAt) {
    return null;
  }

  return {
    version: Math.max(1, Math.round(version)),
    reason,
    updatedAt,
  };
}

export function parseHeroProfilePayload<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
  THeroAppearanceKey extends string,
>(
  payload: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
  isHeroAppearanceKey: (value: string) => value is THeroAppearanceKey,
): ParsedHeroProfileState<THeroAppearanceKey> | null {
  if (!parsers.isRecord(payload)) {
    return null;
  }

  const profile = parsers.asRecord(payload.profile);
  if (!profile) {
    return null;
  }

  const heroName = parsers.asString(profile.heroName);
  const appearanceValue = parsers.asString(profile.appearanceKey);
  const createdAt = parsers.asString(profile.createdAt);
  const updatedAt = parsers.asString(profile.updatedAt);

  if (!heroName || !appearanceValue || !createdAt || !updatedAt || !isHeroAppearanceKey(appearanceValue)) {
    return null;
  }

  return {
    heroName,
    appearanceKey: appearanceValue,
    createdAt,
    updatedAt,
  };
}

export function parseSaveSlotPreviewPayload<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  payload: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedSaveSlotPreviewState | null {
  if (!parsers.isRecord(payload)) {
    return null;
  }

  const save = parsers.asRecord(payload.save);
  if (!save) {
    return null;
  }

  const snapshot = parsers.asRecord(save.snapshot);
  if (!snapshot) {
    return null;
  }

  return parseSaveSlotPreview(snapshot, parsers);
}

export function parseCombatPayload<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  payload: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
  fallbackCombatStatus: TCombatStatus,
): ParsedCombatEncounterState<TCombatStatus, TCombatTurn> | null {
  if (!parsers.isRecord(payload)) {
    return null;
  }

  const directEncounter = extractCombatStateCandidate(payload.encounter, parsers, fallbackCombatStatus);
  if (directEncounter) {
    return directEncounter;
  }

  const nestedState = extractCombatStateCandidate(payload.state, parsers, fallbackCombatStatus);
  if (nestedState) {
    return nestedState;
  }

  const dataState = extractCombatStateCandidate(payload.data, parsers, fallbackCombatStatus);
  if (dataState) {
    return dataState;
  }

  return parseCombatState(payload, parsers, fallbackCombatStatus);
}

function parseSaveSlot<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedSaveSlotState | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const slotValue = parsers.asNumber(value.slot);
  if (slotValue === null) {
    return null;
  }

  const slot = Math.round(slotValue);
  if (slot < 1 || slot > 3) {
    return null;
  }

  const exists = Boolean(value.exists);
  const versionValue = parsers.asNumber(value.version);
  const version = exists && versionValue !== null ? Math.max(1, Math.round(versionValue)) : null;
  const label = parsers.asString(value.label);
  const updatedAt = parsers.asString(value.updatedAt);

  return {
    slot,
    exists,
    version,
    label,
    updatedAt,
    preview: null,
  };
}

function parseSaveSlotPreview<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  snapshot: Record<string, unknown>,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedSaveSlotPreviewState | null {
  const player = parsers.asRecord(snapshot.player);
  const tower = parsers.asRecord(snapshot.tower);

  if (!player && !tower && !Array.isArray(snapshot.inventory) && !Array.isArray(snapshot.equipment)) {
    return null;
  }

  const levelValue = player ? parsers.asNumber(player.level) : null;
  const goldValue = player ? parsers.asNumber(player.gold) : null;
  const floorCurrentValue = tower ? parsers.asNumber(tower.currentFloor) : null;
  const floorHighestValue = tower ? parsers.asNumber(tower.highestFloor) : null;

  const rawInventory = Array.isArray(snapshot.inventory) ? snapshot.inventory : [];
  const inventory = rawInventory
    .map((entry) => parseSaveSlotPreviewInventoryItem(entry, parsers))
    .filter((entry): entry is { itemKey: string; quantity: number } => entry !== null)
    .sort((left, right) => right.quantity - left.quantity || left.itemKey.localeCompare(right.itemKey));

  const rawEquipment = Array.isArray(snapshot.equipment) ? snapshot.equipment : [];
  const equipment = rawEquipment
    .map((entry) => parseSaveSlotPreviewEquipmentItem(entry, parsers))
    .filter((entry): entry is { slot: string; itemKey: string } => entry !== null)
    .sort((left, right) => left.slot.localeCompare(right.slot));

  return {
    playerLevel: levelValue !== null ? Math.max(1, Math.round(levelValue)) : null,
    gold: goldValue !== null ? Math.max(0, Math.round(goldValue)) : null,
    towerCurrentFloor: floorCurrentValue !== null ? Math.max(1, Math.round(floorCurrentValue)) : null,
    towerHighestFloor: floorHighestValue !== null ? Math.max(1, Math.round(floorHighestValue)) : null,
    inventoryTop: inventory.slice(0, 3),
    equipmentTop: equipment.slice(0, 3),
    equippedCount: equipment.length,
  };
}

function parseSaveSlotPreviewInventoryItem<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): { itemKey: string; quantity: number } | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const itemKey = parsers.asString(value.itemKey);
  const quantity = parsers.asNumber(value.quantity);
  if (!itemKey || quantity === null) {
    return null;
  }

  const roundedQuantity = Math.round(quantity);
  if (roundedQuantity <= 0) {
    return null;
  }

  return {
    itemKey,
    quantity: roundedQuantity,
  };
}

function parseSaveSlotPreviewEquipmentItem<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): { slot: string; itemKey: string } | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const slot = parsers.asString(value.slot);
  const itemKey = parsers.asString(value.itemKey);
  if (!slot || !itemKey) {
    return null;
  }

  return {
    slot,
    itemKey,
  };
}

function parseQuestState<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedQuestState<TQuestStatus> | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const key = parsers.asString(value.key);
  const title = parsers.asString(value.title);
  const description = parsers.asString(value.description);
  const status = parsers.asQuestStatus(value.status);
  const rawObjectives = value.objectives;

  if (!key || !title || !description || !status || !Array.isArray(rawObjectives)) {
    return null;
  }

  const objectives = rawObjectives
    .map((objective) => parseQuestObjective(objective, parsers))
    .filter((objective): objective is ParsedQuestObjectiveState => objective !== null);

  return {
    key,
    title,
    description,
    status,
    canClaim: Boolean(value.canClaim),
    objectives,
  };
}

function parseQuestObjective<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedQuestObjectiveState | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const key = parsers.asString(value.key);
  const description = parsers.asString(value.description);
  const current = parsers.asNumber(value.current);
  const target = parsers.asNumber(value.target);

  if (!key || !description || current === null || target === null) {
    return null;
  }

  return {
    key,
    description,
    current: Math.max(0, Math.round(current)),
    target: Math.max(1, Math.round(target)),
    completed: Boolean(value.completed),
  };
}

function extractCombatStateCandidate<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
  fallbackCombatStatus: TCombatStatus,
): ParsedCombatEncounterState<TCombatStatus, TCombatTurn> | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  if (parsers.isRecord(value.encounter)) {
    const fromEncounter = parseCombatState(value.encounter, parsers, fallbackCombatStatus);
    if (fromEncounter) {
      return fromEncounter;
    }
  }

  if (parsers.isRecord(value.state)) {
    const fromState = parseCombatState(value.state, parsers, fallbackCombatStatus);
    if (fromState) {
      return fromState;
    }
  }

  if (parsers.isRecord(value.data)) {
    const fromData = parseCombatState(value.data, parsers, fallbackCombatStatus);
    if (fromData) {
      return fromData;
    }
  }

  return parseCombatState(value, parsers, fallbackCombatStatus);
}

function parseCombatState<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
  fallbackCombatStatus: TCombatStatus,
): ParsedCombatEncounterState<TCombatStatus, TCombatTurn> | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const id = parsers.asString(value.id);
  const status = parsers.asCombatStatus(value.status);
  const turn = parsers.asCombatTurn(value.turn);
  const round = parsers.asNumber(value.round) ?? 1;
  const playerRecord = parsers.asRecord(value.player);
  const enemyRecord = parsers.asRecord(value.enemy);

  if (!id || !status || !turn || !playerRecord || !enemyRecord) {
    return null;
  }

  const player = parseCombatPlayerState(playerRecord, parsers);
  const enemy = parseCombatEnemyState(enemyRecord, parsers);

  if (!player || !enemy) {
    return null;
  }

  return {
    id,
    status,
    turn,
    round,
    logs: parsers.asStringArray(value.logs).slice(-20),
    scriptState: parseCombatScriptState(value.scriptState, parsers),
    player,
    enemy,
    lastAction: parsers.asString(value.lastAction),
    rewards: parseCombatRewardSummary(value.rewards, parsers),
    defeatPenalty: parseCombatDefeatPenalty(value.defeatPenalty, parsers),
    recap: parseCombatRecap(value.recap, parsers, fallbackCombatStatus),
    createdAt: parsers.asString(value.createdAt) ?? undefined,
    updatedAt: parsers.asString(value.updatedAt) ?? undefined,
    endedAt: parsers.asString(value.endedAt) ?? null,
  };
}

function parseCombatScriptState<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): Record<string, boolean | number | string> {
  if (!parsers.isRecord(value)) {
    return {};
  }

  const normalized: Record<string, boolean | number | string> = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (typeof entryValue === 'boolean' || typeof entryValue === 'number' || typeof entryValue === 'string') {
      normalized[key] = entryValue;
    }
  }

  return normalized;
}

function parseCombatPlayerState<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: Record<string, unknown>,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedCombatUnitState | null {
  const hp = parsers.asNumber(value.hp);
  const maxHp = parsers.asNumber(value.maxHp) ?? hp;
  const mp = parsers.asNumber(value.mp);
  const maxMp = parsers.asNumber(value.maxMp) ?? mp;

  if (hp === null || maxHp === null || mp === null || maxMp === null) {
    return null;
  }

  return {
    hp,
    maxHp,
    mp,
    maxMp,
    attack: parsers.asNumber(value.attack) ?? 0,
    defense: parsers.asNumber(value.defense) ?? 0,
    magicAttack: parsers.asNumber(value.magicAttack) ?? 0,
    speed: parsers.asNumber(value.speed) ?? 0,
    defending: Boolean(value.defending),
  };
}

function parseCombatEnemyState<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: Record<string, unknown>,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedCombatEnemyState | null {
  const baseHp = parsers.asNumber(value.hp);
  const baseMp = parsers.asNumber(value.mp);
  const currentHp = parsers.asNumber(value.currentHp) ?? baseHp;
  const currentMp = parsers.asNumber(value.currentMp) ?? baseMp;

  if (baseHp === null || baseMp === null || currentHp === null || currentMp === null) {
    return null;
  }

  return {
    key: parsers.asString(value.key) ?? 'enemy',
    name: parsers.asString(value.name) ?? 'Enemy',
    hp: baseHp,
    mp: baseMp,
    currentHp,
    currentMp,
    attack: parsers.asNumber(value.attack) ?? 0,
    defense: parsers.asNumber(value.defense) ?? 0,
    magicAttack: parsers.asNumber(value.magicAttack) ?? 0,
    speed: parsers.asNumber(value.speed) ?? 0,
  };
}

function parseCombatRewardSummary<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedCombatRewardSummaryState | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  return {
    experience: Math.max(0, Math.round(parsers.asNumber(value.experience) ?? 0)),
    gold: Math.max(0, Math.round(parsers.asNumber(value.gold) ?? 0)),
    items: parseCombatRewardItems(value.items, parsers),
    levelBefore: Math.max(1, Math.round(parsers.asNumber(value.levelBefore) ?? 1)),
    levelAfter: Math.max(1, Math.round(parsers.asNumber(value.levelAfter) ?? 1)),
  };
}

function parseCombatRewardItems<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedCombatRewardItemState[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: ParsedCombatRewardItemState[] = [];
  for (const entry of value) {
    if (!parsers.isRecord(entry)) {
      continue;
    }

    const itemKey = parsers.asString(entry.itemKey);
    const quantity = parsers.asNumber(entry.quantity);
    if (!itemKey || quantity === null) {
      continue;
    }

    items.push({
      itemKey,
      quantity: Math.max(0, Math.round(quantity)),
      rarity: parsers.asString(entry.rarity) ?? 'common',
      source: parsers.asString(entry.source) ?? 'enemy',
    });
  }

  return items;
}

function parseCombatDefeatPenalty<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
): ParsedCombatDefeatPenaltyState | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const itemsLost = Array.isArray(value.itemsLost)
    ? value.itemsLost
        .filter((entry): entry is Record<string, unknown> => parsers.isRecord(entry))
        .map((entry) => ({
          itemKey: parsers.asString(entry.itemKey) ?? 'item',
          quantity: Math.max(0, Math.round(parsers.asNumber(entry.quantity) ?? 0)),
        }))
    : [];

  return {
    goldLossPercent: Math.max(0, Math.round(parsers.asNumber(value.goldLossPercent) ?? 0)),
    goldLost: Math.max(0, Math.round(parsers.asNumber(value.goldLost) ?? 0)),
    itemsLost,
    respawnZone: parsers.asString(value.respawnZone) ?? 'Ferme',
    respawnDay: Math.max(1, Math.round(parsers.asNumber(value.respawnDay) ?? 1)),
    playerHpAfterDefeat: Math.max(0, Math.round(parsers.asNumber(value.playerHpAfterDefeat) ?? 1)),
  };
}

function parseCombatRecap<
  TCombatStatus extends string,
  TCombatTurn extends string,
  TQuestStatus extends string,
>(
  value: unknown,
  parsers: GameplayPayloadParsers<TCombatStatus, TCombatTurn, TQuestStatus>,
  fallbackCombatStatus: TCombatStatus,
): ParsedCombatEncounterRecapState<TCombatStatus> | null {
  if (!parsers.isRecord(value)) {
    return null;
  }

  const rewardsRecord = parsers.asRecord(value.rewards);
  const penaltiesRecord = parsers.asRecord(value.penalties);
  const outcome = parsers.asCombatStatus(value.outcome) ?? fallbackCombatStatus;

  return {
    outcome,
    rounds: Math.max(1, Math.round(parsers.asNumber(value.rounds) ?? 1)),
    damageDealt: Math.max(0, Math.round(parsers.asNumber(value.damageDealt) ?? 0)),
    damageTaken: Math.max(0, Math.round(parsers.asNumber(value.damageTaken) ?? 0)),
    healingDone: Math.max(0, Math.round(parsers.asNumber(value.healingDone) ?? 0)),
    mpSpent: Math.max(0, Math.round(parsers.asNumber(value.mpSpent) ?? 0)),
    mpRecovered: Math.max(0, Math.round(parsers.asNumber(value.mpRecovered) ?? 0)),
    poisonApplied: Math.max(0, Math.round(parsers.asNumber(value.poisonApplied) ?? 0)),
    ceciteApplied: Math.max(0, Math.round(parsers.asNumber(value.ceciteApplied) ?? 0)),
    obscuriteApplied: Math.max(0, Math.round(parsers.asNumber(value.obscuriteApplied) ?? 0)),
    debuffsCleansed: Math.max(0, Math.round(parsers.asNumber(value.debuffsCleansed) ?? 0)),
    blindMisses: Math.max(0, Math.round(parsers.asNumber(value.blindMisses) ?? 0)),
    rewards: {
      experience: Math.max(0, Math.round(parsers.asNumber(rewardsRecord?.experience) ?? 0)),
      gold: Math.max(0, Math.round(parsers.asNumber(rewardsRecord?.gold) ?? 0)),
      lootItems: Math.max(0, Math.round(parsers.asNumber(rewardsRecord?.lootItems) ?? 0)),
    },
    penalties: {
      goldLost: Math.max(0, Math.round(parsers.asNumber(penaltiesRecord?.goldLost) ?? 0)),
      itemsLost: Math.max(0, Math.round(parsers.asNumber(penaltiesRecord?.itemsLost) ?? 0)),
    },
  };
}

