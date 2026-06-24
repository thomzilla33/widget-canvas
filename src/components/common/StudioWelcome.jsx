import { useState } from 'react'
import { LayoutDashboard, Boxes, Database, Sparkles, X, ArrowRight, FileBarChart, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// U5 — per-studio welcome/intro (modeled on the production "Welcome to Data Studio"):
// eyebrow pill + title + subtitle + a numbered setup walkthrough + primary & secondary
// CTAs + helper links + a "what you've built" count. Dismissible per studio (localStorage).

const STUDIOS = {
  dashboards: {
    icon: LayoutDashboard,
    eyebrow: 'Build a dashboard · 2 minutes',
    title: 'Dashboard Builder',
    subtitle: 'Compose entity & global dashboards from your governed widgets — a few quick steps.',
    steps: [
      ['Choose the scope', ' — Profile or Standalone'],
      ['Pick', ' the profile or placement'],
      ['Add & arrange', ' widgets in zones'],
      ['Set', ' the audience per widget'],
      ['Publish & share', ' with roles'],
    ],
  },
  widgets: {
    icon: Boxes,
    eyebrow: 'Build a widget · 2 minutes',
    title: 'Widget Library',
    subtitle: 'Build, browse, and install the tiles your dashboards are made of.',
    steps: [
      ['Pick', ' a connected source'],
      ['Choose', ' a measure'],
      ['Slice by', ' a dimension'],
      ['Pick', ' the best tile type'],
      ['Save', ' to your library'],
    ],
  },
  reports: {
    icon: FileBarChart,
    eyebrow: 'Standalone reports',
    title: 'Reports',
    subtitle: 'Standalone dashboards grouped by collection — not tied to any single record.',
    steps: [
      ['Open', ' a report to read it'],
      ['Browse', ' by collection'],
      ['Create', ' a new Standalone dashboard'],
      ['Publish & share', ' with roles'],
    ],
  },
  home: {
    icon: Home,
    eyebrow: 'Your workspace home',
    title: 'Home',
    subtitle: 'Your inbox, tasks, and the Human Touch Layer up top — your landing dashboards below.',
    steps: [
      ['Clear', ' your inbox & tasks'],
      ['Action', ' the Human Touch Layer queue'],
      ['Open', ' a landing dashboard'],
    ],
  },
  datastudio: {
    icon: Database,
    eyebrow: 'First time setup · about 5 minutes',
    title: 'Data Studio',
    subtitle: 'Connect a source and start sending data to your agents and team. Six quick steps, about five minutes.',
    badge: '7 categories',
    steps: [
      ['Pick a category', ' — CRM, project tools, data, marketing, support, your own API, or files'],
      ['Choose a connector', ' from that category'],
      ['Sign in', ' with your account'],
      ['Preview', ' what we found in your data'],
      ['Review', ' the AI-matched fields'],
      ['Choose how often to refresh', ' and finish'],
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

export default function StudioWelcome({ studioId, built, ctaLabel, onCta, secondaryLabel, onSecondary, links, dismissible = true }) {
  const cfg = STUDIOS[studioId]
  const [dismissed, setDismissed] = useState(() => dismissible && readDismissed().includes(studioId))
  // The numbered steps are ALWAYS shown (every view, expanded) — no collapse toggle.
  if (!cfg || dismissed) return null

  const Icon = cfg.icon
  const dismiss = () => {
    if (!dismissible) return
    setDismissed(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set([...readDismissed(), studioId])]))
    } catch {
      /* ignore */
    }
  }
  const onSkip = onSecondary || (dismissible ? dismiss : null)

  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-aims-blue/20 bg-gradient-to-br from-aims-blue/[0.07] via-transparent to-purple-500/[0.06] p-5 dark:border-aims-blue/25 sm:p-6">
      {/* Decorative hero badge (top-right) */}
      {cfg.badge && (
        <span className="absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm lg:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {cfg.badge}
        </span>
      )}
      {dismissible && (
        <button onClick={dismiss} aria-label="Dismiss welcome" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10">
          <X size={16} aria-hidden="true" />
        </button>
      )}

      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-aims-governed/30 bg-aims-governed/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-aims-governed">
          <span className="h-1.5 w-1.5 rounded-full bg-aims-fresh" /> {cfg.eyebrow}
        </span>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-sm" style={{ background: 'var(--grad)' }}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Welcome to the {cfg.title}</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{cfg.subtitle}</p>

        {cfg.steps?.length > 0 && (
          <ol className="mt-4 space-y-2">
            {cfg.steps.map(([bold, rest], i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gray-300 text-[11px] font-semibold text-gray-500 dark:border-white/15 dark:text-slate-400">{i + 1}</span>
                <span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{bold}</span>
                  {rest}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {ctaLabel && onCta && (
            <Button variant="primary" size="default" onClick={onCta}>
              {ctaLabel} <ArrowRight size={15} aria-hidden="true" />
            </Button>
          )}
          {onSkip && (
            <Button variant="secondary" size="default" onClick={onSkip}>
              {secondaryLabel || 'Skip for now'}
            </Button>
          )}
          {built && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <Sparkles size={12} className="text-aims-blue" aria-hidden="true" />
              You've built <strong className="text-gray-900 dark:text-slate-100">{built.count}</strong> {built.label}
            </span>
          )}
        </div>

        {links?.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 dark:text-slate-400">
            {links.map((l, i) => (
              <span key={l.label}>
                {i > 0 && <span className="mx-1.5" aria-hidden="true">·</span>}
                <button onClick={l.onClick} className="font-medium text-aims-blue hover:underline">{l.label}</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
