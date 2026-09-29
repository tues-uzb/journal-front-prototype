/**
 * Reviewer detail: profile, expertise, assigned reviews and history.
 * @module pages/ReviewerDetail
 */

import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { reviewerCounts } from '../store/selectors'
import { formatDate, relativeTime } from '../components/ActivityTimeline'
import { SUBMISSION_STATUS as S } from '../domain/status'

import {
  Page,
  Panel,
  StatTile,
  EmptyState,
  Avatar,
  DefinitionList,
  Tabs,
  RecommendationPill,
} from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

export default function ReviewerDetail() {
  const { id } = useParams()
  const users = useJournalStore((s) => s.users)
  const submissions = useJournalStore((s) => s.submissions)
  const [tab, setTab] = useState('assigned')

  const reviewer = users.find((u) => u.id === id)

  const reviews = useMemo(
    () =>
      submissions.flatMap((s) =>
        s.reviews.filter((r) => r.reviewerId === id).map((r) => ({ ...r, sub: s })),
      ),
    [submissions, id],
  )

  if (!reviewer) {
    return (
      <Page>
        <Panel bodyClassName="p-0">
          <EmptyState
            icon="search"
            title="Reviewer not found"
            action={
              <Link to="/reviews" className="btn-primary">
                Back to reviewers
              </Link>
            }
          />
        </Panel>
      </Page>
    )
  }

  const counts = reviewerCounts(submissions, id)
  const outstanding = reviews.filter(
    (r) => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS' || r.status === 'INVITED',
  )
  const history = reviews.filter((r) => r.status === 'SUBMITTED')

  return (
    <Page>
      <Link to="/reviews" className="btn-ghost btn-sm -ml-2 mb-4">
        <Icon name="chevronLeft" size={15} />
        All reviewers
      </Link>

      {/* Profile header */}
      <header className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={reviewer.name} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-[-0.015em] text-ink-900">{reviewer.name}</h1>
            <p className="mt-1 text-sm text-ink-600">{reviewer.affiliation}</p>
            <p className="mt-0.5 text-[0.8125rem] text-ink-500">
              {reviewer.country}
              {reviewer.email && ` · ${reviewer.email}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {reviewer.expertise?.map((e) => (
                <span key={e} className="chip bg-brand-50 text-brand-700 ring-brand-200">
                  {e}
                </span>
              ))}
            </div>
          </div>
          <span className="chip shrink-0 bg-ink-100 text-ink-600 ring-ink-200 capitalize">{reviewer.status}</span>
        </div>
      </header>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Assigned" value={counts.assigned} hint="All time" />
        <StatTile label="In progress" value={counts.active} tone={counts.active ? 'brand' : 'default'} hint="Underway" />
        <StatTile label="Completed" value={counts.completed} tone="good" hint="Reports submitted" />
        <StatTile label="Declined" value={counts.declined} hint="Invitations refused" />
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            { key: 'assigned', label: 'Assigned', count: outstanding.length },
            { key: 'history', label: 'Review history', count: history.length },
            { key: 'profile', label: 'Profile' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5">
        {tab === 'assigned' && (
          <Panel title="Current assignments" bodyClassName="p-0">
            {outstanding.length === 0 ? (
              <EmptyState
                icon="checkCircle"
                title="No outstanding assignments"
                description="This reviewer has nothing currently in progress."
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {outstanding.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/submissions/${r.submissionId}`}
                      className="flex flex-col gap-2.5 p-4 transition hover:bg-ink-50/60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900">{r.sub.title}</p>
                        <p className="mt-1 text-xs text-ink-500">
                          <span className="font-mono">{r.submissionId}</span> · Invited {formatDate(r.invited)}
                          {r.deadline && ` · Due ${formatDate(r.deadline)}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`chip ${
                            r.status === 'INVITED'
                              ? 'bg-ink-100 text-ink-600 ring-ink-200'
                              : 'bg-violet-50 text-violet-700 ring-violet-200'
                          }`}
                        >
                          {r.status === 'INVITED'
                            ? 'Invitation sent'
                            : r.status === 'ACCEPTED'
                              ? 'Accepted'
                              : 'In progress'}
                        </span>
                        <StatusBadge status={r.sub.status} size="sm" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {tab === 'history' && (
          <Panel
            title="Review history"
            description="Reports this reviewer has submitted."
            bodyClassName="p-0"
          >
            {history.length === 0 ? (
              <EmptyState icon="clipboard" title="No completed reviews" />
            ) : (
              <ul className="divide-y divide-ink-100">
                {history.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/submissions/${r.submissionId}`}
                      className="flex flex-col gap-2.5 p-4 transition hover:bg-ink-50/60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900">{r.sub.title}</p>
                        <p className="mt-1 text-xs text-ink-500">
                          Submitted {formatDate(r.submitted)} · {relativeTime(r.submitted)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <RecommendationPill value={r.recommendation} />
                        <StatusBadge status={r.sub.status ?? S.UNDER_REVIEW} size="sm" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {tab === 'profile' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Profile details" bodyClassName="px-5 py-5">
              <DefinitionList
                columns={1}
                items={[
                  { label: 'Full name', value: reviewer.name },
                  { label: 'Email', value: reviewer.email },
                  { label: 'Affiliation', value: reviewer.affiliation },
                  { label: 'Country', value: reviewer.country },
                  { label: 'Reviewer since', value: reviewer.joined ? formatDate(reviewer.joined) : '—' },
                  { label: 'Status', value: reviewer.status },
                ]}
              />
            </Panel>

            <Panel title="Areas of expertise" bodyClassName="px-5 py-5">
              {reviewer.expertise?.length ? (
                <div className="flex flex-wrap gap-2">
                  {reviewer.expertise.map((e) => (
                    <span key={e} className="chip bg-brand-50 text-brand-700 ring-brand-200">
                      {e}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500">No expertise recorded.</p>
              )}

              <div className="mt-5 border-t border-ink-100 pt-4">
                <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">
                  Review performance
                </p>
                <dl className="mt-2.5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-600">Reports submitted</dt>
                    <dd className="font-medium tabular-nums text-ink-900">{counts.completed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-600">Currently active</dt>
                    <dd className="font-medium tabular-nums text-ink-900">{counts.active}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-600">Invitations declined</dt>
                    <dd className="font-medium tabular-nums text-ink-900">{counts.declined}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-600">Last active</dt>
                    <dd className="font-medium text-ink-900">{relativeTime(reviewer.lastActive)}</dd>
                  </div>
                </dl>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </Page>
  )
}
