import { Users, LayoutGrid } from 'lucide-react'
import { WidgetGlyph } from './glyph.jsx'
import { FreshnessBadge } from '../common/index.jsx'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { CardContainer } from '@/components/ui/CardContainer'
import { BUSINESS_CATEGORY_COLOR } from '../../data/marketplace.js'
import WidgetRender from './WidgetRender.jsx'

export default function MarketplaceWidgetCard({ entry, onView, onUse }) {
  const catColor = BUSINESS_CATEGORY_COLOR[entry.businessCategory] || '#64748B'

  return (
    <CardContainer
      variant="default"
      onClick={onView}
      className="group flex cursor-pointer flex-col gap-3"
    >
      {/* Colored category stripe — rounded-t-[8px] matches CardContainer's corner radius */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[8px] opacity-70"
        style={{ background: catColor }}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="flex items-start gap-3 pt-1">
        <WidgetGlyph skeleton={entry.skeleton} source={entry.source} sm />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
            {entry.name}
          </div>
          <div className="truncate text-[11px] text-gray-500 dark:text-slate-400">
            {entry.source}
          </div>
        </div>
        <FreshnessBadge status={entry.freshness} />
      </div>

      {/* Mini live preview */}
      <div className="surface-sunken pointer-events-none rounded-md p-2">
        <WidgetRender widget={entry} size="sm" />
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400">
        {entry.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1">
        <Tag variant="neutral" size="sm">{entry.skeleton}</Tag>
        <Tag variant={entry.complexityVariant} size="sm">{entry.complexity}</Tag>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
          <LayoutGrid size={11} aria-hidden="true" />
          {entry.entityCount} fields
          <span className="mx-1 opacity-40">·</span>
          <Users size={11} aria-hidden="true" />
          {entry.tenantUsage.toLocaleString()} uses
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView() }}
          >
            View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onUse() }}
          >
            Use
          </Button>
        </div>
      </div>
    </CardContainer>
  )
}
