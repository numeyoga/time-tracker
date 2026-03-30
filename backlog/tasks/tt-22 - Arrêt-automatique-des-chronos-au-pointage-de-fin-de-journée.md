---
id: TT-22
title: Arrêt automatique des chronos au pointage de fin de journée
status: Done
assignee: []
created_date: '2026-03-30 19:00'
updated_date: '2026-03-30 19:09'
labels:
  - code
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Quand l'utilisateur pointe la fin de journée (départ le soir), tous les chronos actifs doivent s'arrêter automatiquement. Cela évite que des chronos continuent de tourner indéfiniment après la fin de la session de travail.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Au pointage 'fin de journée', tous les chronos actifs sont arrêtés automatiquement
- [x] #2 Les durées finales sont correctement enregistrées dans localStorage au moment de l'arrêt
- [x] #3 Un chrono arrêté de cette façon ne reprend pas automatiquement le lendemain (comportement explicite requis)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implémenté dans `js/pages/today.js`. Au `DEPART` (état `DEPARTED`) : `stopAllActiveSessions()` est appelé avant `refreshAll()`. `clearPausedProjects()` est aussi appelé pour éviter une reprise automatique intempestive. Les durées sont calculées et persistées dans localStorage au moment de l'arrêt par `stopAllActiveSessions()`.
<!-- SECTION:FINAL_SUMMARY:END -->
