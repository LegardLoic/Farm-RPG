# Tour / Combat - scène MVP

> **Statut : document canonique actif**
> Ce document définit la mise en scène front canonique de la Tour en situation de combat pour le MVP.
> Il sert de référence active pour l’implémentation front, la lisibilité des affrontements, la hiérarchie visuelle des informations de combat, la mise en scène des ennemis et des paliers, ainsi que la transformation du système de combat en véritable scène jouable.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la scène de Tour / Combat du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont les combats de la Tour doivent exister côté front dans le MVP.

Il permet de :
- transformer le système de combat déjà posé en scène claire et incarnée ;
- préciser ce que le joueur doit voir, ressentir et comprendre pendant un affrontement ;
- organiser la lecture du héros, des ennemis, des intentions, des effets et du rythme ;
- guider l’ergonomie de l’écran de combat ;
- éviter que le combat ne reste un simple assemblage de HUD techniques.

La scène de combat doit être lisible d’abord, impressionnante ensuite.
Elle doit faire sentir la progression de la Tour sans nuire à la compréhension du joueur.

---

## 2. Fonction de la scène

La scène de Tour / Combat remplit 5 fonctions majeures :

### 2.1 Mettre le joueur à l’épreuve
C’est l’espace de résolution des affrontements.

### 2.2 Donner une lecture claire du danger
Le joueur doit immédiatement comprendre qui menace, comment, et à quel degré.

### 2.3 Matérialiser la montée de la malédiction
L’ambiance de combat doit évoluer avec les étages.

### 2.4 Rendre visibles les choix du joueur
Compétences, consommables, équipement et préparation doivent trouver ici leur expression.

### 2.5 Marquer les paliers
Les mini-boss et le boss majeur doivent y apparaître comme de vrais caps, pas juste comme des valeurs plus hautes.

---

## 3. Objectifs front de la scène

La scène de combat doit permettre au joueur de comprendre immédiatement :

- où se trouve son personnage ;
- où se trouvent les ennemis ;
- qui est actif ;
- quelles sont les actions possibles ;
- quels effets ou statuts sont en cours ;
- si le combat est standard, de palier ou de boss ;
- à quel point la situation est sous contrôle ou non.

Le front doit faire ressentir :
- tension ;
- lisibilité ;
- rythme ;
- montée d’oppression avec la progression.

---

## 4. Principes de mise en scène du combat

## 4.1 Lisibilité avant spectacle
Chaque élément important doit être identifiable rapidement :
- héros ;
- ennemi(s) ;
- PV / MP ;
- intentions ;
- actions ;
- statuts.

## 4.2 Scène plutôt que panneau
Même si le combat repose encore sur des systèmes UI forts, le front doit donner l’impression :
- d’une confrontation située ;
- d’un espace hostile ;
- d’un vrai “moment” de jeu.

## 4.3 Variation par palier
Le décor ou l’ambiance de fond n’ont pas besoin d’être entièrement refaits à chaque étage, mais la scène doit faire sentir :
- l’escalade ;
- le changement de ton ;
- la spécificité des paliers majeurs.

## 4.4 Poids du tour par tour
Le front doit aider le joueur à lire :
- la séquence ;
- les intentions ;
- les conséquences ;
- le retour d’information.

---

## 5. Composition spatiale recommandée

La scène de combat du MVP doit rester simple et très lisible.

## 5.1 Zones minimales à afficher

### A. Zone du héros
Fonction :
- ancrer le joueur ;
- afficher son état ;
- rendre lisible son tour et ses choix.

### B. Zone ennemie
Fonction :
- afficher les monstres ;
- distinguer clairement ennemi commun, élite, mini-boss ou boss.

### C. Zone d’actions
Fonction :
- présenter les options du joueur :
  - attaque
  - compétences
  - objets
  - défense / autre action selon système retenu

### D. Zone d’informations de combat
Fonction :
- PV / MP ;
- statuts ;
- intentions ;
- feedbacks principaux.

### E. Fond / décor de combat
Fonction :
- situer l’affrontement dans la Tour ;
- faire sentir le palier ;
- soutenir l’ambiance.

---

## 5.2 Organisation visuelle recommandée

