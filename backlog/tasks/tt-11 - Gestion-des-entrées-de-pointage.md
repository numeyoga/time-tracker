---
id: TT-11
title: Gestion des entrées de pointage
status: Done
assignee: []
created_date: '2026-03-27 21:56'
updated_date: '2026-03-29 17:28'
labels:
  - code
  - design
dependencies:
  - TT-2
references:
  - Covenant 04-patterns.md §6 (Modal)
  - Covenant 04-patterns.md §7 (Drawer)
  - Covenant 03-composants.md §5 (Select)
  - Covenant 03-composants.md §10 (Badge)
  - Covenant 05-etats-feedback.md §6 (Empty state)
priority: medium
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Drawer « Gestion des Entrées » accessible depuis le header (vue globale) ou le bouton « Gérer les entrées de la période » dans TT-9 (vue filtrée). Affiche toutes les entrées de pointage groupées par jour, en ordre antéchronologique, avec CRUD complet et ajout de nouveaux pointages.

## Mockup — Drawer Gestion des Entrées

```
┌─────────────────────────────────────────────────────────┐
│ <dialog.drawer>                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ .drawer__header                                     │ │
│ │  h2 "Gestion des Entrées"           [btn ghost]     │ │
│ │  p.drawer__subtitle                   icon-x        │ │
│ │   "23 – 29 Mar 2026" ou                             │ │
│ │   "Toutes les entrées"                              │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ .drawer__body                                       │ │
│ │                                                     │ │
│ │ ┌─ .entry-group ──────────────────────────────────┐ │ │
│ │ │ .entry-group__header                            │ │ │
│ │ │  (border-left: 3px solid var(--color-primary))  │ │ │
│ │ │  "Vendredi 28/03/2026"                          │ │ │
│ │ │  .badge[data-variant="neutral"] "4 entrées"     │ │ │
│ │ │                                                 │ │ │
│ │ │ .entry-group__list                              │ │ │
│ │ │ ┌─ .entry-item ──────────────────────────────┐  │ │ │
│ │ │ │ .entry-item__icon                          │  │ │ │
│ │ │ │  (cercle, bg --color-success) icon-log-in  │  │ │ │
│ │ │ │ .entry-item__content                       │  │ │ │
│ │ │ │  span.entry-item__label "Arrivée"          │  │ │ │
│ │ │ │  span.entry-item__time "09:00"             │  │ │ │
│ │ │ │   (--color-primary, --font-weight-semibold)│  │ │ │
│ │ │ │ .entry-item__actions                       │  │ │ │
│ │ │ │  [btn ghost sm icon-pencil]                │  │ │ │
│ │ │ │  [btn ghost sm icon-trash]                 │  │ │ │
│ │ │ └────────────────────────────────────────────┘  │ │ │
│ │ │ ┌─ .entry-item ──────────────────────────────┐  │ │ │
│ │ │ │ (cercle, bg --color-warning) icon-pause    │  │ │ │
│ │ │ │  "Début Pause"    "12:30"   [pencil][trash]│  │ │ │
│ │ │ └────────────────────────────────────────────┘  │ │ │
│ │ │ ┌─ .entry-item ──────────────────────────────┐  │ │ │
│ │ │ │ (cercle, bg --color-warning) icon-play     │  │ │ │
│ │ │ │  "Fin Pause"      "13:30"   [pencil][trash]│  │ │ │
│ │ │ └────────────────────────────────────────────┘  │ │ │
│ │ │ ┌─ .entry-item ──────────────────────────────┐  │ │ │
│ │ │ │ (cercle, bg --color-danger) icon-log-out   │  │ │ │
│ │ │ │  "Départ"         "17:30"   [pencil][trash]│  │ │ │
│ │ │ └────────────────────────────────────────────┘  │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ── Mode édition inline (remplacement item) ──      │ │
│ │ ┌─ .entry-item[data-editing] ────────────────────┐ │ │
│ │ │  icon  "Arrivée"                               │ │ │
│ │ │  .form-field > input[type=time] "09:00"        │ │ │
│ │ │  [btn primary sm icon-save][btn ghost sm icon-x]│ │ │
│ │ │  .form-field__error si validation échoue       │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ── État vide (.empty-state) ──                     │ │
│ │ icon-clipboard  "Aucune entrée pour cette période" │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ .drawer__footer                                     │ │
│ │  [btn primary icon-plus "Ajouter un pointage"]      │ │
│ │                          [btn secondary "Fermer"]    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

── Modal ajout pointage ──
┌─ dialog.modal ──────────────────────────────┐
│ .modal__header                               │
│  h3 "Ajouter un pointage"       [btn ghost]  │
│                                   icon-x     │
│ .modal__body                                 │
│  .form-field "Type"                          │
│   .select > Arrivée|Début Pause|Fin Pause|   │
│             Départ                           │
│  .form-field "Date"                          │
│   input[type=date]                           │
│  .form-field "Heure"                         │
│   input[type=time]                           │
│ .modal__footer                               │
│  [btn secondary "Annuler"]                   │
│  [btn primary "Ajouter"]                     │
└──────────────────────────────────────────────┘
```

