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
  '11111111-1111-1111-1111-111111111111',
  'google',
  'google-baseline-111111111111',
  'baseline@farm-rpg.local',
  'Baseline Hero',
  'Baseline',
  'Hero',
  NULL,
  '2026-03-30T08:00:00Z',
  '2026-03-30T08:00:00Z'
);

INSERT INTO auth_sessions (
  id,
  user_id,
  refresh_token_hash,
  user_agent,
  ip_address,
  expires_at,
  created_at,
  revoked_at
) VALUES (
  '21111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'baseline-refresh-token-hash',
  'FixtureAgent/1.0',
  '127.0.0.1',
  '2026-04-30T08:00:00Z',
  '2026-03-30T08:00:00Z',
  NULL
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
  '11111111-1111-1111-1111-111111111111',
  1,
  0,
  100,
  120,
  '2026-03-30T08:00:00Z',
  '2026-03-30T08:00:00Z'
);

INSERT INTO tower_progression (
  user_id,
  current_floor,
  highest_floor,
  boss_floor_10_defeated,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  1,
  1,
  FALSE,
  '2026-03-30T08:00:00Z',
  '2026-03-30T08:00:00Z'
);

COMMIT;
