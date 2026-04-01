import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { COMBAT_ENCOUNTERS_TABLE, COMBAT_ENEMY_DEFINITIONS } from '../combat/combat.constants';
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
import { QUEST_DEFINITIONS, QUEST_STATES_TABLE } from '../quests/quests.constants';
import type { QuestDefinition, QuestProgressState, QuestStatus } from '../quests/quests.types';
import { TOWER_MIN_FLOOR, TOWER_MVP_MAX_FLOOR, TOWER_PROGRESSION_TABLE } from '../tower/tower.constants';
import {
  DEBUG_FORCE_COMBAT_ENEMY_FLAG_PREFIX,
  DEBUG_STATE_PRESET_WORLD_FLAG_KEYS,
  DEBUG_STATE_PRESETS,
  buildDebugForceCombatEnemyFlag,
} from './debug-admin.constants';
import { DEBUG_LOADOUT_PRESETS, type DebugLoadoutPresetDefinition } from './debug-loadout.constants';
import type { DebugGrantResourcesDto } from './dto/debug-grant-resources.dto';
import type { DebugSetWorldFlagsDto } from './dto/debug-set-world-flags.dto';

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

type TowerProgressionRow = {
  user_id: string;
  current_floor: number;
  highest_floor: number;
  boss_floor_10_defeated: boolean;
};

type DebugSetTowerFloorResult = {
  before: {
    currentFloor: number;
    highestFloor: number;
    bossFloor10Defeated: boolean;
  };
  after: {
    currentFloor: number;
    highestFloor: number;
    bossFloor10Defeated: boolean;
  };
  appliedFlags: string[];
};

type QuestStateRow = {
  quest_key: string;
  status: QuestStatus;
  progress_json: QuestProgressState | string;
};

type DebugCompleteQuestsResult = {
  requested: {
    questKey: string | null;
  };
  updated: Array<{
    questKey: string;
    previousStatus: QuestStatus;
    nextStatus: QuestStatus;
  }>;
  skipped: Array<{
    questKey: string;
    reason: 'already_claimed';
  }>;
};

type DebugSetCombatStartOverrideResult = {
  enemyKey: string;
  isScriptedBossEncounter: boolean;
  oneShot: true;
};

type DebugClearCombatStartOverrideResult = {
  deletedOverrides: number;
};

