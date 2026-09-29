/**
 * Status badge.
 *
 * The single visual vocabulary for submission status across the whole app.
 * Colours come from STATUS_META in domain/status.js — no status colour is
 * defined here, only the mapping from tone name to Tailwind classes.
 * @module components/ui/StatusBadge
 */

import PropTypes from 'prop-types'
import { STATUS_META } from '../../domain/status'
import Icon from './Icon'

/** tone -> tailwind classes. Muted and low-saturation by design. */
const TONES = {
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  green: 'bg-green-800/10 text-green-900 ring-green-800/25',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const ICONS = {
  DRAFT: 'file',
  SUBMITTED: 'inbox',
  UNDER_REVIEW: 'eye',
  REVISION_REQUIRED: 'rotate',
  ACCEPTED: 'checkCircle',
  REJECTED: 'xCircle',
  IN_PRODUCTION: 'package',
  PUBLISHED: 'globe',
}

export default function StatusBadge({ status, size = 'md', showIcon = true, className = '' }) {
  const meta = STATUS_META[status]
  if (!meta) return null

  const tone = TONES[meta.tone] ?? TONES.neutral
  const sizing = size === 'sm' ? 'px-1.5 py-0.5 text-[0.6875rem]' : 'px-2 py-0.5 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ring-1 ring-inset whitespace-nowrap ${tone} ${sizing} ${className}`}
      title={meta.description}
    >
      {showIcon && <Icon name={ICONS[status] ?? 'file'} size={size === 'sm' ? 11 : 12} strokeWidth={2} />}
      {meta.label}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
}
