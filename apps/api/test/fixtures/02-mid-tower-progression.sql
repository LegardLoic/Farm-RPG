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
  '22222222-2222-2222-2222-222222222222',
  'google',
  'google-midtower-222222222222',
  'midtower@farm-rpg.local',
  'Mid Tower Ranger',
  'Mid',
  'Tower',
  NULL,
  '2026-03-30T08:10:00Z',
  '2026-03-30T08:10:00Z'
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
  '22222222-2222-2222-2222-222222222222',
  6,
  310,
  420,
  360,
  '2026-03-30T08:10:00Z',
  '2026-03-30T08:10:00Z'
);

INSERT INTO tower_progression (
  user_id,
  current_floor,
  highest_floor,
  boss_floor_10_defeated,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  8,
  8,
  FALSE,
  '2026-03-30T08:10:00Z',
  '2026-03-30T08:10:00Z'
);

INSERT INTO world_flags (user_id, flag_key, unlocked_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'blacksmith_curse_lifted', '2026-03-30T08:10:10Z'),
  ('22222222-2222-2222-2222-222222222222', 'blacksmith_shop_tier_1_unlocked', '2026-03-30T08:10:10Z'),
  ('22222222-2222-2222-2222-222222222222', 'floor_3_cleared', '2026-03-30T08:11:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'floor_5_cleared', '2026-03-30T08:12:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'floor_8_cleared', '2026-03-30T08:13:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'story_floor_3_cleared', '2026-03-30T08:11:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'story_floor_5_cleared', '2026-03-30T08:12:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'story_floor_8_cleared', '2026-03-30T08:13:00Z');

INSERT INTO quest_states (
  user_id,
  quest_key,
  status,
  progress_json,
  created_at,
  updated_at
) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    'first_steps',
    'claimed',
    '{"victories_total":1}'::jsonb,
    '2026-03-30T08:11:00Z',
    '2026-03-30T08:11:00Z'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'blacksmith_rescue',
    'completed',
    '{"victories_total":5,"enemy_victories":{"forest_goblin":3}}'::jsonb,
    '2026-03-30T08:12:00Z',
    '2026-03-30T08:12:00Z'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'story_floor_3',
    'claimed',
    '{"tower_highest_floor":3}'::jsonb,
    '2026-03-30T08:11:00Z',
    '2026-03-30T08:11:00Z'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'story_floor_5',
    'claimed',
    '{"tower_highest_floor":5}'::jsonb,
    '2026-03-30T08:12:00Z',
    '2026-03-30T08:12:00Z'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'story_floor_8',
    'completed',
    '{"tower_highest_floor":8}'::jsonb,
    '2026-03-30T08:13:00Z',
    '2026-03-30T08:13:00Z'
  );

INSERT INTO inventory_items (user_id, item_key, quantity, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'healing_herb', 6, '2026-03-30T08:10:00Z', '2026-03-30T08:10:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'iron_ore', 4, '2026-03-30T08:10:00Z', '2026-03-30T08:10:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'ember_dust', 2, '2026-03-30T08:10:00Z', '2026-03-30T08:10:00Z');

INSERT INTO equipment_items (user_id, slot, item_key, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'main_hand', 'iron_sword', '2026-03-30T08:10:00Z', '2026-03-30T08:10:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'chest', 'wooden_armor', '2026-03-30T08:10:00Z', '2026-03-30T08:10:00Z');

COMMIT;
