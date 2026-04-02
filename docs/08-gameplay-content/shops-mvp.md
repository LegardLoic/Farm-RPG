# Shops MVP

> **Statut : document canonique actif**
> Ce document définit les shops canoniques du MVP.
> Il sert de référence active pour le front, le village, l’économie, les déblocages de progression, les PNJ marchands, les objets vendus et la lisibilité des interactions commerciales.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les shops du MVP.

---

## 1. Rôle du document

Ce document fixe la structure des shops du MVP.

Il permet de :
- définir quels commerces existent réellement ;
- préciser leur rôle dans la boucle ferme ↔ village ↔ tour ;
- structurer les déblocages commerciaux ;
- guider le front pour la mise en scène du marché et de la forge ;
- éviter un système de boutique trop large ou flou.

Le MVP n’a pas besoin de dix commerces différents.
Il a besoin de **deux shops majeurs très lisibles**, chacun avec une fonction claire et une vraie place dans le monde.

---

## 2. Principes de conception des shops MVP

Les shops du MVP doivent respecter les règles suivantes :

### 2.1 Fonction claire
Chaque shop doit répondre à une logique simple :
- l’un soutient la ferme et l’économie du quotidien ;
- l’autre soutient la progression matérielle et le combat.

### 2.2 Ancrage dans le monde
Un shop ne doit pas être seulement une interface.
Il doit être porté par un PNJ, un lieu et une progression visible.

### 2.3 Progression lisible
Les shops doivent évoluer avec le monde.
Le joueur doit sentir qu’un commerce :
- s’ouvre ;
- se stabilise ;
- ou se développe grâce à ses actions.

### 2.4 Catalogue raisonnable
Le MVP doit éviter les listes d’objets trop longues.
Chaque boutique doit proposer peu d’objets, mais tous doivent être utiles.

---

## 3. Vue d’ensemble des shops du MVP

Le MVP repose sur **2 shops majeurs** :

| Shop | PNJ associé | Fonction dominante | Priorité |
|---|---|---|---|
| Marché du village | La Marchande | Graines, rachat des récoltes, économie locale | Critique |
| Forge du village | Le Forgeron | Équipements, progression matérielle | Critique |

Ces deux shops suffisent à soutenir la boucle économique et la boucle matérielle du MVP.

---

## 4. Marché du village

## 4.1 Fonction générale

Le Marché du village est le commerce du quotidien.

Il sert à :
- vendre des graines ;
- racheter les récoltes ;
- relier directement la ferme à l’économie locale ;
- donner une utilité immédiate au travail agricole.

C’est le shop le plus important du début de jeu du point de vue de la boucle ferme ↔ village.

---

## 4.2 Rôle narratif

Narrativement, le Marché du village représente :
- la vie ordinaire qui continue malgré tout ;
- la circulation encore possible des ressources ;
- la preuve que le village n’est pas totalement mort ;
- l’un des premiers signes concrets qu’un quotidien peut encore exister.

Le Marché ne doit pas être luxueux ni abondant au début.
Il doit sembler :
- modeste ;
- utile ;
- un peu limité ;
- mais fondamental.

---

## 4.3 Rôle gameplay

Le Marché du village sert à :

### A. Acheter des graines
Le joueur achète :
- `turnip_seed`
- `carrot_seed`
- `wheat_seed`
selon la progression.

### B. Vendre les récoltes
Le joueur revend :
- `turnip`
- `carrot`
- `wheat`

### C. Soutenir certaines quêtes
Le marché peut être impliqué dans :
- des livraisons ;
- des besoins d’approvisionnement ;
- des quêtes secondaires simples.

### D. Donner une boucle économique claire
Le Marché doit rendre très lisible :
- j’achète,
- je plante,
- je récolte,
- je revends ou je garde pour craft.

---

## 4.4 État initial du Marché

Au début du MVP, le Marché du village doit être :
- fonctionnel ;
- limité ;
- petit ;
- crédible comme commerce de survie.

Le joueur doit y sentir :
- qu’il existe déjà quelque chose à faire ;
- que l’économie locale est faible, mais encore vivante ;
- que son activité peut aider ce lieu à reprendre un rythme.

---

## 4.5 Progression du Marché

Le Marché doit progresser de façon lisible, mais subtile.

### État 1 — Marché réduit
- peu d’offres ;
- commerce de base ;
- logique de survie quotidienne.

