import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';

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
import { QuestsService } from '../quests/quests.service';
import {
  BLACKSMITH_OFFERS,
  BLACKSMITH_SHOP_UNLOCK_FLAG,
  VILLAGE_CROP_BUYBACK_OFFERS,
  VILLAGE_MARKET_UNLOCK_FLAGS,
  VILLAGE_SEED_OFFERS,
} from './shops.constants';
import type {
  BlacksmithOffer,
  BlacksmithPurchaseResult,
  BlacksmithShopState,
  VillageCropBuybackOffer,
  VillageCropSaleResult,
  VillageMarketState,
  VillageSeedOffer,
  VillageSeedPurchaseResult,
} from './shops.types';

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
  constructor(
    private readonly databaseService: DatabaseService,
    @Optional() private readonly questsService?: QuestsService,
  ) {}

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

  async getVillageMarket(userId: string): Promise<VillageMarketState> {
    const worldFlags = await this.getWorldFlags(this.databaseService, userId);
    const unlocked = this.isVillageMarketUnlocked(worldFlags);

    if (!unlocked) {
      return {
        unlocked: false,
        seedOffers: [],
        cropBuybackOffers: [],
      };
    }

    const seedOffers = VILLAGE_SEED_OFFERS.filter((offer) => this.isOfferAvailable(offer, worldFlags));
    const availableBuybackOffers = VILLAGE_CROP_BUYBACK_OFFERS.filter((offer) =>
      this.isOfferAvailable(offer, worldFlags),
    );
    const inventoryByItemKey = await this.getInventoryQuantitiesByItemKeys(
      this.databaseService,
      userId,
      availableBuybackOffers.map((offer) => offer.itemKey),
    );

    return {
      unlocked: true,
      seedOffers,
      cropBuybackOffers: availableBuybackOffers.map((offer) => ({
        ...offer,
        ownedQuantity: inventoryByItemKey.get(offer.itemKey) ?? 0,
      })),
    };
  }

  async buyVillageSeed(
    userId: string,
    offerKey: string,
    quantity: number,
  ): Promise<VillageSeedPurchaseResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const worldFlags = await this.getWorldFlags(tx, userId);
      if (!this.isVillageMarketUnlocked(worldFlags)) {
        throw new ForbiddenException('Village market is locked');
      }

      const offer = this.resolveVillageSeedOffer(offerKey);
      if (!this.isOfferAvailable(offer, worldFlags)) {
        throw new ForbiddenException(`Village seed offer is locked: ${offerKey}`);
      }

      const progression = await this.getProgressionForUpdate(tx, userId);
      const totalCost = offer.goldPrice * quantity;
      if (progression.gold < totalCost) {
        throw new BadRequestException(`Not enough gold (${totalCost} required)`);
      }

      const newGold = progression.gold - totalCost;
      await this.updatePlayerGold(tx, userId, newGold);

      const inventoryRow = await this.addInventoryQuantity(tx, userId, offer.itemKey, quantity);

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

  async sellVillageCrop(
    userId: string,
    itemKey: string,
    quantity: number,
  ): Promise<VillageCropSaleResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const worldFlags = await this.getWorldFlags(tx, userId);
      if (!this.isVillageMarketUnlocked(worldFlags)) {
        throw new ForbiddenException('Village market is locked');
      }

      const buybackOffer = this.resolveVillageCropBuybackOffer(itemKey);
      if (!this.isOfferAvailable(buybackOffer, worldFlags)) {
        throw new ForbiddenException(`Village buyback offer is locked: ${itemKey}`);
      }

      const inventoryRow = await this.getInventoryItemForUpdate(tx, userId, itemKey);
      if (!inventoryRow || inventoryRow.quantity < quantity) {
        throw new BadRequestException(`Not enough inventory for ${itemKey} (requested ${quantity})`);
      }

      const remainingQuantity = inventoryRow.quantity - quantity;
      if (remainingQuantity > 0) {
        await tx.query(
          `
            UPDATE ${INVENTORY_ITEMS_TABLE}
            SET quantity = $3,
                updated_at = NOW()
            WHERE user_id = $1
              AND item_key = $2
          `,
          [userId, itemKey, remainingQuantity],
        );
      } else {
        await tx.query(
          `
            DELETE FROM ${INVENTORY_ITEMS_TABLE}
            WHERE user_id = $1
              AND item_key = $2
          `,
          [userId, itemKey],
        );
      }

      const progression = await this.getProgressionForUpdate(tx, userId);
      const totalGoldGained = buybackOffer.goldValue * quantity;
      const newGold = progression.gold + totalGoldGained;
      await this.updatePlayerGold(tx, userId, newGold);

      if (this.questsService) {
        await this.questsService.recordVillageDelivery(tx, userId, {
          cropKey: buybackOffer.itemKey,
          quantity,
        });
      }

      return {
        itemKey: buybackOffer.itemKey,
        quantitySold: quantity,
        unitGoldValue: buybackOffer.goldValue,
        totalGoldGained,
        newGold,
        remainingQuantity,
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

  private resolveVillageSeedOffer(offerKey: string): VillageSeedOffer {
    const offer = VILLAGE_SEED_OFFERS.find((entry) => entry.offerKey === offerKey);
    if (!offer) {
      throw new NotFoundException(`Unknown village seed offer: ${offerKey}`);
    }

    return offer;
  }

  private resolveVillageCropBuybackOffer(itemKey: string): VillageCropBuybackOffer {
    const offer = VILLAGE_CROP_BUYBACK_OFFERS.find((entry) => entry.itemKey === itemKey);
    if (!offer) {
      throw new NotFoundException(`Unknown village crop buyback offer: ${itemKey}`);
    }

    return offer;
  }

  private isVillageMarketUnlocked(worldFlags: Set<string>): boolean {
    return VILLAGE_MARKET_UNLOCK_FLAGS.every((flag) => worldFlags.has(flag));
  }

  private isOfferAvailable(
    offer: BlacksmithOffer | VillageSeedOffer | VillageCropBuybackOffer,
    worldFlags: Set<string>,
  ): boolean {
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

  private async getInventoryQuantitiesByItemKeys(
    executor: DatabaseService | TransactionClient,
    userId: string,
    itemKeys: string[],
  ): Promise<Map<string, number>> {
    const inventoryByItemKey = new Map<string, number>();

    if (itemKeys.length === 0) {
      return inventoryByItemKey;
    }

    const result = await executor.query<InventoryRow>(
      `
        SELECT item_key, quantity
        FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
          AND item_key = ANY($2::text[])
      `,
      [userId, itemKeys],
    );

    for (const row of result.rows) {
      inventoryByItemKey.set(row.item_key, row.quantity);
    }

    return inventoryByItemKey;
  }

  private async getInventoryItemForUpdate(
    executor: TransactionClient,
    userId: string,
    itemKey: string,
  ): Promise<InventoryRow | null> {
    const result = await executor.query<InventoryRow>(
      `
        SELECT item_key, quantity
        FROM ${INVENTORY_ITEMS_TABLE}
        WHERE user_id = $1
          AND item_key = $2
        LIMIT 1
        FOR UPDATE
      `,
      [userId, itemKey],
    );

    return result.rows[0] ?? null;
  }

  private async addInventoryQuantity(
    executor: TransactionClient,
    userId: string,
    itemKey: string,
    quantity: number,
  ): Promise<InventoryRow> {
    const result = await executor.query<InventoryRow>(
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

    return result.rows[0];
  }

  private async updatePlayerGold(executor: TransactionClient, userId: string, gold: number): Promise<void> {
    await executor.query(
      `
        UPDATE ${PLAYER_PROGRESSION_TABLE}
        SET gold = $2,
            updated_at = NOW()
        WHERE user_id = $1
      `,
      [userId, gold],
    );
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
