import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
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
  PLAYER_PROGRESSION_TABLE,
  WORLD_STATE_TABLE,
  WORLD_FLAGS_TABLE,
  xpRequiredForLevel,
} from './gameplay.constants';
import type { GameplayVillageState, GameplayWorldState, PlayerProgressionState } from './gameplay.types';

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
    return {
      level: row.level,
      experience: row.experience,
      experienceToNextLevel: row.experience_to_next,
      gold: row.gold,
      currentHp: row.current_hp,
      maxHp: row.max_hp,
      currentMp: row.current_mp,
      maxMp: row.max_mp,
    };
  }

  async getVillageState(userId: string): Promise<GameplayVillageState> {
    const result = await this.databaseService.query<WorldFlagRow>(
      `
        SELECT flag_key
        FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );

    const flags = new Set(result.rows.map((row) => row.flag_key));

    return {
      blacksmith: {
        unlocked: flags.has('blacksmith_shop_tier_1_unlocked'),
        curseLifted: flags.has('blacksmith_curse_lifted'),
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
}
