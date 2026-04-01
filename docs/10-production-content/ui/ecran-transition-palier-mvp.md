# Écran de transition palier MVP

> **Statut : document canonique actif**
> Ce document définit la structure canonique de l’écran de transition de palier pour le MVP.
> Il sert de référence active pour l’implémentation front des fins de combat importantes, des victoires de palier, des récompenses, des déblocages et de la transition entre la Tour et le retour au Village.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran de transition de palier du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont les transitions après un combat important doivent être conçues dans le MVP.

Il permet de :
- distinguer un combat normal d’un vrai cap de progression ;
- structurer l’affichage des récompenses et déblocages ;
- guider le ton visuel et émotionnel de la victoire ;
- éviter que les paliers de la Tour se résument à une simple ligne de loot ;
- renforcer la sensation que chaque grand seuil modifie réellement l’aventure.

L’écran de transition de palier ne doit pas être un simple récapitulatif comptable.
Il doit être un **moment de validation**, de respiration et de projection vers la suite.

---

## 2. Objectifs de l’écran de transition

L’écran doit permettre au joueur de comprendre immédiatement :

- qu’il vient de franchir un cap important ;
- quel palier ou boss vient d’être vaincu ;
- quelles sont les récompenses gagnées ;
- si un objet clé ou un déblocage majeur a été obtenu ;
- ce qui change ensuite dans le monde ;
- si le prochain mouvement logique est :
  - continuer,
  - retourner au village,
  - ou préparer la suite.

Le front doit faire ressentir :
- soulagement ;
- progression ;
- reconnaissance du cap ;
- envie de continuer.

---

## 3. Principes de conception

### 3.1 Plus fort qu’une fin de combat standard
Un palier important doit être distingué visuellement d’une victoire normale.

### 3.2 Lisibilité avant mise en scène lourde
Le joueur doit comprendre rapidement ce qu’il a gagné et ce que cela implique.

### 3.3 Poids du cap
Le ton de l’écran doit varier selon :
- combat normal,
- mini-boss,
- boss de palier,
- boss majeur de l’étage 10.

### 3.4 Monde et récompenses
L’écran doit faire le lien entre :
- victoire,
- objets,
- déblocages,
- retour au village.

### 3.5 Pas de cinématique obligatoire
Le MVP peut rester simple.
Ce qui compte est la **clarté émotionnelle et systémique**.

---

## 4. Cas d’usage couverts

L’écran de transition de palier doit couvrir au minimum :

### 4.1 Palier 3
Victoire contre `thorn_beast_alpha`

### 4.2 Palier 5
Victoire contre `cinder_warden`

### 4.3 Palier 8
Victoire contre `ash_vanguard_captain`

### 4.4 Palier 10
Victoire contre `curse_heart_avatar`

Optionnel :
### 4.5 Victoires importantes non-palier
Certaines rencontres plus marquées pourraient réutiliser une version allégée de cet écran.

---

## 5. Structure générale recommandée

L’écran de transition de palier du MVP repose sur **5 blocs principaux** :

1. **Bloc titre / cap franchi**
2. **Bloc ennemi vaincu**
3. **Bloc récompenses**
4. **Bloc conséquences / déblocages**
5. **Bloc actions suivantes**

Cette structure suffit largement pour le MVP.

---

## 6. Bloc titre / cap franchi

## 6.1 Fonction
Donner immédiatement le ton de la victoire.

## 6.2 Informations minimales à afficher
- intitulé du palier franchi
- numéro de l’étage
- ou message de victoire de cap

## 6.3 Exemples de formulation
- `Palier 3 franchi`
- `Le premier nœud a cédé`
- `Étape 5 franchie`
- `La braise recule`
- `Avant-garde brisée`
- `Le cœur a été blessé`

## 6.4 Règle UX
Le joueur doit comprendre en une seconde :
**ce n’était pas juste un combat de plus.**

---

## 7. Bloc ennemi vaincu

## 7.1 Fonction
Rappeler l’identité du cap vaincu.

## 7.2 Informations minimales à afficher
- nom de l’ennemi vaincu
- catégorie :
  - gardien
  - boss intermédiaire
  - boss majeur
- visuel ou portrait simplifié si possible

## 7.3 Règle UX
Ce bloc donne du poids à la victoire.
Il aide le joueur à mémoriser :
- ce qu’il a vaincu ;
- à quel moment de la Tour cela correspond.

---

## 8. Bloc récompenses

## 8.1 Fonction
Afficher les gains concrets du joueur.

## 8.2 Récompenses minimales à afficher
- XP
- or
- loot notable
- matériau important
- objet clé si concerné

## 8.3 Hiérarchie recommandée
### Priorité 1
- objet clé
- déblocage majeur
- récompense exceptionnelle

### Priorité 2
- XP
- or
- loot secondaire

