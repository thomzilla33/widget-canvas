import { useState } from 'react'
import { Building2, UserRound, Briefcase, MapPin, Brain, FileText, Activity, X, CheckCircle2, Plus } from 'lucide-react'
import { SECONDARY_ENTITIES } from '../../data/mock.js'

const ICON_MAP = { Building2, UserRound, Briefcase, MapPin, Brain, FileText, Activity }

const STATUS_COLORS = {
  success: { bg: 'var(--success-bg, #d1fae5)', text: 'var(--success, #059669)' },
  warn:    { bg: 'var(--warn-bg, #fef3c7)',    text: 'var(--warn, #d97706)' },
  error:   { bg: 'var(--error-bg, #fee2e2)',   text: 'var(--error, #dc2626)' },
  info:    { bg: 'rgba(59,130,246,.12)',        text: '#3b82f6' },
  neutral: { bg: 'var(--hover)',               text: 'var(--t2)' },
}

const SYSTEM_TABS = [
  { label: 'AI',        icon: 'Brain',    description: 'Sessions, insights, and summaries' },
  { label: 'Documents', icon: 'FileText', description: 'Uploaded files and attachments' },
  { label: 'Activity',  icon: 'Activity', description: 'Notes, calls, and events' },
]

function PreviewCard({ item }) {
  const colors = STATUS_COLORS[item.statusVariant] || STATUS_COLORS.neutral
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-2.5"
      style={{ background: 'var(--canvas)', border: '1px solid var(--line)' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--t1)' }}>{item.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{item.meta}</p>
      </div>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3"
        style={{ background: colors.bg, color: colors.text }}
      >
        {item.status}
      </span>
    </div>
  )
}

function EmptyPreview({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
      <p className="text-sm font-medium" style={{ color: 'var(--t2)' }}>{label}</p>
      <p className="text-xs text-center" style={{ color: 'var(--t3)' }}>
        No preview available for this entity type.
      </p>
    </div>
  )
}

/**
 * Marketplace-style entity type picker.
 * Left: scrollable list of entity types; Right: preview of real records.
 *
 * Props:
 *   secondaryOptions  — array of { type, label, icon } from SECONDARY_ENTITY_OPTIONS[entityType]
 *   existingTabs      — string[] of tabs already in the tab bar
 *   onAdd(label)      — called when user adds a tab
 *   onClose()         — called to close the marketplace
 */
export default function EntityTypeMarketplace({ secondaryOptions = [], existingTabs = [], onAdd, onClose }) {
  const allOptions = [
    ...secondaryOptions.map((opt) => ({ ...opt, group: 'Entity' })),
    ...SYSTEM_TABS.map((t) => ({ ...t, type: t.label, group: 'System' })),
  ]

  const [selected, setSelected] = useState(allOptions[0] || null)

  const previewItems = selected
    ? (SECONDARY_ENTITIES[selected.type] || []).slice(0, 3)
    : []

  const isAdded = (label) => existingTabs.includes(label)

  return (
    <div
      className="absolute z-50 flex overflow-hidden rounded-xl shadow-2xl"
      style={{
        width: 560,
        maxHeight: 420,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        top: '100%',
        right: 0,
        marginTop: 6,
      }}
    >
      {/* LEFT — entity type list */}
      <div
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{ width: 200, borderRight: '1px solid var(--line)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--t3)' }}>
            Add tab
          </span>
          <button
            onClick={onClose}
            className="rounded p-0.5 cursor-pointer"
            style={{ color: 'var(--t3)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Entity options */}
        <ul className="py-1 flex-1">
          {allOptions.map((opt) => {
            const Icon = ICON_MAP[opt.icon] || Building2
            const active = selected?.label === opt.label
            const added  = isAdded(opt.label)
            return (
              <li key={opt.label}>
                <button
                  onClick={() => setSelected(opt)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left cursor-pointer transition-colors"
                  style={{
                    background: active ? 'var(--hover)' : 'transparent',
                    color: added ? 'var(--t3)' : 'var(--t1)',
                  }}
                  onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={14} style={{ color: active ? 'var(--aims-blue, #2173ff)' : 'var(--t3)', flexShrink: 0 }} />
                  <span className="text-sm font-medium truncate flex-1">{opt.label}</span>
                  {added && <CheckCircle2 size={13} style={{ color: 'var(--success, #059669)', flexShrink: 0 }} />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* RIGHT — preview panel */}
      <div className="flex flex-col flex-1 min-w-0">
        {selected ? (
          <>
            {/* Preview header */}
            <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>
                {selected.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                {selected.description}
              </p>
            </div>

            {/* Preview records */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {previewItems.length > 0 ? (
                <>
                  {previewItems.map((item) => <PreviewCard key={item.id} item={item} />)}
                  <p className="text-xs pt-1" style={{ color: 'var(--t3)' }}>
                    Preview — full list loads after adding
                  </p>
                </>
              ) : (
                <EmptyPreview label={selected.label} />
              )}
            </div>

            {/* Add CTA */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderTop: '1px solid var(--line)' }}
            >
              {isAdded(selected.label) ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--t3)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success, #059669)' }} />
                  {selected.label} already in tab bar
                </div>
              ) : (
                <button
                  onClick={() => { onAdd(selected.label); onClose() }}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: 'var(--aims-blue, #2173ff)',
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <Plus size={14} />
                  Add {selected.label} tab
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--t3)' }}>
              Select an entity type to preview
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
