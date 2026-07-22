import { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ListChecks, CheckCircle2, Pin, ChevronRight } from 'lucide-react'
import { useScope, scopeAtLeast } from '../../state/ScopeContext.jsx'
import { CardHeader }  from './CardHeader.jsx'
import UndoToast       from './UndoToast.jsx'
import { buildItems, rank, counts, totalUrgent, workflowSources } from './attention/attentionModel.js'
import { GovEventRow, ErrorRow, ApprovalRow, InboxActionRow, InboxRow, TaskRow } from './attention/AttentionRows.jsx'
import { AttentionModal } from './attention/AttentionModal.jsx'

const TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'tasks',     label: 'Tasks'     },
  { id: 'messages',  label: 'Messages'  },
  { id: 'approvals', label: 'Approvals' },
]

const WF_SOURCES = workflowSources()
const ROW_LIMIT  = 8

function groupItems(items) {
  const overdue = []
  const today   = []
  const next    = []
  for (const item of items) {
    if (
      (item._kind === 'task' && item.due === 'Overdue') ||
      item.status === 'error' ||
      (item._kind === 'gov' && item.blocking)
    ) {
      overdue.push(item)
    } else if (
      (item._kind === 'task' && item.due === 'Today') ||
      item._kind === 'htl' ||
      (item._kind === 'gov' && !item.blocking) ||
      (item._kind === 'inbox' && item.unread && item.action)
    ) {
      today.push(item)
    } else {
      next.push(item)
    }
  }
  return [
    { id: 'overdue', label: 'Overdue', color: 'text-red-500 dark:text-red-400',     items: overdue },
    { id: 'today',   label: 'Today',   color: 'text-amber-500 dark:text-amber-400', items: today  },
    { id: 'next',    label: 'Next',    color: 'text-gray-400 dark:text-slate-500',  items: next   },
  ].filter(g => g.items.length > 0)
}

