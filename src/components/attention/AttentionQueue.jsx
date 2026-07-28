import { useEffect, useRef } from 'react'
import { ShieldAlert, Bot, ListChecks, Mail, CircleAlert, Search, X, ArrowUpDown } from 'lucide-react'
import { groupItems } from '../home/attention/attentionModel.js'
import { WQ_TIER } from '../../data/workqueue.js'

const KIND_META = {
  gov:   { icon: ShieldAlert, color: 'text-aims-blue',                        bg: 'bg-aims-blue/10 dark:bg-aims-blue/[0.15]'          },
  htl:   { icon: Bot,         color: 'text-purple-500 dark:text-purple-400',  bg: 'bg-purple-500/10 dark:bg-purple-500/[0.18]'        },
  task:  { icon: ListChecks,  color: 'text-gray-500 dark:text-slate-500',     bg: 'bg-gray-100 dark:bg-white/[0.05]'                  },
  inbox: { icon: Mail,        color: 'text-gray-500 dark:text-slate-500',     bg: 'bg-gray-100 dark:bg-white/[0.05]'                  },
}

const GROUP_STYLES = {
  overdue: { labelCls: 'text-red-500 dark:text-red-400',     dot: 'bg-red-400',                    badge: 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400'         },
  today:   { labelCls: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400',                  badge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' },
  next:    { labelCls: 'text-gray-400 dark:text-slate-600',  dot: 'bg-gray-300 dark:bg-slate-700', badge: 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-slate-600'       },
}

const FILTER_TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'approvals', label: 'Approvals' },
  { id: 'work',      label: 'Work'      },
  { id: 'tasks',     label: 'Tasks'     },
  { id: 'messages',  label: 'Messages'  },
]

function itemTitle(item)   { return item.title ?? item.subject ?? '(untitled)' }
function itemWhen(item)   { return item.when ?? item.at ?? '' }
function itemSnippet(item) {
  const t = item.body ?? item.context ?? item.detail ?? ''
  if (!t) return null
  return t.length > 72 ? t.slice(0, 72).trimEnd() + '…' : t
}

function itemImpact(item) {
  if (item._kind === 'gov' && item.impact) return `${item.impact.workflows}w · ${item.impact.agents}a`
  if (item.status === 'error')             return 'Error'
  if (item.due === 'Overdue')              return 'Overdue'
  if (item.due === 'Today')               return 'Today'
  if (item._kind === 'htl')               return item.source ?? 'HTL'
  return null
}

function impactColor(item) {
  if (item.status === 'error' || item.due === 'Overdue') return 'text-red-500 dark:text-red-400'
  if (item.due === 'Today')                              return 'text-amber-500 dark:text-amber-400'
  return 'text-gray-400 dark:text-slate-600'
}

// Derive a compact badge label per item kind/category
function kindBadge(item) {
  if (item._kind === 'wq')    return item.type ?? 'Work'
  if (item._kind === 'gov')   return item.statusLabel ?? 'Policy'
  if (item._kind === 'htl')   return 'Agent pause'
  if (item._kind === 'task')  return item.due ?? 'Task'
  if (item._kind === 'inbox') return item.unread ? 'Unread' : 'Message'
  return null
}

function kindBadgeColor(item) {
  if (item._kind === 'gov' && item.blocking) return 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400'
  if (item._kind === 'gov')                  return 'bg-aims-blue/10 text-aims-blue'
  if (item._kind === 'htl')                  return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  if (item._kind === 'wq' && item.tier === 'actnow')   return 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400'
  if (item._kind === 'wq' && item.tier === 'critical') return 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400'
  if (item.due === 'Overdue' || item.status === 'error') return 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400'
  if (item.due === 'Today')                  return 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400'
  if (item._kind === 'inbox' && item.unread) return 'bg-aims-blue/10 text-aims-blue'
  return 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-slate-500'
}

// Secondary detail line per kind
function itemDetail(item) {
  if (item._kind === 'wq' && item.studio)    return item.studio
  if (item._kind === 'gov' && item.blocking) return `Blocking · ${item.impact?.workflows ?? 0}w paused`
  if (item._kind === 'gov')                  return `${item.impact?.workflows ?? 0}w · ${item.impact?.agents ?? 0}a`
  if (item._kind === 'htl' && item.source)   return item.source
  if (item._kind === 'inbox' && item.from)   return `From ${item.from}`
  if (item._kind === 'task' && item.assignee) return item.assignee
  return null
}

