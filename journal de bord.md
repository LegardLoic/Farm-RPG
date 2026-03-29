# Journal de bord - Farm RPG

Derniere mise a jour: 29 mars 2026

## 1) Objectif du journal
Ce document garde une trace claire de ce qui a ete construit, valide et deploie jusqu'a present sur le prototype.

## 2) Etat global du projet
- Repo GitHub structure avec branche `main` (prod) et `develop` (integration).
- Monorepo operationnel:
  - `apps/api` (NestJS + PostgreSQL)
  - `apps/web` (Phaser 3 + Vite + TypeScript)
- Deploiement Render en ligne:
  - API: `https://farm-rpg-api.onrender.com`
  - Web: `https://farm-rpg.onrender.com`
- Auth Google OAuth fonctionnelle en production.
- CI GitHub Actions active (build/typecheck), avec corrections des problemes npm/rollup deja appliquees.

## 3) Chronologie des lots livres

### Lot 0 - Scaffold + base technique
- Initialisation du monorepo.
- Setup API NestJS et client Phaser.
- Setup env templates et documentation de deploiement.

### Lot 1 - Auth + sessions persistantes
- Login Google OAuth.
- Sessions via cookies/tokens avec routes protegees.
- Route `GET /auth/me` fonctionnelle.

### Lot 2 - Inventaire, equipement, saves
- Persistence SQL pour inventaire/equipement/save slots.
- Endpoints API CRUD metier.
- Schema DB mis a jour et versionne dans le code.

### Lot 3 - Combat tour par tour (persistant)
- Module combat cote API.
- HUD combat cote web.
- Gestion des actions `attack`, `defend`, `fireball`, `forfeit`.
- Etat de combat persiste en base.

### Lot 4 - Progression et recompenses combat
- Table `player_progression` (level/xp/gold).
- Recompenses de victoire combat:
  - XP
  - or
  - loot inventaire
- Synchronisation HUD avec progression (niveau/xp/or).

### Lot 5 - Quetes et flags de village
- Tables:
  - `quest_states`
  - `world_flags`
- Nouveau module `quests` avec endpoints:
  - `GET /quests`
  - `POST /quests/:questKey/claim`
- Progression des quetes branchee sur les victoires combat.
- Claim de quete applique des rewards serveur:
  - XP
  - or
  - items
  - flags de deblocage
- `GET /gameplay/state` enrichi avec etat village (forgeron).
- HUD web enrichi:
  - bloc quetes (progression + claim)
  - statut forgeron (cursed/recovering/unlocked)

### Lot 6 - Shop forgeron (API + UI)
- Nouveau module backend `shops`.
- Endpoints proteges:
  - `GET /shops/blacksmith`
  - `POST /shops/blacksmith/buy`
- Verrouillage par flag `blacksmith_shop_tier_1_unlocked`.
- Achat transactionnel serveur:
  - deduction d'or
  - ajout inventaire
  - validation des erreurs metier (shop lock, or insuffisant, offre inconnue).
- HUD web enrichi:
  - panneau boutique forgeron
  - liste d'offres
  - bouton d'achat
  - etats lock/loading/error.

### Lot 7 - Progression de tour (etages MVP)
- Nouveau module backend `tower`.
- Endpoint protege:
  - `GET /tower/state`
- Nouvelle table:
  - `tower_progression` (current_floor, highest_floor, boss_floor_10_defeated)
- Integration combat -> tour:
  - chaque victoire combat avance la progression d'etage (cap MVP a 10)
  - insertion de flags milestone (`floor_3_cleared`, `floor_5_cleared`, `floor_8_cleared`, `boss_floor_10_defeated`, `tower_mvp_complete`)
- `GET /gameplay/state` enrichi avec l'etat de la tour.
- HUD web enrichi:
  - affichage etage courant / meilleur etage
  - statut boss etage 10.

