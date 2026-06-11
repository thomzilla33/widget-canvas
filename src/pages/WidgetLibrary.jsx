import { useNavigate } from 'react-router-dom'
import { PageHeader, HealthBadge, GovernedBadge, FreshnessBadge } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'

// S37, S38, S40–S47 — catalog + health signals
export default function WidgetLibrary() {
  const navigate = useNavigate()
  const { widgets } = useWidgets()
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Library"
        description="Catalog of reusable widgets with health signals."
        actions={
          <button className="btn-primary" onClick={() => navigate('/widgets/new')}>
            New widget
          </button>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((w) => (
            <div key={w.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-gray-900 dark:text-slate-100">{w.name}</span>
                <HealthBadge health={w.health} />
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                {w.skeleton} · used in {w.usedIn} dashboard{w.usedIn === 1 ? '' : 's'}
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <GovernedBadge governed={w.governed} />
                <FreshnessBadge status={w.freshness} label={w.freshness} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S37, S38, S40–S47</p>
      </div>
    </div>
  )
}
