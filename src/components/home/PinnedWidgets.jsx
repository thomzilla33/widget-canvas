import { useState } from 'react'
import {
  Inbox,
  ListChecks,
  Hand,
  Sparkles,
  Workflow,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react'
import { HOME_INBOX, HOME_TASKS, HTL_ITEMS } from '../../data/mock.js'

// Fixed/suggested Home widgets: Inbox, Tasks, and the Human Touch Layer (HITL).
export default function PinnedWidgets() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <InboxCard />
        <TasksCard />
      </div>
      <HtlCard />
    </div>
  )
}

function CardHeader({ icon: Icon, title, count, sub, tone = 'blue' }) {
  const bg = tone === 'amber' ? 'bg-amber-500/10 text-aims-ungoverned' : 'bg-aims-blue/10 text-aims-blue'
  return (
    <div className="flex items-center gap-2.5">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${bg}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</span>
          {count > 0 && (
            <span className="rounded-full bg-aims-blue px-1.5 text-[10px] font-bold leading-[16px] text-white">{count}</span>
          )}
        </div>
        {sub && <div className="text-[11px] text-gray-400 dark:text-slate-500">{sub}</div>}
      </div>
    </div>
  )
}

function InboxCard() {
  const [read, setRead] = useState(new Set())
  const unread = HOME_INBOX.filter((m) => m.unread && !read.has(m.id)).length
  return (
    <div className="card flex flex-col p-4">
      <CardHeader icon={Inbox} title="Inbox" count={unread} sub="Messages & mentions" />
      <ul className="mt-2 -mx-1">
        {HOME_INBOX.map((m) => {
          const isUnread = m.unread && !read.has(m.id)
          return (
            <li key={m.id}>
              <button
                onClick={() => setRead((s) => new Set(s).add(m.id))}
                className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isUnread ? 'bg-aims-blue' : 'bg-transparent'}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-xs ${isUnread ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'}`}>
                    {m.subject}
                  </span>
                  <span className="block truncate text-[11px] text-gray-400 dark:text-slate-500">{m.from} · {m.when}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const DUE_TONE = { Overdue: 'text-aims-stale', Today: 'text-aims-ungoverned' }

function TasksCard() {
  const [done, setDone] = useState(new Set())
  const open = HOME_TASKS.filter((t) => !done.has(t.id)).length
  const toggle = (id) =>
    setDone((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  return (
    <div className="card flex flex-col p-4">
      <CardHeader icon={ListChecks} title="Tasks" count={open} sub="Assigned to you" />
      <ul className="mt-2 -mx-1">
        {HOME_TASKS.map((t) => {
          const isDone = done.has(t.id)
          return (
            <li key={t.id}>
              <button
                onClick={() => toggle(t.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {isDone ? (
                  <CheckCircle2 size={15} className="shrink-0 text-aims-governed" />
                ) : (
                  <Circle size={15} className="shrink-0 text-gray-300 dark:text-slate-600" />
                )}
                <span className={`min-w-0 flex-1 truncate text-xs ${isDone ? 'text-gray-400 line-through dark:text-slate-600' : 'text-gray-700 dark:text-slate-200'}`}>
                  {t.title}
                </span>
                {!isDone && (
                  <span className={`shrink-0 text-[10px] font-medium ${DUE_TONE[t.due] || 'text-gray-400 dark:text-slate-500'}`}>{t.due}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const SOURCE = {
  Agent: { icon: Sparkles, cls: 'bg-purple-500/10 text-purple-500 dark:text-purple-300' },
  Workflow: { icon: Workflow, cls: 'bg-aims-blue/10 text-aims-blue' },
  System: { icon: RefreshCw, cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' },
  Escalation: { icon: ArrowUpRight, cls: 'bg-red-500/10 text-aims-stale' },
}
const PRIORITY = {
  high: 'border-red-300 text-aims-stale dark:border-red-500/30',
  med: 'border-amber-300 text-aims-ungoverned dark:border-amber-500/30',
  low: 'border-gray-300 text-gray-500 dark:border-white/15 dark:text-slate-400',
}

function HtlCard() {
  const [resolved, setResolved] = useState(new Set())
  const pending = HTL_ITEMS.filter((i) => !resolved.has(i.id))
  const resolve = (id) => setResolved((s) => new Set(s).add(id))
  return (
    <div className="card p-4">
      <CardHeader icon={Hand} title="Human Touch Layer" count={pending.length} sub="Agents, workflows & escalations waiting on you" />
      {pending.length === 0 ? (
        <div className="mt-3 grid place-items-center rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-white/10">
          <CheckCircle2 size={22} className="text-aims-governed" />
          <div className="mt-1 text-sm font-medium text-gray-700 dark:text-slate-200">All caught up</div>
          <div className="text-[11px] text-gray-400 dark:text-slate-500">Nothing needs your attention right now.</div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {pending.map((item) => {
            const s = SOURCE[item.source] || SOURCE.System
            const Icon = s.icon
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-white/10">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${s.cls}`}>
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.title}</span>
                    <span className={`rounded-md border px-1.5 text-[10px] font-bold uppercase leading-[15px] ${PRIORITY[item.priority]}`}>{item.priority}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{item.detail}</div>
                  <div className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">{item.source} · {item.when}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => resolve(item.id)}>{item.action}</button>
                  <button
                    onClick={() => resolve(item.id)}
                    title="Dismiss"
                    aria-label="Dismiss"
                    className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
