import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, PencilRuler, X, Search, Users, ArrowRight, ChevronDown,
} from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { useModalEnter } from '../../hooks/useReveal.js'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { DASHBOARD_TEMPLATES_RICH, TEMPLATE_SEED } from '../../data/mock.js'
import AIGenerateModal from '../ai/AIGenerateModal.jsx'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_ACCENT = {
  'Sales':            '#2B7FFF',
  'Customer Service': '#22c55e',
  'Finance':          '#a855f7',
  'HR':               '#f59e0b',
  'Operations':       '#06b6d4',
  'Marketing':        '#f43f5e',
}

const COMPLEXITY_META = {
  Basic:        { cls: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400' },
  Intermediate: { cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
  Advanced:     { cls: 'bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' },
}

// Last 4 entries in the catalog are "recently added"
const RECENT_IDS = new Set(DASHBOARD_TEMPLATES_RICH.slice(-4).map(t => t.id))

// ── Mini dashboard wireframe ───────────────────────────────────────────────────
function TemplateDiagram({ zones = [], accent, size = 'md' }) {
  const headers   = zones.filter(z => z === 'header')
  const mains     = zones.filter(z => z === 'main')
  const hasSide   = zones.includes('sidebar')
  const hasBottom = zones.includes('bottom')
  const hdr  = size === 'lg' ? 28 : 20
  const main = size === 'lg' ? 44 : 30
  const btm  = size === 'lg' ? 18 : 14
  const gap  = size === 'lg' ? 5  : 4

  return (
    <div className="flex w-full flex-col select-none" aria-hidden="true" style={{ gap }}>
      {headers.length > 0 && (
        <div className="flex w-full" style={{ gap }}>
          {headers.map((_, i) => (
            <div key={i} className="flex-1 rounded-md" style={{ background: accent, opacity: 0.22, height: hdr }} />
          ))}
        </div>
      )}
      {mains.length > 0 && (
        <div className="flex w-full" style={{ gap }}>
          <div className="flex flex-1 flex-col" style={{ gap }}>
            {mains.map((_, i) => (
              <div key={i} className="w-full rounded-md" style={{ background: accent, opacity: 0.15, height: main }} />
            ))}
          </div>
          {hasSide && (
            <div
              className="flex-shrink-0 rounded-md"
              style={{
                width: size === 'lg' ? 52 : 36,
                background: accent,
                opacity: 0.11,
                height: mains.length * main + (mains.length - 1) * gap,
              }}
            />
          )}
        </div>
      )}
      {hasBottom && (
        <div className="w-full rounded-md" style={{ background: accent, opacity: 0.10, height: btm }} />
      )}
    </div>
  )
}

// ── Complexity badge ───────────────────────────────────────────────────────────
function ComplexityBadge({ complexity }) {
  const m = COMPLEXITY_META[complexity]
  if (!m) return null
  return (
    <span className={`rounded-md px-1.5 py-px text-[10px] font-bold ${m.cls}`}>
      {complexity}
    </span>
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
      <span className={`ml-2 flex-shrink-0 text-[10px] font-bold ${active ? 'text-aims-blue' : 'text-gray-400 dark:text-slate-400'}`}>
        {count}
      </span>
    </button>
  )
}

// ── Featured card (2-column horizontal) ───────────────────────────────────────
function FeaturedCard({ template: t, onClick }) {
  const [hovered, setHovered] = useState(false)
  const accent = CATEGORY_ACCENT[t.category] ?? '#2B7FFF'
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex overflow-hidden rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50"
      style={{ borderColor: hovered ? accent + '80' : undefined }}
    >
      {!hovered && <style>{`.feat-${t.id.replace(/-/g,'')}{border-color:rgb(229 231 235);}.dark .feat-${t.id.replace(/-/g,'')}{border-color:rgba(255,255,255,0.1);}`}</style>}
      {/* Diagram */}
      <div
        className={`flex w-[42%] flex-shrink-0 items-center justify-center p-4 transition-colors ${hovered ? '' : 'bg-gray-50 dark:bg-white/[0.03]'}`}
        style={hovered ? { background: accent + '0d' } : {}}
      >
        <div className="w-full">
          <TemplateDiagram zones={t.zones} accent={accent} size="lg" />
        </div>
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col justify-between border-l border-gray-100 p-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-aims-blue/10 px-1.5 py-px text-[9px] font-bold text-aims-blue">★ Featured</span>
            <span className="rounded-full border border-gray-200 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-slate-400">
              {t.category}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{t.name}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">{t.desc}</p>
          <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-400">
            <span className="font-semibold">{t.widgets}</span> widgets
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ComplexityBadge complexity={t.complexity} />
            <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-400">
              <Users size={10} aria-hidden="true" />
              {t.tenants.toLocaleString()}
            </span>
          </div>
          <span
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
            style={{ color: hovered ? accent : undefined }}
          >
            <span className={hovered ? '' : 'text-gray-400 dark:text-slate-400'}>
              Use template
            </span>
            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Regular grid card (3-column) ──────────────────────────────────────────────
function TemplateCard({ template: t, onClick }) {
  const [hovered, setHovered] = useState(false)
  const accent = CATEGORY_ACCENT[t.category] ?? '#2B7FFF'
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/50"
      style={{
        borderColor: hovered ? accent + '80' : undefined,
        boxShadow:   hovered ? `0 4px 16px ${accent}18` : undefined,
      }}
    >
      {/* Wireframe */}
      <div
        className={`mb-3 w-full rounded-lg p-2.5 transition-colors ${hovered ? '' : 'bg-gray-50 dark:bg-white/[0.03]'}`}
        style={hovered ? { background: accent + '0d' } : {}}
      >
        <div className={hovered ? '' : 'opacity-75'}>
          <TemplateDiagram zones={t.zones} accent={accent} size="md" />
        </div>
      </div>
      {/* Meta */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full border border-gray-200 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-slate-400">
            {t.category}
          </span>
          {RECENT_IDS.has(t.id) && (
            <span className="rounded-full bg-green-50 px-1.5 py-px text-[9px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-400">
              New
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">{t.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">{t.desc}</p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ComplexityBadge complexity={t.complexity} />
          <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-400">
            <Users size={10} aria-hidden="true" />
            {t.tenants.toLocaleString()}
          </span>
        </div>
        <span
          className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
          style={{ color: hovered ? accent : undefined }}
        >
          <span className={hovered ? '' : 'text-gray-400 dark:text-slate-400'}>Use</span>
          <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
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
        <div className="absolute left-0 top-full z-30 mt-1.5 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-[var(--surface-raised)] dark:shadow-black/40">
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

// ── Main modal ────────────────────────────────────────────────────────────────
export default function CreateDashboardModal({ onClose }) {
  const navigate          = useNavigate()
  const trapRef           = useFocusTrap()
  useModalEnter(trapRef)
  const { addDashboard }  = useDashboards()

  const [aiOpen, setAiOpen]     = useState(false)
  const [activeNav, setActiveNav] = useState('all')
  const [search, setSearch]                     = useState('')
  const [complexity, setComplexity]             = useState('all-complexity')
  const [sort, setSort]                         = useState('popular')

  // Sidebar counts
  const categories = useMemo(() => {
    const counts = {}
    DASHBOARD_TEMPLATES_RICH.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [])
  const featuredCount = DASHBOARD_TEMPLATES_RICH.filter(t => t.featured).length

  // Filtered list
  const filtered = useMemo(() => {
    let list = DASHBOARD_TEMPLATES_RICH
    if (activeNav === 'featured') list = list.filter(t => t.featured)
    else if (activeNav === 'recent') list = list.filter(t => RECENT_IDS.has(t.id))
    else if (activeNav !== 'all') list = list.filter(t => t.category === activeNav)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
    }
    if (complexity !== 'all-complexity') list = list.filter(t => t.complexity === complexity)
    if (sort === 'popular') return [...list].sort((a, b) => b.tenants - a.tenants)
    if (sort === 'name')    return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [activeNav, search, complexity, sort])

  const showFeaturedSection =
    !search && complexity === 'all-complexity' && (activeNav === 'all' || activeNav === 'featured')
  const featuredList = showFeaturedSection ? filtered.filter(t => t.featured) : []
  const gridList     = showFeaturedSection ? filtered.filter(t => !t.featured) : filtered

  // Actions
  function fromTemplate(templateId) {
    const t    = DASHBOARD_TEMPLATES_RICH.find(d => d.id === templateId)
    const seed = TEMPLATE_SEED[templateId] ?? []
    const id   = `d-${templateId}-${Date.now().toString(36)}`
    addDashboard({
      id,
      template:  templateId,
      name:      t?.name ?? 'New Dashboard',
      entity:    t?.entity ?? 'Report',
      audience:  'Manager',
      placement: { surface: 'report', collection: 'Custom' },
      status:    'draft',
      widgets:   seed.length || t?.widgets || 0,
      updated:   'just now',
    })
    navigate(`/dashboard/${id}/canvas`)
    onClose()
  }

  function fromScratch() {
    const id = `d-blank-${Date.now().toString(36)}`
    addDashboard({
      id,
      template:  null,
      name:      'Untitled dashboard',
      entity:    'Report',
      audience:  'Manager',
      placement: null,
      status:    'draft',
      widgets:   0,
      updated:   'just now',
    })
    navigate(`/dashboard/${id}/canvas`)
    onClose()
  }

  if (aiOpen) {
    return <AIGenerateModal mode="dashboard" onClose={() => { setAiOpen(false); onClose() }} />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-dash-mp-title"
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
            <h2 id="create-dash-mp-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Dashboard marketplace
            </h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-400">
              Browse a curated template to get started fast, or build your own.
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
            aria-label="Template categories"
          >
            <NavItem label="All categories" count={DASHBOARD_TEMPLATES_RICH.length} active={activeNav === 'all'} onClick={() => setActiveNav('all')} />
            <NavItem label="Featured"       count={featuredCount}                    active={activeNav === 'featured'} onClick={() => setActiveNav('featured')} />
            <NavItem label="Recently added" count={RECENT_IDS.size}                  active={activeNav === 'recent'}   onClick={() => setActiveNav('recent')} />

            <p className="mt-3 mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
              Categories
            </p>
            {categories.map(([cat, cnt]) => (
              <NavItem key={cat} label={cat} count={cnt} active={activeNav === cat} onClick={() => setActiveNav(cat)} />
            ))}
          </nav>

          {/* ── Main content ── */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Search + filters bar */}
            <div className="flex flex-shrink-0 items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-white/[0.06]">
              <div className="relative max-w-sm flex-1">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
                <input
                  type="search"
                  className="input h-9 w-full pl-8 text-xs"
                  placeholder="Search the catalog…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <SimpleDropdown
                label="Complexity"
                value={complexity}
                onChange={setComplexity}
                options={[
                  { value: 'all-complexity', label: 'All complexities' },
                  { value: 'Basic', label: 'Basic' },
                  { value: 'Intermediate', label: 'Intermediate' },
                  { value: 'Advanced', label: 'Advanced' },
                ]}
              />
              <div className="ml-auto">
                <SimpleDropdown
                  label="Sort:"
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'popular', label: 'Most popular' },
                    { value: 'name', label: 'Name A–Z' },
                    { value: 'newest', label: 'Recently added' },
                  ]}
                />
              </div>
            </div>

            {/* Scrollable template content */}
            <div className="min-h-0 flex-1 space-y-6 overflow-auto px-5 py-5">

              {/* Featured section */}
              {featuredList.length > 0 && (
                <section>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100">Featured by AIMS OS</h3>
                    <span className="text-[11px] text-gray-400 dark:text-slate-400">
                      Curated templates to get your team productive fast
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {featuredList.map(t => (
                      <FeaturedCard key={t.id} template={t} onClick={() => fromTemplate(t.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* All templates grid */}
              {gridList.length > 0 && (
                <section>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100">All templates</h3>
                    <span className="text-[11px] text-gray-400 dark:text-slate-400">
                      {gridList.length} templates
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {gridList.map(t => (
                      <TemplateCard key={t.id} template={t} onClick={() => fromTemplate(t.id)} />
                    ))}
                  </div>
                </section>
              )}

              {filtered.length === 0 && (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No templates found</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-slate-400">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 px-6 py-3.5 dark:border-white/10">
          <p className="text-xs text-gray-400 dark:text-slate-400">Prefer to start your own?</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fromScratch}
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
