import { useScope, scopeAtLeast } from '../../state/ScopeContext.jsx'

const TIERS = [
  { id: 'v1',   label: 'V1' },
  { id: 'v1.5', label: 'V1.5' },
  { id: 'v2',   label: 'Full vision' },
]

export function ScopeToggle() {
  const { scope, setScope } = useScope()
  return (
    <div
      role="group"
      aria-label="Prototype scope"
      className="fixed bottom-4 right-4 z-[9998] flex items-center gap-2.5 rounded-xl border border-aims-border bg-aims-sidebar px-3 py-2 shadow-xl"
    >
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
        Scope
      </span>
      <div className="flex gap-1">
        {TIERS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setScope(t.id)}
            aria-pressed={scope === t.id}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              scope === t.id
                ? 'bg-aims-blue text-white'
                : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