Disposition recommandée :

- **héros** à gauche ou en bas selon la logique UI retenue ;
- **ennemi(s)** à droite ou en haut, très lisibles ;
- **zone d’actions** en bas ou sur le côté, bien séparée ;
- **infos critiques** proches des unités concernées ou regroupées dans une zone dédiée ;
- **fond de scène** suffisamment présent pour l’ambiance, mais jamais au détriment de la lecture.

Le joueur doit comprendre très vite :
**où je suis, qui je combats, que puis-je faire maintenant.**

---

## 6. Zone du héros

## 6.1 Fonction front
La zone du héros doit rendre visibles :

- identité du personnage
- PV
- MP
- statuts
- disponibilité d’action
- équipement ou style implicite si possible

## 6.2 Lecture attendue
Le joueur doit sentir :
- que son héros est central ;
- qu’il agit réellement dans cette scène ;
- que ses choix de build et de préparation se manifestent ici.

## 6.3 Règle de lisibilité
Le héros ne doit jamais se perdre dans le décor.
Sa silhouette et ses informations doivent rester prioritaires.

---

## 7. Zone ennemie

## 7.1 Fonction front
La zone ennemie doit permettre de lire clairement :

- le ou les adversaires ;
- leur nature ;
- leur importance ;
- leur état ;
- leur intention ou menace.

## 7.2 Hiérarchie visuelle
Les ennemis doivent être hiérarchisés visuellement selon leur rôle :

### Ennemi commun
- plus simple ;
- moins dominant visuellement.

### Élites / intermédiaires
- un peu plus marqués ;
- présence plus lourde.

### Mini-boss
- silhouette forte ;
- présence claire de palier.

### Boss majeur
- domination visuelle immédiate ;
- scène plus lourde ;
- sentiment de cap final.

## 7.3 Règle de lisibilité
Même dans un combat de boss, les informations critiques doivent rester lisibles sans surcharge FX.

---

## 8. Zone d’actions du joueur

## 8.1 Fonction front
La zone d’actions doit rendre le tour du joueur évident.

Elle doit présenter clairement les grands types d’actions disponibles :
- attaque ;
- compétences ;
- objets ;
- autres actions si présentes.

## 8.2 Priorité UX
Le joueur doit pouvoir :
- reconnaître les actions ;
- comprendre leur coût ;
- voir si elles sont disponibles ;
- agir rapidement sans friction.

## 8.3 Règle de design
Même si le système est riche, le MVP doit garder un panneau d’action :
- lisible ;
- compact ;
- non intimidant.

---

## 9. Zone d’informations de combat

## 9.1 Informations critiques à rendre visibles
Le front doit rendre visibles au minimum :

- PV
- MP
- statuts
- intention ennemie si activée dans le système
- cible ou ordre de tour si nécessaire
- messages de feedback importants

## 9.2 Priorité de lecture
Les informations doivent être hiérarchisées ainsi :

### Priorité 1
- PV / danger immédiat
- action disponible
- ennemi actif / menace majeure

### Priorité 2
- MP
- statuts
- intention

### Priorité 3
- détails secondaires
- logs longs
- historiques

## 9.3 Règle UX
Le joueur ne doit pas avoir à scanner tout l’écran pour savoir :
- s’il est en danger ;
- ce qu’il peut faire ;
- ce que l’ennemi prépare.

---

## 10. Fond / décor de combat

## 10.1 Fonction front
Le fond ne doit pas être juste décoratif.
Il doit aider à faire sentir :
- le palier ;
- l’ambiance de la Tour ;
- la progression dans l’oppression.

## 10.2 Progression visuelle recommandée

### Étages 1 à 2
- pierre simple ;
- altération discrète ;
- végétation corrompue légère ;
- étrangeté encore contenue.

### Palier 3
- vivant corrompu plus présent ;
- tension végétale, racines, épines, masse hostile.

### Étages 4 à 5
- chaleur ;
- braise ;
- matière plus agressive ;
- sentiment d’étouffement.

### Étages 6 à 8
- défense plus structurée ;
- géométrie plus rigide ;
- présence de garde ou de hiérarchie.

