// "Describe-to-build" — deterministic natural-language → builder config. No model
// call: keyword + word-overlap matching over the REAL catalog, so a description
// generates a first preview the user then edits. Two entry points: a widget and a
// whole dashboard.
import { EXTERNAL_SOURCES, sourceFields, PROFILE_TYPES, REPORT_COLLECTIONS } from './mock.js'
import { DIMENSIONS, dimensionById, recommendTile } from './fields.js'

const STOP = new Set([
  'the', 'a', 'an', 'of', 'by', 'per', 'for', 'show', 'me', 'as', 'on', 'in', 'with',
  'and', 'to', 'my', 'our', 'this', 'that', 'widget', 'chart', 'graph', 'view', 'dashboard',
  'build', 'create', 'make', 'want', 'need', 'see', 'is', 'are', 'how', 'many',
])
// Tokens, lowercased, stop-words dropped, naive singular (trailing 's').
function tokens(s = '') {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((w) => !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w))
}

// Explicit visualization words → tile typeId (first match wins).
const TYPE_KEYWORDS = [
  ['map', /\bmap\b|geograph|by region|by country|by geo/],
  ['line', /\btrend\b|over time|line chart|\bline\b|monthly|by month|by quarter|time series|timeline/],
  ['pie', /\bpie\b|donut|proportion|share of|\bmix\b/],
  ['funnel', /funnel|conversion/],
  ['gauge', /gauge|progress|vs target|to target|attainment|% to/],
  ['table', /\btable\b|\brows?\b|records?|list of|grid/],
  ['scatter', /scatter|correlat/],
  ['list', /\blist\b|ranked|leaderboard|top \d/],
  ['bar', /\bbar\b|breakdown|compare|by (stage|team|type|category|channel|priority|tier|segment|department|status|outcome)/],
  ['kpi', /\bkpi\b|single number|headline|\btotal\b|count of|number of/],
]
function detectType(t) {
  for (const [id, re] of TYPE_KEYWORDS) if (re.test(t)) return id
  return null
}

// "by X" / "per X" dimension words → dimension id.
const DIM_KEYWORDS = [
  ['region', /region|countr|geo|territor/],
  ['stage', /stage|pipeline/],
  ['team', /\bteam\b|department|\bdept\b/],
  ['agent', /\bagent\b|\brep\b|owner/],
  ['priority', /priorit|severit/],
  ['tier', /\btier\b|\bplan\b|segment/],
  ['outcome', /outcome|result|disposition/],
  ['status', /status|\bstate\b/],
  ['type', /\btype\b|categor|channel/],
  ['time', /over time|monthly|by month|by quarter|by week|by day|\btrend\b|timeline/],
]
function detectDimension(t) {
  for (const [id, re] of DIM_KEYWORDS) if (re.test(t)) return id
  return 'none'
}

function dimName(id) {
  return DIMENSIONS.find((d) => d.id === id)?.name || ''
}

// Map a natural-language description to a widget config (or null if nothing matched).
export function describeWidget(text) {
  const t = (text || '').toLowerCase().trim()
  if (!t) return null
  const words = new Set(tokens(t))

  // Best matching field across CONNECTED sources, by token overlap + a full-name bonus.
  let best = null
  let bestScore = 0
  for (const s of EXTERNAL_SOURCES.filter((x) => x.connected)) {
    for (const f of sourceFields(s)) {
      const fw = tokens(f.name)
      if (!fw.length) continue
      let score = fw.filter((w) => words.has(w)).length
      if (t.includes(f.name.toLowerCase())) score += 3
      if (score > bestScore) {
        bestScore = score
        best = { sourceId: s.id, source: s, field: f }
      }
    }
  }
  if (!best || bestScore === 0) return null

  // If the matched metric already encodes a breakdown ("…by Team"), don't slice again.
  const fieldHasDim = /\bby\b/i.test(best.field.name)
  const dimensionId = fieldHasDim ? 'none' : detectDimension(t)
  const dimension = dimensionById(dimensionId)
  const typeId = detectType(t) || (best.field.kind === 'records' ? 'table' : recommendTile(best.field, dimension))
  const name = dimensionId !== 'none' && best.field.kind !== 'records' ? `${best.field.name} by ${dimName(dimensionId)}` : best.field.name
  return { sourceId: best.sourceId, metricId: best.field.id, dimensionId, typeId, name }
}

