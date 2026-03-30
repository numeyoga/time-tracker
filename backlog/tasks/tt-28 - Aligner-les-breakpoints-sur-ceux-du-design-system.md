---
id: TT-28
title: Aligner les breakpoints sur ceux du design system
status: Done
assignee: []
created_date: '2026-03-30 22:23'
updated_date: '2026-03-30 22:33'
labels:
  - code
  - design
  - bug
dependencies: []
references:
  - css/components/add-time-modal.css
  - css/layout.css
  - css/tokens.css
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Le design system impose les breakpoints `1439px`, `1279px`, `1023px` et `767px` en approche desktop-first. L'audit a relevé un breakpoint ad hoc à `720px` dans `css/components/add-time-modal.css`.

Remplacer les media queries hors standard par les breakpoints du design system et vérifier que le comportement responsive reste cohérent avec le layout existant.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Aucun breakpoint applicatif n'utilise de valeur hors référentiel design system sans justification documentée
- [x] #2 Les media queries concernées utilisent l'approche `max-width` attendue
- [x] #3 La mise en page du formulaire d'ajout de temps reste correcte aux largeurs desktop, tablette et mobile prévues
- [x] #4 Les tokens de breakpoint définis dans `css/tokens.css` restent la source de vérité du projet
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Remplacement du breakpoint ad hoc `720px` par `767px` dans `css/components/add-time-modal.css`. Le projet n’a plus de media query applicative hors référentiel du design system sur le périmètre audité.
<!-- SECTION:FINAL_SUMMARY:END -->
