import type {
  VillageNpcHudEntry,
  VillageNpcRelationshipHudEntry,
} from '../../gameScene.stateTypes';

export type VillageHudPayloadParsers = {
  asRecord: (value: unknown) => Record<string, unknown> | null;
  asString: (value: unknown) => string | null;
  asNumber: (value: unknown) => number | null;
};

export function getDayPhaseKey(day: number): 'day' | 'night' {
  return day % 2 === 0 ? 'night' : 'day';
}

export function getDayPhaseLabel(day: number): string {
  return getDayPhaseKey(day) === 'night' ? 'Nuit' : 'Jour';
}

export function getBlacksmithStatusLabel(params: {
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
}): string {
  if (!params.blacksmithCurseLifted) {
    return 'Cursed';
  }

  if (!params.blacksmithUnlocked) {
    return 'Recovering';
  }

  return 'Unlocked';
}

export function normalizeVillageNpcEntry(
  payload: unknown,
  parsers: Pick<VillageHudPayloadParsers, 'asRecord' | 'asString'>,
): VillageNpcHudEntry | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const stateKey = parsers.asString(record.stateKey)?.trim().toLowerCase();
  if (!stateKey) {
    return null;
  }

  return {
    stateKey,
    available: Boolean(record.available),
  };
}

export function normalizeVillageNpcRelationshipEntry(
  payload: unknown,
  parsers: Pick<VillageHudPayloadParsers, 'asRecord' | 'asString' | 'asNumber'>,
): VillageNpcRelationshipHudEntry | null {
  const record = parsers.asRecord(payload);
  if (!record) {
    return null;
  }

  const friendshipRaw = parsers.asNumber(record.friendship);
  const tierRaw = parsers.asString(record.tier)?.trim().toLowerCase();
  const lastInteractionDayRaw = parsers.asNumber(record.lastInteractionDay);
  if (
    friendshipRaw === null ||
    !tierRaw ||
    (tierRaw !== 'stranger' && tierRaw !== 'familiar' && tierRaw !== 'trusted' && tierRaw !== 'ally')
  ) {
    return null;
  }

  const lastInteractionDay =
    lastInteractionDayRaw === null || lastInteractionDayRaw < 1 ? null : Math.round(lastInteractionDayRaw);

  return {
    friendship: Math.max(0, Math.round(friendshipRaw)),
    tier: tierRaw,
    lastInteractionDay,
    canTalkToday: Boolean(record.canTalkToday),
  };
}
