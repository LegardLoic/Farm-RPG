# Accessoires MVP

> **Statut : document canonique actif**
> Ce document définit les accessoires canoniques du MVP.
> Il sert de référence active pour le front, l’inventaire, l’équipement du joueur, les builds, les récompenses et les futurs documents détaillés liés aux pièces de soutien et d’orientation fine.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les accessoires du MVP.

---

## 1. Rôle du document

Ce document fixe le noyau des accessoires du MVP.

Il permet de :
- définir quelles amulettes et bagues existent réellement ;
- préciser leur rôle dans la construction du héros ;
- donner au front une base claire pour les slots d’accessoires ;
- soutenir les builds sans introduire trop tôt un système trop complexe ;
- éviter la prolifération d’objets “petits bonus” sans identité.

Le MVP n’a pas besoin d’une grande collection d’accessoires.
Il a besoin d’un **petit ensemble d’objets de soutien lisibles, utiles et capables de faire sentir des orientations de build plus fines**.

---

## 2. Principes de conception des accessoires MVP

Les accessoires du MVP doivent respecter les règles suivantes :

### 2.1 Rôle de soutien, pas de noyade système
Les accessoires ne doivent pas remplacer le poids des armes ou des armures.
Ils doivent compléter, affiner, orienter.

### 2.2 Lisibilité
Le joueur doit comprendre rapidement :
- si l’accessoire soutient la survie, la vigueur, la magie ou un style particulier ;
- si c’est un objet passe-partout ou plus spécialisé.

### 2.3 Impact sensible mais mesuré
Un accessoire ne doit pas paraître inutile.
Il doit créer un petit vrai choix, sans devenir plus important qu’une arme ou un plastron.

### 2.4 Construction du héros
Les accessoires sont parfaits pour faire apparaître une idée essentielle du projet :
**le héros se construit par couches de choix, pas seulement par niveau.**

---

## 3. Slots d’accessoires canoniques du MVP

Le système d’accessoires du MVP couvre les slots suivants :

- Amulette
- Bague 1
- Bague 2

Ces trois slots suffisent largement pour donner de la finesse au build du héros sans compliquer excessivement l’interface.

---

## 4. Place des accessoires dans le MVP

Les accessoires remplissent plusieurs fonctions utiles :

### 4.1 Soutien de build
Ils permettent de renforcer légèrement une orientation :
- vigueur ;
- concentration ;
- stabilité ;
- précision ;
- équilibre.

### 4.2 Personnalisation légère
Ils donnent au joueur une façon simple d’ajuster son profil sans changer tout son équipement principal.

### 4.3 Récompense secondaire intéressante
Ils sont parfaits comme objets :
- de shop ;
- de récompense ;
- de progression intermédiaire.

### 4.4 Lisibilité du héros
Ils renforcent l’idée que le héros n’est pas seulement équipé “en gros”, mais aussi affiné dans sa façon d’aborder le jeu.

---

## 5. Répartition canonique des accessoires du MVP

Le noyau du MVP repose sur **2 grandes familles d’accessoires** :

### 5.1 Amulettes
Objets plus “centraux”, souvent liés à l’énergie, à la concentration ou à une orientation globale.

### 5.2 Bagues
Objets de soutien plus ciblés, permettant de cumuler de petits effets ou de soutenir une orientation particulière.

---

## 6. Vue d’ensemble des accessoires MVP

| Accessoire | ID technique recommandé | Slot | Orientation principale | Priorité |
|---|---|---|---|---|
| Amulette de focalisation | `focus_amulet` | Amulette | Intelligence / mana / compétences | Très haute |
| Amulette de vigueur | `vigor_amulet` | Amulette | Constitution / survie | Haute |
| Bague de vigueur | `vigor_ring` | Bague | HP / robustesse légère | Très haute |
| Bague de concentration | `clarity_ring` | Bague | Mana / soutien magie | Très haute |
| Bague de précision | `precision_ring` | Bague | Dextérité / fiabilité offensive | Haute |
| Bague de garde simple | `guard_ring` | Bague | Défense légère / stabilité | Haute |

Ce noyau suffit largement pour rendre les accessoires utiles dès le MVP.

---

## 7. Amulette de focalisation

