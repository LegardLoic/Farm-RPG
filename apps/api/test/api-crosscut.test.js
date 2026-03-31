'use strict';

const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const test = require('node:test');

const { verify } = require('jsonwebtoken');

const { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } = require('../dist/auth/auth.constants.js');
const { AuthService } = require('../dist/auth/auth.service.js');
const {
  buildDebugForceCombatEnemyFlag,
  DEBUG_STATE_PRESET_KEYS,
  DEBUG_STATE_PRESET_WORLD_FLAG_KEYS,
  parseDebugForceCombatEnemyFlag,
} = require('../dist/debug/debug-admin.constants.js');
const { CombatService } = require('../dist/combat/combat.service.js');
const { GameplayService } = require('../dist/gameplay/gameplay.service.js');
const { ProfileService } = require('../dist/profile/profile.service.js');
const { SavesService } = require('../dist/saves/saves.service.js');
const { BLACKSMITH_SHOP_UNLOCK_FLAG } = require('../dist/shops/shops.constants.js');
const { ShopsService } = require('../dist/shops/shops.service.js');

function createConfigService(overrides = {}) {
  return {
    get(key, fallback) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        return overrides[key];
      }

      if (key === 'NODE_ENV') {
        return 'production';
      }

      return fallback;
    },
    getOrThrow(key) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        return overrides[key];
      }

      throw new Error(`Missing config value: ${key}`);
    },
  };
}

function createCookieResponse() {
  return {
    cookies: [],
    clears: [],
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
    },
    clearCookie(name, options) {
      this.clears.push({ name, options });
    },
  };
}

function createAuthDatabaseStub() {
  const calls = [];
  return {
    calls,
    async query(text, values = []) {
      calls.push({ text, values });

      if (text.includes('INSERT INTO users')) {
        return {
          rows: [
            {
              id: 'user-1',
              email: 'legardloic@example.com',
              display_name: 'Loic Legard',
              first_name: 'Loic',
              last_name: 'Legard',
              photo_url: 'https://example.com/avatar.png',
            },
          ],
        };
      }

      if (text.includes('INSERT INTO auth_sessions')) {
        return { rows: [] };
      }

      throw new Error(`Unexpected auth query: ${text}`);
    },
  };
}

function createShopDatabaseStub({ unlocked, worldFlags, initialGold = 120, inventory = {} }) {
  const calls = [];
  const state = {
    progression: {
      user_id: 'user-1',
      level: 1,
      experience: 0,
      experience_to_next: 100,
      gold: initialGold,
    },
    worldFlags: new Set(worldFlags ?? []),
    inventory: new Map(Object.entries(inventory)),
  };

  const executeQuery = async (text, values = []) => {
    calls.push({ text, values });

    if (text.includes('SELECT 1') && text.includes('flag_key = $2')) {
      const flagKey = values[1];
      const hasFlag = state.worldFlags.has(flagKey);
      const unlockedState =
        typeof unlocked === 'boolean' && flagKey === BLACKSMITH_SHOP_UNLOCK_FLAG
          ? unlocked
          : hasFlag;

      return {
        rowCount: unlockedState ? 1 : 0,
        rows: unlockedState ? [{}] : [],
      };
    }

    if (text.includes('SELECT flag_key') && text.includes('FROM world_flags')) {
      return {
        rows: Array.from(state.worldFlags)
          .sort((left, right) => left.localeCompare(right))
          .map((flag_key) => ({ flag_key })),
      };
    }

    if (text.includes('INSERT INTO player_progression')) {
      return { rows: [] };
    }

    if (text.includes('SELECT user_id, level, experience, experience_to_next, gold')) {
      return {
        rows: [{ ...state.progression }],
      };
    }

    if (text.includes('UPDATE player_progression') && text.includes('SET gold = $2')) {
      state.progression.gold = values[1];
      return { rows: [] };
    }

    if (text.includes('SELECT item_key, quantity') && text.includes('item_key = ANY($2::text[])')) {
      const itemKeys = Array.isArray(values[1]) ? values[1] : [];
      const rows = itemKeys
        .map((itemKey) => {
          const quantity = state.inventory.get(itemKey);
          if (typeof quantity !== 'number') {
            return null;
          }

          return { item_key: itemKey, quantity };
        })
        .filter((row) => row !== null);
      return { rows };
    }

    if (text.includes('SELECT item_key, quantity') && text.includes('LIMIT 1') && text.includes('FOR UPDATE')) {
      const itemKey = values[1];
      const quantity = state.inventory.get(itemKey);
      if (typeof quantity !== 'number') {
        return { rows: [] };
      }

      return {
        rows: [{ item_key: itemKey, quantity }],
      };
    }

    if (text.includes('INSERT INTO inventory_items')) {
      const itemKey = values[1];
      const quantity = values[2];
      const nextQuantity = (state.inventory.get(itemKey) ?? 0) + quantity;
      state.inventory.set(itemKey, nextQuantity);

      return {
        rows: [{ item_key: itemKey, quantity: nextQuantity }],
      };
    }

    if (text.includes('UPDATE inventory_items') && text.includes('SET quantity = $3')) {
      const itemKey = values[1];
      const quantity = values[2];
      state.inventory.set(itemKey, quantity);
      return { rows: [] };
    }

    if (text.includes('DELETE FROM inventory_items')) {
      state.inventory.delete(values[1]);
      return { rows: [] };
    }

    throw new Error(`Unexpected shop query: ${text}`);
  };

  return {
    calls,
    state,
    async query(text, values = []) {
      return executeQuery(text, values);
    },
    async withTransaction(callback) {
      return callback({
        async query(text, values = []) {
          return executeQuery(text, values);
        },
      });
    },
  };
}

function createQuestProgressRecorder() {
  return {
    harvestCalls: [],
    deliveryCalls: [],
    async recordFarmHarvest(_executor, userId, input) {
      this.harvestCalls.push({
        userId,
        input: {
          cropKey: input.cropKey,
          quantity: input.quantity,
        },
      });
    },
    async recordVillageDelivery(_executor, userId, input) {
      this.deliveryCalls.push({
        userId,
        input: {
          cropKey: input.cropKey,
          quantity: input.quantity,
        },
      });
    },
  };
}

function createSavesService() {
  return new SavesService({
    async query() {
      throw new Error('Unexpected saves database query');
    },
    async withTransaction(callback) {
      return callback({
        async query() {
          throw new Error('Unexpected saves transaction query');
        },
      });
    },
  });
}

function createCombatService() {
  return new CombatService({}, {}, {}, {});
}

