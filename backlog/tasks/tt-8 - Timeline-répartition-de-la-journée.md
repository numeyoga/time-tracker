---
id: TT-8
title: Timeline répartition de la journée
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies:
  - TT-2
  - TT-4
priority: medium
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Barre horizontale chronologique "Répartition de la journée" montrant visuellement comment la journée a été occupée entre l'arrivée et le départ. Segments colorés par type d'activité : projet (couleur dédiée), pause (orange), inactif (gris), multi-projet (vert).

Principes UX :
- Barre proportionnelle entre heure d'arrivée et heure de départ
- Couleurs distinctes par projet et par état
- Heures de début et fin affichées sous la barre
- Bouton copier (clipboard) pour copier la répartition
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Barre horizontale segmentée entre heure d'arrivée et heure de départ
- [ ] #2 Segments colorés : une couleur par projet, orange pour pause, gris pour inactif, vert pour multi-projet
- [ ] #3 Labels dans chaque segment : nom du projet, 'Pause', 'Inactif', 'N projets'
- [ ] #4 Heures de début (arrivée) et fin (départ) affichées sous la barre
- [ ] #5 Barre proportionnelle : la largeur de chaque segment reflète sa durée
- [ ] #6 Bouton copier (icône clipboard) pour copier la répartition en texte
- [ ] #7 Mise à jour en temps réel si un chronomètre tourne
- [ ] #8 Non affichée si aucun pointage d'arrivée n'existe
<!-- AC:END -->
