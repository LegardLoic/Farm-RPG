# Graines et récoltes MVP

> **Statut : document canonique actif**
> Ce document définit les graines et récoltes canoniques du MVP.
> Il sert de référence active pour le front, la ferme, l’inventaire, le marché du village, le crafting, les quêtes et la progression économique.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les graines et récoltes du MVP.

---

## 1. Rôle du document

Ce document fixe le catalogue des graines et récoltes du MVP.

Il permet de :
- définir quelles cultures existent réellement ;
- préciser leur rôle dans la boucle ferme ↔ village ↔ craft ;
- guider l’interface de ferme, de marché et d’inventaire ;
- structurer les futures recettes et quêtes ;
- éviter de multiplier trop tôt les cultures sans usage clair.

Le MVP n’a pas besoin d’un système agricole immense.
Il a besoin d’un **petit noyau de cultures utiles, lisibles et complémentaires**.

---

## 2. Principes de conception des graines et récoltes MVP

Les graines et récoltes du MVP doivent respecter les règles suivantes :

### 2.1 Compréhension immédiate
Le joueur doit savoir rapidement :
- quelle graine produit quelle récolte ;
- si cette récolte sert à vendre, à crafter ou aux deux ;
- si elle correspond à une culture simple, intermédiaire ou un peu plus avancée.

### 2.2 Double utilité minimale
Dans le MVP, chaque récolte importante doit idéalement avoir au moins :
- une fonction économique ;
- et une fonction système potentielle (craft, quête, préparation, progression).

### 2.3 Progression douce
Les cultures doivent accompagner la montée en puissance du joueur :
- une culture d’entrée ;
- une culture intermédiaire ;
- une culture un peu plus rentable ou plus structurante.

### 2.4 Production raisonnable
Trois cultures bien utilisées valent mieux que dix cultures mal intégrées.
Le MVP doit rester simple et dense.

---

## 3. Vue d’ensemble du noyau agricole MVP

Le noyau agricole du MVP repose sur **3 graines** et **3 récoltes associées** :

| Graine | ID technique | Récolte associée | ID technique | Fonction principale | Priorité |
|---|---|---|---|---|---|
| Graines de navet | `turnip_seed` | Navet | `turnip` | Apprentissage, économie de base | Critique |
| Graines de carotte | `carrot_seed` | Carotte | `carrot` | Vente + craft intermédiaire | Très haute |
| Graines de blé | `wheat_seed` | Blé | `wheat` | Rendement plus structurant / craft | Très haute |

---

## 4. Graines de navet

### Nom affiché canonique
**Graines de navet**

### ID technique
`turnip_seed`

### Catégorie
Graine

### Récolte associée
`turnip`

### Fonction principale
Culture d’entrée de jeu.

### Rôle dans le MVP
Les Graines de navet sont la porte d’entrée de la boucle agricole.
Elles servent à :
- apprendre à planter ;
- apprendre à arroser ;
- apprendre à récolter ;
- comprendre la logique simple achat → culture → vente ou usage.

Elles doivent être associées à une culture :
- facile à comprendre ;
- rapidement rentable ;
- structurante pour les premières quêtes ou ventes.

### Ressenti recherché
Le joueur doit sentir :
**“je peux déjà produire quelque chose d’utile avec très peu.”**

### Priorité
- **critique**

---

## 5. Navet

### Nom affiché canonique
**Navet**

### ID technique
`turnip`

### Catégorie
Récolte

### Source principale
Ferme

### Fonction principale
Récolte de base polyvalente.

### Rôle dans le MVP
Le Navet sert à :
- être vendu au marché du village ;
- soutenir les premières quêtes agricoles ;
- représenter la première vraie réussite concrète de la ferme ;
- éventuellement entrer dans un craft simple ou une logique de livraison.

Il doit être perçu comme une ressource :
- simple ;
- fiable ;
- très lisible.

### Place dans la progression
Le Navet doit être la première récolte que le joueur comprend comme :
- utile ;
- échangeable ;
- répétable ;
- rassurante.