function createProfileDatabaseStub(initialProfile = null) {
  const state = {
    profile: initialProfile,
  };

  return {
    state,
    async query(text, values = []) {
      if (text.includes('SELECT hero_name, appearance_key, created_at, updated_at')) {
        if (!state.profile) {
          return { rows: [] };
        }

        return {
          rows: [
            {
              hero_name: state.profile.hero_name,
              appearance_key: state.profile.appearance_key,
              created_at: state.profile.created_at,
              updated_at: state.profile.updated_at,
            },
          ],
        };
      }

      if (text.includes('INSERT INTO player_profiles')) {
        const now = '2026-03-31T09:00:00.000Z';
        state.profile = {
          hero_name: values[1],
          appearance_key: values[2],
          created_at: state.profile?.created_at ?? now,
          updated_at: now,
        };

        return {
          rows: [
            {
              hero_name: state.profile.hero_name,
              appearance_key: state.profile.appearance_key,
              created_at: state.profile.created_at,
              updated_at: state.profile.updated_at,
            },
          ],
        };
      }

      throw new Error(`Unexpected profile query: ${text}`);
    },
  };
}

function createGameplayDatabaseStub(
  initialFlags = [],
  initialFarmPlots = [],
  initialInventory = {},
  initialRelationships = {},
  initialTower = {
    current_floor: 1,
    highest_floor: 1,
    boss_floor_10_defeated: false,
  },
) {
  const state = {
    worldFlags: new Set(initialFlags),
    world: {
      zone: 'Ferme',
      day: 1,
    },
    tower: {
      current_floor: Math.max(1, Math.floor(initialTower.current_floor ?? 1)),
      highest_floor: Math.max(1, Math.floor(initialTower.highest_floor ?? 1)),
      boss_floor_10_defeated: Boolean(initialTower.boss_floor_10_defeated),
    },
    farmPlots: new Map(),
    inventory: new Map(Object.entries(initialInventory)),
    relationships: new Map(),
  };
  const calls = [];

  for (const npcKey of ['mayor', 'blacksmith', 'merchant']) {
    const initial = initialRelationships[npcKey];
    state.relationships.set(npcKey, {
      npc_key: npcKey,
      friendship: Math.max(0, Math.floor(initial?.friendship ?? 0)),
      last_interaction_day:
        Number.isInteger(initial?.last_interaction_day) && initial.last_interaction_day > 0
          ? initial.last_interaction_day
          : null,
    });
  }

  for (const plot of initialFarmPlots) {
    state.farmPlots.set(plot.plot_key, {
      plot_key: plot.plot_key,
      row_index: plot.row_index,
      col_index: plot.col_index,
      crop_key: plot.crop_key ?? null,
      planted_day: plot.planted_day ?? null,
      growth_days: plot.growth_days ?? null,
      watered_today: Boolean(plot.watered_today),
    });
  }

  const executeQuery = async (text, values = []) => {
    calls.push({ text, values });

    if (text.includes('INSERT INTO world_state')) {
      return { rows: [] };
    }

    if (text.includes('SELECT zone, day') && text.includes('FROM world_state')) {
      return {
        rows: [{ ...state.world }],
      };
    }

    if (text.includes('SELECT flag_key') && text.includes('FROM world_flags')) {
      return {
        rows: Array.from(state.worldFlags)
          .sort((left, right) => left.localeCompare(right))
          .map((flag_key) => ({ flag_key })),
      };
    }

    if (text.includes('INSERT INTO world_flags')) {
      const flagKey = values[1];
      state.worldFlags.add(flagKey);
      return { rows: [] };
    }

    if (text.includes('UPDATE world_state') && text.includes('SET zone = $2')) {
      state.world.zone = values[1];
      return { rows: [] };
    }

    if (text.includes('UPDATE world_state') && text.includes('SET day = $2')) {
      state.world.day = values[1];
      return { rows: [] };
    }

    if (text.includes('INSERT INTO tower_progression')) {
      return { rows: [] };
    }

    if (text.includes('SELECT current_floor, highest_floor, boss_floor_10_defeated') && text.includes('FROM tower_progression')) {
      return {
        rows: [{ ...state.tower }],
      };
    }

    if (text.includes('INSERT INTO farm_plots')) {
      for (let index = 1; index < values.length; index += 3) {
        const plotKey = values[index];
        const rowIndex = values[index + 1];
        const colIndex = values[index + 2];
        if (!state.farmPlots.has(plotKey)) {
          state.farmPlots.set(plotKey, {
            plot_key: plotKey,
            row_index: rowIndex,
            col_index: colIndex,
            crop_key: null,
            planted_day: null,
            growth_days: null,
            watered_today: false,
          });
        }
      }
      return { rows: [] };
    }

    if (text.includes('INSERT INTO village_npc_relationships')) {
      const npcKey = values[1];
      if (!state.relationships.has(npcKey)) {
        state.relationships.set(npcKey, {
          npc_key: npcKey,
          friendship: 0,
          last_interaction_day: null,
        });
      }
      return { rows: [] };
    }

    if (
      text.includes('SELECT npc_key, friendship, last_interaction_day') &&
      text.includes('FROM village_npc_relationships') &&
      text.includes('npc_key = $2') &&
      text.includes('FOR UPDATE')
    ) {
      const npcKey = values[1];
      const row = state.relationships.get(npcKey);
      return {
        rows: row ? [{ ...row }] : [],
      };
    }

    if (
      text.includes('SELECT npc_key, friendship, last_interaction_day') &&
      text.includes('FROM village_npc_relationships')
    ) {
      return {
        rows: Array.from(state.relationships.values())
          .sort((left, right) => left.npc_key.localeCompare(right.npc_key))
          .map((entry) => ({ ...entry })),
      };
    }

    if (text.includes('UPDATE village_npc_relationships')) {
      const npcKey = values[1];
      const row = state.relationships.get(npcKey);
      if (row) {
        row.friendship = values[2];
        row.last_interaction_day = values[3];
      }
      return { rows: [] };
    }

    if (
      text.includes('SELECT plot_key, row_index, col_index, crop_key, planted_day, growth_days, watered_today') &&
      text.includes('AND plot_key = $2') &&
      text.includes('FOR UPDATE')
    ) {
      const plotKey = values[1];
      const row = state.farmPlots.get(plotKey);
      return {
        rows: row ? [{ ...row }] : [],
      };
    }

    if (text.includes('UPDATE farm_plots') && text.includes('SET crop_key = $3')) {
      const plotKey = values[1];
      const row = state.farmPlots.get(plotKey);
      if (row) {
        row.crop_key = values[2];
        row.planted_day = values[3];
        row.growth_days = values[4];
        row.watered_today = false;
      }
      return { rows: [] };
    }

    if (text.includes('UPDATE farm_plots') && text.includes('SET watered_today = TRUE')) {
      const plotKey = values[1];
      const row = state.farmPlots.get(plotKey);
      if (row) {
        row.watered_today = true;
      }
      return { rows: [] };
    }

    if (text.includes('UPDATE farm_plots') && text.includes('SET watered_today = FALSE') && text.includes('AND watered_today = TRUE')) {
      for (const row of state.farmPlots.values()) {
        row.watered_today = false;
      }
      return { rows: [] };
    }

    if (text.includes('UPDATE farm_plots') && text.includes('SET crop_key = NULL')) {
      const plotKey = values[1];
      const row = state.farmPlots.get(plotKey);
      if (row) {
        row.crop_key = null;
        row.planted_day = null;
        row.growth_days = null;
        row.watered_today = false;
      }
      return { rows: [] };
    }

    if (text.includes('SELECT plot_key, row_index, col_index, crop_key, planted_day, growth_days, watered_today')) {
      const rows = Array.from(state.farmPlots.values())
        .sort((left, right) => left.row_index - right.row_index || left.col_index - right.col_index)
        .map((entry) => ({ ...entry }));
      return { rows };
    }

    if (text.includes('SELECT item_key, quantity') && text.includes('FROM inventory_items') && text.includes('FOR UPDATE')) {
      const itemKey = values[1];
      const quantity = state.inventory.get(itemKey);
      if (typeof quantity !== 'number') {
        return { rows: [] };
      }

      return {
        rows: [{ item_key: itemKey, quantity }],
      };
    }

    if (text.includes('SELECT item_key, quantity') && text.includes('FROM inventory_items') && text.includes('item_key = ANY($2::text[])')) {
      const itemKeys = Array.isArray(values[1]) ? values[1] : [];
      const rows = itemKeys
        .map((itemKey) => {
          const quantity = state.inventory.get(itemKey);
          if (typeof quantity !== 'number') {
            return null;
          }

          return {
            item_key: itemKey,
            quantity,
          };
        })
        .filter((row) => row !== null);
      return { rows };
    }

    if (text.includes('UPDATE inventory_items') && text.includes('SET quantity = $3')) {
      const itemKey = values[1];
      const quantity = values[2];
      if (quantity > 0) {
        state.inventory.set(itemKey, quantity);
      } else {
        state.inventory.delete(itemKey);
      }
      return { rows: [] };
    }

    if (text.includes('DELETE FROM inventory_items')) {
      const itemKey = values[1];
      state.inventory.delete(itemKey);
      return { rows: [] };
    }

    if (text.includes('INSERT INTO inventory_items')) {
      const itemKey = values[1];
      const quantity = values[2];
      const nextQuantity = (state.inventory.get(itemKey) ?? 0) + quantity;
      state.inventory.set(itemKey, nextQuantity);
      return {
        rows: [{ item_key: itemKey, quantity: nextQuantity }],
      };
    }

    throw new Error(`Unexpected gameplay query: ${text}`);
  };

  return {
    calls,
    state,
    async query(text, values = []) {
      return executeQuery(text, values);
    },
    async withTransaction(callback) {
      return callback({
        async query(text, values = []) {
          return executeQuery(text, values);
        },
      });
    },
  };
}

