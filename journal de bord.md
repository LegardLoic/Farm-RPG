# Journal de bord - Farm RPG

Derniere mise a jour: 30 mars 2026

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

### Lot 28 - Override debug du prochain `combat/start` (dev only)
- Backend debug-admin:
  - nouveaux endpoints proteges:
    - `POST /debug/admin/set-combat-start-override`
    - `POST /debug/admin/clear-combat-start-override`
  - payload de configuration:
    - `enemyKey`
    - `isScriptedBossEncounter` (optionnel)
  - stockage de l'override dans `world_flags` (sans migration DB) avec cle dediee.
- Backend combat:
  - `POST /combat/start` consomme automatiquement l'override (one-shot) puis le supprime.
  - support aussi branche fallback de recuperation pour eviter de perdre l'override en cas d'etat legacy corrompu.
  - log combat explicite ajoute quand un override debug est applique.
- Securite:
  - configuration reservee aux routes debug (non exposees en production).

### Lot 29 - Presets debug de loadout complet (dev only)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/apply-loadout-preset`
  - payload:
    - `presetKey` (`starter`, `tower_mid`, `boss_trial`)
  - operation transactionnelle:
    - applique un preset d'equipement complet par slot
    - ajoute un bundle d'inventaire de support (potions/materiaux)
    - ajoute un bonus de ressources (XP/or) pour accelerer les playtests
    - renvoie progression `before/after` + recap equipement/inventaire applique.
- Securite:
  - endpoint disponible uniquement en mode debug (non expose en production via garde existante).

### Lot 30 - Endpoint debug world flags cibles (dev only)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/set-world-flags`
  - payload:
    - `flags[]` (a ajouter)
    - `removeFlags[]` (a retirer)
    - `replace` (remplacement complet optionnel)
  - operation transactionnelle:
    - lock + lecture des flags existants (`before`)
    - application `add/remove` ou `replace`
    - retour `after`, `added`, `removed` pour verification QA rapide.
- Securite:
  - endpoint disponible uniquement en mode debug (non expose en production via garde existante).

### Lot 31 - Glossaire visuel des raretes de loot (frontend)
- Frontend HUD combat:
  - ajout d'un bloc `Raretés loot` dans la zone combat
  - badges visuels pour:
    - `Common`
    - `Uncommon`
    - `Rare`
    - `Epic`
    - `Legendary`
- UX:
  - code couleur lisible et coherent avec les tags de rarete du backend
  - styles responsive pour conserver la lisibilite sur mobile.

### Lot 32 - Endpoint debug set quest status (dev only)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/set-quest-status`
  - payload:
    - `questKey`
    - `status` (`active` | `completed` | `claimed`)
  - operation transactionnelle:
    - initialise les lignes de quete si necessaire
    - force l'etat cible de la quete demandee
    - si `completed` ou `claimed`, force aussi la progression au seuil de completion de la quete
    - renvoie l'etat `before/after` utile pour QA.
- Securite:
  - endpoint disponible uniquement en mode debug (non expose en production via garde existante).

### Lot 33 - Panneau HUD `Debug QA` (frontend)
- Frontend HUD:
  - ajout d'un panneau `Debug QA` (visible en `DEV`/`staging`) pour lancer rapidement des actions debug sans outil externe
  - actions supportees:
    - `Grant resources` (XP + gold)
    - `Set tower floor`
    - `Apply loadout preset`
    - `Complete quests`
- UX:
  - feedback `loading/success/error` en ligne
  - rendu compact et responsive pour desktop/mobile.

### Lot 34 - Extension shop blacksmith par tiers et prerequis
- Backend shop:
  - enrichissement des offres avec metadonnees:
    - `tier`
    - `requiredFlags`
  - ajout d'offres tier 2 (ex: `steel_sword_advanced`, `tower_guard_shield`, `greater_mana_tonic`)
  - prerequis tier 2 relies au flag `story_floor_5_cleared`.
- Validation metier:
  - `GET /shops/blacksmith` ne renvoie que les offres effectivement debloquees pour le joueur.
  - `POST /shops/blacksmith/buy` revalide les prerequis de l'offre en transaction avant achat.

### Lot 35 - Debug QA HUD: gestion directe des world flags
- Frontend HUD `Debug QA`:
  - ajout de champs `World flags (add)` et `World flags (remove)` avec parsing multi-valeurs (`,` `;` ou nouvelle ligne)
  - ajout du mode `Replace all flags` (checkbox)
  - ajout bouton `Set world flags` branche sur `POST /debug/admin/set-world-flags`.
- UX:
  - etat loading/success/error coherent avec les autres actions debug
  - champs desactives pendant l'execution pour eviter les doubles requetes.

