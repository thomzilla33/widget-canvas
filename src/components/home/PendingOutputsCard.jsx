import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  FileOutput, X, ShieldCheck, BookOpen, Info,
  AlertTriangle, ArrowUpRight, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { usePendingOutputs } from '../../state/PendingOutputsContext.jsx'
import { AUTHORITY } from '../../data/pendingOutputs.js'
import UndoToast from './UndoToast.jsx'

// ── Status chip ────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  ready:             'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  adjusted:          'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  requires_approval: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  advanced:          'bg-gray-100 text-gray-400 dark:bg-white/[0.05] dark:text-slate-400',
}

function StatusChip({ status, label }) {
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_STYLE[status] ?? STATUS_STYLE.ready}`}>
      {label}
    </span>
  )
}

// ── Authority badge icon ───────────────────────────────────────────────────────
function AuthIcon({ level }) {
  if (level === 'verified')      return <ShieldCheck size={10} aria-hidden="true" />
  if (level === 'authoritative') return <BookOpen size={10} aria-hidden="true" />
  return <Info size={10} aria-hidden="true" />
}

// ── Provenance popover ─────────────────────────────────────────────────────────
function ProvenancePopover({ field, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const auth = AUTHORITY[field.authority]

  return (
    <div
      ref={ref}
      className="absolute left-0 top-7 z-20 w-60 rounded-xl border border-gray-100 bg-white p-3 shadow-xl dark:border-white/[0.1] dark:bg-slate-800"
    >
      <div className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${auth.bgClass} ${auth.colorClass}`}>
        <AuthIcon level={field.authority} />
        {auth.label}
      </div>
      <p className="mb-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">{auth.description}</p>
      <div className="space-y-1 border-t border-gray-100 pt-2 text-[10px] text-gray-400 dark:border-white/[0.07] dark:text-slate-400">
        <div><span className="font-medium text-gray-500 dark:text-slate-400">Source:</span> {field.source}</div>
        <div><span className="font-medium text-gray-500 dark:text-slate-400">Attested:</span> {field.attestedDate}</div>
        <div><span className="font-medium text-gray-500 dark:text-slate-400">Version:</span> {field.version}</div>
        {field.superseded && field.previousValue && (
          <div className="mt-1.5 rounded-lg bg-amber-500/10 px-2 py-1 text-amber-600 dark:text-amber-400">
            Updated from: {field.previousValue}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Output preview drawer ──────────────────────────────────────────────────────
function OutputPreviewDrawer({ output, onClose, onApprove }) {
  const [openPopover, setOpenPopover] = useState(null)
  const [toast, setToast] = useState(null)

  function escalate() {
    setToast({ message: 'Escalated to your manager. They\'ll be notified.' })
    setTimeout(() => setToast(null), 4500)
  }

  function approve() {
    onApprove(output.id)
    onClose()
  }

  const isAdvanced = output.status === 'advanced'
  const isApproval = output.status === 'requires_approval'

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[48] bg-black/20 dark:bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={output.title}
        className="fixed right-0 top-0 z-[49] flex h-full w-[480px] flex-col border-l border-gray-100 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <StatusChip status={output.status} label={output.statusLabel} />
              {output.groundingSuperseded && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={8} /> Grounding updated
                </span>
              )}
            </div>
            <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-slate-100">{output.title}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400">{output.producingWorkflow} · {output.when}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 mt-0.5 shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Grounding update banner */}
        {output.groundingSuperseded && output.groundingUpdateNote && (
          <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/[0.07]">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">{output.groundingUpdateNote}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Summary */}
          <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Summary</p>
            <p className="text-[13px] leading-relaxed text-gray-700 dark:text-slate-200">{output.preview.summary}</p>
          </div>

          {/* Authority legend */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="mr-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Authority</p>
            {Object.values(AUTHORITY).map(a => (
              <span key={a.id} className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${a.bgClass} ${a.colorClass}`}>
                <AuthIcon level={a.id} />
                {a.label}
              </span>
            ))}
          </div>

          {/* Per-field table */}
          <div className="space-y-2">
            {output.preview.fields.map(field => {
              const auth = AUTHORITY[field.authority]
              return (
                <div
                  key={field.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                    field.superseded
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/[0.06]'
                      : 'border-gray-100 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400 dark:text-slate-400">{field.label}</p>
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-slate-200">{field.value}</p>
                    {field.superseded && field.previousValue && (
                      <p className="text-[9px] text-amber-600 dark:text-amber-400">
                        Updated from: {field.previousValue}
                      </p>
                    )}
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenPopover(openPopover === field.id ? null : field.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold transition-colors ${auth.bgClass} ${auth.colorClass} hover:opacity-80`}
                      aria-label={`${auth.label} — click for provenance`}
                    >
                      <AuthIcon level={field.authority} />
                      {auth.label}
                    </button>
                    {openPopover === field.id && (
                      <ProvenancePopover field={field} onClose={() => setOpenPopover(null)} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-4 dark:border-white/[0.07]">
          {!isAdvanced && (
            <button
              type="button"
              onClick={approve}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-aims-blue py-2 text-[12px] font-semibold text-white transition-colors hover:opacity-90"
            >
              <CheckCircle2 size={13} />
              {isApproval ? 'Approve' : 'Accept'}
            </button>
          )}
          <button
            type="button"
            onClick={escalate}
            className={`flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-[12px] font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.1] dark:text-slate-300 dark:hover:bg-white/[0.05] ${isAdvanced ? 'flex-1' : ''}`}
          >
            <ArrowUpRight size={13} /> Escalate
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-100 px-4 py-2 text-[12px] font-semibold text-gray-400 transition-colors hover:bg-gray-50 dark:border-white/[0.07] dark:text-slate-400 dark:hover:bg-white/[0.05]"
          >
            Close
          </button>
        </div>
      </div>

      {toast && createPortal(
        <UndoToast message={toast.message} onClose={() => setToast(null)} />,
        document.body,
      )}
    </>,
    document.body,
  )
}

// ── Status tabs ────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { id: 'all',               label: 'All',      filterFn: () => true },
  { id: 'ready',             label: 'Ready',    filterFn: o => o.status === 'ready' },
  { id: 'adjusted',          label: 'Adjusted', filterFn: o => o.status === 'adjusted' },
  { id: 'requires_approval', label: 'Approval', filterFn: o => o.status === 'requires_approval' },
  { id: 'advanced',          label: 'Done',     filterFn: o => o.status === 'advanced' },
]

// ── Pending Outputs Card ───────────────────────────────────────────────────────
const MAX_VISIBLE_OUTPUTS = 10

export function PendingOutputsCard() {
  const navigate = useNavigate()
  const { outputs, newIds } = usePendingOutputs()
  const [selected,  setSelected]  = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [approved,  setApproved]  = useState(new Set())

  const allFiltered = outputs.filter(o => !approved.has(o.id))

  const tab        = STATUS_TABS.find(t => t.id === activeTab) ?? STATUS_TABS[0]
  const tabOutputs = allFiltered.filter(tab.filterFn)
  const visible    = tabOutputs.slice(0, MAX_VISIBLE_OUTPUTS)
  const overflow   = tabOutputs.length - visible.length

  const activePending = allFiltered.filter(o => o.status !== 'advanced').length

  const tabCounts = Object.fromEntries(
    STATUS_TABS.map(t => [
      t.id,
      t.id === 'all' ? allFiltered.length : allFiltered.filter(t.filterFn).length,
    ])
  )

  function handleApprove(id) {
    setApproved(prev => new Set([...prev, id]))
  }

  return (
    <>
      <div className="card flex h-full flex-col">
        <CardHeader
          icon={<FileOutput size={14} />}
          title="Pending Outputs"
          badge={activePending || undefined}
          action={{ label: 'See all', onClick: () => navigate('/reports') }}
        />

        {/* Status filter tabs */}
        <div
          className="flex items-center border-b border-gray-100 px-3 dark:border-white/[0.05]"
          style={{ scrollbarWidth: 'none', overflowX: 'auto' }}
        >
          {STATUS_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-[11px] font-medium transition-colors ${
                activeTab === t.id
                  ? 'border-aims-blue text-aims-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1 py-px text-[9px] font-semibold ${
                activeTab === t.id
                  ? 'bg-aims-blue/10 text-aims-blue'
                  : 'bg-gray-100 text-gray-400 dark:bg-white/[0.06] dark:text-slate-400'
              }`}>
                {tabCounts[t.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileOutput size={20} className="text-gray-200 dark:text-slate-500" />
              <p className="text-xs font-medium text-gray-400 dark:text-slate-400">No outputs in this category.</p>
            </div>
          ) : (
            <>
              {visible.map(output => {
                const isNew = newIds.has(output.id)
                return (
                  <button
                    key={output.id}
                    type="button"
                    onClick={() => setSelected(output)}
                    className={`flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                      isNew ? 'bg-aims-blue/[0.04] dark:bg-aims-blue/[0.06]' : ''
                    }`}
                  >
                    {/* Left: title + workflow */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-medium ${
                        output.status === 'advanced'
                          ? 'text-gray-400 dark:text-slate-400'
                          : 'text-gray-800 dark:text-slate-200'
                      }`}>
                        {output.title}
                        {isNew && (
                          <span className="ml-1.5 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-aims-blue" aria-hidden="true" />
                        )}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 dark:text-slate-400">{output.producingWorkflow}</span>
                        <span className="text-[10px] text-gray-300 dark:text-slate-400">·</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-400">{output.when}</span>
                      </div>
                    </div>

                    {/* Right: status chip + chevron */}
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusChip status={output.status} label={output.statusLabel} />
                      {output.groundingSuperseded && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={7} /> Updated
                        </span>
                      )}
                      <ChevronRight size={10} className="mt-0.5 text-gray-300 dark:text-slate-400" aria-hidden="true" />
                    </div>
                  </button>
                )
              })}
              {overflow > 0 && (
                <div className="flex items-center justify-center border-t border-gray-100 py-2.5 dark:border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => navigate('/reports')}
                    className="text-[11px] text-aims-blue hover:underline"
                  >
                    +{overflow} more — see all
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && (
        <OutputPreviewDrawer
          output={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
        />
      )}
    </>
  )
}
