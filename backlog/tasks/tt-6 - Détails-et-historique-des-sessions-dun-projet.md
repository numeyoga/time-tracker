---
id: TT-6
title: Détails et historique des sessions d'un projet
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies:
  - TT-4
priority: medium
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Popover "Détails : [nom du projet]" accessible via l'icône calendrier dans la liste des projets. Affiche l'historique de toutes les sessions du projet avec CRUD complet (modifier, supprimer).

Principes UX :
- Chaque session affiche : numéro, durée, statut (En cours/Terminée), heures début/fin
- Modifier une session = modifier heure début, heure fin ou durée, même si en cours
- Supprimer une session avec icône poubelle
- Icône crayon pour éditer
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Popover ouverte via icône calendrier dans la ligne du projet
- [ ] #2 Titre 'Détails : [nom du projet]' avec bouton fermer (X)
- [ ] #3 Liste de toutes les sessions du projet, numérotées (#1, #2, …)
- [ ] #4 Chaque session affiche : durée totale, statut (En cours / Terminée), heure début, heure fin
- [ ] #5 Icône crayon permet de modifier l'heure de début et/ou de fin d'une session (y compris en cours)
- [ ] #6 Validation : heure de fin > heure de début, durée résultante > 0
- [ ] #7 Icône poubelle supprime la session après confirmation
- [ ] #8 Suppression/modification met à jour les totaux et la timeline en temps réel
<!-- AC:END -->
