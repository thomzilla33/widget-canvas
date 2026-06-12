import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileUp } from 'lucide-react'
import { PageHeader, Badge } from '../components/common/index.jsx'
import ImportModal from '../components/dashboard/ImportModal.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'

// S76, S77, S79 — dashboard list with tabs Created/Templates
export default function DashboardList() {
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  const [importOpen, setImportOpen] = useState(false)
  const publishedCount = dashboards.filter((d) => d.status === 'published').length

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Dashboards"
        description={`${dashboards.length} dashboards · ${publishedCount} published`}
        actions={
          <>
            <button className="btn-secondary" onClick={() => setImportOpen(true)}>
              <FileUp size={15} /> Import
            </button>
            <button className="btn-primary" onClick={() => navigate('/dashboard/new')}>
              + New dashboard
            </button>
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {dashboards.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/dashboard/${d.id}/canvas`)}
              className="catalog-card min-h-[124px]"
            >
              <div className="absolute top-3 right-3">
                <Badge variant={d.status} />
              </div>

              <div className="flex items-center gap-3">
                <span className="logo-sq" style={{ background: 'var(--grad)' }}>
                  <LayoutDashboard size={18} />
                </span>
                <div className="min-w-0 pr-24">
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {d.name}
                  </div>
                  <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">
                    {d.entity} · {d.audience}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                <span className="text-[11px] text-gray-500 dark:text-slate-400">{d.widgets} widgets</span>
                <span className="text-[11px] text-gray-400 dark:text-slate-500">{d.updated}</span>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S76, S77, S79</p>
      </div>

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </div>
  )
}
