import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService, type TransactionClient } from '../database/database.service';
import {
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  PLAYER_PROGRESSION_TABLE,
  WORLD_FLAGS_TABLE,
  xpRequiredForLevel,
} from '../gameplay/gameplay.constants';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import { BLACKSMITH_OFFERS, BLACKSMITH_SHOP_UNLOCK_FLAG } from './shops.constants';
import type { BlacksmithOffer, BlacksmithPurchaseResult, BlacksmithShopState } from './shops.types';

type PlayerProgressionRow = {
  user_id: string;
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

type InventoryRow = {
  item_key: string;
  quantity: number;
};

type WorldFlagRow = {
  flag_key: string;
};

@Injectable()
export class ShopsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBlacksmithShop(userId: string): Promise<BlacksmithShopState> {
    const unlocked = await this.isShopUnlocked(this.databaseService, userId);
    const worldFlags = unlocked ? await this.getWorldFlags(this.databaseService, userId) : new Set<string>();

    return {
      unlocked,
      offers: unlocked ? BLACKSMITH_OFFERS.filter((offer) => this.isOfferAvailable(offer, worldFlags)) : [],
    };
  }

  async buyBlacksmithOffer(
    userId: string,
    offerKey: string,
    quantity: number,
  ): Promise<BlacksmithPurchaseResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const unlocked = await this.isShopUnlocked(tx, userId);

      if (!unlocked) {
        throw new ForbiddenException('Blacksmith shop is locked');
      }

      const worldFlags = await this.getWorldFlags(tx, userId);
      const offer = this.resolveOffer(offerKey);
      if (!this.isOfferAvailable(offer, worldFlags)) {
        throw new ForbiddenException(`Blacksmith offer is locked: ${offerKey}`);
      }

      const progression = await this.getProgressionForUpdate(tx, userId);
      const totalCost = offer.goldPrice * quantity;

      if (progression.gold < totalCost) {
        throw new BadRequestException(`Not enough gold (${totalCost} required)`);
      }

      const newGold = progression.gold - totalCost;
      await tx.query(
        `
          UPDATE ${PLAYER_PROGRESSION_TABLE}
          SET gold = $2,
              updated_at = NOW()
          WHERE user_id = $1
        `,
        [userId, newGold],
      );

      const inventoryResult = await tx.query<InventoryRow>(
        `
          INSERT INTO ${INVENTORY_ITEMS_TABLE} (user_id, item_key, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, item_key)
          DO UPDATE
            SET quantity = ${INVENTORY_ITEMS_TABLE}.quantity + EXCLUDED.quantity,
                updated_at = NOW()
          RETURNING item_key, quantity
        `,
        [userId, offer.itemKey, quantity],
      );

      const inventoryRow = inventoryResult.rows[0];

      return {
        offer,
        quantity,
        totalCost,
        newGold,
        inventoryItem: {
          itemKey: inventoryRow.item_key,
          quantityAdded: quantity,
          totalQuantity: inventoryRow.quantity,
        },
      };
    });
  }

  private resolveOffer(offerKey: string): BlacksmithOffer {
    const offer = BLACKSMITH_OFFERS.find((entry) => entry.offerKey === offerKey);
    if (!offer) {
      throw new NotFoundException(`Unknown blacksmith offer: ${offerKey}`);
    }

    return offer;
  }

  private isOfferAvailable(offer: BlacksmithOffer, worldFlags: Set<string>): boolean {
    return offer.requiredFlags.every((flag) => worldFlags.has(flag));
  }

  private async getWorldFlags(executor: DatabaseService | TransactionClient, userId: string): Promise<Set<string>> {
    const result = await executor.query<WorldFlagRow>(
      `
        SELECT flag_key
        FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
      `,
      [userId],
    );

    return new Set(result.rows.map((row) => row.flag_key));
  }

  private async isShopUnlocked(
    executor: DatabaseService | TransactionClient,
    userId: string,
  ): Promise<boolean> {
    const result = await executor.query(
      `
        SELECT 1
        FROM ${WORLD_FLAGS_TABLE}
        WHERE user_id = $1
          AND flag_key = $2
        LIMIT 1
      `,
      [userId, BLACKSMITH_SHOP_UNLOCK_FLAG],
    );

    return (result.rowCount ?? 0) > 0;
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
}
