# Index des recettes MVP

> **Statut : document canonique actif**
> Ce document définit les recettes canoniques du MVP.
> Il sert de référence active pour le front, le crafting, la ferme, l’inventaire, les consommables, certaines quêtes et la préparation au combat.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les recettes du MVP.

---

## 1. Rôle du document

Ce document fixe le noyau de recettes du MVP.

Il permet de :
- définir quelles recettes existent réellement ;
- relier les récoltes et matériaux aux consommables et objets utiles ;
- guider le front de craft ;
- structurer la logique de progression du système ;
- éviter un craft trop vaste, trop abstrait ou trop redondant.

Le MVP ne doit pas viser un système de fabrication encyclopédique.
Il doit proposer un **petit noyau de transformations utiles, lisibles et immédiatement motivantes**.

---

## 2. Principes de conception du crafting MVP

Les recettes du MVP doivent respecter les règles suivantes :

### 2.1 Utilité directe
Chaque recette du MVP doit produire quelque chose qui a une vraie utilité :
- soin ;
- récupération de mana ;
- préparation de combat ;
- soutien ponctuel à la progression.

### 2.2 Lien naturel avec la ferme
Le craft doit donner de la valeur au travail agricole.
Le joueur doit comprendre qu’une récolte n’est pas seulement vendable : elle peut aussi être transformée.

### 2.3 Simplicité
Le craft MVP doit être :
- peu profond ;
- peu coûteux en lecture ;
- facile à mémoriser ;
- immédiatement compréhensible.

### 2.4 Progression douce
Le craft doit commencer par des recettes très simples et éventuellement ouvrir légèrement vers des recettes un peu plus avancées, sans basculer trop tôt dans un grand système d’alchimie.

---

## 3. Rôle du craft dans la boucle du jeu

Le craft du MVP relie directement :

### 3.1 La ferme
Le joueur fait pousser des cultures utiles.

### 3.2 L’arbitrage
Il choisit entre :
- vendre ;
- garder ;
- transformer.

### 3.3 La préparation
Il transforme une partie de ses ressources en soutien concret.

### 3.4 Le combat
Il profite ensuite de ses consommables et de sa préparation dans la tour.

Le craft doit donc faire ressentir cette vérité :
**la ferme n’est pas seulement un moyen de gagner de l’or ; c’est aussi un moyen de fabriquer sa propre capacité à tenir dans la tour.**

---

## 4. Vue d’ensemble du crafting MVP

Le noyau du craft MVP repose sur **2 recettes majeures canoniques**, avec quelques ouvertures légères possibles plus tard.

| Recette | ID technique | Produit | Fonction principale | Priorité |
|---|---|---|---|---|
| Médecine de champ | `field_medicine` | `healing_herb` | Soin | Critique |
| Tonique de concentration | `focus_tonic` | `mana_tonic` | Récupération de mana | Très haute |

Recettes avancées optionnelles :
- hors noyau strict ;
- possibles en bordure de MVP si la production le permet.

---

## 5. Recette : Médecine de champ

### Nom affiché canonique
**Médecine de champ**

### ID technique
`field_medicine`

### Produit obtenu
`healing_herb`

### Catégorie
Recette de soin simple

### Fonction principale
Fabriquer une Herbe de soin à partir de ressources de base.

### Rôle dans le MVP
La Médecine de champ est la recette la plus importante du craft MVP.

Elle sert à :
- donner une valeur immédiate aux premières récoltes ;
- relier la ferme à la survie du joueur ;
- rendre le crafting indispensable dès les premières boucles ;
- introduire une décision simple mais structurante : vendre ou garder pour survivre.

Elle doit être perçue comme :
- la première transformation utile du jeu ;
- un craft évident ;
- un réflexe naturel à apprendre.

### Ressenti recherché
Le joueur doit sentir :
**“je peux transformer ce que ma ferme produit en quelque chose qui m’aide vraiment dans la tour.”**

### Priorité
- **critique**

---

## 6. Recette : Tonique de concentration

### Nom affiché canonique
**Tonique de concentration**

### ID technique
`focus_tonic`

### Produit obtenu
`mana_tonic`

### Catégorie
Recette de soutien magique

### Fonction principale
Fabriquer un Tonique de mana à partir de ressources agricoles ou mixtes.

### Rôle dans le MVP
Le Tonique de concentration sert à donner une vraie profondeur au craft sans le complexifier excessivement.

Il permet :
- de soutenir les compétences ;
- de valoriser certaines cultures autrement que par la vente ;
- de préparer les combats de palier ou les rencontres plus exigeantes ;
- de donner au joueur un premier sentiment de craft plus “préparé” que la simple médecine de terrain.

Il doit être perçu comme :
- un craft légèrement plus précieux ;
- une ressource de planification ;
- un consommable qui accompagne un jeu plus actif avec les compétences.

### Ressenti recherché
Le joueur doit penser :
**“si je prépare bien mes ressources, je peux jouer plus librement et plus fort.”**

### Priorité
- **très haute**

---

## 7. Proposition de structure de recettes MVP

Le détail exact des ingrédients pourra être ajusté ensuite dans un document plus technique ou directement dans l’implémentation, mais le cadre canonique recommandé est le suivant :

