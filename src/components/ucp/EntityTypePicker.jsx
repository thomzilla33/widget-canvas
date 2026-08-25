import { Building2, UserRound, Briefcase, MapPin, Brain, FileText, Activity, X } from 'lucide-react'

const ICON_MAP = { Building2, UserRound, Briefcase, MapPin, Brain, FileText, Activity }

// System tabs that can be added regardless of entity type
const SYSTEM_TABS = [
  { label: 'AI',        icon: 'Brain',    description: 'Sessions, insights, and summaries' },
  { label: 'Documents', icon: 'FileText', description: 'Uploaded files and attachments' },
  { label: 'Activity',  icon: 'Activity', description: 'Notes, calls, and events' },
]

/**
 * Popover that replaces the free-text "+" tab menu.
 * Shows entity-type secondary tabs + system tabs the user can add.
 *
 * Props:
 *   secondaryOptions — array of { type, label, icon } from SECONDARY_ENTITY_OPTIONS[entityType]
 *   existingTabs     — string[] of tabs already in the tab bar
 *   onAdd(label)     — called when user picks a tab
 *   onClose()        — called to close the picker
 */
export default function EntityTypePicker({ secondaryOptions = [], existingTabs = [], onAdd, onClose }) {
  const available = [
    ...secondaryOptions.map((opt) => ({ ...opt, group: 'Entity' })),
    ...SYSTEM_TABS.map((t) => ({ ...t, type: t.label, group: 'System' })),
  ].filter((opt) => !existingTabs.includes(opt.label))

  return (
    <div
      className="absolute z-50 w-64 rounded-xl shadow-xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        top: '100%',
        right: 0,
        marginTop: 4,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>Add tab</span>
        <button
          onClick={onClose}
          className="p-0.5 rounded cursor-pointer"
          style={{ color: 'var(--t3)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Options list */}
      {available.length === 0 ? (
        <p className="px-4 py-6 text-xs text-center" style={{ color: 'var(--t3)' }}>
          All available tabs have been added.
        </p>
      ) : (
        <ul className="py-1">
          {available.map((opt) => {
            const Icon = ICON_MAP[opt.icon] || Building2
            return (
              <li key={opt.label}>
                <button
                  onClick={() => { onAdd(opt.label); onClose() }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
                  style={{ color: 'var(--t1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <Icon size={15} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                  <div>
                    <p className="text-sm font-medium leading-none">{opt.label}</p>
                    {opt.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{opt.description}</p>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
