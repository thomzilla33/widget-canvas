import { useState, useEffect, useRef } from 'react'
import {
  Check, X, CornerUpRight, Plus, Clock, Sparkles, CheckCircle2,
  FileText, ScrollText, ListChecks, ChevronRight, History,
} from 'lucide-react'
import { useWorkQueue, REASSIGN_TARGETS, REJECT_REASONS, DECISION_VERB } from '../../state/WorkQueueContext.jsx'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import UndoToast from '../home/UndoToast.jsx'

// Interactive render for the three system work widgets. WidgetRender routes the widget
// ids here (bypassing the static skeleton). sm = read-only compact summary; md/lg =
// actionable list (truncated, with a "View all" link that opens the full queue modal).
//
// HITL decisions are auditable: a row opens a Decision panel (full context + Approve /
// Reject-with-reason / Reassign-to-someone). Resolving flashes an Undo toast and records
// the decision (kept as history). The Inbox human-touch rows use the same panel.
const TITLES = { 'w-htl': 'Human-in-the-Loop', 'w-inbox': 'Inbox', 'w-tasks': 'My Tasks' }

export default function SystemWidget({ id, size = 'md' }) {
  const { resolveHtl, undoHtl } = useWorkQueue()
  const [expanded, setExpanded] = useState(false)
  const [reviewing, setReviewing] = useState(null) // htl item open in the Decision panel
  const [toast, setToast] = useState(null) // { message, undoId }
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const flashToast = (message, undoId) => {
    clearTimeout(timer.current)
    setToast({ message, undoId })
    timer.current = setTimeout(() => setToast(null), 6000)
  }
  // Resolve a decision (from the panel, or a quick-approve on a row).
  const decide = (item, decision, meta = {}) => {
    resolveHtl(item.id, decision, meta)
    setReviewing(null)
    const to = meta.assigneeLabel ? ` to ${meta.assigneeLabel}` : ''
    flashToast(`${DECISION_VERB[decision]}${to}: ${item.title}`, item.id)
  }
  const undo = () => {
    if (toast?.undoId) undoHtl(toast.undoId)
    clearTimeout(timer.current)
    setToast(null)
  }

  const Body = id === 'w-htl' ? HtlBody : id === 'w-inbox' ? InboxBody : id === 'w-tasks' ? TasksBody : null
  if (!Body) return null
  const handlers = { onReview: setReviewing, onDecide: decide }
  return (
    <>
      <Body size={size} onExpand={() => setExpanded(true)} {...handlers} />
      {expanded && (
        <SystemQueueModal title={TITLES[id]} onClose={() => setExpanded(false)}>
          <Body size="lg" full {...handlers} />
        </SystemQueueModal>
      )}
      {reviewing && <DecisionPanel item={reviewing} onDecide={decide} onClose={() => setReviewing(null)} />}
      {toast && <UndoToast message={toast.message} onUndo={toast.undoId ? undo : null} onClose={() => setToast(null)} />}
    </>
  )
}

const rowMax = (size) => (size === 'lg' ? 6 : 4)

