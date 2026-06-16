import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, LayoutDashboard, FileBarChart, Boxes, UserRound, Plus, Search, CornerDownLeft } from 'lucide-react'
import { useDashboards } from '../../state/DashboardsContext.jsx'
import { useWidgets } from '../../state/WidgetsContext.jsx'
import { entities } from '../../data/mock.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const PER_GROUP = 6 // cap results per group so the list stays scannable

// ⌘K command palette — jump to any dashboard, widget, profile, page, or action.
export default function CommandPalette({ onClose }) {
  const navigate = useNavigate()
  const { dashboards } = useDashboards()
  const { widgets } = useWidgets()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const trapRef = useFocusTrap()

  const go = (path) => {
    onClose()
    navigate(path)
  }

  const all = useMemo(() => {
    const cmds = [
      { id: 'nav-home', group: 'Go to', label: 'Home', icon: Home, run: () => go('/home') },
      { id: 'nav-dash', group: 'Go to', label: 'Dashboards', icon: LayoutDashboard, run: () => go('/dashboards') },
      { id: 'nav-reports', group: 'Go to', label: 'Reports', icon: FileBarChart, run: () => go('/reports') },
      { id: 'nav-widgets', group: 'Go to', label: 'Widget Library', icon: Boxes, run: () => go('/widgets') },
      { id: 'act-newdash', group: 'Actions', label: 'New dashboard', icon: Plus, run: () => go('/dashboard/new') },
      { id: 'act-newwidget', group: 'Actions', label: 'New widget', icon: Plus, run: () => go('/widgets/new') },
    ]
    dashboards.forEach((d) =>
      cmds.push({ id: `d-${d.id}`, group: 'Dashboards', label: d.name, sub: `${d.entity} · ${d.audience}`, icon: LayoutDashboard, run: () => go(`/dashboard/${d.id}`) }),
    )
    widgets.forEach((w) =>
      cmds.push({ id: `w-${w.id}`, group: 'Widgets', label: w.name, sub: `${w.skeleton} · ${w.source}`, icon: Boxes, run: () => go('/widgets') }),
    )
    entities.forEach((e) =>
      cmds.push({ id: `e-${e.id}`, group: 'Profiles', label: e.name, sub: e.type || 'Profile', icon: UserRound, run: () => go(`/ucp/${e.id}`) }),
    )
    return cmds
    // go/navigate/onClose are stable enough for a session-scoped palette
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboards, widgets])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const base = needle
      ? all.filter((c) => `${c.label} ${c.sub || ''} ${c.group}`.toLowerCase().includes(needle))
      : all.filter((c) => c.group === 'Go to' || c.group === 'Actions' || c.group === 'Dashboards')
    const seen = {}
    const out = []
    for (const c of base) {
      seen[c.group] = (seen[c.group] || 0) + 1
      if (seen[c.group] <= PER_GROUP) out.push(c)
    }
    return out
  }, [q, all])

  // Clamp at read time so a freshly-narrowed result list never has a stale index.
  const safeActive = Math.min(active, Math.max(0, results.length - 1))

  useEffect(() => {
    document.getElementById(`cmd-opt-${safeActive}`)?.scrollIntoView({ block: 'nearest' })
  }, [safeActive])

  const groups = useMemo(() => {
    const order = []
    const byName = {}
    results.forEach((c, i) => {
      if (!(c.group in byName)) {
        byName[c.group] = { name: c.group, items: [] }
        order.push(byName[c.group])
      }
      byName[c.group].items.push({ ...c, flatIndex: i })
    })
    return order
  }, [results])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(results.length - 1, safeActive + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(0, safeActive - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[safeActive]?.run()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={trapRef} tabIndex={-1} className="card relative z-10 flex max-h-[70vh] w-[90vw] max-w-[600px] flex-col overflow-hidden p-0 outline-none">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 dark:border-white/10">
          <Search size={16} className="shrink-0 text-gray-500 dark:text-slate-400" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            placeholder="Search dashboards, widgets, profiles, actions…"
            aria-label="Search the workspace"
            className="w-full bg-transparent py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <kbd className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:border-white/15 dark:text-slate-500">
            Esc
          </kbd>
        </div>
        <div className="min-h-0 flex-1 overflow-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-slate-400">No results for “{q}”.</div>
          ) : (
            groups.map((g) => (
              <div key={g.name} className="px-2 pb-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{g.name}</div>
                {g.items.map((c) => {
                  const Icon = c.icon
                  const isActive = c.flatIndex === safeActive
                  return (
                    <button
                      key={c.id}
                      id={`cmd-opt-${c.flatIndex}`}
                      onMouseEnter={() => setActive(c.flatIndex)}
                      onClick={() => c.run()}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors ${
                        isActive ? 'bg-aims-blue/10 text-aims-blue' : 'text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon size={15} className={`shrink-0 ${isActive ? 'text-aims-blue' : 'text-gray-500 dark:text-slate-400'}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-sm">{c.label}</span>
                      {c.sub && <span className="max-w-[45%] shrink-0 truncate text-[11px] text-gray-500 dark:text-slate-400">{c.sub}</span>}
                      {isActive && <CornerDownLeft size={13} className="shrink-0 text-aims-blue" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
