# Ordre de production front MVP

> **Statut : document canonique actif**
> Ce document définit l’ordre canonique recommandé de production du front MVP.
> Il sert de référence active pour l’organisation du travail front, la priorisation des écrans, l’intégration progressive des systèmes existants et la transformation du prototype technique en expérience de jeu visuelle cohérente.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la priorisation de la production front du MVP.

---

## 1. Rôle du document

Ce document fixe l’ordre recommandé de développement du front pour le MVP.

Il permet de :
- donner une feuille de route claire à Codex ;
- éviter de produire les écrans dans le désordre ;
- relier la documentation de contenu à un plan d’implémentation concret ;
- prioriser ce qui apporte le plus de valeur visuelle le plus tôt possible ;
- réduire le risque de rester avec un front encore trop “HUD technique”.

Le but n’est pas de tout faire d’un coup.
Le but est de construire le front **par couches utiles**, en gardant un jeu jouable à chaque étape.

---

## 2. Principe général de production

La production front du MVP doit suivre cette logique :

### 2.1 D’abord les lieux-piliers
Créer les écrans qui incarnent la boucle centrale :
- Ferme
- Village
- Combat

### 2.2 Ensuite les interfaces de support
Ajouter les écrans et panneaux qui rendent le jeu lisible :
- shop
- personnage / équipement
- journal de quêtes

### 2.3 Ensuite les transitions et le polish structurant
Renforcer :
- retours de palier
- feedbacks
- progression visible du monde

### 2.4 Enfin les raffinements
Ajouter ce qui enrichit sans remettre en cause la structure.

---

## 3. Objectif global de la phase front MVP

À la fin de cette phase, le jeu doit donner l’impression :

- d’un vrai lieu agricole jouable ;
- d’un vrai hub villageois vivant ;
- d’une vraie scène de combat en tour ;
- d’une progression compréhensible ;
- d’une boucle cohérente entre produire, échanger, s’équiper et combattre.

Le MVP front n’a pas besoin d’être luxueux.
Il doit être **clair, stable, incarné et agréable à lire**.

---

## 4. Grandes phases recommandées

Le front MVP peut être produit en **6 grandes phases** :

1. **Fondations visuelles jouables**
2. **Boucle économique et progression**
3. **Combat lisible et structuré**
4. **Lecture du héros et de la progression**
5. **Retours monde et transitions**
6. **Polish MVP**

---

## 5. Phase 1 — Fondations visuelles jouables

### Objectif
Faire exister les trois grands pôles du jeu dans des écrans lisibles :
- Ferme
- Village
- Tour / accès au combat

### Priorité absolue
C’est la phase la plus rentable.
Elle transforme le prototype d’API et de systèmes en premier vrai jeu visuel.

### Éléments à produire
1. `front-scenes/ferme-scene-mvp.md`
2. `front-scenes/village-scene-mvp.md`
3. `front-scenes/entree-tour-scene-mvp.md`
4. `front-wireframes/ecran-ferme-mvp.md`
5. `front-wireframes/ecran-village-mvp.md`

### Résultat attendu
Le joueur peut :
- voir la ferme comme un vrai lieu ;
- circuler ou naviguer dans le village ;
- sentir la Tour comme objectif et menace.

### Critère de validation
Même sans tout le polish ni tous les shops finaux, la boucle spatiale doit déjà être compréhensible.

---

## 6. Phase 2 — Boucle économique et progression

### Objectif
Rendre jouables les interactions économiques et matérielles.

### Éléments à produire
1. `front-scenes/marche-scene-mvp.md`
2. `front-scenes/forge-scene-mvp.md`
3. `ui/panneau-shop-mvp.md`
4. `front-wireframes/ecran-shop-mvp.md`

### Priorités fonctionnelles
- achat de graines
- vente des récoltes
- lecture claire du marché
- lecture claire de la forge
- premiers déblocages visibles

### Résultat attendu
Le joueur peut :
- acheter, vendre, s’équiper ;
- comprendre que la progression du village modifie ses options ;
- ressentir la différence entre Marché et Forge.

