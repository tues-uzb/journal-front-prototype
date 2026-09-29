/**
 * Submission query helpers.
 * Kept out of the store so filtering/derivation logic is pure and testable.
 * @module store/selectors
 */

import { SUBMISSION_STATUS as S, isActive, isTerminal } from '../domain/status'
import { canTransition } from '../domain/workflow'

/** Sort activity logs newest first. */
export function sortActivity(logs) {
  return [...logs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))
}

/** All reviews across all submissions, optionally filtered. */
export function allReviews(submissions) {
  return submissions.flatMap((s) => s.reviews.map((r) => ({ ...r, submissionTitle: s.title })))
}

/** Count reviews by status for a given reviewer. */
export function reviewerCounts(submissions, reviewerId) {
  const mine = allReviews(submissions).filter((r) => r.reviewerId === reviewerId)
  return {
    assigned: mine.length,
    active: mine.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS').length,
    completed: mine.filter((r) => r.status === 'SUBMITTED').length,
    pending: mine.filter((r) => r.status === 'INVITED').length,
    declined: mine.filter((r) => r.status === 'DECLINED').length,
    total: mine.length,
  }
}

/** Submission status counts for the editorial dashboard. */
export function statusCounts(submissions) {
  return {
    total: submissions.length,
    new: submissions.filter((s) => s.status === S.SUBMITTED).length,
    underReview: submissions.filter((s) => s.status === S.UNDER_REVIEW).length,
    revisions: submissions.filter((s) => s.status === S.REVISION_REQUIRED).length,
    accepted: submissions.filter((s) => s.status === S.ACCEPTED).length,
    inProduction: submissions.filter((s) => s.status === S.IN_PRODUCTION).length,
    published: submissions.filter((s) => s.status === S.PUBLISHED).length,
    rejected: submissions.filter((s) => s.status === S.REJECTED).length,
  }
}

/**
 * Submissions that need editorial attention: newly submitted ones and those
 * with a late or overdue review.
 */
export function needsAttention(submissions) {
  const today = '2026-09-29'
  return submissions.filter((s) => {
    if (s.status === S.SUBMITTED) return true
    if (s.status === S.UNDER_REVIEW) {
      const pending = s.reviews.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ACCEPTED')
      return pending.some((r) => r.deadline && r.deadline < today)
    }
    if (s.status === S.ACCEPTED) return true
    return false
  })
}

/** Author-facing counts. */
export function authorCounts(submissions, authorName) {
  const mine = submissions.filter((s) => s.authors.some((a) => a.name === authorName))
  return {
    total: mine.length,
    drafts: mine.filter((s) => s.status === S.DRAFT).length,
    submitted: mine.filter((s) => isActive(s.status) && s.status !== S.REVISION_REQUIRED).length,
    revisions: mine.filter((s) => s.status === S.REVISION_REQUIRED).length,
    accepted: mine.filter((s) => s.status === S.ACCEPTED || s.status === S.IN_PRODUCTION).length,
    published: mine.filter((s) => s.status === S.PUBLISHED).length,
    rejected: mine.filter((s) => s.status === S.REJECTED).length,
  }
}

/** Number of reviews submitted for a submission (used in the table). */
export function completedReviewCount(submission) {
  return submission.reviews.filter((r) => r.status === 'SUBMITTED').length
}

/** Whether an editor can still act on this submission. */
export function isEditable(submission, role) {
  if (isTerminal(submission.status)) return false
  return canTransition('sendToReview', submission.status, role) ||
    canTransition('publishDirectly', submission.status, role)
}

/** All published articles, newest first. */
export function publishedArticles(submissions) {
  return submissions
    .filter((s) => s.status === S.PUBLISHED)
    .sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1))
}
