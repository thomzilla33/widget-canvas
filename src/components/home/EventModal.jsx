import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, GitBranch, Clock } from 'lucide-react'
import { WQ_TIER } from '../../data/workqueue.js'

// Decision surface varies by event type
function DecisionSurface({ event, onPrimary, onSecondary, defaultDecision }) {
  const { type, quickActions } = event

  // Approval — radio: approve / reject with note
  if (type === 'Approval') {
    const rejectFirst = defaultDecision === 'reject'
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Decision</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="decision" defaultChecked={!rejectFirst} className="text-aims-blue" />
            <span className="text-xs text-gray-800 dark:text-slate-200">Approve</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="decision" defaultChecked={rejectFirst} className="text-red-500" />
            <span className="text-xs text-gray-800 dark:text-slate-200">Reject</span>
          </label>
        </div>
        <textarea
          rows={2}
          placeholder="Add a note (optional)…"
          className="input w-full resize-none text-xs"
        />
      </div>
    )
  }

  // Review — action buttons
  if (type === 'Review') {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Review action</p>
        <div className="space-y-2">
          {(quickActions.secondary || []).map(action => (
            <button
              key={action}
              type="button"
              onClick={() => onSecondary?.(action)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:border-aims-blue hover:text-aims-blue dark:border-white/10 dark:text-slate-300 dark:hover:border-aims-blue dark:hover:text-aims-blue"
            >
              {action}
            </button>
          ))}
        </div>
        <textarea rows={2} placeholder="Notes for the agent…" className="input w-full resize-none text-xs" />
      </div>
    )
  }

  // Train — rate samples
  if (type === 'Train') {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Training feedback</p>
        {['Sample A', 'Sample B', 'Sample C'].map(s => (
          <div key={s} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-white/[0.06]">
            <span className="text-xs text-gray-700 dark:text-slate-300">{s}</span>
            <div className="flex gap-1.5">
              {['Promote', 'Edit', 'Reject'].map(a => (
                <button key={a} type="button"
                  className="rounded px-2 py-0.5 text-[10px] font-medium border border-gray-200 text-gray-500 hover:border-aims-blue hover:text-aims-blue dark:border-white/10 dark:text-slate-400">
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default — text area + primary CTA
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Your response</p>
      <textarea rows={3} placeholder="Add your response or notes…" className="input w-full resize-none text-xs" />
    </div>
  )
}

export function EventModal({ event, onClose, onPrimary, onEscalate, onTrace }) {
  const [attested, setAttested] = useState(false)
  const t = WQ_TIER[event.tier] || WQ_TIER.headsup
  const intent = event._intent?.toLowerCase()

  function handlePrimary() {
    onPrimary?.(event)
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#131a2c]">

        {/* Header */}
        <div className={`flex items-start gap-3 border-b border-l-4 px-5 py-4 dark:border-white/[0.06] ${t.border}`}>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: event.studioColor }}>{event.studio}</span>
              <span className="rounded-full border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-white/10 dark:text-slate-400">{event.type}</span>
              {event.missionCritical && (
                <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">Mission critical</span>
              )}
              <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${t.badge}`}>{t.label}</span>
            </div>
            <h2 className="mt-1 text-sm font-semibold leading-snug text-gray-900 dark:text-slate-100">{event.title}</h2>
            {event.sourceWorkflow && (
              <button
                type="button"
                onClick={() => onTrace?.(event)}
                className="mt-0.5 flex items-center gap-1 text-[10px] text-aims-blue hover:underline"
              >
                <GitBranch size={9} aria-hidden="true" /> {event.sourceWorkflow}
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X size={14} />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="grid grid-cols-2 gap-0 overflow-auto">
          {/* Left: situation */}
          <div className="border-r border-gray-100 p-5 dark:border-white/[0.06] space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Situation</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-slate-300">{event.description}</p>
            </div>
            {event.blastRadius > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-400/20 dark:bg-amber-400/5">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Blast radius</p>
                <p className="text-xs text-amber-600 dark:text-amber-300">{event.blastRadius} workflow{event.blastRadius !== 1 ? 's' : ''} affected</p>
              </div>
            )}
            {/* Audit trail */}
            {event.auditTrail?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Audit trail</p>
                <ul className="mt-1.5 space-y-1.5">
                  {event.auditTrail.map((entry, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Clock size={10} className="mt-0.5 shrink-0 text-gray-300 dark:text-slate-600" aria-hidden="true" />
                      <div>
                        <span className="text-[10px] text-gray-600 dark:text-slate-300">{entry.action}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500"> · {entry.by} · {entry.at}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: decision surface */}
          <div className="p-5">
            <DecisionSurface event={event} onPrimary={handlePrimary} defaultDecision={intent} />
          </div>
        </div>

        {/* Footer — attestation + actions */}
        <div className="border-t border-gray-100 px-5 py-4 dark:border-white/[0.06] space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={attested}
              onChange={e => setAttested(e.target.checked)}
              className="checkbox mt-0.5"
            />
            <span className="text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
              By taking this action I confirm I have reviewed the context above. This action will be logged to the audit ledger.
            </span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEscalate?.(event)}
              className="btn-secondary text-xs"
            >
              Escalate
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="btn-secondary text-xs">Cancel</button>
            <button
              type="button"
              onClick={handlePrimary}
              disabled={!attested}
              className="btn-primary text-xs disabled:opacity-40"
            >
              {intent === 'reject' ? 'Confirm rejection' : (event.quickActions?.primary ?? 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
