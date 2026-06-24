import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, Sparkles, MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import { PopoverPanel } from '../components/common/Popover.jsx'
import { PageHeader, HealthBadge, FreshnessBadge, EmptyState, DataPlaneBadge } from '../components/common/index.jsx'
import { dataPlaneOf } from '../data/governance.js'
import { WidgetGlyph } from '../components/widgets/glyph.jsx'
import WidgetRender from '../components/widgets/WidgetRender.jsx'
import RepinModal from '../components/widgets/RepinModal.jsx'
import FlagDetailModal from '../components/widgets/FlagDetailModal.jsx'
import WidgetDetailModal from '../components/widgets/WidgetDetailModal.jsx'
import EditWidgetModal from '../components/widgets/EditWidgetModal.jsx'
import DeleteWidgetDialog from '../components/widgets/DeleteWidgetDialog.jsx'
import WidgetMarketplace from '../components/widgets/WidgetMarketplace.jsx'
import AIGenerateModal from '../components/ai/AIGenerateModal.jsx'
import { useStaggerReveal } from '../hooks/useReveal.js'
import SourceTemplatesBanner from '../components/widgets/SourceTemplatesBanner.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { useFeedback } from '../state/FeedbackContext.jsx'
import { dashboardLayout } from '../data/layout.js'
import { entities, SCHEMA_DRIFT, CATALOG_CATEGORIES } from '../data/mock.js'

// Action-oriented hint per flag reason, shown when there's no concrete
// schema-drift fix to perform (the descriptive line tells the user what to do).
const FIX_HINT = {
  'Wrong number': 'verify the calculation with the data owner',
  'Stale / outdated': 'remap the widget to restore freshness',
  'Wrong records shown': 'review the record filter and scope',
  'Missing data': 'remap the missing fields',
  Other: 'review and resolve',
}

