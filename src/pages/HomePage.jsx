import { PageHeader, EmptyState } from '../components/common/index.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'

// Consumption surface for dashboards placed as a workspace home (personal/team).
export default function HomePage() {
  const { dashboards } = useDashboards()
  const homes = dashboards.filter((d) => d.placement?.surface === 'home')
  const team = homes.filter((d) => d.placement.homeScope === 'team')
  const personal = homes.filter((d) => d.placement.homeScope === 'personal')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Home" description="Your personal and team landing dashboards" />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
          {homes.length === 0 ? (
            <EmptyState icon="🏠" title="No home dashboards" description="Create a dashboard and place it as a workspace home." />
          ) : (
            <>
              {personal.length > 0 && (
                <section>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Just me</div>
                  <DashboardCards items={personal} />
                </section>
              )}
              {team.length > 0 && (
                <section>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">My team</div>
                  <DashboardCards items={team} />
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
