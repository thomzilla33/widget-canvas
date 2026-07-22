import { TIERS, useScope } from '../../state/ScopeContext.jsx'

const TIERS_META = {
  'v1':  { label: 'V1',          desc: 'Funcionalidad base' },
  'v1.5':{ label: 'V1.5',        desc: 'Alertas y resolución' },
  'v2':  { label: 'Full vision', desc: 'Visión completa' },
}

// Floating prototype-scope toggle. Sits fixed bottom-left, clears the collapsed sidebar.
export default function ScopeToggle() {
  const { scope, setScope } = useScope()
  return (
    <div
      className="fixed bottom-4 z-[9998] flex items-center gap-1 rounded-lg border border-aims-border bg-aims-sidebar px-2 py-1.5 shadow-xl"
      style={{ left: 60 }}
    >
      <span className="mr-1.5 select-none text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Scope
      </span>
      {TIERS.map((tier) => {
        const active = scope === tier
        const { label, desc } = TIERS_META[tier]
        return (
          <button
            key={tier}
            onClick={() => setScope(tier)}
            className={`flex flex-col items-center rounded-md px-2.5 py-1 text-center transition-colors ${
              active
                ? 'bg-aims-blue text-white'
                : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <span className="text-[11px] font-semibold leading-tight">{label}</span>
            <span className={`text-[9px] leading-tight ${active ? 'text-blue-200' : 'text-slate-600'}`}>
              {desc}
            </span>
          </button>
        )
      })}
    </div>
  )
}
