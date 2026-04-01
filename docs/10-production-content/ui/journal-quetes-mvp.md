# Journal de quêtes MVP

> **Statut : document canonique actif**
> Ce document définit la structure canonique du journal de quêtes pour le MVP.
> Il sert de référence active pour l’implémentation front, la lisibilité de la progression, le suivi des objectifs, la hiérarchie des quêtes et la cohérence entre narration, systèmes et expérience joueur.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour le journal de quêtes du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont le journal de quêtes doit être conçu dans le MVP.

Il permet de :
- structurer le suivi des quêtes ;
- hiérarchiser quête principale, quêtes de paliers et quêtes secondaires ;
- éviter un journal trop lourd ou trop MMO ;
- guider la présentation front des objectifs et récompenses ;
- faire du journal un outil de lecture du monde, pas seulement une liste de tâches.

Le journal de quêtes ne doit pas remplacer l’attention du joueur au monde.
Il doit surtout l’aider à répondre rapidement à :
- où j’en suis ;
- qu’est-ce qui est important maintenant ;
- à qui dois-je parler ;
- et pourquoi cette quête existe.

---

## 2. Objectifs du journal de quêtes

Le journal doit permettre au joueur de comprendre immédiatement :

- quelle est sa quête principale active ;
- quelles quêtes secondaires sont disponibles ;
- quel est le prochain objectif concret ;
- quel PNJ ou quel lieu est concerné ;
- quelles quêtes sont terminées ;
- ce que chaque quête rapporte ou débloque.

Le front doit faire ressentir :
- clarté ;
- orientation ;
- progression ;
- lien avec le monde ;
- hiérarchie entre les tâches.

---

## 3. Principes de conception

### 3.1 Court et lisible
Le journal du MVP doit rester compact.
Il ne doit pas ressembler à un backlog de 40 missions.

### 3.2 Quête principale d’abord
La quête principale et les grandes étapes de la Tour doivent être clairement prioritaires visuellement.

### 3.3 Objectifs concrets
Les formulations doivent guider l’action, pas noyer le joueur dans des textes vagues.

### 3.4 Monde d’abord, checklist ensuite
Le journal doit être utile, mais ne doit pas transformer l’aventure en simple suite de cases à cocher.

### 3.5 Récompenses compréhensibles
Le joueur doit savoir si une quête apporte :
- XP ;
- or ;
- objet ;
- relation ;
- déblocage ;
- évolution du monde.

---

## 4. Structure générale recommandée

Le journal de quêtes du MVP repose sur **4 blocs principaux** :

1. **Onglets ou catégories**
2. **Liste des quêtes**
3. **Panneau de détail**
4. **État / récompenses / progression**

Cette structure suffit largement pour le MVP.

---

## 5. Catégories canoniques du journal

Le journal doit distinguer au minimum :

### 5.1 Principale
Pour :
- `L’appel du village`
- `Une terre à reprendre`
- les grandes étapes qui portent le fil du MVP

### 5.2 Tour / progression
Pour :
- `Premier nœud brisé`
- `La braise qui veille`
- `L’avant-garde maudite`
- `Le cœur qui saigne`

### 5.3 Village / ferme
Pour :
- `Première récolte`
- `Livraison de navets`
- `Réserve du grenier`

### 5.4 Relations / secondaires
Pour :
- `Entretien avec le Maire`
- `Mise à jour de la forge`
- `Rythme du marché`

Optionnel :
### 5.5 Terminées
Onglet séparé ou filtre simple, selon la légèreté souhaitée.

---

## 6. Onglets ou catégories

## 6.1 Fonction
Permettre au joueur de filtrer rapidement les quêtes selon leur nature.

## 6.2 Règle UX
Les catégories doivent être peu nombreuses et immédiatement compréhensibles.

Le MVP doit éviter :
- trop de sous-catégories ;
- les libellés abstraits ;
- une navigation trop profonde.

## 6.3 Ordre recommandé
1. Principale
2. Tour / progression
3. Village / ferme
4. Relations / secondaires
5. Terminées

Le journal doit toujours guider d’abord vers ce qui compte le plus.

---

## 7. Liste des quêtes

## 7.1 Fonction
Afficher les quêtes disponibles dans la catégorie active.

## 7.2 Informations minimales par ligne
- nom de la quête
- statut
- donneur ou origine si pertinent
- courte ligne d’objectif
- indicateur visuel si nouveauté ou mise à jour

## 7.3 États recommandés
- active
- mise à jour
- à rendre / à valider
- terminée

## 7.4 Règle UX
Le joueur doit pouvoir scanner la liste rapidement et savoir :
- laquelle suivre ;
- laquelle est nouvelle ;
- laquelle peut être rendue.

---

## 8. Panneau de détail

## 8.1 Fonction
Afficher les informations détaillées de la quête sélectionnée.

## 8.2 Informations minimales à afficher
- titre
- type de quête
- donneur ou origine
- description courte
- objectif actuel
- étapes principales si nécessaire
- récompenses
- zone ou lieu concerné

