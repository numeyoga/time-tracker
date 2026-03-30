---
id: TT-24
title: Remplacer les tokens primitifs et couleurs brutes par des tokens sémantiques
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
  - css/components/modal.css
  - css/components/project-history-drawer.css
  - css/components/punch-list.css
  - css/components/add-time-modal.css
  - css/components/report-stats.css
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'audit du design system a relevé plusieurs violations de la couche de tokens :

- usage direct de couleurs brutes dans le CSS applicatif (`rgb(...)`)
- usage direct de tokens primitifs `--palette-*`
- usage direct de tokens d'espacement `--space-*` dans des composants au lieu de tokens sémantiques dédiés

Corriger ces écarts pour que le CSS applicatif et les composants ne consomment que la couche sémantique autorisée par le design system.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Aucun composant CSS applicatif ne référence directement `--palette-*`
- [x] #2 Aucune couleur brute (`#...`, `rgb(...)`, `hsl(...)`) ne reste dans le CSS applicatif
- [x] #3 Les espacements consommés par les composants passent par des tokens sémantiques cohérents avec le design system
- [x] #4 Les overlays/backdrops et focus rings conservent un rendu visuel équivalent après migration des tokens
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Ajout de dimensions sémantiques (`--size-*`), d’un token de backdrop (`--color-overlay-backdrop`) et d’un token de focus ring (`--shadow-focus-ring`) dans `css/tokens.css`. Migration des composants concernés pour supprimer les références directes à `--palette-*`, `--space-*` et aux couleurs brutes dans le CSS applicatif.
<!-- SECTION:FINAL_SUMMARY:END -->
