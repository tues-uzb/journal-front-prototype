/**
 * Workflow stage tracker.
 *
 * Shows the five macro stages of the editorial workflow and highlights where
 * the manuscript currently sits. A submission published via the direct
 * administrative route renders a distinct bypass indicator, so the difference
 * between the two publication paths is visible at a glance.
 *
 * @module components/WorkflowTimeline
 */

import PropTypes from 'prop-types'
import { SUBMISSION_STATUS as S, STATUS_META } from '../domain/status'
import { WORKFLOW_STAGES, stageForStatus } from '../domain/workflow'
import Icon from './ui/Icon'

/** Ordered stages reached, used to decide which nodes are "done". */
function completedStages(status, direct) {
  const current = stageForStatus(status)
  if (!current) return []
  if (direct) return ['SUBMITTED', 'PUBLISHED']
  const idx = WORKFLOW_STAGES.findIndex((s) => s.key === current)
  return WORKFLOW_STAGES.slice(0, Math.max(idx, 0)).map((s) => s.key)
}

export default function WorkflowTimeline({ submission }) {
  const { status, directPublication } = submission
  const currentStage = stageForStatus(status)
  const done = completedStages(status, directPublication)
  const isRejected = status === S.REJECTED
  const isDraft = status === S.DRAFT

  if (isDraft) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-[0.8125rem] text-ink-600">
        <Icon name="file" size={16} className="shrink-0 text-ink-400" />
        This is an unsubmitted draft. The editorial workflow begins once the author submits the manuscript.
      </div>
    )
  }

  return (
    <div>
      <ol className="flex items-start" role="list">
        {WORKFLOW_STAGES.map((stage, i) => {
          const isCurrent = stage.key === currentStage
          const isDone = done.includes(stage.key) && !isCurrent
          // Direct publication collapses the intermediate stages.
          const bypassed = directPublication && (stage.key === 'UNDER_REVIEW' || stage.key === 'DECISION' || stage.key === 'IN_PRODUCTION')
          const isLast = i === WORKFLOW_STAGES.length - 1

          return (
            <li key={stage.key} className={`flex min-w-0 ${isLast ? '' : 'flex-1'}`}>
              <div className="flex min-w-0 flex-col items-center">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[0.6875rem] font-semibold transition ${
                    isCurrent && isRejected
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : isCurrent
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : isDone
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : bypassed
                            ? 'border-amber-300 border-dashed bg-amber-50 text-amber-500'
                            : 'border-ink-300 bg-white text-ink-400'
                  }`}
                  title={bypassed ? 'Bypassed by direct publication' : undefined}
                >
                  {isCurrent ? (
                    isRejected ? (
                      <Icon name="x" size={13} strokeWidth={2.5} />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )
                  ) : isDone ? (
                    <Icon name="check" size={13} strokeWidth={2.75} />
                  ) : bypassed ? (
                    <Icon name="close" size={11} strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`mt-2 text-center text-[0.6875rem] leading-tight font-medium ${
                    isCurrent ? 'text-ink-900' : bypassed ? 'text-amber-600 italic' : isDone ? 'text-emerald-700' : 'text-ink-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <span
                  className={`mt-3.5 h-0.5 min-w-4 flex-1 rounded ${
                    isDone ? 'bg-emerald-400' : isCurrent ? 'bg-brand-300' : bypassed ? 'bg-amber-200' : 'bg-ink-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      {directPublication && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5">
          <Icon name="zap" size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[0.8125rem] leading-relaxed text-amber-900">
            <span className="font-semibold">Published via direct publication.</span> This article bypassed
            external peer review by administrative decision
            {submission.directPublicationReason ? ` — “${submission.directPublicationReason}”` : ''}.
          </p>
        </div>
      )}

      {isRejected && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3.5 py-2.5">
          <Icon name="xCircle" size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[0.8125rem] leading-relaxed text-rose-900">
            <span className="font-semibold">Declined at editorial assessment.</span> The manuscript will not
            proceed to publication.
          </p>
        </div>
      )}

      {!directPublication && !isRejected && currentStage && (
        <p className="mt-3.5 text-xs text-ink-500">
          Current stage: <span className="font-medium text-ink-700">{STATUS_META[status].label}</span>
          {status === S.REVISION_REQUIRED && ' — awaiting a revised manuscript from the author.'}
        </p>
      )}
    </div>
  )
}

WorkflowTimeline.propTypes = {
  submission: PropTypes.shape({
    status: PropTypes.string.isRequired,
    directPublication: PropTypes.bool,
    directPublicationReason: PropTypes.string,
  }).isRequired,
}
