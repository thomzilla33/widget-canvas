import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MY_WORK_EVENTS, WQ_TYPE } from '../../../data/workqueue.js'
import { EventCard } from './EventCard.jsx'
import UndoToast from '../UndoToast.jsx'

const MAX_VISIBLE = 5

export function MyWorkTab({ onOpen, onEscalate, onTrace }) {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)
  const [skipped, setSkipped] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [resolved, setResolved] = useState(new Set())

  const visible = MY_WORK_EVENTS.filter(e => !skipped.has(e.id) && !resolved.has(e.id))
  // Sort by urgencyScore (time-to-consequence asc), then cap
  const sorted = [...visible].sort((a, b) => a.urgencyScore - b.urgencyScore)
  const capped = sorted.slice(0, MAX_VISIBLE)
  const overflow = visible.length - capped.length

  function skip(id) {
    setSkipped(prev => new Set([...prev, id]))
    if (expandedId === id) setExpandedId(null)
    setToast({
      message: 'Skipped for this session.',
      undo: () => setSkipped(prev => { const n = new Set(prev); n.delete(id); return n }),
    })
    setTimeout(() => setToast(null), 4000)
  }

  function resolveItem(id, actionLabel) {
    setResolved(prev => new Set([...prev, id]))
    if (expandedId === id) setExpandedId(null)
    setToast({
      message: `${actionLabel} — item moved to Done.`,
      undo: () => {
        setResolved(prev => { const n = new Set(prev); n.delete(id); return n })
        setToast(null)
      },
    })
    setTimeout(() => setToast(null), 5000)
  }

  function toggle(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Group by wqType; items are already sorted by urgencyScore (pre-cap sort above).
  // Order groups by their minimum urgencyScore (most urgent group first).
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 size={20} className="text-aims-governed" aria-hidden="true" />
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">All clear — nothing here.</p>
            </div>
          ) : (
            <>
              {grouped.map(({ wqType, items }) => {
                const meta = WQ_TYPE[wqType] ?? { archetype: '' }
                const blockingCount = items.filter(e => e.severity === 'Blocking').length
                const totalInType = visible.filter(e => e.wqType === wqType).length
                return (
                  <div key={wqType}>
                    {/* Type group header */}
                    <div className={`flex items-center gap-1.5 border-l-2 py-1.5 pl-3 pr-4 ${
                      blockingCount > 0
                        ? 'border-l-red-400 bg-red-500/[0.04] dark:border-l-red-400/70 dark:bg-red-400/[0.06]'
                        : 'border-l-gray-200 bg-gray-50/60 dark:border-l-white/10 dark:bg-white/[0.02]'
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        blockingCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-slate-300'
                      }`}>{wqType}</span>
                      {meta.archetype && (
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">· {meta.archetype}</span>
                      )}
                      <span className="ml-auto rounded-full bg-gray-200/80 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 dark:bg-white/[0.08] dark:text-slate-400">
                        {totalInType}
                      </span>
                      {blockingCount > 0 && (
                        <span className="flex items-center gap-0.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-400/25 dark:text-red-400">
                          <Zap size={8} aria-hidden="true" />{blockingCount} blocking
                        </span>
                      )}
                    </div>
                    {/* Events in this group */}
                    <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {items.map(event => (
                        <EventCard
                          key={event.id}
                          event={event}
                          expanded={expandedId === event.id}
                          onToggle={() => toggle(event.id)}
                          onOpen={onOpen}
                          onEscalate={onEscalate}
                          onSkip={skip}
                          onTrace={onTrace}
                          onApprove={(id) => resolveItem(id, 'Approved')}
                          onReject={(id)  => resolveItem(id, 'Rejected')}
                          onCorrect={(id) => resolveItem(id, 'Correction submitted')}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
              {overflow > 0 && (
                <div className="flex items-center justify-center border-t border-gray-100 py-2.5 dark:border-white/[0.05]">
                  <span className="text-[11px] text-gray-400 dark:text-slate-400">
                    +{overflow} more · <button type="button" className="text-aims-blue hover:underline" onClick={() => navigate('/home/attention')}>Go to Work Queue</button>
                  </span>
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
