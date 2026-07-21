import { useNavigate } from 'react-router-dom'
import { Zap, AlertCircle, Bot, BarChart2, CalendarDays, CheckSquare2, ClipboardList } from 'lucide-react'

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Phase-specific action sets — each reflects the user's mindset for that part of the day
const PHASE_ACTIONS = {
  morning: [
    { id: 'htl',       Icon: AlertCircle,   label: 'Review HTL',       action: (nav, _) => scrollTo('home-work')      },
    { id: 'workflows', Icon: Zap,           label: 'Check workflows',  action: (nav, _) => scrollTo('home-workflows') },
    { id: 'agents',    Icon: Bot,           label: 'Agents status',    action: (nav, _) => scrollTo('home-agents')    },
  ],
  midday: [
    { id: 'trigger',   Icon: Zap,           label: 'Trigger workflow', action: (nav, _) => scrollTo('home-workflows') },
    { id: 'reports',   Icon: BarChart2,     label: 'View reports',     action: (nav, _) => nav('/reports')            },
    { id: 'htl',       Icon: AlertCircle,   label: 'Review HTL',       action: (nav, _) => scrollTo('home-work')      },
    { id: 'agents',    Icon: Bot,           label: 'Agents',           action: (nav, _) => scrollTo('home-agents')    },
  ],
  evening: [
    { id: 'wrapup',    Icon: CheckSquare2,  label: 'Wrap up day',      action: (nav, _) => scrollTo('home-work')      },
    { id: 'tomorrow',  Icon: CalendarDays,  label: 'Tomorrow',         action: (nav, _) => scrollTo('home-myday')     },
    { id: 'reports',   Icon: BarChart2,     label: 'View reports',     action: (nav, _) => nav('/reports')            },
  ],
}

export function HomeQuickActions({ variant = 'default', phase = 'midday', showSpotlight = false }) {
  const navigate = useNavigate()

  const actions = variant === 'hero'
    ? (PHASE_ACTIONS[phase] ?? PHASE_ACTIONS.midday)
    : [
        { id: 'workflow', Icon: Zap,         label: 'Trigger Workflow', action: () => scrollTo('home-workflows') },
        { id: 'htl',      Icon: AlertCircle, label: 'Review HTL',       action: () => scrollTo('home-work')      },
        { id: 'agent',    Icon: Bot,         label: 'Deploy Agent',     action: () => scrollTo('home-agents')    },
        { id: 'reports',  Icon: BarChart2,   label: 'View Reports',     action: () => navigate('/reports')       },
      ]

  const heroClass =
    'home-quick-pill flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/70 transition-all hover:bg-white/[0.16] hover:text-white hover:border-white/25'

  const defaultClass =
    'home-quick-pill flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200/80 bg-white/80 px-4 py-2.5 text-[12px] font-medium text-gray-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-aims-blue/30 hover:bg-white hover:text-aims-blue hover:shadow-[0_2px_8px_rgba(37,99,235,0.08)] dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-aims-blue/40 dark:hover:bg-white/[0.07] dark:hover:text-blue-400'

  // When the spotlight is active the pills step back — still accessible but visually secondary
  const containerClass = variant === 'hero'
    ? `flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 transition-opacity duration-300 ${showSpotlight ? 'opacity-50 hover:opacity-80' : 'opacity-100'}`
    : 'flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0'

  return (
    <div className={containerClass}>
      {actions.map(({ id, Icon, label, action }) => (
        <button
          key={id}
          type="button"
          onClick={() => action(navigate)}
          aria-label={label}
          className={variant === 'hero' ? heroClass : defaultClass}
        >
          <Icon size={13} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
