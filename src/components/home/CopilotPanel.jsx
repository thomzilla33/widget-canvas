import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScope, scopeAtLeast } from '../../state/ScopeContext.jsx'
import gsap from 'gsap'
import {
  Sparkles, X, ArrowUp, Mic, PenSquare, Search, MoreHorizontal,
  AlertTriangle, Clock, ArrowUpRight, ListChecks,
} from 'lucide-react'
import { HOME_COPILOTS, GOV_EVENTS, HOME_WORKFLOWS, HTL_ITEMS } from '../../data/home.js'
import { matchWQIntent, getWQItems, summarizeIntent } from '../../utils/wqIntents.js'

// ── Context-aware suggestions ─────────────────────────────────────────────────
const blockingGov = GOV_EVENTS.filter(g => g.blocking)
const failingWf   = HOME_WORKFLOWS.filter(w => w.status === 'failed')
const urgentHtl   = HTL_ITEMS.filter(i => i.priority === 'high')

// V2-only: require PA integration
const WQ_SUGGESTIONS = [
  'Do I have any open critical tasks?',
  ...(urgentHtl.length > 0 ? ['Show my pending approvals'] : []),
]

// V1 base suggestions — no PA/WQ dependency
function buildBaseSuggestions() {
  const s = []
  if (blockingGov.length > 0)
    s.push(`Summarize the ${blockingGov.length} blocked governance event${blockingGov.length !== 1 ? 's' : ''}`)
  if (failingWf.length > 0)
    s.push(`What's causing ${failingWf[0].name} to fail?`)
  s.push('What should I focus on today?')
  return s
}
const BASE_SUGGESTIONS = buildBaseSuggestions()


// ── WQ result widget ──────────────────────────────────────────────────────────
const SEVERITY_DOT = {
  Blocking: 'bg-red-500',
  Standard: 'bg-aims-blue',
  Low:      'bg-gray-300 dark:bg-slate-600',
}

