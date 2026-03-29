import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService, type TransactionClient } from '../database/database.service';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOTS_TABLE, type EquipmentSlot } from '../equipment/equipment.constants';
import {
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  PLAYER_PROGRESSION_TABLE,
  WORLD_FLAGS_TABLE,
  xpRequiredForLevel,
} from '../gameplay/gameplay.constants';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import type { TowerState } from '../tower/tower.types';
import { AutoSaveRecord, AutoSaveRow, AutoSaveTriggerReason, SaveSlotRecord, SaveSlotRow, SaveSlotSummary } from './saves.types';
import { UpsertSaveSlotDto } from './dto/upsert-save-slot.dto';

const ALLOWED_SAVE_SLOTS = [1, 2, 3] as const;
const SAVE_SLOTS_TABLE = 'save_slots';
const AUTOSAVES_TABLE = 'autosaves';

type InventoryRow = {
  item_key: string;
  quantity: number;
};

type EquipmentRow = {
  slot: EquipmentSlot;
  item_key: string | null;
};

type PlayerProgressionRow = {
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

type WorldFlagRow = {
  flag_key: string;
};

type UpsertAutoSaveParams = {
  reason: AutoSaveTriggerReason;
  tower: TowerState;
  encounterId: string;
  enemyKey: string;
  reachedMilestoneFlags: string[];
};

@Injectable()
export class SavesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listSlots(userId: string): Promise<SaveSlotSummary[]> {
    const result = await this.databaseService.query<SaveSlotRow>(
      `
        SELECT user_id, slot, version, label, snapshot_json, created_at, updated_at
        FROM ${SAVE_SLOTS_TABLE}
        WHERE user_id = $1
        ORDER BY slot ASC
      `,
      [userId],
    );

    return ALLOWED_SAVE_SLOTS.map((slot) => {
      const row = result.rows.find((entry) => entry.slot === slot);
      return this.toSummary(slot, row);
    });
  }

  async getSlot(userId: string, slot: number): Promise<SaveSlotRecord> {
    this.assertValidSlot(slot);

    const row = await this.findSaveSlot(userId, slot);
    if (!row) {
      throw new NotFoundException(`Save slot ${slot} not found`);
    }

    return this.toRecord(row);
  }

  async upsertSlot(userId: string, slot: number, payload: UpsertSaveSlotDto): Promise<SaveSlotRecord> {
    this.assertValidSlot(slot);

    const result = await this.databaseService.query<SaveSlotRow>(
      `
        INSERT INTO ${SAVE_SLOTS_TABLE} (
          user_id,
          slot,
          version,
          label,
          snapshot_json,
          created_at,
          updated_at
        )
        VALUES ($1, $2, 1, $3, $4::jsonb, NOW(), NOW())
        ON CONFLICT (user_id, slot)
        DO UPDATE
          SET label = EXCLUDED.label,
              snapshot_json = EXCLUDED.snapshot_json,
              version = ${SAVE_SLOTS_TABLE}.version + 1,
              updated_at = NOW()
        RETURNING user_id, slot, version, label, snapshot_json, created_at, updated_at
      `,
      [userId, slot, payload.label ?? null, JSON.stringify(payload.snapshot)],
    );

    const row = result.rows[0];
    return this.toRecord(row);
  }

  async deleteSlot(userId: string, slot: number): Promise<{ slot: number; deleted: boolean }> {
    this.assertValidSlot(slot);

    const result = await this.databaseService.query(
      `
        DELETE FROM ${SAVE_SLOTS_TABLE}
        WHERE user_id = $1
          AND slot = $2
        RETURNING slot
      `,
      [userId, slot],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Save slot ${slot} not found`);
    }

    return { slot, deleted: true };
  }

  async getAutoSave(userId: string): Promise<AutoSaveRecord | null> {
    const result = await this.databaseService.query<AutoSaveRow>(
      `
        SELECT user_id, version, reason, snapshot_json, created_at, updated_at
        FROM ${AUTOSAVES_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    return row ? this.toAutoSaveRecord(row) : null;
  }

  async restoreAutoSaveToSlot(userId: string, slot: number): Promise<SaveSlotRecord> {
    this.assertValidSlot(slot);

    const autoSave = await this.getAutoSave(userId);
    if (!autoSave) {
      throw new NotFoundException('No autosave found for this user');
    }

    const label = this.toAutoSaveLabel(autoSave.version, autoSave.reason);

    const result = await this.databaseService.query<SaveSlotRow>(
      `
        INSERT INTO ${SAVE_SLOTS_TABLE} (
          user_id,
          slot,
          version,
          label,
          snapshot_json,
          created_at,
          updated_at
        )
        VALUES ($1, $2, 1, $3, $4::jsonb, NOW(), NOW())
        ON CONFLICT (user_id, slot)
        DO UPDATE
          SET label = EXCLUDED.label,
              snapshot_json = EXCLUDED.snapshot_json,
              version = ${SAVE_SLOTS_TABLE}.version + 1,
              updated_at = NOW()
        RETURNING user_id, slot, version, label, snapshot_json, created_at, updated_at
      `,
      [userId, slot, label, JSON.stringify(autoSave.snapshot)],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Restore failed for slot ${slot}`);
    }

    return this.toRecord(row);
  }

  async upsertAutoSaveForMilestone(
    executor: TransactionClient,
    userId: string,
    params: UpsertAutoSaveParams,
  ): Promise<AutoSaveRecord> {
    const progression = await this.getOrInitPlayerProgression(executor, userId);
    const inventory = await this.getInventorySnapshot(executor, userId);
    const equipment = await this.getEquipmentSnapshot(executor, userId);
    const worldFlags = await this.getWorldFlags(executor, userId);
    const reason =
      params.reason === 'boss_victory'
        ? `boss_victory_floor_${params.tower.currentFloor}`
        : `milestone_floor_${params.tower.currentFloor}`;

    const snapshot: Record<string, unknown> = {
      kind: 'autosave_milestone',
      createdAt: new Date().toISOString(),
      trigger: {
        reason: params.reason,
        encounterId: params.encounterId,
        enemyKey: params.enemyKey,
        reachedMilestoneFlags: params.reachedMilestoneFlags,
      },
      player: {
        level: progression.level,
        experience: progression.experience,
        experienceToNextLevel: progression.experience_to_next,
        gold: progression.gold,
      },
      tower: params.tower,
      worldFlags,
      inventory,
      equipment,
    };

    const result = await executor.query<AutoSaveRow>(
      `
        INSERT INTO ${AUTOSAVES_TABLE} (
          user_id,
          version,
          reason,
          snapshot_json,
          created_at,
          updated_at
        )
        VALUES ($1, 1, $2, $3::jsonb, NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE
          SET reason = EXCLUDED.reason,
              snapshot_json = EXCLUDED.snapshot_json,
              version = ${AUTOSAVES_TABLE}.version + 1,
              updated_at = NOW()
        RETURNING user_id, version, reason, snapshot_json, created_at, updated_at
      `,
      [userId, reason, JSON.stringify(snapshot)],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Autosave upsert failed for user ${userId}`);
    }

    return this.toAutoSaveRecord(row);
  }

  private async findSaveSlot(userId: string, slot: number): Promise<SaveSlotRow | undefined> {
    const result = await this.databaseService.query<SaveSlotRow>(
      `
        SELECT user_id, slot, version, label, snapshot_json, created_at, updated_at
        FROM ${SAVE_SLOTS_TABLE}
        WHERE user_id = $1
          AND slot = $2
        LIMIT 1
      `,
      [userId, slot],
    );

    return result.rows[0];
  }

  private assertValidSlot(slot: number): void {
    if (!ALLOWED_SAVE_SLOTS.includes(slot as (typeof ALLOWED_SAVE_SLOTS)[number])) {
      throw new BadRequestException('Save slot must be between 1 and 3');
    }
  }

  private toSummary(slot: number, row?: SaveSlotRow): SaveSlotSummary {
    if (!row) {
      return {
        slot,
        exists: false,
        version: null,
        label: null,
        createdAt: null,
        updatedAt: null,
      };
    }

    return {
      slot: row.slot,
      exists: true,
      version: row.version,
      label: row.label,
      createdAt: this.toIsoDate(row.created_at),
      updatedAt: this.toIsoDate(row.updated_at),
    };
  }

  private toRecord(row: SaveSlotRow): SaveSlotRecord {
    return {
      slot: row.slot,
      exists: true,
      version: row.version,
      label: row.label,
      createdAt: this.toIsoDate(row.created_at),
      updatedAt: this.toIsoDate(row.updated_at),
      snapshot: row.snapshot_json,
    };
  }

  private toAutoSaveRecord(row: AutoSaveRow): AutoSaveRecord {
    return {
      version: row.version,
      reason: row.reason,
      createdAt: this.toIsoDate(row.created_at),
      updatedAt: this.toIsoDate(row.updated_at),
      snapshot: row.snapshot_json,
    };
  }

  private toAutoSaveLabel(version: number, reason: string): string {
    const raw = `AUTO v${version} ${reason}`;
    return raw.length <= 120 ? raw : raw.slice(0, 120);
  }

  private async getOrInitPlayerProgression(
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
        SELECT level, experience, experience_to_next, gold
        FROM ${PLAYER_PROGRESSION_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Player progression missing for user ${userId}`);
    }

    return row;
  }

  private async getInventorySnapshot(
    executor: TransactionClient,
    userId: string,
  ): Promise<Array<{ itemKey: string; quantity: number }>> {
    const result = await executor.query<InventoryRow>(
      `
        SELECT item_key, quantity
        FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
        ORDER BY item_key ASC
      `,
      [userId],
    );

    return result.rows.map((row) => ({
      itemKey: row.item_key,
      quantity: row.quantity,
    }));
  }

  private async getEquipmentSnapshot(
    executor: TransactionClient,
    userId: string,
  ): Promise<Array<{ slot: EquipmentSlot; itemKey: string | null }>> {
    const result = await executor.query<EquipmentRow>(
      `
        SELECT slot, item_key
        FROM ${EQUIPMENT_SLOTS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );

    const bySlot = new Map<EquipmentSlot, string | null>();
    for (const row of result.rows) {
      bySlot.set(row.slot, row.item_key);
    }

    return EQUIPMENT_SLOTS.map((slot) => ({
      slot,
      itemKey: bySlot.get(slot) ?? null,
    }));
  }

  private async getWorldFlags(executor: TransactionClient, userId: string): Promise<string[]> {
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

  private toIsoDate(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
