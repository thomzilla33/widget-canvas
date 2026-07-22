import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowUpRight } from 'lucide-react'
import { ESCALATION_RECIPIENTS } from '../../data/workqueue.js'

export function EscalationModal({ event, onClose, onEscalate }) {
  const [recipient, setRecipient] = useState('')
  const [urgency, setUrgency]     = useState('standard')
  const [reason, setReason]       = useState('')
  const [attested, setAttested]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!recipient || !attested) return
    onEscalate?.({ event, recipient, urgency, reason })
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Escalate event"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#131a2c]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={14} className="text-red-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Escalate</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Event summary (read-only) */}
          {event && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Event</p>
              <p className="mt-0.5 text-xs font-medium text-gray-800 dark:text-slate-200">{event.title}</p>
              {event.sourceWorkflow && (
                <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">via {event.sourceWorkflow}</p>
              )}
            </div>
          )}

          {/* Recipient */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              Escalate to <span className="text-red-400">*</span>
            </label>
            <select
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              className="input w-full text-xs"
              required
            >
              <option value="">Select a person or group…</option>
              {ESCALATION_RECIPIENTS.map(r => (
                <option key={r.id} value={r.id}>{r.name} — {r.role}</option>
              ))}
            </select>
          </div>

          {/* Urgency toggle */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">Urgency</p>
            <div className="flex gap-2">
              {['standard', 'urgent'].map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    urgency === u
                      ? u === 'urgent'
                        ? 'border-red-400 bg-red-50 text-red-600 dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-400'
                        : 'border-aims-blue bg-aims-blue/5 text-aims-blue'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-white/10 dark:text-slate-400'
                  }`}
                >
                  {u === 'urgent' ? 'Urgent' : 'Standard'}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              Reason <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Add context for the recipient…"
              rows={3}
              className="input w-full resize-none text-xs"
            />
          </div>

          {/* Attestation */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={attested}
              onChange={e => setAttested(e.target.checked)}
              className="checkbox mt-0.5"
            />
            <span className="text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
              I confirm this escalation is warranted and will be logged to the audit ledger.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!recipient || !attested}
              className="btn-primary flex-1 justify-center text-xs disabled:opacity-40"
            >
              Escalate
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
