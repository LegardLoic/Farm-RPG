import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DatabaseService, type TransactionClient } from '../database/database.service';
import {
  BASE_PLAYER_EXPERIENCE,
  BASE_PLAYER_GOLD,
  BASE_PLAYER_LEVEL,
  PLAYER_PROGRESSION_TABLE,
  xpRequiredForLevel,
} from '../gameplay/gameplay.constants';
import { INVENTORY_ITEMS_TABLE } from '../inventory/inventory.constants';
import { QuestsService } from '../quests/quests.service';
import { TowerService } from '../tower/tower.service';
import {
  COMBAT_ENCOUNTERS_TABLE,
  COMBAT_ENEMY_DEFINITIONS,
  COMBAT_LOG_LIMIT,
  DEFAULT_COMBAT_ENEMY_KEY,
  DEFAULT_PLAYER_COMBAT_STATE,
  FIREBALL_MANA_COST,
} from './combat.constants';
import type {
  CombatActionName,
  CombatActionResult,
  CombatEnemyDefinition,
  CombatEncounterState,
  CombatEncounterSummary,
  CombatLootDropDefinition,
  CombatRewardItem,
  CombatStatus,
  CombatUnitState,
} from './combat.types';
import { ForfeitCombatDto } from './dto/forfeit-combat.dto';
import { StartCombatDto } from './dto/start-combat.dto';

type CombatEncounterRow = {
  id: string;
  user_id: string;
  enemy_key: string;
  status: CombatStatus;
  state_json: CombatEncounterState | string;
  created_at: Date | string;
  updated_at: Date | string;
  ended_at: Date | string | null;
};

type PlayerProgressionRow = {
  user_id: string;
  level: number;
  experience: number;
  experience_to_next: number;
  gold: number;
};