function WQResultCard({ items, summary, onNavigate }) {
  const shown    = items.slice(0, 4)
  const overflow = items.length - shown.length

  return (
    <div className="mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[var(--surface-raised)]">
      {/* Summary bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <ListChecks size={12} className="shrink-0 text-aims-blue" aria-hidden="true" />
        <p className="flex-1 text-[12px] font-medium text-gray-700 dark:text-slate-200">{summary}</p>
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-4 text-center text-[12px] text-gray-400 dark:text-slate-500">Nothing to action right now.</p>
      ) : (
        <>
          {/* Item rows */}
          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {shown.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 px-3 py-2.5">
                {/* Severity dot */}
                <span
                  className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[item.severity] ?? SEVERITY_DOT.Standard}`}
                  aria-hidden="true"
                />
                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-gray-800 dark:text-slate-100">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="rounded bg-gray-100 px-1 py-px text-[9px] font-semibold text-gray-500 dark:bg-white/[0.07] dark:text-slate-400">
                      {item.wqType}
                    </span>
                    {item.estimatedMinutes && (
                      <span className="flex items-center gap-0.5 text-[9px] text-gray-400 dark:text-slate-500">
                        <Clock size={8} aria-hidden="true" /> ~{item.estimatedMinutes}m
                      </span>
                    )}
                  </div>
                </div>
                {/* Open action */}
                <button
                  type="button"
                  onClick={() => onNavigate(item)}
                  className="shrink-0 flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-500 hover:border-aims-blue/40 hover:bg-aims-blue/5 hover:text-aims-blue dark:border-white/[0.08] dark:text-slate-400 dark:hover:border-aims-blue/30 dark:hover:text-aims-blue"
                >
                  Open <ArrowUpRight size={9} className="ml-0.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-3 py-2 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => onNavigate(null)}
              className="text-[11px] font-medium text-aims-blue hover:underline"
            >
              {overflow > 0 ? `+${overflow} more · ` : ''}View all in Work Queue
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Reply builder ─────────────────────────────────────────────────────────────
function buildReply(q, showWQ) {
  const intent = showWQ ? matchWQIntent(q) : null
  if (intent) {
    const items   = getWQItems(intent)
    const summary = summarizeIntent(intent, items)
    return { type: 'wq-result', intent, items, summary }
  }
  // Prose fallbacks
  const ql = q.toLowerCase()
  if (/governance|blocked|block/.test(ql))
    return { type: 'text', text: `There ${blockingGov.length === 1 ? 'is' : 'are'} ${blockingGov.length} governance event${blockingGov.length !== 1 ? 's' : ''} blocking workflows right now. The most critical is "${blockingGov[0]?.title}". I recommend reviewing it in the Governance section. (Demo — canned response)` }
  if (/failing|fail|workflow/.test(ql))
    return { type: 'text', text: `"${failingWf[0]?.name}" failed with: "${failingWf[0]?.error}". Most likely a credential timeout. Want me to draft a retry runbook? (Demo — canned response)` }
  if (/focus|today|priority|should i/.test(ql))
    return { type: 'text', text: `Based on your workspace: resolve the ${blockingGov.length} governance block first (it's affecting the most workflows), then clear the ${urgentHtl.length} HITL items. The failing workflow can wait until after standup. (Demo — canned response)` }
  return { type: 'text', text: `For "${q}": everything in your workspace is within range except the governance blocks and HITL queue. Ask me about any specific area for more detail. (Demo — canned response)` }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CopilotPanel({ isOpen, onClose }) {
  const navigate   = useNavigate()
  const { scope }  = useScope()
  const showV2     = scopeAtLeast(scope, 'v2')
  const suggestions = showV2
    ? [...WQ_SUGGESTIONS, ...BASE_SUGGESTIONS].slice(0, 4)
    : BASE_SUGGESTIONS.slice(0, 4)
  const asideRef   = useRef(null)
  const innerRef   = useRef(null)
  const scrollRef  = useRef(null)
  const inputRef   = useRef(null)

  const [msgs,   setMsgs]   = useState([{
    type: 'text',
    from: 'agent',
    text: 'Hi — I\'m your AIMS Copilot. Ask me about your work queue, workflows, or governance events.',
  }])
  const [input,  setInput]  = useState('')
  const [typing, setTyping] = useState(false)

  const onlyGreeting = msgs.length === 1

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
    setMsgs(m => [...m, { type: 'text', from: 'user', text: q }])
    setInput('')
    setTyping(true)
    scrollToEnd()
    setTimeout(() => {
      const reply = buildReply(q, showV2)
      setMsgs(m => [...m, { ...reply, from: 'agent' }])
      setTyping(false)
      scrollToEnd()
    }, 700)
  }

  function handleNavigate(item) {
    navigate('/home/attention', item ? { state: { selectId: item.id } } : undefined)
    onClose()
  }

  return (
    <aside
      ref={asideRef}
      style={{ width: isOpen ? 380 : 0 }}
      className="relative h-full shrink-0 overflow-hidden bg-white dark:bg-[var(--surface)]"
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
          <div className="ml-auto flex items-center gap-0.5 text-gray-400 dark:text-slate-400">
            <IconBtn label="New chat" onClick={() => { setMsgs([msgs[0]]); setInput('') }}>
              <PenSquare size={15} />
            </IconBtn>
            <IconBtn label="Search" onClick={() => { requestAnimationFrame(() => inputRef.current?.focus()) }}><Search size={15} /></IconBtn>
            <IconBtn label="Clear chat" onClick={() => { setMsgs([msgs[0]]); setInput('') }}><MoreHorizontal size={15} /></IconBtn>
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
              ) : m.type === 'wq-result' ? (
                <div className="w-full max-w-[96%]">
                  <WQResultCard
                    items={m.items}
                    summary={m.summary}
                    onNavigate={handleNavigate}
                  />
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
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">
              For you
            </p>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s, i) => (
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

            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">
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
                    <p className="text-[10px] text-gray-400 dark:text-slate-400">{cp.lastUsed}</p>
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
              ref={inputRef}
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
