import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Check, Hash, Calendar, Type as TypeIcon } from 'lucide-react'
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
