# Objets clés MVP

> **Statut : document canonique actif**
> Ce document définit les objets clés canoniques du MVP.
> Il sert de référence active pour la narration, les quêtes, les flags monde, la progression de la tour, les retours au village et les futurs besoins front liés aux objets de preuve ou de déblocage.
> En cas de divergence avec les anciens documents de cadrage ou les archives, ce document prévaut pour les objets clés du MVP.

---

## 1. Rôle du document

Ce document fixe le noyau des objets clés du MVP.

Il permet de :
- définir quels objets ont une valeur narrative ou structurelle forte ;
- distinguer les objets clés des matériaux, consommables et récoltes ;
- soutenir les quêtes de palier ;
- guider le front pour l’affichage des preuves de progression ;
- donner une matière concrète aux déblocages du monde.

Le MVP n’a pas besoin d’une grande collection d’objets de quête.
Il a besoin d’un **petit ensemble d’objets clés très lisibles**, chacun lié à un cap réel du jeu.

---

## 2. Principes de conception des objets clés MVP

Les objets clés du MVP doivent respecter les règles suivantes :

### 2.1 Valeur de preuve ou de bascule
Un objet clé doit signifier quelque chose :
- un seuil franchi ;
- une victoire importante ;
- un déblocage ;
- une trace d’un événement majeur.

### 2.2 Lisibilité absolue
Le joueur doit comprendre qu’un objet clé :
- ne se vend pas comme un objet normal ;
- ne se consomme pas comme un consommable ;
- a une importance plus grande que sa valeur marchande.

### 2.3 Faible quantité, forte densité
Le MVP doit avoir peu d’objets clés, mais chacun doit être mémorable et relié à une étape identifiable.

### 2.4 Lien direct avec la progression monde
Les objets clés doivent aider à rendre tangible l’idée :
**ce que je fais dans la tour change réellement quelque chose ici.**

---

## 3. Vue d’ensemble des objets clés MVP

Le noyau des objets clés du MVP repose sur **4 objets principaux** :

| Objet clé | ID technique recommandé | Fonction principale | Source principale | Priorité |
|---|---|---|---|---|
| Preuve du palier 3 | `floor_3_proof` | Marquer le premier seuil brisé | Palier 3 | Moyenne |
| Preuve du palier 5 | `floor_5_proof` | Marquer un cap de danger plus grave | Palier 5 | Moyenne |
| Preuve du palier 8 | `floor_8_proof` | Marquer l’approche d’un noyau défendu | Palier 8 | Moyenne |
| Fragment du Cœur de la Malédiction | `curse_heart_fragment` | Preuve majeure de victoire MVP | Boss étage 10 | Critique |

Ces objets doivent principalement servir à :
- soutenir les quêtes de palier ;
- nourrir les dialogues et réactions de PNJ ;
- déclencher ou justifier des flags monde ;
- donner une matérialité aux victoires importantes.

---

## 4. Preuve du palier 3

### Nom affiché canonique
**Preuve du palier 3**
Nom provisoire fonctionnel. Un nom plus “diégétique” pourra être défini plus tard si souhaité.

### ID technique recommandé
`floor_3_proof`

### Catégorie
Objet clé de progression

### Source principale
- victoire contre `thorn_beast_alpha`
- validation du palier 3

### Fonction principale
Marquer le premier vrai seuil franchi dans la tour.

### Rôle dans le MVP
Cet objet doit :
- soutenir la quête `story_floor_3` ;
- donner une preuve tangible du fait que le joueur a brisé un premier nœud ;
- renforcer les retours de PNJ et le sentiment d’un vrai cap franchi.

Il n’a pas besoin d’être spectaculaire.
Son importance vient surtout de sa fonction de **preuve**.

### Ressenti recherché
Le joueur doit comprendre :
**“ce n’est pas juste dans ma tête ou dans un chiffre ; j’ai ramené quelque chose qui prouve ce que j’ai vaincu.”**

### Priorité
- **moyenne**

---

## 5. Preuve du palier 5

### Nom affiché canonique
**Preuve du palier 5**

### ID technique recommandé
`floor_5_proof`

### Catégorie
Objet clé de progression

### Source principale
- victoire contre `cinder_warden`
- validation du palier 5

### Fonction principale
Marquer la traversée d’une couche plus hostile et plus lourde de la tour.

### Rôle dans le MVP
Cet objet doit :
- soutenir la quête `story_floor_5` ;
- justifier certains déblocages plus importants ;
- renforcer l’idée que le joueur ne progresse plus seulement dans les marges, mais dans des zones plus denses de malédiction.

Il doit être perçu comme plus grave que la preuve du palier 3.

### Ressenti recherché
Le joueur doit sentir :
**“ce que j’ai vaincu ici est plus sérieux, et le monde devrait réagir davantage.”**

### Priorité
- **moyenne**

---

## 6. Preuve du palier 8

### Nom affiché canonique
**Preuve du palier 8**

### ID technique recommandé
`floor_8_proof`

### Catégorie
Objet clé de progression avancée

### Source principale
- victoire contre `ash_vanguard_captain`
- validation du palier 8

### Fonction principale
Marquer l’approche du noyau défendu de la tour.

### Rôle dans le MVP
Cet objet doit :
- soutenir la quête `story_floor_8` ;
- renforcer les dialogues et réactions de village sur la gravité de l’ascension ;
- signaler que le joueur a dépassé un seuil où la menace paraît déjà organisée.

Il doit préparer l’arrivée de l’objet clé majeur du MVP.

