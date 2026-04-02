# Forge - scène MVP

> **Statut : document canonique actif**
> Ce document définit la mise en scène front canonique de la Forge pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des éléments interactifs, la lisibilité de la progression d’équipement, la présence du Forgeron et la transformation du shop de forge en véritable scène jouable.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la scène de Forge du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont la Forge doit exister côté front dans le MVP.

Il permet de :
- incarner le retour progressif du Forgeron ;
- transformer la progression d’équipement en scène concrète ;
- préciser ce que le joueur doit voir, comprendre et attendre de ce lieu ;
- guider la hiérarchie visuelle entre décor, PNJ, progression et interaction commerciale ;
- éviter que la Forge ne soit qu’un simple écran d’achat d’équipement sans poids dans le monde.

La Forge doit être l’un des lieux où la reconstruction du village se voit le plus clairement.

---

## 2. Fonction de la scène

La scène de Forge remplit 4 fonctions majeures :

### 2.1 Point d’équipement
Le joueur y achète ses armes, armures et accessoires simples.

### 2.2 Point de progression matérielle
La Forge matérialise les tiers d’équipement et leur déblocage.

### 2.3 Symbole de reconstruction
C’est l’un des lieux qui doit le plus montrer la transition entre monde entravé et monde qui reprend vie.

### 2.4 Ancrage du Forgeron
Le lieu doit prolonger la personnalité du Forgeron et sa relation au joueur.

---

## 3. Objectifs front de la scène

La scène de Forge doit permettre au joueur de comprendre immédiatement :

- où se trouve le Forgeron ;
- que ce lieu est lié à l’équipement ;
- qu’il n’est pas pleinement actif au début ;
- que sa progression dépend du monde et des paliers ;
- qu’ici, on transforme les victoires en moyens concrets de mieux affronter la tour.

Le front doit faire ressentir :
- poids ;
- chaleur ;
- tension de travail ;
- progression ;
- utilité retrouvée.

---

## 4. Position de la scène dans le village

Comme le Marché, la Forge peut être :

- soit intégrée directement dans la grande scène de Village ;
- soit ouverte comme sous-scène dédiée depuis la zone de la forge.

Dans les deux cas, la logique canonique est la même :
- le joueur doit sentir qu’il va **chez le Forgeron** ;
- la Forge doit avoir une identité spatiale propre ;
- le lieu doit être lisible avant même l’ouverture de l’interface de shop.

---

## 5. Composition spatiale recommandée

La scène de Forge du MVP doit rester compacte, lisible et très marquée.

## 5.1 Zones minimales à afficher

### A. Le Forgeron
Fonction :
- porte d’entrée de toutes les interactions ;
- ancrage humain et symbolique du lieu.

### B. L’enclume / zone de travail principale
Fonction :
- cœur visuel de la forge ;
- signe immédiat du métier.

### C. Le feu / la chaleur de travail
Fonction :
- lecture de l’activité ou de son absence ;
- symbole du retour progressif du lieu à la vie.

### D. Zone de stockage ou présentoir simple
Fonction :
- suggérer les armes, pièces, matériaux ou commandes ;
- matérialiser le catalogue sans tout afficher littéralement.

### E. Zone d’approche / interaction
Fonction :
- espace où le joueur se place pour parler ou ouvrir le shop.

---

## 5.2 Organisation visuelle recommandée

Disposition recommandée en top-down :

- **Forgeron** dans une position immédiatement lisible ;
- **enclume / établi principal** comme élément dominant ;
- **source de chaleur** clairement identifiable ;
- **présentoir / rack / stockage** en appui secondaire ;
- **zone d’approche du joueur** très claire ;
- décor limité mais lourd, pour éviter le vide sans noyer l’interaction.

Le joueur doit lire presque instantanément :
**ici, on fabrique, répare et prépare le combat.**

---

## 6. Hiérarchie visuelle des éléments interactifs

Les éléments de la scène doivent être hiérarchisés ainsi :

### Priorité 1 — Le Forgeron
Le joueur doit tout de suite voir qui tient ce lieu.

### Priorité 2 — L’enclume / cœur de la forge
Le métier doit être lisible immédiatement.

