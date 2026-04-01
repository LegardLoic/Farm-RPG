# Écran Ferme MVP

> **Statut : document canonique actif**
> Ce document définit le wireframe fonctionnel canonique de l’écran de Ferme pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des zones de scène et d’interface, la hiérarchie des informations et la transformation de la ferme en écran jouable lisible et cohérent.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran de Ferme du MVP.

---

## 1. Rôle du document

Ce document fixe la structure de l’écran de Ferme côté front.

Il permet de :
- traduire la scène de ferme en écran concret ;
- placer clairement les zones interactives ;
- hiérarchiser ce qui relève de la scène et ce qui relève du HUD ;
- guider Codex sur la disposition générale ;
- éviter que la ferme reste une juxtaposition confuse entre décor, parcelles et boutons.

L’écran de Ferme doit être le premier vrai écran où le joueur sent :
- qu’il est dans un lieu ;
- qu’il peut agir directement ;
- et que l’interface l’aide sans prendre toute la place.

---

## 2. Objectifs de l’écran

L’écran doit permettre au joueur de comprendre immédiatement :

- où se trouvent les parcelles ;
- où se trouve la maison / le point de repos ;
- où se trouve le point de craft ;
- quelle graine est sélectionnée ;
- quelles parcelles demandent une action ;
- quel jour et quelle phase du cycle sont en cours ;
- comment repartir vers le village.

Le front doit faire ressentir :
- lisibilité ;
- calme ;
- utilité ;
- contrôle ;
- ancrage dans un lieu simple et vivant.

---

## 3. Principe général de composition

L’écran de Ferme doit être composé de **2 couches principales** :

### 3.1 Couche scène
Le lieu lui-même :
- maison
- parcelles
- coin craft
- chemin de sortie
- décor périphérique

### 3.2 Couche HUD léger
Les infos utiles :
- jour / nuit
- graine sélectionnée
- panneau contextuel de parcelle
- accès craft / sommeil
- feedbacks courts

La scène doit porter le sens principal.
Le HUD ne doit jamais écraser l’espace.

---

## 4. Zoning général recommandé

## 4.1 Répartition fonctionnelle

### Zone centrale dominante
**Parcelles cultivables**
- cœur de l’écran
- priorité visuelle n°1
- zone d’action principale

### Zone latérale ou coin lisible
**Maison / abri**
- point de repos
- lecture simple
- pas trop éloignée des parcelles

### Zone secondaire proche de la maison
**Point de craft**
- établi / coin de travail
- clairement distinct du repos

### Bordure de sortie
**Chemin vers le village**
- visible
- simple
- non dominant

### Bordure périphérique
**Décor / campagne proche**
- soutien d’ambiance
- pas d’interactions lourdes

---

## 5. Wireframe fonctionnel simplifié

Exemple logique de composition :

