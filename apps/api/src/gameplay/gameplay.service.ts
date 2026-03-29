import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import {
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  PLAYER_PROGRESSION_TABLE,
  WORLD_FLAGS_TABLE,
  xpRequiredForLevel,
} from './gameplay.constants';
import type { GameplayVillageState, GameplayWorldState, PlayerProgressionState } from './gameplay.types';

type PlayerProgressionRow = {
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

type WorldFlagRow = {
  flag_key: string;
};

@Injectable()
export class GameplayService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPlayerProgression(userId: string): Promise<PlayerProgressionState> {
    await this.databaseService.query(
      `
        INSERT INTO ${PLAYER_PROGRESSION_TABLE} (user_id, level, experience, experience_to_next, gold)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, BASE_PLAYER_LEVEL, BASE_PLAYER_EXPERIENCE, xpRequiredForLevel(BASE_PLAYER_LEVEL), BASE_PLAYER_GOLD],
    );

    const result = await this.databaseService.query<PlayerProgressionRow>(
      `
        SELECT level, experience, experience_to_next, gold
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

  getWorldState(): GameplayWorldState {
    return {
      zone: 'Ferme',
      day: 1,
    };
  }
}
