> **Statut : archive de cadrage initial**
> Ce document conserve les réponses de cadrage et les intentions de départ du projet.
> Il sert de trace historique des hypothèses initiales.
> Il ne constitue plus, à lui seul, la source de vérité actuelle du MVP.
> En cas de divergence, se référer en priorité aux documents canoniques actifs dans `docs/00-projet/`, aux documents de contenu MVP, ainsi qu’au journal de phase en cours dans `docs/journal/`.

# Questionnaire de cadrage - RPG 2D tour par tour

## 1) Vision produit

1. Quelle est la promesse principale du jeu en une phrase ?
   Un jeu vidéo mélangeant gestion de ferme et RPG tour par tour
2. Quelle est la cible joueur prioritaire (casual, midcore, hardcore) ?
   Casu/Midcore
3. Quel ton narratif veux-tu (léger, sombre, épique, politique, humoristique) ?
   Humoristique/Romance/sombre
4. Tu vises une expérience solo uniquement, coop, ou PvP plus tard ?
   solo et coop plus tard mais pas de PvP
5. Quelle durée de session moyenne tu veux (5, 15, 30+ minutes) ?
6. 30+ minutes

## 2) Scope MVP

1. Que doit absolument contenir la v1 jouable (3 a 5 fonctionnalités non négociables) ?
   - Création de personnage personnalisé (sexe, couleur de peau, cheveux, yeux, vetements
   - Gestion équipement/inventaire
   - systeme de combat fonctionnel
   - systeme de farming fonctionnel (aggriculture, cycle jour/nuit)
   - sauvegarde de données manuel via slot
2. Quelle est la limite de contenu MVP: nombre de zones, ennemis, classes, quêtes ?
   Nombre de zones : 3
     - La ferme
     - le village contenant une boutique lié à la ferme (vente de graines, rachat des récoltes), une boutique lié au stuff (armes et équipements) et 2 ou trois maisons de villageois
     - la tour infernale (un donjon qui sera composé de 200 étages dans la version 1.0 mais 10 étages pour le MVP sera très bien)
3. Quel est ton horizon de livraison pour un premier prototype jouable ?
   Qu'entend tu par horizon de livraison?
4. Tu préfères une vertical slice très polishée ou un socle large mais brut ?
   socle large
5. Quel est le niveau visuel attendu au MVP (placeholder acceptable ou assets quasi finaux) ?
   Assets quasi finaux

## 3) Gameplay coeur

1. Le déplacement hors combat est libre, case par case, ou via carte monde ?
   Libre, déplacement style stardew valley
2. Les combats sont sur grille tactique ou en ligne de front simple ?
   Ligne de front simple (comme un Final Fantasy VI par exemple)
3. Le tour par tour est-il strict (initiative fixe) ou dynamique (vitesse/stat) ?
   Dynamique (lié à la stat vitesse des persos VS la vitesse des ennemis )
4. Tu veux des compétences a cooldown, a coût mana, ou les deux ?
   Compétences à cout de mana
5. Quel niveau de complexité pour les statuts (poison, stun, saignement, buffs, debuffs) ?
   Pour le MVP 3 états sont suffisant pour commencer (poison, cécité (empeche de lancer des sorts) et obscurité(réduit grandement la précision))
6. Mort permanente, KO temporaire, ou résurrection facile ?
   en cas de "mort en combat" le joueur ce réveil automatiquement dans sa ferme le lendemain matin avec 1hp et un retrait d'un % de gold (entre 10% et 30%) + quelques item retiré de l'inventaire (entre 1 et 3)
7. Le jeu doit-il inclure capture de créatures, invocations, ou compagnons ?
   Pas necessaire pour un MVP mais par la suite des invocations sont envisagés

## 4) Personnages et progression

1. Combien de classes jouables au lancement ?
   Le jeu n'aura pas la possibilité de choisir directement une classe. L'idée est de commencer avec un hero niveau 1 et des stats neutres exemple :
     - FOR(Force): 5 (puissance CAC)
     - DEX(Dextérité): 5 (puissance armes distance / chance de touché/esquive)
     - CON(Constitution): 5 (Hp)
     - INT(Intelligence): 5 (Mp + puissance des sorts)
     - VIT(Vitesse): 5 (Ordre attaquants pour les combats)
   Chaque lvl de plus donne la possibilité de rajouter +5 points de stats ou on veux.
   Les classes et compétences seront lié a l'équipement du joueur. Exemple :
   armure lourde (armure +10, compétence : Charge (Mp: 5), requis: 15 FOR)
   Il faudra donc minimum 15 en force pour s'équiper de cette piece d'armure. La compétence sera donc utilisable tant que l'armure est équipé ou si on apprend cette technique. Chaque compétences/sorts aura un compteur CP (points de compétences). Chaque victoire contre un ennemi qui à un lvl équivalent donnera 1 à 3 points de CP aux compétences des équipements actifs. une fois la jauge CP au max, la compétence est aquise par le personnage et n'aura plus besoins de porter l'équipement pour l'utiliser.

   On trouvera donc pendant toute l'aventure un large choix d'équipements qui seront spécialisés (Guerrier(tank) / Barbare(DPS CAC) / Mage blanc(healer) / Mage rouge(DPS magies) / Archer(DPS armes distances))
2. Les classes sont verrouillées ou multi-classes possibles ?
   Au vue du systeme imaginé le multiclasse sera tout a fait possible (il faudra bien équilibrés les stats pour qu'un joueur ne puisse pas tout faire en endgame, il faudra le pousser a faire des choix)
3. Système de stats: simple (FOR/DEX/INT) ou détaillé (10+ attributs) ?
   Voir la session 4.1
4. Niveau max visé pour le MVP ?
   pour le mvp niveau 10 déjà c'est pas mal
5. Arbre de talents, compétences linéaires, ou mix des deux ?
   J'imagine bien un mix des deux au vue du systeme de compétencces via l'équipement (à réfléchir sur comment l'intégré de façon cohérente)
6. Tu veux un héros unique customisable ou une équipe complète ?
   Hero unique customisable avec possibilité de recruter des PNJ par la suite pour constituer une équipe de 4 personnages max

## 5) Equipement et inventaire

1. Nombre de slots d'équipement (arme, armure, casque, accessoires, etc.) ?
   - Casque
   - Amulette
   - Torse
   - Jambes
   - Bottes
   - Gants
   - bague x2
   - main gauche
   - main droite
2. Raretés d'objets (commun, rare, épique, légendaire) au MVP ?
   commun(gris) / rare(vert) / très rare (bleu) / epique(violet) / légendaire (doré)
   pour le MVP commun et rare suffisent
3. Inventaire limité (poids/slots) ou illimité ?
   inventaire limité par n° de slots (~ 40 slots )
4. Crafting présent au MVP ou repoussé post-MVP ?
   Crafting présent au MVP
5. Consommables utilisables en combat uniquement ou partout ?
   Consommales utilisables partout
6. Besoin d'un coffre global partagé entre personnages ?
   Il faut(je pense) que l'inventaire soit pas lié a un personnage en particulier en mode solo.
   Quand on fera le mode coop, un coffre partagé entre joueur sera necessaire

## 6) Economie et quêtes

1. Monnaie unique ou plusieurs ressources ?
   Monnaie unique : Pi-ces d'or (po)
2. Les vendeurs PNJ doivent-ils avoir un stock dynamique ?
   Stock dynamique oui dans le sens ou son stock evoluera au fur et a mesur qu'on avancent dans ses quetes mais au départ il ne proposera que quelques ressources faible. la quantité sera ilimité
3. Types de quêtes MVP: principale, secondaires, contrats, événements ?
   - une quete principale et quelques quetes secondaires
4. Récompenses de quêtes: XP, objets, monnaie, réputation ?
   - réputation (relation) avec la personne donneuse de quete + item ou monnaie en fonction de la situation
5. Tu veux des factions et réputation dès le MVP ?
   Faction non mais réputation dans le sens relation (amitié/amour) avec les PNJ

## 7) Monde et narration

1. Monde ouvert ou progression par chapitres/cartes instanciées ?
   Monde ouvert
2. Combien de biomes au MVP ?
   Pas de biomes prévu dans le jeu mais 3 zones principales: la ferme, le village et la tour. On pourra envisager des "biomes"/theme pour pour les étages du dj plus tard par tranche de 10 étages
3. Dialogues avec choix et conséquences ou narration linéaire ?
   linéaire pour la quete principale mais a choix et concequence sur les relations pour les quetes secondaires
4. Cutscenes minimales, textuelles, ou cinématiques plus poussées ?
   cinématiques plus poussées
5. Lore lourd (codex) ou léger (focus gameplay) ?
   entre les deux ^^'

## 8) Direction artistique et audio

1. Style visuel: pixel art, low-res HD-2D, ou 2D illustré ?
   Pixel-art
2. Vue de jeu: top-down, isométrique, side-view ?
   Top-down
3. Résolution cible de base (ex: 320x180 upscale, 640x360, etc.) ?
   1920x1080 serait idéal
4. Tu veux générer les sprites par IA comme base puis retouches manuelles ?
   Oui
5. Palette fixe (limitation couleurs) ou libre ?
   Libre
6. Audio MVP: musique d'ambiance + SFX essentiels seulement ?
   Oui c'est suffisant

## 9) Technique front

1. Validation du stack front: Phaser + TypeScript + Vite ?
   Oui c'est très bien
2. UI/HUD en DOM overlay au-dessus du canvas, valide pour toi ?
   valide pour moi
3. Cible plateforme: web desktop d'abord, puis mobile/tablette ?
   je suis d'accord
4. Support manette nécessaire dès MVP ?
   oui
5. Localisation FR uniquement au départ ou i18n dès l'architecture ?
   Localisation FR uniquement au départ

## 10) Technique back

1. Préférence backend: Node.js (NestJS/Fastify/Express) ou autre ?
   Node.js oui avec express et NestJs peut etre mais je te laisse le dernier mot si tu pense a autre chose de plus pertinent
2. Préférence base de données: PostgreSQL, MySQL, MongoDB, autre ?
   PostgreSQL
3. Auth: email+mot de passe, OAuth, ou les deux ?
   Les deux

4. Système de session: JWT + refresh token, ou session serveur stateful ?
   La plus sécurisé
5. Besoin d'un mode invité (guest) avec conversion de compte plus tard ?
   non
6. Besoin d'un mode hors-ligne local puis sync cloud ?
   oui très important le mode hors ligne

## 11) Sécurité et conformité

1. Données sensibles visées (PII minimale, email uniquement, autre) ?
   je te laisse jugée ce qu'il y à de mieux a faire en terme de sécurité et de légalité
2. Niveau de sécurité attendu pour le MVP (basique solide ou proche prod) ?
   Prochje prod
3. Région d'hébergement imposée (UE uniquement, autre) ?
   UE uniquement
4. Exigences RGPD dès MVP (export/suppression compte) ?
   Oui
5. Niveau de protection anti-triche nécessaire au lancement ?
   Pas pour MVP

## 12) Sauvegarde et données

1. Sauvegarde auto uniquement ou manuelle + slots ?
   Manuelle + slot seulement pour le MVP et les deux plus tard
2. Nombre de slots de sauvegarde par compte ?
   3 pour MVP a voir par la suite si on augemnte le nombre ou pas
3. Sauvegarde côté serveur obligatoire ou cache local acceptable temporairement ?
   cache local acceptable temporairement
4. Besoin d'historique/version de sauvegarde (rollback) ?
   Necessaire pour un MVP? je te laisse juger
5. Données analytics gameplay a stocker dès MVP ?
   Necessaire pour un MVP? je te laisse juger

## 13) Production et qualité

1. Tu veux un monorepo unique front+back+infra ?
   Oui
2. Préférence package manager: pnpm, npm, yarn ?
   npm
3. Outils de test prioritaires: unitaires, intégration API, e2e UI ?
   Les 3
4. CI/CD dès le début ou après prototype ?
   Idéalement oui, il faudra me dire ce qu'il faut que je dois mettre en place pour le déploiement (github page possible vu qu'il y a des donnée dynamique en base?) et pour l'intégration continu
   Il faudra me donner toutes les possibilités de deploiement pour ce type d'app
5. Convention de code imposée (ESLint/Prettier/commit convention) ?
   Les 3

## 14) Organisation multi-agents

1. Tu veux quels lots parallèles en priorité: gameplay, backend, data, assets, UI ?
   Je te laisse être le chef d'orcheste de ton équipe d'agents. Fais au mieux !
2. Préfères-tu des itérations courtes (sprints 1 semaine) ou livraisons plus longues ?
   Sprints 1 semaine
3. Tu veux valider chaque PR majeure manuellement avant merge ?
   Non il nous faut un agent spécialisé référent git pour gérer les PR
4. On documente les décisions au format ADR, oui/non ?
   oui
5. Tu veux que je tienne un tableau de bord avancement dans `docs/` ?
   oui

## 15) Critères de succès

1. Quels sont tes 3 critères pour dire "le MVP est réussi" ?
   - Le gameplay ferme fonctionnel
   - gameplay combat fonctionnel
   - introduction à la mise en place de l'histoire (cinématique d'intro)
2. Quel est le seuil de performance minimum acceptable (fps, temps de chargement) ?
   - 30 fps minimum (ou moins je me rend pas compte) et temps de chargement court
3. Quels sont les 3 risques que tu veux absolument éviter ?
   - jeu trop compliqué a prendre en main
   - scénario qui mene a rien
   - bug rendant le jeu injouable
4. Quelle partie du projet t'importe le plus: combat, narration, collection, progression, technique ?
   Combat et narration en priorité

---

## Décisions minimales a verrouiller avant le premier commit d'implémentation

1. Scope MVP exact.
2. Stack back + base de données.
3. Schéma auth et sauvegarde.
4. Format visuel des sprites et résolution cible.
5. Boucle de combat tour par tour (grille ou non).
