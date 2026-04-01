# Écran Personnage / Équipement MVP

> **Statut : document canonique actif**
> Ce document définit le wireframe fonctionnel canonique de l’écran Personnage / Équipement pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des zones de statistiques, des slots d’équipement, des détails d’objets, des comparaisons et de la lecture du build du héros.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran Personnage / Équipement du MVP.

---

## 1. Rôle du document

Ce document fixe la structure de l’écran Personnage / Équipement côté front.

Il permet de :
- traduire la fiche personnage en écran concret ;
- placer clairement les zones de stats, de slots et de détail ;
- hiérarchiser la lecture entre personnage, équipement et build ;
- guider Codex sur la disposition générale ;
- éviter un écran trop technique, trop dense ou trop proche d’un inventaire brut.

L’écran Personnage / Équipement doit être le lieu où le joueur comprend clairement :
- ce qu’il porte ;
- ce que cela change ;
- et quel type de héros il est en train de construire.

---

## 2. Objectifs de l’écran

L’écran doit permettre au joueur de comprendre immédiatement :

- les statistiques principales du héros ;
- les slots actuellement équipés ;
- quelles pièces sont les plus importantes ;
- comment une pièce influence son build ;
- quelles compétences liées sont actives ;
- ce qu’il gagnerait ou perdrait en changeant d’objet.

Le front doit faire ressentir :
- lisibilité ;
- progression ;
- personnalisation ;
- cohérence du build ;
- matérialité du personnage.

---

## 3. Principe général de composition

L’écran Personnage / Équipement doit être composé de **2 couches principales** :

### 3.1 Couche personnage
Ce qui définit le héros :
- nom
- niveau
- stats
- silhouette ou portrait

### 3.2 Couche équipement
Ce qui modifie et spécialise le héros :
- slots
- objets équipés
- détail de l’objet sélectionné
- comparaison
- compétences liées

Le joueur doit voir d’abord le personnage, puis comprendre comment l’équipement le façonne.

---

## 4. Zoning général recommandé

## 4.1 Répartition fonctionnelle

### Colonne gauche
**Bloc identité + statistiques**
- nom
- niveau
- portrait / silhouette
- FOR / DEX / CON / INT / VIT
- éventuellement PV / MP synthétiques

### Zone centrale dominante
**Silhouette / slots d’équipement**
- représentation du héros
- positions des slots
- lecture rapide de ce qui est porté

### Colonne droite
**Détail de l’objet sélectionné**
- nom
- slot
- rareté
- bonus
- compétence liée
- comparaison

### Bandeau ou panneau secondaire
**Lecture du build / synthèse**
- orientation générale
- compétences actives liées à l’équipement
- effet des objets les plus marquants

---

## 5. Wireframe fonctionnel simplifié

Exemple logique de composition :

    ┌──────────────────────────────────────────────────────────────┐
    │ Nom du héros / Niveau                                        │
    │                                                              │
    │ [Stats]             [ Silhouette + slots ]   [ Détail objet ]│
    │ FOR                 Casque                 Nom               │
    │ DEX                 Amulette               Slot              │
    │ CON                 Torse                  Rareté            │
    │ INT                 Gants                  Bonus             │
    │ VIT                 Main G / Main D        Comparaison       │
    │ PV / MP             Bague 1 / Bague 2      Compétence liée   │
    │                     Jambes / Bottes                            │
    │                                                              │
    │ Orientation du build / compétences liées actives             │
    └──────────────────────────────────────────────────────────────┘

Ce schéma n’est pas une DA finale.
C’est une logique de hiérarchie.

---

## 6. Bloc identité du héros

## 6.1 Fonction
Ancrer l’écran sur un personnage et non sur un simple inventaire.

## 6.2 Informations minimales à afficher
- nom du héros
- niveau
- portrait ou silhouette simple

## 6.3 Lecture attendue
Le joueur doit sentir immédiatement :
- qu’il regarde son héros ;
- que cet écran parle de sa progression ;
- que l’équipement est au service d’une construction de personnage.

## 6.4 Priorité front
Haute, mais sans voler la place aux slots et aux stats.

---

## 7. Bloc statistiques

## 7.1 Fonction
Afficher les stats principales du héros.

## 7.2 Statistiques minimales à afficher
- FOR
- DEX
- CON
- INT
- VIT

## 7.3 Informations secondaires possibles
Selon l’implémentation retenue :
- PV max
- MP max
- attaque synthétique
- défense synthétique

Mais le MVP doit rester sobre.
Les stats principales doivent rester les plus visibles.

## 7.4 Lecture attendue
Le joueur doit comprendre rapidement :
- quelles stats sont hautes ;
- quelles stats soutiennent son build ;
- si son équipement renforce une direction claire.

---

## 8. Silhouette / slots d’équipement

## 8.1 Fonction
Montrer visuellement les emplacements d’équipement et ce qui est porté.

## 8.2 Slots canoniques à afficher
- Casque
- Amulette
- Torse
- Jambes
- Bottes
- Gants
- Bague 1
- Bague 2
- Main gauche
- Main droite

## 8.3 Lecture attendue
Le joueur doit pouvoir voir d’un coup d’œil :
- quels slots sont remplis ;
- quelles pièces semblent majeures ;
- si son héros paraît plutôt léger, lourd, équilibré ou spécialisé.

## 8.4 Règle UX
Les slots doivent être :
- faciles à sélectionner ;
- visuellement distincts ;
- cohérents avec la silhouette ;
- lisibles même sans très grand niveau de détail graphique.

---

## 9. Objet sélectionné

## 9.1 Fonction
Afficher les informations détaillées de la pièce ciblée.

