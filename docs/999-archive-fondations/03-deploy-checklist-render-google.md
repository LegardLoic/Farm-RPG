> **Statut : archive technique de déploiement**
> Ce document a servi pendant la phase initiale de mise en place et de validation du déploiement.
> Il est conservé comme référence historique et opérationnelle.
> Il peut contenir des informations encore valides, mais doit être relu à la lumière de l’état actuel du projet et de l’infrastructure en place.

# Deploy Checklist (Render + Google OAuth)

## 1) Google Cloud

1. Create OAuth app branding with audience `External`.
2. Create OAuth client of type `Web application`.
3. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://<your-front-domain>`
4. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback`
   - `https://<your-api-domain>/auth/google/callback`
5. Keep the generated `client_id` and `client_secret` safe.

## 2) API env vars (`apps/api/.env`)

- `NODE_ENV=development`
- `PORT=3000`
- `FRONTEND_URL=http://localhost:5173`
- `GOOGLE_CLIENT_ID=<from_google_cloud>`
- `GOOGLE_CLIENT_SECRET=<from_google_cloud>`
- `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`

## 3) Render services (after push)

1. Create `Postgres` service.
2. Create `Web Service` for API with:
   - Build command: `npm install --include=dev && npm run build --workspace @farm-rpg/api`
   - Start command: `npm run start:prod --workspace @farm-rpg/api`
3. Create `Static Site` for web with:
   - Build command: `npm install && npm run build --workspace @farm-rpg/web`
   - Publish directory: `apps/web/dist`

## 4) Render env vars for API

- `NODE_ENV=production`
- `PORT=3001` (or rely on Render `PORT`)
- `CORS_ORIGIN=https://<your-front-domain>`
- `FRONTEND_URL=https://<your-front-domain>`
- `GOOGLE_CLIENT_ID=<from_google_cloud>`
- `GOOGLE_CLIENT_SECRET=<from_google_cloud>`
- `GOOGLE_CALLBACK_URL=https://<your-api-domain>/auth/google/callback`
- `ACCESS_TOKEN_SECRET=<long_random_secret_at_least_32_chars>`
- `ACCESS_TOKEN_TTL=15m`
- `REFRESH_TOKEN_TTL_DAYS=30`

- `DATABASE_URL=<from_render_postgres>`

## 5) GitHub repository secrets (when needed)

- `RENDER_API_KEY` (if deployment is automated by GitHub Actions)
- Any additional deploy token/IDs as required by final deployment workflow
