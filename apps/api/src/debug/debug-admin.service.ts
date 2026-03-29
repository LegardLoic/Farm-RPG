import { Injectable } from '@nestjs/common';

import { COMBAT_ENCOUNTERS_TABLE } from '../combat/combat.constants';
import { DatabaseService } from '../database/database.service';
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
}
