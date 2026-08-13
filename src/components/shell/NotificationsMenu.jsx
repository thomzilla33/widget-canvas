import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCheck, Settings2, ChevronLeft, Lock, BellOff,
  Bot, GitBranch, User, Plug, Shield,
  AlertCircle, WifiOff, RefreshCw,
} from 'lucide-react'
import { useNotifications } from '../../state/NotificationsContext.jsx'
import { NOTIFICATION_CATEGORIES } from '../../data/mock.js'

// ── Source metadata ─────────────────────────────────────────────────────────
const SOURCE_META = {
  agent:       { Icon: Bot,       color: '#A78BFA' },
  workflow:    { Icon: GitBranch, color: '#60A5FA' },
  human:       { Icon: User,      color: '#34D399' },
  integration: { Icon: Plug,      color: '#FB923C' },
  system:      { Icon: Shield,    color: '#94A3B8' },
}

// ── Severity badge ───────────────────────────────────────────────────────────
const SEV = {
  info:     { label: 'Info',     cls: 'bg-blue-500/10 text-blue-400 dark:text-blue-300' },
  success:  { label: 'Success',  cls: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' },
  warning:  { label: 'Warning',  cls: 'bg-amber-500/10 text-amber-500 dark:text-amber-400' },
  critical: { label: 'Critical', cls: 'bg-red-500/10 text-red-500 dark:text-red-400' },
}

const DAY_LABELS = { today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier' }

// ── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-aims-blue' : 'bg-gray-300 dark:bg-white/15'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
        checked ? 'left-[18px]' : 'left-0.5'
      }`} />
    </button>
  )
}

// ── Single notification row ───────────────────────────────────────────────────
function NotifRow({ notif, onClick }) {
  const src = SOURCE_META[notif.source] || SOURCE_META.system
  const sev = SEV[notif.severity] || SEV.info
  const { Icon } = src

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 ${
        notif.unread
          ? 'border-[var(--border)] bg-[var(--accent)] hover:brightness-110'
          : 'border-[var(--border)] hover:bg-gray-50 dark:hover:bg-white/[0.04]'
      }`}
    >
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full"
        style={{ background: `${src.color}18`, color: src.color }}
      >
        <Icon size={13} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm leading-snug ${
            notif.unread
              ? 'font-semibold text-gray-900 dark:text-slate-100'
              : 'font-medium text-gray-800 dark:text-slate-200'
          }`}>
            {notif.title}
          </span>
          {notif.unread && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: src.color }} />
          )}
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">
          {notif.desc}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${sev.cls}`}>
            {sev.label}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-slate-500">{notif.time}</span>
        </div>
      </div>
    </button>
  )
}

// ── Edge-case feed states ────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="space-y-1 px-4 py-4">
      {[0.9, 1, 0.65].map((w, i) => (
        <div key={i} className="flex items-start gap-3 py-2 animate-pulse">
          <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-3 rounded bg-gray-200 dark:bg-white/10" style={{ width: `${w * 100}%` }} />
            <div className="h-3 rounded bg-gray-200 dark:bg-white/10 w-full" />
            <div className="h-2.5 rounded bg-gray-100 dark:bg-white/[0.06] w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <div className="mt-3 text-sm font-semibold text-gray-700 dark:text-slate-200">
        Can't load notifications
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
        Something went wrong on our end.
      </div>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-aims-blue px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
      >
        <RefreshCw size={11} strokeWidth={2.5} /> Retry
      </button>
    </div>
  )
}

function OfflineState() {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gray-500/10 dark:bg-white/5">
        <WifiOff size={22} className="text-gray-400 dark:text-slate-500" />
      </div>
      <div className="mt-3 text-sm font-semibold text-gray-700 dark:text-slate-200">
        You're offline
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
        Notifications will appear when you reconnect.
      </div>
    </div>
  )
}

function EmptyState({ filter }) {
  const isUnread = filter === 'unread'
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <BellOff size={28} className="text-gray-300 dark:text-slate-600" />
      <div className="mt-3 text-sm font-semibold text-gray-700 dark:text-slate-200">
        {isUnread ? 'No unread notifications' : "You're all caught up"}
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
        {isUnread
          ? 'Switch to All to see your full history.'
          : 'Nothing new right now. Check back later.'}
      </div>
    </div>
  )
}

// ── Dev state switcher (prototype demo helper) ───────────────────────────────
const DEV_STATES = [
  { id: 'loading', label: 'Loading' },
  { id: 'error',   label: 'Error'   },
  { id: 'offline', label: 'Offline' },
]

