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
- **React Router v7** (`HashRouter`, nested layouts via `<Outlet />`)
- **ESLint 9** flat config

## About the project

**JASSD** (Journal of Agricultural Systems and Sustainable Development) is a design
prototype for the management side of an academic journal — the part that editors,
reviewers and administrators actually work in. It is deliberately modelled on the
shape of Open Journal Systems (OJS), because that is the closest widely-understood
reference for the problem, but stripped back to what is needed to demonstrate
**navigation, information architecture and workflow**.

The central claim of the prototype is that **the workflow is the product**. So
everything else is subordinate to it:

- Every submission has a **status**, and every status change is a named
  **transition** that is validated against a transition table and the acting user's
  role. A manuscript cannot be moved to a state the workflow does not allow.
- Every transition writes an **audit entry** with the actor, their role, a timestamp
  and a reason. The Activity tab shows this as an ordered history. Nothing in the
  interface mutates state silently.
- The UI never hard-codes a status colour or a permission check. Status presentation
  comes from one table (`STATUS_META`) and role capabilities come from
  `src/domain/roles.js`, so a screen can never disagree with the domain model.

### What you can actually do in it

| Area | Behaviour |
| --- | --- |
| **Submit** | A five-step wizard — article type, authors, files, details, review — producing a real submission record. |
| **Assign** | Editors and administrators assign a handling editor and invite reviewers from the active reviewer pool. |
| **Review** | Reviewers accept or decline invitations, then file a report with a recommendation, comments to the author, and private comments to the editor. |
| **Decide** | Editors accept, request revisions, decline, or move to production. Revision requests carry a required reason. |
| **Publish** | Articles are published into a specific issue, gaining volume, issue, page and DOI-style metadata. |
| **Bypass** | Editors and administrators may publish directly, which skips peer review. The UI marks it amber, asks for a reason, and records it distinctly. |

The **direct publication** path is the one place where the prototype is deliberately
opinionated. It exists because real journals need an administrative route for
editorials, obituaries, conference proceedings and corrections — but it must never
be mistaken for the normal path. So it lives in its own bordered block with its own
button style, `WorkflowTimeline` renders the stages it skipped as dashed nodes, and
the audit log labels it `DIRECT_PUBLICATION` with the reason attached. The
difference between the two routes is visible at a glance, not buried in a log.

### Audience and intent

This is meant to be *read and run* — a working reference for how a journal management
interface is organised, not a shipped product. It is useful for discussing
requirements, for teaching information architecture, and as a starting point for a
real implementation. It is **not** secure, not scalable, and makes no attempt to be.

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

## Demo users and credentials

**There are no passwords.** The prototype has no login form, no session and no
authentication of any kind. "Signing in" means choosing an identity from the
**Viewing as** dropdown in the header, which swaps `activeRole` and the current
user in the store. That is the whole mechanism — treat it as a view filter, not as
a login.

The four identities below are the default personas, exported as `demoIdentities`
from `src/data/users.js`. Every one of them is a real record in the `users` array,
so their names, affiliations and history appear throughout the app (for example as
the assigned editor on a submission, or as the actor on an audit entry).

| Role | Persona | ID | Affiliation | What this persona demonstrates |
| --- | --- | --- | --- | --- |
| **Author** | Dr. Amara Nwosu | `u-au-1` | University of Cape Town | Has one **draft** (`JASSD-2026-0148`) and one under review, so the author dashboard shows both "not yet submitted" and "awaiting decision" states. |
| **Reviewer** | Prof. Claire Dubois | `u-rv-3` | Université Grenoble Alpes | Has **outstanding invitations** to accept or decline, plus a completed review, so the reviewer queue is non-empty. |
| **Editor** | Prof. Elena Marchetti | `u-ed-1` | University of Bologna | Handling editor for several live submissions — the persona that exercises the full editorial decision set. |
| **Administrator** | Dr. Miriam Okonkwo | `u-admin-1` | Journal Management Office | The only persona that can *reset* prototype data, administer users and journal settings, and perform direct publication. |

Because there is no credential check, **any user in the dataset can be made active
for any role** by editing `demoIdentities`. Useful variations to try:

- Switch to **Editor** and open `JASSD-2026-0140` — all three review reports are
  already filed, so the *Editorial Decision* panel is fully populated.
- Switch to **Reviewer** and open *My Reviews*: the outstanding invitation from
  `u-ed-6` can be accepted, then a report filed against `JASSD-2026-0140`.
