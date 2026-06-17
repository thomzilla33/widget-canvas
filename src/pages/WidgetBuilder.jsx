import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { EXTERNAL_SOURCES, TYPE_LABEL, sourceFields, WIDGET_SIZES } from '../data/mock.js'
import { getTable } from '../data/tables.js'
import { dimensionById, recommendTile } from '../data/fields.js'
import { describeWidget } from '../data/describe.js'
import { DescribeComposer } from '../components/common/DescribeComposer.jsx'
import {
  SourcePicker,
  TablePicker,
  TableColumnPicker,
  MetricPicker,
  DimensionPicker,
  SlotPanel,
  TransformPanel,
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

  const [sourceMode, setSourceMode] = useState('connected') // 'connected' | 'table'
  const [sourceId, setSourceId] = useState(null)
  const [metricId, setMetricId] = useState(null)
  const [tableId, setTableId] = useState(null)
  const [tableColumn, setTableColumn] = useState(null)
  const [dimensionId, setDimensionId] = useState('none') // Phase 1: slice-by dimension
  const [transform, setTransform] = useState('none')
  const [aggregation, setAggregation] = useState('sum')
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
  const [format, setFormatState] = useState({ style: 'auto', decimals: 0, abbreviate: true, prefix: '', suffix: '' })
  const [goal, setGoalState] = useState({ value: null, direction: 'higher' })
  const setFormat = (patch) => setFormatState((f) => ({ ...f, ...patch }))
  const setGoal = (patch) => setGoalState((g) => ({ ...g, ...patch }))

  const extSource = sourceMode === 'connected' ? EXTERNAL_SOURCES.find((s) => s.id === sourceId) || null : null
  const tableDef = sourceMode === 'table' ? getTable(tableId) : null
  const valueCol = tableDef && tableColumn ? tableDef.columns.find((c) => c.key === tableColumn) || null : null

  // A table presents to the rest of the builder as a governed, PII-free source.
  const source =
    sourceMode === 'table'
      ? tableDef
        ? { id: tableDef.id, name: tableDef.name, governed: true, hasPII: false }
        : null
      : extSource
  // A "field" is an aggregate metric, a row-level record set, or a table value column.
  const metric =
    sourceMode === 'table'
      ? valueCol
        ? { id: `${tableId}:${tableColumn}`, name: valueCol.label, kind: 'breakdown', recommendedType: 'bar', _table: { def: tableDef, valueKey: tableColumn } }
        : null
      : extSource
        ? sourceFields(extSource).find((f) => f.id === metricId) || null
        : null

  function resetShape() {
    setDimensionId('none')
    setTransform('none')
    setAggregation('sum')
  }
  function selectMode(mode) {
    if (mode === sourceMode) return
    setSourceMode(mode)
    setSourceId(null)
    setMetricId(null)
    setTableId(null)
    setTableColumn(null)
    setTypeId(null)
    setTypeTouched(false)
    resetShape()
  }
  function selectSource(id) {
    if (id === sourceId) return // re-selecting the active source shouldn't wipe the metric/type
    setSourceId(id)
    setMetricId(null)
    setTypeId(null)
    setTypeTouched(false)
    resetShape()
  }
  function selectMetric(id) {
    setMetricId(id)
    resetShape()
    if (!extSource) return // table mode has no external source to search
    const m = sourceFields(extSource).find((x) => x.id === id)
    // Recommend a tile from the measure's natural shape (no dimension yet).
    if (m && !typeTouched) setTypeId(recommendTile(m, dimensionById('none')))
  }
  function selectDimension(id) {
    setDimensionId(id)
    if (!typeTouched && metric) setTypeId(recommendTile(metric, dimensionById(id))) // re-recommend from measure × dimension
  }
  function selectTable(id) {
    if (id === tableId) return
    setTableId(id)
    setTableColumn(null)
    setTypeId(null)
    setTypeTouched(false)
  }
  function selectColumn(key) {
    setTableColumn(key)
    if (!typeTouched) setTypeId('bar') // a value-by-row bar is the natural default for a table column
  }
  function selectType(id) {
    setTypeId(id)
    setTypeTouched(true)
  }

  // Describe-to-build: map a description to a config and apply it via direct setters
  // (not the chained select* helpers, which read stale derived state mid-handler).
  function applyDescription(text) {
    const r = describeWidget(text)
    if (!r) return false
    setSourceMode('connected')
    setTableId(null)
    setTableColumn(null)
    setSourceId(r.sourceId)
    setMetricId(r.metricId)
    setDimensionId(r.dimensionId || 'none')
    setTransform('none')
    setAggregation('sum')
    setTypeId(r.typeId)
    setTypeTouched(true)
    setName(r.name)
    return true
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
      tableId: sourceMode === 'table' ? tableId : undefined,
      tableColumn: sourceMode === 'table' ? tableColumn : undefined,
      dimension: sourceMode !== 'table' && dimensionId !== 'none' ? dimensionId : undefined,
      transform: transform !== 'none' ? transform : undefined,
      aggregation: aggregation !== 'sum' ? aggregation : undefined,
      format: format.style === 'auto' ? undefined : format,
      goal: goal.value != null ? goal : undefined,
    })
    setSaved(true)
  }

  if (saved) return <SavedConfirmation name={name} navigate={navigate} />

  const isTable = sourceMode === 'table'
  const dimension = dimensionById(dimensionId)
  // The gallery's recommendation reflects measure × dimension (connected mode only).
  const galleryMetric = isTable || !metric ? metric : { ...metric, recommendedType: recommendTile(metric, dimension) }
  const shape = !isTable ? { dimension, transform } : undefined

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
            <DescribeComposer
              placeholder="e.g. Pipeline by stage as a funnel"
              examples={['Win Rate gauge', 'Workflow Runs over time', 'Human-in-the-Loops by team', 'Accounts by region on a map']}
              onGenerate={applyDescription}
            />
            <section>
              <SectionHeading n={1} title="Data source" sub="An external system, or one of your governed Tables." />
              <div className="mb-3 flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-white/15">
                {[
                  ['connected', 'Connected sources'],
                  ['table', 'Tables'],
                ].map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => selectMode(v)}
                    aria-pressed={sourceMode === v}
                    className={`flex-1 px-2 py-1.5 font-medium transition-colors ${
                      sourceMode === v ? 'bg-aims-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {sourceMode === 'table' ? (
                <TablePicker tableId={tableId} onSelect={selectTable} />
              ) : (
                <SourcePicker sourceId={sourceId} onSelect={selectSource} onBrowse={() => setBrowsing(true)} />
              )}
            </section>
            <section>
              {isTable ? (
                <>
                  <SectionHeading n={2} title="Column" sub="Pick a measure or formula (ƒ) column to visualize." />
                  <TableColumnPicker table={tableDef} valueKey={tableColumn} onSelect={selectColumn} />
                </>
              ) : (
                <>
                  <SectionHeading n={2} title="Measure" sub="The numeric value this widget shows (a record set for row-level tiles)." />
                  <MetricPicker source={source} metricId={metricId} onSelect={selectMetric} />
                </>
              )}
            </section>
            {!isTable && (
              <section>
                <SectionHeading n={3} title="Slice by" sub="Break the measure down by a dimension — drives the chart's axis/segments." />
                <DimensionPicker source={source} measure={metric} dimensionId={dimensionId} onSelect={selectDimension} />
              </section>
            )}
            <section>
              <SectionHeading n={isTable ? 3 : 4} title="Widget type" sub="Choose how to visualize it — recommended type is marked." />
              <TypeGallery typeId={typeId} metric={galleryMetric} onSelect={selectType} />
              {!isTable && typeId && metric && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">Slots</div>
                  <SlotPanel typeId={typeId} measure={metric} dimension={dimension} transform={transform} />
                </div>
              )}
            </section>
            {!isTable && (
              <section>
                <SectionHeading n={5} title="Transform" sub="Reshape the measure — Δ, % of total, top-N, running total, aggregation." />
                <TransformPanel transform={transform} setTransform={setTransform} aggregation={aggregation} setAggregation={setAggregation} />
              </section>
            )}
            <section>
              <SectionHeading n={isTable ? 4 : 6} title="Configure" sub="Name, freshness, filters. Permissions are set later, on a dashboard." />
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
              <SectionHeading n={isTable ? 5 : 7} title="Format & display" sub="Number format, units, and a goal with conditional color." />
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
