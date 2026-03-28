---
id: TT-13
title: Contrôles de saisie et validation des données
status: To Do
assignee: []
created_date: '2026-03-27 21:56'
updated_date: '2026-03-28 21:37'
labels:
  - code
dependencies: []
references:
  - Covenant 05-etats-feedback.md §4 (Erreur validation)
  - Covenant 03-composants.md §3 (Input/Form field)
  - Covenant 04-patterns.md §8 (Toast)
priority: high
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Module de validation transversal appliqué à toutes les saisies de l'application. Empêche les données aberrantes en utilisant les patterns Covenant de feedback (inline validation, états d'erreur, boutons disabled).

## Stratégie de validation

Validation à **deux niveaux** :
1. **Contraintes HTML natives** : `required`, `min`, `max`, `pattern` sur les inputs
2. **Validation JS** : règles métier complexes vérifiées au `input`/`change` et avant soumission

## Patterns Covenant de feedback d'erreur

```
── Champ invalide ──
┌─ .form-field ──────────────────────────┐
│ label "Heure de fin"                   │
│ input.input[type=time][aria-invalid]   │
│  (border: var(--color-danger))         │
│ p.form-field__error                    │
│  role="alert"                          │
│  "La fin doit être après le début"     │
└────────────────────────────────────────┘

── Bouton désactivé ──
[btn primary disabled]
 "Enregistrer"
 (cursor: not-allowed, opacity réduite)
 (activé dès que tous les champs sont valides)

── Toast erreur (si erreur serveur/localStorage) ──
.toast[data-variant="danger"]
 icon-alert-triangle "Erreur lors de la sauvegarde"
```

## Règles de validation par domaine

### Pointage (TT-2, TT-11)

| Règle | Champs | Message |
|-------|--------|---------|
| Ordre chronologique | arrivée, pauses, départ | « Viole l'ordre chronologique » |
| Arrivée < début pause | arrivée, début pause | « La pause ne peut précéder l'arrivée » |
| Début pause < fin pause | début pause, fin pause | « La fin de pause doit être après le début » |
| Fin pause < départ | fin pause, départ | « Le départ doit être après la fin de pause » |
| Pas de doublon type/jour | type, date | « Entrée déjà existante pour ce jour » |
| Machine d'états respectée | type | « Incohérent avec l'état actuel du pointage » |

### Sessions projet (TT-4, TT-5, TT-6)

| Règle | Champs | Message |
|-------|--------|---------|
| Fin > début | début, fin | « La fin doit être après le début » |
| Durée > 0 | durée | « La durée doit être positive » |
| Nom projet non vide | nom | « Le nom du projet est requis » |
| Nom projet unique | nom | « Ce nom de projet existe déjà » |
| Nom pas que espaces | nom | « Le nom ne peut contenir que des espaces » |

### Export/Import (TT-12, TT-14)

| Règle | Champs | Message |
|-------|--------|---------|
| Date fin ≥ date début | dates export | « Date de fin < date de début » |
| JSON valide | fichier import | « Le fichier n'est pas un JSON valide » |
| Structure conforme | fichier import | « Structure du fichier non reconnue » |
| Version compatible | fichier import | « Version de fichier non supportée » |

## Implémentation

### Module `validation.js`

Fonctions pures exportées, composables :
- `validateTimeOrder(times[])` → `{ valid, error }`
- `validateRequired(value)` → `{ valid, error }`
- `validateUniqueName(name, existing[])` → `{ valid, error }`
- `validateDateRange(start, end)` → `{ valid, error }`
- `validateImportStructure(json)` → `{ valid, error }`
- `validatePunchStateMachine(entries, newEntry)` → `{ valid, error }`

### Binding Covenant

```js
// Appliquer l'état invalide Covenant sur un form-field
function setFieldError(field, message) {
  const input = field.querySelector('[data-js-input]');
  const error = field.querySelector('[data-js-error]');
  input.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  error.removeAttribute('hidden');
}

function clearFieldError(field) {
  const input = field.querySelector('[data-js-input]');
  const error = field.querySelector('[data-js-error]');
  input.removeAttribute('aria-invalid');
  error.setAttribute('hidden', '');
}
```

### Bouton submit

Le bouton de soumission est `disabled` par défaut et activé uniquement quand tous les champs du formulaire sont valides. Vérifié via un `MutationObserver` ou un handler `input` sur le formulaire.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Module `validation.js` avec fonctions pures exportées pour chaque règle métier
- [ ] #2 Pointage : ordre chronologique strict arrivée < pause début < pause fin < départ
- [ ] #3 Pointage : ajout respecte la machine d'états (TT-2)
- [ ] #4 Sessions : fin > début, durée > 0
- [ ] #5 Noms projets : non vide, unique, pas uniquement espaces
- [ ] #6 Export : date fin ≥ date début
- [ ] #7 Import : JSON valide, structure conforme, version compatible
- [ ] #8 Feedback visuel Covenant : `aria-invalid` + `border --color-danger` + `.form-field__error[role="alert"]`
- [ ] #9 Erreurs affichées en temps réel au `input`/`change`, pas uniquement à la soumission
- [ ] #10 Boutons de soumission `disabled` tant que le formulaire est invalide
- [ ] #11 Aucune donnée aberrante ne peut être persistée dans localStorage (validation avant écriture)
- [ ] #12 Toast danger si erreur technique (localStorage full, etc.)
- [ ] #13 100% testable unitairement (fonctions pures sans dépendance DOM)
- [ ] #14 Sélecteurs JS via `data-js-*` uniquement
<!-- AC:END -->
