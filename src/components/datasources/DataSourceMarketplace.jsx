import { useState } from 'react'
import { Database, X, Search, ChevronLeft, Check, Lock } from 'lucide-react'
import {
  EmptyState,
  GovernedBadge,
  ConnectionBadge,
  ProviderBadge,
  CapabilityChips,
} from '../common/index.jsx'
import { EXTERNAL_SOURCES, SOURCE_CATEGORIES, TYPE_LABEL } from '../../data/mock.js'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { CardContainer } from '@/components/ui/CardContainer'

const SHOW = [
  { id: 'all', label: 'All' },
  { id: 'connected', label: 'Connected' },
  { id: 'available', label: 'Available' },
]
const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'name', label: 'Name A → Z' },
  { id: 'category', label: 'Category' },
]
const PROVIDERS = [
  { id: 'official', label: 'Official' },
  { id: 'partner', label: 'Partner' },
  { id: 'private', label: 'Private' },
]

const fieldCount = (s) => `${s.metrics.length} metric${s.metrics.length === 1 ? '' : 's'} · ${s.recordSets.length} record set${s.recordSets.length === 1 ? '' : 's'}`

// Data Sources Marketplace — browse/connect external systems, mirrors the
// AIMS-OS Integrations catalog. Selecting a source returns it to the builder.
export default function DataSourceMarketplace({ currentSourceId, onSelect, onClose }) {
  const [show, setShow] = useState('all')
  const [sort, setSort] = useState('recommended')
  const [activeCats, setActiveCats] = useState(new Set())
  const [activeProviders, setActiveProviders] = useState(new Set())
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  function toggle(setter) {
    return (v) =>
      setter((prev) => {
        const n = new Set(prev)
        n.has(v) ? n.delete(v) : n.add(v)
        return n
      })
  }
  const toggleCat = toggle(setActiveCats)
  const toggleProvider = toggle(setActiveProviders)
  const clearAll = () => {
    setActiveCats(new Set())
    setActiveProviders(new Set())
    setSearch('')
    setShow('all')
  }

  function pick(s) {
    onSelect(s.id)
    onClose()
  }

  const counts = Object.fromEntries(
    SOURCE_CATEGORIES.map((c) => [c, EXTERNAL_SOURCES.filter((s) => s.category === c).length]),
  )
  const connectedCount = EXTERNAL_SOURCES.filter((s) => s.connected).length

  const q = search.trim().toLowerCase()
  let list = EXTERNAL_SOURCES.filter((s) => {
    if (activeCats.size && !activeCats.has(s.category)) return false
    if (activeProviders.size && !activeProviders.has(s.provider)) return false
    if (show === 'connected' && !s.connected) return false
    if (show === 'available' && s.connected) return false
    if (q && !(s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))) return false
    return true
  })
  list = [...list].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    // recommended: featured → connected → name
    return (b.featured - a.featured) || (b.connected - a.connected) || a.name.localeCompare(b.name)
  })

  const filtersActive = activeCats.size > 0 || activeProviders.size > 0 || !!q || show !== 'all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex h-full w-full max-w-[1400px] flex-col overflow-hidden p-0 sm:h-[calc(100vh-40px)] sm:w-[calc(100vw-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ background: 'linear-gradient(135deg,rgba(43,127,255,.2),rgba(6,182,212,.2))', border: '1px solid rgba(43,127,255,.3)' }}
            >
              <Database size={18} className="text-aims-blue" />
            </span>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-slate-100">Data Sources</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Connect a system and map its metrics or records</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close data sources"
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          <Rail
            show={show}
            onShow={setShow}
            sort={sort}
            onSort={setSort}
            counts={counts}
            activeCats={activeCats}
            onToggleCat={toggleCat}
            activeProviders={activeProviders}
            onToggleProvider={toggleProvider}
          />

          <div className="flex flex-1 flex-col min-w-0">
            {selected ? (
              <Detail
                source={selected}
                isCurrent={selected.id === currentSourceId}
                onUse={() => pick(selected)}
                onBack={() => setSelected(null)}
              />
            ) : (
              <>
                <Toolbar
                  search={search}
                  onSearch={setSearch}
                  activeCats={activeCats}
                  onToggleCat={toggleCat}
                  activeProviders={activeProviders}
                  onToggleProvider={toggleProvider}
                  show={show}
                  onResetShow={() => setShow('all')}
                  filtersActive={filtersActive}
                  onClearAll={clearAll}
                />
                <div className="flex-1 overflow-auto p-6">
                  {!filtersActive && <Hero onOpen={setSelected} />}
                  {list.length === 0 ? (
                    <EmptyState
                      icon="🔌"
                      title="No sources match"
                      description="Try a different search or clear your filters."
                      action={
                        <Button variant="secondary" size="default" onClick={clearAll}>
                          Clear filters
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
                      {list.map((s) => (
                        <Card
                          key={s.id}
                          source={s}
                          isCurrent={s.id === currentSourceId}
                          onUse={() => pick(s)}
                          onOpen={() => setSelected(s)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            <strong className="text-gray-900 dark:text-slate-100">{connectedCount}</strong> connected · {EXTERNAL_SOURCES.length} sources available
          </span>
          <Button variant="secondary" size="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function Rail({ show, onShow, sort, onSort, counts, activeCats, onToggleCat, activeProviders, onToggleProvider }) {
  return (
    <div className="max-h-[45vh] w-full shrink-0 overflow-y-auto border-b border-gray-200 p-4 dark:border-white/10 md:max-h-none md:w-[220px] md:border-b-0 md:border-r">
      <RailLabel>Show</RailLabel>
      <div className="mb-4 flex rounded-lg border border-gray-300 p-0.5 dark:border-white/15">
        {SHOW.map((s) => (
          <button
            key={s.id}
            onClick={() => onShow(s.id)}
            className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
              show === s.id ? 'bg-aims-blue text-white' : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <RailLabel>Sort by</RailLabel>
      <select className="input h-9 mb-4 text-sm" value={sort} onChange={(e) => onSort(e.target.value)}>
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <RailLabel>Provider</RailLabel>
      <div className="mb-4 space-y-0.5">
        {PROVIDERS.map((p) => {
          const on = activeProviders.has(p.id)
          return (
            <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5">
              <input type="checkbox" checked={on} onChange={() => onToggleProvider(p.id)} />
              <span className={`text-xs ${on ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>
                {p.label}
              </span>
            </label>
          )
        })}
      </div>

      <RailLabel>Categories</RailLabel>
      <div className="space-y-0.5">
        {SOURCE_CATEGORIES.map((c) => {
          const on = activeCats.has(c)
          return (
            <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5">
              <input type="checkbox" checked={on} onChange={() => onToggleCat(c)} />
              <span className={`flex-1 text-xs ${on ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>
                {c}
              </span>
              <Tag variant="neutral" size="sm">{counts[c]}</Tag>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function RailLabel({ children }) {
  return (
    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{children}</div>
  )
}

function Toolbar({ search, onSearch, activeCats, onToggleCat, activeProviders, onToggleProvider, show, onResetShow, filtersActive, onClearAll }) {
  return (
    <div className="border-b border-gray-200 px-6 py-3 dark:border-white/10">
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" />
        <input
          className="input h-9 pl-8"
          placeholder={`Search ${EXTERNAL_SOURCES.length} data sources…`}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {filtersActive && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {[...activeCats].map((c) => (
            <Chip key={c} onClear={() => onToggleCat(c)}>{c}</Chip>
          ))}
          {[...activeProviders].map((p) => (
            <Chip key={p} onClear={() => onToggleProvider(p)}>{PROVIDERS.find((x) => x.id === p)?.label}</Chip>
          ))}
          {show !== 'all' && <Chip onClear={onResetShow}>{SHOW.find((s) => s.id === show)?.label}</Chip>}
          {search && <Chip onClear={() => onSearch('')}>“{search}”</Chip>}
          <Button variant="tertiary" size="sm" onClick={onClearAll}>Clear all</Button>
        </div>
      )}
    </div>
  )
}

function Chip({ children, onClear }) {
  return (
    <Tag variant="neutral" size="sm">
      {children}
      <button onClick={onClear} className="hover:text-aims-stale" aria-label="Remove filter">
        <X size={11} />
      </button>
    </Tag>
  )
}

function Logo({ source, size = 'h-9 w-9 text-xs' }) {
  return (
    <span className={`logo-sq ${size}`} style={{ background: source.logoColor }}>
      {source.initials}
    </span>
  )
}

function Hero({ onOpen }) {
  const featured = EXTERNAL_SOURCES.filter((s) => s.featured).slice(0, 3)
  if (!featured.length) return null
  return (
    <div className="mb-5 rounded-xl border border-aims-blue/30 bg-gradient-to-br from-aims-blue/10 to-cyan-500/10 p-5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-aims-blue">Popular sources</div>
      <div className="grid gap-3 sm:grid-cols-3">
        {featured.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpen(s)}
            className="flex items-center gap-3 rounded-lg bg-white/70 p-3 text-left transition-shadow hover:shadow-md dark:bg-white/5"
          >
            <Logo source={s} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{s.name}</div>
              <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{s.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function UseButton({ isCurrent, onUse, full }) {
  if (isCurrent) {
    return (
      <Button variant="secondary" size="default" disabled selected={true} className={full ? 'w-full cursor-default text-aims-governed' : 'cursor-default text-aims-governed'}>
        <Check size={15} /> Selected
      </Button>
    )
  }
  return (
    <Button variant="primary" size="default" onClick={(e) => { e.stopPropagation(); onUse() }} className={full ? 'w-full' : ''}>
      Use this source
    </Button>
  )
}

function Card({ source, isCurrent, onUse, onOpen }) {
  return (
    <CardContainer
      variant="default"
      selected={isCurrent}
      onClick={onOpen}
      className="min-h-[200px] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Logo source={source} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{source.name}</div>
          <div className="truncate text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">{source.category}</div>
        </div>
        <ConnectionBadge status={source.status} />
      </div>

      <p className="line-clamp-2 text-xs text-gray-500 dark:text-slate-400">{source.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <ProviderBadge provider={source.provider} />
        <CapabilityChips capabilities={source.capabilities} />
        {source.hasPII && (
          <Tag variant="neutral" size="sm"><Lock size={10} /> PII</Tag>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
        <span className="text-[11px] text-gray-500 dark:text-slate-400">{fieldCount(source)}</span>
        <UseButton isCurrent={isCurrent} onUse={onUse} />
      </div>
    </CardContainer>
  )
}

function FieldRow({ field }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-white/10">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{field.name}</div>
        {field.entityType && (
          <div className="text-[11px] text-gray-500 dark:text-slate-400">
            {field.entityType} · {field.count.toLocaleString()} rows{field.hasPII ? ' · PII' : ''}
          </div>
        )}
      </div>
      <Tag variant="neutral" size="sm" className="shrink-0">Rec: {TYPE_LABEL[field.recommendedType]}</Tag>
    </div>
  )
}

function Detail({ source, isCurrent, onUse, onBack }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex items-center gap-1 border-b border-gray-200 px-6 py-2.5 dark:border-white/10">
        <button onClick={onBack} className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10" aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-gray-500 dark:text-slate-400">Data Sources</span>
        <span className="text-xs text-gray-500 dark:text-slate-400">/</span>
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{source.name}</span>
      </div>

      <div className="max-w-3xl p-6">
        <div className="flex items-start gap-4">
          <Logo source={source} size="h-12 w-12 text-sm rounded-xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{source.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">{source.category}</span>
              <ConnectionBadge status={source.status} />
            </div>
          </div>
          <UseButton isCurrent={isCurrent} onUse={onUse} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <ProviderBadge provider={source.provider} />
          <GovernedBadge governed={source.governed} />
          <CapabilityChips capabilities={source.capabilities} />
          {source.hasPII && (
            <Tag variant="neutral" size="sm"><Lock size={10} /> Contains PII</Tag>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-slate-200">{source.description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DetailStat label="Owner" value={source.owner} />
          <DetailStat label="Last reviewed" value={source.reviewed || 'Not reviewed'} />
        </div>

        {source.metrics.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Metrics ({source.metrics.length})</SectionLabel>
            <div className="space-y-2">
              {source.metrics.map((m) => (
                <FieldRow key={m.id} field={m} />
              ))}
            </div>
          </div>
        )}

        {source.recordSets.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Record sets ({source.recordSets.length})</SectionLabel>
            <div className="space-y-2">
              {source.recordSets.map((r) => (
                <FieldRow key={r.id} field={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{children}</div>
  )
}

function DetailStat({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-gray-800 dark:text-slate-200">{value}</div>
    </div>
  )
}
