import { useState } from 'react'
import { X, Check, AlertTriangle, ArrowRight, Pin } from 'lucide-react'
import { SCHEMA_DRIFT } from '../../data/mock.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const STATUS_CHIP = {
  unchanged: 'cap-chip-neutral',
  new: 'cap-chip-data',
  removed: 'cap-chip-tool',
}

// S111–S114 — re-pin a widget whose source schema changed
export default function RepinModal({ widget, onClose, onComplete }) {
  const trapRef = useFocusTrap()
  const drift = SCHEMA_DRIFT[widget.id]
  const [remap, setRemap] = useState(() =>
    Object.fromEntries((drift?.broken ?? []).map((b) => [b.was, b.suggest])),
  )
  const [submitted, setSubmitted] = useState(false)

  if (!drift) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="card relative z-10 w-[420px] max-w-full p-6 text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">No schema drift recorded</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            “{widget.name}” has no pending data-structure changes to re-pin.
          </p>
          <button className="btn-primary mt-4" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    )
  }
  const allMapped = drift.broken.every((b) => !!remap[b.was])

  function submit() {
    onComplete?.()
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={trapRef} tabIndex={-1} className="card relative z-10 flex w-[90vw] sm:max-w-[660px] max-w-full max-h-[88vh] flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Pin size={16} className="text-aims-blue" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">Re-pin — {widget.name}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50 dark:text-slate-500 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/25 dark:bg-green-500/10">
              <Check size={28} className="text-aims-governed" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Re-pin submitted</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
              “{widget.name}” was re-mapped and sent for approval. It returns to active once approved; a
              notification was sent.
            </p>
            <button className="btn-primary mt-5" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto p-5">
              {/* S111 — needs-review banner */}
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-aims-ungoverned" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {drift.source} structure changed {drift.changedOn}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-slate-300">
                    Two fields were removed. Re-map them to the new schema to re-pin this widget.
                  </div>
                </div>
              </div>

              {/* S112 — side-by-side comparison */}
              <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Schema comparison</div>
              <div className="mb-5 grid grid-cols-2 gap-3">
                <SchemaColumn title="Previous" fields={drift.previous} />
                <SchemaColumn title="Current (new)" fields={drift.current} />
              </div>

              {/* S113 — field remapping */}
              <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Re-map broken fields</div>
              <div className="space-y-2">
                {drift.broken.map((b) => (
                  <div key={b.was} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2.5 dark:border-white/10">
                    <div className="w-32 shrink-0">
                      <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">{b.binding}</div>
                      <div className="text-[11px] text-aims-stale line-through">{b.was}</div>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-gray-500 dark:text-slate-400" />
                    <select
                      className="input h-9 flex-1"
                      value={remap[b.was] || ''}
                      onChange={(e) => setRemap((m) => ({ ...m, [b.was]: e.target.value }))}
                    >
                      <option value="" disabled>
                        Select new field…
                      </option>
                      {drift.newFields.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {drift.ok.map((o) => (
                  <div key={o.was} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2.5 text-xs dark:border-white/10">
                    <div className="w-32 shrink-0 font-semibold text-gray-900 dark:text-slate-100">{o.binding}</div>
                    <Check size={14} className="text-aims-governed" />
                    <span className="text-gray-500 dark:text-slate-400">{o.was} — still valid</span>
                  </div>
                ))}
              </div>
            </div>

            {/* S114 — complete -> approval */}
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-white/10">
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {allMapped ? 'Approval is notification-only.' : 'Map all changed fields to re-pin.'}
              </span>
              <button
                className="btn-primary"
                disabled={!allMapped}
                onClick={submit}
                title={allMapped ? undefined : 'Map all changed fields to re-pin.'}
              >
                <Pin size={15} /> Re-pin & submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SchemaColumn({ title, fields }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">
        {title}
      </div>
      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.name} className="flex items-center justify-between gap-2">
            <span
              className={`font-mono text-xs ${
                f.status === 'removed'
                  ? 'text-aims-stale line-through'
                  : 'text-gray-800 dark:text-slate-200'
              }`}
            >
              {f.name}
            </span>
            <span className={`cap-chip ${STATUS_CHIP[f.status]}`}>{f.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
