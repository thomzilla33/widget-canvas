import { createContext, useContext, useState } from 'react'

export const TIERS = ['v1', 'v1.5', 'v2']

const ScopeContext = createContext({ scope: 'v1', setScope: () => {}, tiers: TIERS })

export function ScopeProvider({ children }) {
  const [scope, setScope] = useState('v1')
  return (
    <ScopeContext.Provider value={{ scope, setScope, tiers: TIERS }}>
      {children}
    </ScopeContext.Provider>
  )
}

export function useScope() {
  return useContext(ScopeContext)
}

// true when the active scope is at or beyond minTier
export function scopeAtLeast(currentScope, minTier) {
  return TIERS.indexOf(currentScope) >= TIERS.indexOf(minTier)
}