### État 2 — Reprise simple
- après les premiers progrès du joueur ;
- plus de fluidité ;
- plus de confiance dans les échanges ;
- certaines offres ou dialogues s’ouvrent.

### État 3 — Marché consolidé
- après des paliers plus avancés ;
- impression que le commerce local reprend mieux ;
- meilleure densité d’échange ;
- plus de stabilité dans l’ambiance.

Le MVP n’a pas besoin d’un système complexe d’économie dynamique.
Il doit surtout faire sentir que le marché redevient plus vivant.

---

## 4.6 Catalogue canonique du Marché

### Disponible tôt
- `turnip_seed`
- rachat de `turnip`

### Déblocage intermédiaire
- `carrot_seed`
- rachat de `carrot`

### Déblocage avancé MVP
- `wheat_seed`
- rachat de `wheat`

Optionnel en bordure MVP :
- petite présence de consommables simples
- ou très légères variations selon la progression

Mais le cœur du marché doit rester :
**graines + rachat des récoltes**

---

## 4.7 Ressenti recherché pour le Marché

Le joueur doit penser :
- “ma ferme sert à quelque chose tout de suite”
- “ce village peut encore échanger”
- “je fais déjà circuler un peu de vie ici”

Le Marché doit être simple, mais émotionnellement important.

---

## 5. Forge du village

## 5.1 Fonction générale

La Forge du village est le commerce de progression matérielle du MVP.

Elle sert à :
- vendre des armes ;
- vendre des armures ;
- vendre certains accessoires simples selon progression ;
- matérialiser le retour du Forgeron et de la capacité du village à équiper le héros.

La Forge est le shop qui transforme les progrès de la tour en vraie montée en puissance visible.

---

## 5.2 Rôle narratif

Narrativement, la Forge représente :
- un métier frappé par la malédiction ;
- une fonction essentielle du village presque éteinte ;
- l’un des meilleurs symboles de la reconstruction en cours.

Contrairement au Marché, la Forge ne doit pas être pleinement fonctionnelle dès le départ.
Sa progression doit être plus marquée.

---

## 5.3 Rôle gameplay

La Forge sert à :

### A. Acheter des armes
Exemples :
- `iron_sword_basic`
- `steel_sword_advanced`
- `ash_dagger_light`
- `warden_hammer`
- `tower_guard_shield`

### B. Acheter des armures
Exemples :
- `reinforced_leather_chest`
- `guard_chestplate`
- `guard_helm_basic`
- `guard_legplates`
- `field_boots`
- `ironbound_boots`
- `work_gloves`
- `guard_gauntlets`

### C. Acheter certains accessoires simples
Exemples :
- `vigor_ring`
- `guard_ring`
- `focus_amulet`
- `vigor_amulet`

### D. Marquer les paliers de progression
Le joueur doit sentir que chaque nouveau palier de la Forge signifie :
- le monde change ;
- le Forgeron revient ;
- le héros peut aller plus loin.

---

## 5.4 État initial de la Forge

Au début du MVP, la Forge doit être :
- présente ;
- lisible comme lieu important ;
- mais partiellement verrouillée ou limitée.

Le joueur doit comprendre que :
- ce commerce devrait être central ;
- il ne l’est pas encore ;
- et sa progression dans la tour peut changer cela.

C’est un point très important du ressenti monde.

---

## 5.5 Progression canonique de la Forge

La Forge doit suivre une progression plus nette que le Marché.

### État 1 — Forge entravée
- peu d’offres ou accès restreint ;
- sensation de potentiel bloqué ;
- le Forgeron est présent mais diminué.

### État 2 — Réouverture partielle
- Tier 1 clairement disponible ;
- premiers équipements structurants ;
- sentiment qu’un vrai service revient.

### État 3 — Forge relancée
- Tier 2 bien lisible ;
- plus d’options de build ;
- meilleure tenue du héros.

### État 4 — Forge affirmée de fin de MVP
- accès au haut du catalogue MVP ;
- objets plus marqués ;
- vraie sensation de préparation sérieuse au boss final.

Le MVP n’a pas besoin d’une forge infinie.
Il a besoin d’une forge qui raconte une reconstruction.

---

## 5.6 Catalogue canonique de la Forge par tiers

### Tier 1 — Base structurée
Exemples :
- `iron_sword_basic`
- `tower_guard_shield`
- `reinforced_leather_chest`
- `traveler_leggings`
- `field_boots`
- `work_gloves`
- `vigor_ring`

