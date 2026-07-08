import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Check, Hash, Calendar, Type as TypeIcon, X } from 'lucide-react'
import { COLUMN_META } from '../../data/datasets.js'

export const TYPE_LABELS = { string: 'Text', number: 'Number', date: 'Date' }
const TYPE_ICON = { number: Hash, date: Calendar, string: TypeIcon }

export const getColMeta = (col) =>
  COLUMN_META[col] ?? { display_name: col, description: null, type: null }

// ── ColumnChip — selectable tag with structured hover card ────────────────────
export function ColumnChip({ col, active, onClick }) {
  const [showCard, setShowCard] = useState(false)
  const meta = getColMeta(col)
  const Icon = TYPE_ICON[meta.type] ?? TypeIcon

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowCard(true)}
        onMouseLeave={() => setShowCard(false)}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
          active
            ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
        }`}
      >
        <Icon size={10} className="shrink-0 opacity-60" />
        {meta.display_name}
      </button>

      {showCard && (
        <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-52 rounded-xl border border-white/10 bg-[#0d0f14] p-3 shadow-2xl shadow-black/60">
          <p className="text-xs font-semibold text-slate-100">{meta.display_name}</p>
          {meta.description && (
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{meta.description}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-white/[0.07] pt-1.5">
            {meta.type && (
              <span className="text-[10px] text-slate-500">
                Type: <span className="text-slate-400">{TYPE_LABELS[meta.type] ?? meta.type}</span>
              </span>
            )}
            <span className="text-[10px] text-slate-500">
              Internal: <code className="font-mono text-slate-400">{col}</code>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ColumnLibrary — scrollable column picker panel (for large column sets) ──────
function ColumnRow({ col, active, onToggle }) {
  const meta = getColMeta(col)
  const Icon = TYPE_ICON[meta.type] ?? TypeIcon
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.04] ${
        active ? 'bg-blue-500/[0.07]' : ''
      }`}
    >
      {/* Checkbox */}
      <div className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150 ${
        active ? 'border-blue-500 bg-blue-500' : 'border-white/20 bg-transparent'
      }`}>
        {active && <Check size={9} className="text-white" strokeWidth={3} />}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold leading-snug ${active ? 'text-slate-100' : 'text-slate-200'}`}>
            {meta.display_name}
          </span>
          {meta.type && (
            <span className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.05] px-1.5 py-px text-[10px] text-slate-400">
              <Icon size={9} className="shrink-0" />
              {TYPE_LABELS[meta.type] ?? meta.type}
            </span>
          )}
        </div>
        {meta.description && (
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-500">{meta.description}</p>
        )}
        <code className="mt-0.5 block font-mono text-[10px] text-slate-600">{col}</code>
      </div>
    </button>
  )
}

