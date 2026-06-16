import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { EXTERNAL_SOURCES, TYPE_LABEL, sourceFields, WIDGET_SIZES } from '../data/mock.js'
import {
  SourcePicker,
  MetricPicker,
  TypeGallery,
  ConfigPanel,
  FormatPanel,
  SectionHeading,
} from '../components/playground/BuilderPanels.jsx'
import WidgetPreview from '../components/playground/WidgetPreview.jsx'
import DataSourceMarketplace from '../components/datasources/DataSourceMarketplace.jsx'

const FRESHNESS_STATUS = { realtime: 'live', '15m': 'fresh', '1h': 'fresh', '24h': 'aging' }
const PREVIEW_WIDTH = { sm: 'max-w-[240px]', md: 'max-w-md', lg: 'max-w-full' }

// About / Best-for per widget type — shown in the preview, mirroring the marketplace detail.
const TYPE_INFO = {
  kpi: { about: 'A single headline metric with its trend.', bestFor: 'At-a-glance status and headline numbers.' },
  line: { about: 'A value over time.', bestFor: 'Spotting trends and momentum.' },
  bar: { about: 'A value compared across categories.', bestFor: 'Comparing groups or stages.' },
  pie: { about: 'A part-to-whole breakdown.', bestFor: 'Showing composition at a glance.' },
  table: { about: 'Row-level records in a table.', bestFor: 'Detailed, row-by-row review.' },
  heatmap: { about: 'A matrix of values across two dimensions.', bestFor: 'Finding hotspots across two dimensions.' },
  scatter: { about: 'The relationship between two variables.', bestFor: 'Correlation and outlier analysis.' },
  carousel: { about: 'Records you can page through one at a time.', bestFor: 'Reviewing records in a compact space.' },
  gauge: { about: 'Progress toward a target or threshold.', bestFor: 'Monitoring against a target in real time.' },
  list: { about: 'A ranked or chronological list.', bestFor: 'Tracking recent items and activity.' },
  summary: { about: 'An AI-written narrative of the data.', bestFor: 'Executive summaries and quick context.' },
  map: { about: 'A geographic distribution of values.', bestFor: 'Comparing performance across regions.' },
}

