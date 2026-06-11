import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Sparkles,
  RefreshCw,
  Lock,
  ChevronDown,
  Plus,
  ArrowUpRight,
  Bell,
  AlertTriangle,
  RotateCw,
  Check,
  X,
} from 'lucide-react'
import { PageHeader, GovernedBadge, FreshnessBadge, EmptyState } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { entities } from '../data/mock.js'

// Widget instances shown on this entity's profile (fixed = Admin-locked).
const PROFILE = [
  { iid: 'i1', widgetId: 'w-revenue', fixed: true, state: 'ok', value: '$1.24M', delta: '+8.2%' },
  { iid: 'i2', widgetId: 'w-pipeline', fixed: false, state: 'ok' },
  { iid: 'i3', widgetId: 'w-tickets', fixed: false, state: 'empty' },
  { iid: 'i4', widgetId: 'w-nps', fixed: false, state: 'error' },
]
const QUICK_ACTIONS = [
  { id: 'task', label: 'Create Task', icon: Plus },
  { id: 'escalate', label: 'Escalate', icon: ArrowUpRight },
  { id: 'notify', label: 'Notify', icon: Bell },
]

// S01–S36 — Unified Contact Profile (end-user consumption)
export default function UCPView() {
  const { entityId } = useParams()
  const { widgets } = useWidgets()
  const entity = entities.find((e) => e.id === entityId)
  const widgetById = (id) => widgets.find((w) => w.id === id)

  const [collapsed, setCollapsed] = useState({})
  const [quickAction, setQuickAction] = useState(null) // { action, widgetName }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={entity ? entity.name : 'Unified Contact Profile'}
        description="Unified Contact Profile — every widget shows its freshness and data origin."
        breadcrumb={`UCP / ${entityId}`}
      />

      <div className="flex-1 overflow-auto relative">
        <div className="px-6 py-5 max-w-5xl">
          <AiSummary />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILE.map((inst) => (
              <UCPWidget
                key={inst.iid}
                inst={inst}
                widget={widgetById(inst.widgetId)}
                collapsed={!!collapsed[inst.iid]}
                onToggleCollapse={() =>
                  setCollapsed((c) => ({ ...c, [inst.iid]: !c[inst.iid] }))
                }
                onQuickAction={(action, widgetName) => setQuickAction({ action, widgetName })}
              />
            ))}
          </div>
        </div>

        {quickAction && (
          <QuickActionPanel
            action={quickAction.action}
            widgetName={quickAction.widgetName}
            onClose={() => setQuickAction(null)}
          />
        )}
      </div>
    </div>
  )
}

/* ── AI Summary (S33–S35) ── */
function AiSummary() {
  const [refreshing, setRefreshing] = useState(false)
  const [updated, setUpdated] = useState('Updated 4 min ago')

  function refresh() {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setUpdated('Updated just now')
    }, 900)
  }

  return (
    <div className="card p-5 border-aims-blue/30 bg-gradient-to-br from-blue-50/60 to-white dark:from-aims-blue/10 dark:to-[#131a2c]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-aims-blue/10 grid place-items-center">
            <Sparkles size={16} className="text-aims-blue" />
          </span>
          <span className="font-semibold text-gray-900 dark:text-slate-100">AI Summary</span>
        </div>
        <div className="flex items-center gap-3">
          <FreshnessBadge status={refreshing ? 'aging' : 'fresh'} label={refreshing ? 'Refreshing…' : updated} />
          <button className="btn-ghost" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-slate-200 leading-relaxed">
        {refreshing
          ? 'Recomputing summary from the latest data…'
          : 'Acme Corporation is a high-value account trending up: revenue grew 8.2% this quarter and pipeline is healthy. Two support tickets are open with no SLA breaches. NPS data needs review after a recent schema change.'}
      </p>
    </div>
  )
}

