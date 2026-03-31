import { BadRequestException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import {
  DEFAULT_HERO_APPEARANCE_KEY,
  HERO_APPEARANCE_KEYS,
  HERO_NAME_MAX_LENGTH,
  HERO_NAME_MIN_LENGTH,
  PLAYER_PROFILES_TABLE,
  type HeroAppearanceKey,
} from './profile.constants';
import type { PlayerProfileState } from './profile.types';

type PlayerProfileRow = {
  hero_name: string;
  appearance_key: string;
  created_at: Date | string;
  updated_at: Date | string;
};

@Injectable()
export class ProfileService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProfile(userId: string): Promise<PlayerProfileState | null> {
    const result = await this.databaseService.query<PlayerProfileRow>(
      `
        SELECT hero_name, appearance_key, created_at, updated_at
        FROM ${PLAYER_PROFILES_TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return this.toPlayerProfileState(row);
  }

  async upsertProfile(
    userId: string,
    heroNameInput: string,
    appearanceInput: HeroAppearanceKey,
  ): Promise<PlayerProfileState> {
    const heroName = this.normalizeHeroName(heroNameInput);
    const appearanceKey = this.normalizeAppearanceKey(appearanceInput);

    const result = await this.databaseService.query<PlayerProfileRow>(
      `
        INSERT INTO ${PLAYER_PROFILES_TABLE} (user_id, hero_name, appearance_key)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET
          hero_name = EXCLUDED.hero_name,
          appearance_key = EXCLUDED.appearance_key,
          updated_at = NOW()
        RETURNING hero_name, appearance_key, created_at, updated_at
      `,
      [userId, heroName, appearanceKey],
    );

    return this.toPlayerProfileState(result.rows[0]);
  }

  private normalizeHeroName(value: string): string {
    const normalized = value.trim().replace(/\s+/g, ' ');

    if (normalized.length < HERO_NAME_MIN_LENGTH || normalized.length > HERO_NAME_MAX_LENGTH) {
      throw new BadRequestException(
        `heroName must contain ${HERO_NAME_MIN_LENGTH}-${HERO_NAME_MAX_LENGTH} characters`,
      );
    }

    return normalized;
  }

  private normalizeAppearanceKey(value: string): HeroAppearanceKey {
    const normalized = value.trim().toLowerCase();
    if ((HERO_APPEARANCE_KEYS as readonly string[]).includes(normalized)) {
      return normalized as HeroAppearanceKey;
    }

    return DEFAULT_HERO_APPEARANCE_KEY;
  }

  private toPlayerProfileState(row: PlayerProfileRow): PlayerProfileState {
    return {
      heroName: row.hero_name,
      appearanceKey: this.normalizeAppearanceKey(row.appearance_key),
      createdAt: this.toIsoTimestamp(row.created_at),
      updatedAt: this.toIsoTimestamp(row.updated_at),
    };
  }

  private toIsoTimestamp(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed.toISOString();
    }

    return new Date().toISOString();
  }
}
