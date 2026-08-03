import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, X, ArrowUp, ArrowUpRight, Clock, ListChecks } from 'lucide-react'
import { buildItems, rank, totalUrgent } from '../components/home/attention/attentionModel.js'
import { WQ_ACTIONABLE_STATES } from '../data/workqueue.js'
import { matchWQIntent, getWQItems, summarizeIntent } from '../utils/wqIntents.js'
import { AttentionQueue } from '../components/attention/AttentionQueue.jsx'
import { AttentionDetail } from '../components/attention/AttentionDetail.jsx'
import { getResolved, markResolved, unmarkResolved } from '../state/resolvedStore.js'
import UndoToast from '../components/home/UndoToast.jsx'
import { useScope, scopeAtLeast } from '../state/ScopeContext.jsx'

// ── PA query strip for the Work Queue list ────────────────────────────────────
const SEVERITY_DOT = {
  Blocking: 'bg-red-500',
  Standard: 'bg-aims-blue',
  Low:      'bg-gray-300 dark:bg-slate-600',
}

function PAQueryWidget({ onSelectItem }) {
  const [phase,  setPhase]  = useState('idle')   // idle | typing | result
  const [query,  setQuery]  = useState('')
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  function open() {
    setPhase('typing')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function dismiss() {
    setPhase('idle')
    setQuery('')
    setResult(null)
  }

  function submit() {
    const q = query.trim()
    if (!q) return
    const intent = matchWQIntent(q)
    const items   = intent ? getWQItems(intent) : []
    const summary = intent
      ? summarizeIntent(intent, items)
      : `No Work Queue results for "${q}". Try "critical tasks", "approvals", or "HTL items".`
    setResult({ items, summary, intent })
    setPhase('result')
  }

  if (phase === 'idle') {
    return (
      <div className="shrink-0 border-b border-gray-200/60 dark:border-white/[0.06] px-3 py-2">
        <button
          type="button"
          onClick={open}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:border-aims-blue/30 hover:bg-aims-blue/[0.04] hover:text-aims-blue dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-aims-blue/30 dark:hover:text-aims-blue"
        >
          <Sparkles size={11} className="text-aims-blue/70" aria-hidden="true" />
          Ask PA about this queue…
        </button>
      </div>
    )
  }

  if (phase === 'typing') {
    return (
      <div className="shrink-0 border-b border-gray-200/60 dark:border-white/[0.06] px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl border border-aims-blue/40 bg-white px-3 py-2 shadow-sm dark:border-aims-blue/30 dark:bg-white/[0.05]">
          <Sparkles size={11} className="shrink-0 text-aims-blue" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); submit() }
              if (e.key === 'Escape') dismiss()
            }}
            placeholder="e.g. critical tasks, pending approvals, HTL items…"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-gray-800 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!query.trim()}
            aria-label="Ask"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aims-blue text-white disabled:opacity-40"
          >
            <ArrowUp size={10} aria-hidden="true" />
          </button>
          <button type="button" onClick={dismiss} aria-label="Cancel" className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  // result phase
  const { items, summary } = result
  const shown    = items.slice(0, 3)
  const overflow = items.length - shown.length

  return (
    <div className="shrink-0 border-b border-gray-200/60 dark:border-white/[0.06] px-3 py-2.5 space-y-2">
      {/* Query chip + dismiss */}
      <div className="flex items-center gap-1.5">
        <Sparkles size={11} className="shrink-0 text-aims-blue" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-gray-500 dark:text-slate-400 italic">"{query}"</span>
        <button
          type="button"
          onClick={open}
          className="shrink-0 text-[10px] text-aims-blue hover:underline"
        >
          Edit
        </button>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
          <X size={12} aria-hidden="true" />
        </button>
      </div>

      {/* Result card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[var(--surface-raised)]">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-1.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <ListChecks size={11} className="shrink-0 text-aims-blue" aria-hidden="true" />
          <p className="flex-1 text-[11px] font-medium text-gray-700 dark:text-slate-200">{summary}</p>
        </div>
        {items.length === 0 ? (
          <p className="px-3 py-3 text-center text-[11px] text-gray-400 dark:text-slate-500">Nothing matched.</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {shown.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[item.severity] ?? SEVERITY_DOT.Standard}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-gray-800 dark:text-slate-100">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="rounded bg-gray-100 px-1 py-px text-[9px] font-semibold text-gray-500 dark:bg-white/[0.07] dark:text-slate-400">{item.wqType}</span>
                      {item.estimatedMinutes && (
                        <span className="flex items-center gap-0.5 text-[9px] text-gray-400 dark:text-slate-500">
                          <Clock size={8} aria-hidden="true" /> ~{item.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight size={10} className="shrink-0 text-gray-400" aria-hidden="true" />
                </button>
              ))}
            </div>
            {overflow > 0 && (
              <div className="border-t border-gray-100 px-3 py-1.5 dark:border-white/[0.06]">
                <span className="text-[10px] text-gray-400 dark:text-slate-500">+{overflow} more in queue</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

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
  const { scope } = useScope()
  const showPAStrip = scopeAtLeast(scope, 'v2')

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

  // D4: actionable count excludes Awaiting External
  const actionableItems  = allItems.filter(i => i._kind !== 'wq' || WQ_ACTIONABLE_STATES.has(i.status ?? 'Open'))
  const awaitingCount    = allItems.filter(i => i._kind === 'wq' && i.status === 'Awaiting External').length
  const urgent           = totalUrgent(allItems, read)

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
    <div className="flex h-full flex-col overflow-hidden bg-[var(--canvas)]">

      {/* Two-pane body — resizable, flush to top */}
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left pane */}
        <div
          className="flex h-full shrink-0 flex-col overflow-hidden"
          style={{ width: `${leftPct}%`, minWidth: 260, maxWidth: '65%' }}
        >
          {showPAStrip && <PAQueryWidget onSelectItem={item => handleSelect({ id: item.id })} />}
          <div className="min-h-0 flex-1 overflow-hidden">
            <AttentionQueue
              items={filteredItems}
              totalCount={actionableItems.length}
              awaitingCount={awaitingCount}
              urgent={urgent}
              onBack={() => navigate('/home')}
              selectedId={selectedItem?.id ?? null}
              onSelect={handleSelect}
              search={search}
              filterCat={filterCat}
              onSearch={setSearch}
              onFilterCat={setFilterCat}
              tabCounts={tabCounts}
            />
          </div>
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
        <div className="min-w-0 flex-1 overflow-hidden bg-white/[0.015] dark:bg-white/[0.015]">
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
