import { useEffect, useRef } from 'react'
import {
  ShieldAlert, ShieldCheck, Bot, ListChecks, Mail, CircleAlert,
  Eye, RefreshCw, CheckSquare, BookOpen, MessageSquare, Bell,
  ArrowRight, HelpCircle, FileText, Search, X,
} from 'lucide-react'
import { groupItems } from '../home/attention/attentionModel.js'
import { WQ_TIER } from '../../data/workqueue.js'

// ── Type → icon (WQ items) ───────────────────────────────────────────────────
const TYPE_ICONS = {
  Approval:    ShieldCheck,
  Review:      Eye,
  Remap:       RefreshCw,
  Task:        CheckSquare,
  Train:       BookOpen,
  Respond:     MessageSquare,
  Acknowledge: Bell,
  Handoff:     ArrowRight,
  Question:    HelpCircle,
}

const STUDIO_LABEL = {
  GOV:  'Governance',
  AGNT: 'Agentic',
  DATA: 'Data Studio',
  TASK: 'Tasks',
}

const GROUP_STYLES = {
  overdue: { labelCls: 'text-red-500 dark:text-red-400',     dot: 'bg-red-400',                    badge: 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400'         },
  today:   { labelCls: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400',                  badge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' },
  next:    { labelCls: 'text-gray-400 dark:text-slate-400',  dot: 'bg-gray-300 dark:bg-slate-700', badge: 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-slate-400'       },
}

// ── Style resolver ───────────────────────────────────────────────────────────
function resolveStyle(item) {
  if (item._kind === 'wq') {
    const Icon = TYPE_ICONS[item.type] ?? FileText
    const tiers = {
      actnow:   { bg: 'bg-red-500/10 dark:bg-red-400/15',     ic: 'text-red-500 dark:text-red-400',    dot: 'bg-red-500' },
      critical: { bg: 'bg-amber-500/10 dark:bg-amber-400/15', ic: 'text-amber-500 dark:text-amber-400', dot: 'bg-amber-400' },
      action:   { bg: 'bg-aims-blue/10',                      ic: 'text-aims-blue',                    dot: 'bg-[#00b5d9]' },
      headsup:  { bg: 'bg-gray-100 dark:bg-white/[0.06]',     ic: 'text-gray-400 dark:text-slate-400',  dot: null },
    }
    const s = tiers[item.tier] ?? tiers.action
    return { Icon, iconBg: s.bg, iconColor: s.ic, dot: s.dot }
  }
  if (item._kind === 'gov') {
    return {
      Icon: ShieldAlert,
      iconBg: item.blocking ? 'bg-red-500/10' : 'bg-aims-blue/10',
      iconColor: item.blocking ? 'text-red-500 dark:text-red-400' : 'text-aims-blue',
      dot: item.blocking ? 'bg-red-500' : null,
    }
  }
  if (item._kind === 'htl') {
    return { Icon: Bot, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500 dark:text-purple-400', dot: 'bg-[#00b5d9]' }
  }
  if (item._kind === 'task') {
    const isErr = item.status === 'error' || item.due === 'Overdue'
    return {
      Icon: isErr ? CircleAlert : ListChecks,
      iconBg: isErr ? 'bg-red-500/10' : 'bg-gray-100 dark:bg-white/[0.06]',
      iconColor: isErr ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-slate-400',
      dot: isErr ? 'bg-red-500' : null,
    }
  }
  if (item._kind === 'inbox') {
    return {
      Icon: Mail,
      iconBg: item.unread ? 'bg-aims-blue/10' : 'bg-gray-100 dark:bg-white/[0.06]',
      iconColor: item.unread ? 'text-aims-blue' : 'text-gray-400 dark:text-slate-400',
      dot: item.unread ? 'bg-[#00b5d9]' : null,
    }
  }
  return { Icon: FileText, iconBg: 'bg-gray-100 dark:bg-white/[0.06]', iconColor: 'text-gray-400 dark:text-slate-400', dot: null }
}

// ── Data helpers ─────────────────────────────────────────────────────────────
function itemTitle(item)   { return item.title ?? item.subject ?? '(untitled)' }

function itemWhen(item) {
  if (item._kind === 'wq' && item.estimatedMinutes) return `~${item.estimatedMinutes}m`
  return item.when ?? item.at ?? ''
}

function itemSnippet(item) {
  const t = item.body ?? item.context ?? item.detail ?? item.description ?? ''
  if (!t) return null
  return t.length > 110 ? t.slice(0, 110).trimEnd() + '…' : t
}

// ── Tag builders ─────────────────────────────────────────────────────────────
function kindBadge(item) {
  if (item._kind === 'wq')    return item.type ?? 'Work'
  if (item._kind === 'gov')   return item.statusLabel ?? 'Policy'
  if (item._kind === 'htl')   return 'Agent pause'
  if (item._kind === 'task')  return item.due ?? 'Task'
  if (item._kind === 'inbox') return item.unread ? 'Unread' : 'Message'
  return null
}

function kindBadgeColor(item) {
  if (item._kind === 'gov' && item.blocking) return 'bg-red-500/[0.15] text-red-600 dark:bg-red-400/[0.18] dark:text-red-400'
  if (item._kind === 'gov')                  return 'bg-aims-blue/[0.15] text-aims-blue'
  if (item._kind === 'htl')                  return 'bg-purple-500/[0.22] text-purple-600 dark:bg-purple-400/[0.22] dark:text-purple-300'
  if (item._kind === 'wq' && item.tier === 'actnow')   return 'bg-red-500/[0.15] text-red-600 dark:bg-red-400/[0.18] dark:text-red-400'
  if (item._kind === 'wq' && item.tier === 'critical') return 'bg-amber-400/[0.22] text-amber-700 dark:bg-amber-400/[0.18] dark:text-amber-400'
  if (item.due === 'Overdue' || item.status === 'error') return 'bg-red-500/[0.15] text-red-600 dark:bg-red-400/[0.18] dark:text-red-400'
  if (item.due === 'Today')                  return 'bg-amber-400/[0.22] text-amber-700 dark:bg-amber-400/[0.18] dark:text-amber-400'
  if (item._kind === 'inbox' && item.unread) return 'bg-aims-blue/[0.15] text-aims-blue'
  return 'bg-gray-200/80 text-gray-500 dark:bg-white/[0.08] dark:text-slate-400'
}

function itemDetail(item) {
  if (item._kind === 'gov' && item.blocking) return `Blocking · ${item.impact?.workflows ?? 0}w paused`
  if (item._kind === 'gov')                  return `${item.impact?.workflows ?? 0}w · ${item.impact?.agents ?? 0}a`
  if (item._kind === 'htl' && item.source)   return item.source
  if (item._kind === 'inbox' && item.from)   return `From ${item.from}`
  if (item._kind === 'task' && item.assignee) return item.assignee
  return null
}

function buildTags(item) {
  const tags = []
  if (item._kind === 'wq') {
    if (item.dueLabel) {
      const tier = WQ_TIER[item.tier] ?? WQ_TIER.action
      tags.push({ label: item.dueLabel, cls: `rounded-full px-2 py-[3px] text-[10px] font-semibold leading-tight ${tier.badge}` })
    }
    if (item.studio) {
      const c = item.studioColor ?? '#888'
      tags.push({ label: STUDIO_LABEL[item.studio] ?? item.studio, cls: 'rounded-full px-2 py-[3px] text-[10px] font-semibold leading-tight', style: { backgroundColor: c + '30', color: c } })
    }
    if (item.missionCritical) {
      tags.push({ label: 'Mission Critical', cls: 'rounded-full px-2 py-[3px] text-[10px] font-semibold leading-tight bg-amber-400/[0.22] text-amber-700 dark:bg-amber-400/[0.18] dark:text-amber-400' })
    }
    if (item.blastRadius > 0) {
      tags.push({ label: `${item.blastRadius} ${item.blastRadius === 1 ? 'flow' : 'flows'} blocked`, cls: 'text-[10px] text-gray-400 dark:text-slate-400' })
    }
  } else {
    const badge = kindBadge(item)
    if (badge) tags.push({ label: badge, cls: `rounded-full px-2 py-[3px] text-[10px] font-semibold leading-tight ${kindBadgeColor(item)}` })
    const detail = itemDetail(item)
    if (detail) tags.push({ label: detail, cls: 'text-[10px] text-gray-400 dark:text-slate-400' })
  }
  return tags
}

// ── Unified DS-style card ────────────────────────────────────────────────────
function QueueItemCard({ item, isActive, onClick }) {
  const { Icon, iconBg, iconColor, dot } = resolveStyle(item)
  const title         = itemTitle(item)
  const when          = itemWhen(item)
  const snippet       = itemSnippet(item)
  const tags          = buildTags(item)
  const primaryAction = item.quickActions?.primary ?? null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-xl border px-3 py-3 transition-all duration-150 ${
        isActive
          ? 'border-aims-blue/40 bg-aims-blue/[0.08] shadow-sm dark:border-aims-blue/50 dark:bg-aims-blue/[0.12] ring-1 ring-inset ring-aims-blue/20'
          : 'border-gray-200/80 bg-white shadow-sm hover:border-gray-300 hover:shadow dark:border-white/[0.08] dark:bg-[var(--surface-raised)] dark:hover:border-white/[0.16]'
      }`}
      aria-pressed={isActive}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon circle */}
        <div className="mt-0.5 shrink-0">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
            <Icon size={15} className={iconColor} />
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title + when */}
          <div className="flex items-start gap-2">
            <p className={`min-w-0 flex-1 text-[13px] leading-snug ${
              isActive
                ? 'font-semibold text-gray-900 dark:text-white'
                : 'font-medium text-gray-800 dark:text-slate-200'
            }`}>
              {title}
            </p>
            {when && (
              <span className="mt-px shrink-0 tabular-nums text-[10px] text-gray-400 dark:text-slate-400">
                {dot ? '• ' : ''}{when}
              </span>
            )}
          </div>

          {/* Description snippet */}
          {snippet && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
              {snippet}
            </p>
          )}

          {/* Tags + primary action */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t, i) => (
                <span key={i} className={t.cls} style={t.style}>
                  {t.label}
                </span>
              ))}
            </div>
            {primaryAction && (
              <span className="shrink-0 text-[11px] font-medium text-aims-blue group-hover:underline">
                {primaryAction}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

const QUEUE_TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'approvals', label: 'Approvals' },
  { id: 'work',      label: 'Work'      },
  { id: 'tasks',     label: 'Tasks'     },
  { id: 'messages',  label: 'Messages'  },
]

// ── Queue list ───────────────────────────────────────────────────────────────
export function AttentionQueue({ items, totalCount, selectedId, onSelect, search, filterCat, onSearch, onFilterCat, tabCounts = {} }) {
  const groups    = groupItems(items)
  const flatItems = groups.flatMap(g => g.items)
  const selIdx    = flatItems.findIndex(i => i.id === selectedId)
  const queueRef  = useRef(null)

  function handleKeyDown(e) {
    if (!flatItems.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      onSelect(flatItems[selIdx < flatItems.length - 1 ? selIdx + 1 : 0])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      onSelect(flatItems[selIdx > 0 ? selIdx - 1 : flatItems.length - 1])
    }
  }

  useEffect(() => {
    if (!selectedId && flatItems.length > 0) onSelect(flatItems[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isFiltered = search.trim() !== '' || filterCat !== 'all'

  return (
    <div
      ref={queueRef}
      className="flex h-full w-full flex-col bg-gray-50 dark:bg-[var(--surface)]"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label="Attention queue"
    >
      {/* ── Internal panel header: Queue label + search + filter chips ── */}
      <div className="shrink-0 border-b border-gray-200/80 dark:border-white/[0.07] bg-gray-50 dark:bg-[var(--surface)] px-3 pt-3 pb-2.5 flex flex-col gap-2">
        {/* Queue [N] label */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">Queue</span>
          <span className="rounded-full bg-aims-blue/10 px-1.5 py-0.5 text-[10px] font-bold text-aims-blue">
            {totalCount}
          </span>
        </div>
        {/* Search */}
        <div className="relative flex h-8 items-center rounded-lg border border-white/[0.10] bg-white dark:bg-[var(--surface-raised)]">
          <Search size={12} className="pointer-events-none absolute left-2.5 text-[var(--muted-foreground)]" />
          <input
            type="search"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search queue…"
            className="h-full w-full rounded-lg bg-transparent pl-7 pr-7 text-[12px] text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Clear search"
            >
              <X size={10} />
            </button>
          )}
        </div>
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-1">
          {QUEUE_TABS.map(tab => {
            const count = tabCounts[tab.id] ?? 0
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterCat(tab.id)}
                className={`h-5 rounded-full px-2 text-[11px] font-medium transition-colors ${
                  filterCat === tab.id
                    ? 'bg-[#2173ff] text-white'
                    : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-gray-50 hover:text-[var(--foreground)] dark:hover:bg-white/5'
                }`}
              >
                {tab.label}{count > 0 ? ` ${count}` : ''}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <CheckAllIcon />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-400">
              {isFiltered ? 'No results' : 'All clear'}
            </p>
            <p className="text-xs text-gray-300 dark:text-slate-500">
              {isFiltered
                ? 'Try a different search or filter.'
                : 'Nothing needs your attention right now.'}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => { onSearch(''); onFilterCat('all') }}
                className="mt-1 rounded-lg border border-gray-200 px-3 py-1 text-[11px] text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/[0.07] dark:text-slate-400"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          groups.map(group => {
            const gs = GROUP_STYLES[group.id] ?? GROUP_STYLES.next
            return (
              <div key={group.id}>
                {/* Group separator */}
                <div className="flex items-center gap-2 px-4 pb-2 pt-4">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${gs.dot}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${gs.labelCls}`}>
                    {group.label}
                  </span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${gs.badge}`}>
                    {group.items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 px-2 pb-2">
                  {group.items.map(item => (
                    <QueueItemCard
                      key={item.id}
                      item={item}
                      isActive={item.id === selectedId}
                      onClick={() => onSelect(item)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function CheckAllIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.04]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-400">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}
