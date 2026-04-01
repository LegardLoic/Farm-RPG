> **Statut : archive d’architecture initiale**
> Ce document décrit la base d’architecture pensée au début du projet.
> Il reste utile comme référence historique et technique, mais certaines décisions ont pu évoluer pendant l’implémentation.
> Il ne constitue plus, à lui seul, la description exhaustive de l’état technique actuel.
> Pour l’état réel du projet, se référer en priorité au journal de production, aux documents techniques actifs, et au code en place.

# Architecture technique initiale

## 1. Objectif

Poser une base technique robuste pour un RPG 2D heroique-fantasy au tour par tour, avec front de jeu sous Phaser, persistance serveur, authentification securisee, sauvegardes cloud, inventaire, equipement et systeme de combat.

Le principe directeur est simple:
- le client rend l'interface et collecte les intentions du joueur
- le serveur valide, simule ou recalcule les actions sensibles
- la base de donnees conserve l'etat durable
- les assets et le gameplay restent desacoples du stockage

## 2. Stack proposee

### Front

- `Phaser 3`
- `TypeScript`
- `Vite`
- HUD et menus en DOM au-dessus du canvas Phaser
- validation de donnees cote client avec `zod` ou schema equivalent

Raison:
- Phaser est adapte a un RPG 2D en tour par tour
- TypeScript limite les erreurs sur les objets de combat, d'inventaire et de sauvegarde
- Vite simplifie le dev local et le packaging
- le DOM est preferable pour les menus, formulaires, inventaire, equipement et ecran de login

### Back

Choix recommande pour le demarrage:
- `NestJS` ou `Fastify` comme base HTTP
- `Prisma` pour l'acces donnees
- `PostgreSQL` comme base principale
- `Redis` pour sessions, rate limiting et jobs legers
- `S3` compatible pour stocker les sauvegardes exportees, avatars ou assets non runtime

Raison:
- NestJS apporte une structure claire pour auth, modules metier et tests
- Fastify convient si on veut une base plus fine et plus legere
- PostgreSQL est stable pour les relations fortes du RPG
- Redis aide pour la protection anti-bruteforce et les files de travail

### Infra minimale

- reverse proxy `Nginx` ou `Caddy`
- `Docker` + `docker compose` pour le local
- `Sentry` ou equivalent pour les erreurs front et back
- `OpenTelemetry` si on veut tracer les appels plus tard

## 3. Architecture logique

### Decoupage fonctionnel

- `client`:
  - rendu
  - input
  - animations
  - UI
  - prevalidation simple
- `api`:
  - auth
  - sauvegarde
  - inventaire
  - equipement
  - progression
  - combat
  - quetes
- `game engine server`:
  - validation des intentions
  - resolution de combat si serveur autoritaire
  - calcul des recompenses
  - gestion des versions de sauvegarde
- `data layer`:
  - users
  - personnages
  - inventaire
  - equipement
  - save states
  - audit logs

### Principe de confiance

- le client ne decide jamais seul d'un gain d'or, d'un loot, d'un XP ou d'une victoire
- le client envoie des intentions: attaquer, utiliser une competence, equiper un objet, sauvegarder
- le serveur verifie les prerequis puis applique l'effet

## 4. Authentification securisee

### Modele recommande

Pour un jeu web, le plus robuste est un modele hybride:
- `access token` court en memoire ou en cookie bref
- `refresh token` rotatif, stocke en `HttpOnly`, `Secure`, `SameSite`
- session cote serveur associee a un identifiant unique

Alternative acceptable si on veut simplifier:
- cookie de session opaque seul
- rotation cote serveur

### Regles de securite

- hash des mots de passe avec `Argon2id`
- politique de mot de passe minimale raisonnable
- verification email si le projet le justifie
- rotation des refresh tokens
- invalidation de session a la deconnexion
- expiration courte des tokens d'acces
- protection `CSRF` si les tokens passent par cookie
- limitation de debit sur login, refresh et inscription
- journalisation des echecs d'authentification

