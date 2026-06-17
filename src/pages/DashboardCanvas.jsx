import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Plus, X, Lock, Unlock, Trash2, Sparkles, RotateCcw, SlidersHorizontal, GripVertical } from 'lucide-react'
import { PageHeader, GovernedBadge, FreshnessBadge, Badge, EmptyState } from '../components/common/index.jsx'
import WidgetRender from '../components/widgets/WidgetRender.jsx'
import WidgetLibraryModal from '../components/widgets/WidgetLibraryModal.jsx'
import PublishModal from '../components/dashboard/PublishModal.jsx'
import ShareModal from '../components/dashboard/ShareModal.jsx'
import EditSetupModal from '../components/dashboard/EditSetupModal.jsx'
import EntityContextHeader, { entityHeaderApplies } from '../components/dashboard/EntityContextHeader.jsx'
import SuggestWidgetsModal from '../components/dashboard/SuggestWidgetsModal.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { WIDGET_SIZES, dashboardKindLabel } from '../data/mock.js'
import { dashboardLayout } from '../data/layout.js'
import { vizRecommendation, vizInterchangeable, VIZ_OPTIONS } from '../data/preview.js'
import { AUDIENCE_ROLES, placementAudiences, audienceSummary } from '../data/audiences.js'

// A widget's size IS its width — free grid, 1/2/3 columns by size (capped per breakpoint).
const SIZE_SPAN_CLASS = { sm: '', md: 'sm:col-span-2', lg: 'sm:col-span-2 lg:col-span-3' }
const QUICK_ACTIONS = ['Create Task', 'Escalate / Handoff', 'Notify']

// Collision-proof placement id, namespaced to the dashboard. Event-handler path,
// so Date.now() is fine; the array index disambiguates two adds in the same ms.
const newPid = (dashboardId, arr) => `${dashboardId}-${Date.now().toString(36)}-${arr.length}`

