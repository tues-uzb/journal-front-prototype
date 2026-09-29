/**
 * Issues index with create/edit capability.
 * @module pages/Issues
 */

import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { canManageIssues } from '../domain/roles'
import { formatDate } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState } from '../components/ui/primitives'
import Modal from '../components/ui/Modal'
import Icon from '../components/ui/Icon'

const STATUS_STYLE = {
  draft: { cls: 'bg-ink-100 text-ink-600 ring-ink-200', label: 'Draft' },
  scheduled: { cls: 'bg-amber-50 text-amber-800 ring-amber-200', label: 'Scheduled' },
  published: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Published' },
}

export default function Issues() {
  const issues = useJournalStore((s) => s.issues)
  const submissions = useJournalStore((s) => s.submissions)
  const addIssue = useJournalStore((s) => s.addIssue)
  const { role, pushToast } = useOutletContext()

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ volume: '', number: '', year: '2026', title: '', description: '', publicationDate: '' })
  const [touched, setTouched] = useState(false)

  const canManage = canManageIssues(role)

  const sorted = useMemo(
    () =>
      [...issues].sort((a, b) => {
        if (a.year !== b.year) return Number(b.year) - Number(a.year)
        return Number(b.number) - Number(a.number)
      }),
    [issues],
  )

  const nextVolume = useMemo(() => {
    const nums = issues.map((i) => Number(i.volume)).filter(Boolean)
    return String(Math.max(0, ...nums) + (issues.some((i) => i.status !== 'published') ? 0 : 1))
  }, [issues])

  const nextNumber = useMemo(() => {
    const forNext = issues.filter((i) => i.volume === nextVolume)
    return String(forNext.length + 1)
  }, [issues, nextVolume])

  const errors = {
    volume: !form.volume.trim() ? 'Volume number is required.' : '',
    number: !form.number.trim() ? 'Issue number is required.' : '',
    title: !form.title.trim() ? 'Issue title is required.' : '',
    year: !/^\d{4}$/.test(form.year) ? 'Enter a four-digit year.' : '',
  }
  const valid = !Object.values(errors).some(Boolean)

  const openCreate = () => {
    setForm({ volume: nextVolume, number: nextNumber, year: '2026', title: '', description: '', publicationDate: '' })
    setTouched(false)
    setCreateOpen(true)
  }

  const create = () => {
    setTouched(true)
    if (!valid) return
    addIssue({ ...form, status: 'draft' })
    setCreateOpen(false)
    pushToast({
      tone: 'success',
      title: `Volume ${form.volume}, Issue ${form.number} created`,
      message: 'The issue is saved as a draft. You can now add articles and publish it.',
    })
  }

  return (
    <Page>
      <PageHeader
        title="Issues"
        description="Published, scheduled and forthcoming issues of the journal."
        actions={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Icon name="plus" size={16} />
              Create issue
            </button>
          )
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total" value={issues.length} hint="All issues" />
        <StatTile label="Published" value={issues.filter((i) => i.status === 'published').length} tone="good" hint="Live" />
        <StatTile label="Scheduled" value={issues.filter((i) => i.status === 'scheduled').length} tone={issues.some((i) => i.status === 'scheduled') ? 'warn' : 'default'} hint="Forthcoming" />
        <StatTile
          label="Articles"
          value={submissions.filter((s) => s.status === 'PUBLISHED').length}
          tone="brand"
          hint="Published total"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {sorted.map((i) => {
          const st = STATUS_STYLE[i.status]
          return (
            <Panel key={i.id} bodyClassName="p-0" className="transition hover:border-ink-300 hover:shadow-raised">
              <Link to={`/issues/${i.id}`} className="block p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">
                      Volume {i.volume} · Issue {i.number} · {i.year}
                    </p>
                    <h2 className="mt-1.5 text-[0.9375rem] leading-snug font-semibold text-ink-900">{i.title}</h2>
                  </div>
                  <span className={`chip shrink-0 ${st.cls}`}>{st.label}</span>
                </div>

                {i.description && (
                  <p className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-600">{i.description}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="file" size={13} />
                    {i.articleIds.length} article{i.articleIds.length === 1 ? '' : 's'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="calendar" size={13} />
                    {i.publicationDate ? formatDate(i.publicationDate) : 'Not scheduled'}
                  </span>
                </div>
              </Link>
            </Panel>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <Panel bodyClassName="p-0">
          <EmptyState icon="layers" title="No issues yet" />
        </Panel>
      )}

      {/* Create issue dialog */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a new issue"
        description="Issues group published articles into a numbered volume and issue."
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={create} className="btn-primary">
              Create issue
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="vol">
                Volume <span className="text-rose-600">*</span>
              </label>
              <input
                id="vol"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                onBlur={() => setTouched(true)}
                className={`input ${touched && errors.volume ? 'border-rose-400' : ''}`}
              />
              {touched && errors.volume && <p className="error-text">{errors.volume}</p>}
            </div>
            <div>
              <label className="label" htmlFor="num">
                Issue <span className="text-rose-600">*</span>
              </label>
              <input
                id="num"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                onBlur={() => setTouched(true)}
                className={`input ${touched && errors.number ? 'border-rose-400' : ''}`}
              />
              {touched && errors.number && <p className="error-text">{errors.number}</p>}
            </div>
            <div>
              <label className="label" htmlFor="yr">
                Year <span className="text-rose-600">*</span>
              </label>
              <input
                id="yr"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                onBlur={() => setTouched(true)}
                className={`input ${touched && errors.year ? 'border-rose-400' : ''}`}
              />
              {touched && errors.year && <p className="error-text">{errors.year}</p>}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="ititle">
              Issue title <span className="text-rose-600">*</span>
            </label>
            <input
              id="ititle"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Digital Systems and Applied Methods"
              className={`input ${touched && errors.title ? 'border-rose-400' : ''}`}
            />
            {touched && errors.title && <p className="error-text">{errors.title}</p>}
          </div>

          <div>
            <label className="label" htmlFor="idesc">
              Description
            </label>
            <textarea
              id="idesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional summary of the issue's theme and contributions…"
              className="textarea"
            />
          </div>

          <div>
            <label className="label" htmlFor="idate">
              Publication date
            </label>
            <input
              id="idate"
              type="date"
              value={form.publicationDate}
              onChange={(e) => setForm({ ...form, publicationDate: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </Modal>
    </Page>
  )
}
