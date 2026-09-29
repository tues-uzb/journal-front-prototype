/**
 * Direct publication confirmation.
 *
 * This is a first-class administrative action, so the dialog makes the
 * consequences explicit: peer review is bypassed, an issue must be chosen,
 * and a reason is recorded in the audit log. The dialog refuses to confirm
 * until an issue is selected.
 *
 * @module components/DirectPublishDialog
 */

import { useState } from 'react'
import PropTypes from 'prop-types'

import { openIssues, issueFullLabel } from '../data/issues'
import { formatDate } from './ActivityTimeline'

import Modal from './ui/Modal'
import { Note } from './ui/primitives'
import Icon from './ui/Icon'

const QUICK_REASONS = [
  'Invited editorial contribution',
  'Guest editor commentary',
  'Society proceedings paper',
  'Correction or erratum',
]

export default function DirectPublishDialog({ open, onClose, submission, onConfirm }) {
  const [issueId, setIssueId] = useState('')
  const [publicationDate, setPublicationDate] = useState('2026-09-29')
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const issues = openIssues
  const issueValid = Boolean(issueId)
  const selectedIssue = issues.find((i) => i.id === issueId)

  const reset = () => {
    setIssueId('')
    setPublicationDate('2026-09-29')
    setReason('')
    setTouched(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleConfirm = () => {
    setTouched(true)
    if (!issueValid) return
    onConfirm({ issueId, publicationDate, reason: reason.trim() })
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      tone="warning"
      size="md"
      title="Publish this article directly?"
      description="This action will bypass the peer-review workflow and publish the submission directly to an issue."
      footer={
        <>
          <button onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-direct">
            <Icon name="zap" size={15} />
            Publish directly
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Consequence banner */}
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3">
          <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-amber-900">
            <Icon name="warning" size={15} />
            Peer review will be skipped
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
            {['UNDER REVIEW', 'REVISION', 'ACCEPTED', 'PRODUCTION'].map((s) => (
              <span key={s} className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800 line-through">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-amber-900/85">
            The manuscript moves directly from <span className="font-semibold">{submission?.status.replace(/_/g, ' ')}</span> to{' '}
            <span className="font-semibold">PUBLISHED</span>. This exception is recorded permanently in the audit log
            with your name, role and the reason given below.
          </p>
        </div>

        {/* Article */}
        <div className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-3">
          <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Article</p>
          <p className="mt-1 text-[0.8125rem] font-medium text-ink-900">{submission?.title}</p>
          <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">{submission?.id}</p>
        </div>

        {/* Issue — required */}
        <div>
          <label className="label" htmlFor="dp-issue">
            Target issue <span className="text-rose-600">*</span>
          </label>
          <select
            id="dp-issue"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`select ${touched && !issueValid ? 'border-rose-400' : ''}`}
          >
            <option value="">Select an issue…</option>
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                {issueFullLabel(i)} — {i.title} ({i.articleIds.length} article{i.articleIds.length === 1 ? '' : 's'})
              </option>
            ))}
          </select>
          {touched && !issueValid && (
            <p className="error-text">Select the issue this article will be published in.</p>
          )}
          {selectedIssue && (
            <p className="hint">
              This article will be appended to the table of contents of{' '}
              <span className="font-medium text-ink-700">Volume {selectedIssue.volume}, Issue {selectedIssue.number}</span> as
              article {selectedIssue.articleIds.length + 1}.
            </p>
          )}
        </div>

        {/* Publication date */}
        <div>
          <label className="label" htmlFor="dp-date">
            Publication date
          </label>
          <input
            id="dp-date"
            type="date"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
            className="input"
          />
          <p className="hint">Recorded in the audit log as {formatDate(publicationDate)}.</p>
        </div>

        {/* Reason — optional */}
        <div>
          <label className="label" htmlFor="dp-reason">
            Reason <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <textarea
            id="dp-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invited editorial contribution"
            className="textarea"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="rounded-md border border-ink-200 bg-white px-2 py-1 text-[0.6875rem] text-ink-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Note tone="neutral" icon="clipboard">
          This is a prototype. No notification is sent and no external service is contacted.
        </Note>
      </div>
    </Modal>
  )
}

DirectPublishDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  submission: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
}