// S84–S94 — dashboard canvas: a free, resizable widget grid (no fixed zones).
export default function DashboardCanvas() {
  const { id } = useParams()
  const { isAdmin } = useRole()
  const { widgets } = useWidgets()
  const { dashboards, updateDashboard } = useDashboards()
  const dashboard = dashboards.find((d) => d.id === id)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedPid, setSelectedPid] = useState(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [editSetupOpen, setEditSetupOpen] = useState(false)
  const [dragPid, setDragPid] = useState(null)

  // Layout is a flat ordered array, persisted on the dashboard (so edits surface on
  // the view/profile). Falls back to the template seed until the first edit.
  const placements = dashboardLayout(dashboard)
  const widgetById = (wid) => widgets.find((w) => w.id === wid)
  const selected = placements.find((p) => p.pid === selectedPid)
  const lockedCount = placements.filter((p) => p.fixed).length
  const allLocked = placements.length > 0 && lockedCount === placements.length

  function commit(updater) {
    const next = updater(placements)
    updateDashboard(id, { layout: next, widgets: next.length })
  }
  function placeWidget(widget, size = 'md') {
    commit((prev) => [...prev, { pid: newPid(id, prev), widgetId: widget.id, fixed: false, size, audiences: [], quickActions: [] }])
    setAddOpen(false)
  }
  function updatePlacement(pid, patch) {
    commit((prev) => prev.map((p) => (p.pid === pid ? { ...p, ...patch } : p)))
  }
  function removePlacement(pid) {
    commit((prev) => prev.filter((p) => p.pid !== pid))
    if (selectedPid === pid) setSelectedPid(null)
  }
  function setAllFixed(fixed) {
    commit((prev) => prev.map((p) => ({ ...p, fixed })))
  }
  // Drag-to-reorder within the free grid: move `fromPid` to where `toPid` sits.
  function reorder(fromPid, toPid) {
    if (!fromPid || fromPid === toPid) return
    commit((prev) => {
      const from = prev.findIndex((p) => p.pid === fromPid)
      const to = prev.findIndex((p) => p.pid === toPid)
      if (from < 0 || to < 0) return prev
      // Remove first, then adjust the target index for the left-shift when moving forward.
      const without = prev.filter((_, i) => i !== from)
      const at = to > from ? to - 1 : to
      return [...without.slice(0, at), prev[from], ...without.slice(at)]
    })
  }

  // U7.2 — the canvas is an editing surface: viewers are redirected to the read-only view.
  if (!isAdmin) return <Navigate to={`/dashboard/${id}`} replace />

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={dashboard?.name || 'Dashboard canvas'}
        description={
          dashboard ? (
            <span>
              <button
                onClick={() => setEditSetupOpen(true)}
                className="font-medium text-gray-600 underline-offset-2 hover:text-aims-blue hover:underline dark:text-slate-300"
                title="Edit setup — change where this dashboard lives"
              >
                {dashboardKindLabel(dashboard)}
              </button>
              {` · ${dashboard.audience}${placements.length ? ` · ${placements.length} widget${placements.length === 1 ? '' : 's'}${lockedCount ? `, ${lockedCount} locked` : ''}` : ' — add widgets and resize freely'}`}
            </span>
          ) : (
            'Add widgets and resize them freely; permissions are set per widget here.'
          )
        }
        actions={
          <>
            {dashboard && <Badge variant={dashboard.status} />}
            {dashboard && (
              <button className="btn-secondary" onClick={() => setEditSetupOpen(true)} title="Change where this dashboard lives, or rename it">
                <SlidersHorizontal size={15} /> Edit setup
              </button>
            )}
            {placements.length > 0 && (
              <button
                className="btn-secondary"
                onClick={() => setAllFixed(!allLocked)}
                title={allLocked ? 'Unlock all widgets' : 'Lock every widget so end users cannot move or hide them'}
              >
                {allLocked ? <><Unlock size={15} /> Unlock all</> : <><Lock size={15} /> Lock all</>}
              </button>
            )}
            <button className="btn-secondary" onClick={() => setSuggestOpen(true)} title="Suggest widgets for this profile">
              <Sparkles size={15} /> Suggest
            </button>
            <button className="btn-secondary" onClick={() => setShareOpen(true)}>Share</button>
            <button className="btn-primary" onClick={() => setPublishOpen(true)}>Publish</button>
          </>
        }
      />

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-auto px-6 py-4">
          {entityHeaderApplies(dashboard?.placement) && <EntityContextHeader placement={dashboard.placement} />}

          {placements.length === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AddWidgetCard onClick={() => setAddOpen(true)} />
              <div className="flex items-center sm:col-span-1 lg:col-span-2">
                <button className="btn-secondary" onClick={() => setSuggestOpen(true)}>
                  <Sparkles size={15} aria-hidden="true" /> Suggest widgets
                </button>
              </div>
            </div>
          ) : (
            <div
              className="grid auto-rows-min grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              onDragOver={(e) => e.preventDefault()}
            >
              {placements.map((p) => (
                <CanvasTile
                  key={p.pid}
                  placement={p}
                  widget={widgetById(p.widgetId)}
                  selected={selectedPid === p.pid}
                  dragging={dragPid === p.pid}
                  onSelect={() => setSelectedPid(p.pid)}
                  onUpdate={updatePlacement}
                  onDragStart={() => setDragPid(p.pid)}
                  onDragEnd={() => setDragPid(null)}
                  onDropOn={() => { reorder(dragPid, p.pid); setDragPid(null) }}
                />
              ))}
              <AddWidgetCard onClick={() => setAddOpen(true)} />
            </div>
          )}
          <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">Screens hosted here: S84–S94</p>
        </div>

        {/* Library browser — marketplace-style picker over the widget library */}
        {addOpen && (
          <WidgetLibraryModal
            onAdd={(w, size) => placeWidget(w, size)}
            onClose={() => setAddOpen(false)}
          />
        )}

        {/* Per-widget config */}
        {selected && (
          <SidePanel
            title="Widget settings"
            onClose={() => setSelectedPid(null)}
            footer={
              <button
                className="btn-secondary w-full text-red-600 dark:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50"
                onClick={() => removePlacement(selected.pid)}
              >
                <Trash2 size={15} aria-hidden="true" /> Remove from dashboard
              </button>
            }
          >
            <ConfigPanel
              placement={selected}
              widget={widgetById(selected.widgetId)}
              onChange={(patch) => updatePlacement(selected.pid, patch)}
            />
          </SidePanel>
        )}
      </div>

      {publishOpen && dashboard && (
        <PublishModal
          dashboard={dashboard}
          placements={placements}
          widgetById={widgetById}
          onClose={() => setPublishOpen(false)}
          onPublish={() => updateDashboard(dashboard.id, { status: 'published' })}
          onShare={() => { setPublishOpen(false); setShareOpen(true) }}
        />
      )}

      {shareOpen && dashboard && <ShareModal dashboard={dashboard} onClose={() => setShareOpen(false)} />}

      {suggestOpen && (
        <SuggestWidgetsModal
          profileType={dashboard?.placement?.profileType || 'Company'}
          placedIds={placements.map((p) => p.widgetId)}
          onAdd={(w) => placeWidget(w)}
          onClose={() => setSuggestOpen(false)}
        />
      )}

      {editSetupOpen && dashboard && (
        <EditSetupModal
          dashboard={dashboard}
          onClose={() => setEditSetupOpen(false)}
          onSave={(patch) => { updateDashboard(dashboard.id, patch); setEditSetupOpen(false) }}
        />
      )}
    </div>
  )
}

