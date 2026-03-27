---
id: TT-3
title: Gestion des projets (CRUD)
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies: []
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Section "Projets" permettant de créer, renommer et supprimer des projets. Chaque projet apparaît dans une liste avec son nom, sa durée cumulée et des boutons d'action (play, crayon, calendrier, poubelle).

Principes UX :
- Bouton "Ajouter un projet" (vert) bien visible, pleine largeur
- Renommage via icône ✏️, suppression via icône 🗑️
- Les noms de projets doivent être uniques et non vides
- La suppression d'un projet supprime aussi toutes ses sessions associées (avec confirmation)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bouton 'Ajouter un projet' (vert, icône +) crée un nouveau projet après saisie du nom
- [ ] #2 Validation : nom non vide, nom unique parmi les projets existants
- [ ] #3 Chaque projet est listé avec : nom, durée cumulée (Xh Xm), boutons d'action
- [ ] #4 Icône crayon permet de renommer un projet (validation : non vide, unique)
- [ ] #5 Icône poubelle supprime le projet et toutes ses sessions après confirmation utilisateur
- [ ] #6 Bouton calendrier ouvre le détail/historique du projet
- [ ] #7 Persistance des projets dans localStorage
- [ ] #8 L'ordre des projets est stable (ordre de création ou alphabétique)
<!-- AC:END -->
