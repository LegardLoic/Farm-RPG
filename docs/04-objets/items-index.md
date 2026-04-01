# Index des objets MVP

> **Statut : document canonique actif**
> Ce document recense les objets canoniques du MVP et fixe leur rôle global, leur catégorie, leur fonction dans la boucle de jeu et leur priorité de production.
> Il sert de référence active pour le front, l’inventaire, les shops, le crafting, les loot tables, les quêtes et les futurs documents détaillés sur les objets.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les objets du MVP.

---

## 1. Rôle du document

Ce document sert d’index de référence pour les objets du MVP.

Il permet de :
- définir quelles catégories d’objets existent réellement ;
- organiser leur place dans la boucle de jeu ;
- distinguer les objets de consommation, de culture, de ressource, de quête et de progression ;
- guider la production front et système ;
- fournir une base claire pour les fiches détaillées à venir.

Le MVP n’a pas besoin d’une énorme quantité d’objets.
Il a besoin d’un **catalogue réduit, utile, cohérent et immédiatement exploitable**.

---

## 2. Principes de conception des objets MVP

Les objets du MVP doivent respecter les règles suivantes :

### 2.1 Utilité claire
Chaque objet du MVP doit avoir une fonction compréhensible :
- planter ;
- récolter ;
- vendre ;
- crafter ;
- soigner ;
- préparer le combat ;
- débloquer une étape.

### 2.2 Lisibilité
Le joueur doit rapidement comprendre :
- à quoi sert l’objet ;
- où il s’obtient ;
- s’il doit le consommer, le vendre, le garder ou le transformer.

### 2.3 Boucle hybride
Les objets doivent nourrir la boucle centrale :
- la ferme produit ;
- le village échange ;
- la tour récompense ;
- le craft transforme ;
- le combat consomme.

### 2.4 Production raisonnable
Le MVP doit éviter les objets redondants ou décoratifs sans usage clair.
Chaque entrée doit justifier son existence.

---

## 3. Catégories canoniques d’objets du MVP

Le MVP repose sur **5 grandes familles d’objets** :

### 3.1 Consommables
Objets utilisés pour restaurer, soutenir ou préparer le joueur.

### 3.2 Graines et récoltes
Objets liés à la ferme, à la culture et à l’économie de base.

### 3.3 Matériaux
Objets issus du loot, de la progression ou de certaines récoltes, servant au craft, au loot de palier ou à certaines quêtes.

### 3.4 Objets clés
Objets rares ou scriptés, liés aux paliers, aux quêtes ou à des déblocages précis.

### 3.5 Objets d’équipement
Ils existent bien dans le jeu, mais leur index détaillé est traité dans `docs/05-equipements/`.
Le présent document les mentionne seulement comme famille connectée aux autres systèmes.

---

## 4. Vue d’ensemble du catalogue MVP

| Catégorie | Fonction principale | Source principale | Priorité |
|---|---|---|---|
| Consommables | Soutien combat / préparation | Craft, loot, shop | Très haute |
| Graines | Production ferme | Village / shop | Très haute |
| Récoltes | Économie / craft | Ferme | Très haute |
| Matériaux | Craft, loot, progression | Tour, loot, parfois ferme | Haute |
| Objets clés | Quêtes, paliers, déblocages | Tour / quêtes | Haute |
| Équipements | Progression combat | Shop, loot, progression | Très haute |

---

## 5. Consommables canoniques du MVP

Les consommables du MVP doivent rester peu nombreux mais essentiels.

### 5.1 Herbe de soin
**ID technique recommandé :** `healing_herb`

Fonction :
- soin simple ;
- consommable de base ;
- soutien direct à la survie.

Source principale :
- craft ;
- inventaire ;
- éventuellement loot ou récompense simple.

Rôle dans le MVP :
- premier objet de soin lisible ;
- lien direct entre ferme/craft et survie en combat.

Priorité :
- **critique**

---

### 5.2 Tonique de mana
**ID technique recommandé :** `mana_tonic`

Fonction :
- restauration de mana ;
- soutien aux compétences ;
- préparation de combat.

Source principale :
- craft ;
- progression ;
- éventuel déblocage plus avancé que l’Herbe de soin.

Rôle dans le MVP :
- permet de soutenir les compétences et la préparation ;
- renforce l’intérêt du craft et de certaines récoltes.

Priorité :
- **très haute**

---

