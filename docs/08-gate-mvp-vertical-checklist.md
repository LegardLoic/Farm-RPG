# Gate MVP vertical - Ferme + RPG + Intro

Derniere mise a jour: 1 avril 2026

Objectif:
- valider la boucle verticale complete du MVP (intro -> village -> ferme -> preparation -> combat -> progression)
- disposer d'un gate reproductible avant merge `develop -> main`

## 1) Gate automatique

Commande rapide (local/CI):

```bash
npm run qa:gate:mvp
```

Commande etendue (inclut e2e/smoke si variables configurees):

```bash
MVP_GATE_INCLUDE_E2E=1 npm run qa:gate:mvp
```

Artifact genere:
- `artifacts/qa-gate/mvp-gate-report.md`

## 2) Checklist manuelle verticale

| Scenario | Precondition | Action | Resultat attendu |
| --- | --- | --- | --- |
| Intro -> ferme debloquee | Compte neuf | `POST /gameplay/intro/advance` jusqu'a completion | `farmAssigned=true`, `world.zone=Ferme` |
| Deblocage marche village | Etages tour < 3 | Lancer combats jusqu'au palier 3 | `GET /gameplay/state` => `loop.villageMarketUnlocked=true` |
| Culture et recolte | Ferme debloquee | Planter -> arroser -> avancer jour -> recolter | Inventaire recoltes augmente, plot reset |
| Crafting consommable | Recoltes suffisantes | `POST /gameplay/crafting/craft` | `healing_herb` ou `mana_tonic` augmente |
| Preparation combat | Marche + consommables | `POST /gameplay/combat/prepare` | `loop.preparation.active=true`, flags prep poses |
| Consommation prep au combat | Preparation active | `POST /combat/start` | Bonus HP/MP/ATK appliques puis flags prep supprimes |
| Relations PNJ | PNJ disponibles | `POST /gameplay/village/npc/interact` | Amitie augmente, cooldown journalier respecte |
| Sleep journalier | Ferme debloquee | `POST /gameplay/sleep` | `day+1`, `watered_today` reset |
| Save/load de slot | Session active | Capture puis load d'un slot | Etat joueur/monde restaure sans erreur |
| Front HUD coherent | Front en live | Verifier panneaux Intro/Village/Farm/Loop | Etats et boutons alignes avec payload API |

## 3) Definition of Done lot 96

- gate automatique `qa:gate:mvp` passe en local
- checklist manuelle completee au moins une fois sur staging/prod
- aucun blocage critique sur la boucle verticale
