import { useState, useEffect, useRef } from 'react'
import { LayoutGrid, UserSquare, MapPin, ChevronDown, Wand2 } from 'lucide-react'
import { entities, PROFILE_TYPES, REPORT_COLLECTIONS, HOME_SCOPES, placementLabel } from '../../data/mock.js'
import { AUDIENCE_TYPES, AUDIENCE_TARGETS, audienceKey, audienceLabel, normalizeAudience } from '../../data/audiences.js'
import { useProfileConfig } from '../../state/ProfileConfigContext.jsx'

// Shared placement picker — the single source for "where does this dashboard live?"
// Used by NewDashboard (create) AND EditSetupModal (recover/change after creation).
// Owns name + audience + the surface/profile/scope/tab/collection/home controls, and
// emits { name, audience, placement, valid } on every change. Conflict detection stays
// with the caller (it knows the dashboards list and whether to exclude self).

// Stable signature for a placement + audience (detects destination changes).
export function placeKey(p, audience) {
  const a = audienceKey(audience)
  if (!p) return ''
  if (p.surface === 'report') return `report|${p.collection}|${a}`
  if (p.surface === 'home') return `home|${p.homeScope}|${a}`
  return `profile|${p.profileType}|${p.scope}|${p.entityId || 'all'}|${p.tab}|${a}`
}

// True if two placements would surface the same slot (type-wide overlaps any entity).
export function overlaps(a, b) {
  if (!a || !b || a.surface !== b.surface) return false
  if (a.surface === 'report') return a.collection === b.collection
  if (a.surface === 'home') return a.homeScope === b.homeScope
  if (a.profileType !== b.profileType || a.tab !== b.tab) return false
  if (a.scope === 'all' || b.scope === 'all') return true
  return a.entityId === b.entityId
}

const typeOf = (id) => PROFILE_TYPES.find((t) => t.id === id) || PROFILE_TYPES[0]

// Build a context-aware suggested name from placement + audience state.
function buildSuggestedName(surface, profileType, collection, homeScope, audType, audTarget) {
  const aud = audType === 'global' ? 'Everyone' : audTarget || ''
  if (surface === 'profile') {
    const type = PROFILE_TYPES.find((t) => t.id === profileType)?.label || profileType
    return `${aud} — ${type} 360`
  }
  if (surface === 'report') return `${aud} — ${collection}`
  if (surface === 'home') {
    const scope = HOME_SCOPES?.find((h) => h.id === homeScope)?.label || homeScope
    return `${scope} Home`
  }
  return ''
}

