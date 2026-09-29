/**
 * Small, dependency-free feedback toasts. The prototype surfaces workflow
 * results (accepted, rejected, published) through these.
 * @module components/ui/Toast
 */

import { useEffect } from 'react'
import PropTypes from 'prop-types'
import Icon from './Icon'

const TONES = {
  success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'checkCircle', ic: 'text-emerald-600' },
  error: { cls: 'border-rose-200 bg-rose-50 text-rose-900', icon: 'xCircle', ic: 'text-rose-600' },
  info: { cls: 'border-brand-200 bg-brand-50 text-brand-900', icon: 'info', ic: 'text-brand-600' },
  warning: { cls: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'warning', ic: 'text-amber-600' },
}

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  const tone = TONES[toast.tone] ?? TONES.info

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-raised ${tone.cls}`}
      role="status"
    >
      <Icon name={tone.icon} size={18} className={`mt-px shrink-0 ${tone.ic}`} />
      <div className="min-w-0 flex-1">
        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
        {toast.message && <p className="mt-0.5 text-[0.8125rem] leading-relaxed opacity-90">{toast.message}</p>}
      </div>
      <button onClick={onDismiss} className="-mt-0.5 -mr-1 p-1 opacity-60 hover:opacity-100" aria-label="Dismiss">
        <Icon name="close" size={15} />
      </button>
    </div>
  )
}

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    tone: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
}

/** Fixed-position stack of toasts. */
export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <Toast toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  )
}

ToastViewport.propTypes = {
  toasts: PropTypes.array,
  onDismiss: PropTypes.func.isRequired,
}
