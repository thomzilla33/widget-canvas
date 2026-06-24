import { X, LayoutDashboard, MapPin, Users, Pencil, Eye } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Badge } from '../common/index.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { dashboardLayout, widgetCount } from '../../data/layout.js'
import { placementLabel, dashboardKind, DEACTIVATED_OWNERS } from '../../data/mock.js'
import { audienceLabel } from '../../data/audiences.js'

const SIZE_SPAN = { sm: 'col-span-1', md: 'col-span-2', lg: 'col-span-3' }

const SKELETON_COLOR = {
  KPI:        'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Chart:      'bg-green-500/10 text-green-600 dark:text-green-400',
  Gauge:      'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Table:      'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  List:       'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Map:        'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'Heat Map': 'bg-red-500/10 text-red-600 dark:text-red-400',
  Timeline:   'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'AI Summary': 'bg-aims-blue/10 text-aims-blue',
}

export default function DashboardDetailModal({ dashboard, isAdmin, onClose, onOpen, onEdit }) {
  const ref = useFocusTrap()
  const { widgets } = useWidgets()
  if (!dashboard) return null

  const layout = dashboardLayout(dashboard)
  const kind = dashboardKind(dashboard)
  const placement = placementLabel(dashboard.placement)
  const count = widgetCount(dashboard)

  const widgetById = (id) => widgets.find((w) => w.id === id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
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

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          {/* Description */}
          {dashboard.description && (
            <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{dashboard.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Users size={11} aria-hidden="true" /> {audienceLabel(dashboard.audience)}
            </span>
            <span>
              Owner · {dashboard.owner}
              {DEACTIVATED_OWNERS.includes(dashboard.owner) && (
                <span className="cap-chip cap-chip-neutral ml-1.5 !border-amber-300 !text-aims-ungoverned dark:!border-amber-500/30 dark:!text-amber-400">offboarded</span>
              )}
            </span>
            <span>{count} widget{count === 1 ? '' : 's'}</span>
            <span>Updated {dashboard.updated}</span>
          </div>

          {/* Canvas blueprint */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
              Canvas preview
            </div>
            {layout.length === 0 ? (
              <div className="surface-sunken flex min-h-[80px] items-center justify-center rounded-xl text-xs text-gray-400 dark:text-slate-500">
                No widgets yet
              </div>
            ) : (
              <div className="pointer-events-none surface-sunken grid grid-cols-3 gap-1.5 rounded-xl p-2">
                {layout.map((tile, i) => {
                  const w = widgetById(tile.widgetId)
                  const span = SIZE_SPAN[tile.size] || 'col-span-1'
                  const colorCls = SKELETON_COLOR[w?.skeleton] || 'bg-gray-400/10 text-gray-500 dark:text-slate-400'
                  return (
                    <div
                      key={tile.pid || i}
                      className={`${span} flex min-h-[56px] flex-col justify-between rounded-lg border border-gray-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#131a2c]`}
                    >
                      <span className={`w-fit rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${colorCls}`}>
                        {w?.skeleton || '—'}
                      </span>
                      <span className="mt-1.5 truncate text-[10px] font-medium text-gray-700 dark:text-slate-200">
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
