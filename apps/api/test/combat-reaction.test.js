'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { CombatService } = require('../dist/combat/combat.service.js');
const {
  COMBAT_STATUS_BALANCE_TABLE,
  COMBAT_ENEMY_DEFINITIONS,
  CLEANSE_REACTION_WINDOW_TURNS,
  INTERRUPT_REACTION_WINDOW_TURNS,
  DEFAULT_PLAYER_COMBAT_STATE,
  DEFAULT_COMBAT_ENEMY_KEY,
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
    defeatPenalty: overrides.defeatPenalty ?? null,
    recap: overrides.recap ?? null,
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

test('tickStatusDurations consumes debuffs and reaction windows without going negative', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    player: {
      hp: 28,
    },
    scriptState: {
      playerPoisonedTurns: 1,
      playerBlindedTurns: 1,
      playerDarkenedTurns: 1,
      playerCleanseReactionWindowTurns: 1,
      playerInterruptReactionWindowTurns: 2,
      enemyInterruptedTurns: 1,
    },
  });

  service.tickStatusDurations(encounter);

  assert.equal(encounter.player.hp, 26);
  assert.equal(encounter.scriptState.playerPoisonedTurns, 0);
  assert.equal(encounter.scriptState.playerBlindedTurns, 0);
  assert.equal(encounter.scriptState.playerDarkenedTurns, 0);
  assert.equal(encounter.scriptState.playerCleanseReactionWindowTurns, 0);
  assert.equal(encounter.scriptState.playerInterruptReactionWindowTurns, 1);
  assert.equal(encounter.scriptState.enemyInterruptedTurns, 0);
});

test('darkness blocks magic-oriented skills', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    scriptState: {
      playerDarkenedTurns: 2,
    },
  });

  assert.throws(
    () => service.resolvePlayerAction(encounter, 'fireball'),
    /Darkness/i,
  );
});

test('cecite can cause physical attacks to miss', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    enemyKey: 'forest_goblin',
    scriptState: {
      playerBlindedTurns: 1,
    },
  });

  const previousRandom = Math.random;
  Math.random = () => 0;
  try {
    const next = service.resolvePlayerAction(encounter, 'attack');
    assert.equal(next.enemy.currentHp, encounter.enemy.currentHp);
    assert.equal(
      next.logs.some((entry) => entry.includes('Cecite')),
      true,
    );
  } finally {
    Math.random = previousRandom;
  }
});

test('status balance profile shifts on floor milestones 3/5/8/10', () => {
  const service = createCombatService();
  const floor3 = service.resolveStatusBalanceProfile(3);
  const floor5 = service.resolveStatusBalanceProfile(5);
  const floor8 = service.resolveStatusBalanceProfile(8);
  const floor10 = service.resolveStatusBalanceProfile(10);

  assert.equal(floor3.key, 'floor_3_4');
  assert.equal(floor5.key, 'floor_5_7');
  assert.equal(floor8.key, 'floor_8_9');
  assert.equal(floor10.key, 'floor_10_plus');
  assert.equal(floor3.poisonDurationTurns <= floor5.poisonDurationTurns, true);
  assert.equal(floor5.poisonDurationTurns <= floor8.poisonDurationTurns, true);
  assert.equal(floor8.poisonDurationTurns <= floor10.poisonDurationTurns, true);
  assert.equal(floor3.ceciteMissChance <= floor5.ceciteMissChance, true);
  assert.equal(floor5.ceciteMissChance <= floor8.ceciteMissChance, true);
  assert.equal(floor8.ceciteMissChance <= floor10.ceciteMissChance, true);
  assert.equal(Array.isArray(COMBAT_STATUS_BALANCE_TABLE), true);
});

test('cinder burst can fail to apply poison when status chance roll fails', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    enemyKey: 'cinder_warden',
    towerFloor: 5,
    enemy: { currentMp: 12 },
    round: 3,
    scriptState: {
      playerPoisonedTurns: 0,
    },
  });

  const previousRandom = Math.random;
  Math.random = () => 0.99;
  try {
    service.resolveEnemyTurn(encounter);
  } finally {
    Math.random = previousRandom;
  }

  assert.equal(encounter.scriptState.playerPoisonedTurns ?? 0, 0);
  assert.equal(
    encounter.logs.some((entry) => entry.includes('resist Poison')),
    true,
  );
});

test('cecite miss roll scales by floor balance profile', () => {
  const service = createCombatService();
  const lowFloorEncounter = createEncounter({
    towerFloor: 3,
    scriptState: {
      playerBlindedTurns: 1,
    },
  });
  const highFloorEncounter = createEncounter({
    towerFloor: 10,
    scriptState: {
      playerBlindedTurns: 1,
    },
  });

  const previousRandom = Math.random;
  Math.random = () => 0.45;
  try {
    assert.equal(service.rollPlayerBlindMiss(lowFloorEncounter, 'attack'), false);
    assert.equal(service.rollPlayerBlindMiss(highFloorEncounter, 'attack'), true);
  } finally {
    Math.random = previousRandom;
  }
});

