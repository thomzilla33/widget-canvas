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

  // Deep-copy a dashboard under a new id, marked draft, inserted newest-first.
  // Accepts an optional custom name; returns the new id for post-action navigation.
  function duplicateDashboard(id, name) {
    const stamp = Date.now().toString(36)
    const newId = `${id}-copy-${stamp}`
    setDashboards((prev) => {
      const src = prev.find((d) => d.id === id)
      if (!src) return prev
      const copy = { ...src, id: newId, name: name ?? `${src.name} (copy)`, status: 'draft', updated: 'just now' }
      return [copy, ...prev]
    })
    return newId
  }

  return (
    <DashboardsContext.Provider value={{ dashboards, addDashboard, updateDashboard, removeDashboard, duplicateDashboard }}>
      {children}
    </DashboardsContext.Provider>
  )
}

export function useDashboards() {
  const ctx = useContext(DashboardsContext)
  if (!ctx) throw new Error('useDashboards must be used within a DashboardsProvider')
  return ctx
}
