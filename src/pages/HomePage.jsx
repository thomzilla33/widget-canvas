import { useState } from 'react'
import { PageHeader } from '../components/common/index.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import DashboardZones from '../components/dashboard/DashboardZones.jsx'
import { DEFAULT_SCOPE } from '../components/dashboard/DashboardControls.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useLive } from '../state/LiveContext.jsx'

// The board behind the "needs you" hero — the standardized Inbox · HITL · Tasks triage
// board (also reachable as its own dashboard). Rendered here so Home and the Workspace
// Home dashboard stay one and the same surface.
const WORKSPACE_BOARD_ID = 'd-workspace-home'

// Workspace home: the standardized work board (Inbox, Tasks, HITL) + home dashboards.
// The board is the hero; the filter toolbar scopes only the landing dashboards.
export default function HomePage() {
  const { dashboards } = useDashboards()
  const { tick, paused } = useLive()
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const board = dashboards.find((d) => d.id === WORKSPACE_BOARD_ID)
  const boardScope = { ...DEFAULT_SCOPE, tick, paused }

  const homes = dashboards
    .filter((d) => d.placement?.surface === 'home')
    .filter((d) => d.id !== WORKSPACE_BOARD_ID) // shown as the hero board above — don't list it twice
    .filter((d) => scope === 'All' || d.placement.homeScope === scope)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const d = a.name.localeCompare(b.name)
      return sortDir === 'asc' ? d : -d
    })
  const hasAnyHome = dashboards.some((d) => d.placement?.surface === 'home')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Home" description="What needs you, your tasks, and your landing dashboards" />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-6 py-5 lg:px-8 2xl:px-12">
          <StudioWelcome studioId="home" built={{ count: homes.length, label: 'home dashboards' }} />

          {board && (
            <section>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Needs you</span>
              </div>
              <DashboardZones dashboard={board} scope={boardScope} />
            </section>
          )}

          {hasAnyHome && (
            <section>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Your dashboards</span>
              </div>
              <div className="mb-3">
                <FilterToolbar
                  bare
                  searchValue={search}
                  onSearch={setSearch}
                  searchPlaceholder="Search your dashboards…"
                  filters={[
                    {
                      id: 'scope',
                      label: 'Scope',
                      value: scope,
                      onChange: setScope,
                      options: [
                        { value: 'All', label: 'All' },
                        { value: 'personal', label: 'Just me' },
                        { value: 'team', label: 'My team' },
                      ],
                    },
                  ]}
                  sort={{
                    value: sortBy,
                    onChange: setSortBy,
                    options: [{ value: 'name', label: 'Name' }],
                    dir: sortDir,
                    onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
                  }}
                />
              </div>
              {homes.length ? (
                <DashboardCards items={homes} />
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:text-slate-400">
                  No dashboards match the current filters.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