function createDefeatPenaltyExecutor() {
  const state = {
    progression: {
      user_id: 'user-1',
      level: 3,
      experience: 40,
      experience_to_next: 150,
      gold: 200,
      current_hp: 18,
      max_hp: 32,
      current_mp: 9,
      max_mp: 15,
    },
    inventory: new Map([
      ['healing_herb', 2],
      ['iron_ore', 1],
    ]),
    world: {
      zone: 'Village',
      day: 3,
    },
  };

  return {
    state,
    async query(text, values = []) {
      if (text.includes('INSERT INTO player_progression')) {
        return { rows: [] };
      }

      if (text.includes('SELECT user_id, level, experience, experience_to_next, gold, current_hp')) {
        return {
          rows: [{ ...state.progression }],
        };
      }

      if (text.includes('UPDATE player_progression') && text.includes('current_hp')) {
        state.progression = {
          ...state.progression,
          level: values[1],
          experience: values[2],
          experience_to_next: values[3],
          gold: values[4],
          current_hp: values[5],
          max_hp: values[6],
          current_mp: values[7],
          max_mp: values[8],
        };
        return { rows: [] };
      }

      if (text.includes('SELECT item_key, quantity') && text.includes('FROM inventory_items')) {
        return {
          rows: Array.from(state.inventory.entries())
            .map(([item_key, quantity]) => ({ item_key, quantity }))
            .sort((left, right) => left.item_key.localeCompare(right.item_key)),
        };
      }

      if (text.includes('DELETE FROM inventory_items')) {
        state.inventory.delete(values[1]);
        return { rows: [] };
      }

      if (text.includes('UPDATE inventory_items') && text.includes('quantity = quantity - 1')) {
        const itemKey = values[1];
        const current = state.inventory.get(itemKey) ?? 0;
        if (current > 1) {
          state.inventory.set(itemKey, current - 1);
        }
        return { rows: [] };
      }

      if (text.includes('INSERT INTO world_state')) {
        return { rows: [] };
      }

      if (text.includes('SELECT zone, day') && text.includes('FROM world_state')) {
        return {
          rows: [{ ...state.world }],
        };
      }

      if (text.includes('UPDATE world_state')) {
        state.world = {
          zone: values[1],
          day: values[2],
        };
        return { rows: [] };
      }

      throw new Error(`Unexpected combat penalty query: ${text}`);
    },
  };
}

test('auth service issues JWTs and persists hashed refresh tokens', async () => {
  const db = createAuthDatabaseStub();
  const service = new AuthService(db, createConfigService({
    ACCESS_TOKEN_SECRET: 'test-access-token-secret',
    ACCESS_TOKEN_TTL: '15m',
    REFRESH_TOKEN_TTL_DAYS: 30,
  }));

  const result = await service.signInWithGoogle(
    {
      provider: 'google',
      providerId: 'google-provider-1',
      email: 'legardloic@example.com',
      displayName: 'Loic Legard',
      firstName: 'Loic',
      lastName: 'Legard',
      photoUrl: 'https://example.com/avatar.png',
    },
    { userAgent: 'test-agent', ipAddress: '127.0.0.1' },
  );

  assert.equal(result.user.id, 'user-1');
  assert.equal(result.user.email, 'legardloic@example.com');
  assert.equal(typeof result.tokens.accessToken, 'string');
  assert.equal(typeof result.tokens.refreshToken, 'string');

  const accessPayload = verify(result.tokens.accessToken, 'test-access-token-secret');
  assert.equal(accessPayload.sub, 'user-1');
  assert.equal(accessPayload.email, 'legardloic@example.com');

  const refreshInsert = db.calls.find((entry) => entry.text.includes('INSERT INTO auth_sessions'));
  assert.ok(refreshInsert);
  assert.equal(refreshInsert.values[0].length > 0, true);
  assert.equal(refreshInsert.values[1], 'user-1');
  assert.equal(refreshInsert.values[3], 'test-agent');
  assert.equal(refreshInsert.values[4], '127.0.0.1');
  assert.equal(
    refreshInsert.values[2],
    createHash('sha256').update(result.tokens.refreshToken).digest('hex'),
  );
});