export function ColumnLibrary({ columns = [], selected = [], onToggle }) {
  const [query, setQuery] = useState('')

  const filtered = query
    ? columns.filter((col) => {
        const m = getColMeta(col)
        const q = query.toLowerCase()
        return (
          m.display_name.toLowerCase().includes(q) ||
          col.toLowerCase().includes(q) ||
          (m.description ?? '').toLowerCase().includes(q)
        )
      })
    : columns

  const selectedCount = selected.length
  const allSelected = columns.length > 0 && columns.every((c) => selected.includes(c))
  const toggleAll = () => {
    if (allSelected) {
      columns.forEach((c) => { if (selected.includes(c)) onToggle(c) })
    } else {
      columns.forEach((c) => { if (!selected.includes(c)) onToggle(c) })
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0c11]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search columns…"
            className="h-7 w-full rounded-lg bg-white/5 pl-7 pr-7 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={11} />
            </button>
          )}
        </div>

        {/* Count + select-all */}
        <span className="shrink-0 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-300">{selectedCount}</span> / {columns.length}
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
        >
          {allSelected ? 'None' : 'All'}
        </button>
      </div>

      {/* Column rows */}
      <div className="max-h-[272px] overflow-y-auto divide-y divide-white/[0.04]">
        {filtered.length === 0 ? (
          <p className="px-4 py-5 text-[11px] text-slate-500">
            {query ? 'No columns match your search.' : 'No columns available.'}
          </p>
        ) : (
          filtered.map((col) => (
            <ColumnRow
              key={col}
              col={col}
              active={selected.includes(col)}
              onToggle={() => onToggle(col)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── ColumnSelect — searchable dropdown with structured hover card ──────────────
export default function ColumnSelect({ value, onChange, columns = [], placeholder = 'Column…', disabled = false }) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [hovered, setHovered] = useState(null)
  const wrapRef = useRef(null)

  const isEmpty = columns.length === 0

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onPointer = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    const onKey     = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const filtered = columns.filter((col) => {
    if (!query) return true
    const m = getColMeta(col)
    const q = query.toLowerCase()
    return (
      m.display_name.toLowerCase().includes(q) ||
      col.toLowerCase().includes(q) ||
      (m.description ?? '').toLowerCase().includes(q)
    )
  })

  const selectedMeta = value ? getColMeta(value) : null
  const hoveredMeta  = hovered ? getColMeta(hovered) : null
  const isDisabled   = disabled || isEmpty

  return (
    <div ref={wrapRef} className="relative flex-1">
      {/* Trigger */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => { if (!isDisabled) { setOpen((o) => !o); setQuery(''); setHovered(null) } }}
        className={`flex h-8 w-full items-center justify-between gap-1 rounded-lg border px-2 text-xs transition-colors ${
          isDisabled
            ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-40'
            : open
              ? 'cursor-pointer border-blue-500/40 bg-white/5 text-slate-200 ring-1 ring-blue-500/30'
              : 'cursor-pointer border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
        }`}
      >
        <span className={`truncate ${selectedMeta ? 'text-slate-200' : 'text-slate-500'}`}>
          {selectedMeta ? selectedMeta.display_name : placeholder}
        </span>
        <ChevronDown size={11} className="shrink-0 text-slate-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#0d0f14] shadow-2xl shadow-black/60">
          {/* Search — shown only when there are enough columns to justify it */}
          {columns.length > 5 && (
            <div className="border-b border-white/[0.07] p-2">
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search columns…"
                  className="h-7 w-full rounded-lg bg-white/5 pl-7 pr-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Column list */}
          <div className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-slate-500">
                {query ? 'No columns match' : 'No columns available'}
              </p>
            ) : filtered.map((col) => {
              const m    = getColMeta(col)
              const Icon = TYPE_ICON[m.type] ?? TypeIcon
              return (
                <button
                  key={col}
                  type="button"
                  onMouseEnter={() => setHovered(col)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { onChange(col); setOpen(false); setQuery('') }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-white/5 ${value === col ? 'bg-blue-500/10' : ''}`}
                >
                  <Icon size={10} className="shrink-0 text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs leading-snug ${value === col ? 'font-medium text-blue-300' : 'text-slate-200'}`}>
                      {m.display_name}
                    </p>
                    {m.description && (
                      <p className="truncate text-[10px] text-slate-500">{m.description}</p>
                    )}
                  </div>
                  {value === col && <Check size={9} className="shrink-0 text-blue-400" />}
                </button>
              )
            })}
          </div>

          {/* Hover detail card */}
          {hoveredMeta && (
            <div className="border-t border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
              <p className="text-xs font-semibold text-slate-100">{hoveredMeta.display_name}</p>
              {hoveredMeta.description && (
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{hoveredMeta.description}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-white/[0.07] pt-1.5">
                {hoveredMeta.type && (
                  <span className="text-[10px] text-slate-500">
                    Type: <span className="text-slate-400">{TYPE_LABELS[hoveredMeta.type] ?? hoveredMeta.type}</span>
                  </span>
                )}
                <span className="text-[10px] text-slate-500">
                  Internal: <code className="font-mono text-slate-400">{hovered}</code>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
