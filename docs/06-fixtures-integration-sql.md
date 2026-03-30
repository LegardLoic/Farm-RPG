# Fixtures SQL d'integration

Les fixtures sont dans `apps/api/test/fixtures/`.

## Fichiers

- `00-reset.sql`
- `01-baseline-authenticated-user.sql`
- `02-mid-tower-progression.sql`
- `03-active-combat-save-state.sql`

## Utilisation locale

Appliquer un reset puis un scenario:

```bash
psql "$DATABASE_URL" -f apps/api/test/fixtures/00-reset.sql
psql "$DATABASE_URL" -f apps/api/test/fixtures/01-baseline-authenticated-user.sql
```

Exemples de scenarios:

```bash
psql "$DATABASE_URL" -f apps/api/test/fixtures/02-mid-tower-progression.sql
psql "$DATABASE_URL" -f apps/api/test/fixtures/03-active-combat-save-state.sql
```

## Revert

Pour revenir a une base vide de test:

```bash
psql "$DATABASE_URL" -f apps/api/test/fixtures/00-reset.sql
```

## Notes

- Les IDs sont fixes pour faciliter les tests manuels et les assertions CI.
- Les noms de tables correspondent au schema cree par `DatabaseService`.
- Les JSON `snapshot_json` restent volontairement simples mais valides pour les flux de save et autosave.
