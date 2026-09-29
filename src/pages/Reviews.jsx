/**
 * Reviewer management.
 *
 * As an editorial tool this page shows the reviewer pool; for the Reviewer
 * role the same route is reused for "who am I reviewing" via MyReviews.
 *
 * @module pages/Reviews
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { ROLES } from '../domain/roles'
import { reviewerCounts, allReviews } from '../store/selectors'
import { relativeTime } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState, Avatar } from '../components/ui/primitives'
import Icon from '../components/ui/Icon'

export default function Reviews() {
  const users = useJournalStore((s) => s.users)
  const submissions = useJournalStore((s) => s.submissions)

  const [q, setQ] = useState('')
  const [sort, setSort] = useState('completed')

  const reviewers = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = users
      .filter((u) => u.role === ROLES.REVIEWER)
      .map((u) => ({ ...u, counts: reviewerCounts(submissions, u.id) }))
      .filter(
        (r) =>
          !term ||
          r.name.toLowerCase().includes(term) ||
          r.affiliation.toLowerCase().includes(term) ||
          r.expertise?.some((e) => e.toLowerCase().includes(term)),
      )

    const sorters = {
      completed: (a, b) => b.counts.completed - a.counts.completed,
      active: (a, b) => b.counts.active - a.counts.active,
      name: (a, b) => a.name.localeCompare(b.name),
    }
    return list.sort(sorters[sort])
  }, [users, submissions, q, sort])

  const allAssigned = allReviews(submissions)
  const pendingInvitations = allAssigned.filter((r) => r.status === 'INVITED').length
  const awaiting = allAssigned.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS').length
  const completed = allAssigned.filter((r) => r.status === 'SUBMITTED').length

  const titleFor = (id) => submissions.find((s) => s.id === id)?.title ?? id

  return (
    <Page>
      <PageHeader
        title="Reviewers"
        description="The reviewer pool, their current workload and their review history."
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Reviewers" value={users.filter((u) => u.role === ROLES.REVIEWER).length} hint="In the pool" />
        <StatTile label="Invitations" value={pendingInvitations} tone={pendingInvitations ? 'warn' : 'default'} hint="Awaiting response" />
        <StatTile label="In progress" value={awaiting} tone={awaiting ? 'brand' : 'default'} hint="Reviews underway" />
        <StatTile label="Completed" value={completed} tone="good" hint="Reports submitted" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reviewers by name, institution or expertise…"
            className="input pl-9"
            aria-label="Search reviewers"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="select sm:w-auto" aria-label="Sort reviewers">
          <option value="completed">Sort: Most reviews</option>
          <option value="active">Sort: Most active</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviewers.map((r) => (
          <Panel key={r.id} bodyClassName="p-5" className="transition hover:border-ink-300 hover:shadow-raised">
            <Link to={`/reviewers/${r.id}`} className="group flex items-start gap-3.5">
              <Avatar name={r.name} size={42} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-600">{r.name}</p>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-600">{r.affiliation}</p>
              </div>
            </Link>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {r.expertise?.map((e) => (
                <span key={e} className="chip bg-ink-100 text-ink-600 ring-ink-200">
                  {e}
                </span>
              ))}
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3.5 text-center">
              <div>
                <dt className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Assigned</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink-900">{r.counts.assigned}</dd>
              </div>
              <div>
                <dt className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Active</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-brand-700">{r.counts.active}</dd>
              </div>
              <div>
                <dt className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Done</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-emerald-700">{r.counts.completed}</dd>
              </div>
            </dl>

            {r.counts.pending > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
                <Icon name="clock" size={12} />
                {r.counts.pending} invitation{r.counts.pending === 1 ? '' : 's'} pending
              </p>
            )}

            {r.lastActive && (
              <p className="mt-2 text-xs text-ink-500">Last active {relativeTime(r.lastActive)}</p>
            )}
          </Panel>
        ))}
      </div>

      {reviewers.length === 0 && (
        <Panel className="mt-5" bodyClassName="p-0">
          <EmptyState icon="search" title="No reviewers match your search" />
        </Panel>
      )}

      {/* Outstanding review assignments across the journal */}
      <Panel
        className="mt-6"
        title="Outstanding review assignments"
        description="Every manuscript currently awaiting a reviewer report."
        bodyClassName="p-0"
      >
        {(() => {
          const outstanding = allAssigned.filter((r) => r.status !== 'SUBMITTED' && r.status !== 'DECLINED')
          if (outstanding.length === 0) {
            return <EmptyState icon="checkCircle" title="No outstanding reviews" />
          }
          return (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Manuscript</th>
                    <th>Reviewer</th>
                    <th>Status</th>
                    <th>Invited</th>
                    <th>Due</th>
                    <th className="text-right">Article</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map((r) => {
                    const reviewer = users.find((u) => u.id === r.reviewerId)
                    const overdue = r.deadline && r.deadline < '2026-09-29'
                    return (
                      <tr key={r.id}>
                        <td className="max-w-[24rem]">
                          <span className="line-clamp-1 font-medium text-ink-900">{titleFor(r.submissionId)}</span>
                        </td>
                        <td className="whitespace-nowrap">{reviewer?.name}</td>
                        <td>
                          <span
                            className={`chip ${
                              r.status === 'INVITED'
                                ? 'bg-ink-100 text-ink-600 ring-ink-200'
                                : 'bg-violet-50 text-violet-700 ring-violet-200'
                            }`}
                          >
                            {r.status === 'INVITED' ? 'Invited' : 'In progress'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-ink-500">{r.invited}</td>
                        <td className={`whitespace-nowrap ${overdue ? 'font-medium text-rose-600' : 'text-ink-500'}`}>
                          {r.deadline ?? '—'}
                        </td>
                        <td className="text-right">
                          <Link to={`/submissions/${r.submissionId}`} className="btn-secondary btn-sm">
                            Open
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })()}
      </Panel>
    </Page>
  )
}
