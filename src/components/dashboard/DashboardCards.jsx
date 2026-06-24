import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, MapPin } from 'lucide-react'
import { Badge } from '../common/index.jsx'
import { CardContainer } from '@/components/ui/CardContainer'
import { placementLabel } from '../../data/mock.js'
import { widgetCount } from '../../data/layout.js'
import { audienceLabel } from '../../data/audiences.js'

// Reusable grid of dashboard cards that open the read-only view. Shared by the
// Reports and Home consumption pages.
export default function DashboardCards({ items }) {
  const navigate = useNavigate()
  if (!items.length) {
    return <p className="text-sm text-gray-500 dark:text-slate-400">No dashboards here yet.</p>
  }
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
      {items.map((d) => (
        <CardContainer key={d.id} onClick={() => navigate(`/dashboard/${d.id}`)} size="sm" className="min-h-[120px] flex flex-col gap-2.5 text-left !p-4 !rounded-xl">
          <div className="absolute right-3 top-3">
            <Badge variant={d.status} />
          </div>
          <div className="flex items-center gap-3">
            <span className="logo-sq" style={{ background: 'var(--grad)' }}>
              <LayoutDashboard size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              {/* only the title clears the absolute status badge */}
              <div className="truncate pr-20 text-sm font-semibold text-gray-900 dark:text-slate-100">{d.name}</div>
              <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                <MapPin size={11} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{placementLabel(d.placement)}</span>
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
            <span className="text-[11px] text-gray-500 dark:text-slate-400">{widgetCount(d)} widgets · {audienceLabel(d.audience)}</span>
            <span className="text-[11px] text-gray-500 dark:text-slate-400">{d.updated}</span>
          </div>
        </CardContainer>
      ))}
    </div>
  )
}
