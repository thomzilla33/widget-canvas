import { GitBranch, Zap, ChevronDown, UserPlus, BellOff, ArrowUpRight, SkipForward, Eye, XCircle, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react'

const SECONDARY_ICON = {
  Review:      Eye,
  Reject:      XCircle,
  Approve:     CheckCircle2,
  Resolve:     CheckCircle2,
  Respond:     MessageSquare,
  Acknowledge: ThumbsUp,
}
import { WQ_TIER } from '../../../data/workqueue.js'

function fmtMins(m) {
  return m < 60 ? `~${m}m` : `~${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`
}

export function EventCard({ event, expanded, onToggle, onOpen, onEscalate, onSkip, onTrace }) {
  const t = WQ_TIER[event.tier] || WQ_TIER.headsup

  function stopAndCall(fn) {
    return (e) => { e.stopPropagation(); fn?.() }
  }

  return (
    <div
      className={`cursor-pointer border-l-[3px] transition-colors ${t.border} ${
        expanded ? 'bg-gray-50 dark:bg-white/[0.04]' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
      }`}
      onClick={onToggle}
    >
      {/* Main row */}
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        {/* Studio + dot */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          <span
            className="flex h-[18px] min-w-[28px] items-center justify-center rounded px-1 text-[8px] font-bold text-white"
            style={{ background: event.studioColor }}
          >
            {event.studio}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded-full border border-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-gray-500 dark:border-white/10 dark:text-slate-500">
              {event.type}
            </span>
            {event.missionCritical && (
              <span className="flex items-center gap-0.5 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
                <Zap size={8} aria-hidden="true" /> Critical
              </span>
            )}
            {event.blastRadius > 0 && (
              <span className="text-[9px] text-gray-400 dark:text-slate-600">
                {event.blastRadius} workflows
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs font-medium leading-snug text-gray-800 dark:text-slate-200">{event.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-gray-400 dark:text-slate-500">{event.dueLabel}</span>
            {event.sourceWorkflow && (
              <button
                type="button"
                onClick={stopAndCall(() => onTrace?.(event))}
                className="flex items-center gap-0.5 text-[10px] text-aims-blue hover:underline"
                aria-label={`View trace for ${event.sourceWorkflow}`}
              >
                <GitBranch size={9} aria-hidden="true" /> Trace
              </button>
            )}
          </div>
        </div>

        {/* Right: time + chevron */}
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[10px] tabular-nums text-gray-400 dark:text-slate-600">
            {fmtMins(event.estimatedMinutes)}
          </span>
          <ChevronDown
            size={12}
            className={`text-gray-300 transition-transform dark:text-slate-600 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Expanded action panel */}
      {expanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2.5 dark:border-white/[0.06]" onClick={e => e.stopPropagation()}>
          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => onOpen?.(event)}
            className="btn-primary mb-2 w-full justify-center text-xs"
          >
            {event.quickActions?.primary ?? 'Open'}
          </button>
          {/* Secondary actions */}
          <div className="flex flex-wrap gap-1">
            {(event.quickActions?.secondary ?? []).map(action => {
              const Icon = SECONDARY_ICON[action]
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onOpen?.(event, action)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                >
                  {Icon && <Icon size={9} aria-hidden="true" />} {action}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => onEscalate?.(event)}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-500 hover:bg-red-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10"
            >
              <ArrowUpRight size={9} aria-hidden="true" /> Escalate
            </button>
            <button
              type="button"
              onClick={() => onSkip?.(event.id)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-400 hover:bg-gray-50 dark:border-white/10 dark:text-slate-500 dark:hover:bg-white/[0.04]"
            >
              <SkipForward size={9} aria-hidden="true" /> Skip
            </button>
            <button
              type="button"
              disabled
              title="Assign to team member — coming in V1.5"
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-400 opacity-40 dark:border-white/10 dark:text-slate-500"
            >
              <UserPlus size={9} aria-hidden="true" /> Assign
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
