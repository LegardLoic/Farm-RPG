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

function createShopDatabaseStub({ unlocked, worldFlags }) {
  const calls = [];
  return {
    calls,
    async query(text) {
      calls.push(text);

      if (text.includes('SELECT 1') && text.includes('flag_key = $2')) {
        return {
          rowCount: unlocked ? 1 : 0,
          rows: unlocked ? [{}] : [],
        };
      }

      if (text.includes('SELECT flag_key') && text.includes('FROM world_flags')) {
        return {
          rows: worldFlags.map((flag_key) => ({ flag_key })),
        };
      }

      if (text.includes('SELECT user_id, level, experience, experience_to_next, gold')) {
        return {
          rows: [
            {
              user_id: 'user-1',
              level: 1,
              experience: 0,
              experience_to_next: 100,
              gold: 120,
            },
          ],
        };
      }

      throw new Error(`Unexpected shop query: ${text}`);
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
