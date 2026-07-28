import { useState } from 'react'
import { X, Check, AlertTriangle, Users } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Button } from '@/components/ui/Button'
import { Chip, overlaps } from './PlacementForm.jsx'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { placementLabel } from '../../data/mock.js'
import { dashboardLayout } from '../../data/layout.js'
import { audienceKey, audienceLabel, AUDIENCE_TYPES, AUDIENCE_TARGETS, normalizeAudience } from '../../data/audiences.js'

// Audience editor — invoked from the ··· overflow menu ("Edit setup").
// Name is edited inline on the canvas; section is changed via "Change section" in the same menu.
export default function EditSetupModal({ dashboard, onClose, onSave }) {
  const ref = useFocusTrap()
  const { dashboards } = useDashboards()
  const a0 = normalizeAudience(dashboard.audience)
  const [audType, setAudType] = useState(a0.type)
  const [audTarget, setAudTarget] = useState(a0.label || AUDIENCE_TARGETS[a0.type]?.[0] || '')
  const audience = audType === 'global' ? { type: 'global' } : { type: audType, label: audTarget }

  // Conflict: another dashboard already covers this same placement + new audience.
  const conflict = dashboards.find(
    (d) => d.id !== dashboard.id && audienceKey(d.audience) === audienceKey(audience) && overlaps(d.placement, dashboard.placement),
  )

  // Audience-change warning: existing widgets have per-widget audience restrictions.
  const hasRestricted = dashboardLayout(dashboard).some((p) => Array.isArray(p.audiences) && p.audiences.length > 0)
  const audienceChanged = audienceKey(audience) !== audienceKey(dashboard.audience) && hasRestricted

  function selectAudType(id) {
    setAudType(id)
    if (id !== 'global') setAudTarget(AUDIENCE_TARGETS[id]?.[0] || '')
  }

  const save = () => onSave({ audience })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-setup-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[88vh] w-[92vw] max-w-[400px] flex-col p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <h2 id="edit-setup-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">Edit setup</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-5">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">
              <Users size={14} className="text-aims-blue" aria-hidden="true" />
              Audience
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {AUDIENCE_TYPES.map((t) => (
                  <Chip key={t.id} active={audType === t.id} onClick={() => selectAudType(t.id)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
              {audType === 'global' ? (
                <p className="text-xs text-gray-500 dark:text-slate-400">{AUDIENCE_TYPES[0].hint} — anyone with access can see this.</p>
              ) : (
                <select className="input" value={audTarget} onChange={(e) => setAudTarget(e.target.value)} aria-label={`Choose ${audType}`}>
                  {(AUDIENCE_TARGETS[audType] || []).map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {conflict && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-aims-ungoverned" aria-hidden="true" />
              <div className="text-xs text-gray-600 dark:text-slate-300">
                <span className="font-semibold text-gray-900 dark:text-slate-100">Another dashboard lives here.</span>{' '}
                "{conflict.name}" already targets {placementLabel(conflict.placement)} · {audienceLabel(conflict.audience)}. Saving may cause overlap.
              </div>
            </div>
          )}

          {audienceChanged && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-aims-ungoverned" aria-hidden="true" />
              <div className="text-xs text-gray-600 dark:text-slate-300">
                <span className="font-semibold text-gray-900 dark:text-slate-100">Some widgets are restricted to {audienceLabel(dashboard.audience)}.</span>{' '}
                Changing the audience to {audienceLabel(audience)} may hide them — review each widget's audience on the canvas after saving.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>
            <Check size={15} aria-hidden="true" /> Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
