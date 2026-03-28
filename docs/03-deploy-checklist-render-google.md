# Deploy Checklist (Render + Google OAuth)

## 1) Google Cloud

1. Create OAuth app branding with audience `External`.
2. Create OAuth client of type `Web application`.
3. Add redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://<your-api-domain>/auth/google/callback`
4. Keep the generated `client_id` and `client_secret` safe.

## 2) API env vars (`apps/api/.env`)

- `NODE_ENV=development`
- `PORT=3000`
- `FRONTEND_URL=http://localhost:5173`
- `GOOGLE_CLIENT_ID=<from_google_cloud>`
- `GOOGLE_CLIENT_SECRET=<from_google_cloud>`
- `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`

## 3) Render services (later when code is pushed)

1. Create `Postgres` service.
2. Create `Web Service` for `apps/api`.
3. Create `Static Site` for `apps/web`.

## 4) GitHub repository secrets (when needed)

- `RENDER_API_KEY` (if deployment is automated by GitHub Actions)
- Any additional deploy token/IDs as required by final deployment workflow
