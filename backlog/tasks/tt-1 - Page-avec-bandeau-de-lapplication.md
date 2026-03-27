---
id: TT-1
title: Page avec bandeau de l'application
status: Done
assignee: []
created_date: '2026-03-27 19:58'
updated_date: '2026-03-27 20:01'
labels:
  - code
  - design
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## User Story

En tant qu'utilisateur, je veux avoir une page avec le bandeau de l'application, afin d'avoir un premier visuel de l'application.

## Contexte technique

Création de la structure de base du projet (index.html, CSS, JS) avec l'App Shell du design system Covenant. Le bandeau (Top Bar) est la région supérieure fixe de l'App Shell, pleine largeur, contenant l'identité de l'application.

## Stack

- HTML5 sémantique, CSS natif (custom properties), JS ES modules vanilla
- Design system Covenant (skill `covenant-design-system`)
- Pas de framework, pas de bundler
- Déploiement GitLab Pages (fichiers statiques)

## Implémentation attendue

Structure de fichiers à créer :
- `index.html` — page principale avec App Shell
- `css/tokens.css` — design tokens (palette + sémantique)
- `css/reset.css` — reset CSS
- `css/base.css` — styles de base (body, typographie)
- `css/layout.css` — App Shell CSS Grid
- `css/components/topbar.css` — styles du bandeau
- `js/main.js` — point d'entrée ES module

Contenu du bandeau (Top Bar) :
- Logo / nom de l'application "Time Tracker" à gauche
- Navigation ou actions à droite (placeholder si pas encore défini)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La page s'affiche sans erreur dans Chrome/Opera
- [x] #2 Le bandeau est visible en haut de la page, pleine largeur, hauteur 48px (--shell-topbar-height: 3rem)
- [x] #3 Le nom de l'application 'Time Tracker' est visible dans le bandeau
- [x] #4 L'App Shell est structuré avec CSS Grid (topbar + sidenav + main)
- [x] #5 Tous les tokens CSS sont utilisés (aucune valeur brute dans le CSS applicatif)
- [x] #6 Le HTML est sémantique (header, nav, main)
- [x] #7 WCAG 2.2 AA : contraste suffisant, focus visible
- [x] #8 Les fichiers respectent la structure définie dans CLAUDE.md
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Implémentation

Structure de projet initialisée conformément au design system Covenant et aux conventions CLAUDE.md.

### Fichiers créés

- `index.html` — App Shell complet avec topbar, sidenav (placeholder), main
- `css/tokens.css` — Tous les design tokens (palette primitive + sémantique thème clair/sombre, typographie, espacement, bordures, ombres, z-index, animations, shell dimensions)
- `css/reset.css` — Reset CSS moderne avec focus-visible conforme WCAG
- `css/base.css` — Styles de base (body, headings, liens, code)
- `css/layout.css` — App Shell CSS Grid + grille 12 colonnes + conteneurs + utilitaires
- `css/components/topbar.css` — Bandeau supérieur (brand avec icône SVG inline + nom + bouton paramètres)
- `js/main.js` — Point d'entrée ES module

### Décisions techniques

- SVG inline Lucide (clock + settings) utilisés directement dans le HTML sans sprite (pas encore de sprite.svg défini)
- Top Bar : fond blanc (`--color-bg-default`), bordure basse, ombre `--shadow-xs`
- Brand : icône carrée bleue (`--color-primary`) + nom "Time Tracker" en `--font-weight-semibold`
- WCAG : `aria-label` sur le lien brand, `role="toolbar"` sur les actions, `aria-hidden` sur tous les SVG décoratifs
<!-- SECTION:FINAL_SUMMARY:END -->
