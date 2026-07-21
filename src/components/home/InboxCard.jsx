import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Inbox, User, Sparkles, Workflow, RefreshCw, ArrowUpRight, CheckCheck, X, ExternalLink, AlertTriangle } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import UndoToast from './UndoToast.jsx'
import { HOME_INBOX } from '../../data/home.js'

const ORIGIN_META = {
  contact:    { icon: <User size={11} />,         color: 'text-blue-500 bg-blue-500/10'     },
  agent:      { icon: <Sparkles size={11} />,     color: 'text-purple-500 bg-purple-500/10' },
  workflow:   { icon: <Workflow size={11} />,     color: 'text-blue-400 bg-blue-400/10'     },
  system:     { icon: <RefreshCw size={11} />,    color: 'text-cyan-500 bg-cyan-500/10'     },
  escalation: { icon: <ArrowUpRight size={11} />, color: 'text-red-500 bg-red-500/10'       },
}

const ACTION_LABELS = {
  repin: 'Remap widget',
  share: 'Grant access',
}

function MessageModal({ msg, onClose, onArchive }) {
  const meta = ORIGIN_META[msg.origin] ?? ORIGIN_META.system
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#131a2c]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.color}`} aria-hidden="true">
              {meta.icon}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {msg.actor?.name ?? msg.from ?? 'System'}
                </span>
                {msg.actor?.role && (
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">{msg.actor.role}</span>
                )}
                {msg.status === 'error' && (
                  <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-aims-stale">
                    <AlertTriangle size={9} /> Error
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{msg.subject}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{msg.at}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-4">
          <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-300">{msg.body}</p>

          {msg.meta && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400 dark:text-slate-500">
              {msg.meta.category && <span>{msg.meta.category}</span>}
              {msg.meta.source   && <span>Source: {msg.meta.source}</span>}
              {msg.meta.lastOk   && <span>Last OK: {msg.meta.lastOk}</span>}
            </div>
          )}

          {msg.related && (
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 text-[11px] font-medium text-aims-blue hover:underline"
            >
              <ExternalLink size={10} aria-hidden="true" />
              {msg.related.label}
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => { onArchive(msg.id); onClose() }}
            className="btn-ghost text-xs flex items-center gap-1.5"
          >
            <CheckCheck size={12} /> Archive
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Dismiss
            </button>
            {msg.status === 'error' ? (
              <button type="button" onClick={onClose} className="btn-primary flex items-center gap-1.5 text-xs">
                <RefreshCw size={11} /> Retry connection
              </button>
            ) : msg.action ? (
              <button type="button" onClick={onClose} className="btn-primary text-xs">
                {ACTION_LABELS[msg.action.kind] ?? msg.action.label}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function InboxCard() {
  const [read,     setRead]     = useState(new Set())
  const [archived, setArchive]  = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [showAll,  setShowAll]  = useState(false)
  const [toast,    setToast]    = useState(null)

  const allVisible = HOME_INBOX.filter((m) => !archived.has(m.id))
  const visible    = showAll ? allVisible : allVisible.slice(0, 7)
  const unread     = allVisible.filter((m) => !read.has(m.id) && !m.unread === false).length
    || HOME_INBOX.filter((m) => !archived.has(m.id) && (m.unread || !read.has(m.id)) && m.unread).length

  function markRead(id)  { setRead((p) => new Set([...p, id])) }
  function markAllRead() { setRead(new Set(HOME_INBOX.map((m) => m.id))) }

  function archive(id) {
    setArchive((p) => new Set([...p, id]))
    setToast({ id, message: 'Message archived.', undo: () => setArchive((p) => { const n = new Set(p); n.delete(id); return n }) })
    setTimeout(() => setToast(null), 4000)
  }

  function openMessage(msg) {
    markRead(msg.id)
    setSelected(msg)
  }

  const remaining = allVisible.length - 7

  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Inbox size={14} />}
        title="Inbox"
        badge={HOME_INBOX.filter((m) => !archived.has(m.id) && m.unread && !read.has(m.id)).length || undefined}
        action={{ label: 'Mark all read', onClick: markAllRead }}
      />
      <div className="flex-1 divide-y divide-gray-100 dark:divide-white/[0.05]">
        {visible.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-slate-500">Inbox zero.</p>
        )}
        {visible.map((msg) => {
          const isRead = read.has(msg.id) || !msg.unread
          const meta   = ORIGIN_META[msg.origin] ?? ORIGIN_META.system
          return (
            <div
              key={msg.id}
              role="button"
              tabIndex={0}
              onClick={() => openMessage(msg)}
              onKeyDown={(e) => e.key === 'Enter' && openMessage(msg)}
              className={`group flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${isRead ? 'opacity-60' : ''}`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${meta.color}`} aria-hidden="true">
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate text-xs ${isRead ? 'font-normal text-gray-500 dark:text-slate-400' : 'font-semibold text-gray-800 dark:text-slate-100'}`}>
                    {msg.actor?.name ?? msg.from ?? 'System'}
                  </p>
                  <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">{msg.when}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="min-w-0 truncate text-[11px] text-gray-500 dark:text-slate-400">{msg.subject}</p>
                  {msg.status === 'error' && (
                    <span className="shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-aims-stale">Error</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); archive(msg.id) }}
                className="hidden shrink-0 items-center justify-center rounded p-1 text-gray-300 transition-colors group-hover:flex hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-300"
                aria-label="Archive"
              >
                <CheckCheck size={11} />
              </button>
            </div>
          )
        })}
      </div>

      {!showAll && remaining > 0 && (
        <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-[11px] text-gray-400 transition-colors hover:text-aims-blue dark:text-slate-500 dark:hover:text-blue-400"
          >
            +{remaining} more messages
          </button>
        </div>
      )}

      {selected && (
        <MessageModal
          msg={selected}
          onClose={() => setSelected(null)}
          onArchive={archive}
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
