import { useNavigate } from 'react-router-dom'
import { PencilRuler, X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { useModalEnter } from '../../hooks/useReveal.js'

export default function CreateWidgetModal({ onClose }) {
  const navigate = useNavigate()
  const trapRef  = useFocusTrap()
  useModalEnter(trapRef)

  function openBuilder() {
    navigate('/widgets/new')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-widget-title"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={trapRef}
        tabIndex={-1}
        className="card relative z-10 w-[92vw] max-w-[420px] overflow-hidden p-0 outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <h2 id="create-widget-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            New widget
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-5 px-8 py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.08]">
            <PencilRuler size={24} className="text-gray-500 dark:text-slate-300" aria-hidden="true" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Start from scratch</p>
            <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-gray-500 dark:text-slate-400">
              Map your own data source and metric in the widget builder.
            </p>
          </div>

          <button
            type="button"
            onClick={openBuilder}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-aims-blue text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <PencilRuler size={13} aria-hidden="true" />
            Open widget builder
          </button>
        </div>
      </div>
    </div>
  )
}
