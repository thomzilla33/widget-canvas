// src/components/home/InboxCard.jsx
import { useState } from 'react'
import { Inbox, User, Sparkles, Workflow, RefreshCw, ArrowUpRight, CheckCheck } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_INBOX } from '../../data/home.js'

const ORIGIN_META = {
  contact:    { icon: <User size={11} />,        color: 'text-blue-500 bg-blue-500/10'     },
  agent:      { icon: <Sparkles size={11} />,    color: 'text-purple-500 bg-purple-500/10' },
  workflow:   { icon: <Workflow size={11} />,    color: 'text-blue-400 bg-blue-400/10'     },
  system:     { icon: <RefreshCw size={11} />,   color: 'text-cyan-500 bg-cyan-500/10'     },
  escalation: { icon: <ArrowUpRight size={11} />,color: 'text-red-500 bg-red-500/10'       },
}

export function InboxCard() {
  const [read, setRead]        = useState(new Set())
  const [archived, setArchive] = useState(new Set())

  const visible = HOME_INBOX.filter((m) => !archived.has(m.id)).slice(0, 7)
  const unread  = HOME_INBOX.filter((m) => !archived.has(m.id) && !read.has(m.id)).length

  function markRead(id)  { setRead((p) => new Set([...p, id])) }
  function archive(id)   { setArchive((p) => new Set([...p, id])) }
  function markAllRead() { setRead(new Set(HOME_INBOX.map((m) => m.id))) }

  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Inbox size={14} />}
        title="Inbox"
        badge={unread}
        action={{ label: 'Mark all read', onClick: markAllRead }}
      />
      <div className="flex-1 divide-y divide-gray-100 dark:divide-white/[0.05]">
        {visible.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-slate-500">
            Inbox zero.
          </p>
        )}
        {visible.map((msg) => {
          const isRead = read.has(msg.id) || msg.status === 'read'
          const meta   = ORIGIN_META[msg.origin] ?? ORIGIN_META.system
          return (
            <div
              key={msg.id}
              role="button"
              tabIndex={0}
              onClick={() => markRead(msg.id)}
              onKeyDown={(e) => e.key === 'Enter' && markRead(msg.id)}
              className={`group flex cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors ${isRead ? 'opacity-60' : ''}`}
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
                <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">{msg.subject}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); archive(msg.id) }}
                className="shrink-0 hidden group-hover:flex items-center justify-center rounded p-1 text-gray-300 hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Archive"
              >
                <CheckCheck size={11} />
              </button>
            </div>
          )
        })}
      </div>
      {HOME_INBOX.length > 7 && (
        <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/[0.05]">
          <button type="button" className="text-[11px] text-gray-400 hover:text-aims-blue dark:text-slate-500 dark:hover:text-blue-400 transition-colors">
            +{HOME_INBOX.length - 7} more messages
          </button>
        </div>
      )}
    </div>
  )
}
