---
id: TT-2
title: Card Pointage quotidien
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
labels:
  - code
  - design
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Card principale affichant le statut de la journée de travail avec une machine d'états pour le pointage (Arrivée → Pause → Reprise → Départ). Permet de pointer en 1 clic via 4 boutons circulaires colorés toujours visibles. Affiche les métriques temps de présence, pourcentage et objectif. Inclut une liste dépliable des pointages du jour avec CRUD inline (modifier l'heure, supprimer).

Principes UX :
- Les boutons de pointage sont en zone haute, facilement accessibles, actionnables en 1 clic
- Seuls les boutons valides selon l'état courant sont actifs (machine d'états)
- Les pointages existants sont modifiables (heure) et supprimables via icônes ✏️ et 🗑️
- Badge statut : "Non commencée", "En cours", "En pause", "Journée terminée"
- Métriques : temps de présence (Xh Xm), pourcentage /8h, message objectif
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 4 boutons circulaires (Arrivée vert, Pause orange, Reprise bleu, Départ rouge) visibles et actionnables en 1 clic
- [ ] #2 Machine d'états : seuls les boutons valides pour l'état courant sont activés, les autres sont désactivés
- [ ] #3 Badge statut affiché selon l'état : Non commencée / En cours / En pause / Journée terminée
- [ ] #4 Temps de présence calculé automatiquement (exclut les pauses), affiché en Xh Xm
- [ ] #5 Pourcentage par rapport à l'objectif de 8h affiché, avec message 'Objectif atteint!' si ≥ 100%
- [ ] #6 Liste dépliable/repliable des pointages du jour (triangle toggle)
- [ ] #7 Chaque pointage affiche : icône colorée par type, label, heure
- [ ] #8 Chaque pointage est modifiable (icône crayon → modifier l'heure) et supprimable (icône poubelle)
- [ ] #9 Suppression d'un pointage met à jour la machine d'états et recalcule les métriques
- [ ] #10 Persistance des pointages dans localStorage
<!-- AC:END -->