// S37–S47 catalog + health · S121–S123 Needs Attention / flag resolution
export default function WidgetLibrary() {
  const navigate = useNavigate()
  const { widgets, updateWidget, removeWidget } = useWidgets()
  const { dashboards, updateDashboard } = useDashboards()
  const { isAdmin } = useRole()
  const { flags, resolveFlag } = useFeedback()

  // Live "used on N dashboards" tally from resolved layouts (template seed OR
  // persisted edits) — the single source of truth shared with the detail modal.
  const usageById = useMemo(() => {
    const m = {}
    dashboards.forEach((d) => {
      const ids = new Set(dashboardLayout(d).map((p) => p.widgetId))
      ids.forEach((wid) => { m[wid] = (m[wid] || 0) + 1 })
    })
    return m
  }, [dashboards])
  const [cat, setCat] = useState('All') // category
  const [type, setType] = useState('All') // tile type
  const [fresh, setFresh] = useState('All') // freshness state
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [repinWidget, setRepinWidget] = useState(null)
  const [detailFlag, setDetailFlag] = useState(null)
  const [detailWidget, setDetailWidget] = useState(null) // Tier 2 — widget detail (not the builder)
  const [editWidget, setEditWidget] = useState(null) // CRUD U — edit safe fields
  const [deletingWidget, setDeletingWidget] = useState(null) // CRUD D — staged delete dialog
  const [menuId, setMenuId] = useState(null) // per-card ⋯ actions menu (by widget id)
  const [marketplace, setMarketplace] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const gridReveal = useStaggerReveal('widgets')

  const catOptions = [{ value: 'All', label: 'All categories' }, ...CATALOG_CATEGORIES.map((c) => ({ value: c, label: c }))]
  const typeOptions = [{ value: 'All', label: 'All types' }, ...Array.from(new Set(widgets.map((w) => w.skeleton))).map((t) => ({ value: t, label: t }))]
  const freshOptions = [
    { value: 'All', label: 'All freshness' },
    ...Array.from(new Set(widgets.map((w) => w.freshness).filter(Boolean))).map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) })),
  ]
  const shown = widgets
    .filter(
      (w) =>
        (cat === 'All' || w.category === cat) &&
        (type === 'All' || w.skeleton === type) &&
        (fresh === 'All' || w.freshness === fresh) &&
        (!search || w.name.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      const d = sortBy === 'usage' ? (a.usedIn || 0) - (b.usedIn || 0) : a.name.localeCompare(b.name)
      return sortDir === 'asc' ? d : -d
    })
  const governedCount = widgets.filter((w) => w.governed).length
  const openFlags = flags.filter((f) => f.status === 'open')
  const widgetById = (id) => widgets.find((w) => w.id === id)
  const entityById = (id) => entities.find((e) => e.id === id)

  return (
    <div className="h-full overflow-auto">
      <div className="px-6 pt-4">
        <StudioWelcome
          studioId="widgets"
          built={{ count: widgets.length, label: 'widgets' }}
          ctaLabel={isAdmin ? 'Create widget' : undefined}
          onCta={isAdmin ? () => navigate('/widgets/new') : undefined}
        />
      </div>
      <PageHeader
        title="Widget Library"
        description={`${widgets.length} widgets · ${governedCount} governed`}
        actions={
          isAdmin ? (
            <button className="btn-primary" onClick={() => navigate('/widgets/new')}>
              <Sparkles size={15} /> Create widget
            </button>
          ) : null
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search widgets…"
        filters={[
          { id: 'cat', label: 'Category', value: cat, onChange: setCat, options: catOptions },
          { id: 'type', label: 'Type', value: type, onChange: setType, options: typeOptions },
          { id: 'fresh', label: 'Freshness', value: fresh, onChange: setFresh, options: freshOptions },
        ]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [{ value: 'name', label: 'Name' }, { value: 'usage', label: 'Most used' }],
          dir: sortDir,
          onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
        }}
      />

      <div className="px-6 py-4">
        {/* U4 — per-source templates from connected integrations (admin installs) */}
        {isAdmin && <SourceTemplatesBanner />}
        {/* S121 — Needs Attention (flags from end users) */}
        {openFlags.length > 0 && (
          <div className="mb-5 rounded-xl border border-aims-stale/30 bg-red-50/60 p-4 dark:bg-red-500/5">
            <div className="mb-2.5 flex items-center gap-2">
              <Flag size={15} className="text-aims-stale" />
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Needs attention</span>
              <span className="cap-chip cap-chip-neutral">{openFlags.length}</span>
            </div>
            <div className="space-y-2">
              {openFlags.map((f) => {
                const w = widgetById(f.widgetId)
                const drift = SCHEMA_DRIFT[f.widgetId]
                const canRepin = Boolean(drift && w)
                const n = drift?.broken?.length || 0
                const problem = drift
                  ? `${n} field${n === 1 ? '' : 's'} changed in ${drift.source} (${drift.changedOn}) — remap to restore this widget.`
                  : `${f.details || 'Flagged for review'}${FIX_HINT[f.reason] ? ` — ${FIX_HINT[f.reason]}.` : ''}`
                return (
                  <div
                    key={f.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-lg border border-gray-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#131a2c]"
                  >
                    <WidgetGlyph skeleton={w?.skeleton || 'KPI'} sm />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {w?.name || f.widgetId}
                        </span>
                        <span className="cap-chip cap-chip-tool shrink-0">{f.reason}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600 dark:text-slate-300">{problem}</div>
                      <div className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-slate-400">
                        Flagged by {f.reporter} on {entityById(f.entityId)?.name || f.entityId} · {f.createdAt}
                      </div>
                    </div>
                    {canRepin ? (
                      <button className="btn-primary !py-1.5 !px-3 text-xs shrink-0" onClick={() => setRepinWidget(w)}>
                        Remap widget
                      </button>
                    ) : (
                      <button className="btn-secondary !py-1.5 !px-3 text-xs shrink-0" onClick={() => setDetailFlag(f)}>
                        Review &amp; resolve
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {shown.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No widgets found"
            description="Try adjusting your search or category filter."
          />
        ) : (
        <div ref={gridReveal} className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(264px,100%),1fr))' }}>
          {shown.map((w) => {
            const open = () => (w.health === 'review' ? setRepinWidget(w) : setDetailWidget(w))
            return (
            // Not a <button>: the live preview renders interactive system widgets whose
            // own buttons can't legally nest inside one. role=button + keydown keeps it
            // keyboard-accessible.
            <div
              key={w.id}
              role="button"
              tabIndex={0}
              onClick={(e) => { if (e.target === e.currentTarget || !e.target.closest('button')) open() }}
              onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open() } }}
              className="catalog-card min-h-[240px] cursor-pointer text-left"
            >
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <HealthBadge health={w.health} />
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuId(menuId === w.id ? null : w.id) }}
                      aria-label={`Actions for ${w.name}`}
                      aria-haspopup="menu"
                      aria-expanded={menuId === w.id}
                      className="grid h-6 w-6 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    >
                      <MoreHorizontal size={15} aria-hidden="true" />
                    </button>
                    {menuId === w.id && (
                      <PopoverPanel onClose={() => setMenuId(null)} align="right" className="w-44 p-1.5">
                        <CardMenuItem icon={Plus} onClick={(e) => { e.stopPropagation(); setMenuId(null); navigate('/dashboards') }}>Add to a dashboard</CardMenuItem>
                        {!w.system && (
                          <CardMenuItem icon={Pencil} onClick={(e) => { e.stopPropagation(); setMenuId(null); setEditWidget(w) }}>Edit</CardMenuItem>
                        )}
                        {!w.system && (
                          <CardMenuItem icon={Trash2} danger onClick={(e) => { e.stopPropagation(); setMenuId(null); setDeletingWidget(w) }}>Delete</CardMenuItem>
                        )}
                      </PopoverPanel>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <WidgetGlyph skeleton={w.skeleton} />
                <div className={`min-w-0 ${isAdmin ? 'pr-24' : 'pr-16'}`}>
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {w.name}
                  </div>
                  <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{w.source}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="cap-chip cap-chip-neutral">{w.skeleton}</span>
                {/* Deviation-only: flag Ungoverned (governed is the expected default). */}
                {!w.governed && <span className="cap-chip cap-chip-tool">Ungoverned</span>}
                <DataPlaneBadge plane={dataPlaneOf(w)} />
              </div>

              {/* Live preview of what the widget shows */}
              <div className="surface-sunken pointer-events-none h-[64px] overflow-hidden rounded-md px-2 py-1.5">
                <WidgetRender widget={w} size="sm" />
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                <span
                  className={`text-[11px] ${
                    w.health === 'review'
                      ? 'font-semibold text-aims-stale'
                      : 'text-gray-500 dark:text-slate-400'
                  }`}
                >
                  {w.health === 'review'
                    ? 'Remap needed →'
                    : `Used on ${usageById[w.id] || 0} dashboard${(usageById[w.id] || 0) === 1 ? '' : 's'}`}
                </span>
                <FreshnessBadge status={w.freshness} label={w.freshness} />
              </div>
            </div>
            )
          })}
        </div>
        )}
      </div>

      {repinWidget && (
        <RepinModal
          widget={repinWidget}
          onClose={() => setRepinWidget(null)}
          onComplete={() => updateWidget(repinWidget.id, { health: 'active' })}
        />
      )}

      {detailFlag && (
        <FlagDetailModal
          flag={detailFlag}
          widget={widgetById(detailFlag.widgetId)}
          entity={entityById(detailFlag.entityId)}
          onClose={() => setDetailFlag(null)}
          onResolve={() => resolveFlag(detailFlag.id)}
        />
      )}

      {detailWidget && (
        <WidgetDetailModal
          widget={detailWidget}
          isAdmin={isAdmin}
          onClose={() => setDetailWidget(null)}
          onPlace={() => { setDetailWidget(null); navigate('/dashboards') }}
          onRemap={() => { const w = detailWidget; setDetailWidget(null); setRepinWidget(w) }}
          onDelete={(w) => { setDetailWidget(null); setDeletingWidget(w) }}
          onEdit={() => { const w = detailWidget; setDetailWidget(null); setEditWidget(w) }}
          onOpenDashboard={(id) => { setDetailWidget(null); navigate(`/dashboard/${id}`) }}
        />
      )}

      {editWidget && <EditWidgetModal widget={editWidget} onClose={() => setEditWidget(null)} />}

      {deletingWidget && (
        <DeleteWidgetDialog
          widget={deletingWidget}
          usedOn={dashboards.filter((d) => dashboardLayout(d).some((p) => p.widgetId === deletingWidget.id))}
          onClose={() => setDeletingWidget(null)}
          onConfirm={() => {
            // Cascade: strip the widget from every dashboard that hosts it, then drop it.
            dashboards
              .filter((d) => dashboardLayout(d).some((p) => p.widgetId === deletingWidget.id))
              .forEach((d) => {
                const layout = dashboardLayout(d).filter((p) => p.widgetId !== deletingWidget.id)
                updateDashboard(d.id, { layout, widgets: layout.length })
              })
            removeWidget(deletingWidget.id)
            setDeletingWidget(null)
          }}
        />
      )}

      {marketplace && <WidgetMarketplace onClose={() => setMarketplace(false)} />}


      {aiOpen && <AIGenerateModal mode="widget" onClose={() => setAiOpen(false)} />}
    </div>
  )
}

// Row in the per-card ⋯ actions menu. `danger` tints destructive items red.
function CardMenuItem({ icon: Icon, danger, onClick, children }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10'
      }`}
    >
      <Icon size={14} aria-hidden="true" /> {children}
    </button>
  )
}
