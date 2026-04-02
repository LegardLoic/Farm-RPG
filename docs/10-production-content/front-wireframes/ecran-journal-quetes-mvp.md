# Écran Journal de quêtes MVP

> **Statut : document canonique actif**
> Ce document définit le wireframe fonctionnel canonique de l’écran Journal de quêtes pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des catégories, des listes, des détails de quête et de la hiérarchie des objectifs, ainsi que la lisibilité globale de la progression narrative et systémique.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran Journal de quêtes du MVP.

---

## 1. Rôle du document

Ce document fixe la structure de l’écran Journal de quêtes côté front.

Il permet de :
- traduire le journal de quêtes en écran concret ;
- placer clairement les catégories, la liste des quêtes et le panneau de détail ;
- hiérarchiser la quête principale, la progression de la Tour et les quêtes secondaires ;
- guider Codex sur la disposition générale ;
- éviter un écran trop lourd, trop MMO ou trop proche d’une simple liste technique.

L’écran Journal de quêtes doit être le lieu où le joueur comprend rapidement :
- où il en est ;
- ce qui compte le plus ;
- quel est son prochain objectif concret ;
- et pourquoi cet objectif a du sens dans le monde.

---

## 2. Objectifs de l’écran

L’écran doit permettre au joueur de comprendre immédiatement :

- quelle est la quête principale active ;
- quelles quêtes de Tour sont en cours ;
- quelles quêtes de village / ferme sont actives ;
- quelles quêtes relationnelles restent disponibles ;
- quel est l’objectif actuel de la quête sélectionnée ;
- quel PNJ ou quel lieu est concerné ;
- quelles récompenses ou déblocages sont attendus.

Le front doit faire ressentir :
- lisibilité ;
- orientation ;
- hiérarchie ;
- progression ;
- cohérence entre narration et gameplay.

---

## 3. Principe général de composition

L’écran Journal de quêtes doit être composé de **2 couches principales** :

### 3.1 Couche organisation
Ce qui permet de filtrer et parcourir :
- catégories
- liste des quêtes
- états de quête

### 3.2 Couche détail
Ce qui permet de comprendre la quête sélectionnée :
- description
- objectif
- récompenses
- donneur
- état de progression

Le joueur doit voir d’abord :
- la catégorie active ;
- la quête importante ;
- puis son détail.

---

## 4. Zoning général recommandé

## 4.1 Répartition fonctionnelle

### Colonne gauche
**Catégories**
- Principale
- Tour / progression
- Village / ferme
- Relations / secondaires
- Terminées

### Colonne centrale dominante
**Liste des quêtes**
- nom
- statut
- objectif court
- nouveauté / mise à jour / à rendre

### Colonne droite
**Détail de la quête sélectionnée**
- titre
- type
- donneur ou origine
- description courte
- objectif actuel
- récompenses
- lieu concerné

### Bandeau léger
**Rappel global**
- quête suivie
- nombre de quêtes actives
- éventuel marqueur de priorité

---

## 5. Wireframe fonctionnel simplifié

Exemple logique de composition :

    ┌──────────────────────────────────────────────────────────────┐
    │ Journal de quêtes                    Quête suivie / priorité │
    │                                                              │
    │ [Catégories]          [ Liste des quêtes ]   [ Détail quête ]│
    │ Principale            Titre / statut         Titre           │
    │ Tour / progression    Titre / statut         Type            │
    │ Village / ferme       Titre / statut         Donneur         │
    │ Relations             Titre / statut         Description     │
    │ Terminées             Titre / statut         Objectif actuel │
    │                                              Récompenses     │
    │                                              Lieu concerné   │
    │                                                              │
    │                    Retour / Suivre / Fermer                  │
    └──────────────────────────────────────────────────────────────┘

Ce schéma n’est pas une DA finale.
C’est une logique de hiérarchie.

---

## 6. Colonne catégories

## 6.1 Fonction
Permettre au joueur de filtrer les quêtes selon leur nature.

## 6.2 Catégories canoniques à afficher
- `Principale`
- `Tour / progression`
- `Village / ferme`
- `Relations / secondaires`
- `Terminées`

## 6.3 Lecture attendue
Le joueur doit comprendre immédiatement :
- où chercher la quête principale ;
- où retrouver les quêtes liées à la Tour ;
- où lire les quêtes plus légères du quotidien.

## 6.4 Règle UX
Les catégories doivent être peu nombreuses, très claires et toujours visibles.
Le MVP doit éviter toute arborescence compliquée.

---

## 7. Liste des quêtes

## 7.1 Fonction
Afficher les quêtes de la catégorie active.

## 7.2 Informations minimales par ligne
- titre de la quête
- statut
- objectif très court ou rappel synthétique
- badge éventuel :
  - `Nouveau`
  - `Mis à jour`
  - `À rendre`

## 7.3 Lecture attendue
Le joueur doit pouvoir scanner rapidement :
- ce qui est important ;
- ce qui a changé ;
- ce qui peut être rendu ;
- ce qui est en cours.

## 7.4 Règle UX
La liste doit être :
- lisible ;
- stable ;
- facile à parcourir ;
- hiérarchisée par importance.

