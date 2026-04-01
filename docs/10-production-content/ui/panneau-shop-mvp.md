# Panneau Shop MVP

> **Statut : document canonique actif**
> Ce document définit la structure canonique du panneau de shop pour le MVP.
> Il sert de référence active pour l’implémentation front des interfaces de commerce, la lisibilité des achats et ventes, la comparaison d’objets, la hiérarchie des informations et la cohérence entre le Marché et la Forge.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les panneaux de shop du MVP.

---

## 1. Rôle du document

Ce document fixe la manière dont les shops doivent s’ouvrir et se lire côté UI dans le MVP.

Il permet de :
- unifier la logique de panneau pour les commerces du jeu ;
- garder une lecture cohérente entre Marché et Forge ;
- clarifier ce que le joueur peut acheter, vendre ou comparer ;
- éviter les interfaces de shop trop techniques ou trop confuses ;
- faire du commerce une interaction rapide, claire et intégrée au monde.

Le panneau de shop ne doit pas donner l’impression d’une interface de back-office.
Il doit être :
- lisible ;
- confortable ;
- rapide ;
- cohérent avec le ton du jeu.

---

## 2. Objectifs du panneau shop

Le panneau de shop doit permettre au joueur de comprendre immédiatement :

- avec quel PNJ il échange ;
- s’il est en train d’acheter ou de vendre ;
- quels objets sont disponibles ;
- ce qu’il possède déjà ;
- combien cela coûte ou rapporte ;
- si un objet est meilleur, utile, verrouillé ou indisponible ;
- si quelque chose vient d’être débloqué.

Le front doit faire ressentir :
- clarté ;
- praticité ;
- progression ;
- cohérence avec le lieu et le PNJ.

---

## 3. Principes de conception

### 3.1 Une structure commune
Le Marché et la Forge doivent partager une base d’interface commune pour faciliter l’apprentissage.

### 3.2 Une identité de contenu distincte
Même si la structure est similaire :
- le Marché doit se lire comme un commerce du quotidien ;
- la Forge comme un commerce de progression matérielle.

### 3.3 Une lecture rapide
Le shop est une interface fréquente.
Le joueur doit pouvoir s’y repérer en quelques secondes.

### 3.4 Peu de friction
Les actions simples doivent demander peu d’étapes :
- acheter une graine ;
- vendre une récolte ;
- comparer un équipement ;
- acheter une pièce.

### 3.5 Les nouveautés doivent ressortir
Quand le monde progresse et qu’un shop s’améliore, le joueur doit le voir facilement.

---

## 4. Structure générale recommandée

Le panneau de shop du MVP repose sur **5 blocs principaux** :

1. **En-tête PNJ / shop**
2. **Onglets ou mode d’échange**
3. **Liste des objets**
4. **Panneau de détail**
5. **Bloc transaction / confirmation**

Ces blocs doivent être présents dans les deux grands shops du MVP.

---

## 5. En-tête PNJ / shop

## 5.1 Fonction
Afficher clairement :
- le nom du PNJ ;
- le nom ou type du shop ;
- éventuellement l’état du shop ou une courte phrase contextuelle.

## 5.2 Informations minimales à afficher
### Marché
- nom de la Marchande
- intitulé du shop : `Marché du village`

### Forge
- nom du Forgeron
- intitulé du shop : `Forge du village`

## 5.3 Règle UX
Le joueur doit toujours sentir qu’il échange avec :
- une personne ;
- dans un lieu ;
- pas dans un menu abstrait.

---

## 6. Onglets ou mode d’échange

## 6.1 Fonction
Afficher les grandes actions possibles selon le shop.

## 6.2 Pour le Marché
Onglets recommandés :
- `Acheter`
- `Vendre`

## 6.3 Pour la Forge
Onglets recommandés :
- `Armes`
- `Armures`
- `Accessoires`

Option possible plus tard :
- `Tout`
- ou sous-catégories plus fines
Mais le MVP doit rester simple.

## 6.4 Règle UX
L’onglet actif doit être immédiatement identifiable.
Le joueur ne doit jamais se demander :
- si l’objet est achetable ;
- si l’écran est en mode vente ;
- ou dans quelle catégorie il se trouve.

---

## 7. Liste des objets

## 7.1 Fonction
Afficher les objets disponibles dans le mode / onglet sélectionné.

## 7.2 Informations minimales par ligne

### Pour le Marché
- icône
- nom
- quantité possédée si pertinent
- prix d’achat ou de vente

### Pour la Forge
- icône
- nom
- rareté si utilisée
- prix
- indicateur simple :
  - équipé
  - meilleur
  - moins bon
  - verrouillé

## 7.3 Règle UX
La liste doit être compacte mais très lisible.
Le joueur doit pouvoir scanner rapidement :
- ce qui est dispo ;
- ce qu’il peut s’offrir ;
- ce qui l’intéresse.

## 7.4 Gestion des objets verrouillés
Les objets verrouillés peuvent apparaître si cela aide la progression, mais seulement si la lecture reste claire :
- silhouette grisée ;
- mention simple : `Indisponible pour l’instant` ou équivalent.

Le MVP doit éviter les longues listes pleines d’objets verrouillés inutiles.

---

## 8. Panneau de détail

## 8.1 Fonction
Afficher les informations détaillées de l’objet sélectionné.

## 8.2 Pour le Marché
Le panneau de détail doit montrer :
- nom
- catégorie
- description courte
- quantité possédée
- prix d’achat / vente
- usage global (ex. : `À planter`, `Récolte vendable`, `Utilisable en craft`)

## 8.3 Pour la Forge
Le panneau de détail doit montrer :
- nom
- slot
- rareté
- bonus principaux
- prérequis éventuels
- compétence liée si présente
- comparaison avec l’objet équipé

