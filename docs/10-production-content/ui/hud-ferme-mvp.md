# HUD Ferme MVP

> **Statut : document canonique actif**
> Ce document définit la structure canonique du HUD de ferme pour le MVP.
> Il sert de référence active pour l’implémentation front, la lisibilité des parcelles, la gestion des actions agricoles, le cycle jour/nuit, le craft simple et la transformation de la ferme en espace de jeu clair et confortable.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour le HUD de ferme du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont le HUD de ferme doit être conçu dans le MVP.

Il permet de :
- hiérarchiser les informations utiles au travail agricole ;
- guider la disposition des indicateurs, panneaux contextuels et actions principales ;
- éviter la surcharge technique ;
- soutenir la scène de ferme sans la transformer en tableau de bord opaque ;
- rendre les actions agricoles rapides, lisibles et satisfaisantes.

Le HUD de ferme ne doit pas donner l’impression d’un outil de gestion froid.
Il doit être la couche de lecture qui accompagne un lieu vivant, simple et concret.

---

## 2. Objectifs du HUD de ferme

Le HUD doit permettre au joueur de comprendre immédiatement :

- quel jour on est ;
- si l’on est le jour ou la nuit ;
- quelles parcelles demandent une action ;
- quelle graine est sélectionnée ;
- si le craft est accessible ;
- où dormir / faire avancer le temps ;
- ce qu’il peut faire maintenant sur la ferme.

Le front doit faire ressentir :
- calme ;
- clarté ;
- rythme ;
- progression du travail ;
- sensation de contrôle.

---

## 3. Principes de conception

### 3.1 La scène parle d’abord
Le joueur doit voir directement une grande partie des états des parcelles dans la scène.
Le HUD vient compléter, pas remplacer.

### 3.2 Actions contextuelles
Le HUD doit aider à répondre à :
**que puis-je faire sur cette parcelle ou dans cette zone ?**

### 3.3 Peu d’informations permanentes
Le HUD de ferme doit éviter de maintenir trop de panneaux ouverts en permanence.

### 3.4 Lecture apaisée
Contrairement au combat, le HUD de ferme doit respirer.
Il doit être lisible sans créer de tension inutile.

### 3.5 Priorité à la boucle agricole
Tout doit soutenir la boucle :
- planter
- arroser
- attendre
- récolter
- transformer ou repartir

---

## 4. Structure générale recommandée

Le HUD de ferme du MVP repose sur **5 blocs principaux** :

1. **Bloc temps**
2. **Bloc parcelle / action contextuelle**
3. **Bloc graines / sélection**
4. **Bloc accès craft / repos**
5. **Bloc feedbacks agricoles**

Ces blocs doivent être légers, mais toujours clairs.

---

## 5. Bloc temps

## 5.1 Fonction
Afficher l’état du temps et du cycle.

## 5.2 Informations minimales à afficher
- numéro du jour
- état `Jour` / `Nuit`
- éventuellement une indication simple du moment de la journée si utile plus tard

## 5.3 Priorité de lecture
Le joueur doit toujours savoir rapidement :
- s’il est encore dans la journée active ;
- si dormir fera avancer le cycle.

## 5.4 Placement recommandé
Le bloc temps doit être visible en permanence, mais discret.
Exemple :
- coin supérieur de l’écran
- bandeau léger

## 5.5 Règle UX
Le temps est une information structurante, mais elle ne doit pas devenir visuellement dominante.

---

## 6. Bloc parcelle / action contextuelle

## 6.1 Fonction
Afficher l’état de la parcelle ciblée ou sélectionnée.

## 6.2 Informations minimales à afficher
Selon l’état de la parcelle :
- vide
- plantée
- arrosée
- prête à récolter

## 6.3 Actions contextuelles possibles
- `Planter`
- `Arroser`
- `Récolter`

## 6.4 Règle UX
Le joueur ne doit pas avoir à mémoriser un état caché.
Dès qu’il cible une parcelle, l’interface doit l’aider à comprendre :
- ce qu’elle est ;
- ce qu’elle attend ;
- ce qu’il peut faire maintenant.

## 6.5 Placement recommandé
Ce bloc peut apparaître :
- près de la parcelle ciblée
- ou dans un petit panneau contextuel fixe en bas / côté écran

Le plus important est qu’il soit immédiat et léger.

---

## 7. Bloc graines / sélection

## 7.1 Fonction
Afficher la ou les graines disponibles, ou au minimum la graine actuellement sélectionnée.

## 7.2 Informations minimales à afficher
- icône de la graine sélectionnée
- nom
- quantité restante

## 7.3 Règle UX
Le joueur doit savoir instantanément :
- ce qu’il va planter s’il clique ;
- s’il lui reste des graines ;
- s’il doit retourner au Marché.

## 7.4 Niveau de complexité recommandé
Pour le MVP, le HUD peut rester très simple :
- soit une graine sélectionnée à la fois ;
- soit un petit sélecteur rapide.

Il ne faut pas transformer la ferme en inventaire permanent.

