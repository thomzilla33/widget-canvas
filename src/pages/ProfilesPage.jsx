import { useState } from 'react'
import { useLoadMore } from '../hooks/useLoadMore.js'
import { useNavigate } from 'react-router-dom'
import { Building2, UserRound, UserCheck, Handshake, LifeBuoy, ChevronRight } from 'lucide-react'
import { PageHeader, EmptyState, HealthBadge } from '../components/common/index.jsx'
import { Button } from '@/components/ui/Button'
import { CardContainer } from '@/components/ui/CardContainer'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import { entities } from '../data/mock.js'

// Tier 2 — the consume surface for Profile (entity) dashboards. Browse every
// entity (Account / Contact / Employee / Deal / Case) and open its Unified Profile.
const TYPE_ICON = { Account: Building2, Contact: UserRound, Employee: UserCheck, Deal: Handshake, Case: LifeBuoy }
const TYPE_OPTIONS = [
  { value: 'All', label: 'All types' },
  { value: 'Account', label: 'Accounts' },
  { value: 'Contact', label: 'Contacts' },
  { value: 'Employee', label: 'Employees' },
  { value: 'Deal', label: 'Deals' },
  { value: 'Case', label: 'Cases' },
]

function initialsOf(name) {
  return (name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '—'
}

export default function ProfilesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const filtered = entities.filter((e) => {
    const matchType = type === 'All' || e.type === type
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.company || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })
  const shown = [...filtered].sort((a, b) => {
    const d = sortBy === 'type' ? a.type.localeCompare(b.type) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)
    return sortDir === 'asc' ? d : -d
  })
  const { visible: shownPage, hasMore, remaining, loadMore } = useLoadMore(shown, { initial: 24, increment: 24 })

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Profiles" description={`${entities.length} profiles · Accounts, contacts, employees & more`} />

      <FilterToolbar
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search profiles…"
        filters={[{ id: 'type', label: 'Type', value: type, onChange: setType, options: TYPE_OPTIONS }]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [{ value: 'name', label: 'Name' }, { value: 'type', label: 'Type' }],
          dir: sortDir,
          onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
        }}
      />

      <div className="flex-1 overflow-auto px-6 py-4">
        {shown.length === 0 ? (
          <EmptyState icon="🔍" title="No profiles found" description="Try a different search or type filter." />
        ) : (
          <>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
            {shownPage.map((e) => {
              const Icon = TYPE_ICON[e.type] || UserRound
              return (
                <CardContainer key={e.id} onClick={() => navigate(`/ucp/${e.id}`)} className="min-h-[120px] relative flex flex-col gap-2.5 text-left">
                  <div className="absolute top-3 right-3">
                    <HealthBadge health={e.health} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-aims-blue text-sm font-bold text-white">
                      {initialsOf(e.name)}
                    </span>
                    <div className="min-w-0 pr-16">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{e.name}</div>
                      <div className="flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-slate-400">
                        <Icon size={11} className="shrink-0" aria-hidden="true" /> {e.type}
                        {e.company && <span className="truncate"> · {e.company}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                    <span className="truncate text-[11px] text-gray-500 dark:text-slate-400">Owner · {e.owner}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-aims-blue">
                      Open profile <ChevronRight size={12} aria-hidden="true" />
                    </span>
                  </div>
                </CardContainer>
              )
            })}
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
    </div>
  )
}
