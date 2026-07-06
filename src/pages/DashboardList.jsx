import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLoadMore } from '../hooks/useLoadMore.js'
import { MapPin, FileBarChart, ArrowRight, Sparkles, MoreHorizontal, Eye, Pencil, Trash2, Copy, Plus, LayoutGrid } from 'lucide-react'
import { PageHeader, Badge, EmptyState } from '../components/common/index.jsx'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { CardContainer } from '@/components/ui/CardContainer'
import { PopoverPanel } from '../components/common/Popover.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import AIGenerateModal from '../components/ai/AIGenerateModal.jsx'
import CreateLauncher from '../components/create/CreateLauncher.jsx'
import DeleteDashboardDialog from '../components/dashboard/DeleteDashboardDialog.jsx'
import DuplicateDashboardDialog from '../components/dashboard/DuplicateDashboardDialog.jsx'
import DashboardDetailModal from '../components/dashboard/DashboardDetailModal.jsx'
import { useStaggerReveal } from '../hooks/useReveal.js'
import { audienceLabel } from '../data/audiences.js'
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
  const location = useLocation()
  const { dashboards, updateDashboard, removeDashboard, duplicateDashboard } = useDashboards()

  // Placement mode: arriving from widget builder with a widget to place
  const pendingPlace = location.state?.pendingPlace || null
  const { isAdmin } = useRole()
  const [menuId, setMenuId] = useState(null) // per-card ⋯ menu (by dashboard id)
  const [detailDashboard, setDetailDashboard] = useState(null)
  const [deletingDashboard, setDeletingDashboard] = useState(null)
  const [duplicatingDashboard, setDuplicatingDashboard] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [kind, setKind] = useState('All')
  const [owner, setOwner] = useState('All')
  const [sortBy, setSortBy] = useState('recent')
  const [sortDir, setSortDir] = useState('desc')

  const [aiOpen, setAiOpen] = useState(false)
  const [launcher, setLauncher] = useState(false)
  const gridReveal = useStaggerReveal('dashboards') // reveal the card grid once on entry

  // Defer the successor a frame so the launcher's focus-trap restores focus to the
  // Create button first; the next modal then traps from a real trigger, not a dead card.
  function pickCreate(mode) {
    setLauncher(false)
    // Defer past the launcher's focus-trap cleanup (setTimeout, not rAF — rAF can stall
    // in a backgrounded tab, leaving the successor modal unopened).
    setTimeout(() => {
      if (mode === 'ai') setAiOpen(true)
      else navigate('/dashboard/new')
    }, 0)
  }
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
  const { visible: shownPage, hasMore, remaining, loadMore } = useLoadMore(shown, { initial: 12, increment: 12 })

  return (
    // The studio welcome leads the page; the title + filters + list scroll below it.
    <div className="h-full overflow-auto">
      <div className="px-6 pt-4">
        <StudioWelcome
          studioId="dashboards"
          built={{ count: dashboards.length, label: 'dashboards' }}
          ctaLabel={isAdmin ? 'Create dashboard' : undefined}
          onCta={isAdmin ? () => setLauncher(true) : undefined}
        />
      </div>
      {pendingPlace && (
        <div className="mx-6 mt-3 flex items-center gap-3 rounded-xl border border-aims-blue/30 bg-aims-blue/5 px-4 py-3 dark:bg-aims-blue/10">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aims-blue/10 dark:bg-aims-blue/20">
            <Plus size={16} className="text-aims-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Adding "{pendingPlace.name}" to a dashboard
            </p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Pick a dashboard below to place it, or cancel to return to the library.</p>
          </div>
          <button
            onClick={() => navigate('/widgets', { replace: true })}
            className="shrink-0 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      )}

      <PageHeader
        title="Dashboards"
        description={`${dashboards.length} dashboards · ${publishedCount} published`}
        actions={
          isAdmin ? (
            <Button onClick={() => setLauncher(true)} icon={<Sparkles size={15} />}>
              Create dashboard
            </Button>
          ) : null
        }
      />

      {/* Browse Library — anchored card always at top */}
      <div className="px-6 pt-2 pb-1">
        <button
          onClick={() => navigate('/widgets')}
          className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/[0.08]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-slate-300">
            <LayoutGrid size={17} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-slate-100">Browse widget library</span>
            <span className="block text-[11px] text-slate-400">Find and install widgets to build your dashboards.</span>
          </span>
          <ArrowRight size={14} className="shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
        </button>
      </div>

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

      <div className="px-6 py-4">
        {/* IA: Dashboards is the full catalog; Reports is the same Standalone dashboards
            grouped by collection. Cross-link when the user filters to Standalone. */}
        {kind === 'Global' && (
          <button onClick={() => navigate('/reports')} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-aims-blue hover:underline">
            <FileBarChart size={13} aria-hidden="true" /> Standalone dashboards are also grouped by collection in Reports
            <ArrowRight size={12} aria-hidden="true" />
          </button>
        )}
        {shown.length === 0 ? (
          dashboards.length === 0 ? (
            <EmptyState
              icon="🗂️"
              title="No dashboards yet"
              description="Create your first dashboard and choose where it lives."
              action={<Button onClick={() => navigate('/dashboard/new')}>+ New dashboard</Button>}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title="No dashboards found"
              description="Try a different search or filter."
            />
          )
        ) : (
          <>
          <div ref={gridReveal} className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
            {shownPage.map((d) => (
              <CardContainer
                key={d.id}
                onClick={(e) => { if (!e.target.closest('button')) setDetailDashboard(d) }}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setDetailDashboard(d) } }}
                className={`min-h-[152px] text-left relative flex flex-col gap-2.5${menuId === d.id ? ' z-10' : ''}`}
              >
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <Badge variant={d.status} />
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuId(menuId === d.id ? null : d.id) }}
                        aria-label={`Actions for ${d.name}`}
                        aria-haspopup="menu"
                        aria-expanded={menuId === d.id}
                        className="grid h-6 w-6 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                      >
                        <MoreHorizontal size={15} aria-hidden="true" />
                      </button>
                      {menuId === d.id && (
                        <PopoverPanel onClose={() => setMenuId(null)} align="right" className="w-40 p-1.5">
                          <DashMenuItem icon={Eye} onClick={(e) => { e.stopPropagation(); setMenuId(null); navigate(`/dashboard/${d.id}`) }}>Open</DashMenuItem>
                          <DashMenuItem icon={Pencil} onClick={(e) => { e.stopPropagation(); setMenuId(null); navigate(`/dashboard/${d.id}/canvas`) }}>Edit</DashMenuItem>
                          <DashMenuItem icon={Copy} onClick={(e) => { e.stopPropagation(); setMenuId(null); setDuplicatingDashboard(d) }}>Duplicate</DashMenuItem>
                          <DashMenuItem icon={Trash2} danger onClick={(e) => { e.stopPropagation(); setMenuId(null); setDeletingDashboard(d) }}>Delete</DashMenuItem>
                        </PopoverPanel>
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                    {/* only the title clears the absolute status badge (+ ⋯ for admins) */}
                    <div className={`truncate text-sm font-semibold text-gray-900 dark:text-slate-100 ${isAdmin ? 'pr-28' : 'pr-20'}`}>
                      {d.name}
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                      <Tag variant={dashboardKind(d) === 'entity' ? 'primary' : 'neutral'} size="sm" className="shrink-0">
                        {dashboardKind(d) === 'entity' ? 'Profile' : 'Standalone'}
                      </Tag>
                      <span className="flex min-w-0 items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{placementLabel(d.placement)}</span>
                      </span>
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                      <span className="truncate">Owner · {d.owner}</span>
                      {DEACTIVATED_OWNERS.includes(d.owner) && (
                        <Tag variant="alert" size="sm" className="shrink-0">offboarded</Tag>
                      )}
                    </div>
                </div>

                {d.description && (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
                    {d.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">{widgetCount(d)} widgets · {audienceLabel(d.audience)}</span>
                  {pendingPlace ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/canvas/${d.id}`, { state: { autoAdd: pendingPlace.id } })
                      }}
                      className="shrink-0 rounded-md bg-aims-blue px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-aims-blue/90 transition-colors"
                    >
                      Place here →
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">{d.updated}</span>
                  )}
                </div>
              </CardContainer>
            ))}
          </div>
          {hasMore && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="text-xs text-gray-400 dark:text-slate-500">Showing {shownPage.length} of {shown.length}</span>
              <Button variant="secondary" size="sm" onClick={loadMore}>Load {remaining} more</Button>
            </div>
          )}
          </>
        )}
      </div>

      {launcher && <CreateLauncher kind="dashboard" onPick={pickCreate} onClose={() => setLauncher(false)} />}

      {deletingDashboard && (
        <DeleteDashboardDialog
          dashboard={deletingDashboard}
          onClose={() => setDeletingDashboard(null)}
          onConfirm={() => { removeDashboard(deletingDashboard.id); setDeletingDashboard(null) }}
        />
      )}

      {duplicatingDashboard && (
        <DuplicateDashboardDialog
          dashboard={duplicatingDashboard}
          onClose={() => setDuplicatingDashboard(null)}
          onConfirm={(name) => {
            const newId = duplicateDashboard(duplicatingDashboard.id, name)
            setDuplicatingDashboard(null)
            navigate(`/dashboard/${newId}/canvas`)
          }}
        />
      )}

      {aiOpen && <AIGenerateModal mode="dashboard" onClose={() => setAiOpen(false)} />}

      {detailDashboard && (
        <DashboardDetailModal
          dashboard={detailDashboard}
          isAdmin={isAdmin}
          onClose={() => setDetailDashboard(null)}
          onOpen={() => { setDetailDashboard(null); navigate(`/dashboard/${detailDashboard.id}`) }}
          onEdit={() => { setDetailDashboard(null); navigate(`/dashboard/${detailDashboard.id}/canvas`) }}
        />
      )}
    </div>
  )
}

// Row in the per-card ⋯ actions menu. `danger` tints destructive items red.
function DashMenuItem({ icon: Icon, danger, onClick, children }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10'
      }`}
    >
      <Icon size={14} aria-hidden="true" /> {children}
    </button>
  )
}
