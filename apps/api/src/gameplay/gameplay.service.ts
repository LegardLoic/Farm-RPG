import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { TransactionClient } from '../database/database.service';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
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
  INTRO_FLAG_ARRIVED_VILLAGE,
  INTRO_FLAG_FARM_ASSIGNED,
  INTRO_FLAG_MET_MAYOR,
  INTRO_PROGRESS_FLAGS,
  FARM_CROP_CATALOG,
  FARM_PLOTS_TABLE,
  FARM_PLOT_LAYOUT,
  PLAYER_PROGRESSION_TABLE,
  WORLD_STATE_TABLE,
  WORLD_FLAGS_TABLE,
  clampPlayerLevel,
  xpRequiredForLevel,
} from './gameplay.constants';
import type {
  GameplayFarmHarvestResult,
  GameplayFarmPlantResult,
  GameplayFarmState,
  GameplaySleepResult,
  GameplayFarmWaterResult,
  GameplayIntroState,
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

type InventoryRow = {
  item_key: string;
  quantity: number;
};

type QueryExecutor = Pick<DatabaseService, 'query'> | TransactionClient;

@Injectable()
export class GameplayService {
  constructor(private readonly databaseService: DatabaseService) {}

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
    const flags = new Set(await this.getWorldFlags(userId));
    const blacksmithUnlocked = flags.has('blacksmith_shop_tier_1_unlocked');
    const blacksmithCurseLifted = flags.has('blacksmith_curse_lifted');

    return {
      blacksmith: {
        unlocked: blacksmithUnlocked,
        curseLifted: blacksmithCurseLifted,
      },
      npcs: {
        mayor: this.resolveMayorNpcState(flags),
        blacksmith: this.resolveBlacksmithNpcState(flags, blacksmithUnlocked, blacksmithCurseLifted),
        merchant: this.resolveMerchantNpcState(flags),
      },
    };
  }

  async getWorldState(userId: string): Promise<GameplayWorldState> {
    await this.databaseService.query(
      `
        INSERT INTO ${WORLD_STATE_TABLE} (user_id, zone, day)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, BASE_WORLD_ZONE, BASE_WORLD_DAY],
    );

    const result = await this.databaseService.query<WorldStateRow>(
      `
        SELECT zone, day
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
      };
    }

    return {
      zone: row.zone?.trim() ? row.zone.trim() : BASE_WORLD_ZONE,
      day: Number.isFinite(row.day) && row.day > 0 ? Math.floor(row.day) : BASE_WORLD_DAY,
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

      const farm = await this.getFarmStateWithExecutor(tx, userId, worldFlags, world.day);
      return {
        harvest: {
          plotKey,
          cropKey: crop.cropKey,
          harvestItemKey: crop.harvestItemKey,
          quantityGained: 1,
          totalHarvestItemQuantity: inventoryRow.quantity,
        },
        farm,
      };
    });
  }

  async sleep(userId: string): Promise<{
    sleep: GameplaySleepResult;
    world: GameplayWorldState;
    farm: GameplayFarmState;
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
      };
      const farm = await this.getFarmStateWithExecutor(tx, userId, worldFlags, dayAfter);

      return {
        sleep: {
          dayBefore,
          dayAfter,
        },
        world,
        farm,
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
        INSERT INTO ${WORLD_STATE_TABLE} (user_id, zone, day)
        VALUES ($1, $2, $3)
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

  private async getWorldStateForUpdate(executor: TransactionClient, userId: string): Promise<GameplayWorldState> {
    const result = await executor.query<WorldStateRow>(
      `
        SELECT zone, day
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
      };
    }

    return {
      zone: row.zone?.trim() ? row.zone.trim() : BASE_WORLD_ZONE,
      day: Number.isFinite(row.day) && row.day > 0 ? Math.floor(row.day) : BASE_WORLD_DAY,
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