test('auth service sets and clears cookies with production-safe flags', () => {
  const service = new AuthService(
    {
      async query() {
        throw new Error('Unexpected auth query');
      },
    },
    createConfigService({ NODE_ENV: 'production', REFRESH_TOKEN_TTL_DAYS: 12 }),
  );

  const response = createCookieResponse();
  service.setAuthCookies(response, { accessToken: 'access-token', refreshToken: 'refresh-token' });

  assert.equal(response.cookies.length, 2);
  assert.deepEqual(
    response.cookies.map((entry) => entry.name),
    [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE],
  );
  assert.equal(response.cookies[0].options.httpOnly, true);
  assert.equal(response.cookies[0].options.secure, true);
  assert.equal(response.cookies[0].options.sameSite, 'none');
  assert.equal(response.cookies[0].options.path, '/');
  assert.equal(response.cookies[1].options.path, '/auth');
  assert.equal(response.cookies[1].options.maxAge, 12 * 24 * 60 * 60 * 1000);

  service.clearAuthCookies(response);
  assert.deepEqual(
    response.clears.map((entry) => entry.name),
    [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE],
  );
  assert.equal(response.clears[0].options.sameSite, 'none');
  assert.equal(response.clears[1].options.path, '/auth');
});

test('debug combat flag helpers roundtrip scripted encounters', () => {
  const scripted = buildDebugForceCombatEnemyFlag({
    enemyKey: 'curse_heart_avatar',
    isScriptedBossEncounter: true,
  });

  assert.equal(scripted, 'debug_force_combat_enemy:curse_heart_avatar:scripted');
  assert.deepEqual(parseDebugForceCombatEnemyFlag(scripted), {
    enemyKey: 'curse_heart_avatar',
    isScriptedBossEncounter: true,
  });

  const normal = buildDebugForceCombatEnemyFlag({
    enemyKey: 'ash_vanguard_captain',
    isScriptedBossEncounter: false,
  });

  assert.equal(normal, 'debug_force_combat_enemy:ash_vanguard_captain:normal');
  assert.deepEqual(parseDebugForceCombatEnemyFlag(normal), {
    enemyKey: 'ash_vanguard_captain',
    isScriptedBossEncounter: false,
  });

  assert.equal(parseDebugForceCombatEnemyFlag('not-a-debug-flag'), null);
  assert.equal(parseDebugForceCombatEnemyFlag('debug_force_combat_enemy::scripted'), null);
});

test('debug state presets expose unique world flags for QA setup', () => {
  assert.equal(new Set(DEBUG_STATE_PRESET_WORLD_FLAG_KEYS).size, DEBUG_STATE_PRESET_WORLD_FLAG_KEYS.length);
  assert.ok(DEBUG_STATE_PRESET_KEYS.includes('village_open'));
  assert.ok(DEBUG_STATE_PRESET_KEYS.includes('mid_tower'));
  assert.ok(DEBUG_STATE_PRESET_KEYS.includes('act1_done'));
});

test('combat debug reference exposes scripted enemies, floors, skills, and intents', () => {
  const service = createCombatService();
  const reference = service.getDebugScriptedCombatReference();

  assert.equal(Array.isArray(reference.playerSkills), true);
  assert.equal(reference.playerSkills.length, 8);
  assert.deepEqual(
    reference.playerSkills.map((skill) => skill.key),
    ['attack', 'defend', 'fireball', 'rally', 'sunder', 'mend', 'cleanse', 'interrupt'],
  );
  assert.equal(
    reference.playerSkills.find((skill) => skill.key === 'interrupt')?.blockedBySilence,
    true,
  );
  assert.equal(reference.scriptedFloors.length, 4);
  assert.deepEqual(
    reference.scriptedFloors.map((entry) => [entry.floor, entry.enemyKey]),
    [
      [3, 'thorn_beast_alpha'],
      [5, 'cinder_warden'],
      [8, 'ash_vanguard_captain'],
      [10, 'curse_heart_avatar'],
    ],
  );
  assert.equal(
    reference.enemies.find((enemy) => enemy.key === 'curse_heart_avatar')?.scriptedFloor,
    10,
  );
  assert.equal(
    reference.enemies.find((enemy) => enemy.key === 'curse_heart_avatar')?.scriptedBossEncounter,
    true,
  );
  assert.equal(
    reference.scriptedIntents.some(
      (profile) =>
        profile.enemyKey === 'cinder_warden' &&
        profile.intents.some((intent) => intent.key === 'molten_shell' && intent.interruptible === true),
    ),
    true,
  );
  assert.equal(
    reference.scriptedIntents.some(
      (profile) =>
        profile.enemyKey === 'curse_heart_avatar' &&
        profile.intents.some((intent) => intent.key === 'cataclysm_ray' && intent.label === 'Cataclysm Ray'),
    ),
    true,
  );
});

test('combat defeat penalty applies gold/item loss, respawn day advance, and 1 HP recovery', async () => {
  const service = createCombatService();
  const executor = createDefeatPenaltyExecutor();

  service.randomInt = (min) => min;
  const encounter = {
    id: 'encounter-lost-1',
    userId: 'user-1',
    enemyKey: 'forest_goblin',
    towerFloor: 2,
    isScriptedBossEncounter: false,
    turn: 'player',
    status: 'lost',
    round: 4,
    logs: ['You have been defeated.'],
    player: {
      hp: 0,
      maxHp: 32,
      mp: 5,
      maxMp: 15,
      attack: 7,
      defense: 2,
      magicAttack: 10,
      speed: 6,
      defending: false,
    },
    enemy: {
      key: 'forest_goblin',
      name: 'Forest Goblin',
      hp: 24,
      mp: 4,
      attack: 5,
      defense: 1,
      magicAttack: 2,
      speed: 4,
      rewards: { experience: 28, gold: 12, loot: [] },
      currentHp: 12,
      currentMp: 1,
    },
    scriptState: {},
    lastAction: 'attack',
    rewards: null,
    defeatPenalty: null,
    rewardsGranted: false,
    createdAt: '2026-03-30T00:00:00.000Z',
    updatedAt: '2026-03-30T00:00:00.000Z',
    endedAt: '2026-03-30T00:00:00.000Z',
  };

  const penalized = await service.applyDefeatPenaltyIfNeeded(executor, 'user-1', encounter);

  assert.equal(penalized.player.hp, 1);
  assert.ok(penalized.defeatPenalty);
  assert.equal(penalized.defeatPenalty.goldLossPercent, 10);
  assert.equal(penalized.defeatPenalty.goldLost, 20);
  assert.equal(penalized.defeatPenalty.respawnZone, 'Ferme');
  assert.equal(penalized.defeatPenalty.respawnDay, 4);
  assert.equal(penalized.defeatPenalty.itemsLost.length, 1);

  assert.equal(executor.state.progression.gold, 180);
  assert.equal(executor.state.progression.current_hp, 1);
  assert.equal(executor.state.world.zone, 'Ferme');
  assert.equal(executor.state.world.day, 4);
  assert.equal(Array.from(executor.state.inventory.values()).reduce((sum, quantity) => sum + quantity, 0), 2);
});

