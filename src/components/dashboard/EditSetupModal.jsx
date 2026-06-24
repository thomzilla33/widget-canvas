import { useState } from 'react'
import { X, Check, AlertTriangle, Info } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Button } from '@/components/ui/Button'
import PlacementForm, { overlaps } from './PlacementForm.jsx'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { placementLabel } from '../../data/mock.js'
import { dashboardLayout } from '../../data/layout.js'
import { audienceKey, audienceLabel } from '../../data/audiences.js'

// Recovery path for the placement/approach choice — change where a dashboard lives
// (profile type / scope / tab / surface / audience) or rename it AFTER creation.
// Reuses the exact PlacementForm from the create flow; saves via updateDashboard.
export default function EditSetupModal({ dashboard, onClose, onSave }) {
  const ref = useFocusTrap()
  const { dashboards } = useDashboards()
  const [form, setForm] = useState({ name: dashboard.name, audience: dashboard.audience, placement: dashboard.placement, valid: true })

  // Conflict-aware, but exclude THIS dashboard from the check.
  const conflict = dashboards.find((d) => d.id !== dashboard.id && audienceKey(d.audience) === audienceKey(form.audience) && overlaps(d.placement, form.placement))

  // Changing the dashboard audience can leave per-widget audience restrictions
  // pointing at the old role — warn (only) when that's actually the case.
  const hasRestricted = dashboardLayout(dashboard).some((p) => Array.isArray(p.audiences) && p.audiences.length > 0)
  const audienceChanged = audienceKey(form.audience) !== audienceKey(dashboard.audience) && hasRestricted

  const save = () => {
    const p = form.placement
    const entity = p.surface === 'profile' ? p.profileType : p.surface === 'report' ? 'Report' : 'Home'
    onSave({ name: form.name, audience: form.audience, placement: p, entity })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-setup-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[88vh] w-[92vw] max-w-[560px] flex-col p-0 outline-none">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <h2 id="edit-setup-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">Edit setup</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-4">
          <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
            <Info size={14} className="mt-0.5 shrink-0 text-aims-blue" aria-hidden="true" />
            <span>Change where this dashboard lives or rename it. <span className="font-medium text-gray-900 dark:text-slate-100">Your placed widgets stay</span> — only the profile context changes.</span>
          </div>

          <PlacementForm initial={{ name: dashboard.name, audience: dashboard.audience, placement: dashboard.placement }} onChange={setForm} />

          {conflict && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-aims-ungoverned" aria-hidden="true" />
              <div className="text-xs text-gray-600 dark:text-slate-300">
                <span className="font-semibold text-gray-900 dark:text-slate-100">Another dashboard lives here.</span>{' '}
                “{conflict.name}” already targets {placementLabel(conflict.placement)} · {audienceLabel(conflict.audience)}. Saving may cause overlap.
              </div>
            </div>
          )}

          {audienceChanged && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-aims-ungoverned" aria-hidden="true" />
              <div className="text-xs text-gray-600 dark:text-slate-300">
                <span className="font-semibold text-gray-900 dark:text-slate-100">Some widgets are restricted to {audienceLabel(dashboard.audience)}.</span>{' '}
                Changing the audience to {audienceLabel(form.audience)} may hide them — review each widget's audience on the canvas after saving.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!form.valid} onClick={save}>
            <Check size={15} aria-hidden="true" /> Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
