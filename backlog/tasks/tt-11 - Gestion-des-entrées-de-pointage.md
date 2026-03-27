---
id: TT-11
title: Gestion des entrées de pointage
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
labels:
  - code
  - design
dependencies:
  - TT-2
priority: medium
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Popover "Gestion des Entrées" accessible depuis le bouton "Gérer les entrées" (header) ou "Gérer les entrées de la période" (rapports). Affiche toutes les entrées de pointage groupées par jour, en ordre antéchronologique, avec CRUD complet et possibilité d'ajouter de nouveaux pointages.

Principes UX :
- Vue globale (toutes les entrées) ou filtrée par période
- Groupement par jour avec compteur d'entrées
- Chaque entrée : icône type colorée + label + heure + crayon + poubelle
- Bouton "Ajouter un pointage" (vert)
- Contrôles de saisie pour la cohérence des horaires
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Popover ouverte via 'Gérer les entrées' (header, vue globale) ou 'Gérer les entrées de la période' (rapports, vue filtrée)
- [ ] #2 Titre 'Gestion des Entrées' avec bouton fermer (X)
- [ ] #3 Sous-titre contextuel : période filtrée ou 'toutes les entrées dans l'ordre antéchronologique'
- [ ] #4 Entrées groupées par jour avec header : jour + date + badge 'N entrée(s)', bordure gauche bleue
- [ ] #5 Chaque entrée : icône type (cercle vert=arrivée, carré orange=pause, play=reprise, cercle rouge=départ) + label + heure bleue
- [ ] #6 Icône crayon modifie l'heure d'une entrée avec validation (cohérence chronologique)
- [ ] #7 Icône poubelle supprime l'entrée après confirmation
- [ ] #8 Bouton 'Ajouter un pointage' (vert, icône +) permet d'ajouter une entrée avec type, date, heure
- [ ] #9 Validation ajout : pas de doublon de type sur la même journée qui violerait la machine d'états
- [ ] #10 Tri antéchronologique (plus récent en haut) dans chaque groupe
<!-- AC:END -->
