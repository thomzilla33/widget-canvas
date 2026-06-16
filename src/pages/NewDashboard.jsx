import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  Check,
  UserSquare,
  FileBarChart,
  Home,
  MapPin,
} from 'lucide-react'
import { PageHeader, StepIndicator } from '../components/common/index.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import {
  entities,
  audiences,
  dashboardTemplates,
  TEMPLATE_SEED,
  PLACEMENT_SURFACES,
  PROFILE_TYPES,
  REPORT_COLLECTIONS,
  HOME_SCOPES,
  placementLabel,
} from '../data/mock.js'

const STEPS = ['Placement', 'Start point']
const SURFACE_ICONS = { UserSquare, FileBarChart, Home }

// Stable signature for a placement + audience — used to detect when the
// destination changed (to reset the conflict override).
function placeKey(p, audience) {
  if (!p) return ''
  if (p.surface === 'report') return `report|${p.collection}|${audience}`
  if (p.surface === 'home') return `home|${p.homeScope}|${audience}`
  return `profile|${p.profileType}|${p.scope}|${p.entityId || 'all'}|${p.tab}|${audience}`
}

// True if two placements would surface the same dashboard slot. For profiles, a
// type-wide ('all') placement overlaps every specific entity on the same tab.
function overlaps(a, b) {
  if (!a || !b || a.surface !== b.surface) return false
  if (a.surface === 'report') return a.collection === b.collection
  if (a.surface === 'home') return a.homeScope === b.homeScope
  if (a.profileType !== b.profileType || a.tab !== b.tab) return false
  if (a.scope === 'all' || b.scope === 'all') return true
  return a.entityId === b.entityId
}

