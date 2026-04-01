# Consommables MVP

> **Statut : document canonique actif**
> Ce document définit les consommables canoniques du MVP.
> Il sert de référence active pour le front, l’inventaire, le combat, le crafting, les shops, les loot tables et les futures recettes.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les consommables du MVP.

---

## 1. Rôle du document

Ce document fixe le catalogue des consommables du MVP.

Il permet de :
- définir quels consommables existent réellement ;
- préciser leur fonction dans le combat et la préparation ;
- guider l’affichage inventaire / HUD / shops ;
- préparer les recettes de craft ;
- éviter la prolifération de consommables redondants trop tôt.

Le MVP ne doit pas proposer trop de consommables différents.
Il doit proposer un petit noyau d’objets clairs, utiles et immédiatement compréhensibles.

---

## 2. Principes de conception des consommables MVP

Les consommables du MVP doivent respecter les règles suivantes :

### 2.1 Lisibilité immédiate
Le joueur doit comprendre rapidement :
- ce que l’objet restaure ou améliore ;
- quand il peut l’utiliser ;
- pourquoi il vaut la peine d’être fabriqué ou gardé.

### 2.2 Lien direct avec la boucle du jeu
Les consommables doivent valoriser la ferme et le craft.
Ils doivent être un pont naturel entre :
- récoltes ;
- transformation ;
- préparation ;
- combat.

### 2.3 Peu nombreux, mais utiles
Le MVP doit éviter de proposer 10 variantes de potions différentes.
Chaque consommable doit avoir un rôle précis.

### 2.4 Préparation avant sophistication
Dans le MVP, les consommables servent d’abord à :
- survivre ;
- soutenir les compétences ;
- mieux préparer les affrontements.

Ils ne doivent pas encore ouvrir un système de combat secondaire trop complexe.

---

## 3. Vue d’ensemble des consommables MVP

Le MVP repose sur **2 consommables majeurs canoniques**, avec éventuellement une petite ouverture vers une version renforcée plus tard.

| Objet | ID technique | Fonction principale | Source principale | Priorité |
|---|---|---|---|---|
| Herbe de soin | `healing_herb` | Restaurer les HP | Craft / loot / récompense | Critique |
| Tonique de mana | `mana_tonic` | Restaurer les MP | Craft / progression | Très haute |

Consommables avancés optionnels :
- hors noyau strict ;
- à garder en réserve pour extension légère du MVP ou début post-MVP.

---

## 4. Herbe de soin

### Nom affiché canonique
**Herbe de soin**

### ID technique
`healing_herb`

### Catégorie
Consommable de soin

### Fonction principale
Restaurer une quantité simple de HP.

### Rôle dans le MVP
L’Herbe de soin est le consommable le plus fondamental du jeu au stade MVP.

Elle sert à :
- soutenir la survie du joueur ;
- rendre le crafting immédiatement utile ;
- justifier qu’une partie des ressources de la ferme soit gardée plutôt que vendue ;
- donner au joueur un premier outil de gestion du risque.

Elle doit être perçue comme :
- simple ;
- fiable ;
- utile ;
- facile à comprendre.

### Place dans la boucle
- le joueur cultive ou obtient certaines ressources ;
- il les transforme ;
- il emporte l’Herbe de soin en combat ;
- il l’utilise pour amortir la pression.

### Ressenti recherché
Le joueur doit penser :
**“ce que je fais à la ferme m’aide vraiment à survivre dans la tour.”**

### Notes de design
- soin modéré ;
- ni trop faible, ni trop puissant ;
- doit rester utile tout le long du MVP.

### Priorité
- **critique**

---

## 5. Tonique de mana

### Nom affiché canonique
**Tonique de mana**

### ID technique
`mana_tonic`

### Catégorie
Consommable de ressource magique

### Fonction principale
Restaurer une quantité simple de MP.

### Rôle dans le MVP
Le Tonique de mana sert à donner une vraie valeur aux compétences du joueur.
Il renforce l’intérêt :
- des sorts ;
- des techniques à coût de mana ;
- de la préparation de combat ;
- du craft comme soutien stratégique.

Il doit être perçu comme un consommable légèrement plus “préparé” ou plus précieux que l’Herbe de soin, sans devenir rare au point d’être inutilisable.

### Place dans la boucle
- certaines ressources de ferme ou recettes plus spécifiques sont obtenues ;
- elles sont transformées en Tonique de mana ;
- le joueur peut soutenir son usage des compétences pendant les affrontements plus marquants.

### Ressenti recherché
Le joueur doit comprendre :
**“si je veux jouer plus activement avec mes compétences, je peux préparer ça grâce à mes ressources.”**

### Notes de design
- restauration de MP claire ;
- consommation volontaire ;
- objet utile pour les combats de palier ou les situations tendues.

### Priorité
- **très haute**

---

## 6. Consommables avancés optionnels