### Priorité
- **critique**

---

## 6. Graines de carotte

### Nom affiché canonique
**Graines de carotte**

### ID technique
`carrot_seed`

### Catégorie
Graine

### Récolte associée
`carrot`

### Fonction principale
Culture intermédiaire du MVP.

### Rôle dans le MVP
Les Graines de carotte représentent une étape légèrement supérieure au navet.
Elles servent à :
- enrichir la variété de la ferme ;
- renforcer l’intérêt du marché ;
- soutenir davantage le craft ou certaines recettes ;
- marquer une progression légère dans le système agricole.

Elles doivent être perçues comme :
- familières ;
- utiles ;
- légèrement plus intéressantes que la culture de base.

### Ressenti recherché
Le joueur doit sentir :
**“je ne fais plus seulement survivre ma ferme, je commence à la faire progresser.”**

### Priorité
- **très haute**

---

## 7. Carotte

### Nom affiché canonique
**Carotte**

### ID technique
`carrot`

### Catégorie
Récolte

### Source principale
Ferme

### Fonction principale
Récolte intermédiaire à double usage.

### Rôle dans le MVP
La Carotte doit servir à :
- être vendue ;
- alimenter certaines recettes ;
- être utilisée dans des quêtes de ravitaillement ou d’approvisionnement ;
- montrer que toutes les récoltes ne sont pas seulement des objets d’argent rapide.

Elle doit être perçue comme une récolte :
- utile ;
- un peu plus “dense” que le navet ;
- intéressante à garder autant qu’à vendre selon le contexte.

### Place dans la progression
La Carotte est un bon pivot entre :
- économie,
- craft,
- et quêtes simples.

### Priorité
- **très haute**

---

## 8. Graines de blé

### Nom affiché canonique
**Graines de blé**

### ID technique
`wheat_seed`

### Catégorie
Graine

### Récolte associée
`wheat`

### Fonction principale
Culture plus structurante du MVP.

### Rôle dans le MVP
Les Graines de blé représentent une culture qui évoque plus clairement :
- la stabilité ;
- le rendement ;
- la consolidation de la ferme.

Elles servent à :
- marquer une progression agricole plus avancée ;
- enrichir les ventes ;
- soutenir certains crafts ;
- donner une sensation de ferme plus installée, moins “début de survie”.

Elles ne doivent pas être perçues comme exotiques.
Elles doivent être perçues comme une culture sérieuse et rassurante.

### Ressenti recherché
Le joueur doit sentir :
**“ma ferme commence à produire comme un vrai lieu de subsistance, pas seulement comme un tutoriel vivant.”**

### Priorité
- **très haute**

---

## 9. Blé

### Nom affiché canonique
**Blé**

### ID technique
`wheat`

### Catégorie
Récolte

### Source principale
Ferme

### Fonction principale
Récolte structurante à valeur économique et de craft.

### Rôle dans le MVP
Le Blé doit servir à :
- être vendu pour une valeur intéressante ;
- soutenir certaines transformations ;
- participer à la sensation de progression agricole ;
- potentiellement nourrir des quêtes de ravitaillement ou de reconstruction locale.

Il doit être perçu comme une récolte :
- plus stable ;
- plus sérieuse ;
- plus “ressource” que simple légume du quotidien.

### Place dans la progression
Le Blé aide à faire ressentir le passage d’une petite ferme de départ à une ferme qui commence à compter dans l’économie locale.

### Priorité
- **très haute**

---

## 10. Rôle des graines et récoltes dans la boucle du jeu

Les graines et récoltes du MVP doivent soutenir la boucle suivante :

### 10.1 Achat
Le joueur achète des graines au village.

### 10.2 Plantation
Il choisit quoi planter sur ses parcelles.

### 10.3 Arrosage et temps
Il entretient la culture et fait avancer les jours.

### 10.4 Récolte
Il obtient une ressource concrète.

