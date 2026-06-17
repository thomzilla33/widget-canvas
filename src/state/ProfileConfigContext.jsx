import { createContext, useContext, useEffect, useState } from 'react'
import { PROFILE_TYPES, MANDATORY_TABS } from '../data/mock.js'

// Durable per-profile-type tab configuration (U1).
// Tabs edited on any profile of a given type (e.g. every Company) persist to
// localStorage and apply to all profiles of that type. Seeded from PROFILE_TYPES.
const ProfileConfigContext = createContext(null)

const STORAGE_KEY = 'aims-profile-tabs'

// Default tab list for a profile type, falling back to the mandatory tabs.
function defaultTabs(profileType) {
  return PROFILE_TYPES.find((t) => t.id === profileType)?.tabs || MANDATORY_TABS
}

// SSR-safe read of the persisted config. Returns {} when unavailable/corrupt.
function readStored() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function ProfileConfigProvider({ children }) {
  // Map of profileType → tabs[]. The initializer already hydrates from localStorage
  // (window always exists in this SPA), so no separate mount effect is needed.
  const [config, setConfig] = useState(() => readStored())

  // Persist on every change.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [config])

  // Stored tabs for a type, or the PROFILE_TYPES default when nothing is stored.
  function getTabs(profileType) {
    const stored = config[profileType]
    return Array.isArray(stored) && stored.length ? stored : defaultTabs(profileType)
  }

  function setTabs(profileType, tabsArray) {
    if (!profileType || !Array.isArray(tabsArray)) return
    setConfig((prev) => ({ ...prev, [profileType]: tabsArray }))
  }

  return (
    <ProfileConfigContext.Provider value={{ getTabs, setTabs }}>
      {children}
    </ProfileConfigContext.Provider>
  )
}

export function useProfileConfig() {
  const ctx = useContext(ProfileConfigContext)
  if (!ctx) throw new Error('useProfileConfig must be used within a ProfileConfigProvider')
  return ctx
}
