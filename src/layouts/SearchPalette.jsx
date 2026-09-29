/**
 * Command palette (⌘K). Searches submissions, publications, people and issues
 * against the in-memory prototype data.
 * @module layouts/SearchPalette
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

const GROUPS = [
  { key: 'submissions', label: 'Submissions', icon: 'inbox' },
  { key: 'publications', label: 'Publications', icon: 'globe' },
  { key: 'users', label: 'People', icon: 'users' },
  { key: 'issues', label: 'Issues', icon: 'layers' },
]

export default function SearchPalette({ open, onClose, index, onNavigate }) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  const results = useMemo(() => {
    if (!q.trim()) {
      // Show recent submissions when the palette is first opened.
      return (index.submissions ?? []).slice(0, 5).map((r) => ({ ...r, group: 'submissions' }))
    }
    const term = q.toLowerCase()
    const out = []
    for (const g of GROUPS) {
      for (const item of index[g.key] ?? []) {
        if (item.title.toLowerCase().includes(term) || item.subtitle.toLowerCase().includes(term)) {
          out.push({ ...item, group: g.key })
        }
      }
    }
    return out.slice(0, 24)
  }, [q, index])

  useEffect(() => setCursor(0), [q])

  if (!open) return null

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: results.filter((r) => r.group === g.key),
  })).filter((g) => g.items.length)

  let flatIndex = -1

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[10vh]">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="panel relative w-full max-w-xl overflow-hidden shadow-overlay">
        <div className="flex items-center gap-3 border-b border-ink-200 px-4">
          <Icon name="search" size={17} className="shrink-0 text-ink-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setCursor((c) => Math.min(c + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setCursor((c) => Math.max(c - 1, 0))
              } else if (e.key === 'Enter' && results[cursor]) {
                onNavigate(results[cursor].to)
              } else if (e.key === 'Escape') {
                onClose()
              }
            }}
            placeholder="Search submissions, publications, people, issues…"
            className="h-12 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-sans text-[0.625rem] text-ink-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="scrollbar-slim max-h-[22rem] overflow-y-auto p-2">
          {!q.trim() && (
            <p className="px-2.5 py-1.5 text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-400 uppercase">
              Recent submissions
            </p>
          )}
          {grouped.map((g) => (
            <div key={g.key} className="mb-1">
              {q.trim() && (
                <p className="flex items-center gap-1.5 px-2.5 py-1.5 text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-400 uppercase">
                  <Icon name={g.icon} size={12} />
                  {g.label}
                </p>
              )}
              <ul>
                {g.items.map((item) => {
                  flatIndex += 1
                  const idx = flatIndex
                  const on = idx === cursor
                  return (
                    <li key={`${item.group}-${item.id}`}>
                      <button
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => onNavigate(item.to)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                          on ? 'bg-brand-50' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.8125rem] font-medium text-ink-900">{item.title}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-500">{item.subtitle}</p>
                        </div>
                        {item.status && <StatusBadge status={item.status} size="sm" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {results.length === 0 && (
            <p className="px-2.5 py-8 text-center text-[0.8125rem] text-ink-500">
              No results for “{q}”.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

SearchPalette.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  index: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
}
