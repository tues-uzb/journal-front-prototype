/**
 * User administration.
 * @module pages/Users
 */

import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { ROLES, ROLE_META } from '../domain/roles'
import { canAdminister } from '../domain/roles'
import { relativeTime, formatDate } from '../components/ActivityTimeline'

import { Page, PageHeader, Panel, StatTile, EmptyState, Avatar, FilterPills, Note } from '../components/ui/primitives'
import Modal from '../components/ui/Modal'
import Icon from '../components/ui/Icon'

const ROLE_FILTERS = [
  { key: 'ALL', label: 'All users' },
  { key: 'AUTHOR', label: 'Authors' },
  { key: 'REVIEWER', label: 'Reviewers' },
  { key: 'EDITOR', label: 'Editors' },
  { key: 'ADMIN', label: 'Administrators' },
]

const USER_STATUS_STYLE = {
  active: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Active' },
  invited: { cls: 'bg-amber-50 text-amber-800 ring-amber-200', label: 'Invited' },
  inactive: { cls: 'bg-ink-100 text-ink-600 ring-ink-200', label: 'Disabled' },
}

const ROLE_CHIP = {
  AUTHOR: 'bg-sky-50 text-sky-700 ring-sky-200',
  REVIEWER: 'bg-violet-50 text-violet-700 ring-violet-200',
  EDITOR: 'bg-brand-50 text-brand-700 ring-brand-200',
  ADMIN: 'bg-ink-900 text-white ring-ink-900',
}

