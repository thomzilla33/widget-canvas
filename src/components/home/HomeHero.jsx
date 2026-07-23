import { useRef, useLayoutEffect, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  Sparkles, ShieldAlert, ArrowUpRight, AlertCircle, Zap, ExternalLink,
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Bot, Mail,
} from 'lucide-react'
import { HOME_AGENTS, HTL_ITEMS, HOME_WORKFLOWS, HOME_INBOX, GOV_EVENTS } from '../../data/home.js'
import { HomeQuickActions } from './HomeQuickActions.jsx'
import { useLive } from '../../state/LiveContext.jsx'
import { useWorkQueue } from '../../state/WorkQueueContext.jsx'
import { getResolved } from '../../state/resolvedStore.js'

// ── Day phase ─────────────────────────────────────────────────────────────────
// Override via ?phase=morning | midday | evening for prototype testing
function getDayPhase() {
  const param = new URLSearchParams(window.location.search).get('phase')
  if (param === 'morning' || param === 'midday' || param === 'evening') return param
  const h = new Date().getHours()
  if (h >= 5 && h < 10) return 'morning'
  if (h >= 10 && h < 17) return 'midday'
  return 'evening'
}

function greetingText() {
  const phase = getDayPhase()
  if (phase === 'morning') return 'Good morning'
  if (phase === 'midday') return 'Good afternoon'
  return 'Good evening'
}

// ── Spotlight items (sorted by urgency) ──────────────────────────────────────
function buildSpotlightItems() {
  const items = []

  // 1. Blocking governance — critical
  GOV_EVENTS.filter(g => g.blocking).forEach(g => items.push({
    id:      g.id,
    urgency: 'critical',
    title:   g.title,
    meta:    `Blocking ${g.impact.workflows} workflows · ${g.impact.agents} agents · ${g.when}`,
    badge:   g.statusLabel,
    primaryAction:   { label: g.action,    Icon: ShieldAlert },
    secondaryAction: { label: 'Escalate',  Icon: ArrowUpRight },
  }))

  // 2. High-priority HTL
  HTL_ITEMS.filter(i => i.priority === 'high').forEach(i => items.push({
    id:      i.id,
    urgency: 'high',
    title:   i.title,
    meta:    `${i.source} · ${i.when}`,
    badge:   'Needs action',
    primaryAction:   { label: i.action,   Icon: AlertCircle },
    secondaryAction: { label: 'Escalate', Icon: ArrowUpRight },
  }))

  // 3. Non-blocking governance — medium
  GOV_EVENTS.filter(g => !g.blocking).forEach(g => items.push({
    id:      g.id,
    urgency: 'medium',
    title:   g.title,
    meta:    `${g.impact.workflows} workflows affected · ${g.when}`,
    badge:   g.statusLabel,
    primaryAction:   { label: g.action,   Icon: ShieldAlert },
    secondaryAction: { label: 'Escalate', Icon: ArrowUpRight },
  }))

  // 4. Failing workflows — warning
  HOME_WORKFLOWS.filter(w => w.status === 'failed').forEach(w => items.push({
    id:      w.id,
    urgency: 'warning',
    title:   `${w.name} failed`,
    meta:    w.error || 'Error detected',
    badge:   'Failed',
    primaryAction:   { label: 'Retry',     Icon: Zap },
    secondaryAction: { label: 'View logs', Icon: ExternalLink },
  }))

  return items
}

const URGENCY = {
  critical: { accent: 'border-l-red-400/70',    badge: 'bg-red-400/20 text-red-300',       dot: 'bg-red-400'    },
  high:     { accent: 'border-l-amber-400/70',  badge: 'bg-amber-400/20 text-amber-300',   dot: 'bg-amber-400'  },
  medium:   { accent: 'border-l-blue-300/70',   badge: 'bg-blue-300/20 text-blue-200',     dot: 'bg-blue-300'   },
  warning:  { accent: 'border-l-yellow-400/70', badge: 'bg-yellow-400/20 text-yellow-300', dot: 'bg-yellow-400' },
}

