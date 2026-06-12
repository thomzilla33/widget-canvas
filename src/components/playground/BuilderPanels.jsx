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
  Map,
  Lock,
  Check,
} from 'lucide-react'
import { GovernedBadge, EmptyState } from '../common/index.jsx'
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
  Map,
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

/* ── 1. Source picker (external connectors) ── */
export function SourcePicker({ sourceId, onSelect }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {EXTERNAL_SOURCES.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`catalog-card !min-h-0 ${sourceId === s.id ? 'border-aims-blue ring-2 ring-aims-blue/30' : ''}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="logo-sq" style={{ background: s.logoColor }}>{s.initials}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{s.name}</div>
              <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">{s.category}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <GovernedBadge governed={s.governed} />
            {s.hasPII && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                <Lock size={11} /> PII
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

/* ── 2. Metric picker ── */
export function MetricPicker({ source, metricId, onSelect }) {
  if (!source) {
    return <EmptyState icon="🔌" title="Pick a source first" description="Choose a connector above to see its metrics." />
  }
  return (
    <div className="space-y-2">
      {source.metrics.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`card flex w-full items-center justify-between gap-2 p-3 text-left transition-shadow hover:shadow-md ${
            metricId === m.id ? 'border-aims-blue ring-2 ring-aims-blue/30' : ''
          }`}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{m.name}</span>
          <span className="cap-chip cap-chip-neutral shrink-0">Rec: {TYPE_LABEL[m.recommendedType]}</span>
        </button>
      ))}
    </div>
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
