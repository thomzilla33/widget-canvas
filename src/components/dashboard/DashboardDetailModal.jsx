import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { X, LayoutDashboard, MapPin, Users, Pencil, Eye, Clock } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Badge } from '../common/index.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { dashboardLayout, widgetCount } from '../../data/layout.js'
import { placementLabel, dashboardKind, DEACTIVATED_OWNERS } from '../../data/mock.js'
import { audienceLabel } from '../../data/audiences.js'

const SIZE_SPAN = { sm: 'col-span-1', md: 'col-span-2', lg: 'col-span-3' }

const SKELETON_META = {
  KPI:          { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',    border: 'border-blue-200/60 dark:border-blue-500/20' },
  Chart:        { color: 'bg-green-500/10 text-green-600 dark:text-green-400', border: 'border-green-200/60 dark:border-green-500/20' },
  Donut:        { color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-500/20' },
  Gauge:        { color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-500/20' },
  Table:        { color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-500/20' },
  List:         { color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',    border: 'border-cyan-200/60 dark:border-cyan-500/20' },
  Map:          { color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',    border: 'border-teal-200/60 dark:border-teal-500/20' },
  'Heat Map':   { color: 'bg-red-500/10 text-red-600 dark:text-red-400',       border: 'border-red-200/60 dark:border-red-500/20' },
  Timeline:     { color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200/60 dark:border-indigo-500/20' },
  'AI Summary': { color: 'bg-aims-blue/10 text-aims-blue',                     border: 'border-aims-blue/20' },
}

// Skeleton-specific micro SVG mockup — gives each tile a visual hint of its chart type.
function SkeletonMock({ skeleton, isLarge }) {
  const h = isLarge ? 28 : 22
  const fill = 'currentColor'
  const bar = 'rounded-sm opacity-40'

  switch (skeleton) {
    case 'KPI':
      return (
        <div className="flex items-end gap-1 opacity-40">
          <span className="text-[15px] font-bold leading-none">84%</span>
          <span className="mb-0.5 text-[9px] text-green-500">▲2.1</span>
        </div>
      )
    case 'Chart':
      return (
        <svg width="100%" height={h} viewBox={`0 0 48 ${h}`} preserveAspectRatio="none" aria-hidden="true" className="opacity-40">
          {[6,10,7,14,9,12,11].map((v, i) => (
            <rect key={i} x={i * 7} y={h - v} width={5} height={v} rx={1.5} fill={fill} />
          ))}
        </svg>
      )
    case 'Donut':
    case 'Gauge': {
      const r = 10, cx = 14, cy = 14
      const arc = (pct) => {
        const angle = pct * 2 * Math.PI - Math.PI / 2
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
      }
      return (
        <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden="true" className="opacity-40">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={fill} strokeWidth={3} strokeOpacity={0.2} />
          <path d={`M ${cx},${cy - r} A ${r} ${r} 0 1 1 ${arc(0.72)}`} fill="none" stroke={fill} strokeWidth={3} strokeLinecap="round" />
        </svg>
      )
    }
    case 'Table':
      return (
        <div className="flex flex-col gap-1 opacity-35">
          {[100, 80, 65].map((w, i) => (
            <div key={i} className={`h-1.5 rounded-full bg-current`} style={{ width: `${w}%` }} />
          ))}
        </div>
      )
    case 'List':
      return (
        <div className="flex flex-col gap-1 opacity-35">
          {[90, 70, 55].map((w, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              <div className="h-1.5 rounded-full bg-current" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      )
    case 'Map':
      return (
        <svg width="100%" height={h} viewBox={`0 0 48 ${h}`} preserveAspectRatio="none" aria-hidden="true" className="opacity-30">
          {[[8,6],[22,10],[36,5],[14,16],[30,14],[8,20],[40,18]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.5} fill={fill} />
          ))}
        </svg>
      )
    case 'Timeline':
      return (
        <svg width="100%" height={h} viewBox={`0 0 48 ${h}`} preserveAspectRatio="none" aria-hidden="true" className="opacity-35">
          <line x1={0} y1={h / 2} x2={48} y2={h / 2} stroke={fill} strokeWidth={1.5} strokeOpacity={0.4} />
          {[4, 14, 26, 38, 46].map((x, i) => (
            <circle key={i} cx={x} cy={h / 2} r={2.5} fill={fill} />
          ))}
        </svg>
      )
    case 'AI Summary':
      return (
        <div className="flex flex-col gap-1 opacity-30">
          {[95, 80, 60].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-current" style={{ width: `${w}%` }} />
          ))}
        </div>
      )
    default:
      return null
  }
}

export default function DashboardDetailModal({ dashboard, isAdmin, onClose, onOpen, onEdit }) {
  const trapRef = useFocusTrap()
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const contentRef = useRef(null)
  const tilesRef = useRef(null)

  const { widgets } = useWidgets()

  // GSAP entrance: backdrop fade → panel scale-in → content stagger → tile stagger
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(backdropRef.current, { autoAlpha: 0, duration: 0.2 })

      gsap.from(panelRef.current, {
        y: 28,
        scale: 0.96,
        autoAlpha: 0,
        duration: 0.38,
        ease: 'power3.out',
      })

      const sections = contentRef.current?.querySelectorAll('[data-section]')
      if (sections?.length) {
        gsap.from(sections, {
          y: 10,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.3,
          ease: 'power2.out',
          delay: 0.14,
        })
      }

      const tiles = tilesRef.current?.querySelectorAll('[data-tile]')
      if (tiles?.length) {
        gsap.from(tiles, {
          scale: 0.82,
          autoAlpha: 0,
          stagger: { each: 0.04, from: 'start' },
          duration: 0.25,
          ease: 'back.out(1.6)',
          delay: 0.22,
        })
      }
    })
    return () => ctx.revert()
  }, [])

  if (!dashboard) return null

  const layout = dashboardLayout(dashboard)
  const kind = dashboardKind(dashboard)
  const placement = placementLabel(dashboard.placement)
  const count = widgetCount(dashboard)

  const widgetById = (id) => widgets.find((w) => w.id === id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={(el) => { panelRef.current = el; trapRef.current = el }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ddetail-title"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="card relative z-10 flex max-h-[88vh] w-[92vw] max-w-[640px] flex-col p-0 outline-none"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-200 p-4 dark:border-white/10">
          <span className="logo-sq shrink-0" style={{ background: 'var(--grad)' }}>
            <LayoutDashboard size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="ddetail-title" className="truncate text-base font-semibold text-gray-900 dark:text-slate-100">
              {dashboard.name}
            </h2>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <span className={`cap-chip shrink-0 ${kind === 'entity' ? 'cap-chip-blue' : 'cap-chip-neutral'}`}>
                {kind === 'entity' ? 'Profile' : 'Standalone'}
              </span>
              <span className="flex min-w-0 items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                <MapPin size={11} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{placement}</span>
              </span>
            </div>
          </div>
          <Badge variant={dashboard.status} />
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div ref={contentRef} className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          {/* Description */}
          {dashboard.description && (
            <p data-section className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">
              {dashboard.description}
            </p>
          )}

          {/* Meta pills */}
          <div data-section className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Users size={11} aria-hidden="true" /> {audienceLabel(dashboard.audience)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Owner · {dashboard.owner}
              {DEACTIVATED_OWNERS.includes(dashboard.owner) && (
                <span className="cap-chip cap-chip-neutral ml-0.5 !border-amber-300 !text-aims-ungoverned dark:!border-amber-500/30 dark:!text-amber-400">
                  offboarded
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {count} widget{count === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <Clock size={11} aria-hidden="true" /> {dashboard.updated}
            </span>
          </div>

          {/* Canvas blueprint */}
          <div data-section>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
              Canvas preview · {count} widget{count === 1 ? '' : 's'}
            </div>
            {layout.length === 0 ? (
              <div className="surface-sunken flex min-h-[80px] items-center justify-center rounded-xl text-xs text-gray-400 dark:text-slate-500">
                No widgets yet
              </div>
            ) : (
              <div ref={tilesRef} className="pointer-events-none surface-sunken grid grid-cols-3 gap-1.5 rounded-xl p-2">
                {layout.map((tile, i) => {
                  const w = widgetById(tile.widgetId)
                  const span = SIZE_SPAN[tile.size] || 'col-span-1'
                  const meta = SKELETON_META[w?.skeleton] || { color: 'bg-gray-400/10 text-gray-400', border: 'border-gray-200/60 dark:border-white/10' }
                  const isLarge = tile.size === 'lg'
                  return (
                    <div
                      key={tile.pid || i}
                      data-tile
                      className={`${span} flex flex-col gap-1.5 rounded-lg border bg-white p-2.5 dark:bg-[#131a2c] ${meta.border}`}
                      style={{ minHeight: isLarge ? '72px' : '60px' }}
                    >
                      {/* Top row: skeleton chip */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`w-fit rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${meta.color}`}>
                          {w?.skeleton || '—'}
                        </span>
                      </div>
                      {/* Micro mockup */}
                      <div className={`flex-1 overflow-hidden ${meta.color.split(' ')[1] || 'text-gray-400'}`}>
                        <SkeletonMock skeleton={w?.skeleton} isLarge={isLarge} />
                      </div>
                      {/* Widget name */}
                      <span className="truncate text-[10px] font-medium text-gray-600 dark:text-slate-300">
                        {w?.name || tile.widgetId}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-white/10">
          {isAdmin && (
            <button className="btn-secondary !py-1.5 text-xs" onClick={onEdit}>
              <Pencil size={14} aria-hidden="true" /> Edit canvas
            </button>
          )}
          <button className="btn-secondary !py-1.5 text-xs ml-auto" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary !py-1.5 text-xs" onClick={onOpen}>
            <Eye size={14} aria-hidden="true" /> Open dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
