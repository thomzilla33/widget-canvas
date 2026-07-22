import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Video, Flag, Bell } from 'lucide-react'
import { CardHeader } from './CardHeader.jsx'
import { MY_DAY_EVENTS } from '../../data/home.js'

const TYPE_META = {
  meeting:  { icon: <Video size={11} />, dot: 'bg-blue-500',  label: 'Meeting'  },
  deadline: { icon: <Flag size={11} />,  dot: 'bg-red-500',   label: 'Deadline' },
  reminder: { icon: <Bell size={11} />,  dot: 'bg-amber-500', label: 'Reminder' },
}

const URGENCY_TEXT = {
  high:   'text-red-500 dark:text-red-400',
  medium: 'text-amber-500 dark:text-amber-400',
}

export function MyDayCard() {
  const navigate = useNavigate()
  const [joining, setJoining] = useState(null)

  const now        = new Date()
  const currentH   = now.getHours()
  const currentM   = now.getMinutes()

  function isPast(t) {
    const [h, m] = t.split(':').map(Number)
    return h < currentH || (h === currentH && m < currentM)
  }

  function join(ev) {
    setJoining(ev.id)
    setTimeout(() => setJoining(null), 2500)
  }

  return (
    <div className="card flex flex-col h-full">
      <CardHeader
        icon={<Calendar size={14} />}
        title="My Day"
        badge={MY_DAY_EVENTS.filter((e) => !isPast(e.time)).length}
        action={{ label: 'Open calendar', onClick: () => navigate('/dashboards') }}
      />
      <div className="flex flex-col flex-1">
      <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {MY_DAY_EVENTS.map((ev) => {
          const meta = TYPE_META[ev.type]
          const past = isPast(ev.time)
          return (
            <div
              key={ev.id}
              className={`flex items-start gap-3 px-4 py-2.5 transition-opacity ${past ? 'opacity-40' : ''}`}
            >
              <div className="flex flex-col items-center pt-0.5">
                <span className="num whitespace-nowrap text-[10px] font-semibold text-gray-400 dark:text-slate-500">
                  {ev.time}
                </span>
                {ev.duration > 0 && (
                  <span className="text-[9px] text-gray-300 dark:text-slate-600">{ev.duration}m</span>
                )}
              </div>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-xs font-medium ${past ? 'text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'}`}>
                  {ev.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">{meta.label}</span>
                  {ev.attendees && (
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{ev.attendees} people</span>
                  )}
                  {ev.urgency && (
                    <span className={`text-[10px] font-semibold ${URGENCY_TEXT[ev.urgency]}`}>
                      {ev.urgency === 'high' ? 'High priority' : 'Medium'}
                    </span>
                  )}
                </div>
              </div>
              {ev.link && !past && (
                <button
                  type="button"
                  onClick={() => join(ev)}
                  className="shrink-0 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500 transition-colors hover:bg-blue-500/20 dark:text-blue-400"
                >
                  {joining === ev.id ? 'Opening…' : 'Join'}
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-1 items-center justify-center border-t border-gray-100 px-4 py-4 dark:border-white/[0.05]">
        <p className="text-[11px] text-gray-300 dark:text-slate-700">No more events today</p>
      </div>
      </div>
    </div>
  )
}
