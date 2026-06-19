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

  // Immutable patch by id.
  function updateDashboard(id, patch) {
    setDashboards((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  // Immutable remove by id. Widgets are catalog-level and survive — only the
  // dashboard (its layout/placement) is dropped.
  function removeDashboard(id) {
    setDashboards((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <DashboardsContext.Provider value={{ dashboards, addDashboard, updateDashboard, removeDashboard }}>
      {children}
    </DashboardsContext.Provider>
  )
}

export function useDashboards() {
  const ctx = useContext(DashboardsContext)
  if (!ctx) throw new Error('useDashboards must be used within a DashboardsProvider')
  return ctx
}
