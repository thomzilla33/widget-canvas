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
}

// Returns the full sample bundle, lightly labeled by the chosen metric.
export function previewData(metric) {
  return { ...SAMPLE, label: metric?.name || 'Value' }
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
