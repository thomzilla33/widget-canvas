import { useState } from 'react'
import { Bot, Building2, CheckCircle2, ChevronRight, Clock, MessageSquare, ShieldAlert, Shuffle, User2 } from 'lucide-react'
import { WQConfirmBar, SectionLabel, Divider } from './WQPrimitives.jsx'
import { WQClaimsList } from './WQClaimsList.jsx'
import { TEAM_ROSTER } from '../../data/workqueue.js'

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function WQDecisionSurface({ event, md, onResolve, onDecline }) {
  const props = { event, md, onResolve, onDecline }
  switch (event.eventCategory) {
    case 'htl-continuation':   return <HTLContinuation {...props} />
    case 'htl-handoff':        return <HTLHandoff {...props} />
    case 'gov-promotion':      return <GovPromotion {...props} />
    case 'gov-review':         return <GovReview {...props} />
    case 'gov-break-glass':    return <GovBreakGlass {...props} />
    case 'gov-change-request': return <GovChangeRequest {...props} />
    case 'train-me':           return <TrainMe {...props} />
    case 'client-continuation':  return <HTLContinuation {...props} isClient />
    case 'client-handoff':       return <HTLHandoff {...props} isClient />
    case 'inbound-question':     return <InboundQuestion {...props} />
    case 'question':             return <QuestionSurface {...props} />
    default:                     return <GenericWQSurface {...props} />
  }
}

// ── Layout shell ──────────────────────────────────────────────────────────────

function Surface({ children, footer }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">
        {children}
      </div>
      <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[var(--canvas)] px-7 pt-4 pb-5">
        {footer}
      </div>
    </div>
  )
}

// ── Customer card (client events) ─────────────────────────────────────────────

function CustomerCard({ md }) {
  if (!md?.entityName) return null
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aims-blue/10 dark:bg-aims-blue/[0.15]">
          <Building2 size={14} className="text-aims-blue" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">{md.entityName}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 dark:text-slate-400">{md.recordId}</span>
            {md.sourceSystem && <>
              <span className="text-gray-300 dark:text-white/10">·</span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400">{md.sourceSystem}</span>
            </>}
          </div>
        </div>
      </div>
      {md.keyFacts && (
        <ul className="mt-3 space-y-1.5">
          {md.keyFacts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aims-blue/50" />
              {fact}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── 1. HTL Continuation ───────────────────────────────────────────────────────

function HTLContinuation({ event, md, onResolve, onDecline, isClient }) {
  const [phase, setPhase]           = useState('idle') // idle | confirm-approve | editing | confirm-block
  const [editedBody, setEditedBody] = useState(md.draftEmail?.body ?? '')
  const [blockReason, setBlockReason] = useState('')

  const draft = md.draftEmail ?? {}

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          <button type="button" onClick={() => setPhase('confirm-approve')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Approve and send
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditedBody(draft.body ?? ''); setPhase('editing') }} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]">
              Edit before sending
            </button>
            <button type="button" onClick={() => setPhase('confirm-block')} className="flex-1 rounded-lg border border-red-200/60 py-2 text-xs font-medium text-red-500 hover:bg-red-50/50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20">
              Block
            </button>
          </div>
        </div>
      )}
      {phase === 'confirm-approve' && (
        <WQConfirmBar
          message={`Send this email to ${draft.to} on behalf of ${md.agent ?? 'agent'}?`}
          confirmLabel="Send email"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve(`Email approved and sent to ${draft.to}`)}
        />
      )}
      {phase === 'editing' && (
        <div className="space-y-2">
          <button type="button" onClick={() => setPhase('idle')} className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.04]">
            Cancel edit
          </button>
          <button type="button" onClick={() => onResolve('Edited output sent — logged to audit')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Send edited version
          </button>
        </div>
      )}
      {phase === 'confirm-block' && (
        <WQConfirmBar
          message="Block this action? The agent workflow will be terminated and you will need to manually restart it."
          confirmLabel="Block workflow"
          danger
          disabled={!blockReason.trim()}
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Blocked — workflow terminated. Logged to audit.')}
        >
          <textarea
            value={blockReason}
            onChange={e => setBlockReason(e.target.value)}
            rows={2}
            className="input w-full resize-none text-xs"
            placeholder="Required: reason for blocking…"
            autoFocus
          />
        </WQConfirmBar>
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {isClient && <CustomerCard md={md} />}

      {/* Situation */}
      <div>
        <SectionLabel>Situation</SectionLabel>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{event.description}</p>
        {md.model && (
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">
              {md.model}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-slate-400">
              Confidence: {Math.round((md.confidence ?? 0) * 100)}%
            </span>
          </div>
        )}
      </div>

      <Divider />

      {/* Draft email */}
      <div>
        <SectionLabel>What the agent prepared</SectionLabel>
        <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-white/[0.07] dark:bg-white/[0.025] overflow-hidden">
          <div className="border-b border-gray-100 dark:border-white/[0.05] px-4 py-3 space-y-1">
            <div className="flex gap-2 text-[10px]">
              <span className="text-gray-400 dark:text-slate-400 w-5 shrink-0">To</span>
              <span className="text-gray-700 dark:text-slate-300">{draft.to}</span>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="text-gray-400 dark:text-slate-400 w-5 shrink-0">Re</span>
              <span className="text-gray-700 dark:text-slate-300">{draft.subject}</span>
            </div>
          </div>
          {phase === 'editing' ? (
            <textarea
              value={editedBody}
              onChange={e => setEditedBody(e.target.value)}
              rows={8}
              className="w-full bg-transparent px-4 py-3 text-xs leading-relaxed text-gray-700 dark:text-slate-300 focus:outline-none resize-none"
            />
          ) : (
            <pre className="whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-gray-700 dark:text-slate-300 font-sans">
              {draft.body}
            </pre>
          )}
        </div>
      </div>
    </Surface>
  )
}

