import { Bot, ShieldAlert, Zap, Mail } from 'lucide-react'
import { HOME_AGENTS, HTL_ITEMS, HOME_WORKFLOWS, HOME_INBOX, GOV_EVENTS } from '../../data/home.js'

const activeAgents      = HOME_AGENTS.filter((a) => a.status === 'active').length
const pendingApprovals  = GOV_EVENTS.length + HTL_ITEMS.length
const failingWf         = HOME_WORKFLOWS.filter((w) => w.status === 'failed').length
const unreadInbox       = HOME_INBOX.filter((m) => m.unread).length

const CHIPS = [
  {
    id: 'agents',
    scrollTarget: 'home-agents',
    icon: Bot,
    label: 'Active agents',
    value: activeAgents,
    numClass: activeAgents > 0 ? 'text-aims-governed' : 'text-gray-900 dark:text-slate-100',
  },
  {
    id: 'approvals',
    scrollTarget: 'home-work',
    icon: ShieldAlert,
    label: 'Pending approvals',
    value: pendingApprovals,
    numClass: pendingApprovals > 0 ? 'text-aims-aging' : 'text-gray-900 dark:text-slate-100',
  },
  {
    id: 'workflows',
    scrollTarget: 'home-workflows',
    icon: Zap,
    label: 'Workflows failing',
    value: failingWf,
    numClass: failingWf > 0 ? 'text-aims-stale' : 'text-gray-900 dark:text-slate-100',
  },
  {
    id: 'inbox',
    scrollTarget: 'home-work',
    icon: Mail,
    label: 'Unread messages',
    value: unreadInbox,
    numClass: unreadInbox > 0 ? 'text-aims-blue' : 'text-gray-900 dark:text-slate-100',
  },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function HomeKpiBar() {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-100 bg-white/60 sm:grid-cols-4 dark:border-white/[0.07] dark:bg-white/[0.02]">
      {CHIPS.map(({ id, scrollTarget, icon: Icon, label, value, numClass }, i) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollTo(scrollTarget)}
          aria-label={`${label}: ${value}. Scroll to section.`}
          className={`home-kpi-chip group flex flex-col gap-2.5 px-6 py-5 text-left transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.03] ${
            i > 0 ? 'border-l border-gray-100 dark:border-white/[0.07]' : ''
          } ${
            i >= 2 ? 'border-t border-gray-100 sm:border-t-0 dark:border-white/[0.07]' : ''
          }`}
        >
          <p
            className={`home-kpi-num num text-[34px] font-semibold leading-none tracking-tight ${numClass}`}
            data-num={value}
          >
            {value}
          </p>
          <div className="flex items-center gap-1.5">
            <Icon size={11} className="shrink-0 text-gray-300 dark:text-slate-600" aria-hidden="true" />
            <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500">{label}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
