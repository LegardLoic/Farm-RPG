# Marché - scène MVP

> **Statut : document canonique actif**
> Ce document définit la mise en scène front canonique du Marché pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des éléments interactifs, la lisibilité des échanges économiques, la présence de la Marchande et la transformation du shop agricole en véritable scène jouable.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la scène de Marché du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont le Marché doit exister côté front dans le MVP.

Il permet de :
- incarner la boucle économique ferme ↔ village ;
- préciser ce que le joueur doit voir, comprendre et utiliser ;
- organiser la présence de la Marchande dans un espace crédible ;
- guider la hiérarchie visuelle entre décor, PNJ et interaction commerciale ;
- éviter que l’achat de graines et la vente de récoltes restent de simples panneaux abstraits.

Le Marché doit être le premier endroit où le joueur ressent que son travail agricole circule réellement dans le monde.

---

## 2. Fonction de la scène

La scène de Marché remplit 4 fonctions majeures :

### 2.1 Point de vente
Le joueur y vend ses récoltes.

### 2.2 Point d’achat
Le joueur y achète ses graines.

### 2.3 Ancrage humain de l’économie
La Marchande transforme l’échange économique en interaction de monde.

### 2.4 Indicateur de reprise du village
Le Marché doit montrer subtilement que l’activité locale reprend avec la progression.

---

## 3. Objectifs front de la scène

La scène de Marché doit permettre au joueur de comprendre immédiatement :

- où se trouve la Marchande ;
- où acheter des graines ;
- où vendre ses récoltes ;
- que cet espace sert à l’économie quotidienne ;
- que le Marché est modeste mais vivant ;
- que sa progression agricole a une utilité concrète ici.

Le front doit faire ressentir :
- clarté ;
- proximité ;
- quotidien ;
- utilité immédiate.

---

## 4. Position de la scène dans le village

Le Marché n’est pas une scène totalement séparée du Village sur le plan fictionnel.
C’est une **zone spécialisée du hub village**.

Selon les choix front, il peut exister :
- soit comme une zone intégrée directement dans la scène de Village ;
- soit comme une sous-scène dédiée ouverte depuis la zone du Marché.

Dans les deux cas, la logique canonique reste la même :
- le Marché doit être spatialement identifiable ;
- le joueur doit sentir qu’il se rend “chez la Marchande”, pas dans un menu générique.

---

## 5. Composition spatiale recommandée

La scène de Marché du MVP doit rester petite, lisible et orientée service.

## 5.1 Zones minimales à afficher

### A. L’étal principal
Fonction :
- cœur visuel du Marché ;
- ancrage de la Marchande ;
- point d’entrée commercial.

### B. Zone de stockage visible
Fonction :
- suggérer les graines, paniers, sacs, cagettes ;
- donner une matérialité au commerce.

### C. Zone de transaction
Fonction :
- espace où le joueur s’approche pour interagir ;
- lecture claire du point d’échange.

### D. Bordure de marché / décor léger
Fonction :
- situer le commerce dans le village ;
- éviter l’effet “shop flottant”.

---

## 5.2 Organisation visuelle recommandée

Disposition recommandée en top-down :

- **étal principal** comme élément dominant ;
- **Marchande** placée de manière immédiatement lisible derrière ou à côté de l’étal ;
- **stockage visible** autour, sans saturer l’espace ;
- **zone d’approche du joueur** très claire ;
- décor villageois léger autour pour garder l’ancrage spatial.

Le joueur doit lire d’un seul regard :
**ici, c’est le lieu du commerce agricole.**

---

## 6. Hiérarchie visuelle des éléments interactifs

Les éléments de la scène doivent être hiérarchisés ainsi :

### Priorité 1 — La Marchande
Le joueur doit l’identifier immédiatement.

### Priorité 2 — L’étal
Le point de service doit être évident.

### Priorité 3 — Produits visibles / sacs / paniers
Ils donnent la crédibilité au lieu.

### Priorité 4 — Décor de fond
Présent pour l’immersion, mais secondaire.

---

## 7. La Marchande dans la scène

## 7.1 Fonction front
La Marchande est la porte d’entrée de toutes les interactions du Marché.

Elle doit être immédiatement lisible comme :
- accessible ;
- utile ;
- plus chaleureuse que les autres services du village.

## 7.2 Lecture attendue
Le joueur doit sentir :
- une présence vivante ;
- un commerce tenu malgré la difficulté ;
- un lien direct entre elle, les graines et les récoltes.

## 7.3 Interaction recommandée
Interaction principale :
- `Parler`
- puis ouverture d’un panneau commercial clair

Sous-interactions :
- `Acheter des graines`
- `Vendre les récoltes`

---

## 8. L’étal principal

## 8.1 Fonction front
L’étal sert de repère visuel principal.

Il doit faire comprendre sans texte :
- que c’est un commerce ;
- qu’il traite des produits du quotidien ;
- qu’il est modeste mais utile.

## 8.2 Éléments visuels recommandés
L’étal peut contenir :
- paniers ;
- sacs ;
- cagettes ;
- graines ou produits visibles ;
- tissu simple ;
- petit auvent léger si nécessaire.

