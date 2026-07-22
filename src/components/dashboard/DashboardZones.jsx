import { memo, useMemo } from 'react'
import { Lock, Maximize2 } from 'lucide-react'
import { EmptyState, FreshnessBadge, DataPlaneBadge, EnvironmentBadge, LiveBadge } from '../common/index.jsx'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { SystemCountBadge } from '../widgets/SystemWidget.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { dashboardLayout, placementDims, colsToDetail } from '../../data/layout.js'
import { audienceVisibleTo, ALL_AUDIENCES } from '../../data/audiences.js'
import { dataPlaneOf, freshnessState } from '../../data/governance.js'
import { useStaggerReveal } from '../../hooks/useReveal.js'

// Per-col-count column span class.
const COL_SPAN = { 1: '', 2: 'sm:col-span-2', 3: 'sm:col-span-2 lg:col-span-3' }

// Read-only render of a dashboard's free-form widget grid. Used by the dashboard
// view page and inside the profile (UCP) tabs — the consumption side of placement.
// `scope` (date range + filters + live tick) is threaded into each widget's sample.
// `onDrill(widget)` makes each card clickable to open the drill-down (omitted on UCP).
export default function DashboardZones({ dashboard, scope, onDrill, viewerRole }) {
  const { widgets } = useWidgets()
  const byId = (id) => widgets.find((w) => w.id === id)
  // Memoize the layout so placement objects keep a stable identity across live ticks —
  // key on the layout/template/id, not the dashboard object (which a parent re-render can
  // hand us as a fresh reference even when the layout is unchanged).
  const layout = useMemo(() => dashboardLayout(dashboard), [dashboard?.layout, dashboard?.template, dashboard?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // A scope that excludes the live tick — stable across ticks, so static tiles (which
  // get this) don't re-render every interval. Only live tiles receive the ticking scope.
  const staticKey = `${scope?.range || ''}|${Object.values(scope?.filters || {}).join(',')}|${scope?.rollup || ''}|${scope?.env || ''}`
  const staticScope = useMemo(() => scope, [staticKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter by the "view as" role — empty restriction or admin/all sees everything.
  const visible = layout.filter((p) => audienceVisibleTo(p, viewerRole))
  const roleScoped = viewerRole && viewerRole !== ALL_AUDIENCES
  // Reveal the grid on entry / dashboard / role change — NOT on live ticks (key is stable).
  const gridReveal = useStaggerReveal(`${dashboard?.id || ''}|${viewerRole || ''}`)

  if (!visible.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10">
        {roleScoped && layout.length ? (
          <EmptyState
            icon="🔒"
            title={`Nothing visible for ${viewerRole}`}
            description="Every widget on this dashboard is restricted to other audiences."
          />
        ) : (
          <EmptyState icon="📊" title="This dashboard is empty" description="Add widgets to start building this dashboard." />
        )}
      </div>
    )
  }

  return (
    <div ref={gridReveal} className="flip-grid grid auto-rows-fr grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((p, i) => {
        const w = byId(p.widgetId)
        // Live tiles get the ticking scope; everything else gets the stable one (memo bails).
        const cardScope = w?.freshness === 'live' ? scope : staticScope
        const { cols: pc } = placementDims(p)
        return <WidgetCard key={p.pid ?? i} placement={p} widget={w} span={COL_SPAN[pc] ?? ''} scope={cardScope} onDrill={onDrill} />
      })}
    </div>
  )
}

// React.memo so static tiles bail out of re-render on every live tick (their props —
// widget, span, and the stable static scope — don't change between intervals).
const WidgetCard = memo(function WidgetCard({ placement: p, widget: w, span, scope, onDrill }) {
  if (!w) {
    return (
      <div className={`card grid h-full min-h-[96px] place-items-center p-3 text-center text-[11px] text-gray-500 dark:text-slate-400 ${span}`}>
        This widget was removed from the catalog.
      </div>
    )
  }
  const plane = dataPlaneOf(w)
  const fresh = freshnessState(w)
  // System widgets are self-interactive (Approve/Reject/Complete + their own "View all"
  // modal), so they can't be wrapped in a drill <button> — that nests buttons and makes
  // every in-tile action also fire the drilldown. They render as a plain container.
  // Widgets with an in-tile unit toggle (Cost KPI, Spend Breakdown) have their own
  // buttons, so they can't be a drill <button> — render as a plain container.
  const INTERACTIVE_SKELETONS = ['Cost KPI', 'Spend Breakdown', 'Alerts']
  const drillable = onDrill && !w.system && !INTERACTIVE_SKELETONS.includes(w.skeleton)
  const inner = (
    <>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-xs font-semibold text-gray-900 dark:text-slate-100" title={w.name || 'Widget'}>
          {w.name || 'Widget'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {w.system && <SystemCountBadge id={w.id} />}
          {drillable && <Maximize2 size={12} aria-hidden="true" className="text-gray-300 transition-colors group-hover:text-aims-blue dark:text-slate-600" />}
          {p.fixed && <Lock size={12} aria-hidden="true" className="text-gray-500 dark:text-slate-400" />}
        </div>
      </div>
      <div className={`mt-2 flex flex-1 flex-col ${w.system ? 'justify-start' : 'justify-center'}`}>
        <WidgetRender widget={w} size={colsToDetail(placementDims(p).cols)} rows={placementDims(p).rows} scope={scope} viewAs={p.viewAs} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-1.5 dark:border-white/5">
        {fresh.tone === 'live' ? <LiveBadge paused={scope?.paused} /> : <FreshnessBadge status={fresh.tone} label={fresh.label} />}
        <DataPlaneBadge plane={plane} />
        <EnvironmentBadge env={scope?.env} />
      </div>
    </>
  )
  if (drillable) {
    return (
      <button
        type="button"
        onClick={() => onDrill(w)}
        aria-label={`Open ${w.name || 'widget'} details`}
        className={`card group flex h-full flex-col p-3 text-left transition-colors hover:border-aims-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 ${span}`}
      >
        {inner}
      </button>
    )
  }
  return <div className={`card flex h-full flex-col p-3 ${span}`}>{inner}</div>
})
