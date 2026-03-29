import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import type { GameplayWorldState, PlayerProgressionState } from './gameplay.types';

type PlayerProgressionRow = {
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

@Injectable()
export class GameplayService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPlayerProgression(userId: string): Promise<PlayerProgressionState> {
    await this.databaseService.query(
      `
        INSERT INTO player_progression (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId],
    );

    const result = await this.databaseService.query<PlayerProgressionRow>(
      `
        SELECT level, experience, experience_to_next, gold
        FROM player_progression
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

  getWorldState(): GameplayWorldState {
    return {
      zone: 'Ferme',
      day: 1,
    };
  }
}
