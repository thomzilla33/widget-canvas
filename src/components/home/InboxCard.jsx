import { useEffect, useRef, useState } from 'react'
import { Inbox, Mail, MailOpen, Archive, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { HOME_INBOX } from '../../data/mock.js'
import CardHeader from './CardHeader.jsx'
import ItemDetailModal from './ItemDetailModal.jsx'

const PREVIEW_COUNT = 6

// Inbox of messages & mentions. Edge cases covered:
// - failed sync row → Retry (error recovery)
// - archive → Undo via the shared toast (action recovery)
// - read / unread toggle (action recovery), Mark all read
// - volume truncation (Show all), empty "inbox zero" state.
export default function InboxCard({ notify }) {
  const [read, setRead] = useState(new Set())
  const [archived, setArchived] = useState(new Set())
  const [retrying, setRetrying] = useState(new Set())
  const [recovered, setRecovered] = useState(new Set())
  const [showAll, setShowAll] = useState(false)
  const [detail, setDetail] = useState(null) // message open in the detail modal
  const retryTimers = useRef(new Map())
  useEffect(() => () => retryTimers.current.forEach(clearTimeout), [])

  const visible = HOME_INBOX.filter((m) => !archived.has(m.id))
  const isErr = (m) => m.status === 'error' && !recovered.has(m.id)
  const isUnread = (m) => m.unread && !read.has(m.id)
  const unread = visible.filter((m) => !isErr(m) && isUnread(m)).length
  const shown = showAll ? visible : visible.slice(0, PREVIEW_COUNT)

  const markRead = (id) => setRead((s) => new Set(s).add(id))
  const open = (m) => {
    markRead(m.id)
    setDetail(m)
  }
  const toggleRead = (id) =>
    setRead((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const archive = (m) => {
    setArchived((s) => new Set(s).add(m.id))
    notify('Message archived', () =>
      setArchived((s) => {
        const n = new Set(s)
        n.delete(m.id)
        return n
      }),
    )
  }
  const markAllRead = () => {
    const prev = read
    const next = new Set(read)
    visible.forEach((m) => !isErr(m) && next.add(m.id))
    setRead(next)
    notify(`Marked ${unread} as read`, () => setRead(prev))
  }
  const retry = (m) => {
    setRetrying((s) => new Set(s).add(m.id))
    const id = setTimeout(() => {
      retryTimers.current.delete(m.id)
      setRetrying((s) => {
        const n = new Set(s)
        n.delete(m.id)
        return n
      })
      setRecovered((s) => new Set(s).add(m.id))
      setRead((s) => new Set(s).add(m.id))
    }, 900)
    retryTimers.current.set(m.id, id)
  }

  return (
    <div className="card flex flex-col p-4">
      <CardHeader
        icon={Inbox}
        title="Inbox"
        count={unread}
        sub="Messages & mentions"
        right={
          unread > 0 ? (
            <button className="btn-ghost !px-2 !py-1 text-xs text-aims-blue dark:text-aims-blue" onClick={markAllRead}>
              Mark all read
            </button>
          ) : null
        }
      />
      {visible.length === 0 ? (
        <EmptyInbox />
      ) : (
        <>
          <ul className="mt-2 -mx-1">
            {shown.map((m) =>
              isErr(m) ? (
                <ErrorRow key={m.id} m={m} retrying={retrying.has(m.id)} onRetry={() => retry(m)} onOpen={() => open(m)} />
              ) : (
                <MessageRow
                  key={m.id}
                  m={m}
                  unread={isUnread(m)}
                  recovered={recovered.has(m.id)}
                  onOpen={() => open(m)}
                  onToggleRead={() => toggleRead(m.id)}
                  onArchive={() => archive(m)}
                />
              ),
            )}
          </ul>
          <div className="mt-1.5 flex items-center justify-between px-2">
            <span className="text-[11px] text-gray-400 dark:text-slate-500">
              Showing {shown.length} of {visible.length}
            </span>
            {visible.length > PREVIEW_COUNT && (
              <button className="text-[11px] font-medium text-aims-blue hover:underline" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Show less' : `Show all ${visible.length}`}
              </button>
            )}
          </div>
        </>
      )}

      {detail && (
        <ItemDetailModal
          item={detail}
          kind="inbox"
          onClose={() => setDetail(null)}
          onArchive={() => archive(detail)}
        />
      )}
    </div>
  )
}

function MessageRow({ m, unread, recovered, onOpen, onToggleRead, onArchive }) {
  return (
    <li className="group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5">
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
          unread ? 'bg-aims-blue' : recovered ? 'bg-aims-governed' : 'bg-transparent'
        }`}
      />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span
          className={`block truncate text-xs ${
            unread ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'
          }`}
        >
          {recovered ? 'Salesforce reconnected — sync recovered' : m.subject}
        </span>
        <span className="block truncate text-[11px] text-gray-400 dark:text-slate-500">
          {m.actor?.name} · {recovered ? 'just now' : m.when}
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <RowIconBtn label={unread ? 'Mark as read' : 'Mark as unread'} icon={unread ? MailOpen : Mail} onClick={onToggleRead} />
        <RowIconBtn label="Archive" icon={Archive} onClick={onArchive} />
      </div>
    </li>
  )
}

function ErrorRow({ m, retrying, onRetry, onOpen }) {
  return (
    <li className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50/70 px-2 py-2 dark:border-red-500/30 dark:bg-red-500/10">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-aims-stale" />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-xs font-semibold text-gray-900 dark:text-slate-100">{m.subject}</span>
        <span className="block truncate text-[11px] text-gray-400 dark:text-slate-500">
          {m.actor?.name} · {m.when}
        </span>
      </button>
      <button onClick={onRetry} disabled={retrying} className="btn-secondary !h-auto !px-2 !py-1 text-xs">
        {retrying ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        {retrying ? 'Retrying' : 'Retry'}
      </button>
    </li>
  )
}

function RowIconBtn({ label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10"
    >
      <Icon size={14} />
    </button>
  )
}

function EmptyInbox() {
  return (
    <div className="mt-3 grid place-items-center rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-white/10">
      <MailOpen size={22} className="text-aims-governed" />
      <div className="mt-1 text-sm font-medium text-gray-700 dark:text-slate-200">Inbox zero</div>
      <div className="text-[11px] text-gray-400 dark:text-slate-500">You’ve archived everything. Nice.</div>
    </div>
  )
}
