# Brief Codex — Remplacement de la scène Ferme par la map Tiled

## Fichier source
Utiliser ce fichier comme source de vérité de la scène :

- `docs/01-univers/farm.tmj`

## Objectif
Remplacer l’ancienne scène **Ferme** par la nouvelle map exportée depuis **Tiled**, en intégrant correctement :

- les layers visuels
- les collisions
- les spawns
- les transitions
- les interactables
- les farm plots
- les harvestables

La map Tiled doit devenir la **source de vérité** de la scène ferme.

---

## Consignes générales

- Ne pas reconstruire la scène à la main si l’information existe déjà dans le `.tmj`
- Séparer clairement :
  - le rendu visuel
  - la logique gameplay
- Prévoir une intégration réutilisable pour d’autres maps Tiled
- Adapter la scène ferme existante sans casser le reste du projet

---

## Structure à lire dans la map

### Groupes racine principaux
La map contient notamment :

- `Terrain`
- `Decor_Below`
- `Architecture`
- `Gameplay`

Respecter autant que possible l’ordre de rendu de Tiled.

### Dans `Gameplay`, prendre en charge
- `Collisions`
- `PlayerSpawn`
- `SceneTransitions`
- `Interactables`
- `NpcSpawns`
- `Triggers`
- `FarmPlots`
- `Harvestables_Grass`
- `Harvestables_Fiber`
- `Harvestables_Stone`
- `Harvestables_Tree`

---

## Règles d’interprétation

### 1. Player spawns
Dans `PlayerSpawn`, lire les objets nommés, notamment :

- `spawn_default`
- `spawn_from_village`
- `spawn_house_exit`

La scène doit accepter un spawn transmis au chargement, par exemple :

- `create(data?: { spawnId?: string })`

Règle :
- si `spawnId` est fourni et trouvé, utiliser ce spawn
- sinon fallback sur `spawn_default`

---

### 2. Scene transitions
Dans `SceneTransitions`, lire les objets avec :

- `name`
- `targetScene`
- `targetSpawn`

Exemple attendu :
- `to_village_east`
- `targetScene = village`
- `targetSpawn = ...`

Comportement :
- quand le joueur entre dans la zone, changer de scène
- transmettre `spawnId = targetSpawn`

Important :
- les portes de bâtiments ne doivent pas être gérées ici
- les transitions servent surtout aux sorties de zone ouvertes

---

### 3. Interactables
Dans `Interactables`, lire les objets avec :

- `name`
- `interactionType`
- `targetScene`
- `targetSpawn`

Exemple important :
- `door_farm_house`
- `interactionType = door`
- `targetScene = farm_house`
- `targetSpawn = spawn_from_farm`

Comportement attendu :
- si le joueur est dans la zone d’interaction
- et déclenche l’action d’interagir
- alors changement de scène vers `targetScene`
- avec `spawnId = targetSpawn`

Prévoir une logique générique d’interaction, pas codée uniquement pour cette porte.

---

### 4. Collisions
Dans `Collisions`, utiliser les objets Tiled comme colliders monde.

Règle simple :
- tout objet de ce layer bloque le joueur

Prévoir la lecture :
- des rectangles
- et si possible des polygones

Si le parsing des polygones est plus complexe, laisser le code compatible rectangles + polygones autant que possible.

---

### 5. FarmPlots
Le layer `FarmPlots` dans `Gameplay` est un **layer logique invisible**.

Il ne sert pas au rendu.
Il sert à définir quelles cases sont cultivables.

Règle :
- toute tile non vide de `FarmPlots` = case farmable

Propriétés de layer à exploiter :
- `farmable = true`
- `gridBased = true`
- `supportsSeeds = true`
- `supportsWatering = true`
- `toolType = hoe`

À faire :
- parser ce layer
- construire une structure de données des cases cultivables
- permettre de tester si une coordonnée monde / tile est cultivable
- préparer le branchement pour :
  - bêcher
  - arroser
  - planter
  - récolter

Le layer doit rester invisible à l’écran.

---

### 6. Harvestables
Les groupes suivants représentent des ressources harvestables en tile layers :

- `Harvestables_Grass`
- `Harvestables_Fiber`
- `Harvestables_Stone`
- `Harvestables_Tree`

Chaque groupe porte des propriétés gameplay au niveau parent, par exemple :
- `harvestable = true`
- `resourceType = hay / fiber / stone / wood`
- `toolType = scythe / pickaxe / axe`

Règle :
- toute tile non vide dans les tile layers enfants = ressource harvestable

À faire :
- parser les groupes `Harvestables_*`
- parcourir leurs tile layers enfants
- créer une structure de données runtime pour chaque tile non vide
- associer à chaque node :
  - sa position
  - son `resourceType`
  - son `toolType`
  - son groupe source

Pas besoin d’implémenter tout le gameplay de récolte si le système n’est pas encore totalement branché, mais :
- les données doivent être extraites proprement
- il faut laisser une base exploitable immédiatement

---

## Rendu / affichage

- Les layers visuels doivent être rendus depuis la map Tiled
- `FarmPlots` doit rester invisible
- Les groups `Harvestables_*` restent visibles, car ils représentent de vraies tuiles gameplay
- Respecter l’ordre de rendu défini dans la map

---

## Architecture attendue
Créer une intégration propre, par exemple avec des helpers ou services du style :

- `loadTiledMap(...)`
- `resolveSpawnPoint(...)`
- `buildSceneTransitions(...)`
- `buildInteractables(...)`
- `buildCollisionShapes(...)`
- `extractFarmPlots(...)`
- `extractHarvestableTiles(...)`

Éviter de mettre toute la logique dans une seule scène monolithique.

---

## Attendus minimums

1. La nouvelle scène ferme charge bien depuis le `.tmj`
2. Le joueur apparaît sur `spawn_default`
3. Les collisions bloquent bien le joueur
4. La transition `to_village_east` fonctionne
5. L’interactable `door_farm_house` fonctionne
6. Les `FarmPlots` sont correctement détectés comme cases cultivables
7. Les `Harvestables_*` sont correctement parsés comme ressources gameplay

---

## Contraintes importantes

- Ne pas casser le reste du projet
- Préférer adaptation de la scène ferme existante plutôt qu’un refactor global massif
- Garder un code lisible, modulaire et réutilisable
- Si un point n’est pas entièrement branchable immédiatement, laisser un fallback propre et explicite

---

## Bonus utile
Si possible, ajouter un mode debug temporaire activable sur la scène ferme pour afficher :

- bounds des collisions
- zones de transitions
- interactables
- farm plots
- harvestables parsés

Cela facilitera énormément la validation.

---

## Résumé d’intention
Cette map Tiled doit remplacer la scène ferme actuelle et devenir la base standard de chargement des futures scènes similaires.

La logique à respecter est :

- Tiled = source de vérité de la scène
- Phaser = interprétation runtime
- rendu et gameplay séparés proprement
