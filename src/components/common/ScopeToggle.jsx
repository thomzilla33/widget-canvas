import { TIERS, useScope } from '../../state/ScopeContext.jsx'

const LABELS = { 'v1': 'V1', 'v1.5': 'V1.5', 'v2': 'Full vision' }

// Floating prototype-scope toggle. Sits fixed bottom-left, clears the collapsed sidebar.
// Switch between V1 / V1.5 / Full vision to show/hide features gated to each tier.
export default function ScopeToggle() {
  const { scope, setScope } = useScope()
  return (
    <div
      className="fixed bottom-4 z-[9998] flex items-center gap-1 rounded-lg border border-aims-border bg-aims-sidebar px-2 py-1.5 shadow-xl"
      style={{ left: 60 }}
    >
      <span className="mr-1 select-none text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Scope
      </span>
      {TIERS.map((tier) => {
        const active = scope === tier
        return (
          <button
            key={tier}
            onClick={() => setScope(tier)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
              active
                ? 'bg-aims-blue text-white'
                : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            {LABELS[tier]}
          </button>
        )
      })}
    </div>
  )
}