// S80, S81, S82, S96 — placement (where the dashboard lives) + conflict + start point
export default function NewDashboard() {
  const navigate = useNavigate()
  const { dashboards, addDashboard } = useDashboards()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [audience, setAudience] = useState('Sales Agent')

  // Placement
  const [surface, setSurface] = useState('profile')
  const [profileType, setProfileType] = useState('Company')
  const [scope, setScope] = useState('all') // 'all' | 'entity'
  const [entityId, setEntityId] = useState(null)
  const [tab, setTab] = useState('Overview')
  const [addingTab, setAddingTab] = useState(false)
  const [collection, setCollection] = useState(REPORT_COLLECTIONS[0])
  const [homeScope, setHomeScope] = useState('personal')

  const [startMode, setStartMode] = useState('blank')
  const [templateId, setTemplateId] = useState(null)
  const [overrodeConflict, setOverrodeConflict] = useState(false)

  const currentType = PROFILE_TYPES.find((t) => t.id === profileType) || PROFILE_TYPES[0]
  const entitiesForType = entities.filter((e) => e.type === currentType.entityType)

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
  const myKey = placeKey(placement, audience)

  // S96 — conflict: another dashboard for the same audience overlaps this destination.
  const conflict = dashboards.find((d) => d.audience === audience && overlaps(d.placement, placement))

  // Reset the override whenever the destination changes.
  useEffect(() => {
    setOverrodeConflict(false)
  }, [myKey])

  const placementValid =
    surface === 'profile'
      ? !!profileType && !!tab.trim() && (scope === 'all' || !!entityId)
      : surface === 'report'
        ? !!collection
        : !!homeScope

  const canNext =
    step === 0
      ? name.trim().length > 0 && placementValid && (!conflict || overrodeConflict)
      : startMode === 'blank' || (startMode === 'template' && !!templateId)

  function selectSurface(id) {
    setSurface(id)
    if (id === 'profile') {
      setScope('all')
      setEntityId(null)
      setAddingTab(false)
      setTab(currentType.tabs[0])
    }
  }

  function selectProfileType(id) {
    const t = PROFILE_TYPES.find((x) => x.id === id)
    setProfileType(id)
    setEntityId(null)
    setAddingTab(false)
    setTab(t?.tabs[0] || 'Overview')
  }

  function create() {
    const id = `d-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    const template = startMode === 'template' ? templateId : null
    const seedCount = template ? (TEMPLATE_SEED[template]?.length ?? 0) : 0
    const place = buildPlacement()
    const entity = surface === 'profile' ? profileType : surface === 'report' ? 'Report' : 'Home'
    addDashboard({
      id,
      template,
      name: name.trim(),
      entity,
      audience,
      placement: place,
      status: 'draft',
      widgets: seedCount,
      updated: 'just now',
    })
    navigate(`/dashboard/${id}/canvas`)
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="New dashboard"
        description="Choose where this dashboard lives, then start from a blank canvas or an AIMS template."
        actions={
          <button className="btn-secondary" onClick={() => navigate('/dashboards')}>
            Cancel
          </button>
        }
      />

      <div className="shrink-0 px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1629]">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {step === 0 ? (
            <>
              <Field label="Dashboard name">
                <input
                  className="input"
                  placeholder="e.g. Sales — Account 360"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <div>
                <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Where should this dashboard live?</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PLACEMENT_SURFACES.map((s) => {
                    const Icon = SURFACE_ICONS[s.iconName] || LayoutGrid
                    return (
                      <StartCard
                        key={s.id}
                        selected={surface === s.id}
                        onClick={() => selectSurface(s.id)}
                        icon={<Icon size={20} className="text-aims-blue" />}
                        title={s.label}
                        desc={s.desc}
                      />
                    )
                  })}
                </div>
              </div>

              {surface === 'profile' && (
                <div className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-white/10">
                  <div>
                    <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Profile type</div>
                    <div className="flex flex-wrap gap-2">
                      {PROFILE_TYPES.map((t) => (
                        <Chip key={t.id} active={profileType === t.id} onClick={() => selectProfileType(t.id)}>
                          {t.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Apply to</div>
                    <div className="flex flex-wrap gap-2">
                      <Chip active={scope === 'all'} onClick={() => { setScope('all'); setEntityId(null) }}>
                        Every {currentType.label} profile
                      </Chip>
                      <Chip active={scope === 'entity'} onClick={() => setScope('entity')}>
                        A specific {currentType.label}
                      </Chip>
                    </div>
                    {scope === 'entity' && (
                      <select className="input mt-2" value={entityId || ''} onChange={(e) => setEntityId(e.target.value)}>
                        <option value="" disabled>
                          Choose a {currentType.label}…
                        </option>
                        {entitiesForType.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Tab</div>
                    {addingTab ? (
                      <div className="flex gap-2">
                        <input
                          className="input"
                          placeholder="New tab name…"
                          value={tab}
                          onChange={(e) => setTab(e.target.value)}
                          autoFocus
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => { setAddingTab(false); setTab(currentType.tabs[0]) }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {currentType.tabs.map((t) => (
                          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
                            {t}
                          </Chip>
                        ))}
                        <button
                          onClick={() => { setAddingTab(true); setTab('') }}
                          className="h-8 rounded-full border border-dashed border-gray-300 px-3 text-xs font-semibold text-gray-500 transition-colors hover:border-aims-blue hover:text-aims-blue dark:border-white/15 dark:text-slate-400"
                        >
                          + New tab
                        </button>
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
                        <option key={c} value={c}>
                          {c}
                        </option>
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
                      <Chip key={h.id} active={homeScope === h.id} onClick={() => setHomeScope(h.id)}>
                        {h.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              <Field label="Audience">
                <select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>
                  {audiences.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Live destination preview */}
              <div className="alert-info flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-aims-blue" />
                <span>
                  <span className="font-semibold text-aims-blue">Destination:</span> {placementLabel(placement)} · {audience}
                </span>
              </div>

              {conflict && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-aims-ungoverned mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        A dashboard already lives here
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                        “{conflict.name}” ({conflict.status}) already targets {placementLabel(conflict.placement)} · {conflict.audience}. Creating another may cause overlap.
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="btn-secondary" onClick={() => navigate(`/dashboard/${conflict.id}/canvas`)}>
                          View existing
                        </button>
                        <button
                          className={`btn-secondary ${overrodeConflict ? 'text-aims-governed' : ''}`}
                          onClick={() => setOverrodeConflict(true)}
                        >
                          {overrodeConflict ? (
                            <>
                              <Check size={15} /> Will create anyway
                            </>
                          ) : (
                            'Create anyway'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <StartCard
                  selected={startMode === 'blank'}
                  onClick={() => setStartMode('blank')}
                  icon={<LayoutGrid size={20} className="text-aims-blue" />}
                  title="Blank canvas"
                  desc="Start empty and place widgets yourself."
                />
                <StartCard
                  selected={startMode === 'template'}
                  onClick={() => setStartMode('template')}
                  icon={<Sparkles size={20} className="text-aims-blue" />}
                  title="From an AIMS template"
                  desc="Start from a pre-built layout you can adjust."
                />
              </div>

              {startMode === 'template' && (
                <div>
                  <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Pick a template</div>
                  <div className="space-y-2">
                    {dashboardTemplates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplateId(t.id)}
                        className={`card w-full p-3 text-left transition-shadow hover:shadow-md ${
                          templateId === t.id ? 'ring-2 ring-aims-blue border-aims-blue' : ''
                        }`}
                      >
                        <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">{t.name}</div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Destination recap on the final step */}
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-white/10">
                <MapPin size={14} className="shrink-0 text-gray-500 dark:text-slate-400" />
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  Will be created in <span className="font-medium text-gray-700 dark:text-slate-200">{placementLabel(placement)}</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1629] px-4 md:px-6 py-3 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => (step === 0 ? navigate('/dashboards') : setStep(0))}>
          <ChevronLeft size={16} />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step === 0 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(1)}>
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-primary" disabled={!canNext} onClick={create}>
            <Check size={16} />
            Create dashboard
          </button>
        )}
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
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

function StartCard({ selected, onClick, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left flex flex-col gap-1 transition-shadow hover:shadow-md ${
        selected ? 'ring-2 ring-aims-blue border-aims-blue' : ''
      }`}
    >
      {icon}
      <div className="font-semibold text-gray-900 dark:text-slate-100">{title}</div>
      <div className="text-sm text-gray-500 dark:text-slate-400">{desc}</div>
    </button>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}