Le MVP strict n’a pas besoin de beaucoup plus.
Cependant, certains objets peuvent être préparés conceptuellement comme extension légère.

Ils ne doivent pas être au cœur du périmètre initial, mais ils peuvent exister ensuite si la production le permet.

---

### 6.1 Grande herbe de soin (optionnelle)
**ID technique recommandé :** `greater_healing_herb`

Fonction :
- version améliorée du soin ;
- récompense ou craft un peu plus avancé.

Usage :
- combats plus difficiles ;
- préparation plus poussée.

Statut MVP :
- **optionnel / bordure MVP**

---

### 6.2 Grand tonique de mana (optionnel)
**ID technique recommandé :** `greater_mana_tonic`

Fonction :
- version renforcée du Tonique de mana ;
- extension légère pour la fin du MVP ou juste après.

Statut MVP :
- **optionnel / bordure MVP**

---

### 6.3 Consommable de buff simple (optionnel)
Exemple :
- petit fortifiant ;
- ration préparée ;
- infusion légère avant combat.

Fonction :
- renforcer légèrement une phase de préparation.

Statut MVP :
- **non prioritaire**
- à n’introduire que si cela reste très lisible.

---

## 7. Rôle des consommables dans la préparation combat

Les consommables sont essentiels pour faire le lien entre :
- la ferme,
- le craft,
- et les combats importants.

Ils doivent servir à soutenir :
- la préparation avant montée de palier ;
- la gestion du risque ;
- les combats plus longs ou plus exigeants ;
- l’expression de choix simples :
  - vendre maintenant ;
  - ou garder pour survivre plus tard.

Leur fonction dans le jeu n’est pas seulement mécanique.
Ils participent aussi à la sensation que :
- le joueur s’organise ;
- anticipe ;
- transforme son travail quotidien en avantage concret.

---

## 8. Acquisition des consommables

Les consommables du MVP doivent provenir principalement de :

### 8.1 Craft
Source principale recommandée.
C’est le moyen le plus cohérent avec l’identité du projet.

### 8.2 Récompenses ponctuelles
Quêtes, récompenses simples, loot contextualisé.

### 8.3 Loot limité
Certains ennemis ou bosses peuvent ponctuellement en fournir, mais le loot ne doit pas remplacer le rôle central de la ferme et du craft.

### 8.4 Shop éventuel
Possible à petite dose plus tard, mais pas nécessairement central dans le MVP strict.
Le cœur de leur valeur doit rester :
**je les prépare moi-même, ou je les obtiens comme ressource précieuse.**

---

## 9. Règles d’usage dans le MVP

Les consommables du MVP doivent suivre des règles simples et lisibles :

- utilisables clairement par le joueur ;
- effets immédiats ;
- pas d’ambiguïté sur leur usage ;
- peu d’exceptions ;
- peu de variantes.

Le MVP doit éviter :
- les objets à effets obscurs ;
- les consommables trop situationnels ;
- les objets qui doublonnent sans intérêt.

Le but est d’ancrer un petit langage d’objets facile à apprendre.

---

## 10. Contraintes visuelles et front

Les consommables doivent être immédiatement reconnaissables dans l’inventaire et les interfaces.

### 10.1 Herbe de soin
Doit évoquer :
- le végétal ;
- le soin simple ;
- le remède de terrain ;
- quelque chose de modeste mais utile.

### 10.2 Tonique de mana
Doit évoquer :
- la préparation ;
- le liquide / la fiole / l’extrait ;
- un soutien plus “alchimique” ou transformé que l’Herbe de soin.

### 10.3 Règles générales d’affichage
Le front doit pouvoir montrer facilement :
- le nom ;
- la quantité ;
- l’effet ;
- le contexte d’utilisation.

Les consommables doivent être lisibles même en petit format.

---

## 11. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/04-objets/items-index.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/06-crafting/recettes-index.md`
- `docs/08-gameplay-content/floors-1-10.md`

Les consommables ne doivent pas être pensés isolément.
Ils prennent leur sens dans la transformation du travail agricole en soutien concret au combat.

---

## 12. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. définir précisément les graines et récoltes :
   - `docs/04-objets/graines-et-recoltes.md`

2. définir les matériaux :
   - `docs/04-objets/materiaux.md`

3. fixer les recettes :
   - `docs/06-crafting/recettes-index.md`

4. détailler ensuite les effets exacts côté système / UI si nécessaire

---

## 13. Résumé exécutif

Le MVP repose sur un noyau très simple de consommables :
- **Herbe de soin**
- **Tonique de mana**

Ces deux objets suffisent à rendre la ferme, le craft et la préparation immédiatement utiles dans la progression du joueur.
Ils forment la base du soutien combat du MVP et doivent rester lisibles, accessibles et cohérents avec l’identité hybride du jeu.

Leur rôle central est de faire ressentir une vérité simple :
**le joueur ne cultive pas seulement pour vendre ; il cultive aussi pour se donner une chance de tenir face à la tour.**
