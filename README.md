# JASSD — Journal Management System (Frontend Prototype)

A polished, frontend-only design prototype for an academic journal management and
publishing system, inspired by the general workflow of Open Journal Systems but
substantially simpler.

**This is a prototype.** There is no backend, database, real authentication, email,
file storage, DOI registration or external API. All data is mock data held in
Zustand and persisted to `localStorage`.

## Tech stack

- **React 19** + **Vite 6** (JavaScript, JSX — no TypeScript)
- **Tailwind CSS v4** via `@tailwindcss/vite`. No `tailwind.config.js`; design
  tokens live in `@theme` inside `src/index.css`.
- **Zustand 5** with the `persist` middleware
- **React Router v7** (`BrowserRouter`, nested layouts via `<Outlet />`)
- **ESLint 9** flat config

## Commands

Use `npm.cmd` in PowerShell if plain `npm` is blocked by the execution policy.

| Command           | Purpose                      |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |

## The publishing workflow

Two publication paths exist, and the interface makes the difference explicit.

**Standard peer review**

```
SUBMITTED → UNDER REVIEW → REVISION REQUIRED → UNDER REVIEW
          → ACCEPTED → IN PRODUCTION → PUBLISHED
```

**Direct publication (administrative)**

```
SUBMITTED → DIRECT PUBLICATION → PUBLISHED
```

Direct publication bypasses external peer review. It is available only to Editors
and Administrators, requires a target issue, and is always recorded in the audit
log as `DIRECT_PUBLICATION` with the acting user, role, reason and date.

## Roles

Switch roles from the header dropdown ("Viewing as …"). Navigation and available
actions change per role:

| Role              | Sees                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| **Author**        | Dashboard, My Submissions, New Submission, Publications                  |
| **Reviewer**      | Dashboard, My Reviews, Publications                                       |
| **Editor**        | Dashboard, Submissions, Reviews, Reviewers, Publications, Issues, Authors |
| **Administrator** | Everything above, plus Users and Journal Settings                        |

There is no real authentication — the role switcher is a prototype affordance.

## Suggested walkthrough

1. Switch to **Author** → *New Submission* → complete the five-step wizard.
2. Switch to **Editor** → open the new manuscript from *Submissions*.
3. *Editorial Decision* tab → **Send to Review** → *Reviews* tab → invite reviewers.
4. Switch to **Reviewer** → *My Reviews* → accept the invitation and submit a report.
5. Back as **Editor** → open the review report → **Accept** or **Request Revision**.
6. Try **Publish Directly** on any non-terminal submission to see the bypass flow,
   its confirmation dialog, and the resulting audit entry.
7. Check the **Activity** tab to see the complete, ordered audit log.
8. Open any published article to see the public, reader-facing article page.

**Reset prototype data** is available on any submission detail page (Administrator
role) to restore the original dataset.

## Project structure

```
src/
├─ domain/               # Framework-free business rules
│  ├─ types.js           #   JSDoc typedefs for all domain objects
│  ├─ status.js          #   Status vocabulary + presentation metadata
│  ├─ workflow.js        #   Transition table, permissions, activity events
│  └─ roles.js           #   Role definitions and capability checks
├─ data/                 # Mock data
│  ├─ journal.js         #   Journal + default settings
│  ├─ users.js           #   Editors, reviewers, authors, admins
│  ├─ submissions.js     #   Manuscripts, reviews, files, activity
│  └─ issues.js          #   Issues and table-of-contents ordering
├─ store/
│  ├─ useJournalStore.js #   Zustand store + workflow actions
│  └─ selectors.js       #   Pure derivation helpers
├─ config/navigation.js  #   Role-scoped navigation model
├─ components/
│  ├─ ui/                #   Reusable primitives (Icon, Modal, Toast, StatusBadge…)
│  ├─ WorkflowTimeline.jsx
│  ├─ ActivityTimeline.jsx
│  ├─ EditorialDecisionPanel.jsx
│  ├─ DirectPublishDialog.jsx
│  ├─ ReviewerPanel.jsx
│  └─ ReviewDetail.jsx
├─ layouts/              # AppShell (admin), PublicLayout (article), Sidebar, Header
├─ pages/                # Route components
├─ App.jsx               #   Route definitions
└─ index.css             #   Tailwind v4 import, @theme tokens, component classes
```

## Architecture notes

- **Workflow transitions are centralised** in `src/domain/workflow.js`. The UI
  never assigns a status string directly; it requests a named transition, which is
  validated against the transition table and the acting role.
- **Status presentation lives in one place** (`STATUS_META`), so labels and colours
  are never duplicated across screens.
- **Navigation is derived from the role** in `src/config/navigation.js` rather than
  being hidden with scattered conditionals.
- **Two layouts** keep the reader-facing article page visually distinct from the
  administrative interface.
- The store exposes `resetData()` to restore the seed data.

## Tailwind CSS v4 caveat

`@apply` cannot reference a plain class defined in `@layer components`. The shared
`.btn` base is therefore declared with `@utility btn`, which the `.btn-*` variants
can compose with `@apply`.

## Deployment to GitHub Pages

The app is configured for GitHub Pages at
`https://tues-uzb.github.io/journal-front-prototype/`.

Two settings make this work:

- **`vite.config.js`** sets `base: '/journal-front-prototype/'` so built asset URLs
  are prefixed with the repository name.
- **`src/App.jsx`** uses `HashRouter` instead of `BrowserRouter`. GitHub Pages
  serves static files and cannot rewrite deep links such as
  `/journal-front-prototype/submissions/123` back to `index.html`, which would
  404 on refresh. Hash routing keeps the URL in the fragment
  (`/journal-front-prototype/#/submissions/123`) so the server only ever serves
  `index.html`.

`.github/workflows/deploy.yml` runs on every push to `main`: it installs
dependencies, builds, and deploys `dist/` via the official Pages actions. It also
supports manual runs from the Actions tab.

### Steps to publish

1. Push to `main` — the repository is already connected as `origin`.
2. In the repository go to **Settings → Pages → Build and deployment** and set
   **Source** to **GitHub Actions**. The workflow's permissions are already
   declared in the workflow file, so no further configuration is needed.
3. The first deployment runs automatically on push. Watch it under the
   **Actions** tab; when it finishes, Pages is live at:

   ```
   https://tues-uzb.github.io/journal-front-prototype/
   ```

> If the repository is renamed, update `base` in `vite.config.js` to match.

## Not implemented (by design)

Real authentication · backend/API · database · email · file storage · PDF
processing · DOI registration · ORCID · payments · OAI-PMH · plugin architecture ·
complex permission rules.