test('blacksmith shop filters offers by unlock flags', async () => {
  const db = createShopDatabaseStub({
    unlocked: true,
    worldFlags: [BLACKSMITH_SHOP_UNLOCK_FLAG, 'story_floor_5_cleared'],
  });
  const service = new ShopsService(db);

  const shop = await service.getBlacksmithShop('user-1');

  assert.equal(shop.unlocked, true);
  assert.equal(shop.offers.length, 6);
  assert.ok(shop.offers.every((offer) => offer.tier === 1 || offer.tier === 2));
  assert.equal(shop.offers.some((offer) => offer.offerKey === 'mithril_sword_masterwork'), false);
});

test('blacksmith shop stays locked until the unlock flag exists', async () => {
  const db = createShopDatabaseStub({
    unlocked: false,
    worldFlags: [],
  });
  const service = new ShopsService(db);

  const shop = await service.getBlacksmithShop('user-1');

  assert.equal(shop.unlocked, false);
  assert.deepEqual(shop.offers, []);
});

test('village market stays locked until intro farm + floor 3 flags are unlocked', async () => {
  const db = createShopDatabaseStub({
    worldFlags: ['intro_farm_assigned'],
  });
  const service = new ShopsService(db);

  const market = await service.getVillageMarket('user-1');

  assert.equal(market.unlocked, false);
  assert.deepEqual(market.seedOffers, []);
  assert.deepEqual(market.cropBuybackOffers, []);
});

test('village market exposes seed and buyback offers with owned quantities', async () => {
  const db = createShopDatabaseStub({
    worldFlags: ['intro_farm_assigned', 'floor_3_cleared', 'story_floor_5_cleared'],
    inventory: {
      turnip: 5,
      carrot: 2,
      wheat: 1,
    },
  });
  const service = new ShopsService(db);

  const market = await service.getVillageMarket('user-1');

  assert.equal(market.unlocked, true);
  assert.deepEqual(
    market.seedOffers.map((offer) => offer.offerKey),
    ['turnip_seed_packet', 'carrot_seed_packet', 'wheat_seed_packet'],
  );
  assert.deepEqual(
    market.cropBuybackOffers.map((offer) => [offer.itemKey, offer.ownedQuantity]),
    [
      ['turnip', 5],
      ['carrot', 2],
      ['wheat', 1],
    ],
  );
});

test('village market buy and sell operations update gold and inventory', async () => {
  const db = createShopDatabaseStub({
    worldFlags: ['intro_farm_assigned', 'floor_3_cleared'],
    initialGold: 100,
    inventory: {
      turnip: 2,
    },
  });
  const service = new ShopsService(db);

  const purchase = await service.buyVillageSeed('user-1', 'turnip_seed_packet', 2);
  assert.equal(purchase.totalCost, 16);
  assert.equal(purchase.newGold, 84);
  assert.equal(purchase.inventoryItem.itemKey, 'turnip_seed');
  assert.equal(purchase.inventoryItem.totalQuantity, 2);
  assert.equal(db.state.progression.gold, 84);

  const sale = await service.sellVillageCrop('user-1', 'turnip', 1);
  assert.equal(sale.unitGoldValue, 10);
  assert.equal(sale.totalGoldGained, 10);
  assert.equal(sale.newGold, 94);
  assert.equal(sale.remainingQuantity, 1);
  assert.equal(db.state.progression.gold, 94);
  assert.equal(db.state.inventory.get('turnip'), 1);
});

test('village market sale reports village delivery quest progression', async () => {
  const db = createShopDatabaseStub({
    worldFlags: ['intro_farm_assigned', 'floor_3_cleared'],
    initialGold: 50,
    inventory: {
      turnip: 3,
    },
  });
  const quests = createQuestProgressRecorder();
  const service = new ShopsService(db, quests);

  const sale = await service.sellVillageCrop('user-1', 'turnip', 2);

  assert.equal(sale.quantitySold, 2);
  assert.equal(quests.deliveryCalls.length, 1);
  assert.deepEqual(quests.deliveryCalls[0], {
    userId: 'user-1',
    input: {
      cropKey: 'turnip',
      quantity: 2,
    },
  });
});

