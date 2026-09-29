/**
 * Shared presentational primitives used across the prototype.
 * Kept in one module so spacing and typography stay consistent.
 * @module components/ui/primitives
 */

import PropTypes from 'prop-types'
import Icon from './Icon'

/* ── Page scaffolding ──────────────────────────────────────────────────── */

export function PageHeader({ title, description, actions, meta }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {meta && <div className="mb-2">{meta}</div>}
        <h1 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink-900">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
  meta: PropTypes.node,
}

export function Page({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[86rem] px-5 py-7 lg:px-8 lg:py-9 ${className}`}>{children}</div>
}

Page.propTypes = { children: PropTypes.node, className: PropTypes.string }

/* ── Panel ─────────────────────────────────────────────────────────────── */

export function Panel({ title, description, actions, children, className = '', bodyClassName = '', footer }) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel-header">
          <div className="min-w-0">
            {title && <h2 className="panel-title">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.8125rem] text-ink-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children && <div className={bodyClassName}>{children}</div>}
      {footer && <div className="border-t border-ink-200 bg-ink-50/60 px-5 py-3.5">{footer}</div>}
    </section>
  )
}

Panel.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node,
}

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-ink-100 text-ink-400">
        <Icon name={icon} size={20} />
      </div>
      <p className="mt-3.5 text-sm font-semibold text-ink-800">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
}

/* ── Definition list ───────────────────────────────────────────────────── */

export function DefinitionList({ items, columns = 2, className = '' }) {
  // Callers commonly build the list with conditionals (`cond && {...}`), which
  // can yield `false`/`null` entries — filter them out defensively.
  const rows = (items ?? []).filter(Boolean)

  return (
    <dl className={`grid gap-x-8 gap-y-4 ${columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : ''} ${className}`}>
      {rows.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">{it.label}</dt>
          <dd className="mt-1 text-sm break-words text-ink-800">{it.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

DefinitionList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.node }),
  ).isRequired,
  columns: PropTypes.oneOf([1, 2, 3]),
  className: PropTypes.string,
}

/* ── Avatar ────────────────────────────────────────────────────────────── */

const AVATAR_TONES = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ name, size = 32, className = '' }) {
  const tone = AVATAR_TONES[(name?.charCodeAt(0) ?? 0) % AVATAR_TONES.length]
  const dims = size <= 24 ? 'text-[0.625rem]' : size <= 32 ? 'text-[0.6875rem]' : 'text-xs'
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold ${tone} ${dims} ${className}`}
      style={{ width: size, height: size }}
      title={name}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  )
}

Avatar.propTypes = { name: PropTypes.string, size: PropTypes.number, className: PropTypes.string }

/* ── Stat tile ─────────────────────────────────────────────────────────── */

/**
 * A restrained metric tile. Deliberately not a heavy "dashboard card":
 * hairline border, no shadow, numeric emphasis.
 */
export function StatTile({ label, value, hint, tone = 'default', onClick, active }) {
  const toneRing = {
    default: 'text-ink-900',
    warn: 'text-amber-700',
    good: 'text-emerald-700',
    brand: 'text-brand-700',
  }[tone]

  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`rounded-xl border bg-white px-4 py-3.5 text-left transition ${
        active ? 'border-brand-400 ring-1 ring-brand-200' : 'border-ink-200'
      } ${onClick ? 'hover:border-brand-300 hover:shadow-panel' : ''}`}
    >
      <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tracking-[-0.02em] tabular-nums ${toneRing}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
    </Comp>
  )
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  hint: PropTypes.string,
  tone: PropTypes.oneOf(['default', 'warn', 'good', 'brand']),
  onClick: PropTypes.func,
  active: PropTypes.bool,
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */

export function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`scrollbar-slim -mb-px flex gap-1 overflow-x-auto border-b border-ink-200 ${className}`} role="tablist">
      {tabs.map((t) => {
        const on = t.key === active
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={`relative shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${
              on
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800'
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className={`ml-1.5 text-xs tabular-nums ${on ? 'text-brand-500' : 'text-ink-400'}`}>{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired, count: PropTypes.number }),
  ).isRequired,
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
}

/* ── Filter pills ──────────────────────────────────────────────────────── */

export function FilterPills({ options, value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o.key === value
        const n = counts?.[o.key]
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.8125rem] font-medium transition ${
              on
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50'
            }`}
          >
            {o.label}
            {n != null && (
              <span className={`tabular-nums ${on ? 'text-brand-100' : 'text-ink-400'}`}>{n}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

FilterPills.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  counts: PropTypes.object,
}

/* ── Misc ──────────────────────────────────────────────────────────────── */

export function Note({ tone = 'info', icon, title, children }) {
  const tones = {
    info: 'border-brand-200 bg-brand-50/60 text-brand-900',
    warning: 'border-amber-200 bg-amber-50/70 text-amber-900',
    danger: 'border-rose-200 bg-rose-50/70 text-rose-900',
    neutral: 'border-ink-200 bg-ink-50 text-ink-700',
    success: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  }
  const defaultIcon = { info: 'info', warning: 'warning', danger: 'warning', neutral: 'info', success: 'checkCircle' }
  return (
    <div className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-[0.8125rem] leading-relaxed ${tones[tone]}`}>
      <Icon name={icon ?? defaultIcon[tone]} size={16} className="mt-0.5 shrink-0 opacity-70" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  )
}

Note.propTypes = {
  tone: PropTypes.oneOf(['info', 'warning', 'danger', 'neutral', 'success']),
  icon: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
}

export function MetaItem({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">{label}</dt>
      <dd className={`mt-1 text-sm text-ink-800 ${mono ? 'font-mono text-[0.8125rem]' : ''}`}>{value ?? '—'}</dd>
    </div>
  )
}

MetaItem.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node, mono: PropTypes.bool }

/* ── Review recommendation ─────────────────────────────────────────────── */

const RECOMMENDATION_STYLE = {
  accept: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Accept' },
  'minor-revisions': { cls: 'bg-amber-50 text-amber-800 ring-amber-200', label: 'Minor revisions' },
  'major-revisions': { cls: 'bg-orange-50 text-orange-800 ring-orange-200', label: 'Major revisions' },
  reject: { cls: 'bg-rose-50 text-rose-700 ring-rose-200', label: 'Reject' },
  pending: { cls: 'bg-ink-100 text-ink-600 ring-ink-200', label: 'Pending' },
}

export function RecommendationPill({ value, compact = false }) {
  const s = RECOMMENDATION_STYLE[value]
  if (!s) return null
  return <span className={`chip ${s.cls}`}>{compact ? s.label.split(' ')[0] : s.label}</span>
}

RecommendationPill.propTypes = { value: PropTypes.string, compact: PropTypes.bool }