### Anti-bruteforce

- rate limiting par IP
- rate limiting par compte
- backoff progressif
- blocage temporaire apres N tentatives
- eventuel captcha apres seuil critique
- detection d'anomalies sur l'origine geographique ou la cadence

## 5. Modele de donnees de base

Schema initial recommande:

### `users`

- `id`
- `email`
- `password_hash`
- `status`
- `created_at`
- `updated_at`
- `last_login_at`

### `sessions`

- `id`
- `user_id`
- `refresh_token_hash`
- `expires_at`
- `revoked_at`
- `ip_address`
- `user_agent`

### `profiles`

- `id`
- `user_id`
- `display_name`
- `level`
- `xp`
- `gold`
- `current_zone`
- `story_flags`

### `characters`

- `id`
- `profile_id`
- `name`
- `class_id`
- `level`
- `base_stats`
- `current_hp`
- `current_mp`
- `status_effects`

### `items`

- `id`
- `item_key`
- `type`
- `rarity`
- `stackable`
- `stats_json`

### `inventories`

- `id`
- `profile_id`
- `item_id`
- `quantity`
- `slot_type`

### `equipment`

- `id`
- `character_id`
- `slot`
- `item_id`

### `save_slots`

- `id`
- `profile_id`
- `slot_index`
- `version`
- `snapshot_json`
- `created_at`
- `updated_at`

### `combat_logs`

- `id`
- `profile_id`
- `encounter_id`
- `turn_index`
- `action_json`
- `result_json`
- `created_at`

### `quest_states`

- `id`
- `profile_id`
- `quest_key`
- `state_json`

### `audit_logs`

- `id`
- `actor_user_id`
- `action_type`
- `entity_type`
- `entity_id`
- `payload_json`
- `created_at`

## 6. Endpoints API prioritaires

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Profile et sauvegarde

- `GET /profiles/me`
- `PATCH /profiles/me`
- `GET /saves`
- `GET /saves/:slot`
- `POST /saves/:slot`
- `DELETE /saves/:slot`

### Inventaire et equipement

- `GET /inventory`
- `POST /inventory/use`
- `POST /inventory/move`
- `GET /equipment`
- `POST /equipment/equip`
- `POST /equipment/unequip`

### Combat

- `POST /combat/start`
- `POST /combat/action`
- `POST /combat/end-turn`
- `POST /combat/resolve`
- `GET /combat/:id`

### Progression et monde

- `GET /progression`
- `POST /progression/award-xp`
- `POST /progression/award-loot`
- `GET /quests`
- `POST /quests/update`

### Support

- `GET /health`
- `GET /ready`
- `GET /metrics` si expose en interne

## 7. Strategie de sauvegarde

### Principe

- sauvegarde server-side comme source de verite
- sauvegarde locale optionnelle uniquement comme cache ou resume temporaire
- versionnement de chaque slot

### Format

- snapshot serialise du state jouable
- pas de references directes a des objets renderer
- inclusion de:
  - progression
  - inventaire
  - equipement
  - etat des quetes
  - position dans le monde
  - etat du groupe
  - horodatage

### Politique

- autosave aux points de passage
- autosave apres combat termine
- autosave apres recompense importante
- sauvegarde manuelle via l'UI
- comparaison de version avant ecriture
- conflit resolu par la derniere version acceptee par le serveur ou par merge explicite selon le cas

### Stockage

- ecriture transactionnelle en base
- export periodique vers stockage objet si on veut des backups long terme
- retention definie par politique produit

## 8. Strategie anti-triche

- serveur autoritaire sur les gains, l'XP, le loot et les resultats de combat
- validation de toutes les intentions cote API
- recalcul des formules critiques cote serveur
- conservation d'un seed ou d'un hash de combat si le combat doit etre reproductible
- refus des payloads incoherents
- limitation des appels par minute sur combat, inventaire et save
- detection de sauts de niveau ou de ressources impossibles
- journal d'audit sur les mutations sensibles
- signatures ou nonce anti-replay sur certaines actions si necessaire

