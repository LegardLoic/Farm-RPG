# Matériaux MVP

> **Statut : document canonique actif**
> Ce document définit les matériaux canoniques du MVP.
> Il sert de référence active pour le front, l’inventaire, le loot, le crafting, les quêtes, les shops et la progression liée à la tour.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les matériaux du MVP.

---

## 1. Rôle du document

Ce document fixe le catalogue des matériaux du MVP.

Il permet de :
- définir quels matériaux existent réellement ;
- préciser leur place dans la boucle tour ↔ village ↔ craft ;
- distinguer les matériaux des récoltes, des consommables et des objets clés ;
- guider les loot tables et la lisibilité de l’inventaire ;
- préparer les futures recettes et certaines quêtes de progression.

Le MVP n’a pas besoin d’un énorme catalogue de matériaux.
Il a besoin d’un **petit ensemble de ressources lisibles, cohérentes et utiles**.

---

## 2. Principes de conception des matériaux MVP

Les matériaux du MVP doivent respecter les règles suivantes :

### 2.1 Fonction intermédiaire claire
Un matériau n’est ni un objet purement consommable, ni un objet clé scénaristique.
Il sert à :
- fabriquer ;
- prouver une progression ;
- nourrir certaines quêtes ;
- préparer une évolution.

### 2.2 Lien avec les paliers de la tour
Les matériaux doivent aider le joueur à sentir que :
- les ennemis plus importants laissent des traces spécifiques ;
- certains seuils produisent des ressources plus marquantes ;
- la tour donne autre chose que de l’or et de l’XP.

### 2.3 Lisibilité
Le joueur doit comprendre rapidement si un matériau :
- se revend ;
- se garde ;
- sert à crafter ;
- a une valeur de preuve ou de palier.

### 2.4 Production raisonnable
Peu de matériaux, mais chacun doit avoir une vraie identité.

---

## 3. Vue d’ensemble des matériaux MVP

Le noyau de matériaux du MVP repose sur **4 matériaux principaux** :

| Matériau | ID technique | Fonction principale | Source principale | Priorité |
|---|---|---|---|---|
| Minerai de fer | `iron_ore` | Progression matérielle / équipement | Tour / loot | Haute |
| Éclat d’épine | `thorn_shard` | Corruption du vivant / craft / quête | Tour / bêtes d’épines | Haute |
| Cendre condensée | `condensed_cinder` | Palier cendre / progression intermédiaire | Tour / palier 5 | Haute |
| Insigne d’avant-garde | `vanguard_token` | Trophée / progression avancée | Tour / palier 8 | Moyenne à haute |

Ces matériaux doivent suffire pour le MVP à :
- donner de la variété au loot ;
- justifier certaines recettes ;
- soutenir quelques quêtes ;
- différencier les paliers de la tour.

---

## 4. Minerai de fer

### Nom affiché canonique
**Minerai de fer**

### ID technique
`iron_ore`

### Catégorie
Matériau commun / progression

### Source principale
- loot de la tour ;
- récompenses de progression ;
- ennemis ou rencontres de base à intermédiaires.

### Fonction principale
Matériau de référence pour la progression matérielle.

### Rôle dans le MVP
Le Minerai de fer sert à :
- soutenir la logique d’équipement ;
- faire le lien entre la tour et le Forgeron ;
- donner au joueur une ressource concrète évoquant la fabrication, la réparation ou l’évolution matérielle.

Il doit être perçu comme un matériau :
- simple ;
- solide ;
- fiable ;
- immédiatement compréhensible.

### Ressenti recherché
Le joueur doit sentir :
**“ce que je ramène de la tour peut aussi servir à renforcer le concret, pas seulement à accumuler des chiffres.”**

### Priorité
- **haute**

---

## 5. Éclat d’épine

### Nom affiché canonique
**Éclat d’épine**

### ID technique
`thorn_shard`

### Catégorie
Matériau issu du vivant corrompu

### Source principale
- bêtes d’épines ;
- `thorn_beast`
- `thorn_beast_alpha`
- ennemis liés aux premiers paliers végétaux / vivants corrompus.

### Fonction principale
Ressource thématique liée à la corruption végétale.

### Rôle dans le MVP
L’Éclat d’épine sert à :
- matérialiser le vivant déformé ;
- différencier les drops des créatures végétales corrompues ;
- nourrir certains crafts, quêtes ou logiques de preuve ;
- enrichir le bestiaire par la matière qu’il laisse derrière lui.

Il doit être perçu comme un matériau :
- organique ;
- agressif ;
- anormal ;
- plus spécifique qu’un simple minerai.

### Ressenti recherché
Le joueur doit comprendre :
**“ce que j’affronte dans la tour laisse des traces de corruption exploitables ou significatives.”**

### Priorité
- **haute**

---

## 6. Cendre condensée

### Nom affiché canonique
**Cendre condensée**

### ID technique
`condensed_cinder`

### Catégorie
Matériau intermédiaire / palier cendre

### Source principale
- ennemis du thème cendre / braise ;
- `cinder_warden`
- rencontres intermédiaires ou avancées liées à la combustion et à la pression de la tour.

### Fonction principale
Matériau marquant la transition vers une corruption plus stable, plus lourde, plus “gardienne”.

### Rôle dans le MVP
La Cendre condensée sert à :
- distinguer clairement le palier 5 et ses alentours ;
- introduire un matériau plus avancé que le simple loot de base ;
- nourrir le lien entre tour, craft, progression ou certaines quêtes.

