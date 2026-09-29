/**
 * Left sidebar navigation. Collapses to a drawer on small screens.
 * @module layouts/Sidebar
 */

import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { navForRole, footerNav } from '../config/navigation'
import { ROLE_META } from '../domain/roles'
import { initialsOf } from '../components/ui/primitives'
import Icon from '../components/ui/Icon'

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            name={item.icon}
            size={17}
            strokeWidth={isActive ? 2 : 1.7}
            className={isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-600'}
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

NavItem.propTypes = { item: PropTypes.object.isRequired, onNavigate: PropTypes.func }

export default function Sidebar({ role, user, open, onClose }) {
  const items = navForRole(role)
  const footer = footerNav()
  const roleMeta = ROLE_META[role]

  return (
    <>
      {/* Scrim — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-ink-200 bg-white
          transition-transform duration-200 lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        {/* Masthead */}
        <div className="flex items-center gap-2.5 border-b border-ink-200 px-4 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-700 text-[0.8125rem] font-bold text-white">
            J
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] leading-tight font-semibold text-ink-900">JASSD</p>
            <p className="truncate text-[0.6875rem] leading-tight text-ink-500">Applied Sciences &amp; Sustainable Dev.</p>
          </div>
          <button className="btn-ghost p-1.5 lg:hidden" onClick={onClose} aria-label="Close navigation">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Primary navigation */}
        <nav className="scrollbar-slim flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.key}>
                <NavItem item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer links + identity */}
        <div className="border-t border-ink-200 px-3 py-3">
          <ul className="space-y-0.5">
            {footer.map((item) => (
              <li key={item.key}>
                <NavItem item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>

          <div className="mt-3 rounded-lg bg-ink-50 p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-[0.6875rem] font-semibold text-brand-700">
                {initialsOf(user?.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] leading-tight font-medium text-ink-900">{user?.name}</p>
                <p className="truncate text-[0.6875rem] leading-tight text-ink-500">{roleMeta?.label}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

Sidebar.propTypes = {
  role: PropTypes.string.isRequired,
  user: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}