/* ── Risk signalling — paired with a label, never color-only ── */
const RISK = {
  high: { label: 'High risk', cls: 'border-red-300/50 bg-red-500/10 text-red-600 dark:text-red-400' },
  medium: { label: 'Medium', cls: 'border-amber-300/50 bg-amber-500/10 text-aims-aging' },
  low: { label: 'Low risk', cls: 'border-gray-200 bg-gray-100 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400' },
}
function RiskChip({ risk }) {
  const r = RISK[risk] || RISK.low
  return <span className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${r.cls}`}>{r.label}</span>
}

function Empty({ children }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-5 text-center text-[11px] text-aims-governed">
      <CheckCircle2 size={13} aria-hidden="true" /> {children}
    </div>
  )
}
function ViewAll({ n, onClick }) {
  return (
    <button onClick={onClick} className="mt-1.5 w-full rounded-md py-1 text-[11px] font-medium text-aims-blue transition-colors hover:bg-aims-blue/5">
      View all {n} →
    </button>
  )
}
// Full-queue modal — renders the same Body in `full` mode (no truncation), scrollable.
function SystemQueueModal({ title, onClose, children }) {
  const ref = useFocusTrap()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[85vh] w-[92vw] max-w-[560px] flex-col p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
      </div>
    </div>
  )
}

/* ── Decision panel — the auditable HITL review surface ── */
function PanelRow({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
        <Icon size={12} aria-hidden="true" /> {label}
      </div>
      <div className="text-[12px] leading-relaxed text-gray-700 dark:text-slate-200">{children}</div>
    </div>
  )
}
function DecisionPanel({ item: itemProp, onDecide, onClose }) {
  const ref = useFocusTrap()
  const { htl } = useWorkQueue()
  // Track the live item so the panel (and the decision it records) reflects any
  // out-of-band update while it's open; fall back to the snapshot if it's gone.
  const item = htl.find((h) => h.id === itemProp.id) || itemProp
  const labelId = `decision-title-${item.id}`
  const [mode, setMode] = useState(null) // null | 'reject' | 'reassign'
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [target, setTarget] = useState('')
  const canReject = !!reason
  const canReassign = !!target
  const confirmReject = () => onDecide(item, 'rejected', { reason: reason === 'Other' && note.trim() ? note.trim() : reason })
  const confirmReassign = () => {
    const t = REASSIGN_TARGETS.find((x) => x.id === target)
    onDecide(item, 'reassigned', { assignee: target, assigneeLabel: t?.label })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={labelId}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[88vh] w-[92vw] max-w-[480px] flex-col p-0 outline-none">
        {/* Header */}
        <div className="flex items-start gap-2.5 border-b border-gray-200 p-4 dark:border-white/10">
          <Sparkles size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <h2 id={labelId} className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.title}</h2>
            <div className="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400">{item.source} · {item.when}</div>
          </div>
          <RiskChip risk={item.risk} />
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Context */}
        <div className="min-h-0 flex-1 space-y-3.5 overflow-auto p-4">
          <PanelRow icon={FileText} label="Request">{item.request}</PanelRow>
          <PanelRow icon={Sparkles} label="Agent reasoning">{item.reasoning}</PanelRow>
          <PanelRow icon={ScrollText} label="Policy">{item.policy}</PanelRow>
          {item.evidence?.length > 0 && (
            <PanelRow icon={ListChecks} label="Evidence">
              <ul className="mt-1 space-y-1">
                {item.evidence.map((e, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-slate-500" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </PanelRow>
          )}

          {/* Reject — reason capture */}
          {mode === 'reject' && (
            <div className="surface-sunken space-y-2 rounded-lg p-3">
              <label htmlFor="reject-reason" className="block text-[11px] font-semibold text-gray-700 dark:text-slate-200">Reason for rejection</label>
              <select id="reject-reason" className="input h-9 text-[12px]" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus>
                <option value="">Select a reason…</option>
                {REJECT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {reason === 'Other' && (
                <textarea className="input min-h-[2.25rem] text-[12px]" rows={2} placeholder="Add a short note" value={note} onChange={(e) => setNote(e.target.value)} />
              )}
            </div>
          )}
          {/* Reassign — target picker */}
          {mode === 'reassign' && (
            <div className="surface-sunken space-y-2 rounded-lg p-3">
              <label htmlFor="reassign-target" className="block text-[11px] font-semibold text-gray-700 dark:text-slate-200">Reassign to</label>
              <select id="reassign-target" className="input h-9 text-[12px]" value={target} onChange={(e) => setTarget(e.target.value)} autoFocus>
                <option value="">Select a person or queue…</option>
                {REASSIGN_TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label} · {t.sub}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-3 dark:border-white/10">
          {mode === 'reject' ? (
            <div className="flex items-center justify-end gap-2">
              <button className="btn-ghost text-xs" onClick={() => { setMode(null); setReason(''); setNote('') }}>Back</button>
              <button disabled={!canReject} onClick={confirmReject}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">
                <X size={14} aria-hidden="true" /> Confirm reject
              </button>
            </div>
          ) : mode === 'reassign' ? (
            <div className="flex items-center justify-end gap-2">
              <button className="btn-ghost text-xs" onClick={() => { setMode(null); setTarget('') }}>Back</button>
              <button disabled={!canReassign} onClick={confirmReassign}
                className="inline-flex items-center gap-1.5 rounded-lg bg-aims-blue px-3 py-2 text-xs font-semibold text-white hover:bg-aims-blue/90 disabled:cursor-not-allowed disabled:opacity-40">
                <CornerUpRight size={14} aria-hidden="true" /> Confirm reassign
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setMode('reassign')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                <CornerUpRight size={14} aria-hidden="true" /> Reassign
              </button>
              <button onClick={() => setMode('reject')}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">
                <X size={14} aria-hidden="true" /> Reject
              </button>
              <button onClick={() => onDecide(item, 'approved')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-aims-governed px-3 py-2 text-xs font-semibold text-white hover:bg-aims-governed/90">
                <Check size={14} aria-hidden="true" /> Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// sm tiles are read-only: a count headline + the top 1–2 item titles (no actions —
// too cramped at one column). md/lg get the full interactive list.
function CompactSummary({ n, noun, tone = 'blue', items = [] }) {
  const c = tone === 'amber' ? 'text-aims-aging' : tone === 'governed' ? 'text-aims-governed' : 'text-aims-blue'
  return (
    <div>
      <div className="py-0.5">
        <span className={`num text-xl font-bold tracking-tight ${c}`}>{n}</span>
        <span className="ml-1.5 text-[11px] text-gray-500 dark:text-slate-400">{noun}</span>
      </div>
      {items.length > 0 && (
        <ul className="mt-1 space-y-1 border-t border-gray-100 pt-1.5 dark:border-white/10">
          {items.map((it, i) => (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${it.amber ? 'bg-amber-500' : 'bg-aims-blue'}`} />
              <span className="truncate text-[10px] text-gray-600 dark:text-slate-300">{it.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Human-in-the-Loop: a queue of pending decisions ── */
function HtlBody({ size, full, onExpand, onReview, onDecide }) {
  const { htl } = useWorkQueue()
  const [showResolved, setShowResolved] = useState(false)
  const pending = htl.filter((h) => h.status === 'pending')
  const resolved = htl.filter((h) => h.status !== 'pending')
  if (size === 'sm') return pending.length
    ? <CompactSummary n={pending.length} noun="awaiting you" tone="amber" items={pending.slice(0, 2).map((h) => ({ label: h.title, amber: true }))} />
    : <Empty>All caught up</Empty>
  if (pending.length === 0 && !(full && resolved.length)) return <Empty>All caught up — no decisions pending</Empty>
  const visible = full ? pending : pending.slice(0, rowMax(size))
  return (
    <>
      <ul className="space-y-1.5">
        {visible.map((h) => (
          <li key={h.id} className="rounded-lg border border-gray-200 p-2 transition-colors hover:border-aims-blue/40 dark:border-white/10">
            <button onClick={() => onReview(h)} className="flex w-full min-w-0 items-start gap-1.5 text-left" aria-label={`Review: ${h.title}`}>
              <Sparkles size={12} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500" />
              <span className="min-w-0 flex-1 text-[11px] font-medium text-gray-900 dark:text-slate-100">{h.title}</span>
              <RiskChip risk={h.risk} />
            </button>
            <div className="mt-0.5 pl-[18px] text-[10px] text-gray-500 dark:text-slate-400">{h.source} · {h.when}</div>
            <div className="mt-1.5 flex items-center gap-1.5 pl-[18px]">
              <button onClick={() => onReview(h)} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                <ChevronRight size={11} aria-hidden="true" /> Review
              </button>
              <button onClick={() => onDecide(h, 'approved')} className="ml-auto inline-flex items-center gap-1 rounded-md bg-aims-governed/15 px-2 py-1 text-[10px] font-semibold text-aims-governed hover:bg-aims-governed/25">
                <Check size={11} aria-hidden="true" /> Approve
              </button>
            </div>
          </li>
        ))}
      </ul>
      {full && pending.length === 0 && <Empty>All caught up — no decisions pending</Empty>}
      {/* Footer entry to the full view: "View all" when the queue is truncated, else a
          path to the decision history so the audit trail stays reachable once cleared. */}
      {!full && onExpand && (
        pending.length > visible.length ? (
          <ViewAll n={pending.length} onClick={onExpand} />
        ) : resolved.length > 0 ? (
          <button onClick={onExpand} className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md py-1 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/5">
            <History size={12} aria-hidden="true" /> Decision history ({resolved.length})
          </button>
        ) : null
      )}
      {/* Decision history — the audit trail, only in the full view */}
      {full && resolved.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2 dark:border-white/10">
          <button onClick={() => setShowResolved((v) => !v)} className="flex w-full items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
            <History size={12} aria-hidden="true" /> Decision history ({resolved.length})
            <ChevronRight size={12} aria-hidden="true" className={`ml-auto transition-transform ${showResolved ? 'rotate-90' : ''}`} />
          </button>
          {showResolved && (
            <ul className="mt-1.5 space-y-1">
              {resolved.map((h) => (
                <li key={h.id} className="rounded-md px-1.5 py-1 text-[10px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${h.decision === 'approved' ? 'bg-aims-governed/15 text-aims-governed' : h.decision === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-aims-blue/10 text-aims-blue'}`}>
                      {DECISION_VERB[h.decision]}
                    </span>
                    <span className="truncate text-gray-600 dark:text-slate-300">{h.title}</span>
                  </div>
                  <div className="mt-0.5 pl-1 text-[10px] text-gray-400 dark:text-slate-500">
                    {h.assignee ? `→ ${h.assignee} · ` : h.reason ? `${h.reason} · ` : ''}{h.decidedBy} {h.decidedAt}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  )
}

/* ── Inbox: native items + pending HITL (the "human-touch" tag) ── */
const INBOX_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'needs', label: 'Needs you' },
  { id: 'mention', label: 'Mentions' },
]
function InboxBody({ size, full, onExpand, onReview, onDecide }) {
  const { inbox, htl, markRead, dismiss } = useWorkQueue()
  const [filter, setFilter] = useState('all')
  // Unified list: native inbox items + pending HITL decisions (human-touch).
  const htlItems = htl.filter((h) => h.status === 'pending').map((h) => ({ ...h, humanTouch: true, actor: `${h.source} · needs you` }))
  const nativeItems = inbox.map((i) => ({ ...i, humanTouch: false }))
  const all = [...htlItems, ...nativeItems]
  const unread = htlItems.length + nativeItems.filter((i) => !i.read).length
  const matched = all.filter((i) => (filter === 'all' ? true : filter === 'needs' ? i.humanTouch : i.kind === 'mention'))

  if (size === 'sm') return unread
    ? <CompactSummary n={unread} noun="unread" items={all.slice(0, 2).map((i) => ({ label: i.title, amber: i.humanTouch }))} />
    : <Empty>Inbox zero</Empty>
  const visible = full ? matched : matched.slice(0, rowMax(size))
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        {INBOX_FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${filter === f.id ? 'bg-aims-blue text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10'}`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-500">{unread} unread</span>
      </div>
      {matched.length === 0 ? (
        <Empty>Nothing here</Empty>
      ) : (
        <ul className="space-y-1">
          {visible.map((i) => (
            <li key={i.id} className="group flex min-w-0 items-start gap-1.5 rounded-md px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-white/5">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${i.humanTouch ? 'bg-amber-500' : i.read ? 'bg-transparent border border-gray-300 dark:border-white/20' : 'bg-aims-blue'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className={`truncate text-[11px] ${i.read && !i.humanTouch ? 'text-gray-500 dark:text-slate-400' : 'text-gray-800 dark:text-slate-100'}`}>{i.title}</span>
                  {i.humanTouch && <span className="shrink-0 rounded border border-amber-300/50 bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-aims-aging">Human-touch</span>}
                </div>
                <div className="truncate text-[10px] text-gray-500 dark:text-slate-400">{i.actor} · {i.when}</div>
                {i.humanTouch && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <button onClick={() => onReview(i)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10">Review</button>
                    <button onClick={() => onDecide(i, 'approved')} className="rounded bg-aims-governed/15 px-1.5 py-0.5 text-[10px] font-semibold text-aims-governed hover:bg-aims-governed/25">Approve</button>
                  </div>
                )}
              </div>
              {!i.humanTouch && (
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {!i.read && (
                    <button onClick={() => markRead(i.id)} title="Mark read" className="grid h-5 w-5 place-items-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-white/10"><Check size={12} aria-hidden="true" /></button>
                  )}
                  <button onClick={() => dismiss(i.id)} title="Dismiss" className="grid h-5 w-5 place-items-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-white/10"><X size={12} aria-hidden="true" /></button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!full && onExpand && matched.length > visible.length && <ViewAll n={matched.length} onClick={onExpand} />}
    </div>
  )
}

/* ── My Tasks: to-dos with complete + quick-add ── */
function TasksBody({ size, full, onExpand }) {
  const { tasks, completeTask, addTask } = useWorkQueue()
  const [draft, setDraft] = useState('')
  const open = tasks.filter((t) => !t.done)
  if (size === 'sm') return open.length
    ? <CompactSummary n={open.length} noun="open" items={open.slice(0, 2).map((t) => ({ label: t.title, amber: t.overdue }))} />
    : <Empty>No open tasks</Empty>
  const visible = full ? open : open.slice(0, rowMax(size)) // completing a task drops it from the list
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 dark:border-white/10">
        <Plus size={12} aria-hidden="true" className="shrink-0 text-gray-400" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { addTask(draft); setDraft('') } }}
          placeholder="Add a task + Enter"
          aria-label="Add a task"
          className="min-w-0 flex-1 bg-transparent text-[11px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
      {open.length === 0 ? (
        <Empty>No open tasks — you’re all caught up</Empty>
      ) : (
        <ul className="space-y-0.5">
          {visible.map((t) => (
            <li key={t.id} className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-white/5">
              <button
                onClick={() => completeTask(t.id)}
                aria-label={t.done ? `Reopen ${t.title}` : `Complete ${t.title}`}
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${t.done ? 'border-aims-governed bg-aims-governed text-white' : 'border-gray-300 text-transparent hover:border-aims-blue dark:border-white/25'}`}
              >
                <Check size={11} aria-hidden="true" />
              </button>
              <span className={`min-w-0 flex-1 truncate text-[11px] ${t.done ? 'text-gray-400 line-through dark:text-slate-500' : 'text-gray-800 dark:text-slate-100'}`}>{t.title}</span>
              <span className={`inline-flex shrink-0 items-center gap-1 text-[10px] ${t.overdue && !t.done ? 'text-aims-stale' : 'text-gray-400 dark:text-slate-500'}`}>
                <Clock size={10} aria-hidden="true" /> {t.due}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!full && onExpand && open.length > visible.length && <ViewAll n={open.length} onClick={onExpand} />}
    </div>
  )
}
