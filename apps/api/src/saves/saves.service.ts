import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { SaveSlotRecord, SaveSlotRow, SaveSlotSummary } from './saves.types';
import { UpsertSaveSlotDto } from './dto/upsert-save-slot.dto';

const ALLOWED_SAVE_SLOTS = [1, 2, 3] as const;

@Injectable()
export class SavesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listSlots(userId: string): Promise<SaveSlotSummary[]> {
    const result = await this.databaseService.query<SaveSlotRow>(
      `
        SELECT user_id, slot, version, label, snapshot_json, created_at, updated_at
        FROM save_slots
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
        INSERT INTO save_slots (
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
              version = save_slots.version + 1,
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
        DELETE FROM save_slots
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

  private async findSaveSlot(userId: string, slot: number): Promise<SaveSlotRow | undefined> {
    const result = await this.databaseService.query<SaveSlotRow>(
      `
        SELECT user_id, slot, version, label, snapshot_json, created_at, updated_at
        FROM save_slots
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

  private toIsoDate(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
