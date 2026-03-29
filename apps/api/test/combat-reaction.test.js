'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { CombatService } = require('../dist/combat/combat.service.js');
const {
  COMBAT_ENEMY_DEFINITIONS,
  CLEANSE_REACTION_WINDOW_TURNS,
  INTERRUPT_REACTION_WINDOW_TURNS,
  DEFAULT_PLAYER_COMBAT_STATE,
} = require('../dist/combat/combat.constants.js');

function createCombatService() {
  return new CombatService({}, {}, {}, {});
}

function createEncounter(overrides = {}) {
  const enemyKey = overrides.enemyKey ?? 'cinder_warden';
  const enemyTemplate = COMBAT_ENEMY_DEFINITIONS[enemyKey];
  if (!enemyTemplate) {
    throw new Error(`Unknown enemy template: ${enemyKey}`);
  }

  const now = new Date().toISOString();
  const scriptState = {
    ...(overrides.scriptState ?? {}),
  };

  return {
    id: overrides.id ?? 'encounter-test',
    userId: overrides.userId ?? 'user-test',
    enemyKey,
    towerFloor: overrides.towerFloor ?? 5,
    isScriptedBossEncounter: overrides.isScriptedBossEncounter ?? true,
    turn: overrides.turn ?? 'player',
    status: overrides.status ?? 'active',
    round: overrides.round ?? 2,
    logs: overrides.logs ?? [],
    player: {
      ...DEFAULT_PLAYER_COMBAT_STATE,
      ...(overrides.player ?? {}),
    },
    enemy: {
      ...enemyTemplate,
      ...(overrides.enemy ?? {}),
      currentHp: overrides.enemy?.currentHp ?? enemyTemplate.hp,
      currentMp: overrides.enemy?.currentMp ?? enemyTemplate.mp,
    },
    scriptState,
    lastAction: overrides.lastAction ?? null,
    rewards: overrides.rewards ?? null,
    rewardsGranted: overrides.rewardsGranted ?? false,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    endedAt: overrides.endedAt ?? null,
  };
}

test('cinder warden prioritizes burst after a recent cleanse reaction', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    enemyKey: 'cinder_warden',
    enemy: { currentMp: 6 },
    scriptState: {
      playerCleanseReactionWindowTurns: CLEANSE_REACTION_WINDOW_TURNS,
    },
  });

  assert.equal(service.resolveEnemyIntent(encounter), 'cinder_burst');
});

test('ash vanguard captain retaliates after interrupt with twin slash', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    enemyKey: 'ash_vanguard_captain',
    enemy: { currentMp: 8 },
    scriptState: {
      playerInterruptReactionWindowTurns: INTERRUPT_REACTION_WINDOW_TURNS,
    },
  });

  assert.equal(service.resolveEnemyIntent(encounter), 'twin_slash');
});

test('curse heart avatar can dispel after a recent cleanse reaction', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    enemyKey: 'curse_heart_avatar',
    enemy: { currentMp: 10 },
    scriptState: {
      playerCleanseReactionWindowTurns: CLEANSE_REACTION_WINDOW_TURNS,
    },
  });

  assert.equal(service.resolveEnemyIntent(encounter), 'null_sigil');
});

test('tickStatusDurations consumes short reaction windows without going negative', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    scriptState: {
      playerCleanseReactionWindowTurns: 1,
      playerInterruptReactionWindowTurns: 2,
      enemyInterruptedTurns: 1,
    },
  });

  service.tickStatusDurations(encounter);

  assert.equal(encounter.scriptState.playerCleanseReactionWindowTurns, 0);
  assert.equal(encounter.scriptState.playerInterruptReactionWindowTurns, 1);
  assert.equal(encounter.scriptState.enemyInterruptedTurns, 0);
});
