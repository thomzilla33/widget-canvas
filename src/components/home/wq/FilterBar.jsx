import { useState } from 'react'
import { Search, X } from 'lucide-react'

const STUDIOS = ['GOV', 'AGNT', 'DATA', 'TASK']
const EVENT_TYPES = ['HTL Continuation', 'Handoff', 'Ask', 'Train Me', 'Promotion', 'Review', 'Break Glass', 'Operations']

export function FilterBar({ events, onFilter }) {
  const [search, setSearch]           = useState('')
  const [studios, setStudios]         = useState([])
  const [types, setTypes]             = useState([])
  const [customerOnly, setCustomerOnly] = useState(false)

  function toggleStudio(s) {
    const next = studios.includes(s) ? studios.filter(x => x !== s) : [...studios, s]
    setStudios(next)
    apply(search, next, types, customerOnly)
  }

  function toggleType(t) {
    const next = types.includes(t) ? types.filter(x => x !== t) : [...types, t]
    setTypes(next)
    apply(search, studios, next, customerOnly)
  }

  function toggleCustomer() {
    const next = !customerOnly
    setCustomerOnly(next)
    apply(search, studios, types, next)
  }

  function handleSearch(val) {
    setSearch(val)
    apply(val, studios, types, customerOnly)
  }

  function apply(q, st, ty, cust) {
    const lower = q.toLowerCase()
    onFilter(events.filter(e => {
      const matchQ    = !q       || e.title.toLowerCase().includes(lower)
      const matchSt   = !st.length || st.includes(e.studio)
      const matchTy   = !ty.length || ty.includes(e.wqType)
      const matchCust = !cust    || e.customer === true
      return matchQ && matchSt && matchTy && matchCust
    }))
  }

  function clearAll() {
    setSearch(''); setStudios([]); setTypes([]); setCustomerOnly(false)
    onFilter(events)
  }

  const customerCount = events.filter(e => e.customer).length
  const activeCount = (search ? 1 : 0) + studios.length + types.length + (customerOnly ? 1 : 0)

  // live type counts from full events (unfiltered)
  const typeCounts = EVENT_TYPES.reduce((acc, t) => {
    acc[t] = events.filter(e => e.wqType === t).length
    return acc
  }, {})

  return (
    <div className="space-y-2 border-b border-gray-100 px-3 py-2.5 dark:border-white/[0.05]">
      {/* Search */}
      <div className="relative">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search events…"
          className="input w-full pl-7 text-xs"
        />
      </div>

      {/* Studio chips */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">Studio</span>
        {STUDIOS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => toggleStudio(s)}
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
              studios.includes(s)
                ? 'bg-aims-blue text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Type chips with live counts */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">Type</span>
        {EVENT_TYPES.filter(t => typeCounts[t] > 0).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => toggleType(t)}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors ${
              types.includes(t)
                ? 'bg-aims-blue text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/10'
            }`}
          >
            {t}
            <span className={`font-bold ${types.includes(t) ? 'text-blue-200' : 'text-gray-400 dark:text-slate-400'}`}>
              {typeCounts[t]}
            </span>
          </button>
        ))}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-medium text-gray-400 hover:text-red-500 dark:text-slate-400"
          >
            <X size={9} aria-hidden="true" /> Clear all
          </button>
        )}
      </div>

      {/* Subject tag filter */}
      {customerCount > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">Subject</span>
          <button
            type="button"
            onClick={toggleCustomer}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors ${
              customerOnly
                ? 'bg-blue-600 text-white'
                : 'border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-400/[0.07] dark:text-blue-400 dark:hover:bg-blue-400/[0.12]'
            }`}
          >
            Customer
            <span className={`font-bold ${customerOnly ? 'text-blue-200' : 'text-blue-400 dark:text-blue-400'}`}>
              {customerCount}
            </span>
          </button>
        </div>
      )}

    </div>
  )
}