### Étages 9 à 10
- obscurité plus profonde ;
- veines de malédiction ;
- ambiance plus maudite que matérielle.

Le front n’a pas besoin de 10 décors uniques, mais il doit faire sentir ces caps.

---

## 11. Feedbacks de combat

## 11.1 Types de feedbacks à valoriser
Le MVP doit rendre très lisibles :

- dégâts subis
- soin reçu
- consommation de MP
- application / retrait de statut
- blocage / défense / altération majeure
- fin de combat
- palier franchi

## 11.2 Règle de mise en scène
Les feedbacks doivent être :
- rapides ;
- lisibles ;
- hiérarchisés ;
- suffisamment visibles pour être ressentis ;
- pas trop envahissants pour ne pas casser le rythme.

## 11.3 Importance des combats de boss
Pour les combats de palier et boss :
- les feedbacks importants doivent être un peu plus marqués ;
- sans noyer l’écran sous les particules ou les sur-animations.

---

## 12. Différence entre combat normal et combat de palier

Le front doit faire sentir immédiatement si l’on est dans :

### Combat normal
- tension maîtrisée ;
- lecture simple ;
- ambiance de progression régulière.

### Combat de palier
- pression plus forte ;
- ennemi visuellement plus présent ;
- ambiance de seuil ;
- sensation de cap.

### Combat de boss majeur
- présence dominante ;
- scène plus lourde ;
- rythme plus grave ;
- feedback de victoire plus important.

Le joueur doit ressentir la hiérarchie du bestiaire sans ouvrir un wiki.

---

## 13. Ambiance visuelle et émotionnelle

La scène de Tour / Combat doit évoquer :

- confrontation
- pression
- montée
- résistance du lieu
- lecture du danger
- oppression croissante

Le joueur doit ressentir ici un contraste fort avec :
- la Ferme, qui est calme et fertile ;
- le Village, qui est humain et social ;
- l’Entrée de la Tour, qui est le seuil.

La scène de combat est l’espace du :
**“voilà ce qui bloque le monde, et voilà comment je lui réponds.”**

---

## 14. Évolution visuelle attendue

La scène doit laisser sentir une progression simple mais réelle :

- ennemis plus marquants ;
- ambiance plus lourde ;
- palette plus sombre ;
- lecture plus grave des seuils ;
- boss plus centraux visuellement.

Le MVP n’a pas besoin d’une mise en scène cinématique à chaque combat, mais il a besoin d’une **graduation perceptible**.

---

## 15. Contraintes UX

La scène doit respecter les règles suivantes :

- lecture très rapide de l’état du combat ;
- distinction claire entre héros, ennemi et actions ;
- peu de bruit visuel ;
- pas de surcharge de logs à l’écran ;
- priorités UI évidentes ;
- boss et paliers plus marqués sans perdre la clarté.

Le joueur doit toujours savoir :
- où regarder ;
- quoi faire ;
- pourquoi le combat est dangereux.

---

## 16. Contraintes techniques / front

Cette scène doit être compatible avec :
- navigation souris / clavier / manette ;
- rendu simple des états ;
- variation légère de fond selon palier ;
- réutilisation de l’existant côté combat/API/state ;
- montée progressive de sophistication visuelle sans refonte totale.

Elle doit être réalisable par couches :
1. lisibilité
2. ambiance
3. feedbacks
4. variation de palier
5. poids des boss

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/09-direction-artistique/guide-visuel-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 18. Priorités de production recommandées

Après cette scène, la scène la plus logique à produire est :

1. `retour-village-scene-mvp.md`

Puis, si besoin :
2. docs plus fins de variation par palier
3. docs UI ciblés sur HUD combat / feedbacks / boss state

---

## 19. Résumé exécutif

La scène de Tour / Combat du MVP doit transformer le système d’affrontement en une confrontation lisible, tendue et progressive.

Elle doit contenir au minimum :
- une zone héros,
- une zone ennemie,
- une zone d’actions,
- une zone d’informations critiques,
- un fond de combat capable de faire sentir la progression de la Tour.

Son rôle central est simple :
**faire ressentir au joueur que chaque combat dans la Tour est un morceau concret de la lutte contre ce qui étouffe le monde.**
