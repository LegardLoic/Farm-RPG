# Lore et cadrage narratif — Ferme RPG tour par tour

## 1. Objectif du document

Ce document pose une base scénaristique claire pour le projet afin de donner une direction cohérente au développement. Il sert à aligner le lore, la structure de progression, la boucle de gameplay et les futurs déblocages système.

L’objectif n’est pas seulement de raconter une histoire, mais de transformer cette histoire en éléments concrets de game design et en besoins techniques exploitables par Codex.

Ce cadrage s’appuie sur les décisions déjà prises dans le GDD initial, l’architecture technique et le questionnaire de cadrage déjà rempli. Il reprend notamment les éléments suivants :
- mélange entre **RPG tour par tour** et **jeu de ferme** ;
- structure **solo** avec possibilité de **coop plus tard** ;
- combat en **ligne de front simple**, style JRPG classique ;
- monde structuré autour de **3 zones MVP** : la ferme, le village, la tour ;
- progression centrée sur les **boss**, les **déblocages narratifs** et les **améliorations de systèmes**.

---

## 2. Vision narrative

Le jeu raconte l’histoire d’un aventurier appelé à l’aide par le maire d’un village isolé, frappé par une malédiction mystérieuse.

Cette malédiction a eu deux conséquences majeures :
1. elle a plongé les habitants dans un état de possession ou d’engourdissement, les rendant incapables d’assurer leur rôle normal ;
2. elle a rendu les terres stériles, empêchant le village de survivre par ses propres moyens.

Au-dessus du village se dresse une immense tour de 100 étages, remplie de monstres de plus en plus dangereux. D’après les rares informations encore intactes, l’origine du mal se trouve au sommet : un puissant sorcier, retranché tout en haut, maintient la malédiction sur toute la région.

Le héros ne vient pas simplement pour “tuer un boss final”. Il doit progressivement reconstruire les moyens de survie du village, lever les malédictions une par une, redonner leurs fonctions aux habitants et se préparer, étage après étage, à atteindre le sommet de la tour.

Le cœur du jeu repose donc sur une double progression :
- **progression de combat** : devenir assez fort pour grimper la tour ;
- **progression agricole et économique** : devenir assez autonome pour financer et soutenir cette ascension.

---

## 3. Pitch de départ

Le joueur incarne un aventurier menant jusque-là une vie assez libre. Un jour, il reçoit une lettre urgente d’un maire vivant dans un petit village reculé. Celui-ci explique que son village a été frappé par une étrange malédiction. Les habitants ne sont plus eux-mêmes, les métiers du village sont à l’arrêt, les terres ne produisent plus rien, et une présence malveillante semble dominer toute la région.

Le maire affirme que l’origine de cette catastrophe provient d’un sorcier retranché au sommet d’une tour gigantesque de 100 étages. Personne au village n’est en état d’intervenir. Le héros est donc invité à venir sur place pour tenter de sauver le village.

À son arrivée, la situation est pire qu’annoncée. Le village est comme figé. Certains habitants sont présents physiquement mais incapables de tenir leur rôle. D’autres sont reclus chez eux. Les commerces existent encore, mais ils sont inutilisables ou très limités. La terre elle-même semble malade.

Le maire met alors à disposition du joueur une vieille ferme abandonnée à l’écart du village. Ce lieu devient la base du héros. C’est à partir de cette ferme qu’il devra reconstruire sa capacité à survivre, produire, s’équiper et préparer l’ascension de la tour.

Le joueur reçoit un kit de départ minimal :
- outils de base de ferme ;
- quelques graines ;
- une recette simple ;
- éventuellement une potion faible ou un consommable de secours ;
- quelques informations fragmentaires sur la tour et le village.

Le jeu commence donc dans une logique de reconstruction, de montée en puissance et de libération progressive.

---

## 4. Promesse du jeu

Le jeu propose une expérience où **chaque victoire en combat fait évoluer le monde**, et où **chaque progrès dans la ferme améliore les chances de survie dans le donjon**.

Le joueur ne sépare jamais totalement ses deux activités principales. Il ne s’agit pas d’un mini-jeu de ferme à côté d’un RPG, ni d’un RPG avec une ferme décorative. Les deux sont interdépendants.

Le fantasy loop recherchée est la suivante :
- je cultive, récolte, craft et vends ;
- cela me donne des ressources, de l’équipement, des consommables et de l’argent ;
- cela me permet de mieux combattre dans la tour ;
- battre certains boss lève des malédictions ou débloque des fonctions du village ;
- ces nouveaux services améliorent à leur tour la ferme, l’équipement ou les possibilités de progression ;
- je retourne cultiver et explorer avec de nouveaux moyens.

