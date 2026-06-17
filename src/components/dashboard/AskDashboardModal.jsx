import { useState } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

// U6 — "Talk to your dashboard": an Ask panel scoped to THIS dashboard's widgets +
// the active consumption scope. Deterministic canned answers reference the on-screen
// widgets by name (no model call), with suggested prompts derived from the dashboard.

// Build a context-aware canned answer that cites the dashboard's real widgets/scope.
function answerFor(q, ctx) {
  const ql = q.toLowerCase()
  const names = ctx.widgetNames
  const first = names[0] || 'the data'
  const hit = names.find((n) => ql.includes(n.toLowerCase()) || ql.includes(n.toLowerCase().split(' ')[0]))
  const range = ctx.scopeLabel
  const tail = ' (Demo — canned response.)'

  if (/summar|overview|how.*doing|tldr/.test(ql)) {
    return `“${ctx.name}” tracks ${names.length} widget${names.length === 1 ? '' : 's'} — ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}. Over ${range}, metrics are healthy with no open escalations.${tail}`
  }
  if (/why|down|drop|declin|fall|lower/.test(ql)) {
    return `Looking at ${hit || first} over ${range}: the dip tracks the current segment more than a broad trend. The biggest contributor is a slower close cadence — narrow the scope to one team to confirm.${tail}`
  }
  if (/best|top|highest|winning|leader/.test(ql)) {
    return `Top of this dashboard for ${range} is ${first} — leading the board. ${names[1] ? `${names[1]} is the one to watch.` : ''}${tail}`
  }
  if (/change|changed|moved|since|this (week|month|quarter|period)/.test(ql)) {
    return `Versus the prior period, most widgets held steady; ${first} moved the most over ${range}. Open it to drill into the underlying records.${tail}`
  }
  if (hit) {
    return `${hit}: trending steady over ${range}. No anomalies flagged — click the tile to drill into its records and Bridge ID citation.${tail}`
  }
  return `From this dashboard's ${names.length} widget${names.length === 1 ? '' : 's'} for “${q}”: everything is within range for ${range}. Try asking about a specific widget — e.g. “${first}”.${tail}`
}

export default function AskDashboardModal({ name, kind, widgetNames = [], scopeLabel = 'the current range', onClose }) {
  const ref = useFocusTrap()
  const ctx = { name, kind, widgetNames, scopeLabel }
  const [msgs, setMsgs] = useState([
    { from: 'agent', text: `Hi — ask me anything about “${name}”. I can see its ${widgetNames.length} widget${widgetNames.length === 1 ? '' : 's'} and the current scope (${scopeLabel}).` },
  ])
  const [draft, setDraft] = useState('')

  const prompts = [
    'Summarize this dashboard',
    widgetNames[0] ? `Why is ${widgetNames[0]} changing?` : 'What stands out?',
    'What changed this period?',
  ]

  const send = (text) => {
    const q = (text ?? draft).trim()
    if (!q) return
    setMsgs((m) => [...m, { from: 'user', text: q }, { from: 'agent', text: answerFor(q, ctx) }])
    setDraft('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ask-dash-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[80vh] w-[90vw] max-w-[480px] flex-col p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id="ask-dash-title" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            <Bot size={15} className="text-aims-blue" aria-hidden="true" /> Ask this dashboard
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === 'user' ? 'bg-aims-blue text-white' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200'}`}>
                {m.text}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-3 dark:border-white/10">
          <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Suggested prompts">
            {prompts.map((p) => (
              <button key={p} onClick={() => send(p)} className="inline-flex items-center gap-1 rounded-full border border-aims-blue/30 bg-aims-blue/5 px-2.5 py-1 text-[11px] font-medium text-aims-blue hover:bg-aims-blue/10">
                <Sparkles size={10} aria-hidden="true" /> {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about this dashboard…"
              aria-label="Ask the dashboard assistant"
            />
            <button onClick={() => send()} disabled={!draft.trim()} className="btn-primary !px-2.5" aria-label="Send">
              <Send size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
