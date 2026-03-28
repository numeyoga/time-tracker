---
id: TT-12
title: Export des sessions en JSON
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
updated_date: '2026-03-28 21:36'
labels:
  - code
  - design
dependencies: []
references:
  - Covenant 04-patterns.md §6 (Modal)
  - Covenant 03-composants.md §3 (Input/Form field)
  - Covenant 03-composants.md §12 (Alert)
  - Covenant 05-etats-feedback.md §4 (Erreur validation)
priority: low
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modal « Exporter les sessions » accessible via le bouton « Export » dans le header. Permet d'exporter les données (pointages + sessions projets) sur une plage de dates au format JSON.

## Mockup — Modal Export

```
┌─ dialog.modal ──────────────────────────────────────┐
│ .modal__header                                       │
│  h3 "Exporter les sessions"           [btn ghost]    │
│                                        icon-x       │
│ .modal__body                                         │
│                                                      │
│  .form-field                                         │
│   label "Date de début"                              │
│   input.input[type=date]                             │
│    (pré-rempli : lundi semaine courante)             │
│                                                      │
│  .form-field                                         │
│   label "Date de fin"                                │
│   input.input[type=date]                             │
│    (pré-rempli : dimanche semaine courante)          │
│                                                      │
│  .form-field__error                                  │
│   "La date de fin doit être ≥ date de début"         │
│   (affiché si validation échoue)                     │
│                                                      │
│  .alert[data-variant="info"]                         │
│   icon-info                                          │
│   "Les pointages et sessions projets de la période   │
│    seront exportés au format JSON."                  │
│                                                      │
│ .modal__footer                                       │
│  [btn secondary "Annuler"]                           │
│  [btn danger icon-download "Exporter"]               │
│   (disabled si formulaire invalide)                  │
└──────────────────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Modal | `<dialog class="modal">` | 04-patterns §6 |
| Form field | `.form-field` + `.input` | 03-composants §3 |
| Erreur validation | `.form-field__error` | 05-etats-feedback §4 |
| Alert info | `.alert` `data-variant="info"` | 03-composants §12 |
| Bouton export | `.btn` `data-variant="danger"` | 03-composants §2 |
| Bouton annuler | `.btn` `data-variant="secondary"` | 03-composants §2 |
| Toast succès | `.toast` `data-variant="success"` | 04-patterns §8 |

## Icônes Lucide

| Usage | Icône | Symbole |
|-------|-------|---------|
| Bouton header | `upload` | `icon-upload` |
| Bouton exporter | `download` | `icon-download` |
| Fermer modal | `x` | `icon-x` |
| Alert info | `info` | `icon-info` |

## Validation

| Règle | Message d'erreur |
|-------|-----------------|
| Date début requise | « Date de début requise » |
| Date fin requise | « Date de fin requise » |
| Date fin ≥ date début | « La date de fin doit être ≥ date de début » |

## Structure JSON exportée

```json
{
  "version": 1,
  "exportDate": "2026-03-28T10:00:00Z",
  "range": { "start": "2026-03-23", "end": "2026-03-29" },
  "punches": [
    {
      "date": "2026-03-28",
      "entries": [
        { "type": "arrival", "time": "09:00" },
        { "type": "break_start", "time": "12:30" },
        { "type": "break_end", "time": "13:30" },
        { "type": "departure", "time": "17:30" }
      ]
    }
  ],
  "projects": [
    { "id": "...", "name": "Projet Alpha" }
  ],
  "sessions": [
    {
      "projectId": "...",
      "date": "2026-03-28",
      "start": "09:00",
      "end": "12:30",
      "status": "completed"
    }
  ]
}
```

## Comportement

1. Clic « Export » header → `modal.showModal()`
2. Dates pré-remplies : lundi → dimanche de la semaine courante
3. Validation temps réel des dates
4. Clic « Exporter » → construction JSON → `URL.createObjectURL(blob)` → `<a download>` → clic programmatique
5. Nom fichier : `time-tracker-export-YYYY-MM-DD-YYYY-MM-DD.json`
6. Toast succès « Export téléchargé »
7. Fermeture modale
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Modal ouverte via bouton « Export » dans le header avec `<dialog>.showModal()`
- [ ] #2 Champs date début et date fin avec `.form-field` + `input[type=date]`
- [ ] #3 Dates pré-remplies : lundi et dimanche de la semaine courante
- [ ] #4 Validation temps réel : date fin ≥ date début, `.form-field__error` sinon
- [ ] #5 Bouton Exporter `disabled` tant que le formulaire est invalide
- [ ] #6 Alert info expliquant le contenu de l'export
- [ ] #7 Génération JSON structuré avec version, plage, pointages, projets et sessions
- [ ] #8 Téléchargement via `URL.createObjectURL` + `<a download>`
- [ ] #9 Nom fichier : `time-tracker-export-YYYY-MM-DD-YYYY-MM-DD.json`
- [ ] #10 Toast succès après téléchargement
- [ ] #11 Modal fermable via bouton X, Annuler, Escape, clic backdrop
- [ ] #12 Aucune valeur CSS brute — tous les tokens Covenant
<!-- AC:END -->
