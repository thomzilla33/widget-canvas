import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, MapPin, UserX, RotateCcw, FileBarChart, ArrowRight, Sparkles, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Badge, EmptyState } from '../components/common/index.jsx'
import { PopoverPanel } from '../components/common/Popover.jsx'
import StudioWelcome from '../components/common/StudioWelcome.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import AIGenerateModal from '../components/ai/AIGenerateModal.jsx'
import CreateLauncher from '../components/create/CreateLauncher.jsx'
import DeleteDashboardDialog from '../components/dashboard/DeleteDashboardDialog.jsx'
import { useStaggerReveal } from '../hooks/useReveal.js'
import { audienceLabel } from '../data/audiences.js'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { useRole } from '../state/RoleContext.jsx'
import { placementLabel, DEACTIVATED_OWNERS, dashboardKind, SHARE_PEOPLE } from '../data/mock.js'
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
  const { dashboards, updateDashboard, removeDashboard } = useDashboards()
  const { isAdmin } = useRole()
  const [menuId, setMenuId] = useState(null) // per-card ⋯ menu (by dashboard id)
  const [deletingDashboard, setDeletingDashboard] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [kind, setKind] = useState('All')
  const [owner, setOwner] = useState('All')
  const [sortBy, setSortBy] = useState('recent')
  const [sortDir, setSortDir] = useState('desc')

  // Governance recovery: dashboards owned by an offboarded user need reassigning.
  // Group them BY the departed owner (one person usually owns several), so an admin
  // can reassign the whole batch to the right person in one action.
  const orphaned = dashboards.filter((d) => DEACTIVATED_OWNERS.includes(d.owner))
  const orphanGroups = DEACTIVATED_OWNERS
    .map((name) => ({ owner: name, items: orphaned.filter((d) => d.owner === name) }))
    .filter((g) => g.items.length > 0)
  // Who you can reassign TO: yourself, or any active teammate.
  const reassignTargets = ['You (admin)', ...SHARE_PEOPLE.filter((p) => p.status === 'active').map((p) => p.name)]
  const [reassignTo, setReassignTo] = useState({}) // per departed-owner → chosen new owner
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
  const targetFor = (owner) => reassignTo[owner] || 'You (admin)'
  const reassignOne = (id, owner) => updateDashboard(id, { owner: targetFor(owner) })
  const reassignAll = (group) => {
    const to = targetFor(group.owner)
    group.items.forEach((d) => updateDashboard(d.id, { owner: to }))
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
      <PageHeader
        title="Dashboards"
        description={`${dashboards.length} dashboards · ${publishedCount} published`}
        actions={
          isAdmin ? (
            <button className="btn-primary" onClick={() => setLauncher(true)}>
              <Sparkles size={15} /> Create dashboard
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

      <div className="px-6 py-4">
        {/* IA: Dashboards is the full catalog; Reports is the same Standalone dashboards
            grouped by collection. Cross-link when the user filters to Standalone. */}
        {kind === 'Global' && (
          <button onClick={() => navigate('/reports')} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-aims-blue hover:underline">
            <FileBarChart size={13} aria-hidden="true" /> Standalone dashboards are also grouped by collection in Reports
            <ArrowRight size={12} aria-hidden="true" />
          </button>
        )}
        {isAdmin && orphaned.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <UserX size={15} className="text-aims-ungoverned" />
              Needs attention · {orphaned.length} dashboard{orphaned.length > 1 ? 's' : ''} with an offboarded owner
            </div>
            <div className="space-y-3">
              {orphanGroups.map((group) => (
                <div key={group.owner} className="rounded-lg border border-amber-200/70 bg-white p-2.5 dark:border-white/10 dark:bg-[#131a2c]">
                  {/* group header: who left + reassign-all control */}
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-gray-900 dark:text-slate-100">{group.owner}</span>
                      <span className="text-gray-500 dark:text-slate-400"> was offboarded · owns {group.items.length} dashboard{group.items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                        <span className="hidden sm:inline">Reassign to</span>
                        <select
                          className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
                          value={targetFor(group.owner)}
                          onChange={(e) => setReassignTo((m) => ({ ...m, [group.owner]: e.target.value }))}
                          aria-label={`New owner for ${group.owner}'s dashboards`}
                        >
                          {reassignTargets.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <button className="btn-primary !py-1.5 !px-3 text-xs" onClick={() => reassignAll(group)}>
                        <RotateCcw size={13} /> Reassign all
                      </button>
                    </div>
                  </div>
                  {/* the dashboards this person owns — each reassignable on its own */}
                  <div className="space-y-1">
                    {group.items.map((d) => (
                      <div key={d.id} className="flex items-center gap-2 rounded-md border border-gray-100 px-2.5 py-1.5 dark:border-white/10">
                        <div className="min-w-0 flex-1">
                          <button onClick={() => navigate(`/dashboard/${d.id}/canvas`)} className="block max-w-full truncate text-left text-sm font-medium text-gray-900 hover:text-aims-blue dark:text-slate-100">
                            {d.name}
                          </button>
                          <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{placementLabel(d.placement)}</div>
                        </div>
                        <button
                          className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:border-aims-blue/40 hover:text-aims-blue dark:border-white/15 dark:text-slate-300"
                          onClick={() => reassignOne(d.id, group.owner)}
                          aria-label={`Reassign ${d.name} to ${targetFor(group.owner)}`}
                        >
                          Reassign
                        </button>
                      </div>
                    ))}
                  </div>
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
          <div ref={gridReveal} className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
            {shown.map((d) => (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                onClick={(e) => { if (!e.target.closest('button')) navigate(`/dashboard/${d.id}`) }}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); navigate(`/dashboard/${d.id}`) } }}
                className="catalog-card min-h-[124px] cursor-pointer text-left"
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
                          <DashMenuItem icon={Trash2} danger onClick={(e) => { e.stopPropagation(); setMenuId(null); setDeletingDashboard(d) }}>Delete</DashMenuItem>
                        </PopoverPanel>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="logo-sq" style={{ background: 'var(--grad)' }}>
                    <LayoutDashboard size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* only the title clears the absolute status badge (+ ⋯ for admins) */}
                    <div className={`truncate text-sm font-semibold text-gray-900 dark:text-slate-100 ${isAdmin ? 'pr-28' : 'pr-20'}`}>
                      {d.name}
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                      <span className={`cap-chip shrink-0 ${dashboardKind(d) === 'entity' ? 'cap-chip-blue' : 'cap-chip-neutral'}`}>
                        {dashboardKind(d) === 'entity' ? 'Profile' : 'Standalone'}
                      </span>
                      <span className="flex min-w-0 items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{placementLabel(d.placement)}</span>
                      </span>
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                      <span className="truncate">Owner · {d.owner}</span>
                      {DEACTIVATED_OWNERS.includes(d.owner) && (
                        <span className="cap-chip cap-chip-neutral shrink-0 !border-amber-300 !text-aims-ungoverned dark:!border-amber-500/30 dark:!text-amber-400">offboarded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">{widgetCount(d)} widgets · {audienceLabel(d.audience)}</span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">{d.updated}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">Screens hosted here: S76–S79</p>
      </div>

      {launcher && <CreateLauncher kind="dashboard" onPick={pickCreate} onClose={() => setLauncher(false)} />}

      {deletingDashboard && (
        <DeleteDashboardDialog
          dashboard={deletingDashboard}
          onClose={() => setDeletingDashboard(null)}
          onConfirm={() => { removeDashboard(deletingDashboard.id); setDeletingDashboard(null) }}
        />
      )}

      {aiOpen && <AIGenerateModal mode="dashboard" onClose={() => setAiOpen(false)} />}
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
