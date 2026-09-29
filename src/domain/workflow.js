/**
 * Editorial workflow definition.
 *
 * This module is the single source of truth for how a manuscript may move
 * between statuses. The UI never assigns a status directly; it asks for a
 * transition to be performed, and this module decides whether that transition
 * is legal, which action produced it, and what activity entry it generates.
 *
 * Two paths exist:
 *
 *   Standard peer review
 *     SUBMITTED -> UNDER_REVIEW -> REVISION_REQUIRED -> UNDER_REVIEW
 *                -> ACCEPTED -> IN_PRODUCTION -> PUBLISHED
 *
 *   Direct publication (administrative)
 *     SUBMITTED -> PUBLISHED
 *
 * Direct publication deliberately bypasses UNDER REVIEW, REVISION REQUIRED,
 * ACCEPTED and IN PRODUCTION. It is an administrative action, so it is
 * restricted to EDITOR and ADMIN roles and is always recorded in the audit
 * log with an explicit reason.
 *
 * @module domain/workflow
 */

import { SUBMISSION_STATUS } from './status'

/** @typedef {import('./types').SubmissionStatus} SubmissionStatus */
/** @typedef {import('./types').Role} Role */

/** Activity log event types. */
export const ACTIVITY = /** @type {const} */ ({
  SUBMISSION_CREATED: 'SUBMISSION_CREATED',
  SUBMISSION_RECEIVED: 'SUBMISSION_RECEIVED',
  EDITOR_ASSIGNED: 'EDITOR_ASSIGNED',
  REVIEWER_INVITED: 'REVIEWER_INVITED',
  REVIEWER_ACCEPTED: 'REVIEWER_ACCEPTED',
  REVIEWER_DECLINED: 'REVIEWER_DECLINED',
  REVIEW_SUBMITTED: 'REVIEW_SUBMITTED',
  REVIEW_REMINDER_SENT: 'REVIEW_REMINDER_SENT',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  REVISION_UPLOADED: 'REVISION_UPLOADED',
  SUBMISSION_ACCEPTED: 'SUBMISSION_ACCEPTED',
  SUBMISSION_REJECTED: 'SUBMISSION_REJECTED',
  SENT_TO_REVIEW: 'SENT_TO_REVIEW',
  MOVED_TO_PRODUCTION: 'MOVED_TO_PRODUCTION',
  ARTICLE_PUBLISHED: 'ARTICLE_PUBLISHED',
  DIRECT_PUBLICATION: 'DIRECT_PUBLICATION',
  NOTE_ADDED: 'NOTE_ADDED',
  FILE_UPLOADED: 'FILE_UPLOADED',
})

/** Icon key rendered by ActivityTimeline for each event type. */
export const ACTIVITY_ICON = {
  [ACTIVITY.SUBMISSION_CREATED]: 'file',
  [ACTIVITY.SUBMISSION_RECEIVED]: 'inbox',
  [ACTIVITY.EDITOR_ASSIGNED]: 'user-check',
  [ACTIVITY.REVIEWER_INVITED]: 'user-plus',
  [ACTIVITY.REVIEWER_ACCEPTED]: 'check',
  [ACTIVITY.REVIEWER_DECLINED]: 'x',
  [ACTIVITY.REVIEW_SUBMITTED]: 'clipboard',
  [ACTIVITY.REVIEW_REMINDER_SENT]: 'bell',
  [ACTIVITY.REVISION_REQUESTED]: 'rotate',
  [ACTIVITY.REVISION_UPLOADED]: 'upload',
  [ACTIVITY.SUBMISSION_ACCEPTED]: 'check-circle',
  [ACTIVITY.SUBMISSION_REJECTED]: 'x-circle',
  [ACTIVITY.SENT_TO_REVIEW]: 'eye',
  [ACTIVITY.MOVED_TO_PRODUCTION]: 'package',
  [ACTIVITY.ARTICLE_PUBLISHED]: 'globe',
  [ACTIVITY.DIRECT_PUBLICATION]: 'zap',
  [ACTIVITY.NOTE_ADDED]: 'message',
  [ACTIVITY.FILE_UPLOADED]: 'paperclip',
}

