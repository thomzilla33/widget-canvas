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
  Lock,
  Check,
  Search,
  Database,
} from 'lucide-react'
import { EmptyState, ConnectionBadge } from '../common/index.jsx'
import { EXTERNAL_SOURCES, WIDGET_TYPES, TYPE_LABEL } from '../../data/mock.js'
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
  const selected = EXTERNAL_SOURCES.find((s) => s.id === sourceId)
  // Show connected sources; if the chosen source isn't connected (picked from
  // the catalog), surface it at the top so the selection stays visible.
  let pool = EXTERNAL_SOURCES.filter((s) => s.connected)
  if (selected && !selected.connected) pool = [selected, ...pool]

  const query = q.trim().toLowerCase()
  const filtered = query
    ? pool.filter((s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query))
    : pool
  const groups = groupByCategory(filtered)

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
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
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{cat}</div>
              <div className="space-y-1.5">
                {items.map((s) => (
                  <SourceRow key={s.id} source={s} selected={sourceId === s.id} onSelect={onSelect} />
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

function SourceRow({ source, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(source.id)}
      className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-shadow hover:shadow-sm ${
        selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : 'border-gray-200 dark:border-white/10'
      }`}
    >
      <span className="logo-sq !h-8 !w-8 !text-[10px]" style={{ background: source.logoColor }}>{source.initials}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{source.name}</div>
        <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">{source.category}</div>
      </div>
      {source.hasPII && <Lock size={12} className="shrink-0 text-gray-400 dark:text-slate-500" />}
      <ConnectionBadge status={source.status} />
    </button>
  )
}

/* ── 2. Metric / record picker — aggregate Metrics + row-level Record sets ── */
export function MetricPicker({ source, metricId, onSelect }) {
  if (!source) {
    return <EmptyState icon="🔌" title="Pick a source first" description="Choose a connector above to see its metrics and records." />
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
        <span className="text-[10px] text-gray-400 dark:text-slate-500">{hint}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function FieldButton({ field, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(field.id)}
      className={`card flex w-full items-center justify-between gap-2 p-3 text-left transition-shadow hover:shadow-md ${
        selected ? 'border-aims-blue ring-2 ring-aims-blue/30' : ''
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-slate-100">{field.name}</span>
        {field.entityType && (
          <span className="block text-[11px] text-gray-400 dark:text-slate-500">
            {field.entityType} · {field.count.toLocaleString()} rows{field.hasPII ? ' · PII' : ''}
          </span>
        )}
      </span>
      <span className="cap-chip cap-chip-neutral shrink-0">Rec: {TYPE_LABEL[field.recommendedType]}</span>
    </button>
  )
}

/* ── 3. Widget type gallery ── */
export function TypeGallery({ typeId, metric, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {WIDGET_TYPES.map((t) => {
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
      })}
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

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input type="checkbox" checked={interactiveFilters} onChange={(e) => setInteractiveFilters(e.target.checked)} />
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

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}

function AckBox({ checked, onChange, title, body }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
      <input type="checkbox" className="mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</span>
        <span className="mt-0.5 block text-xs text-gray-600 dark:text-slate-300">{body}</span>
      </span>
    </label>
  )
}
