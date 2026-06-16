import { createContext, useContext, useEffect, useState } from 'react'

// Phase 7 — drives "live" tiles. A plain monotonic tick counter (NOT Date/random,
// so the data layer stays deterministic) increments on an interval; live widgets
// fold the tick into their sample so they move like a real-time stream. A global
// pause stops the interval, freezing every live tile at once.
const LiveContext = createContext({ tick: 0, paused: false, setPaused: () => {} })

const INTERVAL_MS = 3000

export function LiveProvider({ children }) {
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => setTick((t) => t + 1), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  return <LiveContext.Provider value={{ tick, paused, setPaused }}>{children}</LiveContext.Provider>
}

export function useLive() {
  return useContext(LiveContext)
}