const STUDIO_LABEL = {
  GOV:  'Governance',
  AGNT: 'Agentic',
  DATA: 'Data Studio',
  TASK: 'Tasks',
}

function WQItemCard({ item, isActive, onClick }) {
  const tier = WQ_TIER[item.tier] ?? WQ_TIER.action
  const studioLabel = STUDIO_LABEL[item.studio] ?? item.studio ?? ''
  const evtNum = (() => {
    const n = parseInt((item.id ?? '').replace(/\D/g, ''), 10)
    return isNaN(n) ? '' : `EVT-${String(n).padStart(3, '0')}`
  })()

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 transition-all duration-150 ${
        isActive
          ? 'bg-gradient-to-r from-aims-blue/[0.08] to-transparent dark:from-aims-blue/[0.13] dark:to-transparent'
          : 'hover:bg-gray-100/80 dark:hover:bg-white/[0.025]'
      }`}
      aria-pressed={isActive}
    >
      <div className="flex items-start gap-2.5">
        {/* Active bar */}
        <span className={`mt-[3px] self-stretch w-[2px] rounded-full shrink-0 transition-all duration-200 ${isActive ? 'bg-aims-blue' : 'bg-transparent'}`} />

        {/* Tier dot */}
        <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${tier.dot}`} />

        {/* Content */}
        <div className="min-w-0 flex-1">

          {/* Row 1: event ID + due status + mission critical */}
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {evtNum && (
              <span className="font-mono text-[8px] font-bold text-gray-400 dark:text-slate-700">{evtNum}</span>
            )}
            {item.dueLabel && (
              <span className={`rounded px-1.5 py-[1px] text-[8px] font-bold leading-4 ${tier.badge}`}>
                {item.dueLabel}
              </span>
            )}
            {item.missionCritical && (
              <span className="rounded bg-amber-500/10 px-1.5 py-[1px] text-[8px] font-bold leading-4 text-amber-600 dark:text-amber-400">
                Mission Critical
              </span>
            )}
          </div>

          {/* Row 2: title */}
          <p className={`text-[11px] leading-snug transition-colors ${
            isActive
              ? 'font-semibold text-gray-900 dark:text-white'
              : 'font-medium text-gray-700 dark:text-slate-300'
          }`}>
            {item.title}
          </p>

          {/* Row 3: description snippet */}
          {item.description && (
            <p className="mt-0.5 text-[9px] leading-relaxed text-gray-400 dark:text-slate-600 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Row 4: studio + type + blast radius + est. time */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {item.studio && (
              <span
                className="rounded-full px-1.5 py-[1px] text-[8px] font-bold leading-4"
                style={{ backgroundColor: (item.studioColor ?? '#888') + '22', color: item.studioColor ?? '#888' }}
              >
                {studioLabel}
              </span>
            )}
            {item.type && (
              <span className="rounded bg-gray-100 dark:bg-white/[0.06] px-1.5 py-[1px] text-[8px] font-semibold leading-4 text-gray-500 dark:text-slate-500">
                {item.type}
              </span>
            )}
            {item.blastRadius > 0 && (
              <>
                <span className="text-gray-300 dark:text-slate-800 text-[8px]">·</span>
                <span className="text-[8px] text-gray-400 dark:text-slate-600">
                  {item.blastRadius} {item.blastRadius === 1 ? 'flow' : 'flows'} blocked
                </span>
              </>
            )}
            {item.estimatedMinutes && (
              <span className="ml-auto text-[8px] text-gray-400 dark:text-slate-700">
                ~{item.estimatedMinutes}m
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export function AttentionQueue({ items, totalCount, tabCounts, selectedId, onSelect, search, onSearch, filterCat, onFilterCat }) {
  const groups    = groupItems(items)
  const flatItems = groups.flatMap(g => g.items)
  const selIdx    = flatItems.findIndex(i => i.id === selectedId)
  const queueRef  = useRef(null)
  const searchRef = useRef(null)

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
      className="flex flex-col h-full border-r border-gray-200/80 dark:border-white/[0.05] bg-gray-50/70 dark:bg-[#09090e]"
      style={{ flex: '0 0 40%', minWidth: 280, maxWidth: 560 }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label="Attention queue"
    >
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0d1117] px-3 pt-3 pb-0">

        {/* Search */}
        <div className="relative mb-2.5">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search queue…"
            className="input pl-8 pr-8 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-400"
              aria-label="Clear search"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Filter tabs + sort */}
        <div className="flex items-center gap-1 pb-2.5 overflow-x-auto scrollbar-none">
          {FILTER_TABS.map(tab => {
            const count = tabCounts?.[tab.id] ?? 0
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterCat(tab.id)}
                className={`shrink-0 flex items-center gap-1 h-8 rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${
                  filterCat === tab.id
                    ? 'border-aims-blue/50 bg-aims-blue/[0.06] text-aims-blue dark:bg-aims-blue/[0.12] dark:border-aims-blue/40'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/[0.08] dark:bg-transparent dark:text-slate-500 dark:hover:border-white/[0.14] dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-1 py-px text-[9px] font-bold tabular-nums ${
                    filterCat === tab.id
                      ? 'bg-aims-blue/15 text-aims-blue'
                      : 'bg-gray-100 text-gray-400 dark:bg-white/[0.06] dark:text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
          <button
            type="button"
            className="ml-auto shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600 dark:border-white/[0.08] dark:bg-transparent dark:text-slate-600 dark:hover:border-white/[0.14] dark:hover:text-slate-400"
            aria-label="Sort queue"
          >
            <ArrowUpDown size={13} />
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto py-1">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <CheckAllIcon />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
              {isFiltered ? 'No results' : 'All clear'}
            </p>
            <p className="text-xs text-gray-300 dark:text-slate-700">
              {isFiltered
                ? 'Try a different search or filter.'
                : 'Nothing needs your attention right now.'}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => { onSearch(''); onFilterCat('all') }}
                className="mt-1 rounded-lg border border-gray-200 px-3 py-1 text-[11px] text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/[0.07] dark:text-slate-500"
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
                {/* Group label */}
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${gs.dot}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${gs.labelCls}`}>{group.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${gs.badge}`}>{group.items.length}</span>
                </div>

                {group.items.map(item => {
                  const isActive = item.id === selectedId

                  if (item._kind === 'wq') {
                    return (
                      <WQItemCard key={item.id} item={item} isActive={isActive} onClick={() => onSelect(item)} />
                    )
                  }

                  const meta     = KIND_META[item._kind] ?? KIND_META.task
                  const Icon     = item.status === 'error' ? CircleAlert : meta.icon
                  const iconCol  = item.status === 'error' ? 'text-red-500 dark:text-red-400' : meta.color
                  const impact   = itemImpact(item)
                  const when     = itemWhen(item)
                  const badge    = kindBadge(item)
                  const badgeCls = kindBadgeColor(item)
                  const detail   = itemDetail(item)

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`w-full flex items-start gap-2.5 pl-3 pr-3.5 py-2.5 text-left transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-aims-blue/[0.08] to-transparent dark:from-aims-blue/[0.13] dark:to-transparent'
                          : 'hover:bg-gray-100/80 dark:hover:bg-white/[0.025]'
                      }`}
                      aria-pressed={isActive}
                    >
                      {/* Active bar */}
                      <span className={`mt-[3px] self-stretch w-[2px] rounded-full shrink-0 transition-all duration-200 ${
                        isActive ? 'bg-aims-blue' : 'bg-transparent'
                      }`} />

                      {/* Kind icon */}
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isActive ? 'bg-aims-blue/20' : meta.bg
                      }`}>
                        <Icon size={11} className={iconCol} aria-hidden="true" />
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {/* Title */}
                        <p className={`truncate text-[11px] leading-snug transition-colors ${
                          isActive
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-700 dark:text-slate-300'
                        }`}>
                          {itemTitle(item)}
                        </p>

                        {/* Badge + detail row */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {badge && (
                            <span className={`inline-flex rounded px-1.5 py-[1px] text-[9px] font-bold leading-tight ${badgeCls}`}>
                              {badge}
                            </span>
                          )}
                          {detail && (
                            <span className="truncate text-[9px] text-gray-400 dark:text-slate-600">{detail}</span>
                          )}
                        </div>

                        {/* Body snippet */}
                        {(() => { const s = itemSnippet(item); return s ? (
                          <p className="mt-0.5 text-[9px] leading-relaxed text-gray-400 dark:text-slate-600 line-clamp-1">
                            {s}
                          </p>
                        ) : null })()}

                        {/* Impact + when row */}
                        {(impact || when) && (
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {impact && (
                              <span className={`text-[9px] font-semibold ${impactColor(item)}`}>{impact}</span>
                            )}
                            {impact && when && <span className="text-gray-200 dark:text-slate-800">·</span>}
                            {when && <span className="text-[9px] text-gray-400 dark:text-slate-600">{when}</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-600">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}
