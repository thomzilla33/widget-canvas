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
import { PopoverPanel } from '../components/common/Popover.jsx'
import FeedbackPanel from '../components/ucp/FeedbackPanel.jsx'
import DashboardZones from '../components/dashboard/DashboardZones.jsx'
import EntityContextHeader, { profileSupportsHeader } from '../components/dashboard/EntityContextHeader.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useFeedback } from '../state/FeedbackContext.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useProfileConfig } from '../state/ProfileConfigContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { entities, MANDATORY_TABS } from '../data/mock.js'
import { suggestTabs } from '../data/suggestions.js'
import { ALL_AUDIENCES, AUDIENCE_OPTIONS, audienceVisibleTo } from '../data/audiences.js'

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
  const { getTabs, setTabs: persistTabs } = useProfileConfig()
  const { isAdmin } = useRole()
  const entity = entities.find((e) => e.id === entityId)
  const widgetById = (id) => widgets.find((w) => w.id === id)

  // Dashboards placed on this profile (by type / specific entity) become tabs.
  const profileType = PROFILE_OF[entity?.type] || 'Company'
  const profileDashboards = dashboards.filter(
    (d) => d.placement?.surface === 'profile' && d.placement.profileType === profileType && (d.placement.scope === 'all' || d.placement.entityId === entityId),
  )
  // Tabs are first-class on a profile and now DURABLE per profile type (U1):
  // the stored set for this type (seeded from PROFILE_TYPES) merged — order-preserving,
  // unique — with any tab a placed dashboard targets, so a placed dashboard's tab
  // always shows even if it isn't in the saved config. Edits persist via the context.
  const configuredTabs = getTabs(profileType)
  const placementTabs = profileDashboards.map((d) => d.placement.tab || 'Overview')
  const tabs = [...new Set([...configuredTabs, ...placementTabs])]

  const [activeTab, setActiveTab] = useState('Overview')
  const [addingTab, setAddingTab] = useState(false)
  const [newTab, setNewTab] = useState('')
  const [renaming, setRenaming] = useState(null) // tab name being renamed
  const [renameValue, setRenameValue] = useState('')
  const [dragTab, setDragTab] = useState(null) // tab name being dragged
  const [suggestTabsOpen, setSuggestTabsOpen] = useState(false) // U3 suggested-tabs popover
  const tabDashboards = profileDashboards.filter((d) => (d.placement.tab || 'Overview') === activeTab)

  // U1.5 — tab-level audience visibility: preview the profile as a role and hide
  // tabs whose content that role can't see. Mandatory + empty tabs always show.
  const [viewAs, setViewAs] = useState(ALL_AUDIENCES)
  const previewing = viewAs !== ALL_AUDIENCES
  const tabVisibleTo = (t) => {
    if (!previewing || MANDATORY_TABS.includes(t)) return true
    const ds = profileDashboards.filter((d) => (d.placement.tab || 'Overview') === t)
    if (ds.length === 0) return true // an empty/configured tab — keep it
    return ds.some((d) => audienceVisibleTo({ audience: d.audience }, viewAs))
  }
  const shownTabs = tabs.filter(tabVisibleTo)
  const hiddenTabCount = tabs.length - shownTabs.length
  // Switching role: if the active tab is now hidden, fall back to Overview.
  function changeViewAs(role) {
    setViewAs(role)
    if (role !== ALL_AUDIENCES && !MANDATORY_TABS.includes(activeTab) && !tabVisibleToFor(activeTab, role)) {
      setActiveTab('Overview')
    }
  }
  function tabVisibleToFor(t, role) {
    if (role === ALL_AUDIENCES || MANDATORY_TABS.includes(t)) return true
    const ds = profileDashboards.filter((d) => (d.placement.tab || 'Overview') === t)
    if (ds.length === 0) return true
    return ds.some((d) => audienceVisibleTo({ audience: d.audience }, role))
  }

  // All tab mutations persist the placement-FREE list: placement tabs are derived
  // (recomputed each render), so a tab that exists only because a dashboard targets
  // it is dropped before storing — otherwise it would bake into the type config and
  // never clear when the dashboard moves/leaves.
  function persistFrom(nextTabs) {
    const placementOnly = new Set(placementTabs.filter((t) => !configuredTabs.includes(t)))
    persistTabs(profileType, nextTabs.filter((t) => !placementOnly.has(t)))
  }

  function addTab() {
    const name = newTab.trim()
    if (name && !tabs.some((t) => t.toLowerCase() === name.toLowerCase())) {
      persistFrom([...tabs, name])
    }
    setNewTab('')
    setAddingTab(false)
  }

  function removeTab(name) {
    if (MANDATORY_TABS.includes(name)) return // Overview/Activity/Snapshot can't be removed
    persistFrom(tabs.filter((t) => t !== name))
    if (activeTab === name) setActiveTab('Overview')
  }

  // HTML5 drag-and-drop reorder: drop `from` onto `to`, then persist new order.
  function reorderTabs(from, to) {
    if (from === to) return
    const arr = [...tabs]
    const fi = arr.indexOf(from)
    const ti = arr.indexOf(to)
    if (fi < 0 || ti < 0) return
    arr.splice(fi, 1)
    arr.splice(ti, 0, from)
    persistFrom(arr)
  }

  // Inline rename (non-mandatory tabs only). Commit on Enter/blur, cancel on Escape.
  function startRename(name) {
    if (MANDATORY_TABS.includes(name)) return
    setRenaming(name)
    setRenameValue(name)
  }
  function commitRename() {
    if (!renaming) return
    const next = renameValue.trim()
    const original = renaming
    setRenaming(null)
    setRenameValue('')
    if (!next || next === original) return
    if (tabs.some((t) => t !== original && t.toLowerCase() === next.toLowerCase())) return // no dup
    persistFrom(tabs.map((t) => (t === original ? next : t)))
    if (activeTab === original) setActiveTab(next)
  }
  function cancelRename() {
    setRenaming(null)
    setRenameValue('')
  }

  // Brief initial load so widgets stream in with a skeleton instead of popping.
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    setLoaded(false)
    setActiveTab('Overview')
    // Tabs are durable per profile type now (context-backed) — don't reset them on
    // entity change. Only clear any transient add/rename/drag UI.
    setAddingTab(false)
    setNewTab('')
    setRenaming(null)
    setRenameValue('')
    setDragTab(null)
    const t = setTimeout(() => setLoaded(true), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!entity) {
    return (
      <div className="grid h-full place-items-center px-6">
        <EmptyState
          icon="🔍"
          title="Profile not found"
          description={`No entity matches “${entityId}”.`}
          action={<button className="btn-secondary" onClick={() => navigate('/dashboards')}>Back to dashboards</button>}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={entity.name}
        description="Unified Contact Profile — every widget shows its freshness and data origin."
      />

      <div className="border-b border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-[#0f1629]">
        <div className="flex items-center">
          <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
          {shownTabs.map((t) => {
            const mandatory = MANDATORY_TABS.includes(t)
            if (renaming === t) {
              return (
                <input
                  key={t}
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') cancelRename()
                  }}
                  onBlur={commitRename}
                  aria-label={`Rename ${t} tab`}
                  className="my-1 ml-1 w-32 rounded-md border border-aims-blue/40 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-aims-blue/30 dark:bg-white/5 dark:text-slate-100"
                />
              )
            }
            return (
              <div
                key={t}
                draggable
                onDragStart={() => setDragTab(t)}
                onDragEnd={() => setDragTab(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragTab) reorderTabs(dragTab, t)
                  setDragTab(null)
                }}
                title={mandatory ? t : `${t} — double-click to rename, drag to reorder`}
                className={`group relative flex shrink-0 items-center ${dragTab === t ? 'opacity-50' : ''}`}
              >
                <TabBtn
                  active={activeTab === t}
                  onClick={() => setActiveTab(t)}
                  onDoubleClick={mandatory || !isAdmin || previewing ? undefined : () => startRename(t)}
                >
                  {t}
                </TabBtn>
                {!mandatory && isAdmin && !previewing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTab(t)
                    }}
                    aria-label={`Remove ${t} tab`}
                    title={`Remove ${t} tab`}
                    className="absolute right-0.5 top-1.5 grid h-4 w-4 place-items-center rounded-full text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-gray-700 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-slate-200"
                  >
                    <X size={11} aria-hidden="true" />
                  </button>
                )}
              </div>
            )
          })}

          {isAdmin && !previewing && (addingTab ? (
            <input
              autoFocus
              value={newTab}
              onChange={(e) => setNewTab(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTab()
                if (e.key === 'Escape') {
                  setNewTab('')
                  setAddingTab(false)
                }
              }}
              onBlur={addTab}
              placeholder="Tab name…"
              aria-label="New tab name"
              className="my-1 ml-1 w-32 rounded-md border border-aims-blue/40 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-aims-blue/30 dark:bg-white/5 dark:text-slate-100"
            />
          ) : (
            <button
              onClick={() => setAddingTab(true)}
              className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-aims-blue dark:text-slate-400 dark:hover:bg-white/5"
            >
              <Plus size={14} aria-hidden="true" /> Add tab
            </button>
          ))}
          </div>

          {/* U3 — suggested tabs (outside the scroll container so the popover isn't clipped) */}
          {isAdmin && !previewing && suggestTabs(profileType, tabs).length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() => setSuggestTabsOpen((o) => !o)}
                aria-expanded={suggestTabsOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-aims-blue hover:bg-aims-blue/10"
              >
                <Sparkles size={14} aria-hidden="true" /> Suggest tabs
              </button>
              {suggestTabsOpen && (
                <PopoverPanel onClose={() => setSuggestTabsOpen(false)} align="left" className="top-full w-64 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Suggested for {profileType}</div>
                  {suggestTabs(profileType, tabs).map((s) => (
                    <button
                      key={s.tab}
                      role="menuitem"
                      onClick={() => {
                        persistFrom([...tabs, s.tab])
                        setSuggestTabsOpen(false)
                      }}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Plus size={13} className="mt-0.5 shrink-0 text-aims-blue" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 dark:text-slate-100">{s.tab}</span>
                        <span className="block text-[11px] text-gray-500 dark:text-slate-400">{s.why}</span>
                      </span>
                    </button>
                  ))}
                </PopoverPanel>
              )}
            </div>
          )}

          {/* U1.5 — preview the profile as a role; tabs that role can't see are hidden. */}
          {isAdmin && (
            <div className="ml-auto flex shrink-0 items-center gap-2 pl-3">
              {previewing && hiddenTabCount > 0 && (
                <span className="hidden items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-aims-ungoverned sm:inline-flex">
                  {hiddenTabCount} tab{hiddenTabCount === 1 ? '' : 's'} hidden
                </span>
              )}
              <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                <span className="hidden font-medium sm:inline">Viewing as</span>
                <select
                  className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
                  value={viewAs}
                  onChange={(e) => changeViewAs(e.target.value)}
                  aria-label="Preview this profile as a role"
                >
                  {AUDIENCE_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a === ALL_AUDIENCES ? 'Admin (all tabs)' : a}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {profileSupportsHeader(profileType) && (
          <div className="mx-auto w-full max-w-[1800px] px-6 pt-5 lg:px-8 2xl:px-12">
            <EntityContextHeader entity={entity} />
          </div>
        )}
        {activeTab !== 'Overview' ? (
          <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
            {tabDashboards.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10">
                <EmptyState
                  icon="🗂️"
                  title={`No dashboard on “${activeTab}” yet`}
                  description="Place a dashboard on this tab to fill it, or remove the tab if it’s not needed."
                  action={
                    <button className="btn-primary" onClick={() => navigate('/dashboard/new')}>
                      <Plus size={15} /> Add a dashboard to this tab
                    </button>
                  }
                />
              </div>
            ) : (
              tabDashboards.map((d) => (
                <section key={d.id}>
                  {tabDashboards.length > 1 && (
                    <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-slate-100">{d.name}</div>
                  )}
                  <DashboardZones dashboard={d} viewerRole={viewAs} />
                </section>
              ))
            )}
          </div>
        ) : (
        <div className="mx-auto w-full max-w-[1800px] px-6 py-5 lg:px-8 2xl:px-12">
          {/* Toolbar: search (S05) + reset layout (S16) */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" />
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
        {activeTab === 'Overview' && quickAction && (
          <QuickActionPanel
            action={quickAction.action}
            widgetName={quickAction.widgetName}
            onClose={() => setQuickAction(null)}
          />
        )}

        {activeTab === 'Overview' && feedback && (
          <FeedbackPanel
            mode={feedback.mode}
            widget={feedback.widget}
            entityId={entityId}
            onClose={() => setFeedback(null)}
          />
        )}

        {activeTab === 'Overview' && resetOpen && <ResetModal onCancel={() => setResetOpen(false)} onConfirm={resetLayout} />}
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
    <div className="card p-5 border-aims-blue/30 dark:border-aims-blue/20 bg-gradient-to-br from-blue-50/60 to-white dark:from-aims-blue/10 dark:to-[#131a2c]">
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
      aria-label={title}
      aria-pressed={active != null ? !!active : undefined}
      onClick={onClick}
      className={`h-6 w-6 grid place-items-center rounded-md border border-gray-200 bg-white shadow-sm hover:border-aims-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:border-white/15 dark:bg-[#1b2540] ${
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
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
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
              <span className="text-gray-500 dark:text-slate-400">–</span>
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
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span title={name} className="flex-1 min-w-0 font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">{name}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {inst.fixed ? (
            <span title="Locked by admin — cannot be moved or hidden">
              <Lock size={13} className="text-gray-500 dark:text-slate-400" />
            </span>
          ) : (
            <>
              <span title="Drag to reorder" className="cursor-move text-gray-300 hover:text-gray-500 dark:text-slate-600 dark:hover:text-slate-400">
                <GripVertical size={14} />
              </span>
              <button
                onClick={onToggleCollapse}
                title={collapsed ? 'Expand' : 'Collapse'}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
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
              <Flag size={13} aria-hidden="true" />
            </HoverIcon>
            <HoverIcon title="Helpful" active={reaction === 'up'} activeClass="text-aims-governed" onClick={() => setReaction(inst.iid, 'up')}>
              <ThumbsUp size={13} aria-hidden="true" />
            </HoverIcon>
            <HoverIcon title="Not helpful" active={reaction === 'down'} activeClass="text-aims-stale" onClick={() => setReaction(inst.iid, 'down')}>
              <ThumbsDown size={13} aria-hidden="true" />
            </HoverIcon>
            <HoverIcon title="Ask about data" onClick={() => onFeedback('ask', widget)}>
              <MessageCircle size={13} aria-hidden="true" />
            </HoverIcon>
            {QUICK_ACTIONS.map((qa) => (
              <HoverIcon key={qa.id} title={qa.label} onClick={() => onQuickAction(qa.label, name)}>
                <qa.icon size={13} aria-hidden="true" />
              </HoverIcon>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* Profile tab (Overview + hosted dashboards) */
function TabBtn({ active, onClick, onDoubleClick, children }) {
  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
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
        <li className="flex justify-between"><span>Ticket #4821</span><span className="text-gray-500 dark:text-slate-400">2h ago</span></li>
        <li className="flex justify-between"><span>Ticket #4798</span><span className="text-gray-500 dark:text-slate-400">1d ago</span></li>
      </ul>
      <div className="mt-1.5 text-[10px] text-gray-500 dark:text-slate-400">Showing 2 of 128 open</div>
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
        <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300">
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
