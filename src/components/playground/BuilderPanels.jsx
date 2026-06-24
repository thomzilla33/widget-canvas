import { useState, useRef, useEffect } from 'react'
import {
  Hash,
  LineChart,
  BarChart3,
  PieChart,
  Table2,
  Grid3x3,
  ScatterChart,
  GalleryHorizontalEnd,
  Gauge,
  List,
  Sparkles,
  Map as MapIcon,
  Filter,
  Columns3,
  Rss,
  Bell,
  Rows3,
  Lock,
  Check,
  Search,
  Database,
  ChevronLeft,
  Building2,
  UserRound,
  TrendingUp,
  LifeBuoy,
  Users,
  Workflow,
  MessageSquare,
  IdCard,
  ChevronDown,
  ExternalLink,
  SortAsc,
  SortDesc,
  ToggleLeft,
} from 'lucide-react'
import { EmptyState, ConnectionBadge } from '../common/index.jsx'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { EXTERNAL_SOURCES, WIDGET_TYPES, TYPE_LABEL } from '../../data/mock.js'
import { MODEL_ENTITIES, ENTITY_CATEGORIES, ENTITY_FIELDS } from '../../data/entities.js'
import { dimensionsFor, bindSlots, TRANSFORMS, AGGREGATIONS } from '../../data/fields.js'
import { fitScore } from '../../data/preview.js'

const TYPE_ICONS = {
  Hash,
  LineChart,
  BarChart3,
  PieChart,
  Table2,
  Grid3x3,
  ScatterChart,
  GalleryHorizontalEnd,
  Gauge,
  List,
  Sparkles,
  Map: MapIcon,
  Filter,
  Columns3,
  Rss,
  Bell,
  Rows3,
  IdCard,
}

const ENTITY_ICONS = {
  Building2,
  UserRound,
  TrendingUp,
  LifeBuoy,
  Users,
  Workflow,
  MessageSquare,
}

export const FRESHNESS_OPTIONS = [
  { value: 'realtime', label: 'Real-time (Live)' },
  { value: '15m', label: 'Fresh within 15 min' },
  { value: '1h', label: 'Fresh within 1 hour' },
  { value: '24h', label: 'Fresh within 24 hours' },
]

export function SectionHeading({ n, title, sub }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aims-blue/10 text-[11px] font-bold text-aims-blue">{n}</span>
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</div>
        {sub && <div className="text-xs text-gray-500 dark:text-slate-400">{sub}</div>}
      </div>
    </div>
  )
}

/* ── 1. Source picker — your connected sources, searchable + grouped.
   The full 40+ catalog lives behind "Browse all sources" (the marketplace). ── */
function groupByCategory(sources) {
  const map = new Map()
  for (const s of sources) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()]
}

