import {
  User, Sparkles, Workflow, RefreshCw, ArrowUpRight, ArrowRight,
  AlertCircle, CheckCircle2, CheckCheck, ExternalLink, ThumbsDown, X, Zap,
  ShieldAlert,
} from 'lucide-react'
import { URGENCY_CLASS, urgencyOf } from './attentionModel.js'

// ─── Origin icon/color map (keyed by item.origin) ────────────────────────────
const ORIGIN_META = {
  contact:    { Icon: User,         color: 'text-blue-500 bg-blue-500/10'     },
  agent:      { Icon: Sparkles,     color: 'text-purple-500 bg-purple-500/10' },
  workflow:   { Icon: Workflow,     color: 'text-blue-400 bg-blue-400/10'     },
  system:     { Icon: RefreshCw,    color: 'text-cyan-500 bg-cyan-500/10'     },
  escalation: { Icon: ArrowUpRight, color: 'text-red-500 bg-red-500/10'       },
}

// Cross-link + "Also in Workflows" chip shown under the item body.
function ContextLine({ item, showOrigin, wfLinked }) {
  const hasContent = showOrigin || item.related || wfLinked
  if (!hasContent) return null

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {item.related && (
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="flex items-center gap-0.5 text-[10px] text-aims-blue hover:underline"
        >
          <ExternalLink size={8} aria-hidden="true" />
          {item.related.label}
        </a>
      )}
      {wfLinked && (
        <span className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-aims-blue">
          <Zap size={7} aria-hidden="true" />
          Also in Workflows
        </span>
      )}
    </div>
  )
}

// ─── GovEventRow — blocking governance event (HITL pause, policy approval) ───
export function GovEventRow({ item, onOpen, onAction, onEscalate }) {
  const isBlocking = item.blocking
  const statusColors =
    item.statusLabel === 'Due now'
      ? 'bg-red-500/10 text-aims-stale'
      : item.statusLabel === 'Paused'
      ? 'bg-amber-500/10 text-aims-aging'
      : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400'

  return (
    <div className={`group border-l-2 py-3 pl-3 pr-4 transition-colors ${
      isBlocking
        ? 'border-l-red-500/70 hover:bg-red-500/[0.025] dark:hover:bg-red-500/[0.04]'
        : 'border-l-amber-500/50 hover:bg-amber-500/[0.025] dark:hover:bg-amber-500/[0.03]'
    }`}>
      <div className="flex items-start gap-3">
        <ShieldAlert
          size={14}
          className={`mt-0.5 shrink-0 ${isBlocking ? 'text-aims-stale' : 'text-aims-aging'}`}
          aria-hidden="true"
        />
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onOpen()}
        >
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">
              {item.title}
            </p>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusColors}`}>
              {item.statusLabel}
            </span>
          </div>
          {(item.impact?.workflows > 0 || item.impact?.agents > 0) && (
            <p className="mt-0.5 text-[10px] font-medium text-gray-400 dark:text-slate-500">
              {item.impact.workflows > 0 ? `Blocks ${item.impact.workflows} workflows` : ''}
              {item.impact.workflows > 0 && item.impact.agents > 0 ? ' · ' : ''}
              {item.impact.agents > 0 ? `${item.impact.agents} agent${item.impact.agents !== 1 ? 's' : ''}` : ''}
            </p>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-[10px] text-gray-400 dark:text-slate-500">
          {item.when}
        </span>
      </div>
      <div className="ml-[26px] mt-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onAction() }}
          className="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-aims-blue transition-colors hover:bg-blue-500/20"
        >
          <CheckCircle2 size={9} aria-hidden="true" /> {item.action}
        </button>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onEscalate() }}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <ArrowUpRight size={9} aria-hidden="true" /> Escalate
        </button>
      </div>
    </div>
  )
}

// ─── ErrorRow — task error OR inbox sync error ────────────────────────────────
export function ErrorRow({ item, showOrigin, wfLinked, onOpen, onRetry }) {
  return (
    <div className="group flex items-start gap-3 border-l-2 border-l-red-500/60 py-2.5 pl-3 pr-4 transition-colors hover:bg-red-500/[0.03] dark:hover:bg-red-500/[0.04]">
      <AlertCircle size={14} className="mt-0.5 shrink-0 text-aims-stale" aria-hidden="true" />
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onOpen()}
      >
        <p className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">
          {item.title ?? item.subject}
        </p>
        <p className="text-[10px] font-medium text-aims-stale">Error · Retry needed</p>
        <ContextLine item={item} showOrigin={showOrigin} wfLinked={wfLinked} />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRetry() }}
          className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-aims-stale transition-colors hover:bg-red-500/20"
        >
          <RefreshCw size={9} aria-hidden="true" /> Retry
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label="View details"
          className="text-gray-300 opacity-0 transition-all hover:text-gray-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:text-slate-400"
        >
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ─── ApprovalRow — HTL item awaiting a human decision ────────────────────────
export function ApprovalRow({ item, showOrigin, wfLinked, onOpen, onApprove, onDecline }) {
  return (
    <div className="group border-l-2 border-l-amber-500/50 py-2.5 pl-3 pr-4 transition-colors hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.04]">
      <div className="flex items-start gap-3">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-aims-aging" aria-hidden="true" />
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onOpen()}
        >
          <p className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">
            {item.title}
          </p>
          <p className="text-[10px] font-medium text-aims-aging">
            {item.source} · Needs {item.action.toLowerCase()}
          </p>
          <ContextLine item={item} showOrigin={showOrigin} wfLinked={wfLinked} />
        </div>
        <button
          type="button"
          onClick={onOpen}
          aria-label="View details"
          className="mt-0.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:text-gray-500 dark:text-slate-600 dark:hover:text-slate-400"
        >
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>
      <div className="ml-[26px] mt-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onApprove() }}
          className="flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-aims-governed transition-colors hover:bg-green-500/20"
        >
          <CheckCircle2 size={9} aria-hidden="true" /> {item.action}
        </button>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDecline() }}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <ThumbsDown size={9} aria-hidden="true" /> Decline
        </button>
      </div>
    </div>
  )
}

// ─── InboxActionRow — inbox message with a pending action ─────────────────────
export function InboxActionRow({ item, showOrigin, wfLinked, onOpen, onPrimary, onDismiss }) {
  const { Icon, color } = ORIGIN_META[item.origin] ?? ORIGIN_META.system
  const isShare    = item.action?.kind === 'share'
  const ctaLabel   = isShare ? 'Grant access' : 'Remap widget'
  const ctaClass   = isShare
    ? 'bg-green-500/10 text-aims-governed hover:bg-green-500/20'
    : 'bg-blue-500/10 text-aims-blue hover:bg-blue-500/20'
  const CtaIcon    = isShare ? CheckCircle2 : RefreshCw

  return (
    <div className="group flex items-start gap-3 border-l-2 border-l-blue-500/40 py-2.5 pl-3 pr-4 transition-colors hover:bg-blue-500/[0.03] dark:hover:bg-blue-500/[0.04]">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${color}`} aria-hidden="true">
        <Icon size={10} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="cursor-pointer"
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onOpen()}
        >
          <p className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">
            {item.actor?.name ?? 'System'}
          </p>
          <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">{item.subject}</p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onPrimary() }}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors ${ctaClass}`}
          >
            <CtaIcon size={9} aria-hidden="true" /> {ctaLabel}
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDismiss() }}
            className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X size={9} aria-hidden="true" /> Dismiss
          </button>
          {item.related && (
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-0.5 text-[10px] text-aims-blue hover:underline"
            >
              <ExternalLink size={8} aria-hidden="true" />
              {item.related.label}
            </a>
          )}
          {wfLinked && (
            <span className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-aims-blue">
              <Zap size={7} aria-hidden="true" /> Also in Workflows
            </span>
          )}
        </div>
      </div>
      <span className="mt-0.5 shrink-0 text-[10px] text-gray-400 dark:text-slate-500">{item.when}</span>
    </div>
  )
}

