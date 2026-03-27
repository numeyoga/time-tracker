---
id: TT-13
title: Contrôles de saisie et validation des données
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
labels:
  - code
dependencies: []
priority: high
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Validation transversale sur toutes les saisies de l'application pour empêcher les données aberrantes. Concerne les pointages, les sessions projet, l'ajout de temps et toutes les modifications.

Principes UX :
- Messages d'erreur clairs et contextuels
- Empêcher la saisie plutôt que corriger après coup (contraintes sur les inputs)
- Feedback visuel immédiat (bordure rouge, message sous le champ)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Pointage : heure d'arrivée < heure de début pause < heure de fin pause < heure de départ
- [ ] #2 Pointage : modification d'une heure ne peut pas violer l'ordre chronologique
- [ ] #3 Session projet : heure de fin > heure de début
- [ ] #4 Session projet : durée résultante > 0
- [ ] #5 Ajout de temps : durée > 0 et heure de fin > heure de début
- [ ] #6 Nom de projet : non vide, unique, pas uniquement des espaces
- [ ] #7 Export : date de fin ≥ date de début
- [ ] #8 Feedback visuel immédiat : bordure rouge sur le champ invalide + message d'erreur sous le champ
- [ ] #9 Les boutons de validation (Ajouter, Modifier, Exporter) sont désactivés tant que le formulaire est invalide
- [ ] #10 Aucune donnée aberrante ne peut être persistée dans localStorage
<!-- AC:END -->