### 7.1 Médecine de champ
Logique de recette :
- ingrédients simples ;
- facilement accessibles ;
- directement issus de la ferme ou du tout début de progression.

Exemple d’intention :
- une ou plusieurs récoltes basiques ;
- transformation rapide ;
- objet de soin standard.

### 7.2 Tonique de concentration
Logique de recette :
- un peu plus exigeante ;
- nécessite une ressource plus “travaillée” ou plus spécifique ;
- symbolise une préparation plus poussée.

Exemple d’intention :
- combinaison de récoltes intermédiaires ;
- éventuellement petite exigence de progression ;
- récompense en flexibilité tactique.

---

## 8. Progression du crafting dans le MVP

Le craft doit suivre une progression simple :

### Étape 1
Le joueur découvre qu’il peut fabriquer un soin.

### Étape 2
Le joueur comprend qu’une partie de ses récoltes peut aussi servir à la récupération de mana.

### Étape 3
Le joueur commence à arbitrer selon ses besoins :
- plus de vente ;
- plus de soin ;
- plus de soutien mana.

Cette progression suffit largement pour le MVP.

Le but n’est pas de multiplier les recettes.
Le but est de faire comprendre que le craft est une **décision utile**, pas un mini-jeu décoratif.

---

## 9. Recettes optionnelles de bordure MVP

Ces recettes peuvent exister plus tard si besoin, mais elles ne doivent pas être considérées comme obligatoires pour la version canonique de base.

### 9.1 Grande médecine de champ
**ID technique recommandé :** `field_medicine_plus`

Produit :
- `greater_healing_herb`

Fonction :
- version renforcée du soin.

Statut :
- **optionnel / bordure MVP**

---

### 9.2 Tonique de concentration renforcé
**ID technique recommandé :** `focus_tonic_plus`

Produit :
- `greater_mana_tonic`

Fonction :
- version plus puissante de la récupération de mana.

Statut :
- **optionnel / bordure MVP**

---

### 9.3 Ration de préparation
**ID technique recommandé :** `battle_ration`

Produit :
- consommable léger de préparation ou bonus simple.

Fonction :
- soutien à la préparation combat.

Statut :
- **non prioritaire**
- à n’ajouter que si le système reste lisible.

---

## 10. Lien entre recettes et PNJ

Le craft du MVP peut être renforcé narrativement par les PNJ suivants :

### L’Herboriste
- donne du sens au craft ;
- peut commenter certaines recettes ;
- peut soutenir la compréhension des ressources naturelles.

### La Marchande
- renforce la valeur économique des récoltes ;
- crée l’arbitrage entre vendre et transformer.

### Le Maire
- peut indirectement rappeler que la survie et la reconstruction passent par ces choix.

Le craft gagne en force quand il n’est pas perçu comme une simple machine à transformer, mais comme une pratique du monde.

---

## 11. Place du craft dans le front

Le front doit pouvoir montrer les recettes de façon très lisible.

### Le joueur doit voir immédiatement :
- le nom de la recette ;
- le ou les ingrédients requis ;
- ce qu’il possède ;
- ce qu’il obtiendra ;
- s’il peut fabriquer maintenant ou non.

### Le front ne doit pas surcharger :
- pas trop de catégories ;
- pas trop d’étapes ;
- pas de logique obscure.

Le craft MVP doit être lisible presque d’un coup d’œil.

---

## 12. Contraintes de cohérence

Les recettes du MVP doivent toujours respecter les règles suivantes :

- chaque recette doit avoir un intérêt réel ;
- pas de transformation gadget ;
- priorité aux recettes qui renforcent directement la boucle ferme ↔ combat ;
- pas de recettes trop spécialisées trop tôt ;
- pas de profondeur excessive sans payoff clair.

Le craft doit rester un système qui :
- soutient ;
- renforce ;
- éclaire la boucle centrale,
et non un système qui la détourne.

---

## 13. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/04-objets/items-index.md`
- `docs/04-objets/consommables.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/04-objets/materiaux.md`
- `docs/02-personnages/herboriste.md`

Les recettes sont au croisement du monde agricole, des ressources, de la préparation et de la survie.

---

## 14. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. détailler les équipements :
   - `docs/05-equipements/equipements-index.md`

2. définir les objets clés :
   - `docs/04-objets/objets-cles.md`

3. définir les quêtes MVP :
   - `docs/07-quetes/quetes-mvp-index.md`

4. si besoin, produire ensuite un document technique complémentaire avec :
   - ingrédients exacts ;
   - quantités ;
   - déblocages précis ;
   - ordre de disponibilité.

---

## 15. Résumé exécutif

Le craft MVP repose sur un noyau simple de recettes utiles :

- **Médecine de champ** → `healing_herb`
- **Tonique de concentration** → `mana_tonic`

Ces deux recettes suffisent à transformer la ferme en véritable soutien de progression.
Elles rendent les récoltes plus intéressantes, introduisent de vrais arbitrages et donnent au joueur une manière concrète de convertir son travail quotidien en capacité de survie.

Leur rôle fondamental est clair :
**ce que le joueur cultive peut devenir plus qu’une marchandise ; cela peut devenir sa préparation, sa marge d’erreur et sa chance de tenir face à la tour.**
