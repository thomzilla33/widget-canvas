import { useEffect, useRef } from 'react'
import { X, Table2 } from 'lucide-react'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { FreshnessBadge } from '../common/index.jsx'
import { widgetSample } from '../../data/preview.js'
import { scopeLabel } from './DashboardControls.jsx'

// Drill-down / click-through from a widget on the consumption view: shows the
// full-size visualization plus the underlying records, both scoped to the
// dashboard's current date range + filters.
export default function WidgetDrilldownModal({ widget, scope, onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    dialogRef.current?.focus()
    return () => prev?.focus?.()
  }, [])

  const sample = widgetSample(widget, scope)
  const records = sample.records || []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
          return
        }
        if (e.key === 'Tab' && dialogRef.current) {
          const f = dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )
          if (!f.length) return
          const first = f[0]
          const last = f[f.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="card relative z-10 flex max-h-[88vh] w-[90vw] max-w-full flex-col overflow-hidden p-0 outline-none sm:max-w-[680px]"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-200 p-5 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <h2 id="drilldown-title" className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
              {widget?.name || 'Widget'}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400 dark:text-slate-500">
              <span className="truncate">{widget?.source}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{scopeLabel(scope)}</span>
              {widget?.freshness && <FreshnessBadge status={widget.freshness} label={widget.freshness} />}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:text-slate-500 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
            <WidgetRender widget={widget} size="lg" scope={scope} />
          </div>

          <div className="mt-4 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
            <Table2 size={12} aria-hidden="true" /> Underlying records
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-400 dark:bg-white/5 dark:text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Account</th>
                  <th className="px-3 py-2 font-semibold">Owner</th>
                  <th className="px-3 py-2 text-right font-semibold">Value</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {records.map((r) => (
                  <tr key={r.name} className="text-gray-700 dark:text-slate-200">
                    <td className="truncate px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{r.owner}</td>
                    <td className="num px-3 py-2 text-right">{r.value}</td>
                    <td className="px-3 py-2">
                      <span className={`cap-chip ${STATUS_CHIP[r.status] || 'cap-chip-neutral'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 dark:text-slate-500">
            Showing {records.length} of {sample.recordTotal?.toLocaleString() || records.length} records · sample data
          </div>
        </div>
      </div>
    </div>
  )
}

const STATUS_CHIP = {
  Active: 'cap-chip-data',
  'At risk': 'cap-chip-tool',
  Churned: 'cap-chip-neutral',
}
