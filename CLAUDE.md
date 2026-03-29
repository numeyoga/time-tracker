# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**time-tracker** — Application web Vanilla (HTML5, CSS natif, JavaScript ES modules, sans framework) pour le suivi du temps de travail. La persistance des données est assurée par `localStorage` dans le navigateur. Déployée sur GitLab Pages.

## Stack technique

- **HTML5 sémantique** — pas de framework, pas de transpileur, pas de bundler en production
- **CSS natif** avec custom properties (design tokens) — aucun préprocesseur
- **JavaScript ES2024+** en paradigme **fonctionnel** — modules natifs (`type="module"`)
- **Compatibilité** : Web Baseline "Newly Available", Chrome et Opera (Chromium) uniquement
- **Cible** : Desktop, écrans larges (1920px–2560px)
- **Pas de backend** — toutes les données dans `localStorage`
- **Déploiement** : GitLab Pages, fichiers statiques servis tels quels

## Design System — Covenant (Vanilla Web)

Toutes les règles visuelles, HTML et CSS sont définies dans le **Covenant design system** (skill `covenant-design-system`). **Lire la skill avant tout travail UI.**

Règles critiques non négociables :

- Chaque couleur, espacement, taille de police, radius, ombre, z-index et durée d'animation **doit** utiliser un token CSS custom property — aucune valeur brute dans le CSS applicatif
- Tokens sémantiques (`--color-*`, `--text-*`, `--space-*`, etc.) uniquement dans le code composant — jamais les tokens primitifs (`--palette-*`)
- BEM pour les classes structurelles (`block__element--modifier`)
- `data-*` pour les variantes et états (pas de classes BEM modifieur)
- `data-js-*` pour les hooks JavaScript (jamais de classes CSS comme sélecteurs JS)
- `<dialog>` natif pour les modales et drawers
- WCAG 2.2 AA obligatoire

Structure de fichiers conforme au design system :

```text
project/
├── index.html
├── css/
│   ├── tokens.css
│   ├── reset.css
│   ├── base.css
│   ├── layout.css
│   ├── utilities.css
│   └── components/
├── js/
│   ├── main.js
│   └── components/
├── icons/
│   └── sprite.svg
└── package.json
```

## Conventions JavaScript

- Paradigme **fonctionnel** : fonctions pures, immutabilité, composition — pas de classes sauf si justifié
- Standard **ES2024+** : `using`, `Object.groupBy`, `Promise.withResolvers`, structuredClone, etc.
- Modules ES natifs — pas de CommonJS
- `addEventListener` uniquement — jamais de gestionnaires inline
- `data-js-*` comme sélecteurs DOM

## Tests

- **Vitest** pour les tests unitaires
- **Playwright** pour les tests e2e (scénarios utilisateur)
- Le MCP Playwright est utilisé pour observer, manipuler et contrôler l'application visuellement pendant le développement

Lancer les tests unitaires :

```bash
npx vitest run
npx vitest run path/to/test.js   # fichier unique
```

Lancer les tests e2e :

```bash
npx playwright test
npx playwright test path/to/test.spec.js   # fichier unique
```

## Backlog — source de vérité

**Backlog.md est la source de vérité** pour toutes les fonctionnalités, décisions d'architecture et choix d'implémentation.

Règles pour les tasks/subtasks :

- Chaque task doit être **autonome** : suffisamment détaillée pour être implémentée depuis un contexte vide
- Documenter les recherches, décisions et résultats dans les tasks correspondantes
- Utiliser les **tags** pour différencier : `research`, `code`, `test`, `design`, `bug`, `doc`
- Renseigner tous les champs disponibles : titre, description, critères d'acceptation, tags, priorité, assigné
- Les subtasks détaillent les étapes d'implémentation et servent de journal de bord

Préfixe des tasks : `TT`

<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_backlog_instructions()` to load the tool-oriented overview. Use the `instruction` selector when you need `task-creation`, `task-execution`, or `task-finalization`.

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and finalization
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->
