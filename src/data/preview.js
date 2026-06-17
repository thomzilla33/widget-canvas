import { computeTable, formatCell, columnAvg, tableDimColumn } from './tables.js'
import { scopeMult } from './governance.js'
import { dimensionCats, applyTransform, dimensionById } from './fields.js'

// Canned preview datasets for the Widget Playground. A single bundle is returned
// so any (metric, widget-type) pair can render something sensible.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

const SAMPLE = {
  series: MONTHS.map((m, i) => ({ x: m, y: Math.round(90 + 35 * Math.sin(i / 1.6) + i * 9) })),
  breakdown: [
    { label: 'Prospecting', value: 42 },
    { label: 'Qualified', value: 31 },
    { label: 'Proposal', value: 24 },
    { label: 'Negotiation', value: 18 },
    { label: 'Closed', value: 12 },
  ],
  twoVar: Array.from({ length: 26 }, (_, i) => ({ x: 4 + ((i * 1.7) % 40), y: 8 + ((i * 2.9) % 46) })),
  matrix: {
    rows: ['North', 'South', 'East', 'West'],
    cols: ['Q1', 'Q2', 'Q3', 'Q4'],
    cells: [
      [62, 71, 55, 80],
      [40, 52, 48, 60],
      [75, 68, 82, 90],
      [33, 45, 50, 58],
    ],
  },
  records: [
    { name: 'Acme Corporation', owner: 'Dana Lee', value: '$420k', status: 'Active' },
    { name: 'Globex Inc.', owner: 'Sam Ortiz', value: '$310k', status: 'At risk' },
    { name: 'Initech LLC', owner: 'Priya Nair', value: '$280k', status: 'Active' },
    { name: 'Umbrella Co.', owner: 'Marco Diaz', value: '$190k', status: 'Active' },
    { name: 'Soylent Corp', owner: 'Dana Lee', value: '$155k', status: 'Churned' },
    { name: 'Stark Industries', owner: 'Sam Ortiz', value: '$140k', status: 'Active' },
  ],
  geo: [
    { region: 'North America', value: 62 },
    { region: 'EMEA', value: 48 },
    { region: 'APAC', value: 35 },
    { region: 'LATAM', value: 22 },
  ],
  narrative: {
    text: 'Revenue is up 8.2% QoQ, led by enterprise expansion. Pipeline coverage is healthy at 3.4×, though two large deals slipped to next quarter.',
    bullets: ['ARR $1.24M (+8.2%)', 'Win rate 28% (+3 pts)', '2 deals at risk'],
  },
  kpi: { value: '$1.24M', delta: '+8.2%', deltaDir: 'up' },
  kpiRaw: 1243200, // raw number behind the KPI, so display formatting can be applied live
  gauge: { value: 68, label: 'of target' },
  recordTotal: 1284, // realistic row count for record-set previews (truncated display)
  // Board: items grouped into status columns (agent/employee/node states).
  board: {
    statuses: ['Active', 'Idle', 'Paused', 'Error'],
    items: [
      { name: 'Sales Copilot', status: 'Active' },
      { name: 'Support Triage', status: 'Active' },
      { name: 'Invoice Bot', status: 'Active' },
      { name: 'Renewal Agent', status: 'Idle' },
      { name: 'Churn Watch', status: 'Paused' },
      { name: 'Onboarding PA', status: 'Error' },
    ],
  },
  // Feed: recent activity entries (timestamp · type · summary · actor).
  feed: [
    { when: '2m ago', type: 'Run', summary: 'Completed a renewal outreach', actor: 'Sales Copilot' },
    { when: '14m ago', type: 'Escalation', summary: 'Escalated ticket #4821 to a human', actor: 'Support Triage' },
    { when: '38m ago', type: 'Truth', summary: 'Promoted 3 candidate facts to Truth', actor: 'Governance' },
    { when: '1h ago', type: 'Push', summary: 'Pushed 12 tickets to Salesforce', actor: 'Invoice Bot' },
    { when: '2h ago', type: 'Block', summary: 'Council blocked an out-of-policy refund', actor: 'Council' },
  ],
  // Alerts: severity-ranked, acknowledgeable.
  alerts: [
    { severity: 'high', message: 'SLA breach risk on 3 tickets in the support queue', when: '5m ago' },
    { severity: 'high', message: 'Salesforce sync failed — credentials expired', when: '3h ago' },
    { severity: 'med', message: '“NPS Trend” is stale — source schema changed', when: '1h ago' },
    { severity: 'low', message: '12 facts approaching TTL this week', when: '6h ago' },
  ],
  // Stat row: a few related measures side by side.
  stats: [
    { label: 'Runs', value: '3,120', delta: '+8%', deltaDir: 'up' },
    { label: 'Success', value: '94.2%', delta: '+1pt', deltaDir: 'up' },
    { label: 'Escalations', value: '212', delta: '-5%', deltaDir: 'down' },
  ],
}

