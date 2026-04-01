> **Statut : archive QA de fondation**
> Ce document a servi à la validation des premières itérations du système de combat réactif.
> Il est conservé comme référence historique de QA.
> Il peut rester utile, mais ne remplace pas les checklists et validations actives de la phase actuelle.

# QA checklist - Combat reactif

Derniere mise a jour: 30 mars 2026

Base de test:
- API prod: `https://farm-rpg-api.onrender.com`
- Web prod: `https://farm-rpg.onrender.com`

Objectif:
- valider les reactions `Cleanse` / `Interrupt`
- valider les boss scriptes des paliers 5 / 8 / 10
- verifier la coherence visuelle `Intent` + `Next` dans le HUD combat

## Checklist manuelle

| Scenario | Precondition | Endpoint / action | Resultat attendu cote API | Resultat attendu cote HUD |
|---|---|---|---|---|
| Cleanse retire `Burning` | Combat actif, joueur `Burning` | `POST /combat/:id/action` avec `{ "action": "cleanse" }` | 200 OK, `Burning` est retire, log de purge affiche, `playerCleanseReactionWindowTurns` est pose | Bouton `Cleanse` execute, effets joueur n'affichent plus `Burning`, MP du joueur baisse puis remonte de 1 si possible |
| Cleanse retire `Silence` | Combat actif, joueur `Silenced` | `POST /combat/:id/action` avec `{ "action": "cleanse" }` | 200 OK, `Silence` est retire, log de purge affiche | Le joueur redevient capable de lancer des skills magiques au tour suivant |
| Cleanse refuse si aucun debuff | Combat actif, aucun `Burning` ni `Silenced` | `POST /combat/:id/action` avec `{ "action": "cleanse" }` | 400, message `No debuffs to cleanse` | Erreur visible dans le panneau combat, aucun changement d'etat |
| Interrupt valide sur `Cinder Burst` | Boss palier 5 ou combat avec telegraphe `cinder_burst` | `POST /combat/:id/action` avec `{ "action": "interrupt" }` | 200 OK, `enemyInterruptedTurns` est pose, log d'interruption + exposition | Chip `Intent` montre une intention interrompable, `Interrupt` est cliquable, ennemi affiche un etat tactique court d'exposition |
| Interrupt valide sur `Null Sigil` | Boss palier 10, joueur sous `Rally` ou reaction recente `Cleanse` | `POST /combat/:id/action` avec `{ "action": "interrupt" }` | 200 OK, l'intention est interrompue si telegraphiee, `enemyInterruptedTurns` est pose | `Interrupt` est cliquable uniquement si l'intention est lisible et interruptible |
| Interrupt refuse si intention non interruptible | Combat actif avec telegraphe `basic_strike` ou autre intent non interruptible | `POST /combat/:id/action` avec `{ "action": "interrupt" }` | 400, message `No interruptible enemy intent` | Bouton `Interrupt` desactive ou erreur visible si action forcee |
| Boss palier 5 repond a `Cleanse` | Etage 5, boss `cinder_warden`, joueur vient de caster `cleanse` | `POST /combat/:id/action` puis fin de tour ennemi | Le boss priorise une pression offensive au tour suivant (`cinder_burst` / pression reactive) | HUD telegraphie une reprise d'agression, pas un simple pattern neutre |
| Boss palier 8 repond a `Interrupt` | Etage 8, boss `ash_vanguard_captain`, joueur vient de caster `interrupt` | `POST /combat/:id/action` puis fin de tour ennemi | Le boss contre plus agressivement apres interruption | HUD affiche un prochain intent plus offensif que le tour precedent |
| Boss palier 10 repond a `Cleanse` | Etage 10, boss `curse_heart_avatar`, joueur vient de caster `cleanse` | `POST /combat/:id/action` puis fin de tour ennemi | `Null Sigil` peut etre choisi meme sans `Rally` si la reaction recente est presente | HUD montre une intention de dispel/utility coherente avec `Next` |
| Coherence `Intent` + `Next` | Combat actif, telegraphe present | Ouvrir l'ecran combat et passer un tour | Les deux previsions serveur restent coherentes avec la sequence de tour | `Intent` montre l'action imminente, `Next` montre l'action suivante sans inversion ni duplication |
| Fin de combat nettoie les telegraphes | Combat termine par victoire, defaite ou abandon | Terminer le combat | `enemyTelegraphIntent` et `enemyTelegraphNextIntent` sont purges | Le HUD n'affiche plus d'intention persistante sur un combat termine |

## Notes de validation

- Tester au moins un boss reel par palier cible: `5`, `8`, `10`.
- Rejouer un `Cleanse` sur un debuff puis verifier le tour ennemi suivant.
- Rejouer un `Interrupt` sur une intention interrompable puis verifier le message de log et la baisse de pression.
- Verifier que le bouton `Interrupt` reste desactive si aucune intention interruptible n'est visible.
- Verifier que `Next` disparait proprement quand le serveur n'a pas de prevision suivante.
