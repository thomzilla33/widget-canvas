import { Eye } from 'lucide-react'

const STATUS_COLORS = {
  success: { bg: 'rgba(5, 150, 105, 0.12)',  text: 'var(--success, #059669)' },
  warn:    { bg: 'rgba(217, 119, 6, 0.12)',   text: 'var(--warn, #d97706)' },
  error:   { bg: 'rgba(220, 38, 38, 0.12)',   text: 'var(--error, #dc2626)' },
  info:    { bg: 'rgba(37, 99, 235, 0.12)',   text: 'var(--info, #2563eb)' },
  neutral: { bg: 'var(--cb, rgba(0,0,0,0.06))', text: 'var(--t3)' },
}

/**
 * Individual entity card in a secondary entity tab.
 * Props: entity { id, name, status, statusVariant, meta }, onPreview(entity)
 */
export default function SecondaryEntityCard({ entity, onPreview }) {
  const colors = STATUS_COLORS[entity.statusVariant] || STATUS_COLORS.neutral

  return (
    <div
      className="group flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-pointer transition-colors"
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
      onClick={() => onPreview(entity)}
    >
      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>
          {entity.name}
        </p>
        {entity.meta && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t3)' }}>
            {entity.meta}
          </p>
        )}
      </div>

      {/* Status badge */}
      <span
        className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: colors.bg, color: colors.text }}
      >
        {entity.status}
      </span>

      {/* Eye action — appears on hover */}
      <button
        className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{ background: 'var(--cb, rgba(0,0,0,0.06))', color: 'var(--t2)' }}
        onClick={(e) => { e.stopPropagation(); onPreview(entity) }}
        title="Quick preview"
      >
        <Eye size={14} />
      </button>
    </div>
  )
}
