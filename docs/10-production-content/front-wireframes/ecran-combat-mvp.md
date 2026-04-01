# Écran Combat MVP

> **Statut : document canonique actif**
> Ce document définit le wireframe fonctionnel canonique de l’écran de Combat pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des zones de scène et d’interface, la hiérarchie des informations de combat et la transformation du système de combat en écran jouable lisible et cohérent.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran de Combat du MVP.

---

## 1. Rôle du document

Ce document fixe la structure de l’écran de Combat côté front.

Il permet de :
- traduire la scène de combat en écran concret ;
- placer clairement les zones de héros, ennemis, actions et informations ;
- hiérarchiser ce qui relève de la scène et ce qui relève du HUD ;
- guider Codex sur la disposition générale ;
- éviter que le combat reste une accumulation confuse de panneaux techniques.

L’écran de Combat doit être le lieu où le joueur comprend immédiatement :
- qui affronte qui ;
- ce qu’il peut faire ;
- ce qui le menace ;
- et pourquoi ce combat compte.

---

## 2. Objectifs de l’écran

L’écran doit permettre au joueur de comprendre immédiatement :

- où se trouve son héros ;
- où se trouvent les ennemis ;
- quel ennemi est ciblé ;
- quelles actions sont disponibles ;
- quels sont les PV et MP du héros ;
- quels sont les PV de l’ennemi principal ou des ennemis présents ;
- quels statuts importants sont actifs ;
- s’il s’agit d’un combat normal, de palier ou de boss.

Le front doit faire ressentir :
- lisibilité ;
- tension ;
- rythme ;
- danger lisible ;
- progression de la Tour.

---

## 3. Principe général de composition

L’écran de Combat doit être composé de **2 couches principales** :

### 3.1 Couche scène
Le lieu de confrontation lui-même :
- décor de fond
- héros
- ennemi(s)
- ambiance du palier

### 3.2 Couche HUD
Les informations utiles :
- PV / MP
- actions
- statuts
- cible
- feedbacks
- issue du combat

La scène doit porter l’impression de confrontation.
Le HUD doit rendre cette confrontation compréhensible.

---

## 4. Zoning général recommandé

## 4.1 Répartition fonctionnelle

### Zone gauche ou basse dominante
**Héros**
- point d’ancrage du joueur
- lecture immédiate du personnage actif

### Zone droite ou haute dominante
**Ennemi(s)**
- zone de menace
- hiérarchie visuelle du danger

### Zone basse centrale ou latérale
**Actions**
- attaque
- compétences
- objets
- défense / autre action selon système

### Zone haute ou latérale légère
**Infos de combat**
- étage / type de combat
- statuts importants
- rappel contextuel léger

### Zone flottante ou contextuelle
**Feedbacks**
- dégâts
- soin
- statut
- résultat d’action

---

## 5. Wireframe fonctionnel simplifié

Exemple logique de composition :

    ┌──────────────────────────────────────────────────────────────┐
    │ Étage / type de combat            Statuts / infos légères   │
    │                                                              │
    │   [ Héros ]                              [ Ennemi principal ] │
    │   Nom                                    Nom / Boss / PV      │
    │   PV / MP                                PV / Statuts          │
    │                                                              │
    │                    [ Décor / ambiance ]                      │
    │                                                              │
    │   Ennemi secondaire éventuel         Ennemi secondaire éventuel│
    │                                                              │
    │  Actions :  Attaque | Compétences | Objets | Défense         │
    │                                                              │
    │  Zone contextuelle : description action / cible / feedback   │
    └──────────────────────────────────────────────────────────────┘

Ce schéma n’est pas une DA finale.
C’est une logique de hiérarchie.

---

## 6. Zone scène principale

## 6.1 Héros

### Fonction
Ancrer le joueur dans la scène.

### Ce qui doit être visible sans ouvrir de panneau
- représentation du héros
- nom
- PV
- MP
- statuts importants
- tour actif si concerné

### Comportement attendu
Quand c’est au tour du joueur :
- le héros doit ressortir clairement ;
- l’interface doit montrer qu’il peut agir ;
- la zone d’action doit devenir la priorité visuelle secondaire.

### Priorité front
Très haute.

---

## 6.2 Ennemi principal

### Fonction
Porter la menace principale du combat.

### Ce qui doit être visible sans ouvrir de panneau
- nom
- PV
- statut(s) important(s)
- marqueur de boss / palier si nécessaire

### Comportement attendu
Quand un ennemi est ciblé :
- il doit ressortir visuellement ;
- sa lecture doit être très claire ;
- le joueur doit comprendre immédiatement si c’est lui la priorité.

### Priorité front
Très haute.

---

## 6.3 Ennemis secondaires

### Fonction
Compléter la menace sans nuire à la lisibilité.

### Lecture attendue
Le joueur doit comprendre :
- qu’ils existent ;
- qu’ils sont secondaires ou non ;
- lequel est actuellement ciblé.

### Règle UX
Même en combat multi-ennemis, l’écran ne doit jamais devenir confus.
Le ciblage doit rester évident.

---

## 6.4 Décor / ambiance

### Fonction
Faire sentir le palier et l’atmosphère de la Tour.

### Lecture attendue
Le joueur doit ressentir :
- le niveau d’oppression ;
- le type d’environnement ;
- la progression vers quelque chose de plus sombre.

### Position recommandée
En fond de scène, jamais au détriment de la lisibilité des unités et des informations critiques.

---

## 7. HUD permanent minimal

L’écran de Combat doit garder un HUD clairement structuré.

