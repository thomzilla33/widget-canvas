import { useState } from 'react'
import {
  GitBranch, Zap, ChevronDown, UserPlus, ArrowUpRight, Clock,
} from 'lucide-react'
import { WQ_SEVERITY } from '../../../data/workqueue.js'
import { useRole } from '../../../state/RoleContext.jsx'

const STATUS_CHIP = {
  'Claimed':           'bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400',
  'In Progress':       'bg-aims-blue/10 text-aims-blue dark:bg-aims-blue/[0.12]',
  'Awaiting External': 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-slate-400',
}

function fmtMins(m) {
  return m < 60 ? `~${m}m` : `~${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`
}

// ── D6: Snooze time-picker dropdown ──────────────────────────────────────────
const SNOOZE_OPTIONS = [
  { label: 'In 1 hour' },
  { label: 'In 4 hours' },
  { label: 'Tonight 9 PM' },
  { label: 'Tomorrow 9 AM' },
]

function SnoozeDropdown({ onSnooze }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05]"
      >
        <Clock size={9} aria-hidden="true" /> Snooze
        <ChevronDown size={7} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-1 min-w-[132px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[var(--surface-raised)]">
          {SNOOZE_OPTIONS.map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={() => { onSnooze(opt); setOpen(false) }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── EventCard ─────────────────────────────────────────────────────────────────
export function EventCard({ event, expanded, onToggle, onOpen, onEscalate, onSkip, onTrace }) {
  const s = WQ_SEVERITY[event.severity] ?? WQ_SEVERITY.Standard
  const { isAdmin } = useRole()

  function stopAndCall(fn) {
    return (e) => { e.stopPropagation(); fn?.() }
  }

  return (
    <div
      className={`cursor-pointer border-l-[3px] transition-colors ${s.border} ${
        expanded ? s.expanded : s.rowBg
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
            <span className="rounded-full border border-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-gray-500 dark:border-white/10 dark:text-slate-400">
              {event.wqType}
            </span>
            {STATUS_CHIP[event.status] && (
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_CHIP[event.status]}`}>
                {event.status === 'Awaiting External' ? 'Awaiting' : event.status}
              </span>
            )}
            {event.severity === 'Blocking' && (
              <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${s.chip}`}>
                <Zap size={8} aria-hidden="true" /> Blocking
              </span>
            )}
            {event.customer && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/[0.07] dark:text-blue-400">
                Customer
              </span>
            )}
            {event.blastRadius > 0 && (
              <span className="text-[9px] text-gray-400 dark:text-slate-400">
                {event.blastRadius} workflows
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs font-medium leading-snug text-gray-800 dark:text-slate-200">{event.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-gray-400 dark:text-slate-400">{event.dueLabel}</span>
            {/* Trace link — Admin role only */}
            {isAdmin && event.sourceWorkflow && (
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
          <span className="text-[10px] tabular-nums text-gray-400 dark:text-slate-400">
            {fmtMins(event.estimatedMinutes)}
          </span>
          <ChevronDown
            size={12}
            className={`text-gray-300 transition-transform dark:text-slate-400 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* D6: Routing zone — type-invariant, reversible routing verbs only */}
      {expanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2.5 dark:border-white/[0.06]" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpen?.(event)}
            className="btn-primary mb-2 w-full justify-center text-xs"
          >
            Open <ArrowUpRight size={10} aria-hidden="true" className="ml-0.5" />
          </button>
          <div className="flex flex-wrap gap-1">
            <SnoozeDropdown onSnooze={(opt) => onSkip?.(event.id, opt)} />
            <button
              type="button"
              onClick={() => onEscalate?.(event)}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-500 hover:bg-red-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10"
            >
              <ArrowUpRight size={9} aria-hidden="true" /> Escalate
            </button>
            <button
              type="button"
              disabled
              title="Reassign to team member — coming in V1.5"
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-400 opacity-40 dark:border-white/10 dark:text-slate-400"
            >
              <UserPlus size={9} aria-hidden="true" /> Reassign
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
