---
id: TT-3
title: Gestion des projets (CRUD)
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-27 22:15'
labels:
  - code
  - design
dependencies: []
documentation:
  - Covenant Design System — Skill Guide (covenant-design-system)
  - >-
    Covenant 03-composants.md §2 (Button), §3 (Input/Form Field), §8 (Card), §11
    (Alert)
  - 'Covenant 04-patterns.md §6 (Modals/dialog), §8 (Toasts), §9 (Empty states)'
  - 'Covenant 05-etats-feedback.md §4 (Succès/toasts), §5.2 (Validation inline)'
  - 'Covenant 06-iconographie.md (Lucide SVG sprite, aria patterns)'
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Section "Projets" de la page d'accueil. Gestion CRUD des projets et point d'entrée vers : chronomètre (TT-4), ajout de temps (TT-5), historique (TT-6). Chaque projet est listé avec nom, durée cumulée du jour et boutons d'action iconiques.

---

## Mockup structurel — Composants Covenant

```
<section class="card">                                               ← .card
┌──────────────────────────────────────────────────────────────────────────────┐
│ <header class="card__header">                                               │
│   <h2 class="card__title"> Projets </h2>                                    │
│                                                                              │
│ <div class="card__body">                                                     │
│  ┌─ Toolbar ───────────────────────────────────────────────────────────────┐ │
│  │ .btn[primary] icon-clock       .btn[secondary] icon-plus                │ │
│  │ "Ajouter du temps"             "Ajouter un projet"                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  <ul class="project-list">                                 ← custom BEM     │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │ .project-list__item                                                  │    │
│  │  bbbb              0h 00m   [▶️]  [✏️]  [📅]  [🗑️]                  │    │
│  │  ↑ __name          ↑ __time  .btn ghost sm × 4                       │    │
│  │                              aria-label="[Action] le projet bbbb"    │    │
│  ├──────────────────────────────────────────────────────────────────────┤    │
│  │  nop               0h 00m   [▶️]  [✏️]  [📅]  [🗑️]                  │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ── État vide (.empty-state) si aucun projet ──                              │
│  │ icon-folder  "Aucun projet"                                          │    │
│  │ "Créez votre premier projet pour commencer le suivi."                │    │
└──────────────────────────────────────────────────────────────────────────────┘

── Modale création ── <dialog class="modal">
┌─────────────────────────────────────────┐
│ Ajouter un projet                   [X] │
│ .form-field > .input (nom)              │
│ .form-field__error (si invalide)        │
│           [Annuler]  [Ajouter]          │
│           secondary   primary           │
└─────────────────────────────────────────┘

── Modale renommage ── <dialog class="modal">
┌─────────────────────────────────────────┐
│ Renommer le projet                  [X] │
│ .form-field > .input (nom pré-rempli)   │
│ .form-field__error (si invalide)        │
│           [Annuler]  [Renommer]         │
│           secondary   primary           │
└─────────────────────────────────────────┘

── Modale suppression ── <dialog class="modal">
┌─────────────────────────────────────────┐
│ Supprimer le projet                 [X] │
│ .alert[data-variant="warning"]          │
│ "« bbbb » et ses sessions supprimés"    │
│           [Annuler]  [Supprimer]        │
│           secondary   danger            │
└─────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant               | Usage                                          |
|--------------------------|-------------------------------------------------|
| `.card` / `__header` / `__body` | Conteneur principal                     |
| `.btn` primary           | "Ajouter du temps" (→ modale TT-5)             |
| `.btn` secondary         | "Ajouter un projet" (→ modale création)         |
| `.btn` ghost sm          | Actions par projet (play, pencil, calendar, trash) |
| `.btn` danger            | "Supprimer" dans modale confirmation            |
| `<dialog>` / `.modal`   | Modales création, renommage, suppression        |
| `.form-field` + `.input` | Champ nom dans les modales                      |
| `.alert` warning         | Avertissement dans modale suppression           |
| `.empty-state`           | Aucun projet (pattern 04 §9)                    |

## Composant custom

| Composant               | Rôle                              | Fichier CSS                       |
|--------------------------|----------------------------------|-----------------------------------|
| `.project-list`          | Liste des projets                | `css/components/project-list.css` |
| `.project-list__item`    | Ligne projet                     | (inclus)                          |
| `.project-list__name`    | Nom (tronqué si overflow)        | (inclus)                          |
| `.project-list__time`    | Durée cumulée jour               | (inclus)                          |
| `.project-list__actions` | Groupe boutons alignés à droite  | (inclus)                          |

## Icônes Lucide

| Concept          | Icône        | Symbol ID        |
|------------------|--------------|------------------|
| Ajouter temps    | `clock`      | `icon-clock`     |
| Ajouter projet   | `plus`       | `icon-plus`      |
| Démarrer chrono  | `play`       | `icon-play`      |
| Renommer         | `pencil`     | `icon-pencil`    |
| Historique       | `calendar`   | `icon-calendar`  |
| Supprimer        | `trash-2`    | `icon-trash`     |
| Fermer modale    | `x`          | `icon-x`         |
| État vide        | `folder`     | `icon-folder`    |

## Flux d'interactions

**Création** : Clic "Ajouter un projet" → `<dialog>` → saisie nom → validation (non vide, unique insensible à la casse) → persist localStorage → toast success

**Renommage** : Clic icône crayon → `<dialog>` avec input pré-rempli → mêmes validations → maj nom dans projets + sessions → toast success

**Suppression** : Clic icône poubelle → `<dialog>` confirmation avec `.alert` warning → arrête le chronomètre si actif → supprime projet + sessions → toast success

## Structure localStorage

```js
// Clé : 'time-tracker-projects'
[{ id: "proj_xxx", name: "Mon projet", createdAt: "ISO-8601" }]
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Conteneur : `<section class="card">` avec `.card__header` (titre 'Projets') et `.card__body` (toolbar + liste)
- [ ] #2 Toolbar : 2 boutons pleine largeur — 'Ajouter du temps' `.btn[data-variant="primary"]` (icon-clock, → TT-5) et 'Ajouter un projet' `.btn[data-variant="secondary"]` (icon-plus)
- [ ] #3 Clic 'Ajouter un projet' ouvre `<dialog>` modale avec `.form-field` + `.input` pour saisir le nom
- [ ] #4 Validation nom : non vide, pas uniquement des espaces, unique insensible à la casse — `.form-field__error` + `aria-invalid` si invalide, bouton 'Ajouter' `:disabled` tant qu'invalide
- [ ] #5 Liste `.project-list` : chaque `.project-list__item` affiche nom (tronqué si overflow), durée jour (Xh Xm), 4 boutons `.btn[data-variant="ghost"][data-size="sm"]`
- [ ] #6 Boutons d'action avec `aria-label` contextuel : Play (`icon-play`, → TT-4), Crayon (`icon-pencil`), Calendrier (`icon-calendar`, → TT-6), Poubelle (`icon-trash`)
- [ ] #7 Renommage via `<dialog>` : input pré-rempli, mêmes validations que création, met à jour le nom dans projets et sessions associées
- [ ] #8 Suppression via `<dialog>` confirmation : `.alert[data-variant="warning"]` avec nom du projet et conséquence, bouton `.btn[data-variant="danger"]`, arrête le chrono si actif
- [ ] #9 État vide Covenant (pattern 04 §9) quand aucun projet : icône icon-folder, titre, description, bouton création
- [ ] #10 Ordre stable par `createdAt`, persistance localStorage avec `id` (crypto.randomUUID()), `name`, `createdAt`
- [ ] #11 Toasts success après chaque action CRUD (création, renommage, suppression)
- [ ] #12 Tokens CSS Covenant exclusifs, sélecteurs JS via `data-js-*`, focus visible, cibles ≥ 24×24 px, WCAG 2.2 AA
<!-- AC:END -->