## 8.3 Règle d’écriture
Le texte doit être :
- court ;
- clair ;
- orienté action ;
- cohérent avec le ton du jeu.

Le journal ne doit pas contenir des pavés de lore.
Il doit soutenir l’action.

---

## 9. Présentation des objectifs

## 9.1 Règle générale
Chaque quête active doit afficher un objectif concret et actuel.

## 9.2 Exemples de bonne formulation
- Parler au Maire
- Planter des graines de navet
- Récolter 3 navets
- Vendre des récoltes à la Marchande
- Retourner à la Forge
- Atteindre l’étage 3 de la Tour
- Vaincre le Gardien des cendres
- Rapporter le Fragment du Cœur de la Malédiction au village

## 9.3 Ce qu’il faut éviter
- formulations trop vagues ;
- résumé flou de lore ;
- objectifs inutiles du type “continuer l’aventure” sans contexte.

---

## 10. Présentation des récompenses

## 10.1 Fonction
Aider le joueur à comprendre l’intérêt de la quête.

## 10.2 Récompenses possibles à afficher
- XP
- or
- objet
- matériau
- relation PNJ
- déblocage shop
- évolution du monde
- progression principale

## 10.3 Règle UX
Toutes les récompenses n’ont pas besoin d’être chiffrées si cela brouille la lecture.
Certaines peuvent être indiquées comme :
- Nouveau dialogue
- Shop amélioré
- Progression du village
- Déblocage de service

Le plus important est que la récompense soit lisible et motivante.

---

## 11. Hiérarchie visuelle globale

Le journal doit hiérarchiser visuellement :

### Priorité 1
- quête principale active
- quête de palier importante
- objectif courant

### Priorité 2
- quêtes de village / ferme utiles
- quêtes relationnelles

### Priorité 3
- quêtes terminées
- détails secondaires
- historique

Le joueur doit toujours voir d’abord ce qui structure sa progression globale.

---

## 12. États visuels recommandés

Le journal doit pouvoir montrer clairement :

### Nouvelle quête
- badge `Nouveau`
- surbrillance légère

### Quête mise à jour
- badge `Mis à jour`
- changement d’objectif visible

### Quête à rendre
- badge `À rendre`
- ou mise en avant claire

### Quête terminée
- état archivé / grisé / déplacé dans terminées

Le MVP n’a pas besoin d’effets spectaculaires.
La lisibilité suffit.

---

## 13. Ambiance UI recommandée

Le journal de quêtes doit être :
- clair ;
- sobre ;
- légèrement RPG ;
- cohérent avec le reste de l’interface ;
- plus lisible que décoratif.

Il faut éviter :
- les parchemins surchargés ;
- les cadres fantasy excessifs ;
- les journaux trop denses ;
- les listes sans hiérarchie.

Le bon ton est :
**outil narratif lisible avec une matière discrète**

---

## 14. Contraintes UX

Le journal doit respecter les règles suivantes :

- peu de catégories ;
- liste rapide à scanner ;
- objectif courant toujours clair ;
- récompenses compréhensibles ;
- peu de friction pour retrouver une quête ;
- priorité visuelle évidente de la quête principale.

Le joueur doit pouvoir ouvrir le journal et comprendre en quelques secondes :
- ce qu’il doit faire ;
- où aller ;
- ce qui compte le plus.

---

## 15. Contraintes techniques / front

Le journal doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- mise à jour simple des objectifs
- changements de statut
- affichage de récompenses mixtes
- intégration des flags monde
- archivage simple des quêtes terminées

Le système doit pouvoir être monté progressivement :
1. catégories
2. liste
3. détail
4. statuts
5. badges nouveau / mis à jour / à rendre

---

## 16. Cas particuliers à prévoir

### Plusieurs quêtes actives dans la même zone
Le journal doit aider à comprendre les recoupements sans confusion.

### Quête de palier déjà remplie mais non rendue
Le statut doit être très lisible.

### Quête relationnelle discrète
Elle ne doit pas masquer la quête principale, mais rester visible dans sa catégorie.

### Déblocage de service comme récompense
Le journal doit pouvoir l’indiquer clairement, même sans chiffre.

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/07-quetes/quetes-mvp-index.md`
- `docs/10-production-content/front-scenes/retour-village-scene-mvp.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/08-gameplay-content/shops-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 18. Priorités de production recommandées

Après ce document, les docs UI les plus logiques à produire sont :

1. `fiche-personnage-equipement-mvp.md`
2. `ecran-transition-palier-mvp.md`

Puis, si besoin :
3. fiches détaillées des quêtes majeures
4. états de notifications ou popup de mise à jour de quête

---

## 19. Résumé exécutif

Le journal de quêtes du MVP doit être pensé comme un outil de lecture simple, hiérarchisé et immédiatement utile.

Il doit permettre au joueur de voir sans effort :
- sa quête principale,
- ses étapes de progression dans la Tour,
- ses quêtes de ferme et de village,
- et les récompenses ou déblocages associés.

Son rôle central est simple :
**faire en sorte que la progression reste lisible sans transformer l’aventure en simple liste de tâches.**
