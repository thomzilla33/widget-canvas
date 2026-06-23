import { useState } from 'react'
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

      <button className="btn-secondary w-full" onClick={onBrowse}>
        <Database size={15} /> Browse all {EXTERNAL_SOURCES.length} sources
      </button>
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
      <button onClick={onChange} className="btn-secondary !h-8 shrink-0 !px-3 text-xs">Change</button>
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
  const selected = MODEL_ENTITIES.find((e) => e.id === entityId) || null

  if (selected && !editing) {
    return <SelectedEntity entity={selected} onChange={() => setEditing(true)} />
  }

  const groups = groupEntitiesByCategory(MODEL_ENTITIES)
  const pick = (id) => { onSelect(id); setEditing(false) }

  return (
    <div className="space-y-3">
      {selected && (
        <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-aims-blue dark:text-slate-400">
          <ChevronLeft size={13} aria-hidden="true" /> Keep {selected.name}
        </button>
      )}

      <div className="max-h-[380px] space-y-3 overflow-auto pr-1">
        {groups.map(([cat, items]) => (
          <div key={cat}>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{cat}</div>
            <div className="space-y-1.5">
              {items.map((e) => (
                <EntityRow key={e.id} entity={e} selected={entityId === e.id} onSelect={pick} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-slate-500">
        Entities are pre-resolved models from Data Studio — ETL already done.
      </p>
    </div>
  )
}

function SelectedEntity({ entity, onChange }) {
  const Icon = ENTITY_ICONS[entity.iconName] || Database
  return (
    <div className="flex items-start gap-3 rounded-lg border border-aims-blue/40 bg-aims-blue/5 p-3 dark:bg-aims-blue/10">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: entity.color }}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{entity.name}</span>
          <Check size={13} className="shrink-0 text-aims-blue" aria-hidden="true" />
          {entity.hasPII && <Lock size={11} className="shrink-0 text-gray-500 dark:text-slate-400" />}
        </div>
        <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{entity.label}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {entity.poweredBy.map((src) => (
            <span key={src} className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">{src}</span>
          ))}
        </div>
      </div>
      <button onClick={onChange} className="btn-secondary !h-8 shrink-0 !px-3 text-xs">Change</button>
    </div>
  )
}

function EntityRow({ entity, selected, onSelect }) {
  const Icon = ENTITY_ICONS[entity.iconName] || Database
  const totalFields = entity.metrics.length + entity.recordSets.length
  return (
    <button
      onClick={() => onSelect(entity.id)}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-shadow hover:bg-gray-50 hover:shadow-sm dark:hover:bg-white/5 ${
        selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : 'border-gray-200 dark:border-white/10'
      }`}
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: entity.color }}>
        <Icon size={15} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{entity.name}</span>
          {entity.hasPII && <Lock size={11} className="shrink-0 text-gray-400 dark:text-slate-500" />}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-slate-400">{entity.label}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-slate-500">{totalFields} metrics</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">·</span>
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
  if (!source) {
    return <EmptyState icon="🔌" title="Pick an entity first" description="Choose a data entity above to see its available metrics and record sets." />
  }
  const { metrics, recordSets } = source
  if (!metrics.length && !recordSets.length) {
    return <EmptyState icon="📭" title="Nothing to map yet" description="This source doesn’t expose any metrics or records." />
  }
  return (
    <div className="space-y-4">
      {metrics.length > 0 && (
        <FieldSection title="Metrics" hint="Aggregated values">
          {metrics.map((m) => (
            <FieldButton key={m.id} field={m} selected={metricId === m.id} onSelect={onSelect} />
          ))}
        </FieldSection>
      )}
      {recordSets.length > 0 && (
        <FieldSection title="Record sets" hint="Contacts & row-level data">
          {recordSets.map((r) => (
            <FieldButton key={r.id} field={r} selected={metricId === r.id} onSelect={onSelect} />
          ))}
        </FieldSection>
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
      <span className="cap-chip cap-chip-neutral shrink-0">Rec: {TYPE_LABEL[field.recommendedType]}</span>
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

      {/* Currency already adds “$” and Percent adds “%”, so hide the matching field to avoid double symbols. */}
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

export function AppearancePanel({ typeId, format, setFormat, goal, setGoal, tableConfig, setTableConfig, listConfig, setListConfig, cardConfig, setCardConfig, entity }) {
  if (!typeId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-white/10">
        <p className="text-sm text-gray-500 dark:text-slate-400">Pick a widget type first to configure its appearance.</p>
      </div>
    )
  }

  if (FORMAT_TYPES_SET.has(typeId)) {
    return (
      <div className="space-y-1">
        <p className="mb-4 text-xs text-gray-500 dark:text-slate-400">Control how numbers are formatted and set an optional goal with RAG coloring.</p>
        <KpiAppearance format={format} setFormat={setFormat} goal={goal} setGoal={setGoal} showGoal={GOAL_TYPES_SET.has(typeId)} />
      </div>
    )
  }

  if (typeId === 'table') {
    return <TableAppearance config={tableConfig} onChange={(p) => setTableConfig((c) => ({ ...c, ...p }))} entity={entity} />
  }

  if (typeId === 'list') {
    return <ListAppearance config={listConfig} onChange={(p) => setListConfig((c) => ({ ...c, ...p }))} entity={entity} />
  }

  if (typeId === 'record-card') {
    return <CardAppearance config={cardConfig} onChange={(p) => setCardConfig((c) => ({ ...c, ...p }))} entity={entity} />
  }

  // Charts, maps, etc. — no custom appearance config yet
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-sm font-medium text-gray-700 dark:text-slate-200">No appearance options</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">This widget type renders automatically based on your data selection. Appearance configuration is available for KPIs, tables, lists, and profile cards.</p>
    </div>
  )
}
