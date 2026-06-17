import { useState } from 'react'
import { Search, SlidersHorizontal, ArrowUp, ArrowDown } from 'lucide-react'

// Design-system filter/search toolbar — the canonical pattern for every list/catalog:
// Search + inline "main filter" dropdowns (left) · All filters + sort dir + sort field (right).
// Filters are [{ id, label, value, onChange, options:[{value,label}] }]. The first `inlineCount`
// show inline; ALL of them are reachable from the "All filters" popover (and on mobile).

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="inline-flex shrink-0 items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
      <span className="font-medium">{label}</span>
      <select
        className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

// `bare` drops the full-bleed sub-header chrome (border-b + page padding) so the toolbar
// can sit inline as a section header (e.g. above a sub-list on a workspace page).
export default function FilterToolbar({ searchValue, onSearch, searchPlaceholder = 'Search…', filters = [], sort, inlineCount = 2, bare = false }) {
  const [allOpen, setAllOpen] = useState(false)
  const inline = filters.slice(0, inlineCount)

  return (
    <div className={`flex items-center gap-2 flex-wrap ${bare ? '' : 'px-6 py-3 border-b border-gray-200 dark:border-white/10'}`}>
      <div className="relative w-full sm:w-auto">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" aria-hidden="true" />
        <input className="input h-9 w-full sm:w-52 pl-8" placeholder={searchPlaceholder} value={searchValue} onChange={(e) => onSearch(e.target.value)} />
      </div>

      {inline.map((f) => (
        <FilterSelect key={f.id} {...f} />
      ))}

      <div className="ml-auto flex items-center gap-2">
        {filters.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAllOpen((o) => !o)}
              aria-expanded={allOpen}
              aria-haspopup="menu"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <SlidersHorizontal size={14} aria-hidden="true" /> All filters
            </button>
            {allOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAllOpen(false)} aria-hidden="true" />
                <div role="menu" className="absolute right-0 z-20 mt-1 w-60 space-y-2.5 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-[#131a2c]">
                  {filters.map((f) => (
                    <div key={f.id}>
                      <div className="mb-1 text-[11px] font-semibold text-gray-700 dark:text-slate-200">{f.label}</div>
                      <select className="input h-8 w-full text-xs" value={f.value} onChange={(e) => f.onChange(e.target.value)} aria-label={f.label}>
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {sort && (
          <>
            <button
              type="button"
              onClick={sort.onToggleDir}
              title={`Sort ${sort.dir === 'asc' ? 'ascending' : 'descending'}`}
              aria-label={`Sort direction: ${sort.dir === 'asc' ? 'ascending' : 'descending'}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-slate-400 dark:hover:bg-white/5"
            >
              {sort.dir === 'asc' ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />}
            </button>
            <select className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs" value={sort.value} onChange={(e) => sort.onChange(e.target.value)} aria-label="Sort by">
              {sort.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  )
}