### Lot 36 - Nouveau skill combat joueur `Mend` (soin)
- Backend combat:
  - nouvelle action joueur `mend` disponible sur `POST /combat/:id/action`
  - cout MP ajoute et valide serveur (`MEND_MANA_COST = 4`)
  - soin base sur la magie du joueur (avec prise en compte du buff `Rally`) et plafonne a `maxHp`
  - validation metier:
    - refuse l'action si MP insuffisant
    - refuse l'action si PV deja pleins
  - logs combat enrichis (`You cast Mend and recover X HP.`).
- Frontend HUD combat:
  - nouveau bouton `Mend (+HP)`
  - desactivation automatique si:
    - ce n'est pas le tour joueur
    - MP insuffisants
    - PV deja pleins
  - message d'erreur UI dedie en cas d'usage invalide (`MP insuffisant` ou `PV max`).

### Lot 37 - Skills combat `Cleanse` + `Interrupt` et debuffs ennemis
- Backend combat:
  - nouvelles actions joueur:
    - `cleanse` (retire `Burning` et `Silence`)
    - `interrupt` (interrompt certaines intentions ennemies telegraphiees)
  - nouveaux couts MP:
    - `CLEANSE_MANA_COST = 3`
    - `INTERRUPT_MANA_COST = 5`
  - nouvelles mecaniques de debuff:
    - `Cinder Burst` applique `Burning` (degats periodiques)
    - `Null Sigil` applique `Silence` (bloque certains skills)
  - validations metier serveur:
    - `cleanse` refusee si aucun debuff a retirer
    - `interrupt` refusee si aucune intention interruptible n'est prete
    - skills magiques bloques pendant `Silence` (sauf `cleanse`).
- Frontend HUD combat:
  - boutons `Cleanse` et `Interrupt`
  - activation conditionnelle selon MP, debuffs, silence et intention ennemie telegraphiee
  - affichage enrichi des effets joueur (`Rally`, `Burning`, `Silenced`)
  - messages d'erreur UI dedies en cas d'action invalide.

### Lot 38 - Shop blacksmith tier 3
- Backend shop:
  - extension des offres forgeron avec un nouveau palier `tier: 3`
  - ajout de 3 offres tier 3:
    - `mithril_sword_masterwork`
    - `dragon_scale_armor`
    - `elixir_of_vigor`
  - prerequis tier 3 relies au flag `story_floor_8_cleared`.
- Validation metier:
  - le filtrage existant par `requiredFlags` continue de masquer les offres non debloquees
  - la validation transactionnelle a l'achat reste appliquee cote serveur.

### Lot 39 - Presets QA pre-remplis (backend + HUD)
- Backend debug-admin:
  - nouvel endpoint protege:
    - `POST /debug/admin/apply-state-preset`
  - payload:
    - `presetKey` (`village_open`, `mid_tower`, `act1_done`)
  - application transactionnelle du preset:
    - floor de tour cible
    - set de world flags associe au scenario
  - reponse enrichie:
    - recap preset applique
    - `tower` before/after
    - `worldFlags` before/after + `added/removed`.
- Frontend HUD `Debug QA`:
  - ajout select `State preset` + bouton `Apply state preset`
  - branchement sur `POST /debug/admin/apply-state-preset`
  - etats `loading/success/error` alignes avec les autres actions debug.

### Hotfix Lot 39.1 - Duree `Silence` ajustee
- Backend combat:
  - `PLAYER_SILENCED_DURATION_TURNS` passe de `1` a `2` pour que l'effet bloque bien le prochain tour joueur
  - correction de comportement sans impact schema.

### Lot 40 - Recap visuel apres `apply-state-preset`
- Frontend HUD `Debug QA`:
  - message de succes enrichi apres `Apply state preset`
  - recap affiche:
    - floor tour `before -> after`
    - nombre de flags ajoutes/supprimes
    - apercu des flags modifies.
- UX:
  - feedback plus actionnable pour verifier rapidement qu'un preset a bien ete applique
  - pas besoin d'ouvrir des endpoints manuellement pour valider l'effet du preset.

### Lot 41 - Debug QA: `set-quest-status` + recap detaille flags/quete
- Frontend HUD `Debug QA`:
  - ajout d'une action `Set quest status` avec:
    - champ `questKey`
    - select `status` (`active`, `completed`, `claimed`)
  - branchement direct sur `POST /debug/admin/set-quest-status`
  - recap detaille du succes:
    - `set-world-flags`: total flags + ajouts/retraits + apercu
    - `set-quest-status`: `previousStatus -> nextStatus`.
- UX:
  - verification plus rapide des mutations debug sans devoir ouvrir la console reseau
  - reduction des erreurs de saisie via select de statut.

