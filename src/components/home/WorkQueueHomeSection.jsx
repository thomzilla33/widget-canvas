import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ListChecks, ArrowRight, CheckCircle2 } from 'lucide-react'
import { MY_WORK_EVENTS, WQ_TIER, WQ_TIER_ORDER } from '../../data/workqueue.js'
import { WQSectionFilterBar } from './WQSectionFilterBar.jsx'
import { EventCard } from './wq/EventCard.jsx'
import UndoToast from './UndoToast.jsx'

const MAX_PER_TIER = 5

export function WorkQueueHomeSection() {
  const navigate = useNavigate()
  const [filtered,   setFiltered]   = useState(MY_WORK_EVENTS)
  const [expandedId, setExpandedId] = useState(null)
  const [skipped,    setSkipped]    = useState(new Set())
  const [resolved,   setResolved]   = useState(new Set())
  const [toast,      setToast]      = useState(null)

  const visible = filtered.filter(e => !skipped.has(e.id) && !resolved.has(e.id))

  const urgentCount = MY_WORK_EVENTS.filter(
    e => !skipped.has(e.id) && !resolved.has(e.id) && ['actnow', 'critical'].includes(e.tier)
  ).length

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

  const grouped = WQ_TIER_ORDER
    .map(tier => ({ tier, items: visible.filter(e => e.tier === tier) }))
    .filter(g => g.items.length > 0)

  return (
    <>
      <div className="card flex flex-col overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 pt-5 pb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aims-blue/10 dark:bg-aims-blue/[0.15]">
            <ListChecks size={15} className="text-aims-blue" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Work Queue</h2>
              {urgentCount > 0 && (
                <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                  {urgentCount} urgent
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-500">
                {visible.length} items
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
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

        {/* ── Filter bar ───────────────────────────────────────────────────── */}
        <WQSectionFilterBar events={MY_WORK_EVENTS} onFilter={setFiltered} />

        {/* ── List ─────────────────────────────────────────────────────────── */}
        <div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <CheckCircle2 size={22} className="text-aims-governed" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-400 dark:text-slate-500">All clear</p>
              <p className="text-xs text-gray-300 dark:text-slate-700">Nothing matches the current filters.</p>
            </div>
          ) : (
            grouped.map(({ tier, items }) => {
              const t       = WQ_TIER[tier]
              const capped  = items.slice(0, MAX_PER_TIER)
              const overflow = items.length - capped.length
              return (
                <div key={tier}>
                  {/* Tier header */}
                  <div className={`flex items-center gap-2 border-l-2 bg-gray-50/60 px-5 py-2 dark:bg-white/[0.015] ${t.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${t.text}`}>{t.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-600">· {t.sub}</span>
                    <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${t.badge}`}>{items.length}</span>
                  </div>

                  {/* Event rows */}
                  <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {capped.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        expanded={expandedId === event.id}
                        onToggle={() => setExpandedId(prev => prev === event.id ? null : event.id)}
                        onOpen={() => navigate('/home/attention')}
                        onEscalate={() => navigate('/home/attention')}
                        onSkip={skip}
                        onTrace={() => {}}
                        onApprove={id => resolveItem(id, 'Approved')}
                        onReject={id  => resolveItem(id, 'Rejected')}
                        onCorrect={id => resolveItem(id, 'Correction submitted')}
                      />
                    ))}
                  </div>

                  {overflow > 0 && (
                    <div className="flex items-center justify-center border-t border-gray-50 py-2.5 dark:border-white/[0.03]">
                      <button
                        type="button"
                        onClick={() => navigate('/home/attention')}
                        className="text-[11px] text-aims-blue hover:underline"
                      >
                        +{overflow} more — see all in Work Queue
                      </button>
                    </div>
                  )}
                </div>
              )
            })
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
