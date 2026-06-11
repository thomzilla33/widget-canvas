import { useNavigate } from 'react-router-dom'
import { PageHeader, Badge } from '../components/common/index.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'

// S76, S77, S79 — dashboard list with tabs Created/Templates
export default function DashboardList() {
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Dashboards"
        description="Composable dashboards by entity and audience."
        actions={
          <button className="btn-primary" onClick={() => navigate('/dashboard/new')}>
            New dashboard
          </button>
        }
      />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/dashboard/${d.id}/canvas`)}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-gray-900 dark:text-slate-100">{d.name}</span>
                <Badge variant={d.status} />
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                {d.entity} · {d.audience}
              </div>
              <div className="mt-3 text-xs text-gray-400 dark:text-slate-500">
                {d.widgets} widgets · {d.updated}
              </div>
            </button>
          ))}
        </div>
        <p className="px-6 pb-6 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S76, S77, S79</p>
      </div>
    </div>
  )
}
