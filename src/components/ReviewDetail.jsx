/**
 * Read-only rendering of a submitted review.
 * Reviewer identity is hidden until a decision has been made (double-blind).
 * @module components/ReviewDetail
 */

import PropTypes from 'prop-types'
import { RecommendationPill, Avatar } from './ui/primitives'
import { formatDate } from './ActivityTimeline'
import Icon from './ui/Icon'

export default function ReviewDetail({ review, reviewer, revealIdentity = false }) {
  const anonymous = review.isBlind && !revealIdentity

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-ink-200 bg-ink-50/50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={anonymous ? 'Anonymous Reviewer' : reviewer?.name} size={34} />
          <div>
            <p className="text-[0.8125rem] font-medium text-ink-900">
              {anonymous ? 'Anonymous reviewer' : reviewer?.name}
            </p>
            <p className="text-xs text-ink-500">
              {anonymous ? 'Identity withheld under double-anonymous review' : reviewer?.affiliation}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RecommendationPill value={review.recommendation} />
          {review.submitted && (
            <span className="text-xs text-ink-500">Submitted {formatDate(review.submitted)}</span>
          )}
        </div>
      </div>

      <div className="space-y-5 px-4 py-4">
        {/* Summary */}
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">Summary</p>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-700">{review.summary}</p>
        </div>

        {/* Comments to author */}
        {review.commentsToAuthor && (
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-500 uppercase">
              Comments to the author
            </p>
            <div className="mt-1.5 space-y-3 rounded-lg border border-ink-200 bg-white px-4 py-3.5">
              {review.commentsToAuthor.split('\n\n').map((para, i) => (
                <p key={i} className="text-[0.875rem] leading-[1.7] text-ink-700">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Confidential comments to editor */}
        {review.commentsToEditor && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.06em] text-amber-800 uppercase">
              <Icon name="lock" size={11} />
              Confidential — editor only
            </p>
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-amber-900">{review.commentsToEditor}</p>
          </div>
        )}
      </div>
    </div>
  )
}

ReviewDetail.propTypes = {
  review: PropTypes.object.isRequired,
  reviewer: PropTypes.object,
  revealIdentity: PropTypes.bool,
}
