import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  RotateCcw,
  Check,
  X,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Search,
  Filter,
  GripVertical,
} from 'lucide-react'
import { PageHeader, GovernedBadge, FreshnessBadge, EmptyState } from '../components/common/index.jsx'
import FeedbackPanel from '../components/ucp/FeedbackPanel.jsx'
import DashboardZones from '../components/dashboard/DashboardZones.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useFeedback } from '../state/FeedbackContext.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { entities } from '../data/mock.js'

// Map an entity's type to the placement profile type used by dashboards.
const PROFILE_OF = { Account: 'Company', Contact: 'Contact', Employee: 'Employee', Deal: 'Deal', Case: 'Case' }

// Widget instances shown on this entity's profile (fixed = Admin-locked).
const PROFILE = [
  { iid: 'i1', widgetId: 'w-revenue', fixed: true, state: 'ok', value: '$1.24M', delta: '+8.2%' },
  { iid: 'i2', widgetId: 'w-pipeline', fixed: false, state: 'ok' },
  { iid: 'i3', widgetId: 'w-tickets', fixed: false, state: 'empty' },
  { iid: 'i4', widgetId: 'w-nps', fixed: false, state: 'error' },
]
const DEFAULT_ORDER = PROFILE.map((p) => p.iid)
const QUICK_ACTIONS = [
  { id: 'task', label: 'Create Task', icon: Plus },
  { id: 'escalate', label: 'Escalate', icon: ArrowUpRight },
  { id: 'notify', label: 'Notify', icon: Bell },
]

