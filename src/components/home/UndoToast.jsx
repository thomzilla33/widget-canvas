import { useEffect, useRef } from 'react'
import { Undo2, X } from 'lucide-react'

// Bottom-center snackbar for reversible actions (archive, complete, snooze, mark-all-read).
// The parent owns the auto-dismiss timer; this just renders + supports Escape to dismiss.
export default function UndoToast({ message, onUndo, onClose }) {
  const undoRef = useRef(null)
  useEffect(() => {
    undoRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-slate-800"
    >
      <span className="line-clamp-2">{message}</span>
      {onUndo && (
        <button
          ref={undoRef}
          onClick={onUndo}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-cyan-300 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <Undo2 size={13} /> Undo
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  )
}