function DevBar({ feedStatus, setFeedStatus }) {
  return (
    <div className="flex items-center gap-2 border-t border-dashed border-[var(--border)] px-4 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-300 dark:text-slate-600">
        Dev
      </span>
      {DEV_STATES.map((s) => (
        <button
          key={s.id}
          onClick={() => setFeedStatus((prev) => (prev === s.id ? 'idle' : s.id))}
          className={`h-[18px] rounded px-1.5 text-[10px] font-medium transition-colors ${
            feedStatus === s.id
              ? 'bg-aims-blue/20 text-aims-blue'
              : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function NotificationsMenu({ onClose }) {
  const navigate = useNavigate()
  const { items, settings, markRead, markAllRead, toggleSetting } = useNotifications()
  const [view,       setView]       = useState('list')
  const [filter,     setFilter]     = useState('all')
  const [feedStatus, setFeedStatus] = useState('idle') // 'idle' | 'loading' | 'error' | 'offline'

  const filtered = items
    .filter((n) => settings[n.source] !== false)
    .filter((n) => (filter === 'unread' ? n.unread : true))

  const unreadCount = items.filter((n) => n.unread).length

  const groups = ['today', 'yesterday', 'earlier'].reduce((acc, day) => {
    const dayItems = filtered.filter((n) => n.day === day)
    if (dayItems.length) acc.push({ day, items: dayItems })
    return acc
  }, [])

  function handleRowClick(n) {
    markRead(n.id)
    onClose()
    navigate('/notifications')
  }

  // ── Settings view ──────────────────────────────────────────────────────────
  if (view === 'settings') {
    return (
      <div className="w-[400px] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xl dark:bg-[var(--surface-raised)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3.5">
          <button
            onClick={() => setView('list')}
            aria-label="Back to notifications"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-gray-900 dark:text-slate-100">
            Notification settings
          </span>
        </div>
        <div className="p-2">
          {NOTIFICATION_CATEGORIES.map((c) => (
            <label
              key={c.id}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
                c.mandatory ? '' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                  {c.label}
                  {c.mandatory && <Lock size={11} className="text-gray-400 dark:text-slate-500" />}
                </div>
                {c.mandatory && (
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">
                    Required — can't be turned off
                  </div>
                )}
              </div>
              <Toggle
                checked={c.mandatory ? true : settings[c.id]}
                disabled={c.mandatory}
                onChange={() => toggleSetting(c.id)}
              />
            </label>
          ))}
        </div>
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="w-[400px] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xl dark:bg-[var(--surface-raised)]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
        <span className="text-[15px] font-semibold text-gray-900 dark:text-slate-100">
          Notifications
        </span>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && feedStatus === 'idle' && (
            <button
              onClick={markAllRead}
              title="Mark all as read"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
          <button
            onClick={() => setView('settings')}
            title="Notification settings"
            aria-label="Notification settings"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Filter chips — hidden during error/offline since filtering is meaningless */}
      {feedStatus === 'idle' && (
        <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-2.5">
          {[
            { id: 'all',    label: 'All' },
            { id: 'unread', label: unreadCount ? `Unread  ${unreadCount}` : 'Unread' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`h-[22px] rounded-full px-2.5 text-[12px] font-medium transition-colors ${
                filter === chip.id
                  ? 'bg-aims-blue text-white'
                  : 'border border-[var(--border)] text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="max-h-[58vh] overflow-auto">
        {feedStatus === 'loading' ? (
          <LoadingState />
        ) : feedStatus === 'error' ? (
          <ErrorState onRetry={() => setFeedStatus('idle')} />
        ) : feedStatus === 'offline' ? (
          <OfflineState />
        ) : groups.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          groups.map(({ day, items: dayItems }) => (
            <div key={day}>
              <div className="flex items-center gap-3 px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400 dark:text-slate-500">
                  {DAY_LABELS[day]}
                </span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              {dayItems.map((n) => (
                <NotifRow key={n.id} notif={n} onClick={() => handleRowClick(n)} />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {feedStatus === 'idle' && (
        <div className="border-t border-[var(--border)] px-4 py-3 text-center">
          <button
            onClick={() => { onClose(); navigate('/notifications') }}
            className="text-[13px] font-medium text-aims-blue transition-opacity hover:opacity-75"
          >
            View all notifications
          </button>
        </div>
      )}

      {/* Dev state switcher */}
      <DevBar feedStatus={feedStatus} setFeedStatus={setFeedStatus} />

    </div>
  )
}
