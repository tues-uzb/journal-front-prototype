/**
 * Top application header: breadcrumb, global search, notifications and the
 * user menu. Also hosts the role switcher, which is specific to this prototype.
 * @module layouts/Header
 */

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { ROLE_META, ROLE_ORDER, ROLES } from '../domain/roles'
import { initialsOf } from '../components/ui/primitives'
import Icon from '../components/ui/Icon'

/** Route breadcrumb derived from the current pathname. */
function useBreadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return [{ label: 'Dashboard', to: '/' }]

  const LABELS = {
    submissions: 'Submissions',
    reviews: 'Reviews',
    'my-reviews': 'My Reviews',
    reviewers: 'Reviewers',
    publications: 'Publications',
    issues: 'Issues',
    authors: 'Authors',
    users: 'Users',
    settings: 'Journal Settings',
    'my-submissions': 'My Submissions',
    profile: 'Profile',
    help: 'Help',
    new: 'New Submission',
  }

  const crumbs = [{ label: 'Dashboard', to: '/' }]
  segments.forEach((seg, i) => {
    const to = `/${segments.slice(0, i + 1).join('/')}`
    const next = LABELS[seg]
    if (next) crumbs.push({ label: next, to })
    else if (i === segments.length - 1) crumbs.push({ label: seg, to })
  })
  return crumbs
}

export default function Header({ role, user, onRoleChange, onToggleSidebar, onOpenSearch }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const menuRef = useRef(null)
  const roleRef = useRef(null)
  const crumbs = useBreadcrumb()
  const roleMeta = ROLE_META[role]

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isAuthor = role === ROLES.AUTHOR

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <button className="btn-ghost -ml-1.5 p-2 lg:hidden" onClick={onToggleSidebar} aria-label="Open navigation">
          <Icon name="menu" size={19} />
        </button>

        {/* Breadcrumbs — hidden on small screens */}
        <nav className="hidden min-w-0 items-center gap-1.5 md:flex" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.to} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <Icon name="chevronRight" size={13} className="shrink-0 text-ink-300" />}
              {i === crumbs.length - 1 ? (
                <span className="truncate text-[0.8125rem] font-medium text-ink-900">{c.label}</span>
              ) : (
                <Link
                  to={c.to}
                  className="truncate text-[0.8125rem] text-ink-500 transition hover:text-brand-600"
                >
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Global search */}
        <button
          onClick={onOpenSearch}
          className="hidden items-center gap-2 rounded-lg border border-ink-200 bg-ink-50/70 py-1.5 pr-3 pl-2.5 text-[0.8125rem] text-ink-400 transition hover:border-ink-300 hover:bg-white sm:flex"
        >
          <Icon name="search" size={15} />
          <span className="pr-6">Search…</span>
          <kbd className="rounded border border-ink-200 bg-white px-1.5 py-px font-sans text-[0.625rem] text-ink-400">
            ⌘K
          </kbd>
        </button>

        {/* Role switcher — prototype only */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white py-1.5 pr-2 pl-2.5 text-[0.8125rem] font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
            aria-expanded={roleOpen}
            aria-haspopup="listbox"
          >
            <span className="hidden text-ink-500 sm:inline">Viewing as</span>
            <span className="text-ink-900">{roleMeta?.label}</span>
            <Icon name="chevronDown" size={14} className="text-ink-400" />
          </button>

          {roleOpen && (
            <div
              className="panel absolute right-0 z-50 mt-2 w-72 overflow-hidden shadow-raised"
              role="listbox"
            >
              <div className="border-b border-ink-200 bg-amber-50/60 px-3.5 py-2.5">
                <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-amber-800 uppercase">
                  Prototype mode
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-900/80">
                  Switch roles to preview how the interface and available actions change.
                </p>
              </div>
              <ul className="py-1.5">
                {ROLE_ORDER.map((r) => {
                  const meta = ROLE_META[r]
                  const on = r === role
                  return (
                    <li key={r}>
                      <button
                        role="option"
                        aria-selected={on}
                        onClick={() => {
                          onRoleChange(r)
                          setRoleOpen(false)
                        }}
                        className={`flex w-full items-start gap-2.5 px-3.5 py-2 text-left transition ${
                          on ? 'bg-brand-50' : 'hover:bg-ink-50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                            on ? 'border-brand-600 bg-brand-600' : 'border-ink-300'
                          }`}
                        >
                          {on && <Icon name="check" size={11} strokeWidth={3} className="text-white" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.8125rem] font-medium text-ink-900">{meta.label}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{meta.blurb}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="btn-ghost relative p-2" aria-label="Notifications">
          <Icon name="bell" size={18} />
          {!isAuthor && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1 pr-1 pl-1.5 transition hover:bg-ink-50"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[0.625rem] font-semibold text-brand-700">
              {initialsOf(user?.name)}
            </span>
            <Icon name="chevronDown" size={14} className="hidden text-ink-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="panel absolute right-0 z-50 mt-2 w-64 overflow-hidden shadow-raised" role="menu">
              <div className="border-b border-ink-200 px-3.5 py-3">
                <p className="truncate text-[0.8125rem] font-semibold text-ink-900">{user?.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-500">{user?.email}</p>
                <span className="mt-2 inline-flex rounded bg-brand-50 px-1.5 py-0.5 text-[0.625rem] font-semibold text-brand-700">
                  {roleMeta?.label}
                </span>
              </div>
              <ul className="py-1.5">
                {[
                  { icon: 'user', label: 'My profile', to: '/profile' },
                  { icon: 'settings', label: 'Preferences', to: '/settings' },
                  { icon: 'help', label: 'Help & documentation', to: '/help' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[0.8125rem] text-ink-700 transition hover:bg-ink-50"
                    >
                      <Icon name={l.icon} size={16} className="text-ink-400" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-ink-200 py-1.5">
                <button
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[0.8125rem] text-ink-700 transition hover:bg-ink-50"
                >
                  <Icon name="logout" size={16} className="text-ink-400" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  role: PropTypes.string.isRequired,
  user: PropTypes.object,
  onRoleChange: PropTypes.func.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  onOpenSearch: PropTypes.func.isRequired,
}
