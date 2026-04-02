# Index des quêtes MVP

> **Statut : document canonique actif**
> Ce document définit les quêtes canoniques du MVP.
> Il sert de référence active pour la narration, le front, les PNJ, les flags monde, la progression de la tour, la ferme, les relations de village et les récompenses.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les quêtes du MVP.

---

## 1. Rôle du document

Ce document fixe la structure des quêtes du MVP.

Il permet de :
- définir quelles quêtes existent réellement ;
- organiser leur place dans la boucle ferme ↔ village ↔ tour ;
- distinguer les quêtes principales, secondaires, agricoles et relationnelles ;
- guider les futurs documents détaillés ;
- fournir au front une base claire pour les dialogues, objectifs, récompenses et états de progression.

Le MVP n’a pas besoin d’un grand journal de quêtes rempli de missions secondaires sans relief.
Il a besoin d’un **petit ensemble de quêtes lisibles, utiles et bien reliées au cœur du jeu**.

---

## 2. Principes de conception des quêtes MVP

Les quêtes du MVP doivent respecter les règles suivantes :

### 2.1 Fonction claire
Chaque quête doit avoir une utilité identifiable :
- introduire ;
- guider ;
- débloquer ;
- humaniser ;
- structurer la progression.

### 2.2 Lien fort avec la boucle du jeu
Les quêtes doivent toujours renforcer au moins un des trois pôles :
- la ferme ;
- le village ;
- la tour.

### 2.3 Peu nombreuses mais significatives
Le MVP doit éviter la multiplication de petites missions sans impact.
Chaque quête doit exister pour une raison.

### 2.4 Récompense lisible
La récompense d’une quête doit être compréhensible :
- XP ;
- or ;
- item ;
- relation ;
- flag de progression ;
- déblocage de service ou de contenu.

---

## 3. Structure canonique des quêtes du MVP

Le MVP repose sur **4 familles de quêtes** :

### 3.1 Quête principale d’introduction
Elle installe le héros, le village, la ferme et le lien avec la tour.

### 3.2 Quêtes de paliers de tour
Elles marquent les seuils 3 / 5 / 8 / 10 et donnent à la progression verticale une lecture narrative.

### 3.3 Quêtes ferme / village
Elles relient la production agricole, le marché et la reconstruction locale.

### 3.4 Quêtes relationnelles simples
Elles servent à humaniser le village et à donner de l’épaisseur émotionnelle au MVP.

---

## 4. Vue d’ensemble des quêtes MVP

| Quête | ID technique recommandé | Type | Fonction principale | Priorité |
|---|---|---|---|---|
| L’appel du village | `main_arrival_call` | Principale | Introduction du héros et du village | Critique |
| Une terre à reprendre | `main_farm_assignment` | Principale | Attribution de la ferme et installation | Critique |
| Premier nœud brisé | `story_floor_3` | Palier tour | Valider le premier seuil majeur | Très haute |
| La braise qui veille | `story_floor_5` | Palier tour | Marquer la montée de pression | Très haute |
| L’avant-garde maudite | `story_floor_8` | Palier tour | Préparer l’approche du sommet | Très haute |
| Le cœur qui saigne | `story_floor_10` | Palier tour | Conclusion du MVP | Critique |
| Première récolte | `farm_first_harvest` | Ferme | Installer la réussite agricole | Très haute |
| Livraison de navets | `turnip_delivery_request` | Village / ferme | Relier récolte et économie | Haute |
| Réserve du grenier | `granary_restock` | Village / ferme | Renforcer l’idée de reconstruction | Haute |
| Entretien avec le Maire | `village_mayor_briefing` | Relationnelle | Suivi narratif / confiance | Haute |
| Mise à jour de la forge | `blacksmith_forge_update` | Relationnelle / monde | Retour visible du Forgeron | Haute |
| Rythme du marché | `merchant_route_sync` | Relationnelle / village | Humaniser l’économie locale | Moyenne à haute |

---

## 5. Quête principale d’introduction

## 5.1 L’appel du village

### Nom affiché canonique
**L’appel du village**

### ID technique recommandé
`main_arrival_call`

### Type
Quête principale

### Fonction
Introduire :
- la lettre ;
- l’arrivée du héros ;
- l’état du village ;
- la rencontre avec le Maire.

### Rôle dans le MVP
C’est la porte d’entrée narrative du jeu.
Elle doit faire comprendre :
- pourquoi le héros est là ;
- que le village est touché ;
- que la situation dépasse une simple panne locale.

### Récompense principale
- ouverture de l’introduction active ;
- progression narrative ;
- accès à la suite immédiate.

### Priorité
- **critique**

---

## 5.2 Une terre à reprendre

### Nom affiché canonique
**Une terre à reprendre**

### ID technique recommandé
`main_farm_assignment`

### Type
Quête principale

### Fonction
Attribuer la ferme au joueur et lancer la vraie boucle du jeu.

### Rôle dans le MVP
Cette quête doit :
- donner au joueur sa base ;
- l’ancrer dans le monde ;
- transformer l’histoire en action concrète ;
- faire le lien entre récit et gameplay.

