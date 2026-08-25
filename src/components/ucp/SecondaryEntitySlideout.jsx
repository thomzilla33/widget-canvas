import { X, ArrowUpRight, MapPin, UserRound, Briefcase, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const TYPE_ICON = {
  Location: MapPin,
  Contact:  UserRound,
  Deal:     Briefcase,
  Account:  Building2,
}

const STATUS_COLORS = {
  success: 'var(--success, #059669)',
  warn:    'var(--warn, #d97706)',
  error:   'var(--error, #dc2626)',
  info:    'var(--info, #2563eb)',
  neutral: 'var(--t3)',
}

/**
 * Right-side SlideOut for previewing a secondary entity.
 * Props: entity { id, name, status, statusVariant, meta, entityId }, tabLabel, onClose
 */
export default function SecondaryEntitySlideout({ entity, tabLabel, onClose }) {
  const navigate = useNavigate()
  // Simple singularize for display (e.g. "Locations" → "Location", "Staff" stays "Staff")
  const typeSingular = tabLabel.endsWith('s') && tabLabel !== 'Staff' ? tabLabel.slice(0, -1) : tabLabel

  function viewFullProfile() {
    if (entity.entityId) navigate(`/profiles/${entity.entityId}`)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.25)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: 360,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--line)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--t3)' }}>
            {typeSingular} preview
          </span>
          <button onClick={onClose} className="p-1 rounded cursor-pointer" style={{ color: 'var(--t3)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Identity */}
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--t1)' }}>
              {entity.name}
            </h3>
            {entity.meta && (
              <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
                {entity.meta}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: STATUS_COLORS[entity.statusVariant] || STATUS_COLORS.neutral }}
            />
            <span className="text-sm" style={{ color: 'var(--t2)' }}>
              {entity.status}
            </span>
          </div>

          <hr style={{ borderColor: 'var(--line)' }} />

          {/* Basic fields */}
          <div className="space-y-3">
            {[
              { label: 'Entity type', value: typeSingular },
              { label: 'ID',          value: entity.id },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--t3)' }}>{f.label}</p>
                <p className="text-sm" style={{ color: 'var(--t1)' }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--line)' }}>
          <Button
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={viewFullProfile}
          >
            <span>View full profile</span>
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>
    </>
  )
}
