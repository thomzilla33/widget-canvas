import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AVAILABLE_MODELS, modelById } from '../data/models/index.js'

const STORAGE_KEY = 'aims_installed_models'

function loadInstalled() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}
function saveInstalled(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

const ModelsContext = createContext(null)

export function ModelsProvider({ children }) {
  const [installed, setInstalled] = useState(loadInstalled)

  const installModel = useCallback((id) => {
    setInstalled((prev) => {
      const next = new Set(prev).add(id)
      saveInstalled(next)
      return next
    })
  }, [])

  const uninstallModel = useCallback((id) => {
    setInstalled((prev) => {
      const next = new Set(prev)
      next.delete(id)
      saveInstalled(next)
      return next
    })
  }, [])

  const isInstalled = useCallback((id) => installed.has(id), [installed])

  // All entities from all installed models (flat list)
  const installedEntities = useMemo(() => {
    return [...installed].flatMap((id) => modelById(id)?.entities || [])
  }, [installed])

  // Records for a given automotive entity source id (used in preview)
  const getRecords = useCallback((sourceId) => {
    for (const modelId of installed) {
      const model = modelById(modelId)
      if (!model) continue
      if (sourceId === 'vehicles_auto')  return model.records.vehicles
      if (sourceId === 'deals_auto')     return model.records.deals
      if (sourceId === 'contacts_auto')  return model.records.contacts
      if (sourceId === 'service_auto')   return model.records.serviceOrders
    }
    return null
  }, [installed])

  const value = {
    availableModels: AVAILABLE_MODELS,
    installed,
    installModel,
    uninstallModel,
    isInstalled,
    installedEntities,
    getRecords,
  }

  return <ModelsContext.Provider value={value}>{children}</ModelsContext.Provider>
}

export function useModels() {
  const ctx = useContext(ModelsContext)
  if (!ctx) throw new Error('useModels must be used inside ModelsProvider')
  return ctx
}
