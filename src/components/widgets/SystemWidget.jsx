import { useState } from 'react'
import { Check, X, CornerUpRight, Plus, Clock, Sparkles, CheckCircle2 } from 'lucide-react'
import { useWorkQueue } from '../../state/WorkQueueContext.jsx'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

// Interactive render for the three system work widgets. WidgetRender routes the widget
// ids here (bypassing the static skeleton). sm = read-only compact summary; md/lg =
// actionable list (truncated, with a "View all" link that opens the full queue modal).
const TITLES = { 'w-htl': 'Human-in-the-Loop', 'w-inbox': 'Inbox', 'w-tasks': 'My Tasks' }

export default function SystemWidget({ id, size = 'md' }) {
  const [expanded, setExpanded] = useState(false)
  const Body = id === 'w-htl' ? HtlBody : id === 'w-inbox' ? InboxBody : id === 'w-tasks' ? TasksBody : null
  if (!Body) return null
  return (
    <>
      <Body size={size} onExpand={() => setExpanded(true)} />
      {expanded && (
        <SystemQueueModal title={TITLES[id]} onClose={() => setExpanded(false)}>
          <Body size="lg" full />
        </SystemQueueModal>
      )}
    </>
  )
}

const rowMax = (size) => (size === 'lg' ? 6 : 4)

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
function HtlBody({ size, full, onExpand }) {
  const { htl, resolveHtl } = useWorkQueue()
  const pending = htl.filter((h) => h.status === 'pending')
  if (size === 'sm') return pending.length
    ? <CompactSummary n={pending.length} noun="awaiting you" tone="amber" items={pending.slice(0, 2).map((h) => ({ label: h.title, amber: true }))} />
    : <Empty>All caught up</Empty>
  if (pending.length === 0) return <Empty>All caught up — no decisions pending</Empty>
  const visible = full ? pending : pending.slice(0, rowMax(size))
  return (
    <>
      <ul className="space-y-1.5">
        {visible.map((h) => (
          <li key={h.id} className="rounded-lg border border-gray-200 p-2 dark:border-white/10">
            <div className="flex min-w-0 items-start gap-1.5">
              <Sparkles size={12} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500" />
              <span className="min-w-0 flex-1 text-[11px] font-medium text-gray-900 dark:text-slate-100">{h.title}</span>
            </div>
            <div className="mt-0.5 pl-[18px] text-[10px] text-gray-500 dark:text-slate-400">{h.source} · {h.when}</div>
            <div className="mt-1.5 flex items-center gap-1.5 pl-[18px]">
              <button onClick={() => resolveHtl(h.id, 'approved')} className="inline-flex items-center gap-1 rounded-md bg-aims-governed/15 px-2 py-1 text-[10px] font-semibold text-aims-governed hover:bg-aims-governed/25">
                <Check size={11} aria-hidden="true" /> Approve
              </button>
              <button onClick={() => resolveHtl(h.id, 'rejected')} className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-500/20 dark:text-red-400">
                <X size={11} aria-hidden="true" /> Reject
              </button>
              <button onClick={() => resolveHtl(h.id, 'reassigned')} title="Reassign" className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-white/10">
                <CornerUpRight size={11} aria-hidden="true" /> Reassign
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!full && onExpand && pending.length > visible.length && <ViewAll n={pending.length} onClick={onExpand} />}
    </>
  )
}

/* ── Inbox: native items + pending HITL (the "human-touch" tag) ── */
const INBOX_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'needs', label: 'Needs you' },
  { id: 'mention', label: 'Mentions' },
]
function InboxBody({ size, full, onExpand }) {
  const { inbox, htl, resolveHtl, markRead, dismiss } = useWorkQueue()
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
                    <button onClick={() => resolveHtl(i.id, 'approved')} className="rounded bg-aims-governed/15 px-1.5 py-0.5 text-[10px] font-semibold text-aims-governed hover:bg-aims-governed/25">Approve</button>
                    <button onClick={() => resolveHtl(i.id, 'rejected')} className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-500/20 dark:text-red-400">Reject</button>
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
