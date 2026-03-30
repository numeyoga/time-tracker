---
id: TT-25
title: Remplacer les sélecteurs JS basés sur les classes par des hooks data-js
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
  - js/components/entry-management-drawer.js
  - js/components/project-history-drawer.js
  - js/pages/today.js
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Le design system impose l'utilisation exclusive de hooks `data-js-*` pour les requêtes DOM et interdit l'usage des classes CSS comme sélecteurs JS ou support d'état structurel.

L'audit a relevé plusieurs accès encore basés sur des classes de style (`.entry-management__item-main`, `.entry-management__item-label`, `.punch-list__time-input`, `.punch-list__label`, etc.). Il faut introduire les hooks `data-js-*` nécessaires dans le markup rendu et migrer les composants JS vers ces hooks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Les requêtes DOM du code applicatif n'utilisent plus de classes CSS comme sélecteurs fonctionnels
- [x] #2 Les éléments dynamiques concernés exposent des attributs `data-js-*` explicites
- [x] #3 Les comportements d'édition inline, suppression et focus continuent de fonctionner après migration
- [x] #4 Aucune classe CSS n'est ajoutée ou manipulée uniquement pour servir de hook JS
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Ajout de hooks `data-js-*` pour les labels et wrappers des listes de pointages, puis migration des sélecteurs JS de `today.js` et `entry-management-drawer.js` vers ces hooks. Suppression des derniers usages de `classList` utilitaires dans les états vides générés par JS.
<!-- SECTION:FINAL_SUMMARY:END -->
