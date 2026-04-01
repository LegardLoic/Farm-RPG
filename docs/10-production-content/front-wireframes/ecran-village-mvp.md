# Écran Village MVP

> **Statut : document canonique actif**
> Ce document définit le wireframe fonctionnel canonique de l’écran de Village pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des zones de scène et d’interface, la hiérarchie des lieux et PNJ, ainsi que la transformation du village en hub jouable lisible et cohérent.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran de Village du MVP.

---

## 1. Rôle du document

Ce document fixe la structure de l’écran de Village côté front.

Il permet de :
- traduire la scène de village en écran concret ;
- placer clairement les zones importantes et les PNJ majeurs ;
- hiérarchiser ce qui relève de la scène et ce qui relève du HUD ;
- guider Codex sur la disposition générale du hub ;
- éviter que le village reste une simple addition de boutons d’accès aux systèmes.

L’écran de Village doit être le lieu où le joueur voit le mieux que :
- le monde existe ;
- les PNJ ont une place ;
- et la progression modifie réellement l’environnement.

---

## 2. Objectifs de l’écran

L’écran doit permettre au joueur de comprendre immédiatement :

- où se trouve le Maire ;
- où se trouvent la Marchande et le Marché ;
- où se trouvent le Forgeron et la Forge ;
- où se trouvent les PNJ secondaires ;
- comment repartir vers la Ferme ;
- comment se diriger vers la Tour ;
- quels lieux ou PNJ ont changé après progression.

Le front doit faire ressentir :
- lisibilité ;
- densité humaine ;
- quotidien blessé mais vivant ;
- progression visible.

---

## 3. Principe général de composition

L’écran de Village doit être composé de **2 couches principales** :

### 3.1 Couche scène
Le lieu lui-même :
- axe principal / place
- mairie ou zone du Maire
- marché
- forge
- coin calme / PNJ secondaires
- sorties vers Ferme et Tour

### 3.2 Couche HUD léger
Les infos utiles :
- objectif courant léger
- nom du PNJ ou lieu ciblé
- interaction disponible
- notifications de nouveautés ou de progression

La scène doit porter l’essentiel du sens.
Le HUD doit simplement aider à lire et agir.

---

## 4. Zoning général recommandé

## 4.1 Répartition fonctionnelle

### Zone centrale dominante
**Axe principal / place du village**
- cœur spatial de l’écran
- priorité visuelle n°1
- circulation vers les autres zones

### Zone stable de narration
**Mairie / Maire**
- pôle narratif principal
- lecture institutionnelle du village

### Zone économique
**Marché / Marchande**
- achat de graines
- vente des récoltes
- quotidien local

### Zone matérielle
**Forge / Forgeron**
- progression d’équipement
- symbole de reconstruction

### Zone humaine plus calme
**PNJ secondaires / Herboriste / Habitante**
- respiration
- quêtes plus intimes
- relationnel

### Bordure de transition
**Sortie Ferme**
- retour à la base du joueur

### Bordure de tension
**Sortie Tour**
- départ vers la menace
- rappel de l’objectif central

---

## 5. Wireframe fonctionnel simplifié

Exemple logique de composition :