### Tier 2 — Progression intermédiaire
Exemples :
- `steel_sword_advanced`
- `guard_chestplate`
- `guard_helm_basic`
- `guard_legplates`
- `ironbound_boots`
- `guard_gauntlets`
- `clarity_ring`
- `precision_ring`
- `vigor_amulet`

### Tier 3 — Fin de MVP
Exemples :
- `warden_hammer`
- `ember_focus`
- variantes rares ou plus spécialisées de certaines pièces majeures
- objets de build plus affirmés

Le catalogue exact pourra être ajusté ensuite, mais cette structure doit rester canonique.

---

## 5.7 Ressenti recherché pour la Forge

Le joueur doit penser :
- “j’ai rouvert quelque chose d’important”
- “le village redevient capable de me soutenir”
- “ma progression matérielle vient aussi de ce que j’ai réparé ici”

La Forge doit être l’un des plus gros leviers émotionnels de progression dans le village.

---

## 6. Différence fondamentale entre les deux shops

Les deux shops du MVP doivent se distinguer clairement :

### Le Marché
- quotidien
- agricole
- économique
- immédiatement utile
- plus vivant tôt

### La Forge
- matérielle
- combative
- plus verrouillée
- plus progressive
- plus symbolique dans la reconstruction

Le joueur ne doit jamais les confondre fonctionnellement ou émotionnellement.

---

## 7. Rôle des shops dans la boucle du jeu

Les shops doivent soutenir la boucle suivante :

### Ferme
- le joueur produit

### Marché
- le joueur achète les graines et revend une partie

### Tour
- le joueur progresse et ramène des matériaux / victoires

### Forge
- le joueur transforme cette progression en meilleur équipement

Cela doit créer une sensation très claire :
**la boucle du jeu passe par les commerces comme par des lieux vivants, pas seulement comme par des écrans transactionnels.**

---

## 8. Contraintes front et mise en scène

Le front doit pouvoir rendre visibles les shops comme de vrais lieux.

### Marché du village
À montrer si possible comme :
- un étal ;
- un petit espace de vente ;
- une zone du village qui semble réellement servir.

### Forge
À montrer si possible comme :
- un atelier ;
- une enclume ;
- une zone de chaleur / feu / outils ;
- un lieu qui change visiblement avec la progression.

### Côté UI
Le joueur doit voir facilement :
- ce qui est vendu ;
- ce qui est verrouillé ;
- ce qui vient d’être débloqué ;
- ce qui relève du Marché ou de la Forge.

Les shops doivent être faciles à comprendre en un coup d’œil.

---

## 9. Contraintes de cohérence

Les shops du MVP doivent toujours respecter les règles suivantes :

- peu de commerces, mais très utiles ;
- chaque shop doit avoir une identité claire ;
- les déblocages doivent être liés au monde ;
- le contenu vendu doit être cohérent avec le PNJ et le lieu ;
- les shops doivent renforcer la boucle centrale, pas la disperser.

Le joueur doit toujours sentir que :
- le Marché nourrit la ferme,
- la Forge nourrit le combat,
- et les deux participent à la reconstruction du village.

---

## 10. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/02-personnages/marchande.md`
- `docs/02-personnages/forgeron.md`
- `docs/04-objets/items-index.md`
- `docs/05-equipements/progression-equipement-mvp.md`
- `docs/01-univers/lieux-mvp.md`

Les shops prennent leur sens au croisement du lieu, du PNJ, de l’économie, de l’équipement et de la progression du monde.

---

## 11. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. `docs/09-direction-artistique/guide-visuel-mvp.md`
2. fiches détaillées de quêtes majeures si besoin
3. schémas de mise en scène front des lieux :
   - marché
   - forge
   - ferme
   - entrée de la tour

Puis :
4. éventuelle formalisation plus technique des catalogues exacts par tier

---

## 12. Résumé exécutif

Le MVP repose sur deux shops majeurs :
- **le Marché du village**
- **la Forge du village**

Le Marché soutient la boucle agricole et économique du quotidien.
La Forge soutient la progression matérielle et la montée en puissance du héros.

Leur fonction commune est essentielle :
**faire sentir que le monde ne change pas seulement dans les dialogues ou les combats, mais aussi dans sa capacité retrouvée à produire, échanger et équiper.**
