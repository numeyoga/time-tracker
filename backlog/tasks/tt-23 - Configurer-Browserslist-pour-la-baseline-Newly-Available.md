---
id: TT-23
title: Configurer Browserslist pour la baseline Newly Available
status: Done
assignee: []
created_date: '2026-03-30 22:23'
updated_date: '2026-03-30 20:56'
labels:
  - code
  - design
dependencies: []
references:
  - package.json
  - AGENTS.md
priority: medium
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Le design system impose une compatibilité Web Platform Baseline "Newly Available" avec downstream, mais `package.json` ne déclare actuellement aucune configuration `browserslist`.

Ajouter la configuration attendue dans le projet afin d'aligner explicitement l'outillage et la cible navigateur sur les exigences du design system.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `package.json` contient une configuration `browserslist` alignée sur `baseline newly available with downstream`
- [x] #2 La configuration est documentée de manière cohérente avec la cible Chromium du projet
- [x] #3 Aucun autre fichier du projet ne contredit cette baseline de compatibilité
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Ajout de `browserslist` dans `package.json` avec la cible `baseline newly available with downstream`. La configuration devient explicite et alignée avec l’exigence du design system.
<!-- SECTION:FINAL_SUMMARY:END -->