### Ressenti recherché
Le joueur doit comprendre :
**“j’approche d’un centre réel, et ce que je ramène n’est pas une simple relique de combat.”**

### Priorité
- **moyenne**

---

## 7. Fragment du Cœur de la Malédiction

### Nom affiché canonique
**Fragment du Cœur de la Malédiction**

### ID technique recommandé
`curse_heart_fragment`

### Catégorie
Objet clé majeur du MVP

### Source principale
- victoire contre `curse_heart_avatar`
- conclusion du palier 10

### Fonction principale
Prouver que le joueur a frappé un foyer actif de la malédiction.

### Rôle dans le MVP
Cet objet est le plus important de tout le catalogue d’objets clés du MVP.

Il doit :
- soutenir la quête `story_floor_10` ;
- déclencher un retour monde majeur ;
- servir de preuve matérielle de la victoire contre un noyau de corruption ;
- marquer la conclusion du MVP sur le plan narratif.

Il ne doit pas être traité comme un simple drop rare.
Il doit porter une vraie charge symbolique.

### Ressenti recherché
Le joueur doit sentir :
**“j’ai ramené quelque chose qui ne devrait même pas exister hors de la tour, et le monde va changer parce que ce fragment n’est plus là-haut.”**

### Priorité
- **critique**

---

## 8. Fonction des objets clés dans la boucle de jeu

Les objets clés n’existent pas pour être accumulés.
Ils existent pour relier :

### 8.1 La tour
Le joueur vainc un seuil ou un boss important.

### 8.2 La preuve
Il obtient un objet qui matérialise cette victoire.

### 8.3 Le retour au village
Le monde, les PNJ, les quêtes ou les services peuvent réagir à cette preuve.

### 8.4 La progression
Le joueur comprend qu’un palier n’est pas seulement “validé en interne”, mais réellement inscrit dans le monde.

Cette logique est fondamentale pour éviter que la progression semble purement abstraite.

---

## 9. Rôle narratif

Les objets clés doivent raconter quelque chose du monde.

### Les preuves de palier
Elles disent :
- la tour a des nœuds ;
- le joueur en a brisé plusieurs ;
- chaque victoire laisse une trace.

### Le Fragment du Cœur
Il dit :
- la malédiction possède un foyer ;
- ce foyer a été blessé ;
- ce que le joueur a fait dépasse le simple exploit de combat.

Les objets clés sont donc des objets de récit silencieux.

---

## 10. Contraintes de cohérence

Les objets clés du MVP doivent toujours respecter les règles suivantes :

- ils doivent être rares et identifiables ;
- ils ne doivent pas être vendables comme des objets ordinaires ;
- ils ne doivent pas être confondus avec des matériaux ;
- ils doivent avoir un lien direct avec une étape forte du jeu ;
- ils doivent justifier un comportement du monde ou des PNJ.

Le joueur doit sentir qu’ils “comptent”.

---

## 11. Contraintes visuelles et front

Les objets clés doivent être clairement distingués dans :
- l’inventaire ;
- le journal de quêtes ;
- les retours de boss ;
- les éventuels panneaux de récompenses ou d’objectifs.

### Règles d’affichage
Le front doit pouvoir montrer :
- leur nom ;
- leur caractère important ;
- leur origine ;
- leur statut de preuve ou d’objet narratif majeur.

### Lecture visuelle souhaitée

#### Preuves de palier
- petites reliques, fragments, trophées ou restes distinctifs ;
- design simple mais plus “important” qu’un matériau brut.

#### Fragment du Cœur de la Malédiction
- visuel nettement plus marquant ;
- forme organique, maudite ou semi-rituelle ;
- sensation d’objet dangereux ou impur.

---

## 12. Lien avec les quêtes et les flags monde

Les objets clés sont étroitement liés à :
- `story_floor_3`
- `story_floor_5`
- `story_floor_8`
- `story_floor_10`

Ils peuvent soutenir :
- validation de quêtes ;
- dialogues de retour ;
- déblocages de shop ;
- évolution d’état PNJ ;
- flags monde majeurs.

Ils doivent donc être pensés comme des **ancrages de progression**, pas comme de simples objets passifs.

---

## 13. Lien avec les autres documents

Ce document doit être lu en lien avec :
- `docs/07-quetes/quetes-mvp-index.md`
- `docs/03-monstres/bestiaire-mvp-index.md`
- `docs/08-gameplay-content/floors-1-10.md`
- `docs/00-projet/canon-mvp.md`

Les objets clés relient les grandes victoires du joueur à la lisibilité du monde.

---

## 14. Priorités de production recommandées

Les prochaines étapes logiques à partir de ce document sont :

1. détailler les armes :
   - `docs/05-equipements/armes.md`

2. détailler les armures :
   - `docs/05-equipements/armures.md`

3. détailler les accessoires :
   - `docs/05-equipements/accessoires.md`

4. si besoin ensuite, produire des fiches détaillées de quêtes majeures et de leurs rewards

---

## 15. Résumé exécutif

Les objets clés du MVP sont peu nombreux, mais fortement significatifs :
- trois preuves de palier,
- et un objet majeur de conclusion, le **Fragment du Cœur de la Malédiction**.

Leur fonction n’est pas de remplir l’inventaire.
Leur fonction est de rendre tangibles les victoires importantes du joueur et de permettre au monde de réagir à ces moments.

Ils rappellent une idée essentielle du projet :
**dans ce jeu, franchir un seuil important ne se voit pas seulement dans un compteur ; cela laisse une trace que l’on peut rapporter au monde.**
