import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import {
  Sparkles, X, ArrowUp, Mic, PenSquare, Search, MoreHorizontal,
} from 'lucide-react'
import { HOME_COPILOTS, GOV_EVENTS, HOME_WORKFLOWS, HTL_ITEMS } from '../../data/home.js'

// ── Context-aware suggestions ─────────────────────────────────────────────────
const blockingGov = GOV_EVENTS.filter(g => g.blocking)
const failingWf   = HOME_WORKFLOWS.filter(w => w.status === 'failed')
const urgentHtl   = HTL_ITEMS.filter(i => i.priority === 'high')

function buildSuggestions() {
  const s = []
  if (blockingGov.length > 0)
    s.push(`Summarize the ${blockingGov.length} blocked governance event${blockingGov.length !== 1 ? 's' : ''}`)
  if (failingWf.length > 0)
    s.push(`What's causing ${failingWf[0].name} to fail?`)
  if (urgentHtl.length > 0)
    s.push(`Draft a response for the high-priority HITL pause`)
  s.push('What should I focus on today?')
  return s.slice(0, 3)
}

const SUGGESTIONS = buildSuggestions()

function demoReply(q) {
  const ql = q.toLowerCase()
  if (/governance|blocked|block/.test(ql))
    return `There ${blockingGov.length === 1 ? 'is' : 'are'} ${blockingGov.length} governance event${blockingGov.length !== 1 ? 's' : ''} blocking workflows right now. The most critical is "${blockingGov[0]?.title}". I recommend reviewing it in the Governance section. (Demo — canned response)`
  if (/failing|fail|workflow/.test(ql))
    return `"${failingWf[0]?.name}" failed with: "${failingWf[0]?.error}". Most likely a credential timeout. Want me to draft a retry runbook? (Demo — canned response)`
  if (/hitl|human.*loop|pause|high.priority/.test(ql))
    return `You have ${urgentHtl.length} high-priority HITL items. The most urgent is "${urgentHtl[0]?.title}" from ${urgentHtl[0]?.source}. Want me to draft a response? (Demo — canned response)`
  if (/focus|today|priority|should i/.test(ql))
    return `Based on your workspace: resolve the ${blockingGov.length} governance block first (it's affecting the most workflows), then clear the ${urgentHtl.length} HITL items. The failing workflow can wait until after standup. (Demo — canned response)`
  return `For "${q}": everything in your workspace is within range except the governance blocks and HITL queue. Ask me about any specific area for more detail. (Demo — canned response)`
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CopilotPanel({ isOpen, onClose }) {
  const asideRef  = useRef(null)
  const innerRef  = useRef(null)
  const scrollRef = useRef(null)

  const [msgs,   setMsgs]   = useState([{
    from: 'agent',
    text: 'Hi — I\'m your AIMS Copilot. Ask me about your workflows, governance events, or HITL queue.',
  }])
  const [input,  setInput]  = useState('')
  const [typing, setTyping] = useState(false)

  const onlyGreeting = msgs.length === 1

  // Inner content slide-in on open
  useEffect(() => {
    if (!isOpen || !innerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tw = gsap.fromTo(
      innerRef.current,
      { xPercent: 6, autoAlpha: 0 },
      { xPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' },
    )
    return () => tw.kill()
  }, [isOpen])

  const scrollToEnd = () =>
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })

  function send(text) {
    const q = (text ?? input).trim()
    if (!q) return
    setMsgs(m => [...m, { from: 'user', text: q }])
    setInput('')
    setTyping(true)
    scrollToEnd()
    setTimeout(() => {
      setMsgs(m => [...m, { from: 'agent', text: demoReply(q) }])
      setTyping(false)
      scrollToEnd()
    }, 700)
  }

  return (
    <aside
      ref={asideRef}
      style={{ width: isOpen ? 380 : 0 }}
      className="relative h-full shrink-0 overflow-hidden bg-white dark:bg-[#0f1629]"
      aria-label="AIMS Copilot"
      aria-hidden={!isOpen}
    >
      <div
        ref={innerRef}
        className="flex h-full w-[380px] flex-col border-l border-gray-200 dark:border-white/[0.08]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-4 py-3.5 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-aims-blue" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">AIMS Copilot</span>
          </div>
          <div className="ml-auto flex items-center gap-0.5 text-gray-400 dark:text-slate-500">
            <IconBtn label="New chat" onClick={() => { setMsgs([msgs[0]]); setInput('') }}>
              <PenSquare size={15} />
            </IconBtn>
            <IconBtn label="Search"><Search size={15} /></IconBtn>
            <IconBtn label="More"><MoreHorizontal size={15} /></IconBtn>
            <IconBtn label="Close copilot" onClick={onClose}><X size={15} /></IconBtn>
          </div>
        </div>

        {/* Conversation */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {msgs.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'flex justify-end' : ''}>
              {m.from === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-aims-blue/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 dark:bg-aims-blue/15 dark:text-slate-100">
                  {m.text}
                </div>
              ) : (
                <div className="max-w-[92%] text-[13px] leading-relaxed text-gray-700 dark:text-slate-200">
                  {m.text}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-1" aria-label="Copilot is typing">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s] dark:bg-slate-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s] dark:bg-slate-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-slate-500" />
            </div>
          )}
        </div>

        {/* Suggestions + copilots — only on a fresh thread */}
        {onlyGreeting && (
          <div className="shrink-0 px-4 pb-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              For you
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => send(s)}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 text-left transition-colors hover:border-aims-blue/20 hover:bg-blue-500/[0.04] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-aims-blue/30 dark:hover:bg-blue-500/[0.06]"
                >
                  <Sparkles size={11} className="shrink-0 text-aims-blue/60" aria-hidden="true" />
                  <span className="text-[12px] text-gray-700 dark:text-slate-300">{s}</span>
                </button>
              ))}
            </div>

            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Your copilots
            </p>
            <div className="grid grid-cols-2 gap-2">
              {HOME_COPILOTS.map(cp => (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => send(cp.quick_prompt)}
                  className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 text-left transition-colors hover:border-aims-blue/20 hover:bg-blue-500/[0.04] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-aims-blue/30"
                >
                  <span
                    className="logo-sq shrink-0 text-[9px]"
                    style={{ background: cp.color, width: 28, height: 28, minWidth: 28, minHeight: 28, fontSize: 9 }}
                    aria-hidden="true"
                  >
                    {cp.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-gray-800 dark:text-slate-100">{cp.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{cp.lastUsed}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="shrink-0 px-3 pb-3 pt-0">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors focus-within:border-aims-blue/50 dark:border-white/15 dark:bg-white/5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Ask me anything…"
              aria-label="Ask the copilot"
              className="w-full bg-transparent px-3.5 pt-3 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <div className="flex items-center justify-end gap-1.5 px-2 pb-2 pt-1.5">
              <button
                type="button"
                onClick={() => send()}
                aria-label="Send"
                disabled={!input.trim()}
                className="grid h-7 w-7 place-items-center rounded-full bg-aims-blue text-white transition-transform hover:scale-105 disabled:opacity-40"
              >
                {input.trim() ? <ArrowUp size={15} /> : <Mic size={15} />}
              </button>
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
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
    >
      {children}
    </button>
  )
}
