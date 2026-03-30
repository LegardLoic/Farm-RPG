BEGIN;

INSERT INTO users (
  id,
  provider,
  provider_id,
  email,
  display_name,
  first_name,
  last_name,
  photo_url,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'google',
  'google-combat-333333333333',
  'combat@farm-rpg.local',
  'Combat Tester',
  'Combat',
  'Tester',
  NULL,
  '2026-03-30T08:20:00Z',
  '2026-03-30T08:20:00Z'
);

INSERT INTO player_progression (
  user_id,
  level,
  experience,
  experience_to_next,
  gold,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  8,
  612,
  780,
  540,
  '2026-03-30T08:20:00Z',
  '2026-03-30T08:20:00Z'
);

INSERT INTO tower_progression (
  user_id,
  current_floor,
  highest_floor,
  boss_floor_10_defeated,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  8,
  8,
  FALSE,
  '2026-03-30T08:20:00Z',
  '2026-03-30T08:20:00Z'
);

INSERT INTO combat_encounters (
  id,
  user_id,
  enemy_key,
  status,
  state_json,
  created_at,
  updated_at,
  ended_at
) VALUES (
  '43333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'ash_vanguard_captain',
  'active',
  '{
    "id":"43333333-3333-3333-3333-333333333333",
    "userId":"33333333-3333-3333-3333-333333333333",
    "enemyKey":"ash_vanguard_captain",
    "towerFloor":8,
    "isScriptedBossEncounter":true,
    "turn":"player",
    "status":"active",
    "round":4,
    "logs":["Boss encounter: floor 8 - Ash Vanguard Captain."],
    "player":{"hp":22,"maxHp":32,"mp":9,"maxMp":15,"attack":7,"defense":2,"magicAttack":10,"speed":6,"defending":false},
    "enemy":{"key":"ash_vanguard_captain","name":"Ash Vanguard Captain","hp":58,"mp":10,"attack":10,"defense":4,"magicAttack":5,"speed":7,"currentHp":34,"currentMp":8},
    "scriptState":{
      "playerRallyTurns":1,
      "playerBurningTurns":1,
      "enemyShatterTurns":1,
      "enemyTelegraphIntent":"iron_recenter",
      "enemyTelegraphNextIntent":"twin_slash"
    },
    "lastAction":"sunder",
    "rewards":null,
    "rewardsGranted":false,
    "createdAt":"2026-03-30T08:20:00Z",
    "updatedAt":"2026-03-30T08:20:00Z",
    "endedAt":null
  }'::jsonb,
  '2026-03-30T08:20:00Z',
  '2026-03-30T08:20:00Z',
  NULL
);

INSERT INTO save_slots (
  user_id,
  slot,
  version,
  label,
  snapshot_json,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  1,
  3,
  'Combat Probe',
  '{
    "schemaVersion":1,
    "capturedAt":"2026-03-30T08:20:00Z",
    "world":{"zone":"Tower","day":12},
    "player":{"level":8,"experience":612,"experienceToNextLevel":780,"gold":540},
    "tower":{"currentFloor":8,"highestFloor":8,"bossFloor10Defeated":false},
    "worldFlags":["blacksmith_curse_lifted","blacksmith_shop_tier_1_unlocked","floor_3_cleared","floor_5_cleared","floor_8_cleared","story_floor_3_cleared","story_floor_5_cleared","story_floor_8_cleared"],
    "inventory":[
      {"itemKey":"healing_herb","quantity":4},
      {"itemKey":"iron_ore","quantity":3},
      {"itemKey":"mana_tonic","quantity":2}
    ],
    "equipment":[
      {"slot":"main_hand","itemKey":"iron_sword"},
      {"slot":"chest","itemKey":"wooden_armor"},
      {"slot":"helmet","itemKey":null}
    ]
  }'::jsonb,
  '2026-03-30T08:20:00Z',
  '2026-03-30T08:20:00Z'
);

INSERT INTO autosaves (
  user_id,
  version,
  reason,
  snapshot_json,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  2,
  'milestone_floor_8',
  '{
    "kind":"autosave_milestone",
    "createdAt":"2026-03-30T08:20:00Z",
    "trigger":{
      "reason":"milestone_floor",
      "encounterId":"43333333-3333-3333-3333-333333333333",
      "enemyKey":"ash_vanguard_captain",
      "reachedMilestoneFlags":["floor_8_cleared","story_floor_8_cleared"]
    },
    "player":{"level":8,"experience":612,"experienceToNextLevel":780,"gold":540},
    "tower":{"currentFloor":8,"highestFloor":8,"bossFloor10Defeated":false},
    "worldFlags":["blacksmith_curse_lifted","blacksmith_shop_tier_1_unlocked","floor_3_cleared","floor_5_cleared","floor_8_cleared","story_floor_3_cleared","story_floor_5_cleared","story_floor_8_cleared"],
    "inventory":[
      {"itemKey":"healing_herb","quantity":4},
      {"itemKey":"iron_ore","quantity":3},
      {"itemKey":"mana_tonic","quantity":2}
    ],
    "equipment":[
      {"slot":"main_hand","itemKey":"iron_sword"},
      {"slot":"chest","itemKey":"wooden_armor"}
    ]
  }'::jsonb,
  '2026-03-30T08:20:00Z',
  '2026-03-30T08:20:00Z'
);

COMMIT;
