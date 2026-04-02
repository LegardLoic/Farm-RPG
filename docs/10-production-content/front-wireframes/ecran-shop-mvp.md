# Écran Shop MVP

> **Statut : document canonique actif**
> Ce document définit le wireframe fonctionnel canonique de l’écran de Shop pour le MVP.
> Il sert de référence active pour l’implémentation front, la disposition des zones de liste, détail, transaction et comparaison, ainsi que la cohérence d’expérience entre le Marché et la Forge.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour l’écran de Shop du MVP.

---

## 1. Rôle du document

Ce document fixe la structure de l’écran de Shop côté front.

Il permet de :
- traduire les shops en écrans concrets et cohérents ;
- unifier la logique UI du Marché et de la Forge ;
- hiérarchiser clairement liste, détail et transaction ;
- guider Codex sur la disposition générale ;
- éviter des boutiques trop techniques, trop chargées ou incohérentes entre elles.

L’écran de Shop doit être un écran de décision simple :
- voir ;
- comparer ;
- acheter ou vendre ;
- repartir.

---

## 2. Objectifs de l’écran

L’écran doit permettre au joueur de comprendre immédiatement :

- avec quel PNJ il échange ;
- s’il est en train d’acheter ou de vendre ;
- quelle catégorie il consulte ;
- quels objets sont disponibles ;
- ce qu’il possède déjà ;
- combien cela coûte ou rapporte ;
- si un objet est meilleur, utile, verrouillé ou déjà équipé ;
- si quelque chose est nouveau depuis sa dernière visite.

Le front doit faire ressentir :
- lisibilité ;
- fluidité ;
- progression ;
- cohérence avec le lieu et le PNJ.

---

## 3. Principe général de composition

L’écran de Shop doit être composé de **2 couches principales** :

### 3.1 Couche identité du shop
Le lieu et le PNJ :
- nom du shop
- nom du PNJ
- petite phrase contextuelle éventuelle
- ambiance propre au Marché ou à la Forge

### 3.2 Couche fonctionnelle
L’interface d’échange :
- onglets
- liste d’objets
- détail
- transaction
- comparaison éventuelle

L’écran doit rester très lisible.
Le joueur doit voir rapidement ce qui relève :
- de l’identité du lieu ;
- et de l’action commerciale.

---

## 4. Zoning général recommandé

## 4.1 Répartition fonctionnelle

### Bandeau supérieur
**En-tête du shop**
- PNJ
- type de shop
- or actuel du joueur

### Colonne gauche
**Liste des catégories / onglets**
- Marché : Acheter / Vendre
- Forge : Armes / Armures / Accessoires

### Colonne centrale dominante
**Liste des objets**
- scan rapide
- sélection
- statut rapide

### Colonne droite
**Détail de l’objet sélectionné**
- description
- prix
- quantité / bonus
- comparaison

### Bandeau inférieur ou bas de panneau
**Zone transaction**
- acheter
- vendre
- quantité
- confirmer
- retour

---

## 5. Wireframe fonctionnel simplifié

Exemple logique de composition :

    ┌──────────────────────────────────────────────────────────────┐
    │ PNJ / Shop                         Or du joueur              │
    │                                                              │
    │ [Onglets / catégories]   [ Liste des objets ]   [ Détail ]  │
    │                                                              │
    │ Acheter / Vendre        Icône  Nom   Prix       Nom         │
    │ Armes / Armures         Icône  Nom   Prix       Description │
    │ Accessoires             Icône  Nom   Prix       Bonus / qty │
    │                         Icône  Nom   Prix       Comparaison │
    │                                                              │
    │ Quantité / Action : Acheter | Vendre | Confirmer | Retour   │
    └──────────────────────────────────────────────────────────────┘

Ce schéma n’est pas une DA finale.
C’est une logique de hiérarchie.

---

## 6. Bandeau supérieur

## 6.1 Fonction
Afficher immédiatement l’identité du shop.

## 6.2 Informations minimales à afficher
- nom du PNJ
- nom du shop
- or actuel du joueur

## 6.3 Lecture attendue
Le joueur doit comprendre immédiatement :
- où il est ;
- avec qui il échange ;
- quelle est sa marge d’achat actuelle.

## 6.4 Variantes recommandées
### Marché
- plus léger
- plus quotidien
- plus souple visuellement

### Forge
- plus dense
- plus structuré
- plus matériel

---

## 7. Colonne catégories / onglets

## 7.1 Fonction
Filtrer rapidement le contenu du shop.

## 7.2 Pour le Marché
Onglets recommandés :
- `Acheter`
- `Vendre`

## 7.3 Pour la Forge
Onglets recommandés :
- `Armes`
- `Armures`
- `Accessoires`

## 7.4 Règle UX
L’onglet actif doit être visible immédiatement.
Le joueur ne doit jamais se demander :
- dans quel mode il se trouve ;
- pourquoi la liste a changé ;
- si l’objet affiché peut être acheté ou vendu.

---

## 8. Liste des objets

## 8.1 Fonction
Afficher les objets disponibles dans la catégorie active.

## 8.2 Informations minimales par ligne

### Marché
- icône
- nom
- prix
- quantité possédée si utile

### Forge
- icône
- nom
- prix
- rareté si présente
- indicateur rapide :
  - équipé
  - meilleur
  - verrouillé
  - nouveau

## 8.3 Règle UX
La liste doit être :
- dense mais lisible ;
- facile à scanner ;
- stable ;
- clairement sélectionnable.

Le joueur doit voir rapidement :
- ce qu’il peut se permettre ;
- ce qu’il connaît déjà ;
- ce qui l’intéresse.

---

## 9. Détail de l’objet sélectionné

## 9.1 Fonction
Afficher les informations utiles sur l’objet sur lequel le joueur est focalisé.

