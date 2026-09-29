/**
 * Role-aware dashboard.
 *
 * Editors and administrators see the editorial queue; reviewers see their
 * assigned reviews; authors see their own manuscript pipeline. The layout is
 * the same shell, but the content and the available actions differ by role.
 *
 * @module pages/Dashboard
 */

import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { ROLES } from '../domain/roles'
import { SUBMISSION_STATUS as S } from '../domain/status'
import {
  statusCounts,
  needsAttention,
  authorCounts,
  sortActivity,
  reviewerCounts,
  allReviews,
} from '../store/selectors'

import { Page, PageHeader, Panel, StatTile, EmptyState } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import ActivityTimeline, { relativeTime, formatDateShort } from '../components/ActivityTimeline'
import Icon from '../components/ui/Icon'

/* ══ Editor / Administrator ═══════════════════════════════════════════ */

function EditorialDashboard({ user }) {
  const submissions = useJournalStore((s) => s.submissions)
  const users = useJournalStore((s) => s.users)

  const counts = useMemo(() => statusCounts(submissions), [submissions])
  const attention = useMemo(() => needsAttention(submissions), [submissions])

  const activity = useMemo(
    () => sortActivity(submissions.flatMap((s) => s.activity.map((a) => ({ ...a, submissionTitle: s.title })))).slice(0, 12),
    [submissions],
  )

  const editorName = (id) => users.find((u) => u.id === id)?.name ?? 'Unassigned'

  return (
    <Page>
      <PageHeader
        title={`Good morning, ${user.name.split(' ').slice(-1)[0]}`}
        description="Here is the current state of the editorial pipeline."
        actions={
          <Link to="/submissions" className="btn-primary">
            <Icon name="inbox" size={16} />
            View all submissions
          </Link>
        }
      />

      {/* Pipeline metrics */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Total" value={counts.total} hint="All time" />
        <StatTile label="New" value={counts.new} tone={counts.new ? 'brand' : 'default'} hint="Awaiting decision" />
        <StatTile label="Under review" value={counts.underReview} tone="default" hint="With reviewers" />
        <StatTile label="Revisions" value={counts.revisions} tone={counts.revisions ? 'warn' : 'default'} hint="With authors" />
        <StatTile label="Accepted" value={counts.accepted} tone="good" hint="Awaiting production" />
        <StatTile label="Published" value={counts.published} tone="good" hint="In an issue" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {/* Attention queue */}
        <Panel
          className="xl:col-span-2"
          title="Submissions requiring attention"
          description="New submissions, overdue reviews and accepted articles awaiting production."
          actions={
            <Link to="/submissions" className="btn-ghost btn-sm">
              View all
              <Icon name="chevronRight" size={14} />
            </Link>
          }
          bodyClassName="p-0"
        >
          {attention.length === 0 ? (
            <EmptyState icon="checkCircle" title="Nothing needs attention" description="The editorial queue is clear." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-[42%]">Manuscript</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Editor</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attention.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link
                          to={`/submissions/${s.id}`}
                          className="line-clamp-2 font-medium text-ink-900 hover:text-brand-600"
                        >
                          {s.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">{s.id}</p>
                      </td>
                      <td className="whitespace-nowrap">{s.authors[0]?.name}</td>
                      <td>
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="whitespace-nowrap text-ink-500">
                        {s.submitted ? relativeTime(s.submitted) : '—'}
                      </td>
                      <td className="whitespace-nowrap">{editorName(s.assignedEditorId)}</td>
                      <td className="text-right">
                        <Link to={`/submissions/${s.id}`} className="btn-secondary btn-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Activity */}
        <Panel
          title="Recent activity"
          actions={
            <span className="text-xs text-ink-400">Latest {Math.min(activity.length, 12)}</span>
          }
          bodyClassName="px-5 py-5"
        >
          <ActivityTimeline entries={activity.slice(0, 8)} emptyMessage="No activity recorded." />
        </Panel>
      </div>
    </Page>
  )
}

/* ══ Reviewer ══════════════════════════════════════════════════════════ */

function ReviewerDashboard({ user }) {
  const submissions = useJournalStore((s) => s.submissions)

  const mine = useMemo(
    () => allReviews(submissions).filter((r) => r.reviewerId === user.id),
    [submissions, user.id],
  )
  const counts = reviewerCounts(submissions, user.id)

  const outstanding = mine.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS' || r.status === 'INVITED')
  const completed = mine.filter((r) => r.status === 'SUBMITTED').slice(0, 5)
  const titleFor = (id) => submissions.find((s) => s.id === id)?.title ?? id
  const statusFor = (id) => submissions.find((s) => s.id === id)?.status

  return (
    <Page>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ').slice(-1)[0]}`}
        description={`You are reviewing for ${user.affiliation}. You have ${counts.pending} pending invitation${counts.pending === 1 ? '' : 's'}.`}
        actions={
          <Link to="/my-reviews" className="btn-primary">
            <Icon name="clipboard" size={16} />
            Go to my reviews
          </Link>
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Assigned" value={counts.assigned} hint="All time" />
        <StatTile label="In progress" value={counts.active} tone={counts.active ? 'brand' : 'default'} hint="Accepted, not submitted" />
        <StatTile label="Pending" value={counts.pending} tone={counts.pending ? 'warn' : 'default'} hint="Awaiting your response" />
        <StatTile label="Completed" value={counts.completed} tone="good" hint="Reviews submitted" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Panel
          title="Outstanding reviews"
          description="Manuscripts awaiting your review."
          bodyClassName="p-0"
          actions={
            <Link to="/my-reviews" className="btn-ghost btn-sm">
              View all
              <Icon name="chevronRight" size={14} />
            </Link>
          }
        >
          {outstanding.length === 0 ? (
            <EmptyState icon="checkCircle" title="No outstanding reviews" description="You are all caught up." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {outstanding.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/submissions/${r.submissionId}`} className="font-medium text-ink-900 hover:text-brand-600">
                        {titleFor(r.submissionId)}
                      </Link>
                      <p className="mt-1 text-xs text-ink-500">
                        Invited {formatDateShort(r.invited)}
                        {r.deadline && ` · Due ${formatDateShort(r.deadline)}`}
                      </p>
                    </div>
                    <StatusBadge status={statusFor(r.submissionId)} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recently completed" bodyClassName="p-0">
          {completed.length === 0 ? (
            <EmptyState icon="clipboard" title="No completed reviews yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {completed.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link to={`/submissions/${r.submissionId}`} className="text-[0.8125rem] font-medium text-ink-900 hover:text-brand-600">
                      {titleFor(r.submissionId)}
                    </Link>
                    <p className="mt-1 text-xs text-ink-500">Submitted {formatDateShort(r.submitted)}</p>
                  </div>
                  <span className="chip shrink-0 bg-emerald-50 text-emerald-700 ring-emerald-200">
                    {r.recommendation}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </Page>
  )
}

/* ══ Author ════════════════════════════════════════════════════════════ */

function AuthorDashboard({ user }) {
  const submissions = useJournalStore((s) => s.submissions)
  const issues = useJournalStore((s) => s.issues)

  const mine = useMemo(
    () => submissions.filter((s) => s.authors.some((a) => a.email === user.email)),
    [submissions, user.email],
  )
  const counts = authorCounts(submissions, user.name)
  const issueFor = (id) => issues.find((i) => i.id === id)

  const byStatus = [
    { key: 'DRAFT', label: 'Drafts', items: mine.filter((s) => s.status === S.DRAFT) },
    { key: 'REVISION_REQUIRED', label: 'Revisions requested', items: mine.filter((s) => s.status === S.REVISION_REQUIRED) },
    { key: 'ACTIVE', label: 'In the editorial process', items: mine.filter((s) => [S.SUBMITTED, S.UNDER_REVIEW].includes(s.status)) },
    { key: 'ACCEPTED', label: 'Accepted', items: mine.filter((s) => [S.ACCEPTED, S.IN_PRODUCTION].includes(s.status)) },
    { key: 'PUBLISHED', label: 'Published', items: mine.filter((s) => s.status === S.PUBLISHED) },
  ].filter((g) => g.items.length)

  return (
    <Page>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ').slice(-1)[0]}`}
        description="Track your manuscripts through review and publication."
        actions={
          <Link to="/submissions/new" className="btn-primary">
            <Icon name="plus" size={16} />
            New submission
          </Link>
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Total" value={counts.total} hint="All manuscripts" />
        <StatTile label="Drafts" value={counts.drafts} hint="Not yet submitted" />
        <StatTile label="In review" value={counts.submitted} hint="With the journal" />
        <StatTile label="Revisions" value={counts.revisions} tone={counts.revisions ? 'warn' : 'default'} hint="Action needed" />
        <StatTile label="Published" value={counts.published} tone="good" hint="Live articles" />
      </div>

      {mine.length === 0 ? (
        <Panel className="mt-6" bodyClassName="p-0">
          <EmptyState
            icon="file"
            title="You have no manuscripts yet"
            description="Start a new submission to send your research to the journal for peer review."
            action={
              <Link to="/submissions/new" className="btn-primary">
                Start a submission
              </Link>
            }
          />
        </Panel>
      ) : (
        <div className="mt-6 space-y-5">
          {byStatus.map((group) => (
            <Panel
              key={group.key}
              title={group.label}
              description={`${group.items.length} manuscript${group.items.length === 1 ? '' : 's'}`}
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-ink-100">
                {group.items.map((s) => {
                  const issue = issueFor(s.issueId)
                  return (
                    <li key={s.id}>
                      <Link
                        to={s.status === S.PUBLISHED ? `/publications/${s.id}` : `/submissions/${s.id}`}
                        className="flex flex-col gap-2 p-4 transition hover:bg-ink-50/60 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-ink-900">{s.title}</p>
                          <p className="mt-1 text-xs text-ink-500">
                            <span className="font-mono">{s.id}</span>
                            {issue && ` · Volume ${issue.volume}, Issue ${issue.number}`}
                            {s.lastActivity && ` · Updated ${relativeTime(s.lastActivity)}`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {s.status === S.REVISION_REQUIRED && (
                            <span className="text-xs font-medium text-amber-700">Response needed</span>
                          )}
                          <StatusBadge status={s.status} size="sm" />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </Page>
  )
}

/* ══ Route ═════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { role, user } = useOutletContext()

  if (role === ROLES.AUTHOR) return <AuthorDashboard user={user} />
  if (role === ROLES.REVIEWER) return <ReviewerDashboard user={user} />

  return <EditorialDashboard user={user} />
}
