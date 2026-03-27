---
id: TT-12
title: Export des sessions en JSON
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
labels:
  - code
dependencies: []
priority: low
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modale "Exporter les sessions" accessible via le bouton "Export" (rouge) dans le header. Permet d'exporter les données de sessions sur une plage de dates au format JSON, pour transfert entre navigateurs.

Principes UX :
- Sélection de la plage de dates (début / fin)
- Dates pré-remplies avec la semaine en cours
- Boutons Annuler / Exporter
- Téléchargement d'un fichier JSON
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Modale ouverte via bouton 'Export' (rouge) dans le header
- [ ] #2 Champ 'Date de début' et 'Date de fin' (inputs date)
- [ ] #3 Dates pré-remplies : début = lundi de la semaine courante, fin = dimanche de la semaine courante
- [ ] #4 Validation : date de fin ≥ date de début
- [ ] #5 Bouton Annuler ferme sans action, bouton Exporter génère et télécharge le fichier
- [ ] #6 Fichier JSON contenant toutes les sessions (pointages + sessions projets) de la plage
- [ ] #7 Format JSON structuré et ré-importable
- [ ] #8 Nom du fichier inclut les dates (ex: time-tracker-export-2026-03-23-2026-03-29.json)
<!-- AC:END -->
