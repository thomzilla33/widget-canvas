import { ShieldCheck, ShieldAlert, FlaskConical, Layers, Users } from 'lucide-react'

const badgeStyles = {
  published: 'bg-green-50 text-aims-governed border-green-200 dark:bg-green-500/10 dark:border-green-500/25',
  draft: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10',
  pending: 'bg-amber-50 text-aims-aging border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25',
  review: 'bg-red-50 text-aims-stale border-red-200 dark:bg-red-500/10 dark:border-red-500/25',
  governed: 'bg-green-50 text-aims-governed border-green-200 dark:bg-green-500/10 dark:border-green-500/25',
  ungoverned: 'bg-amber-50 text-aims-ungoverned border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25',
  aims: 'bg-blue-50 text-aims-blue border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/25',
}

export function Badge({ variant = 'draft', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${
        badgeStyles[variant] || badgeStyles.draft
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children || variant}
    </span>
  )
}

const freshnessClass = {
  live: 'freshness-live',
  fresh: 'freshness-fresh',
  aging: 'freshness-aging',
  approaching: 'freshness-aging',
  stale: 'freshness-stale',
}
const freshnessDot = {
  live: 'bg-aims-fresh',
  fresh: 'bg-aims-fresh',
  aging: 'bg-aims-aging',
  approaching: 'bg-aims-aging',
  stale: 'bg-aims-stale',
}

export function FreshnessBadge({ status = 'fresh', label }) {
  return (
    <span className={freshnessClass[status] || freshnessClass.fresh}>
      <span className={`h-1.5 w-1.5 rounded-full ${freshnessDot[status] || freshnessDot.fresh}`} />
      {label || status}
    </span>
  )
}

// Truth vs Sandbox data plane (5.1). Truth = verified facts; Sandbox = unverified claims.
export function DataPlaneBadge({ plane }) {
  if (!plane) return null
  if (plane === 'sandbox') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-aims-ungoverned dark:border-amber-500/25 dark:bg-amber-500/10" title="Unverified candidate data — not promoted to Truth">
        <FlaskConical size={11} /> Sandbox
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300" title="Verified facts on the Truth Plane">
      <ShieldCheck size={11} /> Truth
    </span>
  )
}

// Environment chip (5.2). Suppressed for prod unless `always` (cost views pin prod).
export function EnvironmentBadge({ env = 'prod', always = false }) {
  if (env === 'prod' && !always) return null
  const tone =
    env === 'prod'
      ? 'border-gray-200 text-gray-500 dark:border-white/10 dark:text-slate-400'
      : 'border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-300'
  const label = env === 'prod' ? 'Prod' : env === 'sandbox' ? 'Sandbox' : 'Dev'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      <Layers size={10} /> {label}
    </span>
  )
}

// Scope rollup chip (5.5) — Me / My Team / All / Tenant…
export function ScopeBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-white/10 dark:text-slate-400">
      <Users size={10} /> {label}
    </span>
  )
}

// Live data badge (Phase 7) — a pulsing dot signals a real-time tile.
export function LiveBadge({ paused = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-aims-governed dark:border-green-500/25 dark:bg-green-500/10">
      <span className="relative flex h-1.5 w-1.5">
        {!paused && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aims-fresh opacity-75" />}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aims-fresh" />
      </span>
      {paused ? 'Paused' : 'Live'}
    </span>
  )
}

export function GovernedBadge({ governed = true }) {
  return governed ? (
    <span className="badge-governed">
      <ShieldCheck size={12} /> Governed
    </span>
  ) : (
    <span className="badge-ungoverned">
      <ShieldAlert size={12} /> Ungoverned
    </span>
  )
}

const healthClass = {
  active: 'health-active',
  inactive: 'health-inactive',
  unused: 'health-unused',
  review: 'health-review',
}
const healthLabel = {
  active: 'Active',
  inactive: 'Inactive',
  unused: 'Not in use',
  review: 'Needs review',
}

export function HealthBadge({ health = 'active' }) {
  return (
    <span className={healthClass[health] || healthClass.active}>
      <span className="sc-dot" />
      {healthLabel[health]}
    </span>
  )
}

// Connection status for a data source (mirrors Integrations' health badges).
const connClass = {
  connected: 'health-active',
  syncing: 'health-inactive',
  error: 'health-review',
  available: 'health-unused',
}
const connLabel = { connected: 'Connected', syncing: 'Syncing', error: 'Error', available: 'Available' }

export function ConnectionBadge({ status = 'available' }) {
  return (
    <span className={connClass[status] || connClass.available}>
      <span className="sc-dot" />
      {connLabel[status] || status}
    </span>
  )
}

// Source provenance (Official / Partner / Private), matching Integrations.
const providerChip = { official: 'cap-chip-blue', partner: 'cap-chip-pink', private: 'cap-chip-tool' }
const providerLabel = { official: 'Official', partner: 'Partner', private: 'Private' }

export function ProviderBadge({ provider = 'official' }) {
  return (
    <span className={`cap-chip ${providerChip[provider] || 'cap-chip-neutral'}`}>
      {providerLabel[provider] || provider}
    </span>
  )
}

// What a source exposes: aggregate Metrics, row-level Records, live Realtime.
const capMeta = {
  metrics: { label: 'Metrics', cls: 'cap-chip-data' },
  records: { label: 'Records', cls: 'cap-chip-cyan' },
  realtime: { label: 'Realtime', cls: 'cap-chip-blue' },
}

export function CapabilityChips({ capabilities = [] }) {
  return (
    <>
      {capabilities
        .filter((c) => capMeta[c])
        .map((c) => (
          <span key={c} className={`cap-chip ${capMeta[c].cls}`}>
            {capMeta[c].label}
          </span>
        ))}
    </>
  )
}

export function EmptyState({ icon = '📊', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Shimmer placeholder for in-flight content (prevents blank flashes / layout shift).
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-gray-100 dark:bg-white/5 ${className}`} />
}

export function StepIndicator({ steps = [], current = 0 }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 ${
              i === current ? 'text-aims-blue' : i < current ? 'text-aims-governed' : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold border ${
                i === current
                  ? 'border-aims-blue bg-aims-blue text-white'
                  : i < current
                    ? 'border-aims-governed bg-aims-governed text-white'
                    : 'border-gray-300 dark:border-white/15'
              }`}
            >
              {i + 1}
            </span>
            <span className="text-sm font-medium hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className="h-px w-6 bg-gray-300 dark:bg-white/15" />}
        </div>
      ))}
    </div>
  )
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#0f1629] px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-slate-100">{title}</h1>
          {description && <p className="mt-1 text-[13px] text-gray-500 dark:text-slate-400">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
