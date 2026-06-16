import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Calendar, User, Sparkles, Workflow, RefreshCw, ArrowUpRight,
  Mail, ExternalLink, AlertTriangle, Archive, CheckCircle2, LayoutGrid,
} from 'lucide-react'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import WidgetRender from '../widgets/WidgetRender.jsx'

// How an item was generated → icon, label, color. Covers every origin case.
const ORIGIN = {
  contact: { icon: User, label: 'Contact · Email', cls: 'bg-aims-blue/10 text-aims-blue' },
  agent: { icon: Sparkles, label: 'AI Agent', cls: 'bg-purple-500/10 text-purple-500 dark:text-purple-300' },
  workflow: { icon: Workflow, label: 'Workflow', cls: 'bg-aims-blue/10 text-aims-blue' },
  system: { icon: RefreshCw, label: 'System', cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' },
  escalation: { icon: ArrowUpRight, label: 'Escalation', cls: 'bg-red-500/10 text-aims-stale' },
}

// Full-context detail modal for an Inbox message or a Task. Shows the origin,
// generation date, the full body, an origin-aware metadata grid, a live preview
// of the related widget/dashboard, and contextual actions.
export default function ItemDetailModal({ item, kind, onClose, onArchive, onComplete }) {
  const navigate = useNavigate()
  const { widgets } = useWidgets()
  const dialogRef = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    dialogRef.current?.focus()
    return () => prev?.focus?.()
  }, [])

  const o = ORIGIN[item.origin] || ORIGIN.system
  const Icon = o.icon
  const title = item.subject || item.title
  const rel = item.related
  const relWidget = rel?.widgetId ? widgets.find((w) => w.id === rel.widgetId) : null
  const isErr = item.status === 'error'

  const openDashboard = () => {
    if (!rel?.dashboardId) return
    onClose()
    navigate(`/dashboard/${rel.dashboardId}`)
  }

  const meta = buildMeta(item, kind)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-detail-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="card relative z-10 flex max-h-[88vh] w-[560px] max-w-full flex-col overflow-hidden p-0 outline-none"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-200 p-5 dark:border-white/10">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${o.cls}`}>
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:bg-white/10 dark:text-slate-300">
                {o.label}
              </span>
              <span className="truncate text-[11px] text-gray-400 dark:text-slate-500">{item.actor?.name}</span>
            </div>
            <h2 id="item-detail-title" className="mt-1 text-sm font-semibold leading-snug text-gray-900 dark:text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {/* Generated date + sender email */}
          <div className="flex flex-col gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} /> Generated {item.at} · {item.when}
            </span>
            {item.actor?.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={12} /> {item.actor.email}
                {item.actor.role && <span className="text-gray-400 dark:text-slate-500">· {item.actor.role}</span>}
              </span>
            )}
          </div>

          {isErr && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/70 p-3 dark:border-red-500/30 dark:bg-red-500/10">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-aims-stale" />
              <div className="text-xs text-gray-700 dark:text-slate-200">{item.errorMsg}</div>
            </div>
          )}

          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-slate-200">{item.body}</p>

          {/* Metadata grid */}
          {meta.length > 0 && (
            <dl className="mt-4 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 rounded-lg border border-gray-200 p-3 text-xs dark:border-white/10">
              {meta.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-gray-400 dark:text-slate-500">{label}</dt>
                  <dd className="min-w-0 break-words font-medium text-gray-700 dark:text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Related preview */}
          {(relWidget || rel?.dashboardId) && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                <LayoutGrid size={12} /> Preview
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
                {relWidget ? (
                  <>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="truncate text-xs font-medium text-gray-700 dark:text-slate-200">{relWidget.name}</span>
                      <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">{relWidget.source}</span>
                    </div>
                    <WidgetRender widget={relWidget} size="lg" />
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-gray-600 dark:text-slate-300">{rel.label}</span>
                    <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">Dashboard</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            {kind === 'inbox' && onArchive && !isErr && (
              <button
                className="btn-ghost !px-2.5 !py-1.5 text-xs"
                onClick={() => {
                  onArchive()
                  onClose()
                }}
              >
                <Archive size={13} /> Archive
              </button>
            )}
            {kind === 'task' && onComplete && !isErr && (
              <button
                className="btn-ghost !px-2.5 !py-1.5 text-xs"
                onClick={() => {
                  onComplete()
                  onClose()
                }}
              >
                <CheckCircle2 size={13} /> Mark complete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary !h-auto !px-3 !py-1.5 text-xs" onClick={onClose}>
              Close
            </button>
            {rel?.dashboardId && (
              <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={openDashboard}>
                Open dashboard <ExternalLink size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Origin-aware metadata rows for the detail grid.
function buildMeta(item, kind) {
  const rows = []
  const a = item.actor || {}
  if (a.email) rows.push(['From', a.name])
  else if (a.name) rows.push(['Source', a.name])
  const m = item.meta || {}
  if (m.source) rows.push(['Connector', m.source])
  if (m.category) rows.push(['Category', m.category])
  if (m.confidence) rows.push(['Confidence', m.confidence])
  if (m.model) rows.push(['Model', m.model])
  if (m.requestedBy) rows.push(['Requested by', m.requestedBy])
  if (m.runId) rows.push(['Run ID', m.runId])
  if (m.step) rows.push(['Step', m.step])
  if (m.trigger) rows.push(['Trigger', m.trigger])
  if (m.lastOk) rows.push(['Last success', m.lastOk])
  if (item.related?.label && !item.related.widgetId) rows.push(['Related', item.related.label])
  if (kind === 'task') {
    rows.push(['Priority', item.priority])
    rows.push(['Due', item.due])
  }
  return rows
}