## 8.4 Règle UX
Le détail doit enrichir la lecture, pas la ralentir.
Le joueur doit pouvoir comprendre un objet sans ouvrir trois sous-fenêtres.

---

## 9. Bloc transaction / confirmation

## 9.1 Fonction
Permettre au joueur de :
- acheter ;
- vendre ;
- confirmer ;
- annuler.

## 9.2 Informations minimales à afficher
- prix total
- quantité
- or actuel
- résultat après achat/vente si utile

## 9.3 Règle UX
Pour les actions courantes :
- confirmation simple ;
- peu de clics ;
- pas de pop-up lourde pour une vente de navet.

Pour les achats plus importants :
- une validation claire suffit.

## 9.4 Quantité
### Marché
Prévoir si possible :
- achat unitaire
- achat par quantité simple
- vente rapide

### Forge
L’achat d’équipement peut rester :
- unitaire
- simple
- direct

---

## 10. Cas du Marché

## 10.1 Priorités UX du Marché
Le Marché est une interface de fréquence élevée.
Il doit être :
- ultra lisible ;
- rapide ;
- léger ;
- fluide.

## 10.2 Ce que le joueur doit pouvoir faire très vite
- acheter une graine
- vendre une récolte
- vérifier ce qu’il possède
- voir ce qui s’est débloqué

## 10.3 Ton UI recommandé
- plus quotidien
- plus léger
- plus souple
- moins “solennel” que la Forge

---

## 11. Cas de la Forge

## 11.1 Priorités UX de la Forge
La Forge est moins fréquente, mais plus lourde en décision.
Elle doit être :
- plus comparative ;
- plus structurée ;
- plus orientée progression.

## 11.2 Ce que le joueur doit pouvoir faire très vite
- voir si une pièce est meilleure
- comprendre à quel build elle correspond
- comparer avec l’équipement actuel
- repérer les nouveautés débloquées

## 11.3 Ton UI recommandé
- plus dense
- plus robuste
- plus “matériel”
- plus structuré que le Marché

---

## 12. Lecture des comparaisons d’équipement

## 12.1 Fonction
Le joueur doit pouvoir voir immédiatement si une pièce :
- améliore son build ;
- le change ;
- ou ne lui convient pas.

## 12.2 Règle de comparaison
Le panneau doit montrer simplement :
- stats gagnées
- stats perdues
- éventuelle compétence liée
- changement de slot si nécessaire

## 12.3 Règle UX
La comparaison doit être :
- courte ;
- visuelle ;
- non intimidante.

Le MVP doit éviter les tableaux trop techniques.

---

## 13. Lecture de la progression de shop

Le panneau shop doit pouvoir montrer si quelque chose a changé depuis la dernière visite.

Exemples de signaux utiles :
- badge `Nouveau`
- surbrillance douce
- petit indicateur de déblocage

Le joueur doit ressentir :
**le monde a progressé, donc ce shop a évolué.**

---

## 14. Ambiance UI recommandée

Le panneau de shop doit être :
- clair
- sobre
- légèrement ancré dans le monde
- lisible avant tout

Il faut éviter :
- les interfaces trop froides
- les grilles trop serrées
- les effets décoratifs excessifs
- les shops qui ressemblent à une feuille Excel

Le bon ton est :
**RPG lisible avec matière discrète**

---

## 15. Contraintes UX

Le panneau shop doit respecter les règles suivantes :

- lecture immédiate
- peu d’étapes pour les actions fréquentes
- comparaisons claires
- nouveautés bien visibles
- séparation nette entre achat et vente
- cohérence entre Marché et Forge

Le joueur doit toujours savoir :
- où il est ;
- ce qu’il peut faire ;
- si l’objet vaut le coup.

---

## 16. Contraintes techniques / front

Le panneau doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- tri simple par catégorie
- intégration des prix
- lecture des quantités
- comparaison d’équipement
- évolution du catalogue par flags ou progression

Le système doit pouvoir être monté progressivement :
1. structure commune
2. Marché
3. Forge
4. comparaisons
5. déblocages visuels

---

## 17. Cas particuliers à prévoir

### Pas assez d’or
Le joueur doit le voir immédiatement sans message agressif.

### Inventaire plein ou limite atteinte
Le message doit être clair et simple.

### Objet équipé
La lecture doit éviter la confusion :
- l’objet équipé doit être identifiable
- l’achat d’un doublon ne doit pas sembler absurde si autorisé

### Shop encore limité
Le panneau doit pouvoir montrer un shop fonctionnel mais pauvre sans donner l’impression qu’il bug.

---

## 18. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/08-gameplay-content/shops-mvp.md`
- `docs/10-production-content/front-scenes/marche-scene-mvp.md`
- `docs/10-production-content/front-scenes/forge-scene-mvp.md`
- `docs/05-equipements/progression-equipement-mvp.md`
- `docs/04-objets/items-index.md`

---

## 19. Priorités de production recommandées

Après ce document, les docs UI les plus logiques à produire sont :

1. `journal-quetes-mvp.md`
2. `fiche-personnage-equipement-mvp.md`
3. `ecran-transition-palier-mvp.md`

---

## 20. Résumé exécutif

Le panneau de shop du MVP doit unifier la logique du Marché et de la Forge dans une structure claire, légère et très lisible.

Il doit permettre au joueur de voir rapidement :
- avec qui il échange,
- ce qu’il peut acheter ou vendre,
- ce qu’il possède,
- ce qui est nouveau,
- et si un objet soutient sa progression.

Son rôle central est simple :
**faire du commerce une action fluide et compréhensible, sans casser la sensation d’échanger dans un vrai monde.**