### 5.3 Consommables avancés MVP (option limitrophe)
Le MVP peut en préparer certains très légèrement, mais ils ne doivent pas surcharger le système.
Exemples potentiels :
- consommable d’endurance ;
- version améliorée d’un soin ;
- version renforcée de tonique.

Ces objets ne sont pas indispensables au noyau strict, mais peuvent exister comme ouverture.

Priorité :
- **moyenne**

---

## 6. Graines canoniques du MVP

Les graines sont la base de la ferme.
Elles doivent être simples, peu nombreuses et immédiatement compréhensibles.

### 6.1 Graines de navet
**ID technique recommandé :** `turnip_seed`

Fonction :
- culture de base ;
- apprentissage de la boucle ferme ;
- première économie simple.

Produit associé :
- `turnip`

Priorité :
- **critique**

---

### 6.2 Graines de carotte
**ID technique recommandé :** `carrot_seed`

Fonction :
- seconde culture du MVP ;
- progression légère dans la ferme ;
- soutien au craft ou à la vente.

Produit associé :
- `carrot`

Priorité :
- **très haute**

---

### 6.3 Graines de blé
**ID technique recommandé :** `wheat_seed`

Fonction :
- culture un peu plus avancée ;
- variation économique ;
- possible utilité renforcée dans la progression.

Produit associé :
- `wheat`

Priorité :
- **très haute**

---

## 7. Récoltes canoniques du MVP

Les récoltes doivent avoir une double utilité :
- vente ;
- transformation ou progression.

### 7.1 Navet
**ID technique recommandé :** `turnip`

Fonction :
- vente simple ;
- progression ferme ;
- support possible de quête ou craft léger.

Priorité :
- **critique**

---

### 7.2 Carotte
**ID technique recommandé :** `carrot`

Fonction :
- vente ;
- ressource de craft ;
- progression économique légèrement supérieure.

Priorité :
- **très haute**

---

### 7.3 Blé
**ID technique recommandé :** `wheat`

Fonction :
- vente ;
- ressource de craft ;
- symbole de progression agricole plus stable.

Priorité :
- **très haute**

---

## 8. Matériaux canoniques du MVP

Les matériaux du MVP doivent rester lisibles et peu nombreux.

### 8.1 Minerai de fer
**ID technique recommandé :** `iron_ore`

Fonction :
- matériau simple lié à la progression d’équipement ;
- récompense de loot ou ressource utile.

Source principale :
- tour ;
- loot ;
- récompenses.

Lien système :
- shop / forge / progression.

Priorité :
- **haute**

---

### 8.2 Éclat d’épine
**ID technique recommandé :** `thorn_shard`

Fonction :
- matériau lié au vivant corrompu ;
- preuve ou ressource issue d’ennemis végétaux/corrompus ;
- usage possible en craft, quête ou loot significatif.

Source principale :
- ennemis type bêtes d’épines ;
- paliers bas / intermédiaires.

Priorité :
- **haute**

---

### 8.3 Cendre condensée
**ID technique recommandé :** `cinder_fragment` ou `condensed_cinder`

Fonction :
- matériau lié au palier cendre / braise ;
- ressource plus avancée ;
- support potentiel de quête, loot boss ou craft.

Source principale :
- ennemis du thème cendre ;
- palier 5 et au-delà.

Priorité :
- **haute**

---

### 8.4 Insigne ou fragment de garde
**ID technique recommandé :** `vanguard_token`

Fonction :
- matériau / trophée de progression ;
- ressource plus avancée ou marque de palier.

Source principale :
- ennemis plus structurés ;
- palier 8.

Priorité :
- **moyenne à haute**

---

## 9. Objets clés canoniques du MVP

Les objets clés du MVP doivent rester peu nombreux, mais marquants.

### 9.1 Preuve du palier 3
**ID technique recommandé :** `floor_3_proof` ou équivalent

Fonction :
- support narratif ;
- preuve d’avancée ;
- utilisation possible pour quête / déblocage / dialogue.

Source principale :
- palier 3.

Priorité :
- **moyenne**

---

### 9.2 Preuve du palier 5
**ID technique recommandé :** `floor_5_proof` ou équivalent

Fonction :
- progression narrative ;
- support de déblocage ;
- marqueur de seuil.

Priorité :
- **moyenne**

---

### 9.3 Preuve du palier 8
**ID technique recommandé :** `floor_8_proof` ou équivalent

Fonction :
- progression avancée ;
- support de dialogue, déblocage ou validation.

Priorité :
- **moyenne**

---

### 9.4 Fragment du Cœur de la Malédiction
**ID technique recommandé :** `curse_heart_fragment`

