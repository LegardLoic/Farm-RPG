# Canon MVP

> **Statut : source de vérité actuelle du MVP**
> Ce document définit le périmètre canonique du MVP.
> En cas de divergence avec les anciens documents de cadrage, GDD initiaux, notes exploratoires ou archives, ce document prévaut.
> Les détails de production sont ensuite déclinés dans les autres documents actifs du dossier `docs/`.

---

## 1. Rôle du document

Ce document fixe le cadre officiel du MVP du projet.

Il sert à :
- verrouiller ce qui appartient réellement au MVP ;
- éviter les ambiguïtés entre intentions initiales, idées long terme et contenu réellement produit ;
- donner une base claire aux développements front, contenu, UI, visuels, scènes et interactions ;
- fournir à Codex et aux autres agents une référence prioritaire de production.

Le MVP n’a pas vocation à représenter la version 1.0 complète du jeu.
Il doit livrer une expérience jouable, cohérente, visuellement incarnée, démontrant clairement l’identité hybride du projet :
**RPG tour par tour + jeu de ferme + progression narrative par le village et la tour**.

---

## 2. Définition du jeu au stade MVP

Le jeu est un **RPG 2D top-down en pixel art**, jouable d’abord sur **web desktop**, mêlant :
- exploration légère ;
- gestion de ferme ;
- économie simple ;
- combats au tour par tour en ligne de front ;
- progression narrative via un village maudit et une tour de 10 étages pour le MVP.

Le ton du MVP mélange :
- **quête principale sérieuse et mystérieuse** ;
- **vie de village plus humaine, parfois légère** ;
- **présence de relations PNJ simples** ;
- **ambiance inquiétante dans la tour**.

Le MVP doit déjà faire ressentir que :
- la ferme soutient la progression combat ;
- la tour débloque la progression du village ;
- le village devient progressivement plus vivant ;
- le joueur n’est pas dans une simple démo technique, mais dans un vrai début d’aventure.

---

## 3. Promesse du MVP

Le MVP doit permettre au joueur de vivre la boucle suivante :

1. Arriver dans un village frappé par une malédiction.
2. Recevoir une ferme comme base.
3. Cultiver, récolter, vendre, crafter et dormir pour avancer dans le temps.
4. Préparer ses combats grâce aux ressources de la ferme et du village.
5. Explorer une tour à étages et affronter des monstres.
6. Franchir les paliers majeurs de la tour.
7. Débloquer progressivement des services, états PNJ et améliorations visibles du village.
8. Atteindre l’étage 10 et vaincre le premier grand boss du MVP.
9. Revenir au village avec un changement concret du monde.

---

## 4. Périmètre jouable canonique du MVP

## 4.1 Zones jouables

Le MVP comprend exactement **3 zones principales** :

### La ferme
Base du joueur.
Fonctions MVP :
- planter ;
- arroser ;
- récolter ;
- dormir ;
- crafter des consommables simples ;
- préparer le prochain combat.

### Le village
Hub narratif et économique.
Fonctions MVP :
- rencontrer les PNJ principaux ;
- suivre l’avancement du monde ;
- acheter des graines ;
- vendre les récoltes ;
- accéder au forgeron selon progression ;
- interagir avec certains PNJ pour augmenter la relation.

### La tour
Pilier combat / progression.
Fonctions MVP :
- combats ;
- mini-paliers ;
- mini-boss / boss scriptés ;
- loot ;
- progression jusqu’à l’étage 10.

---

## 4.2 Progression de tour retenue pour le MVP

Le MVP couvre les **étages 1 à 10** de la tour.

Paliers canoniques :
- **Étage 3** : premier jalon notable de progression ;
- **Étage 5** : premier mini-boss / gardien important ;
- **Étage 8** : montée de tension narrative ;
- **Étage 10** : boss majeur du MVP.

Le MVP se conclut sur :
- la victoire contre le boss de l’étage 10 ;
- le retour au village ;
- le déblocage visible d’un premier service majeur lié à la levée partielle de la malédiction.

---

## 5. Boucle de jeu canonique

La boucle centrale officielle du MVP est la suivante :

1. **Ferme**
   - planter ;
   - arroser ;
   - attendre ;
   - récolter ;
   - crafter ou vendre.

