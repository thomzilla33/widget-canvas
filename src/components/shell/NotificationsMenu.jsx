import { useState } from 'react'
import { Settings, ChevronLeft, Lock, BellOff } from 'lucide-react'
import { useNotifications } from '../../state/NotificationsContext.jsx'
import { NOTIFICATION_CATEGORIES } from '../../data/mock.js'
import { Button } from '@/components/ui/Button'

// S115–S120 — dropdown under the topbar bell (list + settings + empty state)
export default function NotificationsMenu({ onClose }) {
  const { items, settings, markAllRead, markRead, toggleSetting } = useNotifications()
  const [view, setView] = useState('list')

  // Respect per-category settings (mandatory ones are always on).
  const visible = items.filter((n) => settings[n.category])

  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[200] w-full sm:w-[360px] max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#131a2c]">
      {view === 'list' ? (
        <>
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
            <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
            <div className="flex items-center gap-1">
              <Button variant="tertiary" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
              <button
                className="h-7 w-7 grid place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
                title="Notification settings"
                aria-label="Notification settings"
                onClick={() => setView('settings')}
              >
                <Settings size={15} />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <BellOff size={26} className="text-gray-300 dark:text-slate-400" />
                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-slate-200">You're all caught up</div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">No notifications right now.</div>
              </div>
            ) : (
              visible.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <span className="text-lg leading-none">{n.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-aims-blue" />}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{n.body}</div>
                    <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{n.when}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-3 dark:border-white/10">
            <button
              className="h-7 w-7 grid place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Back to notifications"
              onClick={() => setView('list')}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">Notification settings</span>
          </div>
          <div className="p-2">
            {NOTIFICATION_CATEGORIES.map((c) => (
              <label
                key={c.id}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
                  c.mandatory ? '' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-slate-200">
                    {c.label}
                    {c.mandatory && <Lock size={12} className="text-gray-500 dark:text-slate-400" />}
                  </div>
                  {c.mandatory && (
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">Required — can't be turned off</div>
                  )}
                </div>
                <Toggle checked={c.mandatory ? true : settings[c.id]} disabled={c.mandatory} onChange={() => toggleSetting(c.id)} />
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-aims-blue' : 'bg-gray-300 dark:bg-white/15'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}
