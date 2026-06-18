import { createContext, useContext, useState } from 'react'
import { useActivity } from './ActivityContext.jsx'

// Shared, in-memory state for the three system work widgets (My Tasks, Inbox, HITL).
// HITL items live here ONCE; the Inbox view derives the pending ones (the "human-touch"
// tag → also in Inbox), so resolving a decision clears it from both queues at once.
//
// HITL decisions are the highest-stakes action in the product, so resolving keeps the
// item (status flips off 'pending') with a full decision record — outcome, reason,
// assignee, who, when — instead of dropping it. That record is the audit trail; it also
// cross-posts to the entity Activity feed when the decision maps to a known profile.

let seq = 100 // start above the seed ids (tsk-1..4) so a new task never collides
const nid = (p) => `${p}-${(seq += 1)}`

// Where a reassigned decision can be routed. People + standing queues.
export const REASSIGN_TARGETS = [
  { id: 'u-priya', label: 'Priya Nair', kind: 'person', sub: 'Revenue Operations' },
  { id: 'u-david', label: 'David Kim', kind: 'person', sub: 'Customer Success' },
  { id: 'u-dana', label: 'Dana Lee', kind: 'person', sub: 'Sales' },
  { id: 't-finance', label: 'Finance approvals', kind: 'queue', sub: 'Team queue' },
  { id: 't-legal', label: 'Legal review', kind: 'queue', sub: 'Team queue' },
  { id: 't-leadership', label: 'Leadership', kind: 'queue', sub: 'Escalation' },
]

// Why a decision was rejected — a small controlled vocabulary keeps the audit clean.
export const REJECT_REASONS = [
  'Outside policy',
  'Insufficient evidence',
  'Needs more context',
  'Incorrect amount',
  'Duplicate / already handled',
  'Other',
]

const SEED_HTL = [
  {
    id: 'htl-1', title: 'Approve refund — Globex ($2,400)', source: 'Billing Agent', when: '5m ago',
    status: 'pending', risk: 'high', amount: '$2,400',
    request: 'Issue a full refund to Globex for invoice INV-20418 (annual plan, charged 3 days ago).',
    reasoning: 'Customer reported a duplicate charge; the agent matched two identical $2,400 captures 90 seconds apart on the same card. Refund clears the duplicate.',
    policy: 'Refunds over $1,000 require human approval (Finance policy FIN-04).',
    evidence: ['2 identical $2,400 charges, 90s apart', 'Card ending 4417', 'Customer ticket #88231'],
  },
  {
    id: 'htl-2', title: 'Confirm contract terms before send — Acme', source: 'Sales Agent', when: '22m ago',
    status: 'pending', risk: 'medium', entityId: 'acme-001',
    request: 'Send the renewal contract to Acme with a 12% uplift and Net-45 payment terms.',
    reasoning: 'Uplift matches the standard renewal band (10–15%). Net-45 is non-standard (default Net-30) and was requested by the customer.',
    policy: 'Non-standard payment terms require human sign-off (Sales policy SAL-11).',
    evidence: ['Uplift 12% (band 10–15%)', 'Net-45 requested by customer', 'Deal #D-3092'],
  },
  {
    id: 'htl-3', title: 'Review flagged support reply — Initech', source: 'Support Agent', when: '1h ago',
    status: 'pending', risk: 'medium',
    request: 'Send the drafted reply resolving Initech ticket #44120 (data-deletion request).',
    reasoning: 'The reply confirms deletion of customer records. The agent flagged it because it references a compliance action it cannot verify was completed.',
    policy: 'Replies asserting a compliance action require human review (Trust policy TRU-02).',
    evidence: ['Mentions GDPR deletion', 'No completion record found', 'Ticket #44120'],
  },
  {
    id: 'htl-4', title: 'Escalation: high-value cancellation — Hooli', source: 'Retention Agent', when: '2h ago',
    status: 'pending', risk: 'high', amount: '$148k ARR',
    request: 'Approve the cancellation workflow for Hooli (enterprise, $148k ARR).',
    reasoning: 'Customer requested cancellation citing budget cuts. The agent escalated because the account exceeds the auto-cancel threshold and a save-offer may apply.',
    policy: 'Cancellations above $50k ARR require human approval (Retention policy RET-01).',
    evidence: ['$148k ARR', 'Reason: budget cut', 'No save-offer attempted yet'],
  },
  {
    id: 'htl-5', title: 'Approve data export request — Umbrella', source: 'Governance', when: '3h ago',
    status: 'pending', risk: 'low',
    request: 'Allow a full data export for Umbrella admin (CSV, all contacts).',
    reasoning: 'Routine admin-initiated export. The agent flagged it only because the export includes PII columns.',
    policy: 'Exports containing PII require human approval (Governance policy GOV-07).',
    evidence: ['Includes email + phone (PII)', 'Requested by verified admin', '12,480 rows'],
  },
]
const SEED_INBOX = [
  { id: 'inb-1', title: '@you mentioned in the “Renewals” thread', actor: 'Dana Lee', when: '18m ago', kind: 'mention', read: false },
  { id: 'inb-2', title: 'New comment on Q3 pipeline', actor: 'Priya Nair', when: '40m ago', kind: 'comment', read: false },
  { id: 'inb-3', title: 'Weekly performance digest is ready', actor: 'AIMS OS', when: '1h ago', kind: 'digest', read: true },
]
const SEED_TASKS = [
  { id: 'tsk-1', title: 'Follow up on Acme renewal proposal', due: 'Today', overdue: false, done: false },
  { id: 'tsk-2', title: 'Review Q3 pipeline with Priya', due: 'Tomorrow', overdue: false, done: false },
  { id: 'tsk-3', title: 'Prep onboarding deck for Globex', due: 'Fri', overdue: false, done: false },
  { id: 'tsk-4', title: 'Reconcile churn report figures', due: 'Yesterday', overdue: true, done: false },
]