2. **Village**
   - vendre les récoltes ;
   - acheter des graines ;
   - acheter certains équipements selon progression ;
   - parler aux PNJ disponibles ;
   - observer l’évolution du village.

3. **Préparation**
   - utiliser les ressources de la ferme ;
   - préparer les consommables ;
   - lancer la préparation combat.

4. **Tour / Combat**
   - démarrer un combat ;
   - vaincre un ennemi ou un boss ;
   - gagner XP, or, loot et progression.

5. **Conséquence monde**
   - certaines victoires font progresser la tour ;
   - certains paliers débloquent quêtes, flags, états PNJ, shops ou nouvelles possibilités.

Cette boucle doit être **visible, compréhensible et ressentie**.
Le joueur doit comprendre que les trois espaces — ferme, village, tour — ne sont pas séparés mais interdépendants.

---

## 6. Systèmes obligatoires du MVP

Les systèmes ci-dessous font partie du MVP canonique.

### 6.1 Profil joueur
- création minimale du héros ;
- nom ;
- apparence MVP simple ;
- profil persistant.

### 6.2 Progression joueur
- niveau ;
- expérience ;
- or ;
- HP / MP ;
- statistiques principales.

### 6.3 Combat
- tour par tour en ligne de front ;
- démarrage de combat ;
- actions joueur ;
- actions ennemies ;
- boss scriptés ;
- victoire / défaite ;
- récompenses ;
- récap de fin de combat.

### 6.4 Inventaire / équipement
- inventaire persistant ;
- usage d’objets ;
- équipement ;
- lecture des gains et pertes ;
- support des consommables et équipements MVP.

### 6.5 Sauvegarde
- slots manuels ;
- capture ;
- chargement ;
- autosave serveur sur paliers majeurs.

### 6.6 Ferme
- parcelles ;
- graines ;
- plantation ;
- arrosage ;
- récolte ;
- cycle jour/nuit simplifié ;
- sommeil ;
- progression simple des cultures.

### 6.7 Crafting
- crafting ferme basique ;
- recettes de consommables simples ;
- consommation de récoltes ;
- lien direct avec la préparation combat.

### 6.8 Village
- marché de village ;
- forgeron avec déblocage progressif ;
- états PNJ ;
- interactions relationnelles simples ;
- premiers dialogues contextuels.

### 6.9 Quêtes
- quête principale d’introduction ;
- quêtes liées aux paliers de tour ;
- quelques quêtes secondaires ferme / village ;
- récompenses ;
- flags monde.

### 6.10 Progression monde
- états narratifs ;
- flags de déblocage ;
- états de PNJ ;
- retour visible des conséquences dans le village.

---

## 7. Systèmes explicitement hors scope MVP

Les éléments suivants ne font **pas** partie du MVP canonique, sauf mention contraire plus tard :

- coop jouable ;
- PvP ;
- tour complète jusqu’à 100 étages ;
- romances avancées ;
- grand nombre de biomes ;
- arbre de talents complet final ;
- capture de créatures ;
- invocations complexes ;
- housing avancé ;
- farming ultra profond ;
- système de classes finalisé en version 1.0 ;
- grande variété d’événements scénarisés multi-branches ;
- contenu endgame.

Ces éléments peuvent être préparés dans la documentation long terme, mais ne doivent pas perturber la production MVP.

---

## 8. Structure narrative canonique du MVP

## 8.1 Début
Le héros reçoit une lettre du maire d’un village isolé frappé par une malédiction.

## 8.2 Arrivée
Le héros découvre un village figé, fatigué, partiellement paralysé par la malédiction.

## 8.3 Attribution de la ferme
Le maire confie au héros une vieille ferme abandonnée afin qu’il puisse survivre, produire et préparer son ascension.

## 8.4 Première reconstruction
Le joueur découvre la boucle ferme ↔ village ↔ tour.

## 8.5 Premiers paliers de tour
Le joueur comprend que battre les ennemis et boss de la tour modifie réellement le monde.

## 8.6 Boss de l’étage 10
La victoire valide le principe central du jeu :
**la progression dans la tour brise progressivement la malédiction et réactive le village**.

Le MVP doit se terminer sur un sentiment de :
- première victoire significative ;
- monde qui commence à changer ;
- aventure plus grande encore à venir.

---

## 9. PNJ canoniques minimum du MVP

Le MVP doit reposer au minimum sur les PNJ suivants :

