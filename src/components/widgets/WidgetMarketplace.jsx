import { useState } from 'react'
import { Store, X, Search, Eye, Check, Plus, ChevronLeft, BadgeCheck, Info, LayoutGrid } from 'lucide-react'
import { WidgetGlyph } from './glyph.jsx'
import WidgetRender from './WidgetRender.jsx'
import { EmptyState, FreshnessBadge } from '../common/index.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { MARKETPLACE_CATEGORIES, MARKETPLACE_WIDGETS, WIDGET_SIZES } from '../../data/mock.js'

const SHOW = [
  { id: 'all', label: 'All' },
  { id: 'not-added', label: 'Not added' },
  { id: 'added', label: 'Added' },
]
const SORTS = [
  { id: 'popular', label: 'Most installed' },
  { id: 'name', label: 'Name A → Z' },
  { id: 'newest', label: 'Newest' },
]

// Widget Marketplace — large interactive browse/install modal
export default function WidgetMarketplace({ onClose }) {
  const { widgets, addWidget } = useWidgets()
  const [show, setShow] = useState('all')
  const [sort, setSort] = useState('popular')
  const [activeCats, setActiveCats] = useState(new Set())
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const isInstalled = (mw) => widgets.some((w) => w.templateId === mw.id)

  function install(mw) {
    if (isInstalled(mw)) return
    addWidget({
      id: `w-${mw.id}-${Date.now().toString(36)}`,
      templateId: mw.id,
      name: mw.name,
      skeleton: mw.skeleton,
      governed: mw.governed,
      freshness: mw.freshness,
      health: 'active',
      usedIn: 0,
      source: mw.source,
    })
  }

  function toggleCat(c) {
    setActiveCats((prev) => {
      const n = new Set(prev)
      n.has(c) ? n.delete(c) : n.add(c)
      return n
    })
  }
  const clearAll = () => {
    setActiveCats(new Set())
    setSearch('')
    setShow('all')
  }

  const counts = Object.fromEntries(
    MARKETPLACE_CATEGORIES.map((c) => [c, MARKETPLACE_WIDGETS.filter((m) => m.category === c).length]),
  )
  const installedCount = MARKETPLACE_WIDGETS.filter(isInstalled).length

  const q = search.trim().toLowerCase()
  let list = MARKETPLACE_WIDGETS.filter((m) => {
    if (activeCats.size && !activeCats.has(m.category)) return false
    if (show === 'added' && !isInstalled(m)) return false
    if (show === 'not-added' && isInstalled(m)) return false
    if (q && !(m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))) return false
    return true
  })
  list = [...list].sort((a, b) =>
    sort === 'name'
      ? a.name.localeCompare(b.name)
      : sort === 'newest'
        ? MARKETPLACE_WIDGETS.indexOf(b) - MARKETPLACE_WIDGETS.indexOf(a)
        : b.stats.installs - a.stats.installs,
  )

  const filtersActive = activeCats.size > 0 || !!q || show !== 'all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex h-full w-full max-w-[1400px] flex-col overflow-hidden p-0 sm:h-[calc(100vh-40px)] sm:w-[calc(100vw-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ background: 'linear-gradient(135deg,rgba(43,127,255,.2),rgba(167,139,250,.2))', border: '1px solid rgba(43,127,255,.3)' }}
            >
              <Store size={18} className="text-aims-blue" />
            </span>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-slate-100">Widget Marketplace</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Browse and add pre-built widgets to your catalog</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close marketplace"
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
          />

          <div className="flex flex-1 flex-col min-w-0">
            {selected ? (
              <Detail mw={selected} installed={isInstalled(selected)} onInstall={() => install(selected)} onBack={() => setSelected(null)} />
            ) : (
              <>
                <Toolbar
                  search={search}
                  onSearch={setSearch}
                  activeCats={activeCats}
                  onToggleCat={toggleCat}
                  show={show}
                  onResetShow={() => setShow('all')}
                  filtersActive={filtersActive}
                  onClearAll={clearAll}
                />
                <div className="flex-1 overflow-auto p-6">
                  {!filtersActive && <Hero onOpen={setSelected} />}
                  {list.length === 0 ? (
                    <EmptyState
                      icon="🔍"
                      title="No widgets match"
                      description="Try a different search or clear your filters."
                      action={
                        <button className="btn-secondary" onClick={clearAll}>
                          Clear filters
                        </button>
                      }
                    />
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}>
                      {list.map((mw) => (
                        <Card
                          key={mw.id}
                          mw={mw}
                          installed={isInstalled(mw)}
                          onInstall={() => install(mw)}
                          onOpen={() => setSelected(mw)}
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
            <strong className="text-gray-900 dark:text-slate-100">{installedCount}</strong> of {MARKETPLACE_WIDGETS.length} added to your catalog
          </span>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Rail({ show, onShow, sort, onSort, counts, activeCats, onToggleCat }) {
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

      <RailLabel>Categories</RailLabel>
      <div className="space-y-0.5">
        {MARKETPLACE_CATEGORIES.map((c) => {
          const on = activeCats.has(c)
          return (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <input type="checkbox" checked={on} onChange={() => onToggleCat(c)} />
              <span className={`flex-1 text-xs ${on ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>
                {c}
              </span>
              <span className="cap-chip cap-chip-neutral !px-1.5">{counts[c]}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function RailLabel({ children }) {
  return (
    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">
      {children}
    </div>
  )
}

function Toolbar({ search, onSearch, activeCats, onToggleCat, show, onResetShow, filtersActive, onClearAll }) {
  return (
    <div className="border-b border-gray-200 px-6 py-3 dark:border-white/10">
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" />
        <input
          className="input h-9 pl-8"
          placeholder="Search the marketplace…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {filtersActive && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {[...activeCats].map((c) => (
            <Chip key={c} onClear={() => onToggleCat(c)}>
              {c}
            </Chip>
          ))}
          {show !== 'all' && <Chip onClear={onResetShow}>{SHOW.find((s) => s.id === show)?.label}</Chip>}
          {search && <Chip onClear={() => onSearch('')}>“{search}”</Chip>}
          <button className="btn-ghost !px-2 !py-1 text-xs" onClick={onClearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({ children, onClear }) {
  return (
    <span className="cap-chip cap-chip-neutral">
      {children}
      <button onClick={onClear} className="hover:text-aims-stale" aria-label="Remove filter">
        <X size={11} />
      </button>
    </span>
  )
}

function Hero({ onOpen }) {
  const featured = MARKETPLACE_WIDGETS.filter((m) => m.featured).slice(0, 2)
  if (!featured.length) return null
  return (
    <div className="mb-5 rounded-xl border border-aims-blue/30 bg-gradient-to-br from-aims-blue/10 to-purple-500/10 p-5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-aims-blue">Featured</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {featured.map((mw) => (
          <button
            key={mw.id}
            onClick={() => onOpen(mw)}
            className="flex items-center gap-3 rounded-lg bg-white/70 p-3 text-left transition-shadow hover:shadow-md dark:bg-white/5"
          >
            <WidgetGlyph skeleton={mw.skeleton} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{mw.name}</div>
              <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{mw.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MakerLine({ maker }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
      by {maker}
      {maker === 'AIMS' && <BadgeCheck size={12} className="text-aims-blue" />}
    </span>
  )
}

function InstallButton({ installed, onInstall, full }) {
  if (installed) {
    return (
      <button className={`btn-secondary ${full ? 'w-full' : ''} cursor-default text-aims-governed dark:opacity-60`} disabled>
        <Check size={15} /> Added
      </button>
    )
  }
  return (
    <button className={`btn-primary ${full ? 'w-full' : ''}`} onClick={(e) => { e.stopPropagation(); onInstall() }}>
      <Plus size={15} /> Add
    </button>
  )
}

function Card({ mw, installed, onInstall, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="catalog-card min-h-[188px] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <WidgetGlyph skeleton={mw.skeleton} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{mw.name}</div>
          <MakerLine maker={mw.maker} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen() }}
          title="View details"
          aria-label="View details"
          className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-aims-blue dark:text-slate-500 dark:hover:bg-white/10"
        >
          <Eye size={14} />
        </button>
      </div>

      <p className="line-clamp-2 text-xs text-gray-500 dark:text-slate-400">{mw.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="cap-chip cap-chip-neutral">{mw.category}</span>
        <span className={`cap-chip ${mw.governed ? 'cap-chip-data' : 'cap-chip-tool'}`}>
          {mw.governed ? 'Governed' : 'Ungoverned'}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
        <span className="text-[11px] text-gray-500 dark:text-slate-400">
          {mw.stats.installs.toLocaleString()} installs · {mw.stats.fields} fields
        </span>
        <InstallButton installed={installed} onInstall={onInstall} />
      </div>
    </div>
  )
}

const PREVIEW_WIDTH = { sm: 'max-w-[240px]', md: 'max-w-md', lg: 'max-w-2xl' }

function Detail({ mw, installed, onInstall, onBack }) {
  const [size, setSize] = useState('lg')
  const sizeMeta = WIDGET_SIZES.find((s) => s.id === size)

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-2.5 dark:border-white/10">
        <button onClick={onBack} className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10" aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <WidgetGlyph skeleton={mw.skeleton} sm />
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{mw.name}</span>
        <MakerLine maker={mw.maker} />
      </div>

      <div className="mx-auto max-w-3xl space-y-5 p-6">
        {/* About this Widget */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">About this Widget</div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{mw.description}</p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-aims-blue/10">
            <LayoutGrid size={18} className="text-aims-blue" />
          </span>
        </div>

        {/* Best for */}
        {mw.bestFor && (
          <div className="flex items-start gap-2.5 rounded-xl border border-aims-blue/30 bg-aims-blue/5 p-4 dark:bg-aims-blue/10">
            <Info size={16} className="mt-0.5 shrink-0 text-aims-blue" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Best for</div>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-300">{mw.bestFor}</p>
            </div>
          </div>
        )}

        {/* Preview with size selector */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Preview</span>
            <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
              {WIDGET_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    size === s.id ? 'bg-aims-blue text-white' : 'text-gray-600 dark:text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6 dark:border-white/10 dark:bg-white/[0.02]">
            <div className={`mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-white/10 dark:bg-[#131a2c] ${PREVIEW_WIDTH[size]}`}>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{mw.name}</div>
              <WidgetRender widget={mw} size={size} />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-slate-400">
            {sizeMeta?.width} · {sizeMeta?.detail}
          </p>
        </div>

        {/* Meta + Add */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="cap-chip cap-chip-neutral">{mw.category}</span>
          <span className={`cap-chip ${mw.governed ? 'cap-chip-data' : 'cap-chip-tool'}`}>
            {mw.governed ? 'Governed' : 'Ungoverned'}
          </span>
          <FreshnessBadge status={mw.freshness} label={mw.freshness} />
          <span className="ml-auto text-[11px] text-gray-500 dark:text-slate-400">{mw.stats.installs.toLocaleString()} installs · {mw.source}</span>
        </div>
        <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-white/10">
          <InstallButton installed={installed} onInstall={onInstall} />
        </div>
      </div>
    </div>
  )
}
