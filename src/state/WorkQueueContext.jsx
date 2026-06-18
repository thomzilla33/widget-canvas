import { createContext, useContext, useState } from 'react'

// Shared, in-memory state for the three system work widgets (My Tasks, Inbox, HITL).
// HITL items live here ONCE; the Inbox view derives the pending ones (the "human-touch"
// tag → also in Inbox), so resolving a decision clears it from both queues at once.

let seq = 100 // start above the seed ids (tsk-1..4) so a new task never collides
const nid = (p) => `${p}-${(seq += 1)}`

const SEED_HTL = [
  { id: 'htl-1', title: 'Approve refund — Globex ($2,400)', source: 'Billing Agent', when: '5m ago', status: 'pending' },
  { id: 'htl-2', title: 'Confirm contract terms before send — Acme', source: 'Sales Agent', when: '22m ago', status: 'pending' },
  { id: 'htl-3', title: 'Review flagged support reply — Initech', source: 'Support Agent', when: '1h ago', status: 'pending' },
  { id: 'htl-4', title: 'Escalation: high-value cancellation — Hooli', source: 'Retention Agent', when: '2h ago', status: 'pending' },
  { id: 'htl-5', title: 'Approve data export request — Umbrella', source: 'Governance', when: '3h ago', status: 'pending' },
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

const WorkQueueContext = createContext(null)

export function WorkQueueProvider({ children }) {
  const [htl, setHtl] = useState(SEED_HTL)
  const [inbox, setInbox] = useState(SEED_INBOX)
  const [tasks, setTasks] = useState(SEED_TASKS)

  // HITL — resolve clears the item from the pending queue (and from the Inbox, which
  // derives pending HITL items). decision: 'approved' | 'rejected' | 'reassigned'.
  const resolveHtl = (id, decision) => setHtl((p) => p.map((h) => (h.id === id ? { ...h, status: decision } : h)))

  const completeTask = (id) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const addTask = (title) => {
    const t = title.trim()
    if (t) setTasks((p) => [{ id: nid('tsk'), title: t, due: 'No date', overdue: false, done: false }, ...p])
  }

  const markRead = (id) => setInbox((p) => p.map((i) => (i.id === id ? { ...i, read: true } : i)))
  const dismiss = (id) => setInbox((p) => p.filter((i) => i.id !== id))

  const value = { htl, inbox, tasks, resolveHtl, completeTask, addTask, markRead, dismiss }
  return <WorkQueueContext.Provider value={value}>{children}</WorkQueueContext.Provider>
}

export function useWorkQueue() {
  const ctx = useContext(WorkQueueContext)
  if (!ctx) throw new Error('useWorkQueue must be used within a WorkQueueProvider')
  return ctx
}
