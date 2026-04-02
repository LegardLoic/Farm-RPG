# Bestiaire MVP - Index

> **Statut : document canonique actif**
> Ce document recense les monstres canoniques du MVP et fixe leur rôle global, leur place dans la progression, leur identité de menace et leur utilité de production.
> Il sert de référence active pour le front, le combat, les fiches monstres détaillées, les visuels, les loot tables et la mise en scène de la tour.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour le bestiaire du MVP.

---

## 1. Rôle du document

Ce document sert d’index de référence pour le bestiaire du MVP.

Il permet de :
- définir quels monstres existent réellement dans le MVP ;
- organiser leur place dans la tour ;
- distinguer ennemis communs, élites, mini-boss et boss ;
- guider les futures fiches détaillées ;
- fournir une base lisible pour le front, les rencontres, les loot tables et les dialogues liés à la progression.

Le MVP n’a pas besoin d’un bestiaire gigantesque.
Il a besoin d’un **bestiaire réduit mais cohérent, lisible et mémorisable**.

---

## 2. Principes de bestiaire du MVP

Le bestiaire du MVP doit respecter les règles suivantes :

### 2.1 Lisibilité avant quantité
Chaque ennemi doit être identifiable rapidement :
- silhouette claire ;
- rôle de combat compréhensible ;
- place logique dans la progression.

### 2.2 Progression visible
Le joueur doit sentir que les étages supérieurs introduisent :
- plus de danger ;
- plus d’étrangeté ;
- plus de présence de la malédiction ;
- des affrontements plus marquants.

### 2.3 Cohérence avec la tour
Les monstres du MVP doivent tous sembler appartenir au même écosystème de menace :
- corruption ;
- altération ;
- dérèglement ;
- violence anormale ;
- présence d’une force qui déforme le vivant ou le réel.

### 2.4 Production raisonnable
Le MVP doit se concentrer sur :
- quelques ennemis communs récurrents ;
- quelques ennemis plus marquants ;
- des rencontres scriptées sur les paliers ;
- un boss majeur à l’étage 10.

---

## 3. Structure du bestiaire MVP

Le bestiaire du MVP est organisé en 4 catégories :

### 3.1 Ennemis communs
Rencontres de base.
Ils structurent les combats réguliers et l’apprentissage du joueur.

### 3.2 Ennemis intermédiaires / élites
Rencontres plus dangereuses ou plus spécialisées.
Ils servent à enrichir la montée en tension entre deux grands paliers.

### 3.3 Mini-boss / gardiens de palier
Rencontres marquantes sur les étapes importantes de la tour.
Ils servent à donner une identité forte aux seuils 3 / 5 / 8.

### 3.4 Boss majeur MVP
Rencontre principale de l’étage 10.
Elle représente la première vraie fracture de la malédiction dans le jeu.

---

## 4. Orientation globale du bestiaire

Le bestiaire du MVP doit évoquer :
- une faune ou pseudo-faune corrompue ;
- des créatures altérées par la tour ;
- des gardiens devenus hostiles ;
- des formes de vie ou de matière transformées par une force anormale.

L’identité du bestiaire doit progressivement glisser :
- du **dangereux mais compréhensible** ;
- vers le **dérangé** ;
- puis vers le **franchement inquiétant**.

Le joueur doit sentir que plus il monte, plus les créatures semblent :
- moins naturelles ;
- plus tendues ;
- plus “déformées” dans leur logique.

---

## 5. Ennemis canoniques du MVP

## 5.1 Ennemis communs

### Gobelin forestier
**ID technique recommandé :** `forest_goblin`

Rôle :
- ennemi de base ;
- première lecture de la menace ;
- adversaire simple d’apprentissage.

Fonction gameplay :
- introduire le combat régulier ;
- servir de base aux premiers affrontements.

Fonction fictionnelle :
- montrer que même les créatures opportunistes ordinaires sont happées par l’influence de la tour ;
- premier visage de l’hostilité du monde.

Présence :
- étages bas ;
- combats standards.

Priorité :
- **très haute**

---

### Éclaireur cendré
**ID technique recommandé :** `ash_scout`

Rôle :
- ennemi rapide ou plus agressif ;
- variation de pression intermédiaire.

Fonction gameplay :
- enrichir la variété des combats communs ;
- soutenir la montée de danger à partir des premiers étages intermédiaires.

Fonction fictionnelle :
- créature déjà plus marquée par la tour ;
- évoque la brûlure, les cendres, la progression vers une corruption plus active.

Présence :
- étages intermédiaires ;
- rencontre commune avancée.

Priorité :
- **haute**

---

### Mannequin d’entraînement détourné
**ID technique recommandé :** `training_dummy`

Rôle :
- ennemi anormal, presque absurde mais inquiétant ;
- créature artificielle ou résidu d’un lieu détourné.

Fonction gameplay :
- variation visuelle et tonale ;
- combat simple, potentiellement utile pour casser la monotonie.

Fonction fictionnelle :
- montre que la tour corrompt aussi les objets, les outils ou les restes de fonctions anciennes ;
- introduit l’idée que tout peut devenir hostile.