## 9.2 Pour le Marché
Afficher :
- nom
- type
- description courte
- quantité possédée
- prix d’achat ou de vente
- usage principal

Exemples d’usage :
- `À planter`
- `Récolte vendable`
- `Utilisable en craft`

## 9.3 Pour la Forge
Afficher :
- nom
- slot
- rareté
- bonus principaux
- prérequis éventuels
- compétence liée si présente
- comparaison avec l’objet équipé

## 9.4 Règle UX
Le détail doit être compréhensible d’un coup d’œil.
Il ne doit pas demander d’ouvrir un sous-écran.

---

## 10. Zone de transaction

## 10.1 Fonction
Permettre l’action finale :
- acheter ;
- vendre ;
- confirmer ;
- annuler.

## 10.2 Informations minimales à afficher
- prix unitaire
- quantité
- total
- or actuel
- résultat prévisible si utile

## 10.3 Règle UX
Les actions courantes doivent être rapides.
Le MVP doit éviter :
- les confirmations inutiles ;
- les allers-retours lourds ;
- les étapes superflues.

---

## 11. Cas du Marché

## 11.1 Lecture attendue
Le Marché doit être compris comme :
- commerce du quotidien ;
- interface fréquente ;
- flux rapide.

## 11.2 Priorités UX
Le joueur doit pouvoir très vite :
- acheter une graine ;
- vendre une récolte ;
- vérifier une quantité ;
- repartir.

## 11.3 Comportement recommandé
- très peu de friction ;
- onglet achat / vente ultra lisible ;
- descriptions courtes ;
- transaction rapide.

---

## 12. Cas de la Forge

## 12.1 Lecture attendue
La Forge doit être comprise comme :
- commerce de progression ;
- interface de choix plus lourde ;
- lieu de comparaison.

## 12.2 Priorités UX
Le joueur doit pouvoir très vite :
- repérer une amélioration ;
- comparer avec l’équipement actuel ;
- comprendre si un objet soutient son build ;
- identifier les nouveautés.

## 12.3 Comportement recommandé
- plus de place pour le panneau de détail ;
- comparaisons très lisibles ;
- signalétique claire des pièces équipées ou meilleures.

---

## 13. Hiérarchie visuelle recommandée

### Priorité 1
- liste des objets
- détail de l’objet sélectionné
- prix
- action possible

### Priorité 2
- or du joueur
- quantités
- comparaisons
- statut équipé / nouveau / verrouillé

### Priorité 3
- texte contextuel
- ambiance visuelle
- éléments secondaires

Le joueur doit d’abord comprendre :
- ce qu’il regarde ;
- combien ça coûte ;
- s’il peut l’acheter ou le vendre.

---

## 14. États UX à prévoir

## 14.1 Pas assez d’or
L’interface doit le montrer clairement sans popup agressive.

## 14.2 Objet verrouillé
La raison doit être simple :
- indisponible pour l’instant
- progression insuffisante
- shop non encore amélioré

## 14.3 Objet déjà équipé
Le statut doit être lisible immédiatement.

## 14.4 Vente impossible
Le joueur doit comprendre pourquoi :
- quantité nulle
- objet non vendable
- autre règle spécifique

## 14.5 Nouveau contenu débloqué
L’écran doit le signaler clairement :
- badge `Nouveau`
- surbrillance légère
- tri simple si besoin

---

## 15. Comportement émotionnel de l’écran

L’écran de Shop doit donner la sensation :

### Marché
- proximité ;
- quotidien ;
- circulation utile ;
- économie locale.

### Forge
- progression ;
- poids matériel ;
- montée en puissance ;
- reconstruction.

Le joueur doit y ressentir :
**“le monde me fournit des moyens concrets d’avancer.”**

---

## 16. Contraintes UX

L’écran doit respecter les règles suivantes :

- lecture immédiate ;
- peu de friction ;
- catégories claires ;
- détails utiles ;
- comparaisons simples ;
- cohérence forte entre Marché et Forge.

Le joueur ne doit jamais se demander longtemps :
- ce que cet objet fait ;
- s’il peut l’acheter ;
- s’il est meilleur ;
- où il est dans l’interface.

---

## 17. Contraintes techniques / front

L’écran doit être compatible avec :
- souris
- clavier
- manette

Il doit aussi permettre :
- scroll ou navigation simple dans les listes
- mise à jour rapide des quantités et de l’or
- comparaison d’équipement
- évolution du catalogue selon progression
- réutilisation de composants communs entre Marché et Forge

Ordre de montage recommandé :
1. structure commune
2. en-tête
3. onglets
4. liste
5. détail
6. transaction
7. comparaisons / états spéciaux

---

## 18. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/10-production-content/ui/panneau-shop-mvp.md`
- `docs/10-production-content/front-scenes/marche-scene-mvp.md`
- `docs/10-production-content/front-scenes/forge-scene-mvp.md`
- `docs/08-gameplay-content/shops-mvp.md`
- `docs/05-equipements/progression-equipement-mvp.md`

---

## 19. Priorités de production recommandées

Après cet écran, les wireframes les plus logiques à produire sont :

1. `ecran-personnage-equipement-mvp.md`
2. `ecran-journal-quetes-mvp.md`

---

## 20. Résumé exécutif

L’écran de Shop du MVP doit unifier la logique de commerce du Marché et de la Forge dans un cadre simple, lisible et très fonctionnel.

Il doit donner la priorité :
- à la catégorie active ;
- à la liste d’objets ;
- au détail de l’objet sélectionné ;
- à la transaction ;
- et à la compréhension immédiate de la valeur de l’échange.

Son rôle central est simple :
**faire du commerce une action claire et rapide, sans casser la sensation d’échanger dans un vrai lieu du monde.**