### Nom affiché canonique
**Amulette de focalisation**

### ID technique recommandé
`focus_amulet`

### Slot
Amulette

### Orientation
Intelligence, mana, concentration, compétences.

### Rôle dans le MVP
L’Amulette de focalisation est l’accessoire de référence pour les builds orientés :
- compétences ;
- magie ;
- préparation ;
- usage plus fréquent des MP.

Elle sert à :
- donner une existence matérielle à la spécialisation intelligence ;
- soutenir les builds utilisant davantage les techniques ;
- renforcer l’intérêt des Toniques de mana et de la préparation.

Elle doit être perçue comme :
- utile ;
- discrètement précieuse ;
- plus orientée “maîtrise” que “force brute”.

### Ressenti recherché
Le joueur doit sentir :
**“si je veux jouer plus technique ou plus magique, cet objet m’aide à l’assumer.”**

### Priorité
- **très haute**

---

## 8. Amulette de vigueur

### Nom affiché canonique
**Amulette de vigueur**

### ID technique recommandé
`vigor_amulet`

### Slot
Amulette

### Orientation
Constitution, survie, stabilité.

### Rôle dans le MVP
L’Amulette de vigueur sert à :
- soutenir les builds plus résistants ;
- aider les joueurs qui veulent une marge de sécurité plus grande ;
- donner un pendant plus défensif à l’Amulette de focalisation.

Elle doit être perçue comme :
- rassurante ;
- simple ;
- utile dans les combats plus tendus ;
- moins flashy mais très concrète.

### Ressenti recherché
Le joueur doit sentir :
**“je choisis d’être plus stable, de mieux tenir, de me donner un peu plus de marge.”**

### Priorité
- **haute**

---

## 9. Bague de vigueur

### Nom affiché canonique
**Bague de vigueur**

### ID technique recommandé
`vigor_ring`

### Slot
Bague

### Orientation
HP, robustesse légère, maintien.

### Rôle dans le MVP
La Bague de vigueur est un excellent accessoire de base :
- simple à comprendre ;
- utile dans presque tous les builds ;
- rassurante sans être universellement dominante.

Elle sert à :
- donner une première sensation forte des bagues ;
- soutenir la survie ;
- rendre visibles les petits ajustements de build.

### Ressenti recherché
Le joueur doit comprendre :
**“un accessoire peut déjà changer quelque chose d’utile, même sans tout bouleverser.”**

### Priorité
- **très haute**

---

## 10. Bague de concentration

### Nom affiché canonique
**Bague de concentration**

### ID technique recommandé
`clarity_ring`

### Slot
Bague

### Orientation
Mana, concentration, soutien aux compétences.

### Rôle dans le MVP
La Bague de concentration sert à :
- soutenir les builds orientés INT / MP ;
- compléter l’Amulette de focalisation ;
- rendre la logique “build magie / techniques” plus lisible.

Elle doit être perçue comme :
- claire ;
- spécialisée ;
- légère mais précieuse.

### Ressenti recherché
Le joueur doit sentir :
**“je peux affiner ma manière de jouer, pas seulement empiler de la défense.”**

### Priorité
- **très haute**

---

## 11. Bague de précision

### Nom affiché canonique
**Bague de précision**

### ID technique recommandé
`precision_ring`

### Slot
Bague

### Orientation
Dextérité, fiabilité offensive, précision.

### Rôle dans le MVP
La Bague de précision sert à :
- soutenir les armes légères ou les profils plus techniques ;
- introduire une première finesse côté DEX ;
- montrer que tous les accessoires ne tournent pas autour de la survie ou de la magie.

Elle doit être perçue comme :
- plus fine ;
- plus orientée qualité d’exécution ;
- moins universelle, mais très utile pour certains joueurs.

### Ressenti recherché
Le joueur doit sentir :
**“je peux choisir d’être plus propre, plus net, plus fiable dans ma façon de frapper.”**

### Priorité
- **haute**

---

## 12. Bague de garde simple

### Nom affiché canonique
**Bague de garde simple**

### ID technique recommandé
`guard_ring`

### Slot
Bague

### Orientation
Défense légère, stabilité, maintien.

