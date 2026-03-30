---
id: TT-27
title: Rétablir une hiérarchie de titres conforme avec un seul h1
status: Done
assignee: []
created_date: '2026-03-30 22:23'
updated_date: '2026-03-30 22:33'
labels:
  - code
  - design
  - accessibility
dependencies: []
references:
  - index.html
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'audit HTML a relevé l'absence de `<h1>` dans la page principale alors que le design system impose un seul `<h1>` par page et une hiérarchie de titres sans saut de niveau.

Revoir l'en-tête de page et les titres des sections/cartes pour réintroduire une hiérarchie sémantique correcte sans dégrader la présentation visuelle existante.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La page contient exactement un `<h1>` visible ou sémantiquement correct
- [x] #2 La hiérarchie des titres est cohérente entre l'en-tête de page, les sections et les dialogues
- [x] #3 La modification n'altère pas le layout ni les styles attendus des cartes et headers
- [x] #4 Les lecteurs d'écran bénéficient d'une structure de navigation plus claire
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Ajout d’un `h1` de page dans l’en-tête principal (`Aujourd'hui`) et d’un style minimal `.page__title` pour préserver le layout existant. La page a désormais un seul titre de niveau 1, avec les sections conservées en `h2`.
<!-- SECTION:FINAL_SUMMARY:END -->
