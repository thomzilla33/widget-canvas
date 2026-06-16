// Phase 5 — cross-cutting governance & guardrails. One module other surfaces read
// so a guardrail is defined once and labeled everywhere: data plane (Truth vs
// Sandbox), environment (prod/sandbox/dev), scope rollup (PBAC), unified credits,
// Bridge ID citations, and TTL freshness with stale-pause.

// Small stable hash so derived governance values are deterministic per widget
// (kept local — governance.js stays a leaf module, no import cycle with preview.js).
function hashId(s = '') {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// ── 5.1 Data plane: Truth (verified) vs Sandbox (unverified). Never blend in one number. ──
export const DATA_PLANES = {
  truth: { label: 'Truth', tone: 'governed', description: 'Verified facts promoted to the Truth Plane — safe to act on.' },
  sandbox: { label: 'Sandbox', tone: 'ungoverned', description: 'Unverified candidate data (claims / simulation) — not promoted to Truth.' },
}

// Truth/Sandbox is an AIMS-platform concept: only AIMS-sourced widgets carry a plane.
// An explicit `widget.dataPlane` wins; otherwise governed AIMS data defaults to Truth.
export function dataPlaneOf(widget) {
  if (!widget) return null
  if (widget.dataPlane) return widget.dataPlane
  return /^AIMS OS/.test(widget.source || '') ? 'truth' : null
}

// ── 5.2 Environment (infra plane). Cost/billing views default to prod. ──
export const ENVIRONMENTS = [
  { key: 'prod', label: 'Production', short: 'Prod' },
  { key: 'sandbox', label: 'Sandbox', short: 'Sandbox' },
  { key: 'dev', label: 'Dev', short: 'Dev' },
]
export function environmentLabel(key) {
  return (ENVIRONMENTS.find((e) => e.key === key) || ENVIRONMENTS[0]).label
}

// ── 5.5 Scope rollup (PBAC — source-side in our mock). Broader scope → larger aggregates. ──
export const SCOPES = [
  { key: 'me', label: 'Me', mult: 0.12 },
  { key: 'team', label: 'My Team', mult: 0.45 },
  { key: 'teams', label: 'Selected Teams', mult: 0.7 },
  { key: 'all', label: 'All', mult: 1 },
  { key: 'central', label: 'Central', mult: 1.15 },
  { key: 'tenant', label: 'Tenant', mult: 1.4 },
]
export function scopeMult(key) {
  return (SCOPES.find((s) => s.key === key) || {}).mult || 1
}
export function scopeLabel(key) {
  return (SCOPES.find((s) => s.key === key) || SCOPES[3]).label
}

// ── 5.3 Unified credits (never the legacy GE-COMM / FIN / COMP split). ──
// Billing widgets expose ONE unified pool, broken out only by GE (engine) vs TP (third-party).
export function isBillingWidget(widget) {
  // Source is the reliable gate (a controlled AIMS string); only tightly-bounded
  // name terms back it up, so "Ad Spend"/"Balance Sheet" don't false-positive.
  return /Credits & Billing/.test(widget?.source || '') || /\bcredits?\b|\bbilling\b/i.test(widget?.name || '')
}
export function creditBreakdown(widget) {
  const h = hashId(widget?.id || widget?.name || '')
  const unified = 40000 + (h % 60) * 1000
  const ge = Math.round(unified * (0.5 + (h % 25) / 100)) // engine-consumed
  const tp = unified - ge // third-party / connector pass-through
  return { unified, ge, tp }
}

// ── 5.4 Bridge ID citation: audit chain + attribution tier, one click from the tile. ──
// Shown on governance & value widgets (Council outcomes, Helm ROI, Truth facts…).
export function hasBridgeCitation(widget) {
  return (
    /Governance|Helm|Truth|Council/i.test(widget?.source || '') ||
    /\broi\b|value|blocked|council|fact|outcome|retention/i.test(widget?.name || '')
  )
}
const TIERS = ['Tier 1 — Verified Truth', 'Tier 2 — Governed Source', 'Tier 3 — Derived']
export function bridgeCitation(widget) {
  const h = hashId(widget?.id || widget?.name || 'br')
  const bridgeId = `BR-${(h % 9000) + 1000}-${String.fromCharCode(65 + (h % 26))}${((h >> 3) % 900) + 100}`
  return {
    bridgeId,
    tier: TIERS[h % TIERS.length],
    confidence: 0.82 + (h % 16) / 100,
    chain: [
      { step: 'Source record', detail: widget?.source || 'Governed source', kind: 'source' },
      { step: 'Transform', detail: 'Normalized + aggregated by the data pipeline', kind: 'transform' },
      { step: 'Governance gate', detail: 'Council reviewed — no policy violation', kind: 'gate' },
      { step: 'Published', detail: `Promoted to Truth as ${bridgeId}`, kind: 'publish' },
    ],
  }
}

// ── 5.6 Freshness with TTL states: fresh / approaching-TTL / stale. Stale tiles pause workflows. ──
// Maps the widget's freshness flag to a governance state. 'aging' = approaching its TTL.
const FRESHNESS_STATE = {
  live: { state: 'fresh', label: 'Live', tone: 'live' },
  fresh: { state: 'fresh', label: 'Fresh', tone: 'fresh' },
  aging: { state: 'approaching', label: 'Approaching TTL', tone: 'approaching' },
  stale: { state: 'stale', label: 'Stale — paused', tone: 'stale' },
}
export function freshnessState(widget) {
  return FRESHNESS_STATE[widget?.freshness] || FRESHNESS_STATE.fresh
}
export function isStale(widget) {
  return widget?.freshness === 'stale'
}