### Récompense principale
- ferme débloquée ;
- premières ressources ;
- démarrage réel de la boucle ferme ↔ village ↔ tour.

### Priorité
- **critique**

---

## 6. Quêtes de paliers de tour

## 6.1 Premier nœud brisé

### Nom affiché canonique
**Premier nœud brisé**

### ID technique recommandé
`story_floor_3`

### Type
Quête de palier

### Fonction
Donner une première valeur narrative au palier 3.

### Rôle dans le MVP
Cette quête doit faire sentir que :
- la tour possède de vrais seuils ;
- le joueur vient de vaincre plus qu’un simple ennemi ;
- quelque chose commence réellement à céder.

### Déclencheur principal
- victoire au palier 3

### Récompenses possibles
- XP ;
- or ;
- progression monde ;
- variation du marché ou des dialogues de village.

### Priorité
- **très haute**

---

## 6.2 La braise qui veille

### Nom affiché canonique
**La braise qui veille**

### ID technique recommandé
`story_floor_5`

### Type
Quête de palier

### Fonction
Marquer la transition vers une tour plus agressive et plus gardée.

### Rôle dans le MVP
Cette quête doit :
- faire sentir la montée de gravité ;
- renforcer l’idée que le joueur progresse dans une structure défendue ;
- soutenir des déblocages plus nets dans le village.

### Déclencheur principal
- victoire au palier 5

### Récompenses possibles
- XP ;
- or ;
- ouverture de contenu de marché ou d’équipement ;
- nouvelles lignes de dialogues importantes.

### Priorité
- **très haute**

---

## 6.3 L’avant-garde maudite

### Nom affiché canonique
**L’avant-garde maudite**

### ID technique recommandé
`story_floor_8`

### Type
Quête de palier

### Fonction
Préparer la conclusion du MVP en donnant un poids narratif au dernier grand verrou avant le sommet.

### Rôle dans le MVP
Cette quête doit montrer que :
- la tour possède une défense plus structurée ;
- le joueur approche d’un noyau plus central ;
- le monde du village commence à croire plus sérieusement au changement.

### Déclencheur principal
- victoire au palier 8

### Récompenses possibles
- XP ;
- or ;
- nouveau palier de shop ou de contenu ;
- évolution plus visible des PNJ.

### Priorité
- **très haute**

---

## 6.4 Le cœur qui saigne

### Nom affiché canonique
**Le cœur qui saigne**

### ID technique recommandé
`story_floor_10`

### Type
Quête de palier / conclusion MVP

### Fonction
Conclure le MVP sur une vraie victoire contre un foyer de la malédiction.

### Rôle dans le MVP
Cette quête doit :
- valider le boss final de l’étage 10 ;
- déclencher un retour monde majeur ;
- donner une conclusion forte sans fermer la suite du jeu.

### Déclencheur principal
- victoire contre `curse_heart_avatar`

### Récompenses possibles
- XP majeure ;
- récompense symbole ;
- flags majeurs ;
- retour fort au village ;
- ouverture vers la suite.

### Priorité
- **critique**

---

## 7. Quêtes ferme / village

## 7.1 Première récolte

### Nom affiché canonique
**Première récolte**

### ID technique recommandé
`farm_first_harvest`

### Type
Quête ferme

### Fonction
Valider la première réussite agricole du joueur.

### Rôle dans le MVP
Cette quête doit :
- faire sentir que la ferme produit réellement ;
- valoriser émotionnellement la première récolte ;
- installer la boucle de production.

### Récompenses possibles
- petite récompense ;
- validation narrative ;
- encouragement ou variation de dialogue PNJ.

### Priorité
- **très haute**

---

## 7.2 Livraison de navets

### Nom affiché canonique
**Livraison de navets**

### ID technique recommandé
`turnip_delivery_request`

### Type
Quête ferme / village

### Fonction
Relier directement la récolte à la vie économique locale.

### Rôle dans le MVP
Cette quête doit :
- faire vendre ou livrer une récolte précise ;
- donner de la valeur pratique au navet ;
- ancrer la Marchande et le marché dans le quotidien.

### Récompenses possibles
- or ;
- relation ;
- petite progression de village ;
- confiance locale.

### Priorité
- **haute**

---

## 7.3 Réserve du grenier

### Nom affiché canonique
**Réserve du grenier**

### ID technique recommandé
`granary_restock`

### Type
Quête village / reconstruction

### Fonction
Donner au joueur une mission simple mais significative de ravitaillement.

### Rôle dans le MVP
Cette quête doit faire sentir que :
- les récoltes servent à plus que l’enrichissement personnel ;
- reconstruire le village passe aussi par nourrir et réapprovisionner ;
- la ferme peut avoir un rôle communautaire.

### Récompenses possibles
- XP ;
- or ;
- relation ;
- sentiment de reconstruction.

### Priorité
- **haute**

---

## 8. Quêtes relationnelles simples

## 8.1 Entretien avec le Maire