Elle doit être perçue comme :
- un résidu dense ;
- chargé ;
- hostile ;
- bien plus qu’une simple poussière.

### Ressenti recherché
Le joueur doit sentir :
**“la tour ne produit plus seulement des restes ; elle laisse des matières plus lourdes, presque saturées de malédiction.”**

### Priorité
- **haute**

---

## 7. Insigne d’avant-garde

### Nom affiché canonique
**Insigne d’avant-garde**

### ID technique
`vanguard_token`

### Catégorie
Matériau avancé / trophée de progression

### Source principale
- ennemis avancés ou structurés ;
- `ash_vanguard_captain`
- palier 8 et zones proches.

### Fonction principale
Marqueur matériel d’une menace organisée.

### Rôle dans le MVP
L’Insigne d’avant-garde sert à :
- donner une trace tangible du palier 8 ;
- soutenir l’idée d’une défense hiérarchisée dans la tour ;
- fournir un matériau ou trophée plus avancé pour la progression, certaines quêtes ou la reconnaissance des seuils franchis.

Il doit être perçu comme :
- plus rare ;
- plus significatif ;
- moins “matière brute” et plus “preuve d’un ordre corrompu”.

### Ressenti recherché
Le joueur doit comprendre :
**“j’ai dépassé le stade des monstres bruts ; j’affronte maintenant des formes de défense presque organisées.”**

### Priorité
- **moyenne à haute**

---

## 8. Rôle des matériaux dans la boucle du jeu

Les matériaux du MVP doivent soutenir la boucle suivante :

### 8.1 La tour donne plus que des chiffres
Le joueur récupère des ressources distinctes selon ce qu’il affronte.

### 8.2 Le village et le craft leur donnent du sens
Ces matériaux peuvent :
- soutenir l’équipement ;
- nourrir des recettes ;
- servir de support à certaines quêtes ou déblocages.

### 8.3 Le joueur apprend à arbitrer
Il comprend progressivement :
- ce qu’il peut vendre ;
- ce qu’il doit garder ;
- ce qui sert à prouver une avancée ;
- ce qui peut devenir utile plus tard.

Les matériaux participent donc à la sensation que la progression de la tour “ramène quelque chose” au monde.

---

## 9. Rôle narratif

Les matériaux ne sont pas seulement des ressources techniques.
Ils racontent aussi la nature de ce que le joueur combat.

### Minerai de fer
Raconte le concret, la forge, la réparation, le travail.

### Éclat d’épine
Raconte le vivant devenu hostile, la croissance dévoyée, la douleur végétale.

### Cendre condensée
Raconte la combustion, la lourdeur, l’usure, la malédiction qui se stabilise.

### Insigne d’avant-garde
Raconte la structure, la hiérarchie, la défense organisée de la tour.

En ce sens, les matériaux participent à la narration silencieuse du jeu.

---

## 10. Contraintes de cohérence

Les matériaux du MVP doivent toujours respecter les règles suivantes :

- chacun doit avoir une identité claire ;
- chacun doit être lié à un type de menace ou de palier ;
- aucun matériau ne doit sembler interchangeable avec un autre ;
- ils doivent être peu nombreux, mais significatifs ;
- ils doivent pouvoir être compris sans fiche externe.

Le joueur doit pouvoir associer intuitivement :
- une matière,
- un type d’ennemi,
- et une étape de progression.

---

## 11. Contraintes visuelles et front

Les matériaux doivent être immédiatement reconnaissables dans :
- l’inventaire ;
- les récompenses de combat ;
- les recettes ;
- les quêtes ;
- les shops si nécessaire.

### Règles d’affichage
Le front doit pouvoir montrer facilement :
- le nom ;
- l’icône ;
- la quantité ;
- une courte description ou catégorie.

### Lecture visuelle souhaitée

#### Minerai de fer
- brut ;
- minéral ;
- métallique ;
- solide.

#### Éclat d’épine
- organique ;
- pointu ;
- nerveux ;
- végétal corrompu.

#### Cendre condensée
- sombre ;
- dense ;
- granuleuse ou fragmentée ;
- chargée.

#### Insigne d’avant-garde
- structuré ;
- plus “objet” que “matière brute” ;
- marque de rang, jeton ou fragment identifiable.

---

## 12. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/04-objets/items-index.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/06-crafting/recettes-index.md`
- `docs/07-quetes/quetes-mvp-index.md`

Les matériaux prennent leur sens dans la rencontre entre :
- la tour,
- le loot,
- la transformation,
- et le retour au village.

---

## 13. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. définir les recettes :
   - `docs/06-crafting/recettes-index.md`

2. définir les objets clés :
   - `docs/04-objets/objets-cles.md`

3. détailler les équipements :
   - `docs/05-equipements/equipements-index.md`

4. rattacher certains matériaux à des quêtes ou déblocages précis

---

## 14. Résumé exécutif

Le noyau de matériaux du MVP repose sur quatre ressources principales :
- **Minerai de fer**
- **Éclat d’épine**
- **Cendre condensée**
- **Insigne d’avant-garde**

Ces matériaux donnent au loot de la tour une vraie valeur de transformation et de progression.
Ils permettent de relier les ennemis, les paliers et les systèmes du village à des objets concrets et mémorisables.

Leur rôle central est simple :
**faire comprendre que ce que le joueur arrache à la tour n’est pas seulement une récompense, mais aussi une matière du monde, déformée par la malédiction, que l’on peut encore réutiliser pour reconstruire.**