Présence :
- ponctuelle ;
- rencontre de transition ou variation.

Priorité :
- **moyenne à haute**

---

## 5.2 Ennemis intermédiaires / élites

### Bête d’épines
**ID de famille recommandé :** `thorn_beast`

Rôle :
- créature plus brutale ;
- incarnation d’une agressivité végétale corrompue.

Fonction gameplay :
- menace physique plus forte ;
- peut préparer le terrain au boss/mini-boss de palier 3.

Fonction fictionnelle :
- relie la nature et la corruption ;
- montre que le vivant lui-même se retourne.

Présence :
- étages bas à intermédiaires ;
- variante élite possible.

Priorité :
- **haute**

---

### Gardien de braise
**ID de famille recommandé :** `cinder_warden`

Rôle :
- ennemi plus dangereux lié à la chaleur, à la cendre, à la pression continue.

Fonction gameplay :
- faire monter la menace sur le palier 5 ;
- préparer des mécaniques de pression plus marquées.

Fonction fictionnelle :
- matérialise une tour plus agressive et plus punitive ;
- fait ressentir une corruption active, presque militarisée ou ritualisée.

Présence :
- palier 5 ou alentours.

Priorité :
- **très haute**

---

### Capitaine d’avant-garde cendreuse
**ID de famille recommandé :** `ash_vanguard_captain`

Rôle :
- élite disciplinée ou figure de commandement ;
- menace plus structurée.

Fonction gameplay :
- introduire une sensation d’ennemi plus “intelligent” ou plus organisé ;
- montée de tension vers le palier 8.

Fonction fictionnelle :
- montre que la menace de la tour n’est pas qu’un chaos brut ;
- laisse pressentir une hiérarchie ou une volonté derrière la corruption.

Présence :
- étages intermédiaires avancés ;
- seuil palier 8.

Priorité :
- **très haute**

---

## 5.3 Mini-boss / gardiens scriptés

### Alpha des bêtes d’épines
**ID technique recommandé :** `thorn_beast_alpha`

Rôle :
- premier gardien marquant ;
- mini-boss ou rencontre scriptée du palier 3.

Fonction gameplay :
- premier vrai test de progression ;
- rupture avec les combats purement standards ;
- validation d’un premier cap.

Fonction fictionnelle :
- première preuve claire que la tour oppose des nœuds plus denses de corruption ;
- début de la sensation “ce lieu résiste à ma progression”.

Présence :
- **étage 3**

Priorité :
- **très haute**

---

### Gardien des cendres
**ID technique recommandé :** `cinder_warden`

Rôle :
- mini-boss ou boss intermédiaire du palier 5.

Fonction gameplay :
- combat plus technique ;
- première vraie montée de pression notable.

Fonction fictionnelle :
- marque une transition plus sombre dans la tour ;
- fait sentir que l’on entre dans une zone moins “instable” et plus franchement hostile.

Présence :
- **étage 5**

Priorité :
- **très haute**

---

### Capitaine d’avant-garde cendreuse
**ID technique recommandé :** `ash_vanguard_captain`

Rôle :
- boss intermédiaire ou mini-boss majeur du palier 8.

Fonction gameplay :
- combat de milieu/fin de MVP ;
- affrontement préparant le boss final de l’étage 10.

Fonction fictionnelle :
- figure d’autorité hostile ;
- laisse sentir l’existence d’une organisation ou d’une logique de défense autour du sommet.

Présence :
- **étage 8**

Priorité :
- **très haute**

---

## 5.4 Boss majeur MVP

### Avatar du Cœur de la Malédiction
**ID technique recommandé :** `curse_heart_avatar`

Rôle :
- boss majeur de l’étage 10 ;
- premier grand mur narratif et ludique du MVP.

Fonction gameplay :
- conclure la progression 1-10 ;
- représenter un vrai pic de danger ;
- valider toute la boucle ferme ↔ village ↔ tour.

Fonction fictionnelle :
- matérialiser la malédiction sous une forme plus pure, plus inquiétante et moins simplement “monstrueuse” ;
- faire comprendre que la tour n’abrite pas seulement des créatures altérées, mais aussi des manifestations directes du mal.

Présence :
- **étage 10**

Priorité :
- **critique**

---

## 6. Table de synthèse du bestiaire MVP

| Ennemi | ID technique | Catégorie | Zone / palier | Fonction principale | Priorité |
|---|---|---|---|---|---|
| Gobelin forestier | `forest_goblin` | Commun | Étages bas | Apprentissage combat | Très haute |
| Éclaireur cendré | `ash_scout` | Commun / intermédiaire | Étages intermédiaires | Variation offensive | Haute |
| Mannequin d’entraînement détourné | `training_dummy` | Commun / variation | Transition | Étrangeté / variété | Moyenne à haute |
| Bête d’épines | `thorn_beast` | Intermédiaire / élite | Bas à intermédiaire | Pression physique / corruption du vivant | Haute |
| Alpha des bêtes d’épines | `thorn_beast_alpha` | Mini-boss | Étage 3 | Premier cap marqué | Très haute |
| Gardien des cendres | `cinder_warden` | Mini-boss / boss intermédiaire | Étage 5 | Pression forte / montée de menace | Très haute |
| Capitaine d’avant-garde cendreuse | `ash_vanguard_captain` | Boss intermédiaire | Étage 8 | Ennemi structuré / seuil avancé | Très haute |
| Avatar du Cœur de la Malédiction | `curse_heart_avatar` | Boss majeur | Étage 10 | Conclusion MVP | Critique |

