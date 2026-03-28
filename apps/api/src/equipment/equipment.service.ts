import { BadRequestException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOTS_TABLE, type EquipmentSlot } from './equipment.constants';
import type { EquippedItem } from './equipment.types';

type InventoryRow = {
  item_key: string;
  quantity: number;
};

type EquipmentRow = {
  slot: EquipmentSlot;
  item_key: string | null;
};

@Injectable()
export class EquipmentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listEquipment(userId: string): Promise<EquippedItem[]> {
    const result = await this.databaseService.query<EquipmentRow>(
      `
        SELECT slot, item_key
        FROM ${EQUIPMENT_SLOTS_TABLE}
        WHERE user_id = $1
        ORDER BY slot ASC
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

  async equipItem(userId: string, slot: EquipmentSlot, itemKey: string): Promise<EquippedItem> {
    const result = await this.databaseService.query<EquipmentRow>(
      `
        WITH current_inventory AS (
          SELECT quantity
          FROM ${INVENTORY_ITEMS_TABLE}
          WHERE user_id = $1
            AND item_key = $3
          FOR UPDATE
        ),
        deleted_inventory AS (
          DELETE FROM ${INVENTORY_ITEMS_TABLE}
          WHERE user_id = $1
            AND item_key = $3
            AND (SELECT quantity FROM current_inventory) = 1
          RETURNING item_key, 0::integer AS quantity
        ),
        updated_inventory AS (
          UPDATE ${INVENTORY_ITEMS_TABLE}
          SET quantity = quantity - 1,
              updated_at = NOW()
          WHERE user_id = $1
            AND item_key = $3
            AND (SELECT quantity FROM current_inventory) > 1
          RETURNING item_key, quantity
        ),
        consumed_inventory AS (
          SELECT item_key, quantity FROM deleted_inventory
          UNION ALL
          SELECT item_key, quantity FROM updated_inventory
        ),
        current_slot AS (
          SELECT item_key AS old_item_key
          FROM ${EQUIPMENT_SLOTS_TABLE}
          WHERE user_id = $1
            AND slot = $2
          FOR UPDATE
        ),
        upsert_slot AS (
          INSERT INTO ${EQUIPMENT_SLOTS_TABLE} (user_id, slot, item_key)
          SELECT $1, $2, $3
          WHERE EXISTS (SELECT 1 FROM consumed_inventory)
          ON CONFLICT (user_id, slot)
          DO UPDATE
            SET item_key = EXCLUDED.item_key,
                updated_at = NOW()
          RETURNING slot, item_key
        ),
        return_previous_item AS (
          INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
          SELECT $1, old_item_key, 1
          FROM current_slot
          WHERE EXISTS (SELECT 1 FROM consumed_inventory)
            AND old_item_key IS NOT NULL
          ON CONFLICT (user_id, item_key)
          DO UPDATE
            SET quantity = ${INVENTORY_ITEMS_TABLE}.quantity + 1,
                updated_at = NOW()
          RETURNING item_key, quantity
        )
        SELECT slot, item_key
        FROM upsert_slot
      `,
      [userId, slot, itemKey],
    );

    const row = result.rows[0];
    if (!row) {
      throw new BadRequestException('Item is missing from inventory or equip failed');
    }

    return {
      slot: row.slot,
      itemKey: row.item_key,
    };
  }

  async unequipItem(userId: string, slot: EquipmentSlot): Promise<EquippedItem> {
    const result = await this.databaseService.query<EquipmentRow>(
      `
        WITH current_slot AS (
          SELECT item_key
          FROM ${EQUIPMENT_SLOTS_TABLE}
          WHERE user_id = $1
            AND slot = $2
          FOR UPDATE
        ),
        removed_slot AS (
          DELETE FROM ${EQUIPMENT_SLOTS_TABLE}
          WHERE user_id = $1
            AND slot = $2
            AND EXISTS (SELECT 1 FROM current_slot)
          RETURNING item_key
        ),
        returned_item AS (
          INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
          SELECT $1, item_key, 1
          FROM removed_slot
          ON CONFLICT (user_id, item_key)
          DO UPDATE
            SET quantity = ${INVENTORY_ITEMS_TABLE}.quantity + 1,
                updated_at = NOW()
          RETURNING item_key, quantity
        ),
        selected AS (
          SELECT $2::text AS slot, NULL::text AS item_key
          FROM removed_slot
          LIMIT 1
        )
        SELECT slot, item_key
        FROM selected
      `,
      [userId, slot],
    );

    if (!result.rows[0]) {
      throw new BadRequestException('Slot is empty or unequip failed');
    }

    return {
      slot,
      itemKey: null,
    };
  }
}
