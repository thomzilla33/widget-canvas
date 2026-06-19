import { useState } from 'react'
import { X, AlertTriangle, Trash2, LayoutDashboard, MapPin } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { placementLabel } from '../../data/mock.js'
import { widgetCount } from '../../data/layout.js'

// GitHub-style staged delete for a dashboard. Mirrors DeleteWidgetDialog: intent →
// effects (with impact summary) → type-to-confirm. Deleting a dashboard drops its
// layout + placement only — the widgets it hosts stay in the catalog.
export default function DeleteDashboardDialog({ dashboard, onConfirm, onClose }) {
  const ref = useFocusTrap()
  const [stage, setStage] = useState(1)
  const [typed, setTyped] = useState('')
  const match = typed.trim() === dashboard.name
  const n = widgetCount(dashboard)
  const where = placementLabel(dashboard.placement)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-dash-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex w-[92vw] max-w-[440px] flex-col p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id="del-dash-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">Delete {dashboard.name}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Identity */}
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: 'var(--grad)' }}>
              <LayoutDashboard size={18} aria-hidden="true" />
            </span>
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{dashboard.name}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
              <MapPin size={11} aria-hidden="true" /> {where}
            </div>
          </div>

          {/* Stage 1 — intent */}
          {stage === 1 && (
            <button
              onClick={() => setStage(2)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              I want to delete this dashboard
            </button>
          )}

          {/* Stage 2 — effects + impact */}
          {stage === 2 && (
            <>
              <div className="flex items-center gap-2 rounded-lg border-l-2 border-amber-400 bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-aims-aging">
                <AlertTriangle size={15} aria-hidden="true" className="shrink-0" />
                Unexpected bad things will happen if you don’t read this!
              </div>
              <div className="border-l-2 border-gray-200 pl-3 text-[12px] leading-relaxed text-gray-600 dark:border-white/10 dark:text-slate-300">
                This permanently deletes the <span className="font-semibold text-gray-900 dark:text-slate-100">{dashboard.name}</span> dashboard and removes it from <span className="font-semibold text-gray-900 dark:text-slate-100">{where}</span>. It can’t be undone.
                {' '}Its <span className="font-semibold text-gray-900 dark:text-slate-100">{n} widget{n === 1 ? '' : 's'}</span> stay in your catalog — only this dashboard is removed.
              </div>
              <button
                onClick={() => setStage(3)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              >
                I have read and understand these effects
              </button>
            </>
          )}

          {/* Stage 3 — type-to-confirm */}
          {stage === 3 && (
            <>
              <label htmlFor="del-dash-confirm" className="block text-[12px] text-gray-700 dark:text-slate-200">
                To confirm, type <span className="font-semibold">“{dashboard.name}”</span> in the box below
              </label>
              <input
                id="del-dash-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                autoComplete="off"
                className="input h-9 border-red-400/60 focus:!ring-red-500/40 dark:border-red-500/40"
              />
              <button
                onClick={() => match && onConfirm()}
                disabled={!match}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-600/30 disabled:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
              >
                <Trash2 size={15} aria-hidden="true" /> Delete this dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