```text
┌──────────────────────────────────────────────────────────────┐
│ Jour / Nuit                         Graine sélectionnée      │
│                                                              │
│                [ Décor périphérique léger ]                  │
│                                                              │
│   [Maison]         [ Parcelles cultivables ]                 │
│   [Dormir]         [ Parcelle ][ Parcelle ][ Parcelle ]      │
│                    [ Parcelle ][ Parcelle ][ Parcelle ]      │
│                    [ Parcelle ][ Parcelle ][ Parcelle ]      │
│                                                              │
│   [Craft]                                               [→]  │
│   [Établi]                                  Sortie Village   │
│                                                              │
│  Panneau contextuel parcelle / actions disponibles           │
└──────────────────────────────────────────────────────────────┘
Ce schéma n’est pas une DA finale.
C’est une logique de hiérarchie.

---

## 6. Zone scène principale

## 6.1 Parcelles

### Fonction
Zone centrale d’interaction agricole.

### Ce qui doit être visible sans ouvrir de panneau
- parcelle vide
- parcelle plantée
- parcelle arrosée
- parcelle récoltable

### Comportement attendu
Quand le joueur cible une parcelle :
- elle doit ressortir visuellement ;
- un panneau contextuel léger doit apparaître ;
- l’action possible doit être claire.

### Priorité front
Très haute.

---

## 6.2 Maison / abri

### Fonction
Point de repos et ancrage personnel.

### Lecture attendue
Le joueur doit comprendre immédiatement :
- que c’est chez lui ;
- que c’est ici qu’il dort ;
- que cette zone n’est pas un décor neutre.

### Interaction principale
- `Dormir`

### Position recommandée
Visible, mais secondaire par rapport aux parcelles.

---

## 6.3 Point de craft

### Fonction
Ouvrir le craft simple :
- médecine de champ
- tonique de concentration

### Lecture attendue
Le joueur doit sentir que :
- ce point appartient au quotidien ;
- c’est une extension naturelle de la ferme ;
- ce n’est pas une station magique abstraite.

### Interaction principale
- `Ouvrir le craft`

### Position recommandée
Proche de la maison, mais distincte visuellement.

---

## 6.4 Sortie vers le village

### Fonction
Transition vers le hub.

### Lecture attendue
Le joueur doit comprendre naturellement :
- où quitter la ferme ;
- que cette sortie mène au monde social / économique.

### Interaction principale
- `Aller au village`
ou simple passage si navigation libre

### Position recommandée
En bord d’écran, claire mais discrète.

---

## 7. HUD minimal permanent

L’écran de Ferme doit garder un HUD léger en permanence.

## 7.1 En haut de l’écran
À afficher :
- numéro du jour
- état `Jour` / `Nuit`

## 7.2 En haut ou coin opposé
À afficher :
- graine actuellement sélectionnée
- quantité restante

## 7.3 Règle UX
Ces éléments doivent être :
- visibles ;
- petits ;
- non intrusifs.

Le joueur doit les voir sans qu’ils prennent le dessus sur la scène.

---

## 8. Panneau contextuel de parcelle

## 8.1 Fonction
Afficher l’état et l’action de la parcelle ciblée.

## 8.2 Contenu minimum
- état : vide / plantée / arrosée / prête
- action disponible :
  - Planter
  - Arroser
  - Récolter

## 8.3 Placement recommandé
- bas de l’écran
ou
- proche de la parcelle ciblée si très lisible

## 8.4 Règle UX
Le panneau doit disparaître ou se simplifier quand rien n’est ciblé.

Il doit rester :
- court ;
- contextuel ;
- ultra lisible.

---

## 9. Barre d’actions de ferme recommandée

Si besoin d’une barre d’action légère, elle peut contenir :

- `Planter`
- `Arroser`
- `Récolter`
- `Craft`
- `Dormir`

Mais elle ne doit apparaître clairement que si elle améliore la fluidité.
Le MVP doit éviter une barre permanente trop lourde si la scène et le contexte suffisent.

---

## 10. Hiérarchie visuelle recommandée

### Priorité 1
- parcelles
- état ciblé
- action possible

### Priorité 2
- jour / nuit
- graine sélectionnée
- maison / sommeil
- craft

### Priorité 3
- décor périphérique
- infos secondaires
- micro-feedbacks

Le joueur doit d’abord comprendre :
- où agir ;
- quelle parcelle traiter ;
- avec quoi.

---

## 11. États UX à prévoir

## 11.1 Aucune graine sélectionnée
Le HUD doit le montrer clairement.

## 11.2 Graine sélectionnée mais quantité nulle
Message ou état simple :
- impossible de planter
- retour naturel au marché suggéré

## 11.3 Parcelle non exploitable
L’interface doit dire pourquoi :
- déjà plantée
- pas prête
- pas d’action disponible

## 11.4 Récolte prête
L’état récoltable doit ressortir immédiatement, même sans panneau ouvert.

## 11.5 Nuit
L’écran doit aider à comprendre que la boucle peut être clôturée par le sommeil.

---

## 12. Comportement émotionnel de l’écran

L’écran de Ferme doit donner la sensation :

- d’un espace personnel ;
- d’un travail simple et utile ;
- d’une routine réparable ;
- d’un lieu qui répond aux actions du joueur.

Le joueur doit y ressentir :
**“ici, je remets quelque chose en marche.”**

---

## 13. Contraintes UX

L’écran doit respecter les règles suivantes :

- lecture immédiate ;
- peu de couches d’interface ;
- états agricoles visibles ;
- actions simples ;
- navigation naturelle ;
- faible friction entre observer et agir.

Le joueur ne doit jamais se demander longtemps :
- où cliquer ;
- quoi faire ;
- ce qu’une parcelle attend.

---

## 14. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- mise à jour instantanée des parcelles
- affichage contextuel léger
- réutilisation des systèmes existants
- intégration progressive sans gros refactor

Ordre de montage recommandé :
1. scène ferme
2. états visuels des parcelles
3. HUD jour/nuit
4. graine sélectionnée
5. panneau contextuel
6. craft / dormir
7. sortie village

---

## 15. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/ferme-scene-mvp.md`
- `docs/10-production-content/ui/hud-ferme-mvp.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/06-crafting/recettes-index.md`
- `docs/00-projet/canon-mvp.md`

---

## 16. Priorités de production recommandées

Après cet écran, les wireframes les plus logiques à produire sont :

1. `ecran-village-mvp.md`
2. `ecran-combat-mvp.md`
3. `ecran-shop-mvp.md`
4. `ecran-personnage-equipement-mvp.md`
5. `ecran-journal-quetes-mvp.md`

---

## 17. Résumé exécutif

L’écran de Ferme du MVP doit faire exister la ferme comme un vrai lieu de jeu, pas comme un panneau de gestion.

Il doit donner la priorité :
- aux parcelles,
- à la lecture des états,
- aux actions contextuelles,
- au jour/nuit,
- au repos,
- et au craft simple.

Son rôle central est simple :
**faire en sorte que le joueur puisse voir, comprendre et entretenir sa ferme presque naturellement, comme un espace vivant plutôt qu’un système abstrait.**
