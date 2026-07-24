import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, ArrowUpDown } from 'lucide-react'

const STUDIOS = ['GOV', 'AGNT', 'DATA', 'TASK']
const TYPES   = ['Approval', 'Review', 'Remap', 'Respond', 'Resolve', 'Acknowledge', 'Train', 'Task', 'Question']
const SORTS   = [
  { id: 'priority', label: 'Priority' },
  { id: 'time',     label: 'Est. time' },
  { id: 'newest',   label: 'Newest first' },
]
const TIERS = [
  { id: 'all',      label: 'All' },
  { id: 'actnow',   label: 'Act Now',  dot: 'bg-red-500' },
  { id: 'critical', label: 'Critical', dot: 'bg-red-400' },
  { id: 'action',   label: 'Action',   dot: 'bg-amber-400' },
  { id: 'headsup',  label: 'Heads-up', dot: 'bg-slate-400' },
]

function FilterDropdown({ label, items, selected, onToggle, open, onOpen, counts }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          selected.length
            ? 'border-aims-blue bg-aims-blue/[0.07] text-aims-blue dark:bg-aims-blue/10'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.04]'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-aims-blue px-1 py-px text-[9px] font-bold text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[#1a1f2e]">
          {items.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                selected.includes(item)
                  ? 'font-semibold text-aims-blue'
                  : 'text-gray-700 dark:text-slate-300'
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full border-2 transition-all ${
                selected.includes(item)
                  ? 'border-aims-blue bg-aims-blue'
                  : 'border-gray-300 dark:border-slate-600'
              }`} />
              {item}
              {counts && (
                <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-600">{counts[item] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function WQSectionFilterBar({ events, onFilter }) {
  const [search,   setSearch]   = useState('')
  const [studios,  setStudios]  = useState([])
  const [types,    setTypes]    = useState([])
  const [tier,     setTier]     = useState('all')
  const [sort,     setSort]     = useState('priority')
  const [openMenu, setOpenMenu] = useState(null)
  const barRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function apply(q, st, ty, t) {
    const lower = q.toLowerCase()
    let result = events.filter(e => {
      const matchQ  = !q        || e.title.toLowerCase().includes(lower)
      const matchSt = !st.length || st.includes(e.studio)
      const matchTy = !ty.length || ty.includes(e.type)
      const matchT  = t === 'all' || e.tier === t
      return matchQ && matchSt && matchTy && matchT
    })
    if (sort === 'time')   result = [...result].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)
    if (sort === 'newest') result = [...result].reverse()
    onFilter(result)
  }

  function handleSearch(val) { setSearch(val); apply(val, studios, types, tier) }

  function toggleStudio(s) {
    const next = studios.includes(s) ? studios.filter(x => x !== s) : [...studios, s]
    setStudios(next); apply(search, next, types, tier)
  }

  function toggleType(t) {
    const next = types.includes(t) ? types.filter(x => x !== t) : [...types, t]
    setTypes(next); apply(search, studios, next, tier)
  }

  function pickTier(t) { setTier(t); apply(search, studios, types, t) }

  function clearAll() {
    setSearch(''); setStudios([]); setTypes([]); setTier('all')
    onFilter(events)
  }

  const activeCount = (search ? 1 : 0) + studios.length + types.length + (tier !== 'all' ? 1 : 0)
  const hasChips    = studios.length > 0 || types.length > 0

  const tierCounts = TIERS.reduce((acc, t) => {
    acc[t.id] = t.id === 'all' ? events.length : events.filter(e => e.tier === t.id).length
    return acc
  }, {})

  const studioCounts = STUDIOS.reduce((acc, s) => { acc[s] = events.filter(e => e.studio === s).length; return acc }, {})
  const typeCounts   = TYPES.reduce((acc, t)   => { acc[t] = events.filter(e => e.type === t).length;   return acc }, {})

  return (
    <div
      ref={barRef}
      className="border-b border-gray-100 dark:border-white/[0.05]"
    >
      {/* Row 1 — search + dropdowns */}
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="relative w-64">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search events…"
            className="input w-full py-1.5 pl-8 text-xs"
          />
        </div>

        <div className="flex-1" />

        <FilterDropdown
          label="Studio"
          items={STUDIOS}
          selected={studios}
          onToggle={toggleStudio}
          open={openMenu === 'studio'}
          onOpen={() => setOpenMenu(openMenu === 'studio' ? null : 'studio')}
          counts={studioCounts}
        />

        <FilterDropdown
          label="Type"
          items={TYPES.filter(t => typeCounts[t] > 0)}
          selected={types}
          onToggle={toggleType}
          open={openMenu === 'type'}
          onOpen={() => setOpenMenu(openMenu === 'type' ? null : 'type')}
          counts={typeCounts}
        />

        {/* Sort */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.04]"
          >
            <ArrowUpDown size={11} />
            {SORTS.find(s => s.id === sort)?.label}
            <ChevronDown size={11} className={`transition-transform ${openMenu === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          {openMenu === 'sort' && (
            <div className="absolute right-0 top-full z-30 mt-1.5 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[#1a1f2e]">
              {SORTS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setSort(s.id); setOpenMenu(null); apply(search, studios, types, tier) }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                    sort === s.id ? 'font-semibold text-aims-blue' : 'text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all ${sort === s.id ? 'bg-aims-blue' : 'bg-transparent'}`} />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-red-500 dark:text-slate-500"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Row 2 — quick tier chips */}
      <div className="flex items-center gap-1.5 px-5 pb-3">
        {TIERS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => pickTier(t.id)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              tier === t.id
                ? 'border-aims-blue bg-aims-blue text-white'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/[0.06]'
            }`}
          >
            {t.dot && (
              <span className={`h-1.5 w-1.5 rounded-full ${tier === t.id ? 'bg-white/70' : t.dot}`} />
            )}
            {t.label}
            <span className={`tabular-nums text-[10px] ${tier === t.id ? 'text-blue-200' : 'text-gray-400 dark:text-slate-600'}`}>
              {tierCounts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Row 3 — active filter chips */}
      {hasChips && (
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
          {studios.map(s => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full border border-aims-blue/25 bg-aims-blue/[0.07] px-2 py-0.5 text-[10px] font-semibold text-aims-blue dark:bg-aims-blue/10"
            >
              {s}
              <button type="button" onClick={() => toggleStudio(s)} className="transition-colors hover:text-red-400">
                <X size={9} />
              </button>
            </span>
          ))}
          {types.map(t => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full border border-aims-blue/25 bg-aims-blue/[0.07] px-2 py-0.5 text-[10px] font-semibold text-aims-blue dark:bg-aims-blue/10"
            >
              {t}
              <button type="button" onClick={() => toggleType(t)} className="transition-colors hover:text-red-400">
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
