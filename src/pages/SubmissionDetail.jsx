/**
 * Submission detail — the core editorial screen.
 *
 * Header with manuscript identity, a workflow timeline, tabbed content for
 * each facet of the submission, and the editorial decision panel.
 *
 * @module pages/SubmissionDetail
 */

import { useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { SUBMISSION_STATUS as S } from '../domain/status'
import { ROLES, ROLE_META, canAssignReviewers, isEditorial } from '../domain/roles'
import { sortActivity } from '../store/selectors'
import { issueFullLabel } from '../data/issues'

import { Page, Panel, Tabs, DefinitionList, Note, EmptyState, Avatar, RecommendationPill } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'
import WorkflowTimeline from '../components/WorkflowTimeline'
import ActivityTimeline, { formatDate, relativeTime } from '../components/ActivityTimeline'
import EditorialDecisionPanel from '../components/EditorialDecisionPanel'
import ReviewerPanel from '../components/ReviewerPanel'
import ReviewDetail from '../components/ReviewDetail'

export default function SubmissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pushToast, user, role } = useOutletContext()

  const submission = useJournalStore((s) => s.submissions.find((x) => x.id === id))
  const users = useJournalStore((s) => s.users)
  const issues = useJournalStore((s) => s.issues)
  const assignEditor = useJournalStore((s) => s.assignEditor)

  const [tab, setTab] = useState('overview')
  const [openReview, setOpenReview] = useState(null)

  const activity = useMemo(
    () => (submission ? sortActivity(submission.activity) : []),
    [submission],
  )

  if (!submission) {
    return (
      <Page>
        <Panel bodyClassName="p-0">
          <EmptyState
            icon="search"
            title="Submission not found"
            description={`No manuscript exists with the identifier ${id}.`}
            action={
              <Link to="/submissions" className="btn-primary">
                Back to submissions
              </Link>
            }
          />
        </Panel>
      </Page>
    )
  }

  const editor = users.find((u) => u.id === submission.assignedEditorId)
  const issue = issues.find((i) => i.id === submission.issueId)
  const userFor = (uid) => users.find((u) => u.id === uid)
  const completedReviews = submission.reviews.filter((r) => r.status === 'SUBMITTED')

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'files', label: 'Files', count: submission.files.length },
    { key: 'authors', label: 'Authors', count: submission.authors.length },
    { key: 'reviews', label: 'Reviews', count: submission.reviews.length },
    { key: 'decision', label: 'Editorial Decision' },
    { key: 'activity', label: 'Activity', count: activity.length },
  ]

  const onDecisionDone = (action) => {
    const messages = {
      accept: { tone: 'success', title: 'Manuscript accepted', message: 'The authors have been notified. The article can now be moved to production.' },
      reject: { tone: 'error', title: 'Manuscript declined', message: 'The authors have been notified with your decision.' },
      requestRevision: { tone: 'warning', title: 'Revision requested', message: 'The authors have been invited to submit a revised manuscript.' },
      sendToReview: { tone: 'info', title: 'Sent for peer review', message: 'You can now invite reviewers to this manuscript.' },
      moveToProduction: { tone: 'info', title: 'Moved to production', message: 'The article is now being copy-edited and typeset.' },
      publish: { tone: 'success', title: 'Article published', message: 'The article is now live in the selected issue.' },
      publishDirectly: {
        tone: 'warning',
        title: 'Published directly',
        message: 'Peer review was bypassed. The action has been recorded in the audit log.',
      },
    }
    pushToast(messages[action] ?? { tone: 'info', title: 'Workflow updated' })
    setTab('activity')
  }

  return (
    <Page>
      {/* ── Back link ── */}
      <Link to="/submissions" className="btn-ghost btn-sm -ml-2 mb-4">
        <Icon name="chevronLeft" size={15} />
        All submissions
      </Link>

      {/* ── Header ── */}
      <header className="panel overflow-hidden">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={submission.status} />
                {submission.directPublication && (
                  <span className="chip bg-amber-50 text-amber-800 ring-amber-200">
                    <Icon name="zap" size={10} strokeWidth={2.5} />
                    Direct publication
                  </span>
                )}
                <span className="font-mono text-[0.75rem] text-ink-400">{submission.id}</span>
              </div>

              <h1 className="mt-3 text-xl leading-snug font-semibold tracking-[-0.015em] text-ink-900 sm:text-[1.5rem]">
                {submission.title}
              </h1>

              <p className="mt-2.5 text-sm text-ink-600">
                {submission.authors.map((a) => a.name).join(', ')}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.8125rem] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" size={14} />
                  Submitted {submission.submitted ? formatDate(submission.submitted) : 'not yet'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="book" size={14} />
                  {submission.articleType}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="layers" size={14} />
                  {submission.section}
                </span>
                {issue && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="globe" size={14} />
                    {issueFullLabel(issue)}
                  </span>
                )}
              </div>
            </div>

            {/* Public article shortcut */}
            {submission.status === S.PUBLISHED && (
              <Link to={`/publications/${submission.id}`} className="btn-secondary shrink-0">
                <Icon name="external" size={15} />
                View public article
              </Link>
            )}
          </div>
        </div>

        {/* Workflow timeline */}
        <div className="border-t border-ink-200 bg-ink-50/50 px-5 py-5 sm:px-6">
          <WorkflowTimeline submission={submission} />
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="mt-6">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              <Panel title="Article information" bodyClassName="px-5 py-5">
                <DefinitionList
                  items={[
                    { label: 'Title', value: submission.title },
                    { label: 'Article type', value: submission.articleType },
                    { label: 'Section', value: submission.section },
                    { label: 'Journal', value: 'Journal of Applied Sciences and Sustainable Development' },
                  ]}
                />
              </Panel>

              <Panel title="Abstract" bodyClassName="px-5 py-5">
                <p className="prose-abstract">{submission.abstract}</p>
              </Panel>

              <Panel title="Keywords" bodyClassName="px-5 py-5">
                <div className="flex flex-wrap gap-2">
                  {submission.keywords.map((k) => (
                    <span key={k} className="chip bg-ink-100 text-ink-700 ring-ink-200">
                      {k}
                    </span>
                  ))}
                </div>
              </Panel>

              <Panel
                title="Assigned editor"
                actions={
                  canAssignReviewers(role) && (
                    <select
                      value={submission.assignedEditorId ?? ''}
                      onChange={(e) => {
                        assignEditor(submission.id, e.target.value, user)
                        pushToast({ tone: 'info', title: 'Handling editor assigned' })
                      }}
                      className="select btn-sm w-auto"
                      aria-label="Assign editor"
                    >
                      <option value="">Unassigned</option>
                      {users
                        .filter((u) => u.role === ROLES.EDITOR || u.role === ROLES.ADMIN)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  )
                }
                bodyClassName="px-5 py-5"
              >
                {editor ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={editor.name} size={40} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900">{editor.name}</p>
                      <p className="text-[0.8125rem] text-ink-500">{editor.affiliation}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-ink-500">No handling editor assigned yet.</p>
                )}
              </Panel>
            </div>
          )}

          {/* ── Files ── */}
          {tab === 'files' && (
            <Panel title="Submission files" description="All files associated with this manuscript." bodyClassName="p-0">
              {submission.files.length === 0 ? (
                <EmptyState icon="paperclip" title="No files uploaded" />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th>Type</th>
                        <th>Version</th>
                        <th>Uploaded</th>
                        <th>Uploaded by</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submission.files.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <span className="flex items-center gap-2.5 font-medium text-ink-900">
                              <Icon name="file" size={15} className="shrink-0 text-ink-400" />
                              <span className="truncate">{f.name}</span>
                              <span className="shrink-0 rounded bg-ink-100 px-1.5 py-px text-[0.625rem] font-semibold text-ink-600">
                                {f.format}
                              </span>
                            </span>
                            {f.note && <p className="mt-1 pl-[1.375rem] text-xs text-ink-500">{f.note}</p>}
                          </td>
                          <td className="whitespace-nowrap">{f.type}</td>
                          <td className="whitespace-nowrap tabular-nums">v{f.version}</td>
                          <td className="whitespace-nowrap text-ink-500">{formatDate(f.uploaded)}</td>
                          <td className="whitespace-nowrap">{f.uploadedBy}</td>
                          <td className="text-right">
                            <button
                              onClick={() =>
                                pushToast({
                                  tone: 'info',
                                  title: 'Prototype',
                                  message: `“${f.name}” would download in a production system. No file storage is implemented.`,
                                })
                              }
                              className="btn-secondary btn-sm"
                            >
                              <Icon name="download" size={13} />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          )}

          {/* ── Authors ── */}
          {tab === 'authors' && (
            <Panel title="Authors" description="Listed in order of authorship as submitted." bodyClassName="p-0">
              <ul className="divide-y divide-ink-100">
                {submission.authors.map((a) => (
                  <li key={a.id} className="flex items-start gap-3.5 p-5">
                    <Avatar name={a.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink-900">{a.name}</p>
                        {a.isCorresponding && (
                          <span className="chip bg-brand-50 text-brand-700 ring-brand-200">Corresponding author</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[0.8125rem] text-ink-600">{a.affiliation}</p>
                      {a.country && <p className="text-xs text-ink-500">{a.country}</p>}
                      <a
                        href={`mailto:${a.email}`}
                        className="mt-1.5 inline-block text-[0.8125rem] text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {a.email}
                      </a>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">
                        Author
                      </span>
                      <span className="mt-0.5 block text-sm tabular-nums text-ink-800">{a.order}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* ── Reviews ── */}
          {tab === 'reviews' && (
            <div className="space-y-5">
              <Panel
                title="Peer review"
                description={
                  completedReviews.length > 0
                    ? `${completedReviews.length} of ${submission.reviews.length} reviews submitted`
                    : 'No reviews submitted yet'
                }
                bodyClassName="p-0"
              >
                {submission.reviews.length === 0 ? (
                  <EmptyState
                    icon="clipboard"
                    title="No reviewers assigned"
                    description="Invite reviewers to begin external peer review of this manuscript."
                  />
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {submission.reviews.map((r) => {
                      const reviewer = userFor(r.reviewerId)
                      const expanded = openReview === r.id
                      return (
                        <li key={r.id} className="p-5">
                          <div className="flex items-start gap-3.5">
                            <Avatar name={reviewer?.name} size={36} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-ink-900">
                                  {r.isBlind && r.status !== 'SUBMITTED' ? `Reviewer ${r.id.slice(-2).toUpperCase()}` : reviewer?.name}
                                </p>
                                <ReviewStatusPill status={r.status} deadline={r.deadline} />
                              </div>
                              <p className="mt-0.5 text-[0.8125rem] text-ink-500">{reviewer?.affiliation}</p>
                              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-500">
                                <span>Invited {formatDate(r.invited)}</span>
                                {r.responded && <span>Responded {formatDate(r.responded)}</span>}
                                {r.deadline && <span>Due {formatDate(r.deadline)}</span>}
                              </div>
                            </div>
                            {r.status === 'SUBMITTED' && (
                              <button
                                onClick={() => setOpenReview(expanded ? null : r.id)}
                                className="btn-secondary btn-sm shrink-0"
                              >
                                {expanded ? 'Hide' : 'View review'}
                                <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={13} />
                              </button>
                            )}
                          </div>

                          {r.status === 'SUBMITTED' && !expanded && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
                              <span className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">
                                Recommendation
                              </span>
                              <RecommendationPill value={r.recommendation} />
                            </div>
                          )}

                          {expanded && <ReviewDetail review={r} reviewer={reviewer} />}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Panel>

              {canAssignReviewers(role) && submission.status !== S.PUBLISHED && submission.status !== S.REJECTED && (
                <ReviewerPanel submission={submission} user={user} onInvite={(name) => {
                  pushToast({ tone: 'success', title: 'Reviewer invited', message: name })
                  setTab('activity')
                }} />
              )}
            </div>
          )}

          {/* ── Decision ── */}
          {tab === 'decision' && (
            <div className="space-y-5">
              <Panel title="Editorial decision" bodyClassName="px-5 py-5">
                <EditorialDecisionPanel
                  submission={submission}
                  role={role}
                  user={user}
                  onDone={onDecisionDone}
                />
              </Panel>

              {/* Review summary used to inform the decision */}
              {completedReviews.length > 0 && (
                <Panel title="Review summary" bodyClassName="px-5 py-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {completedReviews.map((r) => {
                      const reviewer = userFor(r.reviewerId)
                      return (
                        <div key={r.id} className="rounded-lg border border-ink-200 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[0.8125rem] font-medium text-ink-900">{reviewer?.name}</p>
                            <RecommendationPill value={r.recommendation} />
                          </div>
                          <p className="mt-2 line-clamp-4 text-[0.8125rem] leading-relaxed text-ink-600">
                            {r.summary}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              )}

              {isEditorial(role) && completedReviews.length < 2 && submission.status !== S.PUBLISHED && (
                <Note tone="warning" title="Insufficient reviews for a final decision">
                  The journal requires a minimum of two submitted reviews before an accept or reject decision. You can
                  still request a revision, send the manuscript to production, or use direct publication if the
                  circumstances warrant it.
                </Note>
              )}
            </div>
          )}

          {/* ── Activity ── */}
          {tab === 'activity' && (
            <Panel
              title="Audit log"
              description="Every editorial action is recorded, including direct publication."
              bodyClassName="px-5 py-5"
              actions={
                <button
                  onClick={() => pushToast({ tone: 'info', title: 'Prototype', message: 'The audit log would be exportable as CSV in production.' })}
                  className="btn-secondary btn-sm"
                >
                  <Icon name="download" size={13} />
                  Export log
                </button>
              }
            >
              <ActivityTimeline entries={activity} />
            </Panel>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-5">
          <Panel title="Manuscript details" bodyClassName="px-5 py-5">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Submission ID', value: submission.id, mono: true },
                { label: 'Status', value: <StatusBadge status={submission.status} size="sm" /> },
                { label: 'Article type', value: submission.articleType },
                { label: 'Section', value: submission.section },
                { label: 'Submitted', value: submission.submitted ? formatDate(submission.submitted) : 'Not submitted' },
                { label: 'Last activity', value: relativeTime(submission.lastActivity) },
                { label: 'Handling editor', value: editor?.name ?? 'Unassigned' },
                { label: 'DOI', value: submission.doi ?? 'Not assigned', mono: Boolean(submission.doi) },
                issue && { label: 'Issue', value: issueFullLabel(issue) },
                submission.pages && { label: 'Pages', value: submission.pages },
              ]}
            />
          </Panel>

          {submission.directPublication && (
            <Panel title="Direct publication record" bodyClassName="px-5 py-5">
              <DirectPublicationRecord submission={submission} />
            </Panel>
          )}

          {/* Reviewer list summary */}
          <Panel title="Reviewers" bodyClassName="p-0">
            {submission.reviews.length === 0 ? (
              <p className="px-5 py-6 text-center text-[0.8125rem] text-ink-500">No reviewers assigned.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {submission.reviews.map((r) => {
                  const reviewer = userFor(r.reviewerId)
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar name={reviewer?.name} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-medium text-ink-900">
                          {r.isBlind && r.status !== 'SUBMITTED' ? 'Anonymous reviewer' : reviewer?.name}
                        </p>
                        <p className="text-xs text-ink-500">{r.status.replace(/_/g, ' ').toLowerCase()}</p>
                      </div>
                      {r.status === 'SUBMITTED' && <RecommendationPill value={r.recommendation} compact />}
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          {role === ROLES.ADMIN && (
            <Panel bodyClassName="px-5 py-4">
              <button
                onClick={() => {
                  useJournalStore.getState().resetData()
                  pushToast({ tone: 'info', title: 'Prototype data reset', message: 'All submissions, issues and settings have been restored.' })
                  navigate('/')
                }}
                className="btn-secondary btn-sm w-full"
              >
                <Icon name="refresh" size={14} />
                Reset prototype data
              </button>
            </Panel>
          )}
        </aside>
      </div>
    </Page>
  )
}

/* ── Small local presentational helpers ───────────────────────────────── */

/**
 * Structured record of the administrative action that published a manuscript
 * outside the peer-review workflow. The acting user and role are read from the
 * audit log rather than hard-coded, so the record always matches what happened.
 */
function DirectPublicationRecord({ submission }) {
  const entry = sortActivity(submission.activity).find((a) => a.type === 'DIRECT_PUBLICATION')
  const actor = entry?.actor ?? 'Unknown user'
  const actorRole = entry ? ROLE_META[entry.actorRole]?.label : '—'

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-4">
      <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-amber-900">
        <Icon name="zap" size={15} />
        Bypassed peer review
      </p>
      <dl className="mt-3 space-y-2.5 text-[0.8125rem]">
        <div>
          <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-amber-800/70 uppercase">Action</dt>
          <dd className="mt-0.5 font-mono text-amber-900">DIRECT_PUBLICATION</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-amber-800/70 uppercase">User</dt>
          <dd className="mt-0.5 text-amber-900">
            {actor} · {actorRole}
          </dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-amber-800/70 uppercase">Reason</dt>
          <dd className="mt-0.5 text-amber-900 italic">“{entry?.reason ?? submission.directPublicationReason}”</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-amber-800/70 uppercase">Date</dt>
          <dd className="mt-0.5 text-amber-900">{formatDate(entry?.timestamp ?? submission.publishedDate)}</dd>
        </div>
      </dl>
    </div>
  )
}

function ReviewStatusPill({ status, deadline }) {
  const today = '2026-09-29'
  const overdue = deadline && deadline < today && ['INVITED', 'ACCEPTED', 'IN_PROGRESS'].includes(status)

  const map = {
    INVITED: { cls: 'bg-ink-100 text-ink-600 ring-ink-200', label: 'Invited' },
    ACCEPTED: { cls: 'bg-sky-50 text-sky-700 ring-sky-200', label: 'Invitation accepted' },
    IN_PROGRESS: { cls: 'bg-violet-50 text-violet-700 ring-violet-200', label: 'Review in progress' },
    SUBMITTED: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Review submitted' },
    DECLINED: { cls: 'bg-rose-50 text-rose-700 ring-rose-200', label: 'Declined' },
  }
  const m = map[status] ?? map.INVITED

  return (
    <span className="flex items-center gap-1.5">
      <span className={`chip ${m.cls}`}>{m.label}</span>
      {overdue && <span className="chip bg-rose-50 text-rose-700 ring-rose-200">Overdue</span>}
    </span>
  )
}
