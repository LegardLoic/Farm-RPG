# Journal de bord - Farm RPG

Derniere mise a jour: 1 avril 2026

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

### Lot 48 - Sprite pack initial + integration Phaser
- Frontend web:
  - ajout d'un premier pack SVG normalise dans `apps/web/public/assets/sprites/`
  - manifest sprite `manifest.json` pour decrire:
    - frame size
    - origin
    - scale
    - collisions physiques
  - `BootScene` charge maintenant les sprites du monde avant le passage sur `GameScene`
  - `GameScene` utilise le sprite `player-hero` du manifest au lieu de la texture procedurale.

### Lot 49 - Tests API transverses
- Backend API:
  - ajout d'un test runner agregeant:
    - `combat-reaction.test.js`
    - `api-crosscut.test.js`
  - couverture transversale ajoutee pour:
    - auth
    - debug-admin
    - shops
    - saves

### Lot 50 - Fixtures SQL d'integration
- Donnees de test:
  - ajout de fixtures SQL dans `apps/api/test/fixtures/`
  - scenarios couverts:
    - reset base
    - utilisateur authentifie baseline
    - progression mid-tower
    - etat combat actif + save/autosave
  - doc d'utilisation locale ajoutee:
    - `docs/06-fixtures-integration-sql.md`

### Lot 51 - Tuning combat avance + telemetry simple
- Backend combat:
  - ajustement leger des timings de boss via constantes nommees:
    - `Thorn Beast Alpha` -> intervalle `Root Smash`
    - `Cinder Warden` -> intervalle `Cinder Burst`
    - `Ash Vanguard Captain` -> intervalle `Twin Slash`
    - `Curse Heart Avatar` -> intervalle `Cataclysm Ray`
  - telemetry simple dans `scriptState`:
    - `telemetryCleanseUses`
    - `telemetryInterruptUses`
    - `telemetryBossSpecialCasts`
    - compteurs par intent special (`telemetryBossSpecialCast_*`)
  - les compteurs restent retrocompatibles, sans changement de schema.

### Lot 52 - Non-regression UI combat + CI web
- Frontend web:
  - ajout d'un test Node de non-regression sur le HUD combat
  - verification de la presence des boutons combat, telegraphes et styles d'effets
  - script de test Web rendu compatible CommonJS sur Windows.
- CI:
  - workflow GitHub Actions enrichi avec l'etape `Web UI Regression Tests`.

### Lot 53 - Telemetry combat visible dans le HUD
- Frontend combat:
  - ajout d'une ligne `Telemetry` dans la carte ennemi du HUD combat.
  - affichage des compteurs issus du `scriptState` serveur:
    - `telemetryCleanseUses`
    - `telemetryInterruptUses`
    - `telemetryBossSpecialCasts`
    - details par intent special `telemetryBossSpecialCast_*`.
  - rendu compact pour QA live: `C:x | I:y | B:z | INTENT_A:n, INTENT_B:m`.
  - fallback lisible: `No data` tant qu'aucun compteur n'a encore ete incremente.
- Qualite:
  - test web de non-regression etendu pour verifier la presence du champ HUD `combatTelemetry`.

### Lot 54 - Extension sprite pack ennemis
- Frontend assets:
  - ajout des sprites SVG manquants pour les ennemis:
    - `training_dummy`
    - `ash_scout`
    - `thorn_beast_alpha`
  - enrichissement du `manifest.json` sprites avec les nouvelles entrees (scale/origin/physics).
  - prechargement BootScene etendu pour charger tous les sprites ennemis de la table combat actuelle.

### Lot 55 - Workflow CI dedie fixtures SQL
- CI integration:
  - ajout d'un workflow manuel `Fixtures Integration` (workflow_dispatch) dedie aux fixtures SQL.
  - support des scenarios selectionnables (`baseline-authenticated-user`, `mid-tower-progression`, `active-combat-save-state`, `all`).
  - support du reset optionnel avant application (`reset_first`).
  - installation automatique de `postgresql-client` sur runner Ubuntu.
- Tooling fixtures:
  - ajout du script `apps/api/test/fixtures/run-fixtures.sh` pour orchestration locale/CI des fixtures.
  - doc fixtures mise a jour avec mode local + mode CI.

### Lot 56 - E2E auth -> combat -> save/load
- Backend QA:
  - ajout d'un test e2e Node dedie:
    - `GET /auth/me`
    - `POST /combat/start`
    - `POST /saves/:slot/capture`
    - `POST /saves/:slot/load`
    - verification finale `GET /combat/current` => `null` apres `load`.
  - auth e2e par JWT signe via `E2E_ACCESS_TOKEN_SECRET` et `E2E_USER_ID` fixture.
  - script npm dedie: `npm run test:e2e --workspace @farm-rpg/api`.
  - doc d'execution ajoutee: `docs/07-e2e-auth-combat-save-load.md`.

### Lot 57 - Export JSON des traces QA HUD
- Frontend Debug QA:
  - ajout d'une action HUD `Export JSON trace`.
  - generation locale d'un fichier JSON telechargeable (sans backend).
  - payload exporte:
    - metadonnees frontend/env + viewport + user agent
    - etat auth
    - snapshot HUD
    - snapshot combat complet (incluant `scriptState` et telemetry)
    - statut/messages Debug QA.
  - style dedie du bouton d'export pour le distinguer des actions debug serveur.
- Qualite:
  - non-regression web etendue sur le wiring de l'export QA.

### Lot 58 - E2E API etendu (quest/shop/autosave)
- Backend QA:
  - extension du scenario `test:e2e` pour couvrir:
    - claim de quete
    - achat boutique forgeron
    - restauration autosave
  - fixtures SQL adaptees pour fournir les preconditions de ces parcours.
  - documentation e2e mise a jour dans `docs/07-e2e-auth-combat-save-load.md`.

### Lot 59 - Pack strips player + boss scriptes
- Frontend assets:
  - ajout de strips SVG `idle/hit/cast` dans `apps/web/public/assets/sprites/strips/characters/` pour:
    - `player-hero`
    - boss etages `3/5/8/10` (`thorn_beast_alpha`, `cinder_warden`, `ash_vanguard_captain`, `curse_heart_avatar`)
  - enrichissement `manifest.json` avec une section `strips` (frame size/count + animations + scale/origin/physics).
  - preload BootScene etendu pour charger les textures strips.

### Lot 60 - Pipeline nightly staging E2E
- CI GitHub:
  - ajout du workflow `.github/workflows/nightly-staging-e2e.yml`.
  - execution quotidienne planifiee + lancement manuel (`workflow_dispatch`).
  - sequence:
    - verification variables staging
    - seed fixtures SQL
    - run `npm run test:e2e --workspace @farm-rpg/api`.

### Lot 61 - HUD combat: sprite ennemi selon `enemy.key`
- Frontend combat:
  - ajout d'un bloc visuel dans la carte ennemi du HUD.
  - resolution du sprite depuis le `manifest` selon `enemy.key`, avec fallback lisible.
  - rendu adapte au style HUD (badge visuel + image pixel-friendly).

