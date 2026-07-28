import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, SlidersHorizontal, ChevronDown, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

// ── Shared close-on-outside-click hook ──────────────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, handler])
}

// ── DS-spec trigger + popover dropdown ──────────────────────────────────────
function FilterDropdown({ label, value, onChange, options, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const defaultVal  = options[0]?.value ?? 'All'
  const isActive    = value !== defaultVal
  const activeLabel = options.find(o => o.value === value)?.label

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex h-9 items-center rounded-lg border px-2.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50
          ${open
            ? 'border-aims-blue/50 bg-aims-blue/[0.06] text-aims-blue dark:border-aims-blue/40 dark:bg-aims-blue/[0.08]'
            : isActive
              ? 'border-aims-blue/35 bg-aims-blue/[0.07] text-aims-blue dark:border-aims-blue/30 dark:bg-aims-blue/[0.10]'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.15]'
          }`}
      >
        {isActive ? (
          <span className="flex items-center gap-1.5">
            <span className="text-gray-400 dark:text-slate-500">{label}</span>
            <span className="flex items-center gap-1 rounded-md border border-aims-blue/35 bg-aims-blue/[0.18] px-1.5 py-px text-[10px] font-bold text-aims-blue dark:border-aims-blue/30 dark:bg-aims-blue/[0.22]">
              <span>{activeLabel}</span>
              <span
                role="button"
                aria-label={`Clear ${label} filter`}
                onClick={e => { e.stopPropagation(); onChange(defaultVal); setOpen(false) }}
                className="rounded p-px hover:bg-aims-blue/30 cursor-pointer"
              >
                <X size={8} />
              </span>
            </span>
          </span>
        ) : (
          <span className="pr-1">{label}</span>
        )}
        <ChevronDown size={11} className={`ml-1 flex-shrink-0 text-gray-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 z-30 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[var(--surface-raised)] dark:shadow-black/40 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                o.value === value ? 'font-semibold text-aims-blue' : 'text-gray-700 dark:text-slate-300'
              }`}
            >
              <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors ${o.value === value ? 'bg-aims-blue' : 'bg-gray-200 dark:bg-white/[0.10]'}`} />
              <span className="flex-1 text-left">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sort dropdown ─────────────────────────────────────────────────────────────
