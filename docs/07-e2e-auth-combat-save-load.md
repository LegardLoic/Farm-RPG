# E2E auth -> combat -> save/load

Ce test e2e valide le flux complet suivant sur une API deployee ou locale:

1. authentification par token JWT sur `GET /auth/me`
2. demarrage de combat avec `POST /combat/start`
3. capture d'un slot de sauvegarde avec `POST /saves/:slot/capture`
4. chargement du slot avec `POST /saves/:slot/load`
5. verification finale que le combat actif est bien cloture apres le `load`

## Preconditions

- Une base PostgreSQL contenant les fixtures de test.
- Une API demarree et pointee vers cette base.
- Un token JWT signe avec le meme `ACCESS_TOKEN_SECRET` que l'API.
- Un `userId` present dans la base de fixtures.

## Fixtures recommandees

Pour un parcours stable, appliquer ces fixtures dans cet ordre:

```bash
psql "$DATABASE_URL" -f apps/api/test/fixtures/00-reset.sql
psql "$DATABASE_URL" -f apps/api/test/fixtures/03-active-combat-save-state.sql
```

Le fichier `03-active-combat-save-state.sql` fournit:

- un utilisateur de test authentifie
- un combat actif existant
- un slot de sauvegarde initial
- un autosave de reference

## Variables d'environnement

Le script `npm run test:e2e --workspace @farm-rpg/api` lit:

- `E2E_API_BASE_URL`
- `E2E_ACCESS_TOKEN_SECRET`
- `E2E_USER_ID`
- `E2E_SAVE_SLOT` optionnel, valeur par defaut `3`
- `E2E_ACCESS_TOKEN_TTL` optionnel, valeur par defaut `15m`

Exemple:

```bash
set E2E_API_BASE_URL=https://farm-rpg-api.onrender.com
set E2E_ACCESS_TOKEN_SECRET=your-access-token-secret
set E2E_USER_ID=33333333-3333-3333-3333-333333333333
set E2E_SAVE_SLOT=3
npm run test:e2e --workspace @farm-rpg/api
```

Sur PowerShell:

```powershell
$env:E2E_API_BASE_URL = 'https://farm-rpg-api.onrender.com'
$env:E2E_ACCESS_TOKEN_SECRET = 'your-access-token-secret'
$env:E2E_USER_ID = '33333333-3333-3333-3333-333333333333'
$env:E2E_SAVE_SLOT = '3'
npm run test:e2e --workspace @farm-rpg/api
```

## Comportement attendu

- `GET /auth/me` retourne l'utilisateur correspondant au `sub` du JWT.
- `POST /combat/start` retourne un combat actif.
- `POST /saves/:slot/capture` cree ou met a jour le slot choisi.
- `POST /saves/:slot/load` applique le snapshot et cloture le combat actif.
- `GET /combat/current` retourne `null` apres le chargement du slot.

## Notes

- Le test est isole du workflow CI standard.
- Il est volontairement base sur les fixtures SQL pour rester reproductible.
- Si vous utilisez un autre slot de sauvegarde, adaptez `E2E_SAVE_SLOT`.
