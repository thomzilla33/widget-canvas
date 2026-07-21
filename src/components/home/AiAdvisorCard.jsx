import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, TrendingDown, Sparkles, Bot, ArrowRight } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { HOME_ADVISOR_INSIGHTS } from '../../data/home.js'

const ICON_MAP = { AlertTriangle, TrendingDown, Sparkles, Bot }

const TYPE_STYLES = {
  warning: {
    wrap: 'bg-red-500/[0.05] border-red-500/20 dark:bg-red-500/[0.07]',
    icon: 'text-aims-stale',
    stat: 'text-aims-stale',
  },
  action: {
    wrap: 'bg-amber-500/[0.05] border-amber-500/20 dark:bg-amber-500/[0.07]',
    icon: 'text-aims-aging',
    stat: 'text-aims-aging',
  },
  success: {
    wrap: 'bg-green-500/[0.05] border-green-500/20 dark:bg-green-500/[0.07]',
    icon: 'text-aims-governed',
    stat: 'text-aims-governed',
  },
  info: {
    wrap: 'bg-blue-500/[0.05] border-blue-500/20 dark:bg-blue-500/[0.07]',
    icon: 'text-aims-blue',
    stat: 'text-aims-blue',
  },
}

const CTA_ROUTES = {
  'Review workflow': '/dashboards',
  'View deals':      '/profiles',
  'Open report':     '/reports',
  'Review SLA':      '/dashboards',
  'Review drift':    '/governance-studio',
}

const POOL_SIZE = HOME_ADVISOR_INSIGHTS.length

export function AiAdvisorCard() {
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)

  const displayed = HOME_ADVISOR_INSIGHTS
    .slice(offset, offset + 4)
    .concat(HOME_ADVISOR_INSIGHTS.slice(0, Math.max(0, offset + 4 - POOL_SIZE)))
    .slice(0, 4)

  function refresh() {
    setOffset((prev) => (prev + 2) % POOL_SIZE)
  }

  return (
    <div className="card flex flex-col">
      <CardHeader
        icon={<Sparkles size={14} />}
        title="AIMS-OS Advisor"
        action={{ label: 'Refresh insights', onClick: refresh }}
      />
      <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
        {displayed.map((insight) => {
          const styles = TYPE_STYLES[insight.type] ?? TYPE_STYLES.info
          const Icon   = ICON_MAP[insight.icon]
          const route  = CTA_ROUTES[insight.cta] ?? '/dashboards'

          return (
            <div key={insight.id} className={`flex flex-col rounded-xl border p-3.5 ${styles.wrap}`}>
              {/* Header: icon + title */}
              <div className="flex items-start gap-2">
                {Icon && (
                  <span className={`mt-0.5 shrink-0 ${styles.icon}`}>
                    <Icon size={13} aria-hidden="true" />
                  </span>
                )}
                <p className="text-xs font-semibold leading-snug text-gray-800 dark:text-slate-200">
                  {insight.title}
                </p>
              </div>

              {/* Stat anchor */}
              {insight.stat && (
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className={`num text-xl font-bold leading-none ${styles.stat}`}>
                    {insight.stat}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">
                    {insight.statLabel}
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
                {insight.description}
              </p>

              {/* CTA — anchored to bottom-right */}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(route)}
                  aria-label={`${insight.cta} — ${insight.title}`}
                  className="flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-aims-blue hover:underline"
                >
                  {insight.cta}
                  <ArrowRight size={9} aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
