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

### Lot 10 - Autosave serveur apres palier majeur / boss
- Nouvelle table backend:
  - `autosaves` (un autosave courant par joueur, versionne)
- Integration combat transactionnelle:
  - sur victoire avec franchissement de palier majeur (`3/5/8/10`), un autosave est ecrit automatiquement
  - sur victoire boss etage 10, autosave ecrit avec raison `boss_victory_floor_10`.
- Snapshot autosave capture:
  - progression joueur (level/xp/gold)
  - etat tour
  - flags monde
  - inventaire
  - equipement
  - contexte de trigger combat (encounter, ennemi, flags palier).
- Nouveau endpoint protege:
  - `GET /saves/auto/latest`

### Lot 11 - Restauration autosave vers slots manuels + UI HUD
- Backend:
  - nouveau endpoint protege `POST /saves/auto/restore/:slot`
  - restauration du dernier autosave dans un slot manuel `1..3`
  - label auto genere pour le slot restaure (`AUTO vX reason`).
- Frontend:
  - panneau HUD Autosave
  - affichage version/raison/date de mise a jour
  - boutons de restauration vers Slot 1/2/3
  - etats loading/error sur l'operation.

### Lot 12 - Save slots manuels: capture / load / delete depuis HUD
- Backend:
  - nouveaux endpoints proteges:
    - `POST /saves/:slot/capture`
    - `POST /saves/:slot/load`
  - capture d'un snapshot live (`schemaVersion: 1`) vers un slot manuel.
  - chargement d'un slot vers l'etat live:
    - progression joueur
    - etat tour
    - flags monde
    - inventaire
    - equipement
    - cloture des combats actifs pour eviter les desynchronisations.
- Frontend:
  - nouveau panneau HUD `Save Slots`.
  - actions par slot:
    - `Capture`
    - `Load`
    - `Delete`
  - feedback UI (loading/error/version/date) sur chaque action.
  - synchro HUD apres `load` (gameplay/combat/quetes/shop/autosave/slots).

### Hotfix Lot 12.1 - Correction erreur 500 sur `POST /saves/:slot/load`
- Durcissement backend du chargement de slot:
  - dedup des `worldFlags`.
  - dedup + upsert de l'inventaire (`item_key`) pour eviter les collisions de cle primaire.
  - dedup + upsert de l'equipement (`slot`) pour eviter les collisions de cle primaire.
- La fermeture des combats actifs pendant un `load` passe en mode resilient:
  - en cas d'erreur SQL sur le nettoyage combat, le chargement de save continue,
  - un warning serveur est loggue au lieu de renvoyer un 500.

### Lot 13 - Apercu de contenu des slots avant chargement
- Frontend HUD `Save Slots` enrichi avec un apercu par slot existant:
  - stats rapides (`Level`, `Gold`, `Floor current/highest`)
  - top inventaire (3 items)
  - resume equipement (nb equips + 3 premiers slots equipes)
- Technique:
  - lecture des details via endpoint existant `GET /saves/:slot` (aucun changement API requis)
  - parsing tolerant des snapshots pour supporter les formats manuels et autosave restaure
  - rendu avec fallback `preview unavailable` si un snapshot est incomplet/invalide.

### Lot 14 - Confirmation UI avant chargement d'un slot
- Frontend HUD `Save Slots`:
  - ajout d'une confirmation inline de type modale avant `Load`
  - message explicite "replace current progression"
  - actions `Confirm Load` et `Cancel`.
- Comportement:
  - tant que la confirmation est ouverte, les actions destructives concurrentes sont bloquees sur les autres slots
  - le chargement n'est execute que si le slot est explicitement confirme
  - reset automatique de la confirmation apres `Capture`, `Delete`, `Restore autosave`, ou si le slot n'existe plus.

### Lot 15 - Skills joueur combat (buff + debuff)
- Backend combat:
  - nouvelles actions joueurs: `rally` et `sunder`
  - `rally`: buff temporaire (attaque + magie) pendant 2 tours
  - `sunder`: debuff defense ennemi pendant 2 tours + degats leger
  - couts MP ajoutes et valides serveur:
    - `rally`: 3 MP
    - `sunder`: 4 MP
  - logs de combat enrichis (application et fin des effets).
