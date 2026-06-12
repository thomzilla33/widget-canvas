import { createContext, useContext, useState } from 'react'
import { widgets as seedWidgets } from '../data/mock.js'

// Shared in-memory widget catalog. Seeded from mock data; the Widget Builder
// appends to it, and both the Widget Library and the Dashboard Canvas read from it.
const WidgetsContext = createContext(null)

export function WidgetsProvider({ children }) {
  const [widgets, setWidgets] = useState(seedWidgets)

  // Immutable add — returns a new array, never mutates the existing one.
  function addWidget(widget) {
    setWidgets((prev) => [widget, ...prev])
  }

  // Immutable patch by id.
  function updateWidget(id, patch) {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }

  return (
    <WidgetsContext.Provider value={{ widgets, addWidget, updateWidget }}>
      {children}
    </WidgetsContext.Provider>
  )
}

export function useWidgets() {
  const ctx = useContext(WidgetsContext)
  if (!ctx) throw new Error('useWidgets must be used within a WidgetsProvider')
  return ctx
}
