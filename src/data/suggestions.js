// U3 — AI-suggested widgets & tabs (deterministic mock; no model call).
// "Here's a profile / a source — what should I show?" → a ranked, reasoned set the
// admin can accept. Reuses the catalog (widgets) + the field model (recommendTile).
import { widgets, TYPE_LABEL } from './mock.js'
import { recommendTile, dimensionById } from './fields.js'

// Per-profile relevance: which catalog widgets fit each entity profile, and why.
const PROFILE_RELEVANCE = {
  Company: {
    keywords: /revenue|pipeline|win|deal|account|ticket|csat|sla|churn|\bnrr\b|\barr\b|\bmrr\b|margin/i,
    categories: ['Intelligence', 'Operational'],
    label: 'account health & revenue',
  },
  Contact: {
    keywords: /activity|appointment|ticket|csat|\bnps\b|email|message|conversation|task|engagement/i,
    categories: ['Engagement', 'Operational'],
    label: 'engagement & activity',
  },
  Employee: {
    keywords: /performance|productivity|goal|workload|runs|agent|resolution|handle/i,
    categories: ['Operational', 'AIMS OS'],
    label: 'performance & workload',
  },
}

// Rank catalog widgets for a profile type — top matches with a "why" reason.
// `placedIds` excludes widgets already on the dashboard.
export function suggestWidgetsForProfile(profileType, placedIds = [], limit = 6) {
  const rel = PROFILE_RELEVANCE[profileType] || PROFILE_RELEVANCE.Company
  const placed = new Set(placedIds)
  const scored = widgets
    .filter((w) => !placed.has(w.id) && w.health !== 'review') // skip needs-repin widgets
    .map((w) => {
      let score = 0
      const why = []
      if (rel.keywords.test(w.name)) { score += 3; why.push(`fits ${rel.label}`) }
      if (rel.categories.includes(w.category)) { score += 2; why.push(`${w.category} metric`) }
      if (w.category === 'AIMS OS') { score += 1; why.push('AIMS platform signal') }
      if (w.freshness === 'live') score += 0.5
      return { widget: w, score, why: why[0] || `relevant ${w.category} widget` }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  return scored
}

// Suggest NEW widget specs from a source's measures (the builder "what should I chart?" flow).
export function suggestWidgetsForSource(source, limit = 6) {
  if (!source?.metrics?.length) return []
  return source.metrics.slice(0, limit).map((m) => {
    const typeId = m.recommendedType || recommendTile(m, dimensionById('none'))
    return {
      name: m.name,
      skeleton: TYPE_LABEL[typeId] || 'KPI',
      source: source.name,
      why: `${source.name} exposes “${m.name}” — best shown as ${TYPE_LABEL[typeId] || 'a KPI'}`,
    }
  })
}

// Suggested tabs per profile type (beyond the mandatory + currently-present ones).
const TAB_SUGGESTIONS = {
  Contact: [
    { tab: 'Garage', why: 'Vehicles owned — for automotive accounts' },
    { tab: 'Documents', why: 'Contracts, agreements & files' },
    { tab: 'Loyalty', why: 'Rewards, points & history' },
  ],
  Company: [
    { tab: 'Contracts', why: 'Active agreements & renewals' },
    { tab: 'Invoices', why: 'Billing & payment history' },
    { tab: 'Stakeholders', why: 'Key contacts & roles' },
  ],
  Employee: [
    { tab: 'Goals', why: 'OKRs & targets' },
    { tab: '1:1s', why: 'Manager check-ins' },
    { tab: 'Time off', why: 'PTO & leave balance' },
  ],
}

export function suggestTabs(profileType, currentTabs = []) {
  const current = new Set(currentTabs.map((t) => t.toLowerCase()))
  return (TAB_SUGGESTIONS[profileType] || []).filter((s) => !current.has(s.tab.toLowerCase()))
}
