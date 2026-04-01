# Fiche personnage / équipement MVP

> **Statut : document canonique actif**
> Ce document définit la structure canonique de la fiche personnage / équipement pour le MVP.
> Il sert de référence active pour l’implémentation front, la lisibilité des statistiques, des slots d’équipement, des bonus, des compétences liées et de l’orientation de build du héros.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la fiche personnage / équipement du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont la fiche personnage / équipement doit être conçue dans le MVP.

Il permet de :
- rendre visibles les statistiques du héros ;
- structurer les slots d’équipement ;
- montrer clairement ce que chaque pièce apporte ;
- soutenir la compréhension des builds ;
- éviter une interface obscure, trop technique ou trop proche d’un inventaire brut.

La fiche personnage ne doit pas être un simple mur de chiffres.
Elle doit être le lieu où le joueur comprend :
- qui est son héros ;
- comment il l’a équipé ;
- vers quelle direction il l’emmène.

---

## 2. Objectifs de la fiche personnage / équipement

La fiche doit permettre au joueur de comprendre immédiatement :

- ses stats principales ;
- ce qu’il a équipé dans chaque slot ;
- comment son équipement influence son style de jeu ;
- quels objets sont les plus déterminants ;
- si un build est orienté force, dextérité, intelligence, défense ou hybride ;
- quelles compétences sont liées à son équipement.

Le front doit faire ressentir :
- lisibilité ;
- progression ;
- personnalisation ;
- matérialité du build.

---

## 3. Principes de conception

### 3.1 Le personnage avant les chiffres
Le joueur doit d’abord voir qu’il équipe un héros, pas qu’il gère un tableur.

### 3.2 Les slots doivent être clairs
Chaque slot doit être identifiable rapidement.

### 3.3 Les stats doivent être compréhensibles
Le joueur doit voir ses stats importantes sans être noyé dans les détails.

### 3.4 L’équipement doit raconter une orientation
L’écran doit aider à répondre à :
**quel type de combattant suis-je en train de construire ?**

### 3.5 Peu de friction
Équiper, comparer et comprendre doivent rester rapides.

---

## 4. Structure générale recommandée

La fiche personnage / équipement du MVP repose sur **5 blocs principaux** :

1. **Bloc identité du héros**
2. **Bloc statistiques**
3. **Bloc silhouette / slots d’équipement**
4. **Bloc détail de l’équipement sélectionné**
5. **Bloc orientation / compétences liées**

Cette structure suffit largement pour le MVP.

---

## 5. Bloc identité du héros

## 5.1 Fonction
Rappeler que l’écran concerne un personnage, pas seulement une collection d’items.

## 5.2 Informations minimales à afficher
- nom du héros
- portrait ou silhouette simple
- niveau
- éventuellement classe libre/non figée implicite, sans verrouiller une classe finale

## 5.3 Règle UX
Ce bloc doit être léger, mais assez présent pour donner une ancre humaine à l’écran.

---

## 6. Bloc statistiques

## 6.1 Fonction
Afficher les statistiques principales du héros.

## 6.2 Statistiques canoniques à afficher
- FOR
- DEX
- CON
- INT
- VIT

## 6.3 Informations secondaires possibles
Selon l’implémentation, on peut aussi afficher :
- PV max
- MP max
- attaque / défense synthétique
- vitesse ou initiative si utile

Mais le MVP doit éviter de surcharger l’écran avec trop de sous-stats.

## 6.4 Hiérarchie recommandée
### Priorité 1
- FOR
- DEX
- CON
- INT
- VIT

### Priorité 2
- PV / MP
- synthèses dérivées si présentes

## 6.5 Règle UX
Le joueur doit comprendre sans effort quelles stats définissent son build.

---

## 7. Bloc silhouette / slots d’équipement

## 7.1 Fonction
Montrer visuellement les emplacements d’équipement du héros.

## 7.2 Slots canoniques à afficher
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

## 7.3 Lecture recommandée
Le joueur doit pouvoir voir d’un coup d’œil :
- quels slots sont remplis ;
- quelles pièces sont portées ;
- si son équipement paraît léger, lourd, équilibré ou spécialisé.

## 7.4 Règle UX
Les slots doivent être visuellement distincts et faciles à sélectionner, sans devenir minuscules ou illisibles.

---

## 8. Bloc détail de l’équipement sélectionné

## 8.1 Fonction
Afficher les informations précises de la pièce actuellement sélectionnée.

## 8.2 Informations minimales à afficher
- nom
- slot
- rareté
- bonus principaux
- prérequis éventuels
- compétence liée si présente
- description courte

## 8.3 Règle UX
Ce panneau doit aider à comprendre l’objet, pas à l’enfouir sous les détails.

Le joueur doit pouvoir répondre rapidement à :
- à quoi sert cette pièce ?
- pourquoi est-elle bonne ?
- pour quel build est-elle intéressante ?

---

## 9. Bloc orientation / build

## 9.1 Fonction
Donner une lecture synthétique de la direction du héros.

## 9.2 Ce que le MVP doit faire sentir
Sans afficher forcément une “classe”, l’interface doit pouvoir laisser percevoir une orientation :

