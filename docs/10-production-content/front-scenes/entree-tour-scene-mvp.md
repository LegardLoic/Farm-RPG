# Entrée de la Tour - scène MVP

> **Statut : document canonique actif**
> Ce document définit la mise en scène front canonique de l’Entrée de la Tour pour le MVP.
> Il sert de référence active pour l’implémentation front, la transition entre le village et la tour, la lisibilité de l’accès à la progression combat, l’ambiance de seuil et la transformation de l’entrée de la tour en véritable scène jouable.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour la scène d’Entrée de la Tour du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont l’Entrée de la Tour doit exister côté front dans le MVP.

Il permet de :
- incarner la transition entre le monde du village et le monde de la malédiction ;
- préciser ce que le joueur doit voir, ressentir et comprendre avant de monter ;
- guider la mise en scène de l’accès à la tour ;
- donner un poids visuel à l’acte “partir affronter la tour” ;
- éviter que l’entrée de la tour ne soit réduite à un simple bouton ou à une interface neutre.

L’Entrée de la Tour doit être un **seuil dramatique**, pas seulement un point de chargement.

---

## 2. Fonction de la scène

La scène de l’Entrée de la Tour remplit 4 fonctions majeures :

### 2.1 Point de départ de l’ascension
C’est ici que le joueur lance sa progression combat.

### 2.2 Seuil symbolique
Le joueur quitte l’espace du quotidien et entre dans l’espace de la menace.

### 2.3 Point de préparation mentale
La scène doit permettre de sentir que l’on va “au-devant” du danger.

### 2.4 Présence visuelle de la malédiction
Même avant le premier combat, la Tour doit déjà imposer son atmosphère.

---

## 3. Objectifs front de la scène

La scène de l’Entrée de la Tour doit permettre au joueur de comprendre immédiatement :

- qu’il est face à la source visible du danger ;
- qu’entrer ici n’est pas équivalent à entrer dans un simple bâtiment ;
- que la progression de la tour est centrale dans le jeu ;
- que le monde du village est laissé derrière lui à ce moment ;
- que plus on avance, plus cette tour domine le monde.

Le front doit faire ressentir :
- malaise ;
- verticalité ;
- poids ;
- tension ;
- appel du danger.

---

## 4. Position de la scène dans le monde

L’Entrée de la Tour est une scène de transition entre :
- le Village ;
- et la Tour elle-même.

Elle peut être représentée :
- soit comme une zone dédiée distincte avant les étages ;
- soit comme une sous-scène ou une mise en avant visuelle juste avant le premier palier.

Dans tous les cas, la logique canonique est la même :
- le joueur doit sentir qu’il franchit un seuil ;
- le passage doit avoir une densité émotionnelle plus forte qu’un simple changement d’écran.

---

## 5. Composition spatiale recommandée

La scène d’Entrée de la Tour du MVP doit rester simple, mais très marquée.

## 5.1 Zones minimales à afficher

### A. La façade / base visible de la Tour
Fonction :
- imposer la présence physique de la Tour ;
- donner son identité monumentale et hostile.

### B. Le seuil ou portail d’entrée
Fonction :
- point d’interaction principal ;
- signal clair du passage vers la progression combat.

### C. Le chemin d’approche
Fonction :
- préparer visuellement le passage ;
- créer une montée de tension avant l’entrée.

### D. Environnement immédiat altéré
Fonction :
- montrer que la zone autour de la Tour est déjà touchée ;
- faire sentir que le mal déborde sur le monde.

---

## 5.2 Organisation visuelle recommandée

Disposition recommandée en top-down :

- **Tour / façade dominante** en haut ou dans la zone la plus imposante de la scène ;
- **chemin d’approche** depuis le bas ou le côté ;
- **seuil d’entrée** très lisible au centre de la lecture ;
- **environnement proche** dégradé ou assombri autour ;
- très peu de distractions annexes.

Le joueur doit lire d’un seul regard :
**c’est là que tout converge, et c’est là que le monde devient autre chose.**

---

## 6. Hiérarchie visuelle des éléments interactifs

Les éléments de la scène doivent être hiérarchisés ainsi :

### Priorité 1 — La Tour elle-même
Elle doit être le pôle visuel dominant.

### Priorité 2 — Le seuil / portail
Le joueur doit savoir immédiatement où interagir.

### Priorité 3 — Le chemin d’approche
Il structure la mise en tension et le mouvement.

### Priorité 4 — L’environnement corrompu
Il soutient l’ambiance sans voler la lecture principale.

---

## 7. La Tour comme présence visuelle

## 7.1 Fonction front
Même si le joueur n’explore pas toute sa façade dans le MVP, la Tour doit exister comme :
- masse ;
- verticalité ;
- domination ;
- blessure du paysage.

## 7.2 Lecture attendue
Le joueur doit ressentir :
- qu’elle surplombe le monde ;
- qu’elle n’a rien d’un donjon banal ;
- qu’elle impose une pression même silencieuse.

## 7.3 Règle visuelle
La Tour ne doit pas être seulement “grande”.
Elle doit être :
- lourde ;
- froide ;
- anormale ;
- de plus en plus inquiétante dans la lecture qu’on en a.

---

## 8. Le seuil / portail d’entrée

## 8.1 Fonction front
Le seuil est l’élément interactif principal de la scène.

