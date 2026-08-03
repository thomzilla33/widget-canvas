import { createContext, useContext, useState } from 'react'
import { dashboards as seedDashboards } from '../data/mock.js'

const LAYOUTS_KEY = 'aims-canvas-layouts'

function readLayouts() {
  try { return JSON.parse(localStorage.getItem(LAYOUTS_KEY) ?? '{}') } catch { return {} }
}

function writeLayout(id, layout) {
  try {
    const all = readLayouts()
    if (layout == null) { delete all[id] } else { all[id] = layout }
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(all))
  } catch {}
}

function initDashboards() {
  const saved = readLayouts()
  return seedDashboards.map((d) => saved[d.id] ? { ...d, layout: saved[d.id] } : d)
}

// Shared in-memory dashboard list. Seeded from mock data; layouts restored from
// localStorage so canvas edits survive page reload.
const DashboardsContext = createContext(null)

export function DashboardsProvider({ children }) {
  const [dashboards, setDashboards] = useState(initDashboards)

  // Immutable add — newest first.
  function addDashboard(dashboard) {
    setDashboards((prev) => [dashboard, ...prev])
  }

  // Immutable patch by id. Persists layout changes to localStorage.
  function updateDashboard(id, patch) {
    if ('layout' in patch) writeLayout(id, patch.layout ?? null)
    setDashboards((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  // Immutable remove by id. Clears any persisted layout for the dashboard.
  function removeDashboard(id) {
    writeLayout(id, null)
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