export default function PlacementForm({ initial, onChange }) {
  const p0 = initial?.placement
  const [name, setName] = useState(initial?.name || '')
  const a0 = normalizeAudience(initial?.audience)
  const [audType, setAudType] = useState(a0.type)
  const [audTarget, setAudTarget] = useState(a0.label || AUDIENCE_TARGETS[a0.type]?.[0] || '')
  const audience = audType === 'global' ? { type: 'global' } : { type: audType, label: audTarget }
  const [surface, setSurface] = useState(p0?.surface || 'profile')
  const [profileType, setProfileType] = useState(p0?.profileType || 'Company')
  const [scope, setScope] = useState(p0?.scope || 'all')
  const [entityId, setEntityId] = useState(p0?.entityId || null)
  const { getTabs, setTabs } = useProfileConfig()
  const [tab, setTab] = useState(p0?.tab || typeOf(p0?.profileType || 'Company').tabs[0])
  const [tabExpanded, setTabExpanded] = useState(false)
  const [addingTab, setAddingTab] = useState(false)
  const [newTab, setNewTab] = useState('')
  const [collection, setCollection] = useState(p0?.collection || REPORT_COLLECTIONS[0])
  const [homeScope, setHomeScope] = useState(p0?.homeScope || 'personal')

  const currentType = typeOf(profileType)
  const allTabs = getTabs(profileType)
  function addCustomTab() {
    const n = newTab.trim()
    if (n && !allTabs.some((t) => t.toLowerCase() === n.toLowerCase())) {
      setTabs(profileType, [...allTabs, n])
      setTab(n)
    }
    setNewTab('')
    setAddingTab(false)
    setTabExpanded(false)
  }
  function removeCustomTab(t) {
    if (currentType.tabs.includes(t)) return
    setTabs(profileType, allTabs.filter((x) => x !== t))
    if (tab === t) setTab(currentType.tabs[0] || 'Overview')
  }
  const entitiesForType = entities.filter((e) => e.type === currentType.entityType)
  const kind = surface === 'profile' ? 'entity' : 'global'

  // Auto-suggested name derived from current placement + audience context.
  const suggestedName = buildSuggestedName(surface, profileType, collection, homeScope, audType, audTarget)

  function buildPlacement() {
    if (surface === 'report') return { surface, collection }
    if (surface === 'home') return { surface, homeScope }
    const ent = entities.find((e) => e.id === entityId)
    return {
      surface,
      profileType,
      scope,
      entityId: scope === 'entity' ? entityId : null,
      entityName: scope === 'entity' ? ent?.name || null : null,
      tab,
    }
  }
  const placement = buildPlacement()
  const placementValid =
    surface === 'profile'
      ? !!profileType && !!tab.trim() && (scope === 'all' || !!entityId)
      : surface === 'report'
        ? !!collection
        : !!homeScope
  const valid = name.trim().length > 0 && placementValid

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  useEffect(() => {
    onChangeRef.current({ name: name.trim(), audience, placement, valid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, audType, audTarget, surface, profileType, scope, entityId, tab, collection, homeScope])

  function selectAudType(id) {
    setAudType(id)
    if (id !== 'global') setAudTarget(AUDIENCE_TARGETS[id]?.[0] || '')
  }

  function selectSurface(id) {
    setSurface(id)
    if (id === 'profile') {
      setScope('all')
      setEntityId(null)
      setAddingTab(false)
      setNewTab('')
      setTab(getTabs(profileType)[0])
    }
  }
  function selectKind(k) {
    selectSurface(k === 'entity' ? 'profile' : 'report')
  }
  function selectProfileType(id) {
    setProfileType(id)
    setEntityId(null)
    setAddingTab(false)
    setNewTab('')
    setTab(getTabs(id)[0] || 'Overview')
  }

  return (
    <div className="space-y-6">
      {/* 1. What kind of dashboard — shown FIRST so surface drives context for name suggestion */}
      <div>
        <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">What kind of dashboard?</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StartCard
            selected={kind === 'entity'}
            onClick={() => selectKind('entity')}
            icon={<UserSquare size={20} className="text-aims-blue" />}
            title="Profile dashboard"
            desc="Shows on a contact, account, or employee record — lives in that profile's tabs."
          />
          <StartCard
            selected={kind === 'global'}
            onClick={() => selectKind('global')}
            icon={<LayoutGrid size={20} className="text-aims-blue" />}
            title="Standalone dashboard"
            desc="A report, home, or workspace page — not tied to any single record."
          />
        </div>
      </div>

      {/* 2a. Profile details — only when profile dashboard */}
      {kind === 'global' && (
        <div>
          <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Where should it live?</div>
          <div className="flex flex-wrap gap-2">
            <Chip active={surface === 'report'} onClick={() => selectSurface('report')}>Report collection</Chip>
            <Chip active={surface === 'home'} onClick={() => selectSurface('home')}>Home / Workspace</Chip>
          </div>
        </div>
      )}

      {surface === 'profile' && (
        <div className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-white/10">
          {/* Profile type — visual differentiation via description chips */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">Profile type</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROFILE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectProfileType(t.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-all ${
                    profileType === t.id
                      ? 'border-aims-blue bg-aims-blue/10 text-aims-blue'
                      : 'border-gray-200 text-gray-600 hover:border-aims-blue/40 hover:text-aims-blue dark:border-white/15 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  {t.entityType && <div className="mt-0.5 text-[10px] font-normal opacity-60">{t.entityType}</div>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Apply to</div>
            <div className="flex flex-wrap gap-2">
              <Chip active={scope === 'all'} onClick={() => { setScope('all'); setEntityId(null) }}>Every {currentType.label} profile</Chip>
              <Chip active={scope === 'entity'} onClick={() => setScope('entity')}>A specific {currentType.label}</Chip>
            </div>
            {scope === 'entity' && (
              <select className="input mt-2" value={entityId || ''} onChange={(e) => setEntityId(e.target.value)}>
                <option value="" disabled>Choose a {currentType.label}…</option>
                {entitiesForType.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Tab — collapsed by default to reduce cognitive load */}
          <div>
            <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Tab</div>
            {!tabExpanded ? (
              <button
                onClick={() => setTabExpanded(true)}
                className="flex h-8 items-center gap-2 rounded-full border border-aims-blue/40 bg-aims-blue/5 pl-3 pr-2.5 text-xs font-semibold text-aims-blue transition-colors hover:bg-aims-blue/10"
              >
                {tab}
                <ChevronDown size={13} className="opacity-60" />
              </button>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {allTabs.map((t) => {
                    const custom = !currentType.tabs.includes(t)
                    if (!custom) return <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>
                    const on = tab === t
                    return (
                      <span
                        key={t}
                        className={`inline-flex h-8 items-center gap-1 rounded-full border pl-3 pr-1.5 text-xs font-semibold transition-colors ${
                          on ? 'border-aims-blue bg-aims-blue/10 text-aims-blue' : 'border-gray-300 text-gray-600 dark:border-white/15 dark:text-slate-300'
                        }`}
                      >
                        <button type="button" onClick={() => setTab(t)} className="focus:outline-none">{t}</button>
                        <button
                          type="button"
                          onClick={() => removeCustomTab(t)}
                          aria-label={`Remove ${t} tab`}
                          title={`Remove ${t}`}
                          className="grid h-4 w-4 place-items-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-white/15 dark:hover:text-slate-200"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}

                  {addingTab ? (
                    <input
                      className="input h-8 w-36 text-sm"
                      placeholder="Name + Enter"
                      value={newTab}
                      autoFocus
                      onChange={(e) => setNewTab(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addCustomTab() }
                        if (e.key === 'Escape') { setNewTab(''); setAddingTab(false) }
                      }}
                      onBlur={() => { if (!newTab.trim()) setAddingTab(false) }}
                      aria-label="New tab name"
                    />
                  ) : (
                    <button
                      onClick={() => setAddingTab(true)}
                      className="h-8 rounded-full border border-dashed border-gray-300 px-3 text-xs font-semibold text-gray-500 transition-colors hover:border-aims-blue hover:text-aims-blue dark:border-white/15 dark:text-slate-400"
                    >
                      + New tab
                    </button>
                  )}
                  {addingTab && (
                    <button onClick={() => { setNewTab(''); setAddingTab(false) }} className="btn-ghost h-8 text-xs">Cancel</button>
                  )}
                </div>
                {addingTab ? (
                  <p className="mt-1.5 text-[11px] text-gray-500 dark:text-slate-400">Press Enter to add the tab — picker will close automatically.</p>
                ) : (
                  <button
                    onClick={() => setTabExpanded(false)}
                    className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {surface === 'report' && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <Field label="Report collection">
            <select className="input" value={collection} onChange={(e) => setCollection(e.target.value)}>
              {REPORT_COLLECTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {surface === 'home' && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Home for</div>
          <div className="flex flex-wrap gap-2">
            {HOME_SCOPES.map((h) => (
              <Chip key={h.id} active={homeScope === h.id} onClick={() => setHomeScope(h.id)}>{h.label}</Chip>
            ))}
          </div>
        </div>
      )}

      {/* 3. Audience */}
      <Field label="Audience">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {AUDIENCE_TYPES.map((t) => (
              <Chip key={t.id} active={audType === t.id} onClick={() => selectAudType(t.id)}>{t.label}</Chip>
            ))}
          </div>
          {audType === 'global' ? (
            <p className="text-xs text-gray-500 dark:text-slate-400">{AUDIENCE_TYPES[0].hint} — anyone with access can see this.</p>
          ) : (
            <select className="input" value={audTarget} onChange={(e) => setAudTarget(e.target.value)} aria-label={`Choose ${audType}`}>
              {(AUDIENCE_TARGETS[audType] || []).map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          )}
        </div>
      </Field>

      {/* 4. Name — last, so the suggestion can reflect surface + audience context above */}
      <Field label="Dashboard name">
        <input
          className="input"
          placeholder={suggestedName || 'e.g. Sales — Account 360'}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {name === '' && suggestedName && (
          <button
            type="button"
            onClick={() => setName(suggestedName)}
            className="mt-1.5 flex items-center gap-1.5 text-[11px] text-aims-blue hover:underline"
          >
            <Wand2 size={11} />
            Use "{suggestedName}"
          </button>
        )}
      </Field>

      <div className="alert-info flex items-center gap-2">
        <MapPin size={14} className="shrink-0 text-aims-blue" />
        <span>
          <span className="font-semibold text-aims-blue">Destination:</span> {placementLabel(placement)} · {audienceLabel(audience)}
        </span>
      </div>
    </div>
  )
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 rounded-full border px-3 text-xs font-semibold transition-colors ${
        active
          ? 'border-aims-blue bg-aims-blue/10 text-aims-blue'
          : 'border-gray-300 text-gray-600 hover:text-gray-900 dark:border-white/15 dark:text-slate-300 dark:hover:text-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

export function StartCard({ selected, onClick, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left flex flex-col gap-1 transition-shadow hover:shadow-md ${selected ? 'ring-2 ring-aims-blue border-aims-blue' : ''}`}
    >
      {icon}
      <div className="font-semibold text-gray-900 dark:text-slate-100">{title}</div>
      <div className="text-sm text-gray-500 dark:text-slate-400">{desc}</div>
    </button>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}
