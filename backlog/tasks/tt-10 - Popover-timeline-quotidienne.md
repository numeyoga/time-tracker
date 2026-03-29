---
id: TT-10
title: Popover timeline quotidienne
status: Done
assignee: []
created_date: '2026-03-27 21:56'
updated_date: '2026-03-29 15:05'
labels:
  - code
  - design
dependencies:
  - TT-8
  - TT-9
references:
  - Covenant 04-patterns.md §7 (Drawer)
  - Covenant 05-etats-feedback.md §6 (Empty state)
priority: low
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Drawer latéral « Timeline du [Jour] [Date] » accessible depuis l'icône bar-chart dans le tableau des rapports (TT-9). Réutilise le composant timeline de TT-8 et affiche une liste chronologique détaillée de tous les événements de la journée.

## Mockup — Drawer Timeline quotidienne

```
┌─────────────────────────────────────────────────────┐
│ <dialog.drawer>                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ .drawer__header                                 │ │
│ │  h2 "Timeline du Lundi 23/03/2026" [btn ghost]  │ │
│ │                                      icon-x     │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ .drawer__body                                   │ │
│ │                                                 │ │
│ │  ── Réutilisation composant .timeline (TT-8) ── │ │
│ │  .timeline                                      │ │
│ │  ┌────────────────────────────────────────────┐ │ │
│ │  │ .timeline__bar                             │ │ │
│ │  │ [seg Alpha][Pause][seg Beta][seg Alpha]    │ │ │
│ │  └────────────────────────────────────────────┘ │ │
│ │  09:00                              17:30       │ │
│ │  .timeline__legend                              │ │
│ │                                                 │ │
│ │  h3 "Détail de la journée"                     │ │
│ │  (--text-md --font-weight-semibold)             │ │
│ │                                                 │ │
│ │  ┌─ .event-list ──────────────────────────────┐ │ │
│ │  │                                            │ │ │
│ │  │ .event-list__item                          │ │ │
│ │  │  .event-list__indicator                    │ │ │
│ │  │   (bar verticale, bg --color-success)      │ │ │
│ │  │  .event-list__content                      │ │ │
│ │  │   span.event-list__time "09:00" (bold)     │ │ │
│ │  │   span.event-list__label "Arrivée"         │ │ │
│ │  │                                            │ │ │
│ │  │ .event-list__item                          │ │ │
│ │  │  .event-list__indicator (--timeline-color-1)│ │ │
│ │  │  .event-list__content                      │ │ │
│ │  │   "09:00" "Début Projet Alpha"             │ │ │
│ │  │   .event-list__duration "3h30"             │ │ │
│ │  │                                            │ │ │
│ │  │ .event-list__item                          │ │ │
│ │  │  .event-list__indicator (--color-warning)  │ │ │
│ │  │  .event-list__content                      │ │ │
│ │  │   "12:30" "Début Pause"                    │ │ │
│ │  │   .event-list__duration "1h00"             │ │ │
│ │  │                                            │ │ │
│ │  │ .event-list__item                          │ │ │
│ │  │  .event-list__indicator (--color-danger)   │ │ │
│ │  │  .event-list__content                      │ │ │
│ │  │   "17:30" "Départ"                         │ │ │
│ │  │                                            │ │ │
│ │  └────────────────────────────────────────────┘ │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ .drawer__footer                                 │ │
│ │                         [btn secondary "Fermer"]│ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

── État vide ──
.empty-state data-size="sm"
 icon-calendar-off "Aucun événement pour ce jour"
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Drawer | `<dialog class="drawer">` | 04-patterns §7 |
| Timeline (réutilisée) | `.timeline` / `.timeline__bar` / `__legend` | TT-8 custom |
| Empty state | `.empty-state` `data-size="sm"` | 05-etats-feedback §6 |

## Composant custom `.event-list` (tokens Covenant)

| Élément | Classe | CSS |
|---------|--------|-----|
| Liste | `.event-list` | `display: flex`, `flex-direction: column`, `gap: var(--gap-sm)` |
| Item | `.event-list__item` | `display: flex`, `align-items: flex-start`, `gap: var(--gap-sm)` |
| Indicateur | `.event-list__indicator` | `width: 3px`, `align-self: stretch`, `border-radius: var(--radius-full)`, bg couleur type |
| Contenu | `.event-list__content` | `display: flex`, `flex-wrap: wrap`, `gap: var(--gap-xs)` |
| Heure | `.event-list__time` | `font-weight: var(--font-weight-semibold)`, `color: var(--color-text-default)` |
| Label | `.event-list__label` | `color: var(--color-text-default)` |
| Durée | `.event-list__duration` | `color: var(--color-text-muted)`, `font-size: var(--text-sm)` |

## Couleurs par type d'événement

| Type | Couleur indicateur |
|------|--------------------|
| Arrivée | `var(--color-success)` |
| Début/Fin pause | `var(--color-warning)` |
| Départ | `var(--color-danger)` |
| Session projet | couleur projet (palette TT-8) |

## Interactions

Le drawer reçoit la date du jour cliqué dans TT-9. Il charge les données de cette journée (pointages + sessions) et les affiche sous deux formes :
1. **Barre timeline** : composant `.timeline` identique à TT-8
2. **Liste événements** : tous les événements triés chronologiquement

Le `drawer__body` est scrollable si la liste d'événements est longue.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Drawer ouvert depuis l'icône bar-chart-2 dans le tableau TT-9 via `<dialog>.showModal()`
- [ ] #2 Titre « Timeline du [Jour] [Date] » avec bouton fermer ghost icon-x
- [ ] #3 Barre timeline horizontale réutilisant le composant `.timeline` de TT-8
- [ ] #4 Légende des couleurs sous la barre timeline
- [ ] #5 Sous-titre « Détail de la journée » séparant timeline et liste
- [ ] #6 Liste chronologique `.event-list` de tous les événements du jour
- [ ] #7 Chaque événement : barre verticale colorée + heure (bold) + label + durée si applicable
- [ ] #8 Types d'événements : Arrivée (success), Pause (warning), Départ (danger), Session projet (couleur projet)
- [ ] #9 Drawer body scrollable si la liste dépasse la hauteur
- [ ] #10 Empty state si aucun événement pour le jour sélectionné
- [ ] #11 Drawer fermable via bouton X, bouton Fermer footer, Escape, clic backdrop
- [ ] #12 Accessibilité : `aria-labelledby` sur le drawer
- [ ] #13 Aucune valeur CSS brute — tous les tokens Covenant
<!-- AC:END -->
