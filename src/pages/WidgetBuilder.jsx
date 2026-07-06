import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check, ExternalLink, RefreshCw } from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { Button } from '@/components/ui/Button'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { EXTERNAL_SOURCES, TYPE_LABEL, sourceFields, WIDGET_SIZES } from '../data/mock.js'
import { MODEL_ENTITIES, entityById } from '../data/entities.js'
import { dimensionById, recommendTile } from '../data/fields.js'
import { describeWidget } from '../data/describe.js'
import { DescribeComposer } from '../components/common/DescribeComposer.jsx'
import {
  SlotPanel,
  TransformPanel,
  TypeGallery,
  ConfigPanel,
  FormatPanel,
  AppearancePanel,
  SectionHeading,
  AckBox,
  FRESHNESS_OPTIONS,
} from '../components/playground/BuilderPanels.jsx'
import DatasetStep from '../components/playground/DatasetStep.jsx'
import WidgetPreview from '../components/playground/WidgetPreview.jsx'
import DataSourceMarketplace from '../components/datasources/DataSourceMarketplace.jsx'
import { COMPATIBLE_SKELETONS, ENTITY_SOURCES } from '../data/datasets.js'

const FRESHNESS_STATUS = { realtime: 'live', '15m': 'fresh', '1h': 'fresh', '24h': 'aging' }
const PREVIEW_WIDTH = { sm: 'max-w-[240px]', md: 'max-w-md', lg: 'max-w-full' }

const FORMAT_TYPES = new Set(['kpi', 'gauge', 'statrow', 'costkpi'])
const GOAL_TYPES = new Set(['kpi', 'gauge', 'statrow'])

const TYPE_INFO = {
  kpi: { about: 'A single headline metric with its trend.', bestFor: 'At-a-glance status and headline numbers.' },
  line: { about: 'A value over time.', bestFor: 'Spotting trends and momentum.' },
  bar: { about: 'A value compared across categories.', bestFor: 'Comparing groups or stages.' },
  pie: { about: 'A part-to-whole breakdown.', bestFor: 'Showing composition at a glance.' },
  table: { about: 'Row-level records in a sortable table.', bestFor: 'Detailed, row-by-row review with column control.' },
  'record-card': { about: 'A profile card for a single entity record.', bestFor: 'UCPs and EPUs — show the key fields of one record.' },
  heatmap: { about: 'A matrix of values across two dimensions.', bestFor: 'Finding hotspots across two dimensions.' },
  scatter: { about: 'The relationship between two variables.', bestFor: 'Correlation and outlier analysis.' },
  carousel: { about: 'Records you can page through one at a time.', bestFor: 'Reviewing records in a compact space.' },
  gauge: { about: 'Progress toward a target or threshold.', bestFor: 'Monitoring against a target in real time.' },
  list: { about: 'A ranked or chronological list.', bestFor: 'Tracking recent items and activity.' },
  summary: { about: 'An AI-written narrative of the data.', bestFor: 'Executive summaries and quick context.' },
  map: { about: 'A geographic distribution of values.', bestFor: 'Comparing performance across regions.' },
  costkpi: { about: 'A consumption total with its month-over-month change and trend.', bestFor: 'Tracking spend (credits/tokens/cost) against last month.' },
  usageheatmap: { about: 'A daily activity calendar with current and longest streaks.', bestFor: 'Seeing the cadence of agent/workflow activity over time.' },
  spendbreakdown: { about: 'Ranked share of consumption by agent, workflow, or source.', bestFor: 'Understanding what is driving consumption and cost.' },
  compositestat: { about: 'A headline total broken into the components that make it up.', bestFor: 'Showing a total and its mix in one tile.' },
}

// Resolve a source from either the entity model or EXTERNAL_SOURCES (legacy / describe flow)
function resolveSource(sourceId) {
  if (!sourceId) return null
  return MODEL_ENTITIES.find((e) => e.id === sourceId) || EXTERNAL_SOURCES.find((s) => s.id === sourceId) || null
}

