# HUD Combat MVP

> **Statut : document canonique actif**
> Ce document définit la structure canonique du HUD de combat pour le MVP.
> Il sert de référence active pour l’implémentation front, la hiérarchie des informations en combat, la lisibilité des actions, la lecture des ennemis, des statuts, des ressources et des feedbacks.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour le HUD de combat du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont le HUD de combat doit être conçu dans le MVP.

Il permet de :
- hiérarchiser les informations essentielles ;
- éviter la surcharge visuelle ;
- guider la disposition des panneaux, barres, boutons et feedbacks ;
- soutenir la compréhension rapide des combats ;
- transformer l’interface de combat en outil lisible, cohérent et intégré à la scène.

Le HUD de combat ne doit pas être un panneau technique plaqué sur un décor.
Il doit être la couche de lecture qui permet au joueur de comprendre instantanément :
- où il en est ;
- ce qu’il peut faire ;
- ce que l’ennemi menace ;
- et pourquoi le combat est dangereux.

---

## 2. Objectifs du HUD de combat

Le HUD doit permettre au joueur de comprendre immédiatement :

- ses PV ;
- ses MP ;
- son tour ou non ;
- les actions disponibles ;
- les statuts importants ;
- l’identité et l’état des ennemis ;
- la différence entre combat normal, combat de palier et combat de boss ;
- les conséquences immédiates des actions.

Le HUD doit faire ressentir :
- clarté ;
- contrôle ;
- tension lisible ;
- progression ;
- hiérarchie du danger.

---

## 3. Principes de conception

### 3.1 Lisibilité avant richesse
Toutes les informations utiles ne doivent pas être affichées avec le même poids.

### 3.2 Actions d’abord
Quand c’est au tour du joueur, l’interface doit d’abord répondre à :
**que puis-je faire maintenant ?**

### 3.3 Danger d’abord
Quand ce n’est pas au tour du joueur, l’interface doit d’abord répondre à :
**qu’est-ce qui me menace ?**

### 3.4 Feedbacks courts et clairs
Le HUD doit privilégier :
- les effets courts ;
- les retours visibles ;
- les statuts lisibles ;
- les variations d’état immédiates.

### 3.5 Boss et paliers mieux marqués
Le HUD doit faire sentir quand on est face à un moment plus important du jeu.

---

## 4. Structure générale recommandée

Le HUD de combat du MVP repose sur **5 blocs principaux** :

1. **Bloc héros**
2. **Bloc ennemis**
3. **Bloc actions**
4. **Bloc informations de tour / statuts**
5. **Bloc feedbacks / résultats**

Ces blocs doivent être distincts, mais visuellement cohérents.

---

## 5. Bloc héros

## 5.1 Fonction
Afficher l’état du joueur de manière immédiatement lisible.

## 5.2 Informations minimales à afficher
- nom ou identifiant du héros
- portrait ou représentation simple
- PV actuels / PV max
- MP actuels / MP max
- statuts actifs importants
- indicateur visuel quand c’est son tour

## 5.3 Priorité de lecture
Ordre recommandé :
1. PV
2. MP
3. statuts
4. autres infos secondaires

## 5.4 Placement recommandé
Le bloc héros doit être proche de la zone où le héros est représenté en combat, sans masquer la scène.

## 5.5 Règle UX
Le joueur doit pouvoir voir l’état critique de son personnage sans lire un texte ou ouvrir un sous-menu.

---

## 6. Bloc ennemis

## 6.1 Fonction
Afficher les informations essentielles sur le ou les ennemis.

## 6.2 Informations minimales à afficher
- nom de l’ennemi
- PV
- statut(s) important(s)
- indication de boss / mini-boss si pertinent
- cible actuelle ou ennemi sélectionné
- intention ennemie si le système la montre

## 6.3 Hiérarchie recommandée
Pour un ennemi normal :
- nom
- PV
- statut éventuel

Pour un boss :
- nom très lisible
- PV très lisibles
- statut(s)
- identité de boss clairement marquée

## 6.4 Règle UX
Le joueur doit comprendre immédiatement quel ennemi est le plus important et lequel il est en train de cibler.

---

## 7. Bloc actions

## 7.1 Fonction
Présenter les choix du joueur.

## 7.2 Actions principales à afficher
- Attaque
- Compétences
- Objets
- Défense / autre action si présente dans le système

## 7.3 Règles de présentation
- boutons lisibles
- peu nombreux à la racine
- libellés explicites
- état désactivé si indisponible
- coût visible pour les compétences si nécessaire

## 7.4 Sous-menus
### Compétences
Doit montrer :
- nom
- coût
- disponibilité
- éventuellement type ou cible

### Objets
Doit montrer :
- nom
- quantité
- effet court
- disponibilité

