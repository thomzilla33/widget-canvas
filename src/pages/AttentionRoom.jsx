import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { buildItems, rank, totalUrgent } from '../components/home/attention/attentionModel.js'
import { AttentionQueue } from '../components/attention/AttentionQueue.jsx'
import { AttentionDetail } from '../components/attention/AttentionDetail.jsx'
import { getResolved, markResolved, unmarkResolved } from '../state/resolvedStore.js'
import UndoToast from '../components/home/UndoToast.jsx'

const FILTER_TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'approvals', label: 'Approvals' },
  { id: 'work',      label: 'Work'      },
  { id: 'tasks',     label: 'Tasks'     },
  { id: 'messages',  label: 'Messages'  },
]

export default function AttentionRoom() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [done,      setDone]      = useState(() => getResolved())
  const [declined,  setDeclined]  = useState(new Set())
  const [archived,  setArchived]  = useState(new Set())
  const [read,      setRead]      = useState(new Set())
  const [selected,  setSelected]  = useState(
    location.state?.selectId ? { id: location.state.selectId } : null,
  )
  const [toast,     setToast]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('all')

  // ── Resizable split pane ─────────────────────────────────────────────────
  const [leftPct,    setLeftPct]   = useState(40)
  const containerRef               = useRef(null)
  const isDragging                 = useRef(false)

  const startDrag = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor      = 'col-resize'
    document.body.style.userSelect  = 'none'
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct  = ((e.clientX - rect.left) / rect.width) * 100
    setLeftPct(Math.min(65, Math.max(22, pct)))
  }, [])

  const stopDrag = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current              = false
    document.body.style.cursor      = ''
    document.body.style.userSelect  = ''
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   stopDrag)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   stopDrag)
    }
  }, [onMouseMove, stopDrag])

  const allItems = useMemo(
    () => buildItems({ done, declined, archived }).slice().sort((a, b) => rank(a) - rank(b)),
    [done, declined, archived],
  )

  const tabCounts = useMemo(() => ({
    all:       allItems.length,
    approvals: allItems.filter(i => i._cat === 'approvals').length,
    work:      allItems.filter(i => i._cat === 'work').length,
    tasks:     allItems.filter(i => i._cat === 'tasks').length,
    messages:  allItems.filter(i => i._cat === 'messages').length,
  }), [allItems])

  const filteredItems = useMemo(() => {
    let items = allItems
    if (filterCat !== 'all') items = items.filter(i => i._cat === filterCat)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter(i =>
        (i.title ?? i.subject ?? '').toLowerCase().includes(q) ||
        (i.studio ?? '').toLowerCase().includes(q) ||
        (i.type ?? '').toLowerCase().includes(q) ||
        (i.from ?? '').toLowerCase().includes(q),
      )
    }
    return items
  }, [allItems, search, filterCat])

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

      {/* ── Page Header — title + subline only ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#0d1117] px-5 pt-4 pb-3.5">
        <button
          type="button"
          onClick={() => navigate('/home')}
          aria-label="Back to Home"
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-[var(--muted-foreground)] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1
            className="text-[18px] font-semibold leading-tight text-[var(--foreground)]"
            style={{ letterSpacing: '0.25px' }}
          >
            Work Queue
          </h1>
          <p className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
            {allItems.length === 0 ? 'All clear' : `${allItems.length} items in queue`}
            {urgent > 0 && (
              <span className="rounded-full bg-red-500/10 px-1.5 py-[1px] text-[10px] font-bold text-red-600 dark:text-red-400">
                {urgent} urgent
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Two-pane body — resizable */}
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left pane */}
        <div
          className="flex h-full shrink-0 flex-col overflow-hidden border-r border-gray-200 dark:border-white/[0.10]"
          style={{ width: `${leftPct}%`, minWidth: 260, maxWidth: '65%' }}
        >
          <AttentionQueue
            items={filteredItems}
            totalCount={allItems.length}
            selectedId={selectedItem?.id ?? null}
            onSelect={handleSelect}
            search={search}
            filterCat={filterCat}
            onSearch={setSearch}
            onFilterCat={setFilterCat}
            tabCounts={tabCounts}
          />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={startDrag}
          className="group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center"
          title="Drag to resize"
        >
          <div className="h-10 w-[3px] rounded-full bg-gray-300/0 transition-all duration-150 group-hover:bg-gray-300 dark:group-hover:bg-white/20" />
        </div>

        {/* Right pane */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <AttentionDetail
            item={selectedItem}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onComplete={handleComplete}
            onDismiss={handleDismiss}
          />
        </div>

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
