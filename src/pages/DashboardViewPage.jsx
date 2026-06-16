import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, ChevronLeft, MapPin } from 'lucide-react'
import { PageHeader, Badge } from '../components/common/index.jsx'
import DashboardZones from '../components/dashboard/DashboardZones.jsx'
import DashboardControls, { DEFAULT_SCOPE } from '../components/dashboard/DashboardControls.jsx'
import WidgetDrilldownModal from '../components/dashboard/WidgetDrilldownModal.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { placementLabel } from '../data/mock.js'
import { dashboardLayout } from '../data/layout.js'
import { AUDIENCE_OPTIONS, ALL_AUDIENCES, audienceVisibleTo } from '../data/audiences.js'

// Read-only consumption view of a dashboard (vs the /canvas editor).
export default function DashboardViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  const dashboard = dashboards.find((d) => d.id === id)
  const [scope, setScope] = useState(DEFAULT_SCOPE)
  const [drill, setDrill] = useState(null) // widget opened in the drill-down
  const [viewAs, setViewAs] = useState(ALL_AUDIENCES) // "view as role" audience preview

  const hiddenForRole =
    dashboard && viewAs !== ALL_AUDIENCES
      ? Object.values(dashboardLayout(dashboard))
          .flat()
          .filter((p) => !audienceVisibleTo(p, viewAs)).length
      : 0

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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <MapPin size={12} aria-hidden="true" className="shrink-0" />
              <span>{placementLabel(dashboard.placement)}</span>
            </div>
            <label htmlFor="view-as-select" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <span className="font-medium">Viewing as</span>
              <select
                id="view-as-select"
                className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
                value={viewAs}
                onChange={(e) => setViewAs(e.target.value)}
              >
                {AUDIENCE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a === ALL_AUDIENCES ? 'Admin (everything)' : a}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {hiddenForRole > 0 && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-aims-ungoverned">
              {hiddenForRole} widget{hiddenForRole === 1 ? '' : 's'} hidden for {viewAs}
            </div>
          )}
          <DashboardControls scope={scope} onChange={setScope} />
          <DashboardZones dashboard={dashboard} scope={scope} onDrill={setDrill} viewerRole={viewAs} />
        </div>
      </div>

      {drill && <WidgetDrilldownModal widget={drill} scope={scope} onClose={() => setDrill(null)} />}
    </div>
  )
}
