import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, EmptyState } from '../components/common/index.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { REPORT_COLLECTIONS } from '../data/mock.js'

// Consumption surface for dashboards placed as standalone reports, by collection.
export default function ReportsPage() {
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')
  const [collection, setCollection] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const reports = dashboards.filter((d) => d.placement?.surface === 'report')
  const reportLabel = reports.length === 1 ? '1 standalone report' : `${reports.length} standalone reports`

  const matchesSearch = (d) => !search || d.name.toLowerCase().includes(search.toLowerCase())
  const sortItems = (items) =>
    [...items].sort((a, b) => {
      const d = a.name.localeCompare(b.name)
      return sortDir === 'asc' ? d : -d
    })
  // Which collection sections to render (a specific filter narrows to one).
  const sections = collection === 'All' ? [...REPORT_COLLECTIONS, 'Other'] : [collection]

  const collectionOptions = [{ value: 'All', label: 'All collections' }, ...REPORT_COLLECTIONS.map((c) => ({ value: c, label: c }))]

  return (
    <div className="h-full overflow-auto">
      <div className="px-6 pt-4">
        <StudioWelcome
          studioId="reports"
          built={{ count: reports.length, label: 'reports' }}
          ctaLabel={isAdmin ? 'New dashboard' : undefined}
          onCta={isAdmin ? () => navigate('/dashboard/new') : undefined}
          links={[{ label: 'Browse all dashboards', onClick: () => navigate('/dashboards') }]}
        />
      </div>
      <PageHeader title="Reports" description={`${reportLabel} across your collections`} />
      <FilterToolbar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search reports…"
        filters={[{ id: 'collection', label: 'Collection', value: collection, onChange: setCollection, options: collectionOptions }]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [{ value: 'name', label: 'Name' }],
          dir: sortDir,
          onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
        }}
      />
      <div>
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
          {reports.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No reports yet"
              description="Reports are dashboards published for a whole team. Open a dashboard, set its placement to “Standalone report,” and pick a collection — it will show up here."
            />
          ) : (
            sections.map((c) => {
              const items = (
                c === 'Other'
                  ? reports.filter((d) => !REPORT_COLLECTIONS.includes(d.placement.collection))
                  : reports.filter((d) => d.placement.collection === c)
              ).filter(matchesSearch)
              // The catch-all "Other" bucket only appears when it has matches.
              if (!items.length && c === 'Other') return null
              return (
                <section key={c}>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{c}</div>
                  {items.length ? (
                    <DashboardCards items={sortItems(items)} />
                  ) : (
                    <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:text-slate-400">
                      {search ? `No reports match “${search}” in this collection.` : `No reports in this collection yet. Publish a dashboard to “${c}” to populate it.`}
                    </p>
                  )}
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
