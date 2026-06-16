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
  Filter,
  Columns3,
  Rss,
  Bell,
  Rows3,
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

/* ── 3. Widget type gallery ── */
export function TypeGallery({ typeId, metric, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
export function FormatPanel({ format, setFormat, goal, setGoal }) {
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

      <p className="text-xs text-gray-500 dark:text-slate-400">
        Formatting applies to single-value widgets (KPI, gauge). A goal colors the value green when met and red when missed.
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

function AckBox({ checked, onChange, title, body }) {
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
