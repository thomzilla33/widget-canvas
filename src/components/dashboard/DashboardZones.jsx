import { Lock } from 'lucide-react'
import { FreshnessBadge } from '../common/index.jsx'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { dashboardLayout, VIEW_ZONES } from '../../data/layout.js'

// Per-size column span — same responsive caps as the canvas (no overflow).
const SIZE_SPAN_CLASS = { sm: '', md: 'sm:col-span-2', lg: 'sm:col-span-2 lg:col-span-3' }

// Read-only render of a dashboard's zones + real widgets. Used by the dashboard
// view page and inside the profile (UCP) tabs — the consumption side of placement.
// Cards stretch to fill their cell (h-full + auto-rows-fr) and the header tiles
// evenly (auto-fit) so the board fills its width/height with no empty gaps.
export default function DashboardZones({ dashboard }) {
  const { widgets } = useWidgets()
  const byId = (id) => widgets.find((w) => w.id === id)
  const layout = dashboardLayout(dashboard)
  const zones = VIEW_ZONES.filter((z) => layout[z.key]?.length)

  if (!zones.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-sm text-gray-400 dark:border-white/10 dark:text-slate-500">
        This dashboard has no widgets yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-4">
      {zones.map((z) => (
        <div key={z.key} className={`col-span-1 ${z.span}`}>
          {z.key === 'header' ? (
            // KPIs tile evenly across the full header width — no trailing gap.
            <div className="grid h-full gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {layout.header.map((p, i) => renderCard(p, i, z.key, '', byId))}
            </div>
          ) : (
            <div
              className={`grid h-full auto-rows-fr gap-3 ${
                z.key === 'sidebar' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {layout[z.key].map((p, i) =>
                renderCard(p, i, z.key, z.key === 'sidebar' ? '' : SIZE_SPAN_CLASS[p.size] || 'sm:col-span-2', byId),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function renderCard(p, i, zoneKey, span, byId) {
  const key = p.pid ?? `${zoneKey}-${i}`
  const w = byId(p.widgetId)
  if (!w) {
    return (
      <div
        key={key}
        className={`card grid h-full min-h-[96px] place-items-center p-3 text-center text-[11px] text-gray-400 dark:text-slate-500 ${span}`}
      >
        This widget was removed from the catalog.
      </div>
    )
  }
  return (
    <div key={key} className={`card flex h-full flex-col p-3 ${span}`}>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-xs font-semibold text-gray-900 dark:text-slate-100">{w?.name || 'Widget'}</span>
        {p.fixed && <Lock size={12} className="shrink-0 text-gray-400 dark:text-slate-500" />}
      </div>
      <div className="mt-2 flex flex-1 flex-col justify-center">
        <WidgetRender widget={w} size={p.size} />
      </div>
      {w?.freshness && (
        <div className="mt-2 border-t border-gray-100 pt-1.5 dark:border-white/5">
          <FreshnessBadge status={w.freshness} label={w.freshness} />
        </div>
      )}
    </div>
  )
}
