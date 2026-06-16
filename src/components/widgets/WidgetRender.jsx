import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts'
import { Sparkles, Phone, Mail, MessageSquare, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react'
import { useChartTheme, SERIES } from '../playground/WidgetPreview.jsx'
import { widgetSample } from '../../data/preview.js'

// Chart heights per size — small is a sparkline, large gets axis room.
const H = { sm: 52, md: 84, lg: 150 }

// Compact, real mini-visualization of a catalog widget, rendered by its
// `skeleton` AND `size` (sm/md/lg) so the detail level scales with the widget.
export default function WidgetRender({ widget, size = 'md', scope, viewAs }) {
  const scopeKey = scope
    ? `${scope.range || ''}|${Object.values(scope.filters || {}).filter((v) => v && v !== 'All').join(',')}`
    : ''
  const data = useMemo(() => (widget ? widgetSample(widget, scope) : null), [widget, scopeKey])
  if (!widget) {
    return <div className="grid h-[88px] place-items-center text-[10px] text-gray-400 dark:text-slate-500">No data</div>
  }
  const props = { data, size }
  // A placement can override how the widget is rendered ("best way to show the data").
  switch (viewAs || widget.skeleton) {
    case 'KPI':
      return <KpiMini {...props} />
    case 'Gauge':
      return <GaugeMini {...props} />
    case 'Table':
      return <TableMini {...props} />
    case 'List':
      return <ListMini {...props} />
    case 'Map':
      return <MapMini {...props} />
    case 'Heat Map':
      return <HeatMini {...props} />
    case 'AI Summary':
      return <SummaryMini {...props} />
    case 'Timeline': // marketplace-only skeleton — show as a trend line
      return <LineMini {...props} />
    case 'Chart':
    default:
      return /\bby\b|aging|channel|stage|category/i.test(widget.name || '') ? (
        <BarMini {...props} />
      ) : (
        <LineMini {...props} />
      )
  }
}

function KpiMini({ data, size }) {
  const down = data.kpi.deltaDir === 'down'
  return (
    <div className="py-1">
      <div className={`num font-bold tracking-tight text-gray-900 dark:text-slate-100 ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'}`}>
        {data.kpi.value}
      </div>
      {size !== 'sm' && (
        <div className={`num mt-0.5 font-semibold ${down ? 'text-aims-stale' : 'text-aims-governed'} ${size === 'lg' ? 'text-sm' : 'text-[11px]'}`}>
          {data.kpi.delta} vs last quarter
        </div>
      )}
      {size === 'lg' && (
        <div className="mt-2">
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={data.series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <Line type="monotone" dataKey="y" stroke={SERIES[0]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function LineMini({ data, size }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={H[size]}>
      <LineChart data={data.series} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
        {size === 'lg' && <CartesianGrid stroke={t.grid} vertical={false} />}
        {size === 'lg' && <XAxis dataKey="x" stroke={t.axis} tick={{ ...t.tick, fontSize: 10 }} tickLine={false} />}
        <Line type="monotone" dataKey="y" stroke={SERIES[0]} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarMini({ data, size }) {
  const t = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height={H[size]}>
      <BarChart data={data.breakdown} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
        {size === 'lg' && <CartesianGrid stroke={t.grid} vertical={false} />}
        {size === 'lg' && <XAxis dataKey="label" stroke={t.axis} tick={{ ...t.tick, fontSize: 9 }} tickLine={false} interval={0} />}
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.breakdown.map((entry, i) => (
            <Cell key={entry.label} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function GaugeMini({ data, size }) {
  const t = useChartTheme()
  const v = data.gauge.value
  const h = size === 'sm' ? 64 : size === 'lg' ? 132 : 88
  return (
    <div className="relative" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: v }]} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={6} fill={SERIES[0]} background={{ fill: t.grid }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`num font-bold text-gray-900 dark:text-slate-100 ${size === 'lg' ? 'text-3xl' : 'text-lg'}`}>{v}%</span>
        {size === 'lg' && <span className="text-[11px] text-gray-500 dark:text-slate-400">{data.gauge.label}</span>}
      </div>
    </div>
  )
}

function TableMini({ data, size }) {
  const rows = data.records.slice(0, size === 'sm' ? 2 : size === 'lg' ? 5 : 3)
  const detailed = size === 'lg'
  return (
    <div className="overflow-hidden rounded-md border border-gray-100 text-[10px] dark:border-white/10">
      <table className="w-full">
        {detailed && (
          <thead>
            <tr className="bg-gray-50 text-left font-semibold text-gray-500 dark:bg-white/5 dark:text-slate-400">
              <th className="px-2 py-1 font-semibold">Account</th>
              <th className="px-2 py-1 font-semibold">Owner</th>
              <th className="px-2 py-1 text-right font-semibold">Value</th>
              <th className="px-2 py-1 text-right font-semibold">Status</th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-gray-100 last:border-0 dark:border-white/5">
              <td className="truncate px-2 py-1 text-gray-700 dark:text-slate-200">{r.name}</td>
              {detailed && <td className="px-2 py-1 text-gray-500 dark:text-slate-400">{r.owner}</td>}
              <td className="num px-2 py-1 text-right font-medium text-gray-900 dark:text-slate-100">{r.value}</td>
              {detailed && <td className="px-2 py-1 text-right text-gray-500 dark:text-slate-400">{r.status}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Activity-style icons for the detailed (large) list view.
const ACT_ICONS = [Phone, Mail, Phone, MessageSquare]
const ACT_STATUS = [AlertTriangle, null, AlertCircle, null]
const ACT_STATUS_COLOR = ['text-aims-aging', '', 'text-aims-stale', '']

function ListMini({ data, size }) {
  // Large = detailed activity feed (icon · title · person + message · time · status)
  if (size === 'lg') {
    return (
      <div className="space-y-1.5">
        {data.records.slice(0, 4).map((r, i) => {
          const Icon = ACT_ICONS[i % ACT_ICONS.length]
          const Status = ACT_STATUS[i % ACT_STATUS.length]
          return (
            <div key={r.name} className="rounded-md border border-gray-100 px-2.5 py-1.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
              <div className="flex min-w-0 items-center gap-2">
                <Icon size={12} className="shrink-0 text-aims-blue" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-900 dark:text-slate-100">{r.name}</span>
                {Status && <Status size={12} className={`shrink-0 ${ACT_STATUS_COLOR[i % ACT_STATUS_COLOR.length]}`} />}
                <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">4h ago</span>
                <ChevronRight size={12} className="shrink-0 text-gray-300 dark:text-slate-600" />
              </div>
              <div className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-slate-400">
                <span className="font-medium text-gray-700 dark:text-slate-300">{r.owner}</span> · {r.status} · {r.value}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  // Small = plain rows; Medium = ranked bars.
  if (size === 'sm') {
    return (
      <ul className="space-y-1 text-[10px]">
        {data.breakdown.slice(0, 2).map((b) => (
          <li key={b.label} className="flex min-w-0 justify-between">
            <span className="truncate text-gray-600 dark:text-slate-300">{b.label}</span>
            <span className="num font-medium text-gray-900 dark:text-slate-100">{b.value}</span>
          </li>
        ))}
      </ul>
    )
  }
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

function MapMini({ data, size }) {
  const max = Math.max(...data.geo.map((g) => g.value))
  const rows = data.geo.slice(0, size === 'sm' ? 2 : size === 'lg' ? 4 : 3)
  return (
    <ul className="space-y-1">
      {rows.map((g, i) => (
        <li key={g.region} className="flex min-w-0 items-center gap-1.5 text-[10px]">
          <span className="w-16 shrink-0 truncate text-gray-600 dark:text-slate-300">{g.region}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <span className="block h-full rounded-full" style={{ width: `${(g.value / max) * 100}%`, background: SERIES[i % SERIES.length] }} />
          </span>
          {size === 'lg' && <span className="num w-7 shrink-0 text-right text-gray-500 dark:text-slate-400">{g.value}</span>}
        </li>
      ))}
    </ul>
  )
}

function HeatMini({ data, size }) {
  const rowCount = size === 'sm' ? 2 : size === 'lg' ? 4 : 3
  const cells = data.matrix.cells.slice(0, rowCount).map((row) => row.slice(0, 4))
  const cellH = size === 'lg' ? 'h-7' : 'h-4'
  return (
    <div className="space-y-1">
      {cells.map((row, ri) => (
        <div key={data.matrix.rows[ri] || ri} className="flex gap-1">
          {row.map((v, ci) => (
            <span
              key={`${ri}-${ci}`}
              className={`${cellH} flex-1 rounded-sm ${size === 'lg' ? 'grid place-items-center text-[9px] font-medium text-white/90' : ''}`}
              style={{ background: `rgba(37,99,235,${0.15 + (v / 100) * 0.75})` }}
            >
              {size === 'lg' && v > 40 ? v : ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function SummaryMini({ data, size }) {
  return (
    <div className="rounded-md bg-aims-blue/5 p-2 dark:bg-aims-blue/10">
      <div className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-aims-blue">
        <Sparkles size={10} /> AI Summary
      </div>
      <p className={`text-[11px] leading-snug text-gray-600 dark:text-slate-300 ${size === 'sm' ? 'line-clamp-2' : size === 'lg' ? '' : 'line-clamp-3'}`}>
        {data.narrative.text}
      </p>
      {size === 'lg' && (
        <ul className="mt-1.5 space-y-0.5">
          {data.narrative.bullets.map((b) => (
            <li key={b} className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-slate-300">
              <span className="h-1 w-1 rounded-full bg-aims-blue" /> {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
