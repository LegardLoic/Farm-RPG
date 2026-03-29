import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { type TransactionClient } from '../database/database.service';
import {
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  PLAYER_PROGRESSION_TABLE,
  WORLD_FLAGS_TABLE,
  xpRequiredForLevel,
} from '../gameplay/gameplay.constants';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import { QUEST_DEFINITIONS, QUEST_STATES_TABLE } from './quests.constants';
import type {
  QuestDefinition,
  QuestObjectiveDefinition,
  QuestObjectiveView,
  QuestProgressState,
  QuestStatus,
  QuestView,
} from './quests.types';

type QuestStateRow = {
  quest_key: string;
  status: QuestStatus;
  progress_json: QuestProgressState | string;
};

type PlayerProgressionRow = {
  user_id: string;
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

@Injectable()
export class QuestsService {
  async listQuests(executor: TransactionClient, userId: string): Promise<QuestView[]> {
    await this.ensureQuestRows(executor, userId);
    const rows = await this.getQuestRows(executor, userId);
    const byKey = new Map(rows.map((row) => [row.quest_key, row]));

    return QUEST_DEFINITIONS.map((definition) => {
      const row = byKey.get(definition.key);
      return this.toQuestView(definition, row);
    });
  }

  async claimQuest(executor: TransactionClient, userId: string, questKey: string): Promise<QuestView> {
    const definition = this.getQuestDefinitionOrThrow(questKey);
    await this.ensureQuestRows(executor, userId);

    const row = await this.getQuestRowForUpdate(executor, userId, questKey);
    const progress = this.normalizeProgress(row.progress_json);
    const isCompleted = row.status === 'completed' || row.status === 'claimed' || this.isQuestCompleted(definition, progress);

    if (!isCompleted) {
      throw new BadRequestException(`Quest ${questKey} is not completed yet`);
    }

    if (row.status === 'claimed') {
      return this.toQuestView(definition, row);
    }

    await this.applyClaimRewards(executor, userId, definition);

    const now = new Date().toISOString();
    progress.claimedAt = now;

    const updated = await executor.query<QuestStateRow>(
      `
        UPDATE ${QUEST_STATES_TABLE}
        SET status = 'claimed',
            progress_json = $3::jsonb,
            updated_at = NOW()
        WHERE user_id = $1
          AND quest_key = $2
        RETURNING quest_key, status, progress_json
      `,
      [userId, questKey, JSON.stringify(progress)],
    );

    const updatedRow = updated.rows[0];
    return this.toQuestView(definition, updatedRow);
  }

  async recordCombatVictory(
    executor: TransactionClient,
    userId: string,
    enemyKey: string,
  ): Promise<void> {
    await this.ensureQuestRows(executor, userId);
    const rows = await this.getQuestRowsForUpdate(executor, userId);
    const now = new Date().toISOString();

    for (const row of rows) {
      if (row.status === 'claimed') {
        continue;
      }

      const definition = QUEST_DEFINITIONS.find((entry) => entry.key === row.quest_key);
      if (!definition) {
        continue;
      }

      const progress = this.normalizeProgress(row.progress_json);
      progress.victoriesTotal += 1;
      progress.enemyVictories[enemyKey] = (progress.enemyVictories[enemyKey] ?? 0) + 1;
      progress.lastVictoryAt = now;

      const completed = this.isQuestCompleted(definition, progress);
      const nextStatus: QuestStatus = completed ? 'completed' : 'active';

      if (completed && !progress.completedAt) {
        progress.completedAt = now;
      }

      await executor.query(
        `
          UPDATE ${QUEST_STATES_TABLE}
          SET status = $3,
              progress_json = $4::jsonb,
              updated_at = NOW()
          WHERE user_id = $1
            AND quest_key = $2
        `,
        [userId, row.quest_key, nextStatus, JSON.stringify(progress)],
      );
    }
  }

  private async applyClaimRewards(
    executor: TransactionClient,
    userId: string,
    definition: QuestDefinition,
  ): Promise<void> {
    const progressionBefore = await this.getProgressionForUpdate(executor, userId);
    const progressionAfter = this.computeProgressionAfterGain(
      progressionBefore,
      definition.rewards.experience,
      definition.rewards.gold,
    );

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
        progressionAfter.user_id,
        progressionAfter.level,
        progressionAfter.experience,
        progressionAfter.experience_to_next,
        progressionAfter.gold,
      ],
    );

    for (const item of definition.rewards.items) {
      await executor.query(
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

    for (const flag of definition.rewards.flags) {
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

  private async ensureQuestRows(executor: TransactionClient, userId: string): Promise<void> {
    for (const definition of QUEST_DEFINITIONS) {
      await executor.query(
        `
          INSERT INTO ${QUEST_STATES_TABLE} (user_id, quest_key, status, progress_json)
          VALUES ($1, $2, 'active', $3::jsonb)
          ON CONFLICT (user_id, quest_key) DO NOTHING
        `,
        [userId, definition.key, JSON.stringify(this.emptyProgress())],
      );
    }
  }

  private async getQuestRows(executor: TransactionClient, userId: string): Promise<QuestStateRow[]> {
    const result = await executor.query<QuestStateRow>(
      `
        SELECT quest_key, status, progress_json
        FROM ${QUEST_STATES_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );

    return result.rows;
  }

  private async getQuestRowsForUpdate(executor: TransactionClient, userId: string): Promise<QuestStateRow[]> {
    const result = await executor.query<QuestStateRow>(
      `
        SELECT quest_key, status, progress_json
        FROM ${QUEST_STATES_TABLE}
        WHERE user_id = $1
        FOR UPDATE
      `,
      [userId],
    );

    return result.rows;
  }

  private async getQuestRowForUpdate(
    executor: TransactionClient,
    userId: string,
    questKey: string,
  ): Promise<QuestStateRow> {
    const result = await executor.query<QuestStateRow>(
      `
        SELECT quest_key, status, progress_json
        FROM ${QUEST_STATES_TABLE}
        WHERE user_id = $1
          AND quest_key = $2
        LIMIT 1
        FOR UPDATE
      `,
      [userId, questKey],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Quest ${questKey} was not found`);
    }

    return row;
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

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Progression not found for user ${userId}`);
    }

    return row;
  }

  private computeProgressionAfterGain(
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

  private toQuestView(definition: QuestDefinition, row?: QuestStateRow): QuestView {
    const progress = this.normalizeProgress(row?.progress_json);
    const status: QuestStatus = row?.status ?? 'active';
    const objectives = definition.objectives.map((objective) => this.toObjectiveView(objective, progress));

    const completed = objectives.every((objective) => objective.completed);
    const normalizedStatus: QuestStatus = status === 'claimed' ? 'claimed' : completed ? 'completed' : 'active';

    return {
      key: definition.key,
      title: definition.title,
      description: definition.description,
      status: normalizedStatus,
      canClaim: normalizedStatus === 'completed',
      objectives,
      rewards: definition.rewards,
    };
  }

  private toObjectiveView(
    objective: QuestObjectiveDefinition,
    progress: QuestProgressState,
  ): QuestObjectiveView {
    const current = this.getObjectiveCurrentValue(objective, progress);

    return {
      key: objective.key,
      description: objective.description,
      current,
      target: objective.target,
      completed: current >= objective.target,
    };
  }

  private isQuestCompleted(definition: QuestDefinition, progress: QuestProgressState): boolean {
    return definition.objectives.every(
      (objective) => this.getObjectiveCurrentValue(objective, progress) >= objective.target,
    );
  }

  private getObjectiveCurrentValue(
    objective: QuestObjectiveDefinition,
    progress: QuestProgressState,
  ): number {
    if (objective.metric === 'victories_total') {
      return progress.victoriesTotal;
    }

    if (!objective.enemyKey) {
      return 0;
    }

    return progress.enemyVictories[objective.enemyKey] ?? 0;
  }

  private getQuestDefinitionOrThrow(questKey: string): QuestDefinition {
    const definition = QUEST_DEFINITIONS.find((entry) => entry.key === questKey);
    if (!definition) {
      throw new NotFoundException(`Quest ${questKey} was not found`);
    }

    return definition;
  }

  private normalizeProgress(value: QuestProgressState | string | undefined): QuestProgressState {
    if (!value) {
      return this.emptyProgress();
    }

    const parsed = typeof value === 'string' ? (JSON.parse(value) as Partial<QuestProgressState>) : value;
    const enemyVictories = parsed.enemyVictories ?? {};

    return {
      victoriesTotal: Math.max(0, Number(parsed.victoriesTotal ?? 0)),
      enemyVictories: { ...enemyVictories },
      lastVictoryAt: typeof parsed.lastVictoryAt === 'string' ? parsed.lastVictoryAt : null,
      completedAt: typeof parsed.completedAt === 'string' ? parsed.completedAt : null,
      claimedAt: typeof parsed.claimedAt === 'string' ? parsed.claimedAt : null,
    };
  }

  private emptyProgress(): QuestProgressState {
    return {
      victoriesTotal: 0,
      enemyVictories: {},
      lastVictoryAt: null,
      completedAt: null,
      claimedAt: null,
    };
  }
}
