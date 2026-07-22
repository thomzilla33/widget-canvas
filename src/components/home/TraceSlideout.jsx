import { createPortal } from 'react-dom'
import { X, GitBranch, CheckCircle2, Circle, Clock } from 'lucide-react'
import { traceSteps } from '../../data/workqueue.js'

const STATUS_ICON = {
  done:    <CheckCircle2 size={12} className="text-aims-governed" aria-hidden="true" />,
  current: <Clock size={12} className="text-aims-blue animate-pulse" aria-hidden="true" />,
  pending: <Circle size={12} className="text-gray-300 dark:text-slate-600" aria-hidden="true" />,
}

export function TraceSlideout({ event, onClose }) {
  const steps = traceSteps(event?.sourceWorkflow)

  return createPortal(
    <div className="fixed inset-0 z-[9998]" role="dialog" aria-modal="true" aria-label="Workflow trace">
      {/* dim — click outside closes */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="absolute right-0 top-0 flex h-full w-[340px] flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#131a2c]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <GitBranch size={13} className="text-aims-blue" aria-hidden="true" />
            <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">Workflow trace</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trace"
            className="grid h-6 w-6 place-items-center rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            <X size={12} />
          </button>
        </div>

        {/* Event reference */}
        <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Event</p>
          <p className="mt-0.5 text-xs font-medium leading-snug text-gray-800 dark:text-slate-200">{event?.title}</p>
          {event?.sourceWorkflow && (
            <p className="mt-0.5 text-[10px] text-aims-blue">{event.sourceWorkflow}</p>
          )}
        </div>

        {/* Steps timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          {steps.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500">No workflow trace available for this event.</p>
          ) : (
            <ol className="relative space-y-0">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1
                return (
                  <li key={step.id} className="flex gap-3">
                    {/* Icon + connector */}
                    <div className="flex flex-col items-center">
                      <div className="mt-0.5 shrink-0">{STATUS_ICON[step.status]}</div>
                      {!isLast && (
                        <div className={`mt-1 w-px flex-1 ${step.status === 'done' ? 'bg-aims-governed/40' : 'bg-gray-200 dark:bg-white/[0.07]'}`} style={{ minHeight: 28 }} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-5">
                      <p className={`text-xs font-medium leading-snug ${
                        step.status === 'current'
                          ? 'text-aims-blue'
                          : step.status === 'done'
                          ? 'text-gray-800 dark:text-slate-200'
                          : 'text-gray-400 dark:text-slate-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">{step.detail}</p>
                      <p className="mt-0.5 text-[10px] tabular-nums text-gray-300 dark:text-slate-600">{step.time}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
