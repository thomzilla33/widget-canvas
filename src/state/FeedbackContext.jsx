import { createContext, useContext, useRef, useState } from 'react'
import { feedbackFlags } from '../data/mock.js'

// Shared feedback state. `flags` are admin-visible (UCP → Widget Library);
// `reactions` are per-widget-instance thumbs (lightweight, end-user only).
const FeedbackContext = createContext(null)

export function FeedbackProvider({ children }) {
  const [flags, setFlags] = useState(feedbackFlags)
  const [reactions, setReactions] = useState({})
  const seqRef = useRef(0)

  // Newest first.
  function addFlag(flag) {
    seqRef.current += 1
    const id = `fl-new-${seqRef.current}`
    setFlags((prev) => [{ id, status: 'open', ...flag }, ...prev])
  }

  function resolveFlag(id) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'resolved' } : f)))
  }

  // Toggle off when re-selecting the same value.
  function setReaction(iid, value) {
    setReactions((prev) => ({ ...prev, [iid]: prev[iid] === value ? null : value }))
  }

  return (
    <FeedbackContext.Provider value={{ flags, reactions, addFlag, resolveFlag, setReaction }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used within a FeedbackProvider')
  return ctx
}