### Critère de validation
Les shops doivent être rapides, lisibles et cohérents avec leur lieu.

---

## 7. Phase 3 — Combat lisible et structuré

### Objectif
Transformer le combat en vrai écran de confrontation clair et agréable.

### Éléments à produire
1. `front-scenes/tour-combat-scene-mvp.md`
2. `ui/hud-combat-mvp.md`
3. `front-wireframes/ecran-combat-mvp.md`

### Priorités fonctionnelles
- bloc héros lisible
- bloc ennemi lisible
- actions disponibles claires
- sous-panneaux compétences / objets
- feedbacks combat
- différenciation combat normal / boss

### Résultat attendu
Le joueur peut :
- lire rapidement un combat ;
- comprendre ce qui le menace ;
- agir sans se battre contre l’interface.

### Critère de validation
La difficulté du combat doit venir du système de jeu, pas du manque de lisibilité.

---

## 8. Phase 4 — Lecture du héros et de la progression

### Objectif
Rendre visibles :
- le build ;
- l’équipement ;
- la progression narrative ;
- les objectifs actifs.

### Éléments à produire
1. `ui/fiche-personnage-equipement-mvp.md`
2. `front-wireframes/ecran-personnage-equipement-mvp.md`
3. `ui/journal-quetes-mvp.md`
4. `front-wireframes/ecran-journal-quetes-mvp.md`

### Priorités fonctionnelles
- stats principales
- slots lisibles
- détail des objets
- comparaison claire
- quête principale visible
- objectifs concrets lisibles

### Résultat attendu
Le joueur peut :
- comprendre son héros ;
- orienter son build ;
- savoir quoi faire ensuite.

### Critère de validation
Le jeu doit devenir lisible sans avoir besoin de mémoire externe ou de docs.

---

## 9. Phase 5 — Retours monde et transitions

### Objectif
Donner du poids à la progression dans la Tour et rendre visibles ses conséquences.

### Éléments à produire
1. `front-scenes/retour-village-scene-mvp.md`
2. `ui/ecran-transition-palier-mvp.md`

### Priorités fonctionnelles
- victoire de palier marquée
- récompenses hiérarchisées
- déblocages visibles
- retour au village lisible
- variations des PNJ / lieux / shops

### Résultat attendu
Le joueur ressent :
- qu’il a franchi un cap ;
- que le monde a changé ;
- que le retour au village a du sens.

### Critère de validation
Un palier important ne doit jamais ressembler à un simple incrément chiffré.

---

## 10. Phase 6 — Polish MVP

### Objectif
Renforcer l’identité visuelle et la fluidité sans casser la structure acquise.

### Axes de polish recommandés
- transitions légères entre lieux
- feedbacks plus propres
- badges `Nouveau`, `À rendre`, `Shop amélioré`
- petits états visuels de progression du village
- hiérarchie plus nette sur les boss
- micro-améliorations d’ergonomie

### Règle importante
Le polish vient **après** la lisibilité.
Il ne doit jamais retarder une fonctionnalité fondamentale déjà documentée.

---

## 11. Ordre d’implémentation détaillé recommandé

Ordre concret conseillé pour Codex :

### Lot 1
- Écran Ferme
- HUD Ferme
- parcelles visibles
- repos
- sortie Village

### Lot 2
- Écran Village
- ciblage des PNJ / lieux
- zones Marché / Forge / Maire / sorties

### Lot 3
- Marché
- écran shop version Marché
- achat / vente fonctionnels

### Lot 4
- Forge
- écran shop version Forge
- comparaison d’équipement simple

### Lot 5
- Écran Combat
- HUD Combat
- actions de base
- feedbacks essentiels

### Lot 6
- écran personnage / équipement
- stats
- slots
- détail équipement

### Lot 7
- journal de quêtes
- catégories
- liste
- détail

### Lot 8
- écran transition palier
- retour village enrichi
- progression visible des shops / PNJ