## 7.5 Priorité UX
Le joueur doit pouvoir agir rapidement sans être noyé sous 12 choix de même niveau.

---

## 8. Bloc informations de tour / statuts

## 8.1 Fonction
Afficher les informations de contexte du combat.

## 8.2 Informations recommandées
- numéro de palier / étage si utile
- type de combat :
  - normal
  - palier
  - boss
- tour en cours / phase
- statuts majeurs du héros et des ennemis

## 8.3 Statuts à prioriser dans le MVP
- Poison
- Cécité
- Obscurité

## 8.4 Règle UX
Les statuts doivent être visibles, mais pas envahissants.
Une icône + texte court ou tooltip léger suffit.

---

## 9. Bloc feedbacks / résultats

## 9.1 Fonction
Montrer les conséquences des actions.

## 9.2 Feedbacks prioritaires
- dégâts infligés
- dégâts reçus
- soin
- consommation de MP
- application ou fin d’un statut
- victoire / défaite
- récompenses de fin de combat

## 9.3 Règle de mise en scène
Les feedbacks doivent être :
- brefs
- visibles
- hiérarchisés
- non bloquants sauf événement majeur

## 9.4 Règle pour les bosses
Les feedbacks clés de boss peuvent être un peu plus marqués, mais jamais au point de masquer l’état du combat.

---

## 10. Hiérarchie visuelle globale

Le HUD doit toujours hiérarchiser visuellement :

### Priorité 1
- PV du héros
- actions disponibles
- ennemi principal / boss
- danger immédiat

### Priorité 2
- MP
- statuts
- intentions
- cible

### Priorité 3
- détails secondaires
- historiques
- informations de contexte moins urgentes

Si tout est mis au même niveau visuel, le HUD échoue.

---

## 11. Différence entre combat normal, palier et boss

Le HUD doit faire sentir la nature du combat.

### Combat normal
- interface standard
- priorité à la lisibilité

### Combat de palier
- légère accentuation visuelle
- ennemi plus marqué
- pression un peu plus forte

### Combat de boss
- nom du boss très lisible
- barre de PV plus marquée
- poids visuel supérieur
- sensation claire d’événement majeur

Le joueur doit sentir la hiérarchie du combat sans lire un encart narratif.

---

## 12. Ambiance UI recommandée

Le HUD de combat doit être :
- sobre
- lisible
- légèrement RPG
- cohérent avec la direction visuelle générale

Il faut éviter :
- les cadres trop décoratifs
- les effets trop flashy
- les couleurs criardes partout
- les interfaces qui ressemblent à un outil de debug

Le bon ton est :
**fonctionnel avec une légère matière fantasy discrète**

---

## 13. Contraintes UX

Le HUD de combat doit respecter les règles suivantes :

- lecture immédiate de l’état critique
- actions accessibles rapidement
- peu de friction
- peu d’encombrement
- priorité visuelle évidente
- boss lisibles sans surcharge
- statuts visibles sans noyer l’écran

Le joueur doit toujours savoir :
- si son héros va mal
- ce qu’il peut faire
- ce que l’ennemi prépare

---

## 14. Contraintes techniques / front

Le HUD doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- affichage responsive raisonnable
- mises à jour rapides d’état
- réutilisation des données combat existantes
- ajout progressif de polish sans refonte complète

Le HUD doit pouvoir être construit par étapes :
1. lecture des PV/MP
2. actions
3. statuts
4. feedbacks
5. poids boss / paliers

---

## 15. Cas particuliers à prévoir

### Combat avec plusieurs ennemis
- cible actuelle très claire
- noms et PV lisibles
- ennemi prioritaire identifiable

### Combat de boss seul
- boss central
- barre plus lisible
- feedbacks plus marqués

### Défaite
- lecture rapide de la perte
- transition claire
- pas de confusion avec une victoire ou une sortie normale

### Fin de combat
- écran ou panneau de récompense simple :
  - XP
  - or
  - loot
  - objet clé si concerné

---

## 16. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/tour-combat-scene-mvp.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/09-direction-artistique/guide-visuel-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 17. Priorités de production recommandées

Après ce document, les docs UI les plus logiques à produire sont :

1. `hud-ferme-mvp.md`
2. `panneau-shop-mvp.md`
3. `journal-quetes-mvp.md`
4. `fiche-personnage-equipement-mvp.md`
5. `ecran-transition-palier-mvp.md`

---

## 18. Résumé exécutif

Le HUD de combat du MVP doit être pensé comme une couche de lecture claire, hiérarchisée et immédiatement utile.

Il doit permettre au joueur de voir sans effort :
- son état,
- les ennemis,
- les actions disponibles,
- les statuts importants,
- et les conséquences immédiates du combat.

Son rôle central est simple :
**faire en sorte que la tension du combat vienne du danger du jeu, pas de la confusion de l’interface.**