/* ── A dashed "Add widget" tile that opens the marketplace picker ── */
function AddWidgetCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[180px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-aims-blue/50 hover:text-aims-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/40 dark:border-white/15 dark:text-slate-400"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full border border-current"><Plus size={18} aria-hidden="true" /></span>
      <span className="mt-1 text-sm font-medium">Add widget</span>
      <span className="text-[11px] text-gray-400 dark:text-slate-500">Browse your widget library</span>
    </button>
  )
}

/* ── One editable widget tile in the free grid ── */
function CanvasTile({ placement: p, widget: w, selected, dragging, onSelect, onUpdate, onDragStart, onDragEnd, onDropOn }) {
  // ?? not || — SIZE_SPAN_CLASS.sm is '' (falsy), so || would wrongly widen small tiles to md.
  const span = SIZE_SPAN_CLASS[p.size] ?? SIZE_SPAN_CLASS.md
  const current = p.viewAs || w?.skeleton
  const rec = w ? vizRecommendation(w) : null
  const suggest = rec && rec.best && rec.best !== current && !vizInterchangeable(rec.best, current) ? rec.best : null
  const stop = (e) => e.stopPropagation()
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDropOn() }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      aria-label={`Configure ${w?.name || 'widget'}`}
      className={`group relative rounded-lg border bg-white p-2.5 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:bg-[#131a2c] ${span} ${dragging ? 'opacity-50' : ''} ${
        selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : 'border-gray-200 dark:border-white/10'
      }`}
    >
      {/* Resize control (hover/focus) — resize the tile to Small/Medium/Large */}
      <div
        className="pointer-events-none absolute right-2 top-2 z-10 flex overflow-hidden rounded-md border border-gray-200 bg-white text-[10px] opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 dark:border-white/15 dark:bg-[#1a2236]"
        onMouseDown={stop}
        onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        {WIDGET_SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            draggable={false}
            title={`Resize to ${s.label}`}
            aria-label={`Resize ${w?.name || 'widget'} to ${s.label}`}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onUpdate(p.pid, { size: s.id }) }}
            className={`px-1.5 py-0.5 font-bold ${p.size === s.id ? 'bg-aims-blue text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10'}`}
          >
            {s.label[0]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 pr-16">
        <GripVertical size={13} aria-hidden="true" className="shrink-0 cursor-grab text-gray-300 group-hover:text-gray-400 dark:text-slate-600" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900 dark:text-slate-100">{w?.name || 'Widget'}</span>
        {p.fixed ? (
          <Lock size={12} aria-hidden="true" className="shrink-0 text-gray-500 dark:text-slate-400" />
        ) : (
          <Unlock size={12} aria-hidden="true" className="shrink-0 text-gray-300 dark:text-slate-600" />
        )}
      </div>
      <div className="mt-2">
        <WidgetRender widget={w} size={p.size} viewAs={p.viewAs} />
      </div>
      {suggest && (
        <button
          type="button"
          draggable={false}
          onMouseDown={stop}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onUpdate(p.pid, { viewAs: suggest }) }}
          title={`Show this widget as ${suggest}`}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-aims-blue/30 bg-aims-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-aims-blue hover:bg-aims-blue/20"
        >
          <Sparkles size={10} aria-hidden="true" /> Suggested: {suggest}
        </button>
      )}
      <div className="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-1.5 dark:border-white/5">
        {w?.freshness && <FreshnessBadge status={w.freshness} label={w.freshness} />}
        {p.viewAs && <span className="truncate text-[10px] text-gray-500 dark:text-slate-400">as {p.viewAs}</span>}
        <span className="ml-auto truncate text-[10px] text-gray-500 dark:text-slate-400">{audienceSummary(p)}</span>
      </div>
    </div>
  )
}

