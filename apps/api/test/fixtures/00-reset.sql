BEGIN;

TRUNCATE TABLE
  auth_sessions,
  inventory_items,
  equipment_items,
  save_slots,
  autosaves,
  player_progression,
  world_state,
  quest_states,
  world_flags,
  tower_progression,
  combat_encounters,
  users
RESTART IDENTITY CASCADE;

COMMIT;