Il sert à :
- entrer dans la tour ;
- faire sentir le passage ;
- marquer le départ de l’expédition.

## 8.2 Interaction recommandée
Interaction principale :
- `Entrer dans la Tour`

Options possibles selon l’implémentation :
- `Continuer l’ascension`
- `Commencer au dernier palier disponible`
- `Retour`

Mais la lecture principale doit rester simple :
**entrer = quitter le quotidien, accepter le danger.**

## 8.3 Lecture visuelle
Le seuil peut être :
- une porte massive ;
- une arche sombre ;
- une ouverture anormale ;
- un portail ancien fissuré ;
- quelque chose qui donne l’impression d’absorber la lumière ou l’attention.

---

## 9. Le chemin d’approche

## 9.1 Fonction front
Le chemin d’approche donne au joueur un petit moment de respiration dramatique avant le passage.

Il sert à :
- préparer l’entrée ;
- isoler la Tour du reste du monde ;
- donner de la gravité à la décision de monter.

## 9.2 Mise en scène recommandée
Le chemin peut être :
- étroit ;
- pierreux ;
- bordé d’herbes mortes ou de végétation corrompue ;
- plus sombre à mesure qu’il s’approche du seuil.

Il ne doit pas sembler confortable ou neutre.

---

## 10. L’environnement immédiat altéré

## 10.1 Fonction front
L’environnement autour de la Tour doit montrer que la malédiction déborde déjà sur l’extérieur.

### Éléments possibles
- herbes ternies ;
- pierres fendues ;
- racines ou ronces anormales ;
- cendres ou poussières ;
- palette plus froide / plus malade.

## 10.2 Rôle émotionnel
Le joueur doit comprendre :
**même avant d’entrer, cette chose empoisonne déjà ce qui l’entoure.**

---

## 11. Informations à faire passer directement par la scène

La scène doit communiquer visuellement :
- que la Tour est la menace dominante ;
- que l’on franchit un vrai seuil ;
- que le monde normal s’arrête ici ;
- que l’intérieur sera plus hostile encore ;
- que la progression dans la tour est un acte central, pas une activité annexe.

Ces informations doivent être ressenties même sans texte.

---

## 12. Informations UI complémentaires recommandées

Un panneau léger ou une surcouche contextuelle peut afficher :

- nom du lieu : `Entrée de la Tour`
- progression actuelle : dernier palier atteint / prochain objectif
- action principale : `Entrer`
- éventuellement un rappel de préparation ou d’objectif narratif

Mais l’UI doit rester secondaire.
La scène doit déjà porter l’essentiel de l’effet dramatique.

---

## 13. Ambiance visuelle et émotionnelle

La scène d’Entrée de la Tour doit évoquer :

- seuil
- menace
- pierre froide
- silence lourd
- appel du danger
- monde altéré

Le joueur doit ressentir ici un contraste fort avec :
- la Ferme, qui est refuge ;
- le Village, qui est lien humain ;
- la Tour, qui est domination et rupture.

L’Entrée de la Tour est l’espace du :
**“je choisis maintenant d’aller affronter ce qui écrase tout le reste.”**

---

## 14. Évolution visuelle attendue

La scène peut évoluer légèrement selon la progression, sans changer sa structure.

Évolutions possibles :
- atmosphère plus lourde aux paliers avancés ;
- signaux visuels montrant que le joueur est allé plus haut ;
- lecture plus grave du seuil à mesure que la vérité de la malédiction approche.

Le MVP n’a pas besoin de quatre versions complètes, mais il peut laisser sentir que la relation du joueur à cet endroit change.

---

## 15. Contraintes UX

La scène doit respecter les règles suivantes :

- lecture immédiate ;
- interaction principale très claire ;
- peu d’éléments secondaires ;
- forte hiérarchie visuelle ;
- passage fluide vers la tour sans interface inutilement lourde.

Le joueur doit comprendre instinctivement :
**je suis prêt ou non, mais c’est ici que la vraie épreuve commence.**

---

## 16. Contraintes techniques / front

Cette scène doit être compatible avec :
- navigation clavier / manette / souris ;
- focus très clair du seuil ;
- intégration simple avec le système de progression des étages ;
- possibilité de rappeler le dernier palier atteint ;
- mise en place progressive sans refonte complète.

Elle doit être un multiplicateur d’ambiance à coût raisonnable.

---

## 17. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/01-univers/lieux-mvp.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/09-direction-artistique/guide-visuel-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 18. Priorités de production recommandées

Après cette scène, les scènes les plus logiques à produire sont :

1. `tour-combat-scene-mvp.md`
2. `retour-village-scene-mvp.md`

Puis, si besoin :
3. docs de mise en scène plus fins par palier de tour

---

## 19. Résumé exécutif

La scène d’Entrée de la Tour du MVP doit transformer l’accès au contenu combat en un vrai seuil dramatique.

Elle doit contenir au minimum :
- une façade ou base lisible de la Tour,
- un portail / seuil clair,
- un chemin d’approche,
- un environnement déjà altéré.

Son rôle central est simple :
**faire ressentir au joueur que monter dans la Tour n’est pas une activité parmi d’autres, mais l’acte par lequel il choisit d’aller défier ce qui maintient le monde sous étouffement.**
