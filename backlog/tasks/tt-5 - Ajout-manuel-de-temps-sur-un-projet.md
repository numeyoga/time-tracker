---
id: TT-5
title: Ajout manuel de temps sur un projet
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies:
  - TT-3
priority: medium
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modale "Ajouter du temps" accessible via le bouton bleu "Ajouter du temps" dans la section Projets. Permet de saisir manuellement une session de travail pour un projet avec choix entre durée ou heure de fin.

Principes UX :
- Sélection du projet via dropdown
- Date, heure de début, et durée OU heure de fin
- Contrôles de saisie stricts pour éviter les données aberrantes
- Boutons Annuler / Ajouter
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Modale ouverte via bouton 'Ajouter du temps' (bleu, icône horloge)
- [ ] #2 Champ Projet : dropdown listant tous les projets existants, sélection obligatoire
- [ ] #3 Champ Date : input date, défaut = aujourd'hui
- [ ] #4 Champ Heure de début : input time
- [ ] #5 Radio 'Durée ou heure de fin' : bascule entre saisie durée (h + min) et saisie heure de fin
- [ ] #6 Validation : durée > 0, heure de fin > heure de début
- [ ] #7 Validation : la session ajoutée ne dépasse pas les bornes de la journée de pointage (si pointage existe)
- [ ] #8 Bouton Annuler ferme sans enregistrer, bouton Ajouter enregistre la session
- [ ] #9 Session ajoutée visible immédiatement dans le temps passé par projet et la timeline
<!-- AC:END -->
