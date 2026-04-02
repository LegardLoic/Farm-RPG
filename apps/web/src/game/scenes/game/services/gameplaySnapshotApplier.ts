import type {
  HudState,
  IntroNarrativeState,
  VillageNpcHudState,
  VillageNpcRelationshipHudState,
} from '../gameScene.stateTypes';
import type { GameScenePayloadGateway } from './gameScenePayloadGateway';
import type {
  FarmCraftingState,
  FarmState,
  FarmStoryState,
  GameplayLoopState,
  TowerStoryState,
} from './payloadNormalizers';

export type GameplaySnapshotState = {
  introNarrativeState: IntroNarrativeState | null;
  introNarrativeError: string | null;
  hudState: HudState;
  farmState: FarmState | null;
  farmSelectedSeedItemKey: string;
  farmSelectedPlotKey: string | null;
  farmStoryState: FarmStoryState | null;
  farmCraftingState: FarmCraftingState | null;
  loopState: GameplayLoopState | null;
  villageNpcState: VillageNpcHudState;
  villageNpcRelationships: VillageNpcRelationshipHudState;
  towerStoryState: TowerStoryState | null;
};

export function applyGameplaySnapshotToState(input: {
  payload: unknown;
  payloadGateway: GameScenePayloadGateway;
  state: GameplaySnapshotState;
}): GameplaySnapshotState {
  const { payload, payloadGateway } = input;
  if (!payloadGateway.isRecord(payload)) {
    return input.state;
  }

  const next: GameplaySnapshotState = {
    ...input.state,
    hudState: { ...input.state.hudState },
    villageNpcState: { ...input.state.villageNpcState },
    villageNpcRelationships: { ...input.state.villageNpcRelationships },
  };

  const introNarrativeState = payloadGateway.normalizeGameplayIntroPayload(payload);
  if (introNarrativeState) {
    next.introNarrativeState = introNarrativeState;
    next.introNarrativeError = null;
  }

  const world = payloadGateway.asRecord(payload.world);
  if (world) {
    const day = payloadGateway.asNumber(world.day);
    const zone = payloadGateway.asString(world.zone);

    if (day !== null) {
      next.hudState.day = Math.max(1, Math.round(day));
    }

    if (zone) {
      next.hudState.area = zone;
    }
  }

  const farm = payloadGateway.normalizeGameplayFarmPayload(payload);
  if (farm) {
    next.farmState = farm;
    if (farm.unlocked) {
      const unlockedSeedKeys = new Set(
        farm.cropCatalog.filter((entry) => entry.unlocked).map((entry) => entry.seedItemKey),
      );
      if (!unlockedSeedKeys.has(next.farmSelectedSeedItemKey)) {
        next.farmSelectedSeedItemKey = farm.cropCatalog.find((entry) => entry.unlocked)?.seedItemKey ?? '';
      }
      if (
        !next.farmSelectedPlotKey ||
        !farm.plots.some((plot) => plot.plotKey === next.farmSelectedPlotKey)
      ) {
        const preferredPlot =
          farm.plots.find((plot) => plot.readyToHarvest) ??
          farm.plots.find((plot) => !plot.cropKey) ??
          farm.plots[0] ??
          null;
        next.farmSelectedPlotKey = preferredPlot?.plotKey ?? null;
      }
    } else {
      next.farmSelectedSeedItemKey = '';
      next.farmSelectedPlotKey = null;
    }
  }

  const farmStory = payloadGateway.normalizeGameplayFarmStoryPayload(payload);
  if (farmStory) {
    next.farmStoryState = farmStory;
  }

  const crafting = payloadGateway.normalizeGameplayCraftingPayload(payload);
  if (crafting) {
    next.farmCraftingState = crafting;
  }

  const loop = payloadGateway.normalizeGameplayLoopPayload(payload);
  if (loop) {
    next.loopState = loop;
  }

  const progression = payloadGateway.asRecord(payload.progression);
  if (!progression) {
    return next;
  }

  const gold = payloadGateway.asNumber(progression.gold);
  const level = payloadGateway.asNumber(progression.level);
  const experience = payloadGateway.asNumber(progression.experience);
  const experienceToNextLevel = payloadGateway.asNumber(progression.experienceToNextLevel);
  const currentHp = payloadGateway.asNumber(progression.currentHp);
  const maxHp = payloadGateway.asNumber(progression.maxHp);
  const currentMp = payloadGateway.asNumber(progression.currentMp);
  const maxMp = payloadGateway.asNumber(progression.maxMp);

  if (gold !== null) {
    next.hudState.gold = Math.max(0, Math.round(gold));
  }

  if (level !== null) {
    next.hudState.level = Math.max(1, Math.round(level));
  }

  if (experience !== null) {
    next.hudState.xp = Math.max(0, Math.round(experience));
  }

  if (experienceToNextLevel !== null) {
    next.hudState.xpToNext = Math.max(1, Math.round(experienceToNextLevel));
  }

  if (maxHp !== null) {
    next.hudState.maxHp = Math.max(1, Math.round(maxHp));
  }
  if (currentHp !== null) {
    next.hudState.hp = Math.max(0, Math.min(next.hudState.maxHp, Math.round(currentHp)));
  }
  if (maxMp !== null) {
    next.hudState.maxMp = Math.max(1, Math.round(maxMp));
  }
  if (currentMp !== null) {
    next.hudState.mp = Math.max(0, Math.min(next.hudState.maxMp, Math.round(currentMp)));
  }

  const village = payloadGateway.asRecord(payload.village);
  if (village) {
    const blacksmith = payloadGateway.asRecord(village.blacksmith);
    if (blacksmith) {
      next.hudState.blacksmithUnlocked = Boolean(blacksmith.unlocked);
      next.hudState.blacksmithCurseLifted = Boolean(blacksmith.curseLifted);
    }

    const npcs = payloadGateway.asRecord(village.npcs);
    if (npcs) {
      const mayor = payloadGateway.normalizeVillageNpcEntry(npcs.mayor);
      const blacksmithNpc = payloadGateway.normalizeVillageNpcEntry(npcs.blacksmith);
      const merchant = payloadGateway.normalizeVillageNpcEntry(npcs.merchant);

      if (mayor) {
        next.villageNpcState.mayor = mayor;
      }
      if (blacksmithNpc) {
        next.villageNpcState.blacksmith = blacksmithNpc;
      }
      if (merchant) {
        next.villageNpcState.merchant = merchant;
      }
    }

    const relationships = payloadGateway.asRecord(village.relationships);
    if (relationships) {
      const mayorRelationship = payloadGateway.normalizeVillageNpcRelationshipEntry(relationships.mayor);
      const blacksmithRelationship = payloadGateway.normalizeVillageNpcRelationshipEntry(relationships.blacksmith);
      const merchantRelationship = payloadGateway.normalizeVillageNpcRelationshipEntry(relationships.merchant);

      if (mayorRelationship) {
        next.villageNpcRelationships.mayor = mayorRelationship;
      }
      if (blacksmithRelationship) {
        next.villageNpcRelationships.blacksmith = blacksmithRelationship;
      }
      if (merchantRelationship) {
        next.villageNpcRelationships.merchant = merchantRelationship;
      }
    }
  }

  const tower = payloadGateway.asRecord(payload.tower);
  if (tower) {
    const currentFloor = payloadGateway.asNumber(tower.currentFloor);
    const highestFloor = payloadGateway.asNumber(tower.highestFloor);
    const bossFloor10Defeated = tower.bossFloor10Defeated;

    if (currentFloor !== null) {
      next.hudState.towerCurrentFloor = Math.max(1, Math.round(currentFloor));
    }

    if (highestFloor !== null) {
      next.hudState.towerHighestFloor = Math.max(1, Math.round(highestFloor));
    }

    next.hudState.towerBossFloor10Defeated = Boolean(bossFloor10Defeated);
  }

  const towerStory = payloadGateway.normalizeGameplayTowerStoryPayload(payload);
  if (towerStory) {
    next.towerStoryState = towerStory;
  }

  return next;
}
