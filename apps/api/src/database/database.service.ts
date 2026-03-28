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

    this.logger.log('Database schema ensured');
  }
}