- Frontend HUD combat:
  - nouveaux boutons `Rally (+Atk)` et `Sunder (-Def)`
  - activation/desactivation selon MP disponible
  - erreurs UI dediees si MP insuffisant.

### Lot 16 - IA boss reactive aux buffs/debuffs joueur
- Backend combat:
  - patterns reactifs ajoutes sur boss scripts:
    - `cinder_warden`: peut cleanser `Sunder` via `Molten Shell`
    - `ash_vanguard_captain`: peut casser `Sunder` via `Iron Recenter`
    - `curse_heart_avatar`: peut dispel `Rally` via `Null Sigil`
  - logs de combat enrichis pour expliciter les cleanses/dispels.
- Frontend HUD combat:
  - affichage des effets actifs:
    - joueur (`Rally Nt`)
    - ennemi (`Sunder Nt`, `Enraged` si applicable)
  - parsing du `scriptState` combat pour rendre les etats temporaires lisibles.

### Lot 17 - Telegraphes visuels des intentions ennemies
- Backend combat:
  - ajout d'un calcul d'intention ennemie unifie (`enemyTelegraphIntent`) aligne avec la logique IA effective.
  - telegraphe actualise a chaque debut de tour joueur.
  - purge du telegraphe quand le combat se termine (`won/lost/fled`).
- Frontend HUD combat:
  - nouvel indicateur `Intent` sur la carte ennemie.
  - mapping lisible des intentions scriptes:
    - `Root Smash`, `Cinder Burst`, `Molten Shell (Cleanse)`, `Twin Slash`, `Iron Recenter (Cleanse)`, `Null Sigil (Dispel)`, `Cataclysm Ray`, etc.
  - fallback `Unclear` si l'intention n'est pas disponible.

### Lot 18 - Telegraphes combat en mode visuel (badge + animation)
- Frontend HUD combat:
  - l'indicateur `Intent` passe en badge visuel (chip) avec categories:
    - `calm`, `warning`, `danger`, `utility`, `neutral`
  - ajout d'un pulse leger pour les attaques les plus dangereuses (ex: `Root Smash`, `Cataclysm Ray`).
  - labels normalises (`ATK`, `SKILL`, `ULT`, `UTILITY`) pour une lecture plus rapide.
- Technique:
  - rendu UI via attributs `data-intent-tone` et `data-intent-pulse`
  - styles CSS dedies + animation `@keyframes combat-intent-pulse`.

### Lot 19 - Preview multi-tour des intentions ennemies
- Backend combat:
  - extension du telegraphe serveur avec prevision a 2 pas:
    - `enemyTelegraphIntent` (tour ennemi imminent)
    - `enemyTelegraphNextIntent` (tour ennemi suivant)
  - simulation legere des couts/effets d'intention entre les deux pas (MP, cleanse/dispel, timers de status).
  - nettoyage des deux telegraphes a la fin du combat.
- Frontend HUD combat:
  - ajout d'une ligne `Next` sous `Intent` dans la carte ennemi.
  - rendu visuel du `Next` en chip dedie (`NEXT: ...`) avec style distinct (bordure dashed, sans pulse).
  - fallback explicite `NO PREVIEW` quand aucune prevision n'est disponible.

### Lot 20 - Icones d'intention pour lecture rapide
- Frontend HUD combat:
  - ajout d'une vignette d'icone dans chaque chip d'intention:
    - `ATK` (attaque physique)
    - `MAG` (attaque magique)
    - `CLN` (cleanse)
    - `DSP` (dispel)
    - `ULT` (attaque ultime)
  - chips `Intent` et `Next` gardent les tons/couleurs existants, avec une lecture mobile plus rapide.
- Technique:
  - rendu DOM structure (`combat-intent-icon` + `combat-intent-text`) au lieu d'une simple chaine texte.
  - styles CSS dedies par type d'icone (`data-intent-icon`).

### Lot 21 - Mini tooltip d'aide pour tags d'intention
- Frontend HUD combat:
  - ajout d'un bouton `? Tags Intent` sous les cartes de combat.
  - affichage d'un mini tooltip (hover/focus) avec legende:
    - `ATK`: attaque physique
    - `MAG`: attaque magique
    - `CLN`: retire un debuff ennemi
    - `DSP`: retire un buff joueur
    - `ULT`: attaque ultime
