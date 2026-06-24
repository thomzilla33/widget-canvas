import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check, ExternalLink, RefreshCw, PenLine, LayoutTemplate, Sparkles, BarChart3, LineChart, Hash, Gauge, PieChart, Table2, List, ArrowLeft } from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { EXTERNAL_SOURCES, TYPE_LABEL, sourceFields, WIDGET_SIZES } from '../data/mock.js'
import { MODEL_ENTITIES, entityById } from '../data/entities.js'
import { dimensionById, recommendTile } from '../data/fields.js'
import { describeWidget } from '../data/describe.js'
import { DescribeComposer } from '../components/common/DescribeComposer.jsx'
import {
  EntityPicker,
  MetricPicker,
  DimensionPicker,
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
import WidgetPreview from '../components/playground/WidgetPreview.jsx'
import DataSourceMarketplace from '../components/datasources/DataSourceMarketplace.jsx'

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

const WIDGET_TEMPLATES = [
  { id: 'tpl-mrr', name: 'MRR Trend', description: 'Monthly recurring revenue over time — the heartbeat of your subscription business.', entityId: 'ent-customers', metricId: 'cust-mrr', typeId: 'line', category: 'Revenue', Icon: LineChart },
  { id: 'tpl-pipeline', name: 'Pipeline Value', description: 'Total open opportunity value — your forward-looking revenue signal.', entityId: 'ent-deals', metricId: 'deal-pipeline', typeId: 'kpi', category: 'Revenue', Icon: Hash },
  { id: 'tpl-win-rate', name: 'Win Rate', description: 'Closed-won as % of all closed — your team\'s effectiveness at a glance.', entityId: 'ent-deals', metricId: 'deal-win-rate', typeId: 'gauge', category: 'Revenue', Icon: Gauge },
  { id: 'tpl-deal-stage', name: 'Deals by Stage', description: 'Pipeline breakdown by stage — see where deals are getting stuck.', entityId: 'ent-deals', metricId: 'deal-by-stage', typeId: 'bar', category: 'Revenue', Icon: BarChart3 },
  { id: 'tpl-open-tickets', name: 'Open Tickets', description: 'Live count of open support cases — track backlog and triage pressure.', entityId: 'ent-tickets', metricId: 'tkt-open', typeId: 'kpi', category: 'Support', Icon: Hash },
  { id: 'tpl-sla', name: 'SLA Compliance', description: 'Percentage of tickets resolved within SLA — your support promise.', entityId: 'ent-tickets', metricId: 'tkt-sla', typeId: 'gauge', category: 'Support', Icon: Gauge },
  { id: 'tpl-churn', name: 'Churn Rate', description: 'Monthly customer churn — the rate at which customers leave your platform.', entityId: 'ent-customers', metricId: 'cust-churn', typeId: 'gauge', category: 'Customer Data', Icon: Gauge },
  { id: 'tpl-cust-tier', name: 'Customers by Tier', description: 'Breakdown of your customer base by subscription tier or plan.', entityId: 'ent-customers', metricId: 'cust-by-tier', typeId: 'pie', category: 'Customer Data', Icon: PieChart },
  { id: 'tpl-open-deals', name: 'Open Deals', description: 'Row-level view of every active opportunity with owner and close date.', entityId: 'ent-deals', metricId: 'deal-rs-open', typeId: 'table', category: 'Revenue', Icon: Table2 },
  { id: 'tpl-recent-contacts', name: 'Recently Active Contacts', description: 'Contacts ranked by last engagement — see who needs follow-up.', entityId: 'ent-contacts', metricId: 'cnt-rs-recent', typeId: 'list', category: 'Customer Data', Icon: List },
]

// Resolve a source from either the entity model or EXTERNAL_SOURCES (legacy / describe flow)
function resolveSource(sourceId) {
  if (!sourceId) return null
  return MODEL_ENTITIES.find((e) => e.id === sourceId) || EXTERNAL_SOURCES.find((s) => s.id === sourceId) || null
}

export default function WidgetBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addWidget } = useWidgets()

  // Entry mode: null = entry screen, 'scratch' | 'template' | 'ai' = builder open
  // Skip entry if arriving with a seed description (from DescribeIt on another page)
  const [entryMode, setEntryMode] = useState(() => location.state?.describe ? 'ai' : null)

  // Tab: 'data' | 'widget' | 'appearance'
  const [tab, setTab] = useState('data')

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

  const canSave =
    !!source &&
    !!metric &&
    !!typeId &&
    name.trim().length > 0 &&
    (!source.hasPII || piiAck) &&
    (source.governed || ungovernedAck)

  const saveHint = !source
    ? 'Pick an entity on the Data tab to begin.'
    : !metric
      ? 'Choose a metric on the Data tab.'
      : !typeId
        ? 'Pick a widget type on the Widget tab.'
        : name.trim().length === 0
          ? 'Name your widget on the Widget tab.'
          : source.hasPII && !piiAck
            ? 'Acknowledge the PII notice on the Widget tab.'
            : !source.governed && !ungovernedAck
              ? 'Acknowledge the ungoverned source on the Widget tab.'
              : ''

  function handleSave() {
    const wid = `w-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    addWidget({
      id: wid,
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      skeleton: TYPE_LABEL[typeId],
      metric: metric.name,
      governed: source.governed,
      freshness: FRESHNESS_STATUS[freshness] || 'fresh',
      health: 'unused',
      usedIn: 0,
      source: source.name,
      dimension: dimensionId !== 'none' ? dimensionId : undefined,
      transform: transform !== 'none' ? transform : undefined,
      aggregation: aggregation !== 'sum' ? aggregation : undefined,
      format: format.style === 'auto' ? undefined : format,
      goal: goal.value != null ? goal : undefined,
      accentColor: accentColor || undefined,
      styleVariant: styleVariant || undefined,
      displayOptions: Object.keys(displayOptions).length ? displayOptions : undefined,
    })
    if (fromDashboard) {
      navigate(`/canvas/${fromDashboard}`, { state: { autoAdd: wid }, replace: true })
    } else {
      setSaved(wid)
    }
  }

  function applyTemplate(tpl) {
    setSourceId(tpl.entityId)
    setMetricId(tpl.metricId)
    setTypeId(tpl.typeId)
    setTypeTouched(true)
    setName(tpl.name)
    setTab('widget')
    setEntryMode('scratch')
  }

  if (!entryMode) {
    return (
      <EntryScreen
        onScratch={() => setEntryMode('scratch')}
        onAI={() => setEntryMode('ai')}
        onTemplate={applyTemplate}
        onBack={() => navigate('/widgets')}
      />
    )
  }

  if (saved) return <SavedConfirmation name={name} widgetId={saved} navigate={navigate} />

  const dimension = dimensionById(dimensionId)
  const galleryMetric = metric ? { ...metric, recommendedType: recommendTile(metric, dimension) } : metric
  const shape = { dimension, transform }

  // Tab completion status for visual cues
  const dataComplete = !!source && !!metric
  const widgetComplete = !!typeId && name.trim().length > 0

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Widget Playground"
        description="Map an entity and metric, pick a widget type, and preview it live."
        actions={
          <>
            <button className="btn-secondary" onClick={() => navigate('/widgets')}>Cancel</button>
            <button className="btn-primary" disabled={!canSave} onClick={handleSave}>
              <Check size={16} /> Save to catalog
            </button>
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
                <section>
                  <SectionHeading
                    n={1}
                    title="Entity"
                    sub="The data model entity this widget reads from — resolved in Data Studio."
                  />
                  <EntityPicker entityId={sourceId} onSelect={selectSource} />
                </section>
                <section>
                  <SectionHeading
                    n={2}
                    title={source ? `Available metrics for ${source.name}` : 'Available metrics'}
                    sub="Pre-calculated queries from your Data Studio model — not raw connector fields."
                  />
                  <MetricPicker source={source} metricId={metricId} onSelect={selectMetric} />
                </section>
                <section>
                  <SectionHeading n={3} title="Slice by" sub="Break the metric down by a dimension — drives the chart axis or segments." />
                  <DimensionPicker source={source} measure={metric} dimensionId={dimensionId} onSelect={selectDimension} />
                </section>
                <section>
                  <SectionHeading n={4} title="Transform" sub="Reshape the metric — Δ vs prior, % of total, top-N, running total." />
                  <TransformPanel transform={transform} setTransform={setTransform} aggregation={aggregation} setAggregation={setAggregation} />
                </section>

                {dataComplete && (
                  <button
                    onClick={() => setTab('widget')}
                    className="btn-primary w-full"
                  >
                    Continue to Widget →
                  </button>
                )}
              </div>
            )}

            {/* ── Tab 2: Widget ── */}
            {tab === 'widget' && (
              <div className="space-y-7">
                <section>
                  <SectionHeading n={1} title="Widget type" sub="How to visualize the data — recommended type is pre-selected." />
                  <TypeGallery typeId={typeId} metric={galleryMetric} onSelect={selectType} />
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
                  <button
                    onClick={() => setTab('appearance')}
                    className="btn-secondary w-full"
                  >
                    Configure Appearance →
                  </button>
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
                  metric={metric}
                  source={source}
                  name={name}
                  subtitle={subtitle}
                  freshness={FRESHNESS_STATUS[freshness] || 'fresh'}
                  display={{ format, goal, accentColor, styleVariant, displayOptions }}
                  shape={shape}
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

/* ── Entry screen ── */
const TEMPLATE_CATEGORIES = ['Revenue', 'Support', 'Customer Data']

function EntryScreen({ onScratch, onAI, onTemplate, onBack }) {
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Revenue')

  const filtered = WIDGET_TEMPLATES.filter((t) => t.category === activeCategory)

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Create a widget"
        description="Choose how you'd like to start building."
        actions={
          <button className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={15} /> Back to library
          </button>
        }
      />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-2xl px-6 py-10 space-y-8">

          {/* 3 mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Scratch */}
            <button
              onClick={onScratch}
              className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-aims-blue/50 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-aims-blue/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200">
                <PenLine size={20} />
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">From scratch</div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Pick an entity, metric, and visualization manually.</p>
              </div>
            </button>

            {/* Template */}
            <button
              onClick={() => setShowTemplates((v) => !v)}
              className={`flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all hover:shadow-md ${
                showTemplates
                  ? 'border-aims-blue bg-aims-blue/5 dark:bg-aims-blue/10'
                  : 'border-gray-200 bg-white hover:border-aims-blue/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-aims-blue/40'
              }`}
            >
              <span className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${
                showTemplates ? 'bg-aims-blue text-white' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200'
              }`}>
                <LayoutTemplate size={20} />
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">From a template</div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Start from a pre-built config — customize after.</p>
              </div>
            </button>

            {/* AI-assisted */}
            <button
              onClick={onAI}
              className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-aims-blue/50 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-aims-blue/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-aims-blue text-white">
                <Sparkles size={20} />
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">AI-assisted</div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Describe what you want and let AI configure it.</p>
              </div>
            </button>
          </div>

          {/* Template picker — expands inline */}
          {showTemplates && (
            <div className="space-y-4 rounded-xl border border-aims-blue/20 bg-aims-blue/[0.03] p-5 dark:bg-aims-blue/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Choose a template</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">{WIDGET_TEMPLATES.length} templates</span>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 flex-wrap">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-aims-blue text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filtered.map((tpl) => {
                  const Icon = tpl.Icon
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => onTemplate(tpl)}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-aims-blue/50 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-aims-blue/30"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-300">
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{tpl.name}</div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-slate-400">{tpl.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-slate-500">
            You can change everything after — nothing is locked in at this step.
          </p>
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
        <div className="mt-5 flex items-center justify-center gap-2">
          <button className="btn-secondary" onClick={() => navigate('/widgets')}>Back to library</button>
          <button
            className="btn-primary"
            onClick={() => navigate('/dashboards', { state: { pendingPlace: { id: widgetId, name: name || 'Untitled widget' } } })}
          >
            Add to a dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
