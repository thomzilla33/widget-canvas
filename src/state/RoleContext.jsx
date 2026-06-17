import { createContext, useContext, useEffect, useState } from 'react'

// U7.2 — admin gating. The builder (create/edit) is admin-only; consumers get a
// read-only workspace. A topbar toggle flips the role so both views are demoable.
// Persisted to localStorage; defaults to admin so existing flows work out of the box.
const RoleContext = createContext({ isAdmin: true, setAdmin: () => {} })

const STORAGE_KEY = 'aims-role'

function readRole() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'viewer'
  } catch {
    return true
  }
}

export function RoleProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => readRole())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, isAdmin ? 'admin' : 'viewer')
    } catch {
      /* ignore */
    }
  }, [isAdmin])

  const setAdmin = (v) => setIsAdmin(typeof v === 'function' ? v : !!v)
  return <RoleContext.Provider value={{ isAdmin, setAdmin }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
