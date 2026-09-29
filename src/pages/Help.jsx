/**
 * Help & documentation, including the workflow guide.
 * @module pages/Help
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Page, PageHeader, Panel, Tabs, Note } from '../components/ui/primitives'
import { WORKFLOW_STAGES } from '../domain/workflow'
import { SUBMISSION_STATUS, STATUS_META } from '../domain/status'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

const FAQ = [
  {
    q: 'What is the difference between “Publish” and “Publish Directly”?',
    a: '“Publish” completes the standard peer-review route, where the manuscript has already been accepted and produced. “Publish Directly” is an administrative action that bypasses external peer review entirely, moving a manuscript straight to PUBLISHED. It exists for invited contributions, editorials, proceedings papers and corrections, and is always recorded in the audit log with the acting user, role, reason and date.',
  },
  {
    q: 'Who can publish an article directly?',
    a: 'Only Editors and Administrators. Reviewers and Authors never see editorial actions. In this prototype you can switch roles from the header to compare the available actions for each.',
  },
  {
    q: 'Can a direct publication be undone?',
    a: 'In this prototype, no. A published manuscript is terminal. A production system would record a correction or retraction rather than silently reverting the record, so the audit trail remains intact.',
  },
  {
    q: 'How many reviews are needed before a decision?',
    a: 'The default configured in Journal Settings is two submitted reviews before an accept or reject decision. Requesting a revision or using direct publication remains possible below that threshold, and the editorial panel warns you when a decision is premature.',
  },
  {
    q: 'What does the reviewer deadline mean?',
    a: 'The deadline is the date by which the reviewer has committed to submit a report. Once it passes with the review still in progress, the submission appears in “Submissions requiring attention” and the reviewer is flagged as overdue.',
  },
  {
    q: 'Is any of this data real?',
    a: 'No. This is a frontend prototype. All journals, users, manuscripts, reviews and activity records are mock data held in local storage. No backend, email, file storage, DOI registration or external service is contacted.',
  },
]

export default function Help() {
  const [tab, setTab] = useState('workflow')

  return (
    <Page className="max-w-5xl">
      <PageHeader
        title="Help & documentation"
        description="How the editorial workflow operates, and how to use this prototype."
      />

      <div className="mt-6">
        <Tabs
          tabs={[
            { key: 'workflow', label: 'The workflow' },
            { key: 'roles', label: 'Roles' },
            { key: 'faq', label: 'FAQ', count: FAQ.length },
            { key: 'about', label: 'About this prototype' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5 space-y-5">
        {tab === 'workflow' && (
          <>
            <Panel title="The standard peer-review route" bodyClassName="px-5 py-5">
              <p className="text-[0.875rem] leading-relaxed text-ink-600">
                Every manuscript follows the same sequence. An editor assigns a handling editor, invites reviewers,
                collects their reports and makes a decision. Accepted articles move through copy-editing and
                typesetting before appearing in a numbered issue.
              </p>
              <ol className="mt-5 space-y-2.5">
                {WORKFLOW_STAGES.map((s, i) => (
                  <li key={s.key} className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-[0.6875rem] font-semibold text-brand-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[0.875rem] font-medium text-ink-900">{s.label}</p>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-600">
                        {STAGE_HELP[s.key]}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel title="The administrative direct-publication route" bodyClassName="px-5 py-5">
              <p className="text-[0.875rem] leading-relaxed text-ink-600">
                A small number of articles are published by administrative decision rather than peer review. This is a
                deliberate exception, not the normal path.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3.5">
                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 ring-1 ring-ink-200">
                  SUBMITTED
                </span>
                <Icon name="chevronRight" size={15} className="text-ink-400" />
                <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  DIRECT PUBLICATION
                </span>
                <Icon name="chevronRight" size={15} className="text-ink-400" />
                <span className="rounded-md bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">
                  PUBLISHED
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {['UNDER REVIEW', 'REVISION REQUIRED', 'ACCEPTED', 'IN PRODUCTION'].map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
                    <Icon name="close" size={13} className="shrink-0 text-amber-600" strokeWidth={2.5} />
                    <span className="text-[0.8125rem] text-ink-500 line-through">{s}</span>
                    <span className="ml-auto text-xs text-ink-400">bypassed</span>
                  </div>
                ))}
              </div>

              <Note tone="warning" title="Every direct publication is audited">
                The audit log records the action as <span className="font-mono font-semibold">DIRECT_PUBLICATION</span>{' '}
                together with the acting user, their role, the reason supplied and the date. It cannot be published
                without selecting a target issue.
              </Note>
            </Panel>

            <Panel title="Status reference" bodyClassName="p-0">
              <ul className="divide-y divide-ink-100">
                {Object.values(SUBMISSION_STATUS).map((s) => (
                  <li key={s} className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-start sm:gap-4">
                    <div className="sm:w-44 sm:shrink-0">
                      <StatusBadge status={s} size="sm" />
                    </div>
                    <p className="text-[0.8125rem] leading-relaxed text-ink-600">{STATUS_META[s].description}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}

        {tab === 'roles' && (
          <Panel title="Roles and permissions" bodyClassName="p-0">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Author</th>
                    <th>Reviewer</th>
                    <th>Editor</th>
                    <th>Administrator</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Submit a manuscript', true, false, false, false],
                    ['Upload a revision', true, false, false, false],
                    ['Submit a review report', false, true, false, false],
                    ['Assign a handling editor', false, false, true, true],
                    ['Invite reviewers', false, false, true, true],
                    ['Request revisions', false, false, true, true],
                    ['Accept or reject', false, false, true, true],
                    ['Move to production', false, false, true, true],
                    ['Publish directly (bypass review)', false, false, true, true],
                    ['Create and publish issues', false, false, true, true],
                    ['Manage users and settings', false, false, false, true],
                  ].map(([cap, a, r, e, ad]) => (
                    <tr key={cap}>
                      <td className="font-medium text-ink-900">{cap}</td>
                      {[a, r, e, ad].map((ok, i) => (
                        <td key={i} className="text-center">
                          {ok ? (
                            <Icon name="check" size={16} className="mx-auto text-emerald-600" strokeWidth={2.5} />
                          ) : (
                            <Icon name="close" size={14} className="mx-auto text-ink-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {tab === 'faq' && (
          <div className="space-y-3">
            {FAQ.map((f) => (
              <Panel key={f.q} title={f.q} bodyClassName="px-5 py-4">
                <p className="text-[0.875rem] leading-relaxed text-ink-600">{f.a}</p>
              </Panel>
            ))}
          </div>
        )}

        {tab === 'about' && (
          <>
            <Panel title="What this prototype is" bodyClassName="space-y-3 px-5 py-5">
              <p className="text-[0.875rem] leading-relaxed text-ink-600">
                A frontend-only design prototype for an academic journal management and publishing system, inspired by
                the general workflow of Open Journal Systems but substantially simpler. It exists to demonstrate
                navigation, information architecture and the publishing lifecycle.
              </p>
              <p className="text-[0.875rem] leading-relaxed text-ink-600">
                State is held in a Zustand store and persisted to local storage, so changes survive a page reload. Use{' '}
                <span className="font-medium text-ink-800">Reset prototype data</span> on any submission page to restore
                the original dataset.
              </p>
            </Panel>

            <Panel title="What is deliberately not implemented" bodyClassName="px-5 py-5">
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  'Real authentication',
                  'Backend or API',
                  'Database persistence',
                  'Email delivery',
                  'File upload and storage',
                  'PDF processing',
                  'DOI registration',
                  'ORCID integration',
                  'Payment handling',
                  'OAI-PMH endpoints',
                  'Plugin architecture',
                  'Complex permission rules',
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-[0.8125rem] text-ink-600">
                    <Icon name="close" size={13} className="shrink-0 text-ink-300" strokeWidth={2.5} />
                    {x}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Try the full lifecycle" bodyClassName="px-5 py-5">
              <ol className="space-y-2.5 text-[0.875rem] text-ink-600">
                <li>
                  <strong className="text-ink-900">1.</strong> Switch to the{' '}
                  <strong className="text-ink-900">Author</strong> role and start a new submission.
                </li>
                <li>
                  <strong className="text-ink-900">2.</strong> Switch to <strong className="text-ink-900">Editor</strong>{' '}
                  and open it from <Link to="/submissions" className="text-brand-600 hover:underline">Submissions</Link>.
                </li>
                <li>
                  <strong className="text-ink-900">3.</strong> Send it to review, then invite reviewers from the Reviews
                  tab.
                </li>
                <li>
                  <strong className="text-ink-900">4.</strong> Switch to <strong className="text-ink-900">Reviewer</strong>{' '}
                  and submit a report from My Reviews.
                </li>
                <li>
                  <strong className="text-ink-900">5.</strong> Return to Editor, open the Editorial Decision tab and
                  accept.
                </li>
                <li>
                  <strong className="text-ink-900">6.</strong> Alternatively, use{' '}
                  <strong className="text-ink-900">Publish Directly</strong> to bypass review, and confirm the action in
                  the dialog.
                </li>
                <li>
                  <strong className="text-ink-900">7.</strong> Check the Activity tab — the audit log records every step,
                  including a <span className="font-mono">DIRECT_PUBLICATION</span> entry with its reason.
                </li>
              </ol>
            </Panel>
          </>
        )}
      </div>
    </Page>
  )
}

const STAGE_HELP = {
  SUBMITTED: 'The manuscript arrives and is logged. An editor performs an initial scope and ethics check before assigning a handling editor.',
  UNDER_REVIEW: 'The handling editor invites external reviewers, who accept the invitation and submit reports by a deadline.',
  DECISION: 'The editor considers the reports and either accepts, requests a revision, or declines the manuscript. Authors may revise and resubmit, returning the manuscript to review.',
  PRODUCTION: 'Accepted articles are copy-edited, typeset and assigned a DOI. The author approves the final proof.',
  PUBLICATION: 'The article is placed in a numbered issue and becomes publicly available with a DOI and citation metadata.',
}
