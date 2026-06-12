import { useState } from 'react'
import { X, Building2, Trash2, Plus, Users, RotateCcw } from 'lucide-react'
import { SHARE_PEOPLE, SHARE_DEPARTMENTS, SHARE_ROLES } from '../../data/mock.js'

// S105–S107 — share access modal (empty / people added / departments added)
export default function ShareModal({ dashboard, onClose }) {
  const [tab, setTab] = useState('people')
  const [access, setAccess] = useState([]) // { key, kind, name, sub, initials, role }
  const [restored, setRestored] = useState(new Set()) // offboarded users reactivated this session

  const source = tab === 'people' ? SHARE_PEOPLE : SHARE_DEPARTMENTS
  const available = source.filter((s) => !access.some((a) => a.key === `${tab}-${s.id}`))
  // A deactivated (offboarded) user must be recovered before access can be granted.
  const isActive = (s) => s.status !== 'deactivated' || restored.has(s.id)
  const restore = (id) => setRestored((prev) => new Set(prev).add(id))

  function add(item) {
    setAccess((prev) => [
      ...prev,
      {
        key: `${tab}-${item.id}`,
        kind: tab === 'people' ? 'person' : 'dept',
        name: item.name,
        sub: item.sub,
        initials: item.initials,
        role: 'Viewer',
      },
    ])
  }
  const setRole = (key, role) => setAccess((p) => p.map((a) => (a.key === key ? { ...a, role } : a)))
  const remove = (key) => setAccess((p) => p.filter((a) => a.key !== key))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex w-[560px] max-w-full max-h-[85vh] flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-aims-blue" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">Share — {dashboard?.name}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Add picker */}
          <div>
            <div className="mb-2 inline-flex rounded-lg border border-gray-300 p-0.5 text-sm dark:border-white/15">
              {[
                { id: 'people', label: 'People' },
                { id: 'departments', label: 'Departments' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-md px-3 py-1 font-medium ${
                    tab === t.id ? 'bg-aims-blue text-white' : 'text-gray-600 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              {available.length === 0 ? (
                <div className="text-xs text-gray-400 dark:text-slate-500">All {tab} added.</div>
              ) : (
                available.map((s) => {
                  const active = isActive(s)
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-white/10 ${active ? '' : 'opacity-70'}`}
                    >
                      <Avatar item={s} kind={tab === 'people' ? 'person' : 'dept'} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{s.name}</div>
                        <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">{s.sub}</div>
                      </div>
                      {active ? (
                        <button className="btn-secondary !py-1 !px-2.5 text-xs shrink-0" onClick={() => add(s)}>
                          <Plus size={13} /> Add
                        </button>
                      ) : (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="cap-chip cap-chip-neutral">Deactivated</span>
                          <button className="btn-secondary !py-1 !px-2.5 text-xs" onClick={() => restore(s.id)}>
                            <RotateCcw size={13} /> Restore
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Has access */}
          <div>
            <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">
              Has access ({access.length})
            </div>
            {access.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-xs text-gray-400 dark:border-white/15 dark:text-slate-500">
                No one has access yet. Add people or departments above.
              </div>
            ) : (
              <div className="space-y-1.5">
                {access.map((a) => (
                  <div key={a.key} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-white/10">
                    <Avatar item={a} kind={a.kind} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{a.name}</div>
                      <div className="truncate text-[11px] text-gray-400 dark:text-slate-500">{a.sub}</div>
                    </div>
                    <select
                      className="input h-8 w-24 !py-1 text-xs"
                      value={a.role}
                      onChange={(e) => setRole(a.key, e.target.value)}
                    >
                      {SHARE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      className="h-7 w-7 grid place-items-center rounded-md text-gray-400 hover:text-aims-stale dark:text-slate-500"
                      onClick={() => remove(a.key)}
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {access.length === 0 ? 'Only you can see this dashboard.' : `${access.length} with access`}
          </span>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Avatar({ item, kind }) {
  if (kind === 'dept') {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aims-blue/15 text-aims-blue">
        <Building2 size={16} />
      </span>
    )
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aims-blue-mid text-[11px] font-semibold text-white">
      {item.initials}
    </span>
  )
}
