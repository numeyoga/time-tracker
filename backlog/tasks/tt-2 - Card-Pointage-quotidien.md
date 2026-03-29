---
id: TT-2
title: Card Pointage quotidien
status: Done
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-28 22:11'
labels:
  - code
  - design
dependencies: []
documentation:
  - Covenant Design System — Skill Guide (covenant-design-system)
  - 'Covenant 03-composants.md §2 (Button), §8 (Card), §10 (Badge)'
  - Covenant 04-patterns.md §6 (Modals/dialog)
  - 'Covenant 05-etats-feedback.md §5.2 (Validation inline), §7 (État désactivé)'
  - 'Covenant 06-iconographie.md (Lucide SVG sprite, aria patterns)'
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Card principale de la page d'accueil affichant le statut de la journée de travail. Machine d'états pour le pointage : Arrivée → Pause → Reprise → Départ. Permet de pointer en 1 clic. Affiche les métriques de temps de présence et inclut une liste dépliable des pointages du jour avec CRUD inline.

---

## Mockup structurel — Décomposition en composants Covenant

```
<article class="card">                                              ← .card
┌──────────────────────────────────────────────────────────────────────────────┐
│ <header class="card__header">                                     ← .card__header
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                        │ │
│ │  [.badge data-variant="success"]     Temps de présence                 │ │
│ │   Journée terminée                   8h 00m  100% /8h                 │ │
│ │                                      Objectif atteint!                │ │
│ │                                                                        │ │
│ │                                      ┌─────┐┌─────┐┌─────┐┌─────┐    │ │
│ │                                      │ .btn ││ .btn ││ .btn ││ .btn │  │ │
│ │                                      │ghost ││ghost ││ghost ││ghost │  │ │
│ │                                      │ 🟢  ││ ⏸️  ││ ▶️  ││ 🔴  │   │ │
│ │                                      │Arriv.││Pause││Repr.││Dép. │   │ │
│ │                                      └─────┘└─────┘└─────┘└─────┘    │ │
│ │                                      ↑ aria-label + Lucide icons      │ │
│ │                                      ↑ :disabled selon machine états  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ <div class="card__body">                                          ← .card__body
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ <details>                                                    ← HTML natif│
│ │   <summary> ▼ Pointages d'aujourd'hui </summary>                       │ │
│ │                                                                        │ │
│ │   <ul class="punch-list">                          ← composant custom  │ │
│ │   ┌────────────────────────────────────────────────────────────────┐    │ │
│ │   │ .punch-list__item                                              │    │ │
│ │   │ ┌──────┐                                                       │    │ │
│ │   │ │.icon │  Arrivée                    08:30   [✏️] [🗑️]        │    │ │
│ │   │ │succ. │                                     .btn  .btn        │    │ │
│ │   │ └──────┘                                     ghost ghost       │    │ │
│ │   ├────────────────────────────────────────────────────────────────┤    │ │
│ │   │ │.icon │  Début pause                12:00   [✏️] [🗑️]        │    │ │
│ │   │ │warn. │                                                       │    │ │
│ │   ├────────────────────────────────────────────────────────────────┤    │ │
│ │   │ │.icon │  Fin pause                  13:00   [✏️] [🗑️]        │    │ │
│ │   │ │info  │                                                       │    │ │
│ │   ├────────────────────────────────────────────────────────────────┤    │ │
│ │   │ │.icon │  Départ                     17:30   [✏️] [🗑️]        │    │ │
│ │   │ │dang. │                                                       │    │ │
│ │   └────────────────────────────────────────────────────────────────┘    │ │
│ │   </ul>                                                                │ │
│ │ </details>                                                             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Composants Covenant utilisés

| Composant Covenant      | Usage dans cette card                                        | Fichier CSS                    |
|-------------------------|--------------------------------------------------------------|--------------------------------|
| `.card`                 | Conteneur principal `<article>`                              | `css/components/card.css`      |
| `.card__header`         | Zone badge + métriques + boutons d'action                    | (inclus dans card.css)         |
| `.card__body`           | Zone liste dépliable des pointages                           | (inclus dans card.css)         |
| `.badge`                | Statut de la journée (variant: success/info/warning/neutral) | `css/components/badge.css`     |
| `.btn` ghost            | Boutons de pointage (icône + label en dessous)               | `css/components/button.css`    |
| `.btn` ghost sm         | Boutons CRUD sur chaque pointage (crayon, poubelle)          | (inclus dans button.css)       |
| `.icon`                 | Icônes Lucide (SVG sprite)                                   | `css/components/icon.css`      |
| `.toggle`               | Non utilisé ici (voir TT-4 pour multi-projet)                | —                              |
| `<details>/<summary>`   | Section dépliable "Pointages d'aujourd'hui"                  | Styling custom minimal         |

## Composant custom à créer

| Composant              | Rôle                                                                 | Fichier CSS                        |
|------------------------|----------------------------------------------------------------------|------------------------------------|
| `.punch-list`          | Liste des pointages du jour (entrées avec icône, label, heure, CRUD) | `css/components/punch-list.css`    |
| `.punch-list__item`    | Ligne de pointage                                                    | (inclus)                           |
| `.punch-metrics`       | Bloc métriques (temps, %, objectif) dans le header de la card        | `css/components/punch-metrics.css` |
| `.punch-actions`       | Groupe de 4 boutons de pointage avec layout vertical (icône + label) | `css/components/punch-actions.css` |

---

## Icônes Lucide à intégrer au sprite SVG

| Action/Concept       | Icône Lucide    | Symbol ID           | Usage                           |
|----------------------|-----------------|---------------------|---------------------------------|
| Arrivée              | `log-in`        | `icon-log-in`       | Bouton + liste                  |
| Pause (début)        | `pause`         | `icon-pause`        | Bouton + liste                  |
| Reprise (fin pause)  | `play`          | `icon-play`         | Bouton + liste                  |
| Départ               | `log-out`       | `icon-log-out`      | Bouton + liste                  |
| Modifier             | `pencil`        | `icon-pencil`       | CRUD inline                     |
| Supprimer            | `trash-2`       | `icon-trash`        | CRUD inline                     |
| Déplier/Replier      | natif `<details>`| —                  | Triangle géré par le navigateur |

---

## Machine d'états — Pointage

```
                    ┌──────────────┐
        ─────────►  │ NON_COMMENCEE │
                    └──────┬───────┘
                     [Arrivée]
                           │
                    ┌──────▼───────┐
              ┌──── │   EN_COURS    │ ◄────┐
              │     └──────┬───────┘      │
         [Pause]           │          [Reprise]
              │     ┌──────▼───────┐      │
              └───► │   EN_PAUSE    │ ─────┘
                    └──────┬───────┘
                     [Départ] (depuis EN_COURS)
                           │
                    ┌──────▼───────┐
                    │    TERMINEE   │
                    └──────────────┘
