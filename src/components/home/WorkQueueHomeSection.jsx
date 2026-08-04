import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ListChecks, ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import { MY_WORK_EVENTS, WQ_TYPE, WQ_SEVERITY, WQ_ACTIONABLE_STATES } from '../../data/workqueue.js'
import { EventCard } from './wq/EventCard.jsx'
import UndoToast from './UndoToast.jsx'

const MAX_TOTAL = 5

export function WorkQueueHomeSection() {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)
  const [skipped,    setSkipped]    = useState(new Set())
  const [resolved,   setResolved]   = useState(new Set())
  const [toast,      setToast]      = useState(null)

  const visible = MY_WORK_EVENTS.filter(e => !skipped.has(e.id) && !resolved.has(e.id))

  // D4: actionable = Open + Claimed + In Progress; Awaiting External excluded from headline
  const isActionable  = e => WQ_ACTIONABLE_STATES.has(e.status ?? 'Open')
  const actionableCount = visible.filter(isActionable).length
  const awaitingCount   = visible.filter(e => e.status === 'Awaiting External').length
  const urgentCount     = visible.filter(e => isActionable(e) && e.severity === 'Blocking').length

  function showToast(msg, undo) {
    setToast({ message: msg, undo })
    setTimeout(() => setToast(null), 5000)
  }

  function skip(id) {
    setSkipped(prev => new Set([...prev, id]))
    if (expandedId === id) setExpandedId(null)
    showToast('Skipped for this session.', () =>
      setSkipped(prev => { const n = new Set(prev); n.delete(id); return n })
    )
  }

  function resolveItem(id, label) {
    setResolved(prev => new Set([...prev, id]))
    if (expandedId === id) setExpandedId(null)
    showToast(`${label} — item moved to Done.`, () => {
      setResolved(prev => { const n = new Set(prev); n.delete(id); return n })
      setToast(null)
    })
  }

  const sorted   = [...visible].sort((a, b) => a.urgencyScore - b.urgencyScore)
  const capped   = sorted.slice(0, MAX_TOTAL)
  const overflow = visible.length - capped.length

  const typeMap = {}
  capped.forEach(e => {
    if (!typeMap[e.wqType]) typeMap[e.wqType] = []
    typeMap[e.wqType].push(e)
  })
  const grouped = Object.entries(typeMap)
    .map(([wqType, items]) => ({ wqType, items, minScore: items[0].urgencyScore }))
    .sort((a, b) => a.minScore - b.minScore)

  return (
    <>
      <div className="flex flex-col overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 pt-5 pb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aims-blue/10 dark:bg-aims-blue/[0.15]">
            <ListChecks size={15} className="text-aims-blue" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">My Work</h2>
              {urgentCount > 0 && (
                <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                  {urgentCount} urgent
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">
                {actionableCount} actionable
              </span>
              {awaitingCount > 0 && (
                <span className="rounded-full bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:bg-white/[0.03] dark:text-slate-500">
                  {awaitingCount} awaiting
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-400">
              Decisions and actions that need your attention — approvals, agent reviews, questions, and tasks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home/attention')}
            className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-aims-blue transition-colors hover:bg-aims-blue/[0.06] dark:hover:bg-aims-blue/10"
          >
            See all <ArrowRight size={12} />
          </button>
        </div>

        {/* ── List ─────────────────────────────────────────────────────────── */}
        <div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <CheckCircle2 size={22} className="text-aims-governed" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-400 dark:text-slate-400">All clear</p>
              <p className="text-xs text-gray-300 dark:text-slate-500">No pending items right now.</p>
            </div>
          ) : (
            <>
              {grouped.map(({ wqType, items }) => {
                const blockingCount = items.filter(e => e.severity === 'Blocking').length
                return (
                  <div key={wqType}>
                    <div className={`flex items-center gap-2 border-l-2 bg-gray-50/60 px-5 py-2 dark:bg-white/[0.015] ${blockingCount > 0 ? 'border-l-red-400' : 'border-l-gray-200 dark:border-l-white/[0.08]'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">{wqType}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400">· {WQ_TYPE[wqType]?.archetype}</span>
                      {blockingCount > 0 && (
                        <span className="flex items-center gap-0.5 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
                          <Zap size={8} aria-hidden="true" /> {blockingCount}
                        </span>
                      )}
                      <span className="ml-auto rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">{items.length}</span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                      {items.map(event => (
                        <EventCard
                          key={event.id}
                          event={event}
                          expanded={expandedId === event.id}
                          onToggle={() => setExpandedId(prev => prev === event.id ? null : event.id)}
                          onOpen={() => navigate('/home/attention')}
                          onEscalate={() => navigate('/home/attention')}
                          onSkip={skip}
                          onTrace={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
              {overflow > 0 && (
                <div className="flex items-center justify-center border-t border-gray-50 py-2.5 dark:border-white/[0.03]">
                  <button
                    type="button"
                    onClick={() => navigate('/home/attention')}
                    className="text-[11px] text-aims-blue hover:underline"
                  >
                    +{overflow} more · Go to Work Queue
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && createPortal(
        <UndoToast
          message={toast.message}
          onUndo={toast.undo ? () => { toast.undo(); setToast(null) } : undefined}
          onClose={() => setToast(null)}
        />,
        document.body,
      )}
    </>
  )
}
