> **Statut : archive de GDD initial**
> Ce document correspond au premier cadrage design du projet.
> Il est conservé comme référence historique pour comprendre les fondations du gameplay et des intentions produit.
> Il ne constitue plus, à lui seul, la source de vérité actuelle du MVP.
> En cas de divergence, se référer en priorité aux documents canoniques actifs dans `docs/00-projet/`, aux documents de contenu MVP, ainsi qu’au journal de phase en cours dans `docs/journal/`.

# GDD initial - RPG 2D tour par tour heroic-fantasy

## Vision
Créer un RPG 2D tour par tour centré sur l’exploration, la progression de personnage et des combats lisibles, tactiques et rapides à prendre en main. L’univers vise une heroic-fantasy classique, avec une identité claire, des classes distinctes, du loot utile et une boucle de jeu motivante.

## Piliers
- Lisibilité avant tout: le joueur doit comprendre l’état du combat, les effets et les choix disponibles en un coup d’oeil.
- Progression gratifiante: niveaux, compétences, équipement et butin doivent changer concrètement la façon de jouer.
- Tactique simple à lire, riche à maîtriser: peu d’actions de base, mais des synergies et des arbitrages intéressants.
- Exploration structurée: monde découpé en zones, avec combats, quêtes et récompenses ciblées.

## Boucle de jeu
1. Explorer une zone.
2. Rencontre de combat ou événement.
3. Gagner des ressources, de l’expérience et du butin.
4. Améliorer le personnage via niveau, équipement, inventaire ou compétences.
5. Débloquer une zone, une quête ou un boss plus difficile.

## Structure des combats tour par tour
### Format de base
- Combat en équipe contre une ou plusieurs ennemis.
- Ordre des tours basé sur une statistique d’initiative ou de vitesse.
- Chaque tour propose des actions claires: attaquer, compétence, objet, défense, fuite.

### Règles de combat
- Les attaques ont des dégâts, une précision éventuelle et des effets secondaires.
- Les compétences consomment une ressource dédiée: mana, énergie ou charge.
- Les états alterés servent à créer du rythme: poison, brûlure, gel, stun, buff, debuff.
- Les combats doivent rester courts pour éviter la répétition.

### Objectifs de design
- Donner un vrai rôle à chaque classe.
- Rendre les choix défensifs aussi importants que les choix offensifs.
- Récompenser la préparation via l’équipement et les consommables.

## Progression
- Progression par niveaux avec gains de statistiques et déblocage de compétences.
- Progression parallèle via équipement: arme, armure, accessoire, objet consommable.
- Système de spécialisation par classe ou arbre simple de talents.
- Boss et zones servent de paliers de difficulté.

## Classes et personnages
### Exemple de base
- Guerrier: robuste, tank, contrôle simple.
- Voleur: rapide, dégâts ciblés, critique, finesse.
- Mage: dégâts élémentaires, contrôle, gestion de ressources.
- Clerc: soin, soutien, protection, anti-altérations.

### Principes
- Chaque classe doit avoir une identité lisible.
- Les synergies entre classes doivent être simples à comprendre.
- Le joueur doit pouvoir former un groupe avec des rôles complémentaires.

## Économie et loot
- L’or sert à acheter équipement, consommables et services.
- Le loot doit être utile, pas seulement cosmétique ou chiffré.
- Les objets rares doivent changer la stratégie, pas seulement augmenter les stats.
- Les drop tables doivent éviter la surcharge d’objets inutiles.

## Quêtes
- Quêtes principales pour guider la progression du joueur.
- Quêtes secondaires pour exploration, lore et récompenses ciblées.
- Objectifs simples au début, puis variantes plus tactiques ou multi-étapes.
- Les quêtes doivent alimenter le rythme exploration -> combat -> récompense.

## Monde
- Monde découpé en régions/zones avec difficulté croissante.
- Chaque zone doit avoir une identité visuelle, des ennemis types et un enjeu narratif.
- Les hubs servent de relais entre combats, progression et gestion d’inventaire.
- La structure du monde doit être lisible même sans open world total.

## UX combat
- Interface claire, avec informations essentielles toujours visibles.
- Menu d’actions rapide, navigation clavier ou manette possible.
- Retours visuels forts mais non intrusifs: animations, dégâts, états, tour actif.
- Affichage explicite des effets, durées et ressources consommées.

## Hypothèses à valider
- Le jeu vise une expérience solo en priorité.
- Le front gameplay sera construit avec Phaser, avec une interface de type HUD/menus adaptée au navigateur.
- La sauvegarde devra être persistante et liée à un compte.
- Le combat restera au format classique au tour par tour, sans système temps réel hybride.
- Le style artistique doit rester cohérent avec une heroic-fantasy lisible et produisible en sprites 2D.

## Questions ouvertes
- Combien de personnages jouables simultanément dans l’équipe de base?
- Le combat se joue-t-il sur une grille, en ligne, ou en positionnement libre simplifié?
- Le jeu aura-t-il un héros unique ou un groupe dès le départ?
- Le système de classes doit-il permettre un multiclassage?
- Le loot doit-il être généré de façon procédurale ou majoritairement artisanal?
- Le jeu cible-t-il plutôt une campagne courte, une aventure longue, ou une structure roguelite?
- Quelle place donner à la narration: forte, légère, ou surtout environnementale?
