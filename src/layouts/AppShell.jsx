/**
 * Application shell: persistent sidebar + header + routed content area.
 * Also owns cross-cutting UI concerns: toasts, the command palette and
 * the role switcher, so pages stay focused on their own concerns.
 *
 * @module layouts/AppShell
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import useJournalStore from '../store/useJournalStore'
import { demoIdentities } from '../data/users'
import { SUBMISSION_STATUS as S } from '../domain/status'
import { publishedArticles } from '../store/selectors'

import Sidebar from './Sidebar'
import Header from './Header'
import SearchPalette from './SearchPalette'
import ToastViewport from '../components/ui/Toast'

export default function AppShell() {
  const role = useJournalStore((s) => s.activeRole)
  const setRole = useJournalStore((s) => s.setRole)
  const submissions = useJournalStore((s) => s.submissions)
  const issues = useJournalStore((s) => s.issues)
  const users = useJournalStore((s) => s.users)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  const user = useMemo(() => demoIdentities[role], [role])

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, tone: 'info', ...toast }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  // Close the mobile drawer and return to the top on navigation.
  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  // ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleRoleChange = (next) => {
    setRole(next)
    navigate('/')
    pushToast({
      tone: 'info',
      title: `Now viewing as ${next === 'ADMIN' ? 'Administrator' : next[0] + next.slice(1).toLowerCase()}`,
      message: 'Navigation and available actions have been updated for this role.',
    })
  }

  const searchIndex = useMemo(
    () => ({
      submissions: submissions.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: `${s.id} · ${s.authors[0]?.name ?? 'Unknown'}`,
        to: `/submissions/${s.id}`,
        status: s.status,
      })),
      publications: publishedArticles(submissions).map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: `${s.doi ?? s.id} · Volume ${s.volume ?? '—'}, Issue ${s.issueNumber ?? '—'}`,
        to: `/publications/${s.id}`,
        status: S.PUBLISHED,
      })),
      users: users.map((u) => ({
        id: u.id,
        title: u.name,
        subtitle: `${u.role === 'ADMIN' ? 'Administrator' : u.role[0] + u.role.slice(1).toLowerCase()} · ${u.email}`,
        to: u.role === 'REVIEWER' ? `/reviewers/${u.id}` : '/users',
        status: null,
      })),
      issues: issues.map((i) => ({
        id: i.id,
        title: `Volume ${i.volume}, Issue ${i.number} — ${i.title}`,
        subtitle: `${i.year} · ${i.articleIds.length} article${i.articleIds.length === 1 ? '' : 's'}`,
        to: `/issues/${i.id}`,
        status: null,
      })),
    }),
    [submissions, users, issues],
  )

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar
        role={role}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[17rem]">
        <Header
          role={role}
          user={user}
          onRoleChange={handleRoleChange}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="min-h-[calc(100vh-3.5rem)]">
          <Outlet context={{ pushToast, user, role }} />
        </main>
      </div>

      <SearchPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        index={searchIndex}
        onNavigate={(to) => {
          setSearchOpen(false)
          navigate(to)
        }}
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