### Le maire
- donne la quête principale ;
- accueille le héros ;
- attribue la ferme ;
- accompagne la progression narrative de début.

### Le forgeron
- d’abord affecté par la malédiction ;
- débloqué progressivement ;
- lié à un premier changement majeur après progression tour.

### Le marchand / marché du village
- vend des graines ;
- rachète les récoltes ;
- sert de point de contact économique principal.

### Au moins un PNJ secondaire de village
- apporte une dimension plus humaine ;
- peut servir de support à une quête secondaire, une interaction simple ou une première dimension relationnelle.

Le MVP n’a pas besoin d’un grand casting.
Il a besoin d’un **petit noyau de PNJ bien définis et utiles**.

---

## 10. Contenu combat canonique du MVP

Le MVP doit inclure :
- des ennemis communs ;
- des ennemis intermédiaires ;
- des rencontres scriptées sur les paliers ;
- un boss majeur à l’étage 10.

Les combats doivent rester :
- lisibles ;
- tactiques sans être trop complexes ;
- suffisamment variés pour faire ressentir les paliers.

Les debuffs MVP retenus sont :
- **Poison**
- **Cécité**
- **Obscurité**

Le système doit privilégier la lisibilité et l’apprentissage progressif plutôt que la surcharge.

---

## 11. Mort / défaite canonique du MVP

En cas de défaite :
- le joueur retourne à la ferme ;
- le jour avance ;
- les HP reviennent à 1 ;
- une pénalité en or est appliquée ;
- une petite perte d’inventaire peut être appliquée.

Cette défaite doit être punitive mais non bloquante.
Elle doit renforcer la logique :
- retour à la base ;
- reconstruction ;
- nouvelle tentative.

---

## 12. Direction de production front

Le front MVP ne doit plus être pensé uniquement comme une superposition de HUD de test.

Le but de la phase actuelle est de transformer progressivement les systèmes déjà présents en :
- scènes lisibles ;
- espaces incarnés ;
- interactions visuelles ;
- boucles mieux ressenties ;
- retour monde plus tangible.

Cela implique que les futurs développements front doivent s’appuyer sur :
- le canon MVP ;
- les documents de contenu ;
- les fiches PNJ ;
- le bestiaire ;
- les catalogues objets / équipements / crafts / quêtes.

---

## 13. Priorités de contenu à produire après ce document

Les documents suivants doivent être produits en priorité pour soutenir le MVP :

1. `docs/01-univers/bible-du-monde-mvp.md`
2. `docs/02-personnages/pnj-mvp-index.md`
3. `docs/03-monstres/bestiaire-mvp-index.md`
4. `docs/08-gameplay-content/floors-1-10.md`
5. `docs/04-objets/items-index.md`
6. `docs/05-equipements/equipements-index.md`
7. `docs/06-crafting/recettes-index.md`
8. `docs/07-quetes/quetes-mvp-index.md`

---

## 14. Règles de décision pour la suite

En cas de doute sur une nouvelle idée, une feature ou un contenu, appliquer les règles suivantes :

### Une idée appartient au MVP si :
- elle renforce directement la boucle ferme ↔ village ↔ tour ;
- elle améliore la lisibilité de l’expérience ;
- elle aide à incarner visuellement le jeu ;
- elle soutient le boss de l’étage 10 et la progression jusqu’à ce point ;
- elle aide à produire une démo cohérente et complète.

### Une idée n’appartient pas au MVP si :
- elle ouvre un nouveau sous-système massif ;
- elle ajoute de la complexité sans améliorer la boucle centrale ;
- elle relève surtout du contenu long terme ;
- elle détourne le front de son objectif actuel d’incarnation et de lisibilité.

---

## 15. Résumé exécutif

Le MVP canonique du projet est un premier chapitre jouable d’un jeu hybride ferme + RPG tour par tour.

Le joueur arrive dans un village maudit, reçoit une ferme comme base, cultive pour survivre et se préparer, visite le village pour commercer et progresser, puis monte dans une tour de 10 étages afin de briser les premiers nœuds de la malédiction.

Le cœur du MVP n’est pas la quantité de contenu, mais la démonstration claire que :
- la ferme nourrit la progression ;
- la tour débloque le monde ;
- le village réagit ;
- le combat, l’économie et la narration font partie d’un même tout.

Ce document constitue la base canonique de la production MVP actuelle.
