import { createContext, useContext, useState } from 'react'
import { notifications as seed, NOTIFICATION_CATEGORIES } from '../data/mock.js'

const NotificationsContext = createContext(null)

const defaultSettings = Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.id, true]))

export function NotificationsProvider({ children }) {
  const [items, setItems]       = useState(seed)
  const [settings, setSettings] = useState(defaultSettings)

  const unreadCount = items.filter((n) => n.unread).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  function markRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  function toggleSetting(id) {
    const cat = NOTIFICATION_CATEGORIES.find((c) => c.id === id)
    if (cat?.mandatory) return
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <NotificationsContext.Provider
      value={{ items, settings, unreadCount, markAllRead, markRead, toggleSetting }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider')
  return ctx
}