### Rôle dans le MVP
La Bague de garde simple sert à :
- compléter les builds défensifs ;
- offrir une option plus discrète qu’une grosse pièce d’armure ;
- aider à raffiner un héros frontal ou prudent.

Elle doit être perçue comme :
- modeste ;
- utile ;
- plus défensive que spectaculaire.

### Ressenti recherché
Le joueur doit comprendre :
**“même mes petits choix d’équipement peuvent renforcer ma manière de tenir le combat.”**

### Priorité
- **haute**

---

## 13. Rôle des accessoires dans les builds du MVP

Les accessoires du MVP doivent permettre de renforcer immédiatement quelques orientations :

### Build survie / frontal
- Amulette de vigueur
- Bague de vigueur
- Bague de garde simple

### Build magie / compétences
- Amulette de focalisation
- Bague de concentration

### Build dextérité / précision
- Bague de précision
- éventuellement combinée à des pièces plus légères

### Build hybride
- mélange d’une pièce de survie et d’une pièce de spécialisation

Le MVP ne cherche pas encore l’optimisation profonde.
Il cherche à faire sentir que :
**les accessoires changent la couleur du build, même sans tout redéfinir.**

---

## 14. Lien avec les statistiques du joueur

Les accessoires doivent rester cohérents avec :
- CON
- INT
- DEX
- parfois VIT ou une logique de stabilité

Ils servent surtout à :
- accompagner les choix de stats ;
- donner une finesse supplémentaire ;
- compenser légèrement certaines faiblesses ou accentuer une direction.

Ils ne doivent pas remplacer les armes ou armures comme support principal du build.

---

## 15. Lien avec le monde et les PNJ

Les accessoires peuvent être liés à :
- la forge du village pour certaines bagues ou amulettes simples ;
- des récompenses secondaires ;
- des quêtes plus personnelles ;
- de petits objets que l’on imagine fabriqués, transmis ou récupérés plutôt que massivement produits.

Ils peuvent ainsi renforcer la sensation que le monde offre aussi des objets plus intimes, plus fins, moins “bruts” que les armes et armures.

---

## 16. Contraintes de cohérence

Les accessoires du MVP doivent toujours respecter les règles suivantes :

- chaque accessoire doit avoir une orientation claire ;
- pas de redondance inutile ;
- les bonus doivent être simples à comprendre ;
- ils doivent compléter les builds, pas les brouiller ;
- ils doivent rester crédibles dans le monde du village et de la tour.

Le joueur doit pouvoir se dire rapidement :
- “ça m’aide à mieux tenir”,
- “ça soutient ma magie”,
- “ça affine mon style”.

---

## 17. Contraintes front et UI

Le front doit pouvoir afficher clairement :
- le slot ;
- le nom ;
- la rareté ;
- le bonus principal ;
- les comparaisons avec les accessoires déjà équipés.

### Priorités visuelles
- distinguer nettement amulettes et bagues ;
- faire sentir la fonction de soutien sans surcharger ;
- aider le joueur à lire rapidement si l’objet va dans un build vigueur, concentration, précision ou garde.

---

## 18. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/05-equipements/equipements-index.md`
- `docs/05-equipements/armes.md`
- `docs/05-equipements/armures.md`
- `docs/02-personnages/forgeron.md`
- `docs/00-projet/canon-mvp.md`

Les accessoires prennent leur sens au croisement de :
- la progression du héros,
- les choix fins de build,
- et la manière dont le monde soutient cette progression.

---

## 19. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. `docs/05-equipements/progression-equipement-mvp.md`
2. si besoin, fiches détaillées par accessoire majeur
3. puis consolidation des rewards de quêtes et de shops

---

## 20. Résumé exécutif

Le noyau d’accessoires du MVP repose sur un petit ensemble lisible :
- deux amulettes,
- quatre bagues.

Ce catalogue suffit à introduire une vraie finesse de build sans compliquer l’expérience.
Les accessoires du MVP doivent renforcer la sensation que le héros ne progresse pas seulement en puissance brute, mais aussi par ajustements fins de sa manière de combattre et de tenir.

Leur rôle central est simple :
**ils donnent de la nuance au build, et cette nuance aide le joueur à faire du héros quelqu’un de plus précis, plus solide ou plus concentré selon ses choix.**