function SortDropdown({ sort }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const currentLabel = sort.options.find(o => o.value === sort.value)?.label ?? 'Sort'

  return (
    <div className="flex items-center gap-1">
      {sort.onToggleDir && (
        <button
          type="button"
          onClick={sort.onToggleDir}
          aria-label={sort.dir === 'asc' ? 'Sort ascending' : 'Sort descending'}
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.15]"
        >
          {sort.dir === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />}
        </button>
      )}

      <div ref={ref} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50
            ${open
              ? 'border-aims-blue/50 bg-aims-blue/[0.06] dark:border-aims-blue/40 dark:bg-aims-blue/[0.08]'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.15]'
            }`}
        >
          <ArrowUpDown size={12} className="text-gray-400 dark:text-slate-500" aria-hidden="true" />
          {currentLabel}
          <ChevronDown size={11} className={`text-gray-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 z-30 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[var(--surface-raised)] dark:shadow-black/40">
            {sort.options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { sort.onChange(o.value); setOpen(false) }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                  o.value === sort.value ? 'font-semibold text-aims-blue' : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${o.value === sort.value ? 'bg-aims-blue' : 'bg-gray-200 dark:bg-white/[0.10]'}`} />
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Filters Slideout — DS pattern ─────────────────────────────────────────────
// Draft state: changes inside the slideout only commit on Apply.
// Cancel / Escape / backdrop → discard draft, list unchanged.
function FiltersSlideout({ filters, draft, onDraftChange, onApply, onClose }) {
  // Trap escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const hasAnyActive = filters.some(f => draft[f.id] !== (f.options[0]?.value ?? 'All'))

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="All filters">
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slideout panel */}
      <div className="relative z-10 flex h-full w-80 flex-col bg-white shadow-2xl dark:bg-[var(--surface)]"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400 dark:text-slate-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">All filters</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable filter sections */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {filters.map(f => {
            const defaultVal = f.options[0]?.value ?? 'All'
            const currentDraft = draft[f.id] ?? defaultVal
            return (
              <div key={f.id}>
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {f.label}
                  </span>
                  {currentDraft !== defaultVal && (
                    <button
                      type="button"
                      onClick={() => onDraftChange(prev => ({ ...prev, [f.id]: defaultVal }))}
                      className="text-[10px] font-medium text-aims-blue hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {f.options.map(o => {
                    const selected = currentDraft === o.value
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => onDraftChange(prev => ({ ...prev, [f.id]: o.value }))}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${
                          selected
                            ? 'bg-aims-blue/[0.08] text-aims-blue dark:bg-aims-blue/[0.12]'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        {/* Radio indicator */}
                        <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                          selected
                            ? 'border-aims-blue bg-aims-blue'
                            : 'border-gray-300 dark:border-white/20'
                        }`}>
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className={selected ? 'font-semibold' : ''}>{o.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={() => {
              const reset = {}
              filters.forEach(f => { reset[f.id] = f.options[0]?.value ?? 'All' })
              onDraftChange(reset)
            }}
            disabled={!hasAnyActive}
            className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-40 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Reset all
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-200 px-4 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              className="h-9 rounded-lg bg-aims-blue px-5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Active filter chip ─────────────────────────────────────────────────────────
function FilterChip({ label, value, onClear }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-aims-blue/40 bg-aims-blue/[0.08] px-2.5 py-1 text-[11px] font-semibold text-aims-blue dark:border-aims-blue/30 dark:bg-aims-blue/[0.12]">
      <span className="text-gray-400 dark:text-slate-500">{label}:</span>
      <span className="max-w-[112px] truncate">{value}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear ${label} filter`}
        className="ml-0.5 rounded-full p-px hover:bg-aims-blue/20"
      >
        <X size={9} />
      </button>
    </span>
  )
}

// ── FilterToolbar ─────────────────────────────────────────────────────────────
// Props:
//   searchValue / onSearch / searchPlaceholder — controlled search input
//   filters  — [{ id, label, value, onChange, options:[{value,label}] }]
//   sort     — { value, onChange, options, dir?, onToggleDir? }
//   inlineCount — how many filters to show inline (rest only in slideout)
//   bare     — drop the border-b chrome for inline use
export default function FilterToolbar({
  searchValue,
  onSearch,
  searchPlaceholder = 'Search…',
  filters = [],
  sort,
  inlineCount = 2,
  bare = false,
}) {
  const [slideoutOpen, setSlideoutOpen] = useState(false)
  const [draft, setDraft]               = useState({})

  const inline     = filters.slice(0, inlineCount)
  const activeCount = filters.filter(f => f.value !== (f.options[0]?.value ?? 'All')).length

  function openSlideout() {
    // Initialise draft from current committed values
    const d = {}
    filters.forEach(f => { d[f.id] = f.value })
    setDraft(d)
    setSlideoutOpen(true)
  }

  function applyDraft() {
    filters.forEach(f => { if (draft[f.id] !== undefined) f.onChange(draft[f.id]) })
    setSlideoutOpen(false)
  }

  function cancelSlideout() {
    setSlideoutOpen(false)
    // draft is discarded — committed values unchanged
  }

  function clearFilter(filterId) {
    const f = filters.find(x => x.id === filterId)
    if (f) f.onChange(f.options[0]?.value ?? 'All')
  }

  function clearAll() {
    filters.forEach(f => f.onChange(f.options[0]?.value ?? 'All'))
  }

  // Active filters that have a non-default value
  const activeFilters = filters.filter(f => f.value !== (f.options[0]?.value ?? 'All'))

  return (
    <div className={bare ? '' : 'border-b border-gray-100 dark:border-white/[0.06]'}>
      {/* ── Main bar ── */}
      <div className={`flex items-center gap-2 flex-wrap ${bare ? '' : 'px-6 py-3'}`}>
        {/* Search */}
        <div className="relative w-52 flex-shrink-0">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" aria-hidden="true" />
          <input
            type="search"
            className="input h-9 w-full pl-8 text-xs"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        {/* Inline filter dropdowns */}
        {inline.map(f => (
          <FilterDropdown key={f.id} {...f} />
        ))}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* All filters button — always visible when there are filters */}
          {filters.length > 0 && (
            <button
              type="button"
              onClick={openSlideout}
              aria-haspopup="dialog"
              aria-expanded={slideoutOpen}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50
                ${activeCount > 0
                  ? 'border-aims-blue/40 bg-aims-blue/[0.06] text-aims-blue dark:border-aims-blue/35 dark:bg-aims-blue/[0.08]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.15]'
                }`}
            >
              <SlidersHorizontal size={13} aria-hidden="true" />
              All filters
              {activeCount > 0 && (
                <span className="rounded-md bg-aims-blue/20 px-1.5 py-px text-[10px] font-bold text-aims-blue">
                  {activeCount}
                </span>
              )}
            </button>
          )}

          {/* Sort */}
          {sort && <SortDropdown sort={sort} />}
        </div>
      </div>

      {/* ── Active filter chips row ── */}
      {activeFilters.length > 0 && (
        <div className={`flex flex-wrap items-center gap-1.5 pb-3 ${bare ? '' : 'px-6'}`}>
          {activeFilters.map(f => {
            const activeLabel = f.options.find(o => o.value === f.value)?.label ?? f.value
            return (
              <FilterChip
                key={f.id}
                label={f.label}
                value={activeLabel}
                onClear={() => clearFilter(f.id)}
              />
            )
          })}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-[11px] font-semibold text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Filters Slideout ── */}
      {slideoutOpen && (
        <FiltersSlideout
          filters={filters}
          draft={draft}
          onDraftChange={setDraft}
          onApply={applyDraft}
          onClose={cancelSlideout}
        />
      )}
    </div>
  )
}