type DebugApplyLoadoutPresetResult = {
  preset: {
    key: string;
    name: string;
    description: string;
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
  equipmentApplied: Array<{
    slot: string;
    itemKey: string;
  }>;
  inventoryGranted: Array<{
    itemKey: string;
    quantity: number;
  }>;
};

type DebugApplyStatePresetResult = {
  preset: {
    key: string;
    towerFloor: number;
    worldFlags: string[];
  };
  tower: {
    before: {
      currentFloor: number;
      highestFloor: number;
      bossFloor10Defeated: boolean;
    };
    after: {
      currentFloor: number;
      highestFloor: number;
      bossFloor10Defeated: boolean;
    };
  };
  worldFlags: {
    before: string[];
    after: string[];
    added: string[];
    removed: string[];
  };
};

type WorldFlagRow = {
  flag_key: string;
};

type DebugSetWorldFlagsResult = {
  requested: {
    flags: string[];
    removeFlags: string[];
    replace: boolean;
  };
  before: string[];
  after: string[];
  added: string[];
  removed: string[];
};

type DebugSetQuestStatusResult = {
  questKey: string;
  requestedStatus: QuestStatus;
  previousStatus: QuestStatus;
  nextStatus: QuestStatus;
  completedAt: string | null;
  claimedAt: string | null;
};

const SAVE_SLOTS_TABLE = 'save_slots';
const AUTOSAVES_TABLE = 'autosaves';
const TOWER_MILESTONE_FLAGS = ['floor_3_cleared', 'floor_5_cleared', 'floor_8_cleared'] as const;
const TOWER_BOSS_FLAGS = ['boss_floor_10_defeated', 'tower_mvp_complete'] as const;
const WORLD_FLAG_PATTERN = /^[a-z0-9_:-]+$/;

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

  async setTowerFloor(userId: string, requestedFloor: number): Promise<DebugSetTowerFloorResult> {
    const targetFloor = Math.max(TOWER_MIN_FLOOR, Math.min(TOWER_MVP_MAX_FLOOR, Math.floor(requestedFloor)));

    return this.databaseService.withTransaction(async (tx) => {
      const before = await this.getTowerProgressionForUpdate(tx, userId);
      const bossDefeated = targetFloor >= TOWER_MVP_MAX_FLOOR;

      const updatedResult = await tx.query<TowerProgressionRow>(
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
          RETURNING user_id, current_floor, highest_floor, boss_floor_10_defeated
        `,
        [userId, targetFloor, targetFloor, bossDefeated],
      );

      const appliedFlags: string[] = [];
      for (const flag of [...TOWER_MILESTONE_FLAGS, ...TOWER_BOSS_FLAGS]) {
        await tx.query(
          `
            DELETE FROM ${WORLD_FLAGS_TABLE}
            WHERE user_id = $1
              AND flag_key = $2
          `,
          [userId, flag],
        );
      }

      if (targetFloor >= 3) {
        appliedFlags.push('floor_3_cleared');
      }
      if (targetFloor >= 5) {
        appliedFlags.push('floor_5_cleared');
      }
      if (targetFloor >= 8) {
        appliedFlags.push('floor_8_cleared');
      }
      if (bossDefeated) {
        appliedFlags.push('boss_floor_10_defeated', 'tower_mvp_complete');
      }

      for (const flag of appliedFlags) {
        await tx.query(
          `
            INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, flag_key) DO NOTHING
          `,
          [userId, flag],
        );
      }

      const after = updatedResult.rows[0];

      return {
        before: {
          currentFloor: before.current_floor,
          highestFloor: before.highest_floor,
          bossFloor10Defeated: before.boss_floor_10_defeated,
        },
        after: {
          currentFloor: after.current_floor,
          highestFloor: after.highest_floor,
          bossFloor10Defeated: after.boss_floor_10_defeated,
        },
        appliedFlags,
      };
    });
  }

  async completeQuests(userId: string, requestedQuestKey?: string): Promise<DebugCompleteQuestsResult> {
    const normalizedQuestKey = requestedQuestKey?.trim() ?? '';
    const targetDefinitions = normalizedQuestKey
      ? [this.getQuestDefinitionOrThrow(normalizedQuestKey)]
      : QUEST_DEFINITIONS;

    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureQuestRows(tx, userId);

      const rows = await this.getQuestRowsForUpdate(
        tx,
        userId,
        targetDefinitions.map((definition) => definition.key),
      );
      const rowsByKey = new Map(rows.map((row) => [row.quest_key, row]));
      const now = new Date().toISOString();

      const updated: DebugCompleteQuestsResult['updated'] = [];
      const skipped: DebugCompleteQuestsResult['skipped'] = [];

      for (const definition of targetDefinitions) {
        const row = rowsByKey.get(definition.key);
        if (!row) {
          throw new NotFoundException(`Quest ${definition.key} was not found`);
        }

        if (row.status === 'claimed') {
          skipped.push({ questKey: definition.key, reason: 'already_claimed' });
          continue;
        }

        const completedProgress = this.toCompletedQuestProgress(this.normalizeQuestProgress(row.progress_json), definition, now);
        await tx.query(
          `
            UPDATE ${QUEST_STATES_TABLE}
            SET status = 'completed',
                progress_json = $3::jsonb,
                updated_at = NOW()
            WHERE user_id = $1
              AND quest_key = $2
          `,
          [userId, definition.key, JSON.stringify(completedProgress)],
        );

        updated.push({
          questKey: definition.key,
          previousStatus: row.status,
          nextStatus: 'completed',
        });
      }

      return {
        requested: {
          questKey: normalizedQuestKey || null,
        },
        updated,
        skipped,
      };
    });
  }

  async setCombatStartOverride(
    userId: string,
    enemyKey: string,
    isScriptedBossEncounter: boolean,
  ): Promise<DebugSetCombatStartOverrideResult> {
    const normalizedEnemyKey = enemyKey.trim();
    if (!normalizedEnemyKey) {
      throw new BadRequestException('enemyKey is required');
    }

    if (!COMBAT_ENEMY_DEFINITIONS[normalizedEnemyKey]) {
      throw new BadRequestException(`Unknown enemyKey: ${normalizedEnemyKey}`);
    }

    const flagKey = buildDebugForceCombatEnemyFlag({
      enemyKey: normalizedEnemyKey,
      isScriptedBossEncounter,
    });

    return this.databaseService.withTransaction(async (tx) => {
      await this.deleteCombatStartOverrides(tx, userId);

      await tx.query(
        `
          INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id, flag_key)
          DO UPDATE
            SET unlocked_at = NOW()
        `,
        [userId, flagKey],
      );

      return {
        enemyKey: normalizedEnemyKey,
        isScriptedBossEncounter,
        oneShot: true as const,
      };
    });
  }

  async clearCombatStartOverride(userId: string): Promise<DebugClearCombatStartOverrideResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const deletedOverrides = await this.deleteCombatStartOverrides(tx, userId);
      return {
        deletedOverrides,
      };
    });
  }

  async applyLoadoutPreset(userId: string, presetKey: string): Promise<DebugApplyLoadoutPresetResult> {
    const preset = this.resolveLoadoutPresetOrThrow(presetKey);
    const equipmentApplied = this.normalizeLoadoutEquipment(preset);
    const inventoryGranted = this.normalizeGrantItems(preset.inventory);

    return this.databaseService.withTransaction(async (tx) => {
      const progressionBefore = await this.getProgressionForUpdate(tx, userId);
      const progressionAfter = this.computeProgressionAfterGrant(
        progressionBefore,
        preset.resources.experience,
        preset.resources.gold,
      );

      await this.persistProgression(tx, progressionAfter);

      await tx.query(
        `
          DELETE FROM ${EQUIPMENT_SLOTS_TABLE}
          WHERE user_id = $1
        `,
        [userId],
      );

      for (const equipped of equipmentApplied) {
        await tx.query(
          `
            INSERT INTO ${EQUIPMENT_SLOTS_TABLE} (user_id, slot, item_key, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (user_id, slot)
            DO UPDATE
              SET item_key = EXCLUDED.item_key,
                  updated_at = NOW()
          `,
          [userId, equipped.slot, equipped.itemKey],
        );
      }

      for (const item of inventoryGranted) {
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
        preset: {
          key: preset.key,
          name: preset.name,
          description: preset.description,
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
        equipmentApplied,
        inventoryGranted,
      };
    });
  }

  async applyStatePreset(userId: string, presetKey: string): Promise<DebugApplyStatePresetResult> {
    const preset = this.resolveStatePresetOrThrow(presetKey);
    const targetFloor = preset.towerFloor;
    const targetBossDefeated = targetFloor >= TOWER_MVP_MAX_FLOOR;
    const normalizedPresetFlags = this.normalizeWorldFlagKeys(preset.worldFlags);

    return this.databaseService.withTransaction(async (tx) => {
      const towerBefore = await this.getTowerProgressionForUpdate(tx, userId);
      const worldFlagsBefore = await this.getWorldFlagsForUpdate(tx, userId);
      const worldFlagsBeforeSet = new Set(worldFlagsBefore);

      const towerAfterResult = await tx.query<TowerProgressionRow>(
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
          RETURNING user_id, current_floor, highest_floor, boss_floor_10_defeated
        `,
        [userId, targetFloor, targetFloor, targetBossDefeated],
      );

      if (DEBUG_STATE_PRESET_WORLD_FLAG_KEYS.length > 0) {
        await tx.query(
          `
            DELETE FROM ${WORLD_FLAGS_TABLE}
            WHERE user_id = $1
              AND flag_key = ANY($2::text[])
          `,
          [userId, DEBUG_STATE_PRESET_WORLD_FLAG_KEYS],
        );
      }

      for (const flag of normalizedPresetFlags) {
        await tx.query(
          `
            INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, flag_key) DO NOTHING
          `,
          [userId, flag],
        );
      }

      const worldFlagsAfter = await this.getWorldFlagsForUpdate(tx, userId);
      const worldFlagsAfterSet = new Set(worldFlagsAfter);
      const added = worldFlagsAfter.filter((flag) => !worldFlagsBeforeSet.has(flag));
      const removed = worldFlagsBefore.filter((flag) => !worldFlagsAfterSet.has(flag));
      const towerAfter = towerAfterResult.rows[0];

      return {
        preset: {
          key: preset.key,
          towerFloor: preset.towerFloor,
          worldFlags: normalizedPresetFlags,
        },
        tower: {
          before: {
            currentFloor: towerBefore.current_floor,
            highestFloor: towerBefore.highest_floor,
            bossFloor10Defeated: towerBefore.boss_floor_10_defeated,
          },
          after: {
            currentFloor: towerAfter.current_floor,
            highestFloor: towerAfter.highest_floor,
            bossFloor10Defeated: towerAfter.boss_floor_10_defeated,
          },
        },
        worldFlags: {
          before: worldFlagsBefore,
          after: worldFlagsAfter,
          added,
          removed,
        },
      };
    });
  }

  async setWorldFlags(userId: string, payload: DebugSetWorldFlagsDto): Promise<DebugSetWorldFlagsResult> {
    const requestedFlags = this.normalizeWorldFlagKeys(payload.flags ?? []);
    const requestedRemovedFlags = this.normalizeWorldFlagKeys(payload.removeFlags ?? []);
    const replace = Boolean(payload.replace);

    if (!replace && requestedFlags.length === 0 && requestedRemovedFlags.length === 0) {
      throw new BadRequestException('Provide flags/removeFlags, or set replace=true');
    }

    return this.databaseService.withTransaction(async (tx) => {
      const before = await this.getWorldFlagsForUpdate(tx, userId);
      const beforeSet = new Set(before);

      if (replace) {
        await tx.query(
          `
            DELETE FROM ${WORLD_FLAGS_TABLE}
            WHERE user_id = $1
          `,
          [userId],
        );
      } else if (requestedRemovedFlags.length > 0) {
        await tx.query(
          `
            DELETE FROM ${WORLD_FLAGS_TABLE}
            WHERE user_id = $1
              AND flag_key = ANY($2::text[])
          `,
          [userId, requestedRemovedFlags],
        );
      }

      const flagsToInsert = replace ? requestedFlags : requestedFlags.filter((flag) => !beforeSet.has(flag));

      for (const flag of flagsToInsert) {
        await tx.query(
          `
            INSERT INTO ${WORLD_FLAGS_TABLE} (user_id, flag_key, unlocked_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, flag_key) DO NOTHING
          `,
          [userId, flag],
        );
      }

      const after = await this.getWorldFlagsForUpdate(tx, userId);
      const afterSet = new Set(after);
      const removed = before.filter((flag) => !afterSet.has(flag));
      const added = after.filter((flag) => !beforeSet.has(flag));

      return {
        requested: {
          flags: requestedFlags,
          removeFlags: requestedRemovedFlags,
          replace,
        },
        before,
        after,
        added,
        removed,
      };
    });
  }

  async setQuestStatus(
    userId: string,
    questKey: string,
    requestedStatus: QuestStatus,
  ): Promise<DebugSetQuestStatusResult> {
    const normalizedQuestKey = questKey.trim();
    const definition = this.getQuestDefinitionOrThrow(normalizedQuestKey);

    return this.databaseService.withTransaction(async (tx) => {
      await this.ensureQuestRows(tx, userId);

      const rows = await this.getQuestRowsForUpdate(tx, userId, [definition.key]);
      const row = rows[0];
      if (!row) {
        throw new NotFoundException(`Quest ${definition.key} was not found`);
      }

      const now = new Date().toISOString();
      const nextProgress = this.normalizeQuestProgress(row.progress_json);
      let nextStatus: QuestStatus = requestedStatus;

      if (requestedStatus === 'active') {
        nextProgress.completedAt = null;
        nextProgress.claimedAt = null;
      } else if (requestedStatus === 'completed') {
        const completed = this.toCompletedQuestProgress(nextProgress, definition, now);
        nextProgress.victoriesTotal = completed.victoriesTotal;
        nextProgress.enemyVictories = completed.enemyVictories;
        nextProgress.towerHighestFloor = completed.towerHighestFloor;
        nextProgress.cropsHarvestedTotal = completed.cropsHarvestedTotal;
        nextProgress.harvestedCrops = completed.harvestedCrops;
        nextProgress.cropsDeliveredTotal = completed.cropsDeliveredTotal;
        nextProgress.deliveredCrops = completed.deliveredCrops;
        nextProgress.lastVictoryAt = completed.lastVictoryAt;
        nextProgress.completedAt = completed.completedAt;
        nextProgress.claimedAt = null;
      } else {
        const completed = this.toCompletedQuestProgress(nextProgress, definition, now);
        nextProgress.victoriesTotal = completed.victoriesTotal;
        nextProgress.enemyVictories = completed.enemyVictories;
        nextProgress.towerHighestFloor = completed.towerHighestFloor;
        nextProgress.cropsHarvestedTotal = completed.cropsHarvestedTotal;
        nextProgress.harvestedCrops = completed.harvestedCrops;
        nextProgress.cropsDeliveredTotal = completed.cropsDeliveredTotal;
        nextProgress.deliveredCrops = completed.deliveredCrops;
        nextProgress.lastVictoryAt = completed.lastVictoryAt;
        nextProgress.completedAt = completed.completedAt;
        nextProgress.claimedAt = now;
        nextStatus = 'claimed';
      }

      await tx.query(
        `
          UPDATE ${QUEST_STATES_TABLE}
          SET status = $3,
              progress_json = $4::jsonb,
              updated_at = NOW()
          WHERE user_id = $1
            AND quest_key = $2
        `,
        [userId, definition.key, nextStatus, JSON.stringify(nextProgress)],
      );

      return {
        questKey: definition.key,
        requestedStatus,
        previousStatus: row.status,
        nextStatus,
        completedAt: nextProgress.completedAt,
        claimedAt: nextProgress.claimedAt,
      };
    });
  }

  private resolveLoadoutPresetOrThrow(presetKey: string): DebugLoadoutPresetDefinition {
    const normalizedPresetKey = presetKey.trim();
    const preset = DEBUG_LOADOUT_PRESETS.find((entry) => entry.key === normalizedPresetKey);
    if (!preset) {
      throw new BadRequestException(`Unknown loadout preset: ${normalizedPresetKey}`);
    }

    return preset;
  }

  private resolveStatePresetOrThrow(presetKey: string): (typeof DEBUG_STATE_PRESETS)[number] {
    const normalizedPresetKey = presetKey.trim();
    const preset = DEBUG_STATE_PRESETS.find((entry) => entry.key === normalizedPresetKey);
    if (!preset) {
      throw new BadRequestException(`Unknown state preset: ${normalizedPresetKey}`);
    }

    return preset;
  }

  private normalizeLoadoutEquipment(
    preset: DebugLoadoutPresetDefinition,
  ): Array<{ slot: string; itemKey: string }> {
    const bySlot = new Map<string, string>();

    for (const entry of preset.equipment) {
      const slot = entry.slot.trim();
      const itemKey = entry.itemKey.trim();
      if (!slot || !itemKey) {
        continue;
      }

      bySlot.set(slot, itemKey);
    }

    return [...bySlot.entries()].map(([slot, itemKey]) => ({ slot, itemKey }));
  }

  private normalizeGrantItems(items: Array<{ itemKey: string; quantity: number }>): Array<{ itemKey: string; quantity: number }> {
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

  private async getTowerProgressionForUpdate(
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

  private async getWorldFlagsForUpdate(executor: TransactionClient, userId: string): Promise<string[]> {
    const result = await executor.query<WorldFlagRow>(
      `
        SELECT flag_key
        FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
        ORDER BY flag_key ASC
        FOR UPDATE
      `,
      [userId],
    );

    return result.rows.map((row) => row.flag_key);
  }

  private normalizeWorldFlagKeys(flags: readonly string[]): string[] {
    const normalized = new Set<string>();

    for (const value of flags) {
      const entry = value.trim().toLowerCase();
      if (!entry) {
        continue;
      }

      if (!WORLD_FLAG_PATTERN.test(entry)) {
        throw new BadRequestException(`Invalid world flag: ${value}`);
      }

      normalized.add(entry);
    }

    return [...normalized.values()];
  }

  private async deleteCombatStartOverrides(executor: TransactionClient, userId: string): Promise<number> {
    const result = await executor.query(
      `
        DELETE FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
          AND flag_key LIKE $2
      `,
      [userId, `${DEBUG_FORCE_COMBAT_ENEMY_FLAG_PREFIX}:%`],
    );

    return result.rowCount ?? 0;
  }

  private async ensureQuestRows(executor: TransactionClient, userId: string): Promise<void> {
    for (const definition of QUEST_DEFINITIONS) {
      await executor.query(
        `
          INSERT INTO ${QUEST_STATES_TABLE} (user_id, quest_key, status, progress_json)
          VALUES ($1, $2, 'active', $3::jsonb)
          ON CONFLICT (user_id, quest_key) DO NOTHING
        `,
        [userId, definition.key, JSON.stringify(this.emptyQuestProgress())],
      );
    }
  }

  private async getQuestRowsForUpdate(
    executor: TransactionClient,
    userId: string,
    questKeys: string[],
  ): Promise<QuestStateRow[]> {
    const result = await executor.query<QuestStateRow>(
      `
        SELECT quest_key, status, progress_json
        FROM ${QUEST_STATES_TABLE}
        WHERE user_id = $1
          AND quest_key = ANY($2::text[])
        FOR UPDATE
      `,
      [userId, questKeys],
    );

    return result.rows;
  }

  private getQuestDefinitionOrThrow(questKey: string): QuestDefinition {
    const definition = QUEST_DEFINITIONS.find((entry) => entry.key === questKey);
    if (!definition) {
      throw new NotFoundException(`Quest ${questKey} was not found`);
    }

    return definition;
  }

  private toCompletedQuestProgress(
    progress: QuestProgressState,
    definition: QuestDefinition,
    now: string,
  ): QuestProgressState {
    const completed: QuestProgressState = {
      ...progress,
      enemyVictories: { ...progress.enemyVictories },
      harvestedCrops: { ...progress.harvestedCrops },
      deliveredCrops: { ...progress.deliveredCrops },
      interactedNpcs: { ...progress.interactedNpcs },
      npcFriendshipLevels: { ...progress.npcFriendshipLevels },
    };

    for (const objective of definition.objectives) {
      if (objective.metric === 'victories_total') {
        completed.victoriesTotal = Math.max(completed.victoriesTotal, objective.target);
        continue;
      }

      if (objective.metric === 'tower_highest_floor') {
        completed.towerHighestFloor = Math.max(completed.towerHighestFloor, objective.target);
        continue;
      }

      if (objective.metric === 'farm_harvest_total') {
        completed.cropsHarvestedTotal = Math.max(completed.cropsHarvestedTotal, objective.target);
        continue;
      }

      if (objective.metric === 'village_delivery_total') {
        completed.cropsDeliveredTotal = Math.max(completed.cropsDeliveredTotal, objective.target);
        continue;
      }

      if (objective.metric === 'farm_harvest_crop' && objective.cropKey) {
        const currentHarvested = completed.harvestedCrops[objective.cropKey] ?? 0;
        completed.harvestedCrops[objective.cropKey] = Math.max(currentHarvested, objective.target);
        continue;
      }

      if (objective.metric === 'village_delivery_crop' && objective.cropKey) {
        const currentDelivered = completed.deliveredCrops[objective.cropKey] ?? 0;
        completed.deliveredCrops[objective.cropKey] = Math.max(currentDelivered, objective.target);
        continue;
      }

      if (objective.metric === 'village_npc_interaction_total') {
        completed.npcInteractionsTotal = Math.max(completed.npcInteractionsTotal, objective.target);
        continue;
      }

      if (objective.metric === 'village_npc_interaction_npc' && objective.npcKey) {
        const currentNpcInteractions = completed.interactedNpcs[objective.npcKey] ?? 0;
        completed.interactedNpcs[objective.npcKey] = Math.max(currentNpcInteractions, objective.target);
        completed.npcInteractionsTotal = Math.max(completed.npcInteractionsTotal, objective.target);
        continue;
      }

      if (objective.metric === 'village_npc_friendship_npc' && objective.npcKey) {
        const currentFriendship = completed.npcFriendshipLevels[objective.npcKey] ?? 0;
        completed.npcFriendshipLevels[objective.npcKey] = Math.max(currentFriendship, objective.target);
        continue;
      }

      if (objective.metric === 'enemy_victories' && objective.enemyKey) {
        const currentEnemyVictories = completed.enemyVictories[objective.enemyKey] ?? 0;
        completed.enemyVictories[objective.enemyKey] = Math.max(currentEnemyVictories, objective.target);
      }
    }

    completed.lastVictoryAt = now;
    completed.completedAt = now;

    return completed;
  }

  private normalizeQuestProgress(value: QuestProgressState | string | undefined): QuestProgressState {
    if (!value) {
      return this.emptyQuestProgress();
    }

    let parsed: Partial<QuestProgressState>;
    try {
      parsed = typeof value === 'string' ? (JSON.parse(value) as Partial<QuestProgressState>) : value;
    } catch {
      return this.emptyQuestProgress();
    }

    const enemyVictories = parsed.enemyVictories ?? {};
    const harvestedCrops = parsed.harvestedCrops ?? {};
    const deliveredCrops = parsed.deliveredCrops ?? {};
    const interactedNpcs = parsed.interactedNpcs ?? {};
    const npcFriendshipLevels = parsed.npcFriendshipLevels ?? {};

    return {
      victoriesTotal: Math.max(0, Number(parsed.victoriesTotal ?? 0)),
      enemyVictories: { ...enemyVictories },
      towerHighestFloor: Math.max(1, Number(parsed.towerHighestFloor ?? 1)),
      cropsHarvestedTotal: Math.max(0, Number(parsed.cropsHarvestedTotal ?? 0)),
      harvestedCrops: { ...harvestedCrops },
      cropsDeliveredTotal: Math.max(0, Number(parsed.cropsDeliveredTotal ?? 0)),
      deliveredCrops: { ...deliveredCrops },
      npcInteractionsTotal: Math.max(0, Number(parsed.npcInteractionsTotal ?? 0)),
      interactedNpcs: { ...interactedNpcs },
      npcFriendshipLevels: { ...npcFriendshipLevels },
      lastVictoryAt: typeof parsed.lastVictoryAt === 'string' ? parsed.lastVictoryAt : null,
      completedAt: typeof parsed.completedAt === 'string' ? parsed.completedAt : null,
      claimedAt: typeof parsed.claimedAt === 'string' ? parsed.claimedAt : null,
    };
  }

  private emptyQuestProgress(): QuestProgressState {
    return {
      victoriesTotal: 0,
      enemyVictories: {},
      towerHighestFloor: 1,
      cropsHarvestedTotal: 0,
      harvestedCrops: {},
      cropsDeliveredTotal: 0,
      deliveredCrops: {},
      npcInteractionsTotal: 0,
      interactedNpcs: {},
      npcFriendshipLevels: {},
      lastVictoryAt: null,
      completedAt: null,
      claimedAt: null,
    };
  }
}
