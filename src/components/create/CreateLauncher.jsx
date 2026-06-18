import { Sparkles, PencilRuler, Store, ChevronRight, X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

// One front door for creation. Collapses the competing entry points (AI chat, manual
// builder, marketplace) into a single launcher with a clear hierarchy — AI is the
// recommended default. `onPick(mode)` where mode ∈ 'ai' | 'blank' | 'marketplace'.
const OPTIONS = {
  widget: [
    { mode: 'ai', icon: Sparkles, title: 'Describe it with AI', desc: 'Type what you need — get a live preview to refine.', recommended: true },
    { mode: 'blank', icon: PencilRuler, title: 'Start from scratch', desc: 'Map a source and metric yourself in the builder.' },
    { mode: 'marketplace', icon: Store, title: 'Browse the marketplace', desc: 'Install a pre-built, governed widget.' },
  ],
  dashboard: [
    { mode: 'ai', icon: Sparkles, title: 'Describe it with AI', desc: 'Say who it’s for — get a starting layout to refine.', recommended: true },
    { mode: 'blank', icon: PencilRuler, title: 'Start from scratch', desc: 'Choose where it lives, then build on a blank canvas.' },
  ],
}

export default function CreateLauncher({ kind = 'widget', onPick, onClose }) {
  const trapRef = useFocusTrap()
  const options = OPTIONS[kind] || OPTIONS.widget

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-launcher-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={trapRef} tabIndex={-1} className="card relative z-10 w-[92vw] max-w-[480px] p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <h2 id="create-launcher-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Create a {kind}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2.5 p-5">
          <p className="text-xs text-gray-500 dark:text-slate-400">How do you want to start?</p>
          {options.map((o) => {
            const Icon = o.icon
            const ai = o.mode === 'ai'
            return (
              <button
                key={o.mode}
                onClick={() => onPick(o.mode)}
                className={`group flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 ${
                  ai
                    ? 'border-aims-blue/30 bg-gradient-to-br from-aims-blue/[0.10] via-transparent to-purple-500/[0.07] hover:border-aims-blue/60 hover:shadow-md dark:border-aims-blue/35'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:hover:border-white/20'
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                    ai ? 'text-white' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-300'
                  }`}
                  style={ai ? { background: 'var(--grad)' } : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{o.title}</span>
                    {o.recommended && (
                      <span className="rounded-full bg-aims-blue/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aims-blue">
                        Recommended
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500 dark:text-slate-400">{o.desc}</span>
                </span>
                <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500 dark:text-slate-600" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
