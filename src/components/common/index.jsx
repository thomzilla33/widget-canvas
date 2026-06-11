import { ShieldCheck, ShieldAlert } from 'lucide-react'

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
      {children || variant}
    </span>
  )
}

const freshnessClass = {
  live: 'freshness-live',
  fresh: 'freshness-fresh',
  aging: 'freshness-aging',
  stale: 'freshness-stale',
}
const freshnessDot = {
  live: 'bg-aims-fresh',
  fresh: 'bg-aims-fresh',
  aging: 'bg-aims-aging',
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
  return <span className={healthClass[health] || healthClass.active}>{healthLabel[health]}</span>
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

export function StepIndicator({ steps = [], current = 0 }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 ${
              i === current ? 'text-aims-blue' : i < current ? 'text-aims-governed' : 'text-gray-400 dark:text-slate-500'
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

export function PageHeader({ title, description, actions, breadcrumb }) {
  return (
    <div className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#0f1629] px-6 py-4">
      {breadcrumb && <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
