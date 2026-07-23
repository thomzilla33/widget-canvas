import { Bot, MessageSquare, FileOutput, Zap } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_AGENTS } from '../../data/home.js'

const STATUS_CFG = {
  active: {
    dot:   'bg-emerald-400',
    pulse: true,
    label: 'Active',
    text:  'text-emerald-600 dark:text-emerald-400',
  },
  idle: {
    dot:   'bg-slate-300 dark:bg-slate-600',
    pulse: false,
    label: 'Idle',
    text:  'text-gray-400 dark:text-slate-500',
  },
  paused: {
    dot:   'bg-amber-400',
    pulse: false,
    label: 'Paused',
    text:  'text-amber-600 dark:text-amber-400',
  },
}

// Sort: agents with handoffs first, then by status priority
const STATUS_ORDER = { active: 0, idle: 1, paused: 2 }
const SORTED_AGENTS = [...HOME_AGENTS].sort((a, b) => {
  if (b.handoffs !== a.handoffs) return b.handoffs - a.handoffs
  return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
})

export function MyAgentsCard() {
  const activeCount   = HOME_AGENTS.filter(a => a.status === 'active').length
  const handoffTotal  = HOME_AGENTS.reduce((s, a) => s + a.handoffs, 0)

  return (
    <div className="card flex h-full flex-col">
      <CardHeader
        icon={<Bot size={14} />}
        title="My Agents"
        badge={handoffTotal > 0 ? handoffTotal : undefined}
        action={{ label: 'See all', onClick: undefined }}
      />

      {/* Stats strip */}
      <div className="flex items-center gap-4 border-b border-gray-100 px-5 pb-3 dark:border-white/[0.06]">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-semibold text-gray-700 dark:text-slate-200">{activeCount}</span>
          active
        </span>
        {handoffTotal > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <Zap size={11} aria-hidden="true" />
            {handoffTotal} need{handoffTotal === 1 ? 's' : ''} your attention
          </span>
        )}
      </div>

      {/* Agent rows */}
      <div className="flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-white/[0.05]">
        {SORTED_AGENTS.map(agent => {
          const s = STATUS_CFG[agent.status] ?? STATUS_CFG.idle
          return (
            <div
              key={agent.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
            >
              {/* Avatar */}
              <div
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: agent.color }}
              >
                {agent.initials}
              </div>

              {/* Name + capability + status */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-semibold text-gray-800 dark:text-slate-100">
                    {agent.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">
                    {agent.capability}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500">
                  {/* Status dot */}
                  <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                    {s.pulse && (
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`} />
                    )}
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  </span>
                  <span className={s.text}>{s.label}</span>
                  <span aria-hidden="true">·</span>
                  {agent.status === 'active'
                    ? <span>{agent.conversationsToday} convos today</span>
                    : <span>{agent.lastActive}</span>
                  }
                </div>
              </div>

              {/* Handoff chip */}
              {agent.handoffs > 0 && (
                <span
                  aria-label={`${agent.handoffs} handoff${agent.handoffs !== 1 ? 's' : ''}`}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
                >
                  <Zap size={9} aria-hidden="true" />
                  {agent.handoffs}
                </span>
              )}

              {/* Quick actions */}
              <div className="flex shrink-0 gap-0.5">
                <button
                  type="button"
                  aria-label={`Chat with ${agent.name}`}
                  title="Chat"
                  className="rounded-md p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-aims-blue dark:text-slate-600 dark:hover:bg-white/[0.06] dark:hover:text-blue-400"
                >
                  <MessageSquare size={12} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`View ${agent.name} outputs`}
                  title="View outputs"
                  className="rounded-md p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-aims-blue dark:text-slate-600 dark:hover:bg-white/[0.06] dark:hover:text-blue-400"
                >
                  <FileOutput size={12} aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
