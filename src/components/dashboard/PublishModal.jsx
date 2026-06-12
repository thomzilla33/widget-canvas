import { useState } from 'react'
import { X, Check, Rocket, History, RotateCcw, EyeOff } from 'lucide-react'

const ROLES = ['Sales Agent', 'Support Agent', 'Manager']
const ZONES = [
  { key: 'header', label: 'Header' },
  { key: 'sidebar', label: 'Sidebar' },
  { key: 'main', label: 'Main' },
  { key: 'bottom', label: 'Bottom' },
]

const visibleTo = (audience, role) => audience === 'All audiences' || audience === role

// S99–S104 — preview by role, publish confirm, version history, rollback
export default function PublishModal({ dashboard, placements, widgetById, onClose, onPublish }) {
  const [tab, setTab] = useState('preview')
  const [role, setRole] = useState(dashboard?.audience && ROLES.includes(dashboard.audience) ? dashboard.audience : ROLES[0])
  const [published, setPublished] = useState(false)
  const [restoring, setRestoring] = useState(null)
  const [versions, setVersions] = useState([
    { id: 'v2', label: 'Current draft', status: 'draft', when: 'just now', current: true },
    { id: 'v1', label: 'Initial publish', status: 'published', when: '2 days ago' },
  ])

  const all = Object.values(placements).flat()
  const hiddenCount = all.filter((p) => !visibleTo(p.audience, role)).length

  function publish() {
    onPublish?.()
    setVersions((prev) => [
      { id: `v${prev.length + 1}`, label: 'Published', status: 'published', when: 'just now', current: true },
      ...prev.map((v) => ({ ...v, current: false })),
    ])
    setPublished(true)
  }

  function confirmRestore() {
    setVersions((prev) => [
      { id: `v${prev.length + 1}`, label: `Restored ${restoring.id}`, status: 'draft', when: 'just now', current: true },
      ...prev.map((v) => ({ ...v, current: false })),
    ])
    setRestoring(null)
    setTab('preview')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 flex w-[640px] max-w-full max-h-[85vh] flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Rocket size={16} className="text-aims-blue" />
            <span className="font-semibold text-gray-900 dark:text-slate-100">Publish — {dashboard?.name}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {published ? (
          <PublishedState dashboard={dashboard} role={role} onClose={onClose} onHistory={() => { setPublished(false); setTab('history') }} />
        ) : restoring ? (
          <RestoreConfirm version={restoring} onCancel={() => setRestoring(null)} onConfirm={confirmRestore} />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-200 px-4 pt-2 dark:border-white/10">
              <Tab active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Rocket size={13} />}>
                Preview & publish
              </Tab>
              <Tab active={tab === 'history'} onClick={() => setTab('history')} icon={<History size={13} />}>
                Version history
              </Tab>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {tab === 'preview' ? (
                <>
                  <div className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-200">Preview as role</div>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`h-7 rounded-full border px-3 text-xs font-semibold transition-colors ${
                          role === r
                            ? 'border-aims-blue/40 bg-aims-blue/10 text-aims-blue'
                            : 'border-gray-300 text-gray-500 hover:text-gray-700 dark:border-white/15 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {hiddenCount > 0 && (
                    <div className="mb-3 inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                      <EyeOff size={13} /> {hiddenCount} widget{hiddenCount === 1 ? '' : 's'} hidden for {role}
                    </div>
                  )}

                  <div className="space-y-2">
                    {ZONES.map((z) => {
                      const items = placements[z.key].filter((p) => visibleTo(p.audience, role))
                      return (
                        <div key={z.key} className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
                          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                            {z.label}
                          </div>
                          {items.length === 0 ? (
                            <div className="text-xs text-gray-400 dark:text-slate-500">— empty for this role</div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((p) => (
                                <span key={p.pid} className="cap-chip cap-chip-neutral">
                                  {widgetById(p.widgetId)?.name || 'Widget'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{v.id}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{v.label}</span>
                          {v.current && <span className="cap-chip cap-chip-data">Current</span>}
                        </div>
                        <div className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">{v.status} · {v.when}</div>
                      </div>
                      {!v.current && (
                        <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => setRestoring(v)}>
                          <RotateCcw size={13} /> Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {tab === 'preview' && (
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-white/10">
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {all.length} widget{all.length === 1 ? '' : 's'} · {dashboard?.entity} · {dashboard?.audience}
                </span>
                <button className="btn-primary" onClick={publish}>
                  <Rocket size={15} /> Publish dashboard
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Tab({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? 'border-b-2 border-aims-blue text-gray-900 dark:text-slate-100'
          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function PublishedState({ dashboard, role, onClose, onHistory }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/25 dark:bg-green-500/10">
        <Check size={28} className="text-aims-governed" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Dashboard published</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
        “{dashboard?.name}” is now live for {dashboard?.audience}. A notification was sent to assigned users.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <button className="btn-secondary" onClick={onHistory}>
          <History size={15} /> Version history
        </button>
        <button className="btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}

function RestoreConfirm({ version, onCancel, onConfirm }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10">
        <RotateCcw size={26} className="text-aims-aging" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Restore {version.id}?</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
        This creates a new draft from “{version.label}” ({version.when}). The current layout is kept in history.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onConfirm}>
          <Check size={15} /> Restore version
        </button>
      </div>
    </div>
  )
}
