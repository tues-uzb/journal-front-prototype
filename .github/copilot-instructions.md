# Copilot Instructions — JASSD Journal Management Prototype

## Project overview

A **frontend-only** design prototype for an academic journal management and
publishing system, inspired by the general workflow of Open Journal Systems but
substantially simpler. It demonstrates navigation, information architecture and
workflow simulation.

**No backend, database, real authentication, email, file storage, DOI
registration or external API exists.** All data is mock data in Zustand,
persisted to `localStorage` under the key `jassd-prototype`.

## Tech stack

- **React 19** + **Vite 6** (JavaScript, JSX — no TypeScript)
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin. There is **no
  `tailwind.config.js`**; tokens live in `@theme` in `src/index.css`.
- **Zustand 5** with the `persist` middleware
- **React Router v7** with nested layouts via `<Outlet />`
- **ESLint 9** flat config

## Commands

Use `npm.cmd` in PowerShell if `npm` is blocked by the execution policy.

| Command           | Purpose                      |
| ----------------- | ---------------------------- |
| `npm run dev`     | Vite dev server (port 5173)  |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | ESLint                       |

## Architecture — the important part

Business rules are deliberately separated from the UI. **Before adding a status
string, action or permission check anywhere, look in `src/domain/`.**

```
src/
├─ domain/
│  ├─ types.js       JSDoc typedefs: User, Role, Submission, Review, Issue,
│  │                 ActivityLog, Journal, SubmissionFile, Author
│  ├─ status.js      SUBMISSION_STATUS, STATUS_META (label/description/tone),
│  │                 isActive/isTerminal, STATUS_FILTERS
│  ├─ workflow.js    TRANSITIONS table, canTransition(), availableTransitions(),
│  │                 WORKFLOW_STAGES, stageForStatus(), buildActivityFor(),
│  │                 ACTIVITY event constants
│  └─ roles.js       ROLES, ROLE_META, isEditorial(), canPublishDirectly(),
│                    canAdminister(), canAssignReviewers(), canManageIssues()
├─ data/             Mock data: journal.js, users.js, submissions.js, issues.js
├─ store/
│  ├─ useJournalStore.js  State + all workflow actions (applyTransition, etc.)
│  └─ selectors.js        Pure derivation helpers (statusCounts, needsAttention…)
├─ config/navigation.js   Role-scoped sidebar model
├─ components/
│  ├─ ui/            Reusable primitives
│  └─ *.jsx          Feature components (WorkflowTimeline, ActivityTimeline,
│                    EditorialDecisionPanel, DirectPublishDialog, …)
├─ layouts/          AppShell (admin chrome), PublicLayout (article page),
│                    Sidebar, Header, SearchPalette
└─ pages/            One file per route
```

### The two publication paths

**Standard peer review**
`SUBMITTED → UNDER REVIEW → REVISION_REQUIRED → UNDER REVIEW → ACCEPTED →
IN_PRODUCTION → PUBLISHED`

**Direct publication (administrative bypass)**
`SUBMITTED → PUBLISHED`

`publishDirectly` is flagged `direct: true` in the transition table. It is
restricted to `EDITOR` and `ADMIN`, requires a target issue, and writes a
`DIRECT_PUBLICATION` activity entry carrying the actor, role, reason and date.
`WorkflowTimeline` renders bypassed stages as dashed/amber nodes so the difference
is visible at a glance. **Direct publication must never be presented as the
normal path.**

### Rules for changing workflow behaviour

- **Never assign `submission.status` directly in a component.** Call
  `applyTransition(name, submissionId, { actor, reason, issueId, publicationDate })`
  from the store; it validates against `TRANSITIONS` and writes the audit entry.
- **Never hard-code a status colour.** Use `StatusBadge`, which maps
  `STATUS_META[status].tone` to Tailwind classes.
- **Never hard-code a role permission check in JSX.** Use the helpers in
  `domain/roles.js`.
- **Never scatter status strings in nav or filter logic** — derive them from
  `STATUS_FILTERS` and `availableTransitions()`.

## Deployment (GitHub Pages)

- Deployed to `https://tues-uzb.github.io/journal-front-prototype/`.
- `vite.config.js` sets `base: '/journal-front-prototype/'` — **the repository
  name, not the local folder name.** If the repo is renamed, update `base`.
- `src/App.jsx` uses **`HashRouter`, not `BrowserRouter`.** GitHub Pages serves
  static files and cannot rewrite deep links to `index.html`, so routes must stay
  in the fragment (`/#/submissions/123`). Do not switch to `BrowserRouter` without
  also adding a SPA rewrite, or refreshes on deep links will 404.
- `.github/workflows/deploy.yml` deploys `dist/` on push to `main` and uses
  `npm ci`, so `package-lock.json` must stay committed.

## Conventions

- Two layouts exist so the reader-facing article page looks like a journal
  website, not the CMS. Preserve that distinction.
- Editorial actions are separated visually: `btn-direct` (amber) is deliberately
  distinct from `btn-primary`, and it lives in its own bordered block.
- Prefer `Panel`, `PageHeader`, `StatTile`, `Tabs`, `Note`, `EmptyState`,
  `DefinitionList`, `Avatar` from `components/ui/primitives.jsx` over new CSS.
- `DefinitionList` filters falsy entries, so `cond && { … }` items are safe.
- When adding a page, register it in `src/App.jsx` and add a nav entry in
  `src/config/navigation.js` with the roles that should see it.
- Dates in mock data and `relativeTime()` are anchored to **2026-09-29** so the
  prototype is deterministic. Update `TODAY` in `ActivityTimeline.jsx` if needed.
- Toast/dialog interactions are local UI state; the store holds domain state only.

## Tailwind CSS v4 gotchas (both verified in this project)

- `@apply` **cannot** reference a class defined in `@layer components`
  (`Cannot apply unknown utility class`). The shared `.btn` base is declared with
  `@utility btn` precisely so the `.btn-*` variants can compose it.
- Theme tokens must be declared in `@theme` inside `src/index.css`.

## ESLint

- Flat config: **no `extends` key.** Spread `config.rules` instead.
- `react/prop-types` is off — props are documented with JSDoc on the typedefs in
  `domain/types.js`.
- Unused args are prefixed `_` and allowed by the `no-unused-vars` config.
