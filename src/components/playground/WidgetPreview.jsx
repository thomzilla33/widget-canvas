import { useState, useEffect, Component } from 'react'
import { ChevronLeft, ChevronRight, Lock, Sparkles, Filter } from 'lucide-react'
import { GovernedBadge, FreshnessBadge, DataPlaneBadge } from '../common/index.jsx'
import { dataPlaneOf } from '../../data/governance.js'
import { dimensionsFor } from '../../data/fields.js'
import { previewData, formatValue } from '../../data/preview.js'
import { entityKindFor } from '../../data/mockDatasets.js'
import { TYPE_LABEL } from '../../data/mock.js'
import { CostKpiMini, UsageHeatmapMini, SpendBreakdownMini, CompositeStatMini } from '../widgets/WidgetRender.jsx'
import { SERIES, LineHC, BarHC, PieHC, ScatterHC, GaugeHC, FunnelHC, HeatmapHC } from '../charts/hc.jsx'

// The date ranges a metric can be filtered to (time is always an applicable filter).
const PREVIEW_RANGES = [
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
  ['90d', 'Last 90 days'],
  ['qtd', 'Quarter to date'],
  ['12m', 'Last 12 months'],
]

// Is a raw value meeting its goal, given direction? null when no goal set.
function goalMet(raw, goal) {
  if (!goal || goal.value == null) return null
  return goal.direction === 'lower' ? raw <= goal.value : raw >= goal.value
}

const H = 220