---

## 8. Bloc accès craft / repos

## 8.1 Fonction
Rendre visibles les deux actions méta les plus importantes de la ferme :
- craft
- dormir

## 8.2 Actions principales à afficher
- `Ouvrir le craft`
- `Dormir`

## 8.3 Règle UX
Ces actions ne doivent pas être cachées profondément.
Le joueur doit savoir rapidement :
- comment transformer ses ressources ;
- comment faire avancer le temps.

## 8.4 Mise en scène recommandée
Ces actions doivent rester liées à la scène :
- craft près du point de travail
- dormir près de la maison / abri

Le HUD peut montrer l’action, mais la scène doit en porter le sens.

---

## 9. Bloc feedbacks agricoles

## 9.1 Fonction
Afficher les conséquences immédiates des actions du joueur.

## 9.2 Feedbacks prioritaires
- graine plantée
- parcelle arrosée
- récolte obtenue
- jour avancé
- craft réussi
- action impossible / ressource manquante

## 9.3 Règle de mise en scène
Les feedbacks doivent être :
- courts ;
- lisibles ;
- satisfaisants ;
- discrets.

Le travail de ferme ne doit pas être noyé sous les popups.

---

## 10. Hiérarchie visuelle globale

Le HUD doit hiérarchiser visuellement :

### Priorité 1
- action contextuelle sur la parcelle
- jour / nuit
- graine sélectionnée
- récolte disponible

### Priorité 2
- accès craft
- accès repos

### Priorité 3
- détails secondaires
- messages non urgents
- infos futures ou optionnelles

Le joueur doit d’abord savoir :
- quoi faire ;
- sur quelle parcelle ;
- avec quelle graine ;
- et si le moment est venu de dormir ou récolter.

---

## 11. Règles de lecture des parcelles

Le HUD ne doit pas tout faire.
La scène doit déjà permettre de lire visuellement :

- parcelle vide
- parcelle occupée
- parcelle arrosée
- parcelle mûre

Le HUD vient surtout :
- confirmer l’état ;
- proposer l’action ;
- éviter les ambiguïtés.

Cette distinction est importante pour ne pas transformer la ferme en tableau technique.

---

## 12. Ambiance UI recommandée

Le HUD de ferme doit être :
- léger ;
- sobre ;
- doux ;
- lisible ;
- cohérent avec la matière du monde.

Il faut éviter :
- les panneaux trop massifs ;
- les effets trop agressifs ;
- la saturation d’informations ;
- les visuels “outil de gestion industrielle”.

Le bon ton est :
**interface utilitaire, calme et proche du quotidien**

---

## 13. Contraintes UX

Le HUD de ferme doit respecter les règles suivantes :

- actions rapides ;
- très peu de friction ;
- états agricoles compréhensibles ;
- peu d’éléments permanents inutiles ;
- hiérarchie claire ;
- pas d’inventaire envahissant au milieu de la scène.

Le joueur doit toujours savoir :
- quoi faire ;
- où le faire ;
- et si une boucle agricole est prête à avancer.

---

## 14. Contraintes techniques / front

Le HUD doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- mise à jour immédiate des parcelles
- faible coût de lecture
- intégration simple avec les systèmes déjà présents
- ajout progressif d’améliorations sans refonte complète

Le HUD peut être construit par étapes :
1. jour / nuit
2. parcelle ciblée
3. sélection de graine
4. craft / repos
5. feedbacks

---

## 15. Cas particuliers à prévoir

### Aucune graine disponible
Le HUD doit rendre ce manque lisible sans bloquer la scène.

### Parcelle impossible à utiliser
Le joueur doit comprendre pourquoi :
- déjà plantée
- pas arrosable
- pas récoltable
- autre état incompatible

### Récolte multiple disponible
Le HUD peut aider avec des signaux simples, mais sans transformer l’écran en check-list géante.

### Nuit
Le HUD doit faire sentir qu’il est temps de :
- rentrer
- dormir
- clôturer la boucle

---

## 16. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/front-scenes/ferme-scene-mvp.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/06-crafting/recettes-index.md`
- `docs/09-direction-artistique/guide-visuel-mvp.md`
- `docs/00-projet/canon-mvp.md`

---

## 17. Priorités de production recommandées

Après ce document, les docs UI les plus logiques à produire sont :

1. `panneau-shop-mvp.md`
2. `journal-quetes-mvp.md`
3. `fiche-personnage-equipement-mvp.md`
4. `ecran-transition-palier-mvp.md`

---

## 18. Résumé exécutif

Le HUD de ferme du MVP doit être pensé comme une couche de lecture légère, contextuelle et immédiatement utile.

Il doit permettre au joueur de voir sans effort :
- le temps,
- l’état de ses parcelles,
- la graine sélectionnée,
- les actions agricoles possibles,
- l’accès au craft et au repos.

Son rôle central est simple :
**faire en sorte que le travail de la ferme soit lisible, fluide et satisfaisant, sans jamais casser la sensation d’être dans un lieu vivant.**
