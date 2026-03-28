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

## Security note

Never commit OAuth downloaded JSON files (`client_secret_*.json`) or `.env` files.
Use `.env.example` templates and repository secrets for CI.
