# E2E auth -> combat -> save/load

Ce test e2e valide le flux complet suivant sur une API deployee ou locale:

1. authentification par token JWT sur `GET /auth/me`
2. demarrage de combat avec `POST /combat/start`
3. capture d'un slot de sauvegarde avec `POST /saves/:slot/capture`
4. chargement du slot avec `POST /saves/:slot/load`
5. verification du claim d'une quete, d'un achat au forgeron et d'une restauration autosave
6. verification finale que le combat actif est bien cloture apres le `load`

## Preconditions

- Une base PostgreSQL contenant les fixtures de test.
- Une API demarree et pointee vers cette base.
- Un token JWT signe avec le meme `ACCESS_TOKEN_SECRET` que l'API.
- Un `userId` present dans la base de fixtures.
- Le scenario `03-active-combat-save-state.sql` doit aussi fournir:
  - le flag `blacksmith_shop_tier_1_unlocked`
  - une quete `story_floor_8` en statut `completed`
  - un autosave existant pour la restauration vers un slot manuel.

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
- des donnees de progression suffisantes pour tester `GET /quests`, `POST /quests/story_floor_8/claim`, `GET /shops/blacksmith`, `POST /shops/blacksmith/buy`, et `POST /saves/auto/restore/2`

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
- `GET /quests` expose au moins une quete claimable.
- `POST /quests/story_floor_8/claim` retourne la quete au statut `claimed`.
- `GET /shops/blacksmith` expose le shop ouvert et `POST /shops/blacksmith/buy` consomme l'offre `iron_sword_basic`.
- `POST /saves/auto/restore/2` retourne un slot manuel restaure avec une etiquette contenant `AUTO`.
- `GET /combat/current` retourne `null` apres le chargement du slot.

## Smoke web Playwright

Le workflow nightly exécute aussi un smoke web pour couvrir le front:

- mode `guest`:
  - le bouton `Start combat` reste desactive tant qu'aucune session n'est injectee
  - aucun `POST /combat/start` ne doit partir
- mode `auth`:
  - une fixture de cookie `farm_rpg_at` est injectee sur l'origine API
  - le statut auth doit passer a `Connecte: ...`
  - le bouton `Start combat` doit devenir activable
  - un `POST /combat/start` doit etre emis et un encounter actif doit apparaitre dans le HUD
- si aucun token/cookie web specifique n'est fourni, le workflow CI derive automatiquement une fixture a partir de `E2E_ACCESS_TOKEN_SECRET` + `E2E_USER_ID`

Variables utiles pour le smoke web:

- `E2E_WEB_BASE_URL`
- `E2E_WEB_API_BASE_URL` optionnel, sinon `E2E_API_BASE_URL`
- `E2E_WEB_AUTH_ACCESS_TOKEN` ou `E2E_WEB_AUTH_COOKIE_VALUE` pour forcer le mode auth
- `E2E_WEB_AUTH_COOKIE_NAME` optionnel, valeur par defaut `farm_rpg_at`
- `E2E_WEB_EXPECTED_AUTH_STATUS` optionnel, valeur par defaut adapte au mode

## Notes

- Le test est isole du workflow CI standard.
- Il est volontairement base sur les fixtures SQL pour rester reproductible.
- Si vous utilisez un autre slot de sauvegarde, adaptez `E2E_SAVE_SLOT`.
