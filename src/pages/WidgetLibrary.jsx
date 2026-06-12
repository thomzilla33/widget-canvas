import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Flag } from 'lucide-react'
import { PageHeader, HealthBadge, FreshnessBadge } from '../components/common/index.jsx'
import { WidgetGlyph } from '../components/widgets/glyph.jsx'
import RepinModal from '../components/widgets/RepinModal.jsx'
import FlagDetailModal from '../components/widgets/FlagDetailModal.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useFeedback } from '../state/FeedbackContext.jsx'
import { entities } from '../data/mock.js'

// S37–S47 catalog + health · S121–S123 Needs Attention / flag resolution
export default function WidgetLibrary() {
  const navigate = useNavigate()
  const { widgets, updateWidget } = useWidgets()
  const { flags, resolveFlag } = useFeedback()
  const [cat, setCat] = useState('All')
  const [repinWidget, setRepinWidget] = useState(null)
  const [detailFlag, setDetailFlag] = useState(null)

  const cats = ['All', ...Array.from(new Set(widgets.map((w) => w.skeleton)))]
  const shown = cat === 'All' ? widgets : widgets.filter((w) => w.skeleton === cat)
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
          <button className="btn-primary" onClick={() => navigate('/widgets/new')}>
            + New widget
          </button>
        }
      />

      {/* Filters (matches .filters / .chip) */}
      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input className="input h-9 w-52 pl-8" placeholder="Search widgets…" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
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
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
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
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#131a2c]"
                  >
                    <WidgetGlyph skeleton={w?.skeleton || 'KPI'} sm />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {w?.name || f.widgetId}
                      </div>
                      <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">
                        {entityById(f.entityId)?.name || f.entityId} · {f.reporter} · {f.createdAt}
                      </div>
                    </div>
                    <span className="cap-chip cap-chip-tool shrink-0">{f.reason}</span>
                    <button className="btn-secondary !py-1.5 !px-3 text-xs shrink-0" onClick={() => setDetailFlag(f)}>
                      Review
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(264px,1fr))' }}>
          {shown.map((w) => (
            <button
              key={w.id}
              onClick={() => (w.health === 'review' ? setRepinWidget(w) : navigate('/widgets/new'))}
              className="catalog-card min-h-[164px]"
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
                  <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">{w.source}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="cap-chip cap-chip-neutral">{w.skeleton}</span>
                <span className={`cap-chip ${w.governed ? 'cap-chip-data' : 'cap-chip-tool'}`}>
                  {w.governed ? 'Governed' : 'Ungoverned'}
                </span>
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
        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S37, S38, S40–S47</p>
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
    </div>
  )
}
