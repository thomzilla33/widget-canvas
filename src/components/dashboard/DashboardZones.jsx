import { Lock, Maximize2 } from 'lucide-react'
import { EmptyState, FreshnessBadge, DataPlaneBadge, EnvironmentBadge } from '../common/index.jsx'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { dashboardLayout, VIEW_ZONES } from '../../data/layout.js'
import { audienceVisibleTo, ALL_AUDIENCES } from '../../data/audiences.js'
import { dataPlaneOf, freshnessState } from '../../data/governance.js'

// Per-size column span — same responsive caps as the canvas (no overflow).
const SIZE_SPAN_CLASS = { sm: '', md: 'sm:col-span-2', lg: 'sm:col-span-2 lg:col-span-3' }

// Read-only render of a dashboard's zones + real widgets. Used by the dashboard
// view page and inside the profile (UCP) tabs — the consumption side of placement.
// `scope` (date range + filters) is threaded into each widget's sample so the
// board responds to the consumption controls. `onDrill(widget)` makes each card
// clickable to open the drill-down (omitted on surfaces without it, e.g. UCP).
export default function DashboardZones({ dashboard, scope, onDrill, viewerRole }) {
  const { widgets } = useWidgets()
  const byId = (id) => widgets.find((w) => w.id === id)
  const layout = dashboardLayout(dashboard)
  // Filter by the "view as" role — empty restriction or admin/all sees everything.
  const filtered = {}
  for (const k of Object.keys(layout)) filtered[k] = (layout[k] || []).filter((p) => audienceVisibleTo(p, viewerRole))
  const zones = VIEW_ZONES.filter((z) => filtered[z.key]?.length)
  const roleScoped = viewerRole && viewerRole !== ALL_AUDIENCES
  const anyWidgets = Object.values(layout).some((a) => a.length)

  if (!zones.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10">
        {roleScoped && anyWidgets ? (
          <EmptyState
            icon="🔒"
            title={`Nothing visible for ${viewerRole}`}
            description="Every widget on this dashboard is restricted to other audiences."
          />
        ) : (
          <EmptyState
            icon="📊"
            title="This dashboard is empty"
            description="Add widgets to start building this dashboard."
          />
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-4">
      {zones.map((z) => (
        <div key={z.key} className={`col-span-1 ${z.span}`}>
          {z.key === 'header' ? (
            // KPIs tile evenly across the full header width — no trailing gap.
            <div className="grid h-full gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px,100%), 1fr))' }}>
              {filtered.header.map((p, i) => renderCard(p, i, z.key, '', byId, scope, onDrill))}
            </div>
          ) : (
            <div
              className={`grid h-full auto-rows-fr gap-3 ${
                z.key === 'sidebar' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filtered[z.key].map((p, i) =>
                renderCard(p, i, z.key, z.key === 'sidebar' ? '' : SIZE_SPAN_CLASS[p.size] || 'sm:col-span-2', byId, scope, onDrill),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function renderCard(p, i, zoneKey, span, byId, scope, onDrill) {
  const key = p.pid ?? `${zoneKey}-${i}`
  const w = byId(p.widgetId)
  if (!w) {
    return (
      <div
        key={key}
        className={`card grid h-full min-h-[96px] place-items-center p-3 text-center text-[11px] text-gray-500 dark:text-slate-400 ${span}`}
      >
        This widget was removed from the catalog.
      </div>
    )
  }
  const plane = dataPlaneOf(w)
  const fresh = freshnessState(w)
  const inner = (
    <>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-xs font-semibold text-gray-900 dark:text-slate-100" title={w?.name || 'Widget'}>
          {w?.name || 'Widget'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {onDrill && <Maximize2 size={12} aria-hidden="true" className="text-gray-300 transition-colors group-hover:text-aims-blue dark:text-slate-600" />}
          {p.fixed && <Lock size={12} aria-hidden="true" className="text-gray-500 dark:text-slate-400" />}
        </div>
      </div>
      <div className="mt-2 flex flex-1 flex-col justify-center">
        <WidgetRender widget={w} size={p.size} scope={scope} viewAs={p.viewAs} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-1.5 dark:border-white/5">
        <FreshnessBadge status={fresh.tone} label={fresh.label} />
        <DataPlaneBadge plane={plane} />
        <EnvironmentBadge env={scope?.env} />
      </div>
    </>
  )
  if (onDrill) {
    return (
      <button
        key={key}
        type="button"
        onClick={() => onDrill(w)}
        aria-label={`Open ${w?.name || 'widget'} details`}
        className={`card group flex h-full flex-col p-3 text-left transition-colors hover:border-aims-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 ${span}`}
      >
        {inner}
      </button>
    )
  }
  return (
    <div key={key} className={`card flex h-full flex-col p-3 ${span}`}>
      {inner}
    </div>
  )
}
