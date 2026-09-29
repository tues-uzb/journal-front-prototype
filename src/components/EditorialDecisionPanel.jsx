/**
 * Editorial decision panel.
 *
 * Actions are derived from the workflow definition for the current status and
 * the acting role, so the panel can never offer an illegal transition.
 * Direct publication is separated visually from the peer-review actions.
 *
 * @module components/EditorialDecisionPanel
 */

import { useState } from 'react'
import PropTypes from 'prop-types'

import { availableTransitions, TRANSITIONS } from '../domain/workflow'
import { canPublishDirectly, isEditorial } from '../domain/roles'
import useJournalStore from '../store/useJournalStore'
import { openIssues, issueFullLabel } from '../data/issues'

import DirectPublishDialog from './DirectPublishDialog'
import StatusBadge from './ui/StatusBadge'
import { Note } from './ui/primitives'
import Icon from './ui/Icon'

/** Visual treatment per action. */
const ACTION_STYLE = {
  accept: { cls: 'btn-primary', icon: 'checkCircle' },
  reject: { cls: 'btn-danger', icon: 'xCircle' },
  requestRevision: { cls: 'btn-secondary', icon: 'rotate' },
  sendToReview: { cls: 'btn-secondary', icon: 'eye' },
  moveToProduction: { cls: 'btn-secondary', icon: 'package' },
  publish: { cls: 'btn-primary', icon: 'globe' },
  publishDirectly: { cls: 'btn-direct', icon: 'zap' },
  submit: { cls: 'btn-primary', icon: 'send' },
  returnToDraft: { cls: 'btn-secondary', icon: 'edit' },
}

/** Actions that ask for a written rationale. */
const NEEDS_REASON = new Set(['reject', 'requestRevision', 'moveToProduction'])