// Format a raw number per a widget's display config (currency/percent/abbrev/etc).
export function formatValue(n, f = {}) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const { style = 'number', decimals = 0, abbreviate = false, prefix = '', suffix = '' } = f
  const num = Number(n)
  const abs = Math.abs(num)
  let str
  if (abbreviate && style !== 'percent' && abs >= 1000) {
    const [uv, us] = [
      [1e9, 'B'],
      [1e6, 'M'],
      [1e3, 'K'],
    ].find(([v]) => abs >= v)
    str = (num / uv).toFixed(decimals) + us
  } else {
    str = num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }
  if (style === 'currency') str = `$${str}`
  else if (style === 'percent') str = `${str}%`
  return `${prefix}${str}${suffix}`
}

// ── Make the sample data MEAN something for the metric ──────────────
// Infer the unit and category set from the metric name so a "Conversations
// Handled" KPI shows a count (not "$1.24M") and an "Actions by Type" bar uses
// action labels (not pipeline stages).
function metricUnit(name = '') {
  if (/retention|\bnrr\b|\bgrr\b/i.test(name)) return 'percent' // NRR/GRR are ratios, not $ (beats the "revenue" rule)
  if (/revenue|\barr\b|\bmrr\b|spend|cash|burn|\bcost\b|price|deal size|payment|payroll|margin|\bgpu\b|gross|p&l|cogs|\blabor\b|\broi\b|\bvalue\b|\$/i.test(name)) return 'currency'
  if (/\btime\b|\bdays?\b|cycle|to hire|to resolve|\bmttr\b|velocity|runtime/i.test(name)) return 'duration'
  if (/csat|\bnps\b|score|rating|satisfaction/i.test(name)) return 'score'
  if (/rate|win|churn|\bctr\b|roas|attrition|breach|acceptance|utiliz|conversion|open rate|uptime|adherence|completeness|compliance/i.test(name)) return 'percent'
  return 'count'
}

// A semantically-appropriate KPI value (raw number + display string) for a metric.
function semanticKpi(name, h) {
  const pick = (arr) => arr[h % arr.length]
  switch (metricUnit(name)) {
    case 'currency': {
      const v = pick([1243200, 486000, 92400, 2140000, 318000])
      return { raw: v, value: formatValue(v, { style: 'currency', abbreviate: true, decimals: 1 }) }
    }
    case 'percent': {
      const v = pick([94.2, 28.4, 67.5, 88, 12.3])
      return { raw: v, value: `${v}%` }
    }
    case 'duration': {
      const o = pick([{ raw: 28, s: '28 days' }, { raw: 1.4, s: '1.4 h' }, { raw: 3, s: '3 days' }, { raw: 42, s: '42 min' }])
      return { raw: o.raw, value: o.s }
    }
    case 'score': {
      const v = pick([4.6, 4.2, 3.9])
      return { raw: v, value: `${v} / 5` }
    }
    default: {
      const v = pick([1284, 86400, 12480, 540, 3120, 21000])
      return { raw: v, value: v < 10000 ? v.toLocaleString('en-US') : formatValue(v, { abbreviate: true, decimals: 1 }) }
    }
  }
}

// Category labels that match the metric (stages / channels / regions / …).
function breakdownCats(name = '') {
  if (/stage|pipeline|funnel|\bmql\b|\bsql\b/i.test(name)) return ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed']
  if (/channel/i.test(name)) return ['Email', 'Social', 'Search', 'Direct', 'Referral']
  if (/region/i.test(name)) return ['North America', 'EMEA', 'APAC', 'LATAM']
  if (/plan|tier|subscription/i.test(name)) return ['Free', 'Pro', 'Team', 'Enterprise']
  if (/action|type/i.test(name)) return ['Email', 'SMS', 'Call', 'Forward', 'Note']
  if (/\bdept\b|department|\bteam\b/i.test(name)) return ['Sales', 'Support', 'Success', 'Ops']
  if (/priority/i.test(name)) return ['Critical', 'High', 'Medium', 'Low']
  if (/category|expense/i.test(name)) return ['Payroll', 'Software', 'Marketing', 'Travel', 'Other']
  if (/business unit/i.test(name)) return ['North', 'South', 'East', 'West']
  return ['Segment A', 'Segment B', 'Segment C', 'Segment D']
}

