import { X, Table2, ShieldCheck, FileText, GitBranch, BadgeCheck, Workflow } from 'lucide-react'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { FreshnessBadge, DataPlaneBadge, EnvironmentBadge } from '../common/index.jsx'
import { widgetSample } from '../../data/preview.js'
import { dataPlaneOf, freshnessState, hasBridgeCitation, bridgeCitation } from '../../data/governance.js'
import { scopeLabel } from './DashboardControls.jsx'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const CHAIN_ICON = { source: FileText, transform: GitBranch, gate: ShieldCheck, publish: BadgeCheck }

// Bridge ID citation (5.4): the audit chain + attribution tier behind a governed number.
function BridgeCitation({ widget }) {
  const c = bridgeCitation(widget)
  return (
    <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-500/25 dark:bg-sky-500/[0.06]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          <BadgeCheck size={13} aria-hidden="true" /> Bridge ID citation
        </span>
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-gray-700 dark:bg-white/10 dark:text-slate-200">{c.bridgeId}</code>
        <span className="cap-chip cap-chip-blue">{c.tier}</span>
        <span className="text-[11px] text-gray-500 dark:text-slate-400">Confidence {(c.confidence * 100).toFixed(0)}%</span>
      </div>
      <ol className="mt-2.5 space-y-1.5">
        {c.chain.map((s, i) => {
          const Icon = CHAIN_ICON[s.kind] || FileText
          return (
            <li key={i} className="flex items-start gap-2 text-[11px]">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
                <Icon size={10} />
              </span>
              <span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{s.step}</span>
                <span className="text-gray-500 dark:text-slate-400"> — {s.detail}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-[10px] text-gray-500 dark:text-slate-400">Full audit chain — every governed value traces to its source within one click.</p>
    </div>
  )
}

// Drill-down / click-through from a widget on the consumption view: shows the
// full-size visualization plus the underlying records, both scoped to the
// dashboard's current date range + filters.
export default function WidgetDrilldownModal({ widget, scope, onClose }) {
  const dialogRef = useFocusTrap()

  const sample = widgetSample(widget, scope)
  const records = sample.records || []
  const fresh = freshnessState(widget)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
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
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-slate-400">
              <span className="truncate">{widget?.source}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{scopeLabel(scope)}</span>
              <FreshnessBadge status={fresh.tone} label={fresh.label} />
              <DataPlaneBadge plane={dataPlaneOf(widget)} />
              <EnvironmentBadge env={scope?.env} />
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

          {hasBridgeCitation(widget) && <BridgeCitation widget={widget} />}

          <div className="mt-4 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">
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
          <div className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">
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
