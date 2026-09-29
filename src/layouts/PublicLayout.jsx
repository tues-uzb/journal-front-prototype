/**
 * Public, chrome-free layout for the reader-facing article page.
 * Deliberately unlike the administrative shell: no sidebar, serif masthead.
 * @module layouts/PublicLayout
 */

import { Outlet } from 'react-router-dom'
import useJournalStore from '../store/useJournalStore'

export default function PublicLayout() {
  const journal = useJournalStore((s) => s.journal)

  return (
    <div className="min-h-screen bg-white">
      {/* Journal masthead */}
      <header className="border-b border-ink-200">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-500 uppercase">
            {journal.publisher}
          </p>
          <p
            className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.01em] text-ink-900 sm:text-[1.75rem]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {journal.name}
          </p>
          <p className="mt-2.5 text-[0.8125rem] text-ink-500">
            ISSN {journal.issnPrint} (Print) · ISSN {journal.issnOnline} (Online)
          </p>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <p className="text-[0.8125rem] text-ink-600">
            © {new Date().getFullYear()} {journal.publisher}. All rights reserved.
          </p>
          <p className="mt-1.5 text-xs text-ink-500">
            Articles are published under a CC BY 4.0 International licence unless otherwise stated.
          </p>
        </div>
      </footer>
    </div>
  )
}