- UX:
  - tooltips natifs aussi ajoutes sur les vignettes d'icones dans les chips `Intent`/`Next`
  - support clavier via `focus-within` pour rester utilisable sans souris.

### Lot 22 - Optimisation bundle web (split runtime Phaser)
- Frontend build:
  - demarrage web passe en bootstrap asynchrone (`import('./game/bootstrap')`)
  - extraction de Phaser dans un chunk dedie `phaser-vendor` via `manualChunks`
- Impact build (web):
  - chunk d'entree reduit d'environ ~1.5 MB a ~2.2 KB
  - chunk bootstrap (~62 KB) separe du moteur Phaser
  - moteur Phaser reste lourd mais isole dans son propre chunk cacheable.

### Lot 23 - Route admin debug reset progression (dev only)
- Backend API:
  - nouveau module `debug-admin` avec endpoint protege:
    - `POST /debug/admin/reset-progression`
  - reset transactionnel complet de l'etat joueur:
    - progression (`player_progression`) reinitialisee (level/xp/gold de base)
    - tour (`tower_progression`) reinitialisee et boss floor 10 repasse a `false`
    - suppression des donnees runtime/metier:
      - `inventory_items`
      - `equipment_items`
      - `world_flags`
      - `quest_states`
      - `combat_encounters`
      - `save_slots`
      - `autosaves`
  - reponse API inclut un resume des lignes supprimees par table.
- Securite:
  - module non charge en `production` (import conditionnel dans `AppModule`)
  - garde defensive supplementaire: endpoint renvoie `404` si `NODE_ENV=production`.

### Lot 24 - Loot tables par palier + rarete + drops boss
- Backend combat:
  - ajout de loot tables par plage d'etages:
    - floors `1-2`, `3-4`, `5-7`, `8-10`
  - chaque drop definit une `rarete` (`common`, `uncommon`, `rare`, `epic`, `legendary`)
  - ajout de drops bonus specifiques mini-boss/boss:
    - `thorn_beast_alpha`
    - `cinder_warden`
    - `ash_vanguard_captain`
    - `curse_heart_avatar`
- Distribution des rewards:
  - le loot final combine:
    - loot de base de l'ennemi
    - loot du palier d'etage courant
    - loot bonus boss si encounter scripté
  - les items renvoyes dans `rewards.items` incluent des meta:
    - `rarity`
    - `source` (`enemy` | `floor` | `boss`)
- Logs combat:
  - affichage des drops avec tag de rarete (`[RARE]`, `[EPIC]`, etc.)
  - ligne complementaire `Boss loot` quand un drop bonus boss est obtenu.

### Hotfix Lot 24.1 - Correction erreur 500 sur `POST /combat/start`
- Backend combat:
  - parsing des `combat_encounters.state_json` rendu tolerant aux anciennes versions partielles:
    - fallback safe sur `player`, `enemy`, `status`, `turn`, `round`, `timestamps`
    - fallback enemy definition vers `forest_goblin` si `enemyKey` inconnu/corrompu dans un ancien snapshot
  - auto-nettoyage d'un encounter actif corrompu:
    - si parsing impossible, l'entry active est forcee en `fled` puis un nouveau combat peut etre demarre
- Impact:
  - suppression des 500 de compatibilite retro sur le flux `combat/start`
  - reprise du demarrage de combat en production sans reset manuel.

### Hotfix Lot 24.2 - Fallback de recuperation sur `combat/start`
- Backend combat:
  - ajout d'un fallback de recuperation dans `startCombat`:
    - si le flux normal echoue, l'API purge les encounters actifs restants (`status = fled`)
    - tente ensuite un redemarrage propre avec:
      - floor de tour securise (fallback `1`)
      - ennemi securise (fallback `forest_goblin`)
  - objectif: eviter les 500 persistants meme en presence de donnees legacy/non prevues.

### Hotfix Lot 24.3 - Fix recursion `Maximum call stack size exceeded`
- Cause:
  - recursion infinie entre:
    - `toEncounterStateFromJson` -> `updateEnemyTelegraph` -> `buildEnemyIntentForecast` -> `cloneEncounter` -> `toEncounterStateFromJson`
- Correctif:
  - ajout d'une option interne pour desactiver le refresh telegraph pendant les clones techniques
  - `cloneEncounter` desactive explicitement ce refresh pour eviter la boucle
