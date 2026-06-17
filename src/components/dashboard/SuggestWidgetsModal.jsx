import { useMemo } from 'react'
import { Sparkles, X, Plus } from 'lucide-react'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { suggestWidgetsForProfile } from '../../data/suggestions.js'

// U3 — "✨ Suggest widgets": ranked, reasoned widget suggestions for a dashboard's
// profile type. Add one or Add all; each card explains why it was suggested.
export default function SuggestWidgetsModal({ profileType, placedIds = [], onAdd, onClose }) {
  const ref = useFocusTrap()
  const suggestions = useMemo(() => suggestWidgetsForProfile(profileType, placedIds), [profileType, placedIds])

  // Adding a widget removes it from the list (placedIds → useMemo recompute), which is
  // the confirmation. addAll snapshots the current list so the loop isn't disturbed.
  const addAll = () => suggestions.forEach((s) => onAdd(s.widget))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="suggest-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[85vh] w-[90vw] max-w-[560px] flex-col overflow-hidden p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/10">
          <div>
            <h2 id="suggest-title" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <Sparkles size={16} className="text-aims-blue" /> Suggested widgets
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Ranked for {profileType} profiles — add what fits.</p>
          </div>
          <div className="flex items-center gap-2">
            {suggestions.length > 0 && (
              <button onClick={addAll} className="btn-secondary !py-1.5 !px-3 text-xs">Add all</button>
            )}
            <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {suggestions.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">No strong suggestions — everything relevant is already placed.</div>
          ) : (
            <div className="space-y-2.5">
              {suggestions.map(({ widget: w, why }) => (
                <div key={w.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2.5 dark:border-white/10">
                  <div className="pointer-events-none h-[52px] w-[88px] shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50/40 px-1.5 py-1 dark:border-white/10 dark:bg-white/[0.02]">
                    <WidgetRender widget={w} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{w.name}</div>
                    <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">{w.skeleton} · {w.source}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-aims-blue">
                      <Sparkles size={10} aria-hidden="true" /> {why}
                    </div>
                  </div>
                  <button
                    onClick={() => onAdd(w)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-aims-blue px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-aims-blue/90"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
