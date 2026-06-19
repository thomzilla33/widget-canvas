import { useState } from 'react'
import { X, LayoutGrid, RefreshCw, Plus, LayoutDashboard, Trash2, Pencil } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { HealthBadge, FreshnessBadge, DataPlaneBadge } from '../common/index.jsx'
import { dataPlaneOf } from '../../data/governance.js'
import { WidgetGlyph } from './glyph.jsx'
import WidgetRender from './WidgetRender.jsx'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { dashboardLayout } from '../../data/layout.js'
import { WIDGET_SIZES, SKELETON_ABOUT, SKELETON_BESTFOR } from '../../data/mock.js'

const PREVIEW_WIDTH = { sm: 'max-w-[240px]', md: 'max-w-md', lg: 'max-w-2xl' }

// Tier 2 — the consume seam for an existing widget. Clicking a Library card opens
// THIS (preview + meta + where-it's-used + actions), not the builder. The builder
// only creates net-new widgets, so there's no "edit" here — place, remap, or delete.
export default function WidgetDetailModal({ widget, isAdmin, onClose, onPlace, onRemap, onDelete, onEdit, onOpenDashboard }) {
  const ref = useFocusTrap()
  const { dashboards } = useDashboards()
  const [size, setSize] = useState('md')
  if (!widget) return null

  const sizeMeta = WIDGET_SIZES.find((s) => s.id === size)
  const needsRemap = widget.health === 'review'
  // Dashboards hosting this widget — from the resolved layout (template seed OR
  // persisted edits), so this matches the live count shown on the Library card.
  const usedOn = dashboards.filter((d) =>
    dashboardLayout(d).some((p) => p.widgetId === widget.id),
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wdetail-title"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="card relative z-10 flex max-h-[88vh] w-[92vw] max-w-[560px] flex-col p-0 outline-none"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-200 p-4 dark:border-white/10">
          <WidgetGlyph skeleton={widget.skeleton} />
          <div className="min-w-0 flex-1">
            <h2 id="wdetail-title" className="truncate text-base font-semibold text-gray-900 dark:text-slate-100">{widget.name}</h2>
            <div className="truncate text-xs text-gray-500 dark:text-slate-400">{widget.source}</div>
          </div>
          <HealthBadge health={widget.health} />
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          {/* Chips (deviation-only, matches the card) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="cap-chip cap-chip-neutral">{widget.skeleton}</span>
            {!widget.governed && <span className="cap-chip cap-chip-tool">Ungoverned</span>}
            <DataPlaneBadge plane={dataPlaneOf(widget)} />
            <FreshnessBadge status={widget.freshness} label={widget.freshness} />
          </div>

          {/* Preview with size selector */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Preview</span>
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-white/10">
                {WIDGET_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                      size === s.id ? 'bg-aims-blue text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={`pointer-events-none mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-white/10 dark:bg-[#131a2c] ${PREVIEW_WIDTH[size]}`}>
              <WidgetRender widget={widget} size={size} />
            </div>
            {sizeMeta && <p className="mt-2 text-center text-[11px] text-gray-400 dark:text-slate-500">{sizeMeta.width} · {sizeMeta.detail}</p>}
          </div>

          {/* About / Best for */}
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox icon={LayoutGrid} label="About">{SKELETON_ABOUT[widget.skeleton] || `A ${widget.skeleton} tile.`}</InfoBox>
            <InfoBox icon={LayoutDashboard} label="Best for">{SKELETON_BESTFOR[widget.skeleton] || 'General-purpose dashboards.'}</InfoBox>
          </div>

          {/* Where it's used */}
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
              Used on {usedOn.length} dashboard{usedOn.length === 1 ? '' : 's'}
            </div>
            {usedOn.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-slate-400">Not placed yet — add it to a dashboard to put it to work.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {usedOn.slice(0, 6).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onOpenDashboard?.(d.id)}
                    title={`Open ${d.name}`}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600 transition-colors hover:border-aims-blue/50 hover:bg-aims-blue/5 hover:text-aims-blue dark:border-white/10 dark:text-slate-300 dark:hover:border-aims-blue/50"
                  >
                    <LayoutDashboard size={11} aria-hidden="true" /> {d.name}
                  </button>
                ))}
                {usedOn.length > 6 && <span className="text-[11px] text-gray-400 dark:text-slate-500">+{usedOn.length - 6} more</span>}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-white/10">
          {/* Delete (admin) → opens the staged GitHub-style confirm (impact + type-to-confirm). */}
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(widget)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 size={14} aria-hidden="true" /> Delete
            </button>
          )}
          {/* Edit (admin) — safe, non-structural fields. System widgets aren't editable. */}
          {isAdmin && onEdit && !widget.system && (
            <button className="btn-secondary !py-1.5 text-xs ml-auto" onClick={onEdit}>
              <Pencil size={14} aria-hidden="true" /> Edit
            </button>
          )}
          <button className={`btn-secondary !py-1.5 text-xs ${isAdmin && onEdit && !widget.system ? '' : 'ml-auto'}`} onClick={onClose}>Close</button>
          {needsRemap ? (
            <button className="btn-primary !py-1.5 text-xs" onClick={onRemap}>
              <RefreshCw size={14} aria-hidden="true" /> Remap widget
            </button>
          ) : (
            isAdmin && (
              <button className="btn-primary !py-1.5 text-xs" onClick={onPlace}>
                <Plus size={14} aria-hidden="true" /> Add to a dashboard
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBox({ icon: Icon, label, children }) {
  return (
    <div className="surface-sunken rounded-lg p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
        <Icon size={12} aria-hidden="true" /> {label}
      </div>
      <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
    </div>
  )
}
