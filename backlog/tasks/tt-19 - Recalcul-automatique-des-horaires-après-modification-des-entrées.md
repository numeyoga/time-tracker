---
id: TT-19
title: Recalcul automatique des horaires après modification des entrées
status: Done
assignee: []
created_date: '2026-03-30 19:00'
updated_date: '2026-03-30 20:56'
labels:
  - bug
  - code
dependencies: []
priority: high
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Quand l'utilisateur modifie des entrées via le bouton "Gérer les entrées", les horaires affichés (totaux, durées, récapitulatifs) ne sont pas recalculés automatiquement. L'utilisateur doit recharger la page pour voir les valeurs à jour.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Toute modification (ajout, édition, suppression) d'une entrée déclenche immédiatement un recalcul des horaires affichés
- [x] #2 Aucun rechargement de page n'est nécessaire
- [x] #3 Le recalcul est réactif : l'UI reflète l'état exact du localStorage après chaque opération
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
La cause racine était que `refreshAll()` dans `js/pages/today.js` ne rappelait pas `renderPunchClock`. Le callback `onChange` passé à `openEntryManagementDrawer` appelait `refreshAll`, mais le punch clock (métriques, barre de progression, liste des pointages) n'était pas inclus.

Fix : ajout de `renderPunchClock(getTodayEntry(), clockRoot)` en première ligne de `refreshAll`. `clockRoot` est déjà dans la closure (défini plus tôt dans `initTodayPage`). Désormais tout ajout, édition ou suppression via "Gérer les entrées" met à jour instantanément l'affichage du punch clock sans rechargement.
<!-- SECTION:FINAL_SUMMARY:END -->
