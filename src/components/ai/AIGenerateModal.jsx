import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, ArrowUp, Check, Pencil, ExternalLink, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { useModalEnter } from '../../hooks/useReveal.js'
import WidgetPreview from '../playground/WidgetPreview.jsx'
import WidgetRender from '../widgets/WidgetRender.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { describeWidget, describeDashboard } from '../../data/describe.js'
import { dimensionById, DIMENSIONS } from '../../data/fields.js'
import { AUDIENCE_ROLES } from '../../data/audiences.js'
import {
  EXTERNAL_SOURCES, sourceFields, TYPE_LABEL, WIDGET_TYPES, TEMPLATE_SEED, placementLabel,
} from '../../data/mock.js'

// Options for the one-tap corrections on a result card.
const TYPE_OPTIONS = WIDGET_TYPES.map((t) => ({ id: t.id, label: t.label }))
const DIM_OPTIONS = [{ id: 'none', label: 'No breakdown' }, ...DIMENSIONS.map((d) => ({ id: d.id, label: d.name }))]
const AUDIENCE_OPTS = AUDIENCE_ROLES.map((r) => ({ id: r, label: r }))
const TEMPLATE_OPTS = [
  { id: 't-acct360', label: 'Account 360' },
  { id: 't-support', label: 'Support Health' },
  { id: 't-exec', label: 'Executive Overview' },
]

// Rebuild a widget name when the breakdown changes — mirrors describe.js: skip when the
// metric name already encodes "by X", when it's a record set (kind==='records'), or no dim.
function widgetName(metric, dimId) {
  if (!metric) return ''
  const fieldHasDim = /\bby\b/i.test(metric.name)
  if (fieldHasDim || metric.kind === 'records' || !dimId || dimId === 'none') return metric.name
  return `${metric.name} by ${dimensionById(dimId)?.name ?? dimId}`
}

