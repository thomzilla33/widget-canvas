import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, Store } from 'lucide-react'
import { PageHeader, HealthBadge, FreshnessBadge, EmptyState, DataPlaneBadge } from '../components/common/index.jsx'
import { dataPlaneOf } from '../data/governance.js'
import { WidgetGlyph } from '../components/widgets/glyph.jsx'
import WidgetRender from '../components/widgets/WidgetRender.jsx'
import RepinModal from '../components/widgets/RepinModal.jsx'
import FlagDetailModal from '../components/widgets/FlagDetailModal.jsx'
import WidgetDetailModal from '../components/widgets/WidgetDetailModal.jsx'
import WidgetMarketplace from '../components/widgets/WidgetMarketplace.jsx'
import SourceTemplatesBanner from '../components/widgets/SourceTemplatesBanner.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { useFeedback } from '../state/FeedbackContext.jsx'
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
  const { widgets, updateWidget } = useWidgets()
  const { isAdmin } = useRole()
  const { flags, resolveFlag } = useFeedback()
  const [cat, setCat] = useState('All') // category
  const [type, setType] = useState('All') // tile type
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [repinWidget, setRepinWidget] = useState(null)
  const [detailFlag, setDetailFlag] = useState(null)
  const [detailWidget, setDetailWidget] = useState(null) // Tier 2 — widget detail (not the builder)
  const [marketplace, setMarketplace] = useState(false)

  const catOptions = [{ value: 'All', label: 'All categories' }, ...CATALOG_CATEGORIES.map((c) => ({ value: c, label: c }))]
  const typeOptions = [{ value: 'All', label: 'All types' }, ...Array.from(new Set(widgets.map((w) => w.skeleton))).map((t) => ({ value: t, label: t }))]
  const shown = widgets
    .filter(
      (w) =>
        (cat === 'All' || w.category === cat) &&
        (type === 'All' || w.skeleton === type) &&
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
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Library"
        description={`${widgets.length} widgets · ${governedCount} governed`}
        actions={
          isAdmin ? (
            <>
              <button className="btn-secondary" onClick={() => setMarketplace(true)}>
                <Store size={15} /> Browse marketplace
              </button>
              <button className="btn-primary" onClick={() => navigate('/widgets/new')}>
                + New widget
              </button>
            </>
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
        ]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [{ value: 'name', label: 'Name' }, { value: 'usage', label: 'Most used' }],
          dir: sortDir,
          onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
        }}
      />

      <div className="flex-1 overflow-auto px-6 py-4">
        <StudioWelcome
          studioId="widgets"
          built={{ count: widgets.length, label: 'widgets' }}
          ctaLabel={isAdmin ? 'New widget' : undefined}
          onCta={isAdmin ? () => navigate('/widgets/new') : undefined}
        />
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
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(264px,100%),1fr))' }}>
          {shown.map((w) => (
            <button
              key={w.id}
              onClick={() => (w.health === 'review' ? setRepinWidget(w) : setDetailWidget(w))}
              className="catalog-card min-h-[240px]"
            >
              <div className="absolute top-3 right-3">
                <HealthBadge health={w.health} />
              </div>

              <div className="flex items-center gap-3">
                <WidgetGlyph skeleton={w.skeleton} />
                <div className="min-w-0 pr-16">
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
              <div className="pointer-events-none h-[64px] overflow-hidden rounded-md border border-gray-100 bg-gray-50/40 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.02]">
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
                    : `Used in ${w.usedIn} dashboard${w.usedIn === 1 ? '' : 's'}`}
                </span>
                <FreshnessBadge status={w.freshness} label={w.freshness} />
              </div>
            </button>
          ))}
        </div>
        )}
        <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">Screens hosted here: S37, S38, S40–S47</p>
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
          onEdit={() => { setDetailWidget(null); navigate('/widgets/new') }}
          onPlace={() => { setDetailWidget(null); navigate('/dashboards') }}
          onRemap={() => { const w = detailWidget; setDetailWidget(null); setRepinWidget(w) }}
        />
      )}

      {marketplace && <WidgetMarketplace onClose={() => setMarketplace(false)} />}
    </div>
  )
}
