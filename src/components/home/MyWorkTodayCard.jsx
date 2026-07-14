// src/components/home/MyWorkTodayCard.jsx
import { useState } from 'react'
import { Briefcase, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_TASKS, HTL_ITEMS } from '../../data/home.js'

const URGENCY_CLASS = {
  overdue:  'text-red-500 dark:text-red-400',
  today:    'text-amber-500 dark:text-amber-400',
  upcoming: 'text-gray-400 dark:text-slate-500',
}

function urgencyOf(task) {
  if (task.due === 'Overdue') return 'overdue'
  if (task.due === 'Today')   return 'today'
  return 'upcoming'
}

export function MyWorkTodayCard() {
  const [done, setDone] = useState(new Set())

  const pendingTasks = HOME_TASKS.filter((t) => !done.has(t.id) && t.status !== 'error')
  const pendingHtl   = HTL_ITEMS.length
  const overdue      = pendingTasks.filter((t) => t.due === 'Overdue')
  const todayTasks   = pendingTasks.filter((t) => t.due === 'Today')

  const totalUrgent = overdue.length + pendingHtl
  const displayItems = [
    ...overdue.map((t) => ({ ...t, _kind: 'task' })),
    ...HTL_ITEMS.slice(0, 2).map((h) => ({ ...h, _kind: 'htl' })),
    ...todayTasks.slice(0, 3).map((t) => ({ ...t, _kind: 'task' })),
  ].slice(0, 6)

  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Briefcase size={14} />}
        title="My Work Today"
        badge={totalUrgent}
        action={{ label: 'See all', onClick: () => {} }}
      />
      <div className="flex-1 divide-y divide-gray-100 dark:divide-white/[0.05]">
        {displayItems.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <CheckCircle2 size={20} className="text-aims-governed" />
            <p className="text-sm text-gray-500 dark:text-slate-400">All clear — nothing urgent.</p>
          </div>
        )}
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-2.5">
            {item._kind === 'task' ? (
              <button
                type="button"
                onClick={() => setDone((prev) => new Set([...prev, item.id]))}
                className="mt-0.5 shrink-0 text-gray-300 hover:text-aims-governed dark:text-slate-600 dark:hover:text-aims-governed transition-colors"
                aria-label="Mark complete"
              >
                <CheckCircle2 size={14} />
              </button>
            ) : (
              <span className="mt-0.5 shrink-0 text-aims-stale" aria-hidden="true">
                <AlertCircle size={14} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">
                {item.title || item.subject}
              </p>
              {item._kind === 'task' && item.due && (
                <p className={`text-[10px] font-medium ${URGENCY_CLASS[urgencyOf(item)]}`}>
                  {item.due}
                </p>
              )}
              {item._kind === 'htl' && (
                <p className="text-[10px] font-medium text-aims-stale">Needs approval</p>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 text-gray-300 hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Open"
            >
              <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
      {pendingTasks.length > 6 && (
        <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/[0.05]">
          <button type="button" className="text-[11px] text-gray-400 hover:text-aims-blue dark:text-slate-500 dark:hover:text-blue-400 transition-colors">
            +{pendingTasks.length - 6} more items
          </button>
        </div>
      )}
    </div>
  )
}