const TEMPLATE_LABEL = { 't-acct360': 'Account 360', 't-support': 'Support Health', 't-exec': 'Executive Overview' }
const slug = (s) => (s || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const EXAMPLES = {
  widget: ['Win rate by region', 'Monthly ticket volume trend', 'Total revenue this quarter', 'Open pipeline by stage'],
  dashboard: ['Support health for managers', 'Executive revenue report', 'Sales team home', 'Employee performance for managers'],
}
const GREETING = {
  widget: 'Describe the widget you want — a metric, a breakdown, a chart type. I’ll build a live preview you can refine, then create.',
  dashboard: 'Describe the dashboard you need — who it’s for and what it should cover. I’ll propose a starting layout you can refine, then create.',
}

// Conversational, chat-style generator for BOTH widgets and dashboards. Deterministic
// (reuses the describe-to-build engine) — each turn re-reads the whole conversation so
// follow-ups refine the result. Opened as a modal from the Library / Dashboards studios.
// `mode` is fixed by the entry point ('widget' from the Library, 'dashboard' from
// Dashboards) — each opens its own dedicated generator; there's no in-modal switch.
export default function AIGenerateModal({ mode = 'widget', onClose }) {
  const navigate = useNavigate()
  const trapRef = useFocusTrap()
  useModalEnter(trapRef) // subtle scale + fade entrance on the dialog card
  const { widgets, addWidget } = useWidgets()
  const { addDashboard } = useDashboards()

  const [messages, setMessages] = useState([{ id: 0, role: 'assistant', greeting: true }])
  const [transcript, setTranscript] = useState('')
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const idRef = useRef(0)
  const nextId = () => (idRef.current += 1)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  // `genMode` is captured at send() time — never read from render scope inside the
  // async timeout, or a mid-flight mode switch would route to the wrong engine.
  function buildResult(genMode, text) {
    if (genMode === 'widget') {
      const cfg = describeWidget(text)
      if (!cfg) return { id: nextId(), role: 'assistant', miss: true }
      const source = EXTERNAL_SOURCES.find((s) => s.id === cfg.sourceId)
      const metric = source ? sourceFields(source).find((f) => f.id === cfg.metricId) : null
      return { id: nextId(), role: 'assistant', result: { kind: 'widget', cfg, source, metric } }
    }
    const cfg = describeDashboard(text)
    if (!cfg) return { id: nextId(), role: 'assistant', miss: true }
    return { id: nextId(), role: 'assistant', result: { kind: 'dashboard', cfg } }
  }

  function send(textArg) {
    const text = (textArg ?? input).trim()
    if (!text || thinking) return
    const merged = [transcript, text].filter(Boolean).join('. ')
    const capturedMode = mode
    setMessages((m) => [...m, { id: nextId(), role: 'user', text }])
    setInput('')
    setTranscript(merged)
    setThinking(true)
    // A short beat so it reads like a conversation (deterministic result underneath).
    // snapshotTranscript pins each result to the text that produced it, so the
    // "Fine-tune" hand-off on an older card uses that card's config, not later turns.
    setTimeout(() => {
      setMessages((m) => [...m, { ...buildResult(capturedMode, merged), snapshotTranscript: merged }])
      setThinking(false)
    }, 420)
  }

  function createWidget(result) {
    const { cfg, source, metric } = result
    addWidget({
      id: `w-${slug(cfg.name)}-${Date.now().toString(36)}`,
      name: cfg.name,
      skeleton: TYPE_LABEL[cfg.typeId],
      metric: metric?.name,
      governed: !!source?.governed,
      freshness: 'fresh',
      health: 'unused',
      usedIn: 0,
      source: source?.name,
      dimension: cfg.dimensionId && cfg.dimensionId !== 'none' ? cfg.dimensionId : undefined,
      category: 'Intelligence',
    })
    setMessages((m) => [...m, { id: nextId(), role: 'assistant', created: { kind: 'widget', name: cfg.name } }])
  }

  function createDashboard(result) {
    const { cfg } = result
    const id = `d-${slug(cfg.name)}-${Date.now().toString(36)}`
    const seedCount = TEMPLATE_SEED[cfg.templateId]?.length ?? 0
    const entity = cfg.placement.surface === 'profile' ? cfg.placement.profileType : cfg.placement.surface === 'report' ? 'Report' : 'Home'
    addDashboard({
      id, template: cfg.templateId, name: cfg.name, entity,
      audience: cfg.audience, placement: cfg.placement, status: 'draft',
      widgets: seedCount, updated: 'just now',
    })
    navigate(`/dashboard/${id}/canvas`)
    onClose()
  }

  // One-tap corrections patch a specific result card's config (preview + Create follow).
  function patchCfg(mid, cfgPatch) {
    setMessages((ms) => ms.map((m) => (m.id === mid && m.result ? { ...m, result: { ...m.result, cfg: { ...m.result.cfg, ...cfgPatch } } } : m)))
  }

  const placeholder = mode === 'widget' ? 'e.g. Win rate by region as a gauge…' : 'e.g. A support health dashboard for managers…'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ai-gen-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={trapRef} tabIndex={-1} className="card relative z-10 flex h-[88vh] w-[92vw] max-w-[760px] flex-col overflow-hidden p-0 outline-none">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ background: 'var(--grad)' }}>
              <Sparkles size={15} aria-hidden="true" />
            </span>
            <h2 id="ai-gen-title" className="text-sm font-semibold text-gray-900 dark:text-slate-100">Generate a {mode === 'widget' ? 'widget' : 'dashboard'} with AI</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-4">
          {messages.map((m) => (
            <Message key={m.id} m={m} mode={mode} widgets={widgets} onCreateWidget={createWidget} onCreateDashboard={createDashboard}
              onPatch={(p) => patchCfg(m.id, p)}
              onTune={() => { onClose(); navigate('/widgets/new', { state: { describe: m.snapshotTranscript || transcript } }) }}
              onExample={send} navigate={navigate} onClose={onClose} />
          ))}
          {thinking && <TypingBubble />}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <div className="flex items-end gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:border-aims-blue focus-within:ring-2 focus-within:ring-aims-blue/30 dark:border-white/15 dark:bg-white/5">
            <textarea
              rows={1}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={placeholder}
              aria-label={`Describe the ${mode} to generate`}
              className="max-h-28 flex-1 resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button onClick={() => send()} disabled={!input.trim() || thinking} aria-label="Send" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white transition-opacity disabled:opacity-40" style={{ background: 'var(--grad)' }}>
              <ArrowUp size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 px-1 text-[10px] text-gray-400 dark:text-slate-500">Generated from your connected sources — review before creating.</p>
        </div>
      </div>
    </div>
  )
}