// S50–S65 — Widget Playground: split-screen build (left) + live preview (right)
export default function WidgetBuilder() {
  const navigate = useNavigate()
  const { addWidget } = useWidgets()

  const [sourceId, setSourceId] = useState(null)
  const [metricId, setMetricId] = useState(null)
  const [typeId, setTypeId] = useState(null)
  const [typeTouched, setTypeTouched] = useState(false)
  const [name, setName] = useState('')
  const [freshness, setFreshness] = useState('15m')
  const [interactiveFilters, setInteractiveFilters] = useState(true)
  const [piiAck, setPiiAck] = useState(false)
  const [ungovernedAck, setUngovernedAck] = useState(false)
  const [saved, setSaved] = useState(false)
  const [browsing, setBrowsing] = useState(false)
  const [previewSize, setPreviewSize] = useState('lg')
  const [format, setFormatState] = useState({ style: 'number', decimals: 0, abbreviate: true, prefix: '', suffix: '' })
  const [goal, setGoalState] = useState({ value: null, direction: 'higher' })
  const setFormat = (patch) => setFormatState((f) => ({ ...f, ...patch }))
  const setGoal = (patch) => setGoalState((g) => ({ ...g, ...patch }))

  const source = EXTERNAL_SOURCES.find((s) => s.id === sourceId) || null
  // A "field" is either an aggregate metric or a row-level record set.
  const metric = sourceFields(source).find((f) => f.id === metricId) || null

  function selectSource(id) {
    if (id === sourceId) return // re-selecting the active source shouldn't wipe the metric/type
    setSourceId(id)
    setMetricId(null)
    setTypeId(null)
    setTypeTouched(false)
  }
  function selectMetric(id) {
    setMetricId(id)
    const m = sourceFields(source).find((x) => x.id === id)
    if (m && !typeTouched) setTypeId(m.recommendedType) // auto-pick recommended
  }
  function selectType(id) {
    setTypeId(id)
    setTypeTouched(true)
  }

  const canSave =
    !!source &&
    !!metric &&
    !!typeId &&
    name.trim().length > 0 &&
    (!source.hasPII || piiAck) &&
    (source.governed || ungovernedAck)

  // Why Save is disabled (first unmet requirement), shown under the preview.
  const saveHint = !source
    ? 'Pick a data source to begin.'
    : !metric
      ? 'Choose a metric or record set.'
      : !typeId
        ? 'Pick a widget type.'
        : name.trim().length === 0
          ? 'Name your widget to save it.'
          : source.hasPII && !piiAck
            ? 'Acknowledge the PII notice to save.'
            : !source.governed && !ungovernedAck
              ? 'Acknowledge the ungoverned source to save.'
              : ''

  function handleSave() {
    addWidget({
      id: `w-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      name: name.trim(),
      skeleton: TYPE_LABEL[typeId],
      metric: metric.name,
      governed: source.governed,
      freshness: FRESHNESS_STATUS[freshness] || 'fresh',
      health: 'unused',
      usedIn: 0,
      source: source.name,
      format,
      goal: goal.value != null ? goal : undefined,
    })
    setSaved(true)
  }

  if (saved) return <SavedConfirmation name={name} navigate={navigate} />

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Playground"
        description="Map a source and metric, pick a widget type, and preview it live."
        actions={
          <>
            <button className="btn-secondary" onClick={() => navigate('/widgets')}>
              Cancel
            </button>
            <button className="btn-primary" disabled={!canSave} onClick={handleSave}>
              <Check size={16} /> Save to catalog
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6 lg:px-8 2xl:px-10 lg:flex-row">
          {/* Left: build */}
          <div className="order-2 w-full space-y-7 lg:order-1 lg:w-1/2 lg:min-w-0">
            <section>
              <SectionHeading n={1} title="Data source" sub="Map from a specific external system or data view." />
              <SourcePicker sourceId={sourceId} onSelect={selectSource} onBrowse={() => setBrowsing(true)} />
            </section>
            <section>
              <SectionHeading n={2} title="Metric" sub="Pick the specific metric this widget shows." />
              <MetricPicker source={source} metricId={metricId} onSelect={selectMetric} />
            </section>
            <section>
              <SectionHeading n={3} title="Widget type" sub="Choose how to visualize it — recommended type is marked." />
              <TypeGallery typeId={typeId} metric={metric} onSelect={selectType} />
            </section>
            <section>
              <SectionHeading n={4} title="Configure" sub="Name, freshness, filters. Permissions are set later, on a dashboard." />
              <ConfigPanel
                source={source}
                name={name}
                setName={setName}
                freshness={freshness}
                setFreshness={setFreshness}
                interactiveFilters={interactiveFilters}
                setInteractiveFilters={setInteractiveFilters}
                piiAck={piiAck}
                setPiiAck={setPiiAck}
                ungovernedAck={ungovernedAck}
                setUngovernedAck={setUngovernedAck}
              />
            </section>
            <section>
              <SectionHeading n={5} title="Format & display" sub="Number format, units, and a goal with conditional color." />
              <FormatPanel format={format} setFormat={setFormat} goal={goal} setGoal={setGoal} />
            </section>
          </div>

          {/* Right: live preview */}
          <div className="order-1 min-w-0 lg:order-2 lg:w-1/2">
            <div className="lg:sticky lg:top-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">Live preview</span>
                {typeId && (
                  <div className="flex overflow-hidden rounded-lg border border-gray-300 text-xs dark:border-white/15">
                    {WIDGET_SIZES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setPreviewSize(s.id)}
                        className={`px-2.5 py-1 font-medium transition-colors ${
                          previewSize === s.id ? 'bg-aims-blue text-white' : 'text-gray-600 dark:text-slate-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={`mx-auto transition-all ${PREVIEW_WIDTH[previewSize]}`}>
                <WidgetPreview
                  typeId={typeId}
                  metric={metric}
                  source={source}
                  name={name}
                  freshness={FRESHNESS_STATUS[freshness] || 'fresh'}
                  display={{ format, goal }}
                />
              </div>
              {typeId && (
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-slate-400">
                  {WIDGET_SIZES.find((s) => s.id === previewSize)?.width} · {WIDGET_SIZES.find((s) => s.id === previewSize)?.detail}
                </p>
              )}

              {typeId && TYPE_INFO[typeId] && (
                <div className="mt-4 space-y-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">About this widget</div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{TYPE_INFO[typeId].about}</p>
                  </div>
                  <div className="rounded-lg border border-aims-blue/30 bg-aims-blue/5 p-3 dark:bg-aims-blue/10">
                    <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">Best for</div>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-slate-300">{TYPE_INFO[typeId].bestFor}</p>
                  </div>
                </div>
              )}

              {!canSave && (
                <p className="mt-3 text-center text-[11px] text-gray-500 dark:text-slate-400">{saveHint}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {browsing && (
        <DataSourceMarketplace
          currentSourceId={sourceId}
          onSelect={selectSource}
          onClose={() => setBrowsing(false)}
        />
      )}
    </div>
  )
}

function SavedConfirmation({ name, navigate }) {
  return (
    <div className="h-full grid place-items-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/25 dark:bg-green-500/10">
          <Check size={28} className="text-aims-governed" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Saved to catalog</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          “{name || 'Untitled widget'}” is now in the Widget Library. Set permissions when you place it on a dashboard.
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