// Title-case a short label from the free text (first ~6 significant words).
function deriveName(text, fallback) {
  const raw = (text || '').trim().replace(/\s+/g, ' ')
  if (!raw) return fallback
  const short = raw.split(' ').slice(0, 6).join(' ').slice(0, 48)
  return short.charAt(0).toUpperCase() + short.slice(1)
}

// Map a description to a whole-dashboard config: where it lives + audience + a
// starting template (the "first preview" layout).
// Any word we know how to act on — if none appear, we can't map the description.
const DASH_RECOGNIZED = /report|exec|finance|leadership|rollup|\bhome\b|workspace|landing|contact|\bucp\b|person|\blead\b|account|compan|employee|\buep\b|staff|\bhr\b|\bdeal\b|opportunit|\bcase\b|ticket|sales|support|service|\bcs\b|success|manager|executive|revenue|operation|health|\bsla\b|\bcsat\b|\bteam\b|overview|activit|financ/

export function describeDashboard(text) {
  const t = (text || '').toLowerCase().trim()
  if (!t || !DASH_RECOGNIZED.test(t)) return null

  // Surface + (for profiles) the profile type.
  let surface = 'profile'
  let profileType = 'Company'
  if (/\breport\b|executive|\bexec\b|finance|leadership|rollup/.test(t)) surface = 'report'
  else if (/\bhome\b|workspace|landing|team home/.test(t)) surface = 'home'
  else {
    surface = 'profile'
    if (/contact|\bucp\b|person|lead\b/.test(t)) profileType = 'Contact'
    else if (/employee|\buep\b|staff|\bhr\b/.test(t)) profileType = 'Employee'
    else if (/\bdeal\b|opportunit/.test(t)) profileType = 'Deal'
    else if (/\bcase\b|ticket|support case/.test(t)) profileType = 'Case'
    else profileType = 'Company'
  }

  // Audience.
  let audience = 'Sales Agent'
  if (/\bexec|executive|c-level|\bceo\b|\bcfo\b/.test(t)) audience = 'Executive'
  else if (/manager|\blead\b|leadership/.test(t)) audience = 'Manager'
  else if (/support|service|\bcs\b|success/.test(t)) audience = 'Support Agent'
  else if (/revenue op|revops|operations/.test(t)) audience = 'Revenue Operations'
  else if (/sales/.test(t)) audience = 'Sales Agent'

  // Starting template (the first-preview layout).
  let templateId = 't-acct360'
  if (/support|health|ticket|\bsla\b|\bcsat\b|\bcase\b/.test(t)) templateId = 't-support'
  else if (/exec|executive|revenue|finance|leadership|overview|rollup/.test(t)) templateId = 't-exec'

  const collection = /finance/.test(t) ? 'Finance Reports' : /exec|leadership/.test(t) ? 'Executive' : REPORT_COLLECTIONS[0]
  const homeScope = /team/.test(t) ? 'team' : 'personal'
  const tab = /activit/.test(t) ? 'Activity' : /financ/.test(t) ? 'Financials' : (PROFILE_TYPES.find((p) => p.id === profileType)?.tabs[0] || 'Overview')

  const placement =
    surface === 'report'
      ? { surface, collection }
      : surface === 'home'
        ? { surface, homeScope }
        : { surface, profileType, scope: 'all', entityId: null, entityName: null, tab }

  return { name: deriveName(text, 'New dashboard'), audience, placement, templateId }
}
