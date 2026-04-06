import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { TransactionClient } from '../database/database.service';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import { QuestsService } from '../quests/quests.service';
import {
  BASE_PLAYER_CURRENT_HP,
  BASE_PLAYER_CURRENT_MP,
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  BASE_PLAYER_MAX_HP,
  BASE_PLAYER_MAX_MP,
  BASE_WORLD_DAY,
  BASE_WORLD_ZONE,
  COMBAT_PREPARATION_FLAGS,
  COMBAT_PREPARATION_FLAG_ATTACK,
  COMBAT_PREPARATION_FLAG_HP,
  COMBAT_PREPARATION_FLAG_MP,
  FARM_STORY_EVENTS,
  INTRO_FLAG_ARRIVED_VILLAGE,
  INTRO_FLAG_FARM_ASSIGNED,
  INTRO_FLAG_MET_MAYOR,
  INTRO_PROGRESS_FLAGS,
  FARM_CRAFT_RECIPES,
  FARM_CROP_CATALOG,
  FARM_PLOTS_TABLE,
  FARM_PLOT_LAYOUT,
  FARM_TILES_TABLE,
  VILLAGE_NPC_KEYS,
  VILLAGE_NPC_RELATIONSHIPS_TABLE,
  PLAYER_PROGRESSION_TABLE,
  TOWER_STORY_EVENTS,
  type VillageNpcKey,
  WORLD_STATE_TABLE,
  WORLD_FLAGS_TABLE,
  clampPlayerLevel,
  xpRequiredForLevel,
} from './gameplay.constants';
import { TOWER_PROGRESSION_TABLE } from '../tower/tower.constants';
import type {
  GameplayCombatPreparationState,
  GameplayFarmHarvestResult,
  GameplayFarmStoryState,
  GameplayFarmCraftingState,
  GameplayFarmCraftResult,
  GameplayFarmPlantResult,
  GameplayFarmState,
  GameplayFarmTilePlantResult,
  GameplayFarmTileState,
  GameplayFarmTileTillResult,
  GameplayFarmTileWaterResult,
  GameplaySleepResult,
  GameplayFarmWaterResult,
  GameplayIntroState,
  GameplayLoopState,
  GameplayTowerStoryState,
  GameplayVillageNpcInteractResult,
  GameplayVillageNpcRelationshipTier,
  GameplayVillageState,
  GameplayWorldState,
  PlayerProgressionState,
} from './gameplay.types';

type PlayerProgressionRow = {
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
  current_hp: number;
  max_hp: number;
  current_mp: number;
  max_mp: number;
};

type WorldFlagRow = {
  flag_key: string;
};

type WorldStateRow = {
  zone: string;
  day: number;
  farm_harvest_total: number;
};

type FarmPlotRow = {
  plot_key: string;
  row_index: number;
  col_index: number;
  crop_key: string | null;
  planted_day: number | null;
  growth_days: number | null;
  watered_today: boolean;
};

type FarmTileRow = {
  scene_key: string;
  tile_x: number;
  tile_y: number;
  tilled: boolean;
  watered: boolean;
  planted_seed_item_key: string | null;
};

type InventoryRow = {
  item_key: string;
  quantity: number;
};

type VillageNpcRelationshipRow = {
  npc_key: VillageNpcKey;
  friendship: number;
  last_interaction_day: number | null;
};

type TowerProgressionRow = {
  current_floor: number;
  highest_floor: number;
  boss_floor_10_defeated: boolean;
};

type QueryExecutor = Pick<DatabaseService, 'query'> | TransactionClient;

const MAX_VILLAGE_NPC_FRIENDSHIP = 30;