/* ── Config panel body (size, visualization, fixed/flexible, audience, quick actions) ── */
function ConfigPanel({ placement, widget, onChange }) {
  function toggleQuickAction(qa) {
    const has = placement.quickActions.includes(qa)
    onChange({ quickActions: has ? placement.quickActions.filter((x) => x !== qa) : [...placement.quickActions, qa] })
  }
  const rec = widget ? vizRecommendation(widget) : null
  const currentViz = placement.viewAs || widget?.skeleton
  const allowedAudiences = placementAudiences(placement)
  return (
    <div className="space-y-5">
      <div>
        <div className="font-semibold text-gray-900 dark:text-slate-100">{widget?.name}</div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <GovernedBadge governed={!!widget?.governed} />
          {widget?.freshness && <FreshnessBadge status={widget.freshness} label={widget.freshness} />}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Size</div>
        <div className="surface-sunken rounded-lg p-3">
          <WidgetRender widget={widget} size={placement.size} viewAs={placement.viewAs} />
        </div>
        <div className="mt-2 flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
          {WIDGET_SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ size: s.id })}
              className={`flex-1 px-2 py-1.5 font-medium ${placement.size === s.id ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 dark:bg-white/5 dark:text-slate-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          {WIDGET_SIZES.find((s) => s.id === placement.size)?.width} · {WIDGET_SIZES.find((s) => s.id === placement.size)?.detail}
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-200">Visualization</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
            <Sparkles size={11} className="text-amber-500" aria-hidden="true" /> recommended
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {VIZ_OPTIONS.map((v) => {
            const isCurrent = currentViz === v
            const isRec = rec?.recommended.includes(v)
            return (
              <button
                key={v}
                onClick={() => onChange({ viewAs: v === widget?.skeleton ? undefined : v })}
                className={`flex items-center justify-between gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  isCurrent ? 'border-aims-blue bg-aims-blue/10 text-aims-blue' : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20'
                }`}
              >
                <span className="truncate">{v}</span>
                {isRec && <Sparkles size={11} aria-label="Recommended" className={isCurrent ? 'text-aims-blue' : 'text-amber-500'} />}
              </button>
            )
          })}
        </div>
        {placement.viewAs && (
          <button
            onClick={() => onChange({ viewAs: undefined })}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <RotateCcw size={11} aria-hidden="true" /> Revert to default ({widget?.skeleton})
          </button>
        )}
      </div>

      <div>
        <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Placement</div>
        <div className="flex rounded-lg border border-gray-300 dark:border-white/15 overflow-hidden text-sm">
          <button
            onClick={() => onChange({ fixed: false })}
            className={`flex-1 px-3 py-2 flex items-center justify-center gap-1.5 ${!placement.fixed ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 dark:bg-white/5 dark:text-slate-300'}`}
          >
            <Unlock size={14} aria-hidden="true" /> Flexible
          </button>
          <button
            onClick={() => onChange({ fixed: true })}
            className={`flex-1 px-3 py-2 flex items-center justify-center gap-1.5 ${placement.fixed ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 dark:bg-white/5 dark:text-slate-300'}`}
          >
            <Lock size={14} aria-hidden="true" /> Fixed
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          {placement.fixed ? 'Locked — users cannot move or hide this widget.' : 'Users can reorder, collapse, and save filter preferences.'}
        </p>
      </div>

      <div>
        <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Audience restriction</div>
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCE_ROLES.map((r) => {
            const on = allowedAudiences.includes(r)
            return (
              <button
                key={r}
                onClick={() => onChange({ audiences: on ? allowedAudiences.filter((x) => x !== r) : [...allowedAudiences, r] })}
                aria-pressed={on}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/40 ${
                  on ? 'border-aims-blue/40 bg-aims-blue/10 text-aims-blue' : 'border-gray-300 text-gray-500 hover:text-gray-700 dark:border-white/15 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            )
          })}
        </div>
        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
          {allowedAudiences.length === 0 ? 'Visible to everyone who can see this dashboard.' : `Only visible to: ${allowedAudiences.join(', ')}.`}
        </p>
      </div>

      <div>
        <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Quick Actions</div>
        <div className="space-y-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <label key={qa} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
              <input type="checkbox" className="checkbox" checked={placement.quickActions.includes(qa)} onChange={() => toggleQuickAction(qa)} />
              {qa}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Reusable right-side slide-over ── */
function SidePanel({ title, children, footer, onClose }) {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[calc(100vw-2rem)] bg-white border-l border-gray-200 dark:bg-[#0f1629] dark:border-white/10 shadow-xl flex flex-col z-10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <span className="font-semibold text-gray-900 dark:text-slate-100">{title}</span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-gray-500 dark:text-slate-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
      {footer && <div className="border-t border-gray-200 dark:border-white/10 p-3">{footer}</div>}
    </div>
  )
}
