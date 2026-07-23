import { useNavigate } from 'react-router-dom'
import { Bot, ExternalLink } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_AGENTS } from '../../data/home.js'

const STATUS_DOT = {
  active: 'bg-aims-governed animate-pulse',
  idle:   'bg-gray-300 dark:bg-slate-600',
  paused: 'bg-aims-aging',
}
const STATUS_LABEL = {
  active: 'text-aims-governed',
  idle:   'text-gray-400 dark:text-slate-500',
  paused: 'text-aims-aging',
}

export function AgentsCard() {
  const navigate = useNavigate()
  const active   = HOME_AGENTS.filter((a) => a.status === 'active').length

  return (
    <div className="card flex flex-col h-full" id="home-agents">
      <CardHeader
        icon={<Bot size={14} />}
        title="Agents"
        badge={active}
        action={{ label: 'Manage', onClick: () => navigate('/dashboards') }}
      />
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
        {HOME_AGENTS.map((ag) => (
          <div key={ag.id} className="flex items-center gap-3 px-4 py-2.5">
            <span
              className="logo-sq h-7 w-7 shrink-0 text-[9px]"
              style={{ background: ag.color }}
              aria-hidden="true"
            >
              {ag.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">{ag.name}</p>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[ag.status]}`} aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500">
                <span className={`font-medium capitalize ${STATUS_LABEL[ag.status]}`}>{ag.status}</span>
                <span>·</span>
                <span className="num">{ag.conversationsToday} convos today</span>
                {ag.handoffs > 0 && (
                  <>
                    <span>·</span>
                    <span className="num text-aims-aging">{ag.handoffs} handoffs</span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboards')}
              className="shrink-0 text-gray-300 transition-colors hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-300"
              aria-label={`Open ${ag.name}`}
            >
              <ExternalLink size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
