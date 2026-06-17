import { useState } from 'react'
import { Hand, Sparkles, Workflow, RefreshCw, ArrowUpRight, CheckCircle2, X } from 'lucide-react'
import { HTL_ITEMS } from '../../data/mock.js'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { useFeedback } from '../../state/FeedbackContext.jsx'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import RepinModal from '../widgets/RepinModal.jsx'
import CardHeader from './CardHeader.jsx'

const SOURCE = {
  Agent: { icon: Sparkles, cls: 'bg-purple-500/10 text-purple-500 dark:text-purple-300' },
  Workflow: { icon: Workflow, cls: 'bg-aims-blue/10 text-aims-blue' },
  System: { icon: RefreshCw, cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' },
  Escalation: { icon: ArrowUpRight, cls: 'bg-red-500/10 text-aims-stale' },
}
const PRIORITY = {
  high: 'border-red-300 text-aims-stale dark:border-red-500/30',
  med: 'border-amber-300 text-aims-ungoverned dark:border-amber-500/30',
  low: 'border-gray-300 text-gray-500 dark:border-white/15 dark:text-slate-400',
}
const ACTION_BLURB = {
  Approve: 'Approving lets the agent or workflow proceed with this action on your behalf.',
  Review: 'Review the details below, then resolve the item.',
  Take: 'You’ll be assigned as the owner and the item leaves the queue.',
  Assign: 'Hand this off to a teammate to action.',
}

// Human Touch Layer — the human-in-the-loop queue. Each item opens a real flow:
// schema-drift opens RepinModal, everything else opens a generic decision modal.
export default function HtlCard() {
  const { widgets } = useWidgets()
  const { flags, resolveFlag } = useFeedback()
  const [resolved, setResolved] = useState(new Set())
  const [active, setActive] = useState(null) // item being acted on (opens a flow)

  // U7.3 — feedback/escalations raised on the UCP route into this unified queue.
  const flagItems = flags
    .filter((f) => f.status === 'open')
    .map((f) => ({
      id: f.id,
      _flag: true,
      source: 'Escalation',
      title: `Flag: ${widgets.find((w) => w.id === f.widgetId)?.name || f.widgetName || 'a widget'}`,
      detail: f.details || f.reason || 'A user flagged this widget for review.',
      priority: 'med',
      when: f.when || 'just now',
      action: 'Review',
    }))
  const pending = [...flagItems, ...HTL_ITEMS.filter((i) => !resolved.has(i.id))]
  // Resolve through the right store: context-backed flags vs local HTL items.
  const resolve = (item) => (item._flag ? resolveFlag(item.id) : setResolved((s) => new Set(s).add(item.id)))
  return (
    <div className="card p-4">
      <CardHeader icon={Hand} title="Human Touch Layer" count={pending.length} sub="Agents, workflows & escalations waiting on you" />
      {pending.length === 0 ? (
        <div className="mt-3 grid place-items-center rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-white/10">
          <CheckCircle2 size={22} className="text-aims-governed" />
          <div className="mt-1 text-sm font-medium text-gray-700 dark:text-slate-200">All caught up</div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400">Nothing needs your attention right now.</div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {pending.map((item) => {
            const s = SOURCE[item.source] || SOURCE.System
            const Icon = s.icon
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-white/10">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${s.cls}`}>
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.title}</span>
                    <span className={`rounded-md border px-1.5 text-[10px] font-bold uppercase leading-[15px] ${PRIORITY[item.priority]}`}>{item.priority}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{item.detail}</div>
                  <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{item.source} · {item.when}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => setActive(item)}>{item.action}</button>
                  <button
                    onClick={() => resolve(item)}
                    title="Dismiss"
                    aria-label="Dismiss"
                    className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {active && active.flow === 'repin' && (
        <RepinModal
          widget={widgets.find((w) => w.id === active.widgetId) || { id: active.widgetId, name: active.title }}
          onClose={() => setActive(null)}
          onComplete={() => resolve(active)}
        />
      )}
      {active && active.flow !== 'repin' && (
        <HtlActionModal
          item={active}
          onAct={() => {
            resolve(active)
            setActive(null)
          }}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function HtlActionModal({ item, onAct, onClose }) {
  const s = SOURCE[item.source] || SOURCE.System
  const Icon = s.icon
  const dialogRef = useFocusTrap()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialogRef} tabIndex={-1} className="card relative z-10 w-[460px] max-w-full overflow-hidden p-0 outline-none">
        <div className="flex items-start gap-3 border-b border-gray-200 p-5 dark:border-white/10">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${s.cls}`}>
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.title}</span>
              <span className={`rounded-md border px-1.5 text-[10px] font-bold uppercase leading-[15px] ${PRIORITY[item.priority]}`}>{item.priority}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400">{item.source} · {item.when}</div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 dark:text-slate-200">{item.detail}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">{ACTION_BLURB[item.action] || 'Resolve this item.'}</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <button className="btn-secondary" onClick={onClose}>Not now</button>
          <button className="btn-primary" onClick={onAct}>{item.action}</button>
        </div>
      </div>
    </div>
  )
}
