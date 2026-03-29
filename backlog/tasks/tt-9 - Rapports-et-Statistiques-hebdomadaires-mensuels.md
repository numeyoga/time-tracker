---
id: TT-9
title: Rapports et Statistiques hebdomadaires/mensuels
status: Done
assignee: []
created_date: '2026-03-27 21:56'
updated_date: '2026-03-29 15:05'
labels:
  - code
  - design
dependencies:
  - TT-2
  - TT-4
references:
  - Covenant 03-composants.md §8 (Card)
  - Covenant 03-composants.md §9 (Data Table)
  - Covenant 03-composants.md §11 (Tabs)
  - Covenant 05-etats-feedback.md §6 (Empty state)
priority: medium
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Section « Rapports et Statistiques » en bas de page avec vue hebdomadaire et mensuelle. Affiche des KPI et un tableau croisé projets × jours avec totaux.

## Mockup — Rapports et Statistiques

```
┌─ section ──────────────────────────────────────────────────────────┐
│ .page-header                                                       │
│  h2 "Rapports et Statistiques"                                    │
│                                                                    │
│ ┌─ .report-toolbar ──────────────────────────────────────────────┐ │
│ │ .tabs[role="tablist"]                                          │ │
│ │  [btn tab "Semaine" aria-selected="true"]                      │ │
│ │  [btn tab "Mois"]                                              │ │
│ │                                                                │ │
│ │ .report-nav                                                    │ │
│ │  [btn ghost icon-chevron-left]                                 │ │
│ │  span.report-nav__label "23 – 29 Mar 2026"                    │ │
│ │  [btn ghost icon-chevron-right]                                │ │
│ │                                                                │ │
│ │                          [btn secondary sm]                    │ │
│ │                           icon-settings "Gérer les entrées"    │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌─ .report-kpi-grid (CSS Grid 3 cols) ──────────────────────────┐ │
│ │ ┌─ article.card ───────┐ ┌─ article.card ───────┐            │ │
│ │ │ border-left accent   │ │ border-left accent   │            │ │
│ │ │ .card__body           │ │ .card__body           │            │ │
│ │ │  "Temps de présence"  │ │  "Temps projets"      │            │ │
│ │ │  "38h 30m"            │ │  "32h 15m"            │            │ │
│ │ │  (--text-2xl bold)    │ │  (--text-2xl bold)    │            │ │
│ │ └──────────────────────┘ └──────────────────────┘             │ │
│ │ ┌─ article.card ───────┐                                      │ │
│ │ │ border-left accent   │                                      │ │
│ │ │ .card__body           │                                      │ │
│ │ │  "Jours travaillés"   │                                      │ │
│ │ │  "5 / 5"              │                                      │ │
│ │ └──────────────────────┘                                      │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌─ .data-table-wrapper ─────────────────────────────────────────┐ │
│ │ table.data-table                                               │ │
│ │ ┌────────────────────────────────────────────────────────────┐ │ │
│ │ │ thead                                                      │ │ │
│ │ │  PROJET   LUN   MAR   MER   JEU   VEN   TOTAL             │ │ │
│ │ ├────────────────────────────────────────────────────────────┤ │ │
│ │ │ tr  Alpha  3h30  4h00  2h15  3h45  4h00  17h30            │ │ │
│ │ │ tr  Beta   2h00  1h30  3h00  2h00  1h15  9h45             │ │ │
│ │ ├────────────────────────────────────────────────────────────┤ │ │
│ │ │ tfoot.data-table__foot                                     │ │ │
│ │ │ tr "Projets"  5h30 5h30 5h15 5h45 5h15  27h15             │ │ │
│ │ │ tr "Présence" 8h00 7h30 8h00 7h45 7h15  38h30             │ │ │
│ │ │                                                            │ │ │
│ │ │ Colonne TOTAL : bg var(--color-warning-subtle)             │ │ │
│ │ │ Chaque jour : [btn ghost sm icon-bar-chart]                │ │ │
│ │ │  → ouvre TT-10 popover timeline pour ce jour               │ │ │
│ │ └────────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ── État vide (.empty-state) ──                                    │
│ icon-bar-chart-2  "Aucune donnée pour cette période"              │
└────────────────────────────────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Tabs | `[role="tablist"]` + `[role="tab"]` | 03-composants §11 |
| Card KPI | `article.card` avec `border-left` accent | 03-composants §8 |
| Data table | `.data-table` / `.data-table__head` / `tfoot` | 03-composants §9 |
| Boutons nav | `.btn` `data-variant="ghost"` | 03-composants §2 |
| Bouton gérer | `.btn` `data-variant="secondary"` `data-size="sm"` | 03-composants §2 |
| Empty state | `.empty-state` | 05-etats-feedback §6 |

## Composants custom (tokens Covenant)

| Composant | Classe | CSS |
|-----------|--------|-----|
| Toolbar | `.report-toolbar` | `display: flex`, `align-items: center`, `justify-content: space-between`, `gap: var(--gap-md)` |
| Navigation période | `.report-nav` | `display: flex`, `align-items: center`, `gap: var(--gap-sm)` |
| Label période | `.report-nav__label` | `font-weight: var(--font-weight-semibold)`, `min-width: 12rem`, `text-align: center` |
| Grille KPI | `.report-kpi-grid` | `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: var(--gap-md)` |
| Card KPI accent | `.card--kpi` | `border-left: 3px solid var(--color-primary)` |

## Icônes Lucide

| Usage | Icône | Symbole |
|-------|-------|---------|
| Période précédente | `chevron-left` | `icon-chevron-left` |
| Période suivante | `chevron-right` | `icon-chevron-right` |
| Timeline d'un jour | `bar-chart-2` | `icon-bar-chart-2` |
| Gérer entrées | `settings` | `icon-settings` |
| Empty state | `bar-chart-2` | `icon-bar-chart-2` |

## Interactions

**Tabs Semaine/Mois** : bascule la vue, recalcule le tableau et les KPI. Semaine = Lun–Ven (5 cols). Mois = 1–28/31 (scrollable horizontalement).

**Navigation flèches** : décale la période d'une semaine/mois. Le label se met à jour (« 23 – 29 Mar 2026 » ou « Mars 2026 »).

**Bouton icon-bar-chart-2** dans l'en-tête de colonne jour : ouvre TT-10 (drawer timeline quotidienne) pour ce jour.

**Bouton « Gérer les entrées »** : ouvre TT-11 avec filtre sur la période affichée.

## Calculs

- **Temps de présence** = somme des durées pointage (arrivée→départ – pauses) sur la période
- **Temps projets** = somme des sessions projets sur la période
- **Jours travaillés** = nombre de jours avec au moins un pointage d'arrivée
- **Cellule tableau** = somme des sessions du projet pour le jour donné
- **Ligne Projets** = total sessions projets du jour
- **Ligne Présence** = durée pointage du jour (arrivée→départ – pauses)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tabs `[role="tablist"]` Semaine/Mois, Semaine actif par défaut avec `aria-selected`
- [ ] #2 Navigation flèches gauche/droite entre périodes + label centré de la période
- [ ] #3 3 cards KPI avec `border-left` accent : Temps présence, Temps projets, Jours travaillés
- [ ] #4 Valeurs KPI en `--text-2xl` `--font-weight-semibold`
- [ ] #5 Data table croisé : lignes = projets, colonnes = jours de la période
- [ ] #6 Cellules affichent durée (Xh Xm) ou ‘–’ si aucune donnée
- [ ] #7 Colonne TOTAL surligniée `var(--color-warning-subtle)` avec somme par projet
- [ ] #8 `tfoot` avec ligne Projets (total sessions/jour) et ligne Présence (pointage/jour)
- [ ] #9 Bouton ghost icon-bar-chart-2 par colonne jour ouvre TT-10 pour ce jour
- [ ] #10 Bouton secondary « Gérer les entrées » ouvre TT-11 filtré sur la période
- [ ] #11 Vue Mois : même structure, colonnes 1–31, table scrollable horizontalement
- [ ] #12 Empty state si aucune donnée pour la période sélectionnée
- [ ] #13 Accessibilité : `aria-selected` sur tab actif, `aria-label` sur boutons navigation
- [ ] #14 Aucune valeur CSS brute — tous les tokens Covenant
<!-- AC:END -->
