# Ferme - scène MVP

> **Statut : document canonique actif**
> Ce document définit la mise en scène front canonique de la Ferme pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des éléments interactifs, la navigation du joueur, les priorités visuelles et la transformation du système de ferme en véritable scène jouable.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la scène de Ferme du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont la Ferme doit exister côté front dans le MVP.

Il permet de :
- transformer les systèmes agricoles déjà présents en scène concrète ;
- préciser ce que le joueur doit voir, comprendre et manipuler ;
- organiser les zones interactives ;
- guider la mise en scène, l’ergonomie et la hiérarchie visuelle ;
- éviter que la ferme reste un simple panneau de gestion détaché du monde.

La Ferme doit être le premier lieu où le joueur sent que le jeu n’est plus seulement une API branchée à une interface, mais un vrai monde habitable.

---

## 2. Fonction de la scène

La scène de Ferme remplit 4 fonctions majeures :

### 2.1 Base du joueur
C’est le point de retour naturel entre les boucles.

### 2.2 Espace agricole
C’est là que le joueur plante, arrose, récolte.

### 2.3 Espace de préparation
C’est là qu’il dort, craft et prépare indirectement la suite.

### 2.4 Ancrage émotionnel
C’est le lieu qui doit donner la sensation :
**“ici, quelque chose peut repousser.”**

---

## 3. Objectifs front de la scène

La scène de Ferme doit permettre au joueur de comprendre immédiatement :

- où dormir ;
- où sont les parcelles ;
- où l’on peut crafter ;
- que cet espace lui appartient ;
- que ses actions modifient visuellement le lieu.

Le front doit faire ressentir :
- simplicité ;
- clarté ;
- refuge ;
- utilité immédiate.

---

## 4. Composition spatiale recommandée

La scène de Ferme du MVP doit rester compacte et très lisible.

## 4.1 Zones minimales à afficher

### A. Maison / abri du joueur
Fonction :
- point de repos ;
- interaction de sommeil ;
- symbole du foyer de départ.

### B. Zone de parcelles
Fonction :
- cœur du gameplay agricole ;
- visualisation directe des cultures.

### C. Point de craft simple
Fonction :
- fabrication de consommables ;
- transformation du travail agricole en préparation.

### D. Bordure / décor de ferme
Fonction :
- situer l’espace dans un monde réel ;
- éviter l’effet “plateau vide”.

---

## 4.2 Organisation visuelle recommandée

Disposition recommandée en top-down :

- **maison / abri** sur un côté lisible de la scène
- **parcelles** au centre ou dans la zone dominante
- **point de craft** proche de la maison, mais distinct
- **sortie vers le village** visible clairement
- décor périphérique léger pour fermer la scène sans l’encombrer

Le joueur doit pouvoir lire la scène presque instantanément.

---

## 5. Hiérarchie visuelle des éléments interactifs

Les éléments de la scène doivent être hiérarchisés ainsi :

### Priorité 1 — Parcelles
Ce sont elles que le joueur doit remarquer en premier.

### Priorité 2 — Maison / sommeil
Le point de repos doit être très clair.

### Priorité 3 — Point de craft
Présent et identifiable, mais secondaire par rapport aux parcelles.

### Priorité 4 — Transition vers le village
Visible, mais pas dominante.

---

## 6. Parcelles agricoles

## 6.1 Lecture attendue
Les parcelles doivent être immédiatement identifiables comme zones cultivables.

Le joueur doit pouvoir voir rapidement :
- parcelle vide ;
- parcelle plantée ;
- parcelle arrosée ;
- parcelle prête à récolter.

## 6.2 États visuels minimum
Chaque parcelle doit idéalement pouvoir afficher visuellement :

- **vide**
- **plantée**
- **arrosée**
- **mûre / récoltable**

## 6.3 Règle UX
Le joueur ne doit pas avoir besoin d’ouvrir un panneau complexe pour comprendre l’état de base de ses parcelles.
L’état principal doit être visible dans la scène elle-même.

## 6.4 Interaction recommandée
En cliquant / sélectionnant une parcelle :
- ouvrir une interaction contextuelle simple ;
- proposer `Planter`, `Arroser`, `Récolter` selon l’état ;
- garder l’action très lisible.

---

## 7. Maison / abri

## 7.1 Fonction front
La maison du joueur doit être immédiatement perçue comme :
- son point d’ancrage ;
- le lieu du sommeil ;
- un espace personnel.