- Impact:
  - suppression du crash `RangeError: Maximum call stack size exceeded`
  - `POST /combat/start` redevient stable en production.

### Lot 25 - Endpoint debug grant XP/or/items (dev only)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/grant-resources`
  - payload supporte:
    - `experience` (int)
    - `gold` (int)
    - `items[]` (`itemKey`, `quantity`)
  - operation transactionnelle:
    - progression verrouillee `FOR UPDATE`
    - application de l'XP avec calcul de level-up
    - ajout d'or
    - upsert inventaire pour les items accordes
  - reponse retour:
    - demande appliquee
    - progression avant/apres
    - liste des items injectes.
- Securite:
  - endpoint disponible uniquement en mode debug (non expose en production via garde existante).

### Lot 26 - Endpoint debug set tower floor (dev only)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/set-tower-floor`
  - payload:
    - `floor` (1..10)
  - operation transactionnelle:
    - set `tower_progression.current_floor` et `highest_floor` au floor cible
    - set `boss_floor_10_defeated` automatiquement si floor >= 10
    - reconciliation des flags de palier:
      - `floor_3_cleared`
      - `floor_5_cleared`
      - `floor_8_cleared`
      - `boss_floor_10_defeated`
      - `tower_mvp_complete`
  - reponse retour:
    - etat tower `before/after`
    - liste `appliedFlags` pour debug.
- Securite:
  - endpoint disponible uniquement en mode debug (non expose en production via garde existante).

### Lot 27 - Endpoint debug complete quests (dev only)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/complete-quests`
  - payload:
    - optionnel `questKey` (si absent: applique a toutes les quetes)
  - operation transactionnelle:
    - initialise les lignes de quetes si necessaire
    - force les objectifs de progression au seuil requis selon la definition de quete
    - passe le statut a `completed` pour les quetes non `claimed`
    - laisse les quetes deja `claimed` inchangees (retourne dans `skipped`)
  - reponse retour:
    - cible demandee (`questKey` ou toutes)
    - liste des quetes mises a jour et des quetes ignorees.
- Securite:
  - endpoint disponible uniquement en mode debug (non expose en production via garde existante).

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
  - loot multi-sources (ennemi + floor table + boss bonus) avec rarete
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
  - autosave serveur versionne sur paliers majeurs/boss
- Debug (dev only):
  - reset progression joueur via endpoint admin protege
  - injection rapide de XP/or/items pour test local
  - forcer l'etage de tour pour playtests paliers/boss
  - completer rapidement une quete (ou toutes les quetes) pour QA des flux de claim/rewards.

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
  - mini tooltip d'aide des tags d'intention (`ATK/MAG/CLN/DSP/ULT`)
- Chargement web optimise:
  - entree legere
  - bootstrap asynchrone
  - chunk `phaser-vendor` dedie
- Integration API avec gestion d'erreurs UI.

## 6) API actuellement disponible
- `GET /health`
- `POST /debug/admin/reset-progression` (dev only)
- `POST /debug/admin/grant-resources` (dev only)
- `POST /debug/admin/set-tower-floor` (dev only)
- `POST /debug/admin/complete-quests` (dev only)
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
- `GET /saves/auto/latest`
- `POST /saves/auto/restore/:slot`
- `POST /saves/:slot/capture`
- `POST /saves/:slot/load`
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
- Structure modulaire NestJS maintenue (auth/combat/gameplay/inventory/equipment/saves/quests/shops/tower/debug-admin).
- Build web decoupe en chunks (`index`, `bootstrap`, `phaser-vendor`) pour de meilleurs temps de chargement initiaux.
- Rewards combat enrichies avec metadonnees de loot (`rarity`, `source`) pour faciliter l'UI future.
- Flux PR continue (`develop` -> `main`) deja utilise et valide.

## 9) Prochaines priorites recommandees
1. Commencer generation/normalisation sprites definitifs pour persos et ennemis.
2. Etendre le shop (tiers, equipement reel, prerequis de quete).
3. Etendre l'arbre de skills joueur (interrupt/heal/cleanse) pour les combats boss.
4. Exposer un glossaire de rarete en UI (couleurs/legende) pour les nouveaux drops.
5. Ajouter un endpoint debug (dev only) pour forcer un ennemi/script precis au `combat/start` pour QA ciblee.


