import { useState } from 'react'
import { X, Copy, MapPin } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { placementLabel } from '../../data/mock.js'
import { audienceLabel } from '../../data/audiences.js'

export default function DuplicateDashboardDialog({ dashboard, onConfirm, onClose }) {
  const ref = useFocusTrap()
  const [name, setName] = useState(`${dashboard.name} (copy)`)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onConfirm(name.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dup-dash-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex w-[92vw] max-w-[420px] flex-col p-0 outline-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Copy size={15} className="text-aims-blue" aria-hidden="true" />
            <h2 id="dup-dash-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Duplicate dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Origin summary */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-medium text-gray-700 dark:text-slate-200 truncate">{dashboard.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
              <MapPin size={10} aria-hidden="true" />
              <span className="truncate">{placementLabel(dashboard.placement)} · {audienceLabel(dashboard.audience)}</span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-400">
            A draft copy will be created at the same location. You can rename, edit widgets, and publish it independently.
          </p>

          {/* Name field */}
          <div>
            <label htmlFor="dup-dash-name" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-200">
              Name for the copy
            </label>
            <input
              id="dup-dash-name"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              maxLength={120}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              <Copy size={14} aria-hidden="true" /> Create copy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
