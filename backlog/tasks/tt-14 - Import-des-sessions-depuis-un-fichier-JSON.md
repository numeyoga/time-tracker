---
id: TT-14
title: Import des sessions depuis un fichier JSON
status: Done
assignee: []
created_date: '2026-03-27 22:01'
updated_date: '2026-03-29 19:41'
labels:
  - code
  - design
dependencies:
  - TT-12
references:
  - Covenant 04-patterns.md §6 (Modal)
  - Covenant 03-composants.md §9 (Data Table)
  - Covenant 03-composants.md §12 (Alert)
  - Covenant 04-patterns.md §8 (Toast)
priority: low
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modal « Importer des sessions » accessible via le bouton « Import » dans le header (à côté d'Export). Charge un fichier JSON exporté par TT-12 pour remplacer toutes les données actuelles (reset then load).

## Mockup — Modal Import

```
┌─ dialog.modal ──────────────────────────────────────────┐
│ .modal__header                                           │
│  h3 "Importer des sessions"             [btn ghost]      │
│                                          icon-x         │
│ .modal__body                                             │
│                                                          │
│  .alert[data-variant="warning"]                          │
│   icon-alert-triangle                                    │
│   "L'import remplacera TOUTES les données actuelles.     │
│    Cette action est irréversible."                       │
│                                                          │
│  ── Zone de sélection fichier ──                        │
│  .import-dropzone                                        │
│   (border: dashed var(--color-border-default))           │
│   (border-radius: var(--radius-md))                      │
│   (padding: var(--padding-xl))                           │
│   (text-align: center)                                   │
│                                                          │
│   icon-upload-cloud (--text-3xl --color-text-muted)      │
│   p "Glissez un fichier JSON ou"                        │
│   [btn secondary sm "Parcourir…"]                        │
│   input[type=file][accept=".json"][hidden]               │
│                                                          │
│  ── Fichier sélectionné ──                              │
│  .import-file (affiché après sélection)                  │
│   icon-file-json                                         │
│   span "time-tracker-export-2026-03-23-2026-03-29.json"  │
│   span "12.4 Ko"                                         │
│   [btn ghost sm icon-x] (retirer fichier)                │
│                                                          │
│  ── Erreur validation fichier ──                        │
│  .alert[data-variant="danger"]                           │
│   icon-alert-circle                                      │
│   "Structure du fichier non reconnue"                    │
│   (affiché si validation échoue)                         │
│                                                          │
│  ── Aperçu contenu ──                                   │
│  .import-preview (affiché si fichier valide)             │
│   .data-table data-size="sm"                             │
│   ┌──────────────────────────────────────────┐           │
│   │ Période  │ 23/03/2026 – 29/03/2026      │           │
│   │ Projets  │ 3                              │           │
│   │ Sessions │ 24                             │           │
│   │ Pointages│ 5 jours                        │           │
│   └──────────────────────────────────────────┘           │
│                                                          │
│ .modal__footer                                           │
│  [btn secondary "Annuler"]                               │
│  [btn danger icon-upload "Importer"]                     │
│   (disabled tant que fichier non validé)                 │
└──────────────────────────────────────────────────────────┘

── Modal confirmation (2ème étape) ──
┌─ dialog.modal ──────────────────────────────┐
│ .modal__header                               │
│  h3 "Confirmer l'import"                     │
│ .modal__body                                 │
│  icon-alert-triangle (--color-danger, 48px)  │
│  p "Toutes les données actuelles seront      │
│     définitivement remplacées."              │
│  p "Voulez-vous continuer ?"                 │
│ .modal__footer                               │
│  [btn secondary "Annuler"]                   │
│  [btn danger "Confirmer l'import"]           │
└──────────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Modal | `<dialog class="modal">` | 04-patterns §6 |
| Alert warning | `.alert` `data-variant="warning"` | 03-composants §12 |
| Alert danger | `.alert` `data-variant="danger"` | 03-composants §12 |
| Data table aperçu | `.data-table` `data-size="sm"` | 03-composants §9 |
| Bouton import | `.btn` `data-variant="danger"` | 03-composants §2 |
| Bouton parcourir | `.btn` `data-variant="secondary"` `data-size="sm"` | 03-composants §2 |
| Toast feedback | `.toast` success/danger | 04-patterns §8 |

## Composant custom `.import-dropzone` (tokens Covenant)

| Propriété | Token |
|-----------|-------|
| border | `2px dashed var(--color-border-default)` |
| border-radius | `var(--radius-md)` |
| padding | `var(--padding-xl)` |
| background hover/dragover | `var(--color-bg-subtle)` |
| transition | `var(--duration-fast)` |

## Icônes Lucide

| Usage | Icône | Symbole |
|-------|-------|---------|
| Bouton header | `download` | `icon-download` |
| Zone drop | `upload-cloud` | `icon-upload-cloud` |
| Fichier sélectionné | `file-json` | `icon-file-json` |
| Retirer fichier | `x` | `icon-x` |
| Alert warning | `alert-triangle` | `icon-alert-triangle` |
| Alert erreur | `alert-circle` | `icon-alert-circle` |
| Bouton importer | `upload` | `icon-upload` |

## Validation fichier (TT-13)

1. Extension `.json`
2. `JSON.parse()` réussit
3. Champ `version` présent et supporté
4. Structure conforme : `punches[]`, `projects[]`, `sessions[]` présents
5. Chaque entrée a les champs obligatoires

## Comportement

1. Sélection fichier (clic ou drag & drop)
2. Parsing + validation structure → aperçu ou erreur
3. Clic « Importer » → modal de confirmation (2ème dialog)
4. Confirmer → `localStorage.clear()` → écriture des données importées → rechargement UI
5. Toast succès « Données importées avec succès (N sessions, N jours) »
6. En cas d'erreur pendant l'écriture : rollback, toast danger
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bouton « Import » dans le header (à côté d'Export) ouvre la modal via `<dialog>.showModal()`
- [ ] #2 Alert warning visible immédiatement : « L'import remplacera TOUTES les données »
- [ ] #3 Zone de drop `.import-dropzone` avec drag & drop + bouton « Parcourir »
- [ ] #4 Input file caché `accept=".json"` déclenché par le bouton Parcourir
- [ ] #5 Fichier sélectionné affiché avec nom + taille + bouton retirer
- [ ] #6 Validation automatique du fichier : JSON valide, structure conforme, version compatible
- [ ] #7 Alert danger si fichier invalide avec message d'erreur précis
- [ ] #8 Aperçu du contenu si fichier valide : période, nombre projets/sessions/jours
- [ ] #9 Bouton Importer `disabled` tant que fichier non validé
- [ ] #10 Modal de confirmation avant écrasement : 2ème `<dialog>` avec message explicite
- [ ] #11 Import effectue `localStorage.clear()` puis écriture des données importées
- [ ] #12 Après import réussi : UI rafraîchie + toast succès avec compteurs
- [ ] #13 En cas d'erreur pendant écriture : rollback, aucune donnée modifiée, toast danger
- [ ] #14 Données importées immédiatement fonctionnelles (pointages, projets, sessions)
- [ ] #15 Modal fermable via bouton X, Annuler, Escape, clic backdrop
- [ ] #16 Aucune valeur CSS brute — tous les tokens Covenant
<!-- AC:END -->
