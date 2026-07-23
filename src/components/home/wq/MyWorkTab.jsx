import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2 } from 'lucide-react'
import { MY_WORK_EVENTS, WQ_TIER, WQ_TIER_ORDER } from '../../../data/workqueue.js'
import { EventCard } from './EventCard.jsx'
import { FilterBar } from './FilterBar.jsx'
import UndoToast from '../UndoToast.jsx'

const MAX_VISIBLE = 7

export function MyWorkTab({ onOpen, onEscalate, onTrace }) {
  const [filtered, setFiltered] = useState(MY_WORK_EVENTS)
  const [expandedId, setExpandedId] = useState(null)
  const [skipped, setSkipped] = useState(new Set())
  const [toast, setToast] = useState(null)

  const visible = filtered.filter(e => !skipped.has(e.id))
  const capped = visible.slice(0, MAX_VISIBLE)
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

  function toggle(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const grouped = WQ_TIER_ORDER
    .map(tier => ({ tier, items: capped.filter(e => e.tier === tier) }))
    .filter(g => g.items.length > 0)

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <FilterBar events={MY_WORK_EVENTS} onFilter={setFiltered} />

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 size={20} className="text-aims-governed" aria-hidden="true" />
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">All clear — nothing here.</p>
            </div>
          ) : (
            <>
              {grouped.map(({ tier, items }) => {
                const t = WQ_TIER[tier]
                return (
                  <div key={tier}>
                    <div className={`flex items-center gap-1.5 border-l-2 bg-gray-50/60 py-1.5 pl-3 pr-4 dark:bg-white/[0.02] ${t.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${t.text}`}>{t.label}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-600">· {t.sub}</span>
                      <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${t.badge}`}>{visible.filter(e => e.tier === tier).length}</span>
                    </div>
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
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
              {overflow > 0 && (
                <div className="flex items-center justify-center border-t border-gray-100 py-2.5 dark:border-white/[0.05]">
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">
                    +{overflow} more · <a href="#" className="text-aims-blue hover:underline" onClick={e => e.preventDefault()}>See all in Attention Room</a>
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
