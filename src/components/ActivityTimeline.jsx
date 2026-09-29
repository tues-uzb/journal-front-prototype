/**
 * Audit / activity log renderer.
 *
 * Every significant editorial action writes an entry, and direct publication
 * is always recorded explicitly (action, actor, role, reason, date) so the
 * bypass is auditable rather than implicit.
 *
 * @module components/ActivityTimeline
 */

import PropTypes from 'prop-types'
import { ACTIVITY, ACTIVITY_ICON } from '../domain/workflow'
import { ROLE_META } from '../domain/roles'
import Icon from './ui/Icon'

/** Entries that should be visually emphasised in the log. */
const EMPHASIS = {
  [ACTIVITY.DIRECT_PUBLICATION]: { ring: 'ring-amber-200', bg: 'bg-amber-500', text: 'text-amber-700' },
  [ACTIVITY.SUBMISSION_ACCEPTED]: { ring: 'ring-emerald-200', bg: 'bg-emerald-600', text: 'text-emerald-700' },
  [ACTIVITY.SUBMISSION_REJECTED]: { ring: 'ring-rose-200', bg: 'bg-rose-500', text: 'text-rose-700' },
  [ACTIVITY.REVISION_REQUESTED]: { ring: 'ring-amber-200', bg: 'bg-amber-500', text: 'text-amber-700' },
  [ACTIVITY.ARTICLE_PUBLISHED]: { ring: 'ring-emerald-200', bg: 'bg-green-800', text: 'text-green-800' },
  [ACTIVITY.SUBMISSION_RECEIVED]: { ring: 'ring-sky-200', bg: 'bg-sky-600', text: 'text-sky-700' },
}

const ROLE_BADGE = {
  ADMIN: 'bg-ink-900 text-white',
  EDITOR: 'bg-brand-100 text-brand-700',
  REVIEWER: 'bg-violet-100 text-violet-700',
  AUTHOR: 'bg-ink-100 text-ink-600',
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function formatDateShort(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/** Relative time against a fixed "today" so the prototype is deterministic. */
const TODAY = '2026-09-29'
export function relativeTime(iso) {
  if (!iso) return '—'
  const then = new Date(`${iso}T00:00:00Z`).getTime()
  const now = new Date(`${TODAY}T00:00:00Z`).getTime()
  const days = Math.round((now - then) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 31) {
    const w = Math.floor(days / 7)
    return `${w} week${w > 1 ? 's' : ''} ago`
  }
  if (days < 365) {
    const m = Math.floor(days / 30)
    return `${m} month${m > 1 ? 's' : ''} ago`
  }
  const y = Math.floor(days / 365)
  return `${y} year${y > 1 ? 's' : ''} ago`
}

export default function ActivityTimeline({ entries, emptyMessage = 'No recorded activity yet.', showRoles = true }) {
  if (!entries?.length) {
    return <p className="px-1 py-6 text-center text-[0.8125rem] text-ink-500">{emptyMessage}</p>
  }

  return (
    <ol className="relative">
      {entries.map((e, i) => {
        const em = EMPHASIS[e.type]
        const isLast = i === entries.length - 1
        return (
          <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!isLast && (
              <span className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-ink-200" aria-hidden="true" />
            )}
            <span
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-white ${
                em ? `${em.bg} ${em.ring}` : 'bg-ink-200 text-ink-500'
              }`}
            >
              <Icon
                name={ACTIVITY_ICON[e.type] ?? 'info'}
                size={15}
                strokeWidth={2}
                className={em ? 'text-white' : ''}
              />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[0.8125rem] leading-relaxed text-ink-800">{e.label}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                <span className="font-medium text-ink-600">{e.actor}</span>
                {showRoles && e.actorRole && (
                  <span className={`rounded px-1.5 py-px text-[0.625rem] font-semibold ${ROLE_BADGE[e.actorRole] ?? ROLE_BADGE.AUTHOR}`}>
                    {ROLE_META[e.actorRole]?.label ?? e.actorRole}
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <time dateTime={e.timestamp}>{formatDate(e.timestamp)}</time>
                {e.type === ACTIVITY.DIRECT_PUBLICATION && (
                  <span className="rounded bg-amber-100 px-1.5 py-px font-mono text-[0.625rem] font-semibold text-amber-800">
                    DIRECT_PUBLICATION
                  </span>
                )}
              </p>

              {e.reason && (
                <div className="mt-2 rounded-lg border-l-2 border-ink-200 bg-ink-50 py-2 pr-3 pl-2.5">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Reason</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-700 italic">“{e.reason}”</p>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

ActivityTimeline.propTypes = {
  entries: PropTypes.array,
  emptyMessage: PropTypes.string,
  showRoles: PropTypes.bool,
}
