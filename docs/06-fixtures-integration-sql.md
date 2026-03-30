# Fixtures SQL d'integration

Les fixtures sont dans `apps/api/test/fixtures/`.

## Fichiers

- `00-reset.sql`
- `01-baseline-authenticated-user.sql`
- `02-mid-tower-progression.sql`
- `03-active-combat-save-state.sql`
- `run-fixtures.sh`

## Scenarios disponibles

| Scenario | Fichier |
| --- | --- |
| `baseline-authenticated-user` | `01-baseline-authenticated-user.sql` |
| `mid-tower-progression` | `02-mid-tower-progression.sql` |
| `active-combat-save-state` | `03-active-combat-save-state.sql` |
| `all` | applique les 3 scenarios dans cet ordre |

## Utilisation locale

Appliquer un reset puis un scenario:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/farm_rpg"
export FIXTURE_RESET_FIRST=true
export FIXTURE_SCENARIOS=baseline-authenticated-user
bash apps/api/test/fixtures/run-fixtures.sh
```

Appliquer plusieurs scenarios sans reset initial:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/farm_rpg"
export FIXTURE_RESET_FIRST=false
export FIXTURE_SCENARIOS=mid-tower-progression,active-combat-save-state
bash apps/api/test/fixtures/run-fixtures.sh
```

## Revert

Pour revenir a une base vide de test:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/farm_rpg"
export FIXTURE_RESET_FIRST=true
export FIXTURE_SCENARIOS=all
bash apps/api/test/fixtures/run-fixtures.sh
```

## CI

Un workflow manuel dedie existe dans [`.github/workflows/fixtures-integration.yml`](../.github/workflows/fixtures-integration.yml).

### Pre-requis

- definir `DATABASE_URL` comme secret ou variable de repository pour le workflow GitHub Actions
- le workflow installe automatiquement `postgresql-client` sur `ubuntu-latest`

### Lancer depuis GitHub

1. Ouvrir l'onglet Actions.
2. Choisir `Fixtures Integration`.
3. Renseigner:
   - `scenarios`: `all` ou une liste separee par virgules, par exemple `baseline-authenticated-user,active-combat-save-state`
   - `reset_first`: `true` ou `false`

### Lancer avec `gh`

```bash
gh workflow run "Fixtures Integration" -f scenarios=all -f reset_first=true
gh run watch --workflow="Fixtures Integration"
```

## Notes

- Les IDs sont fixes pour faciliter les tests manuels et les assertions CI.
- Les noms de tables correspondent au schema cree par `DatabaseService`.
- Les JSON `snapshot_json` restent volontairement simples mais valides pour les flux de save et autosave.
- Le script `run-fixtures.sh` applique `00-reset.sql` si `FIXTURE_RESET_FIRST=true`, puis les scenarios selectionnes dans l'ordre fourni.

