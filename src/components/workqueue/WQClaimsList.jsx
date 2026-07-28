import { useState } from 'react'
import { CheckCircle2, XCircle, Edit2, AlertTriangle } from 'lucide-react'

export function WQClaimsList({ claims = [], conflicts = [], onAllDecided }) {
  const [decisions, setDecisions]   = useState({})
  const [corrections, setCorrections] = useState({})
  const [editing, setEditing]       = useState(null)

  const conflictMap = Object.fromEntries((conflicts ?? []).map(c => [c.claimId, c]))

  function decide(claimId, decision) {
    const next = { ...decisions, [claimId]: decision }
    setDecisions(next)
    if (decision === 'correct') {
      setEditing(claimId)
    } else {
      if (editing === claimId) setEditing(null)
    }
    const allDone = claims.every(c => next[c.id])
    if (allDone && onAllDecided) onAllDecided(next, corrections)
  }

  const nonConflictedUndecided = claims.filter(c => !c.conflict && !decisions[c.id])
  const conflictCount = claims.filter(c => c.conflict).length

  function approveAllNonConflicted() {
    const next = { ...decisions }
    claims.filter(c => !c.conflict).forEach(c => { next[c.id] = 'approve' })
    setDecisions(next)
    const allDone = claims.every(c => next[c.id])
    if (allDone && onAllDecided) onAllDecided(next, corrections)
  }

  const decided = claims.filter(c => decisions[c.id]).length
  const allDone  = decided === claims.length && claims.length > 0

  return (
    <div className="space-y-3">
      {nonConflictedUndecided.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-aims-blue/[0.04] border border-aims-blue/10 dark:border-aims-blue/[0.08] px-3 py-2">
          <button
            type="button"
            onClick={approveAllNonConflicted}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-aims-blue hover:text-aims-blue/70 transition-colors"
          >
            <CheckCircle2 size={11} />
            Approve all non-conflicted ({nonConflictedUndecided.length})
          </button>
          {conflictCount > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-slate-600">
              {conflictCount} conflict{conflictCount !== 1 ? 's' : ''} need manual review
            </span>
          )}
        </div>
      )}
      {claims.map(claim => {
        const d        = decisions[claim.id]
        const conflict = conflictMap[claim.id]
        return (
          <div
            key={claim.id}
            className={`rounded-xl border p-4 transition-colors ${
              d === 'approve' ? 'border-green-200 bg-green-50/40 dark:border-green-900/40 dark:bg-green-950/20' :
              d === 'reject'  ? 'border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20' :
              d === 'correct' ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20' :
              'border-gray-100 bg-white dark:border-white/[0.07] dark:bg-transparent'
            }`}
          >
            {/* Claim header: ID + conflict tag + confidence */}
            <div className="mb-2 flex items-center gap-1.5">
              <span className="rounded bg-gray-100 dark:bg-white/[0.07] px-1.5 py-0.5 font-mono text-[9px] font-bold text-gray-500 dark:text-slate-500">
                {claim.id}
              </span>
              {claim.conflict && (
                <span className="rounded-full bg-amber-100 dark:bg-amber-900/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  Conflict
                </span>
              )}
              <span className="ml-auto text-[9px] text-gray-400 dark:text-slate-600">
                {Math.round(claim.confidence * 100)}% conf
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-200">{claim.text}</p>

            {conflict && (
              <div className="mt-3 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2.5 dark:border-amber-700/30 dark:bg-amber-950/30">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={10} className="shrink-0 text-amber-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Source conflict</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[conflict.sourceA, conflict.sourceB].map((src, i) => (
                    <div key={i} className="rounded-lg bg-white/80 px-2.5 py-2 dark:bg-white/[0.05]">
                      <p className="truncate text-[9px] font-semibold text-gray-400 dark:text-slate-500">{src.name}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-gray-800 dark:text-slate-200">{src.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {d === 'correct' && editing === claim.id && (
              <textarea
                value={corrections[claim.id] ?? claim.text}
                onChange={e => setCorrections(p => ({ ...p, [claim.id]: e.target.value }))}
                rows={2}
                autoFocus
                className="input mt-3 w-full resize-none text-xs"
                placeholder="Enter the corrected value…"
              />
            )}

            <div className="mt-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => decide(claim.id, 'approve')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                  d === 'approve'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-green-950/40 dark:hover:text-green-400'
                }`}
              >
                <CheckCircle2 size={11} /> Approve
              </button>
              <button
                type="button"
                onClick={() => decide(claim.id, 'reject')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                  d === 'reject'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400'
                }`}
              >
                <XCircle size={11} /> Reject
              </button>
              {conflict && (
                <button
                  type="button"
                  onClick={() => decide(claim.id, 'correct')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                    d === 'correct'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
                  }`}
                >
                  <Edit2 size={11} /> Correct
                </button>
              )}
            </div>
          </div>
        )
      })}

      {claims.length > 0 && (
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-aims-governed font-semibold">{decided}</span>
          <span className="text-gray-400 dark:text-slate-600">of {claims.length} reviewed</span>
          {allDone && (
            <span className="ml-auto font-semibold text-aims-governed">All reviewed ✓</span>
          )}
        </div>
      )}
    </div>
  )
}
