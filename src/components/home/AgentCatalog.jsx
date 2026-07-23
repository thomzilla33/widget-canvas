import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Bot, ShieldCheck, X, ChevronRight, Zap, AlertCircle,
  Info, Cpu, Play, ExternalLink,
} from 'lucide-react'
import { AGENT_CATALOG } from '../../data/agentCatalog.js'
import { HOME_AGENTS } from '../../data/home.js'
import { usePendingOutputs } from '../../state/PendingOutputsContext.jsx'
import UndoToast from './UndoToast.jsx'

const CATEGORIES = [
  { id: 'single',   label: 'Single Agents' },
  { id: 'workflow', label: 'Workflow Agents' },
]

const MAX_VISIBLE = 8

// ── Agent status chip ─────────────────────────────────────────────────────────
function StatusChip({ status }) {
  if (status === 'active') return null
  if (status === 'unavailable') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 dark:bg-white/[0.07] dark:text-slate-500">
        Unavailable
      </span>
    )
  }
  return null
}

// ── Single agent card ─────────────────────────────────────────────────────────
function AgentCard({ agent, onClick, highlight }) {
  return (
    <button
      type="button"
      onClick={() => onClick(agent)}
      className={`group relative flex flex-col rounded-xl border p-3.5 text-left transition-all ${
        agent.status === 'unavailable'
          ? 'cursor-pointer border-gray-100 bg-gray-50/60 opacity-70 hover:opacity-90 dark:border-white/[0.06] dark:bg-white/[0.02]'
          : highlight
          ? 'border-aims-blue/40 bg-aims-blue/[0.06] dark:border-aims-blue/30 dark:bg-aims-blue/[0.08] ring-1 ring-aims-blue/30'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:border-white/[0.14]'
      }`}
      aria-label={`${agent.name} — ${agent.description}`}
    >
      {/* Icon + name */}
      <div className="mb-2 flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-aims-blue/10 dark:bg-aims-blue/15">
            <Bot size={11} className="text-aims-blue" aria-hidden="true" />
          </span>
          <span className="truncate text-[12px] font-semibold text-gray-800 dark:text-slate-200">{agent.name}</span>
        </div>
        <ChevronRight size={11} className="mt-0.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" aria-hidden="true" />
      </div>

      {/* Description */}
      <p className="line-clamp-2 flex-1 text-[10px] leading-[1.45] text-gray-400 dark:text-slate-500">
        {agent.description}
      </p>

      {/* Footer chips */}
      <div className="mt-2 flex items-center gap-1.5">
        {agent.grounded && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={8} aria-hidden="true" /> Grounded
          </span>
        )}
        <StatusChip status={agent.status} />
      </div>
    </button>
  )
}

// ── Grounding provenance popover ──────────────────────────────────────────────
function GroundingPopover({ agent, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-0 top-7 z-10 w-56 rounded-xl border border-gray-100 bg-white p-3 shadow-lg dark:border-white/[0.1] dark:bg-slate-800"
    >
      <p className="mb-2 text-[11px] font-semibold text-gray-700 dark:text-slate-200">Grounding provenance</p>
      <div className="space-y-1 text-[10px] text-gray-500 dark:text-slate-400">
        <div><span className="font-medium text-gray-600 dark:text-slate-300">Source:</span> {agent.groundingSource}</div>
        <div><span className="font-medium text-gray-600 dark:text-slate-300">Attested:</span> {agent.groundingDate}</div>
        <div><span className="font-medium text-gray-600 dark:text-slate-300">Version:</span> {agent.groundingVersion}</div>
      </div>
    </div>
  )
}

