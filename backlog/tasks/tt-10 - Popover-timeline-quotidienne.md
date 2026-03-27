---
id: TT-10
title: Popover timeline quotidienne
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
labels:
  - code
  - design
dependencies:
  - TT-8
  - TT-9
priority: low
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Popover affichant le détail d'une journée spécifique, accessible depuis l'icône graphique dans le tableau des rapports. Contient une barre timeline horizontale colorée et une liste chronologique de tous les événements (pointages + sessions).

Principes UX :
- Titre "Timeline du [Jour] [Date]"
- Barre timeline identique à celle de la répartition journalière
- Liste "Détail de la journée" : chaque événement avec barre verticale colorée, heure, description, durée
- Scrollable si beaucoup d'événements
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Popover ouverte depuis l'icône graphique dans le tableau des rapports
- [ ] #2 Titre 'Timeline du [Jour de la semaine] [Date]' avec bouton fermer (X)
- [ ] #3 Barre timeline horizontale colorée entre heure d'arrivée et heure de départ
- [ ] #4 Liste chronologique 'Détail de la journée' avec tous les événements
- [ ] #5 Chaque événement : barre verticale colorée + heure (bold) + description + durée si applicable
- [ ] #6 Types d'événements : Arrivée, Début/Fin pause, Départ, Début/Fin session projet
- [ ] #7 Contenu scrollable si la liste dépasse la hauteur de la popover
<!-- AC:END -->