---

## 5. Boucle centrale de gameplay reliée au lore

## 5.1 Boucle haute niveau

1. Entretenir et développer la ferme.
2. Produire des récoltes et obtenir des ressources.
3. Utiliser ces ressources pour le craft, la vente ou la préparation du combat.
4. Explorer la tour et vaincre des monstres.
5. Battre des boss qui lèvent partiellement la malédiction.
6. Débloquer des PNJ, services, boutiques ou outils.
7. Renforcer la ferme et l’économie.
8. Repartir plus fort vers la tour.

## 5.2 Boucle narrative

Le héros ne restaure pas le village d’un seul coup. Il agit par paliers. Chaque boss important représente une fracture de la malédiction. Chaque palier de progression doit être visible à la fois :
- dans l’histoire ;
- dans les dialogues ;
- dans le gameplay ;
- dans l’accessibilité des systèmes.

Exemple :
- boss étage 10 battu → le forgeron est libéré → amélioration des outils de ferme et premiers équipements sérieux ;
- boss étage 20 battu → l’alchimiste retrouve ses esprits → nouvelles potions, nouveaux craftings ;
- boss étage 30 battu → le marchand rouvre un commerce plus riche ;
- boss étage 40 battu → déblocage d’une quête spéciale liée à une relique permettant l’amélioration avancée de la ferme.

---

## 6. Structure du monde

## 6.1 La ferme

La ferme est la base principale du joueur.

Fonctions :
- produire des cultures ;
- stocker des ressources ;
- crafter certains objets ;
- se reposer ;
- servir de point de sauvegarde ou de retour narratif ;
- accueillir plus tard des améliorations structurelles.

Rôle narratif :
- symbole de renaissance au milieu d’un territoire maudit ;
- premier lieu réellement sous le contrôle du joueur ;
- espace où l’on ressent concrètement les progrès accomplis.

Rôle gameplay :
- source principale d’économie early game ;
- base de crafting ;
- point de résilience après une défaite.

## 6.2 Le village

Le village est le hub social et systémique du jeu.

Fonctions :
- recevoir des quêtes ;
- acheter/vendre ;
- améliorer équipements et outils ;
- développer les relations avec certains PNJ ;
- débloquer des pans de narration.

Rôle narratif :
- refléter visuellement l’état de la malédiction ;
- montrer les conséquences concrètes des boss vaincus ;
- faire ressentir que le monde change grâce au joueur.

Le village ne doit pas être immédiatement pleinement fonctionnel. Il doit évoluer par étapes.

## 6.3 La tour

La tour est le pilier combat/progression.

Fonctions :
- combats ;
- boss ;
- loot ;
- ingrédients rares ;
- paliers narratifs.

Rôle narratif :
- matérialisation physique de la malédiction ;
- lieu hostile et source du chaos ;
- colonne vertébrale de la quête principale.

Rôle gameplay :
- test de préparation ;
- source d’XP, d’équipement, d’ingrédients et de progression ;
- rythme structuré par étages et boss.

---

## 7. Dépendance ferme ↔ combat

C’est le point fondamental du projet.

## 7.1 Ce que la ferme apporte au RPG

La ferme permet de produire :
- ingrédients de potions ;
- ressources vendables ;
- composants de craft ;
- progression économique ;
- éventuellement certains buffs temporaires ;
- matières premières servant à des quêtes ou à l’amélioration d’outils.

Donc la ferme soutient directement :
- la survie en donjon ;
- la préparation des combats ;
- l’acquisition d’équipements ;
- la montée en puissance du joueur.

## 7.2 Ce que le RPG apporte à la ferme

La progression dans la tour permet de débloquer :
- villageois libérés ;
- nouveaux stocks en boutique ;
- outils améliorés ;
- nouvelles recettes ;
- nouvelles zones ou fonctionnalités de la ferme ;
- objets rares nécessaires à certaines améliorations ;
- malédictions secondaires levées sur l’environnement.

Donc le combat soutient directement :
- la qualité de la ferme ;
- le rendement agricole ;
- le crafting ;
- la profondeur économique.

## 7.3 Règle de design à conserver

Aucune des deux boucles ne doit devenir optionnelle ou purement cosmétique.

Cela signifie :
- impossible d’ignorer totalement la ferme si on veut progresser confortablement dans la tour ;
- impossible d’ignorer totalement la tour si on veut débloquer les systèmes avancés de ferme et de village.

---

## 8. Progression narrative par paliers

La tour comporte 100 étages dans la vision long terme, mais le MVP peut se concentrer sur les 10 premiers étages.

Chaque palier important doit produire trois effets :
1. un effet narratif ;
2. un effet système ;
3. un effet de motivation visible.

