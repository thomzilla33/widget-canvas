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
  gauge: { value: 68, label: 'of target' },
  recordTotal: 1284, // realistic row count for record-set previews (truncated display)
}

// Returns the full sample bundle, lightly labeled by the chosen metric.
export function previewData(metric) {
  return { ...SAMPLE, label: metric?.name || 'Value' }
}

// Deterministic per-widget variation so a board of widgets looks realistic
// (distinct KPI values, gauge levels, and chart shapes) instead of identical.
const KPI_VARIANTS = [
  { value: '$1.24M', delta: '+8.2%', deltaDir: 'up' },
  { value: '94.2%', delta: '+1.1%', deltaDir: 'up' },
  { value: '1,284', delta: '-3.0%', deltaDir: 'down' },
  { value: '$486K', delta: '+12.4%', deltaDir: 'up' },
  { value: '28 days', delta: '-2 days', deltaDir: 'up' },
  { value: '4.6 / 5', delta: '+0.3', deltaDir: 'up' },
  { value: '$92.4K', delta: '-5.1%', deltaDir: 'down' },
]
const GAUGE_VARIANTS = [68, 82, 45, 91, 73, 57, 88]

function hashId(s = '') {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function widgetSample(widget) {
  const h = hashId(widget?.id || widget?.name || '')
  const factor = 0.65 + (h % 8) * 0.11
  const series = SAMPLE.series.map((d, i) => ({ x: d.x, y: Math.max(8, Math.round(d.y * factor + ((h >> i) % 22) - 10)) }))
  const breakdown = SAMPLE.breakdown.map((b, i) => ({ ...b, value: Math.max(6, Math.round(b.value * factor + ((h >> (i + 1)) % 16))) }))
  const geo = SAMPLE.geo.map((g, i) => ({ ...g, value: Math.max(5, Math.round(g.value * factor + ((h >> (i + 3)) % 18))) }))
  const cells = SAMPLE.matrix.cells.map((row, ri) =>
    row.map((v, ci) => Math.min(100, Math.max(10, Math.round(v * factor + ((h >> (ri + ci)) % 20))))),
  )
  // Rotate the record set per widget so two tables/lists don't show identical rows.
  const start = h % SAMPLE.records.length
  const records = [...SAMPLE.records.slice(start), ...SAMPLE.records.slice(0, start)]
  const twoVar = SAMPLE.twoVar.map((p, i) => ({
    x: Math.max(2, Math.round(p.x * factor + ((h >> i) % 10))),
    y: Math.max(2, Math.round(p.y * factor + ((h >> (i + 2)) % 12))),
  }))
  return {
    ...SAMPLE,
    series,
    breakdown,
    geo,
    records,
    twoVar,
    matrix: { ...SAMPLE.matrix, cells },
    kpi: KPI_VARIANTS[h % KPI_VARIANTS.length],
    gauge: { value: GAUGE_VARIANTS[h % GAUGE_VARIANTS.length], label: 'of target' },
  }
}

// Soft fit of a widget type to a metric kind — drives the gallery's recommend/grey.
const GOOD = {
  timeseries: ['line', 'bar', 'table', 'kpi', 'carousel', 'summary'],
  breakdown: ['bar', 'pie', 'table', 'list', 'heatmap'],
  kpi: ['kpi', 'gauge', 'summary'],
  twoVar: ['scatter', 'table'],
  matrix: ['heatmap', 'table'],
  records: ['table', 'list', 'carousel'],
  geo: ['map', 'list', 'bar'],
  narrative: ['summary', 'list'],
}
export function fitScore(kind, typeId) {
  return (GOOD[kind] || []).includes(typeId) ? 'good' : 'poor'
}
