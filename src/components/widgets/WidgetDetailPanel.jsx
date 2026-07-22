import { useEffect, useRef } from 'react'
import { X, LayoutGrid, RefreshCw, Plus, LayoutDashboard, Trash2, Pencil } from 'lucide-react'
import { HealthBadge, FreshnessBadge, DataPlaneBadge } from '../common/index.jsx'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { dataPlaneOf } from '../../data/governance.js'
import { WidgetGlyph } from './glyph.jsx'
import WidgetRender from './WidgetRender.jsx'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { dashboardLayout } from '../../data/layout.js'
import { SKELETON_ABOUT, SKELETON_BESTFOR } from '../../data/mock.js'

// Non-modal right slide-over — content area stays visible and interactive.
// No backdrop dim. Closes on Esc or click outside (the main page area).
export default function WidgetDetailPanel({ widget, isAdmin, onClose, onEditFull, onPlace, onRemap, onDelete, onOpenDashboard }) {
  const panelRef = useRef(null)
  const { dashboards } = useDashboards()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Close on click outside the panel (but not on close-button clicks inside it)
  useEffect(() => {
    const onPointer = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    // Use capture so we get the event before the target's own handlers
    document.addEventListener('pointerdown', onPointer, true)
    return () => document.removeEventListener('pointerdown', onPointer, true)
  }, [onClose])

  if (!widget) return null

  const needsRemap = widget.health === 'review'
  const usedOn = dashboards.filter((d) =>
    dashboardLayout(d).some((p) => p.widgetId === widget.id),
  )

  return (
    <div
      ref={panelRef}
      role="complementary"
      aria-label={`${widget.name} details`}
      className="fixed right-0 top-0 z-40 flex h-full w-[320px] flex-col border-l border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#131a2c]"
      style={{ animation: 'slideInRight 0.18s ease-out' }}
    >
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      {/* Header */}
      <div className="flex shrink-0 items-start gap-3 border-b border-gray-200 p-4 dark:border-white/10">
        <WidgetGlyph skeleton={widget.skeleton} source={widget.source} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{widget.name}</h2>
          <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{widget.source}</div>
        </div>
        <HealthBadge health={widget.health} />
        <button onClick={onClose} aria-label="Close panel" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag variant="neutral" size="sm">{widget.skeleton}</Tag>
          {!widget.governed && <Tag variant="alert" size="sm">Ungoverned</Tag>}
          <DataPlaneBadge plane={dataPlaneOf(widget)} />
          <FreshnessBadge status={widget.freshness} label={widget.freshness} />
        </div>

        {/* Preview */}
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Preview</div>
          <div className="pointer-events-none rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#0d1117]">
            <WidgetRender widget={widget} size="md" />
          </div>
        </div>

        {/* About / Best for */}
        <div className="space-y-2">
          <InfoBox icon={LayoutGrid} label="About">{SKELETON_ABOUT[widget.skeleton] || `A ${widget.skeleton} tile.`}</InfoBox>
          <InfoBox icon={LayoutDashboard} label="Best for">{SKELETON_BESTFOR[widget.skeleton] || 'General-purpose dashboards.'}</InfoBox>
        </div>

        {/* Used on */}
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
            Used on {usedOn.length} dashboard{usedOn.length === 1 ? '' : 's'}
          </div>
          {usedOn.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-slate-400">Not placed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {usedOn.slice(0, 5).map((d) => (
                <button
                  key={d.id}
                  onClick={() => onOpenDashboard?.(d.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600 transition-colors hover:border-aims-blue/50 hover:bg-aims-blue/5 hover:text-aims-blue dark:border-white/10 dark:text-slate-300 dark:hover:border-aims-blue/50"
                >
                  <LayoutDashboard size={11} aria-hidden="true" /> {d.name}
                </button>
              ))}
              {usedOn.length > 5 && <span className="text-[11px] text-gray-400 dark:text-slate-500">+{usedOn.length - 5} more</span>}
            </div>
          )}
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-gray-200 p-3 dark:border-white/10">
        {isAdmin && onDelete && !widget.system && (
          <button
            onClick={() => onDelete(widget)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 size={13} aria-hidden="true" /> Delete
          </button>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {isAdmin && onEditFull && !widget.system && (
            <Button variant="secondary" size="sm" onClick={onEditFull}>
              <Pencil size={13} aria-hidden="true" /> Edit full config
            </Button>
          )}
          {needsRemap ? (
            <Button variant="primary" size="sm" onClick={onRemap}>
              <RefreshCw size={13} aria-hidden="true" /> Remap
            </Button>
          ) : (
            isAdmin && (
              <Button variant="primary" size="sm" onClick={onPlace}>
                <Plus size={13} aria-hidden="true" /> Add to dashboard
              </Button>
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
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
        <Icon size={11} aria-hidden="true" /> {label}
      </div>
      <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
    </div>
  )
}
