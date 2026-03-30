---
id: TT-18
title: Ajouter une favicon à l'application
status: Done
assignee: []
created_date: '2026-03-30 19:00'
updated_date: '2026-03-30 20:56'
labels:
  - design
  - code
dependencies: []
priority: low
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'application n'a pas de favicon. Ajouter une favicon adaptée au thème de l'application (suivi du temps).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Une favicon SVG ou ICO est présente et référencée dans le `<head>` de index.html
- [x] #2 La favicon s'affiche correctement dans l'onglet du navigateur
- [x] #3 La favicon est cohérente avec le design system Covenant
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Création de `favicon.svg` à la racine du projet : icône horloge (même motif que le logo topbar) avec `stroke="#2563eb"` (valeur hardcodée de `--palette-primary-500` — les custom properties CSS ne sont pas résolues dans les favicons hors-document). Référencé dans `index.html` via `<link rel="icon" type="image/svg+xml" href="favicon.svg" />` placé juste après le `<title>`.
<!-- SECTION:FINAL_SUMMARY:END -->
