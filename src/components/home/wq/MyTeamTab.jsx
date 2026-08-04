import { useState } from 'react'
import { createPortal } from 'react-dom'
import { UserPlus, Bell, RefreshCw, AlertTriangle, Zap } from 'lucide-react'
import { TEAM_ROSTER } from '../../../data/workqueue.js'
import UndoToast from '../UndoToast.jsx'

function TeamMemberRow({ member, onAction }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-aims-blue/10 text-[11px] font-bold text-aims-blue">
          {member.initials}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">{member.name}</p>
          {member.ooo && (
            <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400">
              OOO · returns {member.oooReturn}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-slate-400">{member.role}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {member.events.blocking > 0 && (
            <span
              title={`${member.events.blocking} blocking`}
              className="inline-flex items-center gap-0.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-400/25 dark:text-red-400"
            >
              <Zap size={7} aria-hidden="true" />{member.events.blocking} blocking
            </span>
          )}
          <span className="text-[10px] text-gray-400 dark:text-slate-400">
            {member.events.total > 0 ? `${member.events.total} total` : 'No open events'}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={`Take an item from ${member.name}`}
          onClick={() => onAction?.(`Took an item from ${member.name}`)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:border-aims-blue hover:text-aims-blue dark:border-white/10 dark:text-slate-400 dark:hover:border-aims-blue dark:hover:text-aims-blue"
        >
          <UserPlus size={10} aria-hidden="true" /> Take
        </button>
        <button
          type="button"
          aria-label={`Nudge ${member.name}`}
          disabled={!!member.ooo}
          title={member.ooo ? `On leave until ${member.oooReturn}` : undefined}
          onClick={() => !member.ooo && onAction?.(`Nudge sent to ${member.name}`)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:border-amber-400 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-400 dark:hover:border-amber-400 dark:hover:text-amber-400"
        >
          <Bell size={10} aria-hidden="true" /> Nudge
        </button>
        <button
          type="button"
          aria-label={`Reassign events from ${member.name}`}
          onClick={() => onAction?.(`Reassigning events from ${member.name}…`)}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
            member.ooo
              ? 'border-aims-blue text-aims-blue hover:bg-aims-blue/5 dark:hover:bg-aims-blue/10'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05]'
          }`}
        >
          <RefreshCw size={10} aria-hidden="true" /> Reassign
        </button>
      </div>
    </div>
  )
}

export function MyTeamTab({ isManager }) {
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast({ message: msg })
    setTimeout(() => setToast(null), 3500)
  }

  if (!isManager) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <AlertTriangle size={20} className="text-gray-300 dark:text-slate-400" aria-hidden="true" />
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
          My Team is available to managers and executives.
        </p>
        <p className="text-[11px] text-gray-400 dark:text-slate-400">
          Switch to Admin role using the role toggle in the top bar to preview this view.
        </p>
      </div>
    )
  }

  const blockingTotal = TEAM_ROSTER.reduce((s, m) => s + m.events.blocking, 0)

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        {blockingTotal > 0 && (
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-400/20 dark:bg-red-400/[0.09]">
            <AlertTriangle size={12} className="shrink-0 text-red-500 dark:text-red-400" aria-hidden="true" />
            <p className="text-[11px] font-medium text-red-700 dark:text-red-400">
              {blockingTotal} blocking event{blockingTotal !== 1 ? 's' : ''} across your team require immediate attention.
            </p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
          {TEAM_ROSTER.map(member => (
            <TeamMemberRow key={member.id} member={member} onAction={showToast} />
          ))}
        </div>
      </div>
      {toast && createPortal(
        <UndoToast message={toast.message} onClose={() => setToast(null)} />,
        document.body,
      )}
    </>
  )
}