function Message({ m, mode, widgets, onCreateWidget, onCreateDashboard, onPatch, onTune, onExample, navigate, onClose }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-aims-blue px-3.5 py-2 text-sm text-white">{m.text}</div>
      </div>
    )
  }
  // assistant
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white" style={{ background: 'var(--grad)' }}>
        <Sparkles size={12} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-2.5">
        {m.greeting && (
          <>
            <p className="text-sm text-gray-700 dark:text-slate-200">{GREETING[mode]}</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES[mode].map((ex) => (
                <button key={ex} onClick={() => onExample(ex)} className="rounded-full border border-aims-blue/30 bg-aims-blue/5 px-2.5 py-1 text-[11px] font-medium text-aims-blue transition-colors hover:bg-aims-blue/10">
                  {ex}
                </button>
              ))}
            </div>
          </>
        )}

        {m.miss && (
          <p className="text-sm text-gray-700 dark:text-slate-200">
            I couldn’t map that yet. Try naming a metric ({mode === 'widget' ? 'revenue, tickets, pipeline, win rate' : 'support, revenue, sales'}) and who it’s for — e.g. “{EXAMPLES[mode][0]}”.
          </p>
        )}

        {m.created && (
          <div className="rounded-xl border border-green-200 bg-green-50/70 p-3 dark:border-green-500/25 dark:bg-green-500/10">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <Check size={15} className="text-aims-governed" aria-hidden="true" /> Added “{m.created.name}” to your library
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => { onClose(); navigate('/widgets') }}>Open library</button>
              <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => { onClose(); navigate('/dashboards') }}>Place on a dashboard</button>
            </div>
          </div>
        )}

        {m.result?.kind === 'widget' && <WidgetResult result={m.result} onCreate={() => onCreateWidget(m.result)} onTune={() => onTune(m.result)} onPatch={onPatch} />}
        {m.result?.kind === 'dashboard' && <DashboardResult result={m.result} widgets={widgets} onCreate={() => onCreateDashboard(m.result)} onPatch={onPatch} />}
      </div>
    </div>
  )
}

function WidgetResult({ result, onCreate, onTune, onPatch }) {
  const { cfg, source, metric } = result
  const dim = cfg.dimensionId && cfg.dimensionId !== 'none' ? dimensionById(cfg.dimensionId) : null
  const [editing, setEditing] = useState(null) // 'type' | 'breakdown' | null
  const toggle = (f) => setEditing((e) => (e === f ? null : f))
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#131a2c]">
      <ResultHeader />
      <p className="mb-2 text-sm text-gray-700 dark:text-slate-200">Here’s a starting point — adjust the mapping below, or keep refining above.</p>

      {/* What I mapped — source/metric are read-only; breakdown + chart are one-tap editable */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Chip label="Source" value={source?.name || '—'} />
        <Chip label="Metric" value={metric?.name || cfg.name} />
        <Chip label="Breakdown" value={dim ? dim.name : 'None'} editable active={editing === 'breakdown'} onClick={() => toggle('breakdown')} />
        <Chip label="Chart" value={TYPE_LABEL[cfg.typeId] || cfg.typeId} editable active={editing === 'type'} onClick={() => toggle('type')} />
      </div>
      {editing === 'type' && (
        <OptionRow options={TYPE_OPTIONS} current={cfg.typeId} onPick={(id) => { onPatch({ typeId: id }); setEditing(null) }} />
      )}
      {editing === 'breakdown' && (
        <OptionRow options={DIM_OPTIONS} current={cfg.dimensionId || 'none'} onPick={(id) => { onPatch({ dimensionId: id, name: widgetName(metric, id) }); setEditing(null) }} />
      )}

      {cfg.confidence === 'low' && (
        <p className="mb-2 inline-flex items-start gap-1 text-[11px] text-aims-ungoverned">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" /> Best guess from your words — double-check the source and metric.
        </p>
      )}

      <div className="surface-sunken rounded-lg p-3">
        <WidgetPreview typeId={cfg.typeId} metric={metric} source={source} name={cfg.name} freshness="fresh" display={{ format: { style: 'auto' }, goal: {} }} shape={dim ? { dimension: dim, transform: 'none' } : undefined} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button className="btn-primary !py-1.5 !px-3 text-xs" onClick={onCreate}><Check size={14} aria-hidden="true" /> Create widget</button>
        <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={onTune}><Pencil size={13} aria-hidden="true" /> Fine-tune in builder</button>
      </div>
    </div>
  )
}

