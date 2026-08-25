import { useState } from 'react'
import { Search } from 'lucide-react'
import SecondaryEntityCard from './SecondaryEntityCard.jsx'
import SecondaryEntitySlideout from './SecondaryEntitySlideout.jsx'
import { SECONDARY_ENTITIES } from '../../data/mock.js'
import { ENTITY_TYPE_BY_LABEL } from '../../data/uepConfig.js'

/**
 * Card-list view rendered when a secondary entity tab is active.
 * Props: tabLabel — the tab's name (e.g. "Locations", "Contacts")
 */
export default function SecondaryEntityTab({ tabLabel }) {
  const entityType = ENTITY_TYPE_BY_LABEL[tabLabel]
  const allEntities = entityType ? (SECONDARY_ENTITIES[entityType] || []) : []

  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState(null)

  const filtered = query.trim()
    ? allEntities.filter((e) =>
        e.name.toLowerCase().includes(query.toLowerCase())
      )
    : allEntities

  if (!entityType) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm" style={{ color: 'var(--t3)' }}>
          No data available for this tab.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
        <input
          type="text"
          placeholder={`Search ${tabLabel.toLowerCase()}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            color: 'var(--t1)',
            outline: 'none',
          }}
        />
      </div>

      {/* Card list */}
      {filtered.length === 0 ? (
        <div
          className="flex items-center justify-center h-32 rounded-xl"
          style={{ border: '1px dashed var(--line)' }}
        >
          <p className="text-sm" style={{ color: 'var(--t3)' }}>
            {query
              ? `No ${tabLabel.toLowerCase()} matching "${query}"`
              : `No ${tabLabel.toLowerCase()} found`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entity) => (
            <SecondaryEntityCard
              key={entity.id}
              entity={entity}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      {/* SlideOut preview */}
      {preview && (
        <SecondaryEntitySlideout
          entity={preview}
          tabLabel={tabLabel}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
