---
id: TT-7
title: Temps passé par projet aujourd'hui
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies:
  - TT-4
priority: medium
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Section affichant des cards de répartition du temps par projet pour la journée en cours. Chaque card montre le nom du projet, la durée, une barre de progression et le pourcentage. Détecte et affiche le temps parallèle quand plusieurs projets tournent simultanément.

Principes UX :
- Cards avec bordure colorée (jaune/orange)
- Badge "Xh Xm parallèle" (icône éclair) quand du temps est partagé avec un autre projet
- Barre de progression proportionnelle
- Pourcentage de la journée
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Une card par projet ayant du temps enregistré aujourd'hui
- [ ] #2 Chaque card affiche : nom du projet, durée totale (Xh Xm), barre de progression, pourcentage
- [ ] #3 Détection du temps parallèle : si 2+ projets actifs simultanément, badge 'Xh Xm parallèle' avec icône éclair
- [ ] #4 Le pourcentage est calculé par rapport au temps total de tous les projets
- [ ] #5 Les barres de progression sont proportionnelles aux durées
- [ ] #6 Mise à jour en temps réel quand un chronomètre tourne
- [ ] #7 Message 'Aucune session de travail' si aucun projet n'a de temps aujourd'hui
<!-- AC:END -->
