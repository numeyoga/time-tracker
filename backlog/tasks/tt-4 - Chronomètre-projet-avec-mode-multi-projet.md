---
id: TT-4
title: Chronomètre projet avec mode multi-projet
status: To Do
assignee: []
created_date: '2026-03-27 21:55'
updated_date: '2026-03-27 22:19'
labels:
  - code
  - design
dependencies:
  - TT-3
documentation:
  - Covenant Design System — Skill Guide (covenant-design-system)
  - >-
    Covenant 03-composants.md §2 (Button), §7 (Toggle Switch), §8 (Card), §10
    (Badge)
  - Covenant 05-etats-feedback.md §7 (État désactivé)
  - 'Covenant 06-iconographie.md (Lucide SVG sprite, aria patterns)'
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Card "Chronomètre" affichée entre la card Pointage (TT-2) et la section Projets (TT-3). Affiche le temps en cours pour le(s) projet(s) actif(s) avec mise à jour temps réel. Le bouton Play/Stop dans la liste des projets (TT-3) déclenche le chronomètre en 1 clic. Un toggle "Multi-projet" permet d'avoir plusieurs projets actifs simultanément.

---

## Mockup structurel — Composants Covenant

### État inactif (aucun projet en cours)

```
<article class="card" data-variant="outlined">                      ← .card
┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
╎ <div class="card__body">                                          ╎
╎                                                                    ╎
╎  .badge[neutral]     Aucun projet        0h 00m    .btn   .toggle ╎
╎  "Chronomètre"       en cours            ↑ __time  ghost  ↑       ╎
╎                      ↑ __status                    :dis.  Multi-  ╎
╎                                                    Arrêt. projet  ╎
╎                                                                    ╎
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

### État actif — mode mono-projet (1 projet en cours)

```
┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
╎  .badge[info]        bbbb                1h 23m    .btn   .toggle ╎
╎  "Chronomètre"       ↑ nom projet       ↑ live    ghost  Multi-  ╎
╎                                          (1s tick) Arrêt. projet  ╎
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

### État actif — mode multi-projet (2+ projets)

```
┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
╎  .badge[info]     2 projets    0h 47m  .btn[warn.] .btn[danger]  ╎
╎  "Chronomètre"    actifs       ↑ live  "Arrêter"   "Tout         ╎
╎                                                      arrêter"    ╎
╎                                                  .toggle Multi-p.╎
╎                                                                    ╎
╎  ┌─ .timer-sessions (zone chips) ─────────────────────────────┐   ╎
╎  │ Sessions actives  .badge[info] "2"                          │   ╎
╎  │                                                             │   ╎
╎  │  ┌─ .timer-chip ──────┐  ┌─ .timer-chip ──────┐            │   ╎
╎  │  │ 🟢 bbbb  0h 47m [⏹]│  │ 🟢 nop   0h 23m [⏹]│           │   ╎
╎  │  │ ↑dot ↑name ↑time   │  │                     │           │   ╎
╎  │  │      .btn ghost sm  │  │                     │           │   ╎
╎  │  │      aria-label=    │  │                     │           │   ╎
╎  │  │      "Arrêter bbbb" │  │                     │           │   ╎
╎  │  └─────────────────────┘  └─────────────────────┘           │   ╎
╎  └─────────────────────────────────────────────────────────────┘   ╎
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

### Intégration avec la liste des projets (TT-3)

```
Dans .project-list__item (TT-3) :

  bbbb   0h 00m   [▶️ Play]  [✏️]  [📅]  [🗑️]    ← projet inactif
  nop    0h 23m   [⏹ Stop]  [✏️]  [📅]  [🗑️]    ← projet actif
                   ↑ bascule Play/Stop selon état
                   ↑ icon-play / icon-square (Lucide)
                   ↑ .btn ghost sm, couleur change
```

---

## Composants Covenant utilisés

| Composant                | Usage                                              |
|--------------------------|----------------------------------------------------|
| `.card`                  | Conteneur chronomètre (bordure dashed/outlined)    |
| `.card__body`            | Layout unique en ligne (pas de header séparé)      |
| `.badge` neutral/info    | Label "Chronomètre" + compteur sessions actives    |
| `.btn` ghost             | "Arrêter" (inactif quand pas de session)           |
| `.btn` warning           | "Arrêter" (actif, arrête le dernier démarré)       |
| `.btn` danger            | "Tout arrêter" (visible en multi-projet, 2+ actifs)|
| `.btn` ghost sm          | Stop individuel dans chaque chip                   |
| `.toggle`                | Switch "Multi-projet" (`role="switch"`)            |
| `.icon`                  | Icônes Lucide (play, square, pencil)               |

## Composants custom

| Composant            | Rôle                                          | Fichier CSS                        |
|----------------------|-----------------------------------------------|------------------------------------|
| `.timer-card`        | Variante de card avec bordure dashed           | `css/components/timer-card.css`    |
| `.timer-card__status`| Texte statut ("Aucun projet" / nom / "N actifs")| (inclus)                         |
| `.timer-card__time`  | Affichage durée temps réel (Xh Xm)            | (inclus)                          |
| `.timer-sessions`    | Zone contenant les chips sessions actives      | (inclus)                          |
| `.timer-chip`        | Chip session active : dot + nom + durée + stop | `css/components/timer-chip.css`   |
| `.timer-chip__dot`   | Indicateur vert "en cours"                     | (inclus)                          |
| `.timer-chip__name`  | Nom du projet                                  | (inclus)                          |
| `.timer-chip__time`  | Durée live de la session                       | (inclus)                          |

## Icônes Lucide

| Concept            | Icône        | Symbol ID         |
|--------------------|--------------|-------------------|
| Démarrer (inactif) | `play`       | `icon-play`       |
| Arrêter (actif)    | `square`     | `icon-square`     |
| Arrêter global     | `square`     | `icon-square`     |
| Modifier session   | `pencil`     | `icon-pencil`     |

## Machine d'états — Chronomètre

```
                        ┌───────────┐
           ──────────►  │   IDLE    │ (aucune session active)
                        └─────┬─────┘
                         [Play sur un projet]
                              │
                  ┌───────────▼───────────┐
                  │  RUNNING_SINGLE       │ (1 session active)
                  │  ou RUNNING_MULTI     │ (2+ sessions actives)
                  └───────┬───────┬───────┘
             [Stop dernier│       │[Stop individuel / Tout arrêter]
              ou le seul] │       │
                  ┌───────▼───────▼───────┐
                  │  → IDLE (si 0 actif)  │
                  │  → RUNNING (si ≥1)    │
                  └───────────────────────┘
