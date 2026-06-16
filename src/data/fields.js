// Phase 1 — the field & tile model the spec introduces.
// Every field is a Dimension (D, group-by/axis) or a Measure (M, the numeric value).
// A widget = a measure, optionally sliced by a dimension, bound to a tile's slots,
// with optional transforms. This module is the single source for that model.

// ── 1.1 Field roles ──
// Source `metrics` are measures; `recordSets` are row-level (dimension-bearing).
export function fieldRole(field) {
  if (!field) return 'measure'
  if (field.kind === 'records') return 'records'
  return 'measure'
}

// ── Dimensions (D): categorical / time fields a measure can be sliced by. ──
export const DIMENSIONS = [
  { id: 'none', name: 'No breakdown', kind: 'none' },
  { id: 'time', name: 'Time', kind: 'time' },
  { id: 'status', name: 'Status', kind: 'cat' },
  { id: 'type', name: 'Type', kind: 'cat' },
  { id: 'team', name: 'Team', kind: 'cat' },
  { id: 'agent', name: 'Agent', kind: 'cat' },
  { id: 'stage', name: 'Stage', kind: 'cat' },
  { id: 'outcome', name: 'Outcome', kind: 'cat' },
  { id: 'priority', name: 'Priority', kind: 'cat' },
  { id: 'tier', name: 'Tier', kind: 'cat' },
  { id: 'region', name: 'Region', kind: 'geo' },
]
export function dimensionById(id) {
  return DIMENSIONS.find((d) => d.id === id) || DIMENSIONS[0]
}

// Which dimensions make sense for a given source + measure (always offers None + Time).
export function dimensionsFor(source, measure) {
  const ctx = `${source?.name || ''} ${measure?.name || ''}`.toLowerCase()
  const ids = new Set(['none', 'time'])
  if (/governance|council|gate|policy|block|outcome/.test(ctx)) ['outcome', 'type', 'status'].forEach((d) => ids.add(d))
  if (/agent|workflow|run|action|agentic/.test(ctx)) ['agent', 'type', 'status'].forEach((d) => ids.add(d))
  if (/team|hitl|human|queue|support|sla/.test(ctx)) ['team', 'priority', 'status'].forEach((d) => ids.add(d))
  if (/truth|fact/.test(ctx)) ['tier', 'type'].forEach((d) => ids.add(d))
  if (/region|geo|activity/.test(ctx)) ids.add('region')
  if (/funnel|stage|pipeline|conversion/.test(ctx)) ids.add('stage')
  if (/message|conversation/.test(ctx)) ['type', 'agent'].forEach((d) => ids.add(d))
  // Default useful slices when nothing matched.
  if (ids.size <= 2) ['type', 'team', 'status'].forEach((d) => ids.add(d))
  return DIMENSIONS.filter((d) => ids.has(d.id))
}

// ── 1.2 Slot model: the slots each tile type fills, and what role fits each slot. ──
// `m` = measure, `d` = dimension, `t` = transform/derived.
export const SLOT_MODEL = {
  kpi: [{ key: 'value', label: 'Value', role: 'm' }, { key: 'trend', label: 'Trend', role: 't', optional: true }, { key: 'target', label: 'Target', role: 't', optional: true }],
  statrow: [{ key: 'measures', label: 'Measures', role: 'm', multi: true }],
  gauge: [{ key: 'value', label: 'Value', role: 'm' }, { key: 'target', label: 'Target', role: 't', optional: true }],
  line: [{ key: 'x', label: 'X (time)', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }],
  bar: [{ key: 'category', label: 'Category', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }, { key: 'series', label: 'Series', role: 'd', optional: true }],
  pie: [{ key: 'segment', label: 'Segment', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }],
  funnel: [{ key: 'stage', label: 'Stage', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }],
  list: [{ key: 'category', label: 'Item', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }],
  table: [{ key: 'columns', label: 'Columns', role: 'md', multi: true }],
  board: [{ key: 'entity', label: 'Entity', role: 'd' }, { key: 'status', label: 'Status', role: 'd' }],
  heatmap: [{ key: 'rows', label: 'Rows', role: 'd' }, { key: 'cols', label: 'Columns', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }],
  scatter: [{ key: 'x', label: 'X', role: 'm' }, { key: 'y', label: 'Y', role: 'm' }],
  map: [{ key: 'region', label: 'Region', role: 'd' }, { key: 'value', label: 'Value', role: 'm' }],
  feed: [{ key: 'events', label: 'Events', role: 'records' }],
  alerts: [{ key: 'alerts', label: 'Alerts', role: 'records' }],
  carousel: [{ key: 'records', label: 'Records', role: 'records' }],
  summary: [{ key: 'narrative', label: 'Narrative', role: 'm' }],
}
export function slotsFor(typeId) {
  return SLOT_MODEL[typeId] || []
}

