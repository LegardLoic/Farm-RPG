# Armures MVP

> **Statut : document canonique actif**
> Ce document définit les armures canoniques du MVP.
> Il sert de référence active pour le front, l’inventaire, l’équipement du joueur, le shop du Forgeron, la progression défensive et les futurs documents détaillés liés aux builds de protection et de robustesse.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les armures du MVP.

---

## 1. Rôle du document

Ce document fixe le noyau des armures du MVP.

Il permet de :
- définir quelles pièces d’armure existent réellement ;
- structurer les slots défensifs du héros ;
- relier les armures aux statistiques, à la survie et aux styles de jeu ;
- guider la production front, UI et shop ;
- éviter de produire trop tôt un catalogue trop vaste ou redondant.

Le MVP n’a pas besoin de cinquante pièces d’armure différentes.
Il a besoin d’un **petit noyau de pièces lisibles, progressives et suffisamment variées pour faire sentir les premiers choix défensifs du joueur**.

---

## 2. Principes de conception des armures MVP

Les armures du MVP doivent respecter les règles suivantes :

### 2.1 Lisibilité immédiate
Le joueur doit comprendre rapidement :
- quelle pièce équipe quel slot ;
- si elle apporte surtout de la robustesse, de l’équilibre ou un soutien à un style spécifique ;
- si elle relève d’une pièce simple, renforcée ou spécialisée.

### 2.2 Rôle concret
Une armure ne doit pas être perçue comme un simple chiffre passif.
Elle doit aider à faire ressentir :
- la solidité ;
- la tenue au combat ;
- la spécialisation ;
- ou la manière dont le héros “se présente” face à la tour.

### 2.3 Progression visible
Les armures doivent donner le sentiment que le héros passe de :
- tenue simple de survie,
- à équipement réellement préparé pour affronter des seuils dangereux.

### 2.4 Compatibilité avec le système de build
Les armures doivent déjà laisser entrevoir :
- des pièces lourdes ou robustes ;
- des pièces plus légères ;
- des pièces plus orientées endurance, stabilité ou focus.

---

## 3. Slots d’armure canoniques concernés

Ce document couvre les slots suivants :

- Casque
- Torse
- Jambes
- Bottes
- Gants

Les slots `Amulette`, `Bague 1`, `Bague 2`, `Main gauche` et `Main droite` sont traités ailleurs ou en articulation avec d’autres documents.

---

## 4. Place des armures dans le MVP

Les armures remplissent plusieurs fonctions majeures :

### 4.1 Renforcer la survie
Elles permettent au joueur de mieux encaisser la pression de la tour.

### 4.2 Rendre le build visible
Elles donnent une lecture claire de la manière dont le héros se prépare :
- frontal ;
- équilibré ;
- plus mobile ;
- plus orienté focus.

### 4.3 Soutenir le Forgeron
Elles donnent une vraie matière au shop du Forgeron et au sentiment de reprise du village.

### 4.4 Donner une présence visuelle au héros
Même si le MVP n’exploite pas encore tout le potentiel visuel de l’équipement, les armures doivent déjà exister comme objets concrets et identifiables.

---

## 5. Répartition canonique des armures du MVP

Le noyau du MVP repose sur **5 familles de pièces défensives**, correspondant aux slots principaux :

### 5.1 Casques
Protection supérieure / stabilité / présence défensive

### 5.2 Pièces de torse
Cœur de la défense et de la silhouette du build

### 5.3 Jambières
Soutien de robustesse / tenue générale

### 5.4 Bottes
Stabilité, tenue, parfois orientation plus légère ou plus mobile

### 5.5 Gants
Finition de build, maintien, précision ou robustesse légère

---

## 6. Vue d’ensemble des armures MVP

| Pièce | ID technique recommandé | Slot | Orientation principale | Priorité |
|---|---|---|---|---|
| Casque de garde simple | `guard_helm_basic` | Casque | Défense simple | Haute |
| Plastron de cuir renforcé | `reinforced_leather_chest` | Torse | Équilibre / début de progression | Critique |
| Plastron de garde | `guard_chestplate` | Torse | Défense / build frontal | Très haute |
| Jambières simples | `traveler_leggings` | Jambes | Polyvalence | Haute |
| Jambières renforcées | `guard_legplates` | Jambes | Robustesse | Très haute |
| Bottes de marche | `field_boots` | Bottes | Stabilité / exploration | Haute |
| Bottes ferrées | `ironbound_boots` | Bottes | Défense / ancrage | Haute |
| Gants de travail | `work_gloves` | Gants | Polyvalence / début de jeu | Haute |
| Gants de garde | `guard_gauntlets` | Gants | Défense / maintien | Très haute |

Ce noyau suffit largement pour faire sentir la progression défensive du MVP.

---

## 7. Casque de garde simple

### Nom affiché canonique
**Casque de garde simple**

### ID technique recommandé
`guard_helm_basic`

### Slot
Casque

### Orientation
Défense simple, robustesse de base.

