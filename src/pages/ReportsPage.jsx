import { PageHeader, EmptyState } from '../components/common/index.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { REPORT_COLLECTIONS } from '../data/mock.js'

// Consumption surface for dashboards placed as standalone reports, by collection.
export default function ReportsPage() {
  const { dashboards } = useDashboards()
  const reports = dashboards.filter((d) => d.placement?.surface === 'report')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Reports" description={`${reports.length} standalone reports across your collections`} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
          {reports.length === 0 ? (
            <EmptyState icon="📊" title="No reports yet" description="Create a dashboard and place it as a standalone report." />
          ) : (
            [...REPORT_COLLECTIONS, 'Other'].map((collection) => {
              const items =
                collection === 'Other'
                  ? reports.filter((d) => !REPORT_COLLECTIONS.includes(d.placement.collection))
                  : reports.filter((d) => d.placement.collection === collection)
              if (!items.length) return null
              return (
                <section key={collection}>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{collection}</div>
                  <DashboardCards items={items} />
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