## 8.1 Exemple de structure long terme

### Boss étage 10
- Première vraie victoire contre la malédiction.
- Le forgeron retrouve une partie de sa lucidité.
- Déblocage : premières améliorations d’outils de ferme, premiers équipements renforcés.
- Effet ressenti : le joueur comprend que la tour change réellement le monde.

### Boss étage 20
- Une présence secondaire liée au sorcier est éliminée.
- L’alchimiste ou herboriste du village reprend son activité.
- Déblocage : crafting de potions plus avancées, transformation des récoltes, nouvelles recettes.

### Boss étage 30
- La malédiction se fissure dans le centre du village.
- Le marchand débloque un stock plus vaste.
- Déblocage : nouvelles graines, nouveaux consommables, matériaux rares basiques.

### Boss étage 40
- Apparition d’une quête spéciale liée à une relique ou un outil ancestral.
- Déblocage conditionnel d’améliorations avancées de ferme.
- Cette étape peut relier la quête principale à une série de quêtes secondaires.

### Boss étage 50+
- Le joueur commence à comprendre la véritable nature de la malédiction.
- Les villageois partiellement sauvés peuvent révéler des pans de lore.
- La tour devient plus dérangeante, plus personnelle, plus dangereuse.

### Derniers étages
- Révélations sur le sorcier, ses motivations et le lien avec le village.
- Confrontation finale.
- Résolution principale : lever totalement la malédiction ou gérer ses conséquences.

## 8.2 Structure MVP recommandée

Pour le MVP :
- 10 étages ;
- 1 boss majeur à l’étage 10 ;
- 1 à 3 mini-paliers intermédiaires ;
- 1 première libération importante au village.

Exemple :
- étage 3 : obtention d’un matériau étrange utile à une quête ;
- étage 5 : mini-boss ou gardien ;
- étage 8 : premier indice fort sur le sorcier ;
- étage 10 : boss → levée de la malédiction du forgeron.

---

## 9. Le rôle des villageois

Les villageois ne doivent pas être de simples PNJ décoratifs. Chacun doit idéalement représenter une fonction de gameplay ou une progression de monde.

Exemples de rôles :
- maire : donne la quête principale, suit l’avancée du joueur, sert de guide narratif ;
- forgeron : amélioration outils/armes/équipement ;
- marchand : vente graines, rachat récoltes, objets basiques ;
- alchimiste/herboriste : potions, recettes, transformation de plantes ;
- habitant(s) secondaire(s) : quêtes annexes, relations, romance, lore ;
- personnage mystérieux : donne des indices sur la tour ou la malédiction.

### Règle importante

Un villageois libéré doit avoir une conséquence visible.

Exemple de conséquences visibles :
- il ouvre sa boutique ;
- il change de dialogue ;
- sa maison ou son atelier redevient vivant ;
- il remet un objet clé ;
- il déclenche une quête secondaire.

---

## 10. Ton et ambiance

Le questionnaire indique un ton **humoristique / romance / sombre**. Le lore doit donc mélanger ces dimensions sans se contredire.

## 10.1 Sombre
- Le village est réellement touché.
- La malédiction a des conséquences graves.
- La tour doit inspirer le danger.

## 10.2 Humoristique
- Certains dialogues peuvent être décalés.
- Les habitants peuvent garder des traits de personnalité marqués, même dans la détresse.
- Le jeu peut respirer entre les moments lourds.

## 10.3 Romance / relationnel
- Certaines quêtes secondaires peuvent nourrir un lien particulier avec des PNJ.
- La progression relationnelle peut accompagner la reconstruction du village.
- Les choix du joueur peuvent faire varier certaines affinités.

Le bon équilibre serait :
- **quête principale sérieuse** ;
- **vie de village plus humaine, parfois légère, parfois touchante** ;
- **tour plus inquiétante et oppressante**.

---

## 11. Proposition de trame principale

## 11.1 Début
- Réception de la lettre.
- Arrivée au village.
- Rencontre avec le maire.
- Découverte du village figé.
- Attribution de la ferme.
- Remise du kit de départ.
- Première nuit / premier matin / premier objectif.

## 11.2 Première phase
- Défricher la ferme.
- Planter les premières cultures.
- Faire les premiers allers-retours village ↔ ferme.
- Entrer dans la tour.
- Comprendre que la progression y est liée au destin du village.

## 11.3 Premier palier de transformation
- Vaincre le boss du premier cap.
- Retour au village.
- Réaction des habitants.
- Déblocage du premier vrai service important.
- Nouvelle perception de la mission : la malédiction peut vraiment être brisée.