### 10.5 Arbitrage
Il décide de :
- vendre ;
- garder ;
- transformer ;
- utiliser pour une quête.

Cette étape est fondamentale.
Le joueur doit sentir que la ferme n’est pas une animation, mais une vraie source de décisions.

---

## 11. Rôle économique

Les récoltes du MVP doivent donner au joueur :
- une première source de revenu propre ;
- une relation concrète avec la Marchande ;
- un sentiment de progression hors combat ;
- une raison de revenir régulièrement à la ferme.

### Progression économique recommandée
- Navet : économie simple, stable, d’apprentissage
- Carotte : économie + intérêt craft
- Blé : économie plus structurante / rendement plus marquant

Le but n’est pas de faire une simulation agricole complète.
Le but est de rendre chaque culture immédiatement utile dans un cadre simple.

---

## 12. Rôle narratif

Les graines et récoltes servent aussi la narration.

Elles racontent :
- que la terre peut encore répondre ;
- que la malédiction n’a pas tout tué ;
- que le joueur ne fait pas seulement combattre un héros, il remet aussi la vie en mouvement ;
- que le retour du vivant passe par des gestes modestes mais essentiels.

La première récolte doit avoir un vrai poids émotionnel discret.
C’est l’un des premiers moments où le joueur devrait sentir :
**“ce lieu peut encore produire quelque chose.”**

---

## 13. Contraintes de cohérence

Les graines et récoltes du MVP doivent toujours respecter les règles suivantes :

- chaque culture doit être utile ;
- chaque récolte doit être lisible ;
- pas de culture “jolie mais inutile” ;
- pas de redondance de fonction trop forte ;
- les récoltes doivent soutenir à la fois la ferme et le reste du jeu.

Le joueur doit rapidement distinguer :
- ce qu’il vend facilement ;
- ce qu’il garde volontiers ;
- ce qui devient plus intéressant après progression.

---

## 14. Contraintes visuelles et front

Les graines et récoltes doivent être immédiatement reconnaissables dans :
- l’inventaire ;
- le panneau ferme ;
- le marché ;
- les interfaces de craft.

### Règles d’affichage
Le front doit pouvoir montrer clairement :
- la graine ;
- la récolte associée ;
- la quantité ;
- l’usage global.

### Lecture souhaitée
Le joueur doit facilement comprendre :
- qu’une graine donne une culture précise ;
- qu’une récolte peut ensuite être vendue ou transformée.

### Différenciation visuelle recommandée
- Navet : forme ronde, simple, racine basique
- Carotte : lecture évidente, plus colorée, plus “culinaire”
- Blé : visuel plus sec, plus structurel, plus agricole au sens classique

---

## 15. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/04-objets/items-index.md`
- `docs/04-objets/consommables.md`
- `docs/04-objets/materiaux.md`
- `docs/06-crafting/recettes-index.md`
- `docs/07-quetes/quetes-mvp-index.md`

Les graines et récoltes ne doivent pas être pensées comme un sous-système isolé.
Elles sont l’un des cœurs de l’identité hybride du projet.

---

## 16. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. définir les matériaux :
   - `docs/04-objets/materiaux.md`

2. définir les recettes de transformation :
   - `docs/06-crafting/recettes-index.md`

3. relier certaines récoltes à des quêtes secondaires :
   - `docs/07-quetes/quetes-mvp-index.md`

4. détailler ensuite les temps de pousse, valeurs de vente et usages précis si nécessaire dans des docs techniques complémentaires

---

## 17. Résumé exécutif

Le noyau agricole du MVP repose sur trois cultures :
- **Navet**
- **Carotte**
- **Blé**

Ces cultures forment une progression simple et lisible :
- apprentissage,
- diversification,
- stabilisation.

Elles servent à faire vivre la ferme, nourrir l’économie locale, soutenir le craft et ancrer la narration dans quelque chose de concret :
**la terre répond à nouveau, et cette réponse devient l’un des premiers signes visibles que le monde peut guérir.**