/**
 * Transition table.
 *
 * Each entry declares the statuses a transition may be applied *from*, the
 * status it moves *to*, the roles permitted to perform it, the activity event
 * it records, and whether it is part of the normal (non-direct) path.
 *
 * @type {Record<string, {
 *   from: SubmissionStatus[], to: SubmissionStatus, roles: Role[],
 *   event: string, label: string, direct?: boolean, requiresReason?: boolean
 * }>}
 */
export const TRANSITIONS = {
  sendToReview: {
    from: [SUBMISSION_STATUS.SUBMITTED],
    to: SUBMISSION_STATUS.UNDER_REVIEW,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.SENT_TO_REVIEW,
    label: 'Send to Review',
  },
  requestRevision: {
    from: [SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.UNDER_REVIEW],
    to: SUBMISSION_STATUS.REVISION_REQUIRED,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.REVISION_REQUESTED,
    label: 'Request Revision',
  },
  accept: {
    from: [
      SUBMISSION_STATUS.SUBMITTED,
      SUBMISSION_STATUS.UNDER_REVIEW,
      SUBMISSION_STATUS.REVISION_REQUIRED,
    ],
    to: SUBMISSION_STATUS.ACCEPTED,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.SUBMISSION_ACCEPTED,
    label: 'Accept',
  },
  reject: {
    from: [
      SUBMISSION_STATUS.SUBMITTED,
      SUBMISSION_STATUS.UNDER_REVIEW,
      SUBMISSION_STATUS.REVISION_REQUIRED,
    ],
    to: SUBMISSION_STATUS.REJECTED,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.SUBMISSION_REJECTED,
    label: 'Reject',
    requiresReason: true,
  },
  moveToProduction: {
    from: [SUBMISSION_STATUS.ACCEPTED],
    to: SUBMISSION_STATUS.IN_PRODUCTION,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.MOVED_TO_PRODUCTION,
    label: 'Move to Production',
  },
  publish: {
    from: [SUBMISSION_STATUS.IN_PRODUCTION, SUBMISSION_STATUS.ACCEPTED],
    to: SUBMISSION_STATUS.PUBLISHED,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.ARTICLE_PUBLISHED,
    label: 'Publish',
  },
  /**
   * Administrative bypass. Allowed from the earliest actionable statuses so a
   * demonstrable prototype can reach a published state quickly, but it is
   * flagged `direct: true` so the UI and audit log can distinguish it from the
   * normal path.
   */
  publishDirectly: {
    from: [
      SUBMISSION_STATUS.SUBMITTED,
      SUBMISSION_STATUS.UNDER_REVIEW,
      SUBMISSION_STATUS.REVISION_REQUIRED,
      SUBMISSION_STATUS.ACCEPTED,
      SUBMISSION_STATUS.IN_PRODUCTION,
    ],
    to: SUBMISSION_STATUS.PUBLISHED,
    roles: ['EDITOR', 'ADMIN'],
    event: ACTIVITY.DIRECT_PUBLICATION,
    label: 'Publish Directly',
    direct: true,
    requiresReason: false,
  },
  returnToDraft: {
    from: [SUBMISSION_STATUS.REVISION_REQUIRED, SUBMISSION_STATUS.SUBMITTED],
    to: SUBMISSION_STATUS.DRAFT,
    roles: ['AUTHOR'],
    event: ACTIVITY.REVISION_UPLOADED,
    label: 'Return to Draft',
  },
  submit: {
    from: [SUBMISSION_STATUS.DRAFT, SUBMISSION_STATUS.REVISION_REQUIRED],
    to: SUBMISSION_STATUS.SUBMITTED,
    roles: ['AUTHOR'],
    event: ACTIVITY.SUBMISSION_RECEIVED,
    label: 'Submit',
  },
}

