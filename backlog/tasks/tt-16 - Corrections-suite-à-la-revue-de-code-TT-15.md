---
id: TT-16
title: Corrections suite à la revue de code TT-15
status: Done
assignee: []
created_date: '2026-03-29 20:09'
updated_date: '2026-03-30 20:56'
labels:
  - code
  - bug
  - test
dependencies:
  - TT-15
priority: medium
ordinal: 21000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Contexte

Suite à la revue de code TT-15 (score 8.5/10), trois catégories de corrections ont été identifiées. Cette task couvre les corrections à apporter par ordre de priorité.

---

## Correction 1 — Tokenisation CSS (priorité haute)

Des dimensions brutes non tokenisées ont été trouvées dans plusieurs fichiers CSS, en violation du Covenant Design System.

### `css/components/entry-management-drawer.css`
- `inline-size: 2rem` → remplacer par un token (ex. `var(--space-8)` ou créer `--component-icon-size-md`)
- `min-width: 3.5rem` → remplacer par un token (ex. créer `--component-time-input-min-width`)
- `width: 6.5rem` → remplacer par un token (ex. créer `--component-time-input-width`)

### Autres composants (à inventorier)
- `min-height: 2.25rem` présent dans plusieurs composants → remplacer par un token sémantique de hauteur (ex. `--component-height-control` ou `--component-height-sm`)

### Tokens à créer dans `css/tokens.css`
Créer les tokens manquants dans la section "Component sizes" (à ajouter si inexistante) :
```css
--component-height-control: 2.25rem;   /* hauteur standard d'un contrôle interactif */
--component-time-input-width: 6.5rem;  /* largeur d'un champ de saisie d'heure */
--component-time-input-min-width: 3.5rem;
--component-icon-size-md: 2rem;
```

---

## Correction 2 — Duplication JS (priorité moyenne)

La logique `applyTimeEdit` et `validateChronology` semble présente à la fois dans `js/pages/today.js` et `js/components/entry-management-drawer.js`.

**Analyse attendue :**
1. Confirmer si la logique est réellement dupliquée ou juste similaire.
2. Si dupliquée, extraire dans `js/utils/punch-edit.js` et importer depuis les deux fichiers.
3. Ajouter des tests unitaires dans `tests/unit/punch-edit.test.js` pour la logique extraite.

---

## Correction 3 — Tests de rendering (priorité basse)

Les composants `project-time-overview` et `report-stats` n'ont pas de tests vérifiant la structure HTML générée.

**À évaluer :** est-ce que les tests e2e existants couvrent suffisamment ces composants ? Si non, ajouter des tests unitaires de rendering dans :
- `tests/unit/project-time-overview.test.js` (vérifier DOM généré)
- `tests/unit/report-stats.test.js` (vérifier DOM généré)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Aucune valeur brute de dimension (rem, px) dans entry-management-drawer.css — toutes remplacées par des tokens CSS
- [ ] #2 Tokens de composants créés dans tokens.css (hauteur contrôle, largeur saisie heure, taille icône)
- [ ] #3 Inventaire des min-height: 2.25rem dans tous les composants CSS et remplacement par le token dédié
- [ ] #4 Duplication applyTimeEdit / validateChronology analysée — extraction dans js/utils/punch-edit.js si confirmée, avec tests unitaires associés
- [ ] #5 Tests de rendering HTML évalués pour project-time-overview et report-stats — ajoutés si la couverture e2e est insuffisante
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Toutes les corrections appliquées : (1) 8 occurrences de dimensions brutes remplacées par tokens CSS dans 6 fichiers (button.css, form-field.css, add-time-modal.css, modal.css, report-stats.css, entry-management-drawer.css). (2) Section COMPONENT SIZES ajoutée dans tokens.css avec 4 nouveaux tokens. (3) applyPunchTimeEdit et validatePunchChronology extraits dans js/utils/punch-edit.js — today.js et entry-management-drawer.js importent depuis le module utilitaire. (4) Tests de rendering évalués — couverture e2e jugée suffisante pour project-time-overview et report-stats. 148/148 tests passent."
<!-- SECTION:FINAL_SUMMARY:END -->