function DashboardResult({ result, widgets, onCreate, onPatch }) {
  const { cfg } = result
  const seed = TEMPLATE_SEED[cfg.templateId] || []
  const tiles = seed.map((s) => widgets.find((w) => w.id === s.widgetId)).filter(Boolean)
  const shown = tiles.slice(0, 4)
  const [editing, setEditing] = useState(null) // 'audience' | 'template' | null
  const toggle = (f) => setEditing((e) => (e === f ? null : f))
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#131a2c]">
      <ResultHeader />
      <p className="mb-2 text-sm text-gray-700 dark:text-slate-200">
        A starting layout based on the <span className="font-semibold text-gray-900 dark:text-slate-100">closest template</span> — swap it or change the audience below, then refine on the canvas.
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Chip label="Audience" value={cfg.audience} editable active={editing === 'audience'} onClick={() => toggle('audience')} />
        <Chip label="Surface" value={placementLabel(cfg.placement)} />
        <Chip label="Template" value={`${TEMPLATE_LABEL[cfg.templateId] || 'Starter'} · ${seed.length}`} editable active={editing === 'template'} onClick={() => toggle('template')} />
      </div>
      {editing === 'audience' && (
        <OptionRow options={AUDIENCE_OPTS} current={cfg.audience} onPick={(id) => { onPatch({ audience: id }); setEditing(null) }} />
      )}
      {editing === 'template' && (
        <OptionRow options={TEMPLATE_OPTS} current={cfg.templateId} onPick={(id) => { onPatch({ templateId: id }); setEditing(null) }} />
      )}

      <div className="surface-sunken grid grid-cols-2 gap-2 rounded-lg p-2.5">
        {shown.length === 0 && (
          <p className="col-span-2 py-3 text-center text-xs text-gray-400 dark:text-slate-500">
            The template’s widgets appear here once the dashboard is created.
          </p>
        )}
        {shown.map((w, i) => (
          <div key={w.id || i} className="rounded-md border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-[#0f1629]">
            <div className="mb-1 truncate text-[11px] font-semibold text-gray-900 dark:text-slate-100">{w.name}</div>
            <WidgetRender widget={w} size="sm" />
          </div>
        ))}
        {tiles.length > shown.length && (
          <div className="grid place-items-center rounded-md border border-dashed border-gray-300 p-2 text-[11px] text-gray-500 dark:border-white/15 dark:text-slate-400">
            +{tiles.length - shown.length} more
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button className="btn-primary !py-1.5 !px-3 text-xs" onClick={onCreate}><ExternalLink size={13} aria-hidden="true" /> Create &amp; open canvas</button>
        <span className="text-[11px] text-gray-400 dark:text-slate-500">or keep refining above</span>
      </div>
    </div>
  )
}

// Honesty framing shown atop every result card.
function ResultHeader() {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-aims-blue">
        <Sparkles size={11} aria-hidden="true" /> AI starting point
      </span>
      <span className="text-[10px] text-gray-400 dark:text-slate-500">Review before creating</span>
    </div>
  )
}

// A "Label: value" chip. Editable chips toggle an inline OptionRow for one-tap correction.
function Chip({ label, value, editable, active, onClick }) {
  const base = 'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]'
  if (!editable) {
    return (
      <span className={`${base} border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300`}>
        <span className="text-gray-400 dark:text-slate-500">{label}:</span>
        <span className="font-medium text-gray-700 dark:text-slate-200">{value}</span>
      </span>
    )
  }
  return (
    <button
      onClick={onClick}
      aria-expanded={active}
      aria-label={`Change ${label.toLowerCase()} (currently ${value})`}
      className={`${base} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-blue/40 ${active ? 'border-aims-blue/50 bg-aims-blue/10 text-aims-blue' : 'border-gray-300 text-gray-600 hover:border-aims-blue/40 hover:text-aims-blue dark:border-white/15 dark:text-slate-300 dark:hover:border-aims-blue/40'}`}
    >
      <span className={active ? 'text-aims-blue/70' : 'text-gray-400 dark:text-slate-500'}>{label}:</span>
      <span className="font-medium">{value}</span>
      <ChevronDown size={11} aria-hidden="true" className={`transition-transform ${active ? 'rotate-180' : ''}`} />
    </button>
  )
}

// Inline option picker (no floating popover — avoids clipping inside the scroll area).
function OptionRow({ options, current, onPick }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50/60 p-2 dark:border-white/10 dark:bg-white/[0.02]">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onPick(o.id)}
          aria-pressed={o.id === current}
          className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${o.id === current ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white" style={{ background: 'var(--grad)' }}>
        <RefreshCw size={12} className="animate-spin" aria-hidden="true" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2.5 dark:bg-white/5">
        <Dot /><Dot delay="150ms" /><Dot delay="300ms" />
      </div>
    </div>
  )
}
function Dot({ delay = '0ms' }) {
  return <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-slate-500" style={{ animationDelay: delay }} />
}