- Switch to **Administrator** → *Users* to see the full account directory with
  roles, affiliations, countries, expertise areas and account status.
- Switch to **Administrator** → *Journal Settings* for the journal profile and
  configurable workflow options.

> Switching roles only changes what you *see*. It is not a security boundary and
> must never be treated as one.

## Mock data

All data is hard-coded TypeScript-free JavaScript modules under `src/data/`, seeded
into Zustand on first load and then persisted to `localStorage` under the key
`jassd-prototype`. Dates are deliberately anchored to **2026-09-29** so relative
timestamps ("3 days ago") stay deterministic rather than drifting.

### Dataset volumes

| File | Records | Covers |
| --- | --- | --- |
| `data/users.js` | 41 accounts | 3 administrators, 8 editors, 15 reviewers, 15 authors — across 20+ countries, with active, invited and inactive account states. |
| `data/submissions.js` | 16 manuscripts | Every workflow status, both publication paths, 1 draft, 1 rejected, 5 published. |
| `data/issues.js` | 6 issues | 3 published, 2 scheduled, 1 draft, with a table of contents per issue. |
| `data/journal.js` | 1 journal | Title, ISSN, aims and scope, editorial board, default settings. |

### How the submissions dataset is built

Submissions are generated with three small factories so the records stay
readable and internally consistent:

- `author(id, name, email, affiliation, order, isCorresponding, country)`
- `file(name, type, format, version, uploaded, uploadedBy, sizeKb, note)`
- `activity(type, label, actor, actorRole, timestamp, reason)`

The module ends with a loop that re-attaches the parent `submissionId` to every
activity entry and review, so child records never need to repeat it.

**Coverage by status** — every status in `SUBMISSION_STATUS` has at least one
representative, which is what makes the filters and dashboard counters meaningful:

| Status | Example | Notes |
| --- | --- | --- |
| `DRAFT` | `JASSD-2026-0148` | Author's own unfinished draft; shows the "continue submission" path. |
| `SUBMITTED` | `JASSD-2026-0147`, `JASSD-2026-0149` | Awaiting editorial assignment; `0149` has no handling editor yet. |
| `UNDER_REVIEW` | `JASSD-2026-0143`, `JASSD-2026-0140`, `JASSD-2026-0133` | `0133` is in **round two** after a revision, so multi-round review is demonstrable. |
| `REVISION_REQUESTED` | `JASSD-2026-0138` | Author action pending; the reason is stored on the audit entry. |
| `ACCEPTED` | `JASSD-2026-0131` | Queued for the special issue. |
| `IN_PRODUCTION` | `JASSD-2026-0126` | Typesetting stage, not yet assigned to a published issue. |
| `PUBLISHED` | `JASSD-2026-0118`, `-0112`, `-0105`, `-0143`, `-0141`, `-0144` | `0141` and `0144` were published **directly**, bypassing peer review. |
| `REJECTED` | `JASSD-2026-0122`, `JASSD-2026-0119` | Both carry a substantive editorial reason. |

### Deliberate data details

A few things in the dataset are there on purpose, to make the prototype's opinions
visible:

- **Two direct publications** (`0141`, `0144`) exist so the bypass path is
  demonstrated in the data, not only in a dialog. `0144` is society proceedings —
  a realistic reason to skip external peer review. Both are flagged
  `directPublication: true` and carry a `directPublicationReason`.
- **One manuscript is in its second review round** (`0133`), and its two round-two
  reports reference the authors' responses by name. Review rounds are visible in
  the timeline rather than collapsed.
- **One reviewer is inactive** (`u-rv-15`) and one is merely invited (`u-rv-8`).
  The reviewer invitation pool filters to `role === REVIEWER && status === 'active'`,
  so the filter is doing real work.
- **An author account is only invited** (`u-au-14`), and one author is inactive
  (`u-au-6`) — the Authors directory shows all three states.

### Reviewer expertise coverage

Reviewer expertise tags are chosen so the invitation panel has plausible matches for
the seeded manuscripts: water scarcity and irrigation, renewable energy and energy
policy, digital health and epidemiology, soil carbon and remote sensing, learning
sciences, participatory governance, and structural and infrastructure engineering.

### Resetting the data

Because the store is persisted, your changes survive a refresh. To go back to the
seed dataset:

- **Administrator** → open any submission → **Reset prototype data**, or
- run `localStorage.removeItem('jassd-prototype')` in the browser console and
  reload.


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