### Lot 8 - Quetes histoire liees aux paliers de tour
- Enrichissement du systeme de quetes avec une nouvelle metrique:
  - `tower_highest_floor`
- Nouvelles quetes histoire ajoutees:
  - `story_floor_3`
  - `story_floor_5`
  - `story_floor_8`
  - `story_floor_10`
- Integration transactionnelle combat:
  - victoire combat -> progression de tour -> progression des quetes
  - les quetes peuvent maintenant se completer sur les paliers 3/5/8/10.

### Lot 9 - Mini-boss et boss scriptes (paliers 3/5/8/10)
- Ennemis scriptes ajoutes pour les paliers:
  - etage 3: `thorn_beast_alpha`
  - etage 5: `cinder_warden`
  - etage 8: `ash_vanguard_captain`
  - etage 10: `curse_heart_avatar`
- Flux de demarrage combat ajuste:
  - le backend choisit automatiquement l'ennemi en fonction de l'etage courant de tour
  - les etages scriptes priorisent leur boss, meme si un autre `enemyKey` est propose.
- IA combat et patterns scripts:
  - attaques speciales/cycles pour chaque boss
  - phase d'enrage pour le boss etage 10.
- Integration TowerService en transaction:
  - lecture de l'etat de tour dans le `startCombat` pour garantir la coherence du choix d'ennemi.

## 4) Backend en place (resume)
- Auth:
  - Google OAuth
  - sessions protegees
- Gameplay:
  - etat monde + progression joueur
  - etat village par flags
- Combat:
  - simulation tour par tour serveur
  - persistence encounter
  - attribution rewards serveur autoritaire
  - bosses scriptes sur paliers 3/5/8/10
- Quetes:
  - definitions cote serveur
  - progression automatique sur victoires
  - objectifs basees sur victoires et paliers de tour
  - claim explicite des recompenses
- Shops:
  - boutique forgeron protegee
  - achat serveur autoritaire
  - deduction or + ajout item en transaction
- Tour:
  - progression des etages persistee
  - endpoint de lecture d'etat
  - progression automatique sur victoire combat
- Inventaire / equipement / saves:
  - endpoints proteges
  - persistence PostgreSQL

## 5) Frontend en place (resume)
- Scene Phaser jouable avec deplacement.
- HUD complet:
  - auth status
  - stats joueur
  - combat panel
  - progression (niveau/xp/or)
  - quetes + claim
  - quetes histoire par paliers d'etage
  - statut village (forgeron)
  - boutique forgeron (offres + achat)
  - progression tour (etage et boss 10)
- Integration API avec gestion d'erreurs UI.

## 6) API actuellement disponible
- `GET /health`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /gameplay/state`
- `GET /tower/state`
- `GET /inventory`
- `POST /inventory/add`
- `POST /inventory/use`
- `GET /equipment`
- `POST /equipment/equip`
- `POST /equipment/unequip`
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
- `GET /saves/:slot`
- `PUT /saves/:slot`
- `DELETE /saves/:slot`

## 7) Ce qui est valide en production
- API deployee et route `/health` OK.
- Front deployee et charge correctement.
- Login Google teste et valide.
- Combat teste sans probleme apparent.

## 8) Points techniques importants
- Source de verite gameplay cote serveur (anti-triche de base respectee).
- Mutations sensibles en transactions SQL.
- Structure modulaire NestJS maintenue (auth/combat/gameplay/inventory/equipment/saves/quests/shops/tower).
- Flux PR continue (`develop` -> `main`) deja utilise et valide.

## 9) Prochaines priorites recommandees
1. Ajouter autosave apres victoire boss/palier majeur.
2. Commencer generation/normalisation sprites definitifs pour persos et ennemis.
3. Etendre le shop (tiers, equipement reel, prerequis de quete).
4. Ajouter une route d'admin debug pour reset progression (dev only).
5. Ajouter des skills ennemis cote joueur (interrupt/buff/debuff) pour enrichir les combats boss.