// ── 2. HTL Handoff ────────────────────────────────────────────────────────────

function HTLHandoff({ event, md, onResolve, onDecline, isClient }) {
  const [phase, setPhase]         = useState('idle') // idle | acknowledged | confirm-resolve | reassigning
  const [pickingTeam, setPickingTeam] = useState(false)

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          <button type="button" onClick={() => setPhase('acknowledged')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Acknowledge and take ownership
          </button>
          <button type="button" onClick={() => setPickingTeam(true)} className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]">
            Reassign to teammate
          </button>
        </div>
      )}
      {phase === 'acknowledged' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950/30">
            <CheckCircle2 size={13} className="text-aims-governed shrink-0" />
            <span className="text-xs font-medium text-aims-governed">You own this — update when resolved.</span>
          </div>
          <button type="button" onClick={() => setPhase('confirm-resolve')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Mark as resolved
          </button>
        </div>
      )}
      {phase === 'confirm-resolve' && (
        <WQConfirmBar
          message="Confirm this item is fully resolved and should be closed?"
          confirmLabel="Mark resolved"
          onCancel={() => setPhase('acknowledged')}
          onConfirm={() => onResolve('Marked resolved — logged to audit')}
        />
      )}
      {pickingTeam && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Pick teammate</p>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {TEAM_ROSTER.filter(m => !m.ooo).map(member => (
              <button
                key={member.id}
                type="button"
                onClick={() => { setPickingTeam(false); onResolve(`Reassigned to ${member.name}`) }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-[9px] font-bold text-gray-600 dark:text-slate-400">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-slate-200">{member.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400">{member.role}</p>
                </div>
                <ChevronRight size={12} className="ml-auto text-gray-300 dark:text-white/20" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPickingTeam(false)} className="w-full rounded-lg border border-gray-200 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-400">
            Cancel
          </button>
        </div>
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {isClient && <CustomerCard md={md} />}

      {/* Situation */}
      <div>
        <SectionLabel>Situation</SectionLabel>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{event.description}</p>
        {md.handoffReason && (
          <div className="mt-3 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2.5 dark:border-amber-700/20 dark:bg-amber-950/20">
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">{md.handoffReason}</p>
          </div>
        )}
      </div>

      {md.keyFacts?.length > 0 && <>
        <Divider />
        <div>
          <SectionLabel>Key facts</SectionLabel>
          <ul className="space-y-2">
            {md.keyFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aims-blue/50" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </>}

      {md.recommendations?.length > 0 && <>
        <Divider />
        <div>
          <SectionLabel>Recommendations</SectionLabel>
          <ol className="space-y-2">
            {md.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-slate-400">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-aims-blue/10 text-[9px] font-bold text-aims-blue">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </div>
      </>}
    </Surface>
  )
}

// ── 3. Gov Promotion ──────────────────────────────────────────────────────────

function GovPromotion({ event, md, onResolve, onDecline }) {
  const [allDecided, setAllDecided] = useState(false)
  const [phase, setPhase]           = useState('idle') // idle | confirm-submit

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          {!allDecided && (
            <p className="text-center text-[10px] text-gray-400 dark:text-slate-400">
              Review all {md.claims?.length ?? 0} claims above to enable submission
            </p>
          )}
          <button
            type="button"
            disabled={!allDecided}
            onClick={() => setPhase('confirm-submit')}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit attestation
          </button>
        </div>
      )}
      {phase === 'confirm-submit' && (
        <WQConfirmBar
          message="Submit your attestation? This will be recorded in the audit ledger and cannot be undone."
          confirmLabel="Confirm attestation"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Attestation submitted — logged to audit ledger')}
        />
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {/* D3 archetype + Package modifier badge */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">Adjudicate</span>
        <span className="rounded-full bg-purple-50/60 px-2 py-0.5 text-[9px] font-semibold text-purple-500 dark:bg-purple-400/[0.07] dark:text-purple-400">Package · {md.claims?.length ?? 0} items</span>
      </div>

      <div>
        <SectionLabel>Situation</SectionLabel>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{event.description}</p>
        {event.blastRadius > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400">
            <ShieldAlert size={12} />
            <span><strong>{event.blastRadius}</strong> workflows blocked until this attestation is submitted</span>
          </div>
        )}

        {/* Pipeline steps */}
        {md.pipelineSteps?.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-400">Pipeline</p>
            <div className="flex flex-wrap items-center">
              {md.pipelineSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex h-5 items-center gap-1 rounded-full px-2 text-[9px] font-semibold ${
                    step.status === 'complete'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : step.status === 'active'
                      ? 'bg-aims-blue/10 text-aims-blue ring-1 ring-inset ring-aims-blue/40'
                      : 'bg-gray-100 text-gray-400 dark:bg-white/[0.04] dark:text-slate-400'
                  }`}>
                    {step.status === 'complete' && <CheckCircle2 size={8} />}
                    {step.status === 'active' && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aims-blue" />
                    )}
                    {step.label}
                  </div>
                  {idx < md.pipelineSteps.length - 1 && (
                    <div className={`h-px w-3 shrink-0 ${
                      md.pipelineSteps[idx + 1].status !== 'pending'
                        ? 'bg-green-300 dark:bg-green-800/40'
                        : 'bg-gray-200 dark:bg-white/[0.06]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {md.destination && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-slate-400">
                <span className="text-gray-300 dark:text-white/20">→</span>
                <span className="font-medium text-gray-700 dark:text-slate-300">{md.destination}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Divider />

      <div>
        <SectionLabel>{`Claims extracted · ${md.claims?.length ?? 0}`}</SectionLabel>
        <WQClaimsList
          claims={md.claims ?? []}
          conflicts={md.conflicts ?? []}
          onAllDecided={() => setAllDecided(true)}
        />
      </div>
    </Surface>
  )
}

// ── 4. Gov Review ─────────────────────────────────────────────────────────────

function GovReview({ event, md, onResolve, onDecline }) {
  const [allDecided, setAllDecided] = useState(false)
  const [phase, setPhase]           = useState('idle')

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          {!allDecided && (
            <p className="text-center text-[10px] text-gray-400 dark:text-slate-400">
              Review all {md.claims?.length ?? 0} claims above to enable submission
            </p>
          )}
          <button
            type="button"
            disabled={!allDecided}
            onClick={() => setPhase('confirm-submit')}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit review
          </button>
        </div>
      )}
      {phase === 'confirm-submit' && (
        <WQConfirmBar
          message="Submit your review? The requester will be notified and the outcome recorded in the audit ledger."
          confirmLabel="Submit review"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Review submitted — requester notified')}
        />
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      <div>
        <SectionLabel>Review request</SectionLabel>
        {md.requestedBy && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-[10px] font-bold text-gray-600 dark:text-slate-400">
              {md.requestedBy.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{md.requestedBy.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">{md.requestedBy.role}</p>
            </div>
          </div>
        )}
        {md.requestReason && (
          <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400">{md.requestReason}</p>
        )}
        {md.linkedProposal && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-aims-blue">
            <span className="rounded bg-aims-blue/10 px-1.5 py-0.5 font-semibold">Linked</span>
            <span>{md.linkedProposal.title}</span>
          </div>
        )}
      </div>

      <Divider />

      <div>
        <SectionLabel>{`Claims to review · ${md.claims?.length ?? 0}`}</SectionLabel>
        <WQClaimsList
          claims={md.claims ?? []}
          conflicts={md.conflicts ?? []}
          onAllDecided={() => setAllDecided(true)}
        />
      </div>
    </Surface>
  )
}

// ── 5. Gov Break Glass ────────────────────────────────────────────────────────

function GovBreakGlass({ event, md, onResolve, onDecline }) {
  const [phase, setPhase]         = useState('idle') // idle | confirm-approve | confirm-deny
  const [denyReason, setDenyReason] = useState('')

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          <button type="button" onClick={() => setPhase('confirm-approve')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Approve access ({md.approvalReceived + 1} of {md.approvalRequired})
          </button>
          <button type="button" onClick={() => setPhase('confirm-deny')} className="w-full rounded-lg border border-red-200/60 py-2 text-xs font-medium text-red-500 hover:bg-red-50/50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20">
            Deny access
          </button>
        </div>
      )}
      {phase === 'confirm-approve' && (
        <WQConfirmBar
          message={`Grant ${md.requestor} temporary ${md.accessScope} access to "${md.targetPartition}" for ${md.duration}? This is the ${md.approvalRequired === 2 ? 'final' : ''} approval.`}
          confirmLabel="Authorize access"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve(`Access authorized (${md.approvalReceived + 1} of ${md.approvalRequired}) — logged to audit`)}
        />
      )}
      {phase === 'confirm-deny' && (
        <WQConfirmBar
          message="Deny this access request? The requester will be notified."
          confirmLabel="Deny access"
          danger
          disabled={!denyReason.trim()}
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Access denied — requester notified')}
        >
          <textarea
            value={denyReason}
            onChange={e => setDenyReason(e.target.value)}
            rows={2}
            className="input w-full resize-none text-xs"
            placeholder="Required: reason for denying access…"
            autoFocus
          />
        </WQConfirmBar>
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {/* D3 archetype + Quorum modifier badge */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">Adjudicate</span>
        <span className="rounded-full bg-amber-50/60 px-2 py-0.5 text-[9px] font-semibold text-amber-500 dark:bg-amber-400/[0.07] dark:text-amber-400">Quorum · {md.approvalReceived + 1} of {md.approvalRequired}</span>
      </div>

      {/* Access request */}
      <div>
        <SectionLabel accent="amber">Access request</SectionLabel>
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4 dark:border-amber-700/20 dark:bg-amber-950/10 space-y-2.5">
          <Row label="Requestor" value={`${md.requestor} · ${md.requestorRole}`} />
          <Row label="Target" value={md.targetPartition} />
          <div className="flex gap-4">
            <Row label="Scope" value={md.accessScope} />
            <Row label="Duration" value={md.duration} />
          </div>
          {md.incidentRef && <Row label="Incident" value={md.incidentRef} accent />}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-slate-400">{md.justification}</p>
      </div>

      <Divider />

      {/* Approval status */}
      <div>
        <SectionLabel>Approval required — {md.approvalRequired} of {md.approvalRequired}</SectionLabel>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-green-200/50 bg-green-50/40 px-3 py-2.5 dark:border-green-900/30 dark:bg-green-950/20">
            <CheckCircle2 size={13} className="text-aims-governed shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-800 dark:text-slate-200">{md.firstApprover}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">Approved · {new Date(md.firstApprovalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-aims-blue/20 bg-aims-blue/[0.04] px-3 py-2.5 dark:border-aims-blue/20">
            <Clock size={13} className="text-aims-blue shrink-0" />
            <div>
              <p className="text-xs font-medium text-aims-blue">Awaiting your approval</p>
              <p className="text-[10px] text-aims-blue/60">You are approver 2 of 2</p>
            </div>
          </div>
        </div>
      </div>

      {md.lastBreakGlass && <>
        <Divider />
        <div>
          <SectionLabel>Last break-glass event</SectionLabel>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 space-y-0.5">
            <p>{md.lastBreakGlass.date} · {md.lastBreakGlass.requester}</p>
            <p className="text-gray-400 dark:text-slate-400">{md.lastBreakGlass.outcome}</p>
          </div>
        </div>
      </>}
    </Surface>
  )
}

// ── 6. Gov Change Request ─────────────────────────────────────────────────────

function GovChangeRequest({ event, md, onResolve, onDecline }) {
  const [phase, setPhase]       = useState('idle') // idle | confirm-accept | modifying | confirm-modify | confirm-reject
  const [modifiedValue, setModifiedValue] = useState(md.sourceB?.value ?? '')
  const [rejectReason, setRejectReason]   = useState('')
  const [modifyNote, setModifyNote]       = useState('')

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          <button type="button" onClick={() => setPhase('confirm-accept')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Accept change
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setModifiedValue(md.sourceB?.value ?? ''); setPhase('modifying') }} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]">
              Modify
            </button>
            <button type="button" onClick={() => setPhase('confirm-reject')} className="flex-1 rounded-lg border border-red-200/60 py-2 text-xs font-medium text-red-500 hover:bg-red-50/50 dark:border-red-900/30 dark:text-red-400">
              Reject
            </button>
          </div>
        </div>
      )}
      {phase === 'confirm-accept' && (
        <WQConfirmBar
          message={`Accept remapping "${md.sourceA?.value}" → "${md.sourceB?.value}" in canon record ${md.canonRecord}?`}
          confirmLabel="Accept change"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Change accepted — canon record updated')}
        />
      )}
      {phase === 'modifying' && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">Modified value</p>
          <input
            type="text"
            value={modifiedValue}
            onChange={e => setModifiedValue(e.target.value)}
            className="input w-full text-xs"
            autoFocus
          />
          <textarea
            value={modifyNote}
            onChange={e => setModifyNote(e.target.value)}
            rows={2}
            className="input w-full resize-none text-xs"
            placeholder="Optional: note on modification…"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setPhase('idle')} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs text-gray-500 dark:border-white/[0.08] dark:text-slate-400">Cancel</button>
            <button type="button" disabled={!modifiedValue.trim()} onClick={() => onResolve('Accepted with modifications — canon record updated')} className="flex-1 btn-primary py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">Accept modified</button>
          </div>
        </div>
      )}
      {phase === 'confirm-reject' && (
        <WQConfirmBar
          message="Reject this change request? The submitter will be notified."
          confirmLabel="Reject change"
          danger
          disabled={!rejectReason.trim()}
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Change rejected — submitter notified')}
        >
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={2}
            className="input w-full resize-none text-xs"
            placeholder="Required: reason for rejection…"
            autoFocus
          />
        </WQConfirmBar>
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {/* Overview */}
      <div>
        <SectionLabel>Change overview</SectionLabel>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-[9px] font-bold text-gray-600 dark:text-slate-400">
            {(md.submitter ?? '?').charAt(0)}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{md.submitter}</span>
          {md.submitterRole && <span className="text-[10px] text-gray-400 dark:text-slate-400">· {md.submitterRole}</span>}
        </div>
        <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400">{md.rationale}</p>
        {md.changeType && (
          <span className="mt-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">
            {md.changeType}
          </span>
        )}
      </div>

      <Divider />

      {/* Field comparison */}
      <div>
        <SectionLabel>Field comparison</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {[
            { side: 'Current', src: md.sourceA },
            { side: 'Proposed', src: md.sourceB },
          ].map(({ side, src }) => (
            <div key={side} className={`rounded-xl border p-3 ${side === 'Proposed' ? 'border-aims-blue/30 bg-aims-blue/[0.03] dark:border-aims-blue/20' : 'border-gray-100 bg-gray-50/60 dark:border-white/[0.07] dark:bg-white/[0.02]'}`}>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">{side}</p>
              <p className="mt-1.5 text-[13px] font-bold text-gray-900 dark:text-slate-100">{src?.value}</p>
              <p className="mt-1 text-[9px] text-gray-400 dark:text-slate-400 truncate">{src?.name}</p>
              {src?.confidence && (
                <p className="mt-1 text-[9px] text-gray-400 dark:text-slate-400">{Math.round(src.confidence * 100)}% conf</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {md.affectedAgents?.length > 0 && <>
        <Divider />
        <div>
          <SectionLabel>Affected agents</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {md.affectedAgents.map(a => (
              <span key={a} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-white/[0.06] dark:text-slate-400">
                <Bot size={9} /> {a}
              </span>
            ))}
          </div>
        </div>
      </>}
    </Surface>
  )
}

// ── 7. Train Me ───────────────────────────────────────────────────────────────

function TrainMe({ event, md, onResolve, onDecline }) {
  const [sampleDecisions, setSampleDecisions] = useState({})
  const [phase, setPhase]                     = useState('idle')
  const [rejectReason, setRejectReason]        = useState('')

  const samples   = md.samples ?? []
  const allReviewed = samples.length > 0 && samples.every(s => sampleDecisions[s.id])
  const approvedCount = Object.values(sampleDecisions).filter(d => d === 'promote').length

  function decideSample(id, d) {
    setSampleDecisions(p => ({ ...p, [id]: d }))
  }

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          {!allReviewed && (
            <p className="text-center text-[10px] text-gray-400 dark:text-slate-400">
              Review all {samples.length} samples above to enable submission
            </p>
          )}
          <button
            type="button"
            disabled={!allReviewed}
            onClick={() => setPhase('confirm-promote')}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Promote changes{allReviewed ? ` (${approvedCount} of ${samples.length})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setPhase('confirm-reject')}
            className="w-full rounded-lg border border-red-200/60 py-2 text-xs font-medium text-red-500 hover:bg-red-50/50 dark:border-red-900/30 dark:text-red-400"
          >
            Reject all changes
          </button>
        </div>
      )}
      {phase === 'confirm-promote' && (
        <WQConfirmBar
          message={`Promote ${approvedCount} of ${samples.length} samples to canon? The model will retrain on the next cycle.`}
          confirmLabel="Promote to canon"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Promoted to canon — model retraining scheduled')}
        />
      )}
      {phase === 'confirm-reject' && (
        <WQConfirmBar
          message="Reject all proposed changes? The agent will retain its current behavior."
          confirmLabel="Reject changes"
          danger
          disabled={!rejectReason.trim()}
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Changes rejected — agent retains current behavior')}
        >
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={2}
            className="input w-full resize-none text-xs"
            placeholder="Required: reason for rejection…"
            autoFocus
          />
        </WQConfirmBar>
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {/* Training objective */}
      <div>
        <SectionLabel>Training objective</SectionLabel>
        <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400 mb-3">{md.note}</p>
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">Current</p>
            <p className="mt-1 text-xl font-bold text-gray-500 dark:text-slate-400">{md.currentValue}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 dark:text-white/20 mx-2 shrink-0" />
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-aims-blue">Target</p>
            <p className="mt-1 text-xl font-bold text-aims-blue">{md.proposedValue}</p>
          </div>
          {md.affectedAgents?.length > 0 && (
            <div className="ml-auto text-right">
              <p className="text-[9px] text-gray-400 dark:text-slate-400">Affects</p>
              <p className="text-[10px] font-semibold text-gray-600 dark:text-slate-400">{md.affectedAgents.length} agents</p>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* Samples */}
      <div>
        <SectionLabel>{`Samples to review · ${samples.length}`}</SectionLabel>
        <div className="space-y-3">
          {samples.map(sample => {
            const d = sampleDecisions[sample.id]
            return (
              <div key={sample.id} className={`rounded-xl border p-4 transition-colors ${
                d === 'promote' ? 'border-green-200 bg-green-50/40 dark:border-green-900/40 dark:bg-green-950/20' :
                d === 'reject'  ? 'border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20' :
                'border-gray-100 bg-white dark:border-white/[0.07] dark:bg-transparent'
              }`}>
                <p className="mb-1 text-[10px] font-semibold text-gray-500 dark:text-slate-400">{sample.label}</p>
                <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-200">{sample.summary}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => decideSample(sample.id, 'promote')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                      d === 'promote' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-green-950/40 dark:hover:text-green-400'
                    }`}
                  >
                    <CheckCircle2 size={11} /> Promote
                  </button>
                  <button
                    type="button"
                    onClick={() => decideSample(sample.id, 'reject')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                      d === 'reject' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400'
                    }`}
                  >
                    <XCircle size={11} /> Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Surface>
  )
}

// ── 8. Inbound Question ───────────────────────────────────────────────────────

function InboundQuestion({ event, md, onResolve, onDecline }) {
  const [phase, setPhase]         = useState('idle') // idle | composing | confirm-send | confirm-close | declining | confirm-decline
  const [reply, setReply]         = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [toast, setToast]         = useState(null)

  const thread   = md.thread ?? {}
  const comments = thread.comments ?? []
  const first    = comments[0] ?? {}
  const isOpen   = thread.status === 'open'

  function mockAction(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const footer = (
    <>
      {toast && (
        <div className="mb-3 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.06] dark:text-slate-400">
          {toast}
        </div>
      )}
      {phase === 'idle' && (
        <div className="space-y-2">
          <button type="button" onClick={() => setPhase('composing')} className="btn-primary w-full py-2.5 text-sm font-semibold">
            Reply
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => mockAction('Forwarded to team inbox.')} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]">
              Forward
            </button>
            {isOpen && (
              <button type="button" onClick={() => setPhase('confirm-close')} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]">
                Close thread
              </button>
            )}
          </div>
          {/* D7: Decline with reason — keeps Ask from being an unbounded channel */}
          <button
            type="button"
            onClick={() => setPhase('declining')}
            className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.04]"
          >
            Decline with reason
          </button>
        </div>
      )}
      {phase === 'composing' && (
        <div className="space-y-2">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={4}
            className="input w-full resize-none text-xs"
            placeholder="Type your reply…"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setReply(''); setPhase('idle') }} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs text-gray-500 dark:border-white/[0.08] dark:text-slate-400">
              Cancel
            </button>
            <button
              type="button"
              disabled={!reply.trim()}
              onClick={() => setPhase('confirm-send')}
              className="flex-1 btn-primary py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send reply
            </button>
          </div>
        </div>
      )}
      {phase === 'confirm-send' && (
        <WQConfirmBar
          message={`Send your reply to ${first.authorName ?? 'customer'}? This will be logged to the thread.`}
          confirmLabel="Send"
          onCancel={() => setPhase('composing')}
          onConfirm={() => onResolve('Reply sent — thread updated')}
        />
      )}
      {phase === 'confirm-close' && (
        <WQConfirmBar
          message="Close this thread? The customer will be notified that the conversation is resolved."
          confirmLabel="Close thread"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve('Thread closed — customer notified')}
        />
      )}
      {phase === 'declining' && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">
            Reason for declining
          </p>
          <textarea
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            rows={3}
            className="input w-full resize-none text-xs"
            placeholder="Explain why you can't handle this request — your reason will be sent back to the requester…"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setDeclineReason(''); setPhase('idle') }}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-xs text-gray-500 dark:border-white/[0.08] dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!declineReason.trim()}
              onClick={() => setPhase('confirm-decline')}
              className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-400/20 dark:text-red-400"
            >
              Confirm decline
            </button>
          </div>
        </div>
      )}
      {phase === 'confirm-decline' && (
        <WQConfirmBar
          message="Decline and notify the requester? Your reason will be returned as a Respond task in their queue."
          confirmLabel="Decline"
          danger
          onCancel={() => setPhase('declining')}
          onConfirm={() => onDecline('Declined — requester notified. A Respond task has been queued for them.')}
        />
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      <div>
        <SectionLabel>Message</SectionLabel>
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
          {/* Sender */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aims-blue/10 dark:bg-aims-blue/[0.15] text-[11px] font-bold text-aims-blue">
              {(first.authorName ?? '?').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{first.authorName}</p>
                <span className="text-[10px] text-gray-400 dark:text-slate-400">{first.timestamp}</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">{first.authorRole}</p>
              {first.channel && (
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-slate-400">
                  <MessageSquare size={9} /> {first.channel}
                </span>
              )}
            </div>
          </div>
          {/* Body */}
          <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-300">{first.body}</p>
        </div>
        {comments.length > 1 && (
          <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-400">
            {comments.length} messages in this thread
          </p>
        )}
      </div>
    </Surface>
  )
}

// ── 9. Question (person-to-person) ────────────────────────────────────────────

function QuestionSurface({ event, md, onResolve, onDecline }) {
  const [response,      setResponse]      = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [phase, setPhase]                 = useState('idle') // idle | confirm-send | declining | confirm-decline

  const footer = (
    <>
      {phase === 'idle' && (
        <div className="space-y-2">
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={3}
            className="input w-full resize-none text-xs"
            placeholder="Type your response…"
            autoFocus
          />
          <button
            type="button"
            disabled={!response.trim()}
            onClick={() => setPhase('confirm-send')}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send response
          </button>
          {/* D7: Decline with reason — keeps Ask from being an unbounded channel */}
          <button
            type="button"
            onClick={() => setPhase('declining')}
            className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.04]"
          >
            Decline with reason
          </button>
        </div>
      )}
      {phase === 'confirm-send' && (
        <WQConfirmBar
          message={`Send your response to ${event.askedByName}?`}
          confirmLabel="Send"
          onCancel={() => setPhase('idle')}
          onConfirm={() => onResolve(`Response sent to ${event.askedByName}`)}
        />
      )}
      {phase === 'declining' && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">
            Reason for declining
          </p>
          <textarea
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            rows={3}
            className="input w-full resize-none text-xs"
            placeholder="Explain why you can't answer this — your reason will be sent to the asker as a Respond task…"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setDeclineReason(''); setPhase('idle') }}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-xs text-gray-500 dark:border-white/[0.08] dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!declineReason.trim()}
              onClick={() => setPhase('confirm-decline')}
              className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-400/20 dark:text-red-400"
            >
              Confirm decline
            </button>
          </div>
        </div>
      )}
      {phase === 'confirm-decline' && (
        <WQConfirmBar
          message={`Decline and notify ${event.askedByName ?? 'the asker'}? Your reason will be returned as a Respond task in their queue.`}
          confirmLabel="Decline"
          danger
          onCancel={() => setPhase('declining')}
          onConfirm={() => onDecline(`Declined — ${event.askedByName ?? 'asker'} has been notified. A Respond task has been queued for them.`)}
        />
      )}
    </>
  )

  return (
    <Surface footer={footer}>
      {/* Asked by */}
      <div>
        <SectionLabel>Asked by</SectionLabel>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-[10px] font-bold text-gray-600 dark:text-slate-400">
            {(event.askedByName ?? '?').charAt(0)}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{event.askedByName}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-400">
              <span>{event.askedByRole}</span>
              <span>·</span>
              <span>{event.askedAt}</span>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Question */}
      <div>
        <SectionLabel>Question</SectionLabel>
        <p className="text-sm leading-relaxed text-gray-800 dark:text-slate-200">"{event.questionText}"</p>
      </div>

      {/* Why */}
      {event.whyText && <>
        <Divider />
        <div>
          <SectionLabel>Context</SectionLabel>
          <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-400">{event.whyText}</p>
        </div>
      </>}

      {/* Linked event */}
      {event.linkedEventTitle && <>
        <Divider />
        <div>
          <SectionLabel>Linked event</SectionLabel>
          <div className="flex items-center gap-2 rounded-lg border border-aims-blue/20 bg-aims-blue/[0.04] px-3 py-2.5 dark:border-aims-blue/10">
            <ShieldAlert size={11} className="shrink-0 text-aims-blue" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-aims-blue">{event.linkedEventTitle}</p>
              <p className="text-[10px] text-aims-blue/60">{event.linkedEventId}</p>
            </div>
            <ChevronRight size={12} className="ml-auto shrink-0 text-aims-blue/40" />
          </div>
        </div>
      </>}
    </Surface>
  )
}

// ── 10. Generic WQ surface (task / acknowledge / resolve / fallback) ──────────

function GenericWQSurface({ event, md, onResolve, onDecline }) {
  const secondary = event.quickActions?.secondary ?? []

  const footer = (
    <div className="space-y-2">
      <button type="button" onClick={() => onResolve('Acknowledged')} className="btn-primary w-full py-2.5 text-sm font-semibold">
        {event.quickActions?.primary ?? 'Take action'}
      </button>
      {secondary.length > 0 && (
        <div className="flex gap-2">
          {secondary.slice(0, 2).map((label, i) => (
            <button key={i} type="button" onClick={() => onDecline()} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]">
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Surface footer={footer}>

      {/* Context / description */}
      <div>
        <SectionLabel>Context</SectionLabel>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{event.description}</p>
      </div>

      {/* Details grid: source workflow + due + estimated time */}
      {(event.sourceWorkflow || event.dueLabel || event.estimatedMinutes) && <>
        <Divider />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {event.sourceWorkflow && <Row label="Source" value={event.sourceWorkflow} />}
          {event.dueLabel && <Row label="Timeline" value={event.dueLabel} />}
          {event.estimatedMinutes && <Row label="Est. time" value={`~${event.estimatedMinutes} min`} />}
          {md.deadline && <Row label="Deadline" value={md.deadline} accent />}
          {md.auditRef && <Row label="Audit ref" value={md.auditRef} accent />}
          {md.nextMilestone && <Row label="Next milestone" value={md.nextMilestone} />}
        </div>
      </>}

      {/* Assignee / source (task) */}
      {(md.assignedBy || md.submissionTarget) && <>
        <Divider />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {md.assignedBy && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">Assigned by</p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-700 dark:text-slate-300">{md.assignedBy}</p>
              {md.assignedByRole && <p className="text-[9px] text-gray-400 dark:text-slate-400">{md.assignedByRole}</p>}
            </div>
          )}
          {md.submissionTarget && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">Submit to</p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-700 dark:text-slate-300">{md.submissionTarget}</p>
            </div>
          )}
        </div>
      </>}

      {/* Required fields (task) */}
      {md.requiredFields?.length > 0 && <>
        <Divider />
        <div>
          <SectionLabel>Required fields</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {md.requiredFields.map((field, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 dark:bg-white/20" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      </>}

      {/* Incident note (acknowledge) */}
      {md.note && <>
        <Divider />
        <div>
          <SectionLabel>Note</SectionLabel>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400">{md.note}</p>
        </div>
      </>}

      {/* Incident status row (acknowledge) */}
      {(md.status || md.responsibleTeam || md.resolvedEta || md.incidentRef) && <>
        <Divider />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {md.status && <Row label="Status" value={md.status} />}
          {md.responsibleTeam && <Row label="Handling" value={md.responsibleTeam} />}
          {md.resolvedEta && <Row label="ETA" value={md.resolvedEta} />}
          {md.incidentRef && <Row label="Incident ref" value={md.incidentRef} accent />}
        </div>
      </>}

      {/* Checklist (resolve / audit) */}
      {md.checklist?.length > 0 && <>
        <Divider />
        <div>
          <SectionLabel>Checklist</SectionLabel>
          <ul className="mt-2 space-y-2">
            {md.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-slate-400">
                <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-gray-300 dark:border-white/20">
                  <span className="h-1.5 w-1.5 rounded-sm bg-gray-300 dark:bg-white/20" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </>}

      {/* Assigned areas (resolve / audit) */}
      {md.assignedAreas?.length > 0 && <>
        <Divider />
        <div>
          <SectionLabel>Assigned areas</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {md.assignedAreas.map((area, i) => (
              <span key={i} className="rounded-full bg-aims-blue/10 px-2.5 py-0.5 text-[10px] font-semibold text-aims-blue dark:bg-aims-blue/[0.12]">
                {area}
              </span>
            ))}
          </div>
        </div>
      </>}

    </Surface>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Row({ label, value, accent }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[11px] font-medium ${accent ? 'text-aims-blue' : 'text-gray-700 dark:text-slate-300'}`}>{value}</p>
    </div>
  )
}

function XCircle({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}