export default function EditorialDecisionPanel({ submission, role, user, onDone }) {
  const applyTransition = useJournalStore((s) => s.applyTransition)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [reason, setReason] = useState('')
  const [issueId, setIssueId] = useState('')
  const [error, setError] = useState('')
  const [directOpen, setDirectOpen] = useState(false)

  const actions = availableTransitions(submission.status, role)
  const isAuthor = role === 'AUTHOR'

  /* ── Non-editorial view: authors just track state ── */
  if (!isEditorial(role) && !isAuthor) {
    return (
      <Note tone="neutral" icon="lock">
        Editorial decisions are available to editors and administrators. You are viewing this submission as{' '}
        {role === 'REVIEWER' ? 'a reviewer' : 'a guest'}.
      </Note>
    )
  }

  if (actions.length === 0) {
    return (
      <Note tone={submission.status === 'PUBLISHED' ? 'success' : 'neutral'} icon={submission.status === 'PUBLISHED' ? 'globe' : 'lock'}>
        {submission.status === 'PUBLISHED'
          ? 'This manuscript has been published and is now closed to further editorial action.'
          : submission.status === 'REJECTED'
            ? 'This manuscript was declined and is closed to further editorial action.'
            : 'No editorial actions are available for this manuscript at its current stage.'}
      </Note>
    )
  }

  const run = (name, extra = {}) => {
    setError('')
    const result = applyTransition(name, submission.id, { actor: { name: user.name, role }, ...extra })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setReasonOpen(false)
    setPendingAction(null)
    setReason('')
    onDone?.(name)
  }

  const onActionClick = (name) => {
    setError('')
    if (name === 'publishDirectly') {
      setDirectOpen(true)
      return
    }
    if (NEEDS_REASON.has(name)) {
      setPendingAction(name)
      setReason('')
      setReasonOpen(true)
      return
    }
    if (name === 'publish') {
      setPendingAction(name)
      setIssueId(openIssues[0]?.id ?? '')
      setReasonOpen(true)
      return
    }
    run(name)
  }

  const standard = actions.filter((a) => !a.direct)
  const direct = actions.find((a) => a.direct)

  return (
    <div className="space-y-4">
      {/* Current state */}
      <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-3">
        <span className="text-xs text-ink-500">Current status</span>
        <StatusBadge status={submission.status} />
      </div>

      {isAuthor && (
        <Note tone="info" icon="info">
          You can submit this manuscript for review or continue editing it. Editorial decisions are made by the journal
          after peer review.
        </Note>
      )}

      {/* Standard peer-review actions */}
      {standard.length > 0 && (
        <div>
          <p className="mb-2.5 text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">
            Editorial actions
          </p>
          <div className="flex flex-wrap gap-2">
            {standard.map((a) => {
              const style = ACTION_STYLE[a.name] ?? { cls: 'btn-secondary', icon: 'check' }
              return (
                <button key={a.name} onClick={() => onActionClick(a.name)} className={`${style.cls} btn-sm`}>
                  <Icon name={style.icon} size={14} />
                  {a.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Direct publication — deliberately separated */}
      {direct && canPublishDirectly(role) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3.5">
          <div className="flex items-start gap-2.5">
            <Icon name="zap" size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-semibold text-amber-900">Administrative action</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                Publish this article without external peer review. Use only for invited contributions, editorials,
                proceedings papers and corrections.
              </p>
              <button onClick={() => onActionClick('publishDirectly')} className="btn-direct btn-sm mt-3">
                <Icon name="zap" size={14} />
                Publish directly
              </button>
            </div>
          </div>
        </div>
      )}

      {!direct && isEditorial(role) && submission.status !== 'PUBLISHED' && submission.status !== 'REJECTED' && (
        <p className="text-xs text-ink-500">
          Direct publication is available from the submitted stage onwards, but is intended for exceptional cases only.
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5">
          <p className="text-[0.8125rem] text-rose-800">{error}</p>
        </div>
      )}

      {/* Reason / issue dialog for standard actions */}
      {reasonOpen && pendingAction && (
        <DecisionReasonDialog
          actionName={pendingAction}
          submission={submission}
          reason={reason}
          setReason={setReason}
          issueId={issueId}
          setIssueId={setIssueId}
          onCancel={() => setReasonOpen(false)}
          onConfirm={() => {
            if (pendingAction === 'publish') run('publish', { issueId, publicationDate: '2026-09-29' })
            else run(pendingAction, { reason: reason.trim() || undefined })
          }}
        />
      )}

      {/* Direct publication dialog */}
      <DirectPublishDialog
        open={directOpen}
        onClose={() => setDirectOpen(false)}
        submission={submission}
        onConfirm={({ issueId: iid, publicationDate, reason: r }) => {
          const result = applyTransition('publishDirectly', submission.id, {
            actor: { name: user.name, role },
            reason: r || 'No reason supplied',
            issueId: iid,
            publicationDate,
          })
          setDirectOpen(false)
          if (result.ok) onDone?.('publishDirectly')
          else setError(result.error)
        }}
      />
    </div>
  )
}

EditorialDecisionPanel.propTypes = {
  submission: PropTypes.object.isRequired,
  role: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  onDone: PropTypes.func,
}

/* ── Reason / issue picker for ordinary decisions ─────────────────────── */

function DecisionReasonDialog({ actionName, submission, reason, setReason, issueId, setIssueId, onCancel, onConfirm }) {
  const t = TRANSITIONS[actionName]
  const needsReason = t.requiresReason
  const needsIssue = actionName === 'publish'
  const valid = (!needsReason || reason.trim().length > 0) && (!needsIssue || Boolean(issueId))
  const [touched, setTouched] = useState(false)

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
      {/* Capped to the viewport and internally scrollable so the footer
          actions stay reachable on short screens. */}
      <div className="panel relative flex max-h-[92dvh] w-full max-w-lg flex-col shadow-overlay">
        <div className="shrink-0 px-6 pt-5 pb-4">
          <h2 className="text-base font-semibold text-ink-900">{t.label}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
            {t.label} “{submission.title}”. The status will change to{' '}
            <span className="font-medium">{t.to.replace(/_/g, ' ')}</span> and the action will be recorded in the
            audit log.
          </p>
        </div>

        <div className="scrollbar-slim min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-5">
          {needsIssue && (
            <div>
              <label className="label" htmlFor="pub-issue">
                Target issue
              </label>
              <select id="pub-issue" value={issueId} onChange={(e) => setIssueId(e.target.value)} className="select">
                <option value="">Select an issue…</option>
                {openIssues.map((i) => (
                  <option key={i.id} value={i.id}>
                    {issueFullLabel(i)} — {i.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label" htmlFor="decision-reason">
              {needsReason ? 'Reason' : 'Note to the audit log'}{' '}
              {needsReason ? <span className="text-rose-600">*</span> : <span className="font-normal text-ink-400">(optional)</span>}
            </label>
            <textarea
              id="decision-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={
                actionName === 'reject'
                  ? 'Explain the decision to the author…'
                  : actionName === 'requestRevision'
                    ? 'Summarise what the author should address…'
                    : 'Optional context for the record…'
              }
              className={`textarea ${touched && needsReason && !reason.trim() ? 'border-rose-400' : ''}`}
            />
            {touched && needsReason && !reason.trim() && (
              <p className="error-text">A reason is required for this decision.</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2.5 rounded-b-xl border-t border-ink-200 bg-ink-50/60 px-6 py-4">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              setTouched(true)
              if (valid) onConfirm()
            }}
            className={actionName === 'reject' ? 'btn-danger' : 'btn-primary'}
          >
            {t.label}
          </button>
        </div>
      </div>
    </div>
  )
}

DecisionReasonDialog.propTypes = {
  actionName: PropTypes.string.isRequired,
  submission: PropTypes.object.isRequired,
  reason: PropTypes.string.isRequired,
  setReason: PropTypes.func.isRequired,
  issueId: PropTypes.string.isRequired,
  setIssueId: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}