## 8.4 Règle UX
Le joueur doit voir immédiatement ce qui compte le plus.
Tout ne doit pas avoir le même poids visuel.

---

## 9. Bloc conséquences / déblocages

## 9.1 Fonction
Faire le lien entre la victoire et le monde.

## 9.2 Informations possibles à afficher
- nouvelle étape de quête
- nouveau dialogue disponible
- forge améliorée
- marché mis à jour
- PNJ réactifs
- retour au village conseillé
- progression du monde

## 9.3 Règle UX
Ce bloc est fondamental pour rappeler que :
**la Tour et le Village sont liés.**

Il doit rester court, lisible, et tourné vers l’après-victoire.

---

## 10. Bloc actions suivantes

## 10.1 Fonction
Proposer clairement la suite au joueur.

## 10.2 Actions recommandées
Selon le moment :
- `Continuer`
- `Retourner au village`
- `Voir les récompenses`
- `Fermer`

## 10.3 Règle UX
Le joueur ne doit pas se demander :
- que faire maintenant ;
- si la suite est immédiate ;
- si un retour au village est recommandé.

Le MVP doit rendre cette transition évidente.

---

## 11. Différence de ton selon le palier

## 11.1 Palier 3
Ton :
- première vraie victoire
- encouragement
- rupture initiale

Ressenti recherché :
**j’ai commencé à fissurer la Tour**

## 11.2 Palier 5
Ton :
- montée de gravité
- victoire plus lourde
- première vraie impression de danger sérieux surmonté

Ressenti recherché :
**j’ai dépassé un seuil important**

## 11.3 Palier 8
Ton :
- gravité avancée
- défense supérieure brisée
- approche du cœur du problème

Ressenti recherché :
**je m’approche de quelque chose de central**

## 11.4 Palier 10
Ton :
- victoire majeure
- blessure infligée à la malédiction
- retour monde fort

Ressenti recherché :
**j’ai remporté une vraie bataille contre le mal**

---

## 12. Ambiance UI recommandée

L’écran de transition doit être :
- plus solennel qu’un simple loot panel ;
- plus clair qu’une cinématique ;
- plus marqué qu’une fin de combat standard.

Il faut éviter :
- surcharge FX
- textes trop longs
- bruit visuel
- 10 panneaux à lire successivement

Le bon ton est :
**sobriété marquante avec hiérarchie forte**

---

## 13. Hiérarchie visuelle globale

L’écran doit hiérarchiser visuellement :

### Priorité 1
- cap franchi
- boss vaincu
- objet clé / déblocage majeur

### Priorité 2
- XP
- or
- loot
- progression de quête

### Priorité 3
- détails secondaires
- éléments purement contextuels

Le joueur doit d’abord ressentir la victoire, puis lire les gains.

---

## 14. Contraintes UX

L’écran de transition doit respecter les règles suivantes :

- compréhension immédiate
- peu de texte
- récompenses lisibles
- déblocages clairs
- action suivante évidente
- durée de lecture courte mais satisfaisante

Le joueur doit pouvoir :
- savourer ;
- comprendre ;
- repartir.

---

## 15. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- affichage conditionnel selon le type de palier
- intégration simple des récompenses et objets clés
- lecture des flags de progression
- réutilisation du pipeline de fin de combat existant

Le système peut être monté progressivement :
1. titre de victoire
2. récompenses
3. déblocages
4. action suivante
5. variation de ton selon palier

---

## 16. Cas particuliers à prévoir

### Palier sans objet clé majeur
L’écran doit rester satisfaisant même si la récompense principale est surtout narrative ou structurelle.

### Boss majeur avec objet clé
L’objet clé doit ressortir très fortement.

### Retour au village recommandé
Le message doit être clair sans être autoritaire.

### Récompenses multiples
Il faut éviter l’effet inventaire brut.
Une hiérarchie visuelle est indispensable.

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/04-objets/objets-cles.md`
- `docs/07-quetes/quetes-mvp-index.md`
- `docs/10-production-content/front-scenes/retour-village-scene-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 18. Priorités de production recommandées

Après ce document, les prochaines étapes les plus logiques sont :

1. détailler les fiches de quêtes majeures
2. produire des specs d’écrans / wireframes front
3. définir les notifications et popups secondaires :
   - quête mise à jour
   - shop amélioré
   - nouvel objet
   - nouveau palier atteint

---

## 19. Résumé exécutif

L’écran de transition de palier du MVP doit transformer une victoire importante en moment de validation clair, satisfaisant et tourné vers la suite.

Il doit permettre au joueur de voir sans effort :
- quel cap a été franchi,
- quel ennemi a été vaincu,
- ce qu’il a gagné,
- ce qui change dans le monde,
- et quoi faire ensuite.

Son rôle central est simple :
**faire en sorte qu’un palier important ressemble à une vraie avancée dans l’aventure, pas seulement à une ligne de récompenses.**