export function SourcePicker({ sourceId, onSelect, onBrowse }) {
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(false)
  const selected = EXTERNAL_SOURCES.find((s) => s.id === sourceId)

  // Collapsed state: once a source is chosen, show it as locked-in and let
  // everything below build on it. "Change" re-opens the picker.
  if (selected && !editing) {
    return <SelectedSource source={selected} onChange={() => { setQ(''); setEditing(true) }} />
  }

  // Show connected sources; if the chosen source isn't connected (picked from
  // the catalog), surface it at the top so the selection stays visible.
  let pool = EXTERNAL_SOURCES.filter((s) => s.connected)
  if (selected && !selected.connected) pool = [selected, ...pool]

  const query = q.trim().toLowerCase()
  const filtered = query
    ? pool.filter((s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query))
    : pool
  const groups = groupByCategory(filtered)
  const pick = (id) => { onSelect(id); setEditing(false) }

  return (
    <div className="space-y-3">
      {selected && (
        <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-aims-blue dark:text-slate-400">
          <ChevronLeft size={13} aria-hidden="true" /> Keep {selected.name}
        </button>
      )}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400" />
        <input
          className="input h-9 pl-8"
          placeholder="Search your connected sources…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400 dark:border-white/10 dark:text-slate-500">
          No connected sources match. Browse the catalog to connect more.
        </div>
      ) : (
        <div className="max-h-[340px] space-y-3 overflow-auto pr-1">
          {groups.map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{cat}</div>
              <div className="space-y-1.5">
                {items.map((s) => (
                  <SourceRow key={s.id} source={s} selected={sourceId === s.id} onSelect={pick} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" size="default" onClick={onBrowse} className="w-full">
        <Database size={15} /> Browse all {EXTERNAL_SOURCES.length} sources
      </Button>
    </div>
  )
}

// Locked-in source: a compact confirmation card with a Change affordance.
function SelectedSource({ source, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-aims-blue/40 bg-aims-blue/5 p-3 dark:bg-aims-blue/10">
      <span className="logo-sq !h-9 !w-9 !text-[11px]" style={{ background: source.logoColor }}>{source.initials}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{source.name}</span>
          <Check size={13} className="shrink-0 text-aims-blue" aria-hidden="true" />
          {source.hasPII && <Lock size={11} className="shrink-0 text-gray-500 dark:text-slate-400" />}
        </div>
        <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{source.category}</div>
      </div>
      <ConnectionBadge status={source.status} />
      <Button variant="secondary" size="sm" onClick={onChange} className="shrink-0">Change</Button>
    </div>
  )
}

function SourceRow({ source, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(source.id)}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-left transition-shadow hover:bg-gray-50 hover:shadow-sm dark:hover:bg-white/5 ${
        selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : 'border-gray-200 dark:border-white/10'
      }`}
    >
      <span className="logo-sq !h-8 !w-8 !text-[10px]" style={{ background: source.logoColor }}>{source.initials}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{source.name}</div>
        <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{source.category}</div>
      </div>
      {source.hasPII && <Lock size={12} className="shrink-0 text-gray-500 dark:text-slate-400" />}
      <ConnectionBadge status={source.status} />
    </button>
  )
}

/* ── 1b. Entity picker — model entities from the semantic layer (replaces SourcePicker in builder) ── */
function groupEntitiesByCategory(entities) {
  const map = new Map()
  for (const e of entities) {
    if (!map.has(e.category)) map.set(e.category, [])
    map.get(e.category).push(e)
  }
  return [...map.entries()]
}

export function EntityPicker({ entityId, onSelect }) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const searchRef = useRef(null)
  const listRef = useRef(null)
  const selected = MODEL_ENTITIES.find((e) => e.id === entityId) || null

  // Auto-focus search when picker opens
  useEffect(() => {
    if (!selected || editing) {
      searchRef.current?.focus()
    }
  }, [editing]) // eslint-disable-line react-hooks/exhaustive-deps

  if (selected && !editing) {
    return <SelectedEntity entity={selected} onChange={() => { setEditing(true); setQuery('') }} />
  }

  const q = query.trim().toLowerCase()
  const filtered = q
    ? MODEL_ENTITIES.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.poweredBy.some((p) => p.toLowerCase().includes(q))
      )
    : MODEL_ENTITIES

  const groups = q ? null : groupEntitiesByCategory(MODEL_ENTITIES)

  const pick = (id) => { onSelect(id); setEditing(false); setQuery('') }

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

  return (
    <div className="space-y-2" role="combobox" aria-expanded="true" aria-haspopup="listbox">
      {/* Cancel / back link */}
      {selected && (
        <button
          onClick={() => { setEditing(false); setQuery('') }}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-aims-blue dark:text-slate-400 dark:hover:text-aims-blue transition-colors"
        >
          <ChevronLeft size={13} aria-hidden="true" /> Keep {selected.name}
        </button>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" aria-hidden="true" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFocusedIdx(-1) }}
          onKeyDown={handleKeyDown}
          placeholder="Search entities — customers, deals, tickets…"
          aria-label="Search data entities"
          aria-controls="entity-listbox"
          aria-activedescendant={focusedIdx >= 0 && filtered[focusedIdx] ? `entity-opt-${filtered[focusedIdx].id}` : undefined}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-aims-blue focus:outline-none focus:ring-2 focus:ring-aims-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-aims-blue/60"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setFocusedIdx(-1); searchRef.current?.focus() }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Entity list */}
      <div
        id="entity-listbox"
        ref={listRef}
        role="listbox"
        aria-label="Data entities"
        className="max-h-[340px] overflow-auto pr-0.5 space-y-0.5"
      >
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">No entities match "{query}"</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Try "customers", "deals", "tickets", or "workflows"
            </p>
          </div>
        ) : q ? (
          // Flat filtered results
          <div className="space-y-1.5 py-0.5">
            <p className="px-1 text-[10px] text-gray-400 dark:text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map((e, i) => (
              <EntityRow
                key={e.id}
                entity={e}
                selected={entityId === e.id}
                focused={focusedIdx === i}
                optId={`entity-opt-${e.id}`}
                onSelect={pick}
                onHover={() => setFocusedIdx(i)}
              />
            ))}
          </div>
        ) : (
          // Grouped by category
          groups.map(([cat, items]) => (
            <div key={cat} className="py-1">
              <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">{cat}</div>
              <div className="space-y-1">
                {items.map((e) => {
                  const globalIdx = filtered.indexOf(e)
                  return (
                    <EntityRow
                      key={e.id}
                      entity={e}
                      selected={entityId === e.id}
                      focused={focusedIdx === globalIdx}
                      optId={`entity-opt-${e.id}`}
                      onSelect={pick}
                      onHover={() => setFocusedIdx(globalIdx)}
                    />
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[10px] text-gray-400 dark:text-slate-500">
        Entities are pre-resolved models — ETL lives in Data Studio.
      </p>
    </div>
  )
}

function SelectedEntity({ entity, onChange }) {
  const Icon = ENTITY_ICONS[entity.iconName] || Database
  return (
    <div className="flex items-center gap-3 rounded-lg border border-aims-blue/40 bg-aims-blue/5 p-3 dark:bg-aims-blue/10">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: entity.color }}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{entity.name}</span>
          <Check size={13} className="shrink-0 text-aims-blue" aria-hidden="true" />
          {entity.hasPII && <Lock size={11} className="shrink-0 text-amber-500" title="Contains PII" />}
        </div>
        <div className="flex flex-wrap items-center gap-1 mt-0.5">
          <span className="text-[11px] text-gray-500 dark:text-slate-400">{entity.label}</span>
          <span className="text-[10px] text-gray-300 dark:text-slate-600">·</span>
          {entity.poweredBy.map((src) => (
            <span key={src} className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">{src}</span>
          ))}
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={onChange} className="shrink-0">Change</Button>
    </div>
  )
}

function EntityRow({ entity, selected, focused, optId, onSelect, onHover }) {
  const Icon = ENTITY_ICONS[entity.iconName] || Database
  const totalMetrics = entity.metrics.length
  const totalRecords = entity.recordSets.length
  return (
    <button
      id={optId}
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(entity.id)}
      onMouseEnter={onHover}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-2.5 text-left transition-all duration-150
        ${selected
          ? 'border-aims-blue bg-aims-blue/5 ring-2 ring-aims-blue/20 dark:bg-aims-blue/10'
          : focused
            ? 'border-aims-blue/50 bg-gray-50 dark:border-aims-blue/30 dark:bg-white/5'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 dark:border-white/8 dark:hover:border-white/15 dark:hover:bg-white/[0.04]'
        }`}
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: entity.color }}>
        <Icon size={14} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{entity.name}</span>
          {entity.hasPII && <Lock size={10} className="shrink-0 text-amber-500" title="Contains PII" />}
          {selected && <Check size={11} className="shrink-0 text-aims-blue" />}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-slate-400">{entity.label}</div>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-400 dark:text-slate-500">{entity.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            {totalMetrics}m · {totalRecords}r · {entity.recordCount.toLocaleString()} records
          </span>
          {entity.poweredBy.map((src) => (
            <span key={src} className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">{src}</span>
          ))}
        </div>
      </div>
    </button>
  )
}

/* ── 2. Metric / record picker — aggregate Metrics + row-level Record sets ── */
export function MetricPicker({ source, metricId, onSelect }) {
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  if (!source) {
    return <EmptyState icon="🔌" title="Pick an entity first" description="Choose a data entity above to see its available metrics and record sets." />
  }
  const { metrics, recordSets } = source
  const totalItems = metrics.length + recordSets.length
  if (!totalItems) {
    return <EmptyState icon="📭" title="Nothing to map yet" description="This source doesn't expose any metrics or records." />
  }

  const q = query.trim().toLowerCase()
  const filteredMetrics = q ? metrics.filter((m) => m.name.toLowerCase().includes(q)) : metrics
  const filteredRecords = q ? recordSets.filter((r) => r.name.toLowerCase().includes(q)) : recordSets
  const noResults = q && !filteredMetrics.length && !filteredRecords.length

  return (
    <div className="space-y-3">
      {/* Search bar — only when there are enough items to warrant it */}
      {totalItems > 5 && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" aria-hidden="true" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter metrics and record sets…"
            aria-label="Filter available metrics"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-8 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-aims-blue focus:outline-none focus:ring-2 focus:ring-aims-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-aims-blue/60"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); searchRef.current?.focus() }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
              aria-label="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {noResults ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-200">No results for "{query}"</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Try a shorter keyword</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMetrics.length > 0 && (
            <FieldSection title="Metrics" hint={`${filteredMetrics.length} aggregated`}>
              {filteredMetrics.map((m) => (
                <FieldButton key={m.id} field={m} selected={metricId === m.id} onSelect={onSelect} />
              ))}
            </FieldSection>
          )}
          {filteredRecords.length > 0 && (
            <FieldSection title="Record sets" hint={`${filteredRecords.length} row-level`}>
              {filteredRecords.map((r) => (
                <FieldButton key={r.id} field={r} selected={metricId === r.id} onSelect={onSelect} />
              ))}
            </FieldSection>
          )}
        </div>
      )}
    </div>
  )
}

