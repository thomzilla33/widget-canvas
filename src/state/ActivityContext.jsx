import { createContext, useContext, useRef, useState } from 'react'

// U2.3 — per-entity activity log. Header actions (Email/SMS) append here and the
// profile's Activity tab reads it. In-memory, seeded so the tab isn't empty in the demo.
const ActivityContext = createContext(null)

// A little realistic history per known entity (newest first within each list).
const SEED = {
  'acme-001': [
    { id: 'a-seed-acme-1', type: 'email', title: 'Renewal reminder', detail: 'Sent to billing@acme.com', when: '2 days ago', by: 'Priya Nair' },
    { id: 'a-seed-acme-2', type: 'note', title: 'QBR scheduled', detail: 'Q3 business review booked for next week', when: '4 days ago', by: 'David Kim' },
  ],
  'c-dana': [
    { id: 'a-seed-dana-1', type: 'sms', title: 'Appointment reminder', detail: 'Texted +1 (415) 555-0192', when: 'Yesterday', by: 'David Kim' },
  ],
  'e-maria': [
    { id: 'a-seed-maria-1', type: 'note', title: 'Performance check-in', detail: 'Logged 1:1 notes', when: '3 days ago', by: 'David Kim' },
  ],
}

const TYPE_LABEL = { email: 'Email', sms: 'Text', note: 'Note', chat: 'AI chat' }

export function ActivityProvider({ children }) {
  const [byEntity, setByEntity] = useState(SEED)
  const seqRef = useRef(0)

  // Prepend an entry to an entity's log (newest first).
  function logActivity(entityId, entry) {
    if (!entityId) return
    seqRef.current += 1
    // Defaults first so the caller may set when/by; `id` is last so it can never be
    // clobbered (guarantees unique React keys).
    const item = { when: 'just now', by: 'You', ...entry, id: `a-${seqRef.current}` }
    setByEntity((prev) => ({ ...prev, [entityId]: [item, ...(prev[entityId] || [])] }))
  }

  const getActivity = (entityId) => byEntity[entityId] || []

  return (
    <ActivityContext.Provider value={{ getActivity, logActivity }}>
      {children}
    </ActivityContext.Provider>
  )
}

export { TYPE_LABEL as ACTIVITY_TYPE_LABEL }

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used within an ActivityProvider')
  return ctx
}
