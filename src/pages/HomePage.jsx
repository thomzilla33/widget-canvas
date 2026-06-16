import { PageHeader } from '../components/common/index.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import PinnedWidgets from '../components/home/PinnedWidgets.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'

// Workspace home: pinned/actionable widgets (Inbox, Tasks, HITL) + home dashboards.
export default function HomePage() {
  const { dashboards } = useDashboards()
  const homes = dashboards.filter((d) => d.placement?.surface === 'home')
  const team = homes.filter((d) => d.placement.homeScope === 'team')
  const personal = homes.filter((d) => d.placement.homeScope === 'personal')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Home" description="What needs you, your tasks, and your landing dashboards" />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
          <PinnedWidgets />

          {personal.length > 0 && (
            <section>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Just me</div>
              <DashboardCards items={personal} />
            </section>
          )}
          {team.length > 0 && (
            <section>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">My team</div>
              <DashboardCards items={team} />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
