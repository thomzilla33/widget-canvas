import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts'
import { Sparkles } from 'lucide-react'
import { useChartTheme, SERIES } from '../playground/WidgetPreview.jsx'
import { widgetSample } from '../../data/preview.js'

// Compact, real mini-visualization of a catalog widget, rendered by its
// `skeleton`. Used on the dashboard canvas so placed widgets look real.
export default function WidgetRender({ widget }) {
  const data = useMemo(() => (widget ? widgetSample(widget) : null), [widget])
  if (!widget) {
    return <div className="grid h-[88px] place-items-center text-[10px] text-gray-400 dark:text-slate-500">No data</div>
  }
  switch (widget.skeleton) {
    case 'KPI':
      return <KpiMini data={data} />
    case 'Gauge':
      return <GaugeMini data={data} />
    case 'Table':
      return <TableMini data={data} />
    case 'List':
      return <ListMini data={data} />
    case 'Map':
      return <MapMini data={data} />
    case 'Heat Map':
      return <HeatMini data={data} />
    case 'AI Summary':
      return <SummaryMini data={data} />
    case 'Timeline': // marketplace-only skeleton — show as a trend line
      return <LineMini data={data} />
    case 'Chart':
    default:
      // Breakdown-style charts render as bars; trends as a line.
      return /\bby\b|aging|channel|stage|category/i.test(widget.name || '') ? (
        <BarMini data={data} />
      ) : (
        <LineMini data={data} />
      )
  }
}

function KpiMini({ data }) {
  const down = data.kpi.deltaDir === 'down'
  return (
    <div className="py-1">
      <div className="num text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{data.kpi.value}</div>
      <div className={`num mt-0.5 text-[11px] font-semibold ${down ? 'text-aims-stale' : 'text-aims-governed'}`}>
        {data.kpi.delta} vs last qtr
      </div>
    </div>
  )
}

function LineMini({ data }) {
  return (
    <ResponsiveContainer width="100%" height={84}>
      <LineChart data={data.series} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
        <Line type="monotone" dataKey="y" stroke={SERIES[0]} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarMini({ data }) {
  return (
    <ResponsiveContainer width="100%" height={84}>
      <BarChart data={data.breakdown} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.breakdown.map((entry, i) => (
            <Cell key={entry.label} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function GaugeMini({ data }) {
  const t = useChartTheme()
  const v = data.gauge.value
  return (
    <div className="relative" style={{ height: 88 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: v }]} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={6} fill={SERIES[0]} background={{ fill: t.grid }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="num text-lg font-bold text-gray-900 dark:text-slate-100">{v}%</span>
      </div>
    </div>
  )
}

function TableMini({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-100 text-[10px] dark:border-white/10">
      <table className="w-full">
        <tbody>
          {data.records.slice(0, 3).map((r) => (
            <tr key={r.name} className="border-b border-gray-100 last:border-0 dark:border-white/5">
              <td className="truncate px-2 py-1 text-gray-700 dark:text-slate-200">{r.name}</td>
              <td className="num px-2 py-1 text-right font-medium text-gray-900 dark:text-slate-100">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListMini({ data }) {
  const max = Math.max(...data.breakdown.map((b) => b.value))
  return (
    <ul className="space-y-1">
      {data.breakdown.slice(0, 3).map((b, i) => (
        <li key={b.label} className="flex items-center gap-1.5 text-[10px]">
          <span className="w-14 shrink-0 truncate text-gray-600 dark:text-slate-300">{b.label}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <span className="block h-full rounded-full" style={{ width: `${(b.value / max) * 100}%`, background: SERIES[i % SERIES.length] }} />
          </span>
        </li>
      ))}
    </ul>
  )
}

function MapMini({ data }) {
  const max = Math.max(...data.geo.map((g) => g.value))
  return (
    <ul className="space-y-1">
      {data.geo.slice(0, 3).map((g, i) => (
        <li key={g.region} className="flex items-center gap-1.5 text-[10px]">
          <span className="w-16 shrink-0 truncate text-gray-600 dark:text-slate-300">{g.region}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <span className="block h-full rounded-full" style={{ width: `${(g.value / max) * 100}%`, background: SERIES[i % SERIES.length] }} />
          </span>
        </li>
      ))}
    </ul>
  )
}

function HeatMini({ data }) {
  const cells = data.matrix.cells.slice(0, 3).map((row) => row.slice(0, 4))
  return (
    <div className="space-y-1">
      {cells.map((row, ri) => (
        <div key={data.matrix.rows[ri] || ri} className="flex gap-1">
          {row.map((v, ci) => (
            <span
              key={`${ri}-${ci}`}
              className="h-4 flex-1 rounded-sm"
              style={{ background: `rgba(37,99,235,${0.15 + (v / 100) * 0.75})` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function SummaryMini({ data }) {
  return (
    <div className="rounded-md bg-aims-blue/5 p-2 dark:bg-aims-blue/10">
      <div className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-aims-blue">
        <Sparkles size={10} /> AI
      </div>
      <p className="line-clamp-3 text-[10px] leading-snug text-gray-600 dark:text-slate-300">{data.narrative.text}</p>
    </div>
  )
}
