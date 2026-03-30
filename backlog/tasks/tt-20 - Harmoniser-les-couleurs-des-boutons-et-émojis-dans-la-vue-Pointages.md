---
id: TT-20
title: Harmoniser les couleurs des boutons et émojis dans la vue Pointages
status: Done
assignee: []
created_date: '2026-03-30 19:00'
updated_date: '2026-03-30 19:27'
labels:
  - design
  - code
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dans la vue Pointages, il existe des différences de couleur visuellement incohérentes entre les boutons d'action et les émojis utilisés comme indicateurs. Harmoniser selon les tokens du design system Covenant.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Les couleurs des boutons et des émojis/icônes sont cohérentes visuellement
- [x] #2 Toutes les couleurs utilisent des tokens sémantiques du design system (pas de valeurs brutes)
- [x] #3 Le contraste WCAG 2.2 AA est respecté
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Les icônes des 4 boutons d'action Pointage dans `index.html` n'avaient pas d'attribut `data-color`, contrairement aux icônes de la punch-list générée dynamiquement par `createPunchListItem` (qui applique les couleurs depuis `PUNCH_TYPES`).

Fix : ajout de `data-color` sur chaque SVG dans les boutons `.punch-actions__btn`, aligné sur les valeurs de `PUNCH_TYPES` dans `punch-clock.js` : Arrivée→`success`, Pause→`warning`, Reprise→`info`, Départ→`danger`. Les tokens CSS `var(--color-success/warning/info/danger)` sont appliqués via la règle `.icon[data-color="..."]` existante dans `icon.css` — aucune nouvelle CSS ajoutée.
<!-- SECTION:FINAL_SUMMARY:END -->
