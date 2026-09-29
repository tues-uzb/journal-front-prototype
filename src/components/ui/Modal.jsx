/**
 * Modal dialog with focus handling and a scrim.
 * @module components/ui/Modal
 */

import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Icon from './Icon'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  tone = 'default',
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the dialog so keyboard users are not left behind it.
    const t = setTimeout(() => panelRef.current?.focus(), 0)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }
  const accent =
    tone === 'warning'
      ? 'bg-amber-500'
      : tone === 'danger'
        ? 'bg-rose-500'
        : 'bg-brand-600'

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/*
        The panel is capped at the viewport height and scrolls internally, so a
        tall dialog (e.g. the direct-publication form) never pushes its footer
        actions out of reach. `document.body` is scroll-locked while open, so
        the panel itself must own the scrolling.
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`panel relative flex w-full flex-col ${widths[size]} max-h-[92dvh] shadow-overlay outline-none`}
      >
        <span className={`absolute inset-x-0 top-0 h-0.5 rounded-t-xl ${accent}`} />
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
            {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{description}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost -mt-1 -mr-2 p-1.5 shrink-0" aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </div>
        {children && <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-6 pb-5">{children}</div>}
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 rounded-b-xl border-t border-ink-200 bg-ink-50/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  tone: PropTypes.oneOf(['default', 'warning', 'danger']),
}