@Injectable()
export class GameplayService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Optional() private readonly questsService?: QuestsService,
  ) {}

  async getPlayerProgression(userId: string): Promise<PlayerProgressionState> {
    await this.databaseService.query(
      `
        INSERT INTO ${PLAYER_PROGRESSION_TABLE} (
          user_id,
          level,
          experience,
          experience_to_next,
          gold,
          current_hp,
          max_hp,
          current_mp,
          max_mp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [
        userId,
        BASE_PLAYER_LEVEL,
        BASE_PLAYER_EXPERIENCE,
        xpRequiredForLevel(BASE_PLAYER_LEVEL),
        BASE_PLAYER_GOLD,
        BASE_PLAYER_CURRENT_HP,
        BASE_PLAYER_MAX_HP,
        BASE_PLAYER_CURRENT_MP,
        BASE_PLAYER_MAX_MP,
      ],
    );

    const result = await this.databaseService.query<PlayerProgressionRow>(
      `
        SELECT level, experience, experience_to_next, gold, current_hp, max_hp, current_mp, max_mp
        FROM ${PLAYER_PROGRESSION_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    const level = clampPlayerLevel(row.level);
    const experienceToNextLevel = xpRequiredForLevel(level);
    const experience = Math.max(0, Math.min(Math.floor(row.experience), experienceToNextLevel - 1));
    return {
      level,
      experience,
      experienceToNextLevel,
      gold: Math.max(0, Math.floor(row.gold)),
      currentHp: row.current_hp,
      maxHp: row.max_hp,
      currentMp: row.current_mp,
      maxMp: row.max_mp,
    };
  }

  async getVillageState(userId: string): Promise<GameplayVillageState> {
    const world = await this.getWorldState(userId);
    const flags = new Set(await this.getWorldFlags(userId));
    return this.getVillageStateWithExecutor(this.databaseService, userId, flags, world.day);
  }

  async interactVillageNpc(
    userId: string,
    npcKey: string,
  ): Promise<{
    interaction: GameplayVillageNpcInteractResult;
    village: GameplayVillageState;
  }> {
    const normalizedNpcKey = this.resolveVillageNpcKeyOrThrow(npcKey);

    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureVillageNpcRelationshipRows(tx, userId);

      const world = await this.getWorldStateForUpdate(tx, userId);
      const flags = new Set(await this.getWorldFlags(userId, tx));
      const villageBefore = await this.getVillageStateWithExecutor(tx, userId, flags, world.day);
      const npcState = villageBefore.npcs[normalizedNpcKey];
      if (!npcState.available) {
        throw new ForbiddenException(`${normalizedNpcKey} is not available for interaction`);
      }

      const relationshipBefore = villageBefore.relationships[normalizedNpcKey];
      if (!relationshipBefore.canTalkToday) {
        throw new BadRequestException(`${normalizedNpcKey} already interacted today`);
      }

      const row = await this.getVillageNpcRelationshipRowForUpdate(tx, userId, normalizedNpcKey);
      const friendshipBefore = Math.max(0, Math.floor(row.friendship));
      const friendshipAfter = Math.min(MAX_VILLAGE_NPC_FRIENDSHIP, friendshipBefore + 1);
      const tierBefore = this.toVillageRelationshipTier(friendshipBefore);
      const tierAfter = this.toVillageRelationshipTier(friendshipAfter);

      await tx.query(
        `
          UPDATE ${VILLAGE_NPC_RELATIONSHIPS_TABLE}
          SET friendship = $3,
              last_interaction_day = $4,
              updated_at = NOW()
          WHERE user_id = $1
            AND npc_key = $2
        `,
        [userId, normalizedNpcKey, friendshipAfter, world.day],
      );

      if (this.questsService) {
        await this.questsService.recordVillageNpcInteraction(tx, userId, {
          npcKey: normalizedNpcKey,
          friendshipAfter,
        });
      }

      const village = await this.getVillageStateWithExecutor(tx, userId, flags, world.day);
      return {
        interaction: {
          npcKey: normalizedNpcKey,
          friendshipBefore,
          friendshipAfter,
          tierBefore,
          tierAfter,
          day: world.day,
        },
        village,
      };
    });
  }

  async getLoopState(userId: string): Promise<GameplayLoopState> {
    await this.ensureWorldState(this.databaseService, userId);
    await this.ensureVillageNpcRelationshipRows(this.databaseService, userId);

    const worldFlags = new Set(await this.getWorldFlags(userId));
    const [towerState, relationships, inventoryByItemKey] = await Promise.all([
      this.getTowerState(this.databaseService, userId),
      this.getVillageNpcRelationshipRows(this.databaseService, userId),
      this.getInventoryQuantitiesByItemKeys(this.databaseService, userId, ['healing_herb', 'mana_tonic']),
    ]);

    return this.buildLoopState(worldFlags, towerState.highestFloor, relationships, inventoryByItemKey);
  }

  async prepareCombatLoadout(userId: string): Promise<{
    preparation: GameplayCombatPreparationState;
    loop: GameplayLoopState;
  }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureVillageNpcRelationshipRows(tx, userId);
      await this.getWorldStateForUpdate(tx, userId);

      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      const farmUnlocked = worldFlags.has(INTRO_FLAG_FARM_ASSIGNED);
      const villageMarketUnlocked = worldFlags.has('floor_3_cleared') && farmUnlocked;
      if (!farmUnlocked) {
        throw new ForbiddenException('Farm is locked');
      }
      if (!villageMarketUnlocked) {
        throw new ForbiddenException('Village market is locked');
      }
      if (COMBAT_PREPARATION_FLAGS.some((flag) => worldFlags.has(flag))) {
        throw new BadRequestException('A combat preparation is already active');
      }

      const healingHerbRow = await this.getInventoryItemForUpdate(tx, userId, 'healing_herb');
      const manaTonicRow = await this.getInventoryItemForUpdate(tx, userId, 'mana_tonic');
      const useHealingHerb = (healingHerbRow?.quantity ?? 0) > 0;
      const useManaTonic = (manaTonicRow?.quantity ?? 0) > 0;
      if (!useHealingHerb && !useManaTonic) {
        throw new BadRequestException('Missing preparation consumables (healing_herb or mana_tonic)');
      }

      if (useHealingHerb) {
        await this.setInventoryItemQuantity(tx, userId, 'healing_herb', Math.max(0, (healingHerbRow?.quantity ?? 0) - 1));
        worldFlags.add(COMBAT_PREPARATION_FLAG_HP);
      }
      if (useManaTonic) {
        await this.setInventoryItemQuantity(tx, userId, 'mana_tonic', Math.max(0, (manaTonicRow?.quantity ?? 0) - 1));
        worldFlags.add(COMBAT_PREPARATION_FLAG_MP);
      }

      const mayorRelation = await this.getVillageNpcRelationshipRowForUpdate(tx, userId, 'mayor');
      if (this.toVillageRelationshipTier(mayorRelation.friendship) !== 'stranger') {
        worldFlags.add(COMBAT_PREPARATION_FLAG_ATTACK);
      }

      const prepFlagsToInsert = COMBAT_PREPARATION_FLAGS.filter((flag) => worldFlags.has(flag));
      for (const flag of prepFlagsToInsert) {
        await tx.query(
          `
            INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, flag_key)
            DO UPDATE SET unlocked_at = NOW()
          `,
          [userId, flag],
        );
      }

      const relationships = await this.getVillageNpcRelationshipRows(tx, userId);
      const inventoryByItemKey = await this.getInventoryQuantitiesByItemKeys(tx, userId, ['healing_herb', 'mana_tonic']);
      const towerState = await this.getTowerState(tx, userId);
      const loop = this.buildLoopState(worldFlags, towerState.highestFloor, relationships, inventoryByItemKey);

      return {
        preparation: this.resolveCombatPreparationState(worldFlags),
        loop,
      };
    });
  }

  async getWorldState(userId: string): Promise<GameplayWorldState> {
    await this.databaseService.query(
      `
        INSERT INTO ${WORLD_STATE_TABLE} (user_id, zone, day, farm_harvest_total)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, BASE_WORLD_ZONE, BASE_WORLD_DAY],
    );

    const result = await this.databaseService.query<WorldStateRow>(
      `
        SELECT zone, day, farm_harvest_total
        FROM ${WORLD_STATE_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        zone: BASE_WORLD_ZONE,
        day: BASE_WORLD_DAY,
        farmHarvestTotal: 0,
      };
    }

    return {
      zone: row.zone?.trim() ? row.zone.trim() : BASE_WORLD_ZONE,
      day: Number.isFinite(row.day) && row.day > 0 ? Math.floor(row.day) : BASE_WORLD_DAY,
      farmHarvestTotal:
        Number.isFinite(row.farm_harvest_total) && row.farm_harvest_total >= 0
          ? Math.floor(row.farm_harvest_total)
          : 0,
    };
  }

  async getIntroState(userId: string): Promise<GameplayIntroState> {
    const flags = new Set(await this.getWorldFlags(userId));
    return this.toIntroState(flags);
  }

  async getFarmState(userId: string, currentDay?: number): Promise<GameplayFarmState> {
    await this.ensureFarmPlots(this.databaseService, userId);
    const worldFlags = new Set(await this.getWorldFlags(userId));
    const day = typeof currentDay === 'number' && Number.isFinite(currentDay) && currentDay > 0
      ? Math.floor(currentDay)
      : (await this.getWorldState(userId)).day;

    return this.getFarmStateWithExecutor(this.databaseService, userId, worldFlags, day);
  }

  async getFarmCraftingState(userId: string): Promise<GameplayFarmCraftingState> {
    await this.ensureFarmPlots(this.databaseService, userId);
    const worldFlags = new Set(await this.getWorldFlags(userId));
    return this.getFarmCraftingStateWithExecutor(this.databaseService, userId, worldFlags);
  }

  async getFarmStoryState(
    userId: string,
    currentDay?: number,
    currentHarvestTotal?: number,
  ): Promise<GameplayFarmStoryState> {
    await this.ensureWorldState(this.databaseService, userId);
    const worldFlags = new Set(await this.getWorldFlags(userId));
    const world =
      typeof currentDay === 'number' && Number.isFinite(currentDay) && currentDay > 0 &&
      typeof currentHarvestTotal === 'number' && Number.isFinite(currentHarvestTotal)
        ? null
        : await this.getWorldState(userId);

    const day = typeof currentDay === 'number' && Number.isFinite(currentDay) && currentDay > 0
      ? Math.floor(currentDay)
      : (world?.day ?? BASE_WORLD_DAY);
    const harvestTotal = typeof currentHarvestTotal === 'number' && Number.isFinite(currentHarvestTotal)
      ? Math.max(0, Math.floor(currentHarvestTotal))
      : (world?.farmHarvestTotal ?? 0);

    return this.buildFarmStoryState(worldFlags, day, harvestTotal);
  }

  async getTowerStoryState(
    userId: string,
    currentHighestFloor?: number,
  ): Promise<GameplayTowerStoryState> {
    const worldFlags = new Set(await this.getWorldFlags(userId));
    const highestFloor = typeof currentHighestFloor === 'number' && Number.isFinite(currentHighestFloor)
      ? Math.max(1, Math.floor(currentHighestFloor))
      : (await this.getTowerState(this.databaseService, userId)).highestFloor;

    return this.buildTowerStoryState(worldFlags, highestFloor);
  }

  async craftFarmRecipe(userId: string, recipeKey: string, quantity: number): Promise<{
    craft: GameplayFarmCraftResult;
    crafting: GameplayFarmCraftingState;
  }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureFarmPlots(tx, userId);

      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const parsedQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
      const safeQuantity = Math.max(1, parsedQuantity);
      const recipe = this.resolveCraftRecipe(recipeKey, worldFlags);

      const consumedIngredients: GameplayFarmCraftResult['consumedIngredients'] = [];
      for (const ingredient of recipe.ingredients) {
        const inventoryRow = await this.getInventoryItemForUpdate(tx, userId, ingredient.itemKey);
        const requiredQuantity = ingredient.quantity * safeQuantity;
        const availableQuantity = inventoryRow?.quantity ?? 0;
        if (availableQuantity < requiredQuantity) {
          throw new BadRequestException(
            `Not enough ${ingredient.itemKey} (${requiredQuantity} required, ${availableQuantity} available)`,
          );
        }

        const remainingQuantity = availableQuantity - requiredQuantity;
        await this.setInventoryItemQuantity(tx, userId, ingredient.itemKey, remainingQuantity);
        consumedIngredients.push({
          itemKey: ingredient.itemKey,
          quantityConsumed: requiredQuantity,
          remainingQuantity,
        });
      }

      const totalOutputQuantity = recipe.outputQuantity * safeQuantity;
      const outputRow = await this.addInventoryQuantity(tx, userId, recipe.outputItemKey, totalOutputQuantity);
      const crafting = await this.getFarmCraftingStateWithExecutor(tx, userId, worldFlags);

      return {
        craft: {
          recipeKey: recipe.recipeKey,
          craftedQuantity: safeQuantity,
          outputItemKey: recipe.outputItemKey,
          outputQuantityPerCraft: recipe.outputQuantity,
          totalOutputQuantity,
          totalOutputInventoryQuantity: outputRow.quantity,
          consumedIngredients,
        },
        crafting,
      };
    });
  }

  async plantFarmPlot(userId: string, plotKey: string, seedItemKey: string): Promise<{
    plant: GameplayFarmPlantResult;
    farm: GameplayFarmState;
  }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureFarmPlots(tx, userId);

      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const world = await this.getWorldStateForUpdate(tx, userId);
      const plot = await this.getFarmPlotForUpdate(tx, userId, plotKey);
      if (!plot) {
        throw new NotFoundException(`Farm plot not found: ${plotKey}`);
      }
      if (plot.crop_key) {
        throw new BadRequestException(`Plot ${plotKey} is already planted`);
      }

      const crop = this.resolveCropBySeedItem(seedItemKey, worldFlags);
      const seedRow = await this.getInventoryItemForUpdate(tx, userId, seedItemKey);
      if (!seedRow || seedRow.quantity < 1) {
        throw new BadRequestException(`Missing seed item: ${seedItemKey}`);
      }

      const remainingSeedQuantity = seedRow.quantity - 1;
      await this.setInventoryItemQuantity(tx, userId, seedItemKey, remainingSeedQuantity);

      await tx.query(
        `
          UPDATE ${FARM_PLOTS_TABLE}
          SET crop_key = $3,
              planted_day = $4,
              growth_days = $5,
              watered_today = FALSE,
              updated_at = NOW()
          WHERE user_id = $1
            AND plot_key = $2
        `,
        [userId, plotKey, crop.cropKey, world.day, crop.growthDays],
      );

      const farm = await this.getFarmStateWithExecutor(tx, userId, worldFlags, world.day);
      return {
        plant: {
          plotKey,
          seedItemKey,
          cropKey: crop.cropKey,
          plantedDay: world.day,
          growthDays: crop.growthDays,
          remainingSeedQuantity,
        },
        farm,
      };
    });
  }

  async waterFarmPlot(userId: string, plotKey: string): Promise<{
    water: GameplayFarmWaterResult;
    farm: GameplayFarmState;
  }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureFarmPlots(tx, userId);

      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const world = await this.getWorldStateForUpdate(tx, userId);
      const plot = await this.getFarmPlotForUpdate(tx, userId, plotKey);
      if (!plot) {
        throw new NotFoundException(`Farm plot not found: ${plotKey}`);
      }
      if (!plot.crop_key) {
        throw new BadRequestException(`Plot ${plotKey} is empty`);
      }
      if (plot.watered_today) {
        throw new BadRequestException(`Plot ${plotKey} is already watered today`);
      }

      await tx.query(
        `
          UPDATE ${FARM_PLOTS_TABLE}
          SET watered_today = TRUE,
              updated_at = NOW()
          WHERE user_id = $1
            AND plot_key = $2
        `,
        [userId, plotKey],
      );

      const farm = await this.getFarmStateWithExecutor(tx, userId, worldFlags, world.day);
      return {
        water: {
          plotKey,
          cropKey: plot.crop_key,
          wateredToday: true,
          day: world.day,
        },
        farm,
      };
    });
  }

  async harvestFarmPlot(userId: string, plotKey: string): Promise<{
    harvest: GameplayFarmHarvestResult;
    farm: GameplayFarmState;
    farmStory: GameplayFarmStoryState;
  }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureFarmPlots(tx, userId);

      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const world = await this.getWorldStateForUpdate(tx, userId);
      const plot = await this.getFarmPlotForUpdate(tx, userId, plotKey);
      if (!plot) {
        throw new NotFoundException(`Farm plot not found: ${plotKey}`);
      }
      if (!plot.crop_key) {
        throw new BadRequestException(`Plot ${plotKey} has no crop to harvest`);
      }

      const maturity = this.toFarmPlotMaturity(plot, world.day);
      if (!maturity.readyToHarvest) {
        throw new BadRequestException(
          `Crop on ${plotKey} is not ready (${maturity.daysToMaturity ?? 0} day(s) remaining)`,
        );
      }

      const crop = this.resolveCropByCropKey(plot.crop_key);
      const inventoryRow = await this.addInventoryQuantity(tx, userId, crop.harvestItemKey, 1);

      await tx.query(
        `
          UPDATE ${FARM_PLOTS_TABLE}
          SET crop_key = NULL,
              planted_day = NULL,
              growth_days = NULL,
              watered_today = FALSE,
              updated_at = NOW()
          WHERE user_id = $1
            AND plot_key = $2
        `,
        [userId, plotKey],
      );

      if (this.questsService) {
        await this.questsService.recordFarmHarvest(tx, userId, {
          cropKey: crop.cropKey,
          quantity: 1,
        });
      }

      const harvestProgressUpdate = await tx.query<Pick<WorldStateRow, 'farm_harvest_total'>>(
        `
          UPDATE ${WORLD_STATE_TABLE}
          SET farm_harvest_total = farm_harvest_total + 1,
              updated_at = NOW()
          WHERE user_id = $1
          RETURNING farm_harvest_total
        `,
        [userId],
      );
      const harvestTotal = Number.isFinite(harvestProgressUpdate.rows[0]?.farm_harvest_total)
        ? Math.max(0, Math.floor(harvestProgressUpdate.rows[0]!.farm_harvest_total))
        : 0;

      await this.applyFarmStoryEventFlags(tx, userId, worldFlags, world.day, harvestTotal);

      const farm = await this.getFarmStateWithExecutor(tx, userId, worldFlags, world.day);
      const farmStory = this.buildFarmStoryState(worldFlags, world.day, harvestTotal);
      return {
        harvest: {
          plotKey,
          cropKey: crop.cropKey,
          harvestItemKey: crop.harvestItemKey,
          quantityGained: 1,
          totalHarvestItemQuantity: inventoryRow.quantity,
        },
        farm,
        farmStory,
      };
    });
  }

  async getFarmTileStates(userId: string, sceneKeyRaw?: string): Promise<GameplayFarmTileState[]> {
    await this.ensureWorldState(this.databaseService, userId);
    const worldFlags = new Set(await this.getWorldFlags(userId));
    this.assertFarmUnlocked(worldFlags);

    const sceneKey = this.normalizeFarmSceneKey(sceneKeyRaw);
    const result = await this.databaseService.query<FarmTileRow>(
      `
        SELECT scene_key, tile_x, tile_y, tilled, watered, planted_seed_item_key
        FROM ${FARM_TILES_TABLE}
        WHERE user_id = $1
          AND scene_key = $2
          AND (tilled = TRUE OR watered = TRUE OR planted_seed_item_key IS NOT NULL)
        ORDER BY tile_y ASC, tile_x ASC
      `,
      [userId, sceneKey],
    );

    return result.rows.map((row) => this.toFarmTileState(row));
  }

  async tillFarmTile(
    userId: string,
    tileXRaw: number,
    tileYRaw: number,
    sceneKeyRaw?: string,
  ): Promise<{ till: GameplayFarmTileTillResult; tile: GameplayFarmTileState }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const sceneKey = this.normalizeFarmSceneKey(sceneKeyRaw);
      const tileX = this.normalizeFarmTileAxis(tileXRaw, 'tileX');
      const tileY = this.normalizeFarmTileAxis(tileYRaw, 'tileY');
      await this.ensureFarmTileRow(tx, userId, sceneKey, tileX, tileY);
      const tile = await this.getFarmTileForUpdate(tx, userId, sceneKey, tileX, tileY);
      if (!tile) {
        throw new NotFoundException('Farm tile not found after initialization');
      }

      if (tile.planted_seed_item_key) {
        throw new BadRequestException(`Tile ${tileX}:${tileY} already has a planted seed`);
      }

      if (!tile.tilled || tile.watered) {
        await tx.query(
          `
            UPDATE ${FARM_TILES_TABLE}
            SET tilled = TRUE,
                watered = FALSE,
                updated_at = NOW()
            WHERE user_id = $1
              AND scene_key = $2
              AND tile_x = $3
              AND tile_y = $4
          `,
          [userId, sceneKey, tileX, tileY],
        );
      }

      const nextTile = await this.getFarmTileForUpdate(tx, userId, sceneKey, tileX, tileY);
      if (!nextTile) {
        throw new NotFoundException('Farm tile not found after till action');
      }
      const tileState = this.toFarmTileState(nextTile);
      return {
        till: {
          sceneKey: tileState.sceneKey,
          tileX: tileState.tileX,
          tileY: tileState.tileY,
          tilled: tileState.tilled,
          watered: tileState.watered,
          plantedSeedItemKey: tileState.plantedSeedItemKey,
        },
        tile: tileState,
      };
    });
  }

  async waterFarmTileByTile(
    userId: string,
    tileXRaw: number,
    tileYRaw: number,
    sceneKeyRaw?: string,
  ): Promise<{ water: GameplayFarmTileWaterResult; tile: GameplayFarmTileState }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const sceneKey = this.normalizeFarmSceneKey(sceneKeyRaw);
      const tileX = this.normalizeFarmTileAxis(tileXRaw, 'tileX');
      const tileY = this.normalizeFarmTileAxis(tileYRaw, 'tileY');
      await this.ensureFarmTileRow(tx, userId, sceneKey, tileX, tileY);
      const tile = await this.getFarmTileForUpdate(tx, userId, sceneKey, tileX, tileY);
      if (!tile) {
        throw new NotFoundException('Farm tile not found after initialization');
      }

      if (!tile.tilled) {
        throw new BadRequestException(`Tile ${tileX}:${tileY} is not tilled`);
      }
      if (tile.planted_seed_item_key) {
        throw new BadRequestException(`Tile ${tileX}:${tileY} already has a planted seed`);
      }

      if (!tile.watered) {
        await tx.query(
          `
            UPDATE ${FARM_TILES_TABLE}
            SET watered = TRUE,
                updated_at = NOW()
            WHERE user_id = $1
              AND scene_key = $2
              AND tile_x = $3
              AND tile_y = $4
          `,
          [userId, sceneKey, tileX, tileY],
        );
      }

      const nextTile = await this.getFarmTileForUpdate(tx, userId, sceneKey, tileX, tileY);
      if (!nextTile) {
        throw new NotFoundException('Farm tile not found after water action');
      }
      const tileState = this.toFarmTileState(nextTile);
      return {
        water: {
          sceneKey: tileState.sceneKey,
          tileX: tileState.tileX,
          tileY: tileState.tileY,
          tilled: tileState.tilled,
          watered: tileState.watered,
          plantedSeedItemKey: tileState.plantedSeedItemKey,
        },
        tile: tileState,
      };
    });
  }

  async plantFarmTile(
    userId: string,
    tileXRaw: number,
    tileYRaw: number,
    seedItemKeyRaw: string,
    sceneKeyRaw?: string,
  ): Promise<{ plant: GameplayFarmTilePlantResult; tile: GameplayFarmTileState }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const sceneKey = this.normalizeFarmSceneKey(sceneKeyRaw);
      const tileX = this.normalizeFarmTileAxis(tileXRaw, 'tileX');
      const tileY = this.normalizeFarmTileAxis(tileYRaw, 'tileY');
      const seedItemKey = seedItemKeyRaw.trim().toLowerCase();
      if (!seedItemKey) {
        throw new BadRequestException('seedItemKey is required');
      }

      await this.ensureFarmTileRow(tx, userId, sceneKey, tileX, tileY);
      const tile = await this.getFarmTileForUpdate(tx, userId, sceneKey, tileX, tileY);
      if (!tile) {
        throw new NotFoundException('Farm tile not found after initialization');
      }

      if (!tile.tilled) {
        throw new BadRequestException(`Tile ${tileX}:${tileY} is not tilled`);
      }
      if (!tile.watered) {
        throw new BadRequestException(`Tile ${tileX}:${tileY} is not watered`);
      }
      if (tile.planted_seed_item_key) {
        throw new BadRequestException(`Tile ${tileX}:${tileY} already has a planted seed`);
      }

      this.resolveCropBySeedItem(seedItemKey, worldFlags);
      const seedRow = await this.getInventoryItemForUpdate(tx, userId, seedItemKey);
      if (!seedRow || seedRow.quantity < 1) {
        throw new BadRequestException(`Missing seed item: ${seedItemKey}`);
      }

      const remainingSeedQuantity = seedRow.quantity - 1;
      await this.setInventoryItemQuantity(tx, userId, seedItemKey, remainingSeedQuantity);
      await tx.query(
        `
          UPDATE ${FARM_TILES_TABLE}
          SET planted_seed_item_key = $5,
              updated_at = NOW()
          WHERE user_id = $1
            AND scene_key = $2
            AND tile_x = $3
            AND tile_y = $4
        `,
        [userId, sceneKey, tileX, tileY, seedItemKey],
      );

      const nextTile = await this.getFarmTileForUpdate(tx, userId, sceneKey, tileX, tileY);
      if (!nextTile) {
        throw new NotFoundException('Farm tile not found after plant action');
      }
      const tileState = this.toFarmTileState(nextTile);
      return {
        plant: {
          sceneKey: tileState.sceneKey,
          tileX: tileState.tileX,
          tileY: tileState.tileY,
          seedItemKey,
          remainingSeedQuantity,
          tilled: tileState.tilled,
          watered: tileState.watered,
          plantedSeedItemKey: tileState.plantedSeedItemKey,
        },
        tile: tileState,
      };
    });
  }

  async sleep(userId: string): Promise<{
    sleep: GameplaySleepResult;
    world: GameplayWorldState;
    farm: GameplayFarmState;
    crafting: GameplayFarmCraftingState;
    farmStory: GameplayFarmStoryState;
  }> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      await this.ensureFarmPlots(tx, userId);

      const worldFlags = new Set(await this.getWorldFlags(userId, tx));
      this.assertFarmUnlocked(worldFlags);

      const worldBefore = await this.getWorldStateForUpdate(tx, userId);
      const dayBefore = worldBefore.day;
      const dayAfter = dayBefore + 1;

      await tx.query(
        `
          UPDATE ${WORLD_STATE_TABLE}
          SET day = $2,
              updated_at = NOW()
          WHERE user_id = $1
        `,
        [userId, dayAfter],
      );

      await tx.query(
        `
          UPDATE ${FARM_PLOTS_TABLE}
          SET watered_today = FALSE,
              updated_at = NOW()
          WHERE user_id = $1
            AND watered_today = TRUE
        `,
        [userId],
      );

      const world: GameplayWorldState = {
        zone: worldBefore.zone,
        day: dayAfter,
        farmHarvestTotal: worldBefore.farmHarvestTotal,
      };

      await this.applyFarmStoryEventFlags(tx, userId, worldFlags, dayAfter, worldBefore.farmHarvestTotal);

      const farm = await this.getFarmStateWithExecutor(tx, userId, worldFlags, dayAfter);
      const crafting = await this.getFarmCraftingStateWithExecutor(tx, userId, worldFlags);
      const farmStory = this.buildFarmStoryState(worldFlags, dayAfter, worldBefore.farmHarvestTotal);

      return {
        sleep: {
          dayBefore,
          dayAfter,
        },
        world,
        farm,
        crafting,
        farmStory,
      };
    });
  }

  async advanceIntroState(userId: string): Promise<GameplayIntroState> {
    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureWorldState(tx, userId);
      const flags = new Set(await this.getWorldFlags(userId, tx));
      const nextFlag = this.resolveNextIntroFlag(flags);

      if (!nextFlag) {
        return this.toIntroState(flags);
      }

      await tx.query(
        `
          INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key)
          VALUES ($1, $2)
          ON CONFLICT (user_id, flag_key) DO NOTHING
        `,
        [userId, nextFlag],
      );
      flags.add(nextFlag);

      if (nextFlag === INTRO_FLAG_ARRIVED_VILLAGE) {
        await tx.query(
          `
            UPDATE ${WORLD_STATE_TABLE}
            SET zone = $2, updated_at = NOW()
            WHERE user_id = $1
          `,
          [userId, 'Village'],
        );
      }

      if (nextFlag === INTRO_FLAG_FARM_ASSIGNED) {
        await tx.query(
          `
            UPDATE ${WORLD_STATE_TABLE}
            SET zone = $2, updated_at = NOW()
            WHERE user_id = $1
          `,
          [userId, 'Ferme'],
        );
      }

      return this.toIntroState(flags);
    });
  }

  private async ensureWorldState(executor: QueryExecutor, userId: string): Promise<void> {
    await executor.query(
      `
        INSERT INTO ${WORLD_STATE_TABLE} (user_id, zone, day, farm_harvest_total)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, BASE_WORLD_ZONE, BASE_WORLD_DAY],
    );
  }

  private async ensureFarmPlots(executor: QueryExecutor, userId: string): Promise<void> {
    const values: unknown[] = [userId];
    const plotRowsSql = FARM_PLOT_LAYOUT.map((plot, index) => {
      const base = index * 3;
      values.push(plot.plotKey, plot.row, plot.col);
      return `($1, $${base + 2}, $${base + 3}, $${base + 4})`;
    }).join(', ');

    await executor.query(
      `
        INSERT INTO ${FARM_PLOTS_TABLE} (user_id, plot_key, row_index, col_index)
        VALUES ${plotRowsSql}
        ON CONFLICT (user_id, plot_key) DO NOTHING
      `,
      values,
    );
  }

  private async getFarmStateWithExecutor(
    executor: QueryExecutor,
    userId: string,
    worldFlags: Set<string>,
    day: number,
  ): Promise<GameplayFarmState> {
    const plotsResult = await executor.query<FarmPlotRow>(
      `
        SELECT plot_key, row_index, col_index, crop_key, planted_day, growth_days, watered_today
        FROM ${FARM_PLOTS_TABLE}
        WHERE user_id = $1
        ORDER BY row_index ASC, col_index ASC
      `,
      [userId],
    );

    const plots = plotsResult.rows.map((row) => this.toFarmPlotState(row, day));
    const plantedPlots = plots.filter((plot) => plot.cropKey !== null).length;
    const wateredPlots = plots.filter((plot) => plot.wateredToday).length;
    const readyPlots = plots.filter((plot) => plot.readyToHarvest).length;

    return {
      unlocked: worldFlags.has(INTRO_FLAG_FARM_ASSIGNED),
      totalPlots: plots.length,
      plantedPlots,
      wateredPlots,
      readyPlots,
      cropCatalog: FARM_CROP_CATALOG.map((crop) => ({
        cropKey: crop.cropKey,
        seedItemKey: crop.seedItemKey,
        harvestItemKey: crop.harvestItemKey,
        growthDays: crop.growthDays,
        requiredFlags: [...crop.requiredFlags],
        unlocked: crop.requiredFlags.every((flag) => worldFlags.has(flag)),
      })),
      plots,
    };
  }

  private async getFarmCraftingStateWithExecutor(
    executor: QueryExecutor,
    userId: string,
    worldFlags: Set<string>,
  ): Promise<GameplayFarmCraftingState> {
    const farmUnlocked = worldFlags.has(INTRO_FLAG_FARM_ASSIGNED);
    if (!farmUnlocked) {
      return {
        unlocked: false,
        recipes: [],
        craftableRecipes: 0,
      };
    }

    const ingredientKeys = [...new Set(FARM_CRAFT_RECIPES.flatMap((recipe) => recipe.ingredients.map((entry) => entry.itemKey)))];
    const inventoryByItemKey = await this.getInventoryQuantitiesByItemKeys(executor, userId, ingredientKeys);

    const recipes = FARM_CRAFT_RECIPES.map((recipe) => {
      const unlocked = recipe.requiredFlags.every((flag) => worldFlags.has(flag));
      const ingredients = recipe.ingredients.map((ingredient) => ({
        itemKey: ingredient.itemKey,
        requiredQuantity: ingredient.quantity,
        ownedQuantity: inventoryByItemKey.get(ingredient.itemKey) ?? 0,
      }));
      const maxCraftable = ingredients.reduce((min, ingredient) => {
        const craftableForIngredient = Math.floor(ingredient.ownedQuantity / ingredient.requiredQuantity);
        return Math.min(min, craftableForIngredient);
      }, Number.POSITIVE_INFINITY);

      return {
        recipeKey: recipe.recipeKey,
        name: recipe.name,
        description: recipe.description,
        outputItemKey: recipe.outputItemKey,
        outputQuantity: recipe.outputQuantity,
        requiredFlags: [...recipe.requiredFlags],
        unlocked,
        ingredients,
        maxCraftable: unlocked ? (Number.isFinite(maxCraftable) ? maxCraftable : 0) : 0,
      };
    });

    return {
      unlocked: true,
      craftableRecipes: recipes.filter((recipe) => recipe.unlocked && recipe.maxCraftable > 0).length,
      recipes,
    };
  }

  private async getVillageStateWithExecutor(
    executor: QueryExecutor,
    userId: string,
    flags: Set<string>,
    day: number,
  ): Promise<GameplayVillageState> {
    await this.ensureVillageNpcRelationshipRows(executor, userId);
    const rows = await this.getVillageNpcRelationshipRows(executor, userId);
    const blacksmithUnlocked = flags.has('blacksmith_shop_tier_1_unlocked');
    const blacksmithCurseLifted = flags.has('blacksmith_curse_lifted');
    const npcs: GameplayVillageState['npcs'] = {
      mayor: this.resolveMayorNpcState(flags),
      blacksmith: this.resolveBlacksmithNpcState(flags, blacksmithUnlocked, blacksmithCurseLifted),
      merchant: this.resolveMerchantNpcState(flags),
    };

    return {
      blacksmith: {
        unlocked: blacksmithUnlocked,
        curseLifted: blacksmithCurseLifted,
      },
      npcs,
      relationships: this.toVillageNpcRelationships(rows, npcs, day),
    };
  }

  private buildLoopState(
    worldFlags: Set<string>,
    towerHighestFloor: number,
    relationships: VillageNpcRelationshipRow[],
    inventoryByItemKey: Map<string, number>,
  ): GameplayLoopState {
    const farmUnlocked = worldFlags.has(INTRO_FLAG_FARM_ASSIGNED);
    const villageMarketUnlocked = farmUnlocked && worldFlags.has('floor_3_cleared');
    const healingHerb = Math.max(0, inventoryByItemKey.get('healing_herb') ?? 0);
    const manaTonic = Math.max(0, inventoryByItemKey.get('mana_tonic') ?? 0);
    const preparation = this.resolveCombatPreparationState(worldFlags);

    const blockers: string[] = [];
    if (!farmUnlocked) {
      blockers.push('Completer l intro pour debloquer la ferme');
    }
    if (!villageMarketUnlocked) {
      blockers.push('Atteindre le palier tour 3 pour ouvrir le marche du village');
    }
    if (!preparation.active && healingHerb < 1 && manaTonic < 1) {
      blockers.push('Produire des consommables via recolte + crafting ferme');
    }

    const stage = this.resolveLoopStage(towerHighestFloor);
    const ready = !preparation.active && blockers.length === 0;
    const relationshipAverage = this.getVillageRelationshipAverage(relationships);
    const nextStep = blockers.length > 0
      ? blockers[0]
      : preparation.active
        ? 'Preparation active: lancer un combat pour consommer les bonus'
        : 'Preparation disponible: utiliser /gameplay/combat/prepare';

    return {
      stageKey: stage.stageKey,
      stageLabel: stage.stageLabel,
      farmUnlocked,
      villageMarketUnlocked,
      supplies: {
        healingHerb,
        manaTonic,
      },
      relationshipAverage,
      preparation: {
        ...preparation,
        ready,
        blockers,
        nextStep,
      },
    };
  }

  private resolveCombatPreparationState(worldFlags: Set<string>): GameplayCombatPreparationState {
    return {
      active: COMBAT_PREPARATION_FLAGS.some((flag) => worldFlags.has(flag)),
      hpBoostActive: worldFlags.has(COMBAT_PREPARATION_FLAG_HP),
      mpBoostActive: worldFlags.has(COMBAT_PREPARATION_FLAG_MP),
      attackBoostActive: worldFlags.has(COMBAT_PREPARATION_FLAG_ATTACK),
    };
  }

  private async applyFarmStoryEventFlags(
    executor: TransactionClient,
    userId: string,
    worldFlags: Set<string>,
    day: number,
    harvestTotal: number,
  ): Promise<void> {
    if (!worldFlags.has(INTRO_FLAG_FARM_ASSIGNED)) {
      return;
    }

    for (const event of FARM_STORY_EVENTS) {
      const progress = event.triggerType === 'day' ? day : harvestTotal;
      if (progress < event.target || worldFlags.has(event.flagKey)) {
        continue;
      }

      await executor.query(
        `
          INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id, flag_key) DO NOTHING
        `,
        [userId, event.flagKey],
      );
      worldFlags.add(event.flagKey);
    }
  }

  private buildFarmStoryState(
    worldFlags: Set<string>,
    day: number,
    harvestTotal: number,
  ): GameplayFarmStoryState {
    const farmUnlocked = worldFlags.has(INTRO_FLAG_FARM_ASSIGNED);
    const events = FARM_STORY_EVENTS.map((event) => {
      const progress = event.triggerType === 'day' ? day : harvestTotal;
      const unlocked = farmUnlocked && progress >= event.target;
      return {
        key: event.key,
        flagKey: event.flagKey,
        triggerType: event.triggerType,
        target: event.target,
        progress: Math.max(0, progress),
        unlocked,
        title: event.title,
        narrative: event.narrative,
      };
    });

    const nextLockedEvent = events.find((event) => !event.unlocked) ?? null;
    const unlockedEvents = events.filter((event) => event.unlocked).length;

    if (!farmUnlocked) {
      return {
        farmUnlocked,
        day: Math.max(1, day),
        harvestTotal: Math.max(0, harvestTotal),
        unlockedEvents: 0,
        totalEvents: events.length,
        activeEventKey: events[0]?.key ?? null,
        activeEventTitle: 'Ferme verrouillee',
        activeEventNarrative: 'Termine l intro pour declencher les evenements scenario de ferme.',
        events,
      };
    }

    if (nextLockedEvent) {
      const triggerLabel = nextLockedEvent.triggerType === 'day' ? `Jour ${nextLockedEvent.target}` : `${nextLockedEvent.target} recoltes`;
      return {
        farmUnlocked,
        day: Math.max(1, day),
        harvestTotal: Math.max(0, harvestTotal),
        unlockedEvents,
        totalEvents: events.length,
        activeEventKey: nextLockedEvent.key,
        activeEventTitle: `${nextLockedEvent.title} (${triggerLabel})`,
        activeEventNarrative: nextLockedEvent.narrative,
        events,
      };
    }

    return {
      farmUnlocked,
      day: Math.max(1, day),
      harvestTotal: Math.max(0, harvestTotal),
      unlockedEvents,
      totalEvents: events.length,
      activeEventKey: null,
      activeEventTitle: 'Scenario ferme (lot 103) complete',
      activeEventNarrative: 'Tous les beats jour/recolte de la premiere passe ont ete declenches.',
      events,
    };
  }

  private buildTowerStoryState(
    worldFlags: Set<string>,
    highestFloor: number,
  ): GameplayTowerStoryState {
    const events = TOWER_STORY_EVENTS.map((event) => {
      const reached = highestFloor >= event.milestoneFloor || worldFlags.has(event.milestoneFlagKey);
      const reported = worldFlags.has(event.reportFlagKey);
      return {
        key: event.key,
        milestoneFloor: event.milestoneFloor,
        milestoneFlagKey: event.milestoneFlagKey,
        reportFlagKey: event.reportFlagKey,
        reached,
        reported,
        title: event.title,
        narrative: event.narrative,
      };
    });

    const activePendingReport = events.find((event) => event.reached && !event.reported) ?? null;
    const nextUnreached = events.find((event) => !event.reached) ?? null;
    const reachedEvents = events.filter((event) => event.reached).length;
    const reportedEvents = events.filter((event) => event.reported).length;

    if (activePendingReport) {
      return {
        highestFloor: Math.max(1, highestFloor),
        reachedEvents,
        reportedEvents,
        totalEvents: events.length,
        activeEventKey: activePendingReport.key,
        activeEventTitle: `${activePendingReport.title} (rapport en attente)`,
        activeEventNarrative: activePendingReport.narrative,
        events,
      };
    }

    if (nextUnreached) {
      return {
        highestFloor: Math.max(1, highestFloor),
        reachedEvents,
        reportedEvents,
        totalEvents: events.length,
        activeEventKey: nextUnreached.key,
        activeEventTitle: `${nextUnreached.title} (palier ${nextUnreached.milestoneFloor})`,
        activeEventNarrative: nextUnreached.narrative,
        events,
      };
    }

    return {
      highestFloor: Math.max(1, highestFloor),
      reachedEvents,
      reportedEvents,
      totalEvents: events.length,
      activeEventKey: null,
      activeEventTitle: 'Tower story phase 1 complete',
      activeEventNarrative: 'Tous les beats narratifs relies aux paliers 3/5/8/10 sont atteints.',
      events,
    };
  }

  private resolveLoopStage(towerHighestFloor: number): Pick<GameplayLoopState, 'stageKey' | 'stageLabel'> {
    if (towerHighestFloor < 3) {
      return {
        stageKey: 'tower_bootstrap',
        stageLabel: 'Stabiliser la tour (palier 3)',
      };
    }

    if (towerHighestFloor < 5) {
      return {
        stageKey: 'village_sync',
        stageLabel: 'Deblocages village et approvisionnement',
      };
    }

    if (towerHighestFloor < 8) {
      return {
        stageKey: 'farm_scale',
        stageLabel: 'Monter la ferme pour soutenir les expeditions',
      };
    }

    return {
      stageKey: 'combat_mastery',
      stageLabel: 'Preparation combat avancee pour paliers hauts',
    };
  }

  private getVillageRelationshipAverage(rows: VillageNpcRelationshipRow[]): number {
    if (rows.length === 0) {
      return 0;
    }

    const total = rows.reduce((sum, row) => sum + Math.max(0, Math.floor(row.friendship)), 0);
    return Number((total / rows.length).toFixed(2));
  }

  private toFarmPlotState(row: FarmPlotRow, day: number): GameplayFarmState['plots'][number] {
    const maturity = this.toFarmPlotMaturity(row, day);

    return {
      plotKey: row.plot_key,
      row: Math.max(1, Math.floor(row.row_index)),
      col: Math.max(1, Math.floor(row.col_index)),
      cropKey: row.crop_key,
      plantedDay: maturity.plantedDay,
      growthDays: maturity.growthDays,
      wateredToday: Boolean(row.watered_today),
      growthProgressDays: maturity.growthProgressDays,
      daysToMaturity: maturity.daysToMaturity,
      readyToHarvest: maturity.readyToHarvest,
    };
  }

  private toFarmPlotMaturity(
    plot: Pick<FarmPlotRow, 'planted_day' | 'growth_days'>,
    day: number,
  ): {
    plantedDay: number | null;
    growthDays: number | null;
    growthProgressDays: number;
    daysToMaturity: number | null;
    readyToHarvest: boolean;
  } {
    const plantedDay = typeof plot.planted_day === 'number' && plot.planted_day > 0
      ? Math.floor(plot.planted_day)
      : null;
    const growthDays = typeof plot.growth_days === 'number' && plot.growth_days > 0
      ? Math.floor(plot.growth_days)
      : null;
    const growthProgressDays = plantedDay !== null ? Math.max(0, day - plantedDay) : 0;
    const daysToMaturity = growthDays !== null ? Math.max(0, growthDays - growthProgressDays) : null;
    const readyToHarvest = growthDays !== null && growthProgressDays >= growthDays;

    return {
      plantedDay,
      growthDays,
      growthProgressDays,
      daysToMaturity,
      readyToHarvest,
    };
  }

  private assertFarmUnlocked(worldFlags: Set<string>): void {
    if (!worldFlags.has(INTRO_FLAG_FARM_ASSIGNED)) {
      throw new ForbiddenException('Farm is locked');
    }
  }

  private resolveCraftRecipe(recipeKey: string, worldFlags: Set<string>) {
    const recipe = FARM_CRAFT_RECIPES.find((entry) => entry.recipeKey === recipeKey);
    if (!recipe) {
      throw new NotFoundException(`Unknown farm craft recipe: ${recipeKey}`);
    }

    if (!recipe.requiredFlags.every((flag) => worldFlags.has(flag))) {
      throw new ForbiddenException(`Farm craft recipe is locked: ${recipeKey}`);
    }

    return recipe;
  }

  private resolveCropBySeedItem(seedItemKey: string, worldFlags: Set<string>) {
    const crop = FARM_CROP_CATALOG.find((entry) => entry.seedItemKey === seedItemKey);
    if (!crop) {
      throw new NotFoundException(`Unknown seed item: ${seedItemKey}`);
    }
    if (!crop.requiredFlags.every((flag) => worldFlags.has(flag))) {
      throw new ForbiddenException(`Crop is locked for seed item: ${seedItemKey}`);
    }

    return crop;
  }

  private resolveCropByCropKey(cropKey: string) {
    const crop = FARM_CROP_CATALOG.find((entry) => entry.cropKey === cropKey);
    if (!crop) {
      throw new NotFoundException(`Unknown crop key: ${cropKey}`);
    }

    return crop;
  }

  private async getTowerState(executor: QueryExecutor, userId: string): Promise<{
    currentFloor: number;
    highestFloor: number;
    bossFloor10Defeated: boolean;
  }> {
    await executor.query(
      `
        INSERT INTO ${TOWER_PROGRESSION_TABLE} (user_id, current_floor, highest_floor, boss_floor_10_defeated)
        VALUES ($1, 1, 1, FALSE)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId],
    );

    const result = await executor.query<TowerProgressionRow>(
      `
        SELECT current_floor, highest_floor, boss_floor_10_defeated
        FROM ${TOWER_PROGRESSION_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        currentFloor: 1,
        highestFloor: 1,
        bossFloor10Defeated: false,
      };
    }

    return {
      currentFloor: Math.max(1, Math.floor(row.current_floor)),
      highestFloor: Math.max(1, Math.floor(row.highest_floor)),
      bossFloor10Defeated: Boolean(row.boss_floor_10_defeated),
    };
  }

  private async getWorldStateForUpdate(executor: TransactionClient, userId: string): Promise<GameplayWorldState> {
    const result = await executor.query<WorldStateRow>(
      `
        SELECT zone, day, farm_harvest_total
        FROM ${WORLD_STATE_TABLE}
        WHERE user_id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        zone: BASE_WORLD_ZONE,
        day: BASE_WORLD_DAY,
        farmHarvestTotal: 0,
      };
    }

    return {
      zone: row.zone?.trim() ? row.zone.trim() : BASE_WORLD_ZONE,
      day: Number.isFinite(row.day) && row.day > 0 ? Math.floor(row.day) : BASE_WORLD_DAY,
      farmHarvestTotal:
        Number.isFinite(row.farm_harvest_total) && row.farm_harvest_total >= 0
          ? Math.floor(row.farm_harvest_total)
          : 0,
    };
  }

  private async getFarmPlotForUpdate(
    executor: TransactionClient,
    userId: string,
    plotKey: string,
  ): Promise<FarmPlotRow | null> {
    const result = await executor.query<FarmPlotRow>(
      `
        SELECT plot_key, row_index, col_index, crop_key, planted_day, growth_days, watered_today
        FROM ${FARM_PLOTS_TABLE}
        WHERE user_id = $1
          AND plot_key = $2
        LIMIT 1
        FOR UPDATE
      `,
      [userId, plotKey],
    );

    return result.rows[0] ?? null;
  }

  private normalizeFarmSceneKey(sceneKeyRaw?: string): string {
    const trimmed = sceneKeyRaw?.trim().toLowerCase();
    if (!trimmed) {
      return 'farm';
    }
    return trimmed.slice(0, 64);
  }

  private normalizeFarmTileAxis(value: number, label: 'tileX' | 'tileY'): number {
    if (!Number.isFinite(value)) {
      throw new BadRequestException(`${label} must be a finite number`);
    }

    const normalized = Math.floor(value);
    if (normalized < 0) {
      throw new BadRequestException(`${label} must be >= 0`);
    }

    return normalized;
  }

  private async ensureFarmTileRow(
    executor: QueryExecutor,
    userId: string,
    sceneKey: string,
    tileX: number,
    tileY: number,
  ): Promise<void> {
    await executor.query(
      `
        INSERT INTO ${FARM_TILES_TABLE} (user_id, scene_key, tile_x, tile_y, tilled, watered, planted_seed_item_key)
        VALUES ($1, $2, $3, $4, FALSE, FALSE, NULL)
        ON CONFLICT (user_id, scene_key, tile_x, tile_y) DO NOTHING
      `,
      [userId, sceneKey, tileX, tileY],
    );
  }

  private async getFarmTileForUpdate(
    executor: TransactionClient,
    userId: string,
    sceneKey: string,
    tileX: number,
    tileY: number,
  ): Promise<FarmTileRow | null> {
    const result = await executor.query<FarmTileRow>(
      `
        SELECT scene_key, tile_x, tile_y, tilled, watered, planted_seed_item_key
        FROM ${FARM_TILES_TABLE}
        WHERE user_id = $1
          AND scene_key = $2
          AND tile_x = $3
          AND tile_y = $4
        LIMIT 1
        FOR UPDATE
      `,
      [userId, sceneKey, tileX, tileY],
    );

    return result.rows[0] ?? null;
  }

  private toFarmTileState(row: FarmTileRow): GameplayFarmTileState {
    return {
      sceneKey: row.scene_key?.trim() ? row.scene_key.trim() : 'farm',
      tileX: Math.max(0, Math.floor(row.tile_x)),
      tileY: Math.max(0, Math.floor(row.tile_y)),
      tilled: Boolean(row.tilled),
      watered: Boolean(row.watered),
      plantedSeedItemKey: row.planted_seed_item_key?.trim() ? row.planted_seed_item_key.trim() : null,
    };
  }

  private async getInventoryItemForUpdate(
    executor: TransactionClient,
    userId: string,
    itemKey: string,
  ): Promise<InventoryRow | null> {
    const result = await executor.query<InventoryRow>(
      `
        SELECT item_key, quantity
        FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
          AND item_key = $2
        LIMIT 1
        FOR UPDATE
      `,
      [userId, itemKey],
    );

    return result.rows[0] ?? null;
  }

  private async setInventoryItemQuantity(
    executor: TransactionClient,
    userId: string,
    itemKey: string,
    quantity: number,
  ): Promise<void> {
    if (quantity > 0) {
      await executor.query(
        `
          UPDATE ${INVENTORY_ITEMS_TABLE}
          SET quantity = $3,
              updated_at = NOW()
          WHERE user_id = $1
            AND item_key = $2
        `,
        [userId, itemKey, quantity],
      );
      return;
    }

    await executor.query(
      `
        DELETE FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
          AND item_key = $2
      `,
      [userId, itemKey],
    );
  }

  private async addInventoryQuantity(
    executor: TransactionClient,
    userId: string,
    itemKey: string,
    quantity: number,
  ): Promise<InventoryRow> {
    const result = await executor.query<InventoryRow>(
      `
        INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, item_key)
        DO UPDATE
          SET quantity = ${INVENTORY_ITEMS_TABLE}.quantity + EXCLUDED.quantity,
              updated_at = NOW()
        RETURNING item_key, quantity
      `,
      [userId, itemKey, quantity],
    );

    return result.rows[0];
  }

  private async getInventoryQuantitiesByItemKeys(
    executor: QueryExecutor,
    userId: string,
    itemKeys: string[],
  ): Promise<Map<string, number>> {
    const inventoryByItemKey = new Map<string, number>();
    if (itemKeys.length === 0) {
      return inventoryByItemKey;
    }

    const result = await executor.query<InventoryRow>(
      `
        SELECT item_key, quantity
        FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
          AND item_key = ANY($2::text[])
      `,
      [userId, itemKeys],
    );

    for (const row of result.rows) {
      inventoryByItemKey.set(row.item_key, row.quantity);
    }

    return inventoryByItemKey;
  }

  private async ensureVillageNpcRelationshipRows(executor: QueryExecutor, userId: string): Promise<void> {
    for (const npcKey of VILLAGE_NPC_KEYS) {
      await executor.query(
        `
          INSERT INTO ${VILLAGE_NPC_RELATIONSHIPS_TABLE} (user_id, npc_key, friendship, last_interaction_day)
          VALUES ($1, $2, 0, NULL)
          ON CONFLICT (user_id, npc_key) DO NOTHING
        `,
        [userId, npcKey],
      );
    }
  }

  private async getVillageNpcRelationshipRows(
    executor: QueryExecutor,
    userId: string,
  ): Promise<VillageNpcRelationshipRow[]> {
    const result = await executor.query<VillageNpcRelationshipRow>(
      `
        SELECT npc_key, friendship, last_interaction_day
        FROM ${VILLAGE_NPC_RELATIONSHIPS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );

    return result.rows;
  }

  private async getVillageNpcRelationshipRowForUpdate(
    executor: TransactionClient,
    userId: string,
    npcKey: VillageNpcKey,
  ): Promise<VillageNpcRelationshipRow> {
    const result = await executor.query<VillageNpcRelationshipRow>(
      `
        SELECT npc_key, friendship, last_interaction_day
        FROM ${VILLAGE_NPC_RELATIONSHIPS_TABLE}
        WHERE user_id = $1
          AND npc_key = $2
        LIMIT 1
        FOR UPDATE
      `,
      [userId, npcKey],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Village relationship row not found for ${npcKey}`);
    }

    return row;
  }

  private toVillageNpcRelationships(
    rows: VillageNpcRelationshipRow[],
    npcs: GameplayVillageState['npcs'],
    day: number,
  ): GameplayVillageState['relationships'] {
    const byKey = new Map(rows.map((row) => [row.npc_key, row]));

    const toEntry = (npcKey: VillageNpcKey): GameplayVillageState['relationships'][VillageNpcKey] => {
      const row = byKey.get(npcKey);
      const friendship = Math.max(0, Math.floor(row?.friendship ?? 0));
      const lastInteractionDay =
        typeof row?.last_interaction_day === 'number' && row.last_interaction_day > 0
          ? Math.floor(row.last_interaction_day)
          : null;

      return {
        friendship,
        tier: this.toVillageRelationshipTier(friendship),
        lastInteractionDay,
        canTalkToday: npcs[npcKey].available && lastInteractionDay !== day,
      };
    };

    return {
      mayor: toEntry('mayor'),
      blacksmith: toEntry('blacksmith'),
      merchant: toEntry('merchant'),
    };
  }

  private async getWorldFlags(userId: string, executor: QueryExecutor = this.databaseService): Promise<string[]> {
    const result = await executor.query<WorldFlagRow>(
      `
        SELECT flag_key
        FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
        ORDER BY flag_key ASC
      `,
      [userId],
    );

    return result.rows.map((row) => row.flag_key);
  }

  private resolveVillageNpcKeyOrThrow(npcKey: string): VillageNpcKey {
    const normalizedNpcKey = npcKey.trim().toLowerCase();
    if (!VILLAGE_NPC_KEYS.includes(normalizedNpcKey as VillageNpcKey)) {
      throw new NotFoundException(`Unknown village npc key: ${npcKey}`);
    }

    return normalizedNpcKey as VillageNpcKey;
  }

  private toVillageRelationshipTier(friendship: number): GameplayVillageNpcRelationshipTier {
    if (friendship >= 20) {
      return 'ally';
    }
    if (friendship >= 12) {
      return 'trusted';
    }
    if (friendship >= 5) {
      return 'familiar';
    }

    return 'stranger';
  }

  private resolveNextIntroFlag(flags: Set<string>): string | null {
    for (const flag of INTRO_PROGRESS_FLAGS) {
      if (!flags.has(flag)) {
        return flag;
      }
    }

    return null;
  }

  private toIntroState(flags: Set<string>): GameplayIntroState {
    const arriveVillage = flags.has(INTRO_FLAG_ARRIVED_VILLAGE);
    const metMayor = flags.has(INTRO_FLAG_MET_MAYOR);
    const farmAssigned = flags.has(INTRO_FLAG_FARM_ASSIGNED);

    const currentStep = !arriveVillage
      ? 'arrive_village'
      : !metMayor
        ? 'meet_mayor'
        : !farmAssigned
          ? 'farm_assignment'
          : 'completed';

    return {
      currentStep,
      completed: farmAssigned,
      steps: {
        arriveVillage,
        metMayor,
        farmAssigned,
      },
    };
  }

  private resolveMayorNpcState(flags: Set<string>): GameplayVillageState['npcs']['mayor'] {
    const arrivedVillage = flags.has(INTRO_FLAG_ARRIVED_VILLAGE);
    const metMayor = flags.has(INTRO_FLAG_MET_MAYOR);
    const farmAssigned = flags.has(INTRO_FLAG_FARM_ASSIGNED);
    const reachedStoryFloor5 = flags.has('story_floor_5_cleared');

    if (!arrivedVillage) {
      return {
        stateKey: 'offscreen',
        available: false,
      };
    }

    if (!metMayor) {
      return {
        stateKey: 'awaiting_meeting',
        available: true,
      };
    }

    if (!farmAssigned) {
      return {
        stateKey: 'briefing',
        available: true,
      };
    }

    if (!reachedStoryFloor5) {
      return {
        stateKey: 'village_overseer',
        available: true,
      };
    }

    return {
      stateKey: 'tower_strategist',
      available: true,
    };
  }

  private resolveBlacksmithNpcState(
    flags: Set<string>,
    unlocked: boolean,
    curseLifted: boolean,
  ): GameplayVillageState['npcs']['blacksmith'] {
    if (!curseLifted) {
      return {
        stateKey: 'cursed',
        available: false,
      };
    }

    if (!unlocked) {
      return {
        stateKey: 'recovering',
        available: false,
      };
    }

    if (flags.has('story_floor_8_cleared')) {
      return {
        stateKey: 'masterwork_ready',
        available: true,
      };
    }

    return {
      stateKey: 'open',
      available: true,
    };
  }

  private resolveMerchantNpcState(flags: Set<string>): GameplayVillageState['npcs']['merchant'] {
    if (!flags.has(INTRO_FLAG_FARM_ASSIGNED)) {
      return {
        stateKey: 'absent',
        available: false,
      };
    }

    if (!flags.has('floor_3_cleared')) {
      return {
        stateKey: 'setting_stall',
        available: false,
      };
    }

    if (!flags.has('story_floor_5_cleared')) {
      return {
        stateKey: 'open',
        available: true,
      };
    }

    return {
      stateKey: 'traveling_buyer',
      available: true,
    };
  }
}
