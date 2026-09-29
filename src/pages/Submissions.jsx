/**
 * Submissions list with status, search and multi-dimensional filtering.
 * @module pages/Submissions
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { STATUS_FILTERS } from '../domain/status'
import { completedReviewCount } from '../store/selectors'
import { relativeTime, formatDateShort } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, FilterPills, EmptyState } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

export default function Submissions() {
  const submissions = useJournalStore((s) => s.submissions)
  const users = useJournalStore((s) => s.users)

  const [status, setStatus] = useState('ALL')
  const [q, setQ] = useState('')
  const [editor, setEditor] = useState('all')
  const [section, setSection] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const editors = users.filter((u) => u.role === 'EDITOR' || u.role === 'ADMIN')
  const sections = [...new Set(submissions.map((s) => s.section))].sort()
  const editorName = (id) => users.find((u) => u.id === id)?.name ?? 'Unassigned'

  const counts = useMemo(() => {
    const c = { ALL: submissions.length }
    for (const f of STATUS_FILTERS) {
      if (f.key === 'ALL') continue
      c[f.key] = submissions.filter((s) => f.statuses.includes(s.status)).length
    }
    return c
  }, [submissions])

  const filtered = useMemo(() => {
    const filter = STATUS_FILTERS.find((f) => f.key === status)
    const term = q.trim().toLowerCase()

    return submissions
      .filter((s) => {
        if (filter?.statuses && !filter.statuses.includes(s.status)) return false
        if (editor !== 'all' && (s.assignedEditorId ?? 'none') !== editor) return false
        if (section !== 'all' && s.section !== section) return false
        if (dateFrom && (!s.submitted || s.submitted < dateFrom)) return false
        if (dateTo && (!s.submitted || s.submitted > dateTo)) return false
        if (term) {
          const hay = `${s.title} ${s.id} ${s.authors.map((a) => a.name).join(' ')} ${s.keywords.join(' ')}`.toLowerCase()
          if (!hay.includes(term)) return false
        }
        return true
      })
      .sort((a, b) => (a.lastActivity ?? '') < (b.lastActivity ?? '') ? 1 : -1)
  }, [submissions, status, q, editor, section, dateFrom, dateTo])

  const hasFilters = status !== 'ALL' || q || editor !== 'all' || section !== 'all' || dateFrom || dateTo

  const reset = () => {
    setStatus('ALL')
    setQ('')
    setEditor('all')
    setSection('all')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <Page>
      <PageHeader
        title="Submissions"
        description="All manuscripts received by the journal, from initial submission through publication."
      />

      {/* Status filter */}
      <div className="mt-6">
        <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} counts={counts} />
      </div>

      {/* Secondary filters */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Icon
            name="search"
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, ID, author or keyword…"
            className="input pl-9"
            aria-label="Search submissions"
          />
        </div>

        <select value={editor} onChange={(e) => setEditor(e.target.value)} className="select" aria-label="Filter by editor">
          <option value="all">All editors</option>
          {editors.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <select value={section} onChange={(e) => setSection(e.target.value)} className="select" aria-label="Filter by section">
          <option value="all">All sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input"
            aria-label="From date"
          />
          <span className="text-xs text-ink-400">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input"
            aria-label="To date"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3 flex items-center gap-3">
          <p className="text-[0.8125rem] text-ink-600">
            {filtered.length} of {submissions.length} submissions
          </p>
          <button onClick={reset} className="btn-ghost btn-sm">
            <Icon name="refresh" size={13} />
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      <Panel className="mt-5" bodyClassName="p-0">
        {filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="No submissions match these filters"
            description="Try broadening the status filter or clearing the search term."
            action={
              <button onClick={reset} className="btn-secondary">
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-[30%]">Manuscript</th>
                    <th className="w-[15%]">Authors</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Assigned editor</th>
                    <th>Reviews</th>
                    <th>Last activity</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/submissions/${s.id}`} className="line-clamp-2 font-medium text-ink-900 hover:text-brand-600">
                          {s.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">{s.id}</p>
                      </td>
                      <td className="text-[0.8125rem]">
                        <span className="line-clamp-2">{s.authors.map((a) => a.name).join(', ')}</span>
                      </td>
                      <td>
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="whitespace-nowrap text-ink-500">
                        {s.submitted ? formatDateShort(s.submitted) : <span className="text-ink-400">Not submitted</span>}
                      </td>
                      <td className="whitespace-nowrap text-[0.8125rem]">
                        {editorName(s.assignedEditorId)}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {s.reviews.length ? (
                          <span>
                            {completedReviewCount(s)}
                            <span className="text-ink-400">/{s.reviews.length}</span>
                          </span>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-ink-500">{relativeTime(s.lastActivity)}</td>
                      <td className="text-right">
                        <Link to={`/submissions/${s.id}`} className="btn-secondary btn-sm">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-ink-100 lg:hidden">
              {filtered.map((s) => (
                <li key={s.id} className="p-4">
                  <Link to={`/submissions/${s.id}`} className="block">
                    <p className="font-medium text-ink-900">{s.title}</p>
                    <p className="mt-1 font-mono text-[0.6875rem] text-ink-400">{s.id}</p>
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={s.status} size="sm" />
                    {s.directPublication && (
                      <span className="chip bg-amber-50 text-amber-800 ring-amber-200">Direct publication</span>
                    )}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <dt className="text-ink-500">Authors</dt>
                      <dd className="mt-0.5 text-ink-800">{s.authors.map((a) => a.name.split(' ').slice(-1)[0]).join(', ')}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Editor</dt>
                      <dd className="mt-0.5 text-ink-800">{editorName(s.assignedEditorId)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Submitted</dt>
                      <dd className="mt-0.5 text-ink-800">{s.submitted ? formatDateShort(s.submitted) : '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Reviews</dt>
                      <dd className="mt-0.5 text-ink-800 tabular-nums">
                        {s.reviews.length ? `${completedReviewCount(s)}/${s.reviews.length}` : '—'}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      {/* Direct publication explainer */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-ink-200 bg-white px-4 py-3.5">
        <Icon name="info" size={16} className="mt-0.5 shrink-0 text-ink-400" />
        <p className="text-[0.8125rem] leading-relaxed text-ink-600">
          Manuscripts marked <span className="chip mx-0.5 bg-amber-50 text-amber-800 ring-amber-200">direct publication</span>{' '}
          were published by administrative decision without external peer review. The standard route is submission → peer
          review → editorial decision → production → publication.
        </p>
      </div>
    </Page>
  )
}