### Priorité 3 — Le feu / activité de la forge
La progression du lieu doit pouvoir passer visuellement par là.

### Priorité 4 — Présentoirs / matériaux / racks
Ils renforcent la crédibilité du lieu sans voler la lecture principale.

### Priorité 5 — Décor de fond
Présent pour la matière du lieu, mais jamais au détriment de la clarté.

---

## 7. Le Forgeron dans la scène

## 7.1 Fonction front
Le Forgeron est la porte d’entrée du système d’équipement.

Il doit être immédiatement perçu comme :
- plus rude ;
- plus lourd ;
- plus fermé au début que la Marchande ;
- mais profondément central dans la progression.

## 7.2 Lecture attendue
Le joueur doit sentir :
- que ce lieu devrait être important ;
- qu’il ne fonctionne pas pleinement au début ;
- que sa progression peut le réactiver.

## 7.3 Interaction recommandée
Interaction principale :
- `Parler`
- puis ouverture du panneau de forge

Sous-interactions :
- `Voir l’équipement`
- `Voir les nouveautés`
- éventuellement `Pièces verrouillées` ou `Pas encore disponible` selon état

---

## 8. L’enclume / cœur de la forge

## 8.1 Fonction front
L’enclume ou zone de travail principale doit être le repère visuel le plus fort après le Forgeron.

Elle doit faire comprendre sans texte :
- que l’on est dans un atelier ;
- que le lieu traite de métal, d’armes, de pièces ;
- que l’activité dépend d’un savoir-faire actuellement entravé puis retrouvé.

## 8.2 Éléments visuels recommandés
- enclume
- établi lourd
- marteau
- outils
- métal ou pièces visibles
- traces d’usage

## 8.3 Règle visuelle
Le lieu ne doit pas ressembler à une simple déco fantasy.
Il doit ressembler à un **atelier de travail**, ancré dans le monde du village.

---

## 9. Le feu / la chaleur de travail

## 9.1 Fonction front
La chaleur de la Forge est l’un des meilleurs leviers visuels de progression.

### Au début
- feu faible, absent ou peu impressionnant ;
- sensation de lieu sous-activé.

### Ensuite
- chaleur plus visible ;
- activité plus affirmée ;
- sensation que le métier “revient”.

## 9.2 Rôle émotionnel
Le joueur doit ressentir que :
**quand la forge chauffe à nouveau, quelque chose du village se remet vraiment à battre.**

---

## 10. Présentoirs / stockage

## 10.1 Fonction front
Le présentoir ou stockage doit suggérer :
- armes ;
- pièces d’armure ;
- matériaux ;
- travail en cours.

## 10.2 Règle de mise en scène
Le décor ne doit pas essayer de montrer tout le catalogue.
Il doit seulement donner la sensation :
- qu’il existe des pièces ;
- qu’il y a du travail ;
- que la forge n’est pas un simple menu flottant.

## 10.3 Éléments visuels possibles
- rack à armes
- morceau d’armure suspendu
- caisse de matériaux
- établi secondaire
- pièces semi-finies

---

## 11. Interactions commerciales canoniques

La Forge doit permettre les interactions suivantes :

### 11.1 Acheter des armes
Exemples :
- `iron_sword_basic`
- `steel_sword_advanced`
- `ash_dagger_light`
- `warden_hammer`
- `tower_guard_shield`

### 11.2 Acheter des armures
Exemples :
- `reinforced_leather_chest`
- `guard_chestplate`
- `guard_helm_basic`
- `guard_legplates`
- `field_boots`
- `ironbound_boots`
- `work_gloves`
- `guard_gauntlets`

### 11.3 Acheter certains accessoires simples
Exemples :
- `vigor_ring`
- `guard_ring`
- `focus_amulet`
- `vigor_amulet`

Ces interactions doivent rester très lisibles et clairement hiérarchisées.

---

## 12. Progression visuelle de la Forge

La Forge doit évoluer plus visiblement que le Marché.

### État 1 — Forge entravée
- lieu identifiable mais ralenti ;
- feu faible ;
- peu d’objets visibles ;
- impression de potentiel bloqué.

### État 2 — Réouverture partielle
- activité plus crédible ;
- premier vrai catalogue ;
- sensation de retour timide du métier.