## Composants Covenant utilisés

| Composant | Classe | Référence |
|-----------|--------|-----------|
| Drawer | `<dialog class="drawer">` | 04-patterns §7 |
| Modal ajout | `<dialog class="modal">` | 04-patterns §6 |
| Badge compteur | `.badge` `data-variant="neutral"` | 03-composants §10 |
| Select type | `.select-wrapper` > `.select` | 03-composants §5 |
| Inputs date/time | `.input` dans `.form-field` | 03-composants §3 |
| Boutons actions | `.btn` ghost/primary/secondary | 03-composants §2 |
| Empty state | `.empty-state` `data-size="sm"` | 05-etats-feedback §6 |
| Toast feedback | `.toast` success/danger | 04-patterns §8 |

## Icônes par type d'entrée

| Type | Icône | Couleur fond |
|------|-------|-------------|
| Arrivée | `log-in` | `var(--color-success)` |
| Début Pause | `pause` | `var(--color-warning)` |
| Fin Pause | `play` | `var(--color-warning)` |
| Départ | `log-out` | `var(--color-danger)` |

## Icônes Lucide actions

| Usage | Icône | Symbole |
|-------|-------|---------|
| Modifier | `pencil` | `icon-pencil` |
| Supprimer | `trash-2` | `icon-trash` |
| Ajouter | `plus` | `icon-plus` |
| Fermer | `x` | `icon-x` |
| Enregistrer | `save` | `icon-save` |
| Empty state | `clipboard` | `icon-clipboard` |

## Validation

| Règle | Message d'erreur |
|-------|-----------------|
| Heure requise | « Heure requise » |
| Cohérence chrono : arrivée < pause début < pause fin < départ | « Viole l'ordre chronologique » |
| Pas de doublon type invalide (ex: 2 arrivées même jour) | « Entrée déjà existante » |
| Ajout : type + date + heure obligatoires | « Tous les champs sont requis » |
| Ajout : doit respecter la machine d'états du pointage (TT-2) | « Incohérent avec l'état actuel » |

## Interactions

**Édition inline** : clic pencil → `data-editing` sur l'item → input time pré-rempli → save/annuler.
**Suppression** : clic trash → modal confirmation → suppression + toast + recalcul.
**Ajout** : bouton footer → modal avec select type + date + heure → validation → ajout localStorage + toast.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Drawer ouvert via « Gérer les entrées » (header = vue globale) ou depuis TT-9 (vue filtrée par période)
- [ ] #2 Titre « Gestion des Entrées » + sous-titre contextuel (période ou « toutes les entrées »)
- [ ] #3 Entrées groupées par jour `.entry-group` avec header : date + badge compteur, border-left accent
- [ ] #4 Groupes triés antéchronologiquement (jour le plus récent en haut)
- [ ] #5 Chaque entrée : icône type colorée (log-in/pause/play/log-out) + label + heure + actions
- [ ] #6 Bouton ghost icon-pencil pour édition inline de l'heure (input time + save/annuler)
- [ ] #7 Validation édition : cohérence chronologique, `.form-field__error` si violation
- [ ] #8 Bouton ghost icon-trash pour suppression avec modal confirmation
- [ ] #9 Bouton primary « Ajouter un pointage » dans le footer ouvre une modal d'ajout
- [ ] #10 Modal ajout : select type, input date, input time + validation complète
- [ ] #11 Ajout respecte la machine d'états du pointage (TT-2) — types invalides rejetés
- [ ] #12 Toast succès/erreur après chaque opération CRUD
- [ ] #13 Empty state si aucune entrée pour la période
- [ ] #14 Drawer fermable via bouton X, bouton Fermer, Escape, clic backdrop
- [ ] #15 Accessibilité : `aria-labelledby`, `aria-label` sur boutons icônes
- [ ] #16 Aucune valeur CSS brute — tous les tokens Covenant
<!-- AC:END -->