## 8.3 Règle visuelle
L’étal ne doit pas sembler vide, mais il ne doit pas non plus paraître abondant comme un grand marché prospère.
Au début du MVP, il doit évoquer :
- peu de moyens ;
- organisation correcte ;
- activité réduite mais réelle.

---

## 9. Catalogue visible dans la scène

Le joueur n’a pas besoin de voir chaque objet en grand détail dans le décor, mais la scène doit suggérer visuellement la nature du commerce.

Lecture souhaitée :
- graines disponibles ;
- produits agricoles ;
- petits contenants de stockage ;
- logique de ravitaillement simple.

Le but n’est pas de tout représenter littéralement, mais de donner assez d’indices pour que l’espace raconte :
**ici, on fait circuler ce qui pousse encore.**

---

## 10. Interactions commerciales canonique

La scène de Marché doit permettre deux grandes interactions :

### 10.1 Acheter
Le joueur peut acheter :
- `turnip_seed`
- `carrot_seed`
- `wheat_seed`
selon progression.

### 10.2 Vendre
Le joueur peut vendre :
- `turnip`
- `carrot`
- `wheat`

Ces deux actions doivent être très lisibles et séparées clairement dans l’interface.

---

## 11. Règles UX des transactions

Le Marché doit être extrêmement simple à comprendre.

Le joueur doit voir facilement :
- ce qu’il peut acheter ;
- ce qu’il possède déjà ;
- ce qu’il peut vendre ;
- la valeur de ses récoltes ;
- si de nouvelles graines se sont débloquées.

### Priorités UX
- pas de surcharge ;
- tri naturel par catégorie ;
- lecture immédiate des quantités ;
- distinction claire entre achat et vente.

Le Marché est un lieu de fréquence élevée.
Il doit donc être rapide, confortable et évident.

---

## 12. Ambiance visuelle et émotionnelle

La scène de Marché doit évoquer :

- quotidien ;
- débrouille ;
- proximité ;
- stabilité fragile ;
- petit souffle de normalité.

Le joueur doit ressentir ici un contraste avec :
- la Forge, plus lourde et plus symbolique ;
- la Tour, plus menaçante ;
- la Ferme, plus personnelle.

Le Marché est l’espace du :
**“ce que je cultive trouve ici une place dans la vie du village.”**

---

## 13. Évolution visuelle attendue

Le Marché doit pouvoir évoluer subtilement avec la progression.

Évolutions possibles :
- étal un peu plus fourni ;
- plus d’ordre visuel ;
- plus d’assurance dans la présentation ;
- présence plus vivante de la Marchande ;
- ambiance moins “survie minimale”.

Le MVP n’a pas besoin de grandes métamorphoses, mais il a besoin de signes lisibles de reprise.

---

## 14. Informations à faire passer directement par la scène

La scène doit communiquer visuellement :
- que le commerce existe déjà ;
- qu’il reste limité au début ;
- qu’il peut reprendre de la vigueur ;
- que la ferme du joueur a un débouché concret ;
- que la Marchande tient ce lieu presque à bout de bras au départ.

Ces informations doivent être ressenties même avant lecture détaillée des dialogues.

---

## 15. Informations UI complémentaires recommandées

Un panneau shop léger ou une interface contextuelle peut afficher :

- nom de la Marchande
- onglet `Acheter`
- onglet `Vendre`
- graines disponibles
- récoltes revendables
- quantité possédée
- prix d’achat / vente
- éventuels nouveaux déblocages

Mais l’UI doit rester au service de la scène.
Le joueur doit sentir qu’il échange avec un lieu et un PNJ, pas avec une feuille de calcul.

---

## 16. Contraintes UX

La scène doit respecter les règles suivantes :

- lisibilité immédiate ;
- interaction simple ;
- séparation claire achat / vente ;
- peu de clics pour une action fréquente ;
- pas de décor perturbant la lecture.

Le Marché est une scène de routine.
Sa grande qualité doit être la fluidité.

---

## 17. Contraintes techniques / front

Cette scène doit être compatible avec :
- navigation clavier / manette / souris ;
- focus clair du PNJ ou du point de transaction ;
- réutilisation des systèmes existants de shop ;
- évolution visuelle légère selon progression ;
- ajout ultérieur facile de petits contenus ou quêtes liées.

Elle doit être conçue comme un premier pas simple et très rentable vers un front plus incarné.

---

## 18. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/village-scene-mvp.md`
- `docs/08-gameplay-content/shops-mvp.md`
- `docs/02-personnages/marchande.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/00-projet/canon-mvp.md`

---

## 19. Priorités de production recommandées

Après cette scène, les scènes les plus logiques à produire sont :

1. `forge-scene-mvp.md`
2. `entree-tour-scene-mvp.md`
3. `tour-combat-scene-mvp.md`
4. `retour-village-scene-mvp.md`

---

## 20. Résumé exécutif

La scène de Marché du MVP doit transformer le commerce agricole du jeu en un lieu simple, lisible et vivant.

Elle doit contenir au minimum :
- la Marchande,
- un étal identifiable,
- une lecture visuelle du stockage,
- une interaction claire d’achat / vente.

Son rôle central est simple :
**faire ressentir au joueur que ce qu’il fait pousser à la ferme commence ici à nourrir le retour d’une vraie vie locale.**