test('save snapshot parsing normalizes version 1 data and legacy autosaves', () => {
  const service = createSavesService();

  const versionOne = service.parseSaveSnapshot({
    schemaVersion: 1,
    capturedAt: '2026-03-30T10:15:00.000Z',
    world: { zone: '  Ferme  ', day: -3 },
    player: {
      level: 0,
      experience: -9,
      experienceToNextLevel: 0,
      gold: -1,
    },
    tower: {
      currentFloor: 8,
      highestFloor: 3,
      bossFloor10Defeated: true,
    },
    worldFlags: ['  flag_a  ', '', 42, 'flag_b'],
    inventory: [
      { itemKey: ' herb ', quantity: 2 },
      { itemKey: '', quantity: 3 },
      { itemKey: 'iron', quantity: 0 },
      'broken',
    ],
    equipment: [
      { slot: 'main_hand', itemKey: ' sword ' },
      { slot: 'off_hand', itemKey: '  ' },
      { slot: 'invalid', itemKey: 'nope' },
    ],
  });

  assert.equal(versionOne.schemaVersion, 1);
  assert.equal(versionOne.capturedAt, '2026-03-30T10:15:00.000Z');
  assert.deepEqual(versionOne.world, { zone: 'Ferme', day: 1 });
  assert.deepEqual(versionOne.player, {
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    gold: 0,
    currentHp: 32,
    maxHp: 32,
    currentMp: 15,
    maxMp: 15,
  });
  assert.deepEqual(versionOne.tower, {
    currentFloor: 8,
    highestFloor: 8,
    bossFloor10Defeated: true,
  });
  assert.deepEqual(versionOne.worldFlags, ['flag_a', 'flag_b']);
  assert.deepEqual(versionOne.inventory, [{ itemKey: 'herb', quantity: 2 }]);
  assert.deepEqual(versionOne.equipment, [
    { slot: 'main_hand', itemKey: 'sword' },
    { slot: 'off_hand', itemKey: null },
  ]);

  const legacy = service.parseSaveSnapshot({
    kind: 'autosave_milestone',
    createdAt: '2026-03-30T12:30:00.000Z',
    world: { zone: 'Village', day: 2 },
    player: {
      level: 4,
      experience: 45,
      experienceToNext: 90,
      gold: 120,
    },
    tower: {
      currentFloor: 5,
      highestFloor: 4,
      bossFloor10Defeated: false,
    },
    worldFlags: ['story_floor_5_cleared', ''],
    inventory: [],
    equipment: [],
  });

  assert.equal(legacy.capturedAt, '2026-03-30T12:30:00.000Z');
  assert.deepEqual(legacy.player, {
    level: 4,
    experience: 45,
    experienceToNextLevel: 90,
    gold: 120,
    currentHp: 32,
    maxHp: 32,
    currentMp: 15,
    maxMp: 15,
  });
  assert.deepEqual(legacy.tower, {
    currentFloor: 5,
    highestFloor: 5,
    bossFloor10Defeated: false,
  });
  assert.deepEqual(legacy.worldFlags, ['story_floor_5_cleared']);
});

test('save slots reject invalid slot numbers before touching the database', async () => {
  const service = createSavesService();

  await assert.rejects(() => service.getSlot('user-1', 0), /Save slot must be between 1 and 3/);
  await assert.rejects(() => service.loadSlotToLiveState('user-1', 4), /Save slot must be between 1 and 3/);
});

test('profile service upserts and reads hero profile data', async () => {
  const db = createProfileDatabaseStub();
  const service = new ProfileService(db);

  const created = await service.upsertProfile('user-1', '  Loic   Legard ', 'forest');
  assert.deepEqual(created, {
    heroName: 'Loic Legard',
    appearanceKey: 'forest',
    createdAt: '2026-03-31T09:00:00.000Z',
    updatedAt: '2026-03-31T09:00:00.000Z',
  });

  const fetched = await service.getProfile('user-1');
  assert.deepEqual(fetched, created);
});

test('profile service returns null when no profile exists', async () => {
  const service = new ProfileService(createProfileDatabaseStub(null));
  const profile = await service.getProfile('user-1');
  assert.equal(profile, null);
});

test('gameplay intro state progresses through village arrival, mayor, and farm assignment', async () => {
  const db = createGameplayDatabaseStub();
  const service = new GameplayService(db);

  const initial = await service.getIntroState('user-1');
  assert.deepEqual(initial, {
    currentStep: 'arrive_village',
    completed: false,
    steps: {
      arriveVillage: false,
      metMayor: false,
      farmAssigned: false,
    },
  });

  const afterArrival = await service.advanceIntroState('user-1');
  assert.deepEqual(afterArrival, {
    currentStep: 'meet_mayor',
    completed: false,
    steps: {
      arriveVillage: true,
      metMayor: false,
      farmAssigned: false,
    },
  });
  assert.equal(db.state.world.zone, 'Village');

  const afterMayor = await service.advanceIntroState('user-1');
  assert.deepEqual(afterMayor, {
    currentStep: 'farm_assignment',
    completed: false,
    steps: {
      arriveVillage: true,
      metMayor: true,
      farmAssigned: false,
    },
  });

  const afterFarmAssignment = await service.advanceIntroState('user-1');
  assert.deepEqual(afterFarmAssignment, {
    currentStep: 'completed',
    completed: true,
    steps: {
      arriveVillage: true,
      metMayor: true,
      farmAssigned: true,
    },
  });
  assert.equal(db.state.world.zone, 'Ferme');

  const noOpAfterCompletion = await service.advanceIntroState('user-1');
  assert.deepEqual(noOpAfterCompletion, afterFarmAssignment);
});

test('gameplay village NPC states are derived from world flags', async () => {
  const earlyService = new GameplayService(createGameplayDatabaseStub());
  const earlyVillageState = await earlyService.getVillageState('user-1');
  assert.deepEqual(earlyVillageState.npcs, {
    mayor: { stateKey: 'offscreen', available: false },
    blacksmith: { stateKey: 'cursed', available: false },
    merchant: { stateKey: 'absent', available: false },
  });
  assert.equal(earlyVillageState.relationships.mayor.friendship, 0);
  assert.equal(earlyVillageState.relationships.blacksmith.friendship, 0);
  assert.equal(earlyVillageState.relationships.merchant.friendship, 0);
  assert.equal(earlyVillageState.relationships.mayor.canTalkToday, false);

  const advancedFlags = [
    'intro_arrived_village',
    'intro_met_mayor',
    'intro_farm_assigned',
    'blacksmith_curse_lifted',
    'blacksmith_shop_tier_1_unlocked',
    'floor_3_cleared',
    'story_floor_5_cleared',
    'story_floor_8_cleared',
  ];
  const advancedService = new GameplayService(createGameplayDatabaseStub(advancedFlags));
  const advancedVillageState = await advancedService.getVillageState('user-1');
  assert.deepEqual(advancedVillageState.npcs, {
    mayor: { stateKey: 'tower_strategist', available: true },
    blacksmith: { stateKey: 'masterwork_ready', available: true },
    merchant: { stateKey: 'traveling_buyer', available: true },
  });
  assert.equal(advancedVillageState.relationships.mayor.canTalkToday, true);
  assert.equal(advancedVillageState.relationships.blacksmith.canTalkToday, true);
  assert.equal(advancedVillageState.relationships.merchant.canTalkToday, true);
});

test('gameplay loop state reflects stage progression and preparation readiness', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_arrived_village', 'intro_met_mayor', 'intro_farm_assigned', 'floor_3_cleared'],
    [],
    {
      healing_herb: 2,
      mana_tonic: 1,
    },
    {
      mayor: { friendship: 6 },
      blacksmith: { friendship: 3 },
      merchant: { friendship: 0 },
    },
    {
      current_floor: 6,
      highest_floor: 6,
      boss_floor_10_defeated: false,
    },
  );
  const service = new GameplayService(db);

  const loop = await service.getLoopState('user-1');

  assert.equal(loop.stageKey, 'farm_scale');
  assert.equal(loop.farmUnlocked, true);
  assert.equal(loop.villageMarketUnlocked, true);
  assert.deepEqual(loop.supplies, {
    healingHerb: 2,
    manaTonic: 1,
  });
  assert.equal(loop.relationshipAverage, 3);
  assert.equal(loop.preparation.active, false);
  assert.equal(loop.preparation.ready, true);
  assert.deepEqual(loop.preparation.blockers, []);
  assert.equal(loop.preparation.nextStep.includes('/gameplay/combat/prepare'), true);
});

