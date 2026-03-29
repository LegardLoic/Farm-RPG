import { BadRequestException, Injectable } from '@nestjs/common';

import { COMBAT_ENCOUNTERS_TABLE } from '../combat/combat.constants';
import { DatabaseService, type TransactionClient } from '../database/database.service';
import {
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  PLAYER_PROGRESSION_TABLE,
  WORLD_FLAGS_TABLE,
  xpRequiredForLevel,
} from '../gameplay/gameplay.constants';
import { EQUIPMENT_SLOTS_TABLE } from '../equipment/equipment.constants';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import { QUEST_STATES_TABLE } from '../quests/quests.constants';
import { TOWER_MIN_FLOOR, TOWER_PROGRESSION_TABLE } from '../tower/tower.constants';
import type { DebugGrantItemDto, DebugGrantResourcesDto } from './dto/debug-grant-resources.dto';

type ResetProgressionResult = {
  progression: {
    level: number;
    experience: number;
    experienceToNextLevel: number;
    gold: number;
  };
  tower: {
    currentFloor: number;
    highestFloor: number;
    bossFloor10Defeated: boolean;
  };
  deleted: {
    inventoryItems: number;
    equipmentItems: number;
    worldFlags: number;
    questStates: number;
    combatEncounters: number;
    manualSaveSlots: number;
    autosaves: number;
  };
};

