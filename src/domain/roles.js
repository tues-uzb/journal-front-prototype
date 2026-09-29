/**
 * Role definitions and per-role navigation/permission rules.
 *
 * The prototype has no real authentication. The active role is a UI toggle,
 * but the capability rules below behave like real authorisation so the
 * prototype demonstrates how the product would actually restrict actions.
 *
 * @module domain/roles
 */

/** @typedef {import('./types').Role} Role */

export const ROLES = /** @type {const} */ ({
  AUTHOR: 'AUTHOR',
  REVIEWER: 'REVIEWER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
})

export const ROLE_META = {
  AUTHOR: {
    label: 'Author',
    blurb: 'Submit manuscripts, respond to revision requests and track publication.',
    accent: 'sky',
  },
  REVIEWER: {
    label: 'Reviewer',
    blurb: 'View assigned manuscripts and submit review reports.',
    accent: 'violet',
  },
  EDITOR: {
    label: 'Editor',
    blurb: 'Manage submissions, assign reviewers and make editorial decisions.',
    accent: 'indigo',
  },
  ADMIN: {
    label: 'Administrator',
    blurb: 'Full oversight including users, journal settings and direct publication.',
    accent: 'charcoal',
  },
}

export const ROLE_ORDER = [ROLES.AUTHOR, ROLES.REVIEWER, ROLES.EDITOR, ROLES.ADMIN]

/** Roles able to see and act on the full editorial queue. */
export const EDITORIAL_ROLES = [ROLES.EDITOR, ROLES.ADMIN]

/** Roles able to publish directly, bypassing peer review. */
export const DIRECT_PUBLICATION_ROLES = [ROLES.EDITOR, ROLES.ADMIN]

/** Can a role in this set perform editorial decisions (accept/reject/revise)? */
export function isEditorial(role) {
  return EDITORIAL_ROLES.includes(role)
}

/** Can this role publish directly, bypassing peer review? */
export function canPublishDirectly(role) {
  return DIRECT_PUBLICATION_ROLES.includes(role)
}

/** Can this role manage users and journal settings? */
export function canAdminister(role) {
  return role === ROLES.ADMIN
}

/** Can this role invite/assign reviewers? */
export function canAssignReviewers(role) {
  return EDITORIAL_ROLES.includes(role)
}

/** Can this role create and publish issues? */
export function canManageIssues(role) {
  return EDITORIAL_ROLES.includes(role)
}
