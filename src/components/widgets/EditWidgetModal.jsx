import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { CATALOG_CATEGORIES } from '../../data/mock.js'
import { FormatPanel } from '../playground/BuilderPanels.jsx'
import WidgetRender from './WidgetRender.jsx'
import { Button } from '@/components/ui/Button'

const DEFAULT_FORMAT = { style: 'auto', decimals: 0, abbreviate: true, prefix: '', suffix: '' }
const DEFAULT_GOAL = { value: null, direction: 'higher' }

// Real "Update" for a saved widget — the SAFE, non-structural fields (name, category,
// number format, goal). Metric / type / source stay create-only because placements
// depend on them; changing those = build a new widget. Opened from the detail modal.
export default function EditWidgetModal({ widget, onClose }) {
  const ref = useFocusTrap()
  const { updateWidget } = useWidgets()
  const [name, setName] = useState(widget.name)
  const [category, setCategory] = useState(widget.category || CATALOG_CATEGORIES[0])
  const [format, setFormatState] = useState(widget.format || DEFAULT_FORMAT)
  const [goal, setGoalState] = useState(widget.goal || DEFAULT_GOAL)
  const setFormat = (patch) => setFormatState((f) => ({ ...f, ...patch }))
  const setGoal = (patch) => setGoalState((g) => ({ ...g, ...patch }))

  const canSave = name.trim().length > 0
  // Normalize the same way the builder does, so an 'auto' format / empty goal is stored
  // as undefined (no override) rather than a dummy object.
  const cleanFormat = format.style === 'auto' ? undefined : format
  const cleanGoal = goal.value != null ? goal : undefined
  const preview = { ...widget, name: name.trim() || widget.name, category, format: cleanFormat, goal: cleanGoal }

  function save() {
    if (!canSave) return
    updateWidget(widget.id, { name: name.trim(), category, format: cleanFormat, goal: cleanGoal })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-widget-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="card relative z-10 flex max-h-[88vh] w-[92vw] max-w-[560px] flex-col p-0 outline-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/10">
          <h2 id="edit-widget-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">Edit widget</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          <div>
            <label htmlFor="ew-name" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Name</label>
            <input id="ew-name" className="input h-9" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label htmlFor="ew-cat" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Category</label>
            <select id="ew-cat" className="input h-9" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATALOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Format &amp; display</div>
            <FormatPanel format={format} setFormat={setFormat} goal={goal} setGoal={setGoal} />
          </div>
          {/* Live preview — reflects name + format + goal as you edit. */}
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Preview</div>
            <div className="surface-sunken pointer-events-none rounded-lg p-3">
              <WidgetRender widget={preview} size="md" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            Source, metric, and chart type are set at creation — to change those, create a new widget.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-3 dark:border-white/10">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!canSave} onClick={save}>
            <Check size={14} aria-hidden="true" /> Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
