---
id: TT-6
title: Détails et historique des sessions d'un projet
status: Done
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-29 14:20'
labels:
  - code
  - design
dependencies:
  - TT-4
references:
  - Covenant 04-patterns.md §7 (Drawer)
  - Covenant 03-composants.md §9 (Data Table)
  - Covenant 03-composants.md §10 (Badge)
  - Covenant 05-etats-feedback.md §6 (Empty state)
priority: medium
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Drawer latéral « Détails : [nom du projet] » ouvert via le bouton calendrier de la ligne projet (TT-4). Affiche l'historique complet des sessions avec CRUD inline (modifier, supprimer).

## Mockup — Drawer Détails projet

```
┌─────────────────────────────────────────────────┐
│ <dialog.drawer>                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ .drawer__header                             │ │
│ │  h2 "Détails : Projet Alpha"    [btn ghost] │ │
│ │                                  icon-x     │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ .drawer__body                               │ │
│ │                                             │ │
│ │ ┌─ .data-table-wrapper ───────────────────┐ │ │
│ │ │ table.data-table data-density="compact" │ │ │
│ │ │ ┌──────────────────────────────────────┐ │ │
│ │ │ │ thead.data-table__head               │ │ │
│ │ │ │  #  DÉBUT  FIN   DURÉE STATUT  ACT. │ │ │
│ │ │ ├──────────────────────────────────────┤ │ │
│ │ │ │ tr.data-table__row                   │ │ │
│ │ │ │ 1  09:00  12:30 3h30  .badge         │ │ │
│ │ │ │                       [success]      │ │ │
│ │ │ │                       "Terminée"     │ │ │
│ │ │ │           [btn ghost icon-pencil]    │ │ │
│ │ │ │           [btn ghost icon-trash]     │ │ │
│ │ │ ├──────────────────────────────────────┤ │ │
│ │ │ │ tr.data-table__row                   │ │ │
│ │ │ │ 2  14:00  --:-- 1h25  .badge         │ │ │
│ │ │ │                       [info]         │ │ │
│ │ │ │                       "En cours"     │ │ │
│ │ │ │           [btn ghost icon-pencil]    │ │ │
│ │ │ │           [btn ghost icon-trash]     │ │ │
│ │ │ └──────────────────────────────────────┘ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ ── État vide (.empty-state) ──              │ │
│ │ icon-calendar-off  data-size="sm"           │ │
│ │ "Aucune session enregistrée"                │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ .drawer__footer                             │ │
│ │                      [btn secondary]        │ │
│ │                       "Fermer"              │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

── Mode édition inline (remplacement de la ligne) ──
┌──────────────────────────────────────────────────┐
│ tr.data-table__row[data-editing]                 │
│  #1  input[type=time] input[type=time]           │
│       09:00            12:30                     │
│       .form-field      .form-field               │
│  [btn primary sm icon-save] [btn ghost sm icon-x]│
│                                                  │
│  .form-field__error "Fin doit être après début"  │
└──────────────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Drawer | `<dialog class="drawer">` | 04-patterns §7 |
| Data table compact | `.data-table` `data-density="compact"` | 03-composants §9 |
| Badge statut | `.badge` `data-variant="success\|info"` | 03-composants §10 |
| Boutons actions | `.btn` `data-variant="ghost"` `data-size="sm"` | 03-composants §2 |
| Inputs time inline | `.input` `type="time"` dans `.form-field` | 03-composants §3 |
| Empty state | `.empty-state` `data-size="sm"` | 05-etats-feedback §6 |
| Toast confirmation | `.toast` `data-variant="success\|danger"` | 04-patterns §8 |

## Icônes Lucide

| Usage | Icône | Symbole sprite |
|-------|-------|---------------|
| Ouvrir drawer | `calendar` | `icon-calendar` |
| Modifier session | `pencil` | `icon-pencil` |
| Supprimer session | `trash-2` | `icon-trash` |
| Enregistrer édition | `save` | `icon-save` |
| Annuler édition | `x` | `icon-x` |
| Fermer drawer | `x` | `icon-x` |
| Empty state | `calendar-off` | `icon-calendar-off` |

## Interactions

**Ouvrir** : clic sur `[data-js-session-details]` dans la ligne projet → `drawer.showModal()`.

**Édition inline** :
1. Clic `icon-pencil` → la ligne bascule en mode édition (`data-editing` sur le `<tr>`)
2. Les cellules début/fin deviennent `<input type="time">` pré-remplies
3. Validation en temps réel (fin > début)
4. `icon-save` → sauvegarde localStorage + recalcul durée + toast succès
5. `icon-x` → annulation, retour à l'affichage normal

**Suppression** :
1. Clic `icon-trash` → modal confirmation « Supprimer la session #N ? »
2. Confirmer → suppression localStorage + toast succès + renumérotation
3. Si dernière session → affichage empty state

## Règles de validation

| Champ | Règle | Message d'erreur |
|-------|-------|-----------------|
| Heure début | Obligatoire | « Heure de début requise » |
| Heure fin | Obligatoire si statut=Terminée | « Heure de fin requise » |
| Heure fin | > Heure début | « La fin doit être après le début » |
| Session en cours | Seule l'heure début est modifiable | — |

## Impact sur les données

Toute modification/suppression de session met à jour :
- Le total du projet dans la liste (TT-4)
- La timeline si elle est affichée (TT-8)
- Le temps passé aujourd'hui (TT-7)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bouton calendrier dans la ligne projet ouvre un drawer via `<dialog>.showModal()`
- [ ] #2 Drawer titre « Détails : [nom du projet] », bouton fermer ghost icon-x
- [ ] #3 Data table compact avec colonnes : #, Début, Fin, Durée, Statut, Actions
- [ ] #4 Chaque session affiche un `.badge` : success « Terminée » ou info « En cours »
- [ ] #5 Bouton ghost icon-pencil bascule la ligne en mode édition inline
- [ ] #6 Mode édition : inputs `type="time"` pour début et fin, boutons save et annuler
- [ ] #7 Validation inline : fin > début, champs obligatoires, `.form-field__error` affiché
- [ ] #8 Sauvegarde met à jour localStorage, recalcule la durée, affiche toast succès
- [ ] #9 Session en cours : seule l'heure de début est modifiable (fin désactivée)
- [ ] #10 Bouton ghost icon-trash ouvre une modal de confirmation avant suppression
- [ ] #11 Suppression met à jour localStorage, affiche toast, renumérotation des sessions
- [ ] #12 Si aucune session : affichage `.empty-state` avec icon-calendar-off
- [ ] #13 Modification/suppression met à jour les totaux projet (TT-4) et timeline (TT-8)
- [ ] #14 Drawer fermable via bouton X, bouton Fermer footer, touche Escape, clic backdrop
- [ ] #15 Accessibilité : `aria-labelledby` sur le drawer, `aria-label` sur chaque bouton icône
- [ ] #16 Tous les tokens CSS Covenant — aucune valeur brute
<!-- AC:END -->
