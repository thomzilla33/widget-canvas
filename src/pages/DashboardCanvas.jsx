import { useState, useRef, useEffect } from 'react'
import { useParams, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Plus, X, Lock, Unlock, Trash2, Sparkles, RotateCcw, SlidersHorizontal, GripVertical, Move, Check, RefreshCw, MoreHorizontal, Flag, Info, Pencil } from 'lucide-react'
import { PageHeader, GovernedBadge, FreshnessBadge, Badge, EmptyState } from '../components/common/index.jsx'
import { Button } from '@/components/ui/Button'
import { PopoverPanel } from '../components/common/Popover.jsx'
import WidgetRender from '../components/widgets/WidgetRender.jsx'
import WidgetLibraryModal from '../components/widgets/WidgetLibraryModal.jsx'
import WidgetDetailModal from '../components/widgets/WidgetDetailModal.jsx'
import RepinModal from '../components/widgets/RepinModal.jsx'
import PublishModal from '../components/dashboard/PublishModal.jsx'
import ShareModal from '../components/dashboard/ShareModal.jsx'
import EditSetupModal from '../components/dashboard/EditSetupModal.jsx'
import EntityContextHeader, { entityHeaderApplies } from '../components/dashboard/EntityContextHeader.jsx'
import SuggestWidgetsModal from '../components/dashboard/SuggestWidgetsModal.jsx'
import AskDashboardModal from '../components/dashboard/AskDashboardModal.jsx'
import FeedbackPanel from '../components/ucp/FeedbackPanel.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { WIDGET_SIZES, dashboardKindLabel } from '../data/mock.js'
import { dashboardLayout } from '../data/layout.js'
import { vizRecommendation, vizInterchangeable } from '../data/preview.js'
import { AUDIENCE_ROLES, placementAudiences, audienceSummary, audienceLabel } from '../data/audiences.js'

// A widget's size IS its width — free grid, 1/2/3 columns by size (capped per breakpoint).
const SIZE_SPAN_CLASS = { sm: '', md: 'sm:col-span-2', lg: 'sm:col-span-2 lg:col-span-3' }
// Drag-resize maps a target column span (1/2/3) to a size, and back.
const SIZE_FOR_SPAN = { 1: 'sm', 2: 'md', 3: 'lg' }
const SIZE_ORDER = ['sm', 'md', 'lg'] // index = span-1; used by keyboard resize stepping
const GRID_GAP = 12 // gap-3
// Columns the grid actually renders at the current viewport (Tailwind sm=640, lg=1024).
const gridColsAtViewport = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
const QUICK_ACTIONS = ['Create Task', 'Escalate / Handoff', 'Notify']

// Collision-proof placement id, namespaced to the dashboard. Event-handler path,
// so Date.now() is fine; the array index disambiguates two adds in the same ms.
const newPid = (dashboardId, arr) => `${dashboardId}-${Date.now().toString(36)}-${arr.length}`