---

## 8. Détail de la quête sélectionnée

## 8.1 Fonction
Afficher les informations complètes de la quête actuellement sélectionnée.

## 8.2 Informations minimales à afficher
- titre
- type de quête
- donneur ou origine
- description courte
- objectif actuel
- récompenses
- lieu ou zone concernée

## 8.3 Lecture attendue
Le joueur doit comprendre immédiatement :
- ce que raconte la quête ;
- ce qu’il doit faire ;
- pourquoi elle existe ;
- ce qu’il gagnera.

## 8.4 Règle UX
Le détail doit être concis.
Le MVP ne doit pas transformer le journal en roman ni en mur de texte.

---

## 9. Objectif actuel

## 9.1 Fonction
Donner au joueur une action concrète à faire ensuite.

## 9.2 Forme recommandée
L’objectif doit être formulé de manière simple et actionnable.

Exemples :
- Parler au Maire
- Récolter 3 navets
- Retourner à la Forge
- Atteindre l’étage 3 de la Tour
- Vaincre le Gardien des cendres
- Rapporter le Fragment du Cœur de la Malédiction au village

## 9.3 Règle UX
L’objectif actuel doit ressortir plus que la description générale.
Le joueur doit repartir de l’écran avec une direction claire.

---

## 10. Récompenses

## 10.1 Fonction
Montrer ce que la quête apporte au joueur ou au monde.

## 10.2 Récompenses minimales à afficher
- XP
- or
- objet
- matériau
- relation
- déblocage
- évolution du monde

## 10.3 Règle UX
Toutes les récompenses n’ont pas besoin d’être purement chiffrées.
Certaines peuvent être affichées comme :
- `Forge améliorée`
- `Nouveau dialogue`
- `Progression du village`
- `Déblocage de service`

Le joueur doit sentir que les récompenses sont lisibles, même quand elles sont systémiques ou narratives.

---

## 11. Hiérarchie visuelle recommandée

### Priorité 1
- catégorie active
- quête principale ou quête suivie
- objectif actuel

### Priorité 2
- statuts
- récompenses
- donneur / lieu concerné

### Priorité 3
- description plus large
- historique implicite
- détails secondaires

Le joueur doit d’abord comprendre :
- quelle quête suivre ;
- quoi faire ensuite ;
- où aller.

---

## 12. États UX à prévoir

## 12.1 Nouvelle quête
Doit ressortir clairement :
- badge `Nouveau`
- surbrillance légère

## 12.2 Quête mise à jour
Doit être visible immédiatement :
- badge `Mis à jour`
- changement d’objectif lisible

## 12.3 Quête à rendre
Doit être facile à identifier :
- badge `À rendre`
- ou mise en avant plus forte

## 12.4 Quête terminée
Doit pouvoir être archivée dans `Terminées` sans gêner la lecture des quêtes actives.

## 12.5 Quête suivie
Le joueur doit pouvoir identifier rapidement celle qui structure sa progression immédiate.

---

## 13. Comportement émotionnel de l’écran

L’écran Journal de quêtes doit donner la sensation :

- d’un fil conducteur ;
- d’une aventure lisible ;
- d’une progression organisée ;
- d’un monde qui réagit à des actions concrètes.

Le joueur doit y ressentir :
**“je sais où j’en suis, et je comprends pourquoi ce que je fais compte.”**

---

## 14. Contraintes UX

L’écran doit respecter les règles suivantes :

- peu de catégories ;
- liste claire ;
- objectif visible ;
- récompenses compréhensibles ;
- très peu de friction ;
- priorité nette à la quête principale et aux grandes étapes de Tour.

Le joueur ne doit jamais se demander longtemps :
- quelle quête est importante ;
- quoi faire ensuite ;
- à qui parler ;
- où aller.

---

## 15. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- mise à jour simple des statuts
- changement de badges
- archivage des quêtes terminées
- marquage de quête suivie
- réutilisation des données quêtes déjà présentes

Ordre de montage recommandé :
1. catégories
2. liste
3. détail
4. badges d’état
5. quête suivie
6. archivage des terminées

---

## 16. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/ui/journal-quetes-mvp.md`
- `docs/07-quetes/quetes-mvp-index.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/10-production-content/front-scenes/retour-village-scene-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 17. Priorités de production recommandées

Après cet écran, les prochaines étapes les plus logiques sont :

1. faire une pause de consolidation documentaire
2. produire des specs plus fines de composants front réutilisables
3. détailler les fiches de quêtes majeures
4. préparer des wireframes ou maquettes plus visuelles si besoin

---

## 18. Résumé exécutif

L’écran Journal de quêtes du MVP doit faire exister le journal comme un véritable outil de lecture de l’aventure, pas comme une simple liste de tâches.

Il doit donner la priorité :
- aux catégories claires ;
- aux quêtes importantes ;
- aux objectifs concrets ;
- aux récompenses lisibles ;
- et à la hiérarchie entre quête principale, Tour et secondaire.

Son rôle central est simple :
**faire en sorte que le joueur sache toujours où il en est et pourquoi sa prochaine action a du sens dans le monde du jeu.**