// ── Trust header + type switcher ─────────────────────────────
export default function WidgetPreview({ typeId, metric, source, name, subtitle, freshness, display, shape, datasetConfig, typeConfig }) {
  const ready = source && metric && typeId
  // Applicable filters for THIS metric (Issue A): the date range (time is always
  // filterable) + the categorical dimensions dimensionsFor() says apply to this
  // source × measure. Toggling them narrows the live preview, demonstrating the
  // filters end users would get.
  const showFilters = ready
  const filterDims = showFilters ? dimensionsFor(source, metric).filter((d) => d.id !== 'none' && d.id !== 'time') : []
  const [range, setRange] = useState('90d')
  const [activeDims, setActiveDims] = useState(() => new Set())
  // Reset filters when the metric changes so stale narrowing doesn't carry over.
  const metricKey = metric?.id
  useEffect(() => {
    setRange('90d')
    setActiveDims(new Set())
  }, [metricKey])
  const toggleDim = (id) =>
    setActiveDims((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  // Resolve entity kind from DatasetStep sourceId or legacy source+metric so the
  // preview shows domain-specific records/categories rather than "Segment A/B/C/D".
  const entityKind = entityKindFor({ source, metric, datasetConfig })
  // Merge the interactive filters into the preview opts (alongside dimension/transform).
  const previewOpts = { ...(shape || {}), range, filterCount: activeDims.size, entityKind }

  const accentColor = display?.accentColor || ''
  const styleVariant = display?.styleVariant || ''

  // Card-level appearance: top accent border + optional tinted header for 'card'/'featured' variants
  const cardStyle = accentColor ? { borderTopColor: accentColor, borderTopWidth: 3 } : undefined
  const headerBg = accentColor && styleVariant === 'card'
    ? { background: `${accentColor}12` }
    : accentColor && styleVariant === 'featured'
      ? { background: `linear-gradient(135deg, ${accentColor}22 0%, transparent 100%)` }
      : undefined

  return (
    <div className="card flex flex-col p-4" style={cardStyle}>
      <div className="flex items-start justify-between gap-2" style={headerBg ? { ...headerBg, margin: '-1rem -1rem 0', padding: '0.75rem 1rem', borderRadius: '0.5rem 0.5rem 0 0' } : undefined}>
        <div className="min-w-0">
          <div className="truncate font-semibold text-gray-900 dark:text-slate-100">{name?.trim() || 'Untitled widget'}</div>
          {subtitle?.trim() && (
            <div className="truncate text-[11px] text-gray-600 dark:text-slate-300">{subtitle.trim()}</div>
          )}
          {ready && (
            <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">
              {TYPE_LABEL[typeId]} · {source.name} · {metric.name}
            </div>
          )}
        </div>
        {ready && (
          <div className="flex shrink-0 items-center gap-1.5">
            {/* dataPlaneOf reads `.source`; the builder has no widget yet, so pass the source name in that shape. */}
            <DataPlaneBadge plane={dataPlaneOf({ source: source.name })} />
            <GovernedBadge governed={!!source.governed} />
          </div>
        )}
      </div>

      {/* Applicable filters for this metric (Issue A) */}
      {showFilters && (
        <div className="surface-sunken mt-3 flex flex-wrap items-center gap-1.5 rounded-lg px-2.5 py-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-slate-400">
            <Filter size={12} aria-hidden="true" /> Filters
          </span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Date range filter"
            className="input !h-7 !w-auto !py-0.5 !pl-2 !pr-6 text-[11px]"
          >
            {PREVIEW_RANGES.map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          {filterDims.map((d) => {
            const on = activeDims.has(d.id)
            return (
              <button
                key={d.id}
                onClick={() => toggleDim(d.id)}
                aria-pressed={on}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  on
                    ? 'border-aims-blue bg-aims-blue/10 text-aims-blue'
                    : 'border-gray-200 text-gray-500 hover:border-aims-blue/40 dark:border-white/15 dark:text-slate-400'
                }`}
              >
                {d.name}
              </button>
            )
          })}
          {activeDims.size > 0 && (
            <button onClick={() => setActiveDims(new Set())} className="ml-auto text-[11px] font-medium text-aims-blue hover:underline">
              Clear
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex-1">
        {ready ? (
          // Key on type AND data identity so a prior render error clears when the metric changes.
          <ChartBoundary key={`${typeId}|${metric.id}|${previewOpts.dimension?.id || ''}|${previewOpts.transform || ''}|${previewOpts.range || ''}|${previewOpts.filterCount || 0}`}>
            <Renderer typeId={typeId} metric={metric} display={display} shape={previewOpts} typeConfig={typeConfig} />
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
function Renderer({ typeId, metric, display, shape, typeConfig }) {
  // The canned sample, sliced by the chosen dimension + transform when set (Phase 1).
  const data = previewData(metric, shape)
  switch (typeId) {
    case 'line': return <LineView data={data} display={display} />
    case 'bar': return <BarView data={data} display={display} />
    case 'pie': return <PieView data={data} display={display} />
    case 'table': return <TableView data={data} display={display} tableConfig={typeConfig?.tableConfig} />
    case 'heatmap': return <HeatmapView data={data} />
    case 'scatter': return <ScatterView data={data} />
    case 'carousel': return <CarouselView data={data} />
    case 'gauge': return <GaugeView data={data} display={display} />
    case 'list': return <ListView data={data} display={display} listConfig={typeConfig?.listConfig} />
    case 'summary': return <SummaryView data={data} />
    case 'map': return <MapView data={data} />
    case 'funnel': return <FunnelView data={data} />
    case 'board': return <BoardView data={data} />
    case 'feed': return <FeedView data={data} />
    case 'alerts': return <AlertsView data={data} />
    case 'statrow': return <StatRowView data={data} />
    // Consumption widgets — reuse the placed renderers so preview == placed.
    case 'costkpi': return <div className="px-1"><CostKpiMini data={data} size="lg" format={display?.format} /></div>
    case 'usageheatmap': return <div className="px-1"><UsageHeatmapMini data={data} size="lg" /></div>
    case 'spendbreakdown': return <div className="px-1"><SpendBreakdownMini data={data} size="lg" /></div>
    case 'compositestat': return <div className="px-1"><CompositeStatMini data={data} size="lg" /></div>
    default: return <KpiView data={data} display={display} />
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

/* ── Highcharts views (shared engine with the placed tile) ── */
function LineView({ data, display }) {
  return (
    <LineHC
      series={data.series}
      label={data.label}
      height={H}
      axes
      color={display?.accentColor || SERIES[0]}
      styleVariant={display?.styleVariant || 'area'}
      displayOptions={display?.displayOptions || {}}
    />
  )
}

function BarView({ data, display }) {
  return (
    <BarHC
      breakdown={data.breakdown}
      label={data.label}
      height={H}
      axes
      styleVariant={display?.styleVariant || 'vertical'}
      displayOptions={display?.displayOptions || {}}
      accentColor={display?.accentColor || undefined}
    />
  )
}

function PieView({ data, display }) {
  const styleVariant  = display?.styleVariant || 'donut'
  const displayOptions = display?.displayOptions || {}
  const showTotal     = styleVariant === 'donut' && displayOptions.showTotal
  const total         = showTotal ? data.breakdown.reduce((s, b) => s + b.value, 0) : null
  return (
    <div className="relative">
      <PieHC
        breakdown={data.breakdown}
        height={H}
        inner="58%"
        withLegend
        styleVariant={styleVariant}
        displayOptions={displayOptions}
      />
      {showTotal && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="num text-xl font-bold text-gray-900 dark:text-slate-100">
            {total.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}

function ScatterView({ data }) {
  return <ScatterHC points={data.twoVar} height={H} axes />
}

// RAG color when a goal is set: ≥67% on track (green), ≥34% (amber), else red.
const RAG = (v) => (v >= 67 ? '#16A34A' : v >= 34 ? '#D97706' : '#DC2626')

function GaugeView({ data, display }) {
  const v = data.gauge.value
  const goalSet = display?.goal?.value != null
  const accentColor = display?.accentColor
  const color = accentColor || (goalSet ? RAG(v) : SERIES[0])
  return (
    <div className="relative" style={{ height: H }}>
      <GaugeHC value={v} color={color} height={H} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`num text-3xl font-bold tracking-tight ${goalSet ? '' : 'text-gray-900 dark:text-slate-100'}`}
          style={goalSet ? { color } : undefined}
        >
          {v}%
        </span>
        <span className="text-xs text-gray-500 dark:text-slate-400">{data.gauge.label}</span>
      </div>
    </div>
  )
}

/* ── Custom views ── */
function KpiView({ data, display }) {
  const fmt = display?.format
  const useFmt = fmt && fmt.style && fmt.style !== 'auto'
  const goal = display?.goal
  const accentColor = display?.accentColor
  const displayOpts = display?.displayOptions || {}
  const showTrend = displayOpts.showTrend !== false
  const showTarget = displayOpts.showTarget === true

  const value = useFmt ? formatValue(data.kpiRaw, fmt) : data.kpi.value
  const met = goalMet(data.kpiRaw, goal)

  // accentColor overrides goal-based RAG on the value text
  const valueStyle = accentColor ? { color: accentColor } : undefined
  const valueClass = accentColor ? '' : met == null ? 'text-gray-900 dark:text-slate-100' : met ? 'text-aims-governed' : 'text-aims-stale'
  const missLabel = goal?.direction === 'lower' ? 'above target' : 'below target'

  return (
    <div className="flex h-full min-h-[180px] flex-col justify-center">
      <div className={`num text-4xl font-bold tracking-tight ${valueClass}`} style={valueStyle}>{value}</div>
      {showTrend && data.kpi.delta && (
        <div className="num mt-1 text-sm font-semibold text-aims-governed">{data.kpi.delta} vs last quarter</div>
      )}
      {!showTrend && (
        <div className="mt-1 text-xs text-gray-400 dark:text-slate-500 italic">Trend hidden</div>
      )}
      {showTarget && goal?.value != null && (
        <div className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
          Goal: {useFmt ? formatValue(goal.value, fmt) : goal.value} ·{' '}
          <span className={met ? 'font-semibold text-aims-governed' : 'font-semibold text-aims-stale'}>{met ? 'met' : missLabel}</span>
        </div>
      )}
      {!showTarget && goal?.value != null && (
        <div className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
          Goal: {useFmt ? formatValue(goal.value, fmt) : goal.value} ·{' '}
          <span className={met ? 'font-semibold text-aims-governed' : 'font-semibold text-aims-stale'}>{met ? 'met' : missLabel}</span>
        </div>
      )}
    </div>
  )
}

function TableView({ data, display, tableConfig }) {
  const styleVariant   = display?.styleVariant || 'comfortable'
  const displayOptions = display?.displayOptions || {}
  const hiddenCols     = tableConfig?.hiddenColumns || []

  const allHeaders = data.recordHeaders || ['Segment', 'Value']
  const headers    = allHeaders.filter((h) => !hiddenCols.includes(h))
  // Indices of visible columns (used for multicol row rendering)
  const visibleIdx = allHeaders.map((h, i) => ({ h, i })).filter(({ h }) => !hiddenCols.includes(h)).map(({ i }) => i)

  const multiCol   = data.records[0]?.cells != null
  const withShare  = !multiCol && headers.length >= 3

  const isCompact  = styleVariant === 'compact'
  const isStriped  = styleVariant === 'striped'
  const showBanding = !!displayOptions.showBanding
  const showFooter  = !!displayOptions.showFooter
  const cellPad    = isCompact ? 'px-3 py-1' : 'px-3 py-2'

  const rowBg = (ri) => {
    if (isStriped || showBanding) return ri % 2 === 1 ? 'bg-gray-50 dark:bg-white/[0.03]' : ''
    return ''
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-slate-400">
          <tr>
            {headers.map((h, i) => (
              <th key={h} className={`${cellPad} font-semibold ${i > 0 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.records.slice(0, 7).map((r, ri) => (
            multiCol ? (
              <tr key={ri} className={`border-t border-gray-100 dark:border-white/5 ${rowBg(ri)}`}>
                {visibleIdx.map((ci) => (
                  <td
                    key={ci}
                    className={`${cellPad} ${ci === 0 ? 'font-medium text-gray-900 dark:text-slate-100' : 'text-right text-gray-600 dark:text-slate-300'}`}
                  >
                    {r.cells[ci]}
                  </td>
                ))}
              </tr>
            ) : (
              <tr key={r.name} className={`border-t border-gray-100 dark:border-white/5 ${rowBg(ri)}`}>
                {!hiddenCols.includes(allHeaders[0]) && (
                  <td className={`${cellPad} font-medium text-gray-900 dark:text-slate-100`}>{r.name}</td>
                )}
                {!hiddenCols.includes(allHeaders[1]) && (
                  <td className={`num ${cellPad} text-right text-gray-700 dark:text-slate-200`}>{r.value}</td>
                )}
                {withShare && !hiddenCols.includes(allHeaders[2]) && (
                  <td className={`num ${cellPad} text-right text-gray-500 dark:text-slate-400`}>{r.share}</td>
                )}
              </tr>
            )
          ))}
        </tbody>
      </table>
      {(data.recordTotal > 7 || showFooter) && (
        <div className="border-t border-gray-100 px-3 py-1.5 text-[11px] text-gray-400 dark:border-white/5 dark:text-slate-500">
          {showFooter
            ? `${data.recordTotal.toLocaleString()} rows total`
            : `Showing 7 of ${data.recordTotal.toLocaleString()} rows`}
        </div>
      )}
    </div>
  )
}

const MOCK_TIMESTAMPS = ['2m ago', '14m ago', '1h ago', '3h ago', '1d ago', '2d ago', '4d ago']

function ListView({ data, display }) {
  const styleVariant   = display?.styleVariant || 'feed'
  const displayOptions = display?.displayOptions || {}
  const showAvatar     = displayOptions.showAvatar !== false
  const showTimestamp  = displayOptions.showTimestamp !== false
  const max = Math.max(0, ...data.breakdown.map((b) => b.value))

  if (styleVariant === 'dense') {
    return (
      <ul className="divide-y divide-gray-100 dark:divide-white/5">
        {data.breakdown.map((b, i) => (
          <li key={b.label} className="flex items-center gap-2 py-1 text-xs">
            {showAvatar && (
              <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
            )}
            <span className="flex-1 truncate text-gray-700 dark:text-slate-200">{b.label}</span>
            {showTimestamp && <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">{MOCK_TIMESTAMPS[i % MOCK_TIMESTAMPS.length]}</span>}
            <span className="w-8 shrink-0 text-right font-semibold text-gray-900 dark:text-slate-100">{b.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (styleVariant === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {data.breakdown.map((b, i) => (
          <div key={b.label} className="rounded-lg border border-gray-200 p-2.5 dark:border-white/10">
            {showAvatar && (
              <span className="mb-1.5 block h-5 w-5 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
            )}
            <div className="truncate text-xs font-medium text-gray-900 dark:text-slate-100">{b.label}</div>
            <div className="num mt-0.5 text-sm font-bold text-gray-700 dark:text-slate-200">{b.value}</div>
            {showTimestamp && <div className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">{MOCK_TIMESTAMPS[i % MOCK_TIMESTAMPS.length]}</div>}
          </div>
        ))}
      </div>
    )
  }

  // Default: 'feed' — bar-style list
  return (
    <ul className="space-y-2">
      {data.breakdown.map((b, i) => (
        <li key={b.label} className="flex items-center gap-2 text-xs">
          {showAvatar && (
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
          )}
          <span className="w-20 shrink-0 truncate text-gray-700 dark:text-slate-200">{b.label}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <span className="block h-full rounded-full" style={{ width: `${max > 0 ? (b.value / max) * 100 : 0}%`, background: SERIES[i % SERIES.length] }} />
          </span>
          <span className="w-8 shrink-0 text-right font-semibold text-gray-900 dark:text-slate-100">{b.value}</span>
          {showTimestamp && <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">{MOCK_TIMESTAMPS[i % MOCK_TIMESTAMPS.length]}</span>}
        </li>
      ))}
    </ul>
  )
}

function HeatmapView({ data }) {
  return <HeatmapHC matrix={data.matrix} height={H} labels />
}

function CarouselView({ data }) {
  const [i, setI] = useState(0)
  const items = data.records
  const r = items[i % items.length]
  const dimLabel = data.recordHeaders?.[0] || 'Segment'
  // Entity datasets supply cells[]; legacy breakdown records supply name/value/share.
  const multiCol = r?.cells != null
  const title  = multiCol ? r.cells[0] : r.name
  const metric = multiCol ? r.cells[1] : r.value
  const detail = multiCol ? (r.cells[2] || null) : (r.share && r.share !== '—' ? r.share : null)
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setI((x) => (x - 1 + items.length) % items.length)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-gray-200 text-gray-500 hover:text-aims-blue dark:border-white/15 dark:text-slate-400" aria-label="Previous">
        <ChevronLeft size={15} />
      </button>
      <div className="flex-1 rounded-lg border border-gray-200 p-4 dark:border-white/10">
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">{dimLabel}</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</div>
        <div className="num mt-3 text-2xl font-bold text-gray-900 dark:text-slate-100">{metric}</div>
        {detail && <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">{detail}</div>}
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
      <div className="mb-3 grid h-24 place-items-center rounded-lg bg-gradient-to-br from-aims-blue/10 to-purple-500/10 text-xs text-gray-500 dark:text-slate-400">
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

function FunnelView({ data }) {
  return <FunnelHC breakdown={data.breakdown} height={H} labels />
}

const BOARD_STATUS = {
  Active: 'bg-aims-governed/10 text-aims-governed',
  Idle: 'bg-gray-500/10 text-gray-500 dark:text-slate-400',
  Paused: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Error: 'bg-aims-stale/10 text-aims-stale',
}

function BoardView({ data }) {
  const { statuses, items } = data.board
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${statuses.length}, 1fr)` }}>
      {statuses.map((status) => {
        const colItems = items.filter((it) => it.status === status)
        const tint = BOARD_STATUS[status] || BOARD_STATUS.Idle
        return (
          <div key={status} className="rounded-lg border border-gray-200 p-2 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
              <span className={`rounded px-1.5 py-0.5 ${tint}`}>{status}</span>
              <span className="num text-gray-500 dark:text-slate-400">{colItems.length}</span>
            </div>
            <ul className="space-y-1">
              {colItems.map((it) => (
                <li key={it.name} className="truncate rounded bg-gray-50 px-2 py-1 text-[11px] text-gray-700 dark:bg-white/5 dark:text-slate-200">
                  {it.name}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function FeedView({ data }) {
  return (
    <ul className="space-y-2.5">
      {data.feed.map((e, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs text-gray-900 dark:text-slate-100">{e.summary}</span>
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/10 dark:text-slate-400">{e.type}</span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400">{e.actor} · {e.when}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}

const ALERT_ACCENT = { high: 'bg-aims-stale', med: 'bg-amber-500', low: 'bg-gray-400 dark:bg-slate-500' }

function AlertsView({ data }) {
  const [acked, setAcked] = useState([]) // by message — stable across re-renders
  const open = data.alerts.filter((a) => !acked.includes(a.message))
  if (open.length === 0) {
    return (
      <div className="grid h-full min-h-[180px] place-items-center text-sm text-gray-500 dark:text-slate-400">
        All clear
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {open.map((a) => (
        <li key={a.message} className="flex items-center gap-2 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
          <span className={`h-9 w-1 shrink-0 ${ALERT_ACCENT[a.severity] || ALERT_ACCENT.low}`} />
          <div className="min-w-0 flex-1 py-1.5">
            <div className="truncate text-xs text-gray-900 dark:text-slate-100">{a.message}</div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400">{a.when}</div>
          </div>
          <button
            onClick={() => setAcked((x) => [...x, a.message])}
            className="mr-2 shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-500 hover:text-aims-blue dark:border-white/15 dark:text-slate-400"
          >
            Ack
          </button>
        </li>
      ))}
    </ul>
  )
}

function StatRowView({ data }) {
  return (
    <div className="flex flex-wrap gap-4">
      {data.stats.map((s) => (
        <div key={s.label} className="min-w-[88px]">
          <div className="num text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{s.value}</div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400">{s.label}</div>
          <div className={`num text-xs font-semibold ${s.deltaDir === 'up' ? 'text-aims-governed' : 'text-aims-stale'}`}>{s.delta}</div>
        </div>
      ))}
    </div>
  )
}
