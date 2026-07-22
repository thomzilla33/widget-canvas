import { createContext, useContext, useState } from 'react'

const CopilotContext = createContext({ open: false, setOpen: () => {} })

export function CopilotProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <CopilotContext.Provider value={{ open, setOpen }}>
      {children}
    </CopilotContext.Provider>
  )
}

export const useCopilot = () => useContext(CopilotContext)
