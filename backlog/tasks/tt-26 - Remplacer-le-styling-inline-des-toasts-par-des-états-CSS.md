---
id: TT-26
title: Remplacer le styling inline des toasts par des états CSS
status: Done
assignee: []
created_date: '2026-03-30 22:23'
updated_date: '2026-03-30 20:56'
labels:
  - code
  - design
  - bug
dependencies: []
references:
  - js/components/toast.js
  - css/components/toast.css
  - index.html
priority: medium
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Le composant toast applique actuellement des styles inline en JavaScript pour piloter sa disparition (`opacity`, `transform`, `transition`). Le design system demande de piloter les états visuels via CSS et attributs `data-*`/ARIA plutôt que via `.style`.

Refactorer le composant toast pour déplacer ces états dans la feuille de style du composant et faire porter au JavaScript uniquement les changements d'état nécessaires.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `js/components/toast.js` ne modifie plus les styles inline pour l'animation ou la fermeture
- [ ] #2 Les états visuels du toast sont pilotés par CSS via classes structurelles existantes ou attributs `data-*`
- [ ] #3 Les transitions continuent de respecter `prefers-reduced-motion`
- [ ] #4 Le comportement fonctionnel reste inchangé pour les toasts succès, erreur, warning et info
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
<!-- SECTION:FINAL_SUMMARY:BEGIN -->
<!-- SECTION:FINAL_SUMMARY:END -->
<!-- SECTION:FINAL_SUMMARY:END -->

<!-- SECTION:FINAL_SUMMARY:END -->