// ── Subline copy per phase ────────────────────────────────────────────────────
function buildSubline(phase, pending, resolvedToday) {
  const blocking = GOV_EVENTS.filter(g => g.blocking).length

  if (phase === 'morning') {
    if (pending === 0) return 'No pending items overnight — clean start today.'
    return `${pending} item${pending !== 1 ? 's' : ''} waiting${blocking > 0 ? ` · ${blocking} workflow${blocking !== 1 ? 's' : ''} blocked` : ''}`
  }

  if (phase === 'midday') {
    if (pending === 0) return 'All caught up — nothing pending right now.'
    return resolvedToday > 0
      ? `${resolvedToday} resolved today · ${pending} remaining`
      : `${pending} item${pending !== 1 ? 's' : ''} need attention`
  }

  // evening
  if (pending === 0) return 'All clear — great day.'
  return `${pending} item${pending !== 1 ? 's' : ''} still need you today`
}

// ── KPI chips (calm state) ────────────────────────────────────────────────────
const _activeAgents     = HOME_AGENTS.filter(a => a.status === 'active').length
const _pendingApprovals = GOV_EVENTS.length + HTL_ITEMS.filter(i => i.priority === 'high').length
const _failingWf        = HOME_WORKFLOWS.filter(w => w.status === 'failed').length
const _unreadInbox      = HOME_INBOX.filter(m => m.unread).length

const CHIPS = [
  { id: 'agents',    Icon: Bot,         label: 'Active agents',     value: _activeAgents,     urgent: false },
  { id: 'approvals', Icon: ShieldAlert, label: 'Pending approvals', value: _pendingApprovals, urgent: false },
  { id: 'workflows', Icon: Zap,         label: 'Workflows failing', value: _failingWf,        urgent: true  },
  { id: 'inbox',     Icon: Mail,        label: 'Unread messages',   value: _unreadInbox,      urgent: false },
]