// S01–S36 — Unified Contact Profile (end-user consumption)
export default function UCPView() {
  const { entityId } = useParams()
  const navigate = useNavigate()
  const { widgets } = useWidgets()
  const { dashboards } = useDashboards()
  const entity = entities.find((e) => e.id === entityId)
  const widgetById = (id) => widgets.find((w) => w.id === id)

  // Dashboards placed on this profile (by type / specific entity) become tabs.
  const profileType = PROFILE_OF[entity?.type] || 'Company'
  const profileDashboards = dashboards.filter(
    (d) => d.placement?.surface === 'profile' && d.placement.profileType === profileType && (d.placement.scope === 'all' || d.placement.entityId === entityId),
  )
  const [activeTab, setActiveTab] = useState('overview')
  const activeDash = profileDashboards.find((d) => d.id === activeTab)

  // Brief initial load so widgets stream in with a skeleton instead of popping.
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    setLoaded(false)
    setActiveTab('overview')
    const t = setTimeout(() => setLoaded(true), 700)
    return () => clearTimeout(t)
  }, [entityId])

  const [collapsed, setCollapsed] = useState({})
  const [quickAction, setQuickAction] = useState(null) // { action, widgetName }
  const [feedback, setFeedback] = useState(null) // { mode, widget }
  const [order, setOrder] = useState(DEFAULT_ORDER) // S13 reorder
  const [search, setSearch] = useState('') // S05
  const [filters, setFilters] = useState({}) // S09–S12 per-iid filter label
  const [resetOpen, setResetOpen] = useState(false) // S16
  const [dragId, setDragId] = useState(null)

  const visible = order
    .map((iid) => PROFILE.find((p) => p.iid === iid))
    .filter(Boolean)
    .filter((inst) => {
      if (!search) return true
      return (widgetById(inst.widgetId)?.name || '').toLowerCase().includes(search.toLowerCase())
    })

  function reorder(fromIid, toIid) {
    setOrder((prev) => {
      const arr = [...prev]
      const f = arr.indexOf(fromIid)
      const t = arr.indexOf(toIid)
      if (f < 0 || t < 0 || f === t) return prev
      arr.splice(f, 1)
      arr.splice(t, 0, fromIid)
      return arr
    })
  }

  function resetLayout() {
    setOrder(DEFAULT_ORDER)
    setFilters({})
    setCollapsed({})
    setResetOpen(false)
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={entity ? entity.name : 'Unified Contact Profile'}
        description="Unified Contact Profile — every widget shows its freshness and data origin."
      />

      {profileDashboards.length > 0 && (
        <div className="border-b border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-[#0f1629]">
          <div className="flex gap-1 overflow-x-auto">
            <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabBtn>
            {profileDashboards.map((d) => (
              <TabBtn key={d.id} active={activeTab === d.id} onClick={() => setActiveTab(d.id)}>
                {d.name}
              </TabBtn>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative">
        {activeTab !== 'overview' && activeDash ? (
          <div className="mx-auto w-full max-w-[1800px] px-6 py-5 lg:px-8 2xl:px-12">
            <DashboardZones dashboard={activeDash} />
          </div>
        ) : (
        <div className="mx-auto w-full max-w-[1800px] px-6 py-5 lg:px-8 2xl:px-12">
          {/* Toolbar: search (S05) + reset layout (S16) */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                className="input h-9 pl-8"
                placeholder="Search this profile…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-secondary ml-auto" onClick={() => setResetOpen(true)}>
              <RotateCcw size={15} /> Reset layout
            </button>
          </div>

          <AiSummary entityName={entity?.name || 'This account'} />

          {visible.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon="🔍" title="No widgets match" description={`Nothing on this profile matches “${search}”.`} />
            </div>
          ) : (
            <div className="mt-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))' }}>
              {visible.map((inst) => (
                <UCPWidget
                  key={inst.iid}
                  inst={inst}
                  widget={widgetById(inst.widgetId)}
                  loading={!loaded}
                  collapsed={!!collapsed[inst.iid]}
                  filter={filters[inst.iid] || null}
                  dragging={dragId === inst.iid}
                  onToggleCollapse={() => setCollapsed((c) => ({ ...c, [inst.iid]: !c[inst.iid] }))}
                  onQuickAction={(action, widgetName) => {
                    setFeedback(null)
                    setQuickAction({ action, widgetName })
                  }}
                  onFeedback={(mode, widget) => {
                    setQuickAction(null)
                    setFeedback({ mode, widget })
                  }}
                  onApplyFilter={(v) => setFilters((f) => ({ ...f, [inst.iid]: v }))}
                  onClearFilter={() =>
                    setFilters((f) => {
                      const n = { ...f }
                      delete n[inst.iid]
                      return n
                    })
                  }
                  onDragStartReorder={() => setDragId(inst.iid)}
                  onDragEndReorder={() => setDragId(null)}
                  onDropReorder={() => {
                    if (dragId) reorder(dragId, inst.iid)
                    setDragId(null)
                  }}
                />
              ))}
              {loaded && !search && <AddWidgetCard onClick={() => navigate('/widgets')} />}
            </div>
          )}
        </div>
        )}

        {/* Overview-only panels (they act on the profile widgets, not hosted dashboards) */}
        {activeTab === 'overview' && quickAction && (
          <QuickActionPanel
            action={quickAction.action}
            widgetName={quickAction.widgetName}
            onClose={() => setQuickAction(null)}
          />
        )}

        {activeTab === 'overview' && feedback && (
          <FeedbackPanel
            mode={feedback.mode}
            widget={feedback.widget}
            entityId={entityId}
            onClose={() => setFeedback(null)}
          />
        )}

        {activeTab === 'overview' && resetOpen && <ResetModal onCancel={() => setResetOpen(false)} onConfirm={resetLayout} />}
      </div>
    </div>
  )
}

/* ── AI Summary (S33–S35) ── */
function AiSummary({ entityName }) {
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
      <p className="mt-3 max-w-4xl text-sm text-gray-700 dark:text-slate-200 leading-relaxed">
        {refreshing
          ? 'Recomputing summary from the latest data…'
          : `${entityName} is a high-value account trending up: revenue grew 8.2% this quarter and pipeline is healthy. Two support tickets are open with no SLA breaches. NPS data needs review after a recent schema change.`}
      </p>
    </div>
  )
}

function HoverIcon({ title, onClick, active, activeClass, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`h-6 w-6 grid place-items-center rounded-md border border-gray-200 bg-white shadow-sm hover:border-aims-blue dark:border-white/15 dark:bg-[#1b2540] ${
        active ? activeClass : 'text-gray-500 dark:text-slate-400 hover:text-aims-blue'
      }`}
    >
      {children}
    </button>
  )
}

/* ── Widget filter (S09 dropdown · S10 date range) ── */
function WidgetFilter({ onApply, onClear }) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState('Last 30 days')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function apply() {
    const label = range === 'Custom' ? (from && to ? `${from} → ${to}` : 'Custom range') : range
    onApply(label)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        title="Filter"
        onClick={() => setOpen((o) => !o)}
        className="h-6 w-6 grid place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-aims-blue dark:text-slate-500 dark:hover:bg-white/10"
      >
        <Filter size={13} />
      </button>
      {open && (
        <div className="card absolute right-0 top-[calc(100%+6px)] z-20 w-56 p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
            Date range
          </div>
          <select className="input h-8 !py-1 text-sm" value={range} onChange={(e) => setRange(e.target.value)}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Custom</option>
          </select>
          {range === 'Custom' && (
            <div className="mt-2 flex items-center gap-1.5">
              <input type="date" className="input h-8 !py-1 text-xs" value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-gray-400">–</span>
              <input type="date" className="input h-8 !py-1 text-xs" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button className="btn-ghost !py-1 !px-2 text-xs" onClick={() => { onClear(); setOpen(false) }}>
              Clear
            </button>
            <button className="btn-primary !py-1 !px-3 text-xs" onClick={apply}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function UCPWidget({
  inst,
  widget,
  loading,
  collapsed,
  filter,
  dragging,
  onToggleCollapse,
  onQuickAction,
  onFeedback,
  onApplyFilter,
  onClearFilter,
  onDragStartReorder,
  onDragEndReorder,
  onDropReorder,
}) {
  const name = widget?.name || 'Widget'
  const { reactions, setReaction } = useFeedback()
  const reaction = reactions[inst.iid]
  return (
    <div
      draggable={!inst.fixed}
      onDragStart={!inst.fixed ? onDragStartReorder : undefined}
      onDragEnd={!inst.fixed ? onDragEndReorder : undefined}
      onDragOver={(e) => {
        if (!inst.fixed) e.preventDefault()
      }}
      onDrop={!inst.fixed ? onDropReorder : undefined}
      className={`group card p-4 relative flex flex-col ${dragging ? 'opacity-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{name}</span>
        <div className="flex items-center gap-1.5">
          {inst.fixed ? (
            <span title="Locked by admin — cannot be moved or hidden">
              <Lock size={13} className="text-gray-400 dark:text-slate-500" />
            </span>
          ) : (
            <>
              <span title="Drag to reorder" className="cursor-move text-gray-300 hover:text-gray-500 dark:text-slate-600 dark:hover:text-slate-400">
                <GripVertical size={14} />
              </span>
              <button
                onClick={onToggleCollapse}
                title={collapsed ? 'Expand' : 'Collapse'}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-700"
              >
                <ChevronDown size={15} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      {!collapsed && loading && (
        <div className="mt-3 min-h-[72px]">
          <WidgetSkeleton />
        </div>
      )}

      {!collapsed && !loading && (
        <>
          {/* Applied filter chip (S11/S12) */}
          {filter && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-aims-blue/30 bg-aims-blue/10 px-2 py-0.5 text-[11px] font-medium text-aims-blue">
                {filter}
                <button onClick={onClearFilter} title="Clear filter" className="hover:text-aims-stale">
                  <X size={11} />
                </button>
              </span>
            </div>
          )}

          <div className="mt-3 min-h-[72px]">
            <WidgetBody inst={inst} widget={widget} />
          </div>

          {/* Trust layer (S06–S08) + filter control (S09) */}
          {inst.state === 'ok' && (
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/10 flex items-center gap-2 flex-wrap">
              <TrustBadge widget={widget} />
              <FreshnessBadge status={widget?.freshness} label={widget?.freshness} />
              <div className="ml-auto">
                <WidgetFilter onApply={onApplyFilter} onClear={onClearFilter} />
              </div>
            </div>
          )}

          {/* Hover actions: feedback (S22) + quick actions (S17) */}
          <div className="absolute top-3 right-16 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <HoverIcon title="Flag data issue" onClick={() => onFeedback('flag', widget)}>
              <Flag size={13} />
            </HoverIcon>
            <HoverIcon title="Helpful" active={reaction === 'up'} activeClass="text-aims-governed" onClick={() => setReaction(inst.iid, 'up')}>
              <ThumbsUp size={13} />
            </HoverIcon>
            <HoverIcon title="Not helpful" active={reaction === 'down'} activeClass="text-aims-stale" onClick={() => setReaction(inst.iid, 'down')}>
              <ThumbsDown size={13} />
            </HoverIcon>
            <HoverIcon title="Ask about data" onClick={() => onFeedback('ask', widget)}>
              <MessageCircle size={13} />
            </HoverIcon>
            {QUICK_ACTIONS.map((qa) => (
              <HoverIcon key={qa.id} title={qa.label} onClick={() => onQuickAction(qa.label, name)}>
                <qa.icon size={13} />
              </HoverIcon>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* Profile tab (Overview + hosted dashboards) */
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-aims-blue text-aims-blue'
          : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

/* Loading skeleton — shimmer while the widget streams in */
function WidgetSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5">
      <div className="h-7 w-2/3 rounded bg-gray-200 dark:bg-white/10" />
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
      <div className="mt-1 h-16 rounded-lg bg-gray-100 dark:bg-white/5" />
    </div>
  )
}

/* Affordance to add more widgets — fills the trailing grid slot */
function AddWidgetCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[160px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-aims-blue/50 hover:bg-aims-blue/[0.03] hover:text-aims-blue dark:border-white/10 dark:text-slate-500 dark:hover:border-aims-blue/50 dark:hover:bg-aims-blue/[0.06]"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full border border-current">
        <Plus size={18} />
      </span>
      <span className="text-sm font-medium">Add widget</span>
      <span className="text-[11px] opacity-80">Browse your widget library</span>
    </button>
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
    <div>
      <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1.5">
        <li className="flex justify-between"><span>Ticket #4821</span><span className="text-gray-400 dark:text-slate-500">2h ago</span></li>
        <li className="flex justify-between"><span>Ticket #4798</span><span className="text-gray-400 dark:text-slate-500">1d ago</span></li>
      </ul>
      <div className="mt-1.5 text-[10px] text-gray-400 dark:text-slate-500">Showing 2 of 128 open</div>
    </div>
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

/* ── Reset to default modal (S16) ── */
function ResetModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="card relative z-10 w-[420px] max-w-full p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10">
          <RotateCcw size={26} className="text-aims-aging" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Reset to default?</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          This restores the admin's default layout and clears your reordering, collapsed widgets, and filters.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            <RotateCcw size={15} /> Reset to default
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Quick action slide-over (S18–S21) ── */
function QuickActionPanel({ action, widgetName, onClose }) {
  const [done, setDone] = useState(false)
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[calc(100vw-2rem)] bg-white border-l border-gray-200 shadow-xl flex flex-col z-10 dark:bg-[#0f1629] dark:border-white/10">
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
