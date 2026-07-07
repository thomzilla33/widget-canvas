import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Trash2, Database, Table2, PackagePlus, Search, ChevronRight, Check, SlidersHorizontal } from 'lucide-react'
import {
  ENTITY_SOURCES, PRESET_DATASETS, COLUMN_TYPES, AGG_FUNCTIONS,
  DATASET_SHAPE, OPERATORS_BY_TYPE,
} from '../../data/datasets.js'
import DatasetFilterRow from './DatasetFilterRow.jsx'
import { useModels } from '../../state/ModelsContext.jsx'

const SOURCE_TYPES = [
  { id: 'dataset', label: 'Existing Dataset', icon: Database, desc: 'Use a pre-built query as your starting point.' },
  { id: 'entity',  label: 'Entity',           icon: Table2,   desc: 'Start from a raw entity and configure from scratch.' },
]

const OPERATION_TYPES = [
  { id: 'summarize',  label: 'Summarize',  desc: 'Aggregate values (count, sum, avg…) and optionally group them.' },
  { id: 'record_set', label: 'Record Set', desc: 'Show raw records — choose which columns to expose.' },
]

const SHAPE_FILTERS = [
  { id: 'all',    label: 'All' },
  { id: DATASET_SHAPE.GROUPED, label: 'Grouped' },
  { id: DATASET_SHAPE.SINGLE,  label: 'Single value' },
  { id: DATASET_SHAPE.FULL,    label: 'Record set' },
]

const INLINE_LIMIT = 4

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

// ── Shape badge ────────────────────────────────────────────────────────────────
function ShapeBadge({ shape }) {
  const map = {
    [DATASET_SHAPE.GROUPED]: { label: 'Grouped',      cls: 'bg-cyan-500/15 text-cyan-400' },
    [DATASET_SHAPE.SINGLE]:  { label: 'Single value', cls: 'bg-amber-500/15 text-amber-400' },
    [DATASET_SHAPE.FULL]:    { label: 'Record set',   cls: 'bg-purple-500/15 text-purple-400' },
  }
  const s = map[shape]
  if (!s) return null
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ── Library modal card ─────────────────────────────────────────────────────────
function LibraryCard({ icon: Icon, iconColor, name, description, badge, selected, onAdd, onRemove }) {
  return (
    <div className={`flex flex-col rounded-xl border p-3.5 transition-all duration-150 ${
      selected
        ? 'border-blue-500/50 bg-blue-500/[0.06]'
        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'
    }`}>
      {/* Icon row + selected badge */}
      <div className="mb-2.5 flex items-start justify-between">
        <div className={`grid h-8 w-8 place-items-center rounded-lg border ${
          selected ? 'border-blue-500/30 bg-blue-500/15' : 'border-white/10 bg-white/5'
        }`}>
          <Icon size={14} className={selected ? 'text-blue-400' : iconColor || 'text-slate-400'} />
        </div>
        {selected && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-400">
            <Check size={10} /> Selected
          </span>
        )}
      </div>

      {/* Name */}
      <p className="mb-1 text-[11px] font-semibold leading-snug text-slate-100">{name}</p>

      {/* Description */}
      <p className="mb-3 flex-1 text-[10px] leading-snug text-slate-500 line-clamp-2">{description}</p>

      {/* Action button */}
      {selected ? (
        <button
          onClick={onRemove}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-medium text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <Trash2 size={11} /> Deselect
        </button>
      ) : (
        <button
          onClick={onAdd}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-medium text-slate-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/[0.06] hover:text-blue-400"
        >
          <Plus size={11} /> Select
        </button>
      )}
    </div>
  )
}