test('gameplay combat preparation consumes farm consumables and activates one-shot combat bonuses', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_arrived_village', 'intro_met_mayor', 'intro_farm_assigned', 'floor_3_cleared'],
    [],
    {
      healing_herb: 1,
      mana_tonic: 1,
    },
    {
      mayor: { friendship: 8 },
    },
  );
  const service = new GameplayService(db);

  const result = await service.prepareCombatLoadout('user-1');

  assert.equal(result.preparation.active, true);
  assert.equal(result.preparation.hpBoostActive, true);
  assert.equal(result.preparation.mpBoostActive, true);
  assert.equal(result.preparation.attackBoostActive, true);
  assert.equal(result.loop.preparation.active, true);
  assert.equal(result.loop.preparation.ready, false);
  assert.equal(result.loop.preparation.nextStep.includes('Preparation active'), true);
  assert.equal(db.state.inventory.has('healing_herb'), false);
  assert.equal(db.state.inventory.has('mana_tonic'), false);
  assert.equal(db.state.worldFlags.has('combat_prep_hp'), true);
  assert.equal(db.state.worldFlags.has('combat_prep_mp'), true);
  assert.equal(db.state.worldFlags.has('combat_prep_attack'), true);
  assert.equal(
    db.calls.some(
      (entry) => entry.text.includes('SELECT zone, day') && entry.text.includes('FROM world_state') && entry.text.includes('FOR UPDATE'),
    ),
    true,
  );

  await assert.rejects(
    () => service.prepareCombatLoadout('user-1'),
    /already active/,
  );
});

test('gameplay village NPC interaction increases friendship once per day', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_arrived_village', 'intro_met_mayor', 'intro_farm_assigned'],
    [],
    {},
    {
      mayor: {
        friendship: 4,
        last_interaction_day: null,
      },
    },
  );
  const service = new GameplayService(db);

  const firstInteraction = await service.interactVillageNpc('user-1', 'mayor');
  assert.equal(firstInteraction.interaction.npcKey, 'mayor');
  assert.equal(firstInteraction.interaction.friendshipBefore, 4);
  assert.equal(firstInteraction.interaction.friendshipAfter, 5);
  assert.equal(firstInteraction.interaction.tierBefore, 'stranger');
  assert.equal(firstInteraction.interaction.tierAfter, 'familiar');
  assert.equal(firstInteraction.village.relationships.mayor.friendship, 5);
  assert.equal(firstInteraction.village.relationships.mayor.canTalkToday, false);
  assert.equal(db.state.relationships.get('mayor')?.friendship, 5);
  assert.equal(db.state.relationships.get('mayor')?.last_interaction_day, 1);

  await assert.rejects(
    () => service.interactVillageNpc('user-1', 'mayor'),
    /already interacted today/,
  );
});

test('gameplay village NPC interaction rejects unavailable NPCs', async () => {
  const db = createGameplayDatabaseStub(['intro_arrived_village', 'intro_met_mayor', 'intro_farm_assigned']);
  const service = new GameplayService(db);

  await assert.rejects(
    () => service.interactVillageNpc('user-1', 'blacksmith'),
    /not available for interaction/,
  );
});

test('gameplay farm state seeds default plot layout and keeps it locked before farm assignment', async () => {
  const db = createGameplayDatabaseStub();
  const service = new GameplayService(db);

  const farm = await service.getFarmState('user-1', 1);

  assert.equal(farm.unlocked, false);
  assert.equal(farm.totalPlots, 12);
  assert.equal(farm.plantedPlots, 0);
  assert.equal(farm.readyPlots, 0);
  assert.equal(farm.wateredPlots, 0);
  assert.equal(farm.plots.length, 12);
  assert.equal(farm.cropCatalog.length, 3);
  assert.equal(farm.cropCatalog.find((entry) => entry.cropKey === 'wheat')?.unlocked, false);
  assert.equal(db.state.farmPlots.size, 12);
});

test('gameplay farm state computes growth timers and ready-to-harvest summary', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned', 'story_floor_5_cleared'],
    [
      {
        plot_key: 'plot_r1_c1',
        row_index: 1,
        col_index: 1,
        crop_key: 'turnip',
        planted_day: 1,
        growth_days: 2,
        watered_today: false,
      },
      {
        plot_key: 'plot_r1_c2',
        row_index: 1,
        col_index: 2,
        crop_key: 'carrot',
        planted_day: 2,
        growth_days: 3,
        watered_today: true,
      },
    ],
  );
  const service = new GameplayService(db);

  const farm = await service.getFarmState('user-1', 3);
  const readyTurnip = farm.plots.find((plot) => plot.plotKey === 'plot_r1_c1');
  const growingCarrot = farm.plots.find((plot) => plot.plotKey === 'plot_r1_c2');

  assert.equal(farm.unlocked, true);
  assert.equal(farm.totalPlots, 12);
  assert.equal(farm.plantedPlots, 2);
  assert.equal(farm.readyPlots, 1);
  assert.equal(farm.wateredPlots, 1);
  assert.equal(readyTurnip?.readyToHarvest, true);
  assert.equal(readyTurnip?.growthProgressDays, 2);
  assert.equal(readyTurnip?.daysToMaturity, 0);
  assert.equal(growingCarrot?.readyToHarvest, false);
  assert.equal(growingCarrot?.growthProgressDays, 1);
  assert.equal(growingCarrot?.daysToMaturity, 2);
  assert.equal(farm.cropCatalog.find((entry) => entry.cropKey === 'wheat')?.unlocked, true);
});

test('gameplay farm plant consumes seed and writes planted crop state', async () => {
  const db = createGameplayDatabaseStub(['intro_farm_assigned'], [], {
    turnip_seed: 2,
  });
  const service = new GameplayService(db);

  const result = await service.plantFarmPlot('user-1', 'plot_r1_c1', 'turnip_seed');
  const plantedPlot = result.farm.plots.find((plot) => plot.plotKey === 'plot_r1_c1');

  assert.equal(result.plant.cropKey, 'turnip');
  assert.equal(result.plant.remainingSeedQuantity, 1);
  assert.equal(db.state.inventory.get('turnip_seed'), 1);
  assert.equal(plantedPlot?.cropKey, 'turnip');
  assert.equal(plantedPlot?.plantedDay, 1);
  assert.equal(plantedPlot?.growthDays, 2);
  assert.equal(plantedPlot?.readyToHarvest, false);
});

