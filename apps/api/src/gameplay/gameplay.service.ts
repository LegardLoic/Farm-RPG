import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { TransactionClient } from '../database/database.service';
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
  PLAYER_PROGRESSION_TABLE,
  WORLD_STATE_TABLE,
  WORLD_FLAGS_TABLE,
  clampPlayerLevel,
  xpRequiredForLevel,
} from './gameplay.constants';
import type { GameplayIntroState, GameplayVillageState, GameplayWorldState, PlayerProgressionState } from './gameplay.types';

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
