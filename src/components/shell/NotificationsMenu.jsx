import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, Lock, BellOff,
  Search, ArrowLeft, ArrowDown, SlidersHorizontal,
} from 'lucide-react'
import { useNotifications } from '../../state/NotificationsContext.jsx'
import { NOTIFICATION_CATEGORIES } from '../../data/mock.js'

export default function NotificationsMenu({ onClose }) {
  const navigate = useNavigate()
  const { items, settings, markRead, toggleSetting } = useNotifications()
  const [view, setView]   = useState('list')
  const [tab, setTab]     = useState('all')
  const [search, setSearch] = useState('')

  const all = items.filter((n) => settings[n.category])

  const tabCounts = {
    unread:   all.filter(n => !n.read).length,
    action:   all.filter(n => n.category === 'hitl' || n.category === 'agent').length,
    assigned: all.filter(n => n.category === 'assigned').length,
  }

  const visible = all.filter(n => {
    const q = search.toLowerCase()
    if (q && !n.title.toLowerCase().includes(q) && !(n.body || '').toLowerCase().includes(q)) return false
    if (tab === 'unread')   return !n.read
    if (tab === 'action')   return n.category === 'hitl' || n.category === 'agent'
    if (tab === 'assigned') return n.category === 'assigned'
    return true
  })

  const TABS = [
    { id: 'all',      label: 'All' },
    { id: 'unread',   label: `Unread${tabCounts.unread   ? ` ${tabCounts.unread}`   : ''}` },
    { id: 'action',   label: `Action required${tabCounts.action   ? ` ${tabCounts.action}`   : ''}` },
    { id: 'assigned', label: 'Assigned to me' },
  ]

  return (
    <div
      className="absolute right-0 top-[calc(100%+10px)] z-[200] w-full sm:w-[440px] max-w-[95vw] overflow-hidden rounded-xl border border-[var(--border)] bg-white dark:bg-[var(--surface-raised)] shadow-xl"
    >
      {view === 'list' ? (
        <>
          {/* ── DS Header ── */}
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 pt-5 pb-4">

            {/* ← Notifications */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                aria-label="Close notifications"
                className="grid h-6 w-6 place-items-center rounded text-[var(--muted-foreground)] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <span
                className="text-[18px] font-semibold text-[var(--foreground)]"
                style={{ letterSpacing: '0.25px' }}
              >
                Notifications
              </span>
            </div>

            {/* Search + Source | All filters + sort — single row */}
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="relative flex h-10 flex-1 items-center rounded-lg border-[0.5px] border-[var(--border)]">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 text-[var(--muted-foreground)]"
                  />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search notifications"
                    className="h-full w-full rounded-lg bg-transparent pl-9 pr-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none"
                  />
                </div>
                <button className="flex h-10 shrink-0 items-center gap-1 rounded-lg border-[0.5px] border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Source
                  <ChevronDown size={12} className="text-[var(--muted-foreground)]" />
                </button>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-sm font-medium text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  All filters
                  <SlidersHorizontal size={12} />
                </button>
                <div className="flex items-center gap-0.5">
                  <button className="grid h-7 w-7 place-items-center rounded text-[var(--muted-foreground)] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <ArrowDown size={14} />
                  </button>
                  <span className="select-none px-1 text-sm text-[var(--muted-foreground)]">Newest first</span>
                  <button className="grid h-7 w-7 place-items-center rounded text-[var(--muted-foreground)] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Chip tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`h-5 rounded-full px-2 text-[12px] font-medium transition-colors ${
                    tab === t.id
                      ? 'bg-[#2173ff] text-white'
                      : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notification list ── */}
          <div className="max-h-[55vh] overflow-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <BellOff size={26} className="text-gray-300 dark:text-slate-400" />
                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-200">You're all caught up</div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">No notifications right now.</div>
              </div>
            ) : (
              <>
                {/* LATEST separator */}
                <div className="flex items-center gap-3 px-5 py-2">
                  <span
                    className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)] opacity-70"
                    style={{ letterSpacing: '0.48px' }}
                  >
                    Latest
                  </span>
                  <div className="flex-1 border-t border-[var(--border)]" />
                </div>

                {visible.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); onClose(); navigate('/home/attention') }}
                    className="flex w-full items-start gap-3 border-b border-gray-100 px-5 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg leading-none">{n.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{n.title}</span>
                        {!n.read && (
                          <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#00b5d9]" />
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{n.body}</div>
                      <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{n.when}</div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ── Settings view (unchanged) ── */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-3">
            <button
              className="h-7 w-7 grid place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Back to notifications"
              onClick={() => setView('list')}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">Notification settings</span>
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
                    {c.mandatory && <Lock size={12} className="text-gray-500 dark:text-slate-400" />}
                  </div>
                  {c.mandatory && (
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">Required — can't be turned off</div>
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
        </>
      )}
    </div>
  )
}

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
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}
