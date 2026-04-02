# Armes MVP

> **Statut : document canonique actif**
> Ce document définit les armes canoniques du MVP.
> Il sert de référence active pour le front, l’inventaire, l’équipement du joueur, le shop du Forgeron, la progression combat et les futurs documents détaillés liés aux builds offensifs.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les armes du MVP.

---

## 1. Rôle du document

Ce document fixe le noyau des armes du MVP.

Il permet de :
- définir quelles armes existent réellement ;
- structurer leur rôle dans la progression du joueur ;
- relier les armes aux statistiques et styles de jeu ;
- guider la production front et la boutique du Forgeron ;
- éviter une explosion trop précoce du catalogue offensif.

Le MVP n’a pas besoin d’un arsenal immense.
Il a besoin d’un **petit noyau d’armes lisibles, crédibles et suffisamment distinctes pour faire sentir les premières vraies orientations de build**.

---

## 2. Principes de conception des armes MVP

Les armes du MVP doivent respecter les règles suivantes :

### 2.1 Lisibilité immédiate
Le joueur doit comprendre rapidement :
- si l’arme est simple, lourde, légère ou orientée focus ;
- quel type de style elle soutient ;
- si elle relève d’un palier basique ou plus avancé.

### 2.2 Progression concrète
Chaque nouvelle arme importante doit donner l’impression :
- d’un vrai gain ;
- d’une meilleure spécialisation ;
- d’un cap franchi grâce à la tour et au village.

### 2.3 Compatibilité avec le système de build
Les armes doivent déjà soutenir plusieurs orientations :
- force ;
- dextérité ;
- intelligence / focus ;
- polyvalence raisonnable.

### 2.4 Production raisonnable
Le MVP doit éviter :
- 15 épées presque identiques ;
- des statistiques trop fines trop tôt ;
- des armes cool visuellement mais sans rôle clair.

---

## 3. Place des armes dans le MVP

Les armes sont parmi les équipements les plus visibles de la progression du joueur.

Elles doivent remplir plusieurs fonctions :
- augmenter les performances offensives ;
- rendre les choix de build plus lisibles ;
- donner au shop du Forgeron un vrai poids ;
- soutenir les compétences liées à l’équipement dans certains cas.

Le joueur doit sentir que changer d’arme n’est pas seulement “+2 dégâts”, mais aussi :
- une nouvelle orientation ;
- une nouvelle posture ;
- une nouvelle manière d’aborder le combat.

---

## 4. Répartition canonique des armes du MVP

Le noyau du MVP repose sur **4 grands archétypes d’armes** :

### 4.1 Arme simple de mêlée
Arme de base, accessible, lisible.

### 4.2 Arme lourde
Arme orientée force / impact / front.

### 4.3 Arme légère
Arme orientée précision / dextérité / rythme.

### 4.4 Focus ou arme de canalisation
Objet orienté intelligence, mana ou compétences.

Ces archétypes suffisent largement pour le MVP.

---

## 5. Vue d’ensemble des armes MVP

| Arme | ID technique recommandé | Orientation principale | Slot | Priorité |
|---|---|---|---|---|
| Épée de fer simple | `iron_sword_basic` | Polyvalente / force légère | Main droite | Critique |
| Lame renforcée | `steel_sword_advanced` | Force / progression intermédiaire | Main droite | Très haute |
| Dague d’éclaireur | `ash_dagger_light` | Dextérité / rapidité | Main droite | Haute |
| Catalyseur de braise | `ember_focus` | Intelligence / compétences | Main gauche ou main droite selon système | Haute |
| Marteau de garde | `warden_hammer` | Force / impact | Main droite | Moyenne à haute |
| Bouclier de garde | `tower_guard_shield` | Défense / soutien build frontal | Main gauche | Très haute |

Note :
Le bouclier figure ici car il interagit directement avec les choix d’armement main gauche / main droite, même s’il a aussi une valeur défensive.

---

## 6. Épée de fer simple

### Nom affiché canonique
**Épée de fer simple**

### ID technique recommandé
`iron_sword_basic`

### Catégorie
Arme de mêlée simple

### Slot
Main droite

### Orientation
Polyvalente, accessible, orientation force légère ou build neutre.

