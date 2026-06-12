import { useState, Component } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts'
import { ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react'
import { GovernedBadge, FreshnessBadge } from '../common/index.jsx'
import { useTheme } from '../../state/ThemeContext.jsx'
import { previewData } from '../../data/preview.js'
import { TYPE_LABEL } from '../../data/mock.js'

const SERIES = ['#2563EB', '#06B6D4', '#A78BFA', '#10B981', '#F59E0B', '#EC4899']

function useChartTheme() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return {
    grid: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    axis: dark ? '#475569' : '#cbd5e1',
    tick: { fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 },
    tooltip: {
      background: dark ? '#131a2c' : '#ffffff',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`,
      borderRadius: 8,
      color: dark ? '#e2e8f0' : '#0f172a',
      fontSize: 12,
    },
  }
}

const H = 220

// ── Trust header + type switcher ─────────────────────────────
export default function WidgetPreview({ typeId, metric, source, name, freshness }) {
  const ready = source && metric && typeId
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold text-gray-900 dark:text-slate-100">{name?.trim() || 'Untitled widget'}</div>
          {ready && (
            <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">
              {TYPE_LABEL[typeId]} · {source.name} · {metric.name}
            </div>
          )}
        </div>
        {ready && <GovernedBadge governed={!!source.governed} />}
      </div>

      <div className="mt-3 flex-1">
        {ready ? (
          <ChartBoundary key={typeId}>
            <Renderer typeId={typeId} metric={metric} pii={!!source.hasPII} />
          </ChartBoundary>
        ) : (
          <div className="grid h-full min-h-[220px] place-items-center rounded-lg border-2 border-dashed border-gray-200 text-center text-sm text-gray-400 dark:border-white/10 dark:text-slate-500">
            Pick a source, metric, and widget type to preview it live.
          </div>
        )}
      </div>

      {ready && (
        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
          <FreshnessBadge status={freshness} label={freshness} />
          {source.hasPII && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
              <Lock size={11} /> PII masked
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Renders only the selected view, so an unused view can't throw or do work.
function Renderer({ typeId, metric, pii }) {
  const data = previewData(metric)
  switch (typeId) {
    case 'line': return <LineView data={data} />
    case 'bar': return <BarView data={data} />
    case 'pie': return <PieView data={data} />
    case 'table': return <TableView data={data} pii={pii} />
    case 'heatmap': return <HeatmapView data={data} />
    case 'scatter': return <ScatterView data={data} />
    case 'carousel': return <CarouselView data={data} pii={pii} />
    case 'gauge': return <GaugeView data={data} />
    case 'list': return <ListView data={data} />
    case 'summary': return <SummaryView data={data} />
    case 'map': return <MapView data={data} />
    default: return <KpiView data={data} />
  }
}

// Keeps a misbehaving chart from blanking the whole Playground page.
class ChartBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="grid h-full min-h-[220px] place-items-center rounded-lg border-2 border-dashed border-gray-200 text-center text-sm text-gray-400 dark:border-white/10 dark:text-slate-500">
          Preview unavailable for this widget type.
        </div>
      )
    }
    return this.props.children
  }
}

/* ── Recharts views ── */
function LineView({ data }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={H}>
      <LineChart data={data.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey="x" stroke={t.axis} tick={t.tick} tickLine={false} />
        <YAxis stroke={t.axis} tick={t.tick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={t.tooltip} itemStyle={{ color: t.tooltip.color }} labelStyle={{ color: t.tooltip.color }} cursor={{ stroke: t.grid }} />
        <Line type="monotone" dataKey="y" name={data.label} stroke={SERIES[0]} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarView({ data }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={H}>
      <BarChart data={data.breakdown} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey="label" stroke={t.axis} tick={{ ...t.tick, fontSize: 10 }} tickLine={false} interval={0} />
        <YAxis stroke={t.axis} tick={t.tick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={t.tooltip} itemStyle={{ color: t.tooltip.color }} labelStyle={{ color: t.tooltip.color }} cursor={{ fill: t.grid }} />
        <Bar dataKey="value" name={data.label} radius={[4, 4, 0, 0]}>
          {data.breakdown.map((entry, i) => (
            <Cell key={entry.label} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieView({ data }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={H}>
      <PieChart>
        <Pie data={data.breakdown} dataKey="value" nameKey="label" innerRadius={48} outerRadius={80} paddingAngle={2}>
          {data.breakdown.map((entry, i) => (
            <Cell key={entry.label} fill={SERIES[i % SERIES.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={t.tooltip} itemStyle={{ color: t.tooltip.color }} labelStyle={{ color: t.tooltip.color }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ScatterView({ data }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={H}>
      <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={t.grid} />
        <XAxis type="number" dataKey="x" stroke={t.axis} tick={t.tick} tickLine={false} />
        <YAxis type="number" dataKey="y" stroke={t.axis} tick={t.tick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={t.tooltip} itemStyle={{ color: t.tooltip.color }} labelStyle={{ color: t.tooltip.color }} cursor={{ stroke: t.grid }} />
        <Scatter data={data.twoVar} fill={SERIES[2]} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

function GaugeView({ data }) {
  const t = useChartTheme()
  const v = data.gauge.value
  return (
    <div className="relative" style={{ height: H }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{ value: v }]} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={8} fill={SERIES[0]} background={{ fill: t.grid }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{v}%</span>
        <span className="text-xs text-gray-500 dark:text-slate-400">{data.gauge.label}</span>
      </div>
    </div>
  )
}

/* ── Custom views ── */
function KpiView({ data }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col justify-center">
      <div className="num text-4xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{data.kpi.value}</div>
      <div className="num mt-1 text-sm font-semibold text-aims-governed">{data.kpi.delta} vs last quarter</div>
    </div>
  )
}

function maskName(s) {
  return s
    .split(' ')
    .map((w) => (w[0] || '') + '•••')
    .join(' ')
}

function TableView({ data, pii }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-slate-400">
          <tr>
            {['Account', 'Owner', 'Value', 'Status'].map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.records.slice(0, 5).map((r) => (
            <tr key={r.name} className="border-t border-gray-100 dark:border-white/5">
              <td className="px-3 py-2 font-medium text-gray-900 dark:text-slate-100">{r.name}</td>
              <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{pii ? maskName(r.owner) : r.owner}</td>
              <td className="px-3 py-2 text-gray-700 dark:text-slate-200">{r.value}</td>
              <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.recordTotal > 5 && (
        <div className="border-t border-gray-100 px-3 py-1.5 text-[11px] text-gray-400 dark:border-white/5 dark:text-slate-500">
          Showing 5 of {data.recordTotal.toLocaleString()} records
        </div>
      )}
    </div>
  )
}

function ListView({ data }) {
  const max = Math.max(...data.breakdown.map((b) => b.value))
  return (
    <ul className="space-y-2">
      {data.breakdown.map((b, i) => (
        <li key={b.label} className="flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 truncate text-gray-700 dark:text-slate-200">{b.label}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <span className="block h-full rounded-full" style={{ width: `${(b.value / max) * 100}%`, background: SERIES[i % SERIES.length] }} />
          </span>
          <span className="w-8 shrink-0 text-right font-semibold text-gray-900 dark:text-slate-100">{b.value}</span>
        </li>
      ))}
    </ul>
  )
}

function HeatmapView({ data }) {
  const { rows, cols, cells } = data.matrix
  return (
    <div className="text-[11px]">
      <div className="grid gap-1" style={{ gridTemplateColumns: `64px repeat(${cols.length}, 1fr)` }}>
        <div />
        {cols.map((c) => (
          <div key={c} className="text-center font-semibold text-gray-500 dark:text-slate-400">{c}</div>
        ))}
        {rows.map((r, ri) => (
          <Row key={r} label={r} values={cells[ri]} />
        ))}
      </div>
    </div>
  )
}
function Row({ label, values }) {
  return (
    <>
      <div className="flex items-center font-semibold text-gray-500 dark:text-slate-400">{label}</div>
      {values.map((v, ci) => (
        <div
          key={ci}
          className="grid h-9 place-items-center rounded font-medium"
          style={{ background: `rgba(37,99,235,${0.12 + (v / 100) * 0.78})`, color: v > 45 ? '#fff' : 'inherit' }}
        >
          {v}
        </div>
      ))}
    </>
  )
}

function CarouselView({ data, pii }) {
  const [i, setI] = useState(0)
  const items = data.records
  const r = items[i]
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setI((x) => (x - 1 + items.length) % items.length)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-gray-200 text-gray-500 hover:text-aims-blue dark:border-white/15 dark:text-slate-400" aria-label="Previous">
        <ChevronLeft size={15} />
      </button>
      <div className="flex-1 rounded-lg border border-gray-200 p-4 dark:border-white/10">
        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{r.name}</div>
        <div className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">{pii ? maskName(r.owner) : r.owner}</div>
        <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-slate-100">{r.value}</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">{r.status}</div>
        <div className="mt-3 flex justify-center gap-1">
          {items.map((_, d) => (
            <span key={d} className={`h-1.5 w-1.5 rounded-full ${d === i ? 'bg-aims-blue' : 'bg-gray-300 dark:bg-white/20'}`} />
          ))}
        </div>
      </div>
      <button onClick={() => setI((x) => (x + 1) % items.length)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-gray-200 text-gray-500 hover:text-aims-blue dark:border-white/15 dark:text-slate-400" aria-label="Next">
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

function SummaryView({ data }) {
  return (
    <div className="rounded-lg border border-aims-blue/30 bg-aims-blue/5 p-4 dark:bg-aims-blue/10">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-aims-blue">
        <Sparkles size={13} /> AI Summary
      </div>
      <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-200">{data.narrative.text}</p>
      <ul className="mt-2 space-y-1">
        {data.narrative.bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
            <span className="h-1 w-1 rounded-full bg-aims-blue" /> {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MapView({ data }) {
  const max = Math.max(...data.geo.map((g) => g.value))
  return (
    <div>
      <div className="mb-3 grid h-24 place-items-center rounded-lg bg-gradient-to-br from-aims-blue/10 to-purple-500/10 text-xs text-gray-400 dark:text-slate-500">
        🗺️ Geographic distribution
      </div>
      <ul className="space-y-1.5">
        {data.geo.map((g, i) => (
          <li key={g.region} className="flex items-center gap-2 text-xs">
            <span className="w-28 shrink-0 text-gray-700 dark:text-slate-200">{g.region}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <span className="block h-full rounded-full" style={{ width: `${(g.value / max) * 100}%`, background: SERIES[i % SERIES.length] }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
