---
id: TT-17
title: >-
  Nettoyage UI et amélioration rapport — suppression sidenav, refonte card
  pointage, tooltip flottant, sessions par jour
status: To Do
assignee: []
created_date: '2026-03-29 21:59'
labels:
  - code
  - design
  - bug
dependencies: []
references:
  - index.html#L216-L230 (sidenav)
  - index.html#L256-L270 (punch card header)
  - index.html#L413-L424 (timeline card + bouton copier)
  - 'js/components/timeline-overview.js (tooltip, buildClipboardText)'
  - 'js/components/report-stats.js (tableau rapport, gestionnaire click)'
  - js/components/day-timeline-drawer.js
  - js/components/entry-management-drawer.js
  - css/components/sidenav.css
  - css/layout.css
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensemble de corrections et améliorations UI identifiées visuellement via Playwright.

## 1. Supprimer le sidenav

Le sidenav (`index.html` l.216-230, `css/components/sidenav.css`) ne contient qu'un seul lien "Aujourd'hui" et n'apporte aucune valeur avec une application mono-page. Il occupe de l'espace inutilement dans le layout.

**À faire :**
- Supprimer le bloc `<nav class="app-shell__sidenav">` dans `index.html`
- Supprimer `css/components/sidenav.css` et son `<link>` dans `index.html`
- Adapter `css/layout.css` : supprimer la colonne sidenav du grid `app-shell` et laisser le `main` occuper toute la largeur disponible

## 2. Supprimer le bouton "Copier la répartition"

Le bouton `[data-js-timeline-copy]` (`index.html` l.416-419) et la logique associée dans `timeline-overview.js` (`buildClipboardText`, `root.dataset.clipboardText`) doivent être supprimés.

**À faire :**
- Supprimer le `<button data-js-timeline-copy>` dans `index.html`
- Supprimer `buildClipboardText()` et `root.dataset.clipboardText` dans `timeline-overview.js`
- Supprimer le gestionnaire d'événement `click` associé dans `today.js` (si présent)

## 3. Corriger le positionnement du titre "Pointage" dans le card

**Constat Playwright :** Dans le card de pointage, le titre "Pointage" (`.card__title`) apparaît sous le badge "Non commencée" dans le coin supérieur gauche, séparé visuellement des actions (Arrivée, Pause, etc.) qui sont à droite. Le titre devrait être intégré dans le header de manière cohérente avec les autres cards.

**Structure actuelle (`index.html` l.259-263) :**
```html
<header class="card__header">
  <div>
    <span class="badge" ...>Non commencée</span>
    <h2 class="card__title">Pointage</h2>  <!-- empilé sous le badge -->
  </div>
  <div class="punch-metrics">...</div>
  <fieldset class="punch-actions">...</fieldset>
```

**À faire :** Revoir le layout du `card__header` du punch clock pour que le badge et le titre soient correctement positionnés. Le badge "état" devrait idéalement être un indicateur visuel et le titre devrait avoir une position claire dans la hiérarchie visuelle. À analyser avec `css/components/punch-actions.css` et `css/components/card.css`.

## 4. Tooltip de répartition en mode flottant (overlay)

**Constat :** Le tooltip de détail (`div.tooltip`, `timeline-overview.js` l.245-266) est inséré dans le flux normal du DOM (`root.append(..., tooltip)`), ce qui peut le faire décaler le layout ou être coupé par `overflow: hidden`.

**À faire :**
- Le tooltip doit être positionné en `position: fixed` ou `position: absolute` hors du flux, en suivant le curseur ou ancré à l'élément survolé
- Mettre à jour `css/components/timeline-overview.css` (ou équivalent) pour que `.tooltip` soit `position: fixed` avec un `z-index` élevé (token `--z-index-tooltip` ou équivalent)
- Dans `timeline-overview.js`, calculer la position du tooltip via `getBoundingClientRect()` de l'élément survolé au lieu de le laisser dans le flux

## 5. Cliquer sur le total journalier dans le rapport pour voir/modifier les sessions

**Contexte :** Dans `report-stats.js`, le tableau de rapport affiche déjà les totaux par jour par projet. Il existe déjà `openDayTimelineDrawer` appelé sur `[data-js-report-day-chart]` (l.282-285). 

**Besoin :** Cliquer sur le **total d'une colonne de jour** (cellule `<td>` dans la ligne de footer ou dans les lignes de projet) doit ouvrir un drawer permettant de **voir et modifier les sessions de projet** pour ce jour précis — similaire au drawer existant `day-timeline-drawer.js` / `entry-management-drawer.js`.

**À faire :**
- Dans le rendu HTML de `report-stats.js`, ajouter `data-js-report-day-total="{iso}"` sur les cellules de total par jour (dans les lignes projet ET footer)
- Dans le gestionnaire `click` de `report-stats.js`, détecter ce sélecteur et appeler le drawer approprié (soit `openDayTimelineDrawer`, soit un nouveau drawer orienté édition de sessions)
- Le drawer doit permettre de voir les sessions existantes du jour et d'en modifier/supprimer (réutiliser `entry-management-drawer.js` si possible)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Le sidenav est supprimé de l'HTML, du CSS et du layout — le main occupe toute la largeur
- [ ] #2 Le bouton 'Copier la répartition' et toute la logique clipboard associée sont supprimés
- [ ] #3 Le titre 'Pointage' est correctement positionné dans le card de pointage (cohérent avec le design system Covenant)
- [ ] #4 Le tooltip de répartition s'affiche en overlay flottant sans décaler le layout ni être coupé
- [ ] #5 Cliquer sur un total journalier dans le tableau du rapport ouvre un drawer affichant les sessions du jour avec possibilité de modification
<!-- AC:END -->
