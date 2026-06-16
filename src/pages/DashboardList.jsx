import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, MapPin, UserX, RotateCcw } from 'lucide-react'
import { PageHeader, Badge, EmptyState } from '../components/common/index.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { placementLabel, DEACTIVATED_OWNERS } from '../data/mock.js'
import { widgetCount } from '../data/layout.js'

const STATUS_FILTERS = ['All', 'Published', 'Draft', 'Pending']

// S76–S79 — dashboard list with search + status filter
export default function DashboardList() {
  const navigate = useNavigate()
  const { dashboards, updateDashboard } = useDashboards()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  // Governance recovery: dashboards owned by an offboarded user need reassigning.
  const orphaned = dashboards.filter((d) => DEACTIVATED_OWNERS.includes(d.owner))
  const reassign = (id) => updateDashboard(id, { owner: 'You (admin)' })

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
        <div className="relative w-full sm:w-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            className="input h-9 w-full sm:w-52 pl-8"
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
        {orphaned.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <UserX size={15} className="text-aims-ungoverned" />
              Needs attention · {orphaned.length} dashboard{orphaned.length > 1 ? 's' : ''} with an offboarded owner
            </div>
            <div className="space-y-1.5">
              {orphaned.map((d) => (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-amber-200/70 bg-white p-2.5 dark:border-white/10 dark:bg-[#131a2c]">
                  <div className="min-w-0 flex-1">
                    <button onClick={() => navigate(`/dashboard/${d.id}/canvas`)} className="truncate text-sm font-medium text-gray-900 hover:text-aims-blue dark:text-slate-100">
                      {d.name}
                    </button>
                    <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">
                      Owner {d.owner} was offboarded · {placementLabel(d.placement)}
                    </div>
                  </div>
                  <button className="btn-secondary !py-1.5 !px-3 text-xs shrink-0" aria-label="Take ownership of this dashboard" onClick={() => reassign(d.id)}>
                    <RotateCcw size={13} /> Take ownership
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {shown.length === 0 ? (
          dashboards.length === 0 ? (
            <EmptyState
              icon="🗂️"
              title="No dashboards yet"
              description="Create your first dashboard and choose where it lives."
              action={<button className="btn-primary" onClick={() => navigate('/dashboard/new')}>+ New dashboard</button>}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title="No dashboards found"
              description="Try a different search or filter."
            />
          )
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
            {shown.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/dashboard/${d.id}`)}
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
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate">{placementLabel(d.placement)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-400 dark:text-slate-500">
                      Owner · {d.owner}
                      {DEACTIVATED_OWNERS.includes(d.owner) && (
                        <span className="cap-chip cap-chip-neutral !border-amber-300 !text-aims-ungoverned dark:!border-amber-500/30 dark:!text-amber-400">offboarded</span>
                      )}
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
        )}
        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Screens hosted here: S76–S79</p>
      </div>
    </div>
  )
}
