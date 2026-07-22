import { useState } from 'react'
import { ListChecks } from 'lucide-react'
import { CardHeader }      from './CardHeader.jsx'
import { MyWorkTab }       from './wq/MyWorkTab.jsx'
import { MyDayTab }        from './wq/MyDayTab.jsx'
import { EventModal }      from './EventModal.jsx'
import { EscalationModal } from './EscalationModal.jsx'
import { TraceSlideout }   from './TraceSlideout.jsx'
import { MY_WORK_EVENTS }  from '../../data/workqueue.js'
import { MY_DAY_QUEUE }    from '../../data/home.js'
import { useCopilot }      from '../../state/CopilotContext.jsx'
import UndoToast           from './UndoToast.jsx'

const TABS = [
  { id: 'work',  label: 'My Work' },
  { id: 'focus', label: "Today's Focus" },
]

export function WorkQueuesCard() {
  const { setOpen: setCopilotOpen }      = useCopilot()
  const [tab, setTab]                    = useState('work')
  const [modalEvent, setModalEvent]      = useState(null)
  const [escalationEvent, setEscalation] = useState(null)
  const [traceEvent, setTrace]           = useState(null)
  const [toast, setToast]                = useState(null)

  function showToast(msg) {
    setToast({ message: msg })
    setTimeout(() => setToast(null), 3500)
  }

  function handleOpen(event, intent) { setModalEvent(intent ? { ...event, _intent: intent } : event) }
  function handleEscalate(event) { setModalEvent(null); setEscalation(event) }
  function handleTrace(event)    { setTrace(event) }

  function handleModalPrimary(event) {
    setModalEvent(null)
    showToast(`${event.quickActions?.primary ?? 'Action'} recorded — logged to audit ledger.`)
  }

  function handleEscalateSubmit({ event }) {
    setEscalation(null)
    showToast(`Escalated "${event?.title?.slice(0, 40) ?? 'event'}".`)
  }

  const workBadge  = MY_WORK_EVENTS.filter(e => ['actnow', 'critical'].includes(e.tier)).length
  const focusBadge = MY_DAY_QUEUE.length
  const badge      = tab === 'work' ? (workBadge || undefined) : (focusBadge || undefined)

  return (
    <>
      <div className="card flex h-full flex-col">
        <CardHeader
          icon={<ListChecks size={14} />}
          title="My Work"
          badge={badge}
          action={{ label: 'See all', onClick: undefined }}
        />

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 px-4 dark:border-white/[0.06]">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                tab === id
                  ? 'border-aims-blue text-aims-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'work'
          ? <MyWorkTab onOpen={handleOpen} onEscalate={handleEscalate} onTrace={handleTrace} />
          : <MyDayTab onEscalate={handleEscalate} onAsk={() => setCopilotOpen(true)} />
        }
      </div>

      {modalEvent && (
        <EventModal
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onPrimary={handleModalPrimary}
          onEscalate={handleEscalate}
          onTrace={handleTrace}
        />
      )}
      {escalationEvent && (
        <EscalationModal
          event={escalationEvent}
          onClose={() => setEscalation(null)}
          onEscalate={handleEscalateSubmit}
        />
      )}
      {traceEvent && (
        <TraceSlideout
          event={traceEvent}
          onClose={() => setTrace(null)}
        />
      )}
      {toast && (
        <UndoToast
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