```

| État              | Badge     | Statut affiché        | Boutons visibles                   |
|-------------------|-----------|-----------------------|------------------------------------|
| IDLE              | `neutral` | "Aucun projet en cours"| Arrêter (:disabled), Toggle        |
| RUNNING_SINGLE    | `info`    | Nom du projet          | Arrêter, Toggle                    |
| RUNNING_MULTI     | `info`    | "N projets actifs"     | Arrêter, Tout arrêter, Toggle      |

## Comportement du toggle Multi-projet

- **Activé** (par défaut) : Play sur un projet l'ajoute aux sessions actives sans toucher aux autres
- **Désactivé** : Play sur un projet arrête automatiquement le projet en cours avant de démarrer le nouveau
- **Basculer de multi→mono avec 2+ actifs** : confirmation via toast warning ou arrêt automatique de tous sauf le dernier

## Interaction Play/Stop dans la liste projets (TT-3)

Le bouton Play dans `.project-list__item` bascule selon l'état :
- **Projet inactif** : icône `icon-play`, `aria-label="Démarrer le chronomètre pour [nom]"`
- **Projet actif** : icône `icon-square`, couleur danger, `aria-label="Arrêter le chronomètre pour [nom]"`

## Structure localStorage — Sessions

```js
// Clé : 'time-tracker-sessions'
[{
  id: "sess_xxx",              // crypto.randomUUID()
  projectId: "proj_xxx",       // Réf vers le projet
  startedAt: "ISO-8601",       // Heure de début
  endedAt: "ISO-8601" | null,  // null si en cours
  duration: 3600000 | null     // ms, null si en cours (calculé au stop)
}]
```

## Mise à jour temps réel

- `setInterval` à 1s pour mettre à jour l'affichage (durée dans la card + durée dans les chips + durée dans `.project-list__time`)
- Stocker `startedAt` (pas la durée courante) → la durée est toujours `Date.now() - startedAt`
- Au stop : calculer `endedAt` et `duration` définitifs, persister dans localStorage
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Conteneur : `<article class="card">` avec bordure dashed/outlined, layout `.card__body` en ligne unique (badge + statut + durée + boutons + toggle)
- [ ] #2 Badge `.badge[data-variant="neutral"]` 'Chronomètre' (inactif) ou `.badge[data-variant="info"]` (actif)
- [ ] #3 Statut textuel : 'Aucun projet en cours' (IDLE), nom du projet (SINGLE), 'N projets actifs' (MULTI)
- [ ] #4 Durée totale affichée en temps réel (Xh Xm), mise à jour chaque seconde via `setInterval`, calculée depuis `startedAt`
- [ ] #5 Bouton Play dans `.project-list__item` (TT-3) démarre le chronomètre en 1 clic — `icon-play`, `.btn[data-variant="ghost"][data-size="sm"]`
- [ ] #6 Bouton bascule en Stop quand le projet est actif — `icon-square`, couleur danger, `aria-label="Arrêter le chronomètre pour [nom]"`
- [ ] #7 Toggle `.toggle` 'Multi-projet' (`role="switch"`) : activé = plusieurs projets simultanés, désactivé = un seul
- [ ] #8 Mode mono-projet : démarrer un projet arrête automatiquement le projet en cours (stop + enregistrement session)
- [ ] #9 Bouton 'Arrêter' `.btn[data-variant="warning"]` arrête le dernier projet démarré (`:disabled` si IDLE)
- [ ] #10 Bouton 'Tout arrêter' `.btn[data-variant="danger"]` visible uniquement si 2+ projets actifs, stoppe toutes les sessions
- [ ] #11 Zone `.timer-sessions` avec chips `.timer-chip` par session active : dot vert + nom + durée live + `.btn` ghost sm stop (`icon-square`, `aria-label`)
- [ ] #12 Badge compteur `.badge[data-variant="info"]` dans `.timer-sessions` affichant le nombre de sessions actives
- [ ] #13 Heure de début d'une session en cours modifiable via icône crayon (`icon-pencil`) dans le chip ou la liste projets
- [ ] #14 Persistance localStorage : sessions avec `id`, `projectId`, `startedAt`, `endedAt` (null si en cours), `duration` (null si en cours)
- [ ] #15 Tokens CSS Covenant exclusifs, sélecteurs JS via `data-js-*`, focus visible, cibles ≥ 24×24 px, WCAG 2.2 AA
<!-- AC:END -->
