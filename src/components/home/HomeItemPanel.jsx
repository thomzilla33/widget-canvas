import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X, ExternalLink } from 'lucide-react'
import { AttentionDetail } from '../attention/AttentionDetail.jsx'
import { buildItems } from './attention/attentionModel.js'

const EMPTY = new Set()

// All WQ items — resolved once per panel mount, empty done/declined sets
function useWqItem(wqId) {
  return useMemo(() => {
    if (!wqId) return null
    return buildItems({ done: EMPTY, declined: EMPTY, archived: EMPTY })
      .find(i => i.id === wqId) ?? null
  }, [wqId])
}

function Panel({ spotlightItem, onClose, onResolve }) {
  const navigate  = useNavigate()
  const wqItem    = useWqItem(spotlightItem.wqId)
  const [visible, setVisible] = useState(false)

  // Slide-in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape to close
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  function handleGoToWQ() {
    handleClose()
    setTimeout(
      () => navigate('/home/attention', { state: { selectId: spotlightItem.wqId } }),
      300,
    )
  }

  function handleApprove() {
    onResolve(spotlightItem.id, spotlightItem.primaryAction?.label ?? 'Approved')
    handleClose()
  }

  function handleDecline() {
    onResolve(spotlightItem.id, spotlightItem.secondaryAction?.label ?? 'Escalated')
    handleClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={spotlightItem.title}
        className={`relative flex h-full flex-col bg-white shadow-2xl dark:bg-[var(--surface)] transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 'min(75vw, 860px)' }}
      >
        {/* Panel header */}
        <div className="shrink-0 flex items-center gap-3 border-b border-gray-200 dark:border-white/[0.07] px-6 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-0.5">
              {spotlightItem.badge}
            </p>
            <p className="truncate text-[13px] font-semibold leading-snug text-gray-900 dark:text-slate-100">
              {spotlightItem.title}
            </p>
          </div>

          {spotlightItem.wqId && (
            <button
              type="button"
              onClick={handleGoToWQ}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-white/[0.08] dark:text-slate-400 dark:hover:text-slate-300"
            >
              Open in Work Queue
              <ExternalLink size={11} />
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600 dark:border-white/[0.08] dark:text-slate-400 dark:hover:text-slate-400"
            aria-label="Close detail panel"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {wqItem ? (
            <AttentionDetail
              item={wqItem}
              onApprove={handleApprove}
              onDecline={handleDecline}
              onComplete={handleApprove}
              onDismiss={handleClose}
            />
          ) : (
            // Fallback for spotlight items without a linked WQ item
            <div className="flex-1 overflow-y-auto px-7 py-8">
              <p className="text-[13px] font-semibold text-gray-900 dark:text-slate-100">{spotlightItem.title}</p>
              {spotlightItem.context && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">{spotlightItem.context}</p>
              )}
              <p className="mt-2 text-xs text-gray-400 dark:text-slate-400">{spotlightItem.meta}</p>
              <div className="mt-8 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="btn-primary w-full py-2.5 text-sm font-semibold"
                >
                  {spotlightItem.primaryAction?.label ?? 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="w-full rounded-lg py-2 text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-400"
                >
                  {spotlightItem.secondaryAction?.label ?? 'Escalate'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Portal wrapper — renders outside any ancestor with overflow or transform
export function HomeItemPanel({ spotlightItem, onClose, onResolve }) {
  return createPortal(
    <Panel spotlightItem={spotlightItem} onClose={onClose} onResolve={onResolve} />,
    document.body,
  )
}
