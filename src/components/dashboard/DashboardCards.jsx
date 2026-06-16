import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, MapPin } from 'lucide-react'
import { Badge } from '../common/index.jsx'
import { placementLabel } from '../../data/mock.js'
import { widgetCount } from '../../data/layout.js'

// Reusable grid of dashboard cards that open the read-only view. Shared by the
// Reports and Home consumption pages.
export default function DashboardCards({ items }) {
  const navigate = useNavigate()
  if (!items.length) {
    return <p className="text-sm text-gray-400 dark:text-slate-500">No dashboards here yet.</p>
  }
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
      {items.map((d) => (
        <button key={d.id} onClick={() => navigate(`/dashboard/${d.id}`)} className="catalog-card min-h-[120px]">
          <div className="absolute right-3 top-3">
            <Badge variant={d.status} />
          </div>
          <div className="flex items-center gap-3">
            <span className="logo-sq" style={{ background: 'var(--grad)' }}>
              <LayoutDashboard size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 pr-24">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{d.name}</div>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                <MapPin size={11} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{placementLabel(d.placement)}</span>
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
            <span className="text-[11px] text-gray-500 dark:text-slate-400">{widgetCount(d)} widgets · {d.audience}</span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">{d.updated}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
