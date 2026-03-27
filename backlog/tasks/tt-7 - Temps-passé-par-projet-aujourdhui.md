---
id: TT-7
title: Temps passé par projet aujourd'hui
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-27 22:31'
labels:
  - code
  - design
dependencies:
  - TT-4
references:
  - Covenant 03-composants.md §8 (Card)
  - Covenant 03-composants.md §10 (Badge)
  - Covenant 05-etats-feedback.md §6 (Empty state)
priority: medium
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Section « Temps par projet aujourd'hui » affichant la répartition du temps de travail par projet pour la journée en cours. Chaque projet est représenté par une card Covenant avec nom, durée, barre de progression et pourcentage.

## Mockup — Section répartition par projet

```
┌─ section ────────────────────────────────────────────┐
│ .page-header (intégré dans la page principale)       │
│  h2 "Temps par projet aujourd'hui"                   │
│                                                      │
│ ┌─ .project-time-grid (CSS Grid auto-fill) ────────┐ │
│ │                                                   │ │
│ │ ┌─ article.card ────────────────────┐             │ │
│ │ │ .card__header                     │             │ │
│ │ │  h3 "Projet Alpha"               │             │ │
│ │ │  span.badge[data-variant="info"]  │             │ │
│ │ │   icon-zap "0h45 parallèle"      │             │ │
│ │ │                                   │             │ │
│ │ │ .card__body                       │             │ │
│ │ │  .project-time__duration          │             │ │
│ │ │   "3h 30m"  (--text-2xl semibold) │             │ │
│ │ │                                   │             │ │
│ │ │  .project-time__bar-wrapper       │             │ │
│ │ │  ┌────────────────────────┬─────┐ │             │ │
│ │ │  │ .project-time__bar-fill│     │ │             │ │
│ │ │  │ (width: 58%)          │     │ │             │ │
│ │ │  └────────────────────────┴─────┘ │             │ │
│ │ │  <progress> (sr-only)             │             │ │
│ │ │                                   │             │ │
│ │ │  .project-time__percent           │             │ │
│ │ │   "58% du temps total"            │             │ │
│ │ │   (--text-sm --color-text-muted)  │             │ │
│ │ └───────────────────────────────────┘             │ │
│ │                                                   │ │
│ │ ┌─ article.card ────────────────────┐             │ │
│ │ │ .card__header                     │             │ │
│ │ │  h3 "Projet Beta"                │             │ │
│ │ │                                   │             │ │
│ │ │ .card__body                       │             │ │
│ │ │  .project-time__duration          │             │ │
│ │ │   "2h 30m"                        │             │ │
│ │ │  .project-time__bar-wrapper       │             │ │
│ │ │  ┌──────────────────┬───────────┐ │             │ │
│ │ │  │ bar-fill (42%)   │           │ │             │ │
│ │ │  └──────────────────┴───────────┘ │             │ │
│ │ │  "42% du temps total"             │             │ │
│ │ └───────────────────────────────────┘             │ │
│ │                                                   │ │
│ └───────────────────────────────────────────────────┘ │
│                                                      │
│ ── État vide (.empty-state) ──                       │
│ icon-clock  "Aucune session de travail aujourd'hui"  │
└──────────────────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Card | `article.card` / `.card__header` / `.card__body` | 03-composants §8 |
| Badge parallèle | `.badge` `data-variant="info"` | 03-composants §10 |
| Empty state | `.empty-state` | 05-etats-feedback §6 |

## Composant custom (tokens Covenant)

| Composant | Classe | Détails |
|-----------|--------|---------|
| Barre de progression | `.project-time__bar-wrapper` / `__bar-fill` | `height: var(--space-2)`, `border-radius: var(--radius-full)`, bg `var(--color-bg-subtle)`, fill `var(--color-primary)` |
| Durée grand format | `.project-time__duration` | `font-size: var(--text-2xl)`, `font-weight: var(--font-weight-semibold)` |
| Pourcentage | `.project-time__percent` | `font-size: var(--text-sm)`, `color: var(--color-text-muted)` |
| Grille | `.project-time-grid` | `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr))`, `gap: var(--gap-md)` |

## Icônes Lucide

| Usage | Icône | Symbole sprite |
|-------|-------|---------------|
| Temps parallèle | `zap` | `icon-zap` |
| Empty state | `clock` | `icon-clock` |

## Accessibilité barre de progression

Utiliser un `<progress>` natif masqué visuellement (`sr-only`) pour les lecteurs d'écran :
```html
<div class="project-time__bar-wrapper" aria-hidden="true">
  <div class="project-time__bar-fill" style="width: 58%"></div>
</div>
<progress class="sr-only" value="58" max="100">58%</progress>
```

## Calculs

- **Durée projet** = somme des sessions du projet avec `date === aujourd'hui`
- **Pourcentage** = `(durée projet / durée totale tous projets) × 100`
- **Temps parallèle** = durée pendant laquelle 2+ sessions projets se chevauchent (intersection des intervalles [début, fin])
- **Mise à jour temps réel** : si un chronomètre tourne (TT-4), recalcul toutes les 60s via `setInterval`

## Ordre d'affichage

Cards triées par durée décroissante (le projet avec le plus de temps en premier).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Section avec titre « Temps par projet aujourd'hui »
- [ ] #2 Une `.card` par projet ayant au moins une session aujourd'hui
- [ ] #3 Chaque card affiche : nom projet (h3), durée totale (format Xh Xm), barre de progression, pourcentage
- [ ] #4 Barre de progression visuelle proportionnelle à la durée, construite avec tokens Covenant
- [ ] #5 `<progress>` natif `.sr-only` pour l'accessibilité de la barre
- [ ] #6 Pourcentage calculé par rapport au temps total de tous les projets
- [ ] #7 Cards triées par durée décroissante
- [ ] #8 Détection du temps parallèle : badge info icon-zap « Xh Xm parallèle » si chevauchement de sessions
- [ ] #9 Grille responsive `auto-fill minmax(16rem, 1fr)` pour les cards
- [ ] #10 Mise à jour en temps réel (recalcul toutes les 60s) si un chronomètre tourne
- [ ] #11 Empty state `.empty-state` icon-clock si aucune session aujourd'hui
- [ ] #12 Pas de valeurs CSS brutes — tous les tokens Covenant
<!-- AC:END -->