// S84–S94 — dashboard canvas: a free, resizable widget grid (no fixed zones).
export default function DashboardCanvas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin } = useRole()
  const { widgets, updateWidget } = useWidgets()
  const { dashboards, updateDashboard } = useDashboards()
  const dashboard = dashboards.find((d) => d.id === id)
  const [addOpen, setAddOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [tipDismissed, setTipDismissed] = useState(false)
  const [selectedPid, setSelectedPid] = useState(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [editSetupOpen, setEditSetupOpen] = useState(false)
  const [dragPid, setDragPid] = useState(null)
  // Per-widget actions opened from the Widget settings panel.
  const [detailWidget, setDetailWidget] = useState(null)
  const [remapWidget, setRemapWidget] = useState(null)
  const [feedbackWidget, setFeedbackWidget] = useState(null)
  const [askWidget, setAskWidget] = useState(null)

  // Layout is a flat ordered array, persisted on the dashboard (so edits surface on
  // the view/profile). Falls back to the template seed until the first edit.
  const placements = dashboardLayout(dashboard)
  const widgetById = (wid) => widgets.find((w) => w.id === wid)
  const selected = placements.find((p) => p.pid === selectedPid)
  const lockedCount = placements.filter((p) => p.fixed).length
  const allLocked = placements.length > 0 && lockedCount === placements.length
  // Lifecycle: edits auto-persist; a published dashboard with edits has unpublished changes.
  const published = dashboard?.status === 'published'
  const dirty = !!dashboard?.dirty

  // Autosave feedback — edits persist immediately; flash "Saving…" → "All changes saved".
  const [saveState, setSaveState] = useState('saved')
  const savedTimer = useRef(null)
  function flashSaved() {
    setSaveState('saving')
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaveState('saved'), 350)
  }
  // Clear a pending flash timer on unmount (no setState after the canvas is gone).
  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current) }, [])

  // Auto-place a widget created via the "Create new widget" shortcut from this canvas.
  // The builder navigates back with state.autoAdd = widgetId after saving.
  useEffect(() => {
    const wid = location.state?.autoAdd
    if (!wid) return
    const w = widgets.find((x) => x.id === wid)
    if (w) placeWidget(w)
    // Clear the state so a reload or back-navigation doesn't re-place.
    navigate(location.pathname, { replace: true, state: {} })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function commit(updater) {
    const next = updater(placements)
    const patch = { layout: next, widgets: next.length }
    if (dashboard?.status === 'published') patch.dirty = true // edits diverge from the published version
    updateDashboard(id, patch)
    flashSaved()
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
  // Keyboard reorder: move a placement ±1 in the order (the accessible path for the grip).
  function movePlacement(pid, delta) {
    commit((prev) => {
      const i = prev.findIndex((p) => p.pid === pid)
      const j = i + delta
      if (i < 0 || j < 0 || j >= prev.length) return prev
      // j is the absolute destination index; after removing i, inserting prev[i] at j
      // lands it there in both directions (no -1 offset — that's reorder's before-target case).
      const without = prev.filter((_, idx) => idx !== i)
      return [...without.slice(0, j), prev[i], ...without.slice(j)]
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
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                {`${dashboardKindLabel(dashboard)} · ${audienceLabel(dashboard.audience)}${placements.length ? ` · ${placements.length} widget${placements.length === 1 ? '' : 's'}${lockedCount ? `, ${lockedCount} locked` : ''}` : ''}`}
              </span>
              <span aria-hidden="true" className="text-gray-300 dark:text-slate-600">·</span>
              {published && dirty ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-aims-ungoverned"
                  title="Edits aren’t live yet — publish to push them to viewers."
                >
                  Unpublished changes
                </span>
              ) : (
                <span title={!published ? 'Draft — only you can see this until you publish.' : undefined}>
                  <Badge variant={dashboard.status} />
                </span>
              )}
              <SaveIndicator state={saveState} />
            </span>
          ) : (
            'Add widgets and resize them freely; permissions are set per widget here.'
          )
        }
        actions={
          dashboard ? (
            <>
              <div className="relative">
                <Button
                  variant="secondary"
                  className="!px-2"
                  aria-label="More actions"
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((o) => !o)}
                >
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
                {moreOpen && (
                  <PopoverPanel onClose={() => setMoreOpen(false)} align="right" className="w-56 p-1.5">
                    <MenuItem icon={SlidersHorizontal} onClick={() => { setMoreOpen(false); setEditSetupOpen(true) }}>
                      Edit setup
                    </MenuItem>
                    {placements.length > 0 && (
                      <MenuItem icon={allLocked ? Unlock : Lock} onClick={() => { setMoreOpen(false); setAllFixed(!allLocked) }}>
                        {allLocked ? 'Unlock all widgets' : 'Lock all widgets'}
                      </MenuItem>
                    )}
                    <MenuItem icon={Sparkles} onClick={() => { setMoreOpen(false); setSuggestOpen(true) }}>
                      Suggest widgets
                    </MenuItem>
                    {published && !dirty && (
                      <MenuItem icon={RotateCcw} onClick={() => { setMoreOpen(false); setPublishOpen(true) }}>
                        Re-publish
                      </MenuItem>
                    )}
                  </PopoverPanel>
                )}
              </div>
              <Button variant="secondary" onClick={() => setShareOpen(true)}>Share</Button>
              {(!published || dirty) && (
                <Button variant="primary" onClick={() => setPublishOpen(true)} title="Publish so this is visible to its audience">
                  {published ? 'Publish changes' : 'Publish'}
                </Button>
              )}
            </>
          ) : null
        }
      />

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-auto px-6 py-4">
          {entityHeaderApplies(dashboard?.placement) && <EntityContextHeader placement={dashboard.placement} />}

          {placements.length === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AddWidgetCard onClick={() => setAddOpen(true)} />
              <div className="flex items-center sm:col-span-1 lg:col-span-2">
                <Button variant="secondary" onClick={() => setSuggestOpen(true)}>
                  <Sparkles size={15} aria-hidden="true" /> Suggest widgets
                </Button>
              </div>
            </div>
          ) : (
            <>
            {!tipDismissed && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-[11px] text-gray-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                <Move size={13} aria-hidden="true" className="shrink-0 text-aims-blue" />
                <span className="flex-1">
                  <span className="font-medium text-gray-700 dark:text-slate-200">Drag</span> a tile to reorder, or drag its <span className="font-medium text-gray-700 dark:text-slate-200">bottom-right corner</span> to resize. Keyboard: focus a tile, then its grip or resize handle, and use the arrow keys.
                </span>
                <button onClick={() => setTipDismissed(true)} aria-label="Dismiss tip" className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:hover:bg-white/10">
                  <X size={13} aria-hidden="true" />
                </button>
              </div>
            )}
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
                  onMove={movePlacement}
                  onDragStart={() => setDragPid(p.pid)}
                  onDragEnd={() => setDragPid(null)}
                  onDropOn={() => { reorder(dragPid, p.pid); setDragPid(null) }}
                />
              ))}
              <AddWidgetCard onClick={() => setAddOpen(true)} />
            </div>
            </>
          )}
        </div>

        {/* Library browser — marketplace-style picker over the widget library */}
        {addOpen && (
          <WidgetLibraryModal
            onAdd={(w, size) => placeWidget(w, size)}
            onClose={() => setAddOpen(false)}
          />
        )}

        {/* Per-widget config — hidden while the feedback slide-over (same slot) is open */}
        {selected && !feedbackWidget && (
          <SidePanel
            title="Widget settings"
            onClose={() => setSelectedPid(null)}
            footer={
              <Button
                variant="secondary"
                className="w-full text-red-600 dark:text-red-400"
                onClick={() => removePlacement(selected.pid)}
              >
                <Trash2 size={15} aria-hidden="true" /> Remove from dashboard
              </Button>
            }
          >
            <ConfigPanel
              key={selected.widgetId}
              placement={selected}
              widget={widgetById(selected.widgetId)}
              onChange={(patch) => updatePlacement(selected.pid, patch)}
              onDetail={() => setDetailWidget(widgetById(selected.widgetId))}
              onRemap={() => setRemapWidget(widgetById(selected.widgetId))}
              onFeedback={() => setFeedbackWidget(widgetById(selected.widgetId))}
              onAsk={() => setAskWidget(widgetById(selected.widgetId))}
            />
          </SidePanel>
        )}

        {/* Send feedback — absolute slide-over, so it lives inside this relative container */}
        {feedbackWidget && (
          <FeedbackPanel mode="flag" widget={feedbackWidget} entityId={null} onClose={() => setFeedbackWidget(null)} />
        )}
      </div>

      {publishOpen && dashboard && (
        <PublishModal
          dashboard={dashboard}
          placements={placements}
          widgetById={widgetById}
          onClose={() => setPublishOpen(false)}
          onPublish={() => { updateDashboard(dashboard.id, { status: 'published', dirty: false }); flashSaved() }}
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

      {/* Per-widget actions (Details / Remap / Ask AI) opened from the Widget settings panel */}
      {detailWidget && (
        <WidgetDetailModal
          widget={detailWidget}
          isAdmin
          onClose={() => setDetailWidget(null)}
          onPlace={() => { setDetailWidget(null); navigate('/dashboards') }}
          onRemap={() => { const w = detailWidget; setDetailWidget(null); setRemapWidget(w) }}
        />
      )}
      {remapWidget && (
        <RepinModal
          widget={remapWidget}
          onClose={() => setRemapWidget(null)}
          onComplete={() => updateWidget(remapWidget.id, { health: 'active' })}
        />
      )}
      {askWidget && (
        <AskDashboardModal
          name={askWidget.name}
          kind="widget"
          widgetNames={[askWidget.name]}
          onClose={() => setAskWidget(null)}
        />
      )}
    </div>
  )
}

