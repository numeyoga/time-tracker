
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

## Tests

### Synchroniser les tests avec les suppressions de fonctionnalités

Quand une fonctionnalité est intentionnellement supprimée, le test E2E correspondant doit être mis à jour dans le même commit. Un test qui cherche un élément absent (`[data-js-timeline-copy]`) devient un faux négatif qui bloque la CI sans rapport avec les changements en cours. Le backlog (Final Summary de la task) est la source de vérité pour confirmer qu'une suppression est délibérée et non un bug.

### Clock leak dans les fonctions paramétrées par `now`

Une fonction qui accepte un paramètre `now` pour être testable mais appelle `new Date()` ou `Date.now()` en interne est partiellement testable — le paramètre n'isole pas complètement l'horloge. Toute dérivation temporelle (début de journée, date locale ISO, heure courante) doit passer par ce même `now` paramétré.

Exemples concrets dans ce projet :

- `getTodayStartMs()` dans `project-time-overview.js` doit recevoir `now` et faire `new Date(now)` plutôt que `new Date()`
- `computeTimelineSegments(now)` doit dériver la date locale depuis `now` plutôt qu'appeler `getTodayEntry()` (qui utilise la vraie date système)

Pour dériver une date locale ISO depuis un timestamp `now` de manière cohérente avec `todayISO()` :

```js
const d = new Date(now);
const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
```

Ne pas utiliser `new Date(now).toISOString().slice(0, 10)` — c'est la date UTC, pas la date locale.
