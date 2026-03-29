---
id: TT-8
title: Timeline répartition de la journée
status: Done
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-29 14:40'
labels:
  - code
  - design
dependencies:
  - TT-2
  - TT-4
references:
  - Covenant 03-composants.md §8 (Card)
  - Covenant 03-composants.md §14 (Tooltip)
  - Covenant 04-patterns.md §8 (Toast)
  - Covenant 05-etats-feedback.md §6 (Empty state)
priority: medium
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Barre horizontale chronologique « Répartition de la journée » montrant visuellement la ventilation du temps entre l'arrivée et le départ. Segments colorés par type d'activité. Encapsulée dans une card Covenant.

## Mockup — Timeline journée

```
┌─ article.card ───────────────────────────────────────────────┐
│ .card__header                                                │
│  h3 "Répartition de la journée"        [btn ghost sm]       │
│                                         icon-clipboard       │
│                                         "Copier"             │
│                                                              │
│ .card__body                                                  │
│                                                              │
│  .timeline                                                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ .timeline__bar (flex, border-radius, overflow:hidden)│    │
│  │ ┌──────────┬────┬───────┬──────┬─────────┬─────────┐│    │
│  │ │ segment  │seg │segment│ seg  │ segment │ segment ││    │
│  │ │ "Alpha"  │Paus│"Beta" │Inact.│ "Alpha" │"Alpha+  ││    │
│  │ │ project  │e   │project│ idle │ project │ Beta"   ││    │
│  │ │ color-1  │warn│color-2│muted │ color-1 │ multi   ││    │
│  │ └──────────┴────┴───────┴──────┴─────────┴─────────┘│    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  .timeline__markers (flex, justify-content: space-between)   │
│   09:00                                            17:30     │
│   (--text-xs --color-text-muted)                             │
│                                                              │
│  .timeline__legend (flex-wrap, gap)                           │
│   ● Projet Alpha  ● Projet Beta  ● Pause  ● Inactif  ● Multi│
│   (.timeline__legend-item : dot + label, --text-xs)          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

── Segment au survol (tooltip Covenant) ──
┌──────────────────────────────┐
│ .tooltip                     │
│  "Projet Alpha"              │
│  "09:00 – 10:30 (1h30)"     │
└──────────────────────────────┘

── État vide ──
┌─ article.card ────────────────────────┐
│ .card__header                         │
│  h3 "Répartition de la journée"      │
│ .card__body                           │
│  .empty-state data-size="sm"          │
│   icon-calendar-off                   │
│   "Pointez votre arrivée pour voir    │
│    la répartition"                    │
└───────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Card | `article.card` / `.card__header` / `.card__body` | 03-composants §8 |
| Bouton copier | `.btn` `data-variant="ghost"` `data-size="sm"` | 03-composants §2 |
| Tooltip segment | `.tooltip` | 03-composants §14 |
| Empty state | `.empty-state` `data-size="sm"` | 05-etats-feedback §6 |
| Toast copie | `.toast` `data-variant="success"` | 04-patterns §8 |

## Composant custom `.timeline` (tokens Covenant)

| Élément | Classe | CSS (tokens) |
|---------|--------|-------------|
| Conteneur barre | `.timeline__bar` | `display: flex`, `height: var(--space-8)`, `border-radius: var(--radius-md)`, `overflow: hidden` |
| Segment | `.timeline__segment` | `flex: none`, `width` calculé en %, `min-width: 2px`, `cursor: pointer`, `transition: opacity var(--duration-fast)` |
| Segment projet | `[data-type="project"]` | `background-color` via couleur assignée au projet (palette de 8 couleurs tokens) |
| Segment pause | `[data-type="break"]` | `background-color: var(--color-warning)` |
| Segment inactif | `[data-type="idle"]` | `background-color: var(--color-bg-muted)` |
| Segment multi-projet | `[data-type="multi"]` | `background-color: var(--color-success)` |
| Marqueurs horaires | `.timeline__markers` | `display: flex`, `justify-content: space-between`, `font-size: var(--text-xs)`, `color: var(--color-text-muted)`, `margin-top: var(--space-1)` |
| Légende | `.timeline__legend` | `display: flex`, `flex-wrap: wrap`, `gap: var(--gap-sm)`, `margin-top: var(--space-3)`, `font-size: var(--text-xs)` |
| Point légende | `.timeline__legend-dot` | `width: var(--space-2)`, `height: var(--space-2)`, `border-radius: var(--radius-full)`, `background-color` hérité |

## Palette couleurs projets

8 couleurs sémantiques assignées dynamiquement aux projets (ordre d'apparition) :
```
--timeline-color-1 … --timeline-color-8
```
Définies dans `tokens.css` à partir de primitives palette. Si >8 projets, recyclage cyclique.

## Icônes Lucide

| Usage | Icône | Symbole sprite |
|-------|-------|---------------|
| Copier répartition | `clipboard` | `icon-clipboard` |
| Empty state | `calendar-off` | `icon-calendar-off` |

## Interactions

**Survol segment** : tooltip affichant nom activité + intervalle horaire + durée.

**Clic copier** : génère un texte structuré de la répartition et le copie via `navigator.clipboard.writeText()`, toast succès « Répartition copiée ».

Format copie :
```
Répartition du 27/03/2026 (09:00 – 17:30)
- 09:00–10:30 Projet Alpha (1h30)
- 10:30–10:45 Pause (0h15)
- 10:45–12:00 Projet Beta (1h15)
- 12:00–13:00 Inactif (1h00)
- 13:00–17:30 Projet Alpha (4h30)
```

## Calcul des segments

1. Récupérer les sessions projets + pointages (arrivée, pauses, départ) du jour
2. Fusionner en intervalles contigus sur l'axe [arrivée, départ]
3. Détecter les trous → segments « inactif »
4. Détecter les chevauchements → segments « multi-projet »
5. Calculer `width` de chaque segment : `(durée segment / durée totale journée) × 100%`

## Mise à jour temps réel

Si un chronomètre tourne ou le pointage est en cours, recalcul toutes les 60s — le dernier segment s'étend progressivement.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Encapsulée dans une `article.card` Covenant avec titre « Répartition de la journée »
- [ ] #2 Barre horizontale `.timeline__bar` segmentée entre heure d'arrivée et heure de départ
- [ ] #3 Segments colorés : couleur assignée par projet, `--color-warning` pause, `--color-bg-muted` inactif, `--color-success` multi-projet
- [ ] #4 Largeur de chaque segment proportionnelle à sa durée (% de la journée)
- [ ] #5 Tooltip Covenant au survol de chaque segment : nom + intervalle + durée
- [ ] #6 Marqueurs horaires début/fin sous la barre (`.timeline__markers`)
- [ ] #7 Légende sous la barre : pastille colorée + label par type d'activité
- [ ] #8 Bouton ghost icon-clipboard copie la répartition en texte via `navigator.clipboard`
- [ ] #9 Toast succès après copie
- [ ] #10 Segments inactifs générés automatiquement pour les trous entre sessions
- [ ] #11 Segments multi-projet si chevauchement de 2+ sessions simultanées
- [ ] #12 Mise à jour temps réel toutes les 60s si chronomètre/pointage en cours
- [ ] #13 Empty state si aucun pointage d'arrivée : icon-calendar-off + message
- [ ] #14 Palette de 8 couleurs projets définies comme tokens dans `tokens.css`
- [ ] #15 Accessibilité : tooltip clavier-accessible, contraste segments ≥ 3:1
- [ ] #16 Aucune valeur CSS brute — tous les tokens Covenant
<!-- AC:END -->
