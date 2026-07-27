import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, PencilRuler, X, Search, Users, ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { useModalEnter } from '../../hooks/useReveal.js'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { MARKETPLACE_WIDGETS } from '../../data/mock.js'
import AIGenerateModal from '../ai/AIGenerateModal.jsx'

// ── Constants ─────────────────────────────────────────────────────────────────

const SKELETON_ACCENT = {
  KPI:        '#2B7FFF',
  Chart:      '#22c55e',
  Table:      '#a855f7',
  Gauge:      '#f59e0b',
  List:       '#06b6d4',
  Map:        '#f43f5e',
  Timeline:   '#8b5cf6',
  'AI Summary': '#ec4899',
}

const CATEGORY_ACCENT = {
  Intelligence: '#2B7FFF',
  Operational:  '#22c55e',
  Engagement:   '#f59e0b',
  Finance:      '#a855f7',
}

// ── Mini widget skeleton preview ──────────────────────────────────────────────
function SkeletonPreview({ skeleton, accent, size = 'md' }) {
  const h = size === 'lg' ? 120 : 80
  const a = accent ?? '#2B7FFF'

  if (skeleton === 'KPI') {
    return (
      <div className="flex flex-col items-center justify-center w-full select-none" style={{ height: h }} aria-hidden="true">
        <div className="rounded-lg w-full flex flex-col items-start justify-center px-4" style={{ height: h, background: a + '0f' }}>
          <div className="rounded-md mb-2" style={{ background: a, opacity: 0.18, height: 10, width: '45%' }} />
          <div className="rounded-md mb-1" style={{ background: a, opacity: 0.70, height: size === 'lg' ? 28 : 20, width: '65%' }} />
          <div className="rounded-md" style={{ background: a, opacity: 0.22, height: 8, width: '35%' }} />
        </div>
      </div>
    )
  }

  if (skeleton === 'Chart') {
    const bars = size === 'lg' ? 8 : 6
    const maxH = size === 'lg' ? 64 : 44
    const weights = [0.9, 0.6, 0.75, 0.45, 0.85, 0.55, 0.7, 0.4]
    return (
      <div className="w-full select-none" style={{ height: h }} aria-hidden="true">
        <div className="flex h-full items-end gap-1 px-2 pb-2 pt-3 rounded-lg" style={{ background: a + '0f' }}>
          {Array.from({ length: bars }).map((_, i) => (
            <div key={i} className="flex-1 rounded-t-sm transition-all"
              style={{ background: a, opacity: i === 0 ? 0.80 : 0.35 + (weights[i] ?? 0.5) * 0.35, height: (weights[i] ?? 0.5) * maxH }} />
          ))}
        </div>
      </div>
    )
  }

  if (skeleton === 'Table') {
    const rows = size === 'lg' ? 5 : 4
    return (
      <div className="w-full select-none" style={{ height: h }} aria-hidden="true">
        <div className="flex h-full flex-col rounded-lg overflow-hidden" style={{ background: a + '0f' }}>
          <div className="flex gap-2 px-2.5 py-1.5" style={{ background: a + '20' }}>
            {[40, 30, 20].map((w, i) => (
              <div key={i} className="rounded-sm" style={{ background: a, opacity: 0.5, height: 6, width: `${w}%` }} />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 border-b" style={{ borderColor: a + '15', padding: '5px 10px' }}>
              <div className="rounded-sm flex-1" style={{ background: a, opacity: 0.12, height: 5 }} />
              <div className="rounded-sm" style={{ background: a, opacity: 0.20, height: 5, width: '25%' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (skeleton === 'Gauge') {
    return (
      <div className="flex items-center justify-center w-full select-none" style={{ height: h }} aria-hidden="true">
        <div className="relative" style={{ width: size === 'lg' ? 100 : 70, height: size === 'lg' ? 60 : 42 }}>
          <svg viewBox="0 0 100 60" className="w-full h-full" aria-hidden="true">
            <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={a + '25'} strokeWidth="8" strokeLinecap="round" />
            <path d="M 10 55 A 40 40 0 0 1 68 20" fill="none" stroke={a} strokeWidth="8" strokeLinecap="round" opacity="0.7" />
            <text x="50" y="52" textAnchor="middle" fontSize="14" fontWeight="bold" fill={a} opacity="0.8">68%</text>
          </svg>
        </div>
      </div>
    )
  }

  if (skeleton === 'List') {
    const lines = size === 'lg' ? 5 : 4
    return (
      <div className="w-full select-none px-1" style={{ height: h }} aria-hidden="true">
        <div className="flex h-full flex-col justify-evenly rounded-lg px-3 py-2" style={{ background: a + '0f' }}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="rounded-full flex-shrink-0" style={{ background: a, opacity: 0.4, width: 6, height: 6 }} />
              <div className="rounded-sm flex-1" style={{ background: a, opacity: 0.13, height: 5 }} />
              <div className="rounded-sm flex-shrink-0" style={{ background: a, opacity: 0.25, height: 5, width: '20%' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default: generic tile
  return (
    <div className="w-full rounded-lg select-none flex items-center justify-center" style={{ height: h, background: a + '0f' }} aria-hidden="true">
      <div className="rounded-md" style={{ background: a, opacity: 0.15, width: '60%', height: '40%' }} />
    </div>
  )
}

// ── Sidebar nav item ───────────────────────────────────────────────────────────
function NavItem({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
        active
          ? 'bg-aims-blue/10 text-aims-blue dark:bg-aims-blue/15'
          : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/[0.05]'
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`ml-2 flex-shrink-0 text-[10px] font-bold ${active ? 'text-aims-blue' : 'text-gray-400 dark:text-slate-600'}`}>
        {count}
      </span>
    </button>
  )
}

// ── Simple dropdown ────────────────────────────────────────────────────────────
function SimpleDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])
  const selected = options.find(o => o.value === value)
  const isActive = value !== options[0].value
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
          open || isActive
            ? 'border-aims-blue/50 bg-aims-blue/[0.06] text-aims-blue dark:border-aims-blue/40'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.04]'
        }`}
      >
        {label}
        {isActive && (
          <span className="rounded-md bg-aims-blue/15 px-1.5 py-px text-[10px] font-bold text-aims-blue">
            {selected?.label}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[#1a1f2e] dark:shadow-black/40">
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${o.value === value ? 'font-semibold text-aims-blue' : 'text-gray-700 dark:text-slate-300'}`}
            >
              <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${o.value === value ? 'bg-aims-blue' : 'bg-gray-200 dark:bg-white/10'}`} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Featured card (horizontal layout) ─────────────────────────────────────────
function FeaturedWidgetCard({ widget: w, onClick }) {
  const [hovered, setHovered] = useState(false)
  const accent = SKELETON_ACCENT[w.skeleton] ?? '#2B7FFF'
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex overflow-hidden rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50"
      style={{
        borderColor: hovered ? accent + '80' : undefined,
        boxShadow: hovered ? `0 4px 16px ${accent}18` : undefined,
      }}
    >
      {/* Preview */}
      <div
        className={`flex w-[42%] flex-shrink-0 items-center justify-center p-4 transition-colors ${hovered ? '' : 'bg-gray-50 dark:bg-white/[0.03]'}`}
        style={hovered ? { background: accent + '0d' } : {}}
      >
        <div className="w-full">
          <SkeletonPreview skeleton={w.skeleton} accent={accent} size="lg" />
        </div>
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col justify-between border-l border-gray-100 p-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-aims-blue/10 px-1.5 py-px text-[9px] font-bold text-aims-blue">★ Featured</span>
            <span className="rounded-full border border-gray-200 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-slate-500">
              {w.category}
            </span>
            {w.governed && (
              <span className="flex items-center gap-0.5 rounded-full bg-aims-governed/10 px-1.5 py-px text-[9px] font-bold text-aims-governed">
                <ShieldCheck size={8} />Governed
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{w.name}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">{w.description}</p>
          <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-600">
            Source: <span className="font-semibold">{w.source}</span>
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-600">
            <Users size={10} aria-hidden="true" />
            {(w.stats?.installs ?? 0).toLocaleString()} installs
          </span>
          <span
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
            style={{ color: hovered ? accent : undefined }}
          >
            <span className={hovered ? '' : 'text-gray-400 dark:text-slate-600'}>Use widget</span>
            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Regular grid card ──────────────────────────────────────────────────────────
function WidgetCard({ widget: w, onClick }) {
  const [hovered, setHovered] = useState(false)
  const accent = SKELETON_ACCENT[w.skeleton] ?? '#2B7FFF'
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50"
      style={{
        borderColor: hovered ? accent + '80' : undefined,
        boxShadow: hovered ? `0 4px 16px ${accent}18` : undefined,
      }}
    >
      {/* Preview */}
      <div
        className={`mb-3 w-full rounded-lg p-2 transition-colors ${hovered ? '' : 'bg-gray-50 dark:bg-white/[0.03]'}`}
        style={hovered ? { background: accent + '0d' } : {}}
      >
        <div className={hovered ? '' : 'opacity-75'}>
          <SkeletonPreview skeleton={w.skeleton} accent={accent} size="md" />
        </div>
      </div>
      {/* Meta */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1">
          <span className="rounded-full border border-gray-200 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-slate-500">
            {w.category}
          </span>
          {w.governed && (
            <span className="flex items-center gap-0.5 rounded-full bg-aims-governed/10 px-1 py-px text-[9px] font-bold text-aims-governed">
              <ShieldCheck size={7} />Gov
            </span>
          )}
          <span className="rounded-full border border-gray-200 px-1.5 py-px text-[9px] font-medium text-gray-500 dark:border-white/10 dark:text-slate-500">
            {w.skeleton}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">{w.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">{w.description}</p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-white/[0.06]">
        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-600">
          <Users size={10} aria-hidden="true" />
          {(w.stats?.installs ?? 0).toLocaleString()}
        </span>
        <span
          className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
          style={{ color: hovered ? accent : undefined }}
        >
          <span className={hovered ? '' : 'text-gray-400 dark:text-slate-600'}>Install</span>
          <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function CreateWidgetModal({ onClose }) {
  const navigate       = useNavigate()
  const trapRef        = useFocusTrap()
  useModalEnter(trapRef)
  const { addWidget }  = useWidgets()

  const [aiOpen, setAiOpen]         = useState(false)
  const [activeNav, setActiveNav]   = useState('all')
  const [search, setSearch]         = useState('')
  const [skeleton, setSkeleton]     = useState('all-skeleton')
  const [sort, setSort]             = useState('popular')

  // Sidebar categories
  const categories = useMemo(() => {
    const counts = {}
    MARKETPLACE_WIDGETS.forEach(w => { counts[w.category] = (counts[w.category] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [])

  const featuredCount = MARKETPLACE_WIDGETS.filter(w => w.featured).length

  // Skeleton types
  const skeletonOptions = useMemo(() => {
    const types = [...new Set(MARKETPLACE_WIDGETS.map(w => w.skeleton))]
    return [
      { value: 'all-skeleton', label: 'All types' },
      ...types.map(t => ({ value: t, label: t })),
    ]
  }, [])

  // Filtered list
  const filtered = useMemo(() => {
    let list = MARKETPLACE_WIDGETS
    if (activeNav === 'featured') list = list.filter(w => w.featured)
    else if (activeNav !== 'all') list = list.filter(w => w.category === activeNav)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(w => w.name.toLowerCase().includes(q) || (w.description ?? '').toLowerCase().includes(q))
    }
    if (skeleton !== 'all-skeleton') list = list.filter(w => w.skeleton === skeleton)
    if (sort === 'popular') return [...list].sort((a, b) => (b.stats?.installs ?? 0) - (a.stats?.installs ?? 0))
    if (sort === 'name')    return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [activeNav, search, skeleton, sort])

  const showFeaturedSection = !search && skeleton === 'all-skeleton' && (activeNav === 'all' || activeNav === 'featured')
  const featuredList = showFeaturedSection ? filtered.filter(w => w.featured) : []
  const gridList     = showFeaturedSection ? filtered.filter(w => !w.featured) : filtered

  function installWidget(mw) {
    const id = `w-${mw.id.replace('mw-', '')}-${Date.now().toString(36)}`
    addWidget({
      id,
      name:      mw.name,
      category:  mw.category,
      skeleton:  mw.skeleton,
      governed:  mw.governed ?? false,
      source:    mw.source,
      freshness: mw.freshness ?? 'fresh',
      updated:   'just now',
      installed: true,
    })
    navigate(`/widgets/${id}/edit`)
    onClose()
  }

  if (aiOpen) {
    return <AIGenerateModal mode="widget" onClose={() => { setAiOpen(false); onClose() }} />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-widget-mp-title"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={trapRef}
        tabIndex={-1}
        className="card relative z-10 flex w-[95vw] max-w-[1060px] flex-col overflow-hidden p-0 outline-none"
        style={{ height: '88vh' }}
      >
        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10">
          <div>
            <h2 id="create-widget-mp-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Widget marketplace
            </h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
              Install a governed, pre-built widget or describe what you need with AI.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Body: sidebar + main ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* ── Left sidebar ── */}
          <nav
            className="flex w-[200px] flex-shrink-0 flex-col gap-0.5 overflow-auto border-r border-gray-100 px-2 py-3 dark:border-white/[0.06]"
            aria-label="Widget categories"
          >
            <NavItem label="All widgets"    count={MARKETPLACE_WIDGETS.length} active={activeNav === 'all'} onClick={() => setActiveNav('all')} />
            <NavItem label="Featured"       count={featuredCount}               active={activeNav === 'featured'} onClick={() => setActiveNav('featured')} />

            <p className="mt-3 mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-600">
              Categories
            </p>
            {categories.map(([cat, cnt]) => (
              <NavItem key={cat} label={cat} count={cnt} active={activeNav === cat} onClick={() => setActiveNav(cat)} />
            ))}
          </nav>

          {/* ── Main content ── */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Search + filters */}
            <div className="flex flex-shrink-0 items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-white/[0.06]">
              <div className="relative max-w-sm flex-1">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="search"
                  className="input h-9 w-full pl-8 text-xs"
                  placeholder="Search the catalog…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <SimpleDropdown
                label="Type"
                value={skeleton}
                onChange={setSkeleton}
                options={skeletonOptions}
              />
              <div className="ml-auto">
                <SimpleDropdown
                  label="Sort:"
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'popular', label: 'Most popular' },
                    { value: 'name', label: 'Name A–Z' },
                  ]}
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="min-h-0 flex-1 space-y-6 overflow-auto px-5 py-5">
              {/* Featured */}
              {featuredList.length > 0 && (
                <section>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100">Featured by AIMS OS</h3>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500">
                      Governed and ready to install
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {featuredList.map(w => (
                      <FeaturedWidgetCard key={w.id} widget={w} onClick={() => installWidget(w)} />
                    ))}
                  </div>
                </section>
              )}

              {/* All widgets */}
              {gridList.length > 0 && (
                <section>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100">All widgets</h3>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500">{gridList.length} widgets</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {gridList.map(w => (
                      <WidgetCard key={w.id} widget={w} onClick={() => installWidget(w)} />
                    ))}
                  </div>
                </section>
              )}

              {filtered.length === 0 && (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No widgets found</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 px-6 py-3.5 dark:border-white/10">
          <p className="text-xs text-gray-400 dark:text-slate-500">Prefer to start your own?</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { navigate('/widgets/new'); onClose() }}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-4 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
            >
              <PencilRuler size={13} aria-hidden="true" />
              Start from scratch
            </button>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--grad)' }}
            >
              <Sparkles size={13} aria-hidden="true" />
              Create with AI assist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
