import { useState } from 'react'
import { Workflow, Bot, ArrowUpRight } from 'lucide-react'

const KIND_LABEL = {
  gov:   { label: 'Policy · Governance', color: 'bg-aims-blue/10 text-aims-blue' },
  htl:   { label: 'Human in the Loop',   color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  task:  { label: 'Task',                color: 'bg-gray-100 text-gray-600 dark:bg-white/[0.07] dark:text-slate-400' },
  inbox: { label: 'Message',             color: 'bg-gray-100 text-gray-600 dark:bg-white/[0.07] dark:text-slate-400' },
}

function enrichItem(item) {
  const base = {
    triggerLabel:    '',
    triggerName:     '',
    triggerReason:   '',
    stakesWorkflows: 0,
    stakesAgents:    0,
    history:         [],
    primaryLabel:    'Mark done',
    secondaryLabel:  'Decline',
    showSecondary:   true,
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
      triggerLabel:    'Governance policy',
      triggerName:     item.impact?.workflows ? `${item.impact.workflows} workflows paused` : 'Policy event',
      triggerReason:   item.context ?? item.detail ?? '',
      stakesWorkflows: item.impact?.workflows ?? 0,
      stakesAgents:    item.impact?.agents ?? 0,
      primaryLabel:    item.action ?? 'Approve',
      secondaryLabel:  'Escalate',
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

function titleOf(item) { return item.title ?? item.subject ?? '(untitled)' }
function whenOf(item)  { return item.when ?? item.at ?? '' }
function bodyOf(item)  { return item.body ?? item.detail ?? item.context ?? '' }

const Divider = () => (
  <div className="border-t border-gray-100 dark:border-white/[0.05]" />
)

export function AttentionDetail({ item, onApprove, onDecline, onComplete, onDismiss }) {
  const [note, setNote] = useState('')

  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.04]">
          <ScanEyeIcon />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Select an item to review</p>
        <p className="max-w-xs text-xs text-gray-400 dark:text-slate-600">
          Pick an item from the queue to see context, stakes, and decision options.
        </p>
      </div>
    )
  }

  const enrich = enrichItem(item)
  const kMeta  = KIND_LABEL[item._kind] ?? KIND_LABEL.task
  const body   = bodyOf(item)

  function handlePrimary() {
    if (item._kind === 'gov' || item._kind === 'htl') onApprove(item)
    else                                              onComplete(item)
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Item header ── */}
        <div className="px-7 pt-7 pb-5">
          <div className="mb-3 flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${kMeta.color}`}>
              {kMeta.label}
            </span>
            {item.status === 'error' && (
              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
                Error
              </span>
            )}
            <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-600">{whenOf(item)}</span>
          </div>
          <h2 className="text-lg font-semibold leading-snug text-gray-900 dark:text-slate-100">
            {titleOf(item)}
          </h2>
        </div>

        <Divider />

        {/* ── Why this came to you ── */}
        <div className="px-7 py-5">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-600">
            Why this came to you
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
              <span className="mt-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-500">
                {enrich.triggerLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── At stake ── */}
        {(enrich.stakesWorkflows > 0 || enrich.stakesAgents > 0) && (
          <>
            <Divider />
            <div className="px-7 py-5">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-500/80">
                At stake
              </p>
              <div className="flex items-start gap-10">
                {enrich.stakesWorkflows > 0 && (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                        {enrich.stakesWorkflows}
                      </span>
                      <Workflow size={13} className="mb-0.5 text-amber-500" aria-hidden="true" />
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-slate-500">
                      workflow{enrich.stakesWorkflows !== 1 ? 's' : ''} blocked
                    </p>
                  </div>
                )}
                {enrich.stakesAgents > 0 && (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                        {enrich.stakesAgents}
                      </span>
                      <Bot size={13} className="mb-0.5 text-amber-500" aria-hidden="true" />
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-slate-500">
                      agent{enrich.stakesAgents !== 1 ? 's' : ''} waiting
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Context ── */}
        {body && (
          <>
            <Divider />
            <div className="px-7 py-5">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-600">
                Context
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{body}</p>
              {item.related?.label && (
                <button type="button" className="mt-3 flex items-center gap-1 text-[11px] text-aims-blue hover:underline">
                  <ArrowUpRight size={11} aria-hidden="true" />
                  {item.related.label}
                </button>
              )}
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
                {item.actor.role  && <p className="text-[10px] text-gray-500 dark:text-slate-500">{item.actor.role}</p>}
                {item.actor.email && <p className="text-[10px] text-gray-400 dark:text-slate-600">{item.actor.email}</p>}
              </div>
              {item.actor.system && (
                <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-500">
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
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-600">
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
                      <p className="text-[9px] text-gray-400 dark:text-slate-600">by {h.by}</p>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      h.decision === 'Approved' || h.decision === 'Completed' || h.decision === 'Read'
                        ? 'bg-green-500/10 text-aims-governed'
                        : 'bg-red-500/10 text-red-500 dark:text-red-400'
                    }`}>
                      {h.decision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Note ── */}
        <Divider />
        <div className="px-7 py-5">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-600">
            Note (optional)
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note before deciding — e.g. why you're escalating or approving…"
            rows={2}
            className="input w-full resize-none text-xs"
          />
        </div>

        <div className="h-2" />
      </div>

      {/* ── Sticky footer — decisive action strip ── */}
      <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#0d1117] px-7 pt-4 pb-5">
        <button
          type="button"
          onClick={handlePrimary}
          className="btn-primary w-full py-2.5 text-sm font-semibold"
        >
          {enrich.primaryLabel}
        </button>
        {enrich.showSecondary && (
          <button
            type="button"
            onClick={() => onDecline(item)}
            className="mt-2 w-full rounded-lg py-2 text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-400"
          >
            {enrich.secondaryLabel}
          </button>
        )}
      </div>

    </div>
  )
}

function ScanEyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-600" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="1" />
      <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
    </svg>
  )
}
