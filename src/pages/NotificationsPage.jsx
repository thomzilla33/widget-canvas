import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Search, ChevronDown, ChevronLeft, ChevronRight,
  SlidersHorizontal, ArrowUpDown, BellOff,
  Bot, GitBranch, User, Plug, Shield,
} from 'lucide-react'
import { useNotifications } from '../state/NotificationsContext.jsx'

// ── Shared constants (mirror panel) ─────────────────────────────────────────
const SOURCE_META = {
  agent:       { Icon: Bot,       color: '#A78BFA', label: 'Agent'       },
  workflow:    { Icon: GitBranch, color: '#60A5FA', label: 'Workflow'     },
  human:       { Icon: User,      color: '#34D399', label: 'HTL'          },
  integration: { Icon: Plug,      color: '#FB923C', label: 'Integration'  },
  system:      { Icon: Shield,    color: '#94A3B8', label: 'System'       },
}

const SEV = {
  info:     { label: 'Info',     cls: 'bg-blue-500/10 text-blue-400 dark:text-blue-300'         },
  success:  { label: 'Success',  cls: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' },
  warning:  { label: 'Warning',  cls: 'bg-amber-500/10 text-amber-500 dark:text-amber-400'      },
  critical: { label: 'Critical', cls: 'bg-red-500/10 text-red-500 dark:text-red-400'            },
}

const DAY_LABELS = { today: 'Latest', yesterday: 'Yesterday', earlier: 'Earlier' }

const PAGE_SIZE = 10

// ── Notification row ──────────────────────────────────────────────────────────
function NotifRow({ notif, onRead }) {
  const src = SOURCE_META[notif.source] || SOURCE_META.system
  const sev = SEV[notif.severity]      || SEV.info
  const { Icon } = src

  return (
    <div
      className={`flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors cursor-default ${
        notif.unread
          ? 'border-[var(--border)] bg-[var(--accent)]'
          : 'border-[var(--border)] bg-[var(--surface-raised)] dark:bg-white/[0.03]'
      }`}
    >
      {/* Source icon */}
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{ background: `${src.color}18`, color: src.color }}
      >
        <Icon size={16} strokeWidth={1.75} />
      </span>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${
          notif.unread
            ? 'font-semibold text-gray-900 dark:text-slate-100'
            : 'font-medium text-gray-700 dark:text-slate-200'
        }`}>
          {notif.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
          {notif.desc}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {/* Source chip */}
          <span
            className="inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-semibold border"
            style={{ borderColor: `${src.color}50`, color: src.color }}
          >
            {src.label}
          </span>
          {/* Severity chip */}
          <span className={`inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-semibold ${sev.cls}`}>
            {sev.label}
          </span>
        </div>
      </div>

      {/* Right: time + unread dot + CTAs */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-4 pl-4 self-stretch">
        <div className="flex items-center gap-2">
          {notif.unread && (
            <span className="h-2 w-2 rounded-full bg-aims-blue shrink-0" />
          )}
          <span className="text-[12px] text-gray-400 dark:text-slate-500 whitespace-nowrap">
            {notif.time}
          </span>
        </div>

        {notif.ctas?.length > 0 && (
          <div className="flex items-center gap-4">
            {notif.ctas.map((cta, i) => (
              <button
                key={i}
                onClick={onRead}
                className="text-[12px] font-semibold text-aims-blue hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {cta}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toolbar dropdown button ───────────────────────────────────────────────────
function ToolbarBtn({ children, icon: Icon }) {
  return (
    <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors whitespace-nowrap">
      {Icon && <Icon size={13} />}
      {children}
      <ChevronDown size={12} className="opacity-60" />
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const navigate    = useNavigate()
  const { items, markRead } = useNotifications()

  const [filter, setFilter] = useState('all')   // 'all' | 'unread' | 'assigned'
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)

  const filtered = useMemo(() => (
    items
      .filter((n) =>
        filter === 'unread'   ? n.unread :
        filter === 'assigned' ? n.assignedToMe :
        true
      )
      .filter((n) => {
        if (!search) return true
        const q = search.toLowerCase()
        return n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q)
      })
  ), [items, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const groups = ['today', 'yesterday', 'earlier'].reduce((acc, day) => {
    const dayItems = paged.filter((n) => n.day === day)
    if (dayItems.length) acc.push({ day, items: dayItems })
    return acc
  }, [])

  const unreadCount   = items.filter((n) => n.unread).length
  const assignedCount = items.filter((n) => n.assignedToMe).length

  function handleFilterChange(id) {
    setFilter(id)
    setPage(1)
  }

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  const start = (page - 1) * PAGE_SIZE + 1
  const end   = Math.min(page * PAGE_SIZE, filtered.length)

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
          Notifications
        </h1>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border)] flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search notifications"
            value={search}
            onChange={handleSearch}
            className="h-8 w-56 pl-8 pr-3 rounded-lg border border-[var(--border)] bg-transparent text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-aims-blue"
          />
        </div>

        <ToolbarBtn>Source</ToolbarBtn>
        <ToolbarBtn>Studio</ToolbarBtn>

        <div className="flex-1" />

        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <SlidersHorizontal size={13} /> All filters
        </button>

        <button
          title="Toggle sort direction"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowUpDown size={13} />
        </button>

        <ToolbarBtn>Newest first</ToolbarBtn>
      </div>

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border)]">
        {[
          { id: 'all',      label: 'All'                                                 },
          { id: 'unread',   label: unreadCount   ? `Unread ${unreadCount}`   : 'Unread'   },
          { id: 'assigned', label: assignedCount ? `Assigned to me ${assignedCount}` : 'Assigned to me' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => handleFilterChange(chip.id)}
            className={`h-7 rounded-full px-3 text-[13px] font-medium transition-colors ${
              filter === chip.id
                ? 'bg-aims-blue text-white'
                : 'border border-[var(--border)] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Feed ── */}
      <div className="flex-1 px-6 py-5 overflow-auto">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BellOff size={32} className="text-gray-300 dark:text-slate-600 mb-3" />
            <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">
              {filter === 'unread'   ? 'No unread notifications'   :
               filter === 'assigned' ? 'Nothing assigned to you'   :
               search                ? 'No results found'          :
               'You\'re all caught up'}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {filter === 'unread'   ? 'Switch to All to see your full history.'             :
               filter === 'assigned' ? 'Items assigned to you will appear here.'            :
               search                ? 'Try different keywords or clear the search.'         :
               'Nothing new right now. Check back later.'}
            </div>
          </div>
        ) : (
          groups.map(({ day, items: dayItems }) => (
            <div key={day} className="mb-6">
              {/* Section separator */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400 dark:text-slate-500">
                  {DAY_LABELS[day]}
                </span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              <div className="space-y-2">
                {dayItems.map((n) => (
                  <NotifRow key={n.id} notif={n} onRead={() => markRead(n.id)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination footer ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] text-sm text-gray-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <button className="flex items-center gap-1 font-semibold text-gray-700 dark:text-slate-200 hover:opacity-80 transition-opacity">
              {PAGE_SIZE} <ChevronDown size={12} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span>
              {filtered.length === 0 ? '0 items' : `${start}–${end} of ${filtered.length} items`}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="grid h-7 w-7 place-items-center rounded-md border border-[var(--border)] text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="grid h-7 w-7 place-items-center rounded-md border border-[var(--border)] text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
