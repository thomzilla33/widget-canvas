import { createContext, useContext, useState } from 'react'
import { SEED_OUTPUTS } from '../data/pendingOutputs.js'

const PendingOutputsContext = createContext(null)

let seq = 100
const nid = () => `po-new-${(seq += 1)}`

export function PendingOutputsProvider({ children }) {
  const [outputs, setOutputs] = useState(SEED_OUTPUTS)
  const [newIds, setNewIds] = useState(new Set())

  function addOutput(partial) {
    const id = nid()
    const item = {
      id,
      status: 'ready',
      statusLabel: 'Ready for review',
      when: 'Just now',
      authoritySummary: 'authoritative',
      groundingSuperseded: false,
      preview: { summary: 'Output is being generated. Open to review.', fields: [] },
      ...partial,
    }
    setOutputs(prev => [item, ...prev])
    setNewIds(prev => new Set([...prev, id]))
    setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(id); return n }), 4000)
    return id
  }

  const pendingCount = outputs.filter(o => o.status !== 'advanced').length

  return (
    <PendingOutputsContext.Provider value={{ outputs, addOutput, newIds, pendingCount }}>
      {children}
    </PendingOutputsContext.Provider>
  )
}

export function usePendingOutputs() {
  const ctx = useContext(PendingOutputsContext)
  if (!ctx) throw new Error('usePendingOutputs must be used within PendingOutputsProvider')
  return ctx
}