---

## 7. Répartition recommandée dans la tour

### Étages 1 à 2
Objectif :
- découverte ;
- apprentissage ;
- premières menaces identifiables.

Types de rencontres recommandés :
- gobelins forestiers ;
- mannequins détournés ;
- premières bêtes d’épines légères ou variantes simples.

### Étage 3
Objectif :
- premier vrai palier ;
- première rencontre scriptée importante.

Rencontre canonique :
- `thorn_beast_alpha`

### Étages 4 à 5
Objectif :
- montée en pression ;
- apparition de créatures plus agressives ou plus “cendrées”.

Types de rencontres recommandés :
- `ash_scout`
- variantes plus dures des ennemis précédents
- préparation au `cinder_warden`

### Étage 5
Rencontre canonique :
- `cinder_warden`

### Étages 6 à 7
Objectif :
- densification de la menace ;
- ennemis plus spécialisés ;
- ressenti d’un lieu moins sauvage et plus défendu.

Types de rencontres recommandés :
- `ash_scout`
- créatures liées aux cendres / à la garde / à la corruption organisée
- préparation au palier 8

### Étage 8
Rencontre canonique :
- `ash_vanguard_captain`

### Étages 9 à 10
Objectif :
- tension finale ;
- atmosphère plus lourde ;
- présence directe de la malédiction.

Types de rencontres recommandés :
- ennemis plus rares mais plus menaçants ;
- variations avancées ou formes plus inquiétantes ;
- préparation à `curse_heart_avatar`

### Étage 10
Rencontre canonique :
- `curse_heart_avatar`

---

## 8. Règles de cohérence visuelle

Tous les monstres du MVP doivent respecter les principes suivants :

### 8.1 Silhouette claire
Chaque ennemi doit être reconnaissable rapidement.

### 8.2 Palette cohérente
Le bestiaire doit progressivement dériver :
- du naturel altéré ;
- vers le brûlé, le cendré, le corrompu ;
- puis vers une présence plus abstraite ou plus maudite.

### 8.3 Lecture de la menace
Le joueur doit pouvoir sentir visuellement :
- si l’ennemi est simple, brutal, rapide, dangereux ou anormal ;
- si l’on est face à une rencontre standard ou à un seuil important.

### 8.4 Cohérence de tour
Même les monstres les plus différents doivent sembler appartenir à la même “maladie du monde”.

---

## 9. Règles de cohérence gameplay

Les futurs monstres détaillés devront respecter les règles suivantes :

- chaque ennemi doit avoir un rôle lisible ;
- les combats ne doivent pas devenir confus trop tôt ;
- les monstres de palier doivent avoir une identité plus forte que les communs ;
- les boss doivent donner un vrai sentiment de cap franchi ;
- les ennemis doivent servir la montée de tension, pas seulement remplir des cases.

---

## 10. Lien avec le lore du MVP

Le bestiaire du MVP doit raconter plusieurs choses sans longs discours :

- la tour altère ce qu’elle touche ;
- le vivant peut devenir hostile ;
- la corruption peut toucher autant la chair que la matière ;
- certaines formes de menace semblent chaotiques ;
- d’autres paraissent déjà organisées ;
- plus on monte, plus la malédiction devient directe.

Le bestiaire doit donc participer au récit, pas seulement au combat.

---

## 11. Besoins de production recommandés

Pour chaque monstre détaillé, il faudra à terme prévoir :

- une fiche individuelle ;
- un nom affiché canonique ;
- une description visuelle ;
- un rôle de combat ;
- une zone d’apparition ;
- un loot principal ;
- une note de lore ;
- des besoins front (portrait, sprite, variantes, FX si besoin).

Les fiches détaillées prioritaires à produire ensuite sont :

1. `forest-goblin.md`
2. `thorn-beast-alpha.md`
3. `cinder-warden.md`
4. `ash-vanguard-captain.md`
5. `curse-heart-avatar.md`

---

## 12. Résumé exécutif

Le bestiaire du MVP repose sur un noyau réduit mais structuré :
- quelques ennemis communs ;
- quelques menaces intermédiaires ;
- trois seuils marquants ;
- un boss majeur final à l’étage 10.

Ce bestiaire doit soutenir la progression de la tour, la montée en tension et l’identité de la malédiction.

Il ne cherche pas encore la quantité.
Il cherche la cohérence, la lisibilité et la capacité à faire ressentir une vérité simple :
**plus le joueur monte, plus ce qu’il affronte ressemble moins à de simples monstres et davantage à une déformation du monde lui-même.**