Regle pratique:
- le client peut proposer
- le serveur dispose

## 9. Observabilite

### Logs

- logs structures en JSON
- correlation id par requete
- niveau `info`, `warn`, `error`
- masquage des secrets et donnees sensibles

### Metrics

- temps de reponse API
- taux d'erreur
- taux de login refuse
- volume de sauvegardes
- latence de resolution de combat
- usage memoire et CPU

### Tracing

- trace des appels auth -> save -> combat si la charge le justifie
- utile pour diagnostiquer les lenteurs et les boucles de validation

### Alerting

- erreurs 5xx
- echec de sauvegarde
- explosion des tentatives de login
- lenteur persistante sur la resolution de combat

## 10. Tests

### Back

- tests unitaires sur les regles metier
- tests d'integration sur auth, save, inventaire et combat
- tests de validation des schemas d'entree
- tests de securite de base sur les routes sensibles

### Front

- tests unitaires sur les adapters UI et les helpers
- tests d'integration sur les flows de jeu critiques
- tests e2e sur:
  - login
  - chargement d'une sauvegarde
  - equipement d'un objet
  - lancement d'un combat
  - fin de combat

### Non fonctionnel

- test de charge legere sur auth et sauvegarde
- test de regression sur les formules de combat
- test de migration base de donnees

## 11. CI/CD

Pipeline minimal recommande:
- lint
- typecheck
- tests unitaires
- tests d'integration
- build front
- build back
- scan de dependances
- verification des migrations
- build image Docker
- deploiement sur staging
- validation manuelle ou tests automatiques avant prod

Branches:
- `main` pour la prod
- `develop` ou `staging` si on veut un flux preprod

Secrets:
- geres par le systeme de CI ou un coffre dedie

## 12. Deploiement local et production

### Local

- `docker compose` avec:
  - front
  - back
  - PostgreSQL
  - Redis
  - stockage objet local type `MinIO` si besoin
- seed de donnees de dev
- hot reload cote front et back

### Production

- front statique servi via CDN ou reverse proxy
- back derriere reverse proxy
- PostgreSQL manage de preference
- Redis manage si disponible
- backups automatiques de la base
- rotation des secrets
- migrations appliquees de facon controlee

## 13. Decisions a trancher

1. `NestJS` ou `Fastify` pour le back final
2. Session opaque pure ou hybride `access token` + `refresh token`
3. Combat entierement serveur-autoritaire ou hybride avec recalcul partiel
4. Monolithe modulaire au depart ou separation plus nette entre API et moteur de regles
5. Sauvegarde unique par compte ou systeme multi-slots des la V1
6. PvE single-player uniquement ou ajout d'aspects asynchrones plus tard
7. Stockage objet requis des la V1 ou seulement backup admin
8. Niveau de realisme de l'anti-triche selon la nature du jeu

## 14. Questions critiques

1. Le jeu est-il strictement solo, ou y aura-t-il du partage de compte, du cloud sync multi-appareils, voire du social plus tard
2. Faut-il supporter le jeu hors ligne avec re-synchronisation differee
3. Le combat doit-il etre 100 pourcent deterministic pour faciliter les replays et la correction
4. Les classes sont-elles fixes, multi-classes, ou librement modulables via equipement et talents
5. La progression est-elle par personnage unique ou par groupe/royaume
6. Le jeu doit-il avoir plusieurs slots de sauvegarde des le depart
7. Le back doit-il exposer seulement une API JSON ou aussi des websockets plus tard
8. Quelle est la contrainte de budget infra au lancement

## 15. Hypotheses de depart

- le jeu est d'abord un RPG solo ou quasi-solo
- la persistance cloud est obligatoire
- les combats sont tour par tour et lisibles
- l'inventaire et l'equipement ont un poids metier important
- le back doit pouvoir evoluer sans casser les saves
- le client Phaser ne doit jamais etre la source de verite des ressources du joueur