export default function WidgetBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addWidget } = useWidgets()

  // Tab: 'data' | 'widget' | 'appearance'
  const [tab, setTab] = useState('data')

  // Dataset config (replaces sourceId + metricId + dimensionId + transform)
  const [datasetConfig, setDatasetConfig] = useState(null)

  const [sourceId, setSourceId] = useState(null)
  const [metricId, setMetricId] = useState(null)
  const [dimensionId, setDimensionId] = useState('none')
  const [transform, setTransform] = useState('none')
  const [aggregation, setAggregation] = useState('sum')
  const [typeId, setTypeId] = useState(null)
  const [typeTouched, setTypeTouched] = useState(false)
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [freshness, setFreshness] = useState('15m')
  const [interactiveFilters, setInteractiveFilters] = useState(true)
  const [piiAck, setPiiAck] = useState(false)
  const [ungovernedAck, setUngovernedAck] = useState(false)
  const [saved, setSaved] = useState(null) // null | widgetId string
  const [previewSize, setPreviewSize] = useState('lg')

  // Format & goal (KPI/Gauge/StatRow appearance)
  const [format, setFormatState] = useState({ style: 'auto', decimals: 0, abbreviate: true, prefix: '', suffix: '' })
  const [goal, setGoalState] = useState({ value: null, direction: 'higher' })
  const setFormat = (patch) => setFormatState((f) => ({ ...f, ...patch }))
  const setGoal = (patch) => setGoalState((g) => ({ ...g, ...patch }))

  // Appearance — look & feel
  const [accentColor, setAccentColor] = useState('')
  const [styleVariant, setStyleVariant] = useState('')
  const [displayOptions, setDisplayOptions] = useState({})

  // Appearance config for data-display widget types
  const [tableConfig, setTableConfig] = useState({ sortField: '', sortDir: 'desc', pageSize: 25, searchable: true, hiddenColumns: [] })
  const [listConfig, setListConfig] = useState({ sortField: '', maxItems: 10, showTimestamp: true })
  const [cardConfig, setCardConfig] = useState({ titleField: '', subtitleField: '', contentField: '', badge1: '', badge2: '', action1: '', action2: '' })

  const source = resolveSource(sourceId)
  const metric = source ? sourceFields(source).find((f) => f.id === metricId) || null : null

  // When using the new DatasetStep flow, derive synthetic source+metric for preview.
  // Use the ENTITY_SOURCES label (e.g. "Contacts") instead of the raw id ("contacts_hubspot")
  // so the preview header shows a readable name and entityKindFor resolves correctly.
  const dsEntry = datasetConfig?.sourceId ? ENTITY_SOURCES.find((s) => s.id === datasetConfig.sourceId) : null
  const previewSource = source || (datasetConfig?.sourceId
    ? { id: datasetConfig.sourceId, name: dsEntry ? `${dsEntry.label} · ${dsEntry.integration}` : datasetConfig.sourceId, governed: false, hasPII: false }
    : null)
  const previewMetric = metric || (datasetConfig?.sourceId
    ? { id: 'dataset', name: dsEntry?.label || datasetConfig.aggregation?.column || datasetConfig.sourceId || 'Value' }
    : null)

  function resetShape() {
    setDimensionId('none')
    setTransform('none')
    setAggregation('sum')
  }
  function selectSource(id) {
    if (id === sourceId) return
    setSourceId(id)
    setMetricId(null)
    setTypeId(null)
    setTypeTouched(false)
    resetShape()
  }
  function selectMetric(id) {
    setMetricId(id)
    resetShape()
    if (!source) return
    const m = sourceFields(source).find((x) => x.id === id)
    if (m && !typeTouched) setTypeId(recommendTile(m, dimensionById('none')))
  }
  function selectDimension(id) {
    setDimensionId(id)
    if (!typeTouched && metric) setTypeId(recommendTile(metric, dimensionById(id)))
  }
  function selectType(id) {
    setTypeId(id)
    setTypeTouched(true)
  }

  function applyDescription(text) {
    const r = describeWidget(text)
    if (!r) return false
    setSourceId(r.sourceId)
    setMetricId(r.metricId)
    setDimensionId(r.dimensionId || 'none')
    setTransform('none')
    setAggregation('sum')
    setTypeId(r.typeId)
    setTypeTouched(true)
    setName(r.name)
    setTab('data')
    return true
  }

  const fromDashboard = location.state?.fromDashboard || null

  const seededRef = useRef(false)
  useEffect(() => {
    if (seededRef.current) return
    const seed = location.state?.describe
    if (seed) { seededRef.current = true; applyDescription(seed) }
  }, [location.state]) // eslint-disable-line react-hooks/exhaustive-deps

  // Must be declared before canSave to avoid temporal dead zone
  const dataComplete = Boolean(
    datasetConfig?.sourceId &&
    datasetConfig?.operationType &&
    (
      datasetConfig.operationType === 'record_set'
        ? datasetConfig.exposedColumns?.length > 0
        : datasetConfig.aggregation?.fn && datasetConfig.aggregation?.column
    )
  )

  const canSave =
    dataComplete &&
    !!typeId &&
    name.trim().length > 0

  const saveHint = !datasetConfig?.sourceId
    ? 'Configure a dataset on the Data tab to begin.'
    : !dataComplete
      ? 'Complete the dataset configuration on the Data tab.'
      : !typeId
        ? 'Pick a widget type on the Widget tab.'
        : name.trim().length === 0
          ? 'Name your widget on the Widget tab.'
          : ''

  function handleSave() {
    const wid = `w-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    addWidget({
      id: wid,
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      skeleton: TYPE_LABEL[typeId] || typeId,
      governed: false,
      freshness: FRESHNESS_STATUS[freshness] || 'fresh',
      health: 'unused',
      usedIn: 0,
      source: datasetConfig?.sourceId || '',
      dataset: datasetConfig,
      format: format.style === 'auto' ? undefined : format,
      goal: goal.value != null ? goal : undefined,
      accentColor: accentColor || undefined,
      styleVariant: styleVariant || undefined,
      displayOptions: Object.keys(displayOptions).length ? displayOptions : undefined,
    })
    if (fromDashboard) {
      navigate(`/dashboard/${fromDashboard}/canvas`, { state: { autoAdd: wid }, replace: true })
    } else {
      setSaved(wid)
    }
  }


  if (saved) return <SavedConfirmation name={name} widgetId={saved} navigate={navigate} />

  const dimension = dimensionById(dimensionId)
  const galleryMetric = metric ? { ...metric, recommendedType: recommendTile(metric, dimension) } : metric
  const shape = { dimension, transform }

  const widgetComplete = !!typeId && name.trim().length > 0

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Playground"
        description="Map an entity and metric, pick a widget type, and preview it live."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/widgets')}>Cancel</Button>
            <Button variant="primary" disabled={!canSave} onClick={handleSave}>
              <Check size={16} /> Save to catalog
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6 lg:px-8 2xl:px-10 lg:flex-row">
          {/* Left: build */}
          <div className="order-2 w-full space-y-5 lg:order-1 lg:w-1/2 lg:min-w-0">
            <DescribeComposer
              placeholder="e.g. Pipeline by stage as a funnel"
              examples={['Win Rate gauge', 'Workflow Runs over time', 'Human-in-the-Loops by team', 'Contacts by status as a donut']}
              onGenerate={applyDescription}
            />

            {/* Tab bar */}
            <BuilderTabs tab={tab} setTab={setTab} dataComplete={dataComplete} widgetComplete={widgetComplete} />

            {/* ── Tab 1: Data ── */}
            {tab === 'data' && (
              <div className="space-y-7">
                <DatasetStep
                  value={datasetConfig}
                  onChange={(cfg) => {
                    setDatasetConfig(cfg)
                    // If active skeleton is incompatible with new shape, reset it
                    const shape = cfg?._shape
                    if (shape && COMPATIBLE_SKELETONS[shape] && typeId) {
                      if (!COMPATIBLE_SKELETONS[shape].includes(typeId)) {
                        setTypeId(null)
                        setTypeTouched(false)
                      }
                    }
                  }}
                />

                {dataComplete && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setTab('widget')}
                  >
                    Continue to Widget →
                  </Button>
                )}
              </div>
            )}

            {/* ── Tab 2: Widget ── */}
            {tab === 'widget' && (
              <div className="space-y-7">
                <section>
                  <SectionHeading n={1} title="Widget type" sub="How to visualize the data — recommended type is pre-selected." />
                  <TypeGallery
                    typeId={typeId}
                    metric={galleryMetric}
                    onSelect={selectType}
                    compatibleSkeletons={datasetConfig?._shape ? COMPATIBLE_SKELETONS[datasetConfig._shape] : null}
                  />
                  {typeId && metric && (
                    <div className="mt-3">
                      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Slots</div>
                      <SlotPanel typeId={typeId} measure={metric} dimension={dimension} transform={transform} />
                    </div>
                  )}
                </section>

                <section>
                  <SectionHeading n={2} title="Configure" sub="Name, refresh rate, and access settings." />
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">Widget name</div>
                      <input
                        className="input w-full"
                        placeholder="e.g. Pipeline by Stage"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">
                        Description <span className="font-normal text-gray-400 dark:text-slate-500">(optional)</span>
                      </div>
                      <input
                        className="input w-full"
                        placeholder="e.g. Rolling 30-day pipeline — updated daily"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        maxLength={120}
                      />
                      <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">Shown in the widget library card and detail modal.</p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">
                        <RefreshCw size={13} aria-hidden="true" />
                        Refresh rate
                      </div>
                      <select className="input" value={freshness} onChange={(e) => setFreshness(e.target.value)}>
                        {FRESHNESS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                      <input type="checkbox" className="checkbox" checked={interactiveFilters} onChange={(e) => setInteractiveFilters(e.target.checked)} />
                      Let end users filter this widget
                    </label>

                    {source?.hasPII && (
                      <AckBox checked={piiAck} onChange={setPiiAck} title="This entity contains PII" body="Personal data is masked by default in previews and for users without explicit access." />
                    )}
                    {source && !source.governed && (
                      <AckBox checked={ungovernedAck} onChange={setUngovernedAck} title="Ungoverned metric" body="Computed here, not from an approved source — it carries an Ungoverned badge wherever it appears." />
                    )}

                    <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Need advanced transformations, custom SQL, or trend analysis?{' '}
                        <a href="#" className="inline-flex items-center gap-0.5 font-medium text-aims-blue hover:underline">
                          View in Metabase <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      </p>
                    </div>
                  </div>
                </section>

                {widgetComplete && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setTab('appearance')}
                  >
                    Configure Appearance →
                  </Button>
                )}
              </div>
            )}

            {/* ── Tab 3: Appearance ── */}
            {tab === 'appearance' && (
              <div className="space-y-5">
                <AppearancePanel
                  typeId={typeId}
                  entity={source}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  styleVariant={styleVariant}
                  setStyleVariant={setStyleVariant}
                  displayOptions={displayOptions}
                  setDisplayOptions={setDisplayOptions}
                  format={format}
                  setFormat={setFormat}
                  goal={goal}
                  setGoal={setGoal}
                  tableConfig={tableConfig}
                  setTableConfig={setTableConfig}
                  listConfig={listConfig}
                  setListConfig={setListConfig}
                  cardConfig={cardConfig}
                  setCardConfig={setCardConfig}
                />
              </div>
            )}
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
                  metric={previewMetric}
                  source={previewSource}
                  name={name}
                  subtitle={subtitle}
                  freshness={FRESHNESS_STATUS[freshness] || 'fresh'}
                  display={{ format, goal, accentColor, styleVariant, displayOptions }}
                  shape={shape}
                  datasetConfig={datasetConfig}
                  typeConfig={{ tableConfig, listConfig, cardConfig }}
                />
              </div>
              {typeId && (
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-slate-400">
                  {WIDGET_SIZES.find((s) => s.id === previewSize)?.width} · {WIDGET_SIZES.find((s) => s.id === previewSize)?.detail}
                </p>
              )}

              {typeId && TYPE_INFO[typeId] && (
                <div className="mt-4 space-y-2">
                  <div className="surface-sunken rounded-lg p-3">
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
    </div>
  )
}

/* ── Tab navigation ── */
function BuilderTabs({ tab, setTab, dataComplete, widgetComplete }) {
  const tabs = [
    { id: 'data', label: 'Data', n: 1, done: dataComplete, enabled: true },
    { id: 'widget', label: 'Widget', n: 2, done: widgetComplete, enabled: dataComplete },
    { id: 'appearance', label: 'Appearance', n: 3, done: false, enabled: widgetComplete },
  ]
  return (
    <div className="flex gap-1 rounded-xl bg-gray-100/80 p-1 dark:bg-white/[0.05]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => t.enabled && setTab(t.id)}
          disabled={!t.enabled}
          aria-disabled={!t.enabled}
          title={!t.enabled ? (t.id === 'widget' ? 'Complete the Data tab first' : 'Complete the Widget tab first') : undefined}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
            !t.enabled
              ? 'cursor-not-allowed opacity-40'
              : tab === t.id
                ? 'bg-white text-aims-blue shadow-sm dark:bg-white/10 dark:text-aims-blue'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold transition-colors ${
            t.done
              ? 'bg-aims-governed text-white'
              : tab === t.id
                ? 'bg-aims-blue text-white'
                : 'bg-gray-300 text-gray-600 dark:bg-white/20 dark:text-slate-300'
          }`}>
            {t.done ? <Check size={9} /> : t.n}
          </span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function SavedConfirmation({ name, widgetId, navigate }) {
  return (
    <div className="h-full grid place-items-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-green-200 bg-green-50 dark:border-green-500/25 dark:bg-green-500/10">
          <Check size={28} className="text-aims-governed" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Saved to catalog</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          "{name || 'Untitled widget'}" is now in the Widget Library. Add it to a dashboard to make it visible to your team.
        </p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/dashboards', { state: { pendingPlace: { id: widgetId, name: name || 'Untitled widget' } } })}
          >
            Add to a dashboard
          </Button>
          <div className="flex w-full gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/widgets/new')}>Create new widget</Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/widgets')}>Back to library</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
