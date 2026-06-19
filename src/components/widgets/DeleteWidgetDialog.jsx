import { useState } from 'react'
import { X, AlertTriangle, Trash2, LayoutDashboard } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { WidgetGlyph } from './glyph.jsx'

// GitHub-style staged delete for a critical asset. Three gates escalate friction:
//   1. intent  → "I want to delete this widget"
//   2. effects → read the consequences (incl. the dashboard-impact summary)
//   3. confirm → type the exact name to enable the destructive button
// `usedOn` is the list of dashboards the widget is placed on — surfaced as impact.
export default function DeleteWidgetDialog({ widget, usedOn = [], onConfirm, onClose }) {
  const ref = useFocusTrap()
  const [stage, setStage] = useState(1) // 1 intent · 2 effects · 3 confirm
  const [typed, setTyped] = useState('')
  const match = typed.trim() === widget.name
  const n = usedOn.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-widget-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex w-[92vw] max-w-[440px] flex-col p-0 outline-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id="del-widget-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">Delete {widget.name}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Identity */}
          <div className="flex flex-col items-center gap-2 text-center">
            <WidgetGlyph skeleton={widget.skeleton} />
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{widget.name}</div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-slate-400">
              <span>{widget.source}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <LayoutDashboard size={11} aria-hidden="true" /> {n} dashboard{n === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Stage 1 — intent */}
          {stage === 1 && (
            <button
              onClick={() => setStage(2)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              I want to delete this widget
            </button>
          )}

          {/* Stage 2 — effects + impact summary */}
          {stage === 2 && (
            <>
              <div className="flex items-center gap-2 rounded-lg border-l-2 border-amber-400 bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-aims-aging">
                <AlertTriangle size={15} aria-hidden="true" className="shrink-0" />
                Unexpected bad things will happen if you don’t read this!
              </div>
              <div className="border-l-2 border-gray-200 pl-3 text-[12px] leading-relaxed text-gray-600 dark:border-white/10 dark:text-slate-300">
                This permanently deletes the <span className="font-semibold text-gray-900 dark:text-slate-100">{widget.name}</span> widget from your catalog and can’t be undone.
                {n > 0 ? (
                  <>
                    {' '}It’s currently on <span className="font-semibold text-gray-900 dark:text-slate-100">{n} dashboard{n === 1 ? '' : 's'}</span> and will be removed from {n === 1 ? 'it' : 'them'}:
                    <ul className="mt-1.5 space-y-1">
                      {usedOn.slice(0, 6).map((d) => (
                        <li key={d.id} className="flex items-center gap-1.5 text-gray-700 dark:text-slate-200">
                          <LayoutDashboard size={11} aria-hidden="true" className="shrink-0 text-gray-400 dark:text-slate-500" /> {d.name}
                        </li>
                      ))}
                      {n > 6 && <li className="text-gray-400 dark:text-slate-500">+{n - 6} more</li>}
                    </ul>
                  </>
                ) : (
                  <> It isn’t on any dashboards.</>
                )}
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
              <label htmlFor="del-confirm" className="block text-[12px] text-gray-700 dark:text-slate-200">
                To confirm, type <span className="font-semibold">“{widget.name}”</span> in the box below
              </label>
              <input
                id="del-confirm"
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
                <Trash2 size={15} aria-hidden="true" /> Delete this widget
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