### État 3 — Forge relancée
- feu plus fort ;
- plus de pièces ou de racks visibles ;
- lieu plus habité et plus assumé.

### État 4 — Forge affirmée
- sentiment de plein usage dans le cadre MVP ;
- présence forte ;
- vraie lecture de lieu redevenu utile.

Le MVP n’a pas besoin d’énormes changements, mais la progression doit être perceptible.

---

## 13. Règles UX du shop de forge

La Forge est moins fréquentée que le Marché, mais ses interactions ont plus de poids.

Le joueur doit voir facilement :
- les catégories d’équipement ;
- les objets verrouillés / débloqués ;
- les comparaisons avec l’équipement actuel ;
- les nouveautés liées à la progression ;
- les éventuels prérequis ou raretés.

### Priorités UX
- comparaison simple ;
- tri clair par type ;
- nouvelle pièce bien mise en valeur ;
- progression par tiers lisible.

Le shop doit faire sentir la montée en qualité, pas la complexité.

---

## 14. Ambiance visuelle et émotionnelle

La scène de Forge doit évoquer :

- travail ;
- effort ;
- chaleur ;
- poids ;
- reconstruction concrète ;
- fierté blessée qui revient.

Le joueur doit ressentir ici un contraste avec :
- le Marché, plus quotidien et ouvert ;
- la Ferme, plus personnelle et douce ;
- la Tour, plus hostile et oppressante.

La Forge est l’espace du :
**“ce que j’ai gagné peut devenir une vraie capacité à mieux lui résister.”**

---

## 15. Informations à faire passer directement par la scène

La scène doit communiquer visuellement :
- si la forge est encore limitée ;
- si le Forgeron reprend ses moyens ;
- si le lieu est plus ou moins actif ;
- que l’équipement vient d’un vrai lieu, d’un vrai métier, d’un vrai retour de fonction.

Le joueur ne doit pas avoir besoin de lire un texte explicatif pour ressentir que la Forge change.

---

## 16. Informations UI complémentaires recommandées

Le panneau de forge peut afficher :

- nom du Forgeron
- catégories (`Armes`, `Armures`, `Accessoires`)
- tiers ou lecture implicite du niveau de progression
- objets possédés / équipés
- comparaisons simples
- nouveautés débloquées
- éventuels prérequis légers

Mais comme toujours, l’UI doit prolonger le lieu, pas s’y substituer.

---

## 17. Contraintes UX

La scène doit respecter les règles suivantes :

- lisibilité immédiate ;
- une interaction centrale claire ;
- lecture forte de la progression ;
- peu d’ambiguïté entre décor et zone utile ;
- pas de surcharge visuelle qui masquerait le poids du lieu.

Le joueur doit entrer, comprendre, ressentir le lieu, puis agir sans friction inutile.

---

## 18. Contraintes techniques / front

Cette scène doit être compatible avec :
- navigation clavier / manette / souris ;
- focus clair du Forgeron ou du point d’interaction ;
- états visuels simples selon progression ;
- réutilisation des systèmes de shop et d’équipement existants ;
- intégration progressive sans refonte totale du pipeline actuel.

Elle doit pouvoir être mise en place comme une amélioration front très rentable du système déjà présent.

---

## 19. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/village-scene-mvp.md`
- `docs/08-gameplay-content/shops-mvp.md`
- `docs/02-personnages/forgeron.md`
- `docs/05-equipements/progression-equipement-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 20. Priorités de production recommandées

Après cette scène, les scènes les plus logiques à produire sont :

1. `entree-tour-scene-mvp.md`
2. `tour-combat-scene-mvp.md`
3. `retour-village-scene-mvp.md`

---

## 21. Résumé exécutif

La scène de Forge du MVP doit transformer la progression matérielle du jeu en un lieu lourd, lisible et symboliquement fort.

Elle doit contenir au minimum :
- le Forgeron,
- une enclume ou cœur de travail identifiable,
- une source de chaleur lisible,
- quelques signes matériels du métier,
- une interaction claire de shop d’équipement.

Son rôle central est simple :
**faire ressentir au joueur que ses victoires ne servent pas seulement à survivre, mais aussi à redonner au village la capacité de le préparer réellement au combat.**