### Lot 62 - Debug QA: import/replay JSON trace
- Frontend Debug QA:
  - ajout des actions:
    - `Import JSON trace`
    - `Replay imported trace`
  - prise en charge d'un fichier JSON local, validation et parsing du payload.
  - replay applique sur le HUD (auth, progression, snapshot combat/logs) pour reproduire un contexte QA.
- Qualite:
  - non-regression web etendue pour verifier le wiring import/replay + sprite ennemi HUD.

### Lot 63 - Runtime strips: animations player + boss dans le HUD combat
- Frontend Phaser:
  - `BootScene` charge maintenant les strips player/boss en `spritesheet` (frames exploitables en runtime).
  - `GameScene` cree les animations `idle/hit/cast` a partir du `manifest.strips`.
  - player hero passe sur le strip runtime avec:
    - `idle` en boucle
    - `hit/cast` declenchees sur actions combat et impacts recus.
- HUD combat:
  - carte ennemi upgradee avec un rendu strip anime quand un strip existe pour `enemy.key`.
  - fallback automatique vers sprite statique puis fallback texte si aucun asset disponible.
  - transitions d'animation ennemie:
    - `cast` sur tour ennemi
    - `hit` quand les HP ennemis baissent.
- Qualite:
  - tests web de non-regression etendus sur le wiring strips runtime (BootScene + GameScene + styles).

### Lot 64 - Debug QA: replay pas a pas des traces importees
- Frontend Debug QA:
  - ajout des actions:
    - `Start step replay`
    - `Next step`
    - `Stop step replay`
  - le replay pas a pas lit les logs de la trace importee et avance etape par etape dans le HUD.
  - progression visible via compteur `stepIndex/totalSteps` sur le bouton `Next step`.
  - `Stop` restaure le snapshot local precedent (auth/hud/combat) pour ne pas polluer la session courante.
- Robustesse:
  - import d'une nouvelle trace pendant un replay actif stoppe proprement le replay en cours.
  - replay snapshot direct (`Replay imported trace`) reste disponible en complement.
- Qualite:
  - non-regression web etendue pour valider le wiring des controles step replay.

### Lot 65 - Nightly staging CI: resume publie et artefacts
- CI GitHub:
  - workflow nightly staging enrichi avec statuts explicites pour:
    - seed fixtures
    - execution API e2e
  - generation d'un `summary.json` (timestamp, branche, statuts, exit codes, run URL).
  - publication d'un resume lisible dans `GITHUB_STEP_SUMMARY`.
  - upload des artefacts nightly:
    - `summary.json`
    - `seed.log`
    - `e2e.log`
  - echec final controle du workflow si seed ou e2e est en echec.

