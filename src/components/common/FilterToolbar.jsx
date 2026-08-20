import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, SlidersHorizontal, ChevronDown, ChevronUp,
  X, ArrowUpDown, ArrowUp, ArrowDown, Check,
} from 'lucide-react'

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
            <span className="text-gray-400 dark:text-slate-400">{label}</span>
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
        <ChevronDown size={11} className={`ml-1 flex-shrink-0 text-gray-400 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
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
          <ArrowUpDown size={12} className="text-gray-400 dark:text-slate-400" aria-hidden="true" />
          {currentLabel}
          <ChevronDown size={11} className={`text-gray-400 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
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

// ── Filters Slideout — rich multi-type panel ──────────────────────────────────
// Supported filter types (set via filter.type):
//   'radio'      — radio buttons, single-select (default)
//   'chips'      — pill buttons, single-select
//   'checkboxes' — checkbox list, supports optional o.color dot
//   'avatars'    — avatar circles with initials, single-select
//   'toggles'    — boolean toggle switches; uses filter.toggleOptions + draft object
//
// Draft state: changes inside the slideout only commit on "Apply filters".
// Cancel / Escape / backdrop → discard draft, list unchanged.
function FiltersSlideout({ filters, draft, onDraftChange, onApply, onClose }) {
  const [collapsed, setCollapsed] = useState({})

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function toggleSection(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // 2-letter initials from full name
  function nameInitials(name) {
    return (name ?? '').split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
  }

  // Deterministic avatar color from name string
  const AVATAR_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316']
  function avatarColor(name) {
    let h = 0
    for (let i = 0; i < (name ?? '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
    return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
  }

  const hasAnyActive = filters.some(f => {
    if (f.type === 'toggles') return Object.values(draft[f.id] ?? {}).some(Boolean)
    return draft[f.id] !== (f.options?.[0]?.value ?? 'All')
  })

  // ── section header with collapsible chevron ───────────────────────────────
  function SectionHeader({ id, label }) {
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex w-full items-center justify-between py-0.5"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {label}
        </span>
        <ChevronUp
          size={13}
          className={`flex-shrink-0 text-gray-300 dark:text-slate-600 transition-transform duration-150 ${collapsed[id] ? 'rotate-180' : ''}`}
        />
      </button>
    )
  }

  // ── chips — pill multi-select (click same chip to deselect back to default)
  function renderChips(f) {
    const defaultVal = f.options?.[0]?.value ?? 'All'
    const cur = draft[f.id] ?? defaultVal
    return (
      <div className="flex flex-wrap gap-2 pt-3">
        {(f.options ?? []).slice(1).map(o => {
          const sel = cur === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onDraftChange(prev => ({ ...prev, [f.id]: sel ? defaultVal : o.value }))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                sel
                  ? 'border-aims-blue bg-aims-blue/[0.10] text-aims-blue dark:bg-aims-blue/[0.15]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.12] dark:text-slate-400 dark:hover:border-white/[0.22] dark:hover:bg-white/[0.05]'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }

  // ── checkboxes — square checkbox list, optional o.color dot
  function renderCheckboxes(f) {
    const defaultVal = f.options?.[0]?.value ?? 'All'
    const cur = draft[f.id] ?? defaultVal
    return (
      <div className="space-y-px pt-2">
        {(f.options ?? []).slice(1).map(o => {
          const sel = cur === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onDraftChange(prev => ({ ...prev, [f.id]: sel ? defaultVal : o.value }))}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            >
              <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                sel ? 'border-aims-blue bg-aims-blue' : 'border-gray-300 dark:border-white/[0.20]'
              }`}>
                {sel && <Check size={10} strokeWidth={3} className="text-white" />}
              </span>
              {o.color && (
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: o.color }} />
              )}
              <span className={`flex-1 ${sel ? 'font-semibold text-aims-blue' : 'text-gray-700 dark:text-slate-300'}`}>
                {o.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // ── avatars — colored circles with initials, single-select
  function renderAvatars(f) {
    const defaultVal = f.options?.[0]?.value ?? 'All'
    const cur = draft[f.id] ?? defaultVal
    const people = (f.options ?? []).slice(1)
    const visible = people.slice(0, 9)
    const overflow = people.length - visible.length
    return (
      <div className="flex flex-wrap items-center gap-2 pt-3">
        {visible.map(o => {
          const sel = cur === o.value
          const ini = nameInitials(o.label)
          const bg  = avatarColor(o.label)
          return (
            <button
              key={o.value}
              type="button"
              title={o.label}
              onClick={() => onDraftChange(prev => ({ ...prev, [f.id]: sel ? defaultVal : o.value }))}
              style={{ background: bg }}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white transition-all ${
                sel
                  ? 'ring-2 ring-aims-blue ring-offset-2 ring-offset-white dark:ring-offset-[var(--surface)]'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              {ini}
            </button>
          )
        })}
        {overflow > 0 && (
          <span className="text-[11px] text-gray-400 dark:text-slate-500">+{overflow} more</span>
        )}
      </div>
    )
  }

  // ── toggles — boolean switch list; uses f.toggleOptions + draft[f.id] object
  function renderToggles(f) {
    const draftObj = draft[f.id] ?? {}
    return (
      <div className="space-y-4 pt-3">
        {(f.toggleOptions ?? []).map(opt => {
          const on = draftObj[opt.value] ?? false
          return (
            <div key={opt.value} className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-700 dark:text-slate-300">{opt.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onDraftChange(prev => ({
                  ...prev,
                  [f.id]: { ...(prev[f.id] ?? {}), [opt.value]: !on },
                }))}
                className={`relative inline-flex h-5 w-[34px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                  on ? 'bg-aims-blue' : 'bg-gray-200 dark:bg-white/[0.15]'
                }`}
              >
                <span className={`absolute top-[3px] h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  on ? 'translate-x-[16px]' : 'translate-x-[3px]'
                }`} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  // ── radio — default, existing style
  function renderRadio(f) {
    const defaultVal = f.options?.[0]?.value ?? 'All'
    const cur = draft[f.id] ?? defaultVal
    return (
      <div className="space-y-0.5 pt-1">
        {(f.options ?? []).map(o => {
          const sel = cur === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onDraftChange(prev => ({ ...prev, [f.id]: o.value }))}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${
                sel
                  ? 'bg-aims-blue/[0.08] text-aims-blue dark:bg-aims-blue/[0.12]'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                sel ? 'border-aims-blue bg-aims-blue' : 'border-gray-300 dark:border-white/20'
              }`}>
                {sel && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className={sel ? 'font-semibold' : ''}>{o.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  function renderContent(f) {
    switch (f.type) {
      case 'chips':      return renderChips(f)
      case 'checkboxes': return renderCheckboxes(f)
      case 'avatars':    return renderAvatars(f)
      case 'toggles':    return renderToggles(f)
      default:           return renderRadio(f)
    }
  }

  function clearDraft() {
    const reset = {}
    filters.forEach(f => {
      if (f.type === 'toggles') {
        const cleared = {}
        ;(f.toggleOptions ?? []).forEach(o => { cleared[o.value] = false })
        reset[f.id] = cleared
      } else {
        reset[f.id] = f.options?.[0]?.value ?? 'All'
      }
    })
    onDraftChange(reset)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="All Filters">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative z-10 flex h-full w-[320px] flex-col bg-white shadow-2xl dark:bg-[var(--surface)]"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">All Filters</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/[0.07]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable filter sections */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {filters.map((f, idx) => (
            <div key={f.id}>
              {idx > 0 && (
                <div className="my-4 border-t border-gray-100 dark:border-white/[0.06]" />
              )}
              <SectionHeader id={f.id} label={f.label} />
              {!collapsed[f.id] && renderContent(f)}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          <button
            type="button"
            disabled={!hasAnyActive}
            onClick={clearDraft}
            className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-40 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-9 rounded-lg bg-aims-blue px-5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Active filter chip ─────────────────────────────────────────────────────────
function FilterChip({ label, value, onClear }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-aims-blue/40 bg-aims-blue/[0.08] px-2.5 py-1 text-[11px] font-semibold text-aims-blue dark:border-aims-blue/30 dark:bg-aims-blue/[0.12]">
      <span className="text-gray-400 dark:text-slate-400">{label}:</span>
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
//   filters  — [{id, label, value, onChange, options, type?}]
//              type 'toggles' also needs: toggleOptions, toggleValues, onToggleChange
//   sort     — { value, onChange, options, dir?, onToggleDir? }
//   inlineCount — how many non-toggle filters to show inline (default 2)
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

  // Show non-toggle filters as inline dropdowns
  const nonToggleFilters = filters.filter(f => f.type !== 'toggles')
  const inline           = nonToggleFilters.slice(0, inlineCount)

  // Count all active (non-default) filter values including toggles
  const activeCount = filters.reduce((n, f) => {
    if (f.type === 'toggles') {
      return n + Object.values(f.toggleValues ?? {}).filter(Boolean).length
    }
    return n + (f.value !== (f.options?.[0]?.value ?? 'All') ? 1 : 0)
  }, 0)

  function openSlideout() {
    const d = {}
    filters.forEach(f => {
      if (f.type === 'toggles') {
        d[f.id] = { ...(f.toggleValues ?? {}) }
      } else {
        d[f.id] = f.value
      }
    })
    setDraft(d)
    setSlideoutOpen(true)
  }

  function applyDraft() {
    filters.forEach(f => {
      if (f.type === 'toggles') {
        Object.entries(draft[f.id] ?? {}).forEach(([key, val]) => f.onToggleChange?.(key, val))
      } else if (draft[f.id] !== undefined) {
        f.onChange(draft[f.id])
      }
    })
    setSlideoutOpen(false)
  }

  function cancelSlideout() {
    setSlideoutOpen(false)
  }

  function clearFilter(filterId) {
    const f = filters.find(x => x.id === filterId)
    if (f && f.type !== 'toggles') f.onChange(f.options?.[0]?.value ?? 'All')
  }

  function clearAll() {
    filters.forEach(f => {
      if (f.type !== 'toggles') f.onChange(f.options?.[0]?.value ?? 'All')
    })
  }

  // Active filter chips shown below the bar — exclude toggles
  const activeFilters = filters.filter(f =>
    f.type !== 'toggles' && f.value !== (f.options?.[0]?.value ?? 'All'),
  )

  return (
    <div>
      {/* ── Main bar ── */}
      <div className={`flex items-center gap-2 flex-wrap ${bare ? '' : 'px-6 py-3'}`}>
        {/* Search */}
        <div className="relative w-52 flex-shrink-0">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" aria-hidden="true" />
          <input
            type="search"
            className="input h-9 w-full pl-8 text-xs"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        {/* Inline filter dropdowns (non-toggle only) */}
        {inline.map(f => (
          <FilterDropdown key={f.id} {...f} />
        ))}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* All filters button */}
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
            className="ml-1 text-[11px] font-semibold text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300"
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
