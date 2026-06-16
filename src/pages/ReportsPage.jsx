import { PageHeader, EmptyState } from '../components/common/index.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { REPORT_COLLECTIONS } from '../data/mock.js'

// Consumption surface for dashboards placed as standalone reports, by collection.
export default function ReportsPage() {
  const { dashboards } = useDashboards()
  const reports = dashboards.filter((d) => d.placement?.surface === 'report')

  const reportLabel = reports.length === 1 ? '1 standalone report' : `${reports.length} standalone reports`

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Reports" description={`${reportLabel} across your collections`} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
          {reports.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No reports yet"
              description="Reports are dashboards published for a whole team. Open a dashboard, set its placement to “Standalone report,” and pick a collection — it will show up here."
            />
          ) : (
            [...REPORT_COLLECTIONS, 'Other'].map((collection) => {
              const items =
                collection === 'Other'
                  ? reports.filter((d) => !REPORT_COLLECTIONS.includes(d.placement.collection))
                  : reports.filter((d) => d.placement.collection === collection)
              // The catch-all "Other" bucket only appears when it has reports;
              // defined collections always render, with guidance when empty.
              if (!items.length && collection === 'Other') return null
              return (
                <section key={collection}>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{collection}</div>
                  {items.length ? (
                    <DashboardCards items={items} />
                  ) : (
                    <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:text-slate-400">
                      No reports in this collection yet. Publish a dashboard to “{collection}” to populate it.
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