const DELTAS = [['+8.2%', 'up'], ['+1.1%', 'up'], ['-3.0%', 'down'], ['+12.4%', 'up'], ['-5.1%', 'down']]

function hashId(s = '') {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Re-label a breakdown by the chosen dimension's categories, then apply a transform.
// `opts` = { dimensionId, transform } — absent ⇒ identity (the pre-Phase-1 behavior).
function shapeBreakdown(breakdown, opts) {
  if (!opts || !breakdown?.length) return breakdown
  let bd = breakdown
  const cats = opts.dimensionId && opts.dimensionId !== 'none' && opts.dimensionId !== 'time' ? dimensionCats(opts.dimensionId) : null
  if (cats) bd = cats.map((label, i) => ({ label, value: breakdown[i % breakdown.length]?.value ?? 10 }))
  return applyTransform(bd, opts.transform)
}

// Format a raw value in the metric's natural unit (the breakdown column header
// carries the unit for duration, so a bare number there is fine).
function formatMetric(raw, unit) {
  switch (unit) {
    case 'currency': return formatValue(raw, { style: 'currency', abbreviate: Math.abs(raw) >= 1000, decimals: Math.abs(raw) >= 1000 ? 1 : 0 })
    case 'percent': return `${Math.round(raw * 10) / 10}%`
    case 'score': return `${Math.round(raw * 10) / 10} / 5`
    case 'duration': return `${Math.round(raw * 10) / 10}`
    default: return raw >= 10000 ? formatValue(raw, { abbreviate: true, decimals: 1 }) : Math.round(raw).toLocaleString('en-US')
  }
}
// Keep a per-category value plausible for its unit (percent ≤100, score ≤5, …).
function clampUnit(unit, v) {
  if (unit === 'percent') return Math.min(100, Math.max(1, Math.round(v * 10) / 10))
  if (unit === 'score') return Math.min(5, Math.max(1, Math.round(v * 10) / 10))
  return Math.max(1, Math.round(v))
}
// The first-column label for a metric's breakdown (mirrors breakdownCats' branches).
function dimLabelOf(name = '') {
  if (/stage|pipeline|funnel|\bmql\b|\bsql\b/i.test(name)) return 'Stage'
  if (/channel/i.test(name)) return 'Channel'
  if (/region/i.test(name)) return 'Region'
  if (/plan|tier|subscription/i.test(name)) return 'Tier'
  if (/action|type/i.test(name)) return 'Type'
  if (/\bdept\b|department|\bteam\b/i.test(name)) return 'Team'
  if (/priority/i.test(name)) return 'Priority'
  if (/category|expense/i.test(name)) return 'Category'
  if (/business unit/i.test(name)) return 'Unit'
  return 'Segment'
}

// Consumption controls: a date range scales magnitude (longer = bigger cumulative
// numbers) and active filters narrow the data. Shared by the builder preview and
// the consumption surfaces; declared here so previewData (below) can read it safely.
const RANGE_MULT = { '7d': 0.45, '30d': 0.78, '90d': 1, qtd: 0.9, '12m': 1.7 }

// ── Shared metric-coherent facet builder ────────────────────────────────────
// Builds EVERY facet (kpi/breakdown/series/records/geo/matrix/scatter/narrative/
// gauge) from the metric NAME, so the builder preview AND the placed dashboard
// widget render the SAME data — switching the widget type only re-visualizes it,
// never swaps in unrelated canned rows. `h` seeds variety (stable per identity),
// `m` is the magnitude multiplier (date range × filters × scope rollup).
function metricBundle(name, { h = 0, m = 1, dimensionId, transform } = {}) {
  const unit = metricUnit(name)
  const additive = unit === 'currency' || unit === 'count'
  const k = semanticKpi(name, h)
  const transformed = !!(transform && transform !== 'none')
  const kpiRaw = additive ? Math.max(1, Math.round(k.raw * m)) : k.raw
  const kpiValue = additive ? formatMetric(kpiRaw, unit) : k.value

  // Breakdown by the metric's natural categories. Additive units distribute the
  // KPI across categories (Σ ≈ KPI); ratio units carry a per-category rate/score.
  const cats = breakdownCats(name)
  const weights = cats.map((_, i) => SAMPLE.breakdown[i % SAMPLE.breakdown.length].value)
  const wsum = weights.reduce((a, b) => a + b, 0) || 1
  const maxw = Math.max(...weights)
  const rawBreakdown = cats.map((label, i) =>
    additive
      ? { label, value: Math.max(1, Math.round(kpiRaw * (weights[i] / wsum))) }
      : { label, value: clampUnit(unit, k.raw * (0.55 + (weights[i] / maxw) * 0.5)) },
  )
  const breakdown = dimensionId || transform ? shapeBreakdown(rawBreakdown, { dimensionId, transform }) : rawBreakdown
  // Share is computed from the SHAPED breakdown (a dimension can re-slice the set),
  // so per-row shares always add up to 100%.
  const total = breakdown.reduce((a, b) => a + b.value, 0) || 1

  // Series: the metric over time, scaled to its magnitude.
  const seriesBase = additive ? kpiRaw / cats.length : k.raw
  const series = MONTHS.map((mo, i) => ({
    x: mo,
    y: Math.max(0, Math.round(seriesBase * (0.7 + 0.45 * Math.sin(i / 1.6) + i * 0.05) + ((h >> i) % 7) - 3)),
  }))

  // Records: the breakdown AS a table — Dimension | Metric | Share (no fake owners).
  const dimLabel = dimensionId && dimensionId !== 'none' ? dimensionById(dimensionId)?.name || dimLabelOf(name) : dimLabelOf(name)
  const records = breakdown.map((b) => ({
    name: b.label,
    value: transformed ? `${b.value}` : formatMetric(b.value, unit),
    share: additive && !transformed ? `${Math.round((b.value / total) * 100)}%` : '—',
  }))
  const recordHeaders = additive && !transformed ? [dimLabel, name, 'Share'] : [dimLabel, name]

  // Geo: the metric by region, scaled the same way.
  const geoMax = Math.max(...SAMPLE.geo.map((g) => g.value))
  const geoSum = SAMPLE.geo.reduce((a, g) => a + g.value, 0) || 1
  const geo = SAMPLE.geo.map((g) =>
    additive
      ? { region: g.region, value: Math.max(1, Math.round(kpiRaw * (g.value / geoSum))) }
      : { region: g.region, value: clampUnit(unit, k.raw * (0.6 + (g.value / geoMax) * 0.4)) },
  )

  // Matrix / scatter: index-scaled so they track the metric's magnitude.
  const cells = SAMPLE.matrix.cells.map((row) => row.map((v) => Math.min(100, Math.max(5, Math.round(v * (0.8 + 0.2 * m))))))
  const twoVar = SAMPLE.twoVar.map((p, i) => ({ x: Math.max(2, Math.round(p.x * (0.7 + 0.3 * m) + ((h >> i) % 5))), y: Math.max(2, Math.round(p.y * (0.7 + 0.3 * m) + ((h >> (i + 1)) % 6))) }))

  // Narrative referencing the metric's real headline + top category.
  const top = [...breakdown].sort((a, b) => b.value - a.value)[0]
  const narrative = {
    text: `${name} is ${kpiValue} overall${top ? `, led by ${top.label}` : ''}. ${additive && top && !transformed ? `${top.label} accounts for ${Math.round((top.value / total) * 100)}% of the total.` : 'Values are within the expected range for the period.'}`,
    bullets: breakdown.slice(0, 3).map((b) => `${b.label}: ${transformed ? b.value : formatMetric(b.value, unit)}`),
  }

  // Gauge: progress vs an implied target (rate/score map directly; additive → % to goal).
  const gaugeVal =
    unit === 'percent' ? Math.min(99, Math.max(5, Math.round(kpiRaw)))
      : unit === 'score' ? Math.min(99, Math.round((kpiRaw / 5) * 100))
        : Math.min(99, Math.max(5, Math.round((58 + (h % 34)) * (0.85 + 0.15 * m))))

  return {
    label: name,
    kpi: { value: kpiValue, delta: DELTAS[h % DELTAS.length][0], deltaDir: DELTAS[h % DELTAS.length][1] },
    kpiRaw,
    breakdown,
    series,
    geo,
    twoVar,
    matrix: { ...SAMPLE.matrix, cells },
    records,
    recordHeaders,
    recordTotal: records.length,
    narrative,
    gauge: { value: gaugeVal, label: 'of target' },
  }
}

// Builder preview: the metric + its slice/transform, narrowed by the preview's
// interactive filters (date range × chips). Ratio units keep their headline.
// `opts` = { dimension, transform, range, filterCount }.
export function previewData(metric, opts) {
  const name = metric?.name || 'Value'
  const additive = (() => { const u = metricUnit(name); return u === 'currency' || u === 'count' })()
  const rangeMult = (opts && RANGE_MULT[opts.range]) || 1
  const filterScale = 1 - Math.min(0.4, (opts?.filterCount || 0) * 0.15)
  const m = additive ? rangeMult * filterScale : 1
  return { ...SAMPLE, ...metricBundle(name, { h: hashId(name), m, dimensionId: opts?.dimension?.id, transform: opts?.transform }) }
}

// Dashboard/library render: the SAME metricBundle as the builder preview (so a
// saved widget looks identical where it's placed), scaled by the consumption
// scope (date range × filters × PBAC rollup). The KPI base stays stable per
// widget identity; only its magnitude scales — except live tiles, which wobble
// the headline ±4% per tick on top (count/currency).
export function widgetSample(widget, scope) {
  const base = widget?.id || widget?.name || ''
  const name = widget?.name || ''
  const filterVals = scope?.filters ? Object.values(scope.filters).filter((v) => v && v !== 'All') : []
  const live = widget?.freshness === 'live'
  const tickN = live && scope?.tick ? scope.tick : 0
  const hStable = hashId(base) // stable identity → stable base values + chart shapes
  const rangeMult = (scope && RANGE_MULT[scope.range]) || 1
  const filterScale = 1 - Math.min(0.4, filterVals.length * 0.15) // each active filter narrows the data
  const rollupMult = scope?.rollup ? scopeMult(scope.rollup) : 1 // broader PBAC scope → larger aggregates
  const m = rangeMult * filterScale * rollupMult

  const bundle = metricBundle(name, { h: hStable, m, dimensionId: widget?.dimension, transform: widget?.transform })

  // Live tiles wobble the headline each tick (count/currency only; the salt folds
  // in the tick so the jitter actually changes between intervals).
  if (tickN) {
    const u = metricUnit(name)
    if (u === 'count' || u === 'currency') {
      const salt = `${scope.range || ''}|${filterVals.join(',')}|${scope.rollup || ''}|t${tickN}`
      const hTick = hashId(`${base}#${salt}`)
      const wob = 1 + (((hTick % 9) - 4) / 100) // ±4%, deterministic per tick
      const raw = Math.max(1, Math.round(bundle.kpiRaw * wob))
      bundle.kpiRaw = raw
      bundle.kpi = {
        ...bundle.kpi,
        value:
          u === 'currency'
            ? formatValue(raw, { style: 'currency', abbreviate: true, decimals: 1 })
            : raw < 10000
              ? raw.toLocaleString('en-US')
              : formatValue(raw, { abbreviate: true, decimals: 1 }),
      }
    }
  }
  return { ...SAMPLE, ...bundle }
}

// ── Table-backed widgets: REAL computed table data in the preview/render contract ──
// Builds a widgetSample-shaped bundle from a Table Definition's computed rows so the
// existing KPI/Bar/List/Pie/Table views render the table's actual values (and formulas).
export function tableData(def, valueKey) {
  if (!def) return { ...SAMPLE, label: 'Table removed' }
  const computed = computeTable(def)
  const dim = tableDimColumn(def)
  const col = def.columns.find((c) => c.key === valueKey)
  if (!col) return { ...SAMPLE, label: 'Column removed' } // a saved widget can reference a since-deleted column
  const fmt = col.format || 'number'
  // Percent columns are stored as fractions (0.317) — scale to a readable magnitude
  // for charts; KPI/cells still use formatCell so they read "31.7%".
  const scale = fmt === 'percent' ? 100 : 1
  const round1 = (n) => Math.round(n * 10) / 10
  const rows = computed.rows
  const breakdown = rows.map((r) => ({ label: String(r[dim.key]), value: round1((Number(r[valueKey]) || 0) * scale) }))
  const series = breakdown.map((b) => ({ x: b.label, y: b.value }))
  const avg = columnAvg(computed, valueKey)
  const max = Math.max(0, ...rows.map((r) => Number(r[valueKey]) || 0))
  const gaugeVal = fmt === 'percent' ? Math.round(avg * 100) : max > 0 ? Math.round((avg / max) * 100) : 0
  const records = rows.map((r) => ({ name: String(r[dim.key]), owner: '—', value: formatCell(r[valueKey], fmt), status: '' }))
  return {
    ...SAMPLE,
    label: col.label,
    breakdown,
    series,
    kpi: { value: formatCell(avg, fmt), delta: '', deltaDir: 'up' },
    // Keep kpiRaw consistent with the scaled breakdown so a Percent format override reads "31.7%", not "0%".
    kpiRaw: fmt === 'percent' ? round1(avg * 100) : avg,
    gauge: { value: Math.min(100, Math.max(0, gaugeVal)), label: col.label },
    records,
    recordTotal: rows.length,
    tableGrid: { columns: def.columns, rows },
  }
}

// Soft fit of a widget type to a metric kind — drives the gallery's recommend/grey.
const GOOD = {
  timeseries: ['line', 'bar', 'table', 'kpi', 'carousel', 'summary'],
  breakdown: ['bar', 'pie', 'funnel', 'table', 'list', 'heatmap'],
  kpi: ['kpi', 'gauge', 'statrow', 'summary'],
  twoVar: ['scatter', 'table'],
  matrix: ['heatmap', 'table'],
  records: ['table', 'list', 'board', 'feed', 'carousel'],
  geo: ['map', 'list', 'bar'],
  narrative: ['summary', 'list', 'feed'],
  alert: ['alerts', 'list', 'table'],
}
export function fitScore(kind, typeId) {
  return (GOOD[kind] || []).includes(typeId) ? 'good' : 'poor'
}

// ── "Best way to show the data" — recommend a visualization for a widget ──
// Bridges a widget's render `skeleton` to a data `kind`, then to the chart types
// that suit that kind. Used on the canvas to suggest / pick a visualization.
const SKELETON_KIND = {
  KPI: 'kpi',
  Gauge: 'kpi',
  'Stat Row': 'kpi',
  Chart: 'timeseries',
  Donut: 'breakdown',
  Funnel: 'breakdown',
  Table: 'records',
  List: 'breakdown',
  Board: 'records',
  Feed: 'narrative',
  Alerts: 'alert',
  'Heat Map': 'matrix',
  Map: 'geo',
  'AI Summary': 'narrative',
  Timeline: 'timeseries',
}
// Chart type id → the renderable skeleton label WidgetRender understands.
const TYPEID_SKELETON = {
  kpi: 'KPI',
  statrow: 'Stat Row',
  gauge: 'Gauge',
  line: 'Chart',
  bar: 'Chart',
  pie: 'Donut',
  funnel: 'Funnel',
  table: 'Table',
  list: 'List',
  board: 'Board',
  feed: 'Feed',
  alerts: 'Alerts',
  heatmap: 'Heat Map',
  scatter: 'Chart',
  carousel: 'List',
  summary: 'AI Summary',
  map: 'Map',
}
// All renderable visualization options (what a placement can be shown as).
export const VIZ_OPTIONS = ['KPI', 'Stat Row', 'Chart', 'Donut', 'Funnel', 'Gauge', 'Table', 'List', 'Board', 'Feed', 'Alerts', 'Heat Map', 'Map', 'AI Summary']

// KPI and Gauge are interchangeable single-value views — don't nag to swap between them.
export function vizInterchangeable(a, b) {
  const single = (s) => s === 'KPI' || s === 'Gauge'
  return single(a) && single(b)
}

// Returns the data kind, the single best skeleton, and the set of recommended skeletons.
export function vizRecommendation(widget) {
  const kind = SKELETON_KIND[widget?.skeleton] || 'timeseries'
  const recommended = [...new Set((GOOD[kind] || []).map((t) => TYPEID_SKELETON[t]).filter(Boolean))]
  return { kind, best: recommended[0] || widget?.skeleton, recommended }
}
