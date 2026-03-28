# Farm RPG

Monorepo for the project:
- `apps/web`: Phaser 2D client (Vite + TypeScript)
- `apps/api`: NestJS API (Google OAuth skeleton + health endpoint)

## Requirements

- Node.js 22+
- npm 10+

## Quick start

```bash
npm install
npm run dev:web
npm run dev:api
```

## Scripts

- `npm run dev:web`: start frontend
- `npm run dev:api`: start backend
- `npm run build`: build all workspaces
- `npm run lint`: lint all workspaces
- `npm run typecheck`: type-check all workspaces

## Security note

Never commit OAuth downloaded JSON files (`client_secret_*.json`) or `.env` files.
Use `.env.example` templates and repository secrets for CI.
