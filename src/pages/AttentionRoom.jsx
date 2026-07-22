import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ScanEye, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { buildItems, rank, totalUrgent } from '../components/home/attention/attentionModel.js'
import { AttentionQueue } from '../components/attention/AttentionQueue.jsx'
import { AttentionDetail } from '../components/attention/AttentionDetail.jsx'
import { getResolved, markResolved, unmarkResolved } from '../state/resolvedStore.js'
import UndoToast from '../components/home/UndoToast.jsx'

export default function AttentionRoom() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Pre-resolve any wq items already actioned from Today's Focus
  const [done,     setDone]     = useState(() => getResolved())
  const [declined, setDeclined] = useState(new Set())
  const [archived, setArchived] = useState(new Set())
  const [read,     setRead]     = useState(new Set())
  // Deep-link: /home/attention navigated from Today's Focus "Review in full" passes selectId
  const [selected, setSelected] = useState(
    location.state?.selectId ? { id: location.state.selectId } : null,
  )
  const [toast,    setToast]    = useState(null)

  const allItems = useMemo(
    () => buildItems({ done, declined, archived }).slice().sort((a, b) => rank(a) - rank(b)),
    [done, declined, archived],
  )

  const urgent = totalUrgent(allItems, read)

  function showToast(message, undo) {
    setToast({ message, undo })
    setTimeout(() => setToast(null), 4000)
  }

  function handleSelect(item) {
    if (item._kind === 'inbox') setRead(p => new Set([...p, item.id]))
    setSelected(item)
  }

  function handleApprove(item) {
    setDone(p => new Set([...p, item.id]))
    if (item._kind === 'wq') markResolved(item.id)
    setSelected(null)
    showToast(
      `Approved: "${(item.title ?? item.subject ?? '').slice(0, 40)}".`,
      () => {
        setDone(p => { const n = new Set(p); n.delete(item.id); return n })
        if (item._kind === 'wq') unmarkResolved(item.id)
      },
    )
  }

  function handleDecline(item) {
    setDeclined(p => new Set([...p, item.id]))
    setSelected(null)
    const msg = item._kind === 'gov'   ? 'Escalated.'
              : item._kind === 'task'  ? 'Skipped.'
              : item._kind === 'inbox' ? 'Dismissed.'
              : item.status === 'error'? 'Dismissed.'
              : 'Declined.'
    showToast(msg, () =>
      setDeclined(p => { const n = new Set(p); n.delete(item.id); return n }),
    )
  }

  function handleComplete(item) {
    // inbox items are filtered via archived; tasks/gov/htl use done
    const isInbox = item._kind === 'inbox'
    if (isInbox) {
      setArchived(p => new Set([...p, item.id]))
    } else {
      setDone(p => new Set([...p, item.id]))
    }
    setSelected(null)
    const msg = item.status === 'error' ? 'Retried.' : 'Done.'
    showToast(msg, () => {
      if (isInbox) {
        setArchived(p => { const n = new Set(p); n.delete(item.id); return n })
      } else {
        setDone(p => { const n = new Set(p); n.delete(item.id); return n })
      }
    })
  }

  function handleDismiss(item) {
    setArchived(p => new Set([...p, item.id]))
    setSelected(null)
    showToast('Dismissed.', () =>
      setArchived(p => { const n = new Set(p); n.delete(item.id); return n }),
    )
  }

  // Keep selectedItem live — cleared when it gets resolved
  const selectedItem = allItems.find(i => i.id === selected?.id) ?? null

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0d1117]">

      {/* Page header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 dark:border-white/[0.07] px-5 py-3">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-600 dark:hover:bg-white/[0.04] dark:hover:text-slate-400"
          aria-label="Back to Home"
        >
          <ArrowLeft size={13} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <ScanEye size={14} className="text-aims-blue" aria-hidden="true" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Attention Room</h1>
          {urgent > 0 && (
            <span className="rounded-full bg-aims-blue/10 px-1.5 py-0.5 text-[10px] font-bold text-aims-blue">
              {urgent}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-600">
          <CheckCircle2 size={11} aria-hidden="true" />
          <span>
            {allItems.length === 0
              ? 'All clear'
              : `${allItems.length} item${allItems.length !== 1 ? 's' : ''} need your attention`}
          </span>
        </div>
      </div>

      {/* Two-pane body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AttentionQueue
          items={allItems}
          selectedId={selectedItem?.id ?? null}
          onSelect={handleSelect}
        />
        <AttentionDetail
          item={selectedItem}
          onApprove={handleApprove}
          onDecline={handleDecline}
          onComplete={handleComplete}
          onDismiss={handleDismiss}
        />
      </div>

      {toast && (
        <UndoToast
          message={toast.message}
          onUndo={toast.undo ? () => { toast.undo(); setToast(null) } : undefined}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