### Rôle dans le MVP
Le Casque de garde simple sert à :
- rendre visible le slot tête ;
- donner une première vraie impression d’équipement défensif ;
- compléter les pièces de garde du build frontal.

Il doit être perçu comme :
- modeste ;
- crédible ;
- utilitaire ;
- immédiatement compréhensible.

### Ressenti recherché
Le joueur doit sentir :
**“je ne suis plus seulement vêtu pour survivre ; je commence à me protéger pour combattre.”**

### Priorité
- **haute**

---

## 8. Plastron de cuir renforcé

### Nom affiché canonique
**Plastron de cuir renforcé**

### ID technique recommandé
`reinforced_leather_chest`

### Slot
Torse

### Orientation
Équilibre, début de progression, build souple.

### Rôle dans le MVP
Le Plastron de cuir renforcé est une pièce de torse importante car elle peut servir de premier vrai pivot entre :
- tenue légère,
- et vraie armure.

Il doit être perçu comme :
- plus rassurant qu’une simple tenue de départ ;
- moins lourd qu’un plastron de garde ;
- utile à des builds encore ouverts.

### Ressenti recherché
Le joueur doit sentir :
**“j’ai une vraie protection, sans encore me figer dans une armure lourde.”**

### Priorité
- **critique**

---

## 9. Plastron de garde

### Nom affiché canonique
**Plastron de garde**

### ID technique recommandé
`guard_chestplate`

### Slot
Torse

### Orientation
Défense, build frontal, robustesse.

### Rôle dans le MVP
Le Plastron de garde est la pièce défensive emblématique du MVP.
Il sert à :
- faire sentir un vrai cap défensif ;
- soutenir les builds plus lourds ou plus frontaux ;
- matérialiser la progression du Forgeron.

Il doit être perçu comme :
- solide ;
- protecteur ;
- sérieux ;
- plus “combat” que la plupart des pièces précédentes.

### Ressenti recherché
Le joueur doit sentir :
**“je suis équipé pour tenir face à une vraie pression.”**

### Priorité
- **très haute**

---

## 10. Jambières simples

### Nom affiché canonique
**Jambières simples**

### ID technique recommandé
`traveler_leggings`

### Slot
Jambes

### Orientation
Polyvalence, début de progression.

### Rôle dans le MVP
Les Jambières simples servent à :
- remplir un slot important sans complexifier trop tôt le système ;
- rendre l’équipement plus complet ;
- offrir une première amélioration lisible sans surspécialisation.

Elles doivent être perçues comme :
- modestes ;
- utiles ;
- adaptables.

### Priorité
- **haute**

---

## 11. Jambières renforcées

### Nom affiché canonique
**Jambières renforcées**

### ID technique recommandé
`guard_legplates`

### Slot
Jambes

### Orientation
Robustesse, défense plus lourde.

### Rôle dans le MVP
Les Jambières renforcées accompagnent naturellement le Plastron de garde.
Elles servent à :
- consolider un build frontal ;
- faire sentir un palier défensif cohérent ;
- soutenir la sensation de tenue complète.

Elles doivent être perçues comme :
- plus lourdes ;
- plus stables ;
- plus adaptées aux affrontements de palier.

### Priorité
- **très haute**

---

## 12. Bottes de marche

### Nom affiché canonique
**Bottes de marche**

### ID technique recommandé
`field_boots`

### Slot
Bottes

### Orientation
Stabilité légère, exploration, polyvalence.

### Rôle dans le MVP
Les Bottes de marche servent à :
- compléter un build de début ou de milieu de MVP ;
- donner une sensation d’équipement “terrain” ;
- renforcer le lien entre survie et mobilité sans créer un système trop fin.

Elles doivent être perçues comme :
- pratiques ;
- simples ;
- crédibles ;
- adaptées à un aventurier encore en construction.

### Priorité
- **haute**

---

## 13. Bottes ferrées

### Nom affiché canonique
**Bottes ferrées**

### ID technique recommandé
`ironbound_boots`

### Slot
Bottes

### Orientation
Défense, ancrage, build plus robuste.

### Rôle dans le MVP
Les Bottes ferrées servent à :
- accompagner les builds de garde ou de force ;
- renforcer la lecture “je suis mieux préparé pour encaisser” ;
- compléter la progression du Forgeron vers des pièces plus sérieuses.

Elles doivent être perçues comme :
- plus rigides ;
- plus lourdes ;
- plus martiales.

### Priorité
- **haute**

---

## 14. Gants de travail

### Nom affiché canonique
**Gants de travail**

### ID technique recommandé
`work_gloves`

### Slot
Gants

### Orientation
Polyvalence, début de jeu.

### Rôle dans le MVP
Les Gants de travail sont une pièce simple, idéale pour :
- rendre le slot gants concret ;
- soutenir la logique “équipement utile du quotidien” ;
- servir de transition entre ferme, survie et combat.

