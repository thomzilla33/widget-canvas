// src/components/home/WorkflowsCard.jsx
import { Workflow, Pause, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_WORKFLOWS } from '../../data/home.js'

const STATUS_META = {
  running:   { icon: <Loader2 size={11} className="animate-spin" />, pill: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',                         label: 'Running'  },
  completed: { icon: <CheckCircle2 size={11} />,                     pill: 'bg-green-500/10 text-aims-governed',                                       label: 'Done'     },
  failed:    { icon: <AlertTriangle size={11} />,                    pill: 'bg-red-500/10 text-aims-stale',                                            label: 'Failed'   },
  paused:    { icon: <Pause size={11} />,                            pill: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-slate-400',            label: 'Paused'   },
}

export function WorkflowsCard() {
  const failing = HOME_WORKFLOWS.filter((w) => w.status === 'failed').length
  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Workflow size={14} />}
        title="Workflows"
        badge={failing}
        action={{ label: 'View all', onClick: () => {} }}
      />
      <div className="flex-1 divide-y divide-gray-100 dark:divide-white/[0.05]">
        {HOME_WORKFLOWS.map((wf) => {
          const meta = STATUS_META[wf.status]
          return (
            <div key={wf.id} className="flex flex-col gap-1.5 px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-gray-800 dark:text-slate-200">{wf.name}</p>
                <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.pill}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>
              {wf.status === 'running' && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${wf.progress}%` }}
                  />
                </div>
              )}
              {wf.error && (
                <p className="text-[10px] text-aims-stale">{wf.error}</p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
                <span>{wf.trigger}</span>
                <span>·</span>
                <span>{wf.lastRun}</span>
                <span>·</span>
                <span className="num">{wf.runsToday} runs today</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
