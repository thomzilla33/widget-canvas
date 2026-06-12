import { useState } from 'react'
import { X, Check, Flag } from 'lucide-react'
import { WidgetGlyph } from './glyph.jsx'

// S122/S123 — flag detail with full context + resolve (notification-only).
export default function FlagDetailModal({ flag, widget, entity, onClose, onResolve }) {
  const [resolved, setResolved] = useState(false)

  function resolve() {
    onResolve?.()
    setResolved(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex w-[520px] max-w-full flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-aims-stale" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">Flag detail</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {resolved ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/25 dark:bg-green-500/10">
              <Check size={28} className="text-aims-governed" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Flag resolved</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
              A notification was sent to {flag.reporter}. The flag was cleared from Needs Attention.
            </p>
            <button className="btn-primary mt-5" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <WidgetGlyph skeleton={widget?.skeleton || 'KPI'} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {widget?.name || flag.widgetId}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-500">{widget?.source}</div>
                </div>
                <span className="cap-chip cap-chip-tool ml-auto">{flag.reason}</span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <Field label="Entity" value={entity?.name || flag.entityId} />
                <Field label="Reported by" value={flag.reporter} />
                <Field label="When" value={flag.createdAt} />
                <Field label="Status" value={flag.status === 'resolved' ? 'Resolved' : 'Open'} />
              </dl>

              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                  Message
                </div>
                <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 dark:border-white/10 dark:text-slate-200">
                  {flag.details || '— no additional details —'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-white/10">
              <span className="text-xs text-gray-500 dark:text-slate-400">Resolution is notification-only.</span>
              <button className="btn-primary" onClick={resolve}>
                <Check size={15} /> Resolve & notify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-gray-800 dark:text-slate-200">{value}</dd>
    </div>
  )
}
