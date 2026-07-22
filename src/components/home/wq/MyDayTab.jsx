import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { ChevronDown, UserPlus, BellOff, MessageCircle, Brain, ArrowUpRight, ExternalLink } from 'lucide-react'
import { MY_DAY_QUEUE, MY_DAY_MANAGER_MSG } from '../../../data/home.js'
import { markResolved, unmarkResolved } from '../../../state/resolvedStore.js'
import UndoToast from '../UndoToast.jsx'

const TIER = {
  critical: {
    label: 'Critical',   sub: 'within 7 days',
    dot: 'bg-red-500',   text: 'text-red-500 dark:text-red-400',
    border: 'border-l-red-400/70',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  action: {
    label: 'Action',     sub: 'this week',
    dot: 'bg-amber-400', text: 'text-amber-500 dark:text-amber-400',
    border: 'border-l-amber-400/70',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  headsup: {
    label: 'Heads-up',   sub: 'on radar',
    dot: 'bg-slate-400', text: 'text-slate-400 dark:text-slate-500',
    border: 'border-l-slate-300/50 dark:border-l-white/10',
    badge: 'bg-gray-100 text-gray-500 dark:bg-white/[0.07] dark:text-slate-400',
  },
}

const TIER_ORDER = ['critical', 'action', 'headsup']

function fmtMins(m) {
  if (!m) return ''
  if (m < 60) return `~${m}m`
  const h = Math.floor(m / 60), rem = m % 60
  return rem ? `~${h}h ${rem}m` : `~${h}h`
}

function ManagerMessage({ msg }) {
  const [open, setOpen] = useState(true)
  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex w-full items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5 text-left text-[11px] text-gray-400 hover:bg-gray-50 dark:border-white/[0.06] dark:text-slate-500 dark:hover:bg-white/[0.03]"
    >
      <span className="h-4 w-4 shrink-0 rounded-full bg-aims-blue/20 text-center text-[9px] font-bold leading-4 text-aims-blue">P</span>
      Message from {msg.from} · {msg.time}
    </button>
  )
  return (
    <div className="rounded-lg border border-aims-blue/20 bg-aims-blue/[0.04] px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-aims-blue/20 text-[9px] font-bold text-aims-blue">P</span>
          <span className="text-[10px] font-semibold text-gray-700 dark:text-slate-300">{msg.from}</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">· {msg.time}</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-[10px] text-gray-400 hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-400">
          Hide
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-600 dark:text-slate-300">"{msg.msg || msg.message}"</p>
    </div>
  )
}

function ActionButtons({ item, includeTrain = false, onSnooze, onEscalate, onAsk, onReviewInFull }) {
  return (
    <div className="flex flex-wrap gap-1">
      {[
        { icon: UserPlus,      label: 'Assign',     onClick: undefined, tooltip: 'Assign to team member — coming in V1.5' },
        { icon: BellOff,       label: 'Snooze 24h', onClick: () => onSnooze(item.id) },
        { icon: MessageCircle, label: 'Ask',         onClick: onAsk },
        ...(includeTrain ? [{ icon: Brain, label: 'Train', onClick: undefined, tooltip: 'Train AI on this decision — coming in V1.5' }] : []),
        { icon: ArrowUpRight,  label: 'Escalate',   onClick: () => onEscalate(item), red: true },
      ].map(({ icon: Icon, label, onClick, red, tooltip }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={!onClick}
          title={tooltip}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors
            ${!onClick ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
            ${red
              ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05]'
            }`}
        >
          <Icon size={10} aria-hidden="true" /> {label}
        </button>
      ))}
      <button
        onClick={onReviewInFull}
        className="ml-auto inline-flex items-center gap-1 border-l border-gray-200 pl-3 text-[10px] text-aims-blue hover:underline dark:border-white/10"
      >
        <ExternalLink size={10} aria-hidden="true" /> Review in full
      </button>
    </div>
  )
}

function StartHereCard({ item, includeTrain = false, onApprove, onSnooze, onEscalate, onAsk, onReviewInFull }) {
  const t = TIER[item.tier]
  return (
    <div className={`rounded-xl border-l-[3px] bg-aims-blue/[0.04] px-3 py-3 ${t.border} border border-aims-blue/20`}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-aims-blue">Start here</span>
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${t.badge}`}>{t.label}</span>
      </div>
      <p className="mb-1 text-xs font-semibold text-gray-900 dark:text-slate-100">{item.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: item.studioColor }}>{item.studio}</span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">{item.type}</span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">·</span>
        <span className="text-[10px] text-gray-500 dark:text-slate-400">{item.dueLabel}</span>
      </div>
      <div className="mt-2.5 space-y-2">
        <button onClick={() => onApprove(item)} className="btn-primary w-full justify-center text-xs">
          {item.primaryAction}
        </button>
        <ActionButtons item={item} includeTrain={includeTrain} onSnooze={onSnooze} onEscalate={onEscalate} onAsk={onAsk} onReviewInFull={() => onReviewInFull(item)} />
      </div>
    </div>
  )
}

function QueueItem({ item, expanded, onToggle, onApprove, onSnooze, onEscalate, onAsk, onReviewInFull }) {
  const t = TIER[item.tier]
  return (
    <div
      className={`cursor-pointer rounded-lg border-l-[3px] px-3 py-2.5 transition-colors ${t.border} ${expanded ? 'bg-gray-50 dark:bg-white/[0.04]' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${t.dot}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">{item.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded px-1 py-0.5 text-[9px] font-bold text-white" style={{ background: item.studioColor }}>{item.studio}</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">{item.type}</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">·</span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400">{item.dueLabel}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {item.estimatedMinutes > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-slate-600">{fmtMins(item.estimatedMinutes)}</span>
          )}
          <ChevronDown size={12} className={`text-gray-300 transition-transform dark:text-slate-600 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </div>
      </div>

      {expanded && (
        <div className="mt-2.5 border-t border-gray-100 pt-2.5 dark:border-white/[0.06]" onClick={e => e.stopPropagation()}>
          <button onClick={() => onApprove(item)} className="btn-primary mb-2 w-full justify-center text-xs">
            {item.primaryAction}
          </button>
          <ActionButtons item={item} includeTrain onSnooze={onSnooze} onEscalate={onEscalate} onAsk={onAsk} onReviewInFull={() => onReviewInFull(item)} />
        </div>
      )}
    </div>
  )
}

export function MyDayTab({ onEscalate, onAsk }) {
  const navigate = useNavigate()
  const [snoozed,   setSnoozed]   = useState(new Set())
  const [resolved,  setResolved]  = useState(new Set())
  const [expandedId, setExpanded] = useState(null)
  const [toast,     setToast]     = useState(null)

  const active    = MY_DAY_QUEUE.filter(i => !snoozed.has(i.id) && !resolved.has(i.id))
  const startHere = active.find(i => i.startHere)
  const rest      = active.filter(i => !i.startHere)
  const grouped   = TIER_ORDER
    .map(tier => ({ tier, items: rest.filter(i => i.tier === tier) }))
    .filter(g => g.items.length > 0)

  function snooze(id) {
    setSnoozed(prev => new Set([...prev, id]))
    if (expandedId === id) setExpanded(null)
    setToast({
      message: 'Snoozed for 24h.',
      undo: () => setSnoozed(prev => { const n = new Set(prev); n.delete(id); return n }),
    })
    setTimeout(() => setToast(null), 4000)
  }

  function approve(item) {
    setResolved(prev => new Set([...prev, item.id]))
    markResolved(item.id)
    if (expandedId === item.id) setExpanded(null)
    setToast({
      message: `"${item.title.slice(0, 40)}" marked done.`,
      undo: () => {
        setResolved(prev => { const n = new Set(prev); n.delete(item.id); return n })
        unmarkResolved(item.id)
      },
    })
    setTimeout(() => setToast(null), 4000)
  }

  function reviewInFull(item) {
    navigate('/home/attention', { state: { selectId: item.id } })
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
        <ManagerMessage msg={MY_DAY_MANAGER_MSG} />

        {startHere && (
          <StartHereCard
            item={startHere}
            includeTrain
            onApprove={approve}
            onSnooze={snooze}
            onEscalate={onEscalate}
            onAsk={onAsk}
            onReviewInFull={reviewInFull}
          />
        )}

        {grouped.map(({ tier, items }) => {
          const t = TIER[tier]
          return (
            <div key={tier}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
                <span className={`text-[10px] font-bold uppercase tracking-wide ${t.text}`}>{t.label}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-600">· {t.sub}</span>
                <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${t.badge}`}>{items.length}</span>
              </div>
              <div className="space-y-1">
                {items.map(item => (
                  <QueueItem
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() => setExpanded(prev => prev === item.id ? null : item.id)}
                    onApprove={approve}
                    onSnooze={snooze}
                    onEscalate={onEscalate}
                    onAsk={onAsk}
                    onReviewInFull={reviewInFull}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {active.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400">All clear for today</p>
          </div>
        )}
      </div>

      {toast && createPortal(
        <UndoToast
          message={toast.message}
          onUndo={() => { toast.undo(); setToast(null) }}
          onClose={() => setToast(null)}
        />,
        document.body,
      )}
    </>
  )
}
