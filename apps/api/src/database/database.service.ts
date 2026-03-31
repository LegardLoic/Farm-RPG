import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

export interface TransactionClient {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<T>>;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.getOrThrow<string>('DATABASE_URL');
    this.pool = new Pool({ connectionString });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureSchema();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, values);
  }

  async withTransaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async ensureSchema(): Promise<void> {
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        provider TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        email TEXT NOT NULL,
        display_name TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        photo_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT users_provider_provider_id_unique UNIQUE (provider, provider_id),
        CONSTRAINT users_email_unique UNIQUE (email)
      );
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash TEXT NOT NULL UNIQUE,
        user_agent TEXT,
        ip_address TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
      ON auth_sessions(user_id);
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx
      ON auth_sessions(expires_at);
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS player_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        hero_name TEXT NOT NULL,
        appearance_key TEXT NOT NULL DEFAULT 'default' CHECK (
          appearance_key IN ('default', 'ember', 'forest', 'night')
        ),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.query(`
      ALTER TABLE player_profiles
      ADD COLUMN IF NOT EXISTS appearance_key TEXT NOT NULL DEFAULT 'default';
    `);

    await this.query(`
      UPDATE player_profiles
      SET appearance_key = 'default'
      WHERE appearance_key IS NULL OR appearance_key NOT IN ('default', 'ember', 'forest', 'night');
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_key TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, item_key)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS inventory_items_user_id_idx
      ON inventory_items(user_id);
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS equipment_items (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        slot TEXT NOT NULL CHECK (
          slot IN (
            'helmet',
            'amulet',
            'chest',
            'legs',
            'boots',
            'gloves',
            'ring_left',
            'ring_right',
            'main_hand',
            'off_hand'
          )
        ),
        item_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, slot)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS equipment_items_user_id_idx
      ON equipment_items(user_id);
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS save_slots (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        slot SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 3),
        version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
        label TEXT,
        snapshot_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, slot)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS save_slots_user_id_idx
      ON save_slots(user_id);
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS autosaves (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
        reason TEXT NOT NULL,
        snapshot_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS player_progression (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
        experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
        experience_to_next INTEGER NOT NULL DEFAULT 100 CHECK (experience_to_next > 0),
        gold INTEGER NOT NULL DEFAULT 120 CHECK (gold >= 0),
        current_hp INTEGER NOT NULL DEFAULT 32 CHECK (current_hp >= 0),
        max_hp INTEGER NOT NULL DEFAULT 32 CHECK (max_hp > 0),
        current_mp INTEGER NOT NULL DEFAULT 15 CHECK (current_mp >= 0),
        max_mp INTEGER NOT NULL DEFAULT 15 CHECK (max_mp > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.query(`
      ALTER TABLE player_progression
      ADD COLUMN IF NOT EXISTS current_hp INTEGER NOT NULL DEFAULT 32;
    `);

    await this.query(`
      ALTER TABLE player_progression
      ADD COLUMN IF NOT EXISTS max_hp INTEGER NOT NULL DEFAULT 32;
    `);

    await this.query(`
      ALTER TABLE player_progression
      ADD COLUMN IF NOT EXISTS current_mp INTEGER NOT NULL DEFAULT 15;
    `);

    await this.query(`
      ALTER TABLE player_progression
      ADD COLUMN IF NOT EXISTS max_mp INTEGER NOT NULL DEFAULT 15;
    `);

    await this.query(`
      UPDATE player_progression
      SET current_hp = 32
      WHERE current_hp IS NULL OR current_hp < 0;
    `);

    await this.query(`
      UPDATE player_progression
      SET max_hp = 32
      WHERE max_hp IS NULL OR max_hp <= 0;
    `);

    await this.query(`
      UPDATE player_progression
      SET current_mp = 15
      WHERE current_mp IS NULL OR current_mp < 0;
    `);

    await this.query(`
      UPDATE player_progression
      SET max_mp = 15
      WHERE max_mp IS NULL OR max_mp <= 0;
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS world_state (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        zone TEXT NOT NULL DEFAULT 'Ferme',
        day INTEGER NOT NULL DEFAULT 1 CHECK (day >= 1),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS farm_plots (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plot_key TEXT NOT NULL,
        row_index SMALLINT NOT NULL CHECK (row_index >= 1),
        col_index SMALLINT NOT NULL CHECK (col_index >= 1),
        crop_key TEXT,
        planted_day INTEGER CHECK (planted_day IS NULL OR planted_day >= 1),
        growth_days SMALLINT CHECK (growth_days IS NULL OR growth_days >= 1),
        watered_today BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, plot_key)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS farm_plots_user_id_idx
      ON farm_plots(user_id);
    `);

    await this.query(`
      ALTER TABLE farm_plots
      ADD COLUMN IF NOT EXISTS row_index SMALLINT;
    `);

    await this.query(`
      ALTER TABLE farm_plots
      ADD COLUMN IF NOT EXISTS col_index SMALLINT;
    `);

    await this.query(`
      ALTER TABLE farm_plots
      ADD COLUMN IF NOT EXISTS crop_key TEXT;
    `);

    await this.query(`
      ALTER TABLE farm_plots
      ADD COLUMN IF NOT EXISTS planted_day INTEGER;
    `);

    await this.query(`
      ALTER TABLE farm_plots
      ADD COLUMN IF NOT EXISTS growth_days SMALLINT;
    `);

    await this.query(`
      ALTER TABLE farm_plots
      ADD COLUMN IF NOT EXISTS watered_today BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    await this.query(`
      UPDATE farm_plots
      SET watered_today = FALSE
      WHERE watered_today IS NULL;
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS village_npc_relationships (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        npc_key TEXT NOT NULL CHECK (npc_key IN ('mayor', 'blacksmith', 'merchant')),
        friendship INTEGER NOT NULL DEFAULT 0 CHECK (friendship >= 0),
        last_interaction_day INTEGER CHECK (last_interaction_day IS NULL OR last_interaction_day >= 1),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, npc_key)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS village_npc_relationships_user_id_idx
      ON village_npc_relationships(user_id);
    `);

    await this.query(`
      ALTER TABLE village_npc_relationships
      ADD COLUMN IF NOT EXISTS friendship INTEGER NOT NULL DEFAULT 0;
    `);

    await this.query(`
      ALTER TABLE village_npc_relationships
      ADD COLUMN IF NOT EXISTS last_interaction_day INTEGER;
    `);

    await this.query(`
      UPDATE village_npc_relationships
      SET friendship = 0
      WHERE friendship IS NULL OR friendship < 0;
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS quest_states (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quest_key TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'claimed')),
        progress_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, quest_key)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS quest_states_user_id_idx
      ON quest_states(user_id);
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS world_flags (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        flag_key TEXT NOT NULL,
        unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, flag_key)
      );
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS world_flags_user_id_idx
      ON world_flags(user_id);
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS tower_progression (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_floor INTEGER NOT NULL DEFAULT 1 CHECK (current_floor >= 1),
        highest_floor INTEGER NOT NULL DEFAULT 1 CHECK (highest_floor >= 1),
        boss_floor_10_defeated BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS combat_encounters (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        enemy_key TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'won', 'lost', 'fled')),
        state_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMPTZ
      );
    `);

    await this.query(`
      ALTER TABLE combat_encounters
      ADD COLUMN IF NOT EXISTS enemy_key TEXT;
    `);

    await this.query(`
      ALTER TABLE combat_encounters
      ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
    `);

    await this.query(`
      UPDATE combat_encounters
      SET enemy_key = COALESCE(state_json->>'enemyKey', 'forest_goblin')
      WHERE enemy_key IS NULL;
    `);

    await this.query(`
      ALTER TABLE combat_encounters
      ALTER COLUMN enemy_key SET NOT NULL;
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS combat_encounters_user_id_idx
      ON combat_encounters(user_id);
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS combat_encounters_user_status_idx
      ON combat_encounters(user_id, status);
    `);

    this.logger.log('Database schema ensured');
  }
}