// ── Canned answer block ────────────────────────────────────────────────────────
function CannedAnswerBlock({ answer, onClose }) {
  return (
    <div className="mt-4 rounded-xl border border-aims-blue/20 bg-aims-blue/[0.04] p-4 dark:border-aims-blue/15 dark:bg-aims-blue/[0.07]">
      <div className="mb-2 flex items-center gap-1.5">
        <Bot size={11} className="text-aims-blue" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-aims-blue">Answer</span>
      </div>
      <p className="mb-3 text-[12px] font-medium leading-snug text-gray-600 dark:text-slate-300 italic">
        "{answer.question}"
      </p>
      <p className="text-[12px] leading-relaxed text-gray-700 dark:text-slate-200">{answer.answer}</p>
      {answer.citations?.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-2.5 dark:border-white/[0.07]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Sources</p>
          {answer.citations.map((c, i) => (
            <p key={i} className="text-[10px] text-gray-400 dark:text-slate-500">· {c}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Detail drawer ─────────────────────────────────────────────────────────────
function AgentDetailDrawer({ agent, onClose, onRun }) {
  const [showGrounding, setShowGrounding] = useState(false)
  const [ranAnswer, setRanAnswer] = useState(false)
  const isWorkflow = AGENT_CATALOG.workflow.some(w => w.id === agent.id)

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[48] bg-black/20 dark:bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={agent.name}
        className="fixed right-0 top-0 z-[49] flex h-full w-[400px] flex-col border-l border-gray-100 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aims-blue/10 dark:bg-aims-blue/15">
              {isWorkflow ? <Zap size={15} className="text-aims-blue" /> : <Bot size={15} className="text-aims-blue" />}
            </span>
            <div>
              <p className="text-[14px] font-semibold text-gray-900 dark:text-slate-100">{agent.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">
                {isWorkflow ? 'Workflow Agent' : 'Single Agent'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-600 dark:hover:bg-white/[0.07] dark:hover:text-slate-300"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Unavailable banner */}
        {agent.status === 'unavailable' && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04]">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-gray-400 dark:text-slate-500" />
            <div>
              <p className="text-[12px] font-semibold text-gray-600 dark:text-slate-300">Currently unavailable</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400 dark:text-slate-500">{agent.unavailableReason}</p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Description */}
          <p className="text-[13px] leading-relaxed text-gray-600 dark:text-slate-300">{agent.description}</p>

          {/* Grounding chip */}
          {agent.grounded ? (
            <div className="relative mt-4 inline-block">
              <button
                type="button"
                onClick={() => setShowGrounding(v => !v)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/15 dark:text-emerald-400"
              >
                <ShieldCheck size={10} /> Grounded — {agent.groundingSource?.split('·')[0].trim()}
              </button>
              {showGrounding && <GroundingPopover agent={agent} onClose={() => setShowGrounding(false)} />}
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-400 dark:bg-white/[0.07] dark:text-slate-500">
              <Info size={10} /> Not grounded
            </div>
          )}

          {/* Example prompts */}
          <div className="mt-5">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Example prompts
            </p>
            <div className="space-y-2">
              {agent.examplePrompts.map((prompt, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 px-3 py-2 text-[12px] text-gray-600 dark:border-white/[0.07] dark:text-slate-300"
                >
                  "{prompt}"
                </div>
              ))}
            </div>
          </div>

          {/* Canned answer (Single Agent only, after run) */}
          {ranAnswer && !isWorkflow && agent.cannedAnswer && (
            <CannedAnswerBlock answer={agent.cannedAnswer} />
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          {agent.status === 'unavailable' ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-[12px] font-semibold text-gray-400 dark:bg-white/[0.06] dark:text-slate-500">
              <AlertCircle size={13} /> Not available
            </div>
          ) : isWorkflow ? (
            <button
              type="button"
              onClick={() => onRun(agent)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-aims-blue py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              <Play size={13} /> Run workflow
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRanAnswer(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-aims-blue py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              <Bot size={13} /> {ranAnswer ? 'Ask again' : 'Run'}
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}

// ── Agent Catalog region ──────────────────────────────────────────────────────
export function AgentCatalog() {
  const [category, setCategory]   = useState('single')
  const [selected, setSelected]   = useState(null)
  const [showAll, setShowAll]     = useState(false)
  const [toast, setToast]         = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const { addOutput } = usePendingOutputs()

  const agents = AGENT_CATALOG[category]
  const visible = showAll ? agents : agents.slice(0, MAX_VISIBLE)
  const overflow = agents.length - visible.length
  const activeAgents = HOME_AGENTS.filter(a => a.status === 'active')

  function handleRun(agent) {
    const outputId = addOutput({
      title: `${agent.outputKind ?? 'Output'} — ${agent.name}`,
      producingWorkflow: agent.name,
    })
    setSelected(null)
    setHighlightId(outputId)
    setTimeout(() => setHighlightId(null), 4000)
    setToast({ message: `${agent.name} started — a new output will appear in Pending Outputs when ready.` })
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <>
      <section
        id="home-agent-catalog"
        className="rounded-2xl border border-gray-100 bg-white px-5 py-4 dark:border-white/[0.08] dark:bg-[#111827]"
      >
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between gap-4">
          {/* Left: title + active agents overview */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-2">
              <Cpu size={14} className="text-gray-300 dark:text-slate-600" aria-hidden="true" />
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-gray-800 dark:text-slate-200">
                Agent Catalog
              </span>
            </div>
            {/* Active agents strip */}
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
              <span className="shrink-0 text-[10px] text-gray-300 dark:text-slate-600">·</span>
              {HOME_AGENTS.map(ag => (
                <div key={ag.id} className="flex shrink-0 items-center gap-1.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[8px] font-bold text-white"
                    style={{ background: ag.color }}
                    aria-hidden="true"
                  >
                    {ag.initials}
                  </span>
                  <span className="text-[11px] font-medium text-gray-600 dark:text-slate-300">{ag.name}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    ag.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                    ag.status === 'paused' ? 'bg-amber-400' : 'bg-gray-300 dark:bg-slate-600'
                  }`} aria-label={ag.status} />
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">
                    {ag.status === 'active' ? `${ag.conversationsToday} convos` :
                     ag.status === 'paused' ? 'Paused' : 'Idle'}
                    {ag.handoffs > 0 && ` · ${ag.handoffs} handoffs`}
                  </span>
                  <ExternalLink size={10} className="cursor-pointer text-gray-200 hover:text-gray-500 dark:text-slate-700 dark:hover:text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: category tabs */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-100 p-0.5 dark:border-white/[0.07]">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); setShowAll(false) }}
                aria-pressed={category === cat.id}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  category === cat.id
                    ? 'bg-aims-blue text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card grid — auto-fill, no trailing blank space */}
        {agents.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[12px] text-gray-400 dark:text-slate-500">
            No agents in this category yet.
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {visible.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={setSelected}
                highlight={false}
              />
            ))}
            {overflow > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-4 text-gray-400 transition-colors hover:border-aims-blue/30 hover:text-aims-blue dark:border-white/[0.08] dark:text-slate-500"
              >
                <ChevronRight size={16} aria-hidden="true" />
                <span className="text-[11px] font-semibold">+{overflow} more</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Detail drawer */}
      {selected && (
        <AgentDetailDrawer
          agent={selected}
          onClose={() => setSelected(null)}
          onRun={handleRun}
        />
      )}

      {/* Run toast */}
      {toast && createPortal(
        <UndoToast message={toast.message} onClose={() => setToast(null)} />,
        document.body,
      )}
    </>
  )
}
