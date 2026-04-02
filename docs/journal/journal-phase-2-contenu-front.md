> **Statut : journal actif**
> Ce document suit la phase actuelle du projet : canon MVP, contenu, incarnation front et experience de jeu visuelle.

# Journal de bord - Farm RPG (Phase 2)

Derniere mise a jour: 2 avril 2026

## 1) Objectif du journal
Ce document garde une trace operationnelle des lots front MVP realises pendant la phase 2 (contenu + experience jouable), avant de poursuivre les lots suivants.

## 2) Etat global phase 2
- Lot 1 (Ferme MVP) : termine et pousse sur `develop`.
- Lot 2 (Village MVP) : termine et pousse sur `develop`.
- Lot 3 (Shops Marche + Forge) : non commence.

Branche de reference:
- `develop` (remote `origin/develop`)

Commits de reference phase 2:
- `686c8bf` - `feat(web): lot 1 ferme mvp jouable`
- `6be0a9f` - `feat(web): lot 2 village mvp jouable`

## 3) Chronologie des lots livres

### Lot 1 - Ferme MVP jouable
Reference commit:
- `686c8bf`

Documents utilises:
- `docs/10-production-content/ordre-prod-front-mvp.md`
- `docs/10-production-content/front-scenes/ferme-scene-mvp.md`
- `docs/10-production-content/ui/hud-ferme-mvp.md`
- `docs/10-production-content/front-wireframes/ecran-ferme-mvp.md`
- `docs/04-objets/graines-et-recoltes.md`
- `docs/06-crafting/recettes-index.md`

Fichiers modifies:
- `apps/web/src/game/scenes/GameScene.ts`
- `apps/web/src/styles.css`

Livrables principaux:
- Scene ferme lisible (maison, coin craft, sortie village).
- Parcelles visibles (grille 3x4) avec etats clairs:
  - vide
  - plantee
  - arrosee
  - prete a recolter
- Selection de parcelle en scene + feedback contextuel.
- HUD ferme leger dedie (masquage des panneaux techniques non prioritaires).
- Selection de graine active + actions contextuelles `Planter / Arroser / Recolter`.
- Craft ferme accessible via panneau dedie.
- Sommeil / passage du jour branche sur les endpoints existants.
- Sortie vers village introduite (lot 1: intention visible, lot 2: navigation effective).
- Raccourcis clavier ferme:
  - `1` planter
  - `2` arroser
  - `3` recolter
  - `F` dormir
  - `C` craft

Resultat:
- La ferme n est plus un panneau technique: elle devient un ecran jouable et lisible, branche sur les etats gameplay existants.

### Lot 2 - Village MVP jouable
Reference commit:
- `6be0a9f`

Documents utilises:
- `docs/10-production-content/ordre-prod-front-mvp.md`
- `docs/10-production-content/front-scenes/village-scene-mvp.md`
- `docs/10-production-content/front-wireframes/ecran-village-mvp.md`
- `docs/01-univers/lieux-mvp.md`
- `docs/02-personnages/pnj-mvp-index.md`
- Fiches PNJ de coherence:
  - `docs/02-personnages/maire.md`
  - `docs/02-personnages/marchande.md`
  - `docs/02-personnages/forgeron.md`
  - `docs/02-personnages/herboriste.md`
  - `docs/02-personnages/habitant-secondaire.md`

Fichiers modifies:
- `apps/web/src/game/scenes/GameScene.ts`
- `apps/web/src/styles.css`

Livrables principaux:
- Mise en place d un mode de scene front (`farm` / `village`) dans le front existant.
- Transition jouable Ferme -> Village (depuis la sortie ferme).
- Scene village compacte et lisible avec zones claires:
  - Mairie / Maire
  - Marche / Marchande
  - Forge / Forgeron
  - Coin calme / habitante secondaire
  - Sortie vers la Ferme
  - Sortie vers la Tour
- Ciblage contextuel des zones:
  - proximity targeting
  - clic souris
  - cycle de cible (`R`)
- Interaction contextuelle:
  - touche `E`
  - boutons HUD contextuels
- Interactions branchees sur les systemes existants:
  - `Maire / Marchande / Forgeron` -> endpoint PNJ existant
  - sortie ferme -> retour scene ferme
  - sortie tour -> feedback lisible (transition lot combat a venir)
- HUD village leger dedie:
  - objectif courant
  - cible active
  - role de la cible
  - action disponible
  - feedback contextuel
- Compatibilite clavier/manette conservee dans la logique HUD et navigation existante.

Validation technique Lot 2:
- `npm run typecheck --workspace @farm-rpg/web` -> OK
- `npm run build --workspace @farm-rpg/web` -> OK
- `npm run test --workspace @farm-rpg/web` -> OK (25/25)

Resultat:
- Le village est un hub jouable lisible (spatial, narratif, social), sans casser l existant backend/gameplay deja en place.

## 4) Synthese des modifications phase 2 (Lots 1-2)
- Front branche sur la boucle spatiale MVP:
  - Ferme jouable
  - Village jouable
  - transition effective entre les deux
- Lisibilite priorisee avant polish:
  - scene > HUD
  - interactions claires
  - feedbacks contextuels
- Refonte incrementale:
  - reusage du socle `GameScene` existant
  - aucun remplacement brutal du backend
  - integration progressive par lot

## 5) Point de depart du prochain lot
Prochain lot a lancer:
- Lot 3 - Shops (Marche + Forge)

Cible lot 3:
- panneau shop commun
- distinction immediate Marche vs Forge
- achat/vente/categories/detail/transaction
- comparaison simple cote forge