export default function Users() {
  const users = useJournalStore((s) => s.users)
  const submissions = useJournalStore((s) => s.submissions)
  const updateUser = useJournalStore((s) => s.updateUser)
  const { role, pushToast } = useOutletContext()

  const [filter, setFilter] = useState('ALL')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDisable, setConfirmDisable] = useState(null)

  const canManage = canAdminister(role)

  const counts = useMemo(() => {
    const c = { ALL: users.length }
    for (const f of ROLE_FILTERS) {
      if (f.key === 'ALL') continue
      c[f.key] = users.filter((u) => u.role === f.key).length
    }
    return c
  }, [users])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return users
      .filter((u) => (filter === 'ALL' ? true : u.role === filter))
      .filter(
        (u) =>
          !term ||
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.affiliation?.toLowerCase().includes(term),
      )
  }, [users, filter, q])

  const submissionCount = (uid) => submissions.filter((s) => s.authors.some((a) => a.id === uid)).length

  const saveEdit = () => {
    updateUser(editing.id, { name: editing.name, email: editing.email, role: editing.role, affiliation: editing.affiliation })
    setEditing(null)
    pushToast({ tone: 'success', title: 'User updated', message: `${editing.name}'s account has been modified.` })
  }

  const doDisable = () => {
    const next = confirmDisable.status === 'active' ? 'inactive' : 'active'
    updateUser(confirmDisable.id, { status: next })
    setConfirmDisable(null)
    pushToast({
      tone: next === 'inactive' ? 'warning' : 'success',
      title: next === 'inactive' ? 'Account disabled' : 'Account re-enabled',
    })
  }

  return (
    <Page>
      <PageHeader
        title="Users"
        description="Everyone with access to the journal, including authors, reviewers, editors and administrators."
      />

      {!canManage && (
        <Note tone="info" icon="lock">
          You are viewing this page as a read-only administrator preview. Switch to the Administrator role to make
          changes.
        </Note>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total users" value={users.length} hint="All accounts" />
        <StatTile label="Reviewers" value={users.filter((u) => u.role === ROLES.REVIEWER).length} hint="Peer review pool" />
        <StatTile label="Active" value={users.filter((u) => u.status === 'active').length} tone="good" hint="Enabled accounts" />
        <StatTile
          label="Disabled"
          value={users.filter((u) => u.status === 'inactive').length}
          hint="No access"
        />
      </div>

      <div className="mt-6">
        <FilterPills options={ROLE_FILTERS} value={filter} onChange={setFilter} counts={counts} />
      </div>

      <div className="mt-4">
        <div className="relative">
          <Icon
            name="search"
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email or affiliation…"
            className="input pl-9"
            aria-label="Search users"
          />
        </div>
      </div>

      <Panel className="mt-5" bodyClassName="p-0">
        {filtered.length === 0 ? (
          <EmptyState icon="search" title="No users match these filters" />
        ) : (
          <>
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Affiliation</th>
                    <th>Status</th>
                    <th>Last active</th>
                    {canManage && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const st = USER_STATUS_STYLE[u.status]
                    return (
                      <tr key={u.id}>
                        <td>
                          <span className="flex items-center gap-2.5">
                            <Avatar name={u.name} size={30} />
                            <span className="min-w-0">
                              <span className="block font-medium text-ink-900">{u.name}</span>
                              <span className="block text-xs text-ink-400">Joined {u.joined ? formatDate(u.joined) : '—'}</span>
                            </span>
                          </span>
                        </td>
                        <td className="text-[0.8125rem]">{u.email}</td>
                        <td>
                          <span className={`chip ${ROLE_CHIP[u.role]}`}>{ROLE_META[u.role]?.label}</span>
                        </td>
                        <td className="max-w-[16rem] text-[0.8125rem]">
                          <span className="line-clamp-1">{u.affiliation ?? '—'}</span>
                        </td>
                        <td>
                          <span className={`chip ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="whitespace-nowrap text-ink-500">{relativeTime(u.lastActive)}</td>
                        {canManage && (
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setEditing({ ...u })} className="btn-secondary btn-sm">
                                <Icon name="edit" size={13} />
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmDisable(u)}
                                className={u.status === 'active' ? 'btn-danger-ghost btn-sm' : 'btn-secondary btn-sm'}
                              >
                                {u.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink-100 lg:hidden">
              {filtered.map((u) => {
                const st = USER_STATUS_STYLE[u.status]
                return (
                  <li key={u.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={u.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink-900">{u.name}</p>
                        <p className="truncate text-xs text-ink-500">{u.email}</p>
                        <p className="mt-1 text-xs text-ink-500">{u.affiliation ?? '—'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`chip ${ROLE_CHIP[u.role]}`}>{ROLE_META[u.role]?.label}</span>
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                    </div>
                    {canManage && (
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setEditing({ ...u })} className="btn-secondary btn-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDisable(u)}
                          className={u.status === 'active' ? 'btn-danger-ghost btn-sm' : 'btn-secondary btn-sm'}
                        >
                          {u.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Panel>

      {/* Edit user dialog */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit user"
        description={editing ? editing.email : ''}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={saveEdit} className="btn-primary">
              Save changes
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="u-name">
                  Full name
                </label>
                <input
                  id="u-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="u-email">
                  Email
                </label>
                <input
                  id="u-email"
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="u-aff">
                Affiliation
              </label>
              <input
                id="u-aff"
                value={editing.affiliation ?? ''}
                onChange={(e) => setEditing({ ...editing, affiliation: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="u-role">
                Role
              </label>
              <select
                id="u-role"
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                className="select"
              >
                {Object.entries(ROLE_META).map(([k, m]) => (
                  <option key={k} value={k}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="hint">{ROLE_META[editing.role]?.blurb}</p>
            </div>

            {editing.role === ROLES.AUTHOR && (
              <Note tone="neutral" icon="file">
                This author is listed on {submissionCount(editing.id)} submission
                {submissionCount(editing.id) === 1 ? '' : 's'} in the current prototype data.
              </Note>
            )}
          </div>
        )}
      </Modal>

      {/* Disable confirmation */}
      <Modal
        open={Boolean(confirmDisable)}
        onClose={() => setConfirmDisable(null)}
        title={confirmDisable?.status === 'active' ? 'Disable this account?' : 'Re-enable this account?'}
        description={
          confirmDisable
            ? confirmDisable.status === 'active'
              ? `${confirmDisable.name} will immediately lose access to the editorial system. Their existing submissions and reviews are retained.`
              : `${confirmDisable.name} will regain full access to the system.`
            : ''
        }
        tone={confirmDisable?.status === 'active' ? 'danger' : 'default'}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmDisable(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={doDisable} className={confirmDisable?.status === 'active' ? 'btn-danger' : 'btn-primary'}>
              {confirmDisable?.status === 'active' ? 'Disable account' : 'Re-enable account'}
            </button>
          </>
        }
      />
    </Page>
  )
}