function FieldSection({ title, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{title}</span>
        <span className="text-[10px] text-gray-500 dark:text-slate-400">{hint}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function FieldButton({ field, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(field.id)}
      className={`card flex w-full cursor-pointer items-center justify-between gap-2 p-3 text-left transition-shadow hover:bg-gray-50 hover:shadow-md dark:hover:bg-white/5 ${
        selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : ''
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-slate-100">{field.name}</span>
        {field.entityType && (
          <span className="block text-[11px] text-gray-500 dark:text-slate-400">
            {field.entityType} · {field.count.toLocaleString()} rows{field.hasPII ? ' · PII' : ''}
          </span>
        )}
      </span>
      <Tag variant="neutral" size="sm" className="shrink-0">Rec: {TYPE_LABEL[field.recommendedType]}</Tag>
    </button>
  )
}

/* ── 3. Widget type gallery — grouped into Statistical and Data Display ── */
// W8: separate statistical (charts/metrics) from data display (row-level views)
const STATISTICAL_CATS = new Set(['Metric', 'Trend', 'Breakdown', 'Relationship', 'Geo', 'Narrative'])
const DATA_DISPLAY_CATS = new Set(['Records', 'Status', 'Activity'])
const CONSUMPTION_CATS = new Set(['Consumption'])

function TypeTile({ t, typeId, metric, onSelect }) {
  const Icon = TYPE_ICONS[t.iconName] || Hash
  const recommended = metric && metric.recommendedType === t.id
  const poor = metric && fitScore(metric.kind, t.id) === 'poor'
  return (
    <button
      key={t.id}
      onClick={() => onSelect(t.id)}
      title={t.label}
      className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-all ${
        typeId === t.id
          ? 'border-aims-blue bg-aims-blue/10 text-aims-blue'
          : 'border-gray-200 text-gray-600 hover:border-aims-blue/40 dark:border-white/10 dark:text-slate-300'
      } ${poor && typeId !== t.id ? 'opacity-45' : ''}`}
    >
      {recommended && (
        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-aims-governed text-white" title="Recommended">
          <Check size={11} />
        </span>
      )}
      <Icon size={18} />
      <span className="text-[10px] font-medium leading-tight">{t.label}</span>
    </button>
  )
}

export function TypeGallery({ typeId, metric, onSelect }) {
  const statistical = WIDGET_TYPES.filter((t) => STATISTICAL_CATS.has(t.category))
  const dataDisplay = WIDGET_TYPES.filter((t) => DATA_DISPLAY_CATS.has(t.category))
  const consumption = WIDGET_TYPES.filter((t) => CONSUMPTION_CATS.has(t.category))

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Statistical</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">Charts, KPIs, gauges</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {statistical.map((t) => <TypeTile key={t.id} t={t} typeId={typeId} metric={metric} onSelect={onSelect} />)}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Data Display</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">Record lists, profile cards, tables</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {dataDisplay.map((t) => <TypeTile key={t.id} t={t} typeId={typeId} metric={metric} onSelect={onSelect} />)}
        </div>
      </div>

      {consumption.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Consumption</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">Credits, tokens, cost</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {consumption.map((t) => <TypeTile key={t.id} t={t} typeId={typeId} metric={metric} onSelect={onSelect} />)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 3b. Slice by — pick a dimension to break the measure down (Phase 1). ── */
export function DimensionPicker({ source, measure, dimensionId, onSelect }) {
  if (!measure) {
    return <p className="text-xs text-gray-500 dark:text-slate-400">Pick a measure first to choose how to slice it.</p>
  }
  const dims = dimensionsFor(source, measure)
  return (
    <div className="flex flex-wrap gap-1.5">
      {dims.map((d) => (
        <button
          key={d.id}
          onClick={() => onSelect(d.id)}
          aria-pressed={dimensionId === d.id}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            dimensionId === d.id
              ? 'border-aims-blue bg-aims-blue/10 text-aims-blue'
              : 'border-gray-200 text-gray-600 hover:border-aims-blue/40 dark:border-white/10 dark:text-slate-300'
          }`}
        >
          {d.id === 'none' ? 'No breakdown' : `by ${d.name}`}
        </button>
      ))}
    </div>
  )
}

/* ── Slots — how the chosen fields bind to the tile's slots (Phase 1.2). ── */
export function SlotPanel({ typeId, measure, dimension, transform }) {
  if (!typeId || !measure) return null
  const rows = bindSlots(typeId, measure, dimension, transform)
  return (
    <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
      {rows.map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
            <span className={`grid h-4 w-4 place-items-center rounded text-[9px] font-bold ${ROLE_CHIP[s.role] || ROLE_CHIP.m}`}>{ROLE_GLYPH[s.role] || 'M'}</span>
            {s.label}
            {s.optional && <span className="text-[10px] text-gray-400 dark:text-slate-500">optional</span>}
          </span>
          <span className={`truncate font-medium ${s.bound === '—' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-slate-100'}`}>{s.bound}</span>
        </div>
      ))}
    </div>
  )
}
const ROLE_CHIP = {
  m: 'bg-aims-blue/15 text-aims-blue',
  d: 'bg-purple-500/15 text-purple-600 dark:text-purple-300',
  md: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  t: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  records: 'bg-gray-500/15 text-gray-500 dark:text-slate-400',
}
const ROLE_GLYPH = { m: 'M', d: 'D', md: 'F', t: 'T', records: 'R' }

/* ── Transform — reshape the measure / breakdown (Phase 1.4). ── */
export function TransformPanel({ transform, setTransform, aggregation, setAggregation }) {
  return (
    <div className="space-y-4">
      <Field label="Transform">
        <select className="input" value={transform} onChange={(e) => setTransform(e.target.value)}>
          {TRANSFORMS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Aggregation">
        <select className="input" value={aggregation} onChange={(e) => setAggregation(e.target.value)}>
          {AGGREGATIONS.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </Field>
      <p className="text-xs text-gray-500 dark:text-slate-400">
        Transforms reshape the breakdown (% of total, top-N, running total); aggregation sets how the value rolls up.
      </p>
    </div>
  )
}

/* ── 4. Config ── */
export function ConfigPanel({
  source,
  name,
  setName,
  freshness,
  setFreshness,
  interactiveFilters,
  setInteractiveFilters,
  piiAck,
  setPiiAck,
  ungovernedAck,
  setUngovernedAck,
}) {
  return (
    <div className="space-y-4">
      <Field label="Widget name">
        <input className="input" placeholder="e.g. Pipeline by Stage" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Freshness threshold">
        <select className="input" value={freshness} onChange={(e) => setFreshness(e.target.value)}>
          {FRESHNESS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input type="checkbox" className="checkbox" checked={interactiveFilters} onChange={(e) => setInteractiveFilters(e.target.checked)} />
        Let end users filter this widget
      </label>

      {source?.hasPII && (
        <AckBox checked={piiAck} onChange={setPiiAck} title="This source contains PII" body="Personal data is masked by default in previews and for users without explicit access." />
      )}
      {source && !source.governed && (
        <AckBox checked={ungovernedAck} onChange={setUngovernedAck} title="Ungoverned metric" body="Computed here, not from an approved source — it carries an Ungoverned badge wherever it appears." />
      )}
    </div>
  )
}

// Format & display: number formatting, units, and a goal/target with conditional color.
// showGoal — only true for single-value types (KPI, Gauge, Stat Row) where a
// threshold + RAG coloring is meaningful.
export function FormatPanel({ format, setFormat, goal, setGoal, showGoal = true }) {
  const f = format
  return (
    <div className="space-y-4">
      <Field label="Value format">
        <Segmented
          value={f.style}
          onChange={(v) => setFormat({ style: v })}
          options={[
            ['auto', 'Auto'],
            ['number', 'Number'],
            ['currency', 'Currency'],
            ['percent', 'Percent'],
          ]}
        />
        {f.style === 'auto' && (
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Matches the metric automatically (count, currency, %, duration…).</p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Decimals">
          <Segmented
            value={String(f.decimals)}
            onChange={(v) => setFormat({ decimals: Number(v) })}
            options={[
              ['0', '0'],
              ['1', '1'],
              ['2', '2'],
            ]}
          />
        </Field>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
            <input type="checkbox" className="checkbox" checked={f.abbreviate} onChange={(e) => setFormat({ abbreviate: e.target.checked })} />
            Abbreviate (1.2M)
          </label>
        </div>
      </div>

      {/* Currency already adds "$" and Percent adds "%", so hide the matching field to avoid double symbols. */}
      <div className="grid grid-cols-2 gap-3">
        {f.style !== 'currency' && (
          <Field label="Prefix">
            <input className="input" placeholder="e.g. €" value={f.prefix} onChange={(e) => setFormat({ prefix: e.target.value })} />
          </Field>
        )}
        {f.style !== 'percent' && (
          <Field label="Suffix">
            <input className="input" placeholder="e.g. /mo" value={f.suffix} onChange={(e) => setFormat({ suffix: e.target.value })} />
          </Field>
        )}
      </div>

      {showGoal && (
        <>
          <Field label="Goal / target (optional)">
            <input
              type="number"
              className="input"
              placeholder="e.g. 1000000"
              value={goal.value ?? ''}
              onChange={(e) => setGoal({ value: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </Field>
          {goal.value != null && (
            <Field label="Goal direction">
              <Segmented
                value={goal.direction}
                onChange={(v) => setGoal({ direction: v })}
                options={[
                  ['higher', 'Higher is better'],
                  ['lower', 'Lower is better'],
                ]}
              />
            </Field>
          )}
        </>
      )}

      <p className="text-xs text-gray-500 dark:text-slate-400">
        {showGoal
          ? 'A goal colors the value green when met and red when missed.'
          : 'Controls how the headline value is displayed.'}
      </p>
    </div>
  )
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`flex-1 px-2 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aims-blue/40 ${
            value === v ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}

export function AckBox({ checked, onChange, title, body }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
      <input type="checkbox" className="checkbox mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</span>
        <span className="mt-0.5 block text-xs text-gray-600 dark:text-slate-300">{body}</span>
      </span>
    </label>
  )
}

/* ── Appearance panels — type-specific display configuration (W4/W7) ── */

// KPI / Gauge / Stat Row — format + goal (existing FormatPanel, exposed via AppearancePanel)
function KpiAppearance({ format, setFormat, goal, setGoal, showGoal }) {
  return <FormatPanel format={format} setFormat={setFormat} goal={goal} setGoal={setGoal} showGoal={showGoal} />
}

// Table — column selection, sort, page size, search (W5)
function TableAppearance({ config, onChange, entity }) {
  const fields = (entity && ENTITY_FIELDS[entity.id]) || ['ID', 'Name', 'Status', 'Created', 'Updated']
  const { sortField = '', sortDir = 'desc', pageSize = 25, searchable = true } = config
  return (
    <div className="space-y-4">
      <Field label="Columns to display">
        <div className="max-h-[160px] overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
          {fields.map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 last:border-0 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/5 dark:text-slate-200 dark:hover:bg-white/5">
              <input
                type="checkbox"
                className="checkbox"
                checked={!config.hiddenColumns?.includes(f)}
                onChange={(e) => {
                  const hidden = config.hiddenColumns || []
                  onChange({ hiddenColumns: e.target.checked ? hidden.filter((h) => h !== f) : [...hidden, f] })
                }}
              />
              {f}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sort by">
          <select className="input" value={sortField} onChange={(e) => onChange({ sortField: e.target.value })}>
            <option value="">Default</option>
            {fields.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Direction">
          <div className="flex gap-1">
            {[['asc', 'A → Z', SortAsc], ['desc', 'Z → A', SortDesc]].map(([v, label, Icon]) => (
              <button
                key={v}
                onClick={() => onChange({ sortDir: v })}
                title={label}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition-colors ${sortDir === v ? 'border-aims-blue bg-aims-blue/10 text-aims-blue' : 'border-gray-200 text-gray-600 hover:border-aims-blue/40 dark:border-white/10 dark:text-slate-300'}`}
              >
                <Icon size={14} /> {v === 'asc' ? 'Asc' : 'Desc'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Rows per page">
        <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
          {[10, 25, 50].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ pageSize: n })}
              className={`flex-1 px-2 py-1.5 font-medium transition-colors ${pageSize === n ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input type="checkbox" className="checkbox" checked={searchable} onChange={(e) => onChange({ searchable: e.target.checked })} />
        <ToggleLeft size={15} className={searchable ? 'text-aims-blue' : 'text-gray-400'} />
        Show search bar
      </label>
    </div>
  )
}

// List — sort, max items, timestamp toggle (W5)
function ListAppearance({ config, onChange, entity }) {
  const fields = (entity && ENTITY_FIELDS[entity.id]) || ['Name', 'Status', 'Created']
  const { sortField = '', maxItems = 10, showTimestamp = true } = config
  return (
    <div className="space-y-4">
      <Field label="Sort by">
        <select className="input" value={sortField} onChange={(e) => onChange({ sortField: e.target.value })}>
          <option value="">Default (most recent)</option>
          {fields.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>

      <Field label="Max items to show">
        <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
          {[5, 10, 20, 50].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ maxItems: n })}
              className={`flex-1 px-2 py-1.5 font-medium transition-colors ${maxItems === n ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input type="checkbox" className="checkbox" checked={showTimestamp} onChange={(e) => onChange({ showTimestamp: e.target.checked })} />
        Show timestamp on each item
      </label>
    </div>
  )
}

// Profile Card — field mapping for title, subtitle, content, badges, actions (W6)
function CardAppearance({ config, onChange, entity }) {
  const fields = ['—', ...((entity && ENTITY_FIELDS[entity.id]) || ['Name', 'Email', 'Status', 'Created'])]
  const { titleField = '', subtitleField = '', contentField = '', badge1 = '', badge2 = '', action1 = '', action2 = '' } = config

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-slate-400">
        Map entity fields to each slot in the Profile Card layout.
      </p>

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Header</div>
        <div className="space-y-3">
          <Field label="Title">
            <select className="input" value={titleField} onChange={(e) => onChange({ titleField: e.target.value })}>
              {fields.map((f) => <option key={f} value={f === '—' ? '' : f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Subtitle">
            <select className="input" value={subtitleField} onChange={(e) => onChange({ subtitleField: e.target.value })}>
              {fields.map((f) => <option key={f} value={f === '—' ? '' : f}>{f}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Content / body field">
        <select className="input" value={contentField} onChange={(e) => onChange({ contentField: e.target.value })}>
          {fields.map((f) => <option key={f} value={f === '—' ? '' : f}>{f}</option>)}
        </select>
      </Field>

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Badges (up to 2)</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Badge 1">
            <select className="input" value={badge1} onChange={(e) => onChange({ badge1: e.target.value })}>
              {fields.map((f) => <option key={f} value={f === '—' ? '' : f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Badge 2">
            <select className="input" value={badge2} onChange={(e) => onChange({ badge2: e.target.value })}>
              {fields.map((f) => <option key={f} value={f === '—' ? '' : f}>{f}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Quick actions (up to 2)</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Action 1">
            <input className="input" placeholder="e.g. Send email" value={action1} onChange={(e) => onChange({ action1: e.target.value })} />
          </Field>
          <Field label="Action 2">
            <input className="input" placeholder="e.g. Log call" value={action2} onChange={(e) => onChange({ action2: e.target.value })} />
          </Field>
        </div>
      </div>
    </div>
  )
}

// Types where FormatPanel with goal is meaningful
const FORMAT_TYPES_SET = new Set(['kpi', 'gauge', 'statrow', 'costkpi'])
const GOAL_TYPES_SET = new Set(['kpi', 'gauge', 'statrow'])

// ── Accent color palette ────────────────────────────────────────────────────
const ACCENT_COLORS = [
  { id: 'blue',   hex: '#155DFC' },
  { id: 'green',  hex: '#059669' },
  { id: 'teal',   hex: '#0D9488' },
  { id: 'purple', hex: '#7C3AED' },
  { id: 'amber',  hex: '#D97706' },
  { id: 'red',    hex: '#DC2626' },
  { id: 'cyan',   hex: '#06B6D4' },
  { id: 'slate',  hex: '#475569' },
]

// ── Style variants per widget type ─────────────────────────────────────────
const STYLE_VARIANTS = {
  kpi:           [{ id: 'minimal', label: 'Minimal' }, { id: 'card', label: 'Card' }, { id: 'featured', label: 'Featured' }],
  gauge:         [{ id: 'arc', label: 'Arc' }, { id: 'ring', label: 'Ring' }],
  statrow:       [{ id: 'row', label: 'Row' }, { id: 'grid', label: 'Grid' }],
  costkpi:       [{ id: 'minimal', label: 'Minimal' }, { id: 'card', label: 'Card' }],
  line:          [{ id: 'line', label: 'Lines' }, { id: 'area', label: 'Filled' }, { id: 'smooth', label: 'Smooth' }],
  bar:           [{ id: 'vertical', label: 'Vertical' }, { id: 'horizontal', label: 'Horizontal' }, { id: 'stacked', label: 'Stacked' }],
  pie:           [{ id: 'pie', label: 'Pie' }, { id: 'donut', label: 'Donut' }],
  scatter:       [{ id: 'dots', label: 'Dots' }, { id: 'bubbles', label: 'Bubbles' }],
  heatmap:       [{ id: 'sequential', label: 'Sequential' }, { id: 'diverging', label: 'Diverging' }],
  table:         [{ id: 'comfortable', label: 'Comfortable' }, { id: 'compact', label: 'Compact' }, { id: 'striped', label: 'Striped' }],
  list:          [{ id: 'feed', label: 'Feed' }, { id: 'cards', label: 'Cards' }, { id: 'dense', label: 'Dense' }],
  'record-card': [{ id: 'portrait', label: 'Portrait' }, { id: 'landscape', label: 'Landscape' }, { id: 'minimal', label: 'Minimal' }],
  carousel:      [{ id: 'slides', label: 'Slides' }, { id: 'stack', label: 'Stack' }],
}

// ── Display toggles per widget type ────────────────────────────────────────
const DISPLAY_OPTIONS = {
  kpi:           [{ id: 'showTrend', label: 'Show trend vs prior period', def: true }, { id: 'showSparkline', label: 'Show sparkline', def: false }, { id: 'showTarget', label: 'Show target progress bar', def: false }],
  gauge:         [{ id: 'showLabel', label: 'Show center label', def: true }, { id: 'showScale', label: 'Show scale markers', def: true }],
  statrow:       [{ id: 'showTrend', label: 'Show trend arrows', def: true }],
  costkpi:       [{ id: 'showBreakdown', label: 'Show cost breakdown', def: false }],
  line:          [{ id: 'showLegend', label: 'Show legend', def: true }, { id: 'showLabels', label: 'Show data labels', def: false }, { id: 'showDots', label: 'Show data points', def: false }],
  bar:           [{ id: 'showLegend', label: 'Show legend', def: true }, { id: 'showLabels', label: 'Show value labels', def: false }, { id: 'showGrid', label: 'Show grid lines', def: true }],
  pie:           [{ id: 'showLegend', label: 'Show legend', def: true }, { id: 'showLabels', label: 'Show slice labels', def: true }, { id: 'showTotal', label: 'Show total in center', def: false }],
  table:         [{ id: 'showFooter', label: 'Show row count footer', def: false }, { id: 'showBanding', label: 'Highlight alternate rows', def: false }],
  list:          [{ id: 'showAvatar', label: 'Show avatars / icons', def: true }, { id: 'showTimestamp', label: 'Show timestamps', def: true }],
  'record-card': [{ id: 'showBadges', label: 'Show status badges', def: true }, { id: 'showActions', label: 'Show quick actions', def: true }],
  carousel:      [{ id: 'showDots', label: 'Show navigation dots', def: true }, { id: 'showArrows', label: 'Show prev/next arrows', def: true }],
  map:           [{ id: 'showLegend', label: 'Show color legend', def: true }, { id: 'showLabels', label: 'Show region labels', def: false }],
}

// Sub-section label
function AppearanceSectionLabel({ children }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
      {children}
    </div>
  )
}

export function AppearancePanel({
  typeId, entity,
  accentColor, setAccentColor,
  styleVariant, setStyleVariant,
  displayOptions, setDisplayOptions,
  format, setFormat,
  goal, setGoal,
  tableConfig, setTableConfig,
  listConfig, setListConfig,
  cardConfig, setCardConfig,
}) {
  const [showFormat, setShowFormat] = useState(false)

  if (!typeId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-white/10">
        <p className="text-sm text-gray-500 dark:text-slate-400">Pick a widget type first to see its appearance options.</p>
      </div>
    )
  }

  const entityColor = entity?.color || null
  const effectiveAccent = accentColor
    ? ACCENT_COLORS.find((c) => c.id === accentColor)?.hex
    : entityColor

  const variants = STYLE_VARIANTS[typeId] || []
  const displayOpts = DISPLAY_OPTIONS[typeId] || []

  // Compute effective display option values (state overrides defaults)
  const effectiveOpts = Object.fromEntries(
    displayOpts.map((o) => [o.id, displayOptions?.[o.id] !== undefined ? displayOptions[o.id] : o.def])
  )
  const toggleOpt = (id, val) => setDisplayOptions((prev) => ({ ...prev, [id]: val }))

  // Effective style variant (state or first variant as default)
  const effectiveVariant = styleVariant || (variants[0]?.id ?? '')

  // Type-specific data-display config section (table columns/sort/pagination, card field mapping, etc.)
  let dataConfigSection = null
  if (typeId === 'table') {
    dataConfigSection = (
      <div className="space-y-4">
        <AppearanceSectionLabel>Columns & data</AppearanceSectionLabel>
        <TableAppearance config={tableConfig} onChange={(p) => setTableConfig((c) => ({ ...c, ...p }))} entity={entity} />
      </div>
    )
  } else if (typeId === 'list') {
    dataConfigSection = (
      <div className="space-y-4">
        <AppearanceSectionLabel>List options</AppearanceSectionLabel>
        <ListAppearance config={listConfig} onChange={(p) => setListConfig((c) => ({ ...c, ...p }))} entity={entity} />
      </div>
    )
  } else if (typeId === 'record-card') {
    dataConfigSection = (
      <div className="space-y-4">
        <AppearanceSectionLabel>Field mapping</AppearanceSectionLabel>
        <CardAppearance config={cardConfig} onChange={(p) => setCardConfig((c) => ({ ...c, ...p }))} entity={entity} />
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Look & feel ── */}
      <div className="space-y-4">
        <AppearanceSectionLabel>Look & feel</AppearanceSectionLabel>

        {/* Accent color */}
        <div>
          <p className="mb-2 text-xs text-gray-500 dark:text-slate-400">Accent color</p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Entity default swatch */}
            {entityColor && (
              <button
                title="Entity color (default)"
                onClick={() => setAccentColor('')}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${!accentColor ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-110' : 'opacity-80 hover:scale-105'}`}
                style={{ backgroundColor: entityColor }}
              >
                {!accentColor && <Check size={10} className="text-white" strokeWidth={3} />}
              </button>
            )}
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                title={c.id}
                onClick={() => setAccentColor(accentColor === c.id ? '' : c.id)}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${accentColor === c.id ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                style={{ backgroundColor: c.hex }}
              >
                {accentColor === c.id && <Check size={10} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Style variant */}
        {variants.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-gray-500 dark:text-slate-400">Style</p>
            <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setStyleVariant(v.id)}
                  className={`flex-1 px-3 py-1.5 font-medium transition-colors
                    ${i > 0 ? 'border-l border-gray-300 dark:border-white/15' : ''}
                    ${effectiveVariant === v.id
                      ? 'bg-aims-blue text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                    }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Display toggles ── */}
      {displayOpts.length > 0 && (
        <>
          <div className="border-t border-gray-100 dark:border-white/5" />
          <div className="space-y-3">
            <AppearanceSectionLabel>Display</AppearanceSectionLabel>
            {displayOpts.map((opt) => (
              <label key={opt.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={!!effectiveOpts[opt.id]}
                  onChange={(e) => toggleOpt(opt.id, e.target.checked)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </>
      )}

      {/* ── Type-specific data config (columns, field mapping, etc.) ── */}
      {dataConfigSection && (
        <>
          <div className="border-t border-gray-100 dark:border-white/5" />
          {dataConfigSection}
        </>
      )}

      {/* ── Number format (KPI types only, collapsible) ── */}
      {FORMAT_TYPES_SET.has(typeId) && (
        <>
          <div className="border-t border-gray-100 dark:border-white/5" />
          <div className="rounded-lg border border-gray-200 dark:border-white/10">
            <button
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200"
              onClick={() => setShowFormat((f) => !f)}
            >
              <span>Number format</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showFormat ? 'rotate-180' : ''}`} />
            </button>
            {showFormat && (
              <div className="border-t border-gray-200 p-3 dark:border-white/10">
                <KpiAppearance format={format} setFormat={setFormat} goal={goal} setGoal={setGoal} showGoal={GOAL_TYPES_SET.has(typeId)} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
