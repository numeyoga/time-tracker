---
id: TT-14
title: Import des sessions depuis un fichier JSON
status: To Do
assignee: []
created_date: '2026-03-27 22:01'
labels:
  - code
  - design
dependencies:
  - TT-12
priority: low
ordinal: 11500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fonctionnalité d'import permettant de charger un fichier JSON précédemment exporté (TT-12) pour remplacer toutes les données actuelles de l'application. L'import effectue un reset complet puis charge les données du fichier (reset then load).

Principes UX :
- Accessible depuis le header (à côté du bouton Export) ou depuis la modale d'export
- Confirmation obligatoire avant écrasement des données existantes
- Message d'avertissement clair : les données actuelles seront perdues
- Feedback de succès ou d'erreur après l'import
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bouton 'Import' accessible depuis le header (à côté du bouton Export)
- [ ] #2 Clic sur Import ouvre un sélecteur de fichier (input file, accept=.json)
- [ ] #3 Validation du fichier : format JSON valide, structure conforme au format d'export de TT-12
- [ ] #4 Message de confirmation avant écrasement : 'Toutes les données actuelles seront remplacées. Continuer ?'
- [ ] #5 L'import effectue un reset complet du localStorage puis charge les données du fichier
- [ ] #6 Après import réussi : l'UI se rafraîchit avec les nouvelles données et affiche un message de succès
- [ ] #7 En cas d'erreur (fichier invalide, structure incorrecte) : message d'erreur clair, aucune donnée modifiée
- [ ] #8 Les données importées sont immédiatement fonctionnelles (pointages, projets, sessions)
<!-- AC:END -->