/* ── Autosave feedback — edits persist immediately; this just confirms it ── */
function SaveIndicator({ state }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500" aria-live="polite">
      {state === 'saving' ? (
        <><RefreshCw size={11} className="animate-spin" aria-hidden="true" /> Saving…</>
      ) : (
        <><Check size={11} className="text-aims-governed" aria-hidden="true" /> All changes saved</>
      )}
    </span>
  )
}

/* ── A compact action button in the Widget settings panel ── */
function ActionBtn({ icon: Icon, accent, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/40 ${
        accent
          ? 'border-aims-blue/30 bg-aims-blue/10 text-aims-blue hover:bg-aims-blue/20'
          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-slate-100'
      }`}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </button>
  )
}

/* ── A row in the header's "⋯ More" overflow menu ── */
function MenuItem({ icon: Icon, onClick, children }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none dark:text-slate-200 dark:hover:bg-white/10 dark:focus-visible:bg-white/10"
    >
      {Icon && <Icon size={15} aria-hidden="true" className="shrink-0 text-gray-500 dark:text-slate-400" />}
      {children}
    </button>
  )
}

/* ── A dashed "Add widget" tile — browse library only ── */
function AddWidgetCard({ onClick }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 dark:border-white/15">
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-gray-700 transition-all hover:border-aims-blue/50 hover:text-aims-blue hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-aims-blue/40 dark:hover:text-aims-blue"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-100 dark:bg-white/10">
          <Plus size={16} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-medium">Browse library</span>
          <span className="block text-[11px] text-gray-400 dark:text-slate-500">Pick from your existing widgets</span>
        </span>
      </button>
    </div>
  )
}

/* ── One editable widget tile in the free grid ── */
function CanvasTile({ placement: p, widget: w, selected, dragging, onSelect, onUpdate, onMove, onDragStart, onDragEnd, onDropOn }) {
  // ?? not || — SIZE_SPAN_CLASS.sm is '' (falsy), so || would wrongly widen small tiles to md.
  const span = SIZE_SPAN_CLASS[p.size] ?? SIZE_SPAN_CLASS.md
  const current = p.viewAs || w?.skeleton
  const rec = w ? vizRecommendation(w) : null
  const suggest = rec && rec.best && rec.best !== current && !vizInterchangeable(rec.best, current) ? rec.best : null
  const stop = (e) => e.stopPropagation()
  const tileRef = useRef(null)
  const resizingRef = useRef(false) // synchronous guard so the native drag never starts mid-resize
  const [resizing, setResizing] = useState(false)

  // Hover → press the corner handle → drag right/left to grow/shrink. Snaps to the grid
  // column the pointer is over (1/2/3 → sm/md/lg) so the placed widget matches consume view.
  function startResize(e) {
    if (p.fixed) return
    e.preventDefault(); e.stopPropagation()
    resizingRef.current = true
    setResizing(true)
    const tile = tileRef.current
    const grid = tile.parentElement
    const cols = gridColsAtViewport()
    const gridWidth = grid.getBoundingClientRect().width
    const colWidth = (gridWidth - GRID_GAP * (cols - 1)) / cols
    const left = tile.getBoundingClientRect().left
    let lastSize = p.size
    const onMove = (ev) => {
      const desired = ev.clientX - left
      const rawSpan = Math.round((desired + GRID_GAP) / (colWidth + GRID_GAP))
      const targetSpan = Math.max(1, Math.min(cols, rawSpan))
      const size = SIZE_FOR_SPAN[targetSpan]
      if (size && size !== lastSize) { lastSize = size; onUpdate(p.pid, { size }) }
    }
    const onUp = () => {
      resizingRef.current = false
      setResizing(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    document.body.style.cursor = 'nwse-resize'
  }

  // Keyboard resize: step the size up/down, clamped to the columns this viewport renders.
  function stepSize(delta) {
    if (p.fixed) return
    const maxIdx = Math.min(SIZE_ORDER.length, gridColsAtViewport()) - 1
    const idx = Math.max(0, Math.min(maxIdx, SIZE_ORDER.indexOf(p.size) + delta))
    const next = SIZE_ORDER[idx]
    if (next && next !== p.size) onUpdate(p.pid, { size: next })
  }
  const sizeIdx = SIZE_ORDER.indexOf(p.size)

  return (
    <div
      ref={tileRef}
      role="button"
      tabIndex={0}
      draggable={!resizing}
      onDragStart={(e) => { if (resizingRef.current) { e.preventDefault(); return } onDragStart() }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDropOn() }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      aria-label={`Configure ${w?.name || 'widget'}`}
      className={`group relative rounded-lg border bg-white p-2.5 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:bg-[#131a2c] ${span} ${dragging ? 'opacity-50' : ''} ${
        resizing ? 'border-aims-blue ring-2 ring-aims-blue/40' : selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : 'border-gray-200 dark:border-white/10'
      }`}
    >
      {/* Drag-resize handle (bottom-right corner) — hover/focus to reveal; hidden when locked */}
      {!p.fixed && (
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Resize ${w?.name || 'widget'}`}
          aria-valuemin={0}
          aria-valuemax={Math.min(SIZE_ORDER.length, gridColsAtViewport()) - 1}
          aria-valuenow={sizeIdx}
          aria-valuetext={WIDGET_SIZES.find((s) => s.id === p.size)?.label || p.size}
          title="Drag, or focus and use arrow keys, to resize"
          draggable={false}
          onPointerDown={startResize}
          onClick={stop}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); stepSize(1) }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); stepSize(-1) }
            else if (e.key === 'Home') { e.preventDefault(); e.stopPropagation(); stepSize(-SIZE_ORDER.length) }
            else if (e.key === 'End') { e.preventDefault(); e.stopPropagation(); stepSize(SIZE_ORDER.length) }
            else if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation() } // don't fall through to tile-select
          }}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          className={`absolute bottom-0 right-0 z-10 grid h-6 w-6 cursor-nwse-resize place-items-center rounded-tl-md rounded-br-lg text-gray-400 transition-opacity hover:text-aims-blue focus-visible:opacity-100 focus-visible:text-aims-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:text-slate-500 ${
            resizing ? 'opacity-100 text-aims-blue' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M10 2 L2 10 M10 6 L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-1 pr-10">
        <button
          type="button"
          aria-label={`Reorder ${w?.name || 'widget'} — use arrow keys`}
          title="Drag, or focus and use arrow keys, to reorder"
          onClick={stop}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); onMove(p.pid, -1) }
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); onMove(p.pid, 1) }
            else if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation() } // grip isn't an action; don't select the tile
          }}
          className="shrink-0 cursor-grab rounded text-gray-300 hover:text-gray-500 focus-visible:text-aims-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 group-hover:text-gray-400 dark:text-slate-600"
        >
          <GripVertical size={13} aria-hidden="true" />
        </button>
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

/* ── Config panel body (placement-level: size, fixed/flexible, audience, quick actions) ── */
function ConfigPanel({ placement, widget, onChange, onDetail, onRemap, onFeedback, onAsk }) {
  function toggleQuickAction(qa) {
    const has = placement.quickActions.includes(qa)
    onChange({ quickActions: has ? placement.quickActions.filter((x) => x !== qa) : [...placement.quickActions, qa] })
  }
  const allowedAudiences = placementAudiences(placement)
  return (
    <div className="space-y-5">
      <div>
        {/* Name is read-only here — it's part of the widget definition (set at creation;
            change it via Details / the Widget Builder, not in the placement panel). */}
        <div className="truncate font-semibold text-gray-900 dark:text-slate-100">{widget?.name}</div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <GovernedBadge governed={!!widget?.governed} />
          {widget?.freshness && <FreshnessBadge status={widget.freshness} label={widget.freshness} />}
        </div>

        {/* Per-widget actions — act on the widget itself, not just its placement */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <ActionBtn icon={Info} onClick={onDetail}>Details</ActionBtn>
          <ActionBtn icon={RefreshCw} onClick={onRemap}>Remap source</ActionBtn>
          <ActionBtn icon={Flag} onClick={onFeedback}>Send feedback</ActionBtn>
          <ActionBtn icon={Sparkles} accent onClick={onAsk}>Ask AI</ActionBtn>
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