// Auto-bind the chosen measure + dimension into a tile's slots (read-only display
// in the builder; shows the user how the field model maps to the visualization).
export function bindSlots(typeId, measure, dimension, transform) {
  const slots = slotsFor(typeId)
  const mName = measure?.name || '—'
  const dName = dimension && dimension.id !== 'none' ? dimension.name : null
  const tName = transform && transform !== 'none' ? TRANSFORM_LABEL[transform] : null
  return slots.map((s) => {
    let bound = '—'
    if (s.role === 'm') bound = mName
    else if (s.role === 'd') bound = dName || (s.optional ? '—' : 'Time')
    else if (s.role === 'md') bound = dName ? `${dName}, ${mName}` : mName
    else if (s.role === 'records') bound = mName
    else if (s.role === 't') bound = s.key === 'trend' ? tName || 'Δ vs prior' : tName || '—'
    return { ...s, bound }
  })
}

// ── 1.3 Tile recommendation from the measure × dimension shape. ──
export function recommendTile(measure, dimension) {
  const d = dimension?.id || 'none'
  if (d === 'none') return measure?.recommendedType || 'kpi'
  if (d === 'time') return 'line'
  if (d === 'region') return 'map'
  if (d === 'stage') return 'funnel'
  if (d === 'status') return 'board'
  // A small categorical split reads well as a donut; otherwise a bar.
  if (d === 'outcome' || d === 'tier') return 'pie'
  return 'bar'
}

// ── 1.4 Transforms (T) — reshape a measure/breakdown. ──
export const TRANSFORMS = [
  { id: 'none', label: 'None' },
  { id: 'delta', label: 'Δ vs prior period' },
  { id: 'pct_total', label: '% of total' },
  { id: 'top_n', label: 'Top 5' },
  { id: 'bottom_n', label: 'Bottom 5' },
  { id: 'cumulative', label: 'Running total' },
]
export const TRANSFORM_LABEL = Object.fromEntries(TRANSFORMS.map((t) => [t.id, t.label]))

// How the measure value aggregates (the headline number's math).
export const AGGREGATIONS = [
  { id: 'sum', label: 'Sum' },
  { id: 'avg', label: 'Average' },
  { id: 'min', label: 'Min' },
  { id: 'max', label: 'Max' },
  { id: 'p95', label: 'p95' },
]

// Category labels for a dimension (used to slice the preview/render breakdown).
const DIM_CATS = {
  status: ['Active', 'Idle', 'Paused', 'Error'],
  type: ['Email', 'SMS', 'Call', 'Forward', 'Note'],
  team: ['Sales', 'Support', 'Success', 'Ops'],
  agent: ['Sales Copilot', 'Support Triage', 'Invoice Bot', 'Renewal Agent'],
  stage: ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
  outcome: ['Allowed', 'Degraded', 'Blocked', 'Escalated'],
  priority: ['Critical', 'High', 'Medium', 'Low'],
  tier: ['Tier 1', 'Tier 2', 'Tier 3'],
  region: ['North America', 'EMEA', 'APAC', 'LATAM'],
}
export function dimensionCats(dimensionId) {
  return DIM_CATS[dimensionId] || null
}

// Apply a breakdown transform to a [{label,value}] array (pure).
export function applyTransform(breakdown, transform) {
  if (!Array.isArray(breakdown) || !breakdown.length) return breakdown
  switch (transform) {
    case 'pct_total': {
      const total = breakdown.reduce((s, b) => s + (Number(b.value) || 0), 0) || 1
      return breakdown.map((b) => ({ ...b, value: Math.round((b.value / total) * 1000) / 10 }))
    }
    case 'top_n':
      return [...breakdown].sort((a, b) => b.value - a.value).slice(0, 5)
    case 'bottom_n':
      return [...breakdown].sort((a, b) => a.value - b.value).slice(0, 5)
    case 'cumulative': {
      let run = 0
      return breakdown.map((b) => ({ ...b, value: (run += Number(b.value) || 0) }))
    }
    default:
      return breakdown
  }
}
