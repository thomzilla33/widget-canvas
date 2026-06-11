import { createContext, useContext, useState } from 'react'
import { dashboards as seedDashboards } from '../data/mock.js'

// Shared in-memory dashboard list. Seeded from mock data; NewDashboard appends
// to it and DashboardList reads from it.
const DashboardsContext = createContext(null)

export function DashboardsProvider({ children }) {
  const [dashboards, setDashboards] = useState(seedDashboards)

  // Immutable add — newest first.
  function addDashboard(dashboard) {
    setDashboards((prev) => [dashboard, ...prev])
  }

  return (
    <DashboardsContext.Provider value={{ dashboards, addDashboard }}>
      {children}
    </DashboardsContext.Provider>
  )
}

export function useDashboards() {
  const ctx = useContext(DashboardsContext)
  if (!ctx) throw new Error('useDashboards must be used within a DashboardsProvider')
  return ctx
}
