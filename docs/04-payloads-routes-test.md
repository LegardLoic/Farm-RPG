# Payloads de test API (reference rapide)

Derniere mise a jour: 29 mars 2026

Ce document regroupe les payloads utilises pendant nos tests manuels (front + API).

## Contexte

- Base URL prod API: `https://farm-rpg-api.onrender.com`
- Routes protegees: necessitent une session auth valide (cookie access token)
- Routes `debug/admin/*`: disponibles uniquement hors production

## Tableau des payloads

| Route | Methode | Auth | Payload JSON | Usage test |
|---|---|---|---|---|
| `/auth/refresh` | `POST` | cookie refresh | `{}` | Rafraichir la session quand `auth/me` expire |
| `/auth/logout` | `POST` | non (si cookie present) | `{}` | Forcer deconnexion et nettoyage cookies |
| `/combat/start` | `POST` | oui | `{}` | Demarrer un combat normal selon la tour courante |
| `/combat/start` | `POST` | oui | `{ "enemyKey": "forest_goblin" }` | Demarrer avec un ennemi cible (si non ecrase par un boss script) |
| `/combat/:id/action` | `POST` | oui | `{ "action": "attack" }` | Action de tour joueur. Valeurs: `attack`, `defend`, `fireball`, `rally`, `sunder` |
| `/combat/:id/forfeit` | `POST` | oui | `{ "reason": "debug reset" }` | Abandonner le combat actif |
| `/inventory/add` | `POST` | oui | `{ "itemKey": "healing_herb", "quantity": 3 }` | Injecter item en inventaire via route metier |
| `/inventory/use` | `POST` | oui | `{ "itemKey": "healing_herb", "quantity": 1 }` | Consommer un item |
| `/equipment/equip` | `POST` | oui | `{ "slot": "main_hand", "itemKey": "bronze_sword" }` | Equiper un item dans un slot |
| `/equipment/unequip` | `POST` | oui | `{ "slot": "main_hand" }` | Desequiper un slot |
| `/shops/blacksmith/buy` | `POST` | oui | `{ "offerKey": "bronze_sword", "quantity": 1 }` | Acheter une offre du forgeron |
| `/quests/:questKey/claim` | `POST` | oui | `{}` | Reclamer une quete completee |
| `/saves/auto/restore/:slot` | `POST` | oui | `{}` | Restaurer le dernier autosave vers slot `1..3` |
| `/saves/:slot/capture` | `POST` | oui | `{}` | Capturer l'etat live dans slot `1..3` |
| `/saves/:slot/load` | `POST` | oui | `{}` | Charger un slot `1..3` vers l'etat live |
| `/saves/:slot` | `PUT` | oui | `{ "label": "Manual test", "snapshot": { "schemaVersion": 1, "world": { "zone": "Ferme", "day": 1 } } }` | Upsert manuel d'un snapshot de save |
| `/debug/admin/reset-progression` | `POST` | oui (dev only) | `{}` | Remise a zero progression/tour/inventaire/equipement/flags/quetes/saves |
| `/debug/admin/grant-resources` | `POST` | oui (dev only) | `{ "experience": 250, "gold": 500, "items": [ { "itemKey": "mana_tonic", "quantity": 5 }, { "itemKey": "iron_ore", "quantity": 10 } ] }` | Injecter rapidement des ressources de test |
| `/debug/admin/set-tower-floor` | `POST` | oui (dev only) | `{ "floor": 8 }` | Forcer l'etage de tour pour tester les paliers boss/quetes |
| `/debug/admin/complete-quests` | `POST` | oui (dev only) | `{ "questKey": "story_floor_10" }` (ou `{}` pour toutes) | Marquer des quetes en `completed` pour QA rapide |

## Exemples prets a copier (debug)

### 1) Reset complet (dev only)

```json
{}
```

### 2) Grant XP + gold

```json
{
  "experience": 1200,
  "gold": 2000,
  "items": []
}
```

### 3) Grant items uniquement

```json
{
  "experience": 0,
  "gold": 0,
  "items": [
    { "itemKey": "healing_herb", "quantity": 20 },
    { "itemKey": "mana_tonic", "quantity": 10 },
    { "itemKey": "thorn_shard", "quantity": 8 }
  ]
}
```

### 4) Set tower floor (dev only)

```json
{
  "floor": 10
}
```

### 5) Complete quests (dev only)

```json
{
  "questKey": "story_floor_10"
}
```

Pour completer toutes les quetes non `claimed`:

```json
{}
```