### Rôle dans le MVP
L’Épée de fer simple est l’arme de référence du début/milieu de MVP.
Elle sert à :
- poser une base offensive claire ;
- équiper le joueur d’une arme crédible sans le spécialiser trop tôt ;
- donner au Forgeron un premier objet très lisible.

Elle doit être perçue comme :
- fiable ;
- propre ;
- solide ;
- sans sophistication excessive.

### Ressenti recherché
Le joueur doit sentir :
**“j’ai enfin une vraie arme, pas juste une présence abstraite dans mes stats.”**

### Priorité
- **critique**

---

## 7. Lame renforcée

### Nom affiché canonique
**Lame renforcée**

### ID technique recommandé
`steel_sword_advanced`

### Catégorie
Arme de mêlée intermédiaire

### Slot
Main droite

### Orientation
Force / progression offensive intermédiaire.

### Rôle dans le MVP
La Lame renforcée doit représenter une progression visible par rapport à l’Épée de fer simple.
Elle sert à :
- donner au joueur une arme plus affirmée ;
- matérialiser l’ouverture d’un nouveau palier du Forgeron ;
- renforcer l’idée d’une montée en puissance concrète.

Elle doit être perçue comme une arme :
- plus sérieuse ;
- plus lourde ;
- plus tranchante ;
- plus “milieu de MVP” que l’arme de base.

### Ressenti recherché
Le joueur doit sentir :
**“je ne fais plus seulement face à la tour ; je commence à être équipé pour lui répondre.”**

### Priorité
- **très haute**

---

## 8. Dague d’éclaireur

### Nom affiché canonique
**Dague d’éclaireur**

### ID technique recommandé
`ash_dagger_light`

### Catégorie
Arme légère

### Slot
Main droite

### Orientation
Dextérité, précision, style plus nerveux.

### Rôle dans le MVP
La Dague d’éclaireur donne au système un premier vrai parfum de spécialisation.
Elle sert à :
- montrer qu’il n’existe pas qu’une seule manière de progresser offensivement ;
- soutenir un style plus léger, plus rapide ou plus précis ;
- différencier les builds dès le MVP.

Elle doit être perçue comme :
- mobile ;
- incisive ;
- plus technique que brutale.

### Ressenti recherché
Le joueur doit sentir :
**“je peux commencer à jouer autrement qu’en montant juste ma force et ma défense.”**

### Priorité
- **haute**

---

## 9. Catalyseur de braise

### Nom affiché canonique
**Catalyseur de braise**

### ID technique recommandé
`ember_focus`

### Catégorie
Focus / arme de canalisation

### Slot
Main gauche ou main droite selon l’implémentation retenue

### Orientation
Intelligence, mana, soutien aux compétences.

### Rôle dans le MVP
Le Catalyseur de braise est là pour rendre visible l’orientation intelligence / magie / concentration.
Il sert à :
- soutenir les builds axés sur les compétences ;
- donner une existence matérielle au jeu plus orienté MP ;
- éviter que les styles magiques restent trop abstraits dans le MVP.

Il doit être perçu comme :
- spécialisé ;
- plus rare ou plus subtil ;
- moins universel que l’épée de base.

### Ressenti recherché
Le joueur doit comprendre :
**“je peux aussi m’équiper pour mieux lancer, soutenir ou amplifier mes capacités.”**

### Priorité
- **haute**

---

## 10. Marteau de garde

### Nom affiché canonique
**Marteau de garde**

### ID technique recommandé
`warden_hammer`

### Catégorie
Arme lourde

### Slot
Main droite

### Orientation
Force, impact, frontalité.

### Rôle dans le MVP
Le Marteau de garde sert à :
- représenter l’arme lourde du catalogue ;
- donner une orientation plus massive et plus brutale ;
- incarner un style de combat plus lent mais plus puissant.

Il doit être perçu comme :
- lourd ;
- stable ;
- intimidant ;
- moins polyvalent mais plus marquant.

### Ressenti recherché
Le joueur doit sentir :
**“je m’équipe pour frapper fort et tenir le front.”**

### Priorité
- **moyenne à haute**

---

## 11. Bouclier de garde

### Nom affiché canonique
**Bouclier de garde**

### ID technique recommandé
`tower_guard_shield`

### Catégorie
Arme défensive / équipement main gauche

### Slot
Main gauche

### Orientation
Défense, robustesse, build frontal.

