import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Flag, Store } from 'lucide-react'
import { PageHeader, HealthBadge, FreshnessBadge, EmptyState, DataPlaneBadge } from '../components/common/index.jsx'
import { dataPlaneOf } from '../data/governance.js'
import { WidgetGlyph } from '../components/widgets/glyph.jsx'
import WidgetRender from '../components/widgets/WidgetRender.jsx'
import RepinModal from '../components/widgets/RepinModal.jsx'
import FlagDetailModal from '../components/widgets/FlagDetailModal.jsx'
import WidgetMarketplace from '../components/widgets/WidgetMarketplace.jsx'
import SourceTemplatesBanner from '../components/widgets/SourceTemplatesBanner.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { useFeedback } from '../state/FeedbackContext.jsx'
import { entities, SCHEMA_DRIFT, CATALOG_CATEGORIES } from '../data/mock.js'

// Action-oriented hint per flag reason, shown when there's no concrete
// schema-drift fix to perform (the descriptive line tells the user what to do).
const FIX_HINT = {
  'Wrong number': 'verify the calculation with the data owner',
  'Stale / outdated': 're-pin the widget to restore freshness',
  'Wrong records shown': 'review the record filter and scope',
  'Missing data': 're-pin to remap the missing fields',
  Other: 'review and resolve',
}

// S37–S47 catalog + health · S121–S123 Needs Attention / flag resolution
export default function WidgetLibrary() {
  const navigate = useNavigate()
  const { widgets, updateWidget } = useWidgets()
  const { isAdmin } = useRole()
  const { flags, resolveFlag } = useFeedback()
  const [cat, setCat] = useState('All') // primary axis: category (chips)
  const [type, setType] = useState('All') // secondary axis: tile type (select)
  const [search, setSearch] = useState('')
  const [repinWidget, setRepinWidget] = useState(null)
  const [detailFlag, setDetailFlag] = useState(null)
  const [marketplace, setMarketplace] = useState(false)

  // Chips filter by Category (the catalog's grouping); the long tile-type axis is a select.
  const cats = ['All', ...CATALOG_CATEGORIES]
  const types = ['All', ...Array.from(new Set(widgets.map((w) => w.skeleton)))]
  const shown = widgets.filter(
    (w) =>
      (cat === 'All' || w.category === cat) &&
      (type === 'All' || w.skeleton === type) &&
      (!search || w.name.toLowerCase().includes(search.toLowerCase())),
  )
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

      {/* Filters (matches .filters / .chip) */}
      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="relative w-full sm:w-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" />
          <input
            className="input h-9 w-full sm:w-52 pl-8"
            placeholder="Search widgets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`h-7 rounded-full border px-3 text-xs font-semibold transition-colors ${
                cat === c
                  ? 'border-aims-blue/40 bg-aims-blue/10 text-aims-blue'
                  : 'border-gray-300 text-gray-500 hover:text-gray-700 dark:border-white/15 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <span className="mx-1 hidden h-5 w-px bg-gray-200 sm:block dark:bg-white/10" aria-hidden="true" />

        {/* Secondary axis: tile type (the long list moved out of chips into a select) */}
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <span className="font-medium">Type</span>
          <select
            className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by tile type"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All types' : t}
              </option>
            ))}
          </select>
        </label>
      </div>

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
                  ? `${n} field${n === 1 ? '' : 's'} changed in ${drift.source} (${drift.changedOn}) — re-pin to restore this widget.`
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
                        Re-pin widget
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
              onClick={() => (w.health === 'review' ? setRepinWidget(w) : navigate('/widgets/new'))}
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
                <span className={`cap-chip ${w.governed ? 'cap-chip-data' : 'cap-chip-tool'}`}>
                  {w.governed ? 'Governed' : 'Ungoverned'}
                </span>
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
                    ? 'Re-pin needed →'
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

      {marketplace && <WidgetMarketplace onClose={() => setMarketplace(false)} />}
    </div>
  )
}
