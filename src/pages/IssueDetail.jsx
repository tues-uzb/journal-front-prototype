/**
 * Issue detail: table of contents with ordering, article management,
 * editing and publication.
 * @module pages/IssueDetail
 */

import { useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { canManageIssues } from '../domain/roles'
import { SUBMISSION_STATUS as S } from '../domain/status'
import { formatDate } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, EmptyState, Note, DefinitionList } from '../components/ui/primitives'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import Icon from '../components/ui/Icon'

const STATUS_STYLE = {
  draft: { cls: 'bg-ink-100 text-ink-600 ring-ink-200', label: 'Draft' },
  scheduled: { cls: 'bg-amber-50 text-amber-800 ring-amber-200', label: 'Scheduled' },
  published: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Published' },
}

export default function IssueDetail() {
  const { id } = useParams()
  const { role, pushToast } = useOutletContext()
  const issues = useJournalStore((s) => s.issues)
  const submissions = useJournalStore((s) => s.submissions)
  const users = useJournalStore((s) => s.users)
  const updateIssue = useJournalStore((s) => s.updateIssue)
  const addArticleToIssue = useJournalStore((s) => s.addArticleToIssue)
  const removeArticleFromIssue = useJournalStore((s) => s.removeArticleFromIssue)
  const reorderIssueArticles = useJournalStore((s) => s.reorderIssueArticles)

  const issue = issues.find((i) => i.id === id)

  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [form, setForm] = useState(null)
  const [pick, setPick] = useState('')

  const articles = useMemo(
    () => (issue ? issue.articleIds.map((aid) => submissions.find((s) => s.id === aid)).filter(Boolean) : []),
    [issue, submissions],
  )

  const available = useMemo(
    () =>
      submissions.filter(
        (s) => [S.ACCEPTED, S.IN_PRODUCTION, S.PUBLISHED].includes(s.status) && !issue?.articleIds.includes(s.id),
      ),
    [submissions, issue],
  )

  if (!issue) {
    return (
      <Page>
        <Panel bodyClassName="p-0">
          <EmptyState
            icon="search"
            title="Issue not found"
            action={
              <Link to="/issues" className="btn-primary">
                Back to issues
              </Link>
            }
          />
        </Panel>
      </Page>
    )
  }

  const canManage = canManageIssues(role)
  const st = STATUS_STYLE[issue.status]
  const editor = users.find((u) => u.id === issue.editorId)

  const move = (index, dir) => {
    const next = [...issue.articleIds]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    reorderIssueArticles(issue.id, next)
  }

  const openEdit = () => {
    setForm({ title: issue.title, description: issue.description ?? '', publicationDate: issue.publicationDate ?? '', editorId: issue.editorId ?? '' })
    setEditOpen(true)
  }

  const saveEdit = () => {
    updateIssue(issue.id, form)
    setEditOpen(false)
    pushToast({ tone: 'success', title: 'Issue updated' })
  }

  const doAdd = () => {
    if (!pick) return
    addArticleToIssue(issue.id, pick)
    setPick('')
    setAddOpen(false)
    pushToast({ tone: 'success', title: 'Article added to the issue' })
  }

  const doRemove = (aid) => {
    removeArticleFromIssue(issue.id, aid)
    pushToast({ tone: 'info', title: 'Article removed from the issue' })
  }

  const doPublish = () => {
    updateIssue(issue.id, { status: 'published', publicationDate: form.publicationDate })
    setPublishOpen(false)
    pushToast({
      tone: 'success',
      title: 'Issue published',
      message: `Volume ${issue.volume}, Issue ${issue.number} is now live.`,
    })
  }

  return (
    <Page>
      <Link to="/issues" className="btn-ghost btn-sm -ml-2 mb-4">
        <Icon name="chevronLeft" size={15} />
        All issues
      </Link>

      <PageHeader
        meta={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`chip ${st.cls}`}>{st.label}</span>
            <span className="text-[0.8125rem] text-ink-500">
              Volume {issue.volume} · Issue {issue.number} · {issue.year}
            </span>
          </div>
        }
        title={issue.title}
        description={issue.description}
        actions={
          canManage && (
            <>
              <button onClick={() => setAddOpen(true)} className="btn-secondary" disabled={available.length === 0}>
                <Icon name="plus" size={15} />
                Add article
              </button>
              <button onClick={openEdit} className="btn-secondary">
                <Icon name="edit" size={15} />
                Edit issue
              </button>
              {issue.status !== 'published' && (
                <button
                  onClick={() => {
                    setForm({ publicationDate: issue.publicationDate ?? '2026-12-15' })
                    setPublishOpen(true)
                  }}
                  className="btn-primary"
                >
                  <Icon name="globe" size={15} />
                  Publish issue
                </button>
              )}
            </>
          )
        }
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel
            title="Table of contents"
            description={`${articles.length} article${articles.length === 1 ? '' : 's'} in publication order`}
            bodyClassName="p-0"
            actions={
              canManage && articles.length > 1 ? (
                <span className="text-xs text-ink-500">Use the arrows to reorder</span>
              ) : null
            }
          >
            {articles.length === 0 ? (
              <EmptyState
                icon="file"
                title="No articles in this issue"
                description="Add accepted or in-production articles to build the table of contents."
              />
            ) : (
              <ol className="divide-y divide-ink-100">
                {articles.map((a, idx) => (
                  <li key={a.id} className="flex items-start gap-3.5 p-5">
                    <span className="mt-0.5 w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-ink-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={a.status} size="sm" />
                        {a.directPublication && (
                          <span className="chip bg-amber-50 text-amber-800 ring-amber-200">Direct publication</span>
                        )}
                      </div>
                      <Link
                        to={`/submissions/${a.id}`}
                        className="mt-2 block text-[0.9375rem] leading-snug font-medium text-ink-900 hover:text-brand-600"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-1 text-[0.8125rem] text-ink-600">{a.authors.map((x) => x.name).join(', ')}</p>
                      <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-ink-500">
                        <span className="font-mono">{a.id}</span>
                        {a.doi && <span className="font-mono">{a.doi}</span>}
                        {a.pages && <span>{a.pages}</span>}
                      </p>
                    </div>

                    {canManage && (
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <button
                          onClick={() => move(idx, -1)}
                          disabled={idx === 0}
                          className="btn-ghost p-1 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <Icon name="chevronUp" size={15} />
                        </button>
                        <button
                          onClick={() => move(idx, 1)}
                          disabled={idx === articles.length - 1}
                          className="btn-ghost p-1 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <Icon name="chevronDown" size={15} />
                        </button>
                        <button
                          onClick={() => doRemove(a.id)}
                          className="btn-danger-ghost p-1"
                          aria-label="Remove from issue"
                        >
                          <Icon name="close" size={15} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Issue details" bodyClassName="px-5 py-5">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Volume', value: issue.volume },
                { label: 'Issue', value: issue.number },
                { label: 'Year', value: issue.year },
                { label: 'Status', value: <span className={`chip ${st.cls}`}>{st.label}</span> },
                {
                  label: 'Publication date',
                  value: issue.publicationDate ? formatDate(issue.publicationDate) : 'Not scheduled',
                },
                { label: 'Issue editor', value: editor?.name ?? 'Unassigned' },
                { label: 'Articles', value: articles.length },
                {
                  label: 'Direct publications',
                  value: articles.filter((a) => a.directPublication).length,
                },
              ]}
            />
          </Panel>

          {issue.status !== 'published' && (
            <Note tone={issue.status === 'scheduled' ? 'info' : 'warning'} title={issue.status === 'scheduled' ? 'Scheduled for publication' : 'Draft issue'}>
              {issue.status === 'scheduled'
                ? `This issue is scheduled for ${formatDate(issue.publicationDate)}.`
                : 'This issue is a draft. Add articles, confirm the order, then publish it to make it publicly available.'}
            </Note>
          )}

          {articles.some((a) => a.directPublication) && (
            <Note tone="warning" title="Contains a direct publication">
              This issue includes an article that was published by administrative decision without external peer review.
              This is recorded in its audit log.
            </Note>
          )}
        </aside>
      </div>

      {/* Edit dialog */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit issue"
        description={`Volume ${issue.volume}, Issue ${issue.number}`}
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={saveEdit} className="btn-primary">
              Save changes
            </button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="e-title">
                Issue title
              </label>
              <input
                id="e-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="e-desc">
                Description
              </label>
              <textarea
                id="e-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="textarea"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="e-date">
                  Publication date
                </label>
                <input
                  id="e-date"
                  type="date"
                  value={form.publicationDate}
                  onChange={(e) => setForm({ ...form, publicationDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="e-editor">
                  Issue editor
                </label>
                <select
                  id="e-editor"
                  value={form.editorId}
                  onChange={(e) => setForm({ ...form, editorId: e.target.value })}
                  className="select"
                >
                  <option value="">Unassigned</option>
                  {users
                    .filter((u) => u.role === 'EDITOR' || u.role === 'ADMIN')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add article dialog */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add an article to this issue"
        description="Accepted and in-production articles can be placed in an issue."
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={doAdd} className="btn-primary" disabled={!pick}>
              Add article
            </button>
          </>
        }
      >
        {available.length === 0 ? (
          <p className="py-6 text-center text-[0.8125rem] text-ink-500">
            No eligible articles. Every accepted article is already in an issue.
          </p>
        ) : (
          <div className="space-y-3">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="select">
              <option value="">Select an article…</option>
              {available.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.id}) — {a.status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {pick && (
              <p className="rounded-lg bg-ink-50 px-3.5 py-3 text-[0.8125rem] text-ink-700">
                {submissions.find((s) => s.id === pick)?.title}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Publish dialog */}
      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish this issue?"
        description={`Volume ${issue.volume}, Issue ${issue.number} will become publicly available.`}
        tone="warning"
        footer={
          <>
            <button onClick={() => setPublishOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={doPublish} className="btn-primary">
              <Icon name="globe" size={15} />
              Publish issue
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Note tone="warning" icon="warning">
            Publishing makes all {articles.length} article{articles.length === 1 ? '' : 's'} in this issue publicly
            available on the journal website. This cannot be undone in this prototype.
          </Note>
          <div>
            <label className="label" htmlFor="pub-date">
              Publication date
            </label>
            <input
              id="pub-date"
              type="date"
              value={form?.publicationDate ?? ''}
              onChange={(e) => setForm({ publicationDate: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </Modal>
    </Page>
  )
}
