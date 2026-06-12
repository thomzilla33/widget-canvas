import { Lock } from 'lucide-react'
import { FreshnessBadge } from '../common/index.jsx'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { dashboardLayout, VIEW_ZONES } from '../../data/layout.js'

// Per-size column span — same responsive caps as the canvas (no overflow).
const SIZE_SPAN_CLASS = { sm: '', md: 'sm:col-span-2', lg: 'sm:col-span-2 lg:col-span-3' }

// Read-only render of a dashboard's zones + real widgets. Used by the dashboard
// view page and inside the profile (UCP) tabs — the consumption side of placement.
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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {zones.map((z) => (
        <div key={z.key} className={`col-span-1 ${z.span}`}>
          <div className={`grid gap-3 ${z.key === 'sidebar' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {layout[z.key].map((p) => {
              const w = byId(p.widgetId)
              const span = z.key === 'sidebar' ? '' : SIZE_SPAN_CLASS[p.size] || 'sm:col-span-2'
              return (
                <div key={p.pid} className={`card p-3 ${span}`}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-gray-900 dark:text-slate-100">{w?.name || 'Widget'}</span>
                    {p.fixed && <Lock size={12} className="shrink-0 text-gray-400 dark:text-slate-500" />}
                  </div>
                  <div className="mt-2">
                    <WidgetRender widget={w} size={p.size} />
                  </div>
                  {w?.freshness && (
                    <div className="mt-2 border-t border-gray-100 pt-1.5 dark:border-white/5">
                      <FreshnessBadge status={w.freshness} label={w.freshness} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