## 9.2 Informations minimales à afficher
- nom
- slot
- rareté
- bonus principaux
- prérequis éventuels
- description courte
- compétence liée si présente

## 9.3 Lecture attendue
Le joueur doit comprendre rapidement :
- pourquoi cet objet est utile ;
- à quel build il correspond ;
- s’il vaut la peine d’être gardé ou remplacé.

## 9.4 Règle UX
Le panneau de détail doit être utile sans devenir encyclopédique.

---

## 10. Comparaison d’équipement

## 10.1 Fonction
Aider le joueur à voir ce qu’il gagne ou perd en changeant d’objet.

## 10.2 Informations minimales à afficher
- bonus gagnés
- bonus perdus
- changement de compétence liée si pertinent
- impact synthétique sur le build si possible

## 10.3 Lecture recommandée
La comparaison doit être :
- courte ;
- visuelle ;
- non intimidante.

Le MVP doit éviter les tableaux complexes.
Le joueur doit surtout répondre rapidement à :
- est-ce mieux pour moi ?
- est-ce cohérent avec mon build ?

---

## 11. Bloc orientation du build

## 11.1 Fonction
Donner une lecture synthétique du style actuel du héros.

## 11.2 Lecture attendue
L’écran doit permettre de sentir une orientation comme :
- force / frontal
- dextérité / précision
- intelligence / compétences
- défense / robustesse
- hybride

## 11.3 Moyens recommandés
Cette lecture peut émerger de :
- stats les plus fortes ;
- équipements les plus marquants ;
- compétences liées actives ;
- une courte synthèse visuelle ou textuelle.

## 11.4 Règle UX
Le MVP n’a pas besoin d’imposer une classe.
Mais il doit aider le joueur à voir quelle forme prend son héros.

---

## 12. Bloc compétences liées

## 12.1 Fonction
Montrer les compétences actuellement accordées ou soutenues par l’équipement.

## 12.2 Informations minimales à afficher
- nom de la compétence
- source
- disponibilité
- coût ou type si pertinent

## 12.3 Lecture attendue
Le joueur doit comprendre :
- quelle pièce donne quoi ;
- ce qu’il perdrait en retirant une pièce ;
- que l’équipement influence activement son gameplay.

## 12.4 Importance MVP
Même si le système reste simple au MVP, cet écran doit déjà rendre cette logique crédible.

---

## 13. Hiérarchie visuelle recommandée

### Priorité 1
- slots équipés
- stats principales
- armes / torse / accessoires majeurs

### Priorité 2
- détail de l’objet sélectionné
- comparaison
- compétences liées

### Priorité 3
- textes descriptifs
- informations secondaires
- éléments de contexte plus fins

Le joueur doit d’abord comprendre :
- ce qu’il porte ;
- ce que cela change ;
- quel type de héros cela dessine.

---

## 14. États UX à prévoir

## 14.1 Slot vide
Le vide doit être lisible sans donner l’impression d’une erreur.

## 14.2 Objet incompatible
Le joueur doit comprendre pourquoi :
- mauvais slot
- prérequis non atteints
- objet indisponible

## 14.3 Changement de build implicite
Quand un objet modifie fortement l’orientation du héros, la comparaison doit le rendre visible.

## 14.4 Compétence liée perdue
Le joueur doit voir immédiatement si retirer une pièce supprime une capacité.

## 14.5 Double slot ambigu
Main gauche / main droite et Bague 1 / Bague 2 doivent rester très clairs.

---

## 15. Comportement émotionnel de l’écran

L’écran Personnage / Équipement doit donner la sensation :

- d’un héros construit ;
- de choix concrets ;
- d’une progression qui a une forme ;
- d’un personnage qui devient plus défini à mesure que le joueur avance.

Le joueur doit y ressentir :
**“ce héros commence à vraiment me ressembler dans sa manière de combattre.”**

---

## 16. Contraintes UX

L’écran doit respecter les règles suivantes :

- lecture rapide des stats ;
- slots évidents ;
- peu de friction de navigation ;
- comparaisons simples ;
- build lisible même pour un joueur non expert ;
- priorité claire aux pièces importantes.

Le joueur ne doit jamais se demander longtemps :
- ce qu’il a équipé ;
- ce que ça apporte ;
- si ce changement est intéressant.

---

## 17. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- mise à jour rapide après équipement
- affichage simple des bonus / malus
- intégration des compétences liées
- comparaison claire
- réutilisation des données équipement déjà présentes

Ordre de montage recommandé :
1. bloc identité
2. stats
3. silhouette + slots
4. détail objet
5. comparaison
6. compétences liées
7. lecture synthétique du build

---

## 18. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/ui/fiche-personnage-equipement-mvp.md`
- `docs/05-equipements/equipements-index.md`
- `docs/05-equipements/armes.md`
- `docs/05-equipements/armures.md`
- `docs/05-equipements/accessoires.md`
- `docs/05-equipements/progression-equipement-mvp.md`

---

## 19. Priorités de production recommandées

Après cet écran, le wireframe le plus logique à produire est :

1. `ecran-journal-quetes-mvp.md`

Puis, si besoin :
2. écran d’inventaire global
3. écran de compétences
4. popup de nouvel équipement

---

## 20. Résumé exécutif

L’écran Personnage / Équipement du MVP doit faire exister le héros comme un personnage construit par ses choix, pas comme une simple somme de pièces et de chiffres.

Il doit donner la priorité :
- aux stats principales ;
- aux slots équipés ;
- aux détails des objets importants ;
- aux comparaisons lisibles ;
- et à la lecture du build.

Son rôle central est simple :
**faire en sorte que le joueur voie clairement comment ses choix d’équipement transforment son héros en une manière particulière d’affronter la Tour.**