test('legacy burning/silenced keys are still interpreted for active encounters', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    player: {
      hp: 20,
    },
    scriptState: {
      playerBurningTurns: 1,
      playerSilencedTurns: 1,
    },
  });

  service.tickStatusDurations(encounter);

  assert.equal(encounter.player.hp, 18);
  assert.equal(encounter.scriptState.playerPoisonedTurns, 0);
  assert.equal(encounter.scriptState.playerDarkenedTurns, 0);
});

test('progression curve caps level at 10 and keeps XP stable at cap', () => {
  const service = createCombatService();
  const nearCap = service.computeProgressionAfterVictory(
    {
      user_id: 'user-test',
      level: 9,
      experience: 600,
      experience_to_next: 620,
      gold: 200,
      current_hp: 20,
      max_hp: 32,
      current_mp: 8,
      max_mp: 15,
    },
    400,
    30,
  );

  assert.equal(nearCap.level, 10);
  assert.equal(nearCap.experience_to_next, 9999);
  assert.ok(nearCap.experience >= 0);
  assert.ok(nearCap.experience < 9999);
  assert.equal(nearCap.gold, 230);

  const atCap = service.computeProgressionAfterVictory(
    {
      ...nearCap,
      level: 10,
      experience: 777,
      experience_to_next: 9999,
    },
    9999,
    11,
  );
  assert.equal(atCap.level, 10);
  assert.equal(atCap.experience, 777);
  assert.equal(atCap.gold, nearCap.gold + 11);
});

test('non-scripted encounters scale with floor tiers while scripted bosses keep baseline profile', () => {
  const service = createCombatService();
  const progression = {
    user_id: 'user-test',
    level: 4,
    experience: 0,
    experience_to_next: 220,
    gold: 100,
    current_hp: 20,
    max_hp: 32,
    current_mp: 10,
    max_mp: 15,
  };
  const enemy = COMBAT_ENEMY_DEFINITIONS[DEFAULT_COMBAT_ENEMY_KEY];
  const lowTier = service.createEncounter('user-test', enemy, 2, progression, false);
  const highTier = service.createEncounter('user-test', enemy, 8, progression, false);

  assert.ok(highTier.enemy.hp > lowTier.enemy.hp);
  assert.ok(highTier.enemy.attack >= lowTier.enemy.attack);
  assert.ok(highTier.enemy.rewards.experience > lowTier.enemy.rewards.experience);
  assert.ok(highTier.logs.some((entry) => entry.includes('Difficulty Tier IV')));

  const boss = COMBAT_ENEMY_DEFINITIONS.thorn_beast_alpha;
  const scriptedBoss = service.createEncounter('user-test', boss, 3, progression, true);
  assert.equal(scriptedBoss.enemy.hp, boss.hp);
  assert.equal(scriptedBoss.enemy.rewards.experience, boss.rewards.experience);
});

test('finalizeCombatRecapIfEnded builds and logs a detailed recap once', () => {
  const service = createCombatService();
  const encounter = createEncounter({
    status: 'won',
    round: 4,
    logs: ['Combat ended.'],
    scriptState: {
      telemetryRecapDamageDealt: 58,
      telemetryRecapDamageTaken: 21,
      telemetryRecapHealingDone: 11,
      telemetryRecapMpSpent: 14,
      telemetryRecapMpRecovered: 1,
      telemetryRecapPoisonApplied: 2,
      telemetryRecapCeciteApplied: 1,
      telemetryRecapObscuriteApplied: 1,
      telemetryRecapDebuffsCleansed: 3,
      telemetryRecapBlindMisses: 1,
    },
    rewards: {
      experience: 87,
      gold: 33,
      items: [
        { itemKey: 'ember_dust', quantity: 2, rarity: 'uncommon', source: 'enemy' },
        { itemKey: 'mana_tonic', quantity: 1, rarity: 'rare', source: 'floor' },
      ],
      levelBefore: 4,
      levelAfter: 5,
    },
  });

  service.finalizeCombatRecapIfEnded(encounter);

  assert.ok(encounter.recap);
  assert.equal(encounter.recap.outcome, 'won');
  assert.equal(encounter.recap.damageDealt, 58);
  assert.equal(encounter.recap.damageTaken, 21);
  assert.equal(encounter.recap.healingDone, 11);
  assert.equal(encounter.recap.mpSpent, 14);
  assert.equal(encounter.recap.mpRecovered, 1);
  assert.equal(encounter.recap.poisonApplied, 2);
  assert.equal(encounter.recap.ceciteApplied, 1);
  assert.equal(encounter.recap.obscuriteApplied, 1);
  assert.equal(encounter.recap.debuffsCleansed, 3);
  assert.equal(encounter.recap.blindMisses, 1);
  assert.equal(encounter.recap.rewards.lootItems, 3);
  assert.equal(
    encounter.logs.some((entry) => entry.startsWith('Recap:')),
    true,
  );

  const logCount = encounter.logs.length;
  service.finalizeCombatRecapIfEnded(encounter);
  assert.equal(encounter.logs.length, logCount);
});
