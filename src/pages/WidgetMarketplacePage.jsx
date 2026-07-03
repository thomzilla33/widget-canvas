import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilRuler, Sparkles, Store } from 'lucide-react'
import { PageHeader, EmptyState } from '../components/common/index.jsx'
import FilterToolbar from '../components/common/FilterToolbar.jsx'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import WidgetDetailModal from '../components/widgets/WidgetDetailModal.jsx'
import AIGenerateModal from '../components/ai/AIGenerateModal.jsx'
import MarketplaceWidgetCard from '../components/widgets/MarketplaceWidgetCard.jsx'
import { useWidgets } from '../state/WidgetsContext.jsx'
import { useLoadMore } from '../hooks/useLoadMore.js'
import {
  BUSINESS_CATEGORIES,
  BUSINESS_CATEGORY_COLOR,
  enrichWidgets,
} from '../data/marketplace.js'

const SORT_OPTIONS = [
  { value: 'name',     label: 'Name'       },
  { value: 'usage',    label: 'Most used'  },
  { value: 'skeleton', label: 'Type'       },
]

export default function WidgetMarketplacePage() {
  const navigate  = useNavigate()
  const { widgets } = useWidgets()

  const [category, setCategory]     = useState('all')
  const [search,   setSearch]       = useState('')
  const [typeF,    setTypeF]        = useState('All')
  const [sourceF,  setSourceF]      = useState('All')
  const [complexF, setComplexF]     = useState('All')
  const [sortBy,   setSortBy]       = useState('usage')
  const [sortDir,  setSortDir]      = useState('desc')
  const [detail,   setDetail]       = useState(null)
  const [aiOpen,   setAiOpen]       = useState(false)

  // Enrich once; stable reference when widgets hasn't changed
  const catalog = useMemo(() => enrichWidgets(widgets), [widgets])

  // Per-category counts for the rail
  const catCounts = useMemo(() => {
    const m = { all: catalog.length }
    for (const w of catalog) {
      m[w.businessCategory] = (m[w.businessCategory] || 0) + 1
    }
    return m
  }, [catalog])

  // Build filter option lists from catalog
  const typeOptions = useMemo(() => [
    { value: 'All', label: 'All types' },
    ...Array.from(new Set(catalog.map((w) => w.skeleton))).sort().map((s) => ({ value: s, label: s })),
  ], [catalog])

  const sourceOptions = useMemo(() => [
    { value: 'All', label: 'All sources' },
    ...Array.from(new Set(catalog.map((w) => w.source.split(' — ')[0]))).sort().map((s) => ({ value: s, label: s })),
  ], [catalog])

  const complexOptions = [
    { value: 'All',          label: 'All complexity' },
    { value: 'Simple',       label: 'Simple'         },
    { value: 'Intermediate', label: 'Intermediate'   },
    { value: 'Advanced',     label: 'Advanced'       },
  ]

  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    let list = catalog

    if (category !== 'all')  list = list.filter((w) => w.businessCategory === category)
    if (typeF    !== 'All')  list = list.filter((w) => w.skeleton === typeF)
    if (sourceF  !== 'All')  list = list.filter((w) => w.source.split(' — ')[0] === sourceF)
    if (complexF !== 'All')  list = list.filter((w) => w.complexity === complexF)
    if (q) {
      list = list.filter((w) =>
        w.name.toLowerCase().includes(q)       ||
        w.source.toLowerCase().includes(q)     ||
        w.description.toLowerCase().includes(q)||
        w.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name')     cmp = a.name.localeCompare(b.name)
      else if (sortBy === 'usage')    cmp = a.tenantUsage - b.tenantUsage
      else if (sortBy === 'skeleton') cmp = a.skeleton.localeCompare(b.skeleton)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [catalog, category, typeF, sourceF, complexF, q, sortBy, sortDir])

  const { visible, hasMore, remaining, loadMore } = useLoadMore(filtered, { initial: 24, increment: 24 })

  const activeFilterCount = [typeF !== 'All', sourceF !== 'All', complexF !== 'All', q].filter(Boolean).length

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <PageHeader
        title="Widget Marketplace"
        description="Browse the full catalog of reusable widgets — or build your own from scratch."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="default" onClick={() => navigate('/widgets/new')}>
              <PencilRuler size={14} aria-hidden="true" />
              Start from scratch
            </Button>
            <Button
              variant="primary"
              size="default"
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Sparkles size={14} aria-hidden="true" />
              Create with AI assist
            </Button>
          </div>
        }
      />

      {/* Body: rail + content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Category rail */}
        <aside className="hidden w-[220px] shrink-0 overflow-y-auto border-r border-gray-200 p-4 dark:border-white/10 md:block">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
            Categories
          </div>
          <nav className="space-y-0.5" aria-label="Widget categories">
            {BUSINESS_CATEGORIES.map((cat) => {
              const active = category === cat.id
              const count  = catCounts[cat.id] || 0
              const color  = BUSINESS_CATEGORY_COLOR[cat.id]
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={[
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                    active
                      ? 'bg-aims-blue/10 font-semibold text-aims-blue dark:bg-aims-blue/20'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-white/5',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  {cat.id !== 'all' && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-1">{cat.label}</span>
                  <Tag variant="neutral" size="sm">{count}</Tag>
                </button>
              )
            })}
          </nav>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-white/10">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                Active filters
              </div>
              <div className="flex flex-wrap gap-1">
                {typeF    !== 'All'  && <FilterChip label={typeF}    onRemove={() => setTypeF('All')}    />}
                {sourceF  !== 'All'  && <FilterChip label={sourceF}  onRemove={() => setSourceF('All')}  />}
                {complexF !== 'All'  && <FilterChip label={complexF} onRemove={() => setComplexF('All')} />}
                {q &&                   <FilterChip label={`"${q}"`} onRemove={() => setSearch('')}      />}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Toolbar */}
          <FilterToolbar
            searchValue={search}
            onSearch={setSearch}
            searchPlaceholder="Search widgets…"
            inlineCount={2}
            filters={[
              { id: 'type',    label: 'Type',       value: typeF,    onChange: setTypeF,    options: typeOptions    },
              { id: 'source',  label: 'Source',     value: sourceF,  onChange: setSourceF,  options: sourceOptions  },
              { id: 'complex', label: 'Complexity', value: complexF, onChange: setComplexF, options: complexOptions },
            ]}
            sort={{
              value: sortBy,
              onChange: setSortBy,
              dir: sortDir,
              onToggleDir: () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')),
              options: SORT_OPTIONS,
            }}
          />

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Section heading */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {BUSINESS_CATEGORIES.find((c) => c.id === category)?.label ?? 'All categories'}
                {filtered.length > 0 && (
                  <span className="ml-2 font-normal text-gray-400 dark:text-slate-500">
                    {filtered.length} widget{filtered.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h2>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No widgets match"
                description="Try a different search or clear the filters."
                action={
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={() => { setSearch(''); setTypeF('All'); setSourceF('All'); setComplexF('All') }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))' }}
                >
                  {visible.map((entry) => (
                    <MarketplaceWidgetCard
                      key={entry.id}
                      entry={entry}
                      onView={() => setDetail(entry)}
                      onUse={() => navigate('/dashboards')}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="secondary" size="default" onClick={loadMore}>
                      Load {remaining} more
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal (reuses existing) */}
      {detail && (
        <WidgetDetailModal
          widget={detail}
          onClose={() => setDetail(null)}
        />
      )}

      {/* AI generate modal */}
      {aiOpen && (
        <AIGenerateModal
          mode="widget"
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
    >
      {label}
      <span aria-hidden="true" className="leading-none">×</span>
    </button>
  )
}
