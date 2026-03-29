import { Injectable } from '@nestjs/common';

import { DatabaseService, type TransactionClient } from '../database/database.service';
import {
  TOWER_MILESTONE_FLOORS,
  TOWER_MIN_FLOOR,
  TOWER_MVP_MAX_FLOOR,
  TOWER_PROGRESSION_TABLE,
  WORLD_FLAGS_TABLE,
} from './tower.constants';
import type { TowerState, TowerVictoryProgress } from './tower.types';

type TowerProgressionRow = {
  user_id: string;
  current_floor: number;
  highest_floor: number;
  boss_floor_10_defeated: boolean;
};

@Injectable()
export class TowerService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getState(userId: string): Promise<TowerState> {
    return this.databaseService.withTransaction(async (tx) => {
      return this.getStateForUpdate(tx, userId);
    });
  }

  async getStateForUpdate(executor: TransactionClient, userId: string): Promise<TowerState> {
    const row = await this.getProgressionForUpdate(executor, userId);
    return this.toTowerState(row);
  }

  async recordCombatVictory(
    executor: TransactionClient,
    userId: string,
  ): Promise<TowerVictoryProgress> {
    const progression = await this.getProgressionForUpdate(executor, userId);
    const previousFloor = progression.current_floor;
    const currentFloor = Math.min(previousFloor + 1, TOWER_MVP_MAX_FLOOR);
    const highestFloor = Math.max(progression.highest_floor, currentFloor);
    const bossDefeated = progression.boss_floor_10_defeated || currentFloor >= TOWER_MVP_MAX_FLOOR;

    const updateResult = await executor.query<TowerProgressionRow>(
      `
        UPDATE ${TOWER_PROGRESSION_TABLE}
        SET current_floor = $2,
            highest_floor = $3,
            boss_floor_10_defeated = $4,
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING user_id, current_floor, highest_floor, boss_floor_10_defeated
      `,
      [userId, currentFloor, highestFloor, bossDefeated],
    );

    const updated = updateResult.rows[0];
    const reachedMilestoneFlags: string[] = [];

    for (const floor of TOWER_MILESTONE_FLOORS) {
      if (previousFloor < floor && currentFloor >= floor) {
        const flag = floor === 10 ? 'boss_floor_10_defeated' : `floor_${floor}_cleared`;
        reachedMilestoneFlags.push(flag);

        await executor.query(
          `
            INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, flag_key)
            DO NOTHING
          `,
          [userId, flag],
        );
      }
    }

    if (currentFloor >= TOWER_MVP_MAX_FLOOR) {
      await executor.query(
        `
          INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
          VALUES ($1, 'tower_mvp_complete', NOW())
          ON CONFLICT (user_id, flag_key)
          DO NOTHING
        `,
        [userId],
      );
    }

    return {
      previousFloor,
      currentFloor: updated.current_floor,
      reachedMilestoneFlags,
      state: this.toTowerState(updated),
    };
  }

  private async getProgressionForUpdate(
    executor: TransactionClient,
    userId: string,
  ): Promise<TowerProgressionRow> {
    await executor.query(
      `
        INSERT INTO ${TOWER_PROGRESSION_TABLE} (user_id, current_floor, highest_floor, boss_floor_10_defeated)
        VALUES ($1, $2, $3, FALSE)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, TOWER_MIN_FLOOR, TOWER_MIN_FLOOR],
    );

    const result = await executor.query<TowerProgressionRow>(
      `
        SELECT user_id, current_floor, highest_floor, boss_floor_10_defeated
        FROM ${TOWER_PROGRESSION_TABLE}
        WHERE user_id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [userId],
    );

    return result.rows[0];
  }

  private toTowerState(row: TowerProgressionRow): TowerState {
    return {
      currentFloor: row.current_floor,
      highestFloor: row.highest_floor,
      bossFloor10Defeated: row.boss_floor_10_defeated,
      mvpCompleted: row.boss_floor_10_defeated,
      nextBossFloor: row.boss_floor_10_defeated ? null : TOWER_MVP_MAX_FLOOR,
    };
  }
}
