import { X, Plus, Database, Table2 } from 'lucide-react'
import {
  ENTITY_SOURCES, PRESET_DATASETS, COLUMN_TYPES, AGG_FUNCTIONS,
  DATASET_SHAPE, OPERATORS_BY_TYPE,
} from '../../data/datasets.js'
import DatasetFilterRow from './DatasetFilterRow.jsx'

const SOURCE_TYPES = [
  { id: 'dataset', label: 'Existing Dataset', icon: Database, desc: 'Use a pre-built query as your starting point.' },
  { id: 'entity',  label: 'Entity',           icon: Table2,   desc: 'Start from a raw entity and configure from scratch.' },
]

const OPERATION_TYPES = [
  { id: 'summarize',  label: 'Summarize',  desc: 'Aggregate values (count, sum, avg…) and optionally group them.' },
  { id: 'record_set', label: 'Record Set', desc: 'Show raw records — choose which columns to expose.' },
]

function computeShape(c) {
  if (!c.operationType) return null
  if (c.operationType === 'record_set') return DATASET_SHAPE.FULL
  return (c.groupers || []).filter((g) => g.column).length > 0
    ? DATASET_SHAPE.GROUPED
    : DATASET_SHAPE.SINGLE
}

const EMPTY_CONFIG = {
  sourceType: null,
  sourceId: '',
  filters: [],
  operationType: null,
  aggregation: null,
  groupers: [],
  exposedColumns: [],
  _shape: null,
}