- force / frontal
- dextérité / précision
- intelligence / compétences
- défense / robustesse
- hybride

## 9.3 Moyens recommandés
Cette lecture peut passer par :
- les stats mises en avant
- les équipements les plus marquants
- une ou deux lignes de synthèse légère
- les compétences actuellement accessibles

## 9.4 Règle UX
Le joueur doit sentir que ses choix forment un ensemble, pas juste une pile d’objets.

---

## 10. Bloc compétences liées

## 10.1 Fonction
Afficher les compétences actuellement accordées ou soutenues par l’équipement.

## 10.2 Informations minimales à afficher
- nom de la compétence
- source (arme, armure, accessoire)
- disponibilité
- coût ou type si pertinent

## 10.3 Règle UX
Le joueur doit comprendre clairement :
- quelle pièce donne quelle capacité ;
- ce qu’il perd s’il retire cette pièce ;
- comment son équipement influence son gameplay.

## 10.4 Importance MVP
Le système n’a pas besoin d’être exploité à fond, mais l’écran doit déjà le rendre crédible et lisible.

---

## 11. Hiérarchie visuelle globale

La fiche doit hiérarchiser visuellement :

### Priorité 1
- silhouette / équipement porté
- stats principales
- pièces majeures (armes, torse, accessoires clefs)

### Priorité 2
- détail de la pièce sélectionnée
- orientation du build
- compétences liées

### Priorité 3
- descriptions plus longues
- détails secondaires
- informations avancées

Le joueur doit d’abord voir :
- ce qu’il porte ;
- ce que ça change ;
- quel type de héros cela dessine.

---

## 12. Navigation et interactions recommandées

## 12.1 Interactions principales
- sélectionner un slot
- voir le détail d’une pièce équipée
- ouvrir la liste des pièces compatibles
- comparer
- équiper / retirer

## 12.2 Règle UX
La navigation doit être simple :
- souris : clic naturel
- clavier / manette : focus très clair

## 12.3 Comparaison
Quand une nouvelle pièce est sélectionnée, le joueur doit voir :
- ce qu’il gagne
- ce qu’il perd
- si cela change une compétence liée
- si cela modifie son orientation générale

---

## 13. Ambiance UI recommandée

La fiche personnage / équipement doit être :
- claire ;
- structurée ;
- légèrement RPG ;
- cohérente avec la direction visuelle du jeu ;
- plus lisible que spectaculaire.

Il faut éviter :
- les panneaux trop techniques ;
- les stats secondaires partout ;
- les silhouettes illisibles ;
- les interfaces surchargées façon inventaire de looter massif.

Le bon ton est :
**écran de build lisible avec matière discrète**

---

## 14. Contraintes UX

La fiche doit respecter les règles suivantes :

- lecture rapide des stats principales ;
- slots évidents ;
- comparaisons simples ;
- pièces majeures mises en avant ;
- peu de friction ;
- bonne lecture du build même pour un joueur non expert.

Le joueur doit toujours pouvoir répondre rapidement à :
- qu’est-ce que je porte ?
- est-ce cohérent ?
- qu’est-ce qui me rend plus fort ici ?

---

## 15. Contraintes techniques / front

La fiche doit être compatible avec :
- souris
- clavier
- manette

Elle doit aussi permettre :
- mise à jour rapide après équipement
- comparaison simple
- affichage de bonus / malus
- intégration des compétences liées
- réutilisation des données équipement déjà présentes

Le système peut être monté progressivement :
1. slots
2. stats
3. détail d’objet
4. comparaison
5. compétences liées
6. lecture synthétique du build

---

## 16. Cas particuliers à prévoir

### Slot vide
L’interface doit le montrer clairement sans donner l’impression d’un bug.

### Objet incompatible ou verrouillé
La raison doit être lisible :
- mauvais slot
- prérequis non atteints
- indisponible

### Objet équipé dans une autre main / bague
La comparaison ne doit pas devenir confuse.

### Pièce avec compétence liée
La perte ou le gain de la compétence doit être très visible.

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/05-equipements/equipements-index.md`
- `docs/05-equipements/armes.md`
- `docs/05-equipements/armures.md`
- `docs/05-equipements/accessoires.md`
- `docs/05-equipements/progression-equipement-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 18. Priorités de production recommandées

Après ce document, le doc UI le plus logique à produire est :

1. `ecran-transition-palier-mvp.md`

Puis, si besoin :
2. écrans plus spécialisés :
   - comparaison d’équipement avancée
   - popup de nouvel objet
   - panneau de compétences

---

## 19. Résumé exécutif

La fiche personnage / équipement du MVP doit être pensée comme l’écran où le joueur comprend vraiment ce qu’il est en train de construire.

Elle doit permettre de voir clairement :
- les stats principales,
- les slots équipés,
- les détails des objets,
- l’orientation du build,
- et les compétences liées à l’équipement.

Son rôle central est simple :
**faire en sorte que le héros apparaisse comme un personnage construit par des choix concrets, pas comme une simple somme de nombres et d’objets.**
