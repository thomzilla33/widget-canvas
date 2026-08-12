import { useState } from 'react'
import { LayoutDashboard, Boxes, Database, Sparkles, X, ArrowRight, FileBarChart, Home, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// U5 — per-studio welcome/intro. Starts as a full banner; clicking X collapses it to a
// 1-line "How does this work?" bar. Clicking that bar reopens the content in a modal.
// Collapsed state is persisted per-studio in localStorage.

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

const MINI_KEY = 'aims-welcome-mini'

function readMini() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MINI_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveMini(studioId) {
  try {
    window.localStorage.setItem(MINI_KEY, JSON.stringify([...new Set([...readMini(), studioId])]))
  } catch { /* ignore */ }
}

export default function StudioWelcome({ studioId, built, ctaLabel, onCta, secondaryLabel, onSecondary, links, dismissible = true }) {
  const cfg = STUDIOS[studioId]
  const [mini, setMini] = useState(() => dismissible && readMini().includes(studioId))
  const [modalOpen, setModalOpen] = useState(false)

  if (!cfg) return null

  const Icon = cfg.icon

  function collapse() {
    if (!dismissible) return
    setMini(true)
    saveMini(studioId)
  }

  const onSkip = onSecondary || (dismissible ? collapse : null)

  // ── Mini bar ────────────────────────────────────────────────────────────────
  if (mini) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="mb-5 flex w-full items-center gap-2.5 rounded-xl border border-aims-blue/15 bg-aims-blue/[0.04] px-4 py-2.5 text-left transition-colors hover:bg-aims-blue/[0.07] dark:border-aims-blue/20 dark:bg-aims-blue/[0.03] dark:hover:bg-aims-blue/[0.06]"
        >
          <HelpCircle size={14} className="shrink-0 text-aims-blue" aria-hidden="true" />
          <span className="text-sm text-aims-blue">
            How does the <strong className="font-semibold">{cfg.title}</strong> work?
          </span>
        </button>

        {modalOpen && (
          <WelcomeModal
            cfg={cfg}
            Icon={Icon}
            built={built}
            ctaLabel={ctaLabel}
            onCta={onCta ? () => { setModalOpen(false); onCta() } : null}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    )
  }

  // ── Full banner ─────────────────────────────────────────────────────────────
  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-aims-blue/20 bg-gradient-to-br from-aims-blue/[0.07] via-transparent to-purple-500/[0.06] p-5 dark:border-aims-blue/25 sm:p-6">
      {cfg.badge && (
        <span className="absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm lg:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {cfg.badge}
        </span>
      )}
      {dismissible && (
        <button onClick={collapse} aria-label="Collapse welcome" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10">
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

// ── Modal with full content ──────────────────────────────────────────────────
function WelcomeModal({ cfg, Icon, built, ctaLabel, onCta, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-aims-blue/20 bg-white shadow-2xl dark:bg-[var(--surface)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm" style={{ background: 'var(--grad)' }}>
              <Icon size={18} aria-hidden="true" />
            </span>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-slate-100">{cfg.title}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-aims-blue opacity-80">{cfg.eyebrow}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 dark:text-slate-300">{cfg.subtitle}</p>

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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-white/[0.07]">
          {built && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <Sparkles size={12} className="text-aims-blue" aria-hidden="true" />
              You've built <strong className="text-gray-900 dark:text-slate-100 mx-0.5">{built.count}</strong> {built.label}
            </span>
          )}
          <div className={`flex items-center gap-2 ${!built ? 'ml-auto' : ''}`}>
            <Button variant="secondary" size="default" onClick={onClose}>Got it</Button>
            {ctaLabel && onCta && (
              <Button variant="primary" size="default" onClick={onCta}>
                {ctaLabel} <ArrowRight size={15} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
