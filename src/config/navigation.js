/**
 * Navigation model.
 *
 * Navigation is derived from the active role so the prototype can show how a
 * real product would scope the sidebar per role, rather than hiding items with
 * scattered conditionals in the layout.
 *
 * @module config/navigation
 */

import { ROLES } from '../domain/roles'

/**
 * @typedef {Object} NavItem
 * @property {string} key
 * @property {string} label
 * @property {string} to
 * @property {string} icon
 * @property {Role[]} roles   roles for which this item is visible
 * @property {string} [section] grouping heading
 * @property {string} [end]   match the path exactly
 */

/** @type {NavItem[]} */
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', to: '/', icon: 'dashboard', roles: [ROLES.AUTHOR, ROLES.REVIEWER, ROLES.EDITOR, ROLES.ADMIN], end: true },
  { key: 'my-submissions', label: 'My Submissions', to: '/my-submissions', icon: 'file', roles: [ROLES.AUTHOR] },
  { key: 'new-submission', label: 'New Submission', to: '/submissions/new', icon: 'plus', roles: [ROLES.AUTHOR] },
  { key: 'submissions', label: 'Submissions', to: '/submissions', icon: 'inbox', roles: [ROLES.EDITOR, ROLES.ADMIN] },
  { key: 'reviews', label: 'Reviews', to: '/reviews', icon: 'clipboard', roles: [ROLES.EDITOR, ROLES.ADMIN] },
  { key: 'my-reviews', label: 'My Reviews', to: '/my-reviews', icon: 'clipboard', roles: [ROLES.REVIEWER] },
  { key: 'reviewers', label: 'Reviewers', to: '/reviewers', icon: 'userCheck', roles: [ROLES.EDITOR, ROLES.ADMIN] },
  { key: 'publications', label: 'Publications', to: '/publications', icon: 'globe', roles: [ROLES.AUTHOR, ROLES.REVIEWER, ROLES.EDITOR, ROLES.ADMIN] },
  { key: 'issues', label: 'Issues', to: '/issues', icon: 'layers', roles: [ROLES.EDITOR, ROLES.ADMIN] },
  { key: 'authors', label: 'Authors', to: '/authors', icon: 'users', roles: [ROLES.EDITOR, ROLES.ADMIN] },
  { key: 'users', label: 'Users', to: '/users', icon: 'user', roles: [ROLES.ADMIN] },
  { key: 'settings', label: 'Journal Settings', to: '/settings', icon: 'settings', roles: [ROLES.ADMIN] },
]

/** Secondary links, rendered in the sidebar footer. */
const FOOTER_ITEMS = [
  { key: 'help', label: 'Help', to: '/help', icon: 'help' },
  { key: 'settings', label: 'Settings', to: '/settings', icon: 'settings' },
]

/** Sidebar items visible to a role, preserving declaration order. */
export function navForRole(role) {
  return NAV_ITEMS.filter((i) => i.roles.includes(role))
}

export function footerNav() {
  return FOOTER_ITEMS
}

export const ALL_NAV = NAV_ITEMS