test('gameplay farm water marks planted plot as watered for current day', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned'],
    [
      {
        plot_key: 'plot_r1_c1',
        row_index: 1,
        col_index: 1,
        crop_key: 'turnip',
        planted_day: 1,
        growth_days: 2,
        watered_today: false,
      },
    ],
  );
  const service = new GameplayService(db);

  const result = await service.waterFarmPlot('user-1', 'plot_r1_c1');
  const wateredPlot = result.farm.plots.find((plot) => plot.plotKey === 'plot_r1_c1');

  assert.equal(result.water.cropKey, 'turnip');
  assert.equal(result.water.wateredToday, true);
  assert.equal(wateredPlot?.wateredToday, true);
});

test('gameplay farm harvest grants crop item and resets plot', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned'],
    [
      {
        plot_key: 'plot_r1_c1',
        row_index: 1,
        col_index: 1,
        crop_key: 'turnip',
        planted_day: 1,
        growth_days: 2,
        watered_today: true,
      },
    ],
    {},
  );
  db.state.world.day = 3;
  const service = new GameplayService(db);

  const result = await service.harvestFarmPlot('user-1', 'plot_r1_c1');
  const harvestedPlot = result.farm.plots.find((plot) => plot.plotKey === 'plot_r1_c1');

  assert.equal(result.harvest.cropKey, 'turnip');
  assert.equal(result.harvest.harvestItemKey, 'turnip');
  assert.equal(result.harvest.totalHarvestItemQuantity, 1);
  assert.equal(db.state.inventory.get('turnip'), 1);
  assert.equal(harvestedPlot?.cropKey, null);
  assert.equal(harvestedPlot?.plantedDay, null);
  assert.equal(harvestedPlot?.wateredToday, false);
});

test('gameplay farm harvest reports farm quest progression', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned'],
    [
      {
        plot_key: 'plot_r1_c1',
        row_index: 1,
        col_index: 1,
        crop_key: 'turnip',
        planted_day: 1,
        growth_days: 2,
        watered_today: true,
      },
    ],
    {},
  );
  db.state.world.day = 3;
  const quests = createQuestProgressRecorder();
  const service = new GameplayService(db, quests);

  const result = await service.harvestFarmPlot('user-1', 'plot_r1_c1');

  assert.equal(result.harvest.quantityGained, 1);
  assert.equal(quests.harvestCalls.length, 1);
  assert.deepEqual(quests.harvestCalls[0], {
    userId: 'user-1',
    input: {
      cropKey: 'turnip',
      quantity: 1,
    },
  });
});

test('gameplay sleep advances day and resets watered farm plots', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned'],
    [
      {
        plot_key: 'plot_r1_c1',
        row_index: 1,
        col_index: 1,
        crop_key: 'turnip',
        planted_day: 1,
        growth_days: 2,
        watered_today: true,
      },
      {
        plot_key: 'plot_r1_c2',
        row_index: 1,
        col_index: 2,
        crop_key: 'carrot',
        planted_day: 2,
        growth_days: 3,
        watered_today: false,
      },
    ],
  );
  db.state.world.day = 2;

  const service = new GameplayService(db);
  const result = await service.sleep('user-1');

  assert.equal(result.sleep.dayBefore, 2);
  assert.equal(result.sleep.dayAfter, 3);
  assert.equal(result.world.day, 3);
  assert.equal(db.state.world.day, 3);

  const turnipPlot = result.farm.plots.find((plot) => plot.plotKey === 'plot_r1_c1');
  const carrotPlot = result.farm.plots.find((plot) => plot.plotKey === 'plot_r1_c2');

  assert.equal(turnipPlot?.wateredToday, false);
  assert.equal(turnipPlot?.readyToHarvest, true);
  assert.equal(turnipPlot?.growthProgressDays, 2);
  assert.equal(carrotPlot?.wateredToday, false);
  assert.equal(carrotPlot?.growthProgressDays, 1);
});

test('gameplay crafting state exposes unlocked recipes and max craftable counts', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned'],
    [],
    {
      turnip: 5,
      carrot: 3,
      wheat: 1,
    },
  );
  const service = new GameplayService(db);

  const crafting = await service.getFarmCraftingState('user-1');
  const fieldMedicine = crafting.recipes.find((recipe) => recipe.recipeKey === 'field_medicine');
  const focusTonic = crafting.recipes.find((recipe) => recipe.recipeKey === 'focus_tonic');

  assert.equal(crafting.unlocked, true);
  assert.equal(fieldMedicine?.unlocked, true);
  assert.equal(fieldMedicine?.maxCraftable, 2);
  assert.deepEqual(
    fieldMedicine?.ingredients.map((entry) => [entry.itemKey, entry.requiredQuantity, entry.ownedQuantity]),
    [
      ['turnip', 2, 5],
      ['carrot', 1, 3],
    ],
  );
  assert.equal(focusTonic?.unlocked, false);
  assert.equal(focusTonic?.maxCraftable, 0);
});

test('gameplay crafting consumes crops and grants consumable combat items', async () => {
  const db = createGameplayDatabaseStub(
    ['intro_farm_assigned', 'story_floor_5_cleared'],
    [],
    {
      turnip: 4,
      carrot: 6,
      wheat: 3,
      mana_tonic: 1,
    },
  );
  const service = new GameplayService(db);

  const result = await service.craftFarmRecipe('user-1', 'focus_tonic', 2);

  assert.equal(result.craft.recipeKey, 'focus_tonic');
  assert.equal(result.craft.craftedQuantity, 2);
  assert.equal(result.craft.outputItemKey, 'mana_tonic');
  assert.equal(result.craft.outputQuantityPerCraft, 1);
  assert.equal(result.craft.totalOutputQuantity, 2);
  assert.equal(result.craft.totalOutputInventoryQuantity, 3);
  assert.deepEqual(
    result.craft.consumedIngredients.map((entry) => [entry.itemKey, entry.quantityConsumed, entry.remainingQuantity]),
    [
      ['carrot', 4, 2],
      ['wheat', 2, 1],
    ],
  );

  assert.equal(db.state.inventory.get('carrot'), 2);
  assert.equal(db.state.inventory.get('wheat'), 1);
  assert.equal(db.state.inventory.get('mana_tonic'), 3);

  const refreshedRecipe = result.crafting.recipes.find((recipe) => recipe.recipeKey === 'focus_tonic');
  assert.equal(refreshedRecipe?.maxCraftable, 1);
});
