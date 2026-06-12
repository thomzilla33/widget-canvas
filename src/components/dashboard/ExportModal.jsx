import { useState } from 'react'
import { X, Copy, Check, Download } from 'lucide-react'

// S109 — export template confirmation (copyable template code)
export default function ExportModal({ dashboard, onClose }) {
  const [copied, setCopied] = useState(false)
  const code = JSON.stringify(
    {
      name: dashboard?.name,
      entity: dashboard?.entity,
      audience: dashboard?.audience,
      template: dashboard?.template ?? null,
      widgets: dashboard?.widgets ?? 0,
    },
    null,
    2,
  )

  function copy() {
    try {
      navigator.clipboard?.writeText(code)
    } catch {
      /* ignore */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex w-[520px] max-w-full flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-aims-blue" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">Export template — {dashboard?.name}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-500/25 dark:bg-green-500/10">
            <Check size={18} className="mt-0.5 shrink-0 text-aims-governed" />
            <div className="text-sm text-gray-700 dark:text-slate-200">
              Template ready to export. Copy this code and import it into another workspace.
            </div>
          </div>
          <textarea
            readOnly
            className="input font-mono text-xs"
            rows={8}
            value={code}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <button className="btn-secondary" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy code'}
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