### Lot 66 - Review/polish animations hero + boss
- Frontend animation:
  - passage d'un tuning unique a un tuning par strip via `manifest.strips[*].timings`.
  - ajout de timings distincts pour:
    - player runtime (`idleFps/hitFps/castFps`, durées `hit/cast`)
    - HUD boss (`idle/hit/cast` intervals + durées d'override).
  - sequences de frames affinees par entite (`idle/hit/cast`) pour lisibilite plus stable.
- Runtime combat:
  - `GameScene` lit maintenant les timings depuis le manifest et applique:
    - FPS des anims player au build des animations Phaser
    - intervalle d'animation HUD selon le type (`idle/hit/cast`)
    - durées d'impact/cast synchronisées avec le strip de l'entite.
- Qualite:
  - non-regression web etendue pour couvrir la presence du wiring de timing dynamique.

### Lot 67 - Smoke QA web automatisee (boot + auth + guard combat)
- Frontend QA:
  - ajout d'un script Playwright `apps/web/test/smoke-web-auth-combat.mjs`.
  - controles smoke verifies:
    - chargement de la page et du HUD (`#hud-root`)
    - statut auth attendu (`Non connecte` par defaut)
    - bouton `Start combat` desactive hors session.
  - garde supplementaire:
    - verification qu'aucun `POST /combat/start` n'est emis tant que le joueur n'est pas connecte.
- CI GitHub:
  - workflow nightly staging enrichi pour lancer ce smoke web apres seed fixtures + API e2e.
  - publication du statut smoke dans `summary.json` et `GITHUB_STEP_SUMMARY`.
  - upload du log dedie `artifacts/nightly/web-smoke.log`.

### Lot 68 - Endpoint debug readonly des scripts combat
- Backend combat:
  - ajout de la route `GET /combat/debug/scripted-intents` (auth requise, bloquee en `production`).
  - payload QA fourni:
    - skills joueur (`attack/defend/fireball/rally/sunder/mend/cleanse/interrupt`)
    - liste ennemis + stats + floor script eventuel
    - mapping floors scripts (`3/5/8/10`)
    - intents scriptes par boss avec trigger et interruptibilite.
- Qualite:
  - test API crosscut ajoute pour valider le contrat debug retourne.

### Lot 69 - Portraits fallback pour ennemis non-boss
- Assets:
  - ajout d'un dossier `apps/web/public/assets/sprites/portraits/enemies/`.
  - ajout de portraits dedies:
    - `forest_goblin`
    - `training_dummy`
    - `ash_scout`
    - `default` (fallback).
- Frontend combat:
  - rendu ennemi HUD etendu pour prioriser un portrait mappe (`manifest.portraits.byEnemyKey`) avant le sprite statique.
  - fallback global `manifest.portraits.fallback` si portrait dedie absent.

### Lot 70 - Replay pas a pas: mode auto-play
- Frontend Debug QA:
  - ajout d'un mode auto-play sur le replay pas a pas:
    - `Start auto-play` / `Pause auto-play`
    - vitesses reglables (`slow`, `normal`, `fast`).
  - arret auto robuste:
    - fin de replay
    - stop manuel
    - reset combat/teardown HUD.

### Lot 71 - Preset de calibration visuelle strips (staging only)
- Frontend Debug QA:
  - ajout d'un preset de calibration strips actif uniquement en `staging`.
  - presets:
    - `Manifest default`
    - `Snappy QA`
    - `Cinematic QA`
  - application runtime:
    - recalcul des FPS/durees player
    - recalcul des intervalles/durees HUD ennemi
    - refresh immediat des animations en cours.

### Lot 72 - Smoke web authentifie (fixture cookie/token)
- Frontend QA + CI:
  - smoke Playwright etendu avec 2 modes:
    - `guest` (guard non-connecte)
    - `auth` (injection cookie access token et verif `Start combat` end-to-end).
  - nightly CI:
    - run `web smoke guest`
    - build fixture auth automatique depuis `E2E_ACCESS_TOKEN_SECRET + E2E_USER_ID` si token web non fourni
    - run `web smoke auth`
    - logs/summary separes (`guest` vs `auth`).

### Lot 73 - Nettoyage automatique du combat apres smoke auth
- Frontend QA + CI:
  - le smoke `auth` cloture maintenant automatiquement le combat ouvert en fin de run via `POST /combat/:id/forfeit`.
  - verification de nettoyage sur `GET /combat/current` pour eviter les encounters orphelins en staging.
  - comportement robuste: le cleanup est tente sans masquer une erreur de test preexistante.

### Lot 74 - Dashboard nightly historique 7 jours
- CI nightly:
  - generation d'un `summary.json` enrichi avec `runNumber` et `runUrl`.
  - production d'un `history.json` et d'un `dashboard.md` dans `artifacts/nightly/`.
  - historique construit sur les 7 derniers runs pour suivre les tendances:
    - `seed`
    - `API E2E`
    - `web smoke guest`
    - `web smoke auth`.

### Lot 75 - Debug QA: reference scripts combat + preferences locales
- Frontend Debug QA:
  - bouton `Load scripted intents` dans le panneau pour charger `GET /combat/debug/scripted-intents`.
  - rendu lisible in-game des skills joueur, floors scripts et intents ennemis.
  - gestion d'erreur dediee si endpoint indisponible.
  - persistance `localStorage` de:
    - la vitesse auto-play replay
    - le preset strip calibration.

### Lot 76 - Portraits fallback avec variantes d'etat
- Assets + manifest:
  - extension `manifest.portraits` avec etats `normal/hit/cast` pour les ennemis non-boss frequents.
  - ajout des variantes SVG `hit` et `cast` pour:
    - `default`
    - `forest_goblin`
    - `training_dummy`
    - `ash_scout`.
- Frontend combat:
  - consommation runtime des variantes de portrait selon l'etat HUD (`normal/hit/cast`) quand aucun strip n'est disponible.

### Lot 77 - Defaite MVP complete (retour ferme + penalites)
- Combat backend:
  - defaite appliquee cote serveur avec penalite autoritaire:
    - perte or aleatoire `10%` -> `30%`
    - perte de `1` a `3` stacks inventaire (`-1` unite par stack ciblee)
    - HP fixe a `1` en fin de combat perdu.
  - encounter enrichi avec `defeatPenalty` (resume de penalite) + logs de recap explicites.
  - progression persistee et reutilisee pour initialiser HP/MP des prochains combats.
- Monde + saves:
  - ajout d'un `world_state` persistant (`zone`, `day`) par joueur.
  - en cas de defaite: retour `Ferme` + `day + 1`.
  - snapshots saves versionnes alignes avec les nouveaux champs (`player.currentHp/maxHp/currentMp/maxMp`, `world.zone/day`).
- Frontend:
  - HUD hors combat aligne sur les HP/MP de `GET /gameplay/state` (suppression du reset hardcode 32/15).
- QA:
  - test crosscut dedie couvrant la penalite de defaite (or, items, jour, HP=1).

### Lot 78 - Statuts MVP alignes: Poison, Cecite, Obscurite
- Combat backend:
  - statut `Poison` aligne comme DOT joueur en fin de tour (`-2 HP`, duree geree et log explicite).
  - statut `Cecite` ajoute:
    - applique par scripts ennemis (Root Smash)
    - peut faire rater `attack` et `sunder` (log lisible sur miss).
  - statut `Obscurite` aligne comme blocage de concentration:
    - bloque `fireball`, `rally`, `mend`, `interrupt`
    - laisse `cleanse`, `attack`, `defend`, `sunder` disponibles.
  - `Cleanse` retire maintenant `Poison` + `Cecite` + `Obscurite` avec recap des debuffs retires.
- Compatibilite:
  - fallback conserve pour encounters legacy utilisant encore `playerBurningTurns` / `playerSilencedTurns`.
- Frontend HUD:
  - chips d'effets joueurs mis a jour (`Poison`, `Cecite`, `Obscurite`).
  - boutons/actions et messages d'erreur alignes sur la regle `Obscurite`.
- QA:
  - tests reaction combat ajoutes/etendus pour valider:
    - tick debuffs + windows
    - blocage skills sous `Obscurite`
    - miss physique possible sous `Cecite`.

### Lot 79 - Courbe progression 1->10 + calibration paliers 3/5/8/10
- Progression backend:
  - courbe XP explicite verrouillee niveau `1 -> 10` (table fixe) avec `PLAYER_MAX_LEVEL = 10`.
  - clamp serveur des niveaux hors borne et stabilisation de `experience_to_next`.
  - au niveau max, l'XP est plafonnee proprement (pas de depassement de courbe).
- Combat backend:
  - calibration difficulte par paliers de tour:
    - floor `1-2` -> Tier I
    - floor `3-4` -> Tier II
    - floor `5-7` -> Tier III
    - floor `8-9` -> Tier IV
    - floor `10+` -> Tier V
  - combats non-scriptes scales par tier (HP/stats/rewards) pour une montee de difficulte lisible.
  - boss scriptes conserves baseline (pas de sur-scale) pour garder leur tuning dedie.
  - rewards victoire ajustees selon ecart `niveau joueur` vs `floor` (anti over-farm + bonus risque).
- QA:
  - tests ajoutes:
    - cap niveau 10 + stabilite XP au cap
    - scaling tier des encounters non-scriptes
    - boss scriptes non scales.

### Lot 80 - UX combat: recap fin de combat detaille
- Combat backend:
  - ajout d'un objet `recap` dans l'etat encounter (payload API) pour les combats termines.
  - instrumentation runtime des metrics combat:
    - degats infliges / recus
    - soins effectues
    - MP depense / recupere
    - statuts appliques (`Poison`, `Cecite`, `Obscurite`)
    - debuffs cleansed
    - misses causes par `Cecite`
    - rewards/penalties (XP, gold, loot, pertes defaite).
  - recap final genere automatiquement sur `won/lost/fled` + logs recap lisibles.
  - garde-fou pour ne journaliser le recap qu'une seule fois.
- Frontend HUD:
  - ajout d'une ligne `Recap` dediee dans le panneau combat.
  - rendu d'un resume compact en fin de combat (DMG, Heal, MP, statuts, loot).
  - parsing robuste des nouveaux champs `rewards`, `defeatPenalty` et `recap`.
- QA:
  - test backend dedie pour valider la generation recap et la non-duplication des logs.
  - regression web test mise a jour pour verifier le wiring HUD recap.

### Lot 81 - Debug QA: filtres + export markdown recaps/scripts
- Frontend Debug QA:
  - ajout de filtres locaux recap:
    - `Recap outcome filter` (`all/won/lost/fled/active`)
    - `Recap enemy filter` (key/nom ennemi).
  - ajout de filtres locaux scripted intents:
    - `Script enemy filter`
    - `Script intent filter` (key/label/trigger).
  - ajout d'un export `Export Markdown recap` qui genere un fichier `.md` avec:
    - filtres actifs
    - recap combat courant + logs (si match filtres)
    - reference scripts intents filtree.
  - chargement reference scripts intents ajuste:
    - stockage d'une reference structuree cote scene
    - rendu du panneau reference aligne sur les filtres actifs.
- QA:
  - extension du test de regression web pour verifier:
    - wiring des nouveaux champs filtres
    - wiring export markdown
    - styles dedies (`reference filters` + bouton markdown export).

### Lot 82 - CI QA: smoke auth etendu + alerte 2 fails consecutifs
- Web smoke auth (`apps/web/test/smoke-web-auth-combat.mjs`):
  - ajout d'une assertion explicite `Debug QA reference loaded` en mode authentifie.
  - verification API de `GET /combat/debug/scripted-intents`:
    - endpoint accessible
    - payload non vide (`scriptedIntents` > 0).
  - le resume smoke inclut maintenant un bloc `debugQaReference` (profiles/floors/skills).
- Workflow nightly staging (`.github/workflows/nightly-staging-e2e.yml`):
  - calcul du compteur d'echecs consecutifs a partir de l'historique 7 runs.
  - publication de l'output `consecutive_failures` sur l'etape history.
  - ajout d'une alerte automatique quand `consecutive_failures >= 2`:
    - creation (ou commentaire) d'une issue GitHub dediee pour signaler la degradation continue.
  - permissions workflow mises a jour pour autoriser l'ecriture d'issues (`issues: write`).

### Lot 83 - Personnage: creation hero minimale + persistance profil
- Backend API:
  - nouveau module `profile` avec endpoints proteges:
    - `GET /profile` -> lecture du profil hero courant (`null` si non cree)
    - `PUT /profile` -> creation/mise a jour (`heroName`, `appearanceKey`).
  - nouvelle table `player_profiles` dans le schema DB:
    - `user_id` (PK/FK users), `hero_name`, `appearance_key`, `created_at`, `updated_at`.
  - validation serveur MVP:
    - `heroName` borne entre 2 et 24 caracteres
    - `appearanceKey` restreinte a `default|ember|forest|night`.
- Frontend HUD (Phaser):
  - ajout d'un panneau `Hero` avec:
    - input nom du heros
    - select apparence de base
    - action `Creer profil` / `Mettre a jour profil`.
  - wiring complet:
    - chargement profil au bootstrap session
    - persistance via `PUT /profile`
    - etats UI: loading, message succes, message erreur, desactivation hors auth.
- QA:
  - extension tests API (`api-crosscut`) pour couvrir upsert + lecture profil.
  - extension regression web test pour verifier wiring HUD profile + styles dedies.

### Lot 84 - Input: premiere passe support manette (navigation HUD + combat)
- Frontend HUD (Phaser):
  - ajout d'une premiere couche d'input manette:
    - navigation focus HUD via `D-pad` et `LB/RB`
    - activation contexte via `A` (element HUD focus, fallback action primaire combat)
    - raccourcis combat:
      - `X` -> `attack`
      - `Y` -> `defend` (et `start combat` hors combat)
      - `B` -> `fireball`.
  - gestion focus runtime:
    - detection des elements interactifs HUD eligibles (boutons/champs/selects)
    - maintien du focus logique lors des refresh HUD
    - reset propre du state manette a la destruction HUD.
  - aide utilisateur HUD mise a jour avec les controles manette.
- UX:
  - style visuel dedie sur element HUD focus manette (`data-gamepad-focused="1"`).
- QA:
  - extension regression web pour verrouiller:
    - constantes boutons manette
    - wiring méthodes manette
    - presence du hint HUD
    - presence du style focus manette.

### Lot 85 - Narration: intro MVP (arrivee village -> maire -> attribution ferme)
- Backend API:
  - etat intro integre a `GET /gameplay/state`:
    - `intro.currentStep` (`arrive_village|meet_mayor|farm_assignment|completed`)
    - `intro.completed`
    - `intro.steps` detaille.
  - nouvel endpoint protege:
    - `POST /gameplay/intro/advance` pour avancer d'une etape narrative.
  - progression intro pilotee par flags monde dedies:
    - `intro_arrived_village`
    - `intro_met_mayor`
    - `intro_farm_assigned`.
  - effets monde:
    - arrivee village -> zone forcee a `Village`
    - attribution ferme -> zone retour `Ferme`.
- Frontend HUD (Phaser):
  - nouveau panneau `Intro scenario`:
    - resume d'etape
    - texte narratif court
    - hint contextuel
    - progression `x/3`
    - action `Continuer intro`.
  - wiring:
    - lecture etat intro depuis `gameplay/state`
    - bouton branche sur `POST /gameplay/intro/advance`
    - etats UI: disabled hors auth, loading, message erreur.
- QA:
  - extension tests API (`api-crosscut`) sur le flux complet de progression intro.
  - extension regression web pour verrouiller wiring HUD intro + styles.

### Lot 86 - PNJ: systeme d'etats maire/forgeron/marchand pilote par flags monde
- Backend API:
  - `GET /gameplay/state` enrichi avec:
    - `village.npcs.mayor`
    - `village.npcs.blacksmith`
    - `village.npcs.merchant`
  - chaque PNJ expose:
    - `stateKey` (etat metier derive des flags monde)
    - `available` (disponibilite d'interaction).
  - logique actuelle derivee des flags:
    - maire: `offscreen|awaiting_meeting|briefing|village_overseer|tower_strategist`
    - forgeron: `cursed|recovering|open|masterwork_ready`
    - marchand: `absent|setting_stall|open|traveling_buyer`.
- Frontend HUD (Phaser):
  - nouveau panneau `Village PNJ`:
    - resume global (`x/3 accessibles`)
    - ligne etat pour maire, forgeron, marchand
    - etat lisible (`state label | Disponible/Indisponible`).
  - parsing du payload `village.npcs` branche dans `GameScene`.
- QA:
  - extension tests API pour valider les etats PNJ selon combinaison de flags.
  - extension regression web pour verrouiller wiring HUD + styles PNJ.

### Lot 87 - Village economy: boutique graines + rachat recoltes (API + HUD)
- Backend API (`shops`):
  - nouveaux endpoints proteges:
    - `GET /shops/village-market`
    - `POST /shops/village-market/buy-seed`
    - `POST /shops/village-market/sell-crop`
  - verrouillage du marche via flags progression:
    - `intro_farm_assigned`
    - `floor_3_cleared`
  - offres graines serveur (achat transactionnel):
    - deduction or
    - ajout inventaire graines
    - validation lock/offre inconnue/or insuffisant.
  - rachat recoltes serveur (vente transactionnelle):
    - verification stock inventaire
    - retrait inventaire recoltes
    - ajout or
    - retour du stock restant.
  - support d'offres progressives par flags (`story_floor_5_cleared`).
- Frontend HUD (Phaser):
  - nouveau panneau `Village Market`:
    - section `Seeds` (achat x1)
    - section `Crop Buyback` (vente x1)
    - affichage quantite possedee par recolte.
  - etats UX:
    - `locked/loading/error`
    - boutons disables selon or dispo (achat) ou stock dispo (vente).
  - refresh automatique du panel apres:
    - start/action/forfeit combat
    - claim de quete
    - achat forgeron
    - load de slot
    - actions du marche.
- QA:
  - tests API crosscut ajoutes:
    - lock du marche
    - offres + quantites possedees
    - flux achat/vente avec verification or + inventaire.
  - regression web test etendue:
    - wiring HUD village market
    - handlers/actions market
    - styles dedies.

### Lot 88 - Ferme data model: parcelles, cultures, arrosage, croissance
- Backend gameplay:
  - `GET /gameplay/state` enrichi avec un bloc `farm` persistant.
  - nouveau modele ferme serveur:
    - layout de parcelles initialise automatiquement (12 plots)
    - etat par parcelle (`cropKey`, `plantedDay`, `growthDays`, `wateredToday`)
    - calcul runtime de progression (`growthProgressDays`, `daysToMaturity`, `readyToHarvest`).
  - catalogue cultures expose via API (`turnip`, `carrot`, `wheat`) avec:
    - seed item associe
    - item recolte associe
    - temps de croissance
    - prerequis de deblocage par flags.
- Base de donnees:
  - nouvelle table `farm_plots` (persistante par joueur):
    - cle primaire `(user_id, plot_key)`
    - coordonnees de parcelle (`row_index`, `col_index`)
    - champs de culture/arrosage.
  - index utilisateur ajoute pour lecture rapide des parcelles.
- QA:
  - tests API crosscut ajoutes:
    - initialisation layout ferme par defaut
    - calcul des timers de croissance et etat `readyToHarvest`.

### Lot 89 - Ferme backend: endpoints `plant`, `water`, `harvest`
- Backend gameplay:
  - nouveaux endpoints proteges:
    - `POST /gameplay/farm/plant`
    - `POST /gameplay/farm/water`
    - `POST /gameplay/farm/harvest`
  - validations metier serveur:
    - ferme debloquee (`intro_farm_assigned`) requise
    - plot existant requis
    - `plant`: plot vide + seed dispo en inventaire + crop debloquee
    - `water`: plot plante + non arrose le jour courant
    - `harvest`: plot plante + crop arrivee a maturite.
  - operations transactionnelles:
    - `plant`: consomme 1 seed et renseigne le plot (`cropKey/plantedDay/growthDays`)
    - `water`: marque `wateredToday = true`
    - `harvest`: ajoute la recolte en inventaire et reset le plot.
  - chaque endpoint retourne aussi l'etat `farm` rafraichi pour faciliter le HUD du lot 90.
- QA:
  - tests API crosscut ajoutes:
    - plantation (consommation seed + ecriture plot)
    - arrosage (flag `wateredToday`)
    - recolte (gain inventaire + reset plot).

### Lot 90 - Ferme frontend: panneau jouable (graine/plantation/arrosage/recolte)
- Frontend HUD (Phaser):
  - nouveau panneau `Farm Plots` avec:
    - resume (`ready/planted/total`)
    - select de graine debloquee (catalogue cultures serveur)
    - liste des 12 parcelles et statut par parcelle.
  - actions par parcelle branchees sur API:
    - `Plant` -> `POST /gameplay/farm/plant`
    - `Water` -> `POST /gameplay/farm/water`
    - `Harvest` -> `POST /gameplay/farm/harvest`
  - gestion UX:
    - lock ferme (intro non terminee)
    - loading/error par panneau
    - etat visuel `ready to harvest`.
- Integration:
  - parsing du bloc `farm` depuis `GET /gameplay/state`
  - synchro du panneau ferme apres actions + refresh `Village Market` pour les quantites de recoltes.
- QA:
  - extension regression web (`combat-ui-regression`) pour verrouiller wiring HUD ferme + styles.

### Lot 91 - Temps MVP: cycle jour/nuit + action `sleep`
- Backend gameplay:
  - nouvel endpoint protege:
    - `POST /gameplay/sleep`
  - comportement serveur:
    - validation ferme debloquee (`intro_farm_assigned`) avant autorisation de dormir
    - avance du jour (`day + 1`) en transaction
    - reset journalier des parcelles (`watered_today = false`)
    - retour payload `world + farm` rafraichi apres sommeil.
- Frontend HUD (Phaser):
  - ajout d'un indicateur `Cycle` (`Jour`/`Nuit`) derive du jour courant.
  - ajout d'un bouton `Sleep (+1 day)` dans le panneau ferme.
  - wiring action sommeil:
    - appel `POST /gameplay/sleep`
    - refresh HUD ferme/monde.
  - feedback visuel MVP:
    - teinte nocturne appliquee sur le playfield quand le cycle est `Nuit`.
- QA:
  - test API crosscut ajoute:
    - validation avance du jour + reset arrosage + progression croissance.
  - regression web etendue pour verrouiller wiring `dayPhase` + action `sleep`.

### Lot 92 - Crafting ferme MVP: recettes recoltes -> consommables combat
- Backend gameplay:
  - nouvelles recettes de crafting ferme:
    - `field_medicine` -> `healing_herb`
    - `focus_tonic` -> `mana_tonic` (avec prerequis d'avancement)
  - nouveaux endpoints proteges:
    - `GET /gameplay/crafting`
    - `POST /gameplay/crafting/craft`
  - `GET /gameplay/state` enrichi avec le bloc `crafting`.
  - logique serveur:
    - verification unlock ferme + prerequis recettes
    - validation des ingredients en inventaire
    - consommation ingredients + ajout output en transaction.
- Frontend HUD (Phaser):
  - nouveau panneau `Farm Crafting`:
    - resume (`craftable recipes`, total recettes)
    - liste des recettes debloquees
    - ingredients avec compteur `owned/required`
    - bouton `Craft x1` par recette.
  - wiring action crafting:
    - `POST /gameplay/crafting/craft`
    - refresh gameplay + market pour synchro des quantites apres craft.
- QA:
  - tests API crosscut ajoutes:
    - lecture etat crafting (unlock + max craftable)
    - craft transactionnel (consommation recoltes + gain consommable combat).
  - regression web etendue pour verrouiller wiring HUD crafting ferme.

### Lot 93 - Quetes ferme/village: recoltes et livraisons
- Backend quetes:
  - extension des metriques d'objectifs:
    - `farm_harvest_total`
    - `farm_harvest_crop`
    - `village_delivery_total`
    - `village_delivery_crop`
  - extension du progress state persistant:
    - `cropsHarvestedTotal`, `harvestedCrops`
    - `cropsDeliveredTotal`, `deliveredCrops`
  - nouvelles quetes secondaires:
    - `farm_first_harvest`
    - `turnip_delivery_request`
    - `granary_restock`.
- Backend integration:
  - progression quetes branchee sur `POST /gameplay/farm/harvest`.
  - progression quetes branchee sur `POST /shops/village-market/sell-crop`.
  - debug admin aligne pour pouvoir completer correctement les nouvelles metriques en QA.
- QA:
  - tests API crosscut ajoutes pour verrouiller les hooks:
    - harvest -> progression quete ferme
    - sell crop -> progression quete livraison village.

### Lot 94 - Relations PNJ MVP: score relationnel basique
- Backend gameplay:
  - nouveau modele relationnel PNJ persistant:
    - table `village_npc_relationships` (`friendship`, `last_interaction_day`)
    - PNJ supportes: `mayor`, `blacksmith`, `merchant`
  - `GET /gameplay/state` enrichi avec:
    - `village.relationships.<npcKey>`
    - champs exposes: `friendship`, `tier`, `lastInteractionDay`, `canTalkToday`
  - nouvel endpoint protege:
    - `POST /gameplay/village/npc/interact`
  - regles MVP:
    - interaction limitee a 1 fois/jour/NPC
    - interaction autorisee seulement si le PNJ est `available`
    - +1 amitie par interaction (avec paliers de tier).
- Frontend HUD (Phaser):
  - panneau `Village PNJ` enrichi:
    - score amitie et tier affiches par PNJ
    - bouton `Parler` par PNJ avec lock selon disponibilite/jour
    - feedback d'erreur local dans le panneau.
  - wiring action interaction:
    - `POST /gameplay/village/npc/interact`
    - refresh `gameplay/state` apres succes.
- QA:
  - tests API crosscut ajoutes:
    - progression amitie + changement de tier
    - blocage interaction multiple le meme jour
    - rejet interaction PNJ indisponible
  - regression web etendue pour verrouiller wiring du panneau relationnel PNJ.

### Lot 95 - Boucle verticale complete: tour -> village -> ferme -> preparation combat
- Backend gameplay:
  - `GET /gameplay/state` enrichi avec le bloc `loop`:
    - `stageKey/stageLabel` derives de la progression tour (`tower_progression`)
    - disponibilite ferme/marche village
    - stock consommables (`healing_herb`, `mana_tonic`)
    - etat preparation combat (`active/ready/blockers/nextStep`)
  - nouvel endpoint protege:
    - `POST /gameplay/combat/prepare`
  - regles MVP:
    - ferme + marche village requis
    - preparation impossible si une preparation est deja active
    - consommation transactionnelle des consommables ferme
    - bonus attaque accorde selon relation maire (`familiar+`).
- Backend combat:
  - branchement one-shot des bonus de preparation sur `POST /combat/start`:
    - `combat_prep_hp` -> bonus HP de debut
    - `combat_prep_mp` -> bonus MP de debut
    - `combat_prep_attack` -> bonus attaque/magie pour le combat
  - purge automatique des flags de preparation apres consommation.
- Frontend HUD (Phaser):
  - nouveau panneau `Combat Loop`:
    - stage vertical courant
    - recap supplies ferme
    - etat de preparation actif/bloque
    - blocker prioritaire + message d'erreur local
    - action `Prepare combat`.
  - wiring action preparation:
    - `POST /gameplay/combat/prepare`
    - refresh `gameplay/state` + panel village/crafting associes.
- QA:
  - tests API crosscut ajoutes:
    - lecture du bloc `loop`
    - preparation combat (consommation ressources + activation flags)
  - regression web etendue pour verrouiller le wiring du panneau loop.

### Lot 96 - Gate MVP: campagne QA verticale + checklist executable
- Gate automatique:
  - nouvelle commande racine:
    - `npm run qa:gate:mvp`
  - orchestration sequentielle:
    - `lint` -> `typecheck` -> `build` -> tests API -> tests web
  - mode etendu optionnel:
    - `MVP_GATE_INCLUDE_E2E=1 npm run qa:gate:mvp`
    - ajoute `test:e2e` API + smoke web.
  - artifact local de synthese:
    - `artifacts/qa-gate/mvp-gate-report.md`
- Documentation:
  - nouveau document:
    - `docs/08-gate-mvp-vertical-checklist.md`
  - checklist manuelle verticale (intro, farm, crafting, prep combat, start combat, save/load, HUD)
  - Definition of Done explicite du gate.

### Lot 97 - Review animation: peaufinage hero/boss (timings + lisibilite)
- Assets/tuning strips:
  - retuning des sequences `idle/hit/cast` dans `manifest.json` pour:
    - meilleure lecture des impacts (`hit`)
    - meilleur maintien des phases de cast (`cast`)
    - idle moins hache sur hero + boss.
  - retuning des timings hero et boss (fps/interval/duration) pour rendre les beats plus lisibles.
- Runtime frontend:
  - mapping actions hero ajuste:
    - `attack/sunder/interrupt` -> profil `hit`
    - autres skills -> profil `cast`
  - accent visuel hero en combat:
    - tint rouge sur impact
    - tint bleu sur cast
    - clear automatique court pour eviter les etats bloques.
  - nettoyage du dataset strip HUD a l'arret pour eviter la persistance de style stale.
- UI/CSS:
  - etats visuels explicites sur strip HUD ennemi:
    - `data-strip-animation="cast"` (glow/pulse)
    - `data-strip-animation="hit"` (impact/shake)
  - etats portraits fallback:
    - `data-visual-state="hit"` et `cast` avec accent de lisibilite.
- QA:
  - regression web etendue avec assertions lot 97 (mapping action + selectors CSS + keyframes).

### Lot 98 - Balance combat statuts: calibration paliers 3/5/8/10
- Backend combat:
  - ajout d'une table de calibration des debuffs par tier d'etage:
    - `floor_1_2`
    - `floor_3_4` (palier 3)
    - `floor_5_7` (palier 5)
    - `floor_8_9` (palier 8)
    - `floor_10_plus` (palier 10+)
  - tuning par tier:
    - duree `Poison`
    - chance d'application `Poison`
    - duree `Cecite`
    - chance d'application `Cecite`
    - chance de miss sous `Cecite`
    - duree `Obscurite`
    - chance d'application `Obscurite`.
  - application des debuffs ennemis (`root_smash`, `cinder_burst`, `null_sigil`) branchee sur la calibration dynamique.
  - forecast combat aligne sur les nouvelles durees calibrees pour coherence du telegraphe.
- QA:
  - tests backend ajoutes:
    - verification des paliers `3/5/8/10`
    - verification d'un echec d'application `Poison` sur roll défavorable
    - verification du scaling de chance de miss `Cecite` selon l'etage.

### Lot 99 - Economie progression: calibration gains XP boucle ferme
- Backend shops:
  - ajout d'un barème d'XP de vente au marché village par crop:
    - `turnip`: 2 XP / unité
    - `carrot`: 3 XP / unité
    - `wheat`: 4 XP / unité
  - ajout d'un tiering de progression story pour la vente (multiplicateur XP):
    - `farm_bootstrap` (base)
    - `watch_support` (`story_floor_3_cleared`)
    - `supply_route` (`story_floor_5_cleared`)
    - `vanguard_supply` (`story_floor_8_cleared`)
    - `act1_war_effort` (`story_act_1_complete`)
  - `POST /shops/village-market/sell-crop` applique maintenant les gains XP+gold dans une mise à jour atomique de progression (`level/xp/xp_to_next/gold`).
  - payload de vente enrichi avec:
    - `totalExperienceGained`
    - `economyTierKey`
    - `progression` (snapshot après transaction).
- QA:
  - tests crosscut shops renforcés:
    - vérification gains XP sur vente standard
    - vérification scaling XP selon tier story.

### Lot 100 - QA ergonomie combat: recap HUD lisible desktop/mobile
- Frontend combat HUD:
  - recap combat réordonné pour lecture rapide:
    - ligne 1: outcome + round + DMG/Heal/MP
    - ligne 2: statuts appliqués + cleanse + blind misses
    - ligne 3: rewards (XP/Gold/Loot)
    - ligne 4 conditionnelle: penalties en cas de défaite/fuite.
  - format recap multi-lignes via `white-space: pre-line` pour réduire la densité horizontale.
  - ajustements responsive du bloc recap (padding/font-size/line-height) sous 700px pour meilleure lisibilité mobile.
- QA:
  - régression web validée (`@farm-rpg/web`).
  - suite globale validée (`npm run test`).

### Lot 101 - Quetes narratives village: micro-quetes PNJ
- Backend quetes:
  - extension du schema de progression de quetes:
    - `npcInteractionsTotal`
    - `interactedNpcs`
    - `npcFriendshipLevels`.
  - nouveaux metriques d'objectifs:
    - `village_npc_interaction_total`
    - `village_npc_interaction_npc`
    - `village_npc_friendship_npc`.
  - hook de progression branche sur `POST /gameplay/village/npc/interact` via `recordVillageNpcInteraction`.
  - compatibilite conservee avec snapshots de progression legacy (normalisation avec defaults).
- Nouvelles micro-quetes narratives:
  - `village_mayor_briefing` (dialogue + relation maire)
  - `blacksmith_forge_update` (dialogue + relation forgeron)
  - `merchant_route_sync` (dialogue marchand + volume d'interactions village).
- QA:
  - tests crosscut etendus:
    - verification du hook de progression quetes lors d'une interaction PNJ
  - suite API validee.

### Lot 102 - Dialogues contextuels PNJ selon relation
- Frontend Village PNJ:
  - ajout de lignes de dialogue par PNJ (maire/forgeron/marchand) dans le panneau HUD.
  - dialogues contextuels selon:
    - tier de relation (`stranger/familiar/trusted/ally`)
    - disponibilite PNJ (`stateKey` narratif)
    - cooldown d'interaction journaliere.
  - fallback explicite hors session (`Connecte-toi...`) pour garder un message lisible quand l'utilisateur n'est pas authentifie.
- UI/UX:
  - ajustement layout panneau PNJ pour supporter un texte multi-ligne sans casser les actions.
  - responsive mobile renforce (`<=700px`) avec empilement propre et actions restees accessibles.
- QA:
  - regression web etendue pour verifier le wiring HUD des nouvelles lignes de dialogue et des helpers de rendu contextuel.
  - suite web + globale validees.

### Lot 103 - Hook scenario ferme (jour + progression recoltes)
- Backend gameplay:
  - ajout d'un etat `farmStory` expose dans `GET /gameplay/state`.
  - premiere passe de beats ferme scenario derives de:
    - progression jour (paliers jour 2 et jour 4)
    - progression recoltes cumulees (paliers 1 et 6 recoltes).
  - `world_state` etendu avec `farm_harvest_total` (migration non destructive).
  - hooks metier branches:
    - `POST /gameplay/farm/harvest` incremente `farm_harvest_total`
    - `POST /gameplay/sleep` et `POST /gameplay/farm/harvest` declenchent les flags de beats scenario atteints.
  - payloads `sleep` et `harvest` enrichis avec `farmStory` pour synchro UI immediate.
- Frontend HUD:
  - panneau ferme enrichi avec un bloc scenario:
    - resume progression beats jour/recoltes
    - narrative active (prochain beat ou completion lot 103).
  - parsing resilient du payload `farmStory` (`farmStory` / `farm_story`) et rendu textuel dedie.
- QA:
  - tests API etendus (milestones jour/recoltes + propagation flags scenario ferme).
  - regression web etendue (wiring HUD + normalizers `farmStory`).
  - suite globale validee.

### Lot 104 - Trigger scenario tour (beats paliers 3/5/8/10)
- Backend gameplay:
  - ajout d'un etat `towerStory` expose dans `GET /gameplay/state`.
  - premiere passe de beats tour derives des paliers `3/5/8/10`:
    - suivi des paliers atteints (milestone)
    - suivi des beats narratifs reportes (flags story claimes).
  - logique `towerStory` active:
    - priorise un beat atteint mais non reporte
    - sinon propose le prochain beat non atteint
    - sinon marque la phase complete.
- Frontend HUD:
  - nouveau bloc `Tower Story` dans l'interface:
    - resume progression `reported/reached`
    - narrative active du beat en cours (ou prochain).
  - parsing resilient du payload `towerStory` (`towerStory` / `tower_story`).
- QA:
  - tests API etendus (milestones/reports floor 3/5/8/10).
  - regression web etendue (wiring HUD + normalizers tower story).
  - suite globale validee.

### Lot 105 - Accessibilite HUD combat (contraste + focus + mobile)
- Frontend combat HUD:
  - renforcement contraste visuel des cartes/statuts/logs combat pour lisibilite immediate.
  - focus clavier/manette renforce sur controles interactifs (`:focus-visible`) avec anneau de focus explicite.
  - meilleure ergonomie tactile mobile:
    - boutons combat plus hauts
    - recap/logs/statuts ajustes pour une lecture plus nette sous 700px.
- A11y semantique:
  - zones HUD combat instrumentees avec attributs ARIA:
    - `combatStatus` / `combatRecap` en `role="status"` + `aria-live`
    - `combatError` en `role="alert"`
    - `combatLogs` en `role="log"` + `aria-relevant`.
- Preference utilisateur:
  - mode `prefers-reduced-motion` branche pour reduire les animations les plus agressives du combat HUD.
- QA:
  - regression web etendue pour verifier wiring ARIA, focus visible et reduced-motion.
  - suite globale validee.

## 4) Backend en place (resume)
- Auth:
  - Google OAuth
  - sessions protegees
- Gameplay:
  - etat monde + progression joueur
  - data model ferme persistant (parcelles/cultures/arrosage/growth timers) via `gameplay/state`
  - endpoints ferme transactionnels (`plant/water/harvest`) avec validations metier serveur
  - endpoint temps `sleep` pour avance de jour + reset arrosage journalier
  - crafting ferme (recettes recoltes -> consommables combat) + etat `crafting` expose au HUD
  - ventes marche village calibrées avec progression XP par crop + palier story
  - boucle verticale exposee via `loop` + endpoint `POST /gameplay/combat/prepare`
  - consommation one-shot des bonus de preparation sur `combat/start`
  - etat village par flags
  - score relationnel PNJ persistant (amitie/tier/cooldown journalier)
  - etat intro scenario MVP pilote par flags monde + endpoint d'avance
  - etats PNJ village (maire/forgeron/marchand) derives des flags monde
- Combat:
  - simulation tour par tour serveur
  - persistence encounter
  - attribution rewards serveur autoritaire
  - bosses scriptes sur paliers 3/5/8/10
  - debuffs `Poison/Cecite/Obscurite` calibres dynamiquement par paliers 3/5/8/10
  - loot multi-sources (ennemi + floor table + boss bonus) avec rarete
- Quetes:
  - definitions cote serveur
  - progression automatique sur victoires
  - progression automatique sur recoltes ferme et livraisons marche village
  - progression automatique sur interactions/relation PNJ village
  - objectifs bases sur victoires, paliers de tour, recoltes, livraisons et interactions PNJ
  - claim explicite des recompenses
- Shops:
  - boutique forgeron protegee
  - offres par tiers (1/2/3) avec prerequis flags
  - achat serveur autoritaire
  - deduction or + ajout item en transaction
  - marche village protege (graines + rachat recoltes) avec economie serveur autoritaire
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
  - ligne telemetry combat (compteurs skills/boss scripts) pour lecture rapide en test
  - panneau `Debug QA` pour piloter les endpoints debug sans quitter le jeu (DEV/staging), incluant world flags, presets de scenario, set quest status et recaps detaillees
  - export local JSON des traces QA depuis le panneau `Debug QA`
  - export local Markdown des recaps/scripts QA avec filtres actifs
  - import/replay local JSON des traces QA pour rejouer un contexte de debug
  - replay pas a pas des traces JSON (avance tour/log par tour) avec restauration d'etat
  - replay pas a pas avec auto-play (slow/normal/fast) + pause
  - persistance locale des preferences QA (vitesse auto-play + preset calibration strips)
  - preset de calibration strips (staging only) pour iteration visuelle rapide
  - reference live des scripts combat (endpoint debug) chargeable directement dans le panneau `Debug QA`
  - carte ennemi enrichie avec sprite resolu via `enemy.key`
  - portraits fallback dedies pour ennemis non-boss (`manifest.portraits`)
  - portraits fallback avec variantes d'etat (`normal/hit/cast`) pour ennemis non-boss frequents
  - strips runtime actifs (`idle/hit/cast`) pour player et bosses, avec animation HUD cote ennemi
  - tuning animation centralise dans le manifest (sequences + timings par strip)
  - panneau intro scenario MVP (3 etapes narratives + progression)
  - panneau Village PNJ (etats + amitie/tier + interaction journaliere)
  - dialogues contextuels PNJ (etat/disponibilite/cooldown/tier de relation)
  - panneau Village Market (achat graines + vente recoltes)
  - panneau Farm Plots (selection graine + actions plant/water/harvest)
  - bloc Farm Story (beats scenario relies au jour + total recoltes)
  - panneau Farm Crafting (recettes recoltes -> consommables combat)
  - panneau Combat Loop (stage vertical + preparation combat one-shot)
  - cycle jour/nuit MVP + action `Sleep (+1 day)` sur la ferme
  - animation review lot 97: accents visuels strips/portraits + timings hero/boss retunes
- Chargement web optimise:
  - entree legere
  - bootstrap asynchrone
  - chunk `phaser-vendor` dedie
  - boot preload aligne sur tous les sprites ennemis actuels et strips player/boss.
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
- `POST /gameplay/intro/advance`
- `POST /gameplay/combat/prepare`
- `POST /gameplay/village/npc/interact`
- `POST /gameplay/sleep`
- `GET /gameplay/crafting`
- `POST /gameplay/crafting/craft`
- `POST /gameplay/farm/plant`
- `POST /gameplay/farm/water`
- `POST /gameplay/farm/harvest`
- `GET /tower/state`
- `GET /inventory`
- `POST /inventory/add`
- `POST /inventory/use`
- `GET /equipment`
- `POST /equipment/equip`
- `POST /equipment/unequip`
- `POST /combat/start`
- `GET /combat/current`
- `GET /combat/debug/scripted-intents` (dev only)
- `GET /combat/:id`
- `POST /combat/:id/action`
- `POST /combat/:id/forfeit`
- `GET /quests`
- `POST /quests/:questKey/claim`
- `GET /shops/blacksmith`
- `POST /shops/blacksmith/buy`
- `GET /shops/village-market`
- `POST /shops/village-market/buy-seed`
- `POST /shops/village-market/sell-crop`
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
- Workflow CI manuel dedie fixtures SQL pour seed reproductible des environnements d'integration.
- Suite e2e dediee auth/combat/save-load pour validation black-box sur API locale ou distante.
- Workflow nightly staging e2e pour verification continue des routes critiques avec seed fixtures.
- Manifest sprites etendu avec metadata `strips` pour preparer l'animation runtime.
- Runtime strips Phaser branche pour player + bosses (animation declenchee selon etat combat).
- Outils QA front renforces: replay instantane + replay pas a pas sur traces JSON.
- Nightly staging CI instrumentee avec artefacts exploitables pour diagnostics rapides.
- Nightly staging CI completee avec smoke web Playwright (auth guard + non emission `combat/start` hors session).
- Nightly staging CI couvre maintenant aussi un smoke web authentifie avec fixture auto (token/cookie).
- Nightly smoke auth nettoie automatiquement le combat ouvert (`forfeit`) pour eviter l'accumulation d'encounters actifs.
- Nightly staging publie un dashboard historique 7 jours (`history.json` + `dashboard.md`) pour suivre la tendance smoke/e2e.
- Nightly staging declenche une alerte GitHub dediee en cas de 2 echecs consecutifs.
- Gate locale MVP ajoutee via `npm run qa:gate:mvp` + rapport markdown dedie.
- Endpoint debug readonly disponible pour auditer scripts combat sans lancer un combat complet.
- Tuning animation hero/boss configurable via manifest sans toucher au code runtime.

## 9) Prochaines priorites recommandees
Priorisation recommandee: finir le socle RPG critique puis enchainer sur le coeur Ferme + Village + Scenario (objectif hybride maintenu).

1. Lot 106 - Telemetrie balancing: extraction KPI debuffs/reactions pour iterations tuning.
2. Lot 107 - Economie UI: affichage explicite des gains XP de vente dans le panneau Market.
3. Lot 108 - QA mobile touch: revue interactions combat/farm en viewport reduit.
4. Lot 109 - Quetes village phase 2: chaines multi-jours avec conditions farm+tour combinees.
5. Lot 110 - Iteration animation review hero/boss (timings + readability des impacts/casts).
6. Lot 111 - Farm story phase 2: evenements conditionnes par crafting et livraisons marche.
7. Lot 112 - Tower story phase 2: beats post-floor10 relies a la boucle farm + village.
8. Lot 113 - Accessibilite UI phase 2: labels/roles supplementaires et audit contrastes hors combat.


