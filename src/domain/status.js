/**
 * Submission status vocabulary.
 *
 * Every status used anywhere in the UI is declared here exactly once: label,
 * short label, description and the visual tone used by <StatusBadge>.
 * No other module should hard-code a status string or a status colour.
 *
 * @module domain/status
 */

/** @typedef {import('./types').SubmissionStatus} SubmissionStatus */

export const SUBMISSION_STATUS = /** @type {const} */ ({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  IN_PRODUCTION: 'IN_PRODUCTION',
  PUBLISHED: 'PUBLISHED',
})

/**
 * Presentation metadata for each status.
 * `tone` maps to the badge style classes in components/ui/StatusBadge.jsx.
 */
export const STATUS_META = {
  DRAFT: {
    label: 'Draft',
    short: 'Draft',
    tone: 'neutral',
    description: 'Not yet submitted. Visible only to the author and editors.',
  },
  SUBMITTED: {
    label: 'Submitted',
    short: 'Submitted',
    tone: 'info',
    description: 'Received by the journal and awaiting an editorial decision.',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    short: 'Review',
    tone: 'violet',
    description: 'External reviewers have been invited and are evaluating the manuscript.',
  },
  REVISION_REQUIRED: {
    label: 'Revision Required',
    short: 'Revision',
    tone: 'amber',
    description: 'Returned to the author with reviewer comments to address.',
  },
  ACCEPTED: {
    label: 'Accepted',
    short: 'Accepted',
    tone: 'emerald',
    description: 'Accepted following peer review. Awaiting production.',
  },
  REJECTED: {
    label: 'Rejected',
    short: 'Rejected',
    tone: 'rose',
    description: 'Declined following editorial assessment.',
  },
  IN_PRODUCTION: {
    label: 'In Production',
    short: 'Production',
    tone: 'indigo',
    description: 'Copy-editing, typesetting and DOI assignment in progress.',
  },
  PUBLISHED: {
    label: 'Published',
    short: 'Published',
    tone: 'green',
    description: 'Published in an issue and publicly available.',
  },
}

/** Statuses considered "in flight" (not terminal, not a draft). */
export const ACTIVE_STATUSES = [
  SUBMISSION_STATUS.SUBMITTED,
  SUBMISSION_STATUS.UNDER_REVIEW,
  SUBMISSION_STATUS.REVISION_REQUIRED,
  SUBMISSION_STATUS.ACCEPTED,
  SUBMISSION_STATUS.IN_PRODUCTION,
]

/** Statuses that are terminal — the manuscript will not move again. */
export const TERMINAL_STATUSES = [SUBMISSION_STATUS.PUBLISHED, SUBMISSION_STATUS.REJECTED]

export function isTerminal(status) {
  return TERMINAL_STATUSES.includes(status)
}

export function isActive(status) {
  return ACTIVE_STATUSES.includes(status)
}

/** Human readable label for a status, with a safe fallback. */
export function statusLabel(status) {
  return STATUS_META[status]?.label ?? status
}

/** Ordered list of statuses, used to populate filter tabs. */
export const STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New', statuses: [SUBMISSION_STATUS.SUBMITTED] },
  { key: 'UNDER_REVIEW', label: 'Under Review', statuses: [SUBMISSION_STATUS.UNDER_REVIEW] },
  { key: 'REVISION_REQUIRED', label: 'Revision', statuses: [SUBMISSION_STATUS.REVISION_REQUIRED] },
  { key: 'ACCEPTED', label: 'Accepted', statuses: [SUBMISSION_STATUS.ACCEPTED] },
  { key: 'REJECTED', label: 'Rejected', statuses: [SUBMISSION_STATUS.REJECTED] },
  { key: 'PUBLISHED', label: 'Published', statuses: [SUBMISSION_STATUS.PUBLISHED] },
]
