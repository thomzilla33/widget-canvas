import { useRef, useState } from 'react'
import { X, Check, Send } from 'lucide-react'
import { EmptyState } from '../common/index.jsx'
import { useFeedback } from '../../state/FeedbackContext.jsx'
import { FLAG_REASONS, CANNED_ANSWER } from '../../data/mock.js'

// S23/S24 (flag) and S26/S27 (ask) — right-side slide-over, two modes.
export default function FeedbackPanel({ mode, widget, entityId, onClose }) {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-10 dark:bg-[#0f1629] dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <span className="font-semibold text-gray-900 dark:text-slate-100">
          {mode === 'flag' ? 'Flag data issue' : 'Ask about data'}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
          <X size={18} />
        </button>
      </div>
      {mode === 'flag' ? (
        <FlagForm widget={widget} entityId={entityId} onClose={onClose} />
      ) : (
        <AskChat widget={widget} />
      )}
    </div>
  )
}

/* S23 → S24 */
function FlagForm({ widget, entityId, onClose }) {
  const { addFlag } = useFeedback()
  const [reason, setReason] = useState(FLAG_REASONS[0])
  const [details, setDetails] = useState('')
  const [done, setDone] = useState(false)

  function submit() {
    addFlag({
      widgetId: widget?.id,
      entityId,
      reason,
      details: details.trim(),
      reporter: 'You (Sales Agent)',
      createdAt: 'just now',
    })
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <EmptyState
          icon="🚩"
          title="Flag submitted"
          description={`Sent to the data owner of “${widget?.name}”. You'll be notified when it's reviewed.`}
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="text-xs text-gray-500 dark:text-slate-400">Widget: {widget?.name}</div>
        <div>
          <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Reason</div>
          <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {FLAG_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Details</div>
          <textarea
            className="input"
            rows={4}
            placeholder="What looks wrong?"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
      </div>
      <div className="border-t border-gray-200 p-3 dark:border-white/10">
        <button className="btn-primary w-full" onClick={submit}>
          <Check size={15} /> Submit flag
        </button>
      </div>
    </>
  )
}

/* S26 → S27 */
function AskChat({ widget }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const idRef = useRef(0)

  function send() {
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [...m, { id: ++idRef.current, role: 'user', text }])
    setDraft('')
    setTimeout(() => {
      setMessages((m) => [...m, { id: ++idRef.current, role: 'assistant', text: CANNED_ANSWER }])
    }, 500)
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-4 space-y-2.5">
        <div className="text-xs text-gray-500 dark:text-slate-400">Asking about: {widget?.name}</div>
        {messages.length === 0 && (
          <div className="text-xs text-gray-400 dark:text-slate-500">
            Ask anything about how this widget is calculated or sourced.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-aims-blue text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-slate-200'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 p-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <input
            className="input"
            placeholder="Ask a question…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="btn-primary !px-3" onClick={send} aria-label="Send">
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  )
}
