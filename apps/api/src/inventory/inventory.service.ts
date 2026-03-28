import { BadRequestException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { INVENTORY_ITEMS_TABLE } from './inventory.constants';
import type { InventoryItem } from './inventory.types';

type InventoryRow = {
  item_key: string;
  quantity: number;
};

@Injectable()
export class InventoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listInventory(userId: string): Promise<InventoryItem[]> {
    const result = await this.databaseService.query<InventoryRow>(
      `
        SELECT item_key, quantity
        FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
        ORDER BY item_key ASC
      `,
      [userId],
    );

    return result.rows.map((row) => this.toInventoryItem(row));
  }

  async addItem(userId: string, itemKey: string, quantity: number): Promise<InventoryItem> {
    const result = await this.databaseService.query<InventoryRow>(
      `
        INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, item_key)
        DO UPDATE
          SET quantity = ${INVENTORY_ITEMS_TABLE}.quantity + EXCLUDED.quantity,
              updated_at = NOW()
        RETURNING item_key, quantity
      `,
      [userId, itemKey, quantity],
    );

    return this.toInventoryItem(result.rows[0]);
  }

  async useItem(userId: string, itemKey: string, quantity: number): Promise<InventoryItem> {
    const result = await this.databaseService.query<InventoryRow>(
      `
        WITH current AS (
          SELECT quantity
          FROM ${INVENTORY_ITEMS_TABLE}
          WHERE user_id = $1
            AND item_key = $2
          FOR UPDATE
        ),
        deleted AS (
          DELETE FROM ${INVENTORY_ITEMS_TABLE}
          WHERE user_id = $1
            AND item_key = $2
            AND (SELECT quantity FROM current) = $3
          RETURNING item_key, 0::integer AS quantity
        ),
        updated AS (
          UPDATE ${INVENTORY_ITEMS_TABLE}
          SET quantity = quantity - $3,
              updated_at = NOW()
          WHERE user_id = $1
            AND item_key = $2
            AND (SELECT quantity FROM current) > $3
          RETURNING item_key, quantity
        )
        SELECT item_key, quantity FROM deleted
        UNION ALL
        SELECT item_key, quantity FROM updated
      `,
      [userId, itemKey, quantity],
    );

    const row = result.rows[0];
    if (!row) {
      throw new BadRequestException('Item not found or not enough quantity');
    }

    return this.toInventoryItem(row);
  }

  private toInventoryItem(row: InventoryRow): InventoryItem {
    return {
      itemKey: row.item_key,
      quantity: Number(row.quantity),
    };
  }
}
