import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ChevronDown, PenSquare, Search, MoreHorizontal, X, Plus, FileText, Mic, ArrowUp, Sparkles } from 'lucide-react'

// Docked "UCP Concierge" — the internal chat that ships open by default on every
// UCP. Stays MOUNTED across open/close (conversation persists); width is
// drag-resizable. Slides in via transform (compositor-only) so the widget reflow
// beside it stays smooth. Deterministic canned replies (demo).

const MIN_W = 300
const MAX_W = 620

function reply(q, entityName) {
  const ql = q.toLowerCase()
  const tail = ' (Demo — canned response.)'
  if (/summar|overview|status|how.*doing/.test(ql)) return `${entityName} is healthy: recent activity is on track and there are no open escalations. Last touch was 4h ago.${tail}`
  if (/email|reach|contact|follow/.test(ql)) return `I can draft a follow-up email to ${entityName}. Want a billing-update tone or a check-in?${tail}`
  if (/risk|churn|issue|problem/.test(ql)) return `No risk flags on ${entityName} right now. The one item to watch is the open billing dispute — response expected within 24h.${tail}`
  if (/widget|dashboard|build|create/.test(ql)) return `Tell me the metric and I'll suggest a widget for this profile — e.g. "open tickets by status" → a donut.${tail}`
  return `For "${q}" on ${entityName}: everything is within range. Try asking for a summary, a draft email, or a widget suggestion.${tail}`
}

const PROMPTS = ['Summarize this contact', 'Draft a follow-up email', 'Any risks I should know?']

export default function UcpConcierge({ entity, open, onClose }) {
  const entityName = entity?.name || 'this contact'
  const asideRef = useRef(null)
  const innerRef = useRef(null)
  const scrollRef = useRef(null)
  const [width, setWidth] = useState(380)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [msgs, setMsgs] = useState([
    { from: 'agent', text: `Hi — I'm the concierge for ${entityName}. Ask me for a summary, to draft an email, or to suggest a widget for this profile.` },
  ])

  // Slide the inner content in whenever the panel opens (transform + opacity only).
  useEffect(() => {
    if (!open || !innerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tw = gsap.fromTo(innerRef.current, { xPercent: 10, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' })
    return () => tw.kill()
  }, [open])

  const scrollToEnd = () => requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight })

  const send = (text) => {
    const q = (text ?? draft).trim()
    if (!q) return
    setMsgs((m) => [...m, { from: 'user', text: q }])
    setDraft('')
    setTyping(true)
    scrollToEnd()
    // Simulate the agent thinking, then answer (keeps the typing indicator honest).
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'agent', text: reply(q, entityName) }])
      setTyping(false)
      scrollToEnd()
    }, 650)
  }

  // Drag-to-resize from the left edge. Mutates this panel's width via React state;
  // the sibling content is flex-1 so the browser reflows it live (no parent render).
  const startResize = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = asideRef.current?.offsetWidth || width
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    const move = (ev) => setWidth(Math.min(MAX_W, Math.max(MIN_W, startW + (startX - ev.clientX))))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onlyGreeting = msgs.length === 1

  return (
    <aside
      ref={asideRef}
      style={{ width: open ? width : 0 }}
      className={`relative h-full shrink-0 overflow-hidden bg-white dark:bg-[#0f1629] ${open ? 'border-l border-gray-200 dark:border-white/10' : ''}`}
      aria-label="UCP Concierge"
      aria-hidden={!open}
    >
      {/* Resize handle — left edge */}
      {open && (
        <div
          onPointerDown={startResize}
          role="separator"
          aria-label="Resize concierge"
          aria-orientation="vertical"
          title="Drag to resize"
          className="group absolute left-0 top-0 z-10 h-full w-1.5 cursor-col-resize"
        >
          <span className="absolute left-0 top-0 h-full w-0.5 bg-transparent transition-colors group-hover:bg-aims-blue/50" />
        </div>
      )}

      <div ref={innerRef} className="flex h-full flex-col" style={{ width }}>
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-3 dark:border-white/10">
          <button className="flex min-w-0 items-center gap-1 text-sm font-semibold text-gray-900 dark:text-slate-100" aria-label="Concierge menu">
            <span className="truncate">UCP Concierge</span>
            <ChevronDown size={15} className="shrink-0 text-gray-400" aria-hidden="true" />
          </button>
          <div className="ml-auto flex items-center gap-0.5 text-gray-400 dark:text-slate-500">
            <IconBtn label="New chat" onClick={() => { setMsgs([msgs[0]]); setDraft('') }}><PenSquare size={16} /></IconBtn>
            <IconBtn label="Search"><Search size={16} /></IconBtn>
            <IconBtn label="More"><MoreHorizontal size={16} /></IconBtn>
            <IconBtn label="Close" onClick={onClose}><X size={16} /></IconBtn>
          </div>
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'flex justify-end' : ''}>
              {m.from === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-aims-blue/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 dark:bg-aims-blue/15 dark:text-slate-100">{m.text}</div>
              ) : (
                <div className="max-w-[92%] text-[13px] leading-relaxed text-gray-700 dark:text-slate-200">{m.text}</div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-1" aria-label="Concierge is typing">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s] dark:bg-slate-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s] dark:bg-slate-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-slate-500" />
            </div>
          )}
        </div>

        {/* Suggested prompts (only on a fresh thread) */}
        {onlyGreeting && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} className="inline-flex items-center gap-1 rounded-full border border-aims-blue/30 bg-aims-blue/5 px-2.5 py-1 text-[11px] font-medium text-aims-blue hover:bg-aims-blue/10">
                <Sparkles size={10} aria-hidden="true" /> {p}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="px-3 pb-3">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-aims-blue/50 dark:border-white/15 dark:bg-white/5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Ask anything"
              aria-label="Ask the concierge"
              className="w-full bg-transparent px-3.5 pt-3 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <div className="flex items-center gap-1 px-2 pb-2 pt-1.5">
              <IconBtn label="Attach"><Plus size={17} /></IconBtn>
              <IconBtn label="Documents"><FileText size={16} /></IconBtn>
              <div className="ml-auto flex items-center gap-1.5">
                <button className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10">
                  GPT 5.2 <ChevronDown size={12} aria-hidden="true" />
                </button>
                <button
                  onClick={() => send()}
                  aria-label="Send"
                  className="grid h-7 w-7 place-items-center rounded-full bg-aims-blue text-white transition-transform hover:scale-105 disabled:opacity-40"
                  disabled={!draft.trim()}
                >
                  {draft.trim() ? <ArrowUp size={15} /> : <Mic size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function IconBtn({ children, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
    >
      {children}
    </button>
  )
}
