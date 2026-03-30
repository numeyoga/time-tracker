---
id: TT-21
title: Arrêt et reprise automatiques des chronos lors des pauses
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
Quand l'utilisateur pointe une pause (départ en pause), tous les chronos actifs doivent s'arrêter automatiquement. Au retour de pause (pointage retour), les chronos doivent reprendre automatiquement.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Au pointage 'départ pause', tous les chronos en cours sont mis en pause automatiquement
- [x] #2 Au pointage 'retour pause', les chronos reprennent automatiquement depuis leur état sauvegardé
- [x] #3 L'état des chronos est persisté dans localStorage pour survie au rechargement
- [x] #4 Aucune interaction manuelle supplémentaire n'est requise de l'utilisateur
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implémenté dans `js/storage/sessions.js` (ajout de `savePausedProjects`, `getPausedProjects`, `clearPausedProjects`) et `js/pages/today.js` (handler `initPunchClockListeners`).

Au `START_BREAK` : les `projectId` actifs sont sauvegardés dans localStorage (`time-tracker-paused-project-ids`), puis `stopAllActiveSessions()` est appelé. Au `END_BREAK` : les IDs sauvegardés sont relus, filtrés par existence du projet, et une nouvelle session est démarrée pour chacun. La clé est effacée dans les deux cas.
<!-- SECTION:FINAL_SUMMARY:END -->
