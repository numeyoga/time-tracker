---
id: TT-9
title: Rapports et Statistiques hebdomadaires/mensuels
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
labels:
  - code
  - design
dependencies:
  - TT-2
  - TT-4
priority: medium
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Section "Rapports et Statistiques" en bas de page avec vue hebdomadaire et mensuelle. Affiche des KPI (temps de présence total, temps projets total, jours travaillés) et un tableau croisé projets × jours avec totaux.

Principes UX :
- Toggle Semaine / Mois (tabs)
- Navigation flèches gauche/droite entre les périodes
- 3 KPI cards avec bordure gauche bleue
- Tableau : colonnes = jours, lignes = projets, cellules = durées
- Ligne récap en bas : Projets (total projets/jour) + Présence (pointage/jour)
- Colonne Total surlignée
- Icône graphique par jour pour ouvrir le détail (timeline quotidienne)
- Bouton "Gérer les entrées de la période"
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Toggle Semaine/Mois : 2 tabs, Semaine actif par défaut (bleu filled)
- [ ] #2 Navigation par période : flèches gauche/droite + label de la période (ex: '23-29 Mar 2026')
- [ ] #3 3 KPI cards : Temps de présence total, Temps projets total, Jours travaillés, avec bordure gauche bleue
- [ ] #4 Tableau croisé : lignes = projets, colonnes = jours de la semaine (Lun-Ven) ou du mois
- [ ] #5 Cellules : durée (Xh Xm) ou '-' si pas de données
- [ ] #6 Colonne Total surlignée en jaune avec somme par projet
- [ ] #7 Ligne récap 'Projets' : total temps projets par jour
- [ ] #8 Ligne récap 'Présence' : temps de présence (pointage) par jour
- [ ] #9 Icône graphique (bar chart) par jour ouvre la popover timeline quotidienne
- [ ] #10 Bouton 'Gérer les entrées de la période' ouvre la popover gestion des entrées filtrée
- [ ] #11 Vue Mois : même structure adaptée au mois calendaire
<!-- AC:END -->