// ── Component ─────────────────────────────────────────────────────────────────
export function HomeHero({ onCopilotOpen, copilotOpen = false }) {
  const heroRef      = useRef(null)
  const spotlightRef = useRef(null)
  const navigate     = useNavigate()

  const dayPhase = getDayPhase()

  // ── Live state ──────────────────────────────────────────────────────────────
  const { tick }  = useLive()
  const { htl }   = useWorkQueue()

  // Hero-spotlight actions taken this session
  const [heroResolved, setHeroResolved] = useState(0)
  // Flash label shown for 3s after each action ("Approved", "Escalated", …)
  const [lastAction, setLastAction]     = useState(null)
  const lastActionTimerRef = useRef(null)
  useEffect(() => () => clearTimeout(lastActionTimerRef.current), [])

  // Simulated agent-resolved bonus: +1 every 5 ticks (≈15 s), capped at 20
  const [liveBonus, setLiveBonus] = useState(0)
  const prevTickRef = useRef(0)
  useEffect(() => {
    const added = Math.floor(tick / 5) - Math.floor(prevTickRef.current / 5)
    if (added > 0) setLiveBonus(b => Math.min(b + added, 20))
    prevTickRef.current = tick
  }, [tick])

  // My Work resolutions (localStorage, polled every 1.5 s)
  const [wqResolved, setWqResolved] = useState(() => getResolved().size)
  useEffect(() => {
    const id = setInterval(() => setWqResolved(getResolved().size), 1500)
    return () => clearInterval(id)
  }, [])

  // HTL items resolved in this session via the HITL panel
  const htlResolved = htl.filter(h => h.status !== 'pending').length

  // Base count simulates prior-to-session activity
  const BASE_RESOLVED = dayPhase === 'morning' ? 0 : dayPhase === 'midday' ? 5 : 11
  const resolvedToday = BASE_RESOLVED + heroResolved + htlResolved + wqResolved + liveBonus

  const [spotlightIdx, setSpotlightIdx] = useState(0)
  const [deferredIds,  setDeferredIds]  = useState(new Set())

  const allItems = buildSpotlightItems()
  const items    = allItems.filter(i => !deferredIds.has(i.id))
  const pending  = items.length

  const showSpotlight = pending > 0
  const showCalm      = !showSpotlight
  const showDefer     = dayPhase === 'evening' && pending > 0
  const subline       = buildSubline(dayPhase, pending, resolvedToday)

  const safeIdx = Math.min(spotlightIdx, Math.max(0, items.length - 1))
  const current = items[safeIdx] ?? null
  const uc      = current ? URGENCY[current.urgency] : null

  function defer(id) {
    setDeferredIds(prev => new Set([...prev, id]))
    setSpotlightIdx(prev => Math.max(0, Math.min(prev, items.length - 2)))
  }

  // Resolve a spotlight item: remove it + record the action for live counts + flash
  function resolve(id, actionLabel) {
    defer(id)
    setHeroResolved(n => n + 1)
    setLastAction(actionLabel)
    clearTimeout(lastActionTimerRef.current)
    lastActionTimerRef.current = setTimeout(() => setLastAction(null), 3000)
  }

  // ── Entrance animation ──────────────────────────────────────────────────────
  // Note: opacity is NOT modified here — elements stay visible (avoids Strict Mode double-mount glitch).
  // We only translate from y:12 → y:0 for a subtle slide-in entrance.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.hero-greeting',    { y: 12 }, { y: 0, duration: 0.5, stagger: 0.08, clearProps: 'transform' })
        .fromTo('.hero-copilot-btn', { y: 8, scale: 0.96 }, { y: 0, scale: 1, duration: 0.35, clearProps: 'transform' }, '-=0.3')
        .fromTo('.hero-spotlight',   { y: 10 }, { y: 0, duration: 0.4, clearProps: 'transform' }, '-=0.2')
        .fromTo('.hero-chip',        { y: 8 },  { y: 0, duration: 0.35, stagger: 0.05, clearProps: 'transform' }, '-=0.2')
        .fromTo('.home-quick-pill',  { y: 6 },  { y: 0, duration: 0.3, stagger: 0.04, clearProps: 'transform' }, '-=0.2')
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // ── Spotlight item transition ────────────────────────────────────────────────
  useEffect(() => {
    if (!spotlightRef.current) return
    const tween = gsap.fromTo(spotlightRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', clearProps: 'transform,opacity' },
    )
    return () => tween.kill()
  }, [spotlightIdx, deferredIds.size])

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden rounded-2xl px-7 pb-6 pt-7"
      style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #4338ca 100%)' }}
    >
      {/* Mesh layer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 80% at 10% 40%, rgba(255,255,255,0.07) 0%, transparent 60%),' +
          'radial-gradient(ellipse 40% 50% at 90% 10%, rgba(255,255,255,0.05) 0%, transparent 55%)',
      }} />

      {/* ── Greeting row ── */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="hero-greeting text-[32px] font-light leading-tight tracking-[-0.02em] text-white/90 sm:text-[38px]">
            {greetingText()},{' '}
            <span className="font-semibold text-white">Thomas.</span>
          </h1>
          <p className="hero-greeting mt-2 flex items-center gap-2 text-sm text-white/55">
            {/* Live pulse — amber when urgent items pending, green when calm */}
            <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${showSpotlight ? 'bg-amber-300' : 'bg-emerald-300'}`} />
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${showSpotlight ? 'bg-amber-300' : 'bg-emerald-300'}`} />
            </span>
            {lastAction
              ? <span className="text-white/80">✓ {lastAction} · {resolvedToday} resolved today</span>
              : subline
            }
          </p>
        </div>
        <button
          type="button"
          onClick={onCopilotOpen}
          aria-pressed={copilotOpen}
          className={`hero-copilot-btn mt-1 flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold text-white backdrop-blur-sm transition-all ${
            copilotOpen
              ? 'border-white/40 bg-white/25 hover:bg-white/30 hover:border-white/50'
              : 'border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30'
          }`}
        >
          <Sparkles size={13} aria-hidden="true" />
          {copilotOpen ? 'Close Copilot' : 'Ask Copilot'}
        </button>
      </div>

      {/* ── SPOTLIGHT ── */}
      {showSpotlight && current && (
        <div className="hero-spotlight relative mt-5">
          <div
            ref={spotlightRef}
            className={`rounded-xl border border-white/[0.12] border-l-[3px] bg-white/[0.10] px-4 py-4 backdrop-blur-sm ${uc.accent}`}
          >
            {/* Badge + dot nav */}
            <div className="mb-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${uc.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${uc.dot}`} aria-hidden="true" />
                {current.badge}
              </span>

              {items.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSpotlightIdx(i => (i - 1 + items.length) % items.length)}
                    className="rounded p-1 text-white/40 transition-colors hover:text-white/70"
                    aria-label="Previous item"
                  >
                    <ChevronLeft size={12} aria-hidden="true" />
                  </button>
                  {items.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSpotlightIdx(i)}
                      aria-label={`Item ${i + 1} of ${items.length}`}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        i === safeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setSpotlightIdx(i => (i + 1) % items.length)}
                    className="rounded p-1 text-white/40 transition-colors hover:text-white/70"
                    aria-label="Next item"
                  >
                    <ChevronRight size={12} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {/* Title + meta */}
            <p className="text-[14px] font-semibold leading-snug text-white">{current.title}</p>
            <p className="mt-1 text-[11px] text-white/50">{current.meta}</p>

            {/* Actions */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => resolve(current.id, current.primaryAction.label)}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-[11px] font-bold text-blue-800 transition-all hover:bg-white/90 active:scale-95"
              >
                <current.primaryAction.Icon size={11} aria-hidden="true" />
                {current.primaryAction.label}
              </button>
              <button
                type="button"
                onClick={() => resolve(current.id, current.secondaryAction.label)}
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/80 transition-all hover:bg-white/[0.18] hover:text-white active:scale-95"
              >
                <current.secondaryAction.Icon size={11} aria-hidden="true" />
                {current.secondaryAction.label}
              </button>
              {showDefer && (
                <button
                  type="button"
                  onClick={() => resolve(current.id, 'Deferred')}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-white/35 transition-colors hover:text-white/60"
                >
                  <Clock size={11} aria-hidden="true" />
                  Defer to tomorrow
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/home/attention')}
                className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-white/40 transition-colors hover:text-white/70"
              >
                See all
                <ChevronRight size={11} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CALM STATE ── */}
      {showCalm && (
        <div className="hero-spotlight relative mt-5 flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3.5">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-white">
              {dayPhase === 'morning' ? 'Clean start' : dayPhase === 'evening' ? 'All clear' : 'All caught up'}
            </p>
            <p className="text-[11px] text-white/50">
              {dayPhase === 'morning'
                ? 'No pending items from yesterday. You\'re all set.'
                : dayPhase === 'evening'
                  ? `${resolvedToday} items handled today. Nothing pending for tomorrow.`
                  : `${resolvedToday} items resolved. Nothing left in your queue.`}
            </p>
          </div>
        </div>
      )}

      {/* KPI chips — only in calm state */}
      {showCalm && (
        <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {CHIPS.map(({ id, Icon, label, value, urgent }) => (
            <button
              key={id}
              type="button"
              className="hero-chip home-kpi-chip rounded-xl border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-left transition-all hover:bg-white/[0.16] hover:border-white/20"
            >
              <p
                className={`home-kpi-num text-[28px] font-semibold leading-none tracking-tight ${urgent && value > 0 ? 'text-red-300' : 'text-white'}`}
                data-num={value}
              >
                {value}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Icon size={10} className="shrink-0 text-white/35" aria-hidden="true" />
                <p className="text-[10px] font-medium text-white/50">{label}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="relative mt-4">
        <HomeQuickActions variant="hero" phase={dayPhase} showSpotlight={showSpotlight} />
      </div>
    </div>
  )
}
