import { useState } from 'react'
import { Sparkles, ArrowRight, Check } from 'lucide-react'

// "Describe-to-build" composer — a natural-language input that generates a first
// config for a builder, which the user then edits. `onGenerate(text)` returns true
// if it matched something, false otherwise (shows a gentle hint). Shared by the
// Widget Builder and the Dashboard Builder.
export function DescribeComposer({ placeholder = 'Describe what you want to build…', examples = [], onGenerate }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState(null) // 'ok' | 'miss'

  const run = (value) => {
    const v = (value ?? text).trim()
    if (!v) return
    setStatus(onGenerate(v) ? 'ok' : 'miss')
  }

  return (
    <div className="rounded-xl border border-aims-blue/25 bg-gradient-to-br from-aims-blue/[0.08] via-transparent to-purple-500/[0.06] p-3.5 dark:border-aims-blue/30">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-aims-blue">
        <Sparkles size={13} aria-hidden="true" /> Describe it
      </div>
      <div className="flex items-start gap-2">
        <input
          className="input flex-1"
          placeholder={placeholder}
          value={text}
          onChange={(e) => { setText(e.target.value); setStatus(null) }}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          aria-label="Describe what to build"
        />
        <button className="btn-primary shrink-0" onClick={() => run()} disabled={!text.trim()}>
          Generate <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>

      {examples.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => { setText(ex); run(ex) }}
              className="rounded-full border border-aims-blue/30 bg-aims-blue/5 px-2.5 py-1 text-[11px] font-medium text-aims-blue transition-colors hover:bg-aims-blue/10"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {status === 'miss' && (
        <p className="mt-2 text-[11px] text-aims-stale">
          Couldn’t map that — try naming a metric (e.g. revenue, tickets, pipeline) or a record type.
        </p>
      )}
      {status === 'ok' && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-aims-governed">
          <Check size={12} aria-hidden="true" /> Generated a starting point — edit anything below.
        </p>
      )}
    </div>
  )
}
