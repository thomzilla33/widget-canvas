import { useEffect, useRef, useState } from 'react'
import { ListChecks, Circle, Clock, AlertTriangle, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'
import { HOME_TASKS } from '../../data/mock.js'
import CardHeader from './CardHeader.jsx'
import ItemDetailModal from './ItemDetailModal.jsx'

const DUE_TONE = { Overdue: 'text-aims-stale', Today: 'text-aims-ungoverned' }
const PRIORITY_DOT = { high: 'bg-aims-stale', med: 'bg-aims-ungoverned', low: 'bg-gray-300 dark:bg-slate-600' }
const BUCKETS = [
  { key: 'overdue', label: 'Overdue', has: (due) => due === 'Overdue' },
  { key: 'today', label: 'Today', has: (due) => due === 'Today' },
  { key: 'upcoming', label: 'Upcoming', has: (due) => due === 'Tomorrow' || due === 'This week' },
]

// Tasks assigned to you, grouped Overdue / Today / Upcoming. Edge cases covered:
// - failed automated step → Retry (error recovery)
// - complete & snooze → Undo via the shared toast (action recovery)
// - empty "all clear" state, snoozed items rescheduled to Upcoming, volume summary.
export default function TasksCard({ notify }) {
  const [done, setDone] = useState(new Set())
  const [snoozed, setSnoozed] = useState(new Set())
  const [retrying, setRetrying] = useState(new Set())
  const [recovered, setRecovered] = useState(new Set())
  const [detail, setDetail] = useState(null) // task open in the detail modal
  const retryTimers = useRef(new Map())
  useEffect(() => () => retryTimers.current.forEach(clearTimeout), [])

  const openTasks = HOME_TASKS.filter((t) => !done.has(t.id))
  const dueOf = (t) => (snoozed.has(t.id) ? 'This week' : t.due)
  const isErr = (t) => t.status === 'error' && !recovered.has(t.id)

  const complete = (t) => {
    setDone((s) => new Set(s).add(t.id))
    notify('Task completed', () =>
      setDone((s) => {
        const n = new Set(s)
        n.delete(t.id)
        return n
      }),
    )
  }
  const snooze = (t) => {
    setSnoozed((s) => new Set(s).add(t.id))
    notify('Snoozed to next week', () =>
      setSnoozed((s) => {
        const n = new Set(s)
        n.delete(t.id)
        return n
      }),
    )
  }
  const retry = (t) => {
    setRetrying((s) => new Set(s).add(t.id))
    const id = setTimeout(() => {
      retryTimers.current.delete(t.id)
      setRetrying((s) => {
        const n = new Set(s)
        n.delete(t.id)
        return n
      })
      setRecovered((s) => new Set(s).add(t.id))
    }, 900)
    retryTimers.current.set(t.id, id)
  }

  return (
    <div className="card flex flex-col p-4">
      <CardHeader icon={ListChecks} title="Tasks" count={openTasks.length} sub="Assigned to you" />
      {openTasks.length === 0 ? (
        <EmptyTasks />
      ) : (
        <>
          <div className="mt-2 space-y-2">
            {BUCKETS.map((b) => {
              const rows = openTasks.filter((t) => b.has(dueOf(t)))
              if (rows.length === 0) return null
              return (
                <div key={b.key}>
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    {b.label} · {rows.length}
                  </div>
                  <ul className="-mx-1">
                    {rows.map((t) =>
                      isErr(t) ? (
                        <ErrorTaskRow key={t.id} t={t} retrying={retrying.has(t.id)} onRetry={() => retry(t)} onOpen={() => setDetail(t)} />
                      ) : (
                        <TaskRow
                          key={t.id}
                          t={t}
                          due={dueOf(t)}
                          snoozed={snoozed.has(t.id)}
                          onComplete={() => complete(t)}
                          onSnooze={() => snooze(t)}
                          onOpen={() => setDetail(t)}
                        />
                      ),
                    )}
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="mt-1.5 px-2 text-[11px] text-gray-400 dark:text-slate-500">
            {openTasks.length} open · {done.size} completed · {snoozed.size} snoozed
          </div>
        </>
      )}

      {detail && (
        <ItemDetailModal
          item={detail}
          kind="task"
          onClose={() => setDetail(null)}
          onComplete={() => complete(detail)}
        />
      )}
    </div>
  )
}

function TaskRow({ t, due, snoozed, onComplete, onSnooze, onOpen }) {
  return (
    <li className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5">
      <button onClick={onComplete} aria-label="Mark complete" className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-aims-governed/50">
        <Circle size={15} className="text-gray-300 transition-colors hover:text-aims-governed dark:text-slate-600" />
      </button>
      <button onClick={onOpen} className="min-w-0 flex-1 truncate text-left text-xs text-gray-700 dark:text-slate-200">
        {t.title}
        {snoozed && <span className="ml-1 text-[10px] text-gray-400 dark:text-slate-500">· snoozed</span>}
      </button>
      <span role="img" aria-label={`${t.priority} priority`} className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[t.priority]}`} title={`${t.priority} priority`} />
      <span className={`shrink-0 text-[10px] font-medium ${DUE_TONE[due] || 'text-gray-400 dark:text-slate-500'}`}>{due}</span>
      <button
        onClick={onSnooze}
        aria-label="Snooze to next week"
        title="Snooze to next week"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 focus-within:opacity-100 dark:text-slate-600 dark:hover:bg-white/10"
      >
        <Clock size={13} />
      </button>
    </li>
  )
}

function ErrorTaskRow({ t, retrying, onRetry, onOpen }) {
  return (
    <li className="mx-1 flex items-start gap-2 rounded-md border border-red-200 bg-red-50/70 px-2 py-2 dark:border-red-500/30 dark:bg-red-500/10">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-aims-stale" />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-xs font-semibold text-gray-900 dark:text-slate-100">{t.title}</span>
        <span className="block truncate text-[11px] text-gray-400 dark:text-slate-500">{t.errorMsg}</span>
      </button>
      <button onClick={onRetry} disabled={retrying} className="btn-secondary !h-auto !px-2 !py-1 text-xs">
        {retrying ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        {retrying ? 'Retrying' : 'Retry'}
      </button>
    </li>
  )
}

function EmptyTasks() {
  return (
    <div className="mt-3 grid place-items-center rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-white/10">
      <CheckCircle2 size={22} className="text-aims-governed" />
      <div className="mt-1 text-sm font-medium text-gray-700 dark:text-slate-200">All clear</div>
      <div className="text-[11px] text-gray-400 dark:text-slate-500">No open tasks. Completed ones can be undone from the toast.</div>
    </div>
  )
}
