import { useState } from 'react'
import { BookOpen, X, Check } from 'lucide-react'
import { TIERS, useScope } from '../../state/ScopeContext.jsx'

const TIERS_META = {
  'v1':  { label: 'V1',          desc: 'Core functionality' },
  'v1.5':{ label: 'V1.5',        desc: 'Alerts & resolution' },
  'v2':  { label: 'Full vision', desc: 'Complete feature set' },
}

const CHANGELOG = {
  'v1': [
    'Widget catalog with search and filters',
    'Detail panel — right slide-over, no backdrop',
    'Widget Builder — create & edit (3-step flow)',
    'Custom W×H sizing with S/M/L presets',
  ],
  'v1.5': [
    '"Needs Attention" banner with open flags',
    'Remap flow for widgets with schema drift',
    '"Review & resolve" action per flag',
  ],
  'v2': [
    'Per-widget change history',
    'Real-time flag notifications',
    'Bulk remap from the attention banner',
  ],
}

// Floating prototype-scope toggle. Sits fixed bottom-left, clears the collapsed sidebar.
export default function ScopeToggle() {
  const { scope, setScope } = useScope()
  const [logOpen, setLogOpen] = useState(false)

  return (
    <>
      {/* Changelog popover */}
      {logOpen && (
        <div
          className="fixed z-[9999] rounded-xl border border-aims-border bg-aims-sidebar shadow-2xl"
          style={{ left: 60, bottom: 76, width: 300 }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Scope changelog</span>
            <button onClick={() => setLogOpen(false)} className="grid h-5 w-5 place-items-center rounded text-slate-500 hover:text-slate-200">
              <X size={12} />
            </button>
          </div>
          <div className="space-y-0 p-2">
            {TIERS.map((tier) => {
              const { label, desc } = TIERS_META[tier]
              const isReached = TIERS.indexOf(scope) >= TIERS.indexOf(tier)
              return (
                <div key={tier} className="rounded-lg px-3 py-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`text-[11px] font-bold ${isReached ? 'text-aims-blue' : 'text-slate-500'}`}>{label}</span>
                    <span className="text-[10px] text-slate-500">{desc}</span>
                    {isReached && <span className="ml-auto text-[9px] font-semibold text-aims-blue">active</span>}
                  </div>
                  <ul className="space-y-0.5">
                    {CHANGELOG[tier].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <Check size={10} className={`mt-0.5 shrink-0 ${isReached ? 'text-aims-blue' : 'text-slate-600'}`} />
                        <span className={`text-[11px] leading-snug ${isReached ? 'text-slate-300' : 'text-slate-600'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Toggle bar */}
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
        <div className="mx-1 h-4 w-px bg-white/10" />
        <button
          onClick={() => setLogOpen((v) => !v)}
          aria-label="Ver changelog"
          className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
            logOpen ? 'bg-white/10 text-slate-200' : 'text-slate-500 hover:bg-white/10 hover:text-slate-300'
          }`}
        >
          <BookOpen size={13} />
        </button>
      </div>
    </>
  )
}