```text
┌──────────────────────────────────────────────────────────────┐
│ Objectif léger / notification                               │
│                                                              │
│                [ Sortie vers la Tour / axe menaçant ]        │
│                                                              │
│   [Mairie]         [ Axe principal / place ]   [Forge]       │
│   [Maire]          [ circulation / centre ]    [Forgeron]    │
│                                                              │
│   [Coin calme]     [ Marché / Marchande ]                   │
│   [PNJ sec.]       [ étal / économie ]                      │
│                                                              │
│               [ Sortie vers la Ferme ]                      │
│                                                              │
│   Nom du PNJ / lieu ciblé        Interaction disponible      │
└──────────────────────────────────────────────────────────────┘
Ce schéma n’est pas une DA finale.
C’est une logique de hiérarchie.

---

## 6. Zone scène principale

## 6.1 Axe principal / place

### Fonction
Structurer la lecture générale du village.

### Ce qui doit être visible sans ouvrir de panneau
- circulation simple
- position relative des zones clés
- impression d’un petit centre habité

### Comportement attendu
Le joueur doit pouvoir s’orienter naturellement vers :
- le Maire
- le Marché
- la Forge
- les PNJ secondaires
- les sorties

### Priorité front
Très haute.

---

## 6.2 Zone du Maire

### Fonction
Pôle de narration principale et de lecture de progression.

### Lecture attendue
Le joueur doit comprendre immédiatement :
- où trouver le Maire ;
- que ce lieu est lié à la quête principale ;
- que c’est un lieu stable, sérieux et central.

### Interaction principale
- `Parler au Maire`

### Position recommandée
Visible, stable, légèrement en retrait de l’économie pour marquer son rôle différent.

---

## 6.3 Zone du Marché

### Fonction
Point d’échange agricole et économique.

### Lecture attendue
Le joueur doit sentir :
- présence de la Marchande ;
- étal lisible ;
- logique d’achat / vente.

### Interaction principale
- `Parler à la Marchande`
- puis accès au shop Marché

### Position recommandée
Facilement accessible depuis l’axe principal.

---

## 6.4 Zone de la Forge

### Fonction
Point de progression matérielle.

### Lecture attendue
Le joueur doit sentir :
- poids du lieu ;
- présence du Forgeron ;
- ancrage clair du shop d’équipement.

### Interaction principale
- `Parler au Forgeron`
- puis accès à la Forge

### Position recommandée
Distincte du Marché, plus lourde visuellement.

---

## 6.5 Zone calme / PNJ secondaires

### Fonction
Porter les échanges plus humains, plus doux ou plus intimes.

### Lecture attendue
Le joueur doit sentir :
- retrait ;
- respiration ;
- quotidien local ;
- espace moins utilitaire.

### Interactions principales
- `Parler`
- lecture de quêtes secondaires ou relationnelles simples

### Position recommandée
Légèrement à l’écart du cœur des services.

---

## 6.6 Sortie vers la Ferme

### Fonction
Retour vers la base du joueur.

### Lecture attendue
Le joueur doit comprendre naturellement :
- qu’il repart vers son lieu personnel ;
- que cette sortie n’a pas la même charge que celle de la Tour.

### Interaction principale
- `Aller à la Ferme`
ou simple passage si navigation libre

### Position recommandée
Bord bas ou latéral apaisé de l’écran.

---

## 6.7 Sortie vers la Tour

### Fonction
Départ vers la menace principale.

### Lecture attendue
Le joueur doit sentir :
- tension ;
- direction du danger ;
- axe de progression combat.

### Interaction principale
- `Aller vers la Tour`

### Position recommandée
Bord haut ou axe plus chargé symboliquement.

---

## 7. HUD minimal permanent

L’écran de Village doit garder un HUD très léger en permanence.

## 7.1 Zone haute de l’écran
À afficher si utile :
- objectif courant très court
- notification légère (`Nouveau dialogue`, `Forge améliorée`, etc.)

## 7.2 Zone basse ou contextuelle
À afficher :
- nom du PNJ ou lieu ciblé
- interaction disponible

## 7.3 Règle UX
Le HUD doit rester :
- discret ;
- contextuel ;
- utile sans prendre le dessus sur la scène.

---

## 8. Panneau contextuel de cible

## 8.1 Fonction
Afficher l’identité et l’action liée à la cible courante.

## 8.2 Contenu minimum
- nom du PNJ ou lieu
- fonction courte si nécessaire
- action disponible :
  - Parler
  - Ouvrir le Marché
  - Ouvrir la Forge
  - Aller à la Ferme
  - Aller vers la Tour

## 8.3 Placement recommandé
- bas de l’écran
ou
- zone contextuelle légère proche du bord inférieur

## 8.4 Règle UX
Le panneau doit rester très simple et ne s’afficher clairement que lorsqu’une cible est active.

---

## 9. Hiérarchie visuelle recommandée

### Priorité 1
- axe principal / place
- PNJ majeurs
- Marché et Forge

### Priorité 2
- Maire
- sorties Ferme / Tour
- PNJ secondaires

### Priorité 3
- décor de fond
- notifications légères
- détails d’ambiance

Le joueur doit d’abord comprendre :
- où il peut aller ;
- qui il peut voir ;
- quels services sont là.

---

## 10. États UX à prévoir

## 10.1 Nouveau dialogue disponible
Le HUD ou la scène doit le suggérer sans lourdeur :
- petit marqueur
- notification légère
- changement subtil

## 10.2 Shop amélioré
Le joueur doit percevoir que :
- le Marché ou la Forge ont progressé ;
- un nouvel état est disponible.

## 10.3 Quête à rendre
Le PNJ concerné doit ressortir plus clairement.

## 10.4 Aucun changement notable
Le village doit rester lisible et agréable même en phase de routine.

---

## 11. Comportement émotionnel de l’écran

L’écran de Village doit donner la sensation :

- d’un lieu vivant ;
- d’une communauté encore présente ;
- d’un espace blessé mais récupérable ;
- d’un monde qui commence à répondre aux efforts du joueur.

Le joueur doit y ressentir :
**“voilà pour qui et pour quoi je me bats.”**

---

## 12. Contraintes UX

L’écran doit respecter les règles suivantes :

- circulation lisible ;
- services repérables immédiatement ;
- peu de couches d’interface ;
- interactions contextuelles simples ;
- très faible friction pour les actions fréquentes ;
- changements du monde perceptibles sans confusion.

Le joueur ne doit jamais se demander longtemps :
- où aller ;
- à qui parler ;
- où acheter, vendre ou s’équiper.

---

## 13. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- focus clair des PNJ et zones ;
- variations d’état simples selon progression ;
- réutilisation des systèmes existants de shops, quêtes et relations ;
- intégration progressive sans refonte complète.

Ordre de montage recommandé :
1. scène village
2. placement des zones
3. ciblage des PNJ / lieux
4. panneau contextuel
5. transitions Ferme / Tour
6. variations de progression

---

## 14. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/village-scene-mvp.md`
- `docs/10-production-content/front-scenes/marche-scene-mvp.md`
- `docs/10-production-content/front-scenes/forge-scene-mvp.md`
- `docs/08-gameplay-content/shops-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 15. Priorités de production recommandées

Après cet écran, les wireframes les plus logiques à produire sont :

1. `ecran-combat-mvp.md`
2. `ecran-shop-mvp.md`
3. `ecran-personnage-equipement-mvp.md`
4. `ecran-journal-quetes-mvp.md`

---

## 16. Résumé exécutif

L’écran de Village du MVP doit faire exister le village comme un vrai hub jouable, pas comme un simple menu d’accès aux systèmes.

Il doit donner la priorité :
- à la circulation entre les zones ;
- aux PNJ majeurs ;
- aux services principaux ;
- et aux sorties vers la Ferme et la Tour.

Son rôle central est simple :
**faire en sorte que le joueur lise le village comme un petit monde cohérent, où chaque lieu et chaque personne occupent une place utile dans la boucle du jeu.**