export function MyAttentionCard() {
  const { scope } = useScope()
  const crossLinksEnabled = scopeAtLeast(scope, 'v1.5')
  const bulkEnabled       = scopeAtLeast(scope, 'v2')

  const [tab,      setTab]      = useState('all')
  const [done,     setDone]     = useState(new Set())
  const [declined, setDeclined] = useState(new Set())
  const [read,     setRead]     = useState(new Set())
  const [archived, setArchived] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [showAll,  setShowAll]  = useState(false)
  const [toast,           setToast]           = useState(null)
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())

  const listRef = useRef(null)

  // Stagger rows in on initial mount and on every tab switch.
  // Depends only on `tab` so item removal never re-triggers the animation.
  // Uses autoAlpha + y (compositor-only: opacity + transform) per gsap-performance.
  useLayoutEffect(() => {
    if (!listRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const rows = Array.from(listRef.current.children)
      if (!rows.length) return
      gsap.fromTo(rows,
        { autoAlpha: 0, y: 7 },
        { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out',
          clearProps: 'transform,opacity,visibility', delay: 0.15 },
      )
    }, listRef)
    return () => ctx.revert()
  }, [tab])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function toggleGroup(id) {
    setCollapsedGroups(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  // ── Derived data ────────────────────────────────────────────────────────────

  const allItems  = buildItems({ done, declined, archived })
  const tabCounts = counts(allItems, read)
  const urgent    = totalUrgent(allItems, read)

  const sorted   = allItems.slice().sort((a, b) => rank(a) - rank(b))
  const filtered = tab === 'all'
    ? sorted
    : allItems.filter(i => i._cat === tab)
  const groups    = tab === 'all' ? groupItems(sorted) : null
  const display   = showAll ? filtered : filtered.slice(0, ROW_LIMIT)
  const remaining = filtered.length - display.length

  // ── Toast helper ────────────────────────────────────────────────────────────

  function showToast(message, undo) {
    setToast({ message, undo })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Action handlers ─────────────────────────────────────────────────────────

  function complete(id) {
    setDone(p => new Set([...p, id]))
    showToast('Task marked complete.', () =>
      setDone(p => { const n = new Set(p); n.delete(id); return n }),
    )
  }

  function approve(item) {
    setDone(p => new Set([...p, item.id]))
    showToast(`Approved: "${(item.title ?? item.subject ?? '').slice(0, 40)}".`)
  }

  function decline(item) {
    setDeclined(p => new Set([...p, item.id]))
    showToast('Declined.', () =>
      setDeclined(p => { const n = new Set(p); n.delete(item.id); return n }),
    )
  }

  function dismiss(item) {
    setDeclined(p => new Set([...p, item.id]))
    showToast('Dismissed.', () =>
      setDeclined(p => { const n = new Set(p); n.delete(item.id); return n }),
    )
  }

  function retry(item) {
    showToast(`Retrying: "${(item.title ?? item.subject ?? '').slice(0, 40)}"…`)
  }

  function archive(id) {
    setArchived(p => new Set([...p, id]))
    showToast('Archived.', () =>
      setArchived(p => { const n = new Set(p); n.delete(id); return n }),
    )
  }

  function grant(item) {
    setDone(p => new Set([...p, item.id]))
    showToast(`Access granted to ${item.actor?.name ?? 'user'}.`)
  }

  function remap(item) {
    setDone(p => new Set([...p, item.id]))
    showToast('Widget remapped.')
  }

  function govAction(item) {
    setDone(p => new Set([...p, item.id]))
    showToast(`${item.action} action taken — workflow can resume.`,
      () => setDone(p => { const n = new Set(p); n.delete(item.id); return n }),
    )
  }

  function govEscalate(item) {
    showToast(`Escalated: "${item.title.slice(0, 40)}".`)
  }

  function openItem(item) {
    if (item._kind === 'inbox') setRead(p => new Set([...p, item.id]))
    setSelected(item)
  }

  function handleModalPrimary(item) {
    setSelected(null)
    if (item._kind === 'gov')                                          govAction(item)
    else if (item._kind === 'htl')                                     approve(item)
    else if (item.status === 'error')                                  retry(item)
    else if (item._kind === 'inbox' && item.action?.kind === 'share')  grant(item)
    else if (item._kind === 'inbox' && item.action?.kind === 'repin')  remap(item)
    else                                                               complete(item.id)
  }

  function handleModalSecondary(item) {
    setSelected(null)
    if (item._kind === 'htl')                         decline(item)
    else if (item._kind === 'inbox' && !item.action)  archive(item.id)
    // else: plain dismiss — just close
  }

  // ── Row renderer ────────────────────────────────────────────────────────────

  function renderRow(item) {
    const showOrigin = tab === 'all'
    const wfLinked   = crossLinksEnabled
      && item._kind === 'inbox'
      && item.meta?.source
      && WF_SOURCES.has(item.meta.source)
    const scopedItem = crossLinksEnabled ? item : { ...item, related: undefined }
    const base = { item: scopedItem, showOrigin, wfLinked, onOpen: () => openItem(item) }

    if (item._kind === 'gov')
      return (
        <GovEventRow key={item.id} item={item}
          onOpen={() => openItem(item)}
          onAction={() => govAction(item)}
          onEscalate={() => govEscalate(item)}
        />
      )

    if (item.status === 'error')
      return <ErrorRow key={item.id} {...base} onRetry={() => retry(item)} />

    if (item._kind === 'htl')
      return (
        <ApprovalRow key={item.id} {...base}
          onApprove={() => approve(item)}
          onDecline={() => decline(item)}
        />
      )

    if (item._kind === 'inbox' && item.action)
      return (
        <InboxActionRow key={item.id} {...base}
          onPrimary={() => item.action.kind === 'share' ? grant(item) : remap(item)}
          onDismiss={() => dismiss(item)}
        />
      )

    if (item._kind === 'inbox')
      return (
        <InboxRow key={item.id} {...base}
          isRead={read.has(item.id) || !item.unread}
          onArchive={() => archive(item.id)}
        />
      )

    return <TaskRow key={item.id} {...base} onComplete={() => complete(item.id)} />
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="card flex flex-col max-h-[500px]">
      <CardHeader
        icon={<ListChecks size={14} />}
        title="My Work"
        badge={urgent || undefined}
        action={{
          label: showAll ? 'Show less' : 'See all',
          onClick: () => { setShowAll(s => !s) },
        }}
      />

      {/* Tab bar */}
      <div
        className="flex items-center gap-0.5 overflow-x-auto border-b border-gray-100 px-2 dark:border-white/[0.05]"
        role="tablist"
        aria-label="Attention categories"
      >
        {TABS.map(t => {
          const count = t.id === 'all' ? undefined : tabCounts[t.id]
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => { setTab(t.id); setShowAll(false) }}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-semibold transition-colors ${
                active
                  ? 'border-aims-blue text-aims-blue dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  active
                    ? 'bg-aims-blue/10 text-aims-blue'
                    : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* V2: bulk action bar (only visible in Full vision scope) */}
      {bulkEnabled && (
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-2 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <input type="checkbox" aria-label="Select all" className="checkbox" disabled />
          <span className="flex-1 text-[10px] text-gray-400 dark:text-slate-500">Select all</span>
          <button type="button" className="btn-ghost text-[10px] opacity-40" disabled>
            Batch approve
          </button>
          <button type="button" className="btn-ghost text-[10px] opacity-40" disabled>
            Decline all
          </button>
        </div>
      )}

      {/* V1 / V1.5: annotation that V2 bulk actions are coming */}
      {!bulkEnabled && (
        <div className="mx-4 mb-1 mt-2 flex items-start gap-1.5 rounded-lg border border-dashed border-gray-200 px-3 py-2 dark:border-white/[0.07]">
          <Pin size={10} className="mt-0.5 shrink-0 text-gray-300 dark:text-slate-600" aria-hidden="true" />
          <p className="text-[10px] text-gray-400 dark:text-slate-500">
            <span className="font-semibold text-gray-500 dark:text-slate-400">V2:</span>{' '}
            Bulk select, batch approve/decline, snooze, AI-suggested order
          </p>
        </div>
      )}

      {/* Row list */}
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
        {tab === 'all' ? (
          groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <CheckCircle2 size={20} className="text-aims-governed" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">All clear — nothing here.</p>
            </div>
          ) : (
            groups.map(group => {
              const collapsed = collapsedGroups.has(group.id)
              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="flex w-full items-center gap-2 bg-gray-50/60 px-4 py-1.5 dark:bg-white/[0.02]"
                    aria-expanded={!collapsed}
                  >
                    <ChevronRight
                      size={10}
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
                      aria-hidden="true"
                    />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${group.color}`}>
                      {group.label}
                    </span>
                    <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 dark:bg-white/10 dark:text-slate-400">
                      {group.items.length}
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {group.items.map(item => renderRow(item))}
                    </div>
                  )}
                </div>
              )
            })
          )
        ) : (
          display.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <CheckCircle2 size={20} className="text-aims-governed" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">All clear — nothing here.</p>
            </div>
          ) : (
            display.map(item => renderRow(item))
          )
        )}
      </div>

      {/* Show more (specific-tab view only) */}
      {tab !== 'all' && remaining > 0 && (
        <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-[11px] text-gray-400 transition-colors hover:text-aims-blue dark:text-slate-500 dark:hover:text-blue-400"
          >
            +{remaining} more item{remaining !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {selected && (
        <AttentionModal
          item={selected}
          onClose={() => setSelected(null)}
          onPrimary={() => handleModalPrimary(selected)}
          onSecondary={() => handleModalSecondary(selected)}
        />
      )}

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
