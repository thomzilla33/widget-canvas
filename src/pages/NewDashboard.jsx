import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, ChevronRight, LayoutGrid, Sparkles, Check, MapPin } from 'lucide-react'
import { PageHeader, StepIndicator } from '../components/common/index.jsx'
import { Button } from '@/components/ui/Button'
import PlacementForm, { StartCard, overlaps, placeKey } from '../components/dashboard/PlacementForm.jsx'
import { DescribeComposer } from '../components/common/DescribeComposer.jsx'
import { useDashboards } from '../state/DashboardsContext.jsx'
import { dashboardTemplates, TEMPLATE_SEED, placementLabel } from '../data/mock.js'
import { describeDashboard } from '../data/describe.js'
import { audienceKey, audienceLabel } from '../data/audiences.js'

const DEFAULT_SEED = { name: '', audience: 'Sales Agent', placement: { surface: 'profile', profileType: 'Company', scope: 'all', entityId: null, entityName: null, tab: 'Overview' } }

const STEPS = ['Placement', 'Start point']

// Step titles + descriptions — make each step feel focused.
const STEP_COPY = [
  { title: 'New dashboard', desc: 'Choose where this dashboard lives and who it\'s for.' },
  { title: 'Choose a starting point', desc: 'Start from a blank canvas or jump-start with a pre-built layout.' },
]

// S80, S81, S82, S96 — placement (where the dashboard lives) + conflict + start point
export default function NewDashboard() {
  const navigate = useNavigate()
  const { dashboards, addDashboard } = useDashboards()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ ...DEFAULT_SEED, valid: false })
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [seedKey, setSeedKey] = useState(0)

  const [startMode, setStartMode] = useState('template')
  const [templateId, setTemplateId] = useState(dashboardTemplates[0]?.id ?? null)
  const [overrodeConflict, setOverrodeConflict] = useState(false)

  function applyDescription(text) {
    const r = describeDashboard(text)
    if (!r) return false
    setSeed({ name: r.name, audience: r.audience, placement: r.placement })
    setSeedKey((k) => k + 1)
    setStartMode('template')
    setTemplateId(r.templateId)
    return true
  }

  const placement = form.placement
  const myKey = placeKey(placement, form.audience)

  const conflict = dashboards.find((d) => audienceKey(d.audience) === audienceKey(form.audience) && overlaps(d.placement, placement))

  useEffect(() => {
    setOverrodeConflict(false)
  }, [myKey])

  const canNext =
    step === 0
      ? form.valid && (!conflict || overrodeConflict)
      : startMode === 'blank' || (startMode === 'template' && !!templateId)

  // Inline hint telling the user exactly what's blocking the Next/Create button.
  const blockingHint =
    step === 0 && !canNext
      ? form.name === ''
        ? 'Name your dashboard to continue'
        : !form.valid
          ? 'Complete placement settings to continue'
          : conflict && !overrodeConflict
            ? 'Resolve the destination conflict above'
            : ''
      : ''

  function create() {
    const id = `d-${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    const template = startMode === 'template' ? templateId : null
    const seedCount = template ? (TEMPLATE_SEED[template]?.length ?? 0) : 0
    const entity = placement.surface === 'profile' ? placement.profileType : placement.surface === 'report' ? 'Report' : 'Home'
    addDashboard({
      id,
      template,
      name: form.name,
      entity,
      audience: form.audience,
      placement,
      status: 'draft',
      widgets: seedCount,
      updated: 'just now',
    })
    navigate(`/dashboard/${id}/canvas`)
  }

  const { title, desc } = STEP_COPY[step]

  return (
    <div className="h-full flex flex-col">
      {/* Single-cancel header — footer handles Back/Cancel so no duplicate here */}
      <PageHeader title={title} description={desc} />

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Lightweight step indicator inline with the form content */}
          <StepIndicator steps={STEPS} current={step} />

          {step === 0 ? (
            <>
              <DescribeComposer
                placeholder="e.g. Support health dashboard for managers"
                examples={['Account 360 for sales', 'Support health for managers', 'Executive revenue report', 'Team home for sales']}
                onGenerate={applyDescription}
              />
              <PlacementForm key={seedKey} initial={seed} onChange={setForm} />

              {conflict && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-aims-ungoverned mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">A dashboard already lives here</div>
                      <div className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                        "{conflict.name}" ({conflict.status}) already targets {placementLabel(conflict.placement)} · {audienceLabel(conflict.audience)}. Creating another may cause overlap.
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button variant="secondary" onClick={() => navigate(`/dashboard/${conflict.id}/canvas`)}>View existing</Button>
                        <Button variant="secondary" className={overrodeConflict ? 'text-aims-governed' : ''} onClick={() => setOverrodeConflict(true)}>
                          {overrodeConflict ? (<><Check size={15} /> Will create anyway</>) : 'Create anyway'}
                        </Button>
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
                        className={`card w-full p-3 text-left transition-shadow hover:shadow-md ${templateId === t.id ? 'ring-2 ring-aims-blue border-aims-blue' : ''}`}
                      >
                        <div className="font-semibold text-sm text-gray-900 dark:text-slate-100">{t.name}</div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Footer nav — single Cancel/Back here; no duplicate in the header */}
      <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1629] px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => (step === 0 ? navigate('/dashboards') : setStep(0))}>
            <ChevronLeft size={16} />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex flex-col items-end gap-1">
            {step === 0 ? (
              <Button variant="primary" disabled={!canNext} onClick={() => setStep(1)}>
                Next: Start point
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button variant="primary" disabled={!canNext} onClick={create}>
                <Check size={16} />
                Create dashboard
              </Button>
            )}
            {blockingHint && (
              <p className="text-[11px] text-gray-400 dark:text-slate-500">{blockingHint}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
