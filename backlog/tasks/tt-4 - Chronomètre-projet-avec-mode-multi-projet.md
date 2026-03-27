---
id: TT-4
title: Chronomètre projet avec mode multi-projet
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies:
  - TT-3
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Card "Chronomètre" affichant le temps en cours pour le(s) projet(s) actif(s). Permet de démarrer/arrêter un chronomètre par projet en 1 clic (bouton Play dans la liste des projets). Un toggle "Multi-projet" permet d'avoir plusieurs projets actifs simultanément.

Principes UX :
- Démarrer/arrêter un projet = 1 clic sur le bouton Play/Stop dans la ligne du projet
- En mode multi-projet, les sessions actives sont affichées comme des chips (point vert + nom + durée + stop)
- Boutons "Arrêter" (orange) et "Tout arrêter" (violet) dans la card chronomètre
- Le chronomètre tourne en temps réel (mise à jour chaque seconde)
- Le temps d'une session en cours est modifiable (heure de début)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bouton Play dans chaque ligne projet démarre le chronomètre pour ce projet en 1 clic
- [ ] #2 Bouton Stop dans chaque ligne projet arrête le chronomètre et enregistre la session
- [ ] #3 Card chronomètre affiche 'Aucun projet en cours' ou 'N projets actifs' selon l'état
- [ ] #4 Durée affichée en temps réel (mise à jour chaque seconde) au format Xh Xm
- [ ] #5 Toggle Multi-projet : activé = plusieurs projets simultanés, désactivé = un seul à la fois
- [ ] #6 En mode mono-projet, démarrer un projet arrête automatiquement le projet en cours
- [ ] #7 Sessions actives affichées comme chips : point vert + nom + durée + bouton stop individuel
- [ ] #8 Bouton 'Arrêter' arrête le dernier projet démarré, bouton 'Tout arrêter' stoppe tous les projets
- [ ] #9 L'heure de début d'une session en cours est modifiable via icône crayon
- [ ] #10 Sessions enregistrées dans localStorage avec projet, début, fin, durée
<!-- AC:END -->
