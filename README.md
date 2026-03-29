# Farm RPG

Monorepo for the project:
- `apps/web`: Phaser 2D client (Vite + TypeScript)
- `apps/api`: NestJS API (Google OAuth + cookie session + protected routes)

## Requirements

- Node.js 22+
- npm 10+

## Quick start

```bash
npm install
npm run dev:web
npm run dev:api
```

Create local env files before starting:
- `apps/api/.env` from `apps/api/.env.example`
- `apps/web/.env` from `apps/web/.env.example`

## Scripts

- `npm run dev:web`: start frontend
- `npm run dev:api`: start backend
- `npm run build`: build all workspaces
- `npm run lint`: lint all workspaces
- `npm run typecheck`: type-check all workspaces

## Branch strategy

- `main`: production-ready branch
- `develop`: integration branch for upcoming work
- feature changes should be merged into `develop` first via pull requests
- merge `develop` into `main` when a release batch is validated

## Current API routes

- `GET /health`
- `POST /debug/admin/reset-progression` (dev only)
- `POST /debug/admin/grant-resources` (dev only)
- `POST /debug/admin/set-tower-floor` (dev only)
- `POST /debug/admin/complete-quests` (dev only)
- `POST /debug/admin/set-combat-start-override` (dev only)
- `POST /debug/admin/clear-combat-start-override` (dev only)
- `POST /debug/admin/apply-loadout-preset` (dev only)
- `POST /debug/admin/set-world-flags` (dev only)
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /inventory`
- `POST /inventory/add`
- `POST /inventory/use`
- `GET /equipment`
- `POST /equipment/equip`
- `POST /equipment/unequip`
- `GET /gameplay/state`
- `GET /tower/state`
- `POST /combat/start`
- `GET /combat/current`
- `GET /combat/:id`
- `POST /combat/:id/action`
- `POST /combat/:id/forfeit`
- `GET /quests`
- `POST /quests/:questKey/claim`
- `GET /shops/blacksmith`
- `POST /shops/blacksmith/buy`
- `GET /saves`
- `GET /saves/auto/latest`
- `POST /saves/auto/restore/:slot`
- `POST /saves/:slot/capture`
- `POST /saves/:slot/load`
- `GET /saves/:slot`
- `PUT /saves/:slot`
- `DELETE /saves/:slot`

## Security note

Never commit OAuth downloaded JSON files (`client_secret_*.json`) or `.env` files.
Use `.env.example` templates and repository secrets for CI.

## Current gameplay slice

- Turn-based combat with server-authoritative rewards.
- Persistent tower progression up to floor 10 for MVP.
- Quest system with claim flow and story milestones tied to tower floors `3/5/8/10`.
- Scripted mini-boss and boss encounters on floors `3/5/8/10`.
- Automatic server-side autosave after major tower milestones and boss victory.
- Restore latest autosave to manual slots from the in-game HUD.
- Manual save-slot capture/load/delete from the in-game HUD.
- Save-slot preview in HUD before load (stats, inventory, equipped items).
- Confirmation step before loading a slot from the HUD.
- Player combat skills: `Rally` (buff) and `Sunder` (debuff).
- Scripted boss AI reactions to player status effects (`Rally` dispel / `Sunder` cleanse patterns).
- Combat HUD enemy telegraph for upcoming scripted boss intent.
- Combat HUD telegraph rendered as a visual intent chip (tone + pulse for dangerous skills).
- Combat HUD includes two-step intent preview (`Intent` + `Next`) for scripted enemies.
- Intent chips include category icons (`ATK`, `MAG`, `CLN`, `DSP`, `ULT`) for faster reading.
- Combat HUD includes a mini tooltip legend to explain intent icon tags (`ATK`, `MAG`, `CLN`, `DSP`, `ULT`).
- Web build split: lightweight entry/bootstrap chunks + dedicated `phaser-vendor` chunk.
- Combat loot now includes floor-based loot tables with rarity tags and boss-specific bonus drops.
- Blacksmith shop unlocked by progression flags.
