import { createPortal } from 'react-dom'
import {
  X, RefreshCw, CheckCircle2, AlertCircle, ExternalLink,
  ThumbsDown, CheckCheck, Workflow,
} from 'lucide-react'
import { URGENCY_CLASS, urgencyOf } from './attentionModel.js'

const ORIGIN_LABEL = {
  contact:    { color: 'bg-blue-500/10 text-blue-500'     },
  agent:      { color: 'bg-purple-500/10 text-purple-500' },
  workflow:   { color: 'bg-blue-400/10 text-blue-400'     },
  system:     { color: 'bg-cyan-500/10 text-cyan-500'     },
  escalation: { color: 'bg-red-500/10 text-red-500'       },
}

function footerLabels(item) {
  if (item._kind === 'htl')                                       return { primary: item.action, PrimaryIcon: CheckCircle2, secondary: 'Decline' }
  if (item.status === 'error')                                    return { primary: 'Retry', PrimaryIcon: RefreshCw, secondary: 'Dismiss' }
  if (item._kind === 'inbox' && item.action?.kind === 'share')    return { primary: 'Grant access', PrimaryIcon: CheckCircle2, secondary: 'Dismiss' }
  if (item._kind === 'inbox' && item.action?.kind === 'repin')    return { primary: 'Remap widget', PrimaryIcon: Workflow, secondary: 'Dismiss' }
  if (item._kind === 'inbox' && !item.action)                     return { primary: null, secondary: 'Archive', archiveMode: true }
  return { primary: 'Mark complete', PrimaryIcon: CheckCircle2, secondary: 'Dismiss' }
}

// onClose — X button and backdrop
// onPrimary — primary action (Approve / Retry / Grant / Remap / Complete)
// onSecondary — secondary action (Decline / Archive / plain dismiss)
export function AttentionModal({ item, onClose, onPrimary, onSecondary }) {
  const { primary, PrimaryIcon, secondary, archiveMode } = footerLabels(item)
  const isHtl     = item._kind === 'htl'
  const bodyText  = item.body ?? item.detail
  const originCls = (ORIGIN_LABEL[item.origin] ?? ORIGIN_LABEL.system).color

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#131a2c]">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {isHtl && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aims-aging">
                  {item.source}
                </span>
              )}
              {!isHtl && item.status === 'error' && (
                <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-aims-stale">
                  <AlertCircle size={9} aria-hidden="true" /> Error
                </span>
              )}
              {!isHtl && item.status !== 'error' && item._kind === 'task' && item.due && (
                <span className={`rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold dark:bg-white/5 ${URGENCY_CLASS[urgencyOf(item)]}`}>
                  {item.due}
                </span>
              )}
              {item._kind === 'inbox' && item.origin && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${originCls}`}>
                  {item.origin}
                </span>
              )}
              {item.when && (
                <span className="text-[10px] text-gray-400 dark:text-slate-500">{item.when}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {item.title ?? item.subject}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-4">
          {/* Actor */}
          {item.actor && !item.actor.system && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10">
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300">
                  {item.actor.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{item.actor.name}</span>
              {item.actor.role && (
                <span className="text-[10px] text-gray-400 dark:text-slate-500">· {item.actor.role}</span>
              )}
            </div>
          )}

          {/* Main text */}
          {bodyText && (
            <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-300">{bodyText}</p>
          )}

          {/* Error detail */}
          {item.errorMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-3 py-2">
              <AlertCircle size={12} className="mt-0.5 shrink-0 text-aims-stale" aria-hidden="true" />
              <p className="text-[11px] text-aims-stale">{item.errorMsg}</p>
            </div>
          )}

          {/* Metadata chips */}
          {(item.meta || item.at) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400 dark:text-slate-500">
              {item.meta?.category  && <span>{item.meta.category}</span>}
              {item.meta?.source    && <span>Source: {item.meta.source}</span>}
              {item.meta?.lastOk    && <span>Last OK: {item.meta.lastOk}</span>}
              {item.meta?.step      && <span>Step: {item.meta.step}</span>}
              {item.meta?.trigger   && <span>Trigger: {item.meta.trigger}</span>}
              {item.meta?.runId     && <span className="font-mono">{item.meta.runId}</span>}
              {item.at              && <span>{item.at}</span>}
            </div>
          )}

          {/* Related link */}
          {item.related && (
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-1.5 text-[11px] font-medium text-aims-blue hover:underline"
            >
              <ExternalLink size={10} aria-hidden="true" />
              {item.related.label}
            </a>
          )}
        </div>

        {/* Footer */}
        {archiveMode ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onSecondary}
              className="btn-ghost flex items-center gap-1.5 text-xs"
            >
              <CheckCheck size={12} aria-hidden="true" /> {secondary}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Dismiss
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3.5 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => { onSecondary(); }}
              className={`${isHtl ? 'flex items-center gap-1.5 btn-secondary text-xs' : 'btn-secondary text-xs'}`}
            >
              {isHtl && <ThumbsDown size={11} aria-hidden="true" />} {secondary}
            </button>
            {primary && (
              <button
                type="button"
                onClick={onPrimary}
                className="btn-primary flex items-center gap-1.5 text-xs"
              >
                {PrimaryIcon && <PrimaryIcon size={11} aria-hidden="true" />}
                {primary}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
