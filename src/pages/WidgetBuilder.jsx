import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { EXTERNAL_SOURCES, TYPE_LABEL, sourceFields } from '../data/mock.js'
import {
  SourcePicker,
  MetricPicker,
  TypeGallery,
  ConfigPanel,
  SectionHeading,
} from '../components/playground/BuilderPanels.jsx'
import WidgetPreview from '../components/playground/WidgetPreview.jsx'
import DataSourceMarketplace from '../components/datasources/DataSourceMarketplace.jsx'

const FRESHNESS_STATUS = { realtime: 'live', '15m': 'fresh', '1h': 'fresh', '24h': 'aging' }

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
          <div className="w-full shrink-0 space-y-7 lg:w-[440px]">
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
          </div>

          {/* Right: live preview */}
          <div className="min-w-0 flex-1">
            <div className="lg:sticky lg:top-0">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                Live preview
              </div>
              <WidgetPreview
                typeId={typeId}
                metric={metric}
                source={source}
                name={name}
                freshness={FRESHNESS_STATUS[freshness] || 'fresh'}
              />
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
