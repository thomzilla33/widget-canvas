import { useState } from 'react'
import { LayoutDashboard, Boxes, Table2, Sparkles, X, ArrowRight, Check } from 'lucide-react'

// U5 — per-studio welcome/intro (like Data Studio): hero + "what you can do" +
// "what you've built" + a primary CTA. Dismissible per studio (localStorage), and
// shows as a returning-user intro, not only a zero-state.

const STUDIOS = {
  dashboards: {
    icon: LayoutDashboard,
    title: 'Dashboard Builder',
    subtitle: 'Compose entity & global dashboards from your governed widgets.',
    can: [
      'Create an Entity or Global dashboard',
      'Place & resize widgets in zones',
      'Set audience, then publish & share',
    ],
  },
  widgets: {
    icon: Boxes,
    title: 'Widget Library',
    subtitle: 'Build, browse, and install the tiles your dashboards are made of.',
    can: [
      'Build a widget from any connected source',
      'Install templates from your integrations',
      'Re-pin widgets when a source schema drifts',
    ],
  },
  tables: {
    icon: Table2,
    title: 'Tables',
    subtitle: 'Author governed tables with formula columns, then display them as widgets.',
    can: [
      'Define literal, measure & formula (ƒ) columns',
      'See calculated fields compute live',
      'Chart any column as a KPI, bar, or table',
    ],
  },
}

const STORAGE_KEY = 'aims-welcome-dismissed'

function readDismissed() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function StudioWelcome({ studioId, built, ctaLabel, onCta }) {
  const cfg = STUDIOS[studioId]
  const [dismissed, setDismissed] = useState(() => readDismissed().includes(studioId))
  if (!cfg || dismissed) return null

  const Icon = cfg.icon
  const dismiss = () => {
    setDismissed(true)
    try {
      const next = [...new Set([...readDismissed(), studioId])]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-aims-blue/20 bg-gradient-to-br from-aims-blue/[0.07] to-purple-500/[0.05] p-5 dark:border-aims-blue/25">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-sm" style={{ background: 'var(--grad)' }}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Welcome to the {cfg.title}</h2>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-300">{cfg.subtitle}</p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss welcome"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {cfg.can.map((c) => (
              <div key={c} className="flex items-start gap-1.5 rounded-lg border border-gray-200 bg-white/70 p-2.5 text-xs text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                <Check size={13} className="mt-0.5 shrink-0 text-aims-governed" aria-hidden="true" /> {c}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {ctaLabel && onCta && (
              <button onClick={onCta} className="btn-primary">
                {ctaLabel} <ArrowRight size={15} aria-hidden="true" />
              </button>
            )}
            {built && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                <Sparkles size={12} className="text-aims-blue" aria-hidden="true" />
                You've built <strong className="text-gray-900 dark:text-slate-100">{built.count}</strong> {built.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
