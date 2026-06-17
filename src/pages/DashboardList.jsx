import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, MapPin, UserX, RotateCcw, FileBarChart, ArrowRight } from 'lucide-react'
import { PageHeader, Badge, EmptyState } from '../components/common/index.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { placementLabel, DEACTIVATED_OWNERS, dashboardKind } from '../data/mock.js'
import { widgetCount } from '../data/layout.js'

const STATUS_OPTIONS = [
  { value: 'All', label: 'All statuses' },
  { value: 'Published', label: 'Published' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
]
const KIND_OPTIONS = [
  { value: 'All', label: 'All kinds' },
  { value: 'Entity', label: 'Profile' },
  { value: 'Global', label: 'Standalone' },
]

// S76–S79 — dashboard list with search + status filter
export default function DashboardList() {
  const navigate = useNavigate()
  const { dashboards, updateDashboard } = useDashboards()
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [kind, setKind] = useState('All')
  const [owner, setOwner] = useState('All')
  const [sortBy, setSortBy] = useState('recent')
  const [sortDir, setSortDir] = useState('desc')

  // Governance recovery: dashboards owned by an offboarded user need reassigning.
  const orphaned = dashboards.filter((d) => DEACTIVATED_OWNERS.includes(d.owner))
  const reassign = (id) => updateDashboard(id, { owner: 'You (admin)' })

  // Owner filter — distinct owners across the catalog (enterprise scale).
  const ownerOptions = [
    { value: 'All', label: 'All owners' },
    ...Array.from(new Set(dashboards.map((d) => d.owner).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .map((o) => ({ value: o, label: o })),
  ]

  const publishedCount = dashboards.filter((d) => d.status === 'published').length
  const filtered = dashboards.filter((d) => {
    const matchStatus = status === 'All' || d.status === status.toLowerCase()
    const matchKind = kind === 'All' || dashboardKind(d) === kind.toLowerCase()
    const matchOwner = owner === 'All' || d.owner === owner
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchKind && matchOwner && matchSearch
  })
  // 'recent' keeps the seed order (newest first); 'name' sorts alphabetically. Dir flips either.
  const shown = (() => {
    if (sortBy === 'name') {
      const arr = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      return sortDir === 'asc' ? arr : arr.reverse()
    }
    return sortDir === 'desc' ? filtered : [...filtered].reverse()
  })()

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Dashboards"
        description={`${dashboards.length} dashboards · ${publishedCount} published`}
        actions={
          isAdmin ? (
            <button className="btn-primary" onClick={() => navigate('/dashboard/new')}>
              + New dashboard
            </button>
          ) : null
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search dashboards…"
        filters={[
          { id: 'status', label: 'Status', value: status, onChange: setStatus, options: STATUS_OPTIONS },
          { id: 'kind', label: 'Kind', value: kind, onChange: setKind, options: KIND_OPTIONS },
          { id: 'owner', label: 'Owner', value: owner, onChange: setOwner, options: ownerOptions },
        ]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [{ value: 'recent', label: 'Recently updated' }, { value: 'name', label: 'Name' }],
          dir: sortDir,
          onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
        }}
      />

      <div className="flex-1 overflow-auto px-6 py-4">
        <StudioWelcome
          studioId="dashboards"
          built={{ count: dashboards.length, label: 'dashboards' }}
          ctaLabel={isAdmin ? 'New dashboard' : undefined}
          onCta={isAdmin ? () => navigate('/dashboard/new') : undefined}
        />
        {/* IA: Dashboards is the full catalog; Reports is the same Standalone dashboards
            grouped by collection. Cross-link when the user filters to Standalone. */}
        {kind === 'Global' && (
          <button onClick={() => navigate('/reports')} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-aims-blue hover:underline">
            <FileBarChart size={13} aria-hidden="true" /> Standalone dashboards are also grouped by collection in Reports
            <ArrowRight size={12} aria-hidden="true" />
          </button>
        )}
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
                    <div className="flex items-center gap-1.5">
                      <span className={`cap-chip ${dashboardKind(d) === 'entity' ? 'cap-chip-blue' : 'cap-chip-neutral'}`}>
                        {dashboardKind(d) === 'entity' ? 'Profile' : 'Standalone'}
                      </span>
                      <span className="flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-slate-400">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{placementLabel(d.placement)}</span>
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-slate-400">
                      Owner · {d.owner}
                      {DEACTIVATED_OWNERS.includes(d.owner) && (
                        <span className="cap-chip cap-chip-neutral !border-amber-300 !text-aims-ungoverned dark:!border-amber-500/30 dark:!text-amber-400">offboarded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">{widgetCount(d)} widgets · {d.audience}</span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">{d.updated}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">Screens hosted here: S76–S79</p>
      </div>
    </div>
  )
}