// ── DatasetStep ──────────────────────────────────────────────────────────────
// Full dataset configuration panel used in WidgetBuilder Step 1.
// Replaces EntityPicker + MetricPicker + DimensionPicker.
//
// Props:
//   value    – datasetConfig object (or null for initial state)
//   onChange – (updatedConfig) => void  — always includes _shape for parent
export default function DatasetStep({ value, onChange }) {
  const config = value || EMPTY_CONFIG

  const set = (patch) => {
    const updated = { ...config, ...patch }
    onChange({ ...updated, _shape: computeShape(updated) })
  }

  // ── Derived helpers ──────────────────────────────────────────────────────
  const selectedPreset = config.sourceType === 'dataset'
    ? PRESET_DATASETS.find((d) => d.id === config.sourceId)
    : null
  const selectedEntity = config.sourceType === 'entity'
    ? ENTITY_SOURCES.find((e) => e.id === config.sourceId)
    : null

  // Columns available for filtering / grouping / aggregation
  const availableColumns = selectedPreset
    ? selectedPreset.columns
    : selectedEntity
      ? Object.keys(COLUMN_TYPES[config.sourceId] || {})
      : []

  // For aggregation column picker — only numeric columns when fn ≠ count
  const aggNumericColumns = availableColumns.filter((c) => {
    if (!config.sourceId || config.sourceType === 'dataset') return true
    return COLUMN_TYPES[config.sourceId]?.[c] === 'number'
  })

  // sourceId used for DatasetFilterRow operator lookup
  const filterSourceId = config.sourceType === 'entity' ? config.sourceId : selectedPreset?.source || ''

  // ── Mutators ─────────────────────────────────────────────────────────────
  const resetSource = (sourceType) =>
    set({ sourceType, sourceId: '', filters: [], operationType: null, aggregation: null, groupers: [], exposedColumns: [] })

  const resetSourceId = (sourceId) =>
    set({ sourceId, filters: [], operationType: null, aggregation: null, groupers: [], exposedColumns: [] })

  const addFilter    = () => set({ filters: [...config.filters, { column: '', operator: '', value: '' }] })
  const updateFilter = (i, f) => set({ filters: config.filters.map((x, idx) => idx === i ? f : x) })
  const removeFilter = (i)    => set({ filters: config.filters.filter((_, idx) => idx !== i) })

  const addGrouper    = () => set({ groupers: [...config.groupers, { column: '' }] })
  const updateGrouper = (i, col) => set({ groupers: config.groupers.map((g, idx) => idx === i ? { column: col } : g) })
  const removeGrouper = (i)      => set({ groupers: config.groupers.filter((_, idx) => idx !== i) })

  const toggleColumn = (col) => {
    const cols = config.exposedColumns.includes(col)
      ? config.exposedColumns.filter((c) => c !== col)
      : [...config.exposedColumns, col]
    set({ exposedColumns: cols })
  }

  const setOperationType = (opType) =>
    set({
      operationType: opType,
      aggregation: null,
      groupers: [],
      exposedColumns: opType === 'record_set' ? [...availableColumns] : [],
    })

  // ── Shape badge helper ────────────────────────────────────────────────────
  const shapeBadge = (shape) => {
    const map = {
      [DATASET_SHAPE.GROUPED]: { label: 'Grouped', cls: 'bg-cyan-500/15 text-cyan-400' },
      [DATASET_SHAPE.SINGLE]:  { label: 'Single value', cls: 'bg-amber-500/15 text-amber-400' },
      [DATASET_SHAPE.FULL]:    { label: 'Record set', cls: 'bg-purple-500/15 text-purple-400' },
    }
    const s = map[shape]
    if (!s) return null
    return (
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
        {s.label}
      </span>
    )
  }

  return (
    <div className="space-y-7">

      {/* ── 1. SOURCE TYPE ─────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Data source</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {SOURCE_TYPES.map((st) => {
            const Icon = st.icon
            const active = config.sourceType === st.id
            return (
              <button
                key={st.id}
                onClick={() => resetSource(st.id)}
                className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  active
                    ? 'border-blue-500/40 bg-blue-500/10 text-slate-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                }`}
              >
                <Icon size={15} className={active ? 'text-blue-400' : 'text-slate-400'} />
                <span className="text-xs font-semibold">{st.label}</span>
                <span className="text-[11px] text-slate-400 leading-tight">{st.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── 2. SOURCE PICKER ───────────────────────────────────────────── */}
      {config.sourceType && (
        <section>
          <SectionLabel>
            {config.sourceType === 'dataset' ? 'Choose dataset' : 'Choose entity'}
          </SectionLabel>

          {config.sourceType === 'dataset' && (
            <div className="space-y-1.5">
              {PRESET_DATASETS.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => resetSourceId(ds.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    config.sourceId === ds.id
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <Database size={13} className="shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-100">{ds.name}</span>
                    <span className="block truncate text-[11px] text-slate-400">{ds.description}</span>
                  </span>
                  {shapeBadge(ds.shape)}
                </button>
              ))}
            </div>
          )}

          {config.sourceType === 'entity' && (() => {
            // Group sources by entity label
            const groups = ENTITY_SOURCES.reduce((acc, en) => {
              if (!acc[en.label]) acc[en.label] = []
              acc[en.label].push(en)
              return acc
            }, {})
            return (
              <div className="space-y-3">
                {Object.entries(groups).map(([label, sources]) => (
                  <div key={label}>
                    <p className="mb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((en) => (
                        <button
                          key={en.id}
                          onClick={() => resetSourceId(en.id)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                            config.sourceId === en.id
                              ? 'border-blue-500/40 bg-blue-500/10 font-semibold text-slate-100'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                          }`}
                        >
                          <Table2 size={12} className="shrink-0 text-slate-400" />
                          <span>{en.integration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </section>
      )}

      {/* ── 3. FILTERS ─────────────────────────────────────────────────── */}
      {config.sourceId && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel className="mb-0">Filters</SectionLabel>
            <button
              onClick={addFilter}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <Plus size={11} /> Add filter
            </button>
          </div>
          {config.filters.length === 0 ? (
            <p className="text-[11px] text-slate-500">No filters — showing all records from this source.</p>
          ) : (
            <div className="space-y-2">
              {config.filters.map((f, i) => (
                <DatasetFilterRow
                  key={i}
                  sourceId={filterSourceId}
                  columns={availableColumns.length ? availableColumns : undefined}
                  filter={f}
                  onChange={(updated) => updateFilter(i, updated)}
                  onRemove={() => removeFilter(i)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. OPERATION TYPE ──────────────────────────────────────────── */}
      {config.sourceId && (
        <section>
          <SectionLabel>What do you want to show?</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {OPERATION_TYPES.map((op) => {
              const active = config.operationType === op.id
              return (
                <button
                  key={op.id}
                  onClick={() => setOperationType(op.id)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                    active
                      ? 'border-blue-500/40 bg-blue-500/10 text-slate-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-xs font-semibold">{op.label}</span>
                  <span className="text-[11px] text-slate-400 leading-tight">{op.desc}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 5a. SUMMARIZE: aggregation + groupers ──────────────────────── */}
      {config.operationType === 'summarize' && (
        <section className="space-y-5">

          {/* Aggregation */}
          <div>
            <SectionLabel>Aggregation</SectionLabel>
            <div className="flex gap-2">
              <select
                value={config.aggregation?.fn || ''}
                onChange={(e) => set({ aggregation: { ...config.aggregation, fn: e.target.value, column: '' } })}
                className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="">Function…</option>
                {AGG_FUNCTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <select
                value={config.aggregation?.column || ''}
                onChange={(e) => set({ aggregation: { ...config.aggregation, column: e.target.value } })}
                disabled={!config.aggregation?.fn}
                className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-200 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="">of column…</option>
                {(config.aggregation?.fn === 'count' ? availableColumns : aggNumericColumns).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Groupers — rows, not chips */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel className="mb-0">Group by</SectionLabel>
              <button
                onClick={addGrouper}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Plus size={11} /> Add grouper
              </button>
            </div>
            {config.groupers.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No groupers — result will be a single aggregated value.
              </p>
            ) : (
              <div className="space-y-2">
                {config.groupers.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={g.column}
                      onChange={(e) => updateGrouper(i, e.target.value)}
                      className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    >
                      <option value="">Column…</option>
                      {availableColumns.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeGrouper(i)}
                      aria-label="Remove grouper"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 5b. RECORD SET: column picker ──────────────────────────────── */}
      {config.operationType === 'record_set' && availableColumns.length > 0 && (
        <section>
          <SectionLabel>Columns to expose</SectionLabel>
          <p className="mb-3 text-[11px] text-slate-400">
            Choose which columns are available in this dataset. Users can hide individual columns in the widget later.
          </p>
          <div className="flex flex-wrap gap-2">
            {availableColumns.map((col) => {
              const active = config.exposedColumns.includes(col)
              return (
                <button
                  key={col}
                  onClick={() => toggleColumn(col)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  {col}
                </button>
              )
            })}
          </div>
        </section>
      )}

    </div>
  )
}

function SectionLabel({ children, className = '' }) {
  return (
    <p className={`mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`}>
      {children}
    </p>
  )
}
