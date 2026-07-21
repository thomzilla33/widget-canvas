import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Briefcase, ArrowRight, AlertCircle, CheckCircle2, X, ExternalLink, RefreshCw, ThumbsDown } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import UndoToast from './UndoToast.jsx'
import { HOME_TASKS, HTL_ITEMS } from '../../data/home.js'

const URGENCY_CLASS = {
  overdue:  'text-red-500 dark:text-red-400',
  today:    'text-amber-500 dark:text-amber-400',
  upcoming: 'text-gray-400 dark:text-slate-500',
}

function urgencyOf(t) {
  if (t.due === 'Overdue') return 'overdue'
  if (t.due === 'Today')   return 'today'
  return 'upcoming'
}

const ACTION_LABELS = {
  reassign: { primary: 'Reassign to me',    secondary: 'Dismiss' },
  publish:  { primary: 'Approve & publish', secondary: 'Decline' },
  repin:    { primary: 'Remap widget',      secondary: 'Dismiss' },
  share:    { primary: 'Grant access',      secondary: 'Decline' },
  htl:      { primary: 'Approve',           secondary: 'Decline' },
}

function ItemModal({ item, isHtl, onClose, onAction }) {
  const kind   = isHtl ? 'htl' : (item.action?.kind ?? 'default')
  const labels = ACTION_LABELS[kind] ?? { primary: 'Complete', secondary: 'Dismiss' }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#131a2c]">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {isHtl && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aims-aging">
                  {item.source} · Needs approval
                </span>
              )}
              {!isHtl && item.status === 'error' && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aims-stale">
                  Error · Retry needed
                </span>
              )}
              {!isHtl && item.status !== 'error' && item.due && (
                <span className={`rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold dark:bg-white/5 ${URGENCY_CLASS[urgencyOf(item)]}`}>
                  {item.due}
                </span>
              )}
              {isHtl && item.when && (
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
        <div className="space-y-3 px-5 py-4">
          {item.actor && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10">
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
          <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400">
            {item.body ?? item.detail}
          </p>
          {item.errorMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-3 py-2">
              <AlertCircle size={12} className="mt-0.5 shrink-0 text-aims-stale" />
              <p className="text-[11px] text-aims-stale">{item.errorMsg}</p>
            </div>
          )}
          {item.related && (
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 text-[11px] font-medium text-aims-blue hover:underline"
            >
              <ExternalLink size={10} aria-hidden="true" />
              {item.related.label}
            </a>
          )}
          {(item.meta || item.at) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400 dark:text-slate-500">
              {item.meta?.step    && <span>Step: {item.meta.step}</span>}
              {item.meta?.trigger && <span>Trigger: {item.meta.trigger}</span>}
              {item.at            && <span>{item.at}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <button type="button" onClick={onClose} className="btn-secondary">
            {labels.secondary}
          </button>
          <button type="button" onClick={() => onAction(item)} className="btn-primary flex items-center gap-1.5">
            {item.status === 'error' ? <><RefreshCw size={11} /> Retry</> : labels.primary}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Row sub-components ────────────────────────────────────────────────────

function ErrorRow({ item, onOpen, onRetry }) {
  return (
    <div className="group flex items-start gap-3 border-l-2 border-l-red-500/60 py-2.5 pl-3 pr-4 transition-colors hover:bg-red-500/[0.03] dark:hover:bg-red-500/[0.04]">
      <AlertCircle size={14} className="mt-0.5 shrink-0 text-aims-stale" aria-hidden="true" />
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      >
        <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">{item.title}</p>
        <p className="text-[10px] font-medium text-aims-stale">Error · Retry needed</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-aims-stale transition-colors hover:bg-red-500/20"
        >
          <RefreshCw size={9} aria-hidden="true" /> Retry
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label="View details"
          className="text-gray-300 opacity-0 transition-all hover:text-gray-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:text-slate-400"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}

function ApprovalRow({ item, onOpen, onApprove, onDecline }) {
  return (
    <div className="group flex items-start gap-3 border-l-2 border-l-amber-500/50 py-2.5 pl-3 pr-4 transition-colors hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.04]">
      <AlertCircle size={14} className="mt-0.5 shrink-0 text-aims-aging" aria-hidden="true" />
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      >
        <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">
          {item.title ?? item.subject}
        </p>
        <p className="text-[10px] font-medium text-aims-aging">Needs approval</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onApprove}
          className="flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-aims-governed transition-colors hover:bg-green-500/20"
        >
          <CheckCircle2 size={9} aria-hidden="true" /> Approve
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <ThumbsDown size={9} aria-hidden="true" /> Decline
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label="View details"
          className="text-gray-300 opacity-0 transition-all hover:text-gray-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:text-slate-400"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}

function TaskRow({ item, onOpen, onComplete }) {
  return (
    <div
      className="group flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.025]"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onComplete() }}
        className="mt-0.5 shrink-0 text-gray-300 transition-colors hover:text-aims-governed dark:text-slate-600 dark:hover:text-aims-governed"
        aria-label="Mark complete"
      >
        <CheckCircle2 size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">
          {item.title ?? item.subject}
        </p>
        {item.due && (
          <p className={`text-[10px] font-medium ${URGENCY_CLASS[urgencyOf(item)]}`}>{item.due}</p>
        )}
      </div>
      <ArrowRight
        size={12}
        className="mt-0.5 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600"
        aria-hidden="true"
      />
    </div>
  )
}

// ─── Main card ─────────────────────────────────────────────────────────────

export function MyWorkTodayCard() {
  const [done,     setDone]     = useState(new Set())
  const [declined, setDeclined] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [showAll,  setShowAll]  = useState(false)
  const [toast,    setToast]    = useState(null)

  function showToast(message, undo) {
    setToast({ message, undo })
    setTimeout(() => setToast(null), 4000)
  }

  function complete(id) {
    setDone((prev) => new Set([...prev, id]))
    showToast('Task marked complete.', () => setDone((prev) => { const n = new Set(prev); n.delete(id); return n }))
  }

  function approve(item) {
    setDone((prev) => new Set([...prev, item.id]))
    showToast(`Approved: "${(item.title ?? item.subject).slice(0, 40)}".`)
  }

  function decline(item) {
    setDeclined((prev) => new Set([...prev, item.id]))
    showToast(`Declined.`, () => setDeclined((prev) => { const n = new Set(prev); n.delete(item.id); return n }))
  }

  function retry(item) {
    setSelected(null)
    showToast(`Retrying: "${item.title.slice(0, 40)}"…`)
  }

  function handleModalAction(item) {
    setSelected(null)
    if (item._kind === 'htl') approve(item)
    else if (item.status === 'error') retry(item)
    else complete(item.id)
  }

  const pending  = HOME_TASKS.filter((t) => !done.has(t.id))
  const htlItems = HTL_ITEMS.filter((h) => !done.has(h.id) && !declined.has(h.id))

  const errTasks  = pending.filter((t) => t.status === 'error')
  const normTasks = pending.filter((t) => t.status !== 'error')
  const overdue   = normTasks.filter((t) => t.due === 'Overdue')
  const today     = normTasks.filter((t) => t.due === 'Today')
  const more      = normTasks.filter((t) => t.due !== 'Overdue' && t.due !== 'Today')

  const totalUrgent = errTasks.length + overdue.length + htlItems.length

  const baseItems = [
    ...errTasks.map((t)  => ({ ...t, _kind: 'task' })),
    ...overdue.map((t)   => ({ ...t, _kind: 'task' })),
    ...htlItems.slice(0, 2).map((h) => ({ ...h, _kind: 'htl' })),
    ...today.slice(0, 3).map((t)   => ({ ...t, _kind: 'task' })),
  ]
  const allItems  = [...baseItems, ...more.map((t) => ({ ...t, _kind: 'task' }))]
  const display   = showAll ? allItems : baseItems.slice(0, 6)
  const remaining = allItems.length - display.length

  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Briefcase size={14} />}
        title="My Work Today"
        badge={totalUrgent || undefined}
        action={{ label: showAll ? 'Show less' : 'See all', onClick: () => setShowAll((s) => !s) }}
      />

      <div className="flex-1 divide-y divide-gray-100 dark:divide-white/[0.05]">
        {display.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <CheckCircle2 size={20} className="text-aims-governed" />
            <p className="text-sm text-gray-500 dark:text-slate-400">All clear — nothing urgent.</p>
          </div>
        )}
        {display.map((item) => {
          if (item._kind === 'htl') return (
            <ApprovalRow
              key={item.id}
              item={item}
              onOpen={() => setSelected(item)}
              onApprove={() => approve(item)}
              onDecline={() => decline(item)}
            />
          )
          if (item.status === 'error') return (
            <ErrorRow
              key={item.id}
              item={item}
              onOpen={() => setSelected(item)}
              onRetry={() => retry(item)}
            />
          )
          return (
            <TaskRow
              key={item.id}
              item={item}
              onOpen={() => setSelected(item)}
              onComplete={() => complete(item.id)}
            />
          )
        })}
      </div>

      {remaining > 0 && !showAll && (
        <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-[11px] text-gray-400 transition-colors hover:text-aims-blue dark:text-slate-500 dark:hover:text-blue-400"
          >
            +{remaining} more items
          </button>
        </div>
      )}

      {selected && (
        <ItemModal
          item={selected}
          isHtl={selected._kind === 'htl'}
          onClose={() => setSelected(null)}
          onAction={handleModalAction}
        />
      )}

      {toast && (
        <UndoToast
          message={toast.message}
          onUndo={toast.undo ? () => { toast.undo(); setToast(null) } : undefined}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
