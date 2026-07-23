import { useRef, useLayoutEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { GripVertical } from 'lucide-react'
import { WorkQueuesCard }        from './WorkQueuesCard.jsx'
import { MyTeamCard }            from './MyTeamCard.jsx'
import { WorkflowsCard }         from './WorkflowsCard.jsx'
import { AgentsCard }            from './AgentsCard.jsx'
import { StudioHealthCard }      from './StudioHealthCard.jsx'
import { HomeHero }              from './HomeHero.jsx'
import { ScopeToggle }           from './ScopeToggle.jsx'
import { useRole }               from '../../state/RoleContext.jsx'

// ── Card registry ─────────────────────────────────────────────────────────────
// span: columns in a 3-col grid. fixed: not draggable.
const CARD_DEFS = {
  work:      { id: 'work',      span: 2, Component: WorkQueuesCard },
  myteam:    { id: 'myteam',    span: 1, Component: MyTeamCard },
  workflows: { id: 'workflows', span: 2, Component: WorkflowsCard },
  agents:    { id: 'agents',    span: 1, Component: AgentsCard },
  health:    { id: 'health',    span: 3, Component: StudioHealthCard, fixed: true },
}

// Initial slot → card mapping (slot = position in render order)
// Row 1: work(2) + myteam(1) = 3
// Row 2: workflows(2) + agents(1) = 3
// Row 3: health(3)
const INITIAL_ORDER = ['work', 'myteam', 'workflows', 'agents', 'health']

const SPAN_CLASS = { 1: '', 2: 'lg:col-span-2', 3: 'lg:col-span-3' }

// ── DraggableCard ─────────────────────────────────────────────────────────────
function DraggableCard({ cardId, span, isAdmin, isDragTarget, children, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const fixed = CARD_DEFS[cardId]?.fixed

  return (
    <div
      className={`relative h-full ${SPAN_CLASS[span] ?? ''}`}
      draggable={isAdmin && !fixed}
      onDragStart={isAdmin && !fixed ? () => onDragStart(cardId) : undefined}
      onDragOver={isAdmin && !fixed ? e => { e.preventDefault(); onDragOver(cardId) } : undefined}
      onDrop={isAdmin && !fixed ? e => { e.preventDefault(); onDrop(cardId) } : undefined}
      onDragEnd={onDragEnd}
      style={isDragTarget && !fixed ? { outline: '2px dashed var(--aims-blue, #2563EB)', outlineOffset: 2, borderRadius: 12 } : undefined}
    >
      {/* Drag handle — only for admin, non-fixed cards */}
      {isAdmin && !fixed && (
        <div
          className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 cursor-grab items-center justify-center rounded text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:text-slate-400 [div:hover>div>&]:opacity-100"
          aria-hidden="true"
          title="Drag to reorder"
        >
          <GripVertical size={12} />
        </div>
      )}
      <div className="h-full">{children}</div>
    </div>
  )
}

// ── HomeControlCenter ─────────────────────────────────────────────────────────
export function HomeControlCenter({ onCopilotOpen, copilotOpen = false }) {
  const rootRef     = useRef(null)
  const { isAdmin } = useRole()

  // Card order (excludes 'health' which is always last and fixed)
  const [order, setOrder]       = useState(INITIAL_ORDER)
  const [draggedId, setDraggedId] = useState(null)
  const [dragTargetId, setDragTargetId] = useState(null)

  // Entrance animation
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const cards = Array.from(rootRef.current?.querySelectorAll('.home-grid > div') ?? [])
      if (!cards.length) return
      gsap.fromTo(cards,
        { y: 20 },
        { y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform', delay: 0.1 },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const handleDragStart = useCallback((id) => {
    setDraggedId(id)
  }, [])

  const handleDragOver = useCallback((id) => {
    if (id !== draggedId) setDragTargetId(id)
  }, [draggedId])

  const handleDrop = useCallback((targetId) => {
    if (!draggedId || draggedId === targetId) return
    const from = CARD_DEFS[draggedId]
    const to   = CARD_DEFS[targetId]
    // Only swap cards of the same column span to preserve grid rows
    if (!from || !to || from.fixed || to.fixed || from.span !== to.span) return
    setOrder(prev => {
      const next = [...prev]
      const a = next.indexOf(draggedId)
      const b = next.indexOf(targetId)
      if (a !== -1 && b !== -1) { next[a] = targetId; next[b] = draggedId }
      return next
    })
  }, [draggedId])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setDragTargetId(null)
  }, [])

  return (
    <>
      <div ref={rootRef} className="flex flex-col gap-6">
        <HomeHero onCopilotOpen={onCopilotOpen} copilotOpen={copilotOpen} />

        <div className={`bento-grid home-grid grid grid-cols-1 gap-4 ${copilotOpen ? 'lg:grid-cols-[3fr_2fr]' : 'lg:grid-cols-3'}`}>
          {order.map(cardId => {
            const def = CARD_DEFS[cardId]
            if (!def) return null
            const { span, Component } = def

            // In copilot mode the grid is 2-col; adjust span for 2-col context
            const effectiveSpan = copilotOpen
              ? (span === 3 ? 2 : span === 2 ? (cardId === 'agents' ? 2 : span) : span)
              : span

            return (
              <DraggableCard
                key={cardId}
                cardId={cardId}
                span={effectiveSpan}
                isAdmin={isAdmin}
                isDragTarget={dragTargetId === cardId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              >
                <Component />
              </DraggableCard>
            )
          })}
        </div>
      </div>
      <ScopeToggle />
    </>
  )
}