### Nom affiché canonique
**Entretien avec le Maire**

### ID technique recommandé
`village_mayor_briefing`

### Type
Quête relationnelle / suivi narratif

### Fonction
Créer un moment de retour et de lecture du monde avec le Maire.

### Rôle dans le MVP
Cette quête doit :
- renforcer le lien avec le Maire ;
- clarifier l’avancée du joueur ;
- donner un feedback humain à la progression.

### Récompenses possibles
- relation ;
- nouveau dialogue ;
- orientation sur la suite.

### Priorité
- **haute**

---

## 8.2 Mise à jour de la forge

### Nom affiché canonique
**Mise à jour de la forge**

### ID technique recommandé
`blacksmith_forge_update`

### Type
Quête monde / relationnelle

### Fonction
Marquer le retour progressif du Forgeron et de la forge.

### Rôle dans le MVP
Cette quête doit :
- rendre visible l’effet de la progression sur le Forgeron ;
- soutenir l’idée de reprise d’activité ;
- faire le lien entre la tour, les matériaux et l’équipement.

### Récompenses possibles
- accès shop amélioré ;
- dialogue plus ouvert ;
- relation.

### Priorité
- **haute**

---

## 8.3 Rythme du marché

### Nom affiché canonique
**Rythme du marché**

### ID technique recommandé
`merchant_route_sync`

### Type
Quête village / relationnelle

### Fonction
Humaniser la Marchande et le fonctionnement local du marché.

### Rôle dans le MVP
Cette quête doit :
- montrer que la vie économique locale dépend de petits équilibres ;
- donner plus d’épaisseur à la Marchande ;
- renforcer la dimension quotidienne du village.

### Récompenses possibles
- relation ;
- petit bonus économique ;
- nouveaux dialogues.

### Priorité
- **moyenne à haute**

---

## 9. Rôle des quêtes dans la progression du MVP

Les quêtes du MVP doivent construire cette courbe :

### Début
- installer ;
- expliquer ;
- ancrer le héros.

### Milieu
- renforcer la boucle ;
- donner du sens aux premières récoltes et aux premiers paliers.

### Montée finale
- faire sentir que la tour devient plus grave ;
- montrer que le village réagit.

### Conclusion
- produire un vrai retour monde ;
- donner une victoire narrative claire ;
- ouvrir la suite.

Les quêtes ne doivent pas être pensées comme un remplissage.
Elles sont la structure qui rend la progression lisible.

---

## 10. Récompenses canoniques de quêtes

Les quêtes du MVP peuvent récompenser par :

- XP
- or
- objets
- matériaux
- relation PNJ
- flags monde
- déblocages de shop
- évolution de dialogue
- validation de progression

La récompense la plus importante du MVP n’est pas toujours matérielle.
Souvent, elle doit être :
**la preuve visible que le monde change.**

---

## 11. Contraintes de cohérence

Les quêtes du MVP doivent toujours respecter les règles suivantes :

- chaque quête doit avoir une vraie fonction ;
- chaque quête doit être liée à la boucle centrale ou à l’humanisation du village ;
- éviter les objectifs trop abstraits ou trop MMO ;
- éviter les quêtes “fedex” sans enjeu sensible ;
- conserver un ton cohérent avec l’univers.

Même les petites quêtes doivent raconter quelque chose du village, de la ferme ou de la tour.

---

## 12. Contraintes front et UI

Le front doit pouvoir montrer clairement :
- le nom de la quête ;
- son objectif ;
- son statut ;
- sa récompense ;
- son donneur ou son origine ;
- son lien avec la progression si nécessaire.

Le journal de quêtes du MVP doit rester :
- lisible ;
- court ;
- utile ;
- non surchargé.

---

## 13. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/00-projet/canon-mvp.md`
- `docs/01-univers/bible-du-monde-mvp.md`
- `docs/02-personnages/pnj-mvp-index.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/08-gameplay-content/floors-1-10.md`

Les quêtes sont le point de jonction entre le monde, les systèmes et l’expérience joueur.

---

## 14. Priorités de production recommandées

Les documents à produire ensuite à partir de cet index sont :

1. `docs/05-equipements/armes.md`
2. `docs/05-equipements/armures.md`
3. `docs/05-equipements/accessoires.md`
4. `docs/04-objets/objets-cles.md`

Puis, si besoin :
5. fiches détaillées des quêtes principales et de palier
6. détails de rewards et flags techniques

---

## 15. Résumé exécutif

Le MVP repose sur un noyau de quêtes réduit mais structuré :
- une introduction forte,
- des paliers de tour lisibles,
- quelques quêtes agricoles et villageoises,
- et quelques quêtes relationnelles simples.

Ces quêtes ont pour rôle de faire sentir que :
- la ferme produit du sens,
- la tour oppose de vrais seuils,
- le village réagit,
- et le joueur n’avance pas dans un simple système, mais dans un monde qui recommence à bouger.

Leur fonction fondamentale est claire :
**rendre visible, compréhensible et émotionnellement lisible la progression du jeu.**
