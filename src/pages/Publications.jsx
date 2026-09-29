/**
 * Published articles index.
 * @module pages/Publications
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { publishedArticles } from '../store/selectors'
import { issueFullLabel } from '../data/issues'
import { formatDate } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState } from '../components/ui/primitives'
import Icon from '../components/ui/Icon'

export default function Publications() {
  const submissions = useJournalStore((s) => s.submissions)
  const issues = useJournalStore((s) => s.issues)

  const [q, setQ] = useState('')
  const [issue, setIssue] = useState('all')

  const articles = useMemo(() => publishedArticles(submissions), [submissions])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return articles
      .filter((a) => (issue === 'all' ? true : a.issueId === issue))
      .filter((a) => {
        if (!term) return true
        const hay = `${a.title} ${a.abstract} ${a.authors.map((x) => x.name).join(' ')} ${a.keywords.join(' ')} ${a.doi ?? ''}`.toLowerCase()
        return hay.includes(term)
      })
  }, [articles, q, issue])

  const directCount = articles.filter((a) => a.directPublication).length
  const doiCount = articles.filter((a) => a.doi).length
  const publishedIssues = issues.filter((i) => i.status === 'published')

  return (
    <Page>
      <PageHeader
        title="Publications"
        description="Articles published in the journal, with their citation metadata."
        actions={
          <Link to="/issues" className="btn-secondary">
            <Icon name="layers" size={15} />
            Browse by issue
          </Link>
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Published" value={articles.length} hint="All issues" />
        <StatTile label="With DOI" value={doiCount} tone="good" hint="Registered identifiers" />
        <StatTile label="Issues" value={publishedIssues.length} hint="Published issues" />
        <StatTile
          label="Direct publication"
          value={directCount}
          tone={directCount ? 'warn' : 'default'}
          hint="Peer review bypassed"
        />
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
            placeholder="Search articles by title, author, keyword or DOI…"
            className="input pl-9"
            aria-label="Search publications"
          />
        </div>
        <select value={issue} onChange={(e) => setIssue(e.target.value)} className="select sm:w-64" aria-label="Filter by issue">
          <option value="all">All issues</option>
          {publishedIssues.map((i) => (
            <option key={i.id} value={i.id}>
              Volume {i.volume}, Issue {i.number}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((a) => {
          const iss = issues.find((i) => i.id === a.issueId)
          return (
            <Panel key={a.id} bodyClassName="p-5" className="transition hover:border-ink-300 hover:shadow-raised">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-[0.6875rem] text-ink-400">{a.id}</span>
                    {a.directPublication && (
                      <span className="chip bg-amber-50 text-amber-800 ring-amber-200">
                        <Icon name="zap" size={10} strokeWidth={2.5} />
                        Direct publication
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/publications/${a.id}`}
                    className="mt-2 block text-[0.9375rem] leading-snug font-semibold text-ink-900 hover:text-brand-600"
                  >
                    {a.title}
                  </Link>

                  <p className="mt-1.5 text-[0.8125rem] text-ink-600">
                    {a.authors.map((x) => x.name).join(', ')}
                  </p>

                  <p className="mt-2.5 line-clamp-2 text-[0.875rem] leading-relaxed text-ink-600">{a.abstract}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                    {iss && (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="layers" size={13} />
                        {issueFullLabel(iss)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="calendar" size={13} />
                      {a.publishedDate ? formatDate(a.publishedDate) : '—'}
                    </span>
                    {a.pages && <span>{a.pages}</span>}
                    {a.doi && <span className="font-mono text-[0.6875rem]">{a.doi}</span>}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/publications/${a.id}`} className="btn-primary btn-sm">
                    <Icon name="external" size={13} />
                    View article
                  </Link>
                </div>
              </div>
            </Panel>
          )
        })}

        {filtered.length === 0 && (
          <Panel bodyClassName="p-0">
            <EmptyState
              icon="search"
              title="No articles match your search"
              action={
                <button
                  onClick={() => {
                    setQ('')
                    setIssue('all')
                  }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              }
            />
          </Panel>
        )}
      </div>
    </Page>
  )
}
