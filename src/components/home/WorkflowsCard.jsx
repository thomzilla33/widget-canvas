import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Workflow, Pause, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Play, ScrollText } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_WORKFLOWS } from '../../data/home.js'

const STATUS_META = {
  running:   { icon: <Loader2 size={11} className="animate-spin" />, pill: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',      label: 'Running'  },
  completed: { icon: <CheckCircle2 size={11} />,                     pill: 'bg-green-500/10 text-aims-governed',                    label: 'Done'     },
  failed:    { icon: <AlertTriangle size={11} />,                    pill: 'bg-red-500/10 text-aims-stale',                         label: 'Failed'   },
  paused:    { icon: <Pause size={11} />,                            pill: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-slate-400', label: 'Paused' },
}

export function WorkflowsCard() {
  const navigate  = useNavigate()
  const [statuses, setStatuses] = useState({})

  function effectiveStatus(wf) { return statuses[wf.id] ?? wf.status }

  function retry(wf, e) {
    e.stopPropagation()
    setStatuses((p) => ({ ...p, [wf.id]: 'running' }))
    setTimeout(() => setStatuses((p) => ({ ...p, [wf.id]: 'completed' })), 2500)
  }

  function resume(wf, e) {
    e.stopPropagation()
    setStatuses((p) => ({ ...p, [wf.id]: 'running' }))
    setTimeout(() => setStatuses((p) => ({ ...p, [wf.id]: 'completed' })), 3000)
  }

  const failing = HOME_WORKFLOWS.filter((w) => effectiveStatus(w) === 'failed').length

  return (
    <div className="card flex flex-col h-full">
      <CardHeader
        icon={<Workflow size={14} />}
        title="Workflows"
        badge={failing || undefined}
        action={{ label: 'View all', onClick: () => navigate('/dashboards') }}
      />
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
        {HOME_WORKFLOWS.map((wf) => {
          const status = effectiveStatus(wf)
          const meta   = STATUS_META[status] ?? STATUS_META.completed
          return (
            <div key={wf.id} className="flex flex-col gap-1.5 px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-gray-800 dark:text-slate-200">{wf.name}</p>
                <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.pill}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              {status === 'running' && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${wf.progress}%` }}
                  />
                </div>
              )}

              {wf.error && status === 'failed' && (
                <p className="text-[10px] text-aims-stale">{wf.error}</p>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
                  <span>{wf.trigger}</span>
                  <span>·</span>
                  <span>{wf.lastRun}</span>
                  <span>·</span>
                  <span className="num">{wf.runsToday} runs today</span>
                </div>

                {status === 'failed' && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => retry(wf, e)}
                      className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-aims-stale transition-colors hover:bg-red-500/20"
                    >
                      <RefreshCw size={9} /> Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboards')}
                      className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                    >
                      <ScrollText size={9} /> Logs
                    </button>
                  </div>
                )}

                {status === 'paused' && (
                  <button
                    type="button"
                    onClick={(e) => resume(wf, e)}
                    className="flex shrink-0 items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500 transition-colors hover:bg-blue-500/20 dark:text-blue-400"
                  >
                    <Play size={9} /> Resume
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
