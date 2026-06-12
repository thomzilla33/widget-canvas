import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, ChevronLeft, MapPin } from 'lucide-react'
import { PageHeader, Badge } from '../components/common/index.jsx'
import DashboardZones from '../components/dashboard/DashboardZones.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { placementLabel } from '../data/mock.js'

// Read-only consumption view of a dashboard (vs the /canvas editor).
export default function DashboardViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  const dashboard = dashboards.find((d) => d.id === id)

  if (!dashboard) {
    return (
      <div className="h-full grid place-items-center px-6 text-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">This dashboard doesn’t exist.</p>
          <button className="btn-secondary mt-3" onClick={() => navigate('/dashboards')}>
            <ChevronLeft size={15} /> Back to dashboards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={dashboard.name}
        description={`${dashboard.entity} · ${dashboard.audience} · Owner ${dashboard.owner || '—'}`}
        actions={
          <>
            <Badge variant={dashboard.status} />
            <button className="btn-primary" onClick={() => navigate(`/dashboard/${dashboard.id}/canvas`)}>
              <Pencil size={15} /> Edit
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] px-6 py-5 lg:px-8 2xl:px-12">
          <div className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <MapPin size={12} className="shrink-0" />
            <span>{placementLabel(dashboard.placement)}</span>
          </div>
          <DashboardZones dashboard={dashboard} />
        </div>
      </div>
    </div>
  )
}
