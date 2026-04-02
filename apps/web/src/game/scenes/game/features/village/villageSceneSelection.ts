import type { FrontSceneMode, VillageSceneZoneConfig, VillageSceneZoneKey } from '../../gameScene.types';
import type { VillageNpcHudState, VillageNpcKey, VillageNpcRelationshipHudState } from '../../gameScene.stateTypes';

export function buildVillageRenderSignature(params: {
  frontSceneMode: FrontSceneMode;
  selectedZoneKey: VillageSceneZoneKey | null;
  villageMarketUnlocked: boolean;
  blacksmithUnlocked: boolean;
  blacksmithCurseLifted: boolean;
  villageFeedbackMessage: string | null;
  villageNpcError: string | null;
  dayPhaseKey: 'day' | 'night';
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
}): string {
  const npcSignature = (['mayor', 'blacksmith', 'merchant'] as VillageNpcKey[]).map((npcKey) => {
    const npc = params.villageNpcState[npcKey];
    const relation = params.villageNpcRelationships[npcKey];
    return `${npcKey}:${npc.stateKey}:${npc.available ? '1' : '0'}:${relation.canTalkToday ? '1' : '0'}`;
  });

  return [
    params.frontSceneMode,
    params.selectedZoneKey ?? '',
    params.villageMarketUnlocked ? '1' : '0',
    params.blacksmithUnlocked ? '1' : '0',
    params.blacksmithCurseLifted ? '1' : '0',
    params.villageFeedbackMessage ?? '',
    params.villageNpcError ?? '',
    params.dayPhaseKey,
    ...npcSignature,
  ].join('|');
}

export function ensureVillageSelectedZoneKey(params: {
  zones: VillageSceneZoneConfig[];
  selectedZoneKey: VillageSceneZoneKey | null;
  villageNpcState: VillageNpcHudState;
}): VillageSceneZoneKey | null {
  if (params.selectedZoneKey && params.zones.some((zone) => zone.key === params.selectedZoneKey)) {
    return params.selectedZoneKey;
  }

  const preferredZone = params.zones.find((zone) => {
    if (!zone.npcKey) {
      return false;
    }
    const npc = params.villageNpcState[zone.npcKey];
    return npc.available;
  });

  return preferredZone?.key ?? params.zones[0]?.key ?? null;
}

export function getVillageZoneByKey(
  zones: VillageSceneZoneConfig[],
  zoneKey: VillageSceneZoneKey | null,
): VillageSceneZoneConfig | null {
  if (!zoneKey) {
    return null;
  }
  return zones.find((zone) => zone.key === zoneKey) ?? null;
}

export function getNearestVillageZoneKey(params: {
  zones: VillageSceneZoneConfig[];
  playerX: number;
  playerY: number;
  maxDistanceSq: number;
}): VillageSceneZoneKey | null {
  let nearestKey: VillageSceneZoneKey | null = null;
  let nearestDistanceSq = Number.POSITIVE_INFINITY;

  for (const zone of params.zones) {
    const dx = params.playerX - zone.x;
    const dy = params.playerY - zone.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq < nearestDistanceSq) {
      nearestDistanceSq = distanceSq;
      nearestKey = zone.key;
    }
  }

  if (!nearestKey || nearestDistanceSq > params.maxDistanceSq) {
    return null;
  }

  return nearestKey;
}

export function getCycledVillageZoneKey(params: {
  zones: VillageSceneZoneConfig[];
  currentSelectedZoneKey: VillageSceneZoneKey | null;
  step: number;
}): VillageSceneZoneKey | null {
  if (params.zones.length === 0) {
    return null;
  }

  const currentIndex = params.zones.findIndex((zone) => zone.key === params.currentSelectedZoneKey);
  const baseIndex = currentIndex >= 0 ? currentIndex : 0;
  const total = params.zones.length;
  const nextIndex = (baseIndex + params.step + total) % total;
  const nextZone = params.zones[nextIndex];
  return nextZone?.key ?? null;
}
