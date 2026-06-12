import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search } from 'lucide-react'
import { PageHeader, Badge } from '../components/common/index.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'

const STATUS_FILTERS = ['All', 'Published', 'Draft', 'Pending']

// S76–S79 — dashboard list with search + status filter
export default function DashboardList() {
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const publishedCount = dashboards.filter((d) => d.status === 'published').length
  const shown = dashboards.filter((d) => {
    const matchStatus = status === 'All' || d.status === status.toLowerCase()
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Dashboards"
        description={`${dashboards.length} dashboards · ${publishedCount} published`}
        actions={
          <button className="btn-primary" onClick={() => navigate('/dashboard/new')}>
            + New dashboard
          </button>
        }
      />

      {/* Filters (S78) */}
      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            className="input h-9 w-52 pl-8"
            placeholder="Search dashboards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setStatus(c)}
              className={`h-7 rounded-full border px-3 text-xs font-semibold transition-colors ${
                status === c
                  ? 'border-aims-blue/40 bg-aims-blue/10 text-aims-blue'
                  : 'border-gray-300 text-gray-500 hover:text-gray-700 dark:border-white/15 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {shown.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500">No dashboards match your filters.</p>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {shown.map((d) => (
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
        )}
        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S76–S79</p>
      </div>
    </div>
  )
}
