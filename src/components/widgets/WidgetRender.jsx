import { useMemo, useState } from 'react'
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
  PieChart,
  Pie,
} from 'recharts'
import { Sparkles, Phone, Mail, MessageSquare, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react'
import { useChartTheme, SERIES } from '../playground/WidgetPreview.jsx'
import { widgetSample, formatValue } from '../../data/preview.js'

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
    return <div className="grid h-[88px] place-items-center text-[10px] text-gray-500 dark:text-slate-400">No data</div>
  }
  const props = { data, size, format: widget.format, goal: widget.goal }
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
    case 'Donut':
      return <DonutMini {...props} />
    case 'Funnel':
      return <FunnelMini {...props} />
    case 'Board':
      return <BoardMini {...props} />
    case 'Feed':
      return <FeedMini {...props} />
    case 'Alerts':
      return <AlertsMini {...props} />
    case 'Stat Row':
      return <StatRowMini {...props} />
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

function KpiMini({ data, size, format, goal }) {
  const down = data.kpi.deltaDir === 'down'
  const useFmt = format && format.style && format.style !== 'auto'
  const value = useFmt ? formatValue(data.kpiRaw, format) : data.kpi.value
  const met = goal && goal.value != null ? (goal.direction === 'lower' ? data.kpiRaw <= goal.value : data.kpiRaw >= goal.value) : null
  const valueColor = met == null ? 'text-gray-900 dark:text-slate-100' : met ? 'text-aims-governed' : 'text-aims-stale'
  return (
    <div className="py-1">
      <div className={`num font-bold tracking-tight ${valueColor} ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'}`}>
        {value}
      </div>
      {size !== 'sm' && (
        <div className={`num mt-0.5 font-semibold ${down ? 'text-aims-stale' : 'text-aims-governed'} ${size === 'lg' ? 'text-sm' : 'text-[11px]'}`}>
          {data.kpi.delta} vs last quarter
        </div>
      )}
      {size === 'lg' && (
        <div className="mt-2" aria-hidden="true">
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
  const ys = data.series.map((d) => d.y)
  const label = `Trend line — ${ys.length} points, latest ${ys[ys.length - 1]}, range ${Math.min(...ys)} to ${Math.max(...ys)}.`
  return (
    <div role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={H[size]}>
        <LineChart data={data.series} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
          {size === 'lg' && <CartesianGrid stroke={t.grid} vertical={false} />}
          {size === 'lg' && <XAxis dataKey="x" stroke={t.axis} tick={{ ...t.tick, fontSize: 10 }} tickLine={false} />}
          <Line type="monotone" dataKey="y" stroke={SERIES[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarMini({ data, size }) {
  const t = useChartTheme()
  const label = `Bar chart — ${data.breakdown.map((b) => `${b.label} ${b.value}`).join(', ')}.`
  return (
    <div role="img" aria-label={label}>
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
    </div>
  )
}

function GaugeMini({ data, size, goal }) {
  const t = useChartTheme()
  const v = data.gauge.value
  const h = size === 'sm' ? 64 : size === 'lg' ? 132 : 88
  const goalSet = goal && goal.value != null
  const color = goalSet ? (v >= 67 ? '#16A34A' : v >= 34 ? '#D97706' : '#DC2626') : SERIES[0]
  return (
    <div className="relative" style={{ height: h }} role="img" aria-label={`${v}% ${data.gauge.label}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: v }]} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={6} fill={color} background={{ fill: t.grid }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`num font-bold ${size === 'lg' ? 'text-3xl' : 'text-lg'} ${goalSet ? '' : 'text-gray-900 dark:text-slate-100'}`} style={goalSet ? { color } : undefined}>{v}%</span>
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
                <span className="shrink-0 text-[10px] text-gray-500 dark:text-slate-400">4h ago</span>
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

function DonutMini({ data, size }) {
  const t = useChartTheme()
  const segs = data.breakdown
  const h = size === 'sm' ? 64 : size === 'lg' ? 140 : 96
  const inner = size === 'sm' ? '60%' : '64%'
  const label = `Donut chart — ${segs.map((b) => `${b.label} ${b.value}`).join(', ')}.`
  return (
    <div role="img" aria-label={label} className={size === 'lg' ? 'flex items-center gap-2' : ''}>
      <div className={size === 'lg' ? 'flex-1' : ''}>
        <ResponsiveContainer width="100%" height={h}>
          <PieChart>
            <Pie data={segs} dataKey="value" nameKey="label" innerRadius={inner} outerRadius="92%" stroke={t.grid} strokeWidth={1} paddingAngle={2}>
              {segs.map((entry, i) => (
                <Cell key={entry.label} fill={SERIES[i % SERIES.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {size === 'lg' && (
        <ul className="space-y-1 text-[10px]">
          {segs.map((b, i) => (
            <li key={b.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
              <span className="text-gray-600 dark:text-slate-300">{b.label}</span>
              <span className="num font-medium text-gray-900 dark:text-slate-100">{b.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FunnelMini({ data, size }) {
  const segs = [...data.breakdown].sort((a, b) => b.value - a.value)
  const max = segs.length ? Math.max(...segs.map((s) => s.value)) : 0
  const detailed = size !== 'sm'
  return (
    <div className="space-y-1">
      {segs.map((b, i) => (
        <div key={b.label} className="flex items-center gap-1.5 text-[10px]">
          {detailed && <span className="w-14 shrink-0 truncate text-gray-600 dark:text-slate-300">{b.label}</span>}
          <span className="flex-1">
            <span
              className="block h-3 rounded-sm"
              style={{ width: `${max > 0 ? (b.value / max) * 100 : 0}%`, background: SERIES[i % SERIES.length] }}
            />
          </span>
          {detailed && <span className="num w-8 shrink-0 text-right font-medium text-gray-900 dark:text-slate-100">{b.value}</span>}
        </div>
      ))}
    </div>
  )
}

// Status → dark-aware accent classes for the board view.
const BOARD_STATUS = {
  Active: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Idle: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  Paused: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Error: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

function BoardMini({ data, size }) {
  const { statuses, items } = data.board
  if (size === 'lg') {
    return (
      <div className="flex gap-1.5">
        {statuses.map((s) => {
          const col = items.filter((it) => it.status === s)
          return (
            <div key={s} className="min-w-0 flex-1">
              <div className={`mb-1 truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ${BOARD_STATUS[s] || BOARD_STATUS.Idle}`}>
                {s} · {col.length}
              </div>
              <div className="space-y-1">
                {col.slice(0, 3).map((it) => (
                  <div key={it.name} className="truncate rounded border border-gray-100 px-1.5 py-1 text-[10px] text-gray-700 dark:border-white/10 dark:text-slate-200">
                    {it.name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((s) => {
        const count = items.filter((it) => it.status === s).length
        return (
          <span key={s} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${BOARD_STATUS[s] || BOARD_STATUS.Idle}`}>
            {s}: <span className="num">{count}</span>
          </span>
        )
      })}
    </div>
  )
}

function FeedMini({ data, size }) {
  const rows = data.feed.slice(0, size === 'sm' ? 2 : size === 'lg' ? 5 : 3)
  return (
    <ul className="space-y-1.5">
      {rows.map((f, i) => (
        <li key={`${f.when}-${i}`} className="flex min-w-0 gap-1.5">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aims-blue" />
          <div className="min-w-0">
            <div className="truncate text-[11px] text-gray-700 dark:text-slate-200">{f.summary}</div>
            <div className="truncate text-[10px] text-gray-500 dark:text-slate-400">{f.actor} · {f.when}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}

// Severity → dark-aware accent classes for alerts.
const ALERT_SEV = {
  high: 'border-l-red-500 bg-red-500/5',
  med: 'border-l-amber-500 bg-amber-500/5',
  low: 'border-l-slate-400 bg-slate-500/5',
}

function AlertsMini({ data, size }) {
  const [dismissed, setDismissed] = useState([]) // by message — stable across re-samples
  const visible = data.alerts.filter((a) => !dismissed.includes(a.message))
  const rows = size === 'lg' ? visible : visible.slice(0, size === 'sm' ? 2 : 3)
  if (rows.length === 0) {
    return <div className="grid place-items-center py-2 text-[11px] text-aims-governed">All clear</div>
  }
  return (
    <ul className="space-y-1">
      {rows.map((a) => (
        <li key={a.message} className={`flex items-center gap-1.5 rounded border-l-2 px-2 py-1 ${ALERT_SEV[a.severity] || ALERT_SEV.low}`}>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] text-gray-700 dark:text-slate-200">{a.message}</div>
            <div className="truncate text-[10px] text-gray-500 dark:text-slate-400">{a.when}</div>
          </div>
          {size === 'lg' && (
            <button
              type="button"
              onClick={() => setDismissed((d) => [...d, a.message])}
              className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Ack
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

function StatRowMini({ data, size }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {data.stats.map((s) => (
        <div key={s.label} className="min-w-0">
          <div className={`num font-bold tracking-tight text-gray-900 dark:text-slate-100 ${size === 'lg' ? 'text-xl' : 'text-base'}`}>
            {s.value}
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="truncate text-gray-500 dark:text-slate-400">{s.label}</span>
            <span className={`num font-semibold ${s.deltaDir === 'down' ? 'text-aims-stale' : 'text-aims-governed'}`}>{s.delta}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
