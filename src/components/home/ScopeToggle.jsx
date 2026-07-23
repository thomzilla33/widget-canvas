import { useScope } from '../../state/ScopeContext.jsx'
import { useRole } from '../../state/RoleContext.jsx'

const TIERS = [
  { id: 'v1',   label: 'V1' },
  { id: 'v1.5', label: 'V1.5' },
  { id: 'v2',   label: 'Full vision' },
]

export function ScopeToggle() {
  const { scope, setScope } = useScope()
  const { isAdmin, setAdmin } = useRole()

  return (
    <div
      className="fixed bottom-4 right-4 z-[9998] flex flex-col items-end gap-2"
      aria-label="Prototype controls"
    >
      {/* Role toggle */}
      <div className="flex items-center gap-2 rounded-xl border border-aims-border bg-aims-sidebar px-3 py-2 shadow-xl">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Role</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setAdmin(true)}
            aria-pressed={isAdmin}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              isAdmin
                ? 'bg-violet-600 text-white'
                : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setAdmin(false)}
            aria-pressed={!isAdmin}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              !isAdmin
                ? 'bg-violet-600 text-white'
                : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            Operator
          </button>
        </div>
      </div>

      {/* Scope toggle */}
      <div
        role="group"
        aria-label="Prototype scope"
        className="flex items-center gap-2.5 rounded-xl border border-aims-border bg-aims-sidebar px-3 py-2 shadow-xl"
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Scope</span>
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
    </div>
  )
}