// ── Sidebar category list ──────────────────────────────────────────────────────
function SidebarCategory({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors ${
        active
          ? 'bg-blue-500/15 text-blue-300'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <span>{label}</span>
      <div className="flex items-center gap-1.5">
        {count !== undefined && (
          <span className={`text-[10px] ${active ? 'text-blue-400/70' : 'text-slate-600'}`}>{count}</span>
        )}
        <ChevronRight size={11} className={active ? 'text-blue-400' : 'text-slate-600'} />
      </div>
    </button>
  )
}

// ── Dataset Picker Modal ───────────────────────────────────────────────────────
function DatasetPickerModal({ currentId, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [shapeFilter, setShapeFilter] = useState('all')
  const [localId, setLocalId] = useState(currentId)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const counts = {
    all: PRESET_DATASETS.length,
    [DATASET_SHAPE.GROUPED]: PRESET_DATASETS.filter(d => d.shape === DATASET_SHAPE.GROUPED).length,
    [DATASET_SHAPE.SINGLE]:  PRESET_DATASETS.filter(d => d.shape === DATASET_SHAPE.SINGLE).length,
    [DATASET_SHAPE.FULL]:    PRESET_DATASETS.filter(d => d.shape === DATASET_SHAPE.FULL).length,
  }

  const filtered = PRESET_DATASETS.filter((ds) => {
    const matchShape = shapeFilter === 'all' || ds.shape === shapeFilter
    const q = query.toLowerCase()
    return matchShape && (!q || ds.name.toLowerCase().includes(q) || ds.description?.toLowerCase().includes(q))
  })

  const selectedDs = PRESET_DATASETS.find(d => d.id === localId)

  const sidebarItems = [
    { id: 'all', label: 'All' },
    { id: DATASET_SHAPE.GROUPED, label: 'Grouped' },
    { id: DATASET_SHAPE.SINGLE,  label: 'Single value' },
    { id: DATASET_SHAPE.FULL,    label: 'Record set' },
  ]

  return (
    <LibraryModal title="Choose a dataset" subtitle="Pick a pre-built query to power your widget." onClose={onClose}>
      {/* Sidebar */}
      <div className="flex w-44 shrink-0 flex-col border-r border-white/[0.07] py-3 px-2">
        <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Shape</p>
        {sidebarItems.map((item) => (
          <SidebarCategory
            key={item.id}
            label={item.label}
            count={counts[item.id]}
            active={shapeFilter === item.id}
            onClick={() => setShapeFilter(item.id)}
          />
        ))}
      </div>

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Search */}
        <div className="border-b border-white/[0.07] px-4 py-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search datasets…"
              autoFocus
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Database size={28} className="mb-3 text-slate-700" />
              <p className="text-sm font-medium text-slate-400">No datasets match</p>
              <p className="mt-1 text-xs text-slate-500">Try a different search or shape</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((ds) => (
                <LibraryCard
                  key={ds.id}
                  icon={Database}
                  iconColor="text-blue-400"
                  name={ds.name}
                  description={ds.description}
                  selected={localId === ds.id}
                  onAdd={() => setLocalId(ds.id)}
                  onRemove={() => setLocalId(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selection strip */}
        <div className="flex items-center gap-3 border-t border-white/[0.07] bg-blue-500/[0.04] px-4 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px]">
            {selectedDs ? (
              <>
                <Check size={13} className="shrink-0 text-blue-400" />
                <span className="truncate font-medium text-slate-200">{selectedDs.name}</span>
                <span className="shrink-0 text-slate-500">selected as data source</span>
              </>
            ) : (
              <span className="text-slate-500">Select a dataset to continue</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button
              disabled={!localId}
              onClick={() => { if (localId) { onSelect(localId); onClose() } }}
              className="h-8 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use dataset
            </button>
          </div>
        </div>
      </div>
    </LibraryModal>
  )
}

// ── Entity Picker Modal ───────────────────────────────────────────────────────
function EntityPickerModal({ currentId, visibleSources, hasLocked, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIntegration, setActiveIntegration] = useState('all')
  const [localId, setLocalId] = useState(currentId)

  const integrations = ['all', ...Array.from(new Set(visibleSources.map((s) => s.integration)))]
  const intgCounts = integrations.reduce((acc, i) => {
    acc[i] = i === 'all' ? visibleSources.length : visibleSources.filter(s => s.integration === i).length
    return acc
  }, {})

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const filtered = visibleSources.filter((en) => {
    const matchIntg = activeIntegration === 'all' || en.integration === activeIntegration
    const q = query.toLowerCase()
    return matchIntg && (!q || en.label.toLowerCase().includes(q) || en.integration.toLowerCase().includes(q))
  })

  const selectedEn = visibleSources.find(e => e.id === localId)

  return (
    <LibraryModal title="Choose an entity" subtitle="Pick a raw entity to build your widget from scratch." onClose={onClose}>
      {/* Sidebar */}
      <div className="flex w-44 shrink-0 flex-col border-r border-white/[0.07] py-3 px-2">
        <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Integration</p>
        {integrations.map((intg) => (
          <SidebarCategory
            key={intg}
            label={intg === 'all' ? 'All' : intg}
            count={intgCounts[intg]}
            active={activeIntegration === intg}
            onClick={() => setActiveIntegration(intg)}
          />
        ))}
      </div>

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Search */}
        <div className="border-b border-white/[0.07] px-4 py-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entities…"
              autoFocus
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Table2 size={28} className="mb-3 text-slate-700" />
              <p className="text-sm font-medium text-slate-400">No entities match</p>
              <p className="mt-1 text-xs text-slate-500">Try a different search or integration</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((en) => (
                <LibraryCard
                  key={en.id}
                  icon={Table2}
                  iconColor="text-violet-400"
                  name={en.label}
                  description={`${en.integration} · ${en.columns?.length ?? 0} columns`}
                  selected={localId === en.id}
                  onAdd={() => setLocalId(en.id)}
                  onRemove={() => setLocalId(null)}
                />
              ))}
            </div>
          )}
          {hasLocked && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] text-slate-500">
              <PackagePlus size={14} className="shrink-0" />
              More entities available — connect an integration to unlock them.
            </div>
          )}
        </div>

        {/* Selection strip */}
        <div className="flex items-center gap-3 border-t border-white/[0.07] bg-blue-500/[0.04] px-4 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px]">
            {selectedEn ? (
              <>
                <Check size={13} className="shrink-0 text-blue-400" />
                <span className="truncate font-medium text-slate-200">{selectedEn.label}</span>
                <span className="shrink-0 text-slate-500">selected as data source</span>
              </>
            ) : (
              <span className="text-slate-500">Select an entity to continue</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button
              disabled={!localId}
              onClick={() => { if (localId) { onSelect(localId); onClose() } }}
              className="h-8 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use entity
            </button>
          </div>
        </div>
      </div>
    </LibraryModal>
  )
}

// ── Shared library modal shell ────────────────────────────────────────────────
function LibraryModal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 flex w-full max-w-3xl flex-col rounded-2xl border border-white/[0.08] bg-[#0d0f14] shadow-2xl overflow-hidden"
        style={{ height: 'min(580px, 88dvh)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body: sidebar + main side by side */}
        <div className="flex min-h-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── DatasetStep ───────────────────────────────────────────────────────────────
export default function DatasetStep({ value, onChange }) {
  const config = value || EMPTY_CONFIG
  const { installed } = useModels()
  const [picker, setPicker] = useState(null) // null | 'dataset' | 'entity'

  const visibleEntitySources = ENTITY_SOURCES.filter((s) => !s.modelId || installed.has(s.modelId))
  const hasLockedModelSources = ENTITY_SOURCES.some((s) => s.modelId && !installed.has(s.modelId))

  const set = (patch) => {
    const updated = { ...config, ...patch }
    onChange({ ...updated, _shape: computeShape(updated) })
  }

  const selectedPreset  = config.sourceType === 'dataset' ? PRESET_DATASETS.find((d) => d.id === config.sourceId) : null
  const selectedEntity  = config.sourceType === 'entity'  ? ENTITY_SOURCES.find((e) => e.id === config.sourceId)  : null

  const availableColumns = selectedPreset
    ? selectedPreset.columns
    : selectedEntity
      ? Object.keys(COLUMN_TYPES[config.sourceId] || {})
      : []

  const aggNumericColumns = availableColumns.filter((c) => {
    if (!config.sourceId || config.sourceType === 'dataset') return true
    return COLUMN_TYPES[config.sourceId]?.[c] === 'number'
  })

  const filterSourceId = config.sourceType === 'entity' ? config.sourceId : selectedPreset?.source || ''

  const resetSource   = (sourceType) => set({ sourceType, sourceId: '', filters: [], operationType: null, aggregation: null, groupers: [], exposedColumns: [] })

  const resetSourceId = useCallback((sourceId) => {
    if (config.sourceType === 'dataset') {
      const preset  = PRESET_DATASETS.find((d) => d.id === sourceId)
      const opType  = preset?.shape === DATASET_SHAPE.FULL ? 'record_set' : 'summarize'
      onChange({ ...config, sourceId, filters: [], operationType: opType, aggregation: preset?.aggregation || null, groupers: (preset?.groupBy || []).map((col) => ({ column: col })), exposedColumns: preset?.columns || [], _shape: preset?.shape || null })
    } else {
      set({ sourceId, filters: [], operationType: null, aggregation: null, groupers: [], exposedColumns: [] })
    }
  }, [config, onChange])

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
    set({ operationType: opType, aggregation: null, groupers: [], exposedColumns: opType === 'record_set' ? [...availableColumns] : [] })

  // ── Inline dataset list (first N + selected always visible) ──────────────
  const inlineDatasets = (() => {
    const rest = PRESET_DATASETS.filter((d) => d.id !== config.sourceId)
    const selected = PRESET_DATASETS.find((d) => d.id === config.sourceId)
    const shown = rest.slice(0, selected ? INLINE_LIMIT - 1 : INLINE_LIMIT)
    return selected ? [selected, ...shown] : shown
  })()
  const hiddenDatasetCount = PRESET_DATASETS.length - inlineDatasets.length

  // ── Inline entity integration groups ────────────────────────────────────
  const entityIntegrations = Array.from(new Set(visibleEntitySources.map((s) => s.integration)))
  const [activeIntg, setActiveIntg] = useState(entityIntegrations[0] || '')
  const integrationEntities = visibleEntitySources.filter((s) => s.integration === activeIntg)

  return (
    <div className="space-y-7">

      {/* ── 1. SOURCE TYPE ───────────────────────────────────────────────── */}
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

      {/* ── 2. SOURCE PICKER ─────────────────────────────────────────────── */}
      {config.sourceType === 'dataset' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel className="mb-0">Choose dataset</SectionLabel>
            <button
              onClick={() => setPicker('dataset')}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
            >
              <SlidersHorizontal size={11} /> All datasets
            </button>
          </div>

          <div className="space-y-1.5">
            {inlineDatasets.map((ds) => (
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
                <ShapeBadge shape={ds.shape} />
              </button>
            ))}

            {hiddenDatasetCount > 0 && (
              <button
                onClick={() => setPicker('dataset')}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-slate-200 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Search size={13} className="text-slate-500 group-hover:text-slate-300" />
                  Browse {hiddenDatasetCount} more dataset{hiddenDatasetCount !== 1 ? 's' : ''}…
                </span>
                <ChevronRight size={13} className="text-slate-500 group-hover:text-slate-300" />
              </button>
            )}
          </div>
        </section>
      )}

      {config.sourceType === 'entity' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel className="mb-0">Choose entity</SectionLabel>
            <button
              onClick={() => setPicker('entity')}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
            >
              <SlidersHorizontal size={11} /> Browse all
            </button>
          </div>

          {/* Integration tabs */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {entityIntegrations.map((intg) => (
              <button
                key={intg}
                onClick={() => setActiveIntg(intg)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                  activeIntg === intg
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20 hover:text-slate-300'
                }`}
              >
                {intg}
              </button>
            ))}
          </div>

          {/* Entities for active integration */}
          <div className="space-y-1.5">
            {integrationEntities.slice(0, INLINE_LIMIT).map((en) => (
              <button
                key={en.id}
                onClick={() => resetSourceId(en.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                  config.sourceId === en.id
                    ? 'border-blue-500/40 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                }`}
              >
                <Table2 size={13} className="shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-100">{en.label}</span>
                  <span className="block text-[11px] text-slate-400">{en.integration} · {en.columns?.length ?? 0} columns</span>
                </span>
              </button>
            ))}

            {integrationEntities.length > INLINE_LIMIT && (
              <button
                onClick={() => setPicker('entity')}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-slate-200 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Search size={13} className="text-slate-500 group-hover:text-slate-300" />
                  {integrationEntities.length - INLINE_LIMIT} more in {activeIntg}…
                </span>
                <ChevronRight size={13} className="text-slate-500 group-hover:text-slate-300" />
              </button>
            )}

            {hasLockedModelSources && (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-3 py-2.5 text-[11px] text-slate-500">
                <PackagePlus size={13} className="shrink-0 text-slate-500" />
                More entities available — install a model from the Models page to unlock them.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. FILTERS ───────────────────────────────────────────────────── */}
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

      {/* ── 4. OPERATION TYPE ────────────────────────────────────────────── */}
      {config.sourceId && config.sourceType === 'entity' && (
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

      {/* ── 5a. SUMMARIZE ────────────────────────────────────────────────── */}
      {config.sourceType === 'entity' && config.operationType === 'summarize' && (
        <section className="space-y-5">
          <div>
            <SectionLabel>Aggregation</SectionLabel>
            <div className="flex gap-2">
              <select
                value={config.aggregation?.fn || ''}
                onChange={(e) => set({ aggregation: { ...config.aggregation, fn: e.target.value, column: '' } })}
                className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="">Function…</option>
                {AGG_FUNCTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
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
          <div>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel className="mb-0">Group by</SectionLabel>
              <button onClick={addGrouper} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors">
                <Plus size={11} /> Add grouper
              </button>
            </div>
            {config.groupers.length === 0 ? (
              <p className="text-[11px] text-slate-500">No groupers — result will be a single aggregated value.</p>
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
                      {availableColumns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => removeGrouper(i)} aria-label="Remove grouper" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 5b. RECORD SET ───────────────────────────────────────────────── */}
      {config.sourceType === 'entity' && config.operationType === 'record_set' && availableColumns.length > 0 && (
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

      {/* ── Picker modals ────────────────────────────────────────────────── */}
      {picker === 'dataset' && (
        <DatasetPickerModal
          currentId={config.sourceId}
          onSelect={resetSourceId}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'entity' && (
        <EntityPickerModal
          currentId={config.sourceId}
          visibleSources={visibleEntitySources}
          hasLocked={hasLockedModelSources}
          onSelect={resetSourceId}
          onClose={() => setPicker(null)}
        />
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