## 7.1 Bloc héros
À afficher :
- nom
- PV / PV max
- MP / MP max
- statuts majeurs

## 7.2 Bloc ennemi ciblé
À afficher :
- nom
- PV
- statut(s)
- marqueur boss si pertinent

## 7.3 Bloc contexte
À afficher si utile :
- étage
- type de combat
- phase ou indication légère du tour

## 7.4 Règle UX
Ces éléments doivent être visibles en permanence, sans saturer l’écran.

---

## 8. Bloc actions

## 8.1 Fonction
Présenter les choix du joueur de manière simple et rapide.

## 8.2 Contenu minimum
- `Attaque`
- `Compétences`
- `Objets`
- `Défense` ou action équivalente si présente

## 8.3 Comportement attendu
Quand une action est sélectionnée :
- le sous-panneau correspondant doit apparaître clairement ;
- le coût, la cible ou l’effet doivent être lisibles ;
- le retour vers le menu principal doit être simple.

## 8.4 Placement recommandé
Bas de l’écran ou bandeau très lisible, jamais trop éloigné de la zone héros.

---

## 9. Sous-panneau Compétences

## 9.1 Fonction
Afficher les techniques disponibles.

## 9.2 Contenu minimum
- nom
- coût en MP si nécessaire
- disponibilité
- type ou cible si pertinent

## 9.3 Règle UX
Le joueur doit pouvoir choisir une compétence sans se perdre dans une liste trop longue.
Le MVP doit rester compact et lisible.

---

## 10. Sous-panneau Objets

## 10.1 Fonction
Afficher les consommables utilisables.

## 10.2 Contenu minimum
- nom
- quantité
- effet court
- disponibilité

## 10.3 Règle UX
Le joueur doit voir rapidement :
- combien il lui reste ;
- quel objet soigne ;
- quel objet rend des MP ;
- si l’objet peut être utilisé maintenant.

---

## 11. Zone contextuelle de feedback

## 11.1 Fonction
Afficher les conséquences immédiates des actions.

## 11.2 Feedbacks prioritaires
- dégâts infligés
- dégâts reçus
- soin
- MP consommés
- application ou fin de statut
- attaque bloquée / ratée / autre effet important

## 11.3 Règle UX
Les feedbacks doivent être :
- courts ;
- visibles ;
- hiérarchisés ;
- non envahissants.

Le joueur doit ressentir l’impact sans perdre la lecture de l’écran.

---

## 12. Hiérarchie visuelle recommandée

### Priorité 1
- héros
- ennemi principal / boss
- PV du héros
- actions disponibles

### Priorité 2
- PV ennemi
- MP
- statuts
- cible active

### Priorité 3
- décor
- détails contextuels
- feedbacks secondaires

Le joueur doit d’abord comprendre :
- s’il est en danger ;
- ce qu’il peut faire ;
- qui il affronte.

---

## 13. États UX à prévoir

## 13.1 Tour du joueur
L’écran doit le montrer très clairement.

## 13.2 Ennemi ciblé
Le ciblage doit être visuellement évident.

## 13.3 Action impossible
L’interface doit expliquer simplement pourquoi :
- pas assez de MP
- aucun objet disponible
- aucune cible valide
- autre contrainte

## 13.4 Combat de boss
Le boss doit ressortir très clairement :
- nom
- statut
- PV
- poids visuel

## 13.5 Fin de combat
L’écran doit pouvoir basculer proprement vers :
- résultat normal
- transition de palier
- défaite

---

## 14. Comportement émotionnel de l’écran

L’écran de Combat doit donner la sensation :

- d’une vraie confrontation ;
- d’un danger lisible ;
- d’une montée de tension ;
- d’une progression par cap ;
- d’un affrontement contre quelque chose qui résiste.

Le joueur doit y ressentir :
**“ici, je me mesure directement à ce qui empêche le monde de guérir.”**

---

## 15. Contraintes UX

L’écran doit respecter les règles suivantes :

- lecture immédiate ;
- actions faciles d’accès ;
- informations critiques toujours visibles ;
- hiérarchie claire ;
- pas de surcharge ;
- ciblage évident ;
- différence lisible entre combat normal et boss.

Le joueur ne doit jamais se demander longtemps :
- à qui est le tour ;
- qui est ciblé ;
- quoi faire ;
- combien il lui reste de ressources.

---

## 16. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- mise à jour rapide des PV / MP / statuts
- ciblage clair
- affichage simple des feedbacks
- variation légère selon palier
- intégration progressive avec le système de combat existant

Ordre de montage recommandé :
1. scène combat
2. bloc héros
3. bloc ennemi
4. bloc actions
5. sous-panneaux compétences / objets
6. feedbacks
7. variation boss / palier

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/tour-combat-scene-mvp.md`
- `docs/10-production-content/ui/hud-combat-mvp.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/00-projet/canon-mvp.md`

---

## 18. Priorités de production recommandées

Après cet écran, les wireframes les plus logiques à produire sont :

1. `ecran-shop-mvp.md`
2. `ecran-personnage-equipement-mvp.md`
3. `ecran-journal-quetes-mvp.md`

---

## 19. Résumé exécutif

L’écran de Combat du MVP doit faire exister le combat comme une vraie scène jouable, pas comme un simple panneau de commandes.

Il doit donner la priorité :
- au héros ;
- à la menace ennemie ;
- aux actions ;
- aux ressources critiques ;
- et à la lisibilité du tour de jeu.

Son rôle central est simple :
**faire en sorte que la tension du combat vienne de la Tour et de ses créatures, pas de la confusion de l’interface.**