type PlayerProgressionRow = {
  user_id: string;
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

type DebugGrantResourcesResult = {
  requested: {
    experience: number;
    gold: number;
    items: Array<{ itemKey: string; quantity: number }>;
  };
  progressionBefore: {
    level: number;
    experience: number;
    experienceToNextLevel: number;
    gold: number;
  };
  progressionAfter: {
    level: number;
    experience: number;
    experienceToNextLevel: number;
    gold: number;
  };
  inventoryGranted: Array<{ itemKey: string; quantity: number }>;
};

const SAVE_SLOTS_TABLE = 'save_slots';
const AUTOSAVES_TABLE = 'autosaves';

@Injectable()
export class DebugAdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async resetProgression(userId: string): Promise<ResetProgressionResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const inventoryDelete = await tx.query(
        `
          DELETE FROM ${INVENTORY_ITEMS_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const equipmentDelete = await tx.query(
        `
          DELETE FROM ${EQUIPMENT_SLOTS_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const worldFlagsDelete = await tx.query(
        `
          DELETE FROM ${WORLD_FLAGS_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const questsDelete = await tx.query(
        `
          DELETE FROM ${QUEST_STATES_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const combatDelete = await tx.query(
        `
          DELETE FROM ${COMBAT_ENCOUNTERS_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const savesDelete = await tx.query(
        `
          DELETE FROM ${SAVE_SLOTS_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const autosaveDelete = await tx.query(
        `
          DELETE FROM ${AUTOSAVES_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      const progressionLevel = BASE_PLAYER_LEVEL;
      const progressionExperience = BASE_PLAYER_EXPERIENCE;
      const progressionExperienceToNextLevel = xpRequiredForLevel(BASE_PLAYER_LEVEL);
      const progressionGold = BASE_PLAYER_GOLD;

      await tx.query(
        `
          INSERT INTO ${PLAYER_PROGRESSION_TABLE} (user_id, level, experience, experience_to_next, gold, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (user_id)
          DO UPDATE
            SET level = EXCLUDED.level,
                experience = EXCLUDED.experience,
                experience_to_next = EXCLUDED.experience_to_next,
                gold = EXCLUDED.gold,
                updated_at = NOW()
        `,
        [
          userId,
          progressionLevel,
          progressionExperience,
          progressionExperienceToNextLevel,
          progressionGold,
        ],
      );

      const towerCurrentFloor = TOWER_MIN_FLOOR;
      const towerHighestFloor = TOWER_MIN_FLOOR;
      const towerBossFloor10Defeated = false;

      await tx.query(
        `
          INSERT INTO ${TOWER_PROGRESSION_TABLE} (
            user_id,
            current_floor,
            highest_floor,
            boss_floor_10_defeated,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (user_id)
          DO UPDATE
            SET current_floor = EXCLUDED.current_floor,
                highest_floor = EXCLUDED.highest_floor,
                boss_floor_10_defeated = EXCLUDED.boss_floor_10_defeated,
                updated_at = NOW()
        `,
        [userId, towerCurrentFloor, towerHighestFloor, towerBossFloor10Defeated],
      );

      return {
        progression: {
          level: progressionLevel,
          experience: progressionExperience,
          experienceToNextLevel: progressionExperienceToNextLevel,
          gold: progressionGold,
        },
        tower: {
          currentFloor: towerCurrentFloor,
          highestFloor: towerHighestFloor,
          bossFloor10Defeated: towerBossFloor10Defeated,
        },
        deleted: {
          inventoryItems: inventoryDelete.rowCount ?? 0,
          equipmentItems: equipmentDelete.rowCount ?? 0,
          worldFlags: worldFlagsDelete.rowCount ?? 0,
          questStates: questsDelete.rowCount ?? 0,
          combatEncounters: combatDelete.rowCount ?? 0,
          manualSaveSlots: savesDelete.rowCount ?? 0,
          autosaves: autosaveDelete.rowCount ?? 0,
        },
      };
    });
  }

  async grantResources(userId: string, payload: DebugGrantResourcesDto): Promise<DebugGrantResourcesResult> {
    const requestedExperience = Math.max(0, Math.floor(payload.experience ?? 0));
    const requestedGold = Math.max(0, Math.floor(payload.gold ?? 0));
    const requestedItems = this.normalizeGrantItems(payload.items ?? []);

    if (requestedExperience <= 0 && requestedGold <= 0 && requestedItems.length === 0) {
      throw new BadRequestException('At least one of experience, gold, or items is required');
    }

    return this.databaseService.withTransaction(async (tx) => {
      const progressionBefore = await this.getProgressionForUpdate(tx, userId);
      const progressionAfter = this.computeProgressionAfterGrant(progressionBefore, requestedExperience, requestedGold);

      await this.persistProgression(tx, progressionAfter);

      for (const item of requestedItems) {
        await tx.query(
          `
            INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, item_key)
            DO UPDATE
              SET quantity = ${INVENTORY_ITEMS_TABLE}.quantity + EXCLUDED.quantity,
                  updated_at = NOW()
          `,
          [userId, item.itemKey, item.quantity],
        );
      }

      return {
        requested: {
          experience: requestedExperience,
          gold: requestedGold,
          items: requestedItems,
        },
        progressionBefore: {
          level: progressionBefore.level,
          experience: progressionBefore.experience,
          experienceToNextLevel: progressionBefore.experience_to_next,
          gold: progressionBefore.gold,
        },
        progressionAfter: {
          level: progressionAfter.level,
          experience: progressionAfter.experience,
          experienceToNextLevel: progressionAfter.experience_to_next,
          gold: progressionAfter.gold,
        },
        inventoryGranted: requestedItems,
      };
    });
  }

  private normalizeGrantItems(items: DebugGrantItemDto[]): Array<{ itemKey: string; quantity: number }> {
    const byKey = new Map<string, number>();

    for (const item of items) {
      const itemKey = item.itemKey.trim();
      const quantity = Math.max(0, Math.floor(item.quantity));
      if (!itemKey || quantity <= 0) {
        continue;
      }

      byKey.set(itemKey, (byKey.get(itemKey) ?? 0) + quantity);
    }

    return [...byKey.entries()].map(([itemKey, quantity]) => ({ itemKey, quantity }));
  }

  private async getProgressionForUpdate(
    executor: TransactionClient,
    userId: string,
  ): Promise<PlayerProgressionRow> {
    await executor.query(
      `
        INSERT INTO ${PLAYER_PROGRESSION_TABLE} (user_id, level, experience, experience_to_next, gold)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, BASE_PLAYER_LEVEL, BASE_PLAYER_EXPERIENCE, xpRequiredForLevel(BASE_PLAYER_LEVEL), BASE_PLAYER_GOLD],
    );

    const result = await executor.query<PlayerProgressionRow>(
      `
        SELECT user_id, level, experience, experience_to_next, gold
        FROM ${PLAYER_PROGRESSION_TABLE}
        WHERE user_id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [userId],
    );

    return result.rows[0];
  }

  private computeProgressionAfterGrant(
    progression: PlayerProgressionRow,
    gainedExperience: number,
    gainedGold: number,
  ): PlayerProgressionRow {
    let level = progression.level;
    let experience = progression.experience + gainedExperience;
    let experienceToNext = xpRequiredForLevel(level);

    while (experience >= experienceToNext) {
      experience -= experienceToNext;
      level += 1;
      experienceToNext = xpRequiredForLevel(level);
    }

    return {
      ...progression,
      level,
      experience,
      experience_to_next: experienceToNext,
      gold: progression.gold + gainedGold,
    };
  }

  private async persistProgression(executor: TransactionClient, progression: PlayerProgressionRow): Promise<void> {
    await executor.query(
      `
        UPDATE ${PLAYER_PROGRESSION_TABLE}
        SET level = $2,
            experience = $3,
            experience_to_next = $4,
            gold = $5,
            updated_at = NOW()
        WHERE user_id = $1
      `,
      [
        progression.user_id,
        progression.level,
        progression.experience,
        progression.experience_to_next,
        progression.gold,
      ],
    );
  }
}
