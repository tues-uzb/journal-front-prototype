/**
 * Author's own submissions.
 * @module pages/MySubmissions
 */

import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { SUBMISSION_STATUS as S, STATUS_META } from '../domain/status'
import { relativeTime, formatDate } from '../components/ActivityTimeline'
import WorkflowTimeline from '../components/WorkflowTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState, FilterPills } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Icon from '../components/ui/Icon'

const GROUPS = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'IN_REVIEW', label: 'In review' },
  { key: 'REVISION_REQUIRED', label: 'Revisions' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PUBLISHED', label: 'Published' },
]

const MATCH = {
  DRAFT: [S.DRAFT],
  IN_REVIEW: [S.SUBMITTED, S.UNDER_REVIEW, S.IN_PRODUCTION],
  REVISION_REQUIRED: [S.REVISION_REQUIRED],
  ACCEPTED: [S.ACCEPTED],
  PUBLISHED: [S.PUBLISHED],
}

export default function MySubmissions() {
  const { user } = useOutletContext()
  const submissions = useJournalStore((s) => s.submissions)
  const [group, setGroup] = useState('ALL')
  const [open, setOpen] = useState(null)

  const mine = useMemo(
    () =>
      submissions
        .filter((s) => s.authors.some((a) => a.email === user.email))
        .sort((a, b) => ((a.lastActivity ?? '') < (b.lastActivity ?? '') ? 1 : -1)),
    [submissions, user.email],
  )

  const counts = useMemo(() => {
    const c = { ALL: mine.length }
    for (const g of GROUPS) {
      if (g.key === 'ALL') continue
      c[g.key] = mine.filter((s) => MATCH[g.key].includes(s.status)).length
    }
    return c
  }, [mine])

  const filtered = group === 'ALL' ? mine : mine.filter((s) => MATCH[group].includes(s.status))

  return (
    <Page>
      <PageHeader
        title="My submissions"
        description="Every manuscript you have submitted, and where each one stands in the editorial process."
        actions={
          <Link to="/submissions/new" className="btn-primary">
            <Icon name="plus" size={16} />
            New submission
          </Link>
        }
      />

      {mine.length === 0 ? (
        <Panel className="mt-6" bodyClassName="p-0">
          <EmptyState
            icon="file"
            title="No submissions yet"
            description="Start a new submission to send your research to the journal for peer review."
            action={
              <Link to="/submissions/new" className="btn-primary">
                Start a submission
              </Link>
            }
          />
        </Panel>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="In review" value={counts.IN_REVIEW ?? 0} tone="brand" hint="With the journal" />
            <StatTile label="Revisions" value={counts.REVISION_REQUIRED ?? 0} tone={counts.REVISION_REQUIRED ? 'warn' : 'default'} hint="Action needed" />
            <StatTile label="Accepted" value={counts.ACCEPTED ?? 0} tone="good" hint="In production" />
            <StatTile label="Published" value={counts.PUBLISHED ?? 0} tone="good" hint="Live articles" />
          </div>

          <div className="mt-6">
            <FilterPills options={GROUPS} value={group} onChange={setGroup} counts={counts} />
          </div>

          <div className="mt-5 space-y-4">
            {filtered.map((s) => {
              const expanded = open === s.id
              const needsAction = s.status === S.REVISION_REQUIRED || s.status === S.DRAFT
              return (
                <Panel key={s.id} bodyClassName="p-0" className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <StatusBadge status={s.status} />
                          <span className="font-mono text-[0.6875rem] text-ink-400">{s.id}</span>
                          {s.directPublication && (
                            <span className="chip bg-amber-50 text-amber-800 ring-amber-200">Direct publication</span>
                          )}
                        </div>
                        <h2 className="mt-2.5 text-[0.9375rem] leading-snug font-semibold text-ink-900">{s.title}</h2>
                        <p className="mt-1.5 text-[0.8125rem] text-ink-500">
                          {s.articleType} · {s.section}
                        </p>
                        <p className="mt-2 text-xs text-ink-500">
                          {s.submitted ? `Submitted ${formatDate(s.submitted)}` : 'Not yet submitted'}
                          {s.lastActivity && ` · Updated ${relativeTime(s.lastActivity)}`}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {needsAction && (
                          <Link
                            to={s.status === S.DRAFT ? `/submissions/${s.id}` : `/submissions/${s.id}`}
                            className="btn-primary btn-sm"
                          >
                            {s.status === S.REVISION_REQUIRED ? 'Upload revision' : 'Continue editing'}
                          </Link>
                        )}
                        {s.status === S.PUBLISHED && (
                          <Link to={`/publications/${s.id}`} className="btn-secondary btn-sm">
                            <Icon name="external" size={13} />
                            View article
                          </Link>
                        )}
                        <button
                          onClick={() => setOpen(expanded ? null : s.id)}
                          className="btn-secondary btn-sm"
                          aria-expanded={expanded}
                        >
                          {expanded ? 'Hide' : 'Progress'}
                          <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={13} />
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-5 border-t border-ink-100 pt-5">
                        <WorkflowTimeline submission={s} />
                        <p className="mt-4 rounded-lg bg-ink-50 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-ink-600">
                          {s.status === S.REVISION_REQUIRED &&
                            'The editor has requested revisions. Review the reviewer comments below, prepare your response and upload a revised manuscript.'}
                          {s.status === S.UNDER_REVIEW &&
                            'Your manuscript is with the reviewers. You will be notified when a decision is made.'}
                          {s.status === S.ACCEPTED &&
                            'Your article has been accepted and is being prepared for publication.'}
                          {s.status === S.IN_PRODUCTION &&
                            'Your article is in production — copy-editing, typesetting and DOI assignment.'}
                          {s.status === S.PUBLISHED && 'Your article is published and publicly available.'}
                          {s.status === S.DRAFT &&
                            'This is an unsubmitted draft. Complete the submission steps to send it to the journal.'}
                        </p>
                        <Link to={`/submissions/${s.id}`} className="btn-secondary btn-sm mt-4">
                          Open full record
                          <Icon name="chevronRight" size={13} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {s.status === S.REVISION_REQUIRED && (
                    <div className="border-t border-ink-200 bg-amber-50/60 px-5 py-3">
                      <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-amber-900">
                        <Icon name="rotate" size={14} />
                        Revisions requested — {STATUS_META[s.status].description}
                      </p>
                    </div>
                  )}
                </Panel>
              )
            })}

            {filtered.length === 0 && (
              <Panel bodyClassName="p-0">
                <EmptyState icon="inbox" title="Nothing in this category" />
              </Panel>
            )}
          </div>
        </>
      )}
    </Page>
  )
}