## 7.2 Interaction recommandée
L’interaction principale doit être :
- `Dormir (+1 jour)`

Optionnel plus tard :
- point de sauvegarde visuel
- personnalisation légère
- feedbacks de progression

## 7.3 Lecture visuelle
Même modeste, la maison doit être distinguable du reste :
- petite structure simple
- porte visible
- impression d’abri, pas de bâtiment décoratif générique

---

## 8. Point de craft

## 8.1 Fonction front
Le craft doit exister dans la scène comme un petit point de travail :
- établi
- caisse
- table
- coin de préparation
- petit feu ou support simple selon DA retenue

## 8.2 Interaction recommandée
Interaction principale :
- `Ouvrir le craft`

## 8.3 Règle UX
Le craft doit sembler proche du quotidien, pas comme une “station magique”.
Il faut garder une lecture simple :
**je transforme ce que j’ai cultivé en quelque chose d’utile.**

---

## 9. Sortie et transition

## 9.1 Transition principale
La Ferme doit avoir une sortie lisible vers le Village.

## 9.2 Lecture visuelle
Cette sortie peut être matérialisée par :
- un chemin
- une ouverture
- une barrière ouverte
- une route simple

Le joueur doit comprendre naturellement :
**si je quitte ici, je vais vers le monde social et économique.**

---

## 10. Informations à afficher directement dans la scène

La scène doit communiquer sans tout reposer sur des panneaux HUD.

Informations à faire ressentir visuellement :
- nombre de parcelles actives
- cultures présentes
- état de maturité global
- moment du cycle (jour / nuit)
- vitalité générale de la ferme

Le front peut compléter avec HUD, mais la scène doit déjà “parler”.

---

## 11. Informations UI complémentaires recommandées

Un HUD léger ou panneau contextuel peut afficher :

- jour actuel
- phase jour / nuit
- graine sélectionnée
- récap rapide des cultures
- accès craft
- rappel d’action de sommeil

Mais ce HUD doit rester au service de la scène, pas l’écraser.

---

## 12. Ambiance visuelle et émotionnelle

La scène de Ferme doit évoquer :

- calme
- terre
- bois
- petit refuge
- reprise fragile
- promesse de croissance

Le joueur doit ressentir ici un contraste fort avec la Tour :
- moins d’oppression
- plus de respiration
- plus de contrôle
- plus de concret

---

## 13. Évolution visuelle attendue

La scène de Ferme doit pouvoir paraître légèrement différente au fil de la progression, même sans refonte majeure.

Évolutions possibles :
- cultures plus présentes
- impression d’espace mieux utilisé
- atmosphère plus vivante
- sensation de lieu moins abandonné

Le MVP n’a pas besoin de 10 versions.
Mais il doit pouvoir laisser sentir que la ferme “se remet à vivre”.

---

## 14. Contraintes UX

La scène doit respecter les règles suivantes :

- lisibilité immédiate
- peu d’interactions à l’écran, mais très claires
- pas d’encombrement décoratif autour des parcelles
- pas d’ambiguïté entre décor et interactif
- interactions contextuelles simples

Le joueur doit comprendre la ferme sans tutoriel lourd.

---

## 15. Contraintes techniques / front

Cette scène doit être compatible avec :
- navigation clavier / manette / souris
- focus clair des éléments interactifs
- mise à jour visuelle rapide après action
- états simples des parcelles
- réutilisation des systèmes déjà présents côté gameplay/state

Elle doit être pensée comme un premier terrain de transformation du HUD en monde, sans réécrire tout le backend.

---

## 16. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/01-univers/lieux-mvp.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/04-objets/consommables.md`
- `docs/06-crafting/recettes-index.md`
- `docs/00-projet/canon-mvp.md`

---

## 17. Priorités de production recommandées

Après cette scène, les scènes les plus logiques à produire sont :

1. `village-scene-mvp.md`
2. `marche-scene-mvp.md`
3. `forge-scene-mvp.md`
4. `entree-tour-scene-mvp.md`

---

## 18. Résumé exécutif

La scène de Ferme du MVP doit transformer les systèmes agricoles existants en un lieu concret, simple et vivant.

Elle doit contenir au minimum :
- une maison / abri,
- des parcelles lisibles,
- un point de craft,
- une sortie claire vers le village.

Son rôle central est simple :
**faire ressentir au joueur que la reconstruction commence ici, dans un petit espace qu’il apprend à faire revivre de ses propres mains.**