Fonction :
- objet clé majeur du MVP ;
- preuve de la victoire contre l’étage 10 ;
- déclencheur narratif / monde.

Source principale :
- boss `curse_heart_avatar`

Priorité :
- **critique**

---

## 10. Objets liés indirectement au MVP

Certains objets doivent être préparés conceptuellement mais seront détaillés ailleurs :

### 10.1 Équipements
Armes, armures, accessoires :
- voir `docs/05-equipements/`

### 10.2 Recettes de craft
Objets transformés :
- voir `docs/06-crafting/`

### 10.3 Récompenses de quêtes
Objets associés à certaines quêtes :
- voir `docs/07-quetes/`

---

## 11. Table de synthèse des objets MVP

| Objet | ID technique | Catégorie | Fonction principale | Source principale | Priorité |
|---|---|---|---|---|---|
| Herbe de soin | `healing_herb` | Consommable | Soin | Craft / loot / récompense | Critique |
| Tonique de mana | `mana_tonic` | Consommable | Mana | Craft / progression | Très haute |
| Graines de navet | `turnip_seed` | Graine | Culture de base | Marchande / shop | Critique |
| Graines de carotte | `carrot_seed` | Graine | Culture intermédiaire | Marchande / shop | Très haute |
| Graines de blé | `wheat_seed` | Graine | Culture avancée MVP | Marchande / shop | Très haute |
| Navet | `turnip` | Récolte | Vente / progression | Ferme | Critique |
| Carotte | `carrot` | Récolte | Vente / craft | Ferme | Très haute |
| Blé | `wheat` | Récolte | Vente / craft | Ferme | Très haute |
| Minerai de fer | `iron_ore` | Matériau | Progression / équipement | Tour / loot | Haute |
| Éclat d’épine | `thorn_shard` | Matériau | Corruption vivante / craft / quête | Tour / loot | Haute |
| Cendre condensée | `condensed_cinder` | Matériau | Palier cendre / progression | Tour / loot | Haute |
| Insigne d’avant-garde | `vanguard_token` | Matériau / trophée | Palier structuré / progression | Tour / loot | Moyenne à haute |
| Fragment du Cœur de la Malédiction | `curse_heart_fragment` | Objet clé | Preuve boss MVP | Boss étage 10 | Critique |

---

## 12. Rôle des objets dans la boucle de jeu

Les objets du MVP doivent soutenir la boucle suivante :

### Ferme
- achat de graines ;
- culture ;
- récolte.

### Village
- vente des récoltes ;
- achat de nouvelles graines ;
- circulation économique.

### Craft
- transformation d’une partie des récoltes ou matériaux en consommables utiles.

### Tour
- obtention de loot, matériaux et objets clés ;
- conversion de la progression combat en progression monde.

Les objets doivent toujours rester lisibles dans cette logique.
Le joueur doit savoir intuitivement :
- ce qu’il garde ;
- ce qu’il vend ;
- ce qu’il consomme ;
- ce qu’il transforme ;
- ce qu’il ne doit surtout pas jeter.

---

## 13. Contraintes de cohérence

Les objets du MVP doivent toujours respecter les règles suivantes :

- pas d’objet purement décoratif sans usage clair ;
- pas de redondance excessive ;
- pas d’inventaire noyé sous 40 variantes inutiles ;
- priorité aux objets qui soutiennent directement la boucle centrale ;
- cohérence forte entre acquisition, usage et sensation de progression.

Le catalogue doit rester petit, mais dense et utile.

---

## 14. Priorités de production recommandées

Les documents à produire ensuite à partir de cet index sont :

1. `docs/04-objets/consommables.md`
2. `docs/04-objets/graines-et-recoltes.md`
3. `docs/04-objets/materiaux.md`
4. `docs/04-objets/objets-cles.md`

Puis :
5. `docs/05-equipements/equipements-index.md`
6. `docs/06-crafting/recettes-index.md`

---

## 15. Résumé exécutif

Le catalogue d’objets du MVP repose sur un noyau simple et structuré :
- quelques consommables essentiels ;
- trois graines ;
- trois récoltes ;
- quelques matériaux de progression ;
- un petit nombre d’objets clés liés aux paliers de la tour.

Ce catalogue ne cherche pas la quantité.
Il cherche la cohérence avec la boucle hybride du jeu :
**cultiver, transformer, vendre, se préparer, combattre, progresser et ramener des preuves concrètes que le monde change.**
