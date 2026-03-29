---
id: TT-5
title: Ajout manuel de temps sur un projet
status: Done
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-29 13:11'
labels:
  - code
  - design
dependencies:
  - TT-3
documentation:
  - Covenant Design System — Skill Guide (covenant-design-system)
  - >-
    Covenant 03-composants.md §2 (Button), §3 (Input/Form Field), §5 (Select),
    §6 (Radio)
  - >-
    Covenant 04-patterns.md §4 (Forms create/edit), §6 (Modals/dialog), §8
    (Toasts)
  - Covenant 05-etats-feedback.md §5.2 (Validation inline)
  - Covenant 06-iconographie.md (Lucide SVG sprite)
priority: medium
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modale "Ajouter du temps" permettant de saisir manuellement une session de travail sur un projet. Accessible via le bouton "Ajouter du temps" (`.btn[data-variant="primary"]`) dans la toolbar de la section Projets (TT-3). Formulaire avec sélection projet, date, heure de début, et choix entre durée ou heure de fin.

---

## Mockup structurel — Composants Covenant

```
── <dialog class="modal"> ──────────────────────────────────────── ← <dialog> natif
┌────────────────────────────────────────────────────────────────┐
│ <header class="modal__header">                                  │
│   <h2 class="modal__title">Ajouter du temps</h2>               │
│   <button class="btn" data-variant="ghost" aria-label="Fermer"> │
│     icon-x                                                      │
│   </button>                                                     │
│                                                                  │
│ <div class="modal__body">                                       │
│                                                                  │
│   <form class="form" data-js-add-time-form>                     │
│                                                                  │
│   ┌─ .form-field ────────────────────────────────────────────┐  │
│   │ <label> Projet </label>                                   │  │
│   │ <div class="select-wrapper">                              │  │
│   │   <select class="select" required>          ← .select    │  │
│   │     <option value="">Choisir un projet…</option>          │  │
│   │     <option value="proj_xxx">bbbb</option>                │  │
│   │     <option value="proj_yyy">nop</option>                 │  │
│   │   </select>                                               │  │
│   │ </div>                                                    │  │
│   │ .form-field__error (si non sélectionné)                   │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌─ .form-field ────────────────────────────────────────────┐  │
│   │ <label> Date </label>                                     │  │
│   │ <input class="input" type="date" value="2026-03-27">     │  │
│   │ .form-field__error (si invalide)                          │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌─ .form-field ────────────────────────────────────────────┐  │
│   │ <label> Heure de début </label>                           │  │
│   │ <input class="input" type="time" value="09:00">          │  │
│   │ .form-field__error (si invalide)                          │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌─ Radio group ────────────────────────────────────────────┐  │
│   │ <fieldset>                                                │  │
│   │   <legend> Durée ou heure de fin </legend>                │  │
│   │   <label class="radio">                                   │  │
│   │     <input class="radio__input" type="radio"              │  │
│   │            name="mode" value="duration" checked>          │  │
│   │     <span class="radio__label">Durée</span>              │  │
│   │   </label>                                                │  │
│   │   <label class="radio">                                   │  │
│   │     <input class="radio__input" type="radio"              │  │
│   │            name="mode" value="end-time">                  │  │
│   │     <span class="radio__label">Heure de fin</span>       │  │
│   │   </label>                                                │  │
│   │ </fieldset>                                               │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌─ Mode "Durée" (visible si radio=duration) ───────────────┐  │
│   │ .form-field                                               │  │
│   │ <label> Durée </label>                                    │  │
│   │ <div class="input-group">                    ← .input-grp │  │
│   │   <input class="input" type="number" min="0"              │  │
│   │          max="23" value="1" style="width:5rem">           │  │
│   │   <span class="input-group__addon">h</span>              │  │
│   │   <input class="input" type="number" min="0"              │  │
│   │          max="59" value="0" style="width:5rem">           │  │
│   │   <span class="input-group__addon">min</span>            │  │
│   │ </div>                                                    │  │
│   │ .form-field__error (si durée = 0)                         │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌─ Mode "Heure de fin" (visible si radio=end-time) ────────┐  │
│   │ .form-field                                               │  │
│   │ <label> Heure de fin </label>                             │  │
│   │ <input class="input" type="time">                         │  │
│   │ .form-field__error (si ≤ heure de début)                  │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│   </form>                                                       │
│                                                                  │
│ <footer class="modal__footer">                                  │
│   <button class="btn" data-variant="secondary">Annuler</button>│
│   <button class="btn" data-variant="primary"                    │
│           :disabled="invalide">Ajouter</button>                 │
│ </footer>                                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## Composants Covenant utilisés

| Composant                    | Usage                                      |
|------------------------------|--------------------------------------------|
| `<dialog>` / `.modal`       | Conteneur modale (focus trap, Escape, backdrop) |
| `.modal__header/body/footer` | Structure de la modale                     |
| `.form-field` + `.input`     | Champs date et heure de début              |
| `.select-wrapper` + `.select`| Dropdown sélection projet                  |
| `.radio` + `.radio__input`   | Choix Durée / Heure de fin                 |
| `.input-group` + `__addon`   | Saisie durée (h + min) avec suffixes       |
| `.btn` primary               | "Ajouter" (`:disabled` si formulaire invalide) |
| `.btn` secondary             | "Annuler"                                  |
| `.btn` ghost                 | Bouton fermer (icon-x)                     |
| `.form-field__error`         | Messages d'erreur inline                   |

## Icônes Lucide

| Concept         | Icône    | Symbol ID     |
|-----------------|----------|---------------|
| Ajouter temps   | `clock`  | `icon-clock`  |
| Fermer modale   | `x`      | `icon-x`      |

---

## Règles de validation

| Champ            | Règle                                                    | Message d'erreur                           |
|------------------|----------------------------------------------------------|--------------------------------------------|
| Projet           | Sélection obligatoire (pas l'option vide)                | "Veuillez sélectionner un projet"          |
| Date             | Date valide, pas dans le futur                           | "Date invalide"                            |
| Heure de début   | Requis, format valide                                    | "Heure de début requise"                   |
| Durée (h)        | Entier ≥ 0, ≤ 23                                        | "Heures entre 0 et 23"                     |
| Durée (min)      | Entier ≥ 0, ≤ 59                                        | "Minutes entre 0 et 59"                    |
| Durée totale     | h + min > 0                                              | "La durée doit être supérieure à 0"        |
| Heure de fin     | > heure de début                                         | "L'heure de fin doit être après le début"  |
| Bornes pointage  | Si pointage existe ce jour : session dans [arrivée, départ] | "La session dépasse les bornes de la journée" |

Toutes les validations sont **temps réel** (à chaque changement d'input). Le bouton "Ajouter" est `:disabled` tant qu'une règle est violée. Les champs invalides portent `aria-invalid="true"` + `aria-describedby` vers `.form-field__error[role="alert"]`.

---

## Comportement à la soumission

1. Calcul de `endedAt` selon le mode :
   - Mode durée : `startedAt + (h * 3600000 + min * 60000)`
   - Mode heure de fin : directement la valeur saisie
2. Création d'une session dans localStorage (même format que TT-4) avec `endedAt` et `duration` renseignés
3. Fermeture de la modale
4. Toast success : "Temps ajouté sur « [projet] »"
5. Mise à jour immédiate : durée dans `.project-list__item`, section temps passé (TT-7), timeline (TT-8)

---

## Valeurs par défaut à l'ouverture

| Champ          | Valeur par défaut                              |
|----------------|------------------------------------------------|
| Projet         | Option vide "Choisir un projet…"               |
| Date           | Aujourd'hui                                    |
| Heure de début | 09:00                                          |
| Mode           | "Durée" sélectionné                            |
| Durée          | 1h 0min                                        |
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Modale `<dialog>` ouverte via bouton 'Ajouter du temps' `.btn[data-variant="primary"]` (icon-clock) dans la toolbar projets (TT-3)
- [ ] #2 Structure modale Covenant : `.modal__header` (titre + btn fermer icon-x), `.modal__body` (formulaire), `.modal__footer` (Annuler secondary + Ajouter primary)
- [ ] #3 Champ Projet : `.select-wrapper` > `.select` avec `required`, liste dynamique des projets existants, option vide par défaut
- [ ] #4 Champ Date : `.form-field` > `.input[type="date"]`, défaut = aujourd'hui
- [ ] #5 Champ Heure de début : `.form-field` > `.input[type="time"]`, défaut = 09:00
- [ ] #6 Radio group dans `<fieldset>/<legend>` : `.radio` 'Durée' (checked par défaut) et `.radio` 'Heure de fin'
- [ ] #7 Mode Durée : `.input-group` avec 2 `.input[type="number"]` (h: 0-23, min: 0-59) + `.input-group__addon` ('h', 'min'), défaut 1h 0min
- [ ] #8 Mode Heure de fin : `.input[type="time"]`, affiché uniquement quand le radio correspondant est sélectionné
- [ ] #9 Validation temps réel : projet sélectionné, durée > 0 ou heure fin > heure début, session dans les bornes du pointage si existant
- [ ] #10 Champs invalides : `aria-invalid="true"` + `aria-describedby` vers `.form-field__error[role="alert"]` avec message spécifique
- [ ] #11 Bouton 'Ajouter' `:disabled` tant que le formulaire est invalide
- [ ] #12 Soumission : création session localStorage (même format TT-4 avec `endedAt` et `duration` renseignés), fermeture modale, toast success
- [ ] #13 Mise à jour immédiate de l'UI après ajout : durée projet (TT-3), temps passé (TT-7), timeline (TT-8)
- [ ] #14 Fermeture modale via bouton X, bouton Annuler, touche Escape, ou clic backdrop — aucune donnée persistée
- [ ] #15 Tokens CSS Covenant exclusifs, sélecteurs JS via `data-js-*`, focus visible, cibles ≥ 24×24 px, WCAG 2.2 AA
<!-- AC:END -->
