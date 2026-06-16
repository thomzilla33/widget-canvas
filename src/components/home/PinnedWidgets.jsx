import { useCallback, useEffect, useRef, useState } from 'react'
import InboxCard from './InboxCard.jsx'
import TasksCard from './TasksCard.jsx'
import HtlCard from './HtlCard.jsx'
import UndoToast from './UndoToast.jsx'

const TOAST_MS = 5000

// Home pinned widgets: Inbox, Tasks, and the Human Touch Layer. Owns a single
// undo toast so reversible actions (archive, complete, snooze, mark-all-read)
// can be recovered from one place.
export default function PinnedWidgets() {
  const [toast, setToast] = useState(null) // { message, onUndo }
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const dismiss = useCallback(() => {
    clearTimeout(timer.current)
    setToast(null)
  }, [])
  const notify = useCallback((message, onUndo) => {
    clearTimeout(timer.current)
    setToast({ message, onUndo })
    timer.current = setTimeout(() => setToast(null), TOAST_MS)
  }, [])
  const undo = () => {
    toast?.onUndo?.()
    dismiss()
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <InboxCard notify={notify} />
        <TasksCard notify={notify} />
      </div>
      <HtlCard />
      {toast && <UndoToast message={toast.message} onUndo={toast.onUndo ? undo : null} onClose={dismiss} />}
    </div>
  )
}
