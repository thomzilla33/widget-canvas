import { useEffect, useRef } from 'react'
import { ShieldAlert, Bot, ListChecks, Mail, CircleAlert } from 'lucide-react'
import { groupItems } from '../home/attention/attentionModel.js'

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

function itemTitle(item) { return item.title ?? item.subject ?? '(untitled)' }
function itemWhen(item)  { return item.when ?? item.at ?? '' }

function itemImpact(item) {
  if (item._kind === 'gov' && item.impact) return `${item.impact.workflows}w · ${item.impact.agents}a`
  if (item.status === 'error')             return 'Error'
  if (item.due === 'Overdue')              return 'Overdue'
  if (item.due === 'Today')                return 'Today'
  if (item._kind === 'htl')                return item.source ?? 'HTL'
  return null
}

function impactColor(item) {
  if (item.status === 'error' || item.due === 'Overdue') return 'text-red-500 dark:text-red-400'
  if (item.due === 'Today')                              return 'text-amber-500 dark:text-amber-400'
  return 'text-gray-400 dark:text-slate-600'
}

export function AttentionQueue({ items, selectedId, onSelect }) {
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

  return (
    <div
      ref={queueRef}
      className="flex flex-col h-full border-r border-gray-200/80 dark:border-white/[0.05] bg-gray-50/70 dark:bg-[#09090e]"
      style={{ width: 288, minWidth: 240, maxWidth: 320, flexShrink: 0 }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label="Attention queue"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-white/[0.04] px-4 pt-4 pb-3">
        <span className="text-[11px] font-semibold tracking-tight text-gray-700 dark:text-slate-300">Queue</span>
        {items.length > 0 && (
          <span className="rounded-full bg-aims-blue/10 px-1.5 py-0.5 text-[9px] font-bold text-aims-blue tabular-nums">
            {items.length}
          </span>
        )}
        <span className="ml-auto text-[9px] text-gray-300 dark:text-slate-800">↑↓</span>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto py-1">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <CheckAllIcon />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-500">All clear</p>
            <p className="text-xs text-gray-300 dark:text-slate-700">Nothing needs your attention right now.</p>
          </div>
        ) : (
          groups.map(group => {
            const gs = GROUP_STYLES[group.id] ?? GROUP_STYLES.next
            return (
              <div key={group.id}>
                {/* Group label — minimal floating */}
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${gs.dot}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${gs.labelCls}`}>{group.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${gs.badge}`}>{group.items.length}</span>
                </div>

                {group.items.map(item => {
                  const meta     = KIND_META[item._kind] ?? KIND_META.task
                  const Icon     = item.status === 'error' ? CircleAlert : meta.icon
                  const iconCol  = item.status === 'error' ? 'text-red-500 dark:text-red-400' : meta.color
                  const isActive = item.id === selectedId
                  const impact   = itemImpact(item)
                  const when     = itemWhen(item)

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

                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isActive ? 'bg-aims-blue/20' : meta.bg
                      }`}>
                        <Icon size={11} className={iconCol} aria-hidden="true" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[11px] leading-snug transition-colors ${
                          isActive
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-700 dark:text-slate-300'
                        }`}>
                          {itemTitle(item)}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {impact && (
                            <span className={`text-[9px] font-semibold ${impactColor(item)}`}>{impact}</span>
                          )}
                          {impact && when && <span className="text-gray-200 dark:text-slate-800">·</span>}
                          {when && <span className="text-[9px] text-gray-400 dark:text-slate-600">{when}</span>}
                        </div>
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
