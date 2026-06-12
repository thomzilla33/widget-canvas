import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, FileUp } from 'lucide-react'
import { useDashboards } from '../../state/DashboardsContext.jsx'

const SAMPLE = JSON.stringify(
  { name: 'Account 360', entity: 'Account', audience: 'All audiences', template: 't-acct360', widgets: 3 },
  null,
  2,
)

// S110 — import template (a draft dashboard arrives)
export default function ImportModal({ onClose }) {
  const { addDashboard } = useDashboards()
  const navigate = useNavigate()
  const [code, setCode] = useState(SAMPLE)
  const [imported, setImported] = useState(null) // { id, name }
  const seq = useRef(0)

  function doImport() {
    let p = {}
    try {
      p = JSON.parse(code)
    } catch {
      p = {}
    }
    seq.current += 1
    const base = (p.name || 'Imported template').trim()
    const name = `${base} (imported)`
    const id = `d-import-${seq.current}-${base.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    addDashboard({
      id,
      name,
      entity: p.entity || 'Account',
      audience: p.audience || 'All audiences',
      template: p.template || null,
      status: 'draft',
      widgets: p.widgets || 0,
      updated: 'just now',
    })
    setImported({ id, name })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex w-[520px] max-w-full flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <FileUp size={16} className="text-aims-blue" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">Import template</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {imported ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/25 dark:bg-green-500/10">
              <Check size={28} className="text-aims-governed" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Draft imported</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
              “{imported.name}” was added to your dashboards as a draft. Open it to review and publish.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button className="btn-secondary" onClick={onClose}>
                Back to list
              </button>
              <button className="btn-primary" onClick={() => navigate(`/dashboard/${imported.id}/canvas`)}>
                Open draft
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-2">
              <div className="text-sm text-gray-600 dark:text-slate-300">
                Paste a template code to import it as a new draft dashboard.
              </div>
              <textarea
                className="input font-mono text-xs"
                rows={8}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={doImport}>
                <FileUp size={15} /> Import as draft
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
