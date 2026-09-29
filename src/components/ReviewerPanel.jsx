/**
 * Reviewer invitation panel.
 * Searches the reviewer pool by expertise and invites with a deadline.
 * @module components/ReviewerPanel
 */

import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import useJournalStore from '../store/useJournalStore'
import { ROLES } from '../domain/roles'
import { reviewInvitationTemplate } from '../data/journal'

import { Avatar } from './ui/primitives'
import Icon from './ui/Icon'

const DEADLINE_PRESETS = [14, 21, 30]

export default function ReviewerPanel({ submission, user, onInvite }) {
  const users = useJournalStore((s) => s.users)
  const inviteReviewer = useJournalStore((s) => s.inviteReviewer)

  const [q, setQ] = useState('')
  const [deadlineDays, setDeadlineDays] = useState(21)
  const [expanded, setExpanded] = useState(false)

  const invited = useMemo(
    () => new Set(submission.reviews.map((r) => r.reviewerId)),
    [submission.reviews],
  )

  const pool = useMemo(() => {
    const term = q.trim().toLowerCase()
    return users
      .filter((u) => u.role === ROLES.REVIEWER && u.status === 'active' && !invited.has(u.id))
      .filter(
        (u) =>
          !term ||
          u.name.toLowerCase().includes(term) ||
          u.affiliation.toLowerCase().includes(term) ||
          u.expertise?.some((e) => e.toLowerCase().includes(term)),
      )
      .sort((a, b) => (b.reviewsCompleted ?? 0) - (a.reviewsCompleted ?? 0))
      .slice(0, expanded ? 50 : 5)
  }, [users, q, invited, expanded])

  const deadline = () => {
    const d = new Date('2026-09-29T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + deadlineDays)
    return d.toISOString().slice(0, 10)
  }

  const invite = (reviewer) => {
    inviteReviewer(submission.id, reviewer.id, deadline(), user)
    onInvite?.(reviewer.name)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Invite a reviewer</h2>
          <p className="mt-0.5 text-[0.8125rem] text-ink-500">
            Reviewers are matched on expertise. Invitations are not emailed in this prototype.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-500" htmlFor="deadline-preset">
            Deadline
          </label>
          <select
            id="deadline-preset"
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            className="select btn-sm w-auto"
          >
            {DEADLINE_PRESETS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="relative">
          <Icon
            name="search"
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, institution or expertise…"
            className="input pl-9"
            aria-label="Search reviewers"
          />
        </div>

        <ul className="mt-4 divide-y divide-ink-100">
          {pool.map((r) => (
            <li key={r.id} className="flex items-start gap-3.5 py-3.5">
              <Avatar name={r.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900">{r.name}</p>
                <p className="text-[0.8125rem] text-ink-600">{r.affiliation}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {r.expertise?.slice(0, 3).map((e) => (
                    <span key={e} className="chip bg-ink-100 text-ink-600 ring-ink-200">
                      {e}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink-500">{r.reviewsCompleted} reviews completed</p>
              </div>
              <button onClick={() => invite(r)} className="btn-secondary btn-sm shrink-0">
                <Icon name="userPlus" size={13} />
                Invite
              </button>
            </li>
          ))}
          {pool.length === 0 && (
            <li className="py-6 text-center text-[0.8125rem] text-ink-500">
              {q ? `No reviewers match “${q}”.` : 'All active reviewers have already been invited.'}
            </li>
          )}
        </ul>

        {!expanded && users.filter((u) => u.role === ROLES.REVIEWER && !invited.has(u.id)).length > 5 && (
          <button onClick={() => setExpanded(true)} className="btn-ghost btn-sm mt-2 w-full">
            Show all available reviewers
          </button>
        )}
      </div>

      <div className="border-t border-ink-200 bg-ink-50/60 px-5 py-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
          <Icon name="info" size={13} className="mt-0.5 shrink-0" />
          <span>
            Invitation template: <span className="font-medium text-ink-600">{reviewInvitationTemplate.subject}</span> — no
            email is sent in this prototype.
          </span>
        </p>
      </div>
    </div>
  )
}

ReviewerPanel.propTypes = {
  submission: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onInvite: PropTypes.func,
}