// ─── InboxRow — standard inbox message, no pending action ────────────────────
export function InboxRow({ item, isRead, showOrigin, wfLinked, onOpen, onArchive }) {
  const { Icon, color } = ORIGIN_META[item.origin] ?? ORIGIN_META.system

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      className={`group flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${isRead ? 'opacity-55' : ''}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${color}`} aria-hidden="true">
        <Icon size={10} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`truncate text-xs ${isRead ? 'font-normal text-gray-500 dark:text-slate-400' : 'font-semibold text-gray-800 dark:text-slate-100'}`}>
            {item.actor?.name ?? 'System'}
          </p>
          <span className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500">{item.when}</span>
        </div>
        <p className="min-w-0 truncate text-[11px] text-gray-500 dark:text-slate-400">{item.subject}</p>
        <ContextLine item={item} showOrigin={showOrigin} wfLinked={wfLinked} />
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onArchive() }}
        aria-label="Archive"
        className="hidden shrink-0 items-center justify-center rounded p-1 text-gray-300 transition-colors group-hover:flex hover:text-gray-600 dark:text-slate-600 dark:hover:text-slate-300"
      >
        <CheckCheck size={11} />
      </button>
    </div>
  )
}

// ─── TaskRow — completable task ───────────────────────────────────────────────
export function TaskRow({ item, showOrigin, wfLinked, onOpen, onComplete }) {
  return (
    <div
      className="group flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.025]"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
    >
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onComplete() }}
        aria-label="Mark complete"
        className="mt-0.5 shrink-0 text-gray-300 transition-colors hover:text-aims-governed dark:text-slate-600 dark:hover:text-aims-governed"
      >
        <CheckCircle2 size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-800 dark:text-slate-200">
          {item.title}
        </p>
        {item.due && (
          <p className={`text-[10px] font-medium ${URGENCY_CLASS[urgencyOf(item)]}`}>{item.due}</p>
        )}
        <ContextLine item={item} showOrigin={showOrigin} wfLinked={wfLinked} />
      </div>
      <ArrowRight
        size={12}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600"
      />
    </div>
  )
}