Ils doivent être perçus comme :
- pratiques ;
- modestes ;
- crédibles dans un monde où le héros travaille autant qu’il combat.

### Priorité
- **haute**

---

## 15. Gants de garde

### Nom affiché canonique
**Gants de garde**

### ID technique recommandé
`guard_gauntlets`

### Slot
Gants

### Orientation
Défense, maintien, build frontal.

### Rôle dans le MVP
Les Gants de garde servent à :
- compléter visuellement et fonctionnellement un build lourd ;
- renforcer la sensation d’équipement structuré ;
- donner une finition plus martiale au héros.

Ils doivent être perçus comme :
- solides ;
- fermes ;
- plus orientés combat pur que les Gants de travail.

### Priorité
- **très haute**

---

## 16. Rôle des armures dans les builds du MVP

Les armures du MVP doivent rendre immédiatement lisibles plusieurs orientations :

### Build équilibré / début de jeu
- Plastron de cuir renforcé
- Jambières simples
- Bottes de marche
- Gants de travail

### Build défensif / frontal
- Casque de garde simple
- Plastron de garde
- Jambières renforcées
- Bottes ferrées
- Gants de garde

### Build hybride raisonnable
- mélange de pièces simples et renforcées selon les stats du joueur

Le MVP ne cherche pas encore la finesse extrême.
Il cherche à rendre les choix visibles et concrets.

---

## 17. Lien avec les statistiques du joueur

Les armures doivent être cohérentes avec :
- FOR
- CON
- VIT
- éventuellement INT ou DEX pour certaines pièces plus spécifiques plus tard

Dans le MVP, elles servent surtout à :
- renforcer la survie ;
- soutenir la robustesse ;
- structurer des exigences légères pour certains équipements plus marqués.

L’idée importante à préserver est :
**une armure n’est pas juste un bouclier chiffré ; c’est une manière de dire quel type de combattant le héros devient.**

---

## 18. Lien avec les compétences liées à l’équipement

Certaines pièces d’armure du MVP peuvent, à terme, porter une compétence liée ou soutenir une orientation active.

Exemples d’intention :
- pièce lourde → compétence d’impact, de maintien ou de charge
- pièce plus spécialisée → soutien léger à une technique ou à une posture

Le MVP n’a pas besoin d’exploiter cette logique partout, mais il doit la laisser possible et crédible.

---

## 19. Progression et déblocage

Les armures doivent suivre une logique simple :
- premières pièces utiles et modestes ;
- meilleures pièces après progression du Forgeron ;
- paliers plus visibles après les seuils de tour.

Le joueur doit sentir que :
- ses victoires rendent le village capable de mieux l’équiper ;
- les armures les plus solides ne tombent pas au hasard ;
- elles sont le fruit de la reconstruction.

---

## 20. Contraintes de cohérence

Les armures du MVP doivent toujours respecter les règles suivantes :

- chaque pièce doit avoir une identité claire ;
- pas de multiplication de variantes inutiles ;
- les pièces lourdes doivent se distinguer clairement des pièces simples ;
- les armures du Forgeron doivent sembler fabriquées, crédibles et intégrées au monde ;
- chaque pièce doit pouvoir être comprise par le joueur sans fiche externe.

Le joueur doit pouvoir associer facilement :
- une pièce ;
- un slot ;
- une orientation défensive.

---

## 21. Contraintes front et UI

Le front doit pouvoir afficher clairement :
- le slot ;
- la rareté ;
- les bonus ;
- les prérequis éventuels ;
- la comparaison avec la pièce équipée ;
- l’impact sur le build global du héros.

### Priorités visuelles
- distinguer clairement cuir / garde / travail / ferré / renforcé ;
- rendre la progression défensive lisible ;
- aider le joueur à voir immédiatement s’il gagne en robustesse ou change juste de style.

---

## 22. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/05-equipements/equipements-index.md`
- `docs/05-equipements/armes.md`
- `docs/02-personnages/forgeron.md`
- `docs/04-objets/materiaux.md`
- `docs/00-projet/canon-mvp.md`

Les armures prennent leur sens au croisement de :
- la défense,
- la forge,
- la progression du héros,
- et la reconstruction du village.

---

## 23. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. `docs/05-equipements/accessoires.md`
2. `docs/05-equipements/progression-equipement-mvp.md`

Puis :
3. fiches détaillées si besoin sur les pièces majeures de torse ou de build

---

## 24. Résumé exécutif

Le noyau d’armures du MVP repose sur un petit ensemble de pièces claires :
- casque,
- plastrons,
- jambières,
- bottes,
- gants.

Ce catalogue suffit à rendre visibles les premières vraies orientations défensives du héros sans noyer le joueur sous trop de variantes.
Les armures du MVP doivent être lisibles, concrètes et directement liées à la progression du Forgeron et du village.

Leur rôle central est simple :
**elles ne servent pas seulement à réduire les dégâts ; elles servent à montrer comment le héros apprend à se tenir face à une menace qui, elle aussi, devient plus sérieuse.**
