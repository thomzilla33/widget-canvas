import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, Lock } from 'lucide-react'
import {
  PageHeader,
  StepIndicator,
  GovernedBadge,
  FreshnessBadge,
} from '../components/common/index.jsx'
import { intents, dataSources, skeletons } from '../data/mock.js'
import { useWidgets } from '../state/WidgetsContext.jsx'

const FRESHNESS_STATUS = { realtime: 'live', '15m': 'fresh', '1h': 'fresh', '24h': 'aging' }

const STEPS = ['Intent', 'Source', 'Skeleton', 'Binding', 'Preview']
const MOCK_FIELDS = [
  'Account name',
  'Revenue',
  'Open tickets',
  'NPS score',
  'Region',
  'Owner',
  'Created date',
  'Stage',
]
const FRESHNESS_OPTIONS = [
  { value: 'realtime', label: 'Real-time (Live)' },
  { value: '15m', label: 'Fresh within 15 min' },
  { value: '1h', label: 'Fresh within 1 hour' },
  { value: '24h', label: 'Fresh within 24 hours' },
]

// S50–S65 — 5-step Widget Builder wizard
export default function WidgetBuilder() {
  const navigate = useNavigate()
  const { addWidget } = useWidgets()
  const [step, setStep] = useState(0)
  const [intentId, setIntentId] = useState(null)
  const [sourceId, setSourceId] = useState(null)
  const [skeletonId, setSkeletonId] = useState(null)
  const [name, setName] = useState('')
  const [piiAck, setPiiAck] = useState(false)
  const [ungovernedAck, setUngovernedAck] = useState(false)
  const [freshness, setFreshness] = useState('15m')
  const [interactiveFilters, setInteractiveFilters] = useState(true)
  const [saved, setSaved] = useState(false)

  const intent = intents.find((i) => i.id === intentId)
  const source = dataSources.find((s) => s.id === sourceId)
  const skeleton = skeletons.find((s) => s.id === skeletonId)
  const compatible = intent ? intent.skeletons : []

  // Per-step gate
  const canNext = (() => {
    if (step === 0) return !!intentId
    if (step === 1) return !!sourceId
    if (step === 2) return !!skeletonId
    if (step === 3) {
      if (source?.hasPII && !piiAck) return false
      if (source && !source.governed && !ungovernedAck) return false
      return name.trim().length > 0
    }
    return true
  })()

  // Reset skeleton if it becomes incompatible after changing intent
  function selectIntent(id) {
    setIntentId(id)
    const next = intents.find((i) => i.id === id)
    if (skeletonId && !next.skeletons.includes(skeletonId)) setSkeletonId(null)
  }

  function handleSave() {
    addWidget({
      id: `w-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      name: name.trim(),
      skeleton: skeleton?.name || 'KPI',
      governed: !!source?.governed,
      freshness: FRESHNESS_STATUS[freshness] || 'fresh',
      health: 'unused', // not in any dashboard yet
      usedIn: 0,
      source: source?.name || '',
    })
    setSaved(true)
  }

  if (saved) return <SavedConfirmation name={name} navigate={navigate} />

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Builder"
        description="Build a reusable widget. Permissions are set later, when it's placed on a dashboard."
        actions={
          <button className="btn-secondary" onClick={() => navigate('/widgets')}>
            Cancel
          </button>
        }
      />

      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1629]">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {step === 0 && <StepIntent intentId={intentId} onSelect={selectIntent} />}
          {step === 1 && <StepSource sourceId={sourceId} onSelect={setSourceId} />}
          {step === 2 && (
            <StepSkeleton
              skeletonId={skeletonId}
              compatible={compatible}
              intentLabel={intent?.label}
              onSelect={setSkeletonId}
            />
          )}
          {step === 3 && (
            <StepBinding
              skeleton={skeleton}
              source={source}
              name={name}
              setName={setName}
              piiAck={piiAck}
              setPiiAck={setPiiAck}
              ungovernedAck={ungovernedAck}
              setUngovernedAck={setUngovernedAck}
              freshness={freshness}
              setFreshness={setFreshness}
              interactiveFilters={interactiveFilters}
              setInteractiveFilters={setInteractiveFilters}
            />
          )}
          {step === 4 && (
            <StepPreview name={name} source={source} skeleton={skeleton} freshness={freshness} />
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1629] px-6 py-3 flex items-center justify-between">
        <button
          className="btn-secondary"
          onClick={() => (step === 0 ? navigate('/widgets') : setStep(step - 1))}
        >
          <ChevronLeft size={16} />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSave}>
            <Check size={16} />
            Save to catalog
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Step 1 — Intent (S50) ── */
function StepIntent({ intentId, onSelect }) {
  return (
    <div>
      <StepHeading title="What question should this widget answer?" sub="Pick the intent — it determines which widget skeletons are available." />
      <div className="grid gap-3 sm:grid-cols-2">
        {intents.map((i) => (
          <SelectCard key={i.id} selected={intentId === i.id} onClick={() => onSelect(i.id)}>
            <div className="text-2xl">{i.icon}</div>
            <div className="font-semibold text-gray-900 dark:text-slate-100">{i.label}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{i.desc}</div>
          </SelectCard>
        ))}
      </div>
    </div>
  )
}

/* ── Step 2 — Source picker (S51, S52) ── */
function StepSource({ sourceId, onSelect }) {
  return (
    <div>
      <StepHeading title="Where does the data come from?" sub="Each widget uses one source only. Governed sources come from an approved Data View; ungoverned metrics are computed here." />
      <div className="space-y-2">
        {dataSources.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`card w-full p-4 text-left flex items-start gap-3 transition-shadow hover:shadow-md ${
              sourceId === s.id ? 'ring-2 ring-aims-blue border-aims-blue' : ''
            }`}
          >
            <div className="mt-0.5">
              {s.governed ? (
                <ShieldCheck size={20} className="text-aims-governed" />
              ) : (
                <ShieldAlert size={20} className="text-aims-ungoverned" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-slate-100">{s.name}</span>
                <GovernedBadge governed={s.governed} />
                {s.hasPII && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    <Lock size={11} /> Contains PII
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Owner: {s.owner}
                {s.reviewed ? ` · Last reviewed ${s.reviewed}` : ' · Not formally reviewed'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Step 3 — Skeleton picker (S53, S54) ── */
function StepSkeleton({ skeletonId, compatible, intentLabel, onSelect }) {
  return (
    <div>
      <StepHeading title="Choose a widget skeleton" sub="The skeleton fixes the maximum anatomy — you can't add more fields than it allows. Greyed skeletons don't fit your intent." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {skeletons.map((s) => {
          const ok = compatible.includes(s.id)
          return (
            <button
              key={s.id}
              disabled={!ok}
              title={ok ? s.desc : `Not compatible with "${intentLabel}"`}
              onClick={() => ok && onSelect(s.id)}
              className={`card p-4 text-left flex flex-col gap-1 transition-shadow ${
                !ok
                  ? 'opacity-40 cursor-not-allowed'
                  : skeletonId === s.id
                    ? 'ring-2 ring-aims-blue border-aims-blue'
                    : 'hover:shadow-md'
              }`}
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-slate-100">{s.name}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{s.desc}</div>
              <div className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">Max {s.maxFields} fields</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Step 4 — Field binding + acks + filters + freshness (S55–S61) ── */
function StepBinding({
  skeleton,
  source,
  name,
  setName,
  piiAck,
  setPiiAck,
  ungovernedAck,
  setUngovernedAck,
  freshness,
  setFreshness,
  interactiveFilters,
  setInteractiveFilters,
}) {
  const slots = Array.from({ length: skeleton?.maxFields || 3 })
  return (
    <div className="space-y-6">
      <StepHeading title="Bind fields and configure" sub={`Bind data to the ${skeleton?.name} skeleton (up to ${skeleton?.maxFields} fields).`} />

      <Field label="Widget name">
        <input
          className="input"
          placeholder="e.g. Total Revenue"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Field binding">
        <div className="space-y-2">
          {slots.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-slate-500 w-14">Field {i + 1}</span>
              <select className="input" defaultValue="">
                <option value="" disabled>
                  Select a field…
                </option>
                {MOCK_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Field>

      {source?.hasPII && (
        <AckBox
          checked={piiAck}
          onChange={setPiiAck}
          tone="amber"
          title="This source contains PII"
          body="Personal data will be masked by default in previews and for users without explicit access. Acknowledge to continue."
        />
      )}

      {source && !source.governed && (
        <AckBox
          checked={ungovernedAck}
          onChange={setUngovernedAck}
          tone="amber"
          title="Ungoverned metric"
          body="This metric is computed here, not from an approved Data View. It will carry an Ungoverned badge wherever it appears."
        />
      )}

      <Field label="Interactive filters">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={interactiveFilters}
            onChange={(e) => setInteractiveFilters(e.target.checked)}
          />
          Let end users filter this widget (date range, category)
        </label>
      </Field>

      <Field label="Freshness threshold">
        <select className="input max-w-xs" value={freshness} onChange={(e) => setFreshness(e.target.value)}>
          {FRESHNESS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

/* ── Step 5 — Preview (S62–S64) ── */
function StepPreview({ name, source, skeleton, freshness }) {
  const fresh = freshness === 'realtime' ? 'live' : 'fresh'
  return (
    <div>
      <StepHeading title="Preview" sub="This is how the widget will appear. Permissions are applied later, on a dashboard." />
      <div className="card p-5 max-w-md">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-gray-900 dark:text-slate-100">{name || 'Untitled widget'}</span>
          <GovernedBadge governed={!!source?.governed} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-slate-500">{skeleton?.name} · {source?.name}</span>
          <FreshnessBadge status={fresh} label={fresh === 'live' ? 'Live' : 'Fresh'} />
        </div>
        <div className="mt-4 h-28 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 grid place-items-center text-sm text-gray-400 dark:text-slate-500">
          {skeleton?.icon} {skeleton?.name} preview
        </div>
        {source?.hasPII && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <Lock size={12} /> PII fields are masked by default
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Saved confirmation (S65) ── */
function SavedConfirmation({ name, navigate }) {
  return (
    <div className="h-full grid place-items-center px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 grid place-items-center">
          <Check size={28} className="text-aims-governed" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Saved to catalog</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          “{name || 'Untitled widget'}” is now in the Widget Library. Set permissions when you place it
          on a dashboard.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button className="btn-secondary" onClick={() => navigate('/widgets')}>
            Back to library
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboards')}>
            Place on a dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Small shared bits ── */
function StepHeading({ title, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
      {sub && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{sub}</p>}
    </div>
  )
}

function SelectCard({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left flex flex-col gap-1 transition-shadow hover:shadow-md ${
        selected ? 'ring-2 ring-aims-blue border-aims-blue' : ''
      }`}
    >
      {children}
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

function AckBox({ checked, onChange, tone, title, body }) {
  const toneCls =
    tone === 'amber' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25' : 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10'
  return (
    <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${toneCls}`}>
      <input
        type="checkbox"
        className="mt-0.5"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</span>
        <span className="block text-xs text-gray-600 dark:text-slate-300 mt-0.5">{body}</span>
      </span>
    </label>
  )
}