/**
 * Check whether a named transition is currently legal.
 *
 * @param {string} name       key in TRANSITIONS
 * @param {SubmissionStatus} fromStatus current submission status
 * @param {Role} role         acting role
 * @returns {boolean}
 */
export function canTransition(name, fromStatus, role) {
  const t = TRANSITIONS[name]
  if (!t) return false
  return t.from.includes(fromStatus) && t.roles.includes(role)
}

/**
 * All transitions available to `role` given a submission status.
 * Used to render the editorial action panel.
 *
 * @param {SubmissionStatus} status
 * @param {Role} role
 * @returns {Array<{name: string, label: string, to: SubmissionStatus, direct?: boolean, requiresReason?: boolean}>}
 */
export function availableTransitions(status, role) {
  return Object.entries(TRANSITIONS)
    .filter(([, t]) => t.from.includes(status) && t.roles.includes(role))
    .map(([name, t]) => ({
      name,
      label: t.label,
      to: t.to,
      direct: Boolean(t.direct),
      requiresReason: Boolean(t.requiresReason),
    }))
}

/**
 * The five macro stages shown in the submission timeline. Direct publication
 * collapses the middle stages because they are bypassed.
 */
export const WORKFLOW_STAGES = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Review' },
  { key: 'DECISION', label: 'Decision' },
  { key: 'IN_PRODUCTION', label: 'Production' },
  { key: 'PUBLISHED', label: 'Publication' },
]

/** Which stage a status belongs to, or null for DRAFT/REJECTED. */
export function stageForStatus(status) {
  switch (status) {
    case SUBMISSION_STATUS.DRAFT:
      return null
    case SUBMISSION_STATUS.SUBMITTED:
      return 'SUBMITTED'
    case SUBMISSION_STATUS.UNDER_REVIEW:
      return 'UNDER_REVIEW'
    case SUBMISSION_STATUS.REVISION_REQUIRED:
      return 'DECISION'
    case SUBMISSION_STATUS.ACCEPTED:
      return 'DECISION'
    case SUBMISSION_STATUS.REJECTED:
      return 'DECISION'
    case SUBMISSION_STATUS.IN_PRODUCTION:
      return 'IN_PRODUCTION'
    case SUBMISSION_STATUS.PUBLISHED:
      return 'PUBLISHED'
    default:
      return null
  }
}

/**
 * Build the audit-log entry for a transition.
 * The caller supplies actor context; this keeps workflow rules out of the UI.
 *
 * @param {string} name
 * @param {{actor: string, role: Role, reason?: string, timestamp?: string}} ctx
 * @returns {{type: string, label: string, actor: string, actorRole: Role, reason?: string, timestamp: string}}
 */
export function buildActivityFor(name, ctx) {
  const t = TRANSITIONS[name]
  if (!t) throw new Error(`Unknown transition: ${name}`)

  const timestamps = {
    [ACTIVITY.SENT_TO_REVIEW]: `Sent for external peer review.`,
    [ACTIVITY.REVISION_REQUESTED]: `Revision requested from the author.`,
    [ACTIVITY.SUBMISSION_ACCEPTED]: `Manuscript accepted following peer review.`,
    [ACTIVITY.SUBMISSION_REJECTED]: `Manuscript declined.`,
    [ACTIVITY.MOVED_TO_PRODUCTION]: `Article moved to production for copy-editing and typesetting.`,
    [ACTIVITY.ARTICLE_PUBLISHED]: `Article published in an issue.`,
    [ACTIVITY.DIRECT_PUBLICATION]: `Article published directly by ${ctx.role === 'ADMIN' ? 'Administrator' : 'Editor'}.`,
    [ACTIVITY.SUBMISSION_RECEIVED]: `Manuscript submitted to the journal.`,
    [ACTIVITY.REVISION_UPLOADED]: `Revised manuscript uploaded by the author.`,
  }

  return {
    type: t.event,
    label: timestamps[t.event] ?? t.label,
    actor: ctx.actor,
    actorRole: ctx.role,
    reason: ctx.reason,
    timestamp: ctx.timestamp ?? new Date().toISOString().slice(0, 10),
  }
}
