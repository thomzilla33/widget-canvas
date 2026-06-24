import { useState, useRef, useEffect } from 'react'
import { Search, Building2, UserRound, UserCheck, Handshake, LifeBuoy, ChevronLeft, Check } from 'lucide-react'
import { entities } from '../../data/mock.js'
import { cn } from '@/lib/utils'

const TYPE_META = {
  Account:  { icon: Building2, color: '#155DFC', label: 'Account' },
  Contact:  { icon: UserRound,  color: '#7C3AED', label: 'Contact' },
  Employee: { icon: UserCheck,  color: '#D97706', label: 'Employee' },
  Deal:     { icon: Handshake,  color: '#059669', label: 'Deal' },
  Case:     { icon: LifeBuoy,   color: '#DC2626', label: 'Case' },
}

function initialsOf(name) {
  return (name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '?'
}

function Avatar({ entity, size = 'md' }) {
  const meta = TYPE_META[entity.type] || TYPE_META.Account
  const sz = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
  return (
    <span
      className={`${sz} grid shrink-0 place-items-center rounded-full font-bold text-white`}
      style={{ background: meta.color }}
    >
      {initialsOf(entity.name)}
    </span>
  )
}

function EntityRow({ entity, selected, focused, onSelect, onHover, optId }) {
  const meta = TYPE_META[entity.type] || TYPE_META.Account
  const Icon = meta.icon
  const ref = useRef(null)

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [focused])

  return (
    <div
      id={optId}
      ref={ref}
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(entity.id)}
      onMouseEnter={onHover}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors select-none',
        focused ? 'bg-aims-blue/10 dark:bg-aims-blue/15' : 'hover:bg-gray-50 dark:hover:bg-white/5',
        selected && !focused && 'bg-aims-blue/5 dark:bg-aims-blue/10'
      )}
    >
      <Avatar entity={entity} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{entity.name}</span>
          {selected && <Check size={12} className="shrink-0 text-aims-blue" aria-hidden="true" />}
        </div>
        <div className="flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-slate-400">
          <Icon size={10} className="shrink-0" aria-hidden="true" />
          <span>{entity.type}</span>
          {(entity.title || entity.company) && (
            <span className="truncate">&middot; {entity.title || entity.company}</span>
          )}
        </div>
      </div>
      {entity.status && (
        <span className="shrink-0 max-w-[100px] truncate text-right text-[10px] text-gray-400 dark:text-slate-500">
          {entity.status}
        </span>
      )}
    </div>
  )
}

function SelectedRecord({ entity, onChange }) {
  const meta = TYPE_META[entity.type] || TYPE_META.Account
  const Icon = meta.icon
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
      <Avatar entity={entity} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{entity.name}</div>
        <div className="flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-slate-400">
          <Icon size={10} className="shrink-0" aria-hidden="true" />
          <span>{entity.type}</span>
          {(entity.title || entity.company) && (
            <span className="truncate">&middot; {entity.title || entity.company}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-aims-blue hover:text-aims-blue dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:border-aims-blue dark:hover:text-aims-blue"
      >
        Change
      </button>
    </div>
  )
}

// Searchable combobox for picking a specific entity record instance.
// entityType filters to a single type (e.g. 'Account'); omit to search all.
export default function EntityRecordPicker({ entityType, value, onChange }) {
  const [editing, setEditing] = useState(!value)
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const searchRef = useRef(null)

  const pool = entityType ? entities.filter((e) => e.type === entityType) : entities
  const selected = pool.find((e) => e.id === value) || null

  useEffect(() => {
    if (editing) searchRef.current?.focus()
  }, [editing])

  if (selected && !editing) {
    return (
      <SelectedRecord
        entity={selected}
        onChange={() => { setEditing(true); setQuery('') }}
      />
    )
  }

  const q = query.trim().toLowerCase()
  const filtered = q
    ? pool.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        (e.company || '').toLowerCase().includes(q) ||
        (e.title || '').toLowerCase().includes(q) ||
        (e.status || '').toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      )
    : pool

  const pick = (id) => { onChange(id); setEditing(false); setQuery('') }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIdx >= 0 && filtered[focusedIdx]) pick(filtered[focusedIdx].id)
    } else if (e.key === 'Escape') {
      if (selected) { setEditing(false); setQuery('') }
    }
  }

  const typeName = entityType || 'entity'

  return (
    <div className="mt-2 space-y-1.5" role="combobox" aria-expanded="true" aria-haspopup="listbox">
      {selected && (
        <button
          type="button"
          onClick={() => { setEditing(false); setQuery('') }}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-aims-blue dark:text-slate-400 dark:hover:text-aims-blue"
        >
          <ChevronLeft size={13} aria-hidden="true" /> Keep {selected.name}
        </button>
      )}

      {/* Search input */}
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" aria-hidden="true" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFocusedIdx(-1) }}
          onKeyDown={handleKeyDown}
          placeholder={`Search ${typeName} records…`}
          autoComplete="off"
          aria-label={`Search ${typeName} records`}
          aria-controls="entity-record-listbox"
          aria-activedescendant={focusedIdx >= 0 && filtered[focusedIdx] ? `erp-${filtered[focusedIdx].id}` : undefined}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-aims-blue focus:outline-none focus:ring-2 focus:ring-aims-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-aims-blue/60"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setFocusedIdx(-1); searchRef.current?.focus() }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            &#x2715;
          </button>
        )}
      </div>

      {/* Results */}
      <div
        id="entity-record-listbox"
        role="listbox"
        aria-label={`${typeName} records`}
        className="max-h-[220px] space-y-0.5 overflow-auto"
      >
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
              No {typeName} records match &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Try a name, company, title, or status.
            </p>
          </div>
        ) : (
          filtered.map((e, i) => (
            <EntityRow
              key={e.id}
              entity={e}
              selected={value === e.id}
              focused={focusedIdx === i}
              optId={`erp-${e.id}`}
              onSelect={pick}
              onHover={() => setFocusedIdx(i)}
            />
          ))
        )}
      </div>

      <p className="text-[10px] text-gray-400 dark:text-slate-500">
        {q ? `${filtered.length} of ${pool.length}` : pool.length} {typeName} record{pool.length !== 1 ? 's' : ''} in your workspace
      </p>
    </div>
  )
}
