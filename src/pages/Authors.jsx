/**
 * Author directory, derived from authorship across all submissions.
 * @module pages/Authors
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { SUBMISSION_STATUS as S } from '../domain/status'
import { relativeTime } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState, Avatar } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

export default function Authors() {
  const submissions = useJournalStore((s) => s.submissions)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('published')

  /** Aggregate unique authors across every submission. */
  const authors = useMemo(() => {
    const map = new Map()
    for (const s of submissions) {
      for (const a of s.authors) {
        const rec = map.get(a.email) ?? {
          ...a,
          submissions: [],
          published: 0,
          underReview: 0,
          lastActivity: null,
        }
        rec.submissions.push({ id: s.id, title: s.title, status: s.status, date: s.submitted, lastActivity: s.lastActivity })
        if (s.status === S.PUBLISHED) rec.published += 1
        if ([S.SUBMITTED, S.UNDER_REVIEW, S.REVISION_REQUIRED, S.ACCEPTED, S.IN_PRODUCTION].includes(s.status)) {
          rec.underReview += 1
        }
        if (s.lastActivity && (!rec.lastActivity || s.lastActivity > rec.lastActivity)) {
          rec.lastActivity = s.lastActivity
        }
        map.set(a.email, rec)
      }
    }
    return [...map.values()]
  }, [submissions])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = authors.filter(
      (a) =>
        !term ||
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.affiliation.toLowerCase().includes(term),
    )
    const sorters = {
      published: (a, b) => b.published - a.published,
      submissions: (a, b) => b.submissions.length - a.submissions.length,
      name: (a, b) => a.name.localeCompare(b.name),
      recent: (a, b) => ((a.lastActivity ?? '') < (b.lastActivity ?? '') ? 1 : -1),
    }
    return list.sort(sorters[sort])
  }, [authors, q, sort])

  const totalPublished = authors.reduce((n, a) => n + a.published, 0)
  const countries = new Set(authors.map((a) => a.country).filter(Boolean)).size
  const institutions = new Set(authors.map((a) => a.affiliation)).size

  return (
    <Page>
      <PageHeader
        title="Authors"
        description="Everyone who has authored a submission to the journal, with their publication record."
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Authors" value={authors.length} hint="Unique contributors" />
        <StatTile label="Institutions" value={institutions} hint="Distinct affiliations" />
        <StatTile label="Countries" value={countries} hint="Represented" />
        <StatTile label="Articles" value={totalPublished} tone="good" hint="Published" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search authors by name, email or institution…"
            className="input pl-9"
            aria-label="Search authors"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="select sm:w-56" aria-label="Sort authors">
          <option value="published">Sort: Most published</option>
          <option value="submissions">Sort: Most submissions</option>
          <option value="recent">Sort: Most recent</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((a) => (
          <Panel key={a.email} bodyClassName="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 gap-3.5">
                <Avatar name={a.name} size={44} />
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-ink-900">{a.name}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-ink-600">{a.affiliation}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {a.country && `${a.country} · `}
                    <a href={`mailto:${a.email}`} className="hover:text-brand-600 hover:underline">
                      {a.email}
                    </a>
                  </p>
                  {a.lastActivity && (
                    <p className="mt-1.5 text-xs text-ink-500">Last active {relativeTime(a.lastActivity)}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-6 lg:text-right">
                <div>
                  <p className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Published</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-700">{a.published}</p>
                </div>
                <div>
                  <p className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">In progress</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-brand-700">{a.underReview}</p>
                </div>
                <div>
                  <p className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Total</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink-900">{a.submissions.length}</p>
                </div>
              </div>
            </div>

            {a.submissions.length > 0 && (
              <div className="mt-4 border-t border-ink-100 pt-3.5">
                <p className="text-[0.625rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Manuscripts</p>
                <ul className="mt-2 space-y-1.5">
                  {a.submissions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-2">
                      <Link
                        to={s.status === S.PUBLISHED ? `/publications/${s.id}` : `/submissions/${s.id}`}
                        className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink-700 hover:text-brand-600"
                      >
                        {s.title}
                      </Link>
                      <StatusBadge status={s.status} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        ))}

        {filtered.length === 0 && (
          <Panel bodyClassName="p-0">
            <EmptyState icon="search" title="No authors match your search" />
          </Panel>
        )}
      </div>
    </Page>
  )
}