Cet ordre permet de garder le projet jouable à chaque étape.

---

## 12. Règle de priorisation absolue

Quand un arbitrage est nécessaire, l’ordre de priorité recommandé est :

1. **Lisibilité**
2. **Jouabilité**
3. **Cohérence avec le monde**
4. **Feedbacks**
5. **Polish visuel**

Autrement dit :
- un écran simple mais clair vaut mieux qu’un écran joli mais confus ;
- un shop sobre mais rapide vaut mieux qu’un shop spectaculaire mais lent ;
- un combat lisible vaut mieux qu’un combat “cinématique” mal hiérarchisé.

---

## 13. Dépendances principales entre docs

### La Ferme dépend surtout de
- `lieux-mvp.md`
- `graines-et-recoltes.md`
- `consommables.md`
- `recettes-index.md`
- `hud-ferme-mvp.md`

### Le Village dépend surtout de
- `lieux-mvp.md`
- `pnj-mvp-index.md`
- `shops-mvp.md`
- `village-scene-mvp.md`

### Les Shops dépendent surtout de
- `shops-mvp.md`
- `items-index.md`
- `equipements-index.md`
- `progression-equipement-mvp.md`
- `panneau-shop-mvp.md`

### Le Combat dépend surtout de
- `floors-1-10.md`
- `bestiaire-mvp-index.md`
- les fiches monstres
- `hud-combat-mvp.md`
- `tour-combat-scene-mvp.md`

### Le personnage / équipement dépend surtout de
- `equipements-index.md`
- `armes.md`
- `armures.md`
- `accessoires.md`
- `progression-equipement-mvp.md`

### Le journal dépend surtout de
- `quetes-mvp-index.md`
- `objets-cles.md`
- `floors-1-10.md`

---

## 14. Définition du “done” pour le front MVP

Le front MVP peut être considéré comme structurellement réussi si :

- la boucle **Ferme → Village → Tour → Retour Village** est lisible et jouable ;
- les shops sont fonctionnels et différenciés ;
- le combat est compréhensible et hiérarchisé ;
- le joueur comprend son build et ses objectifs ;
- les paliers importants ont un vrai payoff visuel et systémique ;
- le jeu ne donne plus l’impression d’être une API testée via des panneaux HUD.

C’est cette bascule qui compte le plus.

---

## 15. Ce qu’il faut éviter absolument

### 15.1 Faire trop de polish trop tôt
Le risque est de perdre du temps sur des détails alors que la structure n’est pas encore solide.

### 15.2 Implémenter les écrans dans le désordre
Exemple :
- faire le journal ultra propre avant le village vivant ;
- faire l’écran équipement avant la forge et les shops ;
- faire des transitions de boss avant un HUD combat clair.

### 15.3 Réinventer chaque écran
Le projet doit garder une cohérence de composants et de logique.

### 15.4 Faire du “front joli” sans boucle jouable
Le MVP doit d’abord être incarné et clair.

---

## 16. Recommandation directe à donner à Codex

La consigne stratégique la plus saine est la suivante :

> Construire le front par couches jouables.
> Commencer par les écrans qui incarnent la boucle centrale.
> Prioriser la lisibilité et la scène sur le polish.
> Réutiliser les composants et garder une cohérence forte entre lieux, shops, combat et progression.

Et surtout :

> Ne pas chercher à finaliser visuellement un écran tant que la structure de la boucle suivante n’est pas déjà en place.

---

## 17. Résumé exécutif

L’ordre de production front MVP recommandé est :

1. Ferme
2. Village
3. Marché / Forge / Shops
4. Combat
5. Personnage / équipement
6. Journal de quêtes
7. Transitions de palier et retour village
8. Polish MVP

Cette progression suit la boucle réelle du joueur et maximise la valeur produite le plus tôt possible.

Le rôle central de ce document est simple :
**faire en sorte que Codex construise d’abord un vrai jeu lisible et incarné, puis seulement ensuite un front plus raffiné.**
