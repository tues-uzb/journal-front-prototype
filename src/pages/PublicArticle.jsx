/**
 * Public, reader-facing article page.
 *
 * Rendered inside PublicLayout, so it has no sidebar or admin chrome and uses
 * serif typography, mimicking a journal website rather than the CMS.
 *
 * @module pages/PublicArticle
 */

import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { issueFullLabel } from '../data/issues'
import { formatDate } from '../components/ActivityTimeline'

import Modal from '../components/ui/Modal'
import ToastViewport from '../components/ui/Toast'
import Icon from '../components/ui/Icon'

const CITATION_STYLES = [
  { key: 'apa', label: 'APA 7th' },
  { key: 'mla', label: 'MLA 9th' },
  { key: 'chicago', label: 'Chicago' },
  { key: 'harvard', label: 'Harvard' },
  { key: 'bibtex', label: 'BibTeX' },
]

export default function PublicArticle() {
  const { id } = useParams()
  const submission = useJournalStore((s) => s.submissions.find((x) => x.id === id))
  const issues = useJournalStore((s) => s.issues)
  const journal = useJournalStore((s) => s.journal)
  const articles = useJournalStore((s) => s.submissions)

  const [citeOpen, setCiteOpen] = useState(false)
  const [citeStyle, setCiteStyle] = useState('apa')
  const [copied, setCopied] = useState(false)
  const [toasts, setToasts] = useState([])

  // The public layout has no outlet context, so the page owns its own toasts.
  const pushToast = (toast) =>
    setToasts((t) => [...t, { id: Date.now() + Math.random(), tone: 'info', ...toast }])
  const dismissToast = (tid) => setToasts((t) => t.filter((x) => x.id !== tid))

  const issue = issues.find((i) => i.id === submission?.issueId)

  const citation = useMemo(() => {
    if (!submission) return ''
    const authors = submission.authors.map((a) => a.name).join(', ')
    const doi = submission.doi ?? '10.48291/jassd.2026.pending'
    const vol = submission.volume ?? '—'
    const num = submission.issueNumber ?? '—'
    const pages = submission.pages ?? '—'
    const year = new Date(`${submission.publishedDate ?? '2026-01-01'}T00:00:00Z`).getUTCFullYear()

    switch (citeStyle) {
      case 'mla':
        return `${authors}. “${submission.title}.” ${journal.abbreviation}, vol. ${vol}, no. ${num}, ${year}, pp. ${pages}. DOI: ${doi}.`
      case 'chicago':
        return `${authors}. “${submission.title}.” ${journal.name} ${vol}, no. ${num} (${year}): ${pages}. https://doi.org/${doi}.`
      case 'harvard':
        return `${authors} (${year}) ‘${submission.title}’, ${journal.abbreviation}, ${vol}(${num}), pp. ${pages}. doi: ${doi}.`
      case 'bibtex':
        return `@article{${submission.id.toLowerCase().replace(/-/g, '_')},\n  title  = {${submission.title}},\n  author = {${submission.authors.map((a) => a.name).join(' and ')}},\n  journal = {${journal.abbreviation}},\n  volume = {${vol}},\n  number  = {${num}},\n  pages   = {${pages.replace('–', '--')}},\n  year    = {${year}},\n  doi     = {${doi}}\n}`
      default:
        return `${authors} (${year}). ${submission.title}. ${journal.name}, ${vol}(${num}), ${pages}. https://doi.org/${doi}`
    }
  }, [submission, citeStyle, journal])

  if (!submission) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink-900">Article not found</h1>
        <p className="mt-2 text-ink-600">No published article exists with the identifier {id}.</p>
        <Link to="/publications" className="btn-primary mt-6">
          Browse all publications
        </Link>
      </div>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      pushToast({ tone: 'info', title: 'Prototype', message: 'Clipboard access is unavailable in this preview.' })
    }
  }

  const related = articles
    .filter((a) => a.status === 'PUBLISHED' && a.id !== submission.id)
    .sort((a, b) => {
      const aShared = a.keywords.filter((k) => submission.keywords.includes(k)).length
      const bShared = b.keywords.filter((k) => submission.keywords.includes(k)).length
      return bShared - aShared
    })
    .slice(0, 3)

  const year = new Date(`${submission.publishedDate ?? '2026-01-01'}T00:00:00Z`).getUTCFullYear()

  return (
    <article className="mx-auto max-w-5xl px-6 py-12">
      {/* ── Article header ── */}
      <header className="border-b border-ink-200 pb-8">
        <div className="flex flex-wrap items-center gap-2.5 text-[0.8125rem] text-ink-500">
          <Link to="/publications" className="hover:text-brand-600">
            {journal.abbreviation}
          </Link>
          <span aria-hidden="true">·</span>
          <span>{issueFullLabel(issue)}</span>
          {submission.directPublication && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Icon name="zap" size={11} strokeWidth={2.5} />
                Invited contribution
              </span>
            </>
          )}
        </div>

        <h1
          className="mt-4 text-2xl leading-[1.25] font-semibold tracking-[-0.015em] text-ink-950 sm:text-[2.125rem]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {submission.title}
        </h1>

        {/* Authors */}
        <div className="mt-6 space-y-2">
          {submission.authors.map((a) => (
            <div key={a.id} className="text-[0.9375rem]">
              <span className="font-medium text-ink-900">
                {a.name}
                {a.isCorresponding && <sup className="ml-0.5 text-brand-600">✉</sup>}
              </span>
              <span className="text-ink-600">, {a.affiliation}</span>
              {a.country && <span className="text-ink-500"> ({a.country})</span>}
            </div>
          ))}
        </div>

        {/* Citation metadata strip */}
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink-100 pt-5 text-[0.8125rem]">
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Published</dt>
            <dd className="mt-0.5 text-ink-800">{formatDate(submission.publishedDate)}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Volume / Issue</dt>
            <dd className="mt-0.5 text-ink-800">
              {submission.volume ?? '—'} ({submission.issueNumber ?? '—'})
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Pages</dt>
            <dd className="mt-0.5 text-ink-800">{submission.pages ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">DOI</dt>
            <dd className="mt-0.5 font-mono text-[0.8125rem] text-brand-700">{submission.doi ?? 'Pending'}</dd>
          </div>
        </dl>
      </header>

      {/* ── Actions ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() =>
            pushToast({
              tone: 'info',
              title: 'Prototype',
              message: 'The PDF would download from object storage in a production system.',
            })
          }
          className="btn-primary"
        >
          <Icon name="download" size={16} />
          Download PDF
        </button>
        <button onClick={() => setCiteOpen(true)} className="btn-secondary">
          <Icon name="quote" size={16} />
          Cite
        </button>
        <button
          onClick={() =>
            pushToast({
              tone: 'info',
              title: 'Link copied',
              message: 'A shareable article link would be placed on the clipboard.',
            })
          }
          className="btn-secondary"
        >
          <Icon name="share" size={16} />
          Share
        </button>
      </div>

      {/* ── Abstract ── */}
      <section className="mt-10">
        <h2
          className="text-lg font-semibold text-ink-900"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Abstract
        </h2>
        <p className="academic-body mt-4">{submission.abstract}</p>
      </section>

      {/* ── Keywords ── */}
      <section className="mt-9">
        <h3 className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Keywords</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {submission.keywords.map((k) => (
            <span key={k} className="chip bg-ink-100 text-ink-700 ring-ink-200">
              {k}
            </span>
          ))}
        </div>
      </section>

      {/* ── Recommended citation ── */}
      <section className="mt-10 rounded-xl border border-ink-200 bg-ink-50/60 p-5">
        <h2 className="text-[0.8125rem] font-semibold text-ink-900">How to cite this article</h2>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-700">
          {submission.authors.map((a) => a.name).join(', ')} ({year}). {submission.title}. {journal.abbreviation},{' '}
          {submission.volume ?? '—'}({submission.issueNumber ?? '—'}), {submission.pages ?? '—'}. DOI:{' '}
          {submission.doi ?? 'pending'}
        </p>
        <button
          onClick={() => setCiteOpen(true)}
          className="btn-ghost btn-sm mt-3 -ml-2"
        >
          <Icon name="quote" size={13} />
          Other citation styles
        </button>
      </section>

      {/* ── Licence ── */}
      <p className="mt-8 text-center text-[0.8125rem] text-ink-500">
        © {year} {submission.authors.map((a) => a.name).join(', ')}. Published under a{' '}
        <span className="text-ink-700">CC BY 4.0</span> licence.
      </p>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <section className="mt-14 border-t border-ink-200 pt-9">
          <h2 className="text-lg font-semibold text-ink-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Related articles
          </h2>
          <ul className="mt-5 space-y-4">
            {related.map((r) => (
              <li key={r.id} className="border-b border-ink-100 pb-4 last:border-b-0 last:pb-0">
                <Link
                  to={`/publications/${r.id}`}
                  className="text-[0.9375rem] leading-snug font-medium text-ink-900 hover:text-brand-600"
                >
                  {r.title}
                </Link>
                <p className="mt-1 text-[0.8125rem] text-ink-600">{r.authors.map((a) => a.name).join(', ')}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {r.articleType}
                  {r.volume && ` · Vol. ${r.volume}, Issue ${r.issueNumber}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Citation dialog ── */}
      <Modal
        open={citeOpen}
        onClose={() => setCiteOpen(false)}
        title="Cite this article"
        description="Select a citation style and copy the formatted reference."
        size="lg"
        footer={
          <>
            <button onClick={() => setCiteOpen(false)} className="btn-secondary">
              Close
            </button>
            <button onClick={copy} className="btn-primary">
              <Icon name={copied ? 'check' : 'copy'} size={15} />
              {copied ? 'Copied' : 'Copy citation'}
            </button>
          </>
        }
      >
        <div>
          <div className="flex flex-wrap gap-1.5">
            {CITATION_STYLES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCiteStyle(c.key)}
                className={`rounded-lg border px-3 py-1.5 text-[0.8125rem] font-medium transition ${
                  citeStyle === c.key
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-ink-800">
            {citation}
          </pre>
        </div>
      </Modal>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </article>
  )
}