```

| État           | Badge variant | Badge label          | Boutons actifs      |
|----------------|---------------|----------------------|---------------------|
| NON_COMMENCEE  | `neutral`     | Non commencée        | Arrivée             |
| EN_COURS       | `info`        | En cours             | Pause, Départ       |
| EN_PAUSE       | `warning`     | En pause             | Reprise             |
| TERMINEE       | `success`     | Journée terminée     | (aucun)             |

---

## Principes Covenant à respecter

- **Tokens uniquement** : aucune valeur brute (couleur hex, px, ms) dans le CSS
- **BEM** pour les classes structurelles, `data-*` pour variantes/états
- **`data-js-*`** comme sélecteurs DOM pour le JS (jamais de classes CSS)
- **Icônes Lucide** (SVG sprite, `currentColor`, `aria-hidden="true"`)
- **Boutons icône seule** : `aria-label` sur le `<button>`, pas sur l'icône
- **`<details>/<summary>`** : élément HTML natif pour la zone dépliable
- **Focus visible** sur tous les éléments interactifs
- **Cibles tactiles** : minimum 24×24 CSS px
- **Contraste** : WCAG 2.2 AA (≥ 4.5:1 texte, ≥ 3:1 UI)
- **Feedback** : transitions via tokens (`--duration-fast`, `--ease-default`)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Conteneur principal : `<article class="card">` avec `.card__header` (badge + métriques + boutons) et `.card__body` (liste dépliable)
- [x] #2 Badge statut (`.badge`) avec variant Covenant : `neutral` (Non commencée), `info` (En cours), `warning` (En pause), `success` (Journée terminée)
- [x] #3 4 boutons de pointage `.btn[data-variant="ghost"]` avec icônes Lucide (`log-in`, `pause`, `play`, `log-out`) + label texte sous l'icône, `aria-label` descriptif
- [x] #4 Machine d'états : seuls les boutons valides pour l'état courant sont actifs (`:disabled` sur les autres), transitions NON_COMMENCEE → EN_COURS → EN_PAUSE ↔ EN_COURS → TERMINEE
- [x] #5 Métriques affichées dans `.punch-metrics` : temps de présence (Xh Xm), pourcentage /8h, message 'Objectif atteint!' si ≥ 100%
- [x] #6 Temps de présence calculé automatiquement (soustrait les pauses du temps entre arrivée et départ)
- [x] #7 Section dépliable via `<details>/<summary>` natif — titre 'Pointages d'aujourd'hui'
- [x] #8 Liste `.punch-list` : chaque `.punch-list__item` affiche icône Lucide colorée (`data-color`), label, heure
- [x] #9 Chaque pointage est modifiable (`.btn[data-variant="ghost"][data-size="sm"]` avec `icon-pencil`, `aria-label="Modifier l'heure de [type]"`) et supprimable (`icon-trash`, `aria-label="Supprimer le pointage [type]"`)
- [x] #10 Modification d'un pointage : inline via `<input type="time">` dans la ligne, validation cohérence chronologique (arrivée < pause < reprise < départ)
- [x] #11 Suppression d'un pointage : confirmation modale (`<dialog>` natif), recalcul machine d'états et métriques
- [x] #12 Persistance dans localStorage : clé structurée par date, format JSON avec type et timestamp par pointage
- [x] #13 Tous les tokens CSS Covenant : couleurs, espacements, radius, ombres, durées — aucune valeur brute
- [x] #14 Sélecteurs JS via `data-js-*` exclusivement (ex: `data-js-punch-btn`, `data-js-punch-list`)
- [x] #15 Focus visible sur tous les éléments interactifs, cibles ≥ 24×24 CSS px, contrastes WCAG 2.2 AA
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Résumé

Refonte complète de la card de pointage quotidien selon le mockup TT-2.

### Fichiers créés
- `icons/sprite.svg` — Lucide SVG sprite (log-in, log-out, pause, play, pencil, trash, x)
- `css/components/badge.css` — Badge statut (neutral/info/warning/success)
- `css/components/icon.css` — Icônes avec tailles et couleurs sémantiques
- `css/components/punch-metrics.css` — Métriques temps/pourcentage/objectif
- `css/components/punch-actions.css` — 4 boutons verticaux icône + label
- `css/components/punch-list.css` — Liste des pointages avec CRUD inline

### Fichiers modifiés
- `index.html` — Nouvelle structure card (badge + metrics + actions + details/punch-list + delete dialog)
- `js/components/punch-clock.js` — Rendering badge, métriques (%/8h), punch list, delete dialog
- `js/pages/today.js` — Inline time editing, suppression avec confirmation, validation chronologique
- `tests/e2e/punch-clock.spec.js` — Tests badge, métriques, nouveaux sélecteurs
- `tests/e2e/break-flow.spec.js` — Tests pause/reprise avec nouvelle UI
- `tests/e2e/edit-time.spec.js` — Tests inline edit + suppression avec dialog

### Tests
- 68 tests unitaires ✓
- 20 tests e2e ✓
<!-- SECTION:FINAL_SUMMARY:END -->