## 11.4 Suite de progression
- Enchaîner les paliers.
- Découvrir des vérités sur le sorcier.
- Comprendre pourquoi le village a été ciblé.
- Développer la ferme comme base logistique de l’ascension.

---

## 12. Questions de lore à trancher plus tard

Pour avancer sur le prototype, il n’est pas obligatoire d’avoir tout défini maintenant. En revanche, il faudra verrouiller ces points avant la version plus avancée du scénario.

1. Pourquoi le sorcier a-t-il maudit ce village ?
2. Quel lien précis existe entre la tour et le village ?
3. Le sorcier est-il purement maléfique, ou a-t-il une motivation tragique ou ambiguë ?
4. Pourquoi le héros accepte-t-il cette mission ? Par altruisme, dette, intérêt, curiosité ?
5. Le maire dit-il toute la vérité dès le départ ?
6. La malédiction possède-t-elle plusieurs formes ou plusieurs “nœuds” ?
7. Quel rôle narratif exact auront les romances et relations secondaires ?

Ces réponses peuvent venir plus tard, mais le framework actuel permet déjà de coder proprement la base du jeu.

---

## 13. Traduction du lore en besoins de game design

## 13.1 Systèmes à prévoir

Le lore implique les systèmes suivants :
- ferme fonctionnelle ;
- cultures / récoltes ;
- économie ;
- crafting au moins basique ;
- village avec PNJ à états ;
- quêtes principales et secondaires ;
- déblocage de boutiques / services ;
- progression en tour / étages ;
- boss à effet narratif ;
- système de flags d’histoire.

## 13.2 Besoins de progression

Il faut pouvoir lier :
- boss vaincu ;
- flag de malédiction levée ;
- changement d’état d’un PNJ ;
- déblocage d’un shop ;
- déblocage d’une amélioration ;
- déblocage d’une quête.

Exemple concret de logique :
- `boss_floor_10_defeated = true`
- `blacksmith_curse_lifted = true`
- `blacksmith_shop_tier_1_unlocked = true`
- `farm_tool_upgrade_tier_1_unlocked = true`

## 13.3 Implication sur les données

Le jeu aura besoin de stocker au minimum :
- état du joueur ;
- état de la ferme ;
- progression de tour ;
- quêtes ;
- relations PNJ ;
- flags de malédiction / déblocage ;
- état du village.

---

## 14. Recommandations concrètes pour Codex

## 14.1 Priorité MVP narrative

Pour le MVP, il ne faut pas tenter d’écrire tout le scénario complet des 100 étages.

Il faut plutôt implémenter :
- une intro claire ;
- la logique de base ferme ↔ village ↔ tour ;
- quelques PNJ clés ;
- une progression sur 10 étages ;
- un boss de fin de MVP ;
- un déblocage majeur visible au retour.

## 14.2 Ce qu’il faut coder en priorité

1. Système de quêtes avec flags.
2. Système de PNJ à états évolutifs.
3. Système de shop déblocable par progression.
4. Système de progression tour/étages.
5. Système de ferme influençant l’économie et les consommables.
6. Système de retour narratif après boss.

## 14.3 Ce qu’il ne faut pas surcharger trop tôt

À éviter en première implémentation :
- lore ultra détaillé de tous les étages ;
- trop grand nombre de PNJ ;
- romances complexes dès le MVP ;
- trop de branches narratives ;
- surdesign de la mythologie du sorcier.

Le plus important est de rendre visible le principe suivant :
**je progresse dans la tour → le village change → ma ferme progresse → je peux aller plus loin**.

---

## 15. Résumé exécutif

Le jeu met en scène un aventurier appelé à sauver un village maudit. La malédiction a paralysé les habitants et rendu les terres infertiles. La source du mal se trouve au sommet d’une immense tour peuplée de monstres.

Le joueur reçoit une ferme comme base d’opération. Cette ferme lui permet de cultiver, crafter, vendre et se préparer au combat. En parallèle, il explore la tour, affronte des ennemis et vainc des boss.

Chaque victoire importante dans la tour doit avoir des conséquences visibles sur le village : levée de malédictions, retour à l’activité de certains PNJ, déblocage de boutiques, amélioration d’outils ou nouvelles quêtes.

La ferme et le RPG sont donc conçus comme deux systèmes interdépendants. Le combat débloque la progression de la ferme et du village ; la ferme alimente la progression du combat.

Pour le MVP, l’objectif narratif recommandé est simple et fort :
- introduire la malédiction ;
- installer la ferme ;
- permettre les premiers cycles de culture et de combat ;
- faire gravir 10 étages au joueur ;
- conclure sur un boss qui libère un premier villageois clé, comme le forgeron.

C’est cette structure qui doit servir de socle à l’implémentation initiale.