/* ── A single widget with trust layer + states + quick actions ── */
function UCPWidget({ inst, widget, collapsed, onToggleCollapse, onQuickAction }) {
  const name = widget?.name || 'Widget'
  return (
    <div className="group card p-4 relative flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{name}</span>
        <div className="flex items-center gap-1.5">
          {inst.fixed ? (
            <span title="Locked by admin — cannot be moved or hidden">
              <Lock size={13} className="text-gray-400 dark:text-slate-500" />
            </span>
          ) : (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand' : 'Collapse'}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-700"
            >
              <ChevronDown size={15} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="mt-3 min-h-[72px]">
            <WidgetBody inst={inst} widget={widget} />
          </div>

          {/* Trust layer (S06–S08) */}
          {inst.state === 'ok' && (
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/10 flex items-center gap-2 flex-wrap">
              <TrustBadge widget={widget} />
              <FreshnessBadge status={widget?.freshness} label={widget?.freshness} />
            </div>
          )}

          {/* Quick actions on hover (S17) */}
          <div className="absolute top-3 right-9 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.id}
                title={qa.label}
                onClick={() => onQuickAction(qa.label, name)}
                className="h-6 w-6 grid place-items-center rounded-md bg-white border border-gray-200 text-gray-500 dark:text-slate-400 hover:text-aims-blue hover:border-aims-blue shadow-sm dark:bg-[#1b2540] dark:border-white/15"
              >
                <qa.icon size={13} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function WidgetBody({ inst, widget }) {
  if (inst.state === 'empty') {
    return (
      <div className="text-center py-3">
        <div className="text-2xl">🗂️</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">No matching data for this entity</div>
      </div>
    )
  }
  if (inst.state === 'error') {
    return (
      <div className="text-center py-3">
        <AlertTriangle size={20} className="text-aims-stale mx-auto" />
        <div className="mt-1 text-xs text-gray-600 dark:text-slate-300">Couldn't load this widget</div>
        <button className="btn-ghost mt-1 text-xs text-aims-blue">
          <RotateCw size={12} /> Retry
        </button>
      </div>
    )
  }
  // ok — render by skeleton
  if (widget?.skeleton === 'KPI') {
    return (
      <div>
        <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">{inst.value || '—'}</div>
        {inst.delta && <div className="mt-1 text-xs font-semibold text-aims-governed">{inst.delta} vs last quarter</div>}
      </div>
    )
  }
  if (widget?.skeleton === 'Chart') {
    const bars = [60, 80, 50, 95, 70]
    return (
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-aims-blue/70" style={{ height: `${h}%` }} />
        ))}
      </div>
    )
  }
  return (
    <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1.5">
      <li className="flex justify-between"><span>Ticket #4821</span><span className="text-gray-400 dark:text-slate-500">2h ago</span></li>
      <li className="flex justify-between"><span>Ticket #4798</span><span className="text-gray-400 dark:text-slate-500">1d ago</span></li>
    </ul>
  )
}

/* Trust badge with hover tooltip (S07/S08) */
function TrustBadge({ widget }) {
  return (
    <span className="relative group/trust">
      <GovernedBadge governed={!!widget?.governed} />
      <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-52 rounded-lg bg-gray-900 text-white text-[11px] leading-snug p-2 opacity-0 group-hover/trust:opacity-100 transition-opacity z-20 shadow-lg">
        <span className="block font-semibold">{widget?.source || 'Unknown source'}</span>
        {widget?.governed
          ? 'Approved Data View · reviewed by the data owner.'
          : 'Computed in Widget Builder · not formally reviewed.'}
      </span>
    </span>
  )
}

/* ── Quick action slide-over (S18–S21) ── */
function QuickActionPanel({ action, widgetName, onClose }) {
  const [done, setDone] = useState(false)
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-10 dark:bg-[#0f1629] dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <span className="font-semibold text-gray-900 dark:text-slate-100">{action}</span>
        <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {done ? (
          <EmptyState icon="✅" title={`${action} sent`} description={`Routed from “${widgetName}”.`} />
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 dark:text-slate-400">From widget: {widgetName}</div>
            <textarea className="input" rows={4} placeholder={`${action} details…`} />
          </div>
        )}
      </div>
      {!done && (
        <div className="border-t border-gray-200 dark:border-white/10 p-3">
          <button className="btn-primary w-full" onClick={() => setDone(true)}>
            <Check size={15} /> {action}
          </button>
        </div>
      )}
    </div>
  )
}