export const DECISION_VERB = { approved: 'Approved', rejected: 'Rejected', reassigned: 'Reassigned' }

const WorkQueueContext = createContext(null)

export function WorkQueueProvider({ children }) {
  const [htl, setHtl] = useState(SEED_HTL)
  const [inbox, setInbox] = useState(SEED_INBOX)
  const [tasks, setTasks] = useState(SEED_TASKS)
  const { logActivity, removeActivity } = useActivity()

  // HITL — resolve records the full decision (outcome + reason/assignee + who/when) and
  // flips status off 'pending' (clears it from the active queue AND the derived Inbox).
  // The item is kept so the decision history / audit trail survives. decision:
  // 'approved' | 'rejected' | 'reassigned'. meta: { reason, assignee, assigneeLabel }.
  const resolveHtl = (id, decision, meta = {}) => {
    // Read the item from the current render's state BEFORE the setter (the functional
    // updater's result isn't visible synchronously), so the Activity cross-post can't
    // read a stale array.
    const item = htl.find((h) => h.id === id)
    // Re-deciding (after an undo, or overwriting an open-panel decision) must not leave a
    // duplicate/contradictory note — drop the prior decision's audit entry first.
    if (item?.entityId && item?.activityId) removeActivity(item.entityId, item.activityId)
    // Cross-post to the entity Activity feed when the decision maps to a known profile;
    // keep the entry's id on the item so an undo can remove it.
    let activityId = null
    if (item?.entityId) {
      const detailBits = [meta.assigneeLabel && `to ${meta.assigneeLabel}`, meta.reason && `— ${meta.reason}`].filter(Boolean).join(' ')
      activityId = logActivity(item.entityId, {
        type: 'note',
        title: `${DECISION_VERB[decision]} — ${item.title}`,
        detail: `Human-in-the-Loop decision${detailBits ? ` ${detailBits}` : ''}`,
      })
    }
    setHtl((p) =>
      p.map((h) =>
        h.id === id
          ? { ...h, status: decision, decision, decidedAt: 'just now', decidedBy: 'You', reason: meta.reason || null, assignee: meta.assigneeLabel || null, activityId }
          : h,
      ),
    )
  }
  // Revert a just-made decision back to the pending queue (Undo) — also remove the audit
  // entry it wrote, so the Activity feed can't show a reverted decision.
  const undoHtl = (id) => {
    const item = htl.find((h) => h.id === id)
    if (item?.entityId && item?.activityId) removeActivity(item.entityId, item.activityId)
    setHtl((p) => p.map((h) => (h.id === id ? { ...h, status: 'pending', decision: null, decidedAt: null, decidedBy: null, reason: null, assignee: null, activityId: null } : h)))
  }

  const completeTask = (id) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const addTask = (title) => {
    const t = title.trim()
    if (t) setTasks((p) => [{ id: nid('tsk'), title: t, due: 'No date', overdue: false, done: false }, ...p])
  }

  const markRead = (id) => setInbox((p) => p.map((i) => (i.id === id ? { ...i, read: true } : i)))
  const dismiss = (id) => setInbox((p) => p.filter((i) => i.id !== id))

  const value = { htl, inbox, tasks, resolveHtl, undoHtl, completeTask, addTask, markRead, dismiss }
  return <WorkQueueContext.Provider value={value}>{children}</WorkQueueContext.Provider>
}

export function useWorkQueue() {
  const ctx = useContext(WorkQueueContext)
  if (!ctx) throw new Error('useWorkQueue must be used within a WorkQueueProvider')
  return ctx
}