### Lot 42 - Boss scripts reactifs a `Interrupt` / `Cleanse`
- Backend combat:
  - ajout de fenetres de reaction courtes dans `scriptState`:
    - `playerCleanseReactionWindowTurns`
    - `playerInterruptReactionWindowTurns`
  - ajustement des scripts boss:
    - `cinder_warden`: si le joueur vient de `Cleanse`, priorise `Cinder Burst` pour reappliquer la pression
    - `ash_vanguard_captain`: apres un `Interrupt` joueur, contre plus agressivement avec `Twin Slash`
    - `curse_heart_avatar`: peut lancer `Null Sigil` meme sans `Rally` si le joueur vient de `Cleanse`
  - `Interrupt` devient plus rentable:
    - applique aussi une fenetre courte `Exposed` (reuse de `enemyShatterTurns` pendant 1 tour)
  - `Cleanse` devient plus rentable:
    - rend 1 MP immediatement apres dispel reussi
  - simulation telegraphe multi-tour alignee avec ces nouvelles reactions (consommation des fenetres cote forecast et runtime).

### Lot 43 - HUD combat: etats tactiques en chips visuelles
- Frontend HUD combat:
  - rendu des effets joueur/ennemi en `chips` colores au lieu de texte brut
  - nouveaux etats tactiques lisibles:
    - ennemi `Exposed Nt` (fenetre courte apres `Interrupt`)
    - joueur `Cleanse window Nt`
    - joueur `Interrupt window Nt`
  - conservation des telegraphes `Intent` / `Next` et des validations de boutons existantes.

### Lot 44 - Equilibrage skills `Mend` / `Cleanse` / `Interrupt`
- Backend combat:
  - `MEND_MANA_COST` ajuste a `3` (au lieu de `4`) pour rendre le sustain plus viable
  - `INTERRUPT_MANA_COST` ajuste a `4` (au lieu de `5`) pour augmenter l'accessibilite tactique
  - degats de `Interrupt` legerement reduits pour compenser son avantage utilitaire
  - remboursement MP de `Cleanse` conditionne a une purge double (`Burning` + `Silence`) pour limiter l'abus.
- Frontend combat:
  - constantes HUD alignees sur les nouveaux couts MP (`Mend=3`, `Interrupt=4`).

### Lot 45 - Tests automatises backend combat (premier socle)
- Backend API:
  - ajout d'un premier jeu de tests automatises sous `apps/api/test/combat-reaction.test.js`
  - scenarios verifies:
    - reaction `cinder_warden` apres `Cleanse`
    - reaction `ash_vanguard_captain` apres `Interrupt`
    - reaction `curse_heart_avatar` apres `Cleanse`
    - consommation correcte des fenetres courtes.
  - script `npm test --workspace @farm-rpg/api` branche sur ces tests.

### Lot 46 - CI: execution des tests combat API
- GitHub Actions:
  - workflow CI enrichi avec une etape `API Combat Tests`
  - execution de `npm run test --workspace @farm-rpg/api` apres le build.

### Lot 47 - Documentation QA des reactions combat
- Nouveau document:
  - `docs/05-qa-checklist-combat-reactive.md`
- Contenu:
  - table de scenarios de validation manuelle (Cleanse/Interrupt/boss/telegraphes)
  - preconditions, action endpoint, resultat API attendu et rendu HUD attendu.

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
  - offres par tiers (1/2/3) avec prerequis flags
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
  - completer rapidement une quete (ou toutes les quetes) pour QA des flux de claim/rewards
  - forcer le prochain `combat/start` sur un ennemi/script cible, puis auto-consommation one-shot
  - appliquer un preset complet de loadout (equipement+inventaire+ressources) pour QA rapide
  - appliquer un preset de scenario global (`village_open`, `mid_tower`, `act1_done`) pour QA rapide
  - forcer des flags monde cibles (ajout/retrait/remplacement) pour tester village/shop/story
  - forcer l'etat d'une quete cible (`active/completed/claimed`) pour QA rapide.

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
  - glossaire visuel des raretes de loot (`common`, `uncommon`, `rare`, `epic`, `legendary`)
  - panneau `Debug QA` pour piloter les endpoints debug sans quitter le jeu (DEV/staging), incluant world flags, presets de scenario, set quest status et recaps detaillees
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
- `POST /debug/admin/apply-state-preset` (dev only)
- `POST /debug/admin/complete-quests` (dev only)
- `POST /debug/admin/set-combat-start-override` (dev only)
- `POST /debug/admin/clear-combat-start-override` (dev only)
- `POST /debug/admin/apply-loadout-preset` (dev only)
- `POST /debug/admin/set-world-flags` (dev only)
- `POST /debug/admin/set-quest-status` (dev only)
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
- Skills combat serveur avec validations metier strictes (couts MP, debuffs actifs, interruption conditionnelle sur telegraphes).
- Flux PR continue (`develop` -> `main`) deja utilise et valide.

## 9) Prochaines priorites recommandees
1. Commencer generation/normalisation sprites definitifs pour persos et ennemis.
2. Etendre les tests automatises vers des parcours API plus larges (`auth`, `debug-admin`, `shops`, `saves`).
3. Ajouter des fixtures SQL de test pour industrialiser des scenarios d'integration complets en CI.
4. Ajouter un lot de tuning avance des boss (timings/patterns) avec telemetrie simple des combats.
5. Ajouter des validations de non-regression UI combat (snapshots/QA scriptes front).