### Rôle dans le MVP
Le Bouclier de garde est très important parce qu’il rend immédiatement lisible la logique “main droite / main gauche”.
Il sert à :
- soutenir les builds plus défensifs ;
- compléter l’identité du joueur frontal ;
- donner au Forgeron un objet fort visuellement et fonctionnellement.

Il doit être perçu comme :
- protecteur ;
- robuste ;
- très concret dans l’idée qu’il transforme la tenue du héros.

### Ressenti recherché
Le joueur doit sentir :
**“je ne m’équipe pas seulement pour frapper ; je choisis aussi comment encaisser.”**

### Priorité
- **très haute**

---

## 12. Rôle des armes dans les builds du MVP

Les armes du MVP doivent rendre immédiatement lisibles quelques orientations :

### Build neutre / début de jeu
- Épée de fer simple

### Build force
- Lame renforcée
- Marteau de garde
- Bouclier de garde en soutien

### Build dextérité
- Dague d’éclaireur

### Build intelligence
- Catalyseur de braise

### Build hybride raisonnable
- combinaison arme simple + accessoire / focus / stats mixtes

Le MVP n’a pas besoin de verrouiller toutes les combinaisons, mais il doit déjà les rendre perceptibles.

---

## 13. Lien avec les compétences liées à l’équipement

Certaines armes du MVP peuvent porter ou soutenir des compétences liées.

Exemples d’intention :
- arme lourde → compétence d’impact / charge
- focus → compétence liée à la concentration ou à la projection magique
- arme défensive → option utilitaire ou de maintien

Le MVP ne doit pas saturer ce système, mais il doit déjà le rendre crédible.

---

## 14. Progression et déblocage

Les armes doivent suivre une logique de déblocage liée à :
- la progression du Forgeron ;
- les matériaux ramenés de la tour ;
- les paliers narratifs ;
- l’ouverture de nouveaux tiers de shop.

Le joueur doit sentir que :
- l’accès aux meilleures armes n’est pas arbitraire ;
- elles arrivent parce que le monde recommence à fonctionner ;
- chaque nouvelle arme raconte un progrès du village autant qu’un progrès du héros.

---

## 15. Contraintes de cohérence

Les armes du MVP doivent toujours respecter les règles suivantes :

- chaque arme doit avoir une identité claire ;
- pas de redondance excessive ;
- pas d’armes purement décoratives ;
- le catalogue doit rester petit mais expressif ;
- les armes du Forgeron doivent sembler fabriquées, crédibles et intégrées au monde.

Le joueur doit pouvoir associer rapidement :
- une arme,
- une orientation,
- et une promesse de style de jeu.

---

## 16. Contraintes front et UI

Le front doit pouvoir afficher clairement :
- le slot ;
- la rareté ;
- les bonus ;
- les prérequis éventuels ;
- la compétence liée si elle existe ;
- la comparaison avec l’arme équipée.

### Priorités visuelles
- distinguer clairement une arme légère, une arme lourde et un focus ;
- rendre la progression visuelle lisible ;
- aider le joueur à voir immédiatement s’il s’agit d’un upgrade ou d’un changement d’orientation.

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/05-equipements/equipements-index.md`
- `docs/02-personnages/forgeron.md`
- `docs/04-objets/materiaux.md`
- `docs/00-projet/canon-mvp.md`

Les armes prennent leur sens au croisement de :
- la progression combat,
- la forge,
- la tour,
- et la construction du héros.

---

## 18. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. `docs/05-equipements/armures.md`
2. `docs/05-equipements/accessoires.md`
3. `docs/05-equipements/progression-equipement-mvp.md`

Puis :
4. fiches détaillées si besoin par arme majeure

---

## 19. Résumé exécutif

Le noyau d’armes du MVP repose sur un petit ensemble lisible :
- une arme simple,
- une arme intermédiaire plus marquée,
- une arme légère,
- une arme lourde,
- un focus,
- et un bouclier.

Ce catalogue suffit à rendre visibles plusieurs orientations de build sans surcharger le jeu.
Les armes du MVP doivent donner au joueur une vraie sensation de progression, de choix et de matérialité.

Leur rôle central est clair :
**elles ne servent pas seulement à infliger plus de dégâts ; elles servent à faire exister la manière dont le héros choisit d’affronter la tour.**