@Injectable()
export class CombatService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly questsService: QuestsService,
    private readonly towerService: TowerService,
  ) {}

  async startCombat(userId: string, payload: StartCombatDto): Promise<CombatActionResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const activeEncounter = await this.findActiveEncounter(tx, userId, true);
      if (activeEncounter) {
        return this.toActionResult(activeEncounter);
      }

      const enemy = this.resolveEnemyDefinition(payload?.enemyKey);
      const encounter = this.createEncounter(userId, enemy);
      const row = await this.insertEncounter(tx, encounter);

      return this.toActionResult(this.toEncounterState(row));
    });
  }

  async getCurrentCombat(userId: string): Promise<CombatActionResult | null> {
    const row = await this.findActiveEncounter(this.databaseService, userId, false);
    if (!row) {
      return null;
    }

    return this.toActionResult(row);
  }

  async getCombatById(userId: string, encounterId: string): Promise<CombatActionResult> {
    const row = await this.findEncounterById(userId, encounterId, false);
    return this.toActionResult(this.toEncounterState(row));
  }

  async performAction(
    userId: string,
    encounterId: string,
    action: CombatActionName,
  ): Promise<CombatActionResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const row = await this.findEncounterById(userId, encounterId, true, tx);
      const encounter = this.toEncounterState(row);

      if (encounter.status !== 'active') {
        throw new ConflictException('Combat encounter is not active');
      }

      if (encounter.turn !== 'player') {
        throw new ConflictException('It is not the player turn');
      }

      const nextState = this.resolvePlayerAction(encounter, action);
      const finalizedState = await this.applyVictoryRewardsIfNeeded(tx, userId, nextState);
      if (finalizedState.status === 'won') {
        const towerProgress = await this.towerService.recordCombatVictory(tx, userId);
        await this.questsService.recordCombatVictory(tx, userId, {
          enemyKey: finalizedState.enemyKey,
          towerHighestFloor: towerProgress.state.highestFloor,
        });
        this.pushLog(
          finalizedState,
          `Tower progress: floor ${towerProgress.previousFloor} -> ${towerProgress.currentFloor}.`,
        );
        for (const flag of towerProgress.reachedMilestoneFlags) {
          this.pushLog(finalizedState, `Milestone unlocked: ${flag}.`);
        }
      }

      const savedRow = await this.saveEncounter(tx, finalizedState);
      const savedEncounter = this.toEncounterState(savedRow);

      return this.toActionResult(savedEncounter);
    });
  }

  async forfeitCombat(
    userId: string,
    encounterId: string,
    payload: ForfeitCombatDto,
  ): Promise<CombatActionResult> {
    return this.databaseService.withTransaction(async (tx) => {
      const row = await this.findEncounterById(userId, encounterId, true, tx);
      const encounter = this.toEncounterState(row);

      if (encounter.status !== 'active') {
        throw new ConflictException('Combat encounter is not active');
      }

      const message = payload.reason?.trim()
        ? `You fled: ${payload.reason.trim()}.`
        : 'You fled from combat.';
      const forfeited = this.appendLog(encounter, message);
      forfeited.status = 'fled';
      forfeited.turn = 'player';
      forfeited.endedAt = new Date().toISOString();
      forfeited.lastAction = null;
      forfeited.updatedAt = forfeited.endedAt;

      const savedRow = await this.saveEncounter(tx, forfeited);
      return this.toActionResult(this.toEncounterState(savedRow));
    });
  }

  private createEncounter(userId: string, enemy: CombatEnemyDefinition): CombatEncounterState {
    const now = new Date().toISOString();

    return {
      id: randomUUID(),
      userId,
      enemyKey: enemy.key,
      turn: 'player',
      status: 'active',
      round: 1,
      logs: [`A wild ${enemy.name} appears.`],
      player: { ...DEFAULT_PLAYER_COMBAT_STATE },
      enemy: {
        ...enemy,
        currentHp: enemy.hp,
        currentMp: enemy.mp,
      },
      lastAction: null,
      rewards: null,
      rewardsGranted: false,
      createdAt: now,
      updatedAt: now,
      endedAt: null,
    };
  }

  private resolvePlayerAction(encounter: CombatEncounterState, action: CombatActionName): CombatEncounterState {
    const next = this.cloneEncounter(encounter);
    next.lastAction = action;
    next.updatedAt = new Date().toISOString();
    next.turn = 'enemy';
    next.player.defending = false;

    switch (action) {
      case 'attack': {
        const damage = this.calculatePhysicalDamage(next.player, next.enemy);
        next.enemy.currentHp = Math.max(0, next.enemy.currentHp - damage);
        this.pushLog(next, `You attack ${next.enemy.name} for ${damage} damage.`);
        break;
      }
      case 'defend': {
        next.player.defending = true;
        this.pushLog(next, 'You brace for the next enemy attack.');
        break;
      }
      case 'fireball': {
        if (next.player.mp < FIREBALL_MANA_COST) {
          throw new BadRequestException('Not enough MP for Fireball');
        }

        next.player.mp -= FIREBALL_MANA_COST;
        const damage = this.calculateMagicDamage(next.player, next.enemy);
        next.enemy.currentHp = Math.max(0, next.enemy.currentHp - damage);
        this.pushLog(next, `You cast Fireball on ${next.enemy.name} for ${damage} damage.`);
        break;
      }
      default: {
        throw new BadRequestException('Unsupported combat action');
      }
    }

    if (next.enemy.currentHp <= 0) {
      next.status = 'won';
      next.turn = 'player';
      next.endedAt = next.updatedAt;
      this.pushLog(next, `${next.enemy.name} is defeated.`);
      return next;
    }

    this.resolveEnemyTurn(next);

    if (next.player.hp <= 0) {
      next.status = 'lost';
      next.turn = 'player';
      next.endedAt = next.updatedAt;
      this.pushLog(next, 'You have been defeated.');
      return next;
    }

    next.turn = 'player';
    next.round += 1;
    return next;
  }

  private async applyVictoryRewardsIfNeeded(
    executor: TransactionClient,
    userId: string,
    encounter: CombatEncounterState,
  ): Promise<CombatEncounterState> {
    if (encounter.status !== 'won' || encounter.rewardsGranted) {
      return encounter;
    }

    const next = this.cloneEncounter(encounter);
    const rewardProfile = next.enemy.rewards;
    const progressionBefore = await this.getProgressionForUpdate(executor, userId);
    const progressionAfter = this.computeProgressionAfterVictory(
      progressionBefore,
      rewardProfile.experience,
      rewardProfile.gold,
    );

    await this.persistProgression(executor, progressionAfter);

    const items = this.rollLootItems(rewardProfile.loot);
    for (const item of items) {
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

    next.rewardsGranted = true;
    next.rewards = {
      experience: rewardProfile.experience,
      gold: rewardProfile.gold,
      items,
      levelBefore: progressionBefore.level,
      levelAfter: progressionAfter.level,
    };
    next.updatedAt = new Date().toISOString();

    this.pushLog(next, `Rewards: +${rewardProfile.experience} XP, +${rewardProfile.gold} gold.`);

    if (items.length > 0) {
      this.pushLog(next, `Loot: ${this.formatLootForLog(items)}.`);
    } else {
      this.pushLog(next, 'Loot: none.');
    }

    if (progressionAfter.level > progressionBefore.level) {
      this.pushLog(next, `Level up: ${progressionBefore.level} -> ${progressionAfter.level}.`);
    }

    return next;
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

  private async persistProgression(
    executor: TransactionClient,
    progression: PlayerProgressionRow,
  ): Promise<void> {
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

  private computeProgressionAfterVictory(
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

  private rollLootItems(lootTable: CombatLootDropDefinition[]): CombatRewardItem[] {
    const rewards: CombatRewardItem[] = [];

    for (const candidate of lootTable) {
      if (Math.random() > candidate.chance) {
        continue;
      }

      const quantity = this.randomInt(candidate.minQuantity, candidate.maxQuantity);
      if (quantity <= 0) {
        continue;
      }

      rewards.push({
        itemKey: candidate.itemKey,
        quantity,
      });
    }

    return rewards;
  }

  private randomInt(min: number, max: number): number {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }

  private formatLootForLog(items: CombatRewardItem[]): string {
    return items.map((item) => `${item.itemKey} x${item.quantity}`).join(', ');
  }

  private resolveEnemyTurn(encounter: CombatEncounterState): void {
    const damage = this.calculateEnemyDamage(encounter.enemy, encounter.player);
    const mitigatedDamage = encounter.player.defending ? Math.max(1, Math.floor(damage / 2)) : damage;

    encounter.player.hp = Math.max(0, encounter.player.hp - mitigatedDamage);
    encounter.player.defending = false;
    encounter.updatedAt = new Date().toISOString();
    this.pushLog(encounter, `${encounter.enemy.name} hits you for ${mitigatedDamage} damage.`);
  }

  private calculatePhysicalDamage(player: CombatUnitState, enemy: CombatEncounterState['enemy']): number {
    return Math.max(1, player.attack + 2 - enemy.defense);
  }

  private calculateMagicDamage(player: CombatUnitState, enemy: CombatEncounterState['enemy']): number {
    return Math.max(1, player.magicAttack + 4 - enemy.defense);
  }

  private calculateEnemyDamage(enemy: CombatEncounterState['enemy'], player: CombatUnitState): number {
    return Math.max(1, enemy.attack + 2 - player.defense);
  }

  private resolveEnemyDefinition(enemyKey?: string): CombatEnemyDefinition {
    if (!enemyKey) {
      return COMBAT_ENEMY_DEFINITIONS[DEFAULT_COMBAT_ENEMY_KEY];
    }

    const enemy = COMBAT_ENEMY_DEFINITIONS[enemyKey];
    if (!enemy) {
      throw new BadRequestException(`Unknown enemyKey: ${enemyKey}`);
    }

    return enemy;
  }

  private async findActiveEncounter(
    executor: DatabaseService | TransactionClient,
    userId: string,
    lockRow: boolean,
  ): Promise<CombatEncounterState | null> {
    const lockClause = lockRow ? 'FOR UPDATE' : '';
    const result = await executor.query<CombatEncounterRow>(
      `
        SELECT id, user_id, enemy_key, status, state_json, created_at, updated_at, ended_at
        FROM ${COMBAT_ENCOUNTERS_TABLE}
        WHERE user_id = $1
          AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1
        ${lockClause}
      `,
      [userId],
    );

    const row = result.rows[0];
    return row ? this.toEncounterState(row) : null;
  }

  private async findEncounterById(
    userId: string,
    encounterId: string,
    lockRow: boolean,
    executor: DatabaseService | TransactionClient = this.databaseService,
  ): Promise<CombatEncounterRow> {
    const lockClause = lockRow ? 'FOR UPDATE' : '';
    const result = await executor.query<CombatEncounterRow>(
      `
        SELECT id, user_id, enemy_key, status, state_json, created_at, updated_at, ended_at
        FROM ${COMBAT_ENCOUNTERS_TABLE}
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
        ${lockClause}
      `,
      [encounterId, userId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Combat encounter ${encounterId} not found`);
    }

    return row;
  }

  private async insertEncounter(
    executor: TransactionClient,
    encounter: CombatEncounterState,
  ): Promise<CombatEncounterRow> {
    const result = await executor.query<CombatEncounterRow>(
      `
        INSERT INTO ${COMBAT_ENCOUNTERS_TABLE} (
          id,
          user_id,
          enemy_key,
          status,
          state_json,
          created_at,
          updated_at,
          ended_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW(), $6)
        RETURNING id, user_id, enemy_key, status, state_json, created_at, updated_at, ended_at
      `,
      [
        encounter.id,
        encounter.userId,
        encounter.enemyKey,
        encounter.status,
        JSON.stringify(encounter),
        encounter.endedAt,
      ],
    );

    return result.rows[0];
  }

  private async saveEncounter(
    executor: TransactionClient,
    encounter: CombatEncounterState,
  ): Promise<CombatEncounterRow> {
    const result = await executor.query<CombatEncounterRow>(
      `
        UPDATE ${COMBAT_ENCOUNTERS_TABLE}
        SET state_json = $2::jsonb,
            status = $3,
            updated_at = NOW(),
            ended_at = $4
        WHERE id = $1
        RETURNING id, user_id, enemy_key, status, state_json, created_at, updated_at, ended_at
      `,
      [
        encounter.id,
        JSON.stringify(encounter),
        encounter.status,
        encounter.status === 'active' ? null : encounter.endedAt,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(`Combat encounter ${encounter.id} not found`);
    }

    return row;
  }

  private toEncounterState(row: CombatEncounterRow): CombatEncounterState {
    return this.toEncounterStateFromJson(row.state_json);
  }

  private toEncounterStateFromJson(value: CombatEncounterState | string): CombatEncounterState {
    const parsed = typeof value === 'string' ? (JSON.parse(value) as CombatEncounterState) : value;
    const enemyTemplate = this.resolveEnemyDefinition(parsed.enemyKey);

    return {
      ...parsed,
      logs: Array.isArray(parsed.logs) ? parsed.logs.slice(-COMBAT_LOG_LIMIT) : [],
      player: {
        ...parsed.player,
        defending: Boolean(parsed.player.defending),
      },
      enemy: {
        ...enemyTemplate,
        ...parsed.enemy,
        rewards: parsed.enemy?.rewards ?? enemyTemplate.rewards,
        currentHp: parsed.enemy?.currentHp ?? enemyTemplate.hp,
        currentMp: parsed.enemy?.currentMp ?? enemyTemplate.mp,
      },
      rewards: parsed.rewards ?? null,
      rewardsGranted: Boolean(parsed.rewardsGranted),
    };
  }

  private toActionResult(encounter: CombatEncounterState): CombatActionResult {
    const normalized = this.normalizeEncounter(encounter);

    return {
      encounter: normalized,
      summary: this.toSummary(normalized),
    };
  }

  private toSummary(encounter: CombatEncounterState): CombatEncounterSummary {
    return {
      id: encounter.id,
      enemyKey: encounter.enemyKey,
      status: encounter.status,
      turn: encounter.turn,
      round: encounter.round,
      createdAt: encounter.createdAt,
      updatedAt: encounter.updatedAt,
    };
  }

  private normalizeEncounter(encounter: CombatEncounterState): CombatEncounterState {
    return {
      ...encounter,
      logs: encounter.logs.slice(-COMBAT_LOG_LIMIT),
    };
  }

  private cloneEncounter(encounter: CombatEncounterState): CombatEncounterState {
    return this.toEncounterStateFromJson(JSON.stringify(encounter));
  }

  private appendLog(encounter: CombatEncounterState, message: string): CombatEncounterState {
    const next = this.cloneEncounter(encounter);
    this.pushLog(next, message);
    return next;
  }

  private pushLog(encounter: CombatEncounterState, message: string): void {
    encounter.logs.push(message);
    encounter.logs = encounter.logs.slice(-COMBAT_LOG_LIMIT);
  }
}
