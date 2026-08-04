import { useState, useEffect } from 'react'
import { Workflow, Bot, ArrowUpRight, CheckSquare, Square, Clock, Tag, Link2, AlertTriangle, CheckCircle2, UserPlus, ChevronDown } from 'lucide-react'
import { WQDecisionSurface } from '../workqueue/WQDecisionSurface.jsx'
import { WQ_EVENT_DATA } from '../../data/wqEventData.js'
import { WQ_ADJUDICATE, WQ_ACTIONABLE_STATES } from '../../data/workqueue.js'

// D5 status chip — matches D4 vocabulary
const D4_STATUS_CHIP = {
  'Open':              { cls: 'bg-green-500/10 text-green-600 dark:text-green-400',    label: 'Open'         },
  'Claimed':           { cls: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',       label: 'Claimed'      },
  'In Progress':       { cls: 'bg-aims-blue/10 text-aims-blue',                         label: 'In progress'  },
  'Awaiting External': { cls: 'bg-gray-200/60 text-gray-500 dark:bg-white/[0.06] dark:text-slate-400', label: 'Awaiting'     },
  'Superseded':        { cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',    label: 'Superseded'   },
}

const KIND_LABEL = {
  gov:   { label: 'Policy · Governance', color: 'bg-aims-blue/[0.15] text-aims-blue dark:bg-aims-blue/[0.20]' },
  htl:   { label: 'Agent handoff',        color: 'bg-purple-500/[0.15] text-purple-600 dark:bg-purple-400/[0.20] dark:text-purple-300' },
  task:  { label: 'Task',                color: 'bg-white/[0.08] text-slate-300 dark:bg-white/[0.10] dark:text-slate-300' },
  inbox: { label: 'Message',             color: 'bg-white/[0.08] text-slate-300 dark:bg-white/[0.10] dark:text-slate-300' },
  wq:    { label: 'My Day · Work Queue', color: 'bg-amber-500/[0.18] text-amber-600 dark:bg-amber-400/[0.22] dark:text-amber-300' },
}

const PRIORITY_COLOR = {
  high: 'bg-red-500/[0.18] text-red-600 dark:bg-red-400/[0.20] dark:text-red-300',
  med:  'bg-amber-500/[0.18] text-amber-700 dark:bg-amber-400/[0.20] dark:text-amber-300',
  low:  'bg-white/[0.08] text-slate-500 dark:bg-white/[0.10] dark:text-slate-300',
}

// ── D6: Routing zone snooze dropdown ─────────────────────────────────────────
const SNOOZE_OPTIONS = [
  { label: 'In 1 hour' },
  { label: 'In 4 hours' },
  { label: 'Tonight 9 PM' },
  { label: 'Tomorrow 9 AM' },
]

function SnoozeBtn({ onSnooze }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.05]"
      >
        <Clock size={10} aria-hidden="true" /> Snooze
        <ChevronDown size={8} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-white/[0.10] dark:bg-[var(--surface-raised)]">
          {SNOOZE_OPTIONS.map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={() => { onSnooze(opt); setOpen(false) }}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function enrichItem(item) {
  const base = {
    triggerLabel:         '',
    triggerName:          '',
    triggerReason:        '',
    stakesWorkflows:      0,
    stakesAgents:         0,
    stakesFlowNames:      [],
    stakesFlowList:       [],
    stakesAgentNames:     [],
    stakesBlockedSince:   null,
    stakesCustomerFacing: 0,
    stakesSlaBreachIn:    null,
    history:              [],
    primaryLabel:         'Mark done',
    secondaryLabel:       'Decline',
    showSecondary:        true,
  }

  if (item.status === 'error') {
    return {
      ...base,
      triggerLabel:    'System error',
      triggerName:     item.actor?.name ?? 'Automated step',
      triggerReason:   item.errorMsg ?? item.meta?.step ?? '',
      stakesWorkflows: 1,
      primaryLabel:    'Retry',
      secondaryLabel:  'Dismiss',
    }
  }

  if (item._kind === 'gov') {
    return {
      ...base,
      triggerLabel:         'Governance policy',
      triggerName:          item.impact?.workflows ? `${item.impact.workflows} workflows paused` : 'Policy event',
      triggerReason:        item.context ?? item.detail ?? '',
      stakesWorkflows:      item.impact?.workflows ?? 0,
      stakesAgents:         item.impact?.agents ?? 0,
      stakesFlowNames:      item.impact?.flowNames ?? [],
      stakesFlowList:       item.impact?.flowList ?? [],
      stakesAgentNames:     item.impact?.agentNames ?? [],
      stakesBlockedSince:   item.impact?.blockedSince ?? null,
      stakesCustomerFacing: item.impact?.customerFacing ?? 0,
      stakesSlaBreachIn:    item.impact?.slaBreachIn ?? null,
      primaryLabel:         item.action ?? 'Approve',
      secondaryLabel:       'Escalate to manager',
      history: [
        { label: 'Similar approval · 5 days ago',  decision: 'Approved', by: 'You'       },
        { label: 'Same policy · 2 weeks ago',       decision: 'Approved', by: 'Aisha Khan' },
      ],
    }
  }

  if (item._kind === 'htl') {
    return {
      ...base,
      triggerLabel:    item.source ?? 'Agent',
      triggerName:     item.source === 'Workflow' ? 'Workflow checkpoint' : item.source === 'Escalation' ? 'Escalation' : 'Agent paused',
      triggerReason:   item.detail ?? '',
      stakesWorkflows: item.source === 'Workflow' ? 1 : 0,
      stakesAgents:    item.source === 'Agent' ? 1 : 0,
      primaryLabel:    item.action ?? 'Approve',
      secondaryLabel:  'Decline',
      history: [
        { label: 'Similar request · 1 week ago',  decision: 'Approved', by: 'You'       },
        { label: 'Same source · 3 weeks ago',      decision: 'Declined', by: 'Priya Nair' },
      ],
    }
  }

  if (item._kind === 'task') {
    return {
      ...base,
      triggerLabel:    item.actor?.system ? 'Automated' : 'Human request',
      triggerName:     item.actor?.name ?? 'System',
      triggerReason:   item.meta?.trigger ?? '',
      stakesWorkflows: item.blocking ? 1 : 0,
      primaryLabel:    item.action?.label ?? 'Mark done',
      secondaryLabel:  'Skip for now',
      history: [
        { label: 'Same task type · 1 month ago', decision: 'Completed', by: 'You' },
      ],
    }
  }

  if (item._kind === 'wq') {
    const studioNames = { GOV: 'Governance', AGNT: 'Agentic Studio', DATA: 'Data Studio', TASK: 'Tasks' }
    const tierLabel = { critical: 'Critical', action: 'Action needed', headsup: 'Heads-up' }
    return {
      ...base,
      triggerLabel:    item.wqType ?? 'Work Queue',
      triggerName:     item.source ?? studioNames[item.studio] ?? item.studio,
      triggerReason:   item.dueLabel ?? '',
      primaryLabel:    item.primaryAction ?? 'Take action',
      secondaryLabel:  'Skip for now',
      history: [
        { label: `Severity: ${item.severity ?? 'Standard'}`, decision: item.studio, by: 'AI queue' },
      ],
    }
  }

  if (item._kind === 'inbox') {
    return {
      ...base,
      triggerLabel:   item.actor?.system ? 'System' : 'Contact',
      triggerName:    item.actor?.name ?? 'Unknown',
      triggerReason:  item.actor?.role ?? item.meta?.category ?? '',
      primaryLabel:   item.action?.label ?? (item.unread ? 'Mark read' : 'Archive'),
      secondaryLabel: item.action ? 'Dismiss' : 'Archive',
      history: [
        { label: 'Last message from this sender · 5 days ago', decision: 'Read', by: 'You' },
      ],
    }
  }

  return base
}

// Build compact metadata chips from item fields
function metaChips(item) {
  const chips = []
  if (item.at) {
    chips.push({ icon: 'clock', label: item.at })
  }
  if (item.meta?.trigger)     chips.push({ icon: 'tag', label: item.meta.trigger })
  if (item.meta?.source)      chips.push({ icon: 'tag', label: item.meta.source })
  if (item.meta?.requestedBy) chips.push({ icon: 'tag', label: `Req. by ${item.meta.requestedBy}` })
  if (item.meta?.category)    chips.push({ icon: 'tag', label: item.meta.category })
  if (item.meta?.lastOk)      chips.push({ icon: 'clock', label: `Last OK: ${item.meta.lastOk}` })
  if (item.meta?.confidence)  chips.push({ icon: 'tag', label: `Confidence ${item.meta.confidence}` })
  if (item.meta?.model)       chips.push({ icon: 'tag', label: item.meta.model })
  if (item.meta?.runId)       chips.push({ icon: 'tag', label: item.meta.runId })
  if (item._kind === 'wq' && item.dueLabel)          chips.push({ icon: 'clock', label: item.dueLabel })
  if (item._kind === 'wq' && item.estimatedMinutes)  chips.push({ icon: 'clock', label: `~${item.estimatedMinutes} min` })
  if (item.priority && item.priority !== 'med')      chips.push({ icon: 'tag', label: `${item.priority === 'high' ? 'High' : 'Low'} priority`, priority: item.priority })
  return chips
}

function titleOf(item) { return item.title ?? item.subject ?? '(untitled)' }
function whenOf(item)  { return item.when ?? item.at ?? '' }
function bodyOf(item)  { return item.body ?? item.detail ?? item.context ?? '' }

const Divider = () => <div className="border-t border-gray-100 dark:border-white/[0.05]" />

export function AttentionDetail({ item, onApprove, onDecline, onComplete, onDismiss }) {
  const [note,          setNote]          = useState('')
  const [attested,      setAttested]      = useState(false)
  const [wqTab,         setWqTab]         = useState('decision')
  const [flowsExpanded, setFlowsExpanded] = useState(false)

  useEffect(() => {
    setAttested(false)
    setWqTab('decision')
    setFlowsExpanded(false)
  }, [item?.id])

  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-7 px-10 text-center select-none">

        {/* Stacked ghost-card illustration */}
        <div className="relative h-28 w-52">
          {/* Back card */}
          <div
            className="absolute inset-x-8 bottom-0 h-[62px] rounded-2xl border border-white/[0.05] bg-white/[0.015]"
            style={{ transform: 'rotate(-5deg)' }}
          />
          {/* Mid card */}
          <div
            className="absolute inset-x-4 bottom-2 h-[62px] rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            style={{ transform: 'rotate(-1.5deg)' }}
          />
          {/* Front card — most prominent, with placeholder content */}
          <div className="absolute inset-x-0 bottom-4 h-[62px] rounded-2xl border border-white/[0.12] bg-white/[0.05] px-4 py-3 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded-md bg-aims-blue/[0.25]" />
              <div className="h-1.5 flex-1 rounded-full bg-white/[0.10]" />
              <div className="h-4 w-11 rounded-full bg-amber-500/[0.22]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-white/[0.07]" />
              <div className="h-1.5 w-10/12 rounded-full bg-white/[0.05]" />
            </div>
          </div>
          {/* Scan icon badge floating on front card */}
          <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--canvas)]">
            <ScanEyeIcon />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[13.5px] font-semibold text-slate-200">Select an item to review</p>
          <p className="max-w-[200px] text-[11.5px] leading-relaxed text-slate-500">
            Pick an item from the queue to see context, stakes, and decision options.
          </p>
        </div>

        {/* Keyboard nav hint */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-[3px] font-mono text-[10px] text-slate-500">↑</kbd>
          <kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-[3px] font-mono text-[10px] text-slate-500">↓</kbd>
          <span>to navigate the queue</span>
        </div>

      </div>
    )
  }

  const kMeta = KIND_LABEL[item._kind] ?? KIND_LABEL.task

  // WQ events with eventCategory get a type-specific decision surface
  if (item.eventCategory) {
    const md = WQ_EVENT_DATA[item.id] ?? {}
    const evtNum = (() => {
      const n = parseInt((item.id ?? '').replace(/\D/g, ''), 10)
      return isNaN(n) ? 'EVT-???' : `EVT-${String(n).padStart(3, '0')}`
    })()
    const isUrgent = item.missionCritical || (item.blastRadius ?? 0) >= 10
    return (
      <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden">
        <div className="shrink-0 px-7 pt-6 pb-5 border-b border-gray-100 dark:border-white/[0.05]">

          {/* Row 1 — chips */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-gray-900 dark:bg-white/[0.1] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white dark:text-slate-200">
              {evtNum}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${kMeta.color}`}>
              {kMeta.label}
            </span>
            {md.sourceRef && (
              <span className="rounded bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-gray-500 dark:text-slate-400">
                {md.sourceRef}
              </span>
            )}
            {item.quickActions?.primary && (
              <span className="rounded-full bg-amber-400/[0.22] px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/[0.20] dark:text-amber-400">
                {item.quickActions.primary}
              </span>
            )}
            {(() => {
              const s = D4_STATUS_CHIP[item.status ?? 'Open'] ?? D4_STATUS_CHIP['Open']
              return (
                <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}>
                  {s.label}
                </span>
              )
            })()}
          </div>

          {/* Title */}
          <h2 className="text-[15px] font-semibold leading-snug text-gray-900 dark:text-slate-100">
            {item.title}
          </h2>

          {/* Mission Critical badge */}
          {item.missionCritical && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30 px-2 py-0.5">
              <AlertTriangle size={9} className="text-amber-500" aria-hidden="true" />
              <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Mission Critical</span>
            </div>
          )}

          {/* Urgency bar */}
          {isUrgent && (
            <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-900/20">
              <div className="h-full w-4/5 rounded-full bg-red-400 dark:bg-red-500" />
            </div>
          )}

          {/* Due label */}
          {item.dueLabel && (
            <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-400">{item.dueLabel}</p>
          )}
        </div>

        {/* D6: Routing strip — type-invariant routing verbs only */}
        <div className="shrink-0 flex items-center gap-2 border-b border-gray-100 dark:border-white/[0.05] px-7 py-2.5">
          <SnoozeBtn onSnooze={() => onDecline(item)} />
          <button
            type="button"
            onClick={() => onDecline(item)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10"
          >
            <ArrowUpRight size={10} aria-hidden="true" /> Escalate to manager
          </button>
          <div className="flex-1" />
          <button
            type="button"
            disabled
            title="Reassign to team member — coming in V1.5"
            className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-400 opacity-40 dark:border-white/[0.08] dark:text-slate-400"
          >
            <UserPlus size={10} aria-hidden="true" /> Reassign
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.05] px-7">
          {[
            { id: 'decision', label: 'Decision' },
            ...(item.eventCategory !== 'inbound-question'
              ? [{ id: 'thread', label: 'Thread', badge: md.thread?.comments?.length }]
              : []),
            // D5: Adjudicate types get "Attestation", all others get "Audit Trail"
            { id: 'audit', label: WQ_ADJUDICATE.has(item.wqType) ? 'Attestation' : 'Audit Trail' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setWqTab(t.id)}
              className={`relative flex items-center gap-1.5 py-3 pr-4 text-[11px] font-semibold transition-colors ${
                wqTab === t.id
                  ? 'text-aims-blue'
                  : 'text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-400'
              }`}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="rounded-full bg-aims-blue/10 px-1.5 py-0.5 text-[9px] font-bold text-aims-blue">
                  {t.badge}
                </span>
              )}
              {wqTab === t.id && (
                <span className="absolute bottom-0 left-0 right-4 h-0.5 rounded-full bg-aims-blue" />
              )}
            </button>
          ))}
        </div>

        {/* Decision tab */}
        {wqTab === 'decision' && (
          <WQDecisionSurface
            event={item}
            md={md}
            onResolve={() => onApprove(item)}
            onDecline={() => onDecline(item)}
          />
        )}

        {/* Thread tab */}
        {wqTab === 'thread' && (
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0 px-7 py-3 border-b border-gray-100 dark:border-white/[0.05]">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                md.thread?.status === 'open'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-slate-400'
              }`}>
                {md.thread?.status?.toUpperCase() ?? 'OPEN'}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-400">
                {md.thread?.comments?.length ?? 0} messages
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
              {(md.thread?.comments ?? []).length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-slate-400">No messages yet.</p>
              ) : (md.thread.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    c.authorRole === 'You'
                      ? 'bg-aims-blue/10 text-aims-blue dark:bg-aims-blue/[0.15]'
                      : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-slate-400'
                  }`}>
                    {c.authorName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{c.authorName}</span>
                      <span className="text-[9px] text-gray-400 dark:text-slate-400">{c.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-400">{c.authorRole}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-slate-400">{c.body}</p>
                  </div>
                </div>
              )))}
            </div>
            <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.07] px-7 pt-4 pb-5">
              <WQThreadComposer />
            </div>
          </div>
        )}

        {/* Audit / Attestation tab — D5: label and content differ by archetype */}
        {wqTab === 'audit' && (
          <div className="flex-1 overflow-y-auto px-7 py-5">
            {WQ_ADJUDICATE.has(item.wqType) ? (
              <div className="mb-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-purple-500 dark:text-purple-400">
                  Attestation log
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-gray-400 dark:text-slate-500">
                  Actions here are signed to the audit ledger.{' '}
                  {item.wqType === 'Break Glass'
                    ? 'Your signature is reversible until quorum completes. After quorum, correction requires a new record.'
                    : 'Each decision is recorded with a timestamp and cannot be edited retroactively.'}
                </p>
              </div>
            ) : (
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
                Audit trail
              </p>
            )}
            {(item.auditTrail ?? []).length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-400">No audit events recorded.</p>
            ) : (
              <div className="space-y-0">
                {item.auditTrail.map((entry, i) => (
                  <div key={i} className="relative flex gap-3 pb-5">
                    {i < item.auditTrail.length - 1 && (
                      <div className="absolute left-[10px] top-5 bottom-0 w-px bg-gray-100 dark:bg-white/[0.04]" />
                    )}
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.06] mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[11px] font-medium text-gray-700 dark:text-slate-300">{entry.action}</p>
                      <p className="mt-0.5 text-[9px] text-gray-400 dark:text-slate-400">
                        {entry.by} · {entry.at}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const enrich = enrichItem(item)
  const body   = bodyOf(item)
  const chips  = metaChips(item)

  // Attestation required for governance and HTL approvals — V1 requirement
  const needsAttestation = item._kind === 'gov' || item._kind === 'htl'
  const primaryDisabled  = needsAttestation && !attested

  function handlePrimary() {
    if (item._kind === 'gov' || item._kind === 'htl') onApprove(item)
    else                                              onComplete(item)
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Item header: title + tags inline, timestamp below ── */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold leading-snug text-gray-900 dark:text-slate-100">
              {titleOf(item)}
            </h2>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 pt-0.5">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${kMeta.color}`}>
                {kMeta.label}
              </span>
              {item.status === 'error' && (
                <span className="rounded-full bg-red-500/[0.18] px-2.5 py-1 text-[11px] font-semibold text-red-500 dark:bg-red-400/[0.18] dark:text-red-400">
                  Error
                </span>
              )}
              {item.priority && (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_COLOR[item.priority] ?? PRIORITY_COLOR.low}`}>
                  {item.priority === 'high' ? 'High priority' : item.priority === 'med' ? 'Medium' : 'Low priority'}
                </span>
              )}
              {item.statusLabel && (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  /due|overdue|urgent|now/i.test(item.statusLabel)
                    ? 'bg-amber-400/[0.22] text-amber-700 dark:bg-amber-400/[0.22] dark:text-amber-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-white/[0.14] dark:text-slate-300'
                }`}>
                  {item.statusLabel}
                </span>
              )}
              {item.quickActions?.primary && (
                <span className="rounded-full bg-amber-400/[0.22] px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/[0.20] dark:text-amber-400">
                  {item.quickActions.primary}
                </span>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-gray-400 dark:text-slate-400">{whenOf(item)}</p>
        </div>

        <Divider />

        {/* ── Why this came to you ── */}
        <div className="px-7 py-5">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
            Reason
          </p>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-aims-blue/10 dark:bg-aims-blue/[0.15]">
              <Workflow size={14} className="text-aims-blue" aria-hidden="true" />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{enrich.triggerName}</p>
              {enrich.triggerReason && (
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">{enrich.triggerReason}</p>
              )}
              <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-white/[0.12] dark:text-slate-300">
                {enrich.triggerLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Metadata chips ── */}
        {chips.length > 0 && (
          <>
            <Divider />
            <div className="px-7 py-3.5">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
                Details
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((chip, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                      chip.priority === 'high'
                        ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400'
                        : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400'
                    }`}
                  >
                    {chip.icon === 'clock'
                      ? <Clock size={9} className="shrink-0 opacity-60" aria-hidden="true" />
                      : <Tag  size={9} className="shrink-0 opacity-60" aria-hidden="true" />
                    }
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── At stake ── */}
        {(enrich.stakesWorkflows > 0 || enrich.stakesAgents > 0) && (
          <>
            <Divider />
            <div className="px-7 py-5">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-500/80">
                At stake
              </p>
              <div className="grid grid-cols-2 gap-2">
                {enrich.stakesWorkflows > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.02] px-4 py-3.5">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Workflow{enrich.stakesWorkflows !== 1 ? 's' : ''} blocked
                      </p>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/[0.12]">
                        <Workflow size={13} className="text-amber-500" aria-hidden="true" />
                      </div>
                    </div>
                    <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                      {enrich.stakesWorkflows}
                    </span>
                    {/* Option B — urgency line */}
                    {(enrich.stakesCustomerFacing > 0 || enrich.stakesSlaBreachIn) && (
                      <p className="mt-1.5 text-[10px] font-semibold text-red-500 dark:text-red-400">
                        {[
                          enrich.stakesCustomerFacing > 0 ? `${enrich.stakesCustomerFacing} customer-facing` : null,
                          enrich.stakesSlaBreachIn ? `SLA breach in ${enrich.stakesSlaBreachIn}` : null,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {/* Option A — preview names + expand toggle */}
                    {enrich.stakesFlowNames.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-1">
                        <span className="text-[10px] leading-relaxed text-gray-400 dark:text-slate-500">
                          {enrich.stakesFlowNames.slice(0, 2).join(', ')}
                        </span>
                        {enrich.stakesFlowList.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setFlowsExpanded(e => !e)}
                            className="text-[10px] font-medium text-aims-blue hover:underline shrink-0"
                          >
                            {flowsExpanded ? 'collapse' : `+${enrich.stakesWorkflows - 2} more`}
                          </button>
                        )}
                      </div>
                    )}
                    {enrich.stakesBlockedSince && (
                      <p className="mt-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        Paused {enrich.stakesBlockedSince}
                      </p>
                    )}
                  </div>
                )}
                {enrich.stakesAgents > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.02] px-4 py-3.5">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Agent{enrich.stakesAgents !== 1 ? 's' : ''} on hold
                      </p>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/[0.12]">
                        <Bot size={13} className="text-purple-500" aria-hidden="true" />
                      </div>
                    </div>
                    <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                      {enrich.stakesAgents}
                    </span>
                    {enrich.stakesAgentNames.length > 0 && (
                      <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400 dark:text-slate-500">
                        {enrich.stakesAgentNames.slice(0, 2).join(', ')}
                        {enrich.stakesAgents > enrich.stakesAgentNames.length
                          ? ` +${enrich.stakesAgents - enrich.stakesAgentNames.length} more`
                          : ''}
                      </p>
                    )}
                    {enrich.stakesBlockedSince && (
                      <p className="mt-1 text-[10px] font-medium text-purple-500 dark:text-purple-400">
                        Waiting {enrich.stakesBlockedSince}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Option A — expanded flow list, full-width below the 2-col cards */}
              {flowsExpanded && enrich.stakesFlowList.length > 0 && (
                <div className="mt-2 rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
                  <div className="max-h-[188px] overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {enrich.stakesFlowList.map((flow, i) => {
                      const tagColor = flow.tag === 'Customer'
                        ? 'bg-red-500'
                        : flow.tag === 'Finance'
                        ? 'bg-amber-500'
                        : flow.tag === 'Compliance'
                        ? 'bg-aims-blue'
                        : 'bg-gray-300 dark:bg-slate-600'
                      return (
                        <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-white dark:bg-white/[0.015]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tagColor}`} />
                            <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300 truncate">
                              {flow.name}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">
                              {flow.tag}
                            </span>
                          </div>
                          {flow.urgent && (
                            <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 shrink-0">
                              {flow.urgent}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Context — only show when body adds something beyond the reason already shown ── */}
        {body && body !== enrich.triggerReason && (
          <>
            <Divider />
            <div className="px-7 py-5">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
                Background
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{body}</p>
            </div>
          </>
        )}

        {/* ── Related item ── */}
        {item.related?.label && (
          <>
            <Divider />
            <div className="px-7 py-4">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
                Related
              </p>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left transition-colors hover:border-aims-blue/40 hover:bg-aims-blue/[0.03] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-aims-blue/30"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-aims-blue/10 dark:bg-aims-blue/[0.15]">
                  <Link2 size={12} className="text-aims-blue" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-gray-800 dark:text-slate-200">
                    {item.related.label}
                  </p>
                  {(item.related.widgetId || item.related.dashboardId) && (
                    <p className="text-[9px] text-gray-400 dark:text-slate-400">
                      {item.related.widgetId ? 'Widget' : 'Dashboard'}
                      {' · '}{item.related.widgetId ?? item.related.dashboardId}
                    </p>
                  )}
                </div>
                <ArrowUpRight size={12} className="shrink-0 text-gray-400 dark:text-slate-400" aria-hidden="true" />
              </button>
            </div>
          </>
        )}

        {/* ── Actor ── */}
        {item.actor && (
          <>
            <Divider />
            <div className="flex items-center gap-3 px-7 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-slate-400">
                {(item.actor.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{item.actor.name}</p>
                {item.actor.role  && <p className="text-[10px] text-gray-500 dark:text-slate-400">{item.actor.role}</p>}
                {item.actor.email && <p className="text-[10px] text-gray-400 dark:text-slate-400">{item.actor.email}</p>}
              </div>
              {item.actor.system && (
                <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">
                  Automated
                </span>
              )}
            </div>
          </>
        )}

        {/* ── Similar decisions ── */}
        {enrich.history.length > 0 && (
          <>
            <Divider />
            <div className="px-7 py-5">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
                Similar decisions
              </p>
              <div className="space-y-2">
                {enrich.history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-white/[0.025] px-3 py-2.5"
                  >
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400">{h.label}</p>
                      <p className="text-[9px] text-gray-400 dark:text-slate-400">by {h.by}</p>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      h.decision === 'Approved' || h.decision === 'Completed' || h.decision === 'Read'
                        ? 'bg-green-500/10 text-aims-governed'
                        : h.decision === 'Declined'
                        ? 'bg-red-500/10 text-red-500 dark:text-red-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-slate-400'
                    }`}>
                      {h.decision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Metadata row — ID only; received is already shown in the header ── */}
        <Divider />
        <div className="px-7 py-3">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-300 hover:text-gray-400 dark:text-slate-600 dark:hover:text-slate-400 select-none">
              Details
              <svg className="h-2.5 w-2.5 rotate-0 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 2l4 4-4 4"/></svg>
            </summary>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">ID</span>
              <span className="font-mono text-[11px] text-gray-500 dark:text-slate-400">
                {(() => {
                  const n = parseInt((item.id ?? '').replace(/\D/g, ''), 10)
                  return isNaN(n) ? 'ATT-001' : `ATT-${String(n).padStart(3, '0')}`
                })()}
              </span>
            </div>
          </details>
        </div>

        {/* ── Comment ── */}
        <Divider />
        <div className="px-7 py-4">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">
            Comment
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a comment..."
              className="input flex-1 py-2 text-[12px]"
            />
            <button
              type="button"
              disabled={!note.trim()}
              onClick={() => setNote('')}
              className="rounded-lg border border-gray-200 dark:border-white/[0.18] px-3 py-2 text-[12px] font-medium text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/[0.08] disabled:opacity-40 transition-colors"
            >
              Post
            </button>
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* ── Sticky footer — attestation + decisive action strip ── */}
      <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[var(--canvas)] px-7 pt-4 pb-5">

        {/* Attestation checkbox — required for gov / htl approvals (V1) */}
        {needsAttestation && (
          <button
            type="button"
            onClick={() => setAttested(a => !a)}
            className={`mb-3 flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              attested
                ? 'border-aims-blue/40 bg-aims-blue/[0.05] dark:bg-aims-blue/[0.08]'
                : 'border-gray-200 bg-gray-50 dark:border-white/[0.07] dark:bg-white/[0.02]'
            }`}
            aria-pressed={attested}
          >
            {attested
              ? <CheckSquare size={14} className="mt-0.5 shrink-0 text-aims-blue" aria-hidden="true" />
              : <Square      size={14} className="mt-0.5 shrink-0 text-gray-400 dark:text-slate-400" aria-hidden="true" />
            }
            <span className={`text-[11px] leading-snug ${
              attested
                ? 'font-medium text-aims-blue'
                : 'text-gray-500 dark:text-slate-400'
            }`}>
              I've reviewed this and understand the impact.
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handlePrimary}
          disabled={primaryDisabled}
          className={`btn-primary w-full py-2.5 text-sm font-semibold transition-opacity ${
            primaryDisabled ? 'opacity-35 cursor-not-allowed' : ''
          }`}
        >
          {enrich.primaryLabel}
        </button>
        {enrich.showSecondary && (
          <button
            type="button"
            onClick={() => onDecline(item)}
            className="mt-2 w-full rounded-lg py-2 text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-400"
          >
            {enrich.secondaryLabel}
          </button>
        )}
      </div>

    </div>
  )
}

function WQThreadComposer() {
  const [text, setText] = useState('')
  const [sent, setSent]   = useState(false)

  if (sent) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 px-3 py-2.5">
        <CheckCircle2 size={13} className="text-aims-governed shrink-0" />
        <span className="text-xs font-medium text-aims-governed">Reply sent.</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={2}
        className="input w-full resize-none text-xs"
        placeholder="Reply to thread… use @name to mention a teammate"
      />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000) }}
        className="btn-primary w-full py-2 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send reply
      </button>
    </div>
  )
}

function ScanEyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-400" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="1" />
      <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
    </svg>
  )
}
