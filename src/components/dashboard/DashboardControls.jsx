import { CalendarRange, X, Layers, Users, Pause, Play } from 'lucide-react'
import { ENVIRONMENTS, SCOPES, scopeLabel as scopeRollupLabel, environmentLabel } from '../../data/governance.js'
import { useLive } from '../../state/LiveContext.jsx'
import { Button } from '@/components/ui/Button'

// Consumption controls for the dashboard view: a global date range plus
// dashboard-level filters that cascade into every widget's data sample.
export const RANGES = [
  { key: '7d', label: '7D', full: 'Last 7 days' },
  { key: '30d', label: '30D', full: 'Last 30 days' },
  { key: '90d', label: '90D', full: 'Last 90 days' },
  { key: 'qtd', label: 'QTD', full: 'Quarter to date' },
  { key: '12m', label: '12M', full: 'Last 12 months' },
]

export const FILTERS = [
  { key: 'segment', label: 'Segment', options: ['All', 'Enterprise', 'Mid-Market', 'SMB'] },
  { key: 'region', label: 'Region', options: ['All', 'North America', 'EMEA', 'APAC', 'LATAM'] },
]

// rollup = PBAC scope (Me/Team/All/Tenant…); env = infra plane (prod default).
export const DEFAULT_SCOPE = { range: '90d', filters: {}, rollup: 'all', env: 'prod' }

// Human-readable summary of the active scope (used in the drill-down context line).
export function scopeLabel(scope) {
  const range = RANGES.find((r) => r.key === scope?.range)?.full || 'Last 90 days'
  const active = Object.values(scope?.filters || {}).filter((v) => v && v !== 'All')
  const rollup = scopeRollupLabel(scope?.rollup || 'all')
  const env = scope?.env && scope.env !== 'prod' ? environmentLabel(scope.env) : null
  return [range, rollup, ...active, env].filter(Boolean).join(' · ')
}

export default function DashboardControls({ scope, onChange }) {
  const { paused, setPaused } = useLive()
  const setRange = (key) => onChange({ ...scope, range: key })
  const setFilter = (key, value) => {
    const filters = { ...scope.filters }
    if (!value || value === 'All') delete filters[key]
    else filters[key] = value
    onChange({ ...scope, filters })
  }
  const clearFilter = (key) => setFilter(key, 'All')
  const setRollup = (key) => onChange({ ...scope, rollup: key })
  const setEnv = (key) => onChange({ ...scope, env: key })
  const reset = () => onChange({ ...DEFAULT_SCOPE })

  const active = Object.entries(scope?.filters || {}).filter(([, v]) => v && v !== 'All')
  const dirty =
    active.length > 0 ||
    scope?.range !== DEFAULT_SCOPE.range ||
    (scope?.rollup || 'all') !== DEFAULT_SCOPE.rollup ||
    (scope?.env || 'prod') !== DEFAULT_SCOPE.env

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#131a2c]">
      <div className="flex flex-wrap items-center gap-2">
        {/* Date range segmented control */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-slate-400">
          <CalendarRange size={13} aria-hidden="true" /> Range
        </span>
        <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 dark:border-white/15" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              aria-pressed={scope?.range === r.key}
              title={r.full}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aims-blue/50 ${
                scope?.range === r.key
                  ? 'bg-aims-blue text-white'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <span className="mx-1 hidden h-5 w-px bg-gray-200 dark:bg-white/10 sm:block" aria-hidden="true" />

        {/* Cascading filters */}
        {FILTERS.map((f) => (
          <label key={f.key} className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <span className="font-medium">{f.label}</span>
            <select
              className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
              value={scope?.filters?.[f.key] || 'All'}
              onChange={(e) => setFilter(f.key, e.target.value)}
              aria-label={`Filter by ${f.label}`}
            >
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ))}

        <span className="mx-1 hidden h-5 w-px bg-gray-200 dark:bg-white/10 sm:block" aria-hidden="true" />

        {/* Scope rollup (PBAC) */}
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <Users size={13} aria-hidden="true" />
          <span className="font-medium">Scope</span>
          <select
            className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
            value={scope?.rollup || 'all'}
            onChange={(e) => setRollup(e.target.value)}
            aria-label="Scope rollup"
          >
            {SCOPES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* Environment (infra plane) */}
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <Layers size={13} aria-hidden="true" />
          <span className="font-medium">Env</span>
          <select
            className="input !h-8 !w-auto !py-1 !pl-2 !pr-7 text-xs"
            value={scope?.env || 'prod'}
            onChange={(e) => setEnv(e.target.value)}
            aria-label="Environment"
          >
            {ENVIRONMENTS.map((e) => (
              <option key={e.key} value={e.key}>
                {e.label}
              </option>
            ))}
          </select>
        </label>

        {dirty && (
          <Button type="button" variant="tertiary" onClick={reset} className="!px-2 !py-1 text-xs">
            Reset
          </Button>
        )}

        {/* Live stream pause/resume — freezes every live tile at once */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={!paused}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
          title={paused ? 'Resume live updates' : 'Pause live updates'}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          <span className="relative flex h-1.5 w-1.5">
            {!paused && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aims-fresh opacity-75" />}
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${paused ? 'bg-gray-400 dark:bg-slate-500' : 'bg-aims-fresh'}`} />
          </span>
          {paused ? 'Paused' : 'Live'}
        </button>
      </div>

      {/* Active filter chips */}
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {active.map(([key, value]) => {
            const f = FILTERS.find((x) => x.key === key)
            return (
              <span key={key} className="inline-flex items-center gap-1 rounded-md border border-aims-blue/30 bg-aims-blue/10 px-2 py-0.5 text-[11px] font-medium text-aims-blue">
                {f?.label}: {value}
                <button
                  type="button"
                  onClick={() => clearFilter(key)}
                  aria-label={`Clear ${f?.label} filter`}
                  className="grid h-3.5 w-3.5 place-items-center rounded-full hover:bg-aims-blue/20"
                >
                  <X size={10} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
