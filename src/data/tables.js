// Phase 6 — Table Definitions: the "build a table with formulas, then display it" path.
// A governed, user-authored table composed on top of normalized data. Columns are
// literal (S), measure-backed (M), or formula (F — an expression over other columns).
// Formula columns compute client-side and surface on a widget exactly like a measure.

// Safe arithmetic evaluator over column references only. Validates the charset,
// substitutes column values, and guards — never evaluates arbitrary JS.
export function evalFormula(expr, row) {
  if (!expr) return null
  if (!/^[A-Za-z0-9_\s.+\-*/()%]+$/.test(expr)) return null
  const keys = Object.keys(row)
  // Arithmetic over KNOWN column references only — reject any other identifier
  // (blocks constructor/toString/etc. that would otherwise pass the charset).
  const known = new Set(keys)
  const idents = expr.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
  if (idents.some((id) => !known.has(id))) return null
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `"use strict"; return (${expr});`)
    const v = fn(...keys.map((k) => (typeof row[k] === 'number' ? row[k] : Number(row[k]) || 0)))
    return Number.isFinite(v) ? v : null
  } catch {
    return null
  }
}

// kind: 'literal' (S) | 'measure' (M) | 'formula' (F). format drives display.
export const TABLE_DEFINITIONS = [
  {
    id: 'tbl-bdc',
    name: 'BDC Coaching KPIs',
    description: 'Rep call-to-appointment performance vs target — the worked formula-table example.',
    scope: 'TENANT',
    owner: 'Priya Nair',
    freshness: 'fresh',
    ttl: '24h',
    columns: [
      { key: 'rep_name', label: 'Rep', kind: 'literal', type: 'text' },
      { key: 'calls', label: 'Calls', kind: 'measure', type: 'number', format: 'number' },
      { key: 'appts', label: 'Appts', kind: 'measure', type: 'number', format: 'number' },
      { key: 'close_rate', label: 'Close Rate', kind: 'formula', type: 'number', format: 'percent', formula: 'appts / calls' },
      { key: 'target_close_rate', label: 'Target', kind: 'literal', type: 'number', format: 'percent' },
      { key: 'variance', label: 'Variance', kind: 'formula', type: 'number', format: 'percent', formula: 'close_rate - target_close_rate', colorSigned: true },
    ],
    rows: [
      { rep_name: 'Ana Reyes', calls: 120, appts: 38, target_close_rate: 0.3 },
      { rep_name: 'Tom Becker', calls: 96, appts: 22, target_close_rate: 0.3 },
      { rep_name: 'María González', calls: 140, appts: 51, target_close_rate: 0.3 },
      { rep_name: 'Sam Ortiz', calls: 88, appts: 19, target_close_rate: 0.3 },
      { rep_name: 'Dana Lee', calls: 110, appts: 41, target_close_rate: 0.3 },
    ],
  },
  {
    id: 'tbl-sla',
    name: 'Support SLA by Team',
    description: 'Per-team SLA compliance computed from tickets and breaches.',
    scope: 'TENANT',
    owner: 'James Okonkwo',
    freshness: 'live',
    ttl: '1h',
    columns: [
      { key: 'team', label: 'Team', kind: 'literal', type: 'text' },
      { key: 'tickets', label: 'Tickets', kind: 'measure', type: 'number', format: 'number' },
      { key: 'breaches', label: 'Breaches', kind: 'measure', type: 'number', format: 'number' },
      { key: 'sla_rate', label: 'SLA Rate', kind: 'formula', type: 'number', format: 'percent', formula: '(tickets - breaches) / tickets' },
      { key: 'target', label: 'Target', kind: 'literal', type: 'number', format: 'percent' },
      { key: 'gap', label: 'Gap', kind: 'formula', type: 'number', format: 'percent', formula: 'sla_rate - target', colorSigned: true },
    ],
    rows: [
      { team: 'Tier 1', tickets: 1240, breaches: 62, target: 0.95 },
      { team: 'Tier 2', tickets: 880, breaches: 88, target: 0.95 },
      { team: 'Escalations', tickets: 320, breaches: 12, target: 0.95 },
      { team: 'Billing', tickets: 210, breaches: 25, target: 0.95 },
    ],
  },
]

// Evaluate every formula column for every row (column order = dependency order,
// so a formula can read an earlier formula column).
export function computeTable(def) {
  if (!def) return null
  const formulas = def.columns.filter((c) => c.kind === 'formula')
  const rows = def.rows.map((r) => {
    const out = { ...r }
    for (const c of formulas) out[c.key] = evalFormula(c.formula, out)
    return out
  })
  return { ...def, rows }
}

export function formatCell(value, fmt) {
  if (value == null || value === '') return '—'
  if (fmt === 'percent') return `${(Number(value) * 100).toFixed(1)}%`
  if (fmt === 'currency') return `$${Number(value).toLocaleString('en-US')}`
  if (fmt === 'number') return Number(value).toLocaleString('en-US')
  return String(value)
}

export function tableStats(def) {
  return {
    columns: def.columns.length,
    formulas: def.columns.filter((c) => c.kind === 'formula').length,
    rows: def.rows.length,
  }
}

// Average of a numeric/formula column across the computed rows (for KPI display).
export function columnAvg(computed, key) {
  const vals = computed.rows.map((r) => Number(r[key])).filter((n) => Number.isFinite(n))
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}
