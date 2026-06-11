import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, ChevronRight, LayoutGrid, Sparkles, Check } from 'lucide-react'
import { PageHeader, StepIndicator } from '../components/common/index.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { entityTypes, audiences, dashboardTemplates } from '../data/mock.js'

const STEPS = ['Entity & audience', 'Start point']

// S80, S81, S82, S96 — entity + audience + conflict + start point
export default function NewDashboard() {
  const navigate = useNavigate()
  const { dashboards, addDashboard } = useDashboards()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [entity, setEntity] = useState('Account')
  const [audience, setAudience] = useState('Sales Agent')
  const [startMode, setStartMode] = useState('blank') // 'blank' | 'template'
  const [templateId, setTemplateId] = useState(null)
  const [overrodeConflict, setOverrodeConflict] = useState(false)

  // S96 — conflict: a dashboard already exists for this entity + audience
  const conflict = dashboards.find((d) => d.entity === entity && d.audience === audience)

  const canNext =
    step === 0
      ? name.trim().length > 0 && (!conflict || overrodeConflict)
      : startMode === 'blank' || (startMode === 'template' && !!templateId)

  function create() {
    const id = `d-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${name.length}`
    addDashboard({
      id,
      name: name.trim(),
      entity,
      audience,
      status: 'draft',
      widgets: 0,
      updated: 'just now',
    })
    navigate(`/dashboard/${id}/canvas`)
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="New dashboard"
        description="Choose the entity and audience, then start from a blank canvas or an AIMS template."
        breadcrumb="Dashboards / New"
        actions={
          <button className="btn-secondary" onClick={() => navigate('/dashboards')}>
            Cancel
          </button>
        }
      />

      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white">
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

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Entity">
                  <select className="input" value={entity} onChange={(e) => setEntity(e.target.value)}>
                    {entityTypes.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Audience">
                  <select
                    className="input"
                    value={audience}
                    onChange={(e) => {
                      setAudience(e.target.value)
                      setOverrodeConflict(false)
                    }}
                  >
                    {audiences.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {conflict && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-aims-ungoverned mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        A dashboard already targets {entity} · {audience}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600 dark:text-slate-300">
                        “{conflict.name}” ({conflict.status}) already serves this audience. Creating
                        another may cause overlap.
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          className="btn-secondary"
                          onClick={() => navigate(`/dashboard/${conflict.id}/canvas`)}
                        >
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
            </>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-gray-200 dark:border-white/10 bg-white px-6 py-3 flex items-center justify-between">
        <button
          className="btn-secondary"
          onClick={() => (step === 0 ? navigate('/dashboards') : setStep(0))}
        >
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
