import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

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
import { TOWER_PROGRESSION_TABLE } from '../tower/tower.constants';
import type { TowerState } from '../tower/tower.types';
import { AutoSaveRecord, AutoSaveRow, AutoSaveTriggerReason, SaveSlotRecord, SaveSlotRow, SaveSlotSummary } from './saves.types';
import { UpsertSaveSlotDto } from './dto/upsert-save-slot.dto';

const ALLOWED_SAVE_SLOTS = [1, 2, 3] as const;
const SAVE_SLOTS_TABLE = 'save_slots';
const AUTOSAVES_TABLE = 'autosaves';
const COMBAT_ENCOUNTERS_TABLE = 'combat_encounters';

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

type SaveSnapshotV1 = {
  schemaVersion: 1;
  capturedAt: string;
  world: {
    zone: string;
    day: number;
  };
  player: {
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
  worldFlags: string[];
  inventory: Array<{ itemKey: string; quantity: number }>;
  equipment: Array<{ slot: EquipmentSlot; itemKey: string | null }>;
};

type TowerRow = {
  current_floor: number;
  highest_floor: number;
  boss_floor_10_defeated: boolean;
};

@Injectable()
export class SavesService {
  private readonly logger = new Logger(SavesService.name);

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

  async captureSlotFromLiveState(userId: string, slot: number): Promise<SaveSlotRecord> {
    this.assertValidSlot(slot);

    return this.databaseService.withTransaction(async (tx) => {
      const snapshot = await this.buildLiveSnapshot(tx, userId);
      const label = `Quick Save ${this.toLabelTimestamp(snapshot.capturedAt)}`;
      const row = await this.upsertSlotSnapshot(tx, userId, slot, label, snapshot);
      return this.toRecord(row);
    });
  }

  async loadSlotToLiveState(userId: string, slot: number): Promise<SaveSlotRecord> {
    this.assertValidSlot(slot);

    return this.databaseService.withTransaction(async (tx) => {
      const row = await this.findSaveSlotForUpdate(tx, userId, slot);
      if (!row) {
        throw new NotFoundException(`Save slot ${slot} not found`);
      }

      const snapshot = this.parseSaveSnapshot(row.snapshot_json);
      await this.applySnapshotToLiveState(tx, userId, snapshot);

      return this.toRecord(row);
    });
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

  private async findSaveSlotForUpdate(
    executor: TransactionClient,
    userId: string,
    slot: number,
  ): Promise<SaveSlotRow | undefined> {
    const result = await executor.query<SaveSlotRow>(
      `
        SELECT user_id, slot, version, label, snapshot_json, created_at, updated_at
        FROM ${SAVE_SLOTS_TABLE}
        WHERE user_id = $1
          AND slot = $2
        LIMIT 1
        FOR UPDATE
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

  private async buildLiveSnapshot(executor: TransactionClient, userId: string): Promise<SaveSnapshotV1> {
    const progression = await this.getOrInitPlayerProgression(executor, userId);
    const tower = await this.getOrInitTower(executor, userId);
    const worldFlags = await this.getWorldFlags(executor, userId);
    const inventory = await this.getInventorySnapshot(executor, userId);
    const equipment = await this.getEquipmentSnapshot(executor, userId);
    const capturedAt = new Date().toISOString();

    return {
      schemaVersion: 1,
      capturedAt,
      world: {
        zone: 'Ferme',
        day: 1,
      },
      player: {
        level: progression.level,
        experience: progression.experience,
        experienceToNextLevel: progression.experience_to_next,
        gold: progression.gold,
      },
      tower: {
        currentFloor: tower.current_floor,
        highestFloor: tower.highest_floor,
        bossFloor10Defeated: tower.boss_floor_10_defeated,
      },
      worldFlags,
      inventory,
      equipment,
    };
  }

  private async applySnapshotToLiveState(
    executor: TransactionClient,
    userId: string,
    snapshot: SaveSnapshotV1,
  ): Promise<void> {
    const worldFlags = Array.from(new Set(snapshot.worldFlags.map((entry) => entry.trim()).filter((entry) => entry.length > 0)));
    const inventoryByItemKey = new Map<string, number>();
    for (const item of snapshot.inventory) {
      const key = item.itemKey.trim();
      if (!key || item.quantity <= 0) {
        continue;
      }
      inventoryByItemKey.set(key, item.quantity);
    }

    const equipmentBySlot = new Map<EquipmentSlot, string>();
    for (const equipped of snapshot.equipment) {
      if (!equipped.itemKey) {
        continue;
      }

      const itemKey = equipped.itemKey.trim();
      if (!itemKey) {
        continue;
      }

      equipmentBySlot.set(equipped.slot, itemKey);
    }

    await executor.query(
      `
        INSERT INTO ${PLAYER_PROGRESSION_TABLE} (user_id, level, experience, experience_to_next, gold)
        VALUES ($1, $2, $3, $4, $5)
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
        snapshot.player.level,
        snapshot.player.experience,
        snapshot.player.experienceToNextLevel,
        snapshot.player.gold,
      ],
    );

    await executor.query(
      `
        INSERT INTO ${TOWER_PROGRESSION_TABLE} (
          user_id,
          current_floor,
          highest_floor,
          boss_floor_10_defeated
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE
          SET current_floor = EXCLUDED.current_floor,
              highest_floor = EXCLUDED.highest_floor,
              boss_floor_10_defeated = EXCLUDED.boss_floor_10_defeated,
              updated_at = NOW()
      `,
      [
        userId,
        snapshot.tower.currentFloor,
        snapshot.tower.highestFloor,
        snapshot.tower.bossFloor10Defeated,
      ],
    );

    await executor.query(
      `
        DELETE FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );
    for (const flag of worldFlags) {
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

    await executor.query(
      `
        DELETE FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );
    for (const [itemKey, quantity] of inventoryByItemKey.entries()) {
      await executor.query(
        `
          INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, item_key)
          DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()
        `,
        [userId, itemKey, quantity],
      );
    }

    await executor.query(
      `
        DELETE FROM ${EQUIPMENT_SLOTS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );
    for (const [slot, itemKey] of equipmentBySlot.entries()) {
      await executor.query(
        `
          INSERT INTO ${EQUIPMENT_SLOTS_TABLE} (user_id, slot, item_key)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, slot)
          DO UPDATE SET item_key = EXCLUDED.item_key, updated_at = NOW()
        `,
        [userId, slot, itemKey],
      );
    }

    const nowIso = new Date().toISOString();
    try {
      await executor.query(
        `
          UPDATE ${COMBAT_ENCOUNTERS_TABLE}
          SET status = 'fled',
              updated_at = NOW(),
              ended_at = NOW(),
              state_json = COALESCE(state_json, '{}'::jsonb) || jsonb_build_object(
                'status', 'fled',
                'turn', 'player',
                'endedAt', $2,
                'updatedAt', $2
              )
          WHERE user_id = $1
            AND status = 'active'
        `,
        [userId, nowIso],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Save load succeeded but active combat cleanup failed for user ${userId}: ${message}`);
    }
  }

  private async upsertSlotSnapshot(
    executor: TransactionClient,
    userId: string,
    slot: number,
    label: string | null,
    snapshot: SaveSnapshotV1,
  ): Promise<SaveSlotRow> {
    const result = await executor.query<SaveSlotRow>(
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
      [userId, slot, label, JSON.stringify(snapshot)],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Save slot upsert failed for slot ${slot}`);
    }

    return row;
  }

  private async getOrInitTower(executor: TransactionClient, userId: string): Promise<TowerRow> {
    await executor.query(
      `
        INSERT INTO ${TOWER_PROGRESSION_TABLE} (user_id, current_floor, highest_floor, boss_floor_10_defeated)
        VALUES ($1, 1, 1, FALSE)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId],
    );

    const result = await executor.query<TowerRow>(
      `
        SELECT current_floor, highest_floor, boss_floor_10_defeated
        FROM ${TOWER_PROGRESSION_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Tower progression missing for user ${userId}`);
    }

    return row;
  }

  private parseSaveSnapshot(value: Record<string, unknown> | null): SaveSnapshotV1 {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Save snapshot format is invalid');
    }

    const raw = value as Record<string, unknown>;
    const schemaVersion = Number(raw.schemaVersion);
    if (schemaVersion === 1) {
      return this.parseVersion1SaveSnapshot(raw);
    }

    const kind = this.toStringOrNull(raw.kind);
    if (kind === 'autosave_milestone') {
      return this.parseLegacyAutoSaveSnapshot(raw);
    }

    throw new BadRequestException('Unsupported save snapshot version');
  }

  private parseVersion1SaveSnapshot(raw: Record<string, unknown>): SaveSnapshotV1 {
    const world = this.asRecord(raw.world, 'Save snapshot world is invalid');
    const player = this.asRecord(raw.player, 'Save snapshot player is invalid');
    const tower = this.asRecord(raw.tower, 'Save snapshot tower is invalid');
    const worldFlagsRaw = Array.isArray(raw.worldFlags) ? raw.worldFlags : [];
    const inventoryRaw = Array.isArray(raw.inventory) ? raw.inventory : [];
    const equipmentRaw = Array.isArray(raw.equipment) ? raw.equipment : [];
    const capturedAt = this.toStringOrNull(raw.capturedAt) ?? new Date().toISOString();

    const parsed: SaveSnapshotV1 = {
      schemaVersion: 1,
      capturedAt,
      world: {
        zone: this.toStringOrNull(world.zone) ?? 'Ferme',
        day: this.toPositiveInt(world.day, 1),
      },
      player: {
        level: this.toPositiveInt(player.level, 1),
        experience: this.toNonNegativeInt(player.experience, 0),
        experienceToNextLevel: this.toPositiveInt(player.experienceToNextLevel, 100),
        gold: this.toNonNegativeInt(player.gold, 0),
      },
      tower: {
        currentFloor: this.toPositiveInt(tower.currentFloor, 1),
        highestFloor: this.toPositiveInt(tower.highestFloor, 1),
        bossFloor10Defeated: Boolean(tower.bossFloor10Defeated),
      },
      worldFlags: worldFlagsRaw
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
      inventory: inventoryRaw
        .map((entry) => this.parseInventoryEntry(entry))
        .filter((entry): entry is { itemKey: string; quantity: number } => entry !== null),
      equipment: equipmentRaw
        .map((entry) => this.parseEquipmentEntry(entry))
        .filter((entry): entry is { slot: EquipmentSlot; itemKey: string | null } => entry !== null),
    };

    if (parsed.tower.highestFloor < parsed.tower.currentFloor) {
      parsed.tower.highestFloor = parsed.tower.currentFloor;
    }

    return parsed;
  }

  private parseLegacyAutoSaveSnapshot(raw: Record<string, unknown>): SaveSnapshotV1 {
    const world =
      raw.world && typeof raw.world === 'object' ? (raw.world as Record<string, unknown>) : ({} as Record<string, unknown>);
    const player = this.asRecord(raw.player, 'Save snapshot player is invalid');
    const tower = this.asRecord(raw.tower, 'Save snapshot tower is invalid');
    const worldFlagsRaw = Array.isArray(raw.worldFlags) ? raw.worldFlags : [];
    const inventoryRaw = Array.isArray(raw.inventory) ? raw.inventory : [];
    const equipmentRaw = Array.isArray(raw.equipment) ? raw.equipment : [];
    const capturedAt = this.toStringOrNull(raw.createdAt) ?? new Date().toISOString();

    const parsed: SaveSnapshotV1 = {
      schemaVersion: 1,
      capturedAt,
      world: {
        zone: this.toStringOrNull(world.zone) ?? 'Ferme',
        day: this.toPositiveInt(world.day, 1),
      },
      player: {
        level: this.toPositiveInt(player.level, 1),
        experience: this.toNonNegativeInt(player.experience, 0),
        experienceToNextLevel: this.toPositiveInt(player.experienceToNext ?? player.experienceToNextLevel, 100),
        gold: this.toNonNegativeInt(player.gold, 0),
      },
      tower: {
        currentFloor: this.toPositiveInt(tower.currentFloor, 1),
        highestFloor: this.toPositiveInt(tower.highestFloor, 1),
        bossFloor10Defeated: Boolean(tower.bossFloor10Defeated),
      },
      worldFlags: worldFlagsRaw
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
      inventory: inventoryRaw
        .map((entry) => this.parseInventoryEntry(entry))
        .filter((entry): entry is { itemKey: string; quantity: number } => entry !== null),
      equipment: equipmentRaw
        .map((entry) => this.parseEquipmentEntry(entry))
        .filter((entry): entry is { slot: EquipmentSlot; itemKey: string | null } => entry !== null),
    };

    if (parsed.tower.highestFloor < parsed.tower.currentFloor) {
      parsed.tower.highestFloor = parsed.tower.currentFloor;
    }

    return parsed;
  }

  private parseInventoryEntry(value: unknown): { itemKey: string; quantity: number } | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    const itemKey = this.toStringOrNull(record.itemKey);
    const quantity = this.toPositiveInt(record.quantity, 0);

    if (!itemKey || quantity <= 0) {
      return null;
    }

    return { itemKey, quantity };
  }

  private parseEquipmentEntry(value: unknown): { slot: EquipmentSlot; itemKey: string | null } | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    const rawSlot = this.toStringOrNull(record.slot);
    if (!rawSlot || !EQUIPMENT_SLOTS.includes(rawSlot as EquipmentSlot)) {
      return null;
    }

    const itemKey = this.toStringOrNull(record.itemKey);

    return {
      slot: rawSlot as EquipmentSlot,
      itemKey,
    };
  }

  private asRecord(value: unknown, message: string): Record<string, unknown> {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException(message);
    }

    return value as Record<string, unknown>;
  }

  private toStringOrNull(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toPositiveInt(value: unknown, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }

    const rounded = Math.round(value);
    return rounded > 0 ? rounded : fallback;
  }

  private toNonNegativeInt(value: unknown, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }

    const rounded = Math.round(value);
    return rounded >= 0 ? rounded : fallback;
  }

  private toLabelTimestamp(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    const dd = `${date.getDate()}`.padStart(2, '0');
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = `${date.getHours()}`.padStart(2, '0');
    const min = `${date.getMinutes()}`.padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  private toIsoDate(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
